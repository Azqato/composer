// ─── Exposure netting (Crescendo's NetExposure, ExposureMap and CashEquivalents) ─
// Offsetting leveraged funds on the same index cancel out: 50% TQQQ + 50% SQQQ is no exposure
// at all, which frees the capital. Each index's net exposure is held in the most leveraged fund
// the strategy already holds (the held-only policy used by the Collapse and Expand blocks).
import type { LetfEntry } from '../types'
import { loadLetfMap } from '../data/letf'
import { loadDataText } from '../data/staticFile'

type Alloc = Record<string, number>
const FLAT = 1e-9

export interface NettingTables {
  letf: Map<string, LetfEntry>
  cash: Set<string>
  candidates: Map<string, Candidate[]>
}

interface Candidate { ticker: string; leverage: number; onlyWhenHeld: boolean }

export async function loadNettingTables(): Promise<NettingTables> {
  const letf = new Map((await loadLetfMap()).map(e => [e.ticker, e]))
  const cashRows = JSON.parse(await loadDataText('cashMap')) as { ticker: string }[]
  return { letf, cash: new Set(cashRows.map(r => r.ticker.toUpperCase())), candidates: new Map() }
}

// Simulated series (QQQSIM, CASHX …) aren't funds anyone can hold
const isTradable = (t: string | undefined) => !!t && !/SIM\d*$/.test(t) && t !== 'CASHX' && t !== 'INFLATION'

function expressesLeverage(e: LetfEntry | undefined): e is LetfEntry {
  return !!e && e.unwind !== false && e.leverage !== 1 && isTradable(e.underlying)
}

function candidatesFor(u: string, tb: NettingTables): Candidate[] {
  if (!isTradable(u)) return []
  let list = tb.candidates.get(u)
  if (list) return list
  const self = tb.letf.get(u)
  list = [{ ticker: u, leverage: 1, onlyWhenHeld: !!self && self.nettingCandidate === false }]
  for (const e of tb.letf.values()) {
    if (expressesLeverage(e) && e.underlying === u && isTradable(e.ticker)) {
      list.push({ ticker: e.ticker, leverage: e.leverage, onlyWhenHeld: e.nettingCandidate === false })
    }
  }
  list.sort((a, b) => Math.abs(b.leverage) - Math.abs(a.leverage) || (a.ticker < b.ticker ? -1 : a.ticker > b.ticker ? 1 : 0))
  tb.candidates.set(u, list)
  return list
}

/** Held-only policy: the most leveraged fund on the right side that the strategy already holds. */
function express(net: number, cands: Candidate[], held: Set<string>): { ticker: string; weight: number }[] {
  if (Math.abs(net) <= FLAT) return []
  const ok = cands.filter(c => held.has(c.ticker) && c.leverage !== 0 && Math.sign(c.leverage) === Math.sign(net))
  if (ok.length === 0) return []
  const best = ok[0]
  return [{ ticker: best.ticker, weight: Math.abs(net) / Math.abs(best.leverage) }]
}

/** Nets the holdings; `invested` is the capital still in use (1 when nothing offsets). */
export function netHeldOnly(alloc: Alloc, tb: NettingTables): { target: Alloc; invested: number } {
  const target: Alloc = {}
  const exposure = new Map<string, number>()
  const members = new Map<string, Set<string>>()
  const weights = new Map<string, number>()
  for (const [raw, w] of Object.entries(alloc)) {
    const t = raw.trim().toUpperCase()
    if (!t || w === 0) continue
    if (tb.cash.has(t)) { target[t] = (target[t] ?? 0) + w; continue }
    const e = tb.letf.get(t)
    const lev = expressesLeverage(e)
    const u = lev ? e.underlying : t
    exposure.set(u, (exposure.get(u) ?? 0) + w * (lev ? e.leverage : 1))
    if (!members.has(u)) members.set(u, new Set())
    members.get(u)!.add(t)
    weights.set(t, (weights.get(t) ?? 0) + w)
  }
  for (const [u, x] of exposure) {
    const net = Math.abs(x) <= FLAT ? 0 : x
    const held = members.get(u)!
    const chosen = express(net, candidatesFor(u, tb), held)
    const used = chosen.reduce((s, h) => s + h.weight, 0)
    let gross = 0
    for (const t of held) gross += Math.abs(weights.get(t) ?? 0)
    // Keep the original funds when nothing can express the exposure or netting saves no capital
    if ((chosen.length === 0 && net !== 0) || used >= gross - FLAT) {
      for (const t of held) target[t] = (target[t] ?? 0) + (weights.get(t) ?? 0)
    } else {
      for (const h of chosen) target[h.ticker] = (target[h.ticker] ?? 0) + h.weight
    }
  }
  const invested = Object.keys(target).sort().reduce((s, k) => s + target[k], 0)
  return { target, invested }
}

/** Crescendo's Expand: nets, then scales what's left back up to fully invested (all cash if nothing is). */
export function expand(alloc: Alloc, tb: NettingTables): Alloc {
  const { target, invested } = netHeldOnly(alloc, tb)
  if (invested <= FLAT) return { CASHX: 1 }
  return Object.fromEntries(Object.entries(target).map(([k, v]) => [k, v / invested]))
}

/** Crescendo's Collapse: nets the primary, and fills the capital it frees with the secondary. */
export function collapse(primary: Alloc, secondary: Alloc, tb: NettingTables): Alloc {
  const { target, invested } = netHeldOnly(primary, tb)
  if (invested >= 1 - FLAT) return primary
  const out: Alloc = { ...target }
  for (const [k, v] of Object.entries(secondary)) out[k] = (out[k] ?? 0) + v * (1 - invested)
  return out
}
