// ─── The report's right column: KPIs and metric groups, shared by the app and the exported report ─
import type { BacktestMetrics, DrawdownPeriod, ContributionRow } from '../types'
import { computeDrawdowns } from '../engine/drawdown'

type Value = (m: BacktestMetrics, riskFreeRate: number) => string
export interface MetricRow { label: string; value: Value; tip: string; relative?: boolean }
export interface MetricGroup { title: string; rows: MetricRow[] }

/** Rows shown before "Show More" */
export const VISIBLE_ROWS = 6

export function pct(v: number): string {
  return isFinite(v) ? (v * 100).toFixed(2) + '%' : '—'
}
export function fmt(v: number): string {
  if (!isFinite(v)) return '—'
  if (v > 999) return '>999'
  if (v < -999) return '<-999'
  return v.toFixed(2)
}
const int = (v: number) => isFinite(v) ? Math.round(v).toLocaleString() : '—'
const r = (label: string, value: Value, tip: string, relative = false): MetricRow => ({ label, value, tip, relative })

export const KPIS: [string, Value][] = [
  ['Max Drawdown', m => pct(m.maxDrawdown)], ['Longest DD Days', m => int(m.longestDrawdownDays)],
  ['RoMaD', m => fmt(m.romad)], ['Calmar', m => fmt(m.calmar)],
  ['Alpha', m => fmt(m.alpha)], ['Beta', m => fmt(m.beta)],
  ['Correlation', m => fmt(m.correlation)], ['R²', m => fmt(m.rSquared)],
  ['Information Ratio', m => fmt(m.informationRatio)], ['Treynor', m => fmt(m.treynor)],
  ['Risk Free Rate', (_, rf) => pct(rf)],
]

export const METRIC_GROUPS: MetricGroup[] = [
  { title: 'Returns', rows: [
    r('CAGR', m => pct(m.cagr), 'Compound annual growth rate'),
    r('YTD', m => pct(m.ytd), 'Return since the start of the last year in the test'),
    r('Total Return', m => pct(m.totalReturn), 'Growth over the whole test'),
    r('Excess Return', m => pct(m.excessReturn), 'Total return minus the benchmark total return', true),
    r('Excess CAGR', m => pct(m.excessCagr), 'CAGR minus the risk-free rate'),
    r('MTD', m => pct(m.mtd), 'Return since the start of the last month'),
    r('Trailing 3M', m => pct(m.t3m), 'Return over the last 3 months'),
    r('Trailing 6M', m => pct(m.t6m), 'Return over the last 6 months'),
    r('Trailing 1Y', m => pct(m.t1y), 'Return over the last year'),
    r('Trailing 3Y', m => pct(m.t3y), 'Return over the last 3 years'),
    r('Trailing 5Y', m => pct(m.t5y), 'Return over the last 5 years'),
    r('Trailing 10Y', m => pct(m.t10y), 'Return over the last 10 years'),
  ] },
  { title: 'Drawdown', rows: [
    r('Current DD', m => pct(m.currentDrawdown), 'Distance below the last high'),
    r('Max DD', m => pct(m.maxDrawdown), 'Largest fall from a high'),
    r('Current DD Days', m => int(m.currentDrawdownDays), 'Trading days since the last high'),
    r('Max DD Days', m => int(m.maxDrawdownDays), 'Length of the largest drawdown, in trading days'),
    r('Longest DD', m => int(m.longestDrawdownDays), 'Longest time below a high, in trading days'),
    r('Avg DD', m => pct(m.avgDrawdown), 'Average depth of all drawdowns'),
    r('Avg DD Days', m => int(m.avgDrawdownDays), 'Average length of all drawdowns'),
  ] },
  { title: 'Risk-Adjusted', rows: [
    r('Sharpe', m => fmt(m.sharpe), 'Annual excess return per unit of volatility'),
    r('Sortino', m => fmt(m.sortino), 'Annual excess return per unit of downside volatility'),
    r('Calmar', m => fmt(m.calmar), 'CAGR divided by the max drawdown'),
    r('Prob. Sharpe Ratio', m => pct(m.probSharpe), 'Probability the true Sharpe is above zero'),
    r('Min Track Record (yrs)', m => fmt(m.minTrackRecordYears), 'Years of history needed to trust the Sharpe at 95%'),
    r('Smart Sharpe', m => fmt(m.smartSharpe), 'Sharpe with an autocorrelation penalty'),
    r('Smart Sortino', m => fmt(m.smartSortino), 'Sortino with an autocorrelation penalty'),
    r('Sortino/√2', m => fmt(m.sortinoSqrt2), 'Sortino scaled to compare with Sharpe'),
    r('Smart Sortino/√2', m => fmt(m.smartSortinoSqrt2), 'Smart Sortino scaled to compare with Sharpe'),
    r('Omega', m => fmt(m.omega), 'Gains above the risk-free rate over losses below it'),
    r('Serenity Index', m => fmt(m.serenityIndex), 'Excess CAGR over the Ulcer Index'),
    r('Recovery Factor', m => fmt(m.recoveryFactor), 'Total return over the max drawdown'),
    r('Gain/Pain', m => fmt(m.gainPain), 'Sum of daily returns over the sum of daily losses'),
    r('Common Sense Ratio', m => fmt(m.commonSense), 'Profit factor times tail ratio'),
    r('CPC Index', m => fmt(m.cpcIndex), 'Profit factor × win rate × payoff ratio'),
    r('Profit Factor', m => fmt(m.profitFactor), 'Gross gains over gross losses'),
  ] },
  { title: 'Volatility', rows: [
    r('Volatility', m => pct(m.annualizedVol), 'Annualized standard deviation of daily returns'),
    r('Daily VaR', m => pct(m.dailyVaR95), 'Daily loss not exceeded on 95% of days'),
    r('Ulcer Index', m => fmt(m.ulcerIndex), 'Depth and length of drawdowns combined'),
    r('Std Dev', m => pct(m.stdDev), 'Standard deviation of daily returns'),
    r('Skew', m => fmt(m.skew), 'Asymmetry of daily returns'),
    r('Kurtosis', m => fmt(m.kurtosis), 'Fatness of the tails of daily returns'),
    r('Monthly Skew', m => fmt(m.monthlySkew), 'Asymmetry of monthly returns'),
    r('Monthly Kurtosis', m => fmt(m.monthlyKurtosis), 'Fatness of the tails of monthly returns'),
    r('cVaR', m => pct(m.expectedShortfall), 'Average loss on the worst 5% of days'),
    r('Tail Ratio', m => fmt(m.tailRatio), '95th percentile day over the 5th percentile day'),
  ] },
  { title: 'Return Distribution', rows: [
    r('Best Year', m => pct(m.bestYear), 'Best calendar year'),
    r('Worst Year', m => pct(m.worstYear), 'Worst calendar year'),
    r('Expected Daily %', m => pct(m.expectedDaily), 'Average daily return'),
    r('Expected Monthly %', m => pct(m.expectedMonthly), 'Geometric average monthly return'),
    r('Expected Yearly %', m => pct(m.expectedYearly), 'Geometric average yearly return'),
    r('Best Day', m => pct(m.bestDay), 'Best single day'),
    r('Worst Day', m => pct(m.worstDay), 'Worst single day'),
    r('Best Month', m => pct(m.bestMonth), 'Best calendar month'),
    r('Worst Month', m => pct(m.worstMonth), 'Worst calendar month'),
    r('Avg Up Month', m => pct(m.avgUpMonth), 'Average of the winning months'),
    r('Avg Down Month', m => pct(m.avgDownMonth), 'Average of the losing months'),
    r('Outlier Win Ratio', m => fmt(m.outlierWinRatio), '99th percentile up day over the average up day'),
    r('Outlier Loss Ratio', m => fmt(m.outlierLossRatio), '1st percentile down day over the average down day'),
  ] },
  { title: 'Trade Activity', rows: [
    r('Time in Market', m => pct(m.timeInMarket), 'Share of days invested'),
    r('Win Days %', m => pct(m.winDaysPct), 'Share of up days among days that moved'),
    r('Win Ratio', m => fmt(m.winRatio), 'Average excess gain over average excess loss'),
    r('Win Days', m => int(m.winDays), 'Up days'),
    r('Loss Days', m => int(m.lossDays), 'Down days'),
    r('Win Month %', m => pct(m.winMonthPct), 'Share of up months'),
    r('Win Quarter %', m => pct(m.winQuarterPct), 'Share of up quarters'),
    r('Win Year %', m => pct(m.winYearPct), 'Share of up years'),
    r('Payoff Ratio', m => fmt(m.payoffRatio), 'Average up day over average down day'),
    r('Max Consecutive Wins', m => int(m.maxConsecWins), 'Longest run of up days'),
    r('Max Consecutive Losses', m => int(m.maxConsecLosses), 'Longest run of down days'),
    r('Kelly', m => pct(m.kelly), 'Kelly criterion bet size from win rate and payoff'),
    r('Risk of Ruin', m => pct(m.riskOfRuin), 'Chance of losing everything at this win rate'),
    r('Average Churn %', m => pct(m.avgChurn), 'Average share of the portfolio traded per day'),
    r('Median Churn %', m => pct(m.medianChurn), 'Median share of the portfolio traded per day'),
  ] },
]

/** Worst drawdown periods, deepest first */
export const DRAWDOWN_ROWS = 50
export function worstDrawdowns(periods: DrawdownPeriod[]): DrawdownPeriod[] {
  return [...periods].sort((a, b) => a.depth - b.depth).slice(0, DRAWDOWN_ROWS)
}
export function benchmarkDrawdowns(dates: string[], benchmarkValues: number[]): DrawdownPeriod[] {
  return worstDrawdowns(computeDrawdowns(dates, benchmarkValues).periods)
}

/**
 * Contributions as shares: each ticker's part of all gains, all losses and the net profit.
 * The raw sums are in multiples of the starting capital and compound into unreadable numbers.
 */
export const CONTRIBUTION_HEAD = ['Ticker', 'Share of Gains', 'Share of Losses', 'Share of Profit']
export const CONTRIBUTION_TIP = "Each ticker's part of all the gains, all the losses and the net profit. Shares of profit add up to 100%; a negative share means the ticker lost money overall"
export function contributionRows(rows: ContributionRow[]): string[][] {
  const sum = (f: (c: ContributionRow) => number) => rows.reduce((a, c) => a + f(c), 0)
  const g = sum(c => c.gains), l = sum(c => c.losses), t = sum(c => c.total)
  const share = (v: number, of: number) => of === 0 ? '—' : pct(v / of)
  return rows.map(c => [c.ticker, share(c.gains, g), share(c.losses, l), share(c.total, t)])
}
