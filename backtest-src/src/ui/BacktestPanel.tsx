import { useState, useRef, useEffect } from 'react'
import type { Config, BacktestResult, BacktestStatus, HistoryMode, Engine, Strategy } from '../types'
import { ENGINE_LABEL } from '../types'
import { parseStrategyInput, extractSymphonyId, fetchPublicSymphony } from '../symphony/parser'
import { symphonyTickers } from '../symphony/evaluator'
import { runBacktest } from '../engine/backtest'
import { loadTickers, fetchRiskFreeRate, realPricesFrom } from '../data/priceLoader'
import { computeTiers } from '../engine/tiers'
import { computeHoldings, computeContributions, churnStats, computeLimiters } from '../engine/breakdown'
import { computeMetrics } from '../engine/metrics'
import { loadSimData } from '../data/simData'
import { generateReport } from '../reports/generator'
import { ReportView } from './ReportView'

interface Props {
  config: Config
  backtestResult: BacktestResult | null
  backtestStatus: BacktestStatus
  backtestError: string | null
  backtestLog: string[]
  onResult: (r: BacktestResult) => void
  onStatus: (s: BacktestStatus) => void
  onError: (e: string | null) => void
  onLog: (msgs: string[]) => void
  colors: Record<string, string>
}

const EXAMPLES = [
  { label: 'SPY/QQQ', value: 'SPY 50, QQQ 50' },
  { label: 'Classic 60/40', value: 'SPY 60, TLT 40' },
  { label: 'All Weather', value: 'SPY 30, TLT 40, GLD 15, IEF 15' },
  { label: 'QQQ vs BND', value: 'QQQ 80, BND 20' },
  // Public Composer symphonies (Composer Atlas's featured originals); loaded from their link
  { label: 'TQQQ For The Long Term', value: 'https://app.composer.trade/symphony/HukRwDJLlYPLMbrQbua5/details' },
  { label: 'The Holy Grail', value: 'https://app.composer.trade/symphony/MmQbpf2U5TMQFmr9Nt2e/details' },
  { label: 'KMLM Switcher', value: 'https://app.composer.trade/symphony/u5iBJE751BM5FKPRJvKf/details' },
  { label: 'SOXL Growth', value: 'https://app.composer.trade/symphony/CW8oWU12S6vEvn2Hh7jD/details' },
  { label: 'Safe Sectors or Bonds', value: 'https://app.composer.trade/symphony/DtlEo2Y1DWR7hngZkxTB/details' },
]

export function BacktestPanel({
  config, backtestResult, backtestStatus, backtestError, backtestLog,
  onResult, onStatus, onError, onLog, colors
}: Props) {
  const { panel, border, text, textMuted, tabActive } = colors

  const [stratInput, setStratInput] = useState('')
  const [benchmark, setBenchmark] = useState('QQQ')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  // History choice: Synthetic, Real Data (the STANDARD mode) or Out of Sample (Synthetic prices,
  // starting the day after the symphony's last edit)
  const [history, setHistory] = useState<HistoryMode | 'OOS'>(config.historyMode ?? 'SYNTHETIC')
  const historyMode: HistoryMode = history === 'OOS' ? 'SYNTHETIC' : history
  // Every run uses the Synthetic engine and overlays the comparison run (the CLASSIC engine,
  // kept for good but no longer chosen or named in the UI)
  const engine: Engine = 'SYNTHETIC'
  const compare = true
  const logRef = useRef<HTMLDivElement>(null)
  const logLines = useRef<string[]>([])

  const isRunning = backtestStatus === 'fetching' || backtestStatus === 'computing'

  // Composer Atlas: progress box with a time-left estimate, in the style of the Signal Miner.
  // Each step owns a slice of the bar; loading prices advances per ticker within its slice.
  type Progress = { frac: number; label: string; started: number; finished?: number; failed?: boolean }
  const [progress, setProgress] = useState<Progress | null>(null)
  const prog = useRef<Progress>({ frac: 0, label: '', started: 0 })
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => setTick(t => t + 1), 500)
    return () => clearInterval(id)
  }, [isRunning])
  const step = (frac: number, label: string, extra: Partial<Progress> = {}) => {
    prog.current = { ...prog.current, frac: Math.max(prog.current.frac, Math.min(1, frac)), label, ...extra }
    setProgress({ ...prog.current })
  }
  // Slices of the bar: [loading prices from, to], [simulating from, to], for the main and comparison runs
  const SLICES: Array<[number, number, number, number]> = [[0.08, 0.6, 0.6, 0.8], [0.8, 0.88, 0.88, 0.99]]
  const yieldToPaint = () => new Promise(r => setTimeout(r, 0))

  // The engines differ in their price history: Crescendo-compatible keeps Crescendo's 2005-12-20 start
  // for volatility funds; Synthetic follows Settings (back to 1986 unless turned off).
  const engineConfig = (e: Engine): Config =>
    ({ ...config, historyMode, deepVolatility: e === 'CLASSIC' ? false : config.deepVolatility })

  async function runEngine(e: Engine, strategy: Strategy, rfRate: number, log: (m: string) => void, start: string | null, k = 0): Promise<BacktestResult> {
    const cfg = engineConfig(e)
    const tickers = getRequiredTickers(strategy)
    if (!tickers.includes(benchmark)) tickers.push(benchmark)
    log(`[${ENGINE_LABEL[e]}] Loading price data for: ${tickers.join(', ')}`)
    const [l0, l1, s0, s1] = SLICES[k]
    const run = k === 0 ? '' : 'Comparison run: '
    step(l0, `${run}loading prices... 0 of ${new Set(tickers).size} tickers`)
    const priceData = await loadTickers(tickers, cfg, log,
      (done, total) => step(l0 + (l1 - l0) * done / total, `${run}loading prices... ${done} of ${total} tickers`))
    const missing = tickers.filter(t => !priceData[t]?.length)
    if (missing.length) throw new Error(`No price data for ${missing.join(', ')}. See the warnings above.`)
    step(s0, `${run}simulating the strategy...`)
    await yieldToPaint()
    const result = await runBacktest(
      { strategy, benchmark, startDate: start, endDate: endDate || null },
      priceData, rfRate, log)
    const realFrom = Object.fromEntries(tickers.map(t => [t, realPricesFrom(t, cfg)]))
    step(s0 + (s1 - s0) * 0.8, `${run}computing the report...`)
    await yieldToPaint()
    const churn = churnStats(result, priceData)
    return {
      ...result, engine: e,
      metrics: { ...result.metrics, avgChurn: churn.avg, medianChurn: churn.median },
      dataTiers: computeTiers(result, priceData, realFrom), oos: outOfSample(result, strategy),
      holdings: computeHoldings(result), contributions: computeContributions(result, priceData),
      limiters: computeLimiters(tickers.filter(t => t !== benchmark), priceData, realFrom),
    }
  }

  async function runBacktestHandler() {
    const input = stratInput.trim()
    if (!input) { onError('Please enter a strategy.'); return }

    onError(null)
    logLines.current = []
    onLog([])
    onStatus('fetching')
    prog.current = { frac: 0, label: 'Starting...', started: performance.now() }
    setProgress({ ...prog.current })

    const log = (msg: string) => {
      logLines.current = [...logLines.current, `[${new Date().toLocaleTimeString()}] ${msg}`]
      onLog([...logLines.current])
      setTimeout(() => logRef.current?.scrollTo(0, logRef.current.scrollHeight), 50)
    }

    try {
      // Parse strategy
      let strategy
      const symphonyIdMatch = extractSymphonyId(input)
      if (symphonyIdMatch) {
        log(`Fetching symphony ${symphonyIdMatch} from Composer...`)
        step(0.01, 'Fetching the symphony from Composer...')
        strategy = await fetchPublicSymphony(symphonyIdMatch, config.corsProxy, log)
      } else {
        strategy = parseStrategyInput(input)
      }

      log(`Strategy: ${strategy.name}`)
      log(`Benchmark: ${benchmark}`)

      // Optionally load SIM data
      if (historyMode === 'SYNTHETIC') {
        step(0.04, 'Loading simulated history...')
        await yieldToPaint()
        await loadSimData(log)
      }

      // Risk-free rate
      const rfRate = await fetchRiskFreeRate(config.fredApiKey)
      log(`Risk-free rate: ${(rfRate * 100).toFixed(2)}%`)

      // Out of Sample: start the day after the last edit (or the start date, if that is later)
      let start: string | null = startDate || null
      if (history === 'OOS') {
        const edited = strategy.type === 'symphony' ? strategy.editedAt : undefined
        if (!edited) throw new Error("Out of Sample needs the symphony's last edit date, which this strategy does not have. Load it from a Composer link, or choose Synthetic or Real Data.")
        const next = new Date(edited + 'T00:00:00Z'); next.setUTCDate(next.getUTCDate() + 1)
        const from = next.toISOString().slice(0, 10)
        if (!start || start < from) start = from
        log(`Out of Sample: from ${start} (last edit ${edited})`)
      }

      onStatus('computing')
      const result = await runEngine(engine, strategy, rfRate, log, start, 0)
      if (compare) {
        const other: Engine = engine === 'SYNTHETIC' ? 'CLASSIC' : 'SYNTHETIC'
        const o = await runEngine(other, strategy, rfRate, log, start, 1)
        result.comparison = { engine: other, dates: o.dates, portfolioValues: o.portfolioValues,
          cagr: o.metrics.cagr, maxDrawdown: o.metrics.maxDrawdown }
      }
      onResult(result)
      step(1, `Done: ${result.dates.length.toLocaleString()} trading days`, { finished: performance.now() })
      log(`✓ Backtest complete: ${result.dates.length} trading days`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      onError(msg)
      onStatus('error')
      step(prog.current.frac, 'Stopped by an error (see below)', { finished: performance.now(), failed: true })
      log(`✗ Error: ${msg}`)
    }
  }

  function downloadReport() {
    if (!backtestResult) return
    const html = generateReport(backtestResult)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    // The symphony's own name; only characters Windows forbids in file names are dropped
    a.download = `${backtestResult.strategyName.replace(/[<>:"/\|?*]/g, '').trim() || 'Backtest'}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const inputStyle = {
    width: '100%', background: colors.bg, color: text,
    border: `1px solid ${colors.borderStrong}`, borderRadius: 6, padding: '8px 10px',
  }

  const labelStyle = { fontSize: 12, color: textMuted, fontWeight: 600, marginBottom: 4, display: 'block' }

  return (
    <div style={{ display: 'flex', gap: 16, minHeight: 'calc(100vh - 100px)' }}>
      {/* Left: Input panel */}
      <div style={{ width: 340, flexShrink: 0 }}>
        <div style={{ background: panel, border: `1px solid ${border}`, borderRadius: 10, padding: 16 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>Strategy Input</h3>

          {/* Examples */}
          <div style={{ marginBottom: 10 }}>
            <span style={{ ...labelStyle as React.CSSProperties, display: 'inline' }}>Examples: </span>
            {EXAMPLES.map(e => (
              <button key={e.label}
                onClick={() => setStratInput(e.value)}
                style={{
                  fontSize: 11, padding: '2px 8px', marginRight: 4, marginBottom: 4,
                  background: colors.tabBg, color: tabActive, border: `1px solid ${tabActive}`,
                  borderRadius: 4,
                }}
              >{e.label}</button>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle as React.CSSProperties}>
              Strategy (Composer symphony link, tickers + weights, or symphony / QuantMage spell JSON)
            </label>
            <textarea
              value={stratInput}
              onChange={e => setStratInput(e.target.value)}
              placeholder={'https://app.composer.trade/symphony/<id>/details\n\nor SPY 60, TLT 40\n\nor paste Composer symphony / QuantMage spell JSON'}
              rows={6}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle as React.CSSProperties}>Benchmark Ticker</label>
            <input
              value={benchmark}
              onChange={e => setBenchmark(e.target.value.toUpperCase())}
              placeholder="QQQ"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            <div>
              <label style={labelStyle as React.CSSProperties}>Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle as React.CSSProperties}>End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle as React.CSSProperties}>History</label>
            <select value={history} onChange={e => setHistory(e.target.value as HistoryMode | 'OOS')} style={inputStyle}>
              <option value="SYNTHETIC">Synthetic: extend with simulated history</option>
              <option value="STANDARD">Real Data: real prices only</option>
              <option value="OOS">Out of Sample: from the symphony's last edit</option>
            </select>
          </div>

          <button
            onClick={() => runBacktestHandler()}
            disabled={isRunning}
            style={{
              width: '100%', padding: '10px', background: isRunning ? colors.textMuted : colors.accentBg,
              color: colors.onAccent, border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14,
            }}
          >
            {isRunning ? '⟳ Running...' : '▶ Run Backtest'}
          </button>

          {backtestStatus === 'done' && backtestResult && (
            <button
              onClick={downloadReport}
              style={{
                width: '100%', marginTop: 8, padding: '8px',
                background: colors.success, color: colors.onAccent, border: 'none',
                borderRadius: 6, fontWeight: 600, fontSize: 13,
              }}
            >
              ⬇ Export HTML Report
            </button>
          )}

          {backtestError && (
            <div style={{
              marginTop: 12, padding: 10, background: colors.panel, border: `1px solid ${colors.danger}`,
              borderRadius: 6, color: colors.danger, fontSize: 12,
            }}>
              ✕ Error: {backtestError}
            </div>
          )}
        </div>

        {/* Progress (Composer Atlas) */}
        {progress && (() => {
          const now = progress.finished ?? performance.now()
          const elapsed = now - progress.started
          const f = progress.frac
          const fmt = (ms: number) => { const t = Math.max(0, Math.round(ms / 1000)); return t < 60 ? `${t}s` : `${Math.floor(t / 60)}m ${String(t % 60).padStart(2, '0')}s` }
          const tail = progress.finished
            ? `${fmt(elapsed)} total`
            : f >= 0.1 && elapsed > 1500 ? `${fmt(elapsed * (1 - f) / f)} left` : 'estimating...'
          return (
            <div style={{ marginTop: 12, background: panel, border: `1px solid ${border}`, borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 12, color: textMuted, marginBottom: 8, fontWeight: 600 }}>Progress</div>
              <div style={{ height: 8, borderRadius: 6, background: colors.bg, border: `1px solid ${border}`, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(100 * f).toFixed(1)}%`, background: progress.failed ? colors.danger : colors.success, transition: 'width .2s linear' }} />
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: text, marginTop: 8, lineHeight: 1.6 }}>
                {progress.label} ({Math.round(100 * f)}%) · {tail}
              </div>
            </div>
          )
        })()}

        {/* Log */}
        {backtestLog.length > 0 && (
          <div style={{
            marginTop: 12, background: panel, border: `1px solid ${border}`,
            borderRadius: 10, padding: 12,
          }}>
            <div style={{ fontSize: 12, color: textMuted, marginBottom: 6, fontWeight: 600 }}>Log</div>
            <div
              ref={logRef}
              style={{
                fontFamily: 'monospace', fontSize: 11, color: textMuted,
                maxHeight: 200, overflowY: 'auto', lineHeight: 1.8,
              }}
            >
              {backtestLog.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          </div>
        )}
      </div>

      {/* Right: Results */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {backtestResult && backtestStatus === 'done' ? (
          <ReportView result={backtestResult} colors={colors} />
        ) : (
          <div style={{
            background: panel, border: `1px solid ${border}`,
            borderRadius: 10, height: '100%', minHeight: 400,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: textMuted, flexDirection: 'column', gap: 12,
          }}>
            {isRunning ? (
              <>
                <div style={{ fontSize: 32 }}>⟳</div>
                <div>Running backtest...</div>
                {backtestLog.length > 0 && (
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {backtestLog[backtestLog.length - 1]}
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ fontSize: 32 }}>📊</div>
                <div>Enter a strategy and click Run Backtest</div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getRequiredTickers(strategy: ReturnType<typeof parseStrategyInput>): string[] {
  if (strategy.type === 'fixed-weight') {
    return strategy.legs.map(l => l.ticker)
  }
  return symphonyTickers(strategy.symphonyJson)
}

/** Metrics for the days after the symphony's last logic edit (its out-of-sample period). */
function outOfSample(result: BacktestResult, strategy: Strategy): BacktestResult['oos'] {
  const editedAt = strategy.type === 'symphony' ? strategy.editedAt : undefined
  if (!editedAt) return undefined
  const i = result.dates.findIndex(d => d > editedAt)
  if (i < 0 || result.dates.length - i < 2) return undefined
  const dates = result.dates.slice(i)
  const pv = result.portfolioValues.slice(i), bv = result.benchmarkValues.slice(i)
  // dailyReturns[k] is the return into dates[k + 1]
  const dr = result.dailyReturns.slice(i), bdr = result.benchmarkDailyReturns.slice(i)
  return {
    from: dates[0], editedAt,
    metrics: computeMetrics(dates, pv, bv, dr, bdr, result.riskFreeRate),
    benchmarkMetrics: computeMetrics(dates, bv, bv, bdr, bdr, result.riskFreeRate),
  }
}
