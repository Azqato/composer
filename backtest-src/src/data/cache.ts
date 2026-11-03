// ─── IndexedDB price and symphony cache ────────────────────────────────────────────────────
import type { PriceSeries } from '../types'

const DB_NAME = 'BacktestCache'
const DB_VERSION = 2
const STORE_PRICES = 'prices'
const STORE_SEGMENTS = 'segments'
const STORE_SYMPHONIES = 'symphonies'  // score JSON of each symphony loaded from a link (v2)

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (ev) => {
      const db = (ev.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_PRICES)) {
        const ps = db.createObjectStore(STORE_PRICES, { keyPath: ['ticker', 'date'] })
        ps.createIndex('byTicker', 'ticker')
      }
      if (!db.objectStoreNames.contains(STORE_SEGMENTS)) {
        const ss = db.createObjectStore(STORE_SEGMENTS, { keyPath: ['ticker', 'startDate'] })
        ss.createIndex('byTicker', 'ticker')
      }
      if (!db.objectStoreNames.contains(STORE_SYMPHONIES)) {
        db.createObjectStore(STORE_SYMPHONIES, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

function tx(
  db: IDBDatabase,
  stores: string[],
  mode: IDBTransactionMode
): IDBTransaction {
  return db.transaction(stores, mode)
}

function promisify<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((res, rej) => {
    req.onsuccess = () => res(req.result)
    req.onerror = () => rej(req.error)
  })
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface CacheSegment {
  ticker: string
  startDate: string
  endDate: string
  source: string
  fetchedAt: number
}

export async function getCachedPrices(ticker: string): Promise<PriceSeries> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const t = tx(db, [STORE_PRICES], 'readonly')
    const idx = t.objectStore(STORE_PRICES).index('byTicker')
    const req = idx.getAll(IDBKeyRange.only(ticker))
    req.onsuccess = () => {
      const rows = req.result as { ticker: string; date: string; adjClose: number; volume?: number }[]
      resolve(rows.map(r => (r.volume != null ? { date: r.date, adjClose: r.adjClose, volume: r.volume } : { date: r.date, adjClose: r.adjClose })).sort((a, b) => a.date < b.date ? -1 : 1))
    }
    req.onerror = () => reject(req.error)
  })
}

export async function cachePrices(ticker: string, series: PriceSeries, source: string): Promise<void> {
  if (series.length === 0) return
  const db = await openDb()
  const t = tx(db, [STORE_PRICES, STORE_SEGMENTS], 'readwrite')
  const ps = t.objectStore(STORE_PRICES)
  const ss = t.objectStore(STORE_SEGMENTS)

  for (const p of series) {
    ps.put({ ticker, date: p.date, adjClose: p.adjClose, volume: p.volume, source })
  }

  const startDate = series[0].date
  const endDate = series[series.length - 1].date
  ss.put({ ticker, startDate, endDate, source, fetchedAt: Date.now() })

  return new Promise((res, rej) => {
    t.oncomplete = () => res()
    t.onerror = () => rej(t.error)
  })
}

export async function getCacheSegments(ticker: string): Promise<CacheSegment[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const t = tx(db, [STORE_SEGMENTS], 'readonly')
    const idx = t.objectStore(STORE_SEGMENTS).index('byTicker')
    const req = idx.getAll(IDBKeyRange.only(ticker))
    req.onsuccess = () => resolve(req.result as CacheSegment[])
    req.onerror = () => reject(req.error)
  })
}

/** Returns the date range NOT yet cached for this ticker */
export async function getMissingRange(
  ticker: string,
  requestedStart: string,
  requestedEnd: string
): Promise<{ start: string; end: string } | null> {
  const segments = await getCacheSegments(ticker)
  if (segments.length === 0) return { start: requestedStart, end: requestedEnd }

  const covered = segments.reduce(
    (acc, s) => ({
      start: acc.start < s.startDate ? acc.start : s.startDate,
      end: acc.end > s.endDate ? acc.end : s.endDate,
    }),
    { start: '9999-99-99', end: '0000-00-00' }
  )

  const today = new Date().toISOString().split('T')[0]
  // Always refresh if cache is stale (>1 day old for the end of range)
  const stale = segments.some(s => Date.now() - s.fetchedAt > 86400000 && s.endDate >= today)

  if (!stale && covered.start <= requestedStart && covered.end >= requestedEnd) {
    return null  // fully cached
  }
  return { start: covered.end, end: requestedEnd }  // fetch tail
}

export async function clearCache(ticker?: string): Promise<void> {
  const db = await openDb()
  if (ticker) {
    const t = tx(db, [STORE_PRICES, STORE_SEGMENTS], 'readwrite')
    const ps = t.objectStore(STORE_PRICES)
    const ss = t.objectStore(STORE_SEGMENTS)
    const pidx = ps.index('byTicker')
    const sidx = ss.index('byTicker')
    await new Promise<void>((res, rej) => {
      const req = pidx.openCursor(IDBKeyRange.only(ticker))
      req.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) { cursor.delete(); cursor.continue() }
        else res()
      }
      req.onerror = () => rej(req.error)
    })
    await new Promise<void>((res, rej) => {
      const req = sidx.openCursor(IDBKeyRange.only(ticker))
      req.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) { cursor.delete(); cursor.continue() }
        else res()
      }
      req.onerror = () => rej(req.error)
    })
  } else {
    const t = tx(db, [STORE_PRICES, STORE_SEGMENTS, STORE_SYMPHONIES], 'readwrite')
    t.objectStore(STORE_PRICES).clear()
    t.objectStore(STORE_SEGMENTS).clear()
    t.objectStore(STORE_SYMPHONIES).clear()
    await new Promise<void>((res, rej) => {
      t.oncomplete = () => res()
      t.onerror = () => rej(t.error)
    })
  }
}

export async function listCachedTickers(): Promise<{ ticker: string; count: number; start: string; end: string }[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const t = tx(db, [STORE_SEGMENTS], 'readonly')
    const req = t.objectStore(STORE_SEGMENTS).getAll()
    req.onsuccess = () => {
      const segs = req.result as CacheSegment[]
      const grouped: Record<string, { count: number; start: string; end: string }> = {}
      for (const s of segs) {
        if (!grouped[s.ticker]) grouped[s.ticker] = { count: 0, start: s.startDate, end: s.endDate }
        grouped[s.ticker].count++
        if (s.startDate < grouped[s.ticker].start) grouped[s.ticker].start = s.startDate
        if (s.endDate > grouped[s.ticker].end) grouped[s.ticker].end = s.endDate
      }
      resolve(Object.entries(grouped).map(([ticker, v]) => ({ ticker, ...v })))
    }
    req.onerror = () => reject(req.error)
  })
}

export interface SavedSymphony { id: string; savedAt: string; json: Record<string, unknown> }

/** Keep the latest score JSON fetched for a symphony link. */
export async function saveSymphony(id: string, json: Record<string, unknown>): Promise<void> {
  const db = await openDb()
  const saved: SavedSymphony = { id, savedAt: new Date().toISOString(), json }
  await promisify(tx(db, [STORE_SYMPHONIES], 'readwrite').objectStore(STORE_SYMPHONIES).put(saved))
}

export async function getSavedSymphony(id: string): Promise<SavedSymphony | undefined> {
  const db = await openDb()
  return promisify(tx(db, [STORE_SYMPHONIES], 'readonly').objectStore(STORE_SYMPHONIES).get(id))
}

// ─── Size limit ───────────────────────────────────────────────────────────────
// Past 2 GB the tickers fetched longest ago are removed until usage is back under it.
// Saved symphonies are tiny and kept.
export const CACHE_LIMIT_BYTES = 2 * 1024 ** 3

export async function enforceCacheLimit(limit = CACHE_LIMIT_BYTES): Promise<string[]> {
  if (!navigator.storage?.estimate) return []
  let usage = (await navigator.storage.estimate()).usage ?? 0
  if (usage <= limit) return []
  const db = await openDb()
  const segs = await promisify(tx(db, [STORE_SEGMENTS], 'readonly').objectStore(STORE_SEGMENTS).getAll()) as CacheSegment[]
  const lastFetched = new Map<string, number>()
  for (const s of segs) lastFetched.set(s.ticker, Math.max(lastFetched.get(s.ticker) ?? 0, s.fetchedAt))
  const oldestFirst = [...lastFetched].sort((a, b) => a[1] - b[1]).map(([t]) => t)
  const removed: string[] = []
  for (const ticker of oldestFirst) {
    if (usage <= limit * 0.9) break  // leave headroom so the next download doesn't trip it again
    await clearCache(ticker)
    removed.push(ticker)
    usage = (await navigator.storage.estimate()).usage ?? 0
  }
  return removed
}
