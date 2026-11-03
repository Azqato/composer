import type { BacktestMetrics } from '../types'
import {
  computeDrawdowns, currentDrawdown, maxDrawdown,
  longestDrawdownDays, avgDrawdown, avgDrawdownDays
} from './drawdown'

// ─── Statistical helpers ──────────────────────────────────────────────────────

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function stddev(arr: number[], ddof = 1): number {
  const m = mean(arr)
  const v = arr.reduce((a, b) => a + (b - m) ** 2, 0) / (arr.length - ddof)
  return Math.sqrt(v)
}

function percentile(sorted: number[], p: number): number {
  const idx = p * (sorted.length - 1)
  const lo = Math.floor(idx), hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (idx - lo) * (sorted[hi] - sorted[lo])
}

/** Normal CDF via Abramowitz & Stegun approximation */
function normcdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x))
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  const d = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
  const p = 1 - d * poly
  return x >= 0 ? p : 1 - p
}

// ─── Annualization ────────────────────────────────────────────────────────────

const TRADING_DAYS = 252

function cagr(startVal: number, endVal: number, nTradingDays: number): number {
  if (nTradingDays <= 0 || startVal <= 0) return 0
  return Math.pow(endVal / startVal, TRADING_DAYS / nTradingDays) - 1
}

// ─── Period slicing helpers ───────────────────────────────────────────────────

function valuesFromDate(dates: string[], values: number[], fromDate: string): number[] {
  const i = dates.findIndex(d => d >= fromDate)
  return i < 0 ? [] : values.slice(i)
}

function dateNMonthsAgo(refDate: string, months: number): string {
  const d = new Date(refDate)
  d.setMonth(d.getMonth() - months)
  return d.toISOString().split('T')[0]
}

function dateNYearsAgo(refDate: string, years: number): string {
  const d = new Date(refDate)
  d.setFullYear(d.getFullYear() - years)
  return d.toISOString().split('T')[0]
}

function startOfYear(refDate: string): string {
  return refDate.slice(0, 4) + '-01-01'
}

function startOfMonth(refDate: string): string {
  return refDate.slice(0, 7) + '-01'
}

// ─── Monthly / annual returns ─────────────────────────────────────────────────

export type Frequency = 'week' | 'month' | 'quarter' | 'year'

// Matches Crescendo's Frequency.periodKey. Dates are exchange-calendar YYYY-MM-DD strings, so no timezone shift.
export function periodKey(date: string, freq: Frequency): string {
  switch (freq) {
    case 'month': return date.slice(0, 7)
    case 'quarter': return `${date.slice(0, 4)}-Q${Math.ceil(parseInt(date.slice(5, 7)) / 3)}`
    case 'year': return date.slice(0, 4)
    case 'week': {
      // ISO week-based year and week number
      const d = new Date(date + 'T00:00:00Z')
      const day = d.getUTCDay() || 7
      d.setUTCDate(d.getUTCDate() + 4 - day)
      const isoYear = d.getUTCFullYear()
      const week = Math.ceil(((d.getTime() - Date.UTC(isoYear, 0, 1)) / 86400000 + 1) / 7)
      return `${isoYear}-W${String(week).padStart(2, '0')}`
    }
  }
}

// Each daily return is compounded into the period of the day it is realized on (Crescendo's
// BacktestResults.computePeriodReturns), so a period runs from the prior period's last close to its own.
export function computePeriodReturns(dates: string[], values: number[], freq: Frequency): Record<string, number> {
  const growth: Record<string, number> = {}
  for (let i = 1; i < dates.length; i++) {
    const r = values[i] / values[i - 1] - 1
    if (!Number.isFinite(r)) continue
    const key = periodKey(dates[i], freq)
    growth[key] = (growth[key] ?? 1) * (1 + r)
  }
  const out: Record<string, number> = {}
  for (const [k, g] of Object.entries(growth)) if (Number.isFinite(g - 1)) out[k] = g - 1
  return out
}

export function computeMonthlyReturns(dates: string[], values: number[]): Record<string, number> {
  return computePeriodReturns(dates, values, 'month')
}

export function computeEoyReturns(dates: string[], values: number[]): Record<string, number> {
  return computePeriodReturns(dates, values, 'year')
}

// Geometric mean period return (ReturnStatistics.expectedMonthlyFromReturns / expectedYearlyFromReturns)
function geometricMean(rets: number[]): number {
  if (rets.length === 0) return 0
  return Math.pow(rets.reduce((g, r) => g * (1 + r), 1), 1 / rets.length) - 1
}

// ─── Main metrics computation ─────────────────────────────────────────────────

export function computeMetrics(
  dates: string[],
  portfolioValues: number[],
  benchmarkValues: number[],
  dailyReturns: number[],
  benchmarkDailyReturns: number[],
  riskFreeAnnual: number,
): BacktestMetrics {
  const n = dates.length
  const lastDate = dates[n - 1]
  const nDays = n - 1

  // Risk-free daily rate
  const rfDaily = Math.pow(1 + riskFreeAnnual, 1 / TRADING_DAYS) - 1

  // ── Basic returns ──
  const totalReturn = portfolioValues[n - 1] / portfolioValues[0] - 1
  const benchmarkTotalReturn = benchmarkValues[n - 1] / benchmarkValues[0] - 1
  const cagrVal = cagr(portfolioValues[0], portfolioValues[n - 1], nDays)
  const excessReturn = totalReturn - benchmarkTotalReturn
  const excessCagr = cagrVal - riskFreeAnnual

  // ── Volatility ──
  const vol = stddev(dailyReturns) * Math.sqrt(TRADING_DAYS)
  const stdDevVal = stddev(dailyReturns)

  // ── Excess returns for Sharpe/Sortino ──
  const excessDaily = dailyReturns.map(r => r - rfDaily)
  const excessMean = mean(excessDaily)
  const excessStd = stddev(excessDaily)

  const sharpe = excessStd === 0 ? 0 : (excessMean * TRADING_DAYS) / (excessStd * Math.sqrt(TRADING_DAYS))

  // Smart Sharpe: deflate by autocorrelation penalty
  const ac1 = autocorrelation1(dailyReturns)
  const acPenalty = Math.sqrt(Math.max(0, 1 - 2 * ac1 + ac1 * ac1))
  const smartSharpe = acPenalty === 0 ? sharpe : sharpe * acPenalty

  // Sortino: downside deviation
  const negExcess = excessDaily.filter(r => r < 0)
  const downsideDev = negExcess.length < 2 ? 0 :
    Math.sqrt(negExcess.reduce((a, b) => a + b * b, 0) / negExcess.length * TRADING_DAYS)
  const sortino = downsideDev === 0 ? 0 : (excessMean * TRADING_DAYS) / downsideDev
  const smartSortino = sortino * acPenalty
  const sortinoSqrt2 = sortino / Math.SQRT2
  const smartSortinoSqrt2 = smartSortino / Math.SQRT2

  // ── Drawdowns ──
  const { underwater, periods } = computeDrawdowns(dates, portfolioValues)
  const { depth: currDDDepth, days: currDDDays } = currentDrawdown(underwater)
  const maxDD = maxDrawdown(underwater)
  const maxDDDays = periods.find(p => p.depth === maxDD)?.durationDays ?? 0
  const longestDD = longestDrawdownDays(periods)
  const avgDD = avgDrawdown(periods)
  const avgDDDays = avgDrawdownDays(periods)

  // ── Risk-adjusted ──
  const romad = maxDD === 0 ? 0 : cagrVal / Math.abs(maxDD)
  const calmar = romad
  const recoveryFactor = maxDD === 0 ? 0 : totalReturn / Math.abs(maxDD)
  const ulcerIndex = Math.sqrt(underwater.reduce((a, b) => a + b * b, 0) / n)
  const serenityIndex = ulcerIndex === 0 ? 0 : excessCagr / ulcerIndex

  // ── Omega ──
  const threshold = rfDaily
  const gains = excessDaily.filter(r => r > 0).reduce((a, b) => a + b, 0)
  const losses = excessDaily.filter(r => r <= 0).reduce((a, b) => a - b, 0)
  const omega = losses === 0 ? 999 : gains / losses

  // ── VaR and CVaR (95%) ──
  const sortedReturns = [...dailyReturns].sort((a, b) => a - b)
  const var95idx = Math.floor(0.05 * sortedReturns.length)
  const dailyVaR95 = -sortedReturns[var95idx]
  const cvarSlice = sortedReturns.slice(0, var95idx + 1)
  const expectedShortfall = cvarSlice.length === 0 ? dailyVaR95 : -mean(cvarSlice)

  // ── Probabilistic Sharpe ──
  const skew = computeSkew(dailyReturns)
  const kurt = computeKurtosis(dailyReturns)
  const probSharpeZ = sharpe * Math.sqrt(nDays) /
    Math.sqrt(Math.max(1e-10, 1 - skew * sharpe + ((kurt - 1) / 4) * sharpe * sharpe))
  const probSharpe = normcdf(probSharpeZ)

  // ── Relative metrics ──
  const benchmarkExcessCagr = cagr(benchmarkValues[0], benchmarkValues[n - 1], nDays) - riskFreeAnnual
  const { alpha, beta, correlation, rSquared, infoRatio } = computeRelativeMetrics(
    dailyReturns, benchmarkDailyReturns, rfDaily, cagrVal,
    cagr(benchmarkValues[0], benchmarkValues[n - 1], nDays)
  )

  // ── Win/loss stats ──
  const winDays = dailyReturns.filter(r => r > 0).length
  const lossDays = dailyReturns.filter(r => r < 0).length
  const nonZeroDays = winDays + lossDays
  const winDaysPct = nonZeroDays === 0 ? 0 : winDays / nonZeroDays

  const posExcessDays = excessDaily.filter(r => r > 0)
  const negExcessDays = excessDaily.filter(r => r < 0)
  const winRatio = negExcessDays.length === 0 ? 999 :
    (posExcessDays.reduce((a, b) => a + b, 0) / posExcessDays.length) /
    Math.abs(negExcessDays.reduce((a, b) => a + b, 0) / negExcessDays.length)
  const profitFactor = losses === 0 ? 999 : gains / losses

  // Monthly stats
  const monthlyRets = Object.values(computeMonthlyReturns(dates, portfolioValues))
  const posMonths = monthlyRets.filter(r => r > 0)
  const negMonths = monthlyRets.filter(r => r < 0)
  const winMonthPct = monthlyRets.length === 0 ? 0 : posMonths.length / monthlyRets.length
  const avgUpMonth = posMonths.length === 0 ? 0 : mean(posMonths)
  const avgDownMonth = negMonths.length === 0 ? 0 : mean(negMonths)

  // Quarterly stats
  const qReturns = Object.values(computePeriodReturns(dates, portfolioValues, 'quarter'))
  const winQuarterPct = qReturns.length === 0 ? 0 : qReturns.filter(r => r > 0).length / qReturns.length

  // Yearly stats
  const yearlyRets = Object.values(computeEoyReturns(dates, portfolioValues))
  const winYearPct = yearlyRets.length === 0 ? 0 : yearlyRets.filter(r => r > 0).length / yearlyRets.length

  // Best/worst
  const bestDay = Math.max(...dailyReturns)
  const worstDay = Math.min(...dailyReturns)
  const bestMonth = monthlyRets.length > 0 ? Math.max(...monthlyRets) : 0
  const worstMonth = monthlyRets.length > 0 ? Math.min(...monthlyRets) : 0
  const bestYear = yearlyRets.length > 0 ? Math.max(...yearlyRets) : 0
  const worstYear = yearlyRets.length > 0 ? Math.min(...yearlyRets) : 0

  const expectedDaily = mean(dailyReturns)
  const expectedMonthly = geometricMean(monthlyRets)
  const expectedYearly = geometricMean(yearlyRets)

  // Trailing period returns
  const trailing = (months?: number, years?: number, isYTD?: boolean, isMTD?: boolean) => {
    let fromDate: string
    if (isMTD) fromDate = startOfMonth(lastDate)
    else if (isYTD) fromDate = startOfYear(lastDate)
    else if (years != null) fromDate = dateNYearsAgo(lastDate, years)
    else fromDate = dateNMonthsAgo(lastDate, months!)
    const slice = valuesFromDate(dates, portfolioValues, fromDate)
    return slice.length < 2 ? 0 : slice[slice.length - 1] / slice[0] - 1
  }

  // ── Further ratios (QuantStats definitions) ──
  const z95 = 1.6448536
  const srDaily = excessStd === 0 ? 0 : excessMean / excessStd
  const minTrackRecordYears = srDaily <= 0 ? Infinity :
    (1 + (1 - skew * srDaily + ((kurt - 1) / 4) * srDaily * srDaily) * (z95 / srDaily) ** 2) / TRADING_DAYS
  const treynor = beta === 0 ? 0 : (cagrVal - riskFreeAnnual) / beta
  const posDays = dailyReturns.filter(r => r > 0), negDays = dailyReturns.filter(r => r < 0)
  const negSum = -negDays.reduce((a, b) => a + b, 0)
  const gainPain = negSum === 0 ? 999 : dailyReturns.reduce((a, b) => a + b, 0) / negSum
  const p05 = percentile(sortedReturns, 0.05), p95 = percentile(sortedReturns, 0.95)
  const tailRatio = p05 === 0 ? 0 : Math.abs(p95 / p05)
  const payoffRatio = posDays.length === 0 || negDays.length === 0 ? 0 : mean(posDays) / Math.abs(mean(negDays))
  const winRate = winDaysPct
  const commonSense = profitFactor * tailRatio
  const cpcIndex = profitFactor * winRate * payoffRatio
  const nonNeg = dailyReturns.filter(r => r >= 0).sort((a, b) => a - b)
  const negSorted = [...negDays].sort((a, b) => a - b)
  const outlierWinRatio = nonNeg.length === 0 || mean(nonNeg) === 0 ? 0 : percentile(nonNeg, 0.99) / mean(nonNeg)
  const outlierLossRatio = negSorted.length === 0 ? 0 : percentile(negSorted, 0.01) / mean(negSorted)
  let maxConsecWins = 0, maxConsecLosses = 0, w = 0, l = 0
  for (const r of dailyReturns) {
    w = r > 0 ? w + 1 : 0; l = r < 0 ? l + 1 : 0
    if (w > maxConsecWins) maxConsecWins = w
    if (l > maxConsecLosses) maxConsecLosses = l
  }
  const kelly = payoffRatio === 0 ? 0 : winRate - (1 - winRate) / payoffRatio
  const riskOfRuin = Math.pow((1 - winRate) / (1 + winRate), dailyReturns.length)

  return {
    treynor, minTrackRecordYears, gainPain, tailRatio, commonSense, cpcIndex, payoffRatio,
    outlierWinRatio, outlierLossRatio,
    monthlySkew: monthlyRets.length > 2 ? computeSkew(monthlyRets) : 0,
    monthlyKurtosis: monthlyRets.length > 3 ? computeKurtosis(monthlyRets) : 0,
    maxConsecWins, maxConsecLosses, kelly, riskOfRuin,
    totalReturn, cagr: cagrVal, excessReturn, excessCagr,
    sharpe, smartSharpe, sortino, smartSortino, sortinoSqrt2, smartSortinoSqrt2,
    romad, calmar, omega, ulcerIndex, serenityIndex, probSharpe,
    maxDrawdown: maxDD, maxDrawdownDays: maxDDDays,
    longestDrawdownDays: longestDD,
    avgDrawdown: avgDD, avgDrawdownDays: avgDDDays,
    currentDrawdown: currDDDepth, currentDrawdownDays: currDDDays,
    annualizedVol: vol, stdDev: stdDevVal,
    dailyVaR95, expectedShortfall, recoveryFactor,
    alpha, beta, correlation, rSquared, informationRatio: infoRatio,
    skew, kurtosis: kurt,
    timeInMarket: 1,
    winDays, lossDays, winDaysPct,
    winMonthPct, winQuarterPct, winYearPct,
    winRatio, profitFactor,
    avgUpMonth, avgDownMonth, avgChurn: 0, medianChurn: 0,
    mtd: trailing(undefined, undefined, undefined, true),
    t3m: trailing(3), t6m: trailing(6),
    ytd: trailing(undefined, undefined, true),
    t1y: trailing(undefined, 1), t3y: trailing(undefined, 3),
    t5y: trailing(undefined, 5), t10y: trailing(undefined, 10),
    bestDay, worstDay, bestMonth, worstMonth, bestYear, worstYear,
    expectedDaily, expectedMonthly, expectedYearly,
  }
}

function computeRelativeMetrics(
  stratReturns: number[], benchReturns: number[],
  rfDaily: number, stratCAGR: number, benchCAGR: number
) {
  const n = Math.min(stratReturns.length, benchReturns.length)
  if (n < 2) return { alpha: 0, beta: 0, correlation: 0, rSquared: 0, infoRatio: 0 }

  const s = stratReturns.slice(0, n)
  const b = benchReturns.slice(0, n)

  const ms = mean(s), mb = mean(b)
  let covSB = 0, varB = 0, varS = 0
  for (let i = 0; i < n; i++) {
    covSB += (s[i] - ms) * (b[i] - mb)
    varB += (b[i] - mb) ** 2
    varS += (s[i] - ms) ** 2
  }
  covSB /= n - 1; varB /= n - 1; varS /= n - 1

  const beta = varB === 0 ? 0 : covSB / varB
  const correlation = (varS === 0 || varB === 0) ? 0 : covSB / Math.sqrt(varS * varB)
  const rSquared = correlation ** 2
  const alpha = stratCAGR - (rfDaily * TRADING_DAYS + beta * (benchCAGR - rfDaily * TRADING_DAYS))

  const diffs = s.map((r, i) => r - b[i])
  const trackingError = stddev(diffs) * Math.sqrt(TRADING_DAYS)
  const infoRatio = trackingError === 0 ? 0 : (stratCAGR - benchCAGR) / trackingError

  return { alpha, beta, correlation, rSquared, infoRatio }
}

function computeSkew(arr: number[]): number {
  const m = mean(arr), s = stddev(arr, 0)
  if (s === 0) return 0
  return arr.reduce((a, b) => a + ((b - m) / s) ** 3, 0) / arr.length
}

function computeKurtosis(arr: number[]): number {
  const m = mean(arr), s = stddev(arr, 0)
  if (s === 0) return 0
  return arr.reduce((a, b) => a + ((b - m) / s) ** 4, 0) / arr.length
}

/** Lag-1 autocorrelation of a return series (Pearson correlation of r[t-1] with r[t]). */
export function autocorrelation1(returns: number[]): number {
  const n = returns.length
  if (n < 3) return 0
  const a = returns.slice(0, -1), b = returns.slice(1)
  const ma = a.reduce((s, x) => s + x, 0) / a.length
  const mb = b.reduce((s, x) => s + x, 0) / b.length
  let cov = 0, va = 0, vb = 0
  for (let i = 0; i < a.length; i++) {
    cov += (a[i] - ma) * (b[i] - mb)
    va += (a[i] - ma) ** 2
    vb += (b[i] - mb) ** 2
  }
  return va > 0 && vb > 0 ? cov / Math.sqrt(va * vb) : 0
}
