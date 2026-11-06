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



const SETUP_KEY = 'bt-last-setup'
type Setup = { strategy?: string; benchmark?: string; startDate?: string; endDate?: string; history?: History; excludeOn?: boolean; exclude?: Range[] }
type Range = { from: string; to: string }
const DEFAULT_EXCLUDE: Range[] = [{ from: '2020-01-02', to: '2020-12-31' }]
const DEFAULT_START = '1990-01-01'
function loadSetup(): Setup {
  try { return JSON.parse(localStorage.getItem(SETUP_KEY) ?? '{}') as Setup } catch { return {} }
}
// History choices: the two synthetic engines, then real prices (all, before or after the symphony's last edit)
type History = HistoryMode | 'CRESCENDO' | 'IS' | 'OOS'
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

  // The last setup is kept in this browser and restored after a reload
  const [saved] = useState(loadSetup)
  const [stratInput, setStratInput] = useState(saved.strategy ?? 'QQQ')
  const [benchmark, setBenchmark] = useState(saved.benchmark ?? 'QQQ')
  const [startDate, setStartDate] = useState(saved.startDate ?? DEFAULT_START)
  // Date presets: each sets the start date and clears the end date (runs to the latest close)
  const PRESETS: [string, () => string][] = [
    ['Full', () => ''],
    ['YTD', () => `${new Date().getFullYear()}-01-01`],
    ...[1, 3, 5, 10].map(y => [`${y}Y`, () => {
      const d = new Date(); d.setFullYear(d.getFullYear() - y)
      return d.toISOString().slice(0, 10)
    }] as [string, () => string]),
  ]
  // Market events: S&P 500 closing high before the drop, to the day it closed above that high again
  // (checked against ^GSPC closes). An optional fourth entry describes a range that differs.
  const EVENTS: [string, string, string, string?][] = [
    ['1929', '1929-09-16', '1954-09-22'],
    ['1973', '1973-01-11', '1980-07-17'],
    ['Black Monday', '1987-08-25', '1989-07-26'],
    ['1990', '1990-01-02', '2002-10-09', 'S&P 500 from 1990 through the Tech Bubble peak to its low 2002-10-09'],
    ['Tech Bubble', '2000-03-24', '2007-05-30'],
    ['GFC', '2007-10-09', '2013-03-28'],
    ['2018', '2018-09-20', '2019-04-23'],
    ['COVID', '2020-02-19', '2020-08-18'],
    ['2022', '2022-01-03', '2024-01-19'],
  ]
  const chip = (label: string, on: boolean, onClick: () => void, title?: string) => (
    <button key={label} type="button" onClick={onClick} aria-pressed={on} title={title}
      style={{
        padding: '5px 0', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', borderRadius: 6, cursor: 'pointer',
        border: `1px solid ${on ? tabActive : border}`, background: on ? colors.tabBg : 'transparent',
        color: on ? tabActive : text, fontWeight: on ? 700 : 400,
      }}>{label}</button>
  )
  const [endDate, setEndDate] = useState(saved.endDate ?? '')
  // History choice: Synthetic, Real Data (the STANDARD mode) or Out-of-Sample (real prices,
  // starting the day after the symphony's last edit)
  const [history, setHistory] = useState<History>(saved.history ?? config.historyMode ?? 'SYNTHETIC')
  // Exclude dates/ranges: those days' returns are left out and the curves break over the gap
  const [excludeOn, setExcludeOn] = useState(saved.excludeOn ?? false)
  const [exclude, setExclude] = useState<Range[]>(saved.exclude?.length ? saved.exclude : DEFAULT_EXCLUDE)
  useEffect(() => {
    try { localStorage.setItem(SETUP_KEY, JSON.stringify({ strategy: stratInput, benchmark, startDate, endDate, history, excludeOn, exclude })) } catch { /* storage blocked */ }
  }, [stratInput, benchmark, startDate, endDate, history, excludeOn, exclude])
  const historyMode: HistoryMode = history === 'SYNTHETIC' || history === 'CRESCENDO' ? 'SYNTHETIC' : 'STANDARD'
  // In-Sample ends the run on the symphony's last edit; otherwise the End Date box applies
  const runEnd = useRef<string | null>(null)
  // Synthetic (Crescendo) runs the Crescendo-compatible engine; every other choice runs Provenance
  const engine: Engine = history === 'CRESCENDO' ? 'CLASSIC' : 'SYNTHETIC'
  const logRef = useRef<HTMLDivElement>(null)
  const logLines = useRef<string[]>([])

  const isRunning = backtestStatus === 'fetching' || backtestStatus === 'computing'

  // progress box with a time-left estimate.
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
  const SLICES: Array<[number, number, number, number]> = [[0.08, 0.8, 0.8, 0.99], [0.8, 0.88, 0.88, 0.99]]
  const yieldToPaint = () => new Promise(r => setTimeout(r, 0))

  // The engines differ in their price history: Crescendo-compatible keeps Crescendo's 2005-12-20 start
  // for volatility funds; Synthetic follows Settings (back to 1986 unless turned off).
  const engineConfig = (e: Engine): Config =>
    ({ ...config, historyMode, deepVolatility: e === 'CLASSIC' ? false : config.deepVolatility })

  // the benchmark can be a Composer symphony link. It is backtested first and its
  // equity curve becomes a price series under `bench.key`, so the chart, metrics and report treat it
  // exactly like a ticker.
  type Bench = { key: string; strategy: Strategy | null }

  async function runEngine(e: Engine, strategy: Strategy, rfRate: number, log: (m: string) => void, start: string | null, k = 0, bench: Bench = { key: benchmark, strategy: null }): Promise<BacktestResult> {
    const cfg = engineConfig(e)
    const benchmark = bench.key
    const tickers = getRequiredTickers(strategy)
    const benchTickers = bench.strategy ? getRequiredTickers(bench.strategy) : []
    if (bench.strategy) {
      // The benchmark symphony's own run needs a reference ticker; SPY is only used for its metrics
      for (const t of [...benchTickers, 'SPY']) if (!tickers.includes(t)) tickers.push(t)
    } else if (!tickers.includes(benchmark)) tickers.push(benchmark)
    log(`[${ENGINE_LABEL[e]}] Loading price data for: ${tickers.join(', ')}`)
    const [l0, l1, s0, s1] = SLICES[k]
    const run = e === 'CLASSIC' ? 'Crescendo run: ' : ''
    step(l0, `${run}loading prices... 0 of ${new Set(tickers).size} tickers`)
    const priceData = await loadTickers(tickers, cfg, log,
      (done, total) => step(l0 + (l1 - l0) * done / total, `${run}loading prices... ${done} of ${total} tickers`))
    const missing = tickers.filter(t => !priceData[t]?.length)
    if (missing.length) throw new Error(`No price data for ${missing.join(', ')}. See the warnings above.`)
    if (bench.strategy) {
      step(s0, `${run}simulating the benchmark symphony...`)
      await yieldToPaint()
      const b = await runBacktest({ strategy: bench.strategy, benchmark: 'SPY', startDate: null, endDate: runEnd.current }, priceData, rfRate, log)
      priceData[benchmark] = b.dates.map((date, i) => ({ date, adjClose: b.portfolioValues[i] }))
      log(`Benchmark symphony "${benchmark}": ${b.dates.length} trading days from ${b.dates[0]}`)
    }
    step(s0, `${run}simulating the strategy...`)
    await yieldToPaint()
    const result = await runBacktest(
      { strategy, benchmark, startDate: start, endDate: runEnd.current, exclude: excludeOn ? exclude : undefined },
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
      limiters: computeLimiters(tickers.filter(t => t !== benchmark && !(bench.strategy && !getRequiredTickers(strategy).includes(t))), priceData, realFrom),
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

      // Benchmark: a ticker, or a Composer symphony link
      let bench: Bench = { key: benchmark.trim().toUpperCase() || 'QQQ', strategy: null }
      const benchId = extractSymphonyId(benchmark.trim())
      if (benchId) {
        log(`Fetching benchmark symphony ${benchId} from Composer...`)
        step(0.02, 'Fetching the benchmark symphony from Composer...')
        const bs = await fetchPublicSymphony(benchId, config.corsProxy, log)
        let key = (bs.name || 'Benchmark symphony').trim()
        if (key.length > 40) key = key.slice(0, 39).trimEnd() + '…'
        if (key === strategy.name) key += ' (benchmark)'
        bench = { key, strategy: bs }
      }
      log(`Benchmark: ${bench.key}`)

      // Optionally load SIM data
      if (historyMode === 'SYNTHETIC') {
        step(0.04, 'Loading simulated history...')
        await yieldToPaint()
        await loadSimData(log)
      }

      // Risk-free rate
      const rfRate = await fetchRiskFreeRate(config.fredApiKey)
      log(`Risk-free rate: ${(rfRate * 100).toFixed(2)}%`)

      // Out-of-Sample starts the day after the last edit (or the start date, if later);
      // In-Sample ends on the last edit (or the end date, if earlier)
      let start: string | null = startDate || null
      runEnd.current = endDate || null
      if (history === 'OOS' || history === 'IS') {
        const edited = strategy.type === 'symphony' ? strategy.editedAt : undefined
        if (!edited) throw new Error("In-Sample and Out-of-Sample need the symphony's last edit date, which this strategy does not have. Load it from a Composer link, or choose another History.")
        if (history === 'OOS') {
          const next = new Date(edited + 'T00:00:00Z'); next.setUTCDate(next.getUTCDate() + 1)
          const from = next.toISOString().slice(0, 10)
          if (!start || start < from) start = from
          log(`Out-of-Sample: from ${start} (last edit ${edited})`)
        } else {
          if (!runEnd.current || runEnd.current > edited) runEnd.current = edited
          log(`In-Sample: to ${runEnd.current} (last edit ${edited})`)
        }
      }

      onStatus('computing')
      const result = await runEngine(engine, strategy, rfRate, log, start, 0, bench)
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 16px' }}>
            <h3 style={{ margin: 0, fontSize: 15 }}>Strategy Input</h3>
            <button type="button" title="Reset the strategy, benchmark, dates and history"
              onClick={() => { setStratInput('QQQ'); setBenchmark('QQQ'); setStartDate(DEFAULT_START); setEndDate(''); setHistory('SYNTHETIC'); setExcludeOn(false); setExclude(DEFAULT_EXCLUDE) }}
              style={{ padding: '3px 10px', fontSize: 12, borderRadius: 6, cursor: 'pointer', border: `1px solid ${border}`, background: 'transparent', color: textMuted }}>
              Default
            </button>
          </div>

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
            <label style={labelStyle as React.CSSProperties}>Benchmark (ticker or Composer symphony link)</label>
            <input
              value={benchmark}
              // A ticker is uppercased; a symphony link is kept as typed (its id is case-sensitive)
              onChange={e => setBenchmark(/composer\.trade|\//i.test(e.target.value) ? e.target.value : e.target.value.toUpperCase())}
              placeholder="QQQ, or https://app.composer.trade/symphony/.."
              style={inputStyle}
            />
          </div>

          <label style={labelStyle as React.CSSProperties}>Date Range</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 10 }}>
            {PRESETS.map(([label, from]) =>
              chip(label, !endDate && startDate === from(), () => { setStartDate(from()); setEndDate('') }))}
          </div>
          {/* Market events: the high before the drop to the recovery */}
          <label style={labelStyle as React.CSSProperties}>Market Events</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 10 }}>
            {EVENTS.map(([label, from, to, note]) =>
              chip(label, startDate === from && endDate === to, () => { setStartDate(from); setEndDate(to) },
                note ?? `S&P 500 high ${from} to recovery ${to}`))}
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
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={excludeOn} onChange={e => setExcludeOn(e.target.checked)} />
              Exclude dates/ranges
            </label>
            {excludeOn && <div style={{ marginTop: 8 }}>
              {exclude.map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr) auto', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                  <input type="date" value={r.from} aria-label="Exclude from" style={{ ...inputStyle, minWidth: 0, padding: '6px 4px' }}
                    onChange={e => setExclude(exclude.map((x, j) => j === i ? { ...x, from: e.target.value } : x))} />
                  <span>→</span>
                  <input type="date" value={r.to} aria-label="Exclude to" style={{ ...inputStyle, minWidth: 0, padding: '6px 4px' }}
                    onChange={e => setExclude(exclude.map((x, j) => j === i ? { ...x, to: e.target.value } : x))} />
                  <button type="button" title="Remove this range" style={{ ...inputStyle, width: 'auto', padding: '6px 8px', cursor: 'pointer' }}
                    onClick={() => setExclude(exclude.filter((_, j) => j !== i))}>×</button>
                </div>))}
              <button type="button" style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}
                onClick={() => setExclude([...exclude, { from: '', to: '' }])}>+ Add range</button>
            </div>}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle as React.CSSProperties}>History</label>
            <select value={history} onChange={e => setHistory(e.target.value as History)} style={inputStyle}>
              <option value="SYNTHETIC">Synthetic (Provenance)</option>
              <option value="CRESCENDO">Synthetic (Crescendo)</option>
              <option value="STANDARD">Real Data (All)</option>
              <option value="IS">Real Data (In-Sample)</option>
              <option value="OOS">Real Data (Out-of-Sample)</option>
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

        {/* Progress */}
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
