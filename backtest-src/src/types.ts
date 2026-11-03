import type { PageId } from './navigation'
// ─── Shared application types ───────────────────────────────────────────────

export interface Config {
  primaryService: 'YAHOO' | 'TIINGO'
  secondaryService: 'YAHOO' | 'TIINGO'
  tiingoToken: string
  fredApiKey: string
  corsProxy: string           // prefix for Yahoo/Composer requests from the built file; '' = corsproxy.io
  historyMode: HistoryMode
  // Synthetic engine: extend the volatility funds (UVIX, UVXY, VIXY, VXX) back to 1986 from spot
  // VIX/VXO (scripts/vol-sim.mjs). Off keeps Crescendo's start of 2005-12-20. Missing = on.
  deepVolatility?: boolean
  darkTheme: boolean
  openTabs: TabId[]
  selectedTab: TabId
}

export type TabId = PageId

// SYNTHETIC extends history before a fund existed (simulated leveraged ETFs, SIM index data), as
// Crescendo does by default. STANDARD uses only real prices, so backtests start later.
export type HistoryMode = 'SYNTHETIC' | 'STANDARD'

// SYNTHETIC: our engine (main focus; uses deepVolatility). CRESCENDO: runs as Crescendo does
// (volatility funds start 2005-12-20), for comparing with Crescendo's reports.
export type Engine = 'SYNTHETIC' | 'CLASSIC'
export const ENGINE_LABEL: Record<Engine, string> = { SYNTHETIC: 'Provenance', CLASSIC: 'Comparison' }

// Data tiers for the chart strip (engine/tiers.ts)
export type DataTier = 'real' | 'simulated' | 'filled'
export interface TierSegment { start: string; end: string; tier: DataTier }

export const DEFAULT_CONFIG: Config = {
  primaryService: 'YAHOO',
  secondaryService: 'TIINGO',
  tiingoToken: '',
  fredApiKey: '',
  corsProxy: '',
  historyMode: 'SYNTHETIC',
  darkTheme: true,
  openTabs: ['WELCOME', 'RUN_BACKTEST'],
  selectedTab: 'RUN_BACKTEST',
}

// ─── Price data ──────────────────────────────────────────────────────────────

export interface PricePoint {
  date: string     // YYYY-MM-DD
  adjClose: number
  volume?: number  // shares traded; used to spot misprints (data/hygiene.ts)
}

export type PriceSeries = PricePoint[]

export interface TickerData {
  ticker: string
  series: PriceSeries
  source: 'YAHOO' | 'TIINGO' | 'SIM' | 'LETF'
}

// ─── Strategy definition ─────────────────────────────────────────────────────

export interface FixedWeightStrategy {
  type: 'fixed-weight'
  name: string
  legs: { ticker: string; weight: number }[]   // weights sum to 1.0
  rebalance: 'daily' | 'weekly' | 'monthly'
}

// Minimal Composer symphony (enough for common strategies)
export interface SymphonyStrategy {
  type: 'symphony'
  name: string
  composerId?: string
  symphonyJson: ComposerSymphony
  // Date of the symphony's last logic edit (Composer's last_semantic_update_at); days after it are out of sample
  editedAt?: string
}

export type Strategy = FixedWeightStrategy | SymphonyStrategy

// ─── Composer symphony ───────────────────────────────────────────────────────
// The score JSON as Composer returns it (step: "root"). src/symphony/evaluator.ts reads it.

export interface ComposerSymphony {
  id?: string
  name: string
  step?: string
  rebalance?: string
  children?: unknown[]
  [key: string]: unknown
}

// ─── Backtest results ─────────────────────────────────────────────────────────

export interface BacktestInput {
  strategy: Strategy
  benchmark: string
  startDate: string | null    // YYYY-MM-DD, null = use all available
  endDate: string | null
}

export interface BacktestResult {
  strategyName: string
  benchmarkTicker: string
  startDate: string
  endDate: string
  generatedAt: string

  dates: string[]
  portfolioValues: number[]
  benchmarkValues: number[]
  dailyReturns: number[]
  benchmarkDailyReturns: number[]

  // [date_index][ticker] = weight  (sparse: only rebalance days stored)
  dailyAllocations: Array<Record<string, number>>

  metrics: BacktestMetrics
  benchmarkMetrics?: BacktestMetrics
  drawdownPeriods: DrawdownPeriod[]
  eoyReturns: Record<string, { strategy: number; benchmark: number }>
  monthlyReturns: Record<string, { strategy: number; benchmark: number }>
  riskFreeRate: number    // annualized

  // Set by the app after runBacktest (optional, so scripts calling runBacktest are unaffected)
  engine?: Engine
  dataTiers?: TierSegment[]
  // The other engine's run of the same strategy, from Compare
  comparison?: { engine: Engine; dates: string[]; portfolioValues: number[]; cagr: number; maxDrawdown: number }
  // Out of sample: from the first trading day after the symphony's last logic edit
  oos?: { from: string; editedAt: string; metrics: BacktestMetrics; benchmarkMetrics: BacktestMetrics }
  // Per-ticker breakdowns (engine/breakdown.ts) and the tickers that limit the start date
  holdings?: HoldingRow[]
  contributions?: ContributionRow[]
  limiters?: LimiterRow[]
}

export interface HoldingRow { ticker: string; avg: number; min: number; max: number; daysHeld: number; shareHeld: number }
/** Gains and losses as a fraction of the starting capital */
export interface ContributionRow { ticker: string; gains: number; losses: number; total: number }
/** First price date per ticker, and how many trading days before real prices are simulated */
export interface LimiterRow { ticker: string; availableFrom: string; extensionDays: number }

export interface BacktestMetrics {
  // Returns
  totalReturn: number
  cagr: number
  excessReturn: number
  excessCagr: number
  // Risk-adjusted
  sharpe: number
  smartSharpe: number
  sortino: number
  smartSortino: number
  sortinoSqrt2: number
  smartSortinoSqrt2: number
  romad: number
  calmar: number
  omega: number
  ulcerIndex: number
  serenityIndex: number
  probSharpe: number
  // Drawdown
  maxDrawdown: number
  maxDrawdownDays: number
  longestDrawdownDays: number
  avgDrawdown: number
  avgDrawdownDays: number
  currentDrawdown: number
  currentDrawdownDays: number
  // Volatility
  annualizedVol: number
  stdDev: number
  // Risk measures
  dailyVaR95: number
  expectedShortfall: number
  recoveryFactor: number
  // Relative
  alpha: number
  beta: number
  correlation: number
  rSquared: number
  informationRatio: number
  // Distribution
  skew: number
  kurtosis: number
  // Trading stats
  timeInMarket: number
  winDays: number
  lossDays: number
  winDaysPct: number
  winMonthPct: number
  winQuarterPct: number
  winYearPct: number
  winRatio: number
  profitFactor: number
  avgUpMonth: number
  avgDownMonth: number
  avgChurn: number
  medianChurn: number
  // Trailing periods
  mtd: number; t3m: number; t6m: number; ytd: number
  t1y: number; t3y: number; t5y: number; t10y: number
  // Best/worst
  bestDay: number; worstDay: number
  bestMonth: number; worstMonth: number
  bestYear: number; worstYear: number
  expectedDaily: number; expectedMonthly: number; expectedYearly: number
  // Further ratios (QuantStats definitions)
  treynor: number
  minTrackRecordYears: number
  gainPain: number
  tailRatio: number
  commonSense: number
  cpcIndex: number
  payoffRatio: number
  outlierWinRatio: number
  outlierLossRatio: number
  monthlySkew: number
  monthlyKurtosis: number
  maxConsecWins: number
  maxConsecLosses: number
  kelly: number
  riskOfRuin: number
}

export interface DrawdownPeriod {
  peak: string       // date
  valley: string     // date
  recovery: string | null   // null if not yet recovered
  depth: number      // negative fraction, e.g. -0.5
  durationDays: number
  recoveryDays: number | null
}

// ─── LETF map ─────────────────────────────────────────────────────────────────

export interface LetfEntry {
  ticker: string
  underlying: string
  leverage: number
  cutoffDate?: string
  /** false: exposure netting only uses this fund when the strategy holds it */
  nettingCandidate?: boolean
  /** false: the multiple doesn't state the daily exposure, so netting treats it as its own index */
  unwind?: boolean
}

// ─── App state ────────────────────────────────────────────────────────────────

export type BacktestStatus = 'idle' | 'fetching' | 'computing' | 'done' | 'error'

export interface AppState {
  config: Config
  activeTab: TabId
  backtestResult: BacktestResult | null
  backtestStatus: BacktestStatus
  backtestError: string | null
  backtestLog: string[]
  simDataLoaded: boolean
}
