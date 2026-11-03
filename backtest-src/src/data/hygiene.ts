// ─── Price hygiene: misprint repair (Crescendo's data.support.Misprints) ─────
// A close is a misprint when, on a day with no trades, the price moves at least 3%, the
// next day undoes at least 90% of it, and both moves are 4+ local standard deviations
// (from the median absolute log return of the half-year either side). It is replaced by the
// mean of the closes either side. Needs volumes; a series without them is left unchanged.
import type { PriceSeries } from '../types'

const MIN_MOVE = 0.03
const MIN_REVERSAL = 0.9
const MIN_SIGMAS = 4
const HALF_WINDOW = 126
const MIN_SAMPLES = 21
const MIN_VOLUME_COVERAGE = 0.25
const MAX_IDENTICAL_RUN = 15
const MEDIAN_ABS_TO_SIGMA = 1.4826

export interface Healed { date: string; was: number; now: number }

export function healMisprints(series: PriceSeries): { series: PriceSeries; healed: Healed[] } {
  if (!series.some(p => p.volume != null)) return { series, healed: [] }
  const closes = series.map(p => p.adjClose)
  const flags = flag(closes, series.map(p => p.volume ?? NaN))
  let fixed: number[] | null = null
  const healed: Healed[] = []
  for (let i = 1; i < closes.length - 1; i++) {
    if (!flags[i] || flags[i - 1] || flags[i + 1]) continue
    fixed ??= closes.slice()
    const mean = (fixed[i - 1] + fixed[i + 1]) / 2
    if (identicalRun(fixed, i, mean) > MAX_IDENTICAL_RUN) continue
    fixed[i] = mean
    healed.push({ date: series[i].date, was: closes[i], now: mean })
  }
  if (!fixed || healed.length === 0) return { series, healed }
  const f = fixed
  return { series: series.map((p, i) => (f[i] === p.adjClose ? p : { ...p, adjClose: f[i] })), healed }
}

function flag(c: number[], vol: number[]): boolean[] {
  const n = c.length
  const flags = new Array<boolean>(n).fill(false)
  if (n < 3) return flags
  const r = new Array<number>(n)
  r[0] = NaN
  for (let i = 1; i < n; i++) r[i] = c[i - 1] > 0 && c[i] > 0 ? Math.log(c[i] / c[i - 1]) : NaN
  for (let i = 1; i < n - 1; i++) {
    if (vol[i] !== 0) continue
    if (Math.abs(c[i] / c[i - 1] - 1) < MIN_MOVE) continue
    const a = r[i], b = r[i + 1]
    if (!(a * b < 0)) continue
    if (1 - Math.abs(a + b) / Math.abs(a) < MIN_REVERSAL) continue
    const sd = localSigma(r, i)
    if (!(sd > 0) || Math.abs(a) < MIN_SIGMAS * sd || Math.abs(b) < MIN_SIGMAS * sd) continue
    flags[i] = reportsVolume(vol, i)
  }
  return flags
}

function localSigma(r: number[], i: number): number {
  const xs: number[] = []
  for (let k = Math.max(1, i - HALF_WINDOW); k < Math.min(r.length, i + HALF_WINDOW); k++) {
    if (Math.abs(k - i) <= 2 || Number.isNaN(r[k])) continue
    xs.push(Math.abs(r[k]))
  }
  if (xs.length < MIN_SAMPLES) return NaN
  xs.sort((a, b) => a - b)
  const m = xs.length
  const median = m % 2 === 1 ? xs[m >> 1] : (xs[m / 2 - 1] + xs[m / 2]) / 2
  return MEDIAN_ABS_TO_SIGMA * median
}

// Only trust a zero-volume day on a ticker that usually reports volume
function reportsVolume(vol: number[], i: number): boolean {
  let days = 0, withVolume = 0
  for (let k = Math.max(0, i - HALF_WINDOW); k <= Math.min(vol.length - 1, i + HALF_WINDOW); k++) {
    if (k === i) continue
    days++
    if (vol[k] > 0) withVolume++
  }
  return days > 0 && withVolume >= MIN_VOLUME_COVERAGE * days
}

function identicalRun(c: number[], i: number, v: number): number {
  let run = 1
  for (let k = i - 1; k >= 0 && c[k] === v; k--) run++
  for (let k = i + 1; k < c.length && c[k] === v; k++) run++
  return run
}

