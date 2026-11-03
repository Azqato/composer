// ─── Synthetic-engine extensions (roadmap item 13) ────────────────────────────
// synthetic-map.json extends tickers that Crescendo's letf-map.json leaves at their real start,
// for the Synthetic engine only (the Crescendo-compatible engine keeps Crescendo's history).
// An entry extends a ticker with one `underlying` (1×) or a fixed-weight `blend` of series.
// `calibrate` adds a constant daily return so the extension compounds to the ticker's own total
// over the days both exist: it removes the average drift, not drift that changes over time.
import type { PriceSeries } from '../types'
import { loadDataText } from './staticFile'

export interface SyntheticEntry {
  ticker: string
  underlying?: string
  blend?: Record<string, number>
  calibrate?: boolean
}

let mapCache: Promise<SyntheticEntry[]> | null = null
export function findSyntheticEntry(ticker: string): Promise<SyntheticEntry | null> {
  mapCache ??= loadDataText('syntheticMap').then(t => JSON.parse(t) as SyntheticEntry[])
  return mapCache.then(m => m.find(e => e.ticker === ticker) ?? null)
}

/** A daily-rebalanced blend of the series, on the days all of them have prices. */
export function blendSeries(parts: { series: PriceSeries; weight: number }[]): PriceSeries {
  const maps = parts.map(p => new Map(p.series.map(x => [x.date, x.adjClose])))
  const dates = parts[0].series.map(p => p.date).filter(d => maps.every(m => m.has(d)))
  const out: PriceSeries = []
  let v = 1000
  dates.forEach((d, i) => {
    if (i > 0) {
      const prev = dates[i - 1]
      v *= 1 + parts.reduce((s, p, j) => s + p.weight * (maps[j].get(d)! / maps[j].get(prev)! - 1), 0)
    }
    out.push({ date: d, adjClose: v })
  })
  return out
}

/**
 * The extension with a constant daily drift added, so that over the days it shares with `real`
 * it grows exactly as much as `real` does. Returns the drift too (per year, for the log).
 */
export function calibrateDrift(real: PriceSeries, ext: PriceSeries): { series: PriceSeries; perYear: number } {
  const e = new Map(ext.map(p => [p.date, p.adjClose]))
  const shared = real.filter(p => e.has(p.date) && p.adjClose > 0 && e.get(p.date)! > 0)
  if (shared.length < 252) return { series: ext, perYear: 0 }
  const a = shared[0], b = shared[shared.length - 1]
  const days = ext.findIndex(p => p.date === b.date) - ext.findIndex(p => p.date === a.date)
  const d = (Math.log(b.adjClose / a.adjClose) - Math.log(e.get(b.date)! / e.get(a.date)!)) / days
  const series = ext.map((p, i) => ({ date: p.date, adjClose: p.adjClose * Math.exp(d * i) }))
  return { series, perYear: Math.exp(d * 252) - 1 }
}
