// ─── Local download cache (price-cache/, written by `npm run fetch`) ──────────
// A file opened from disk can't call Yahoo or Composer, but it can load local <script> files.
// scripts/fetch.mjs writes each download as price-cache/<TICKER>.js (and symphonies/<id>.js),
// which sets a global this module reads. The cache sits next to dist/, so the built file
// loads it from ../price-cache/.
import type { PriceSeries } from '../types'

// Composer Atlas clone: from disk the cache sits next to dist/ (../price-cache/); on the
// website it is served beside the page, at /backtest/price-cache/ (absolute, since pages have their own paths).
const CACHE_BASE = location.protocol === 'file:' ? '../price-cache/' : '/backtest/price-cache/'

interface CachedPrices { ticker: string; fetchedAt: string; dates: string[]; closes: number[]; volumes?: (number | null)[] }

declare global {
  interface Window {
    __BT_PRICES__?: Record<string, CachedPrices>
    __BT_SYMPHONIES__?: Record<string, Record<string, unknown>>
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
  return entry.dates.map((date, i) => {
    const v = entry.volumes?.[i]
    return v != null ? { date, adjClose: entry.closes[i], volume: v } : { date, adjClose: entry.closes[i] }
  })
}

export async function loadCachedSymphony(id: string): Promise<Record<string, unknown>> {
  await loadScript('symphonies/' + fileName(id))
  const json = window.__BT_SYMPHONIES__?.[id]
  if (!json) throw new Error(`Symphony ${id} isn't in the local cache. Run: npm run fetch -- ${id}`)
  return json
}
