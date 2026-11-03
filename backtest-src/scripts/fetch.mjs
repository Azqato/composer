// Downloads prices (and Composer symphonies) into price-cache/ for the app opened from disk.
//   npm run fetch -- SPY TLT                       tickers
//   npm run fetch -- https://app.composer.trade/symphony/<id>   a symphony and every ticker it uses
//   npm run fetch -- --refresh                     top up every ticker already cached
// The browser can't call Yahoo or Composer from a file on disk (no CORS headers), but it can load
// local <script> files, so each download is written as a small .js file the app loads by name
// (the same trick as the VIX page's data/vix.js). Running it again only fetches the new days.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const cacheDir = join(root, 'price-cache')
const symphonyDir = join(cacheDir, 'symphonies')
mkdirSync(symphonyDir, { recursive: true })

// Same file name rule as src/data/localCache.ts
export const fileName = ticker => ticker.replace(/[^A-Za-z0-9.-]/g, '_') + '.js'

const letfMap = JSON.parse(readFileSync(join(root, 'src/assets/data/letf-map.json'), 'utf8').replace(/^﻿/, ''))
const underlyingOf = new Map(letfMap.map(e => [e.ticker, e.underlying]))

// ── Arguments ──
const args = process.argv.slice(2)
if (args.length === 0) {
  console.log('Usage: npm run fetch -- <tickers | Composer links or IDs> [--refresh]')
  process.exit(1)
}
const tickers = new Set()
for (const a of args) {
  if (a === '--refresh') {
    for (const f of readdirSync(cacheDir)) if (f.endsWith('.js')) tickers.add(readCache(join(cacheDir, f))?.ticker)
    continue
  }
  const id = symphonyId(a)
  if (id) {
    const json = await fetchSymphony(id)
    for (const t of symphonyTickers(json)) tickers.add(t)
    continue
  }
  tickers.add(a.toUpperCase())
}
tickers.delete(undefined)

// Leveraged funds are extended with their underlying's history, so fetch that too
for (const t of [...tickers]) {
  let u = underlyingOf.get(t)
  while (u && !/SIM\d*$/.test(u) && u !== 'CASHX' && !tickers.has(u)) {
    tickers.add(u)
    u = underlyingOf.get(u)
  }
}
// Cash (CASHX) runs past the end of the bundled SIM file on BIL's returns
if (tickers.size > 0) tickers.add('BIL')
tickers.delete('ZEROX')

// ── Prices ──
let failed = 0
for (const t of [...tickers].sort()) {
  try {
    await fetchPrices(t)
  } catch (e) {
    failed++
    console.log(`✗ ${t}: ${e.message}`)
  }
}
console.log(`\nCache: ${cacheDir}`)
if (failed) process.exit(1)

// ─────────────────────────────────────────────────────────────────────────────

function symphonyId(s) {
  const m = s.match(/symphony\/([A-Za-z0-9_-]+)/)
  if (m) return m[1]
  return /^[A-Za-z0-9]{16,32}$/.test(s) && /[a-z]/.test(s) && /[A-Z]/.test(s) ? s : null
}

async function fetchSymphony(id) {
  const url = `https://api.composer.trade/api/v0.1/symphonies/${id}/score?score_version=v1`
  const resp = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!resp.ok) throw new Error(`Composer returned ${resp.status} for symphony ${id} (is it public?)`)
  const json = JSON.parse((await resp.text()).replace(/"EQUITIES::([^"/]+)\/\/USD"/g, '"$1"'))
  if (!json.id) json.id = id
  // Last logic edit = start of out-of-sample days; only the backtest endpoint returns it
  try {
    const end = new Date(), start = new Date(end.getTime() - 10 * 86400000)
    const bt = await fetch(`https://api.composer.trade/api/v0.1/symphonies/${id}/backtest`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ capital: 10000, broker: 'alpaca', slippage_percent: 0, apply_reg_fee: true, apply_taf_fee: true, start_date: start.toISOString().slice(0, 10), end_date: end.toISOString().slice(0, 10) }),
    })
    const edited = bt.ok ? (await bt.json()).last_semantic_update_at : null
    if (typeof edited === 'string') json.last_semantic_update_at = edited.slice(0, 10)
  } catch { /* no OOS date */ }
  writeFileSync(join(symphonyDir, fileName(id)),
    `window.__BT_SYMPHONIES__ = window.__BT_SYMPHONIES__ || {};\nwindow.__BT_SYMPHONIES__[${JSON.stringify(id)}] = ${JSON.stringify(json)};\n`)
  console.log(`✓ symphony ${id}: ${json.name ?? ''}`)
  return json
}

// Every ticker a score JSON trades or reads an indicator from (mirrors symphonyTickers in evaluator.ts)
function symphonyTickers(node, out = new Set()) {
  if (Array.isArray(node)) { node.forEach(n => symphonyTickers(n, out)); return out }
  if (!node || typeof node !== 'object') return out
  const isTicker = v => typeof v === 'string' && v && v !== '%' && !/^-?\d+(\.\d+)?$/.test(v)
  if (node.step === 'asset') out.add(String(node.ticker ?? node.symbol))
  for (const k of ['lhs-val', 'rhs-val']) {
    if (isTicker(node[k]) && !(k === 'rhs-val' && node['rhs-fixed-value?'] === true)) out.add(node[k])
  }
  if (isTicker(node.ticker) && node.step !== 'asset' && node.fn) out.add(node.ticker)
  if (Array.isArray(node.tickers)) node.tickers.filter(isTicker).forEach(t => out.add(t))
  for (const v of Object.values(node)) if (v && typeof v === 'object') symphonyTickers(v, out)
  return out
}

function readCache(file) {
  if (!existsSync(file)) return null
  const text = readFileSync(file, 'utf8')
  const m = text.match(/= (\{[\s\S]*\});\s*$/)
  return m ? JSON.parse(m[1]) : null
}

async function fetchPrices(ticker) {
  const file = join(cacheDir, fileName(ticker))
  const old = readCache(file)
  // Re-fetch a week of overlap so late corrections replace the last cached days
  const from = old?.dates?.length
    ? Math.floor(Date.parse(old.dates[Math.max(0, old.dates.length - 5)]) / 1000)
    : -2208988800   // 1900-01-01
  const to = Math.floor(Date.now() / 1000) + 86400

  let data = null
  for (const host of ['query1', 'query2']) {
    const url = `https://${host}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}` +
      `?interval=1d&period1=${from}&period2=${to}&includeAdjustedClose=true&events=div|split`
    const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }).catch(() => null)
    if (!resp?.ok) continue
    const r = (await resp.json())?.chart?.result?.[0]
    if (r?.timestamp) { data = r; break }
  }
  if (!data) throw new Error('Yahoo has no data for this ticker')

  const adj = data.indicators.adjclose?.[0]?.adjclose ?? data.indicators.quote[0].close
  const vol = data.indicators.quote[0]?.volume ?? []
  const fresh = new Map()
  data.timestamp.forEach((ts, i) => {
    const v = adj[i]
    if (v != null && v > 0) fresh.set(new Date(ts * 1000).toISOString().slice(0, 10), [v, vol[i] ?? null])
  })

  // Adjusted closes are restated after every dividend, so when new days arrive the whole
  // history is re-fetched rather than mixing old and new adjustment bases.
  if (old && fresh.size > 0 && [...fresh.keys()].some(d => d > old.dates[old.dates.length - 1])) {
    const firstFresh = [...fresh.keys()][0]
    const i = old.dates.indexOf(firstFresh)
    if (i < 0 || Math.abs(old.closes[i] / fresh.get(firstFresh)[0] - 1) > 1e-6) {
      return fetchFull(ticker, file)
    }
  }

  // A cache written before volumes were stored is re-fetched once to get them
  if (old && !old.volumes) return fetchFull(ticker, file)
  const merged = new Map(old ? old.dates.map((d, i) => [d, [old.closes[i], old.volumes[i]]]) : [])
  for (const [d, v] of fresh) merged.set(d, v)
  write(ticker, file, merged, old)
}

async function fetchFull(ticker, file) {
  writeFileSync(file, '')      // drop the stale basis, then fetch from scratch
  return fetchPrices(ticker)
}

function write(ticker, file, merged, old) {
  const dates = [...merged.keys()].sort()
  const closes = dates.map(d => merged.get(d)[0])
  const volumes = dates.map(d => merged.get(d)[1])
  const entry = { ticker, fetchedAt: new Date().toISOString(), dates, closes, volumes }
  writeFileSync(file,
    `window.__BT_PRICES__ = window.__BT_PRICES__ || {};\nwindow.__BT_PRICES__[${JSON.stringify(ticker)}] = ${JSON.stringify(entry)};\n`)
  const added = dates.length - (old?.dates?.length ?? 0)
  console.log(`✓ ${ticker}: ${dates[0]} → ${dates[dates.length - 1]} (${old ? `+${added} days` : `${dates.length} days`})`)
}
