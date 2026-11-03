import { useEffect, useRef, useState } from 'react'
import PlotlyLib from 'plotly.js-dist-min'
import { TierStrip } from './TierStrip'
import type { BacktestResult, BacktestMetrics, DrawdownPeriod } from '../types'
import { KPIS, METRIC_GROUPS, VISIBLE_ROWS, worstDrawdowns, benchmarkDrawdowns, pct, CONTRIBUTION_HEAD, CONTRIBUTION_TIP, contributionRows } from '../reports/metricGroups'
import { comparisonTrace, oosShape } from '../reports/overlays'

// Bundled (not loaded from a CDN) so charts work offline and in the single-file build.
const Plotly = PlotlyLib as unknown as {
  newPlot: (id: string | HTMLElement, data: unknown[], layout?: unknown, config?: unknown) => void
  react: (id: string | HTMLElement, data: unknown[], layout?: unknown, config?: unknown) => void
}

interface Props {
  result: BacktestResult
  colors: Record<string, string>
}

export function ReportView({ result, colors }: Props) {
  const { panel, border, text, textMuted } = colors
  const plotlyTheme = {
    paper_bgcolor: panel,
    plot_bgcolor: panel,
    font: { color: text, size: 11 },
    xaxis: { gridcolor: border, linecolor: border },
    yaxis: { gridcolor: border, linecolor: border },
    legend: { orientation: 'h' as const, y: -0.2, bgcolor: 'transparent' },
    margin: { t: 20, r: 20, b: 60, l: 60 },
  }

  const m = result.metrics

  // Chart refs
  const eqRef = useRef<HTMLDivElement>(null)
  const eoyRef = useRef<HTMLDivElement>(null)
  const ddRef = useRef<HTMLDivElement>(null)
  const rollingRef = useRef<HTMLDivElement>(null)
  const heatmapRef = useRef<HTMLDivElement>(null)
  const distRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const { dates, portfolioValues: pv, benchmarkValues: bv, dailyReturns: dr, benchmarkDailyReturns: bdr } = result

    // ── Equity curve ──
    if (eqRef.current) {
      Plotly.newPlot(eqRef.current, [
        { x: dates, y: pv, name: result.strategyName, type: 'scatter', mode: 'lines', line: { color: colors.strategy, width: 2 } },
        { x: dates, y: bv, name: result.benchmarkTicker, type: 'scatter', mode: 'lines', line: { color: colors.benchmark, width: 1.5, dash: 'dot' } },
        ...(result.comparison ? [comparisonTrace(result, pv, colors.compare)] : []),
      ], { ...plotlyTheme, yaxis: { ...plotlyTheme.yaxis, type: 'log', title: 'Portfolio Value ($)' }, ...oosShape(result, text, colors.oos) }, { responsive: true })
    }

    // ── EOY bar ──
    if (eoyRef.current) {
      const years = Object.keys(result.eoyReturns).sort()
      Plotly.newPlot(eoyRef.current, [
        { x: years, y: years.map(y => (result.eoyReturns[y]?.strategy ?? 0) * 100), name: result.strategyName, type: 'bar', marker: { color: colors.strategy } },
        { x: years, y: years.map(y => (result.eoyReturns[y]?.benchmark ?? 0) * 100), name: result.benchmarkTicker, type: 'bar', marker: { color: colors.benchmark } },
      ], { ...plotlyTheme, barmode: 'group', xaxis: { ...plotlyTheme.xaxis, type: 'category' }, yaxis: { ...plotlyTheme.yaxis, title: 'Return (%)' } }, { responsive: true })
    }

    // ── Underwater ──
    if (ddRef.current) {
      const uw = computeUnderwater(pv)
      Plotly.newPlot(ddRef.current, [
        { x: dates, y: uw.map(v => v * 100), type: 'scatter', mode: 'lines', fill: 'tozeroy', name: 'Strategy DD', line: { color: colors.loss, width: 1 }, opacity: 0.8 },
      ], { ...plotlyTheme, yaxis: { ...plotlyTheme.yaxis, title: 'Drawdown (%)' } }, { responsive: true })
    }

    // ── Rolling (initial) ──
    if (rollingRef.current) {
      renderRolling(rollingRef.current, dr, bdr, dates, 'sharpe', 126, result, plotlyTheme, colors.strategy)
    }

    // ── Monthly heatmap ──
    if (heatmapRef.current) {
      const byYM: Record<string, Record<string, number>> = {}
      for (const [ym, vals] of Object.entries(result.monthlyReturns)) {
        const [yr, mo] = ym.split('-')
        if (!byYM[yr]) byYM[yr] = {}
        byYM[yr][mo] = vals.strategy * 100
      }
      const years = Object.keys(byYM).sort().reverse()
      const months = ['01','02','03','04','05','06','07','08','09','10','11','12']
      const mNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      const z = years.map(yr => months.map(mo => byYM[yr]?.[mo] ?? null))
      const text2d = z.map(row => row.map(v => v == null ? '' : v.toFixed(2) + '%'))
      Plotly.newPlot(heatmapRef.current, [{
        z, x: mNames, y: years, type: 'heatmap' as const,
        colorscale: [['0', colors.loss], ['0.5', colors.panel], ['1', colors.gain]],
        zmid: 0, text: text2d as unknown as string[],
        hovertemplate: '%{y} %{x}: %{text}<extra></extra>',
      }], {
        ...plotlyTheme,
        // Explicit types: Plotly otherwise reads month names and years as dates
        xaxis: { ...plotlyTheme.xaxis, type: 'category' },
        yaxis: { ...plotlyTheme.yaxis, type: 'category' },
        height: Math.max(400, years.length * 22 + 100),
        margin: { t: 10, r: 20, b: 50, l: 60 },
      }, { responsive: true })
    }

    // ── Returns distribution ──
    if (distRef.current) {
      Plotly.newPlot(distRef.current, [
        { x: dr.map(v => v * 100), type: 'histogram', name: result.strategyName, opacity: 0.7, marker: { color: colors.strategy }, xbins: { size: 0.2 } },
        { x: bdr.map(v => v * 100), type: 'histogram', name: result.benchmarkTicker, opacity: 0.7, marker: { color: colors.benchmark }, xbins: { size: 0.2 } },
      ], { ...plotlyTheme, barmode: 'overlay', xaxis: { ...plotlyTheme.xaxis, type: 'linear', title: 'Daily Return (%)' }, yaxis: { ...plotlyTheme.yaxis, title: 'Count' } }, { responsive: true })
    }
  }, [result, colors])

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      {/* Charts column */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Section title="Cumulative Returns vs Benchmark" panel={panel} border={border}>
          {result.engine && (
            <div style={{ fontSize: 11, color: textMuted, textAlign: 'center', marginBottom: 4 }}>
              {result.comparison && <>Backtest (from {result.startDate})
                vs comparison run (from {result.comparison.dates[0]}):
                CAGR {pct(m.cagr)} vs {pct(result.comparison.cagr)},
                max drawdown {pct(m.maxDrawdown)} vs {pct(result.comparison.maxDrawdown)}</>}
            </div>
          )}
          <div ref={eqRef} style={{ width: '100%', height: 'max(400px, 40vh)' }} />
          {result.oos && (
            <div style={{ fontSize: 11, color: textMuted, textAlign: 'center', marginTop: 4 }}>
              Shaded: out of sample since the symphony's last edit on {result.oos.editedAt} ({result.dates.length - result.dates.indexOf(result.oos.from)} trading days)
            </div>
          )}
          {result.dataTiers && <TierStrip segments={result.dataTiers} dates={result.dates} textMuted={textMuted} />}
        </Section>
        <Section title="End of Year Returns vs Benchmark" panel={panel} border={border}>
          <div ref={eoyRef} style={{ width: '100%', height: 'max(400px, 40vh)' }} />
        </Section>
        <Section title="Underwater Plot" panel={panel} border={border}>
          <div ref={ddRef} style={{ width: '100%', height: 'max(400px, 40vh)' }} />
        </Section>
        <Section title="Rolling Metrics" panel={panel} border={border}>
          <RollingControls
            dr={result.dailyReturns}
            bdr={result.benchmarkDailyReturns}
            dates={result.dates}
            result={result}
            plotlyTheme={plotlyTheme}
            divRef={rollingRef}
            colors={colors}
          />
          <div ref={rollingRef} style={{ width: '100%', height: 'max(400px, 40vh)' }} />
        </Section>
        <Section title="Monthly Returns (%)" panel={panel} border={border}>
          <div ref={heatmapRef} style={{ width: '100%', minHeight: 480 }} />
        </Section>
        <Section title="Returns Distribution" panel={panel} border={border}>
          <div ref={distRef} style={{ width: '100%', height: 'max(400px, 40vh)' }} />
        </Section>
      </div>

      {/* Metrics column */}
      <div style={{ width: 400, flexShrink: 0 }}>
        <KpiBlock m={m} rf={result.riskFreeRate} colors={colors} />
        {METRIC_GROUPS.map(g => <MetricGroupTable key={g.title} group={g} result={result} colors={colors} />)}
        <EoyTable result={result} colors={colors} />
        <DrawdownTable title="Worst Drawdowns (Strategy)" periods={worstDrawdowns(result.drawdownPeriods)} colors={colors} />
        <DrawdownTable title="Worst Drawdowns (Benchmark)" periods={benchmarkDrawdowns(result.dates, result.benchmarkValues)} colors={colors} />
        {result.holdings && <Card title="Holdings Breakdown" colors={colors}
          head={['Ticker', 'Avg %', 'Min %', 'Max %', 'Days Held']}
          rows={result.holdings.map(h => [h.ticker, pct(h.avg), pct(h.min), pct(h.max), `${h.daysHeld.toLocaleString()} (${(h.shareHeld * 100).toFixed(1)}%)`])} />}
        {result.contributions && <Card title="Contributions Breakdown" colors={colors}
          tip={CONTRIBUTION_TIP}
          head={CONTRIBUTION_HEAD}
          rows={contributionRows(result.contributions)} />}
        {result.limiters && <Card title="Backtest Limiters (Tickers)" colors={colors}
          tip="The first price of each ticker; the latest one limits how far back the test can start. Extension: trading days simulated before real prices"
          head={['#', 'Ticker', 'Available From', 'Extension']}
          rows={result.limiters.map((l, i) => [String(i + 1), l.ticker, l.availableFrom, l.extensionDays ? `${l.extensionDays.toLocaleString()} Days` : ''])} />}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, panel, border, children }: { title: string; panel: string; border: string; children: React.ReactNode }) {
  return (
    <div style={{ background: panel, border: `1px solid ${border}`, borderRadius: 10, padding: 12, marginBottom: 12 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 13, textAlign: 'center' }}>{title}</h3>
      {children}
    </div>
  )
}

function RollingControls({ dr, bdr, dates, result, plotlyTheme, divRef, colors }: {
  dr: number[]; bdr: number[]; dates: string[]
  result: BacktestResult; plotlyTheme: object; divRef: React.RefObject<HTMLDivElement | null>; colors: Record<string, string>
}) {
  const { border, text } = colors
  const selStyle = { background: 'transparent', color: text, border: `1px solid ${border}`, borderRadius: 4, padding: '2px 6px', marginRight: 8 }

  function update(e: React.ChangeEvent<HTMLSelectElement>) {
    const form = e.target.closest('div')!
    const metric = (form.querySelector('[data-metric]') as HTMLSelectElement).value
    const window = parseInt((form.querySelector('[data-window]') as HTMLSelectElement).value)
    if (divRef.current) renderRolling(divRef.current, dr, bdr, dates, metric, window, result, plotlyTheme, colors.strategy)
  }

  return (
    <div style={{ marginBottom: 8, fontSize: 12 }}>
      <label>Metric: </label>
      <select data-metric onChange={update} style={selStyle}>
        <option value="sharpe">Sharpe</option>
        <option value="sortino">Sortino</option>
        <option value="cagr">CAGR</option>
        <option value="vol">Volatility</option>
      </select>
      <label>Window: </label>
      <select data-window defaultValue="126" onChange={update} style={selStyle}>
        <option value="63">3 months</option>
        <option value="126">6 months</option>
        <option value="252">12 months</option>
      </select>
    </div>
  )
}

function KpiBlock({ m, rf, colors }: { m: BacktestMetrics; rf: number; colors: Record<string, string> }) {
  const { panel, border, textMuted } = colors
  return (
    <div style={{ background: panel, border: `1px solid ${border}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: textMuted }}>Annual Return</div>
        <div style={{ fontSize: 36, fontWeight: 800 }}>{pct(m.cagr)}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {KPIS.map(([label, val]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{val(m, rf)}</div>
            <div style={{ fontSize: 11, color: textMuted }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const tableStyles = (colors: Record<string, string>) => ({
  th: { padding: '5px 8px', fontWeight: 700, fontSize: 12, background: colors.tabBg, borderBottom: `1px solid ${colors.border}`, textAlign: 'center' } as React.CSSProperties,
  td: { padding: '4px 8px', fontSize: 12, borderBottom: `1px solid ${colors.border}`, textAlign: 'center' } as React.CSSProperties,
})

function CardFrame({ title, tip, colors, more, children }: {
  title: string; tip?: string; colors: Record<string, string>
  more?: { open: boolean; toggle: () => void }; children: React.ReactNode
}) {
  const { panel, border, textMuted } = colors
  return (
    <div style={{ background: panel, border: `1px solid ${border}`, borderRadius: 10, marginBottom: 12, overflow: 'hidden' }}>
      <div style={{ padding: '10px 12px', fontWeight: 700, fontSize: 13, borderBottom: `1px solid ${border}` }}>
        {title}{tip && <span title={tip} style={{ marginLeft: 6, color: textMuted, cursor: 'help', fontWeight: 400 }}>ⓘ</span>}
      </div>
      {children}
      {more && (
        <button onClick={more.toggle} style={{ width: '100%', padding: 6, border: 0, borderTop: `1px solid ${border}`, background: 'transparent', color: textMuted, cursor: 'pointer', fontSize: 12 }}>
          {more.open ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  )
}

/** One category of metrics: Strategy, OOS (when marked) and the benchmark side by side. */
function MetricGroupTable({ group, result, colors }: {
  group: typeof METRIC_GROUPS[number]; result: BacktestResult; colors: Record<string, string>
}) {
  const [open, setOpen] = useState(false)
  const { th, td } = tableStyles(colors)
  const rf = result.riskFreeRate
  const rows = open ? group.rows : group.rows.slice(0, VISIBLE_ROWS)
  return (
    <CardFrame title={group.title} colors={colors}
      more={group.rows.length > VISIBLE_ROWS ? { open, toggle: () => setOpen(!open) } : undefined}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', overflowWrap: 'anywhere' }}>
        <thead>
          <tr>
            <th style={th}>Metric</th>
            <th style={th}>Strategy</th>
            {result.oos && <th style={th} title={`Since ${result.oos.from}, after the last edit`}>OOS</th>}
            <th style={{ ...th, color: colors.textMuted }}>{result.benchmarkTicker}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.label}>
              <td style={{ ...td, textAlign: 'left' }}>{row.label}<span title={row.tip} style={{ marginLeft: 4, color: colors.textMuted, cursor: 'help' }}>ⓘ</span></td>
              <td style={{ ...td, fontWeight: 600 }}>{row.value(result.metrics, rf)}</td>
              {result.oos && <td style={td}>{row.value(result.oos.metrics, rf)}</td>}
              <td style={{ ...td, color: colors.textMuted }}>{result.benchmarkMetrics && !row.relative ? row.value(result.benchmarkMetrics, rf) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CardFrame>
  )
}

/** A plain table card; long tables show ten rows until "Show More". */
function Card({ title, tip, head, rows, colors }: {
  title: string; tip?: string; head: string[]; rows: string[][]; colors: Record<string, string>
}) {
  const [open, setOpen] = useState(false)
  const { th, td } = tableStyles(colors)
  const shown = open ? rows : rows.slice(0, 10)
  return (
    <CardFrame title={title} tip={tip} colors={colors}
      more={rows.length > 10 ? { open, toggle: () => setOpen(!open) } : undefined}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', overflowWrap: 'anywhere' }}>
        <thead><tr>{head.map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
        <tbody>{shown.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={td}>{c}</td>)}</tr>)}</tbody>
      </table>
    </CardFrame>
  )
}

function DrawdownTable({ title, periods, colors }: { title: string; periods: DrawdownPeriod[]; colors: Record<string, string> }) {
  return <Card title={title} colors={colors} head={['#', 'Started', 'Recovered', 'Drawdown', 'Days']}
    rows={periods.map((p, i) => [String(i + 1), p.peak, p.recovery ?? 'Ongoing', pct(p.depth), p.durationDays.toLocaleString()])} />
}

function EoyTable({ result, colors }: { result: BacktestResult; colors: Record<string, string> }) {
  const { panel, border, textMuted } = colors
  const years = Object.keys(result.eoyReturns).sort().reverse()
  const thStyle: React.CSSProperties = { padding: '5px 8px', fontWeight: 700, fontSize: 12, background: colors.tabBg, borderBottom: `1px solid ${border}`, textAlign: 'center' }
  const tdStyle: React.CSSProperties = { padding: '4px 8px', fontSize: 12, borderBottom: `1px solid ${border}`, textAlign: 'center' }

  return (
    <div style={{ background: panel, border: `1px solid ${border}`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '10px 12px', fontWeight: 700, fontSize: 13, borderBottom: `1px solid ${border}` }}>
        End of Year Returns
      </div>
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', overflowWrap: 'anywhere' }}>
          <thead>
            <tr>
              <th style={thStyle}>Year</th>
              <th style={thStyle}>Strategy</th>
              <th style={{ ...thStyle, color: textMuted }}>{result.benchmarkTicker}</th>
            </tr>
          </thead>
          <tbody>
            {years.map(y => {
              const s = result.eoyReturns[y]?.strategy ?? 0
              const b = result.eoyReturns[y]?.benchmark ?? 0
              return (
                <tr key={y}>
                  <td style={tdStyle}>{y}</td>
                  <td style={{ ...tdStyle, color: s >= 0 ? colors.gain : colors.loss, fontWeight: 600 }}>{pct(s)}</td>
                  <td style={{ ...tdStyle, color: b >= 0 ? colors.gain : colors.loss }}>{pct(b)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Rolling metrics computation ──────────────────────────────────────────────

function renderRolling(
  el: HTMLElement,
  dr: number[], bdr: number[], dates: string[],
  metric: string, window: number,
  result: BacktestResult, plotlyTheme: object, color: string
) {
  const vals: number[] = []
  for (let i = window; i <= dr.length; i++) {
    const slice = dr.slice(i - window, i)
    vals.push(computeRollingMetric(slice, metric, window))
  }
  const rollingDates = dates.slice(window)
  try {
    Plotly.react(el, [
      { x: rollingDates, y: vals, type: 'scatter', mode: 'lines', name: result.strategyName, line: { color: color } },
    ], { ...plotlyTheme, yaxis: { ...(plotlyTheme as Record<string, unknown>).yaxis as object, title: metric } })
  } catch {
    Plotly.newPlot(el, [
      { x: rollingDates, y: vals, type: 'scatter', mode: 'lines', name: result.strategyName, line: { color: color } },
    ], { ...plotlyTheme, yaxis: { ...(plotlyTheme as Record<string, unknown>).yaxis as object, title: metric } }, { responsive: true })
  }
}

function computeRollingMetric(slice: number[], metric: string, window: number): number {
  const m = slice.reduce((a, b) => a + b, 0) / window
  const s = Math.sqrt(slice.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(1, window - 1))
  switch (metric) {
    case 'sharpe': return s === 0 ? 0 : (m * 252) / (s * Math.sqrt(252))
    case 'sortino': {
      const neg = slice.filter(r => r < 0)
      const ds = neg.length < 2 ? 0 : Math.sqrt(neg.reduce((a, b) => a + b * b, 0) / neg.length * 252)
      return ds === 0 ? 0 : (m * 252) / ds
    }
    case 'cagr': return Math.pow(slice.reduce((a, b) => a * (1 + b), 1), 252 / window) - 1
    case 'vol': return s * Math.sqrt(252)
    default: return 0
  }
}

function computeUnderwater(values: number[]): number[] {
  const uw: number[] = []
  let peak = values[0]
  for (const v of values) {
    if (v > peak) peak = v
    uw.push(v / peak - 1)
  }
  return uw
}

