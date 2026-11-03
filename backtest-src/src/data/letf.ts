import type { LetfEntry, PriceSeries } from '../types'
import { loadDataText } from './staticFile'

// ─── Leveraged-fund history extension (Crescendo's LetfSimulator + TickerCache.resolveExtensions) ──
// letf-map.json (Crescendo's LetfMap.json) maps a ticker to the series that extends its history
// back in time: `leverage` × `underlying`. For a leverage other than 1 the fund is simulated
// day by day from its underlying, with financing and expense costs fitted to the days both
// have real prices. `cutoffDate` drops the fund's own prices before that date (thin or recycled
// early data) so the simulation is used there instead.

let letfMapCache: LetfEntry[] | null = null

export async function loadLetfMap(): Promise<LetfEntry[]> {
  if (letfMapCache) return letfMapCache
  letfMapCache = JSON.parse(await loadDataText('letfMap')) as LetfEntry[]
  return letfMapCache
}

export function findLetfEntry(ticker: string, letfMap: LetfEntry[]): LetfEntry | null {
  return letfMap.find(e => e.ticker === ticker) ?? null
}

/** Fitted costs: daily return = L·r − swap·|L−1|·(cash + spread/252) − expenseRatio/252 */
export interface LeverageParameters { swapExposure: number; spread: number; expenseRatio: number }

export const NO_COSTS: LeverageParameters = { swapExposure: 0, spread: 0, expenseRatio: 0 }

/**
 * Least-squares fit (no intercept) of the fund's excess return over L × the underlying's,
 * against −|L−1|·cash return and −1/252. Days where the underlying moves more than 10%, or the
 * fund strays more than 20% from L× (or 10 points), are left out.
 */
export function estimateParameters(
  fund: PriceSeries, underlying: PriceSeries, leverage: number, cash: PriceSeries
): LeverageParameters {
  const u = toMap(underlying), c = toMap(cash)
  const days = fund.filter(p => u.has(p.date) && c.has(p.date))
  if (days.length < 10) throw new Error(`only ${days.length} days shared with the underlying and cash`)
  const L = leverage, lev = Math.abs(L - 1)
  let sxx = 0, sxy = 0, syy = 0, sx1 = 0, sy1 = 0, count = 0
  for (let i = 0; i < days.length - 1; i++) {
    const a = days[i], b = days[i + 1]
    const f0 = a.adjClose, f1 = b.adjClose
    const u0 = u.get(a.date)!, u1 = u.get(b.date)!
    const c0 = c.get(a.date)!, c1 = c.get(b.date)!
    if (!(f0 > 0 && f1 > 0 && u0 > 0 && u1 > 0 && c0 > 0 && c1 > 0)) continue
    const rf = f1 / f0 - 1, ru = u1 / u0 - 1, rc = c1 / c0 - 1
    if (Math.abs(ru) > 0.1) continue
    const ratio = ru !== 0 ? rf / ru : 0
    if ((ru !== 0 && Math.abs(ratio - L) > Math.abs(L) * 0.2) || Math.abs(rf - L * ru) > 0.1) continue
    const y = rf - L * ru
    const x1 = -lev * rc, x2 = -1 / 252
    sxx += x1 * x1; sxy += x1 * x2; syy += x2 * x2; sx1 += x1 * y; sy1 += x2 * y; count++
  }
  if (count < 10) throw new Error(`too few usable days (${count})`)

  // Normal equations for two regressors
  const det = sxx * syy - sxy * sxy
  let swap: number, drag: number
  if (Math.abs(det) < 1e-300 || !Number.isFinite(det)) {
    swap = 1; drag = 0.01   // Crescendo's fallback when the fit is singular
  } else {
    swap = (sx1 * syy - sy1 * sxy) / det
    drag = (sxx * sy1 - sxy * sx1) / det
  }
  // drag = expense ratio + swap·spread·|L−1|; assume a 0.5% spread unless that leaves a negative ER
  let spread = 0.005
  let er = drag - swap * spread * lev
  if (er < 0) {
    er = 0
    spread = swap !== 0 && lev !== 0 ? drag / (swap * lev) : 0
  }
  return { swapExposure: swap, spread, expenseRatio: er }
}

/** Simulated fund prices from its underlying, on the days the underlying and cash both have. */
export function simulateLetf(
  underlying: PriceSeries, leverage: number, p: LeverageParameters, cash: PriceSeries
): PriceSeries {
  const c = toMap(cash)
  const days = underlying.filter(x => c.has(x.date))
  if (days.length < 2) return []
  const er = p.expenseRatio / 252, lev = Math.abs(leverage - 1)
  let out: PriceSeries = [{ date: days[0].date, adjClose: 1000 }]
  let v = 1000
  for (let i = 0; i < days.length - 1; i++) {
    const u0 = days[i].adjClose, u1 = days[i + 1].adjClose
    const c0 = c.get(days[i].date)!, c1 = c.get(days[i + 1].date)!
    const ru = u1 / u0 - 1
    const rc = c0 > 0 && c1 > 0 ? c1 / c0 - 1 : 0
    const financing = p.swapExposure * lev * (rc + p.spread / 252)
    const next = v * (1 + leverage * ru - financing - er)
    if (!(next > 0) || !Number.isFinite(next)) {
      // Wiped out: restart the series from here, as Crescendo does
      v = 1000
      out = [{ date: days[i + 1].date, adjClose: v }]
      continue
    }
    v = next
    out.push({ date: days[i + 1].date, adjClose: v })
  }
  return out
}

/** Drops the start of a history up to the first stretch of flat (untraded) closes. */
export function trimThinTrading(series: PriceSeries): PriceSeries {
  const c = series.map(p => p.adjClose)
  const flat = (i: number) => c[i] === c[i - 1]
  for (let n = 5; n < c.length; n++) {
    if (flat(n) && flat(n - 1) && flat(n - 2) && flat(n - 3) && flat(n - 4)) return series.slice(n + 1)
  }
  for (let n = 19; n < c.length; n++) {
    let k = 0
    for (let i = n - 18; i <= n; i++) if (flat(i)) k++
    if (k >= 10) return series.slice(n + 1)
  }
  return series
}

/**
 * Prepends the extension's days before the real history starts, scaled so the two agree on
 * the first day they share (Crescendo's computeScaleFactor).
 */
export function mergeWithSimExtension(liveData: PriceSeries, simData: PriceSeries): PriceSeries {
  if (simData.length === 0) return liveData
  if (liveData.length === 0) return simData

  const liveStart = liveData[0].date
  const simBefore = simData.filter(p => p.date < liveStart)
  if (simBefore.length === 0) return liveData

  const sim = toMap(simData)
  let scale = NaN
  for (const p of liveData) {
    const s = sim.get(p.date)
    if (s != null && s > 0 && Number.isFinite(p.adjClose / s)) { scale = p.adjClose / s; break }
  }
  // No shared day: join the last simulated close to the first real one
  if (!Number.isFinite(scale)) {
    const last = simBefore[simBefore.length - 1].adjClose
    if (!(last > 0)) return liveData
    scale = liveData[0].adjClose / last
  }
  return [...simBefore.map(p => ({ date: p.date, adjClose: p.adjClose * scale })), ...liveData]
}

function toMap(s: PriceSeries): Map<string, number> {
  const m = new Map<string, number>()
  for (const p of s) m.set(p.date, p.adjClose)
  return m
}
