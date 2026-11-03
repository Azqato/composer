// ─── Composer symphony evaluator ─────────────────────────────────────────────
// Reads Composer's "score" JSON (the shape the public score endpoint returns) and
// produces the target allocation for every market day. Semantics follow Crescendo
// (ComposerWireReader, Conditional, Filter, Weighting, InverseVolatility, IndicatorMath):
//
// - Every node is evaluated every day, bottom-up, so any node can be ranked by a filter.
// - Each node has a price series: adjusted close for an asset, and for any other node
//   the equity curve of its own holdings (held from close t, earning the return to t+1).
// - Indicators include today's close. Return-based ones are in percent.
// - A day is "valid" once every indicator the decision used was computable; the
//   backtest starts on the first valid day.

import { expand, collapse, type NettingTables } from './netting'

type Alloc = Record<string, number>
type Json = Record<string, unknown>

export type RebalanceFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export interface SymphonyRun {
  allocations: Alloc[]          // target at the close of each day
  valid: boolean[]              // whether that day's decision had all its data
  firstValid: number            // first valid index, or -1
  rebalance: RebalanceFrequency
  corridor: number              // rebalance-corridor-width as a fraction (0 = none)
}

// ─── Public entry points ─────────────────────────────────────────────────────

/** Every ticker the symphony trades or reads an indicator from. */
export function symphonyTickers(json: unknown): string[] {
  const tickers = new Set<string>()
  compileRoot(json, tickers)
  return [...tickers]
}

/** The symphony's root node and its rebalance settings. */
export function symphonyInfo(json: unknown): { name: string; rebalance: RebalanceFrequency; corridor: number } {
  const root = findRoot(json)
  return {
    name: String(root.name ?? 'Symphony'),
    rebalance: parseRebalance(root.rebalance),
    corridor: corridorOf(root),
  }
}

/**
 * Evaluates the symphony on every day.
 * @param dates  market days, ascending
 * @param prices ticker → adjusted close per day (null before the ticker's history starts)
 */
export function runSymphony(
  json: unknown,
  dates: string[],
  prices: Record<string, (number | null)[]>,
  netting?: NettingTables
): SymphonyRun {
  const root = findRoot(json)
  const n = dates.length

  // Pass 1: every condition waits for its own data
  const first = evaluate(root, n, prices, undefined, netting)

  // Default Pathing (Crescendo's Condition.evaluate): before a condition's data starts it takes
  // its majority result, true if it held on at least half the days from its start to the end.
  // Only worth a second pass when some condition starts after the symphony could.
  const defaults = first.conds.map(c => {
    let start = -1, trues = 0
    for (let t = 0; t < n; t++) {
      const r = c.test(t)
      if (start < 0 && r.valid) start = t
      if (start >= 0 && r.valid && r.value) trues++
    }
    return start < 0 ? null : { start, value: trues >= Math.floor((n - start) / 2) }
  })
  const run = defaults.some(d => d && (first.firstValid < 0 || d.start > first.firstValid))
    ? evaluate(root, n, prices, defaults, netting)
    : first

  return { allocations: run.allocations, valid: run.valid, firstValid: run.firstValid,
    rebalance: parseRebalance(root.rebalance), corridor: corridorOf(root) }
}

type PathingDefault = { start: number; value: boolean } | null

function evaluate(root: Json, n: number, prices: Record<string, (number | null)[]>, defaults?: PathingDefault[], netting?: NettingTables) {
  const ctx = new Context(n, prices, netting)
  const conds: BinaryCond[] = []
  condRegistry = conds
  let node: Node
  try { node = compileRoot(root, new Set(), ctx) } finally { condRegistry = null }
  if (defaults) conds.forEach((c, i) => { c.pathing = defaults[i] })

  const all = ctx.nodes
  const allocations: Alloc[] = new Array(n)
  const valid: boolean[] = new Array(n)
  let firstValid = -1

  for (let t = 0; t < n; t++) {
    for (const nd of all) nd.step(t)          // children are registered before parents
    const out = node.h
    allocations[t] = out.alloc
    valid[t] = out.valid
    if (out.valid && firstValid < 0) firstValid = t
    for (const nd of all) nd.grow(t)
  }
  return { allocations, valid, firstValid, conds }
}

// ─── Context: price series and shared indicators ────────────────────────────

class Context {
  nodes: Node[] = []
  private assetSeries = new Map<string, Float64Array>()

  constructor(public length: number, private prices: Record<string, (number | null)[]>, public netting?: NettingTables) {}

  series(ticker: string): Float64Array {
    let s = this.assetSeries.get(ticker)
    if (!s) {
      const raw = this.prices[ticker]
      if (!raw) throw new Error(`No price data for ${ticker}`)
      s = Float64Array.from(raw, v => (v == null || !(v > 0) ? NaN : v))
      this.assetSeries.set(ticker, s)
    }
    return s
  }
}

// ─── Indicators ─────────────────────────────────────────────────────────────

export interface IndicatorSpec {
  fn: string
  window: number
  short?: number
  long?: number
  signal?: number
}

const FN_ALIASES: Record<string, string> = {
  'relative-strength-index': 'rsi',
  'standard-deviation-return': 'stdev-return',
  'standard-deviation-price': 'stdev-price',
}

/** An indicator over one price series. `at(t)` must be called with non-decreasing t
 *  once series[0..t] is final (asset series are final up front; node series grow). */
class Indicator {
  private cache: Float64Array
  private done = -1
  // recursive state
  private a = NaN
  private b = NaN
  private c = NaN
  private d = NaN
  private start = -1
  private count = 0

  constructor(private spec: IndicatorSpec, private s: Float64Array) {
    this.cache = new Float64Array(s.length).fill(NaN)
  }

  at(t: number): number {
    if (t < 0) return NaN
    const fn = this.spec.fn
    if (fn === 'exponential-moving-average-price' || fn === 'rsi' ||
        fn === 'percentage-price-oscillator' || fn === 'percentage-price-oscillator-signal') {
      while (this.done < t) this.advance(++this.done)
      return this.cache[t]
    }
    return this.direct(t)
  }

  private direct(t: number): number {
    const s = this.s
    const n = this.spec.window
    switch (this.spec.fn) {
      case 'current-price':
        return s[t]
      case 'moving-average-price':
        return windowMean(s, t - n + 1, t)
      case 'stdev-price':
        return windowStdev(s, t - n + 1, t)
      case 'upper-bollinger':
      case 'lower-bollinger': {
        const m = windowMean(s, t - n + 1, t)
        const sd = windowStdev(s, t - n + 1, t)
        return this.spec.fn === 'upper-bollinger' ? m + 2 * sd : m - 2 * sd
      }
      case 'cumulative-return': {
        if (t - n < 0) return NaN
        return (s[t] / s[t - n] - 1) * 100
      }
      case 'moving-average-return': {
        if (t - n < 0) return NaN
        let sum = 0
        for (let i = t - n + 1; i <= t; i++) sum += s[i] / s[i - 1] - 1
        return (sum / n) * 100
      }
      case 'stdev-return': {
        if (t - n < 0) return NaN
        const r = new Float64Array(n)
        for (let i = 0; i < n; i++) r[i] = s[t - n + 1 + i] / s[t - n + i] - 1
        return sampleStdev(r) * 100
      }
      case 'max-drawdown': {
        // Crescendo compounds the n-1 returns ending today: prices s[t-n+1..t]
        if (t - n < 0) return NaN
        let peak = s[t - n + 1], dd = 0
        for (let i = t - n + 2; i <= t; i++) {
          const p = s[i]
          if (p > peak) peak = p
          dd = Math.max(dd, (peak - p) / peak)
        }
        return dd * 100
      }
      default:
        throw new Error(`Indicator "${this.spec.fn}" is not supported yet`)
    }
  }

  // Recursive indicators, seeded the way Crescendo's IndicatorMath does
  private advance(t: number) {
    const s = this.s
    const v = s[t]
    if (Number.isNaN(v)) { if (this.start >= 0) this.reset(); return }
    if (this.start < 0) this.start = t
    const k = t - this.start          // index within the finite run

    switch (this.spec.fn) {
      case 'exponential-moving-average-price':
        this.cache[t] = this.emaStep(v, k, this.spec.window, 'a', 'b')
        return
      case 'rsi': {
        const n = this.spec.window
        if (k === 0) { this.a = 0; this.b = 0; return }
        const diff = v - s[t - 1]
        const gain = diff > 0 ? diff : 0
        const loss = diff < 0 ? -diff : 0
        if (k <= n) {
          this.a += gain; this.b += loss
          if (k === n) { this.a /= n; this.b /= n }
          return                       // the first RSI is one day after the seed
        }
        this.a = (this.a * (n - 1) + gain) / n
        this.b = (this.b * (n - 1) + loss) / n
        this.cache[t] = this.b === 0 ? 100 : 100 - 100 / (1 + this.a / this.b)
        return
      }
      case 'percentage-price-oscillator':
      case 'percentage-price-oscillator-signal': {
        const short = this.spec.short || this.spec.window || 12
        const long = this.spec.long || 26
        if (short >= long) return
        const es = this.emaStep(v, k, short, 'a', 'b')
        const el = this.emaStep(v, k, long, 'c', 'd')
        const ppo = el === 0 || Number.isNaN(el) ? NaN : ((es - el) / el) * 100
        if (this.spec.fn === 'percentage-price-oscillator') { this.cache[t] = ppo; return }
        // signal: EMA of the PPO line, starting at its first finite value
        if (Number.isNaN(ppo)) return
        const sig = this.spec.signal || 9
        this.count++
        const j = this.count - 1
        if (j < sig - 1) { this.sigSum += ppo; return }
        if (j === sig - 1) { this.sigSum += ppo; this.sigEma = this.sigSum / sig }
        else this.sigEma = (2 / (sig + 1)) * ppo + (1 - 2 / (sig + 1)) * this.sigEma
        this.cache[t] = this.sigEma
        return
      }
    }
  }

  private sigSum = 0
  private sigEma = NaN

  // EMA seeded with the SMA of its first n values; state kept in fields sumKey/emaKey
  private emaStep(v: number, k: number, n: number, sumKey: 'a' | 'c', emaKey: 'b' | 'd'): number {
    if (k === 0) { this[sumKey] = 0; this[emaKey] = NaN }
    if (k < n) {
      this[sumKey] += v
      if (k === n - 1) this[emaKey] = this[sumKey] / n
      return this[emaKey]
    }
    const alpha = 2 / (n + 1)
    this[emaKey] = alpha * v + (1 - alpha) * this[emaKey]
    return this[emaKey]
  }

  private reset() {
    this.start = -1; this.count = 0; this.sigSum = 0; this.sigEma = NaN
    this.a = this.b = this.c = this.d = NaN
  }
}

function windowMean(s: Float64Array, from: number, to: number): number {
  if (from < 0) return NaN
  let sum = 0
  for (let i = from; i <= to; i++) sum += s[i]
  return sum / (to - from + 1)
}

function windowStdev(s: Float64Array, from: number, to: number): number {
  if (from < 0) return NaN
  return sampleStdev(s.subarray(from, to + 1))
}

// Crescendo's UtilMath.stdDev: sample deviation (n − 1)
function sampleStdev(xs: ArrayLike<number>): number {
  const n = xs.length
  if (n === 0) return NaN
  let mean = 0
  for (let i = 0; i < n; i++) mean += xs[i]
  mean /= n
  let ss = 0
  for (let i = 0; i < n; i++) ss += (xs[i] - mean) ** 2
  return Math.sqrt(ss / Math.max(1, n - 1))
}

// ─── Nodes ──────────────────────────────────────────────────────────────────

interface Holding { alloc: Alloc; valid: boolean }

abstract class Node {
  /** Today's holdings (only the current day is ever read) */
  h!: Holding
  private equity: Float64Array | null = null
  private indicators = new Map<string, Indicator>()

  constructor(protected ctx: Context) {
    ctx.nodes.push(this)
  }

  abstract step(t: number): void

  /** Price series used when a filter ranks this node. */
  series(): Float64Array {
    if (!this.equity) this.equity = new Float64Array(this.ctx.length).fill(NaN)
    return this.equity
  }

  indicator(spec: IndicatorSpec): Indicator {
    const key = JSON.stringify(spec)
    let ind = this.indicators.get(key)
    if (!ind) { ind = new Indicator(spec, this.series()); this.indicators.set(key, ind) }
    return ind
  }

  /** Extends the equity curve to t+1 from today's holdings (only if something reads it). */
  grow(t: number) {
    const eq = this.equity
    if (!eq || t + 1 >= eq.length) return
    const h = this.h
    let r = 0
    let finite = h.valid
    for (const [ticker, w] of Object.entries(h.alloc)) {
      const s = this.ctx.series(ticker)
      const ret = s[t + 1] / s[t] - 1
      if (Number.isFinite(ret)) r += w * ret
      else finite = false
    }
    if (Number.isNaN(eq[t])) eq[t + 1] = finite ? 1 : NaN
    else eq[t + 1] = eq[t] * (1 + r)
  }
}

class AssetNode extends Node {
  private s: Float64Array
  constructor(ctx: Context, public ticker: string) {
    super(ctx)
    this.s = ctx.series(ticker)
  }
  step(t: number) {
    this.h = { alloc: { [this.ticker]: 1 }, valid: !Number.isNaN(this.s[t]) }
  }
  override series() { return this.s }
  override grow() {}
}

class WeightNode extends Node {
  private inv: { window: number; prev: number[] } | null = null
  constructor(ctx: Context, private kids: Node[], private weights: number[] | null, invWindow: number) {
    super(ctx)
    if (invWindow > 0) {
      this.inv = { window: invWindow, prev: [] }
      for (const k of kids) k.series()     // inverse-vol reads each child's realized returns
    }
  }
  step(t: number) {
    const hs = this.kids.map(k => k.h)
    let ws: number[]
    let valid = hs.every(h => h.valid)
    if (this.weights) {
      ws = this.weights
    } else if (this.inv) {
      // 1 / sample stdev of each child's daily returns over the `window` days before today
      const n = this.inv.window
      const recips = this.kids.map(k => {
        const s = k.series()
        if (t - n < 0) return NaN
        const r = new Float64Array(n)
        for (let i = 0; i < n; i++) r[i] = s[t - n + i + 1] / s[t - n + i] - 1
        return 1 / sampleStdev(r)
      })
      if (recips.some(x => Number.isNaN(x))) { valid = false; ws = this.kids.map(() => 1) }
      else ws = inverseVolFractions(recips)
    } else {
      ws = this.kids.map(() => 1)
    }
    this.h = { alloc: merge(hs.map(h => h.alloc), ws), valid }
  }
}

// Zero deviation gives an infinite reciprocal: those children split the weight equally
function inverseVolFractions(recips: number[]): number[] {
  const infinite = recips.filter(x => !Number.isFinite(x)).length
  if (infinite > 0) return recips.map(x => (Number.isFinite(x) ? 0 : 1 / infinite))
  const sum = recips.reduce((a, b) => a + b, 0)
  return sum > 0 ? recips.map(x => x / sum) : recips.map(() => 1)
}

class PassNode extends Node {
  constructor(ctx: Context, private kids: Node[]) { super(ctx) }
  step(t: number) {
    const hs = this.kids.map(k => k.h)
    this.h = {
      alloc: hs.length === 1 ? hs[0].alloc : merge(hs.map(h => h.alloc), hs.map(() => 1)),
      valid: hs.every(h => h.valid),
    }
  }
}

class IfNode extends Node {
  constructor(ctx: Context, private cond: Cond, private yes: PassNode, private no: PassNode) { super(ctx) }
  step(t: number) {
    const { value, valid } = this.cond.test(t)
    // Like Crescendo, the symphony starts once every branch has data, not just the one taken
    const y = this.yes.h, n = this.no.h
    this.h = { alloc: (value ? y : n).alloc, valid: valid && y.valid && n.valid }
  }
}

class FilterNode extends Node {
  private inds: Indicator[]
  constructor(ctx: Context, private kids: Node[], spec: IndicatorSpec, private top: boolean, private count: number) {
    super(ctx)
    this.inds = kids.map(k => k.indicator(spec))
  }
  step(t: number) {
    const scored = this.kids.map((k, i) => ({ k, v: this.inds[i].at(t) }))
    const finite = scored.filter(x => Number.isFinite(x.v))
    let valid = finite.length === scored.length
    // Crescendo (Filter.selectionPool) leaves out children whose history hasn't started if at
    // least N remain, but only when every missing child is a single asset
    const droppable = scored.every(x => Number.isFinite(x.v) || x.k instanceof AssetNode)
    const pool = !valid && droppable && finite.length >= this.count ? finite : scored
    if (pool === finite) valid = true
    const dir = this.top ? -1 : 1
    pool.sort((a, b) => {
      const av = Number.isNaN(a.v) ? Infinity : a.v * dir
      const bv = Number.isNaN(b.v) ? Infinity : b.v * dir
      return av - bv
    })
    const chosen = pool.slice(0, Math.min(this.count, pool.length)).map(x => x.k.h)
    this.h = {
      alloc: merge(chosen.map(h => h.alloc), chosen.map(() => 1)),
      valid: valid && pool.every(x => x.k.h.valid),
    }
  }
}

/** QuantMage Switch: with k of the n conditions true, holds branch n − k. */
class SwitchNode extends Node {
  constructor(ctx: Context, private conds: Cond[], private kids: Node[]) { super(ctx) }
  step(t: number) {
    let trues = 0, valid = true
    for (const c of this.conds) {
      const r = c.test(t)
      valid &&= r.valid
      if (r.value) trues++
    }
    const pick = this.kids[this.conds.length - trues]
    this.h = { alloc: pick.h.alloc, valid: valid && this.kids.every(k => k.h.valid) }
  }
}

/** QuantMage Mixed: blends from → to as the indicator moves from `from` to `to` (clamped). */
class MixedNode extends Node {
  constructor(ctx: Context, private operand: Expr, private from: number, private to: number,
    private a: Node, private b: Node) { super(ctx) }
  step(t: number) {
    const v = this.operand.at(t)
    const w = Number.isNaN(v) ? 0 : Math.max(0, Math.min(1, (v - this.from) / (this.to - this.from)))
    const alloc = w === 0 ? this.a.h.alloc : w === 1 ? this.b.h.alloc : merge([this.a.h.alloc, this.b.h.alloc], [1 - w, w])
    this.h = { alloc, valid: !Number.isNaN(v) && this.a.h.valid && this.b.h.valid }
  }
}

/** QuantMage Enter/Exit: a latch. Out until the enter condition holds, then in until the exit one does. */
class EnterExitNode extends Node {
  private entered = false
  constructor(ctx: Context, private enter: Cond, private exit: Cond, private inside: Node, private outside: Node) { super(ctx) }
  step(t: number) {
    const r = this.entered ? this.exit.test(t) : this.enter.test(t)
    if (r.valid && r.value) this.entered = !this.entered
    const other = this.entered ? this.exit.test(t) : this.enter.test(t)
    const pick = this.entered ? this.inside : this.outside
    this.h = { alloc: pick.h.alloc, valid: r.valid && other.valid && this.inside.h.valid && this.outside.h.valid }
  }
}

/** Crescendo's Expand: nets offsetting leveraged funds and reinvests the freed capital pro rata. */
class ExpandNode extends Node {
  constructor(ctx: Context, private kid: Node) { super(ctx) }
  step() {
    const tb = this.ctx.netting
    if (!tb) throw new Error('Expand needs the netting tables')
    this.h = { alloc: expand(this.kid.h.alloc, tb), valid: this.kid.h.valid }
  }
}

/** Crescendo's Collapse: nets the primary branch and fills the freed capital with the secondary. */
class CollapseNode extends Node {
  constructor(ctx: Context, private primary: Node, private secondary: Node) { super(ctx) }
  step() {
    const tb = this.ctx.netting
    if (!tb) throw new Error('Collapse needs the netting tables')
    this.h = { alloc: collapse(this.primary.h.alloc, this.secondary.h.alloc, tb),
      valid: this.primary.h.valid && this.secondary.h.valid }
  }
}

/** Weighted merge: each child's holdings scaled by its weight, normalized to 1. */
function merge(allocs: Alloc[], weights: number[]): Alloc {
  const out: Alloc = {}
  let total = 0
  allocs.forEach((a, i) => {
    for (const [ticker, w] of Object.entries(a)) {
      const v = w * weights[i]
      out[ticker] = (out[ticker] ?? 0) + v
      total += v
    }
  })
  if (total > 0) for (const k of Object.keys(out)) out[k] /= total
  return out
}

// ─── Conditions ─────────────────────────────────────────────────────────────

interface Cond { test(t: number): { value: boolean; valid: boolean } }

type Comparator = (a: number, b: number) => boolean
const COMPARATORS: Record<string, Comparator> = {
  gt: (a, b) => a > b, '>': (a, b) => a > b,
  gte: (a, b) => a >= b, '>=': (a, b) => a >= b,
  lt: (a, b) => a < b, '<': (a, b) => a < b,
  lte: (a, b) => a <= b, '<=': (a, b) => a <= b,
}

interface Expr { at(t: number): number }
const fixed = (v: number): Expr => ({ at: () => v })

// Conditions compiled during a run register here so runSymphony can give them pathing defaults
let condRegistry: BinaryCond[] | null = null

class BinaryCond implements Cond {
  pathing: PathingDefault = null
  constructor(
    private lhs: Expr, private cmp: Comparator, private rhs: Expr,
    private forDays = 1, private lhsAgo = 0, private rhsAgo = 0,
    private rhsWeight = 1, private rhsBias = 0
  ) { condRegistry?.push(this) }
  test(t: number) {
    if (this.pathing && t < this.pathing.start) return { value: this.pathing.value, valid: true }
    let valid = true
    for (let i = 0; i < this.forDays; i++) {
      const l = this.lhs.at(t - i - this.lhsAgo)
      const r = this.rhsWeight * this.rhs.at(t - i - this.rhsAgo) + this.rhsBias
      if (Number.isNaN(l) || Number.isNaN(r)) { valid = false; return { value: false, valid } }
      if (!this.cmp(l, r)) return { value: false, valid }
    }
    return { value: true, valid }
  }
}

class CompoundCond implements Cond {
  constructor(private all: boolean, private parts: Cond[]) {}
  test(t: number) {
    let valid = true
    for (const p of this.parts) {
      const r = p.test(t)
      valid &&= r.valid
      if (this.all && !r.value) return { value: false, valid }
      if (!this.all && r.value) return { value: true, valid }
    }
    return { value: this.all, valid }
  }
}

// ─── Compiling the score JSON ───────────────────────────────────────────────

function findRoot(json: unknown): Json {
  let j = json as Json
  if (typeof j === 'string') j = JSON.parse(j)
  if (!j || typeof j !== 'object') throw new Error('A symphony must be a JSON object')
  if (j.step !== 'root' && j.symphony && typeof j.symphony === 'object') j = j.symphony as Json
  if (j.step !== 'root' && j.score && typeof j.score === 'object') j = j.score as Json
  if (!Array.isArray(j.children) || j.children.length === 0) {
    throw new Error('This JSON has no symphony tree (expected a Composer score with "step": "root")')
  }
  // Newer Composer exports name tickers "EQUITIES::XLK//USD"
  const text = JSON.stringify(j)
  return text.includes('EQUITIES::') ? JSON.parse(text.replace(/"EQUITIES::([^"/]+)\/\/USD"/g, '"$1"')) : j
}

function parseRebalance(v: unknown): RebalanceFrequency {
  const s = String(v ?? 'daily').toLowerCase()
  return (['none', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as const).find(x => x === s) ?? 'daily'
}

function corridorOf(root: Json): number {
  const c = Number(root['rebalance-corridor-width'] ?? 0)
  return Number.isFinite(c) ? c : 0
}

/** Compiles the tree. Without a context it only collects tickers. */
function compileRoot(json: unknown, tickers: Set<string>, ctx?: Context): Node {
  const root = findRoot(json)
  const c = new Compiler(tickers, ctx)
  return c.node((root.children as Json[])[0])
}

class Compiler {
  constructor(private tickers: Set<string>, private ctx?: Context) {}

  // In collect-only mode no Context exists; nodes are never stepped
  private get cx(): Context { return this.ctx ?? (this.dummy ??= new DummyContext()) }
  private dummy?: Context

  node(j: Json): Node {
    const step = String(j.step ?? '')
    const kids = () => ((j.children as Json[] | undefined) ?? []).map(c => this.node(c))
    if (step === 'root') return compileRoot(j, this.tickers, this.ctx)
    if (step === 'asset') {
      const t = String(j.ticker ?? j.symbol ?? '')
      if (!t) throw new Error('An asset node has no ticker')
      this.tickers.add(t)
      return new AssetNode(this.cx, t)
    }
    if (step === 'group') {
      const k = kids()
      if (k.length === 0) throw new Error(`Group "${j.name ?? ''}" is empty`)
      return new PassNode(this.cx, k)
    }
    if (step === 'wt-cash-equal') return new WeightNode(this.cx, kids(), null, 0)
    if (step === 'wt-cash-specified') {
      const cs = (j.children as Json[] | undefined) ?? []
      const ks = cs.map(c => this.node(c))
      const ws = cs.map(c => {
        const w = c.weight as { num?: number; den?: number } | undefined
        if (!w) return 0
        return Number(w.num) / Number(w.den)
      })
      const sum = ws.reduce((a, b) => a + b, 0)
      return new WeightNode(this.cx, ks, ws.map(w => (sum > 0 ? w / sum : 1 / ws.length)), 0)
    }
    if (step === 'wt-inverse-vol') {
      const w = Number(j['window-days'])
      if (!(w > 0)) throw new Error('An inverse-volatility weighting has no "window-days"')
      return new WeightNode(this.cx, kids(), null, w)
    }
    if (step === 'filter') {
      const spec = this.spec(j['sort-by-fn'], windowFrom(j['sort-by-fn-params']) ?? j['sort-by-window-days'], j['sort-by-fn-params'])
      const top = String(j['select-fn'] ?? 'top') !== 'bottom'
      const count = Math.max(1, Number(j['select-n'] ?? 1))
      return new FilterNode(this.cx, kids(), spec, top, count)
    }
    if (step === 'if' || step === 'if-child') return this.conditional(j)
    // QuantMage blocks (see quantmage.ts)
    if (step === 'switch') {
      const conds = ((j.conditions as Json[] | undefined) ?? []).map(c => this.nested(c, this.mods))
      const k = kids()
      if (conds.length === 0 || k.length !== conds.length + 1) throw new Error(`Switch "${j.name ?? ''}" needs one more branch than conditions`)
      return new SwitchNode(this.cx, conds, k)
    }
    if (step === 'mixed') {
      const k = kids()
      if (k.length !== 2) throw new Error(`Mixed "${j.name ?? ''}" needs two branches`)
      return new MixedNode(this.cx, this.objExpr((j.operand ?? {}) as Json), num(j.from, 0), num(j.to, 1), k[0], k[1])
    }
    // Crescendo's netting blocks
    if (step === 'expand') {
      const k = kids()
      if (k.length !== 1) throw new Error('Expand needs exactly one child')
      return new ExpandNode(this.cx, k[0])
    }
    if (step === 'collapse') {
      const k = kids()
      if (k.length !== 2) throw new Error('Collapse needs a primary and a secondary child')
      return new CollapseNode(this.cx, k[0], k[1])
    }
    if (step === 'enter-exit') {
      const k = kids()
      if (k.length !== 2) throw new Error(`Enter/Exit "${j.name ?? ''}" needs two branches`)
      return new EnterExitNode(this.cx, this.nested((j.enter ?? {}) as Json, this.mods),
        this.nested((j.exit ?? {}) as Json, this.mods), k[0], k[1])
    }
    throw new Error(`Unknown symphony step: ${step || '(none)'}`)
  }

  private conditional(j: Json): Node {
    const branches = (j.children as Json[] | undefined) ?? []
    let cond: Cond | null = null
    let yes: Node[] = []
    let no: Node[] = []
    for (const b of branches) {
      const kids = ((b.children as Json[] | undefined) ?? []).map(c => this.node(c))
      if (b['is-else-condition?'] === true) no = kids
      else { cond = this.condition(b); yes = kids }
    }
    if (!cond) throw new Error('An "if" block has no condition')
    return new IfNode(this.cx, cond, new PassNode(this.cx, yes), new PassNode(this.cx, no))
  }

  private condition(b: Json): Cond {
    const nested = b.condition as Json | undefined
    const mods = (c: Json) => [
      Math.max(1, num(c['for-days'] ?? b['for-days'], 1)),
      num(c['lhs-days-ago'] ?? b['lhs-days-ago'], 0),
      num(c['rhs-days-ago'] ?? b['rhs-days-ago'], 0),
      num(c['rhs-weight'] ?? b['rhs-weight'], 1),
      num(c['rhs-bias'] ?? b['rhs-bias'], 0),
    ] as const
    if (nested && typeof nested === 'object') return this.nested(nested, mods)

    // Flat (legacy) fields
    const cmp = comparator(b.comparator)
    const lhs = this.flatExpr(b['lhs-fn'], b['lhs-val'], windowFrom(b['lhs-fn-params']) ?? b['lhs-window-days'], b['lhs-fn-params'])
    const rhs = b['rhs-fixed-value?'] === true
      ? fixed(Number(b['rhs-val']))
      : this.flatExpr(b['rhs-fn'], b['rhs-val'], windowFrom(b['rhs-fn-params']) ?? b['rhs-window-days'], b['rhs-fn-params'])
    return new BinaryCond(lhs, cmp, rhs, ...mods(b))
  }

  private mods = (c: Json) => [
    Math.max(1, num(c['for-days'], 1)), num(c['lhs-days-ago'], 0), num(c['rhs-days-ago'], 0),
    num(c['rhs-weight'], 1), num(c['rhs-bias'], 0),
  ] as const

  private nested(c: Json, mods: (c: Json) => readonly [number, number, number, number, number]): Cond {
    const type = String(c['condition-type'] ?? 'binary')
    if (type === 'compound') {
      const parts = ((c.conditions as Json[] | undefined) ?? []).map(x => this.nested(x, mods))
      return new CompoundCond(String(c.operator ?? 'any') === 'all', parts)
    }
    const cmp = comparator(c.comparator)
    const lhsJ = (c.lhs ?? {}) as Json
    const rhsJ = (c.rhs ?? {}) as Json
    const tickers = Array.isArray(c.tickers) ? (c.tickers as string[]) : []
    if (type === 'binary-compound' && tickers.length > 0) {
      const parts = tickers.map(tk => new BinaryCond(
        this.objExpr(lhsJ, tk), cmp,
        rhsJ.constant != null ? fixed(Number(rhsJ.constant)) : this.objExpr(rhsJ, tk)))
      return parts.length === 1 ? parts[0] : new CompoundCond(String(c.operator ?? 'any') === 'all', parts)
    }
    const rhs = rhsJ.constant != null ? fixed(Number(rhsJ.constant)) : this.objExpr(rhsJ)
    return new BinaryCond(this.objExpr(lhsJ), cmp, rhs, ...mods(c))
  }

  private objExpr(e: Json, wildcard?: string): Expr {
    let ticker = e.ticker as string | undefined
    if (ticker === '%' && wildcard) ticker = wildcard
    return this.flatExpr(e.fn, ticker, windowFrom(e.params), e.params)
  }

  private flatExpr(fn: unknown, val: unknown, window: unknown, params: unknown): Expr {
    const s = val == null ? '' : String(val)
    if (fn == null || /^-?\d+(\.\d+)?$/.test(s)) return fixed(Number(s))
    if (!s) throw new Error(`Indicator ${String(fn)} has no ticker`)
    this.tickers.add(s)
    const spec = this.spec(fn, window, params)
    if (spec.fn === 'fixed-value') return fixed(Number(s))
    if (!this.ctx) return fixed(NaN)
    return new Indicator(spec, this.ctx.series(s))
  }

  private spec(fn: unknown, window: unknown, params: unknown): IndicatorSpec {
    const name = String(fn ?? '')
    const p = (params && typeof params === 'object' ? params : {}) as Json
    return {
      fn: FN_ALIASES[name] ?? name,
      window: num(window, 0),
      short: num(p['short-window'], 0) || undefined,
      long: num(p['long-window'], 0) || undefined,
      signal: num(p['signal-window'], 0) || undefined,
    }
  }
}

class DummyContext extends Context {
  constructor() { super(0, {}) }
  override series(): Float64Array { return new Float64Array(0) }
}

function windowFrom(params: unknown): unknown {
  if (!params || typeof params !== 'object') return undefined
  const p = params as Json
  return p.window ?? p['long-window'] ?? p['short-window'] ?? undefined
}

function num(v: unknown, dflt: number): number {
  if (v == null || v === '') return dflt
  const n = Number(v)
  return Number.isFinite(n) ? n : dflt
}

function comparator(v: unknown): Comparator {
  const c = COMPARATORS[String(v ?? '')]
  if (!c) throw new Error(`Unknown comparator: ${String(v)}`)
  return c
}
