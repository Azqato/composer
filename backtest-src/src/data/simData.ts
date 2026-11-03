// ─── Testfolio SIM data loader ────────────────────────────────────────────────
// Loads src/assets/data/testfolio-sim.csv (Testfolio_SIM.csv from the Java app).
// The CSV has columns: Date, SPYSIM, QQQSIM, ... (69 tickers)
// Values are index levels (base 10000 at start).
// Parsed once per session and kept in memory; the CSV is bundled, so there's nothing to cache.

import type { PriceSeries } from '../types'
import { loadDataText } from './staticFile'

let simLoadPromise: Promise<void> | null = null
let simLoadedTickers = new Set<string>()
const simSeries = new Map<string, PriceSeries>()

export function isSimLoaded(): boolean {
  return simLoadedTickers.size > 0
}

/**
 * Load SIM data from the CSV file and cache in IndexedDB.
 * Safe to call multiple times: deduplicates via a singleton promise.
 */
export async function loadSimData(
  onProgress?: (msg: string) => void
): Promise<void> {
  if (simLoadPromise) return simLoadPromise
  simLoadPromise = _loadSimData(onProgress)
  return simLoadPromise
}

async function _loadSimData(onProgress?: (msg: string) => void): Promise<void> {
  onProgress?.('Loading SIM historical data...')

  let text: string
  try {
    text = await loadDataText('simCsv')
  } catch (e) {
    onProgress?.(`Could not load SIM data (${(e as Error).message}), so extended history is unavailable.`)
    return
  }

  onProgress?.('Parsing SIM data...')

  const lines = text.split('\n')
  const header = lines[0].split(',')
  const tickerCols = header.slice(1)  // skip 'Date' column

  // Build per-ticker series
  const seriesMap: Record<string, PriceSeries> = {}
  for (const ticker of tickerCols) seriesMap[ticker.trim()] = []

  // Detect and handle gap trimming (identical prices at start = gap)
  const gapEnd: Record<string, string | null> = {}
  const prevValues: Record<string, number> = {}
  const gapStartCounts: Record<string, number> = {}

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const cols = line.split(',')
    const date = cols[0]

    for (let j = 0; j < tickerCols.length; j++) {
      const ticker = tickerCols[j].trim()
      const raw = cols[j + 1]
      if (!raw || raw === '') continue
      const val = parseFloat(raw)
      if (isNaN(val) || val <= 0) continue

      // Gap detection: if price is identical to previous N consecutive days, trim
      if (prevValues[ticker] === val) {
        gapStartCounts[ticker] = (gapStartCounts[ticker] ?? 0) + 1
        if (gapStartCounts[ticker] >= 5 && !gapEnd[ticker]) {
          gapEnd[ticker] = date
        }
      } else {
        gapStartCounts[ticker] = 0
        if (gapEnd[ticker]) gapEnd[ticker] = null  // gap ended, reset
      }
      prevValues[ticker] = val
    }
  }

  // Second pass: build series, skipping gap periods
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const cols = line.split(',')
    const date = cols[0]

    for (let j = 0; j < tickerCols.length; j++) {
      const ticker = tickerCols[j].trim()
      const raw = cols[j + 1]
      if (!raw || raw === '') continue
      const val = parseFloat(raw)
      if (isNaN(val) || val <= 0) continue

      // Skip dates in the gap period
      const ge = gapEnd[ticker]
      if (ge && date <= ge) continue

      seriesMap[ticker].push({ date, adjClose: val })
    }
  }

  for (const [ticker, series] of Object.entries(seriesMap)) {
    if (series.length === 0) continue
    simSeries.set(ticker, series)
    simLoadedTickers.add(ticker)
  }

  onProgress?.(`SIM data loaded: ${simLoadedTickers.size} tickers.`)
}

/**
 * Get SIM data for a ticker name (e.g. "SPYSIM").
 * Returns empty array if SIM data hasn't been loaded yet.
 */
export async function getSimSeries(simTicker: string): Promise<PriceSeries> {
  return simSeries.get(simTicker) ?? []
}

