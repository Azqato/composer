// ─── Chart overlays shared by the app and the exported report: Compare and out-of-sample ─────────
import { ENGINE_LABEL, type BacktestResult, type Engine } from '../types'

/** The other engine's curve, rescaled to start at this run's value on the first shared day. */
export function comparisonTrace(result: BacktestResult, pv: number[], color: string) {
  const c = result.comparison!
  const i0 = Math.max(c.dates.findIndex(d => d >= result.dates[0]), 0)
  const j0 = result.dates.indexOf(c.dates[i0])
  const scale = j0 >= 0 && c.portfolioValues[i0] ? pv[j0] / c.portfolioValues[i0] : 1
  return {
    x: c.dates.slice(i0), y: c.portfolioValues.slice(i0).map(v => v * scale),
    name: ENGINE_LABEL[c.engine as Engine],
    type: 'scatter', mode: 'lines', line: { color, width: 1.5 },
  }
}

/**
 * Where the run's periods begin: real data from the day after the last simulated day (so the band
 * holds only real prices), and out of sample from the day after the symphony's last edit.
 */
export function periodStarts(result: BacktestResult): { realFrom?: string; oosFrom?: string } {
  const tiers = result.dataTiers ?? []
  const simSegs = tiers.filter(t => t.tier === 'simulated')
  const lastSim = simSegs[simSegs.length - 1]
  const realSeg = lastSim ? tiers.slice(tiers.indexOf(lastSim) + 1).find(t => t.tier === 'real') : undefined
  return { realFrom: realSeg?.start, oosFrom: result.oos?.from }
}

/** The shaded periods in order: Synthetic, then In-Sample and Out-of-Sample when there is a last edit, or else Real Data. */
export function periods(result: BacktestResult): { key: 'syn' | 'ins' | 'oos'; label: string; from: string; to: string }[] {
  const { realFrom, oosFrom } = periodStarts(result)
  const first = result.dates[0], end = result.dates[result.dates.length - 1]
  const out: ReturnType<typeof periods> = []
  if (realFrom) out.push({ key: 'syn', label: 'Synthetic', from: first, to: oosFrom && oosFrom < realFrom ? oosFrom : realFrom })
  if (oosFrom) {
    const from = realFrom && realFrom < oosFrom ? realFrom : first
    if (from < oosFrom && !(realFrom && realFrom >= oosFrom)) out.push({ key: 'ins', label: 'In-Sample', from, to: oosFrom })
    out.push({ key: 'oos', label: 'Out-of-Sample', from: oosFrom, to: end })
  } else {
    // No last edit (tickers, pasted JSON): the real prices are one Real Data band, in the In-Sample color
    out.push({ key: 'ins', label: 'Real Data', from: realFrom ?? first, to: end })
  }
  return out
}

/** A curve with a null before each excluded range's gap, so Plotly breaks the line there. */
export function gapped(result: BacktestResult, y: number[]): { x: (string | null)[]; y: (number | null)[] } {
  const gaps = new Set(result.gapAt ?? [])
  const x: (string | null)[] = [], ys: (number | null)[] = []
  result.dates.forEach((d, i) => { if (gaps.has(i)) { x.push(d); ys.push(null) } x.push(d); ys.push(y[i]) })
  return { x, y: ys }
}

/** Plotly shading for the Synthetic, In-Sample and out-of-sample periods. */
export function periodShapes(result: BacktestResult, text: string, fills: Record<'syn' | 'ins' | 'oos', string>) {
  const ps = periods(result)
  if (!ps.length) return {}
  return {
    shapes: ps.map(p => ({ type: 'rect', xref: 'x', yref: 'paper', x0: p.from, x1: p.to, y0: 0, y1: 1,
      fillcolor: fills[p.key], line: { width: 0 }, layer: 'below' })),
    annotations: ps.map(p => ({ xref: 'x', yref: 'paper', x: p.from, y: 1, xanchor: 'left', yanchor: 'bottom',
      text: p.label, showarrow: false, font: { size: 10, color: text } })),
  }
}
