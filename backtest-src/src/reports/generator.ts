// ─── HTML report generator ────────────────────────────────────────────────────
// A self-contained report laid out as six US Letter pages, with SVG charts, so it prints as it shows.
// Every color is a role from the app's tokens.css / data-colors.css.

import type { BacktestResult, DrawdownPeriod, DataTier, TierSegment } from '../types'
import { KPIS, METRIC_GROUPS, worstDrawdowns, benchmarkDrawdowns, CONTRIBUTION_TIP, contributionRows } from './metricGroups'
import tokensCss from '../styles/tokens.css?raw'
import dataColorsCss from '../styles/data-colors.css?raw'
import { tierShares } from '../engine/tiers'

const START = 100
const PAGES = 6
const GROUP_TITLE: Record<string, string> = { Drawdown: 'Drawdowns', 'Trade Activity': 'Trading Activity' }
const TIER_NAME: Record<DataTier, string> = { real: 'Real', simulated: 'Simulated', filled: 'Filled' }

export function generateReport(result: BacktestResult): string {
  const { dates: DATES, portfolioValues: PV, benchmarkValues: BV, dailyReturns: DR, benchmarkDailyReturns: BDR } = result
  const bench = escHtml(result.benchmarkTicker)
  const name = escHtml(result.strategyName)
  const m = result.metrics, rf = result.riskFreeRate
  const kpi = (label: string) => num(KPIS.find(([l]) => l === label)?.[1](m, rf) ?? '—')
  const tiers = result.dataTiers ?? []
  const simSegs = tiers.filter(t => t.tier === 'simulated')
  // Real data from the day after the last simulated day, so the band and its box hold only real prices
  const lastSim = simSegs[simSegs.length - 1]
  const realSeg = lastSim ? tiers.slice(tiers.indexOf(lastSim) + 1).find(t => t.tier === 'real') : undefined
  const oos = result.oos
  const ctx: ChartCtx = { dates: DATES, realFrom: realSeg && simSegs.length ? realSeg.start : undefined, oosFrom: oos?.from }

  // The comparison run, rescaled to start at this run's value, on this run's dates
  let cmpY: number[] | null = null
  if (result.comparison) {
    const c = result.comparison, at = new Map(c.dates.map((d, i) => [d, c.portfolioValues[i]]))
    const j0 = DATES.findIndex(d => at.has(d))
    if (j0 >= 0) { const k = PV[j0] / at.get(DATES[j0])!; cmpY = DATES.map(d => at.has(d) ? at.get(d)! * k : NaN) }
  }

  const eq = lineChart(ctx, { w: 720, h: 270, log: true, yFmt: v => v >= 1e6 ? (v / 1e6).toLocaleString('en-US') + 'M×' : v >= 1000 ? (v / 1000) + 'k×' : v + '×',
    series: [{ y: BV, cls: 'bench' }, ...(cmpY ? [{ y: cmpY, cls: 'cmp' }] : []), { y: PV, cls: 'strat' }] })

  let peak = PV[0]
  const uw = PV.map(v => { if (v > peak) peak = v; return v / peak - 1 })
  const uwSvg = lineChart(ctx, { w: 720, h: 150, series: [{ y: uw, cls: 'loss' }], yFmt: v => Math.round(v * 100) + '%', fill: true, zero: true })

  const win = 126, rdates = DATES.slice(win + 1)
  const roll = ([['Sharpe', 'sharpe', (v: number) => v.toFixed(0)], ['Sortino', 'sortino', (v: number) => v.toFixed(0)],
    ['CAGR (Capped at 5,000%)', 'cagr', (v: number) => Math.round(v * 100) + '%'], ['Volatility', 'vol', (v: number) => Math.round(v * 100) + '%']] as const)
    .map(([t, k, f]) => `<figure><figcaption>${t}</figcaption>${lineChart({ ...ctx, dates: rdates }, { w: 350, h: 150, series: [{ y: rolling(DR, k, win).slice(0, rdates.length), cls: 'strat-solid' }], yFmt: f, zero: true })}</figure>`).join('')

  // Span figures: annual return (252 trading days a year) and max drawdown from a date to the end
  const spanStats = (from: string) => {
    const v = PV.slice(Math.max(0, DATES.findIndex(d => d >= from)))
    let pk = v[0], dd = 0
    v.forEach(x => { if (x > pk) pk = x; dd = Math.min(dd, x / pk - 1) })
    return { cagr: Math.pow(v[v.length - 1] / v[0], 252 / Math.max(1, v.length - 1)) - 1, dd }
  }
  const note = (title: string, from: string, s: { cagr: number; dd: number }) =>
    `<div class="note"><h3>${title} (${fmtDate(from)})</h3><p>Annual Return <b>${pctS(s.cagr)}</b><br>Max Drawdown <b class="neg">${pctS(s.dd)}</b></p></div>`
  const notes = [
    simSegs.length ? note('Synthetic Data', simSegs[0].start, spanStats(simSegs[0].start)) : '',
    realSeg && simSegs.length ? note('Real Data', realSeg.start, spanStats(realSeg.start)) : '',
    oos ? note('Out of Sample', oos.editedAt, { cagr: oos.metrics.cagr, dd: oos.metrics.maxDrawdown }) : '',
  ].join('')

  let mdd = 0, pk = PV[0]
  PV.forEach(v => { if (v > pk) pk = v; mdd = Math.min(mdd, v / pk - 1) })

  const chips = [`<span class="chip on">Provenance Engine</span>`,
    oos ? `<span class="chip">Out of Sample Since ${fmtDate(oos.editedAt)}</span>` : '',
    tiers.length ? `<span class="chip">${dataShare(tiers, DATES)}</span>` : ''].join('')

  const legend = [`<span><i></i>Backtest</span>`, `<span><i class="b"></i>${bench}</span>`,
    ctx.realFrom ? `<span><i class="re"></i>Real Data (From ${fmtDate(ctx.realFrom)})</span><span><i class="si"></i>Simulated (Unshaded, Until ${fmtDate(simSegs[simSegs.length - 1].end)})</span>` : '',
    oos ? `<span><i class="o"></i>Out of Sample</span>` : '', `<span>Growth of $1, Log Scale</span>`].join('')

  const page = (n: number, inner: string) => `<section class="page">
  <header class="top"><div class="brand">Synthetic Backtester<small>Generated ${new Date(result.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</small></div><div class="meta">${name}<br>${fmtDate(DATES[0])} – ${fmtDate(DATES[DATES.length - 1])}</div></header>
  ${inner}
  <footer><span>Hypothetical, simulated results. Not investment advice. Past performance does not predict future returns.</span><span>Page ${n} of ${PAGES}</span></footer>
</section>`

  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name}</title>
<style>${tokensCss}
${dataColorsCss}</style>
<style>${STYLES}</style>
</head>
<body>
${page(1, `
  <div><h1>${name}</h1></div>
  <div class="chips">${chips}</div>
  <div class="panel">
    <div class="dark">
      ${eq}
      ${tierBar(tiers, DATES)}
      <div class="legend">${legend}</div>
    </div>
    <div class="band" style="grid-template-columns:1fr repeat(5,1fr)">
      <div>Performance</div>
      <div><span>Annual Return</span><b>${pctS(m.cagr)}</b></div>
      <div><span>Max Drawdown</span><b>${kpi('Max Drawdown')}</b></div>
      <div><span>Longest Drawdown</span><b>${kpi('Longest DD Days')} days</b></div>
      <div><span>Return / Max Drawdown</span><b>${kpi('RoMaD')}</b></div>
      <div><span>Calmar</span><b>${kpi('Calmar')}</b></div>
    </div>
    <div class="band two" style="grid-template-columns:1fr repeat(6,1fr)">
      <div>Against ${bench}</div>
      ${['Alpha', 'Beta', 'Correlation', 'R²', 'Information Ratio', 'Treynor'].map(l => `<div><span>${l}</span><b>${kpi(l)}</b></div>`).join('')}
    </div>
    <div class="band money">
      <div>Simulated Returns</div>
      <div><span>Initial Investment</span><b>${usd(START)}</b></div>
      <div class="arrow">→</div>
      <div><span>Max Drawdown</span><b class="dd">${usd(START * (1 + mdd))}</b></div>
      <div class="arrow">→</div>
      <div><span>Final Value</span><b class="final">${usd(START * PV[PV.length - 1] / PV[0])}</b></div>
      <div><span>${bench}</span><b>${usd(START * BV[BV.length - 1] / BV[0])}</b></div>
    </div>
  </div>
  ${notes ? `<div class="notes">${notes}</div>` : ''}
  <div class="light"><h3>End-of-Year Returns</h3>${eoyChart(result)}<div class="legend"><span><i class="sq"></i>Backtest</span><span><i class="sq b"></i>${bench}</span><span>Scale Compressed So Large Years Fit</span></div></div>
`)}

${page(2, `
  <h2>Risk Over Time</h2>
  <div class="light"><h3>Underwater: Distance Below the Previous High</h3>${uwSvg}</div>
  <div class="light"><h3>Daily Returns: How Often Each Size of Move Happened <small>(0.2% bins; moves beyond ±10% counted at the edge)</small></h3>${hist(DR, BDR)}<div class="legend"><span><i class="sq"></i>Backtest</span><span><i class="sq b"></i>${bench}</span></div></div>
  <div class="light"><h3>Rolling 6-Month Metrics</h3><div class="grid2">${roll}</div></div>
`)}

${page(3, `
  <h2>Monthly Returns (%)</h2>
  ${heatTable(result)}
  ${result.holdings || result.contributions ? `<h2>Holdings</h2>
  <div class="grid2">
    <div class="col">${result.holdings ? `<h3>Holdings: Weight When Held, and How Long</h3>${simple(['Ticker', 'Average', 'Min', 'Max', 'Days Held'],
      result.holdings.map(h => [`<b>${escHtml(h.ticker)}</b>`, pct(h.avg), pct(h.min), pct(h.max), `${h.daysHeld.toLocaleString()} (${(h.shareHeld * 100).toFixed(1)}%)`]))}` : ''}</div>
    <div class="col">${result.contributions ? `<h3>Contributions: Share of Gains, Losses and Net Profit</h3>${simple(['Ticker', 'Gains', 'Losses', 'Profit'],
      contributionRows(result.contributions).map(([t, ...r]) => [`<b>${escHtml(t)}</b>`, ...r]))}<p class="fine">${escHtml(CONTRIBUTION_TIP)}</p>` : ''}</div>
  </div>` : ''}
`)}

${page(4, `
  <h2>All Metrics <small>Risk-Free Rate ${pct(rf)}, used by Sharpe, Sortino, Excess CAGR, Alpha and Treynor</small></h2>
  <div class="grid2">
    <div class="col">${[0, 1, 3].map(i => metricTable(METRIC_GROUPS[i], result)).join('')}</div>
    <div class="col">${[2, 4, 5].map(i => metricTable(METRIC_GROUPS[i], result)).join('')}</div>
  </div>
`)}

${page(5, `
  <h2>Worst Drawdowns</h2>
  <div class="grid2"><div><h3>Backtest</h3>${ddTable(worstDrawdowns(result.drawdownPeriods))}</div><div><h3>${bench}</h3>${ddTable(benchmarkDrawdowns(DATES, BV))}</div></div>
`)}

${page(6, `
  <h2>${result.limiters ? 'Start Date and ' : ''}Definitions</h2>
  ${result.limiters ? `<div><h3>What Sets the Start Date: The First Day Each Ticker Has Prices</h3>${simple(['#', 'Ticker', 'Available From', 'Extended By'],
    result.limiters.map((l, i) => [String(i + 1), `<b>${escHtml(l.ticker)}</b>`, l.availableFrom, l.extensionDays ? `${l.extensionDays.toLocaleString()} Days` : '']), [3])}
  <p class="fine">The first price of each ticker; the latest one limits how far back the test can start. Extended by: trading days simulated before real prices.</p></div>` : ''}
  <div><h2>Definitions</h2><div class="defs">${METRIC_GROUPS.map(g => `<h4>${GROUP_TITLE[g.title] ?? g.title}</h4>` + g.rows.map(r => `<p><b>${escHtml(r.label)}.</b> ${escHtml(r.tip)}</p>`).join('')).join('')}</div></div>
`)}
</body>
</html>`
}

// ─── Tables ───────────────────────────────────────────────────────────────────

function simple(head: string[], rows: string[][], numCols = head.map((_, i) => i).slice(1)): string {
  const th = head.map((x, i) => `<th${numCols.includes(i) ? ' class="num"' : ''}>${x}</th>`).join('')
  const tr = rows.map(r => `<tr>${r.map((v, i) => numCols.includes(i) ? `<td class="num${/^-/.test(v) ? ' neg' : ''}">${num(v)}</td>` : `<td>${v}</td>`).join('')}</tr>`).join('')
  return `<table><tr>${th}</tr>${tr}</table>`
}

function metricTable(group: typeof METRIC_GROUPS[number], result: BacktestResult): string {
  const rf = result.riskFreeRate, oos = result.oos, bmm = result.benchmarkMetrics
  const cell = (v: string) => `<td class="num${/^-/.test(v) ? ' neg' : ''}">${num(v)}</td>`
  const rows = group.rows.map(r => `<tr><td>${escHtml(r.label)}</td>${cell(r.value(result.metrics, rf))}${oos ? cell(r.value(oos.metrics, rf)) : ''}${cell(bmm && !r.relative ? r.value(bmm, rf) : '—')}</tr>`).join('')
  return `<table class="metrics"><tr><th>${GROUP_TITLE[group.title] ?? group.title}</th><th class="num">Backtest</th>${oos ? '<th class="num">OOS</th>' : ''}<th class="num">${escHtml(result.benchmarkTicker)}</th></tr>${rows}</table>`
}

function ddTable(periods: DrawdownPeriod[]): string {
  const rows = periods.map((p, i) => `<tr><td>${i + 1}</td><td>${p.peak}</td><td>${p.recovery ?? '<i>Ongoing</i>'}</td><td class="num neg">${num(pct(p.depth))}</td><td class="num">${p.durationDays.toLocaleString()}</td></tr>`).join('')
  return `<table class="dd"><tr><th>#</th><th>Started</th><th>Recovered</th><th class="num">Depth</th><th class="num">Days</th></tr>${rows}</table>`
}

function heatTable(result: BacktestResult): string {
  const by: Record<string, Record<string, number>> = {}
  for (const [d, v] of Object.entries(result.monthlyReturns)) { const [y, mo] = d.split('-'); (by[y] ??= {})[mo] = v.strategy }
  const mn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const cell = (v: number | undefined) => {
    if (v == null) return '<td></td>'
    const a = Math.min(1, Math.abs(v) / 0.6)
    return `<td class="hm" style="background:color-mix(in srgb, var(${v < 0 ? '--bt-loss' : '--bt-gain'}) ${Math.round(a * 100)}%, var(--ti-color-surface));${a > 0.55 ? 'color:var(--ti-color-on-accent)' : ''}">${Math.round(v * 100)}</td>`
  }
  const yr = (v: number | undefined, bold: boolean) => v == null ? '<td></td>' : `<td class="num ${v < 0 ? 'neg' : 'pos'}">${bold ? `<b>${pctS(v, 1)}</b>` : pctS(v, 1)}</td>`
  let t = `<tr><th>Year</th>${mn.map(x => `<th class="num">${x}</th>`).join('')}<th class="num">Year</th><th class="num">${escHtml(result.benchmarkTicker)}</th></tr>`
  for (const y of Object.keys(by).sort().reverse()) {
    const e = result.eoyReturns[y]
    t += `<tr><td>${y}</td>${mn.map((_, i) => cell(by[y][String(i + 1).padStart(2, '0')])).join('')}${yr(e?.strategy, true)}${yr(e?.benchmark, false)}</tr>`
  }
  return `<table class="heat">${t}</table>`
}

// ─── SVG charts ───────────────────────────────────────────────────────────────

interface ChartCtx { dates: string[]; realFrom?: string; oosFrom?: string }
interface LineOpts { w: number; h: number; series: { y: number[]; cls: string }[]; log?: boolean; yFmt: (v: number) => string; zero?: boolean; fill?: boolean }

const stepOf = (n: number, target: number) => Math.max(1, Math.round(n / target))

function lineChart(ctx: ChartCtx, { w, h, series, log = false, yFmt, zero = false, fill = false }: LineOpts): string {
  const L = 4, R = 46, Tp = 6, B = 16
  const xs = ctx.dates, n = xs.length, every = stepOf(n, 900)
  const tf = log ? Math.log10 : (v: number) => v
  let lo = Infinity, hi = -Infinity
  for (const s of series) for (const v of s.y) if (Number.isFinite(v) && (!log || v > 0)) { const t = tf(v); if (t < lo) lo = t; if (t > hi) hi = t }
  if (!Number.isFinite(lo)) { lo = 0; hi = 1 }
  if (zero) hi = Math.max(hi, 0)
  const pad = (hi - lo || 1) * 0.04; lo -= pad; hi += pad
  const X = (i: number) => L + (i / Math.max(1, n - 1)) * (w - L - R)
  const Y = (v: number) => Tp + (1 - (tf(v) - lo) / (hi - lo)) * (h - Tp - B)
  let g = ''
  // Real data as a shaded band, then out of sample on top of it
  const band = (from: string | undefined, cls: string, label: string, tcls: string) => {
    const i = from ? xs.findIndex(d => d >= from) : -1
    if (i >= 0) g += `<rect class="${cls}" x="${X(i)}" y="${Tp}" width="${X(n - 1) - X(i)}" height="${h - Tp - B}"/><text class="ax${tcls}" x="${X(i) + 3}" y="${Tp + 9}">${label}</text>`
  }
  band(ctx.realFrom, 'real', 'Real Data', ' real-t')
  band(ctx.oosFrom, 'oos', 'OOS', '')
  const ticks: number[] = []
  if (log) for (let e = Math.ceil(lo); e <= hi; e++) ticks.push(10 ** e)
  else {
    const st = [0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 50].find(s => (hi - lo) / s <= 6) ?? 100
    for (let v = Math.ceil(lo / st) * st; v <= hi; v += st) ticks.push(+v.toFixed(6))
  }
  for (const t of ticks) g += `<line class="grid" x1="${L}" x2="${w - R}" y1="${Y(t)}" y2="${Y(t)}"/><text class="ax" x="${w - R + 4}" y="${Y(t) + 3}">${yFmt(t)}</text>`
  const yrs = xs.map((d, i) => [d, i] as const).filter(([d], i) => i === 0 || d.slice(0, 4) !== xs[i - 1].slice(0, 4))
  const yst = stepOf(yrs.length, 9)
  yrs.forEach(([d, i], k) => { if (k % yst === 0) g += `<text class="ax" x="${X(i)}" y="${h - 3}" text-anchor="${k === 0 ? 'start' : 'middle'}">${d.slice(0, 4)}</text>` })
  for (const s of series) {
    let d = ''
    s.y.forEach((v, i) => { if ((i % every === 0 || i === n - 1) && Number.isFinite(v) && (!log || v > 0)) d += (d ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1) })
    if (!d) continue
    if (fill) g += `<path class="${s.cls}-fill" d="${d}L${X(n - 1)} ${Y(0)}L${X(0)} ${Y(0)}Z"/>`
    g += `<path class="${s.cls}" d="${d}"/>`
  }
  return `<svg viewBox="0 0 ${w} ${h}" width="100%">${g}</svg>`
}

function rolling(dr: number[], metric: 'sharpe' | 'sortino' | 'cagr' | 'vol', win: number): number[] {
  const res: number[] = []
  for (let i = win; i < dr.length; i++) {
    const s = dr.slice(i - win, i), m = s.reduce((a, b) => a + b, 0) / win
    if (metric === 'sharpe') { const sd = Math.sqrt(s.reduce((a, b) => a + (b - m) ** 2, 0) / (win - 1)) * Math.sqrt(252); res.push(sd === 0 ? 0 : m * 252 / sd) }
    if (metric === 'sortino') { const ng = s.filter(r => r < 0); const ds = ng.length < 2 ? 0 : Math.sqrt(ng.reduce((a, b) => a + b * b, 0) / ng.length * 252); res.push(ds === 0 ? 0 : m * 252 / ds) }
    if (metric === 'cagr') res.push(Math.min(Math.pow(s.reduce((a, b) => a * (1 + b), 1), 252 / win) - 1, 50))
    if (metric === 'vol') res.push(Math.sqrt(s.reduce((a, b) => a + (b - m) ** 2, 0) / (win - 1) * 252))
  }
  return res
}

/** Daily-return histogram: 0.2% bins, clipped to ±10%. */
function hist(dr: number[], bdr: number[]): string {
  const lo = -10, hi = 10, bw = 0.2, nb = (hi - lo) / bw
  const cnt = (arr: number[]) => { const c = new Array(nb).fill(0); arr.forEach(v => { c[Math.floor((Math.max(lo, Math.min(hi - 1e-9, v * 100)) - lo) / bw)]++ }); return c }
  const a = cnt(dr), b = cnt(bdr), max = Math.max(1, ...a, ...b)
  const w = 720, hh = 150, L = 4, R = 46, Tp = 6, B = 16, bwPx = (w - L - R) / nb
  const Y = (v: number) => Tp + (1 - v / max) * (hh - Tp - B)
  let g = ''
  for (const t of [0, Math.round(max / 2), max]) g += `<line class="grid" x1="${L}" x2="${w - R}" y1="${Y(t)}" y2="${Y(t)}"/><text class="ax" x="${w - R + 4}" y="${Y(t) + 3}">${t}</text>`
  for (let x = lo; x <= hi; x += 2.5) g += `<text class="ax" x="${L + (x - lo) / bw * bwPx}" y="${hh - 3}" text-anchor="middle">${x}%</text>`
  b.forEach((v, i) => { if (v) g += `<rect class="bench-bar" x="${L + i * bwPx}" y="${Y(v)}" width="${bwPx}" height="${Y(0) - Y(v)}"/>` })
  a.forEach((v, i) => { if (v) g += `<rect class="strat-bar op" x="${L + i * bwPx}" y="${Y(v)}" width="${bwPx}" height="${Y(0) - Y(v)}"/>` })
  return `<svg viewBox="0 0 ${w} ${hh}" width="100%">${g}</svg>`
}

/** End-of-year bars on a symmetric log scale, so very large and negative years both read. */
function eoyChart(result: BacktestResult): string {
  const years = Object.keys(result.eoyReturns).sort()
  const S = years.map(y => result.eoyReturns[y].strategy), Bm = years.map(y => result.eoyReturns[y].benchmark)
  const w = 720, hh = 175, L = 4, R = 46, Tp = 6, B = 16
  const f = (v: number) => Math.sign(v) * Math.log10(1 + Math.abs(v) * 100)
  const vals = [...S, ...Bm].map(f), hi = Math.max(0.1, ...vals), lo = Math.min(...vals, 0)
  const Y = (v: number) => Tp + (1 - (f(v) - lo) / (hi - lo)) * (hh - Tp - B)
  const n = Math.max(1, years.length), gw = (w - L - R) / n, bw = gw * 0.38
  let g = ''
  for (const t of [-0.75, -0.25, 0, 0.25, 1, 4, 20]) if (f(t) >= lo && f(t) <= hi) g += `<line class="grid" x1="${L}" x2="${w - R}" y1="${Y(t)}" y2="${Y(t)}"/><text class="ax" x="${w - R + 4}" y="${Y(t) + 3}">${Math.round(t * 100).toLocaleString('en-US')}%</text>`
  years.forEach((yr, i) => {
    const x = L + i * gw + gw * 0.1
    for (const [v, c, dx] of [[S[i], 'strat-bar', 0], [Bm[i], 'bench-bar solid', bw]] as const) {
      const y0 = Y(0), y1 = Y(v)
      g += `<rect class="${c}" x="${x + dx}" y="${Math.min(y0, y1)}" width="${bw}" height="${Math.abs(y1 - y0)}"/>`
    }
    if (i % stepOf(n, 13) === 0) g += `<text class="ax" x="${x + bw}" y="${hh - 3}" text-anchor="middle">${yr}</text>`
  })
  return `<svg viewBox="0 0 ${w} ${hh}" width="100%">${g}</svg>`
}

/** The data-tier strip and its legend under the growth chart. */
function tierBar(segs: TierSegment[], dates: string[]): string {
  if (!segs.length) return ''
  const shares = tierShares(segs, dates)
  const index = new Map(dates.map((d, i) => [d, i]))
  const days = (s: TierSegment) => (index.get(s.end) ?? 0) - (index.get(s.start) ?? 0) + 1
  return `<div class="tierbar">${segs.map(s => `<div class="t-${s.tier}" style="flex:${days(s)} 0 0" title="${TIER_NAME[s.tier]}: ${s.start} to ${s.end}"></div>`).join('')}</div>
      <div class="tierlegend">${(['simulated', 'real', 'filled'] as DataTier[]).map(t => {
        // One entry per tier: its first and last day, and how many separate stretches when it switches
        const own = segs.filter(s => s.tier === t)
        if (!own.length || shown(shares[t]) === '0.0%') return ''
        const n = own.length > 1 ? `, ${own.length.toLocaleString()} stretches` : ''
        return `<span><i class="t-${t}"></i>${TIER_NAME[t]}: ${fmtDate(own[0].start)} – ${fmtDate(own[own.length - 1].end)}${n}</span>`
      }).join('')}</div>`
}

/** "Data: Real 68%, Simulated 32%"; a tier is named only when some days used it. */
function dataShare(segs: TierSegment[], dates: string[]): string {
  const s = tierShares(segs, dates)
  return 'Data: ' + (Object.keys(TIER_NAME) as DataTier[]).filter(t => shown(s[t]) !== '0.0%').map(t => `${TIER_NAME[t]} ${shown(s[t])}`).join(', ')
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

/** A tier's share as shown: whole percent, one decimal under 1%; "0.0%" means it is left out. */
const shown = (v: number) => `${(v * 100).toFixed(v < 0.01 ? 1 : 0)}%`

function pct(v: number): string {
  return isFinite(v) ? (v * 100).toFixed(2) + '%' : '—'
}
/** Percent with a true minus sign */
function pctS(v: number, d = 2): string {
  return isFinite(v) ? (v < 0 ? '−' : '') + Math.abs(v * 100).toFixed(d) + '%' : '—'
}
const num = (v: string) => v.replace(/^-/, '−')
const usd = (v: number) => '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 })

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function fmtDate(d: string): string {
  return new Date(d.slice(0, 10) + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const STYLES = `
  @page { size: letter; margin: 0.45in; }
  :root {
    --ink:var(--ti-color-text); --muted:var(--ti-color-text-muted); --line:var(--ti-color-border); --soft:var(--ti-color-surface);
    --accent:var(--bt-series-strategy); --bench:var(--bt-series-benchmark); --cmp:var(--bt-series-compare);
    --gain:var(--bt-gain); --neg:var(--bt-loss); --oos:var(--bt-oos);
  }
  * { box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  body { margin:0; background:var(--ti-color-border); color:var(--ink); font:8.5pt/1.35 "Inter","Segoe UI",system-ui,sans-serif; }
  .page { width:8.5in; min-height:11in; padding:0.45in; margin:0.3in auto; background:var(--ti-color-canvas); box-shadow:0 2px 12px color-mix(in srgb, var(--ti-color-text) 15%, transparent); display:flex; flex-direction:column; gap:10px; }
  @media print { body{background:var(--ti-color-canvas)} .page{margin:0;box-shadow:none;width:auto;min-height:10.1in;padding:0;break-after:page} .page:last-child{break-after:auto} }
  header.top { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:1px solid var(--line); padding-bottom:6px; }
  .brand { font-weight:700; font-size:9.5pt; } .brand small { display:block; font-weight:400; color:var(--ink); font-size:7.5pt; }
  .meta { text-align:right; color:var(--ink); font-size:7.5pt; }
  h1 { margin:0; font-size:16pt; display:flex; align-items:center; gap:8px; } h1::before { content:""; width:9px; height:9px; border-radius:50%; background:var(--accent); }
  .chips { display:flex; gap:5px; flex-wrap:wrap; } .chip { border:1px solid var(--ti-color-border-strong); border-radius:999px; padding:1px 8px; font-size:7.5pt; color:var(--ink); } .chip.on { background:var(--ti-color-accent-bg); border-color:var(--ti-color-accent-bg); color:var(--ti-color-on-accent); }
  h2 { font-size:10.5pt; margin:0 0 4px; } h2 small { font-weight:400; color:var(--muted); font-size:8pt; } h3 { font-size:8.5pt; margin:0 0 3px; } h3 small { font-weight:400; color:var(--muted); font-size:7pt; }
  .panel { flex-shrink:0; border-radius:8px; overflow:hidden; border:1px solid var(--ti-color-border-strong); }
  .dark { background:var(--ti-color-canvas); padding:8px 8px 4px; }
  svg .grid { stroke:var(--line); stroke-width:.6 } svg .ax { fill:var(--muted); font-size:8px; }
  svg path { fill:none; } svg .oos { fill:var(--oos); opacity:.8 } svg .real { fill:color-mix(in srgb, var(--bt-tier-real) 10%, transparent); } svg .real-t { fill:var(--bt-tier-real); font-weight:600 }
  svg .strat { stroke:var(--accent); stroke-width:1.3; } svg .strat-solid { stroke:var(--accent); stroke-width:1; }
  svg .bench { stroke:var(--bench); stroke-width:1.1; stroke-dasharray:5 3; } svg .cmp { stroke:var(--cmp); stroke-width:1; stroke-dasharray:2 2; }
  svg .loss { stroke:var(--neg); stroke-width:.8; } svg .loss-fill { fill:var(--neg); opacity:.8; stroke:none; }
  svg .strat-bar { fill:var(--accent); } svg .strat-bar.op { opacity:.7 } svg .bench-bar { fill:var(--bench); opacity:.7 } svg .bench-bar.solid { opacity:1 }
  .legend { display:flex; justify-content:center; gap:14px; color:var(--muted); font-size:7pt; padding:2px 0 4px; flex-wrap:wrap; }
  .legend i { display:inline-block; width:14px; height:0; border-top:2px solid var(--accent); vertical-align:middle; margin-right:4px; }
  .legend i.b { border-top:2px dotted var(--bench); } .legend i.o { border:0; height:8px; width:12px; background:var(--oos); }
  .legend i.sq { border-top:6px solid var(--accent); } .legend i.sq.b { border-top:6px solid var(--bench); }
  .legend i.re { border:0; height:8px; width:12px; background:color-mix(in srgb, var(--bt-tier-real) 10%, transparent); outline:1px solid var(--bt-tier-real); } .legend i.si { border:0; height:8px; width:12px; outline:1px solid var(--ti-color-border-strong); }
  .tierbar { display:flex; height:6px; border-radius:3px; overflow:hidden; margin:2px 46px 2px 4px; } .tierbar div { min-width:1px; }
  .tierlegend { display:flex; flex-wrap:wrap; gap:4px 12px; color:var(--muted); font-size:7pt; margin:2px 4px; }
  .tierlegend i { display:inline-block; width:8px; height:8px; border-radius:2px; margin-right:4px; vertical-align:-1px; }
  .t-real { background:var(--bt-tier-real); } .t-simulated { background:var(--bt-tier-simulated); } .t-filled { background:var(--bt-tier-pathing); }
  .band { display:grid; background:var(--ti-color-accent-bg); color:var(--ti-color-on-accent); } .band > div { padding:7px 10px; border-left:1px solid color-mix(in srgb, var(--ti-color-on-accent) 30%, transparent); } .band > div:first-child { border-left:0; font-weight:600; }
  .band span { display:block; font-size:7pt; opacity:.85; } .band b { font-size:13pt; font-weight:600; }
  .band.two { background:var(--ti-color-surface); color:var(--ti-color-text); border-top:1px solid var(--ti-color-border); } .band.two > div { border-left-color:var(--ti-color-border); } .band.two span { color:var(--ti-color-text-muted); opacity:1; } .band.two b { font-size:10pt; }
  .band.money { grid-template-columns:1fr auto 22px auto 22px auto 1.3fr; background:var(--ti-color-surface); color:var(--ti-color-text); border-top:1px solid var(--ti-color-border); align-items:center; }
  .band.money > div { border-left:0; } .band.money span { color:var(--ti-color-text-muted); opacity:1; } .band.money b { font-size:10pt; }
  .band.money .dd { color:var(--bt-loss); background:color-mix(in srgb, var(--bt-loss) 12%, transparent); border-radius:4px; padding:0 5px; }
  .band.money .arrow { padding:0; color:var(--bt-gain); font-size:11pt; text-align:center; }
  .band.money .final { color:var(--bt-gain); background:color-mix(in srgb, var(--bt-gain) 12%, transparent); border-radius:4px; padding:0 5px; }
  .notes { display:grid; grid-auto-flow:column; grid-auto-columns:1fr; gap:8px; }
  .note { background:var(--soft); border-radius:6px; padding:7px 9px; } .note h3 { font-size:7pt; color:var(--muted); text-transform:uppercase; letter-spacing:.04em; font-weight:600; } .note p { margin:0; }
  .light { border:1px solid var(--line); border-radius:8px; padding:8px 8px 2px; }
  .light figcaption { font-size:7.5pt; color:var(--muted); margin:0 4px 2px; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; } figure { margin:0; }
  table { width:100%; border-collapse:separate; border-spacing:0; border:1px solid var(--line); border-radius:6px; overflow:hidden; break-inside:avoid; font-size:7.5pt; }
  th { background:var(--soft); color:var(--muted); font-weight:600; font-size:7pt; text-align:left; padding:3px 6px; border-bottom:1px solid var(--line); }
  td { padding:2px 6px; border-bottom:1px solid var(--line); font-variant-numeric:tabular-nums; } tr:last-child td { border-bottom:0; }
  table.heat, table.dd, table.long { break-inside:auto; } tr { break-inside:avoid; }
  .num { text-align:right; } .neg { color:var(--neg); } .pos { color:var(--gain); }
  .fine { margin:3px 0 0; color:var(--muted); font-size:7pt; }
  table.metrics th:first-child { color:var(--ink); font-size:7.5pt; } table.metrics td { padding:1.4px 6px; }
  table.dd td, table.dd th { padding:1.2px 6px; font-size:7pt; }
  table.heat td, table.heat th { padding:2px 4px; text-align:center; } table.heat td.hm { font-size:7pt; border-left:1px solid var(--ti-color-canvas); }
  .col { display:flex; flex-direction:column; gap:8px; }
  .defs { columns:3; column-gap:14px; font-size:6.8pt; } .defs h4 { font-size:7.5pt; margin:6px 0 2px; break-after:avoid; } .defs p { margin:0 0 2px; break-inside:avoid; }
  footer { margin-top:auto; display:flex; justify-content:space-between; color:var(--muted); font-size:6.5pt; border-top:1px solid var(--line); padding-top:5px; }
`
