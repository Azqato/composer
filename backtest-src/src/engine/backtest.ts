import type {
  BacktestInput, BacktestResult, FixedWeightStrategy,
  SymphonyStrategy, PriceSeries
} from '../types'
import { computeMetrics, computeMonthlyReturns, computeEoyReturns } from './metrics'
import { computeDrawdowns } from './drawdown'
import { runSymphony, symphonyTickers, type RebalanceFrequency } from '../symphony/evaluator'
import { loadNettingTables } from '../symphony/netting'

export type ProgressCallback = (msg: string) => void

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function runBacktest(
  input: BacktestInput,
  priceData: Record<string, PriceSeries>,
  riskFreeRate: number,
  onProgress?: ProgressCallback
): Promise<BacktestResult> {
  const log = (m: string) => onProgress?.(m)

  // Determine the union of all trading dates
  const allTickers = [input.benchmark, ...getStrategyTickers(input.strategy)]
  const tradingDates = buildTradingDateList(priceData, allTickers)

  let portfolioValues: number[]
  let dailyAllocs: Array<Record<string, number>>
  let filtered: string[]

  if (input.strategy.type === 'fixed-weight') {
    // Start once every leg and the benchmark have prices
    const first = firstCommonDate(priceData, allTickers)
    filtered = filterDates(tradingDates, maxDate(input.startDate, first), input.endDate)
    if (filtered.length < 2) throw new Error('Insufficient data for the selected date range')
    log(`Simulating ${filtered.length} trading days...`)
    const result = simulateFixedWeight(input.strategy, filtered, priceData)
    portfolioValues = result.values
    dailyAllocs = result.allocations
  } else {
    // Indicators need history before the start date, so evaluate over every available day
    log('Evaluating symphony...')
    const lookup = buildPriceLookup(priceData, tradingDates)
    const usesNetting = /"step":\s*"(collapse|expand)"/.test(JSON.stringify(input.strategy.symphonyJson))
    const run = runSymphony(input.strategy.symphonyJson, tradingDates, lookup,
      usesNetting ? await loadNettingTables() : undefined)
    if (run.firstValid < 0) throw new Error("Not enough history to compute the symphony's indicators")
    let from = run.firstValid
    const benchStart = priceData[input.benchmark]?.[0]?.date
    while (benchStart && from < tradingDates.length && tradingDates[from] < benchStart) from++
    while (input.startDate && from < tradingDates.length && tradingDates[from] < input.startDate) from++
    let to = tradingDates.length - 1
    while (input.endDate && to >= 0 && tradingDates[to] > input.endDate) to--
    filtered = tradingDates.slice(from, to + 1)
    if (filtered.length < 2) throw new Error('Insufficient data for the selected date range')
    log(`Simulating ${filtered.length} trading days from ${filtered[0]}...`)
    const result = simulateTargets(
      run.allocations.slice(from, to + 1), filtered,
      Object.fromEntries(Object.entries(lookup).map(([k, v]) => [k, v.slice(from, to + 1)])),
      run.rebalance, run.corridor)
    portfolioValues = result.values
    dailyAllocs = result.allocations
  }

  // Benchmark curve
  let benchmarkValues = buildSingleTickerCurve(input.benchmark, filtered, priceData)

  // Excluded ranges: drop those days and chain the kept days' own returns, so the curves rejoin
  const ranges = (input.exclude ?? []).filter(r => r.from && r.to && r.from <= r.to)
  const hit = ranges.filter(r => filtered.some(d => d >= r.from && d <= r.to))
  const gapAt: number[] = []
  if (hit.length) {
    const out = (d: string) => hit.some(r => d >= r.from && d <= r.to)
    const keep = filtered.map((d, i) => i).filter(i => !out(filtered[i]))
    if (keep.length < 2) throw new Error('The excluded ranges leave too few trading days')
    const chain = (v: number[]) => keep.reduce<number[]>((acc, i, k) =>
      (acc.push(k === 0 ? v[i] : acc[k - 1] * (v[i - 1] ? v[i] / v[i - 1] : 1)), acc), [])
    keep.forEach((i, k) => { if (k > 0 && i !== keep[k - 1] + 1) gapAt.push(k) })
    portfolioValues = chain(portfolioValues)
    benchmarkValues = chain(benchmarkValues)
    dailyAllocs = keep.map(i => dailyAllocs[i])
    filtered = keep.map(i => filtered[i])
    log(`Excluded ${hit.map(r => `${r.from} to ${r.to}`).join(', ')}: ${filtered.length} trading days kept`)
  }

  // Daily returns
  const dailyReturns = portfolioValues.map((v, i) =>
    i === 0 ? 0 : v / portfolioValues[i - 1] - 1
  ).slice(1)
  const benchmarkDailyReturns = benchmarkValues.map((v, i) =>
    i === 0 ? 0 : v / benchmarkValues[i - 1] - 1
  ).slice(1)

  log('Computing metrics...')

  const metrics = computeMetrics(
    filtered, portfolioValues, benchmarkValues,
    dailyReturns, benchmarkDailyReturns, riskFreeRate
  )

  const benchmarkMetrics = computeMetrics(
    filtered, benchmarkValues, benchmarkValues,
    benchmarkDailyReturns, benchmarkDailyReturns, riskFreeRate
  )

  const { periods: drawdownPeriods } = computeDrawdowns(filtered, portfolioValues)

  // Monthly / EOY
  const stratMonthly = computeMonthlyReturns(filtered, portfolioValues)
  const benchMonthly = computeMonthlyReturns(filtered, benchmarkValues)
  const monthlyReturns: Record<string, { strategy: number; benchmark: number }> = {}
  const allMonths = new Set([...Object.keys(stratMonthly), ...Object.keys(benchMonthly)])
  for (const m of allMonths) {
    monthlyReturns[m] = { strategy: stratMonthly[m] ?? 0, benchmark: benchMonthly[m] ?? 0 }
  }

  const stratEoy = computeEoyReturns(filtered, portfolioValues)
  const benchEoy = computeEoyReturns(filtered, benchmarkValues)
  const eoyReturns: Record<string, { strategy: number; benchmark: number }> = {}
  const allYears = new Set([...Object.keys(stratEoy), ...Object.keys(benchEoy)])
  for (const y of allYears) {
    eoyReturns[y] = { strategy: stratEoy[y] ?? 0, benchmark: benchEoy[y] ?? 0 }
  }

  log('Done.')

  return {
    strategyName: input.strategy.name,
    benchmarkTicker: input.benchmark,
    startDate: filtered[0],
    endDate: filtered[filtered.length - 1],
    generatedAt: new Date().toISOString(),
    dates: filtered,
    portfolioValues,
    benchmarkValues,
    dailyReturns,
    benchmarkDailyReturns,
    dailyAllocations: dailyAllocs,
    metrics,
    benchmarkMetrics,
    drawdownPeriods,
    eoyReturns,
    monthlyReturns,
    riskFreeRate,
    ...(hit.length ? { excluded: hit, gapAt } : {}),
  }
}

// ─── Fixed-weight simulation ──────────────────────────────────────────────────

function simulateFixedWeight(
  strategy: FixedWeightStrategy,
  dates: string[],
  priceData: Record<string, PriceSeries>
): { values: number[]; allocations: Array<Record<string, number>> } {
  const n = dates.length
  const values: number[] = new Array(n)
  const allocations: Array<Record<string, number>> = new Array(n)

  // Build price lookup: ticker -> date -> adjClose
  const lookup = buildPriceLookup(priceData, dates)

  // Normalised weights
  const totalWeight = strategy.legs.reduce((s, l) => s + l.weight, 0)
  const legs = strategy.legs.map(l => ({ ...l, weight: l.weight / totalWeight }))

  // Initial allocation: 1.0 per unit
  values[0] = 1.0
  allocations[0] = Object.fromEntries(legs.map(l => [l.ticker, l.weight]))

  // Per-ticker value tracking (for churn calculation)
  let tickerValues: Record<string, number> = {}
  for (const l of legs) tickerValues[l.ticker] = l.weight

  for (let i = 1; i < n; i++) {
    const isRebalanceDay = shouldRebalance(strategy.rebalance, dates, i)

    // Grow each ticker position by its daily return
    let totalVal = 0
    const newTickerVals: Record<string, number> = {}
    for (const l of legs) {
      const prevPrice = lookup[l.ticker][i - 1]
      const currPrice = lookup[l.ticker][i]
      if (prevPrice == null || currPrice == null || prevPrice === 0) {
        newTickerVals[l.ticker] = tickerValues[l.ticker]
      } else {
        newTickerVals[l.ticker] = tickerValues[l.ticker] * (currPrice / prevPrice)
      }
      totalVal += newTickerVals[l.ticker]
    }
    values[i] = totalVal

    if (isRebalanceDay && totalVal > 0) {
      // Rebalance: reset weights
      for (const l of legs) {
        newTickerVals[l.ticker] = totalVal * l.weight
      }
    }

    tickerValues = newTickerVals
    allocations[i] = Object.fromEntries(
      Object.entries(tickerValues).map(([t, v]) => [t, v / totalVal])
    )
  }

  return { values, allocations }
}

// ─── Symphony simulation ──────────────────────────────────────────────────────
// targets[i] is decided at the close of day i and earns the return to day i+1.

function simulateTargets(
  targets: Array<Record<string, number>>,
  dates: string[],
  lookup: Record<string, (number | null)[]>,
  rebalance: RebalanceFrequency,
  corridor: number
): { values: number[]; allocations: Array<Record<string, number>> } {
  const n = dates.length
  const values: number[] = new Array(n)
  const allocations: Array<Record<string, number>> = new Array(n)

  values[0] = 1.0
  let tickerValues: Record<string, number> = withCash(targets[0], 1)
  allocations[0] = withCash(targets[0], 1)

  for (let i = 1; i < n; i++) {
    const totalVal = growPortfolio(tickerValues, lookup, i)
    values[i] = totalVal

    const target = targets[i]
    const drifted: Record<string, number> = {}
    for (const [t, v] of Object.entries(tickerValues)) drifted[t] = totalVal > 0 ? v / totalVal : 0

    if (shouldRebalanceSymphony(rebalance, corridor, dates, i, drifted, target)) {
      tickerValues = withCash(target, totalVal)
      allocations[i] = withCash(target, 1)
    } else {
      allocations[i] = drifted
    }
  }

  return { values, allocations }
}

// Whatever a target leaves unallocated (an empty branch) is held as cash, which earns nothing
export const CASH = '$CASH'
function withCash(target: Record<string, number>, total: number): Record<string, number> {
  const out: Record<string, number> = {}
  let sum = 0
  for (const [t, w] of Object.entries(target)) { out[t] = total * w; sum += w }
  if (sum < 1 - 1e-9) out[CASH] = total * (1 - sum)
  return out
}

function shouldRebalanceSymphony(
  freq: RebalanceFrequency, corridor: number, dates: string[], i: number,
  current: Record<string, number>, target: Record<string, number>
): boolean {
  if (freq === 'daily') return true
  if (corridor > 0) {
    // Threshold rebalancing: trade when any holding drifts past the corridor
    for (const t of new Set([...Object.keys(current), ...Object.keys(target)])) {
      if (Math.abs((current[t] ?? 0) - (target[t] ?? 0)) > corridor) return true
    }
    return false
  }
  if (freq === 'none') return false
  const [py, pm] = dates[i - 1].split('-').map(Number)
  const [y, m] = dates[i].split('-').map(Number)
  if (freq === 'yearly') return y !== py
  if (freq === 'quarterly') return y !== py || Math.floor((m - 1) / 3) !== Math.floor((pm - 1) / 3)
  if (freq === 'monthly') return y !== py || m !== pm
  return shouldRebalance('weekly', dates, i)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function growPortfolio(
  tickerValues: Record<string, number>,
  lookup: Record<string, (number | null)[]>,
  i: number
): number {
  let total = 0
  for (const [ticker, val] of Object.entries(tickerValues)) {
    const prev = lookup[ticker]?.[i - 1]
    const curr = lookup[ticker]?.[i]
    const grown = prev == null || curr == null || prev === 0 ? val : val * (curr / prev)
    tickerValues[ticker] = grown   // holdings drift until the next rebalance
    total += grown
  }
  return total
}

function buildPriceLookup(
  priceData: Record<string, PriceSeries>,
  dates: string[]
): Record<string, (number | null)[]> {
  const lookup: Record<string, (number | null)[]> = {}
  for (const [ticker, series] of Object.entries(priceData)) {
    const map = new Map(series.map(p => [p.date, p.adjClose]))
    lookup[ticker] = dates.map(d => map.get(d) ?? null)
    // Forward-fill nulls
    let last: number | null = null
    for (let i = 0; i < lookup[ticker].length; i++) {
      if (lookup[ticker][i] != null) last = lookup[ticker][i]
      else if (last != null) lookup[ticker][i] = last
    }
  }
  return lookup
}

function buildSingleTickerCurve(
  ticker: string,
  dates: string[],
  priceData: Record<string, PriceSeries>
): number[] {
  const series = priceData[ticker]
  if (!series || series.length === 0) {
    return new Array(dates.length).fill(1)
  }
  const map = new Map(series.map(p => [p.date, p.adjClose]))
  const prices: number[] = []
  let last = 0
  for (const d of dates) {
    const p = map.get(d)
    if (p != null) last = p
    prices.push(last)
  }
  // Normalise to 1.0
  const start = prices[0]
  return start === 0 ? prices : prices.map(p => p / start)
}

function buildTradingDateList(
  priceData: Record<string, PriceSeries>,
  tickers: string[]
): string[] {
  const dateSet = new Set<string>()
  for (const t of tickers) {
    const series = priceData[t]
    if (series) for (const p of series) dateSet.add(p.date)
  }
  return Array.from(dateSet).sort()
}

function firstCommonDate(priceData: Record<string, PriceSeries>, tickers: string[]): string | null {
  let first: string | null = null
  for (const t of tickers) {
    const d = priceData[t]?.[0]?.date
    if (d && (first == null || d > first)) first = d
  }
  return first
}

function maxDate(a: string | null, b: string | null): string | null {
  if (a == null) return b
  if (b == null) return a
  return a > b ? a : b
}

function filterDates(dates: string[], startDate: string | null, endDate: string | null): string[] {
  return dates.filter(d =>
    (startDate == null || d >= startDate) &&
    (endDate == null || d <= endDate)
  )
}

function shouldRebalance(freq: string, dates: string[], i: number): boolean {
  if (freq === 'daily') return true
  if (freq === 'weekly') {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    return curr.getDay() < prev.getDay()  // crossed Monday
  }
  if (freq === 'monthly') {
    return dates[i].slice(0, 7) !== dates[i - 1].slice(0, 7)
  }
  return true
}

function getStrategyTickers(strategy: FixedWeightStrategy | SymphonyStrategy): string[] {
  if (strategy.type === 'fixed-weight') {
    return strategy.legs.map(l => l.ticker)
  }
  return symphonyTickers(strategy.symphonyJson)
}
