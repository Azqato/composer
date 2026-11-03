// ─── Per-ticker breakdowns: holdings, contributions, churn and start-date limiters ─────────────
// allocations[i] is the weight held at the close of day i, so it earns the return to day i + 1.
import type { BacktestResult, PriceSeries, HoldingRow, ContributionRow, LimiterRow } from '../types'
import { CASH } from './backtest'

type Run = Pick<BacktestResult, 'dates' | 'portfolioValues' | 'dailyAllocations'>

/** Weights for every day: the allocations are sparse on some paths, so carry the last one forward. */
function denseAllocations(run: Run): Record<string, number>[] {
  let held: Record<string, number> = {}
  return run.dates.map((_, i) => (held = run.dailyAllocations[i] ?? held))
}

export function computeHoldings(run: Run): HoldingRow[] {
  const alloc = denseAllocations(run)
  const stats = new Map<string, { sum: number; min: number; max: number; days: number }>()
  for (const day of alloc) {
    for (const [t, w] of Object.entries(day)) {
      if (!(w > 1e-9) || t === CASH) continue
      const s = stats.get(t) ?? { sum: 0, min: Infinity, max: 0, days: 0 }
      s.sum += w; s.days++
      s.min = Math.min(s.min, w); s.max = Math.max(s.max, w)
      stats.set(t, s)
    }
  }
  const n = alloc.length || 1
  return [...stats.entries()]
    .map(([ticker, s]) => ({ ticker, avg: s.sum / s.days, min: s.min, max: s.max, daysHeld: s.days, shareHeld: s.days / n }))
    .sort((a, b) => b.daysHeld - a.daysHeld || b.avg - a.avg)
}

/** Each ticker's daily gain or loss in dollars, as a fraction of the starting capital. */
export function computeContributions(run: Run, priceData: Record<string, PriceSeries>): ContributionRow[] {
  const alloc = denseAllocations(run)
  const ret = priceReturns(priceData)
  const v0 = run.portfolioValues[0]
  const rows = new Map<string, { gains: number; losses: number }>()
  for (let i = 1; i < run.dates.length; i++) {
    const scale = run.portfolioValues[i - 1] / v0
    for (const [t, w] of Object.entries(alloc[i - 1])) {
      if (!(w > 1e-9) || t === CASH) continue
      const c = w * ret(t, run.dates[i - 1], run.dates[i]) * scale  // no price that day: it stood still
      const r = rows.get(t) ?? { gains: 0, losses: 0 }
      if (c >= 0) r.gains += c; else r.losses += c
      rows.set(t, r)
    }
  }
  return [...rows.entries()]
    .map(([ticker, r]) => ({ ticker, gains: r.gains, losses: r.losses, total: r.gains + r.losses }))
    .sort((a, b) => b.total - a.total)
}

/**
 * Daily churn: the share of the portfolio traded, half the sum of absolute weight changes against
 * yesterday's weights drifted by today's prices (drift alone is not trading).
 */
export function churnStats(run: Run, priceData: Record<string, PriceSeries>): { avg: number; median: number } {
  const alloc = denseAllocations(run)
  const ret = priceReturns(priceData)
  const churn: number[] = []
  for (let i = 1; i < alloc.length; i++) {
    const drifted: Record<string, number> = {}
    let total = 0
    for (const [t, w] of Object.entries(alloc[i - 1])) {
      const v = w * (1 + (t === CASH ? 0 : ret(t, run.dates[i - 1], run.dates[i])))
      drifted[t] = v; total += v
    }
    const keys = new Set([...Object.keys(alloc[i]), ...Object.keys(drifted)])
    let sum = 0
    for (const k of keys) sum += Math.abs((alloc[i][k] ?? 0) - (total > 0 ? (drifted[k] ?? 0) / total : 0))
    churn.push(sum / 2)
  }
  if (!churn.length) return { avg: 0, median: 0 }
  const sorted = [...churn].sort((a, b) => a - b)
  const mid = sorted.length >> 1
  return {
    avg: churn.reduce((a, b) => a + b, 0) / churn.length,
    median: sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2,
  }
}

/** A ticker's return between two dates; 0 when either price is missing. */
function priceReturns(priceData: Record<string, PriceSeries>) {
  const prices = new Map<string, Map<string, number>>()
  return (t: string, d0: string, d1: string) => {
    let m = prices.get(t)
    if (!m) prices.set(t, m = new Map((priceData[t] ?? []).map(p => [p.date, p.adjClose])))
    const a = m.get(d0), b = m.get(d1)
    return a == null || b == null || a === 0 ? 0 : b / a - 1
  }
}

/**
 * The tickers that set how far back the backtest can go, latest first price first.
 * Extension: trading days of simulated history before the ticker's real prices begin.
 */
export function computeLimiters(
  tickers: string[], priceData: Record<string, PriceSeries>,
  realFrom: Record<string, string | null | undefined>,
): LimiterRow[] {
  return tickers
    .filter(t => priceData[t]?.length)
    .map(ticker => {
      const series = priceData[ticker], from = realFrom[ticker]
      const extensionDays = from === null ? series.length
        : from === undefined ? 0 : series.filter(p => p.date < from).length
      return { ticker, availableFrom: series[0].date, extensionDays }
    })
    .sort((a, b) => b.availableFrom.localeCompare(a.availableFrom))
}
