// ─── Price loading: cache + provider, extended with simulated history ─────────
import type { PriceSeries, PricePoint, Config } from '../types'
import { getCachedPrices, cachePrices, getMissingRange, enforceCacheLimit } from './cache'
import { fetchYahoo } from './yahoo'
import { fetchTiingo } from './tiingo'
import { findSyntheticEntry, blendSeries, calibrateDrift } from './syntheticMap'
import { loadLetfMap, findLetfEntry, estimateParameters, simulateLetf, trimThinTrading, mergeWithSimExtension } from './letf'
import { getSimSeries, loadSimData } from './simData'
import { useLocalCache, isWebsite, loadCachedPrices } from './localCache'
import { healMisprints } from './hygiene'
import { loadDataText } from './staticFile'

export type ProgressCallback = (msg: string) => void

const TODAY = new Date().toISOString().split('T')[0]
const HISTORY_START = '1900-01-01'

/**
 * Adjusted closes for a ticker. Real prices always come first. In Synthetic history mode, a
 * ticker listed in letf-map.json is extended back before its first real price with a
 * simulation of `leverage` × its underlying (bundled …SIM index data, or another ticker).
 */
export function loadTicker(
  ticker: string,
  config: Config,
  onProgress?: ProgressCallback
): Promise<PriceSeries> {
  const key = tierKey(ticker, config)
  let p = inFlight.get(key)
  if (!p) {
    p = loadTickerUncached(ticker, config, onProgress, from => realFrom.set(key, from))
    inFlight.set(key, p)
    p.finally(() => inFlight.delete(key)).catch(() => {})
  }
  return p
}

const inFlight = new Map<string, Promise<PriceSeries>>()

// First date of real (not simulated) prices per loaded ticker, for the chart's data-tier strip.
// null: the whole series is simulated (bundled …SIM index data). Read with realPricesFrom().
const realFrom = new Map<string, string | null>()
const tierKey = (ticker: string, config: Config) => `${ticker}|${config.historyMode}|${config.deepVolatility !== false}`

/** First date of real prices for a ticker loaded with this config; null if all simulated, undefined if not loaded. */
export function realPricesFrom(ticker: string, config: Config): string | null | undefined {
  return realFrom.get(tierKey(ticker, config))
}

async function loadTickerUncached(
  ticker: string,
  config: Config,
  onProgress?: ProgressCallback,
  setRealFrom: (date: string | null) => void = () => {},
): Promise<PriceSeries> {
  const log = (m: string) => onProgress?.(m)

  // ZEROX: cash that earns nothing (QuantMage's empty branches), on CASHX's calendar
  if (ticker === 'ZEROX') {
    const cash = await loadTicker('CASHX', config, onProgress)
    setRealFrom(cash[0]?.date ?? null)  // cash is not a simulated fund
    return cash.map(p => ({ date: p.date, adjClose: 1 }))
  }

  // Columns of the bundled SIM file (QQQSIM, UVIXSIM2, CASHX …) load like tickers
  const isSim = /SIM\d*$/.test(ticker) || ticker === 'CASHX' || ticker === 'INFLATION'
  let real: PriceSeries
  if (isSim) {
    await loadSimData(log)
    real = await getSimSeries(ticker)
    if (real.length === 0) throw new Error(`${ticker} is not in the bundled SIM data`)
    // The SIM file stops in 2026; carry cash forward on BIL's real returns (Crescendo's fallback)
    if (ticker === 'CASHX') real = await extendWithBil(real, config, log)
    // Cash counts as real; every other SIM column is a simulated index
    setRealFrom(ticker === 'CASHX' || ticker === 'INFLATION' ? real[0]?.date ?? null : null)
    // Synthetic engine: the volatility chain's root reaches back to 1986 (roadmap item 11)
    if (ticker === 'UVIXSIM1' && config.historyMode !== 'STANDARD' && config.deepVolatility !== false) {
      real = mergeWithSimExtension(real, await loadUvixSim0())
    }
  } else {
    // A failed download throws: it must not quietly turn into simulated-only history
    real = await loadRealPrices(ticker, config, log)

    const { series: healedSeries, healed } = healMisprints(real)
    for (const h of healed) {
      log(`${ticker}: healed a misprint on ${h.date} (${h.was.toFixed(4)} on no volume, undone the next day; now ${h.now.toFixed(4)})`)
    }
    real = healedSeries
    setRealFrom(real[0]?.date ?? null)
  }

  // Synthetic engine only (deepVolatility off = the Crescendo-compatible engine and parity runs)
  const synth = config.historyMode === 'STANDARD' || config.deepVolatility === false ? null : await findSyntheticEntry(ticker)
  if (synth && !isSim && real.length > 0) {
    const parts = synth.blend ?? { [synth.underlying!]: 1 }
    let ext: PriceSeries
    try {
      const loaded = await Promise.all(Object.entries(parts).map(async ([t, weight]) => ({ series: await loadTicker(t, config, onProgress), weight })))
      ext = loaded.length === 1 ? loaded[0].series : blendSeries(loaded)
    } catch (e) {
      log(`Warning: couldn't extend ${ticker} (${e instanceof Error ? e.message : e}); using its own prices only`)
      return real
    }
    const label = Object.entries(parts).map(([t, w]) => w === 1 ? t : `${Math.round(w * 100)}% ${t}`).join(' + ')
    if (synth.calibrate) {
      const c = calibrateDrift(real, ext)
      ext = c.series
      if (c.perYear !== 0) log(`${ticker}: ${label} calibrated by ${(c.perYear * 100).toFixed(2)}%/yr to match its real growth`)
    }
    const merged = mergeWithSimExtension(real, ext)
    if (merged.length === 0 || merged[0].date >= real[0].date) return real
    log(`${ticker}: real prices from ${real[0].date}, extended (${label}) from ${merged[0].date}`)
    setRealFrom(real[0].date)
    return merged
  }

  const entry = config.historyMode === 'STANDARD' ? null : findLetfEntry(ticker, await loadLetfMap())
  if (!entry || entry.underlying === ticker) return real

  // The underlying, itself already extended (Crescendo's loadUnderlyingInline)
  const underlying = await loadTicker(entry.underlying, config, onProgress).catch(() => [] as PriceSeries)
  if (underlying.length === 0) return real

  // cutoffDate: the fund's own prices before it are replaced by the extension
  const base = entry.cutoffDate ? real.filter(p => p.date >= entry.cutoffDate!) : real
  if (base.length === 0) return real

  let extension = underlying
  if (entry.leverage !== 1) {
    try {
      const cash = await loadTicker('CASHX', config, onProgress)
      const source = trimThinTrading(underlying)
      const params = estimateParameters(base, source, entry.leverage, cash)
      extension = simulateLetf(source, entry.leverage, params, cash)
    } catch (e) {
      log(`Warning: couldn't simulate ${ticker} as ${entry.leverage}x ${entry.underlying} (${e instanceof Error ? e.message : e}); using its own prices only`)
      return real
    }
  }

  const merged = mergeWithSimExtension(base, extension)
  // Crescendo keeps the untrimmed prices when the extension doesn't reach further back
  if (merged.length === 0 || merged[0].date >= real[0].date) return real
  if (!isSim) {
    log(`${ticker}: real prices from ${base[0].date}, simulated (${entry.leverage}x ${entry.underlying}) from ${merged[0].date}`)
    setRealFrom(base[0].date)
  }
  return merged
}

let uvixSim0: Promise<PriceSeries> | null = null
function loadUvixSim0(): Promise<PriceSeries> {
  uvixSim0 ??= loadDataText('uvixSim0').then(text => text.trim().split(/\r?\n/).slice(1).map(line => {
    const [date, close] = line.split(',')
    return { date, adjClose: parseFloat(close) }
  }))
  return uvixSim0
}

async function extendWithBil(cash: PriceSeries, config: Config, log: (m: string) => void): Promise<PriceSeries> {
  let bil: PriceSeries
  try { bil = await loadRealPrices('BIL', config, log) } catch { return cash }
  const last = cash[cash.length - 1]
  const i = bil.findIndex(p => p.date === last.date)
  if (i < 0 || !(bil[i].adjClose > 0)) return cash
  const scale = last.adjClose / bil[i].adjClose
  return [...cash, ...bil.slice(i + 1).map(p => ({ date: p.date, adjClose: p.adjClose * scale }))]
}

/** Real prices from the cache, topped up from the data provider. */
async function loadRealPrices(ticker: string, config: Config, log: (m: string) => void): Promise<PriceSeries> {
  // From disk: price-cache/ first, then the network through the relay
  if (useLocalCache()) {
    try {
      const shipped = await loadCachedPrices(ticker)
      if (!isWebsite()) return shipped
      // Composer Atlas: seed the browser cache once, then fetch only the days since the snapshot.
      if ((await getCachedPrices(ticker)).length === 0) await cachePrices(ticker, shipped, 'SNAPSHOT')
    } catch {
      log(`${ticker} isn't in price-cache/; downloading it...`)
    }
  }
  const cached = await getCachedPrices(ticker)
  const missing = await getMissingRange(ticker, HISTORY_START, TODAY)

  let liveSeries: PriceSeries = []

  if (missing) {
    log(`Fetching ${ticker} from ${missing.start} to ${missing.end}...`)
    try {
      if (config.primaryService === 'YAHOO' || !config.tiingoToken) {
        liveSeries = await fetchYahoo(ticker, missing.start, missing.end, config.corsProxy)
      } else {
        liveSeries = await fetchTiingo(ticker, missing.start, missing.end, config.tiingoToken)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      try {
        if (config.secondaryService === 'TIINGO' && config.tiingoToken) {
          liveSeries = await fetchTiingo(ticker, missing.start, missing.end, config.tiingoToken)
        } else {
          liveSeries = await fetchYahoo(ticker, missing.start, missing.end, config.corsProxy)
        }
      } catch {
        if (cached.length === 0) throw new Error(`Could not fetch ${ticker}: ${msg}`)
        log(`Warning: could not refresh ${ticker}, using cached data`)
      }
    }

    if (liveSeries.length > 0) {
      await cachePrices(ticker, liveSeries, config.primaryService)
      enforceCacheLimit().then(gone => { if (gone.length) log(`Cache over 2 GB: removed ${gone.join(", ")}.`) }, () => {})
    }
  }

  return mergeSeries(cached, liveSeries)
}

/**
 * Load multiple tickers in parallel (with concurrency limit).
 */
export async function loadTickers(
  tickers: string[],
  config: Config,
  onProgress?: ProgressCallback
): Promise<Record<string, PriceSeries>> {
  const unique = [...new Set(tickers)]
  const result: Record<string, PriceSeries> = {}
  const CONCURRENCY = 3

  for (let i = 0; i < unique.length; i += CONCURRENCY) {
    const batch = unique.slice(i, i + CONCURRENCY)
    const loaded = await Promise.allSettled(
      batch.map(t => loadTicker(t, config, onProgress))
    )
    for (let j = 0; j < batch.length; j++) {
      const res = loaded[j]
      if (res.status === 'fulfilled') {
        result[batch[j]] = res.value
      } else {
        onProgress?.(`Warning: failed to load ${batch[j]}: ${res.reason}`)
        result[batch[j]] = []
      }
    }
  }

  return result
}

/** Fetch FRED 3-month T-bill rate for risk-free rate */
export async function fetchRiskFreeRate(fredApiKey?: string): Promise<number> {
  const DEFAULT_RF = 0.0361  // 3.61% as of 2024 average

  if (!fredApiKey) return DEFAULT_RF

  try {
    const url = `https://api.stlouisfed.org/fred/series/observations` +
      `?series_id=TB3MS&api_key=${fredApiKey}&file_type=json` +
      `&sort_order=desc&limit=12&observation_start=2000-01-01`
    const resp = await fetch(url)
    if (!resp.ok) return DEFAULT_RF
    const data = await resp.json()
    const obs = data.observations?.filter((o: { value: string }) => o.value !== '.') ?? []
    if (obs.length === 0) return DEFAULT_RF
    const avg = obs.slice(0, 12).reduce((s: number, o: { value: string }) => s + parseFloat(o.value), 0) / Math.min(obs.length, 12)
    return avg / 100
  } catch {
    return DEFAULT_RF
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mergeSeries(a: PriceSeries, b: PriceSeries): PriceSeries {
  if (a.length === 0) return b
  if (b.length === 0) return a
  const map = new Map<string, PricePoint>()
  for (const p of a) map.set(p.date, p)
  for (const p of b) map.set(p.date, p)  // b wins on overlap
  return Array.from(map.values()).sort((x, y) => x.date < y.date ? -1 : 1)
}
