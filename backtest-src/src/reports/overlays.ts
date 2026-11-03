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

/** Plotly shading for the out-of-sample days (after the symphony's last edit). */
export function oosShape(result: BacktestResult, text: string, fill: string) {
  if (!result.oos) return {}
  const end = result.dates[result.dates.length - 1]
  return {
    shapes: [{ type: 'rect', xref: 'x', yref: 'paper', x0: result.oos.from, x1: end, y0: 0, y1: 1,
      fillcolor: fill, line: { width: 0 }, layer: 'below' }],
    annotations: [{ xref: 'x', yref: 'paper', x: result.oos.from, y: 1, xanchor: 'left', yanchor: 'bottom',
      text: 'OOS', showarrow: false, font: { size: 10, color: text } }],
  }
}
