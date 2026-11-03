// ─── Local download cache (price-cache/, written by `npm run fetch`) ──────────
// A file opened from disk can't call Yahoo or Composer, but it can load local <script> files.
// scripts/fetch.mjs writes each download as price-cache/<TICKER>.js (and symphonies/<id>.js),
// which sets a global this module reads. The cache sits next to dist/, so the built file
// loads it from ../price-cache/.
import type { PriceSeries } from '../types'
import { SITE_BASE } from '../navigation'

// Composer Atlas clone: the cache sits beside the page (backtest/price-cache/), opened from disk
// or served, at /backtest/price-cache/ (absolute, since pages have their own paths).
const CACHE_BASE = location.protocol === 'file:' ? 'price-cache/' : SITE_BASE + 'price-cache/'

interface CachedPrices { ticker: string; fetchedAt: string; dates: string[]; closes: number[]; volumes?: (number | null)[] }

declare global {
  interface Window {
    __BT_PRICES__?: Record<string, CachedPrices>
    __BT_SYMPHONIES__?: Record<string, Record<string, unknown>>
    __BT_RECENT__?: { asOf: string; prices: Record<string, { dates: string[]; closes: number[] }> }
  }
}

/** Same file name rule as scripts/fetch.mjs */
const fileName = (key: string) => key.replace(/[^A-Za-z0-9.-]/g, '_') + '.js'

/** True when the app should read the shipped cache first: the built file, from disk or from the website. */
export const useLocalCache = () => !import.meta.env.DEV

/** Website build: the shipped cache seeds IndexedDB and only newer days come from the relay. */
export const isWebsite = () => !import.meta.env.DEV && location.protocol !== 'file:'

const loaded = new Map<string, Promise<boolean>>()

function loadScript(path: string): Promise<boolean> {
  let p = loaded.get(path)
  if (!p) {
    p = new Promise(resolve => {
      const s = document.createElement('script')
      s.src = CACHE_BASE + path
      s.onload = () => resolve(true)
      s.onerror = () => { loaded.delete(path); s.remove(); resolve(false) }
      document.head.appendChild(s)
    })
    loaded.set(path, p)
  }
  return p
}

export async function loadCachedPrices(ticker: string): Promise<PriceSeries> {
  await loadScript(fileName(ticker))
  const entry = window.__BT_PRICES__?.[ticker]
  if (!entry) throw new Error(`${ticker} isn't in the local price cache. Run: npm run fetch -- ${ticker}`)
  const series: PriceSeries = entry.dates.map((date, i) => {
    const v = entry.volumes?.[i]
    return v != null ? { date, adjClose: entry.closes[i], volume: v } : { date, adjClose: entry.closes[i] }
  })
  // Composer Atlas: the daily feed (scripts/update_backtest_recent.py) writes the last 30 days of
  // every shipped ticker to _recent.js; append the days after the snapshot.
  {
    await loadScript('_recent.js')
    const recent = window.__BT_RECENT__?.prices?.[ticker]
    if (recent) return spliceTail(series, recent.dates.map((date, i) => ({ date, adjClose: recent.closes[i] })))
  }
  return series
}

/**
 * Composer Atlas: append `ext`'s days after `base` ends. Adjusted closes from two downloads can sit on
 * different bases (a dividend between them rescales history), so `ext` is scaled to match `base` on
 * their last shared day. No shared day means a gap: `base` is returned unchanged.
 */
export function spliceTail(base: PriceSeries, ext: PriceSeries): PriceSeries {
  if (!base.length || !ext.length) return base.length ? base : ext
  const last = base[base.length - 1]
  const i = ext.findIndex(p => p.date === last.date)
  if (i < 0 || !(ext[i].adjClose > 0)) return base
  const scale = last.adjClose / ext[i].adjClose
  return [...base, ...ext.slice(i + 1).map(p => ({ ...p, adjClose: p.adjClose * scale }))]
}

export async function loadCachedSymphony(id: string): Promise<Record<string, unknown>> {
  await loadScript('symphonies/' + fileName(id))
  const json = window.__BT_SYMPHONIES__?.[id]
  if (!json) throw new Error(`Symphony ${id} isn't in the local cache. Run: npm run fetch -- ${id}`)
  return json
}
