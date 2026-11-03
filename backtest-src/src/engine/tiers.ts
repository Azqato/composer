// ─── Data tiers: which days of a backtest rest on real prices ────────────────
// Each day is Real, Simulated or Filled (Default Pathing: a held fund had no price that day and its
// last price was carried forward). The weakest tier among the funds held that day wins:
// Simulated over Filled over Real.
import type { BacktestResult, PriceSeries, DataTier, TierSegment } from '../types'
import { CASH } from './backtest'

const RANK: Record<DataTier, number> = { real: 0, filled: 1, simulated: 2 }

/**
 * @param realFrom first date of real prices per ticker; null when the whole series is simulated.
 *                 Tickers missing from it count as real.
 */
export function computeTiers(
  result: Pick<BacktestResult, 'dates' | 'dailyAllocations'>,
  priceData: Record<string, PriceSeries>,
  realFrom: Record<string, string | null | undefined>,
): TierSegment[] {
  const dateSets = new Map<string, Set<string>>()
  const has = (ticker: string, date: string) => {
    let s = dateSets.get(ticker)
    if (!s) dateSets.set(ticker, s = new Set((priceData[ticker] ?? []).map(p => p.date)))
    return s.has(date)
  }

  const segments: TierSegment[] = []
  let held: Record<string, number> = {}
  result.dates.forEach((date, i) => {
    held = result.dailyAllocations[i] ?? held  // sparse: carry the last allocation
    let tier: DataTier = 'real'
    for (const [ticker, weight] of Object.entries(held)) {
      if (!(weight > 1e-9) || ticker === CASH) continue
      const from = realFrom[ticker]
      const t: DataTier = from === null || (from !== undefined && date < from) ? 'simulated'
        : has(ticker, date) ? 'real' : 'filled'
      if (RANK[t] > RANK[tier]) tier = t
      if (tier === 'simulated') break
    }
    const last = segments[segments.length - 1]
    if (last && last.tier === tier) last.end = date
    else segments.push({ start: date, end: date, tier })
  })
  return segments
}

/** Share of days in each tier, for the summary line under the strip. */
export function tierShares(segments: TierSegment[], dates: string[]): Record<DataTier, number> {
  const index = new Map(dates.map((d, i) => [d, i]))
  const days: Record<DataTier, number> = { real: 0, filled: 0, simulated: 0 }
  for (const s of segments) days[s.tier] += (index.get(s.end) ?? 0) - (index.get(s.start) ?? 0) + 1
  const n = dates.length || 1
  return { real: days.real / n, filled: days.filled / n, simulated: days.simulated / n }
}
