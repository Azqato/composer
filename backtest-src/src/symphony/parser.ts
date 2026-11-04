// ─── Composer symphony JSON parser ────────────────────────────────────────────
// Accepts a Composer symphony URL or ID, pasted score JSON, a QuantMage spell's JSON, or tickers with weights.

import type { SymphonyStrategy, ComposerSymphony, FixedWeightStrategy } from '../types'
import { relayFetch } from '../data/proxy'
import { isQuantMageSpell, fromQuantMage } from './quantmage'
import { useLocalCache, isWebsite, loadCachedSymphony } from '../data/localCache'
import { saveSymphony, getSavedSymphony } from '../data/cache'

/** Parse a strategy from a JSON string or Composer share URL */
export function parseStrategyInput(input: string): SymphonyStrategy | FixedWeightStrategy {
  const trimmed = input.trim()

  // Plain ticker list: "SPY 60, TLT 40" or "SPY:60 TLT:40"
  if (/^[A-Z][A-Z0-9./]*[\s:]+\d+(\.\d+)?%?([\s,;]+[A-Z][A-Z0-9./]*[\s:]+\d+(\.\d+)?%?)*[\s,;]*$/i.test(trimmed)) {
    return parseTickerWeightString(trimmed)
  }

  // JSON input
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const json = JSON.parse(trimmed)
    if (isQuantMageSpell(json)) return wrapAsSymphony(fromQuantMage(json).score)
    return wrapAsSymphony(json)
  }

  if (extractSymphonyId(trimmed)) {
    throw new Error('This is a Composer symphony link; fetch it with fetchPublicSymphony first.')
  }

  // A lone ticker ("SPY") is held at 100%
  if (/^[A-Z][A-Z0-9./]{0,9}$/i.test(trimmed)) return parseTickerWeightString(`${trimmed} 100`)

  throw new Error('Unrecognised input. Paste a Composer symphony link or its JSON, or enter tickers like "SPY 60, QQQ 40".')
}

/** Parse "SPY 60, QQQ 40" or "SPY:0.6, QQQ:0.4" into a fixed-weight strategy */
export function parseTickerWeightString(input: string): FixedWeightStrategy {
  const parts = input.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean)
  const legs: { ticker: string; weight: number }[] = []

  for (const part of parts) {
    const match = part.match(/^([A-Z][A-Z0-9./]*)[:\s]+([0-9.]+)%?$/i)
    if (!match) continue
    const ticker = match[1].toUpperCase()
    const val = parseFloat(match[2])
    const weight = val > 1 ? val / 100 : val  // accept both 60 and 0.6
    legs.push({ ticker, weight })
  }

  if (legs.length === 0) throw new Error('No valid ticker/weight pairs found')

  const total = legs.reduce((s, l) => s + l.weight, 0)
  const name = legs.map(l => `${l.ticker} ${Math.round(l.weight * 100 / total)}%`).join(' / ')

  return {
    type: 'fixed-weight',
    name,
    legs,
    rebalance: 'daily',
  }
}

/** Wrap a raw Composer JSON object as a SymphonyStrategy */
export function wrapAsSymphony(json: unknown): SymphonyStrategy {
  const obj = json as Record<string, unknown>
  const name = (obj.name ?? obj.title ?? obj.id ?? 'Unnamed Symphony') as string
  const edited = obj.last_semantic_update_at
  return {
    type: 'symphony',
    name,
    composerId: obj.id as string | undefined,
    symphonyJson: obj as ComposerSymphony,
    editedAt: typeof edited === 'string' && /^\d{4}-\d{2}-\d{2}/.test(edited) ? edited.slice(0, 10) : undefined,
  }
}

/** Composer's public score endpoint (no login needed). Same source ComposerAtlas uses. */
export function composerScoreUrl(id: string): string {
  return `https://api.composer.trade/api/v0.1/symphonies/${id}/score?score_version=v1`
}

/**
 * Fetch a public symphony's score. If the request fails (proxy down, offline), the error tells
 * the user to open the score URL themselves and paste the JSON instead.
 */
export async function fetchPublicSymphony(
  id: string, corsProxy: string, log: (m: string) => void = () => {},
): Promise<SymphonyStrategy> {
  // From disk: price-cache/ first, then Composer through the relay
  // Composer Atlas: the website always asks Composer, since symphonies get edited
  if (useLocalCache() && !isWebsite()) {
    let cached: Record<string, unknown> | undefined
    try { cached = await loadCachedSymphony(id) as Record<string, unknown> } catch { /* not cached: fetch it */ }
    if (cached) {
      // Copies fetched before edit dates were saved have none: ask Composer so OOS can be marked
      if (!cached.last_semantic_update_at) {
        const edited = await fetchEditedAt(id, corsProxy)
        if (edited) cached.last_semantic_update_at = edited
        else log("This saved symphony has no last edit date, so out-of-sample days aren't marked. Run npm run fetch for it again.")
      }
      return wrapAsSymphony(cached)
    }
  }
  try {
    const json = await fetchScore(id, corsProxy)
    const edited = await fetchEditedAt(id, corsProxy)
    if (edited) json.last_semantic_update_at = edited
    else log("Couldn't get the symphony's last edit date from Composer, so out-of-sample days aren't marked.")
    saveSymphony(id, json).catch(() => { /* storage blocked: still run */ })
    return wrapAsSymphony(json)
  } catch (e) {
    // Composer unreachable or rate-limited: fall back to the copy saved the last time this link loaded
    if ((e as Error).message.includes('not found')) throw e
    const saved = await getSavedSymphony(id).catch(() => undefined)
    if (!saved) throw e
    log(`Composer unreachable; using the copy saved ${saved.savedAt.slice(0, 10)}.`)
    return wrapAsSymphony(saved.json)
  }
}

/**
 * The symphony's last logic edit (last_semantic_update_at), the start of its out-of-sample period.
 * Only Composer's backtest endpoint returns it, so ask for the shortest window. Undefined if unavailable.
 */
async function fetchEditedAt(id: string, corsProxy: string): Promise<string | undefined> {
  const url = `https://api.composer.trade/api/v0.1/symphonies/${id}/backtest`
  const end = new Date(), start = new Date(end.getTime() - 10 * 86400000)
  try {
    const resp = await relayFetch(url, url.replace('https://api.composer.trade', './composer'), corsProxy, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ capital: 10000, broker: 'alpaca', slippage_percent: 0, apply_reg_fee: true, apply_taf_fee: true, start_date: start.toISOString().slice(0, 10), end_date: end.toISOString().slice(0, 10) }),
      signal: AbortSignal.timeout(30000),
    })
    if (resp.ok) {
      const v = (await resp.json() as Record<string, unknown>).last_semantic_update_at
      if (typeof v === 'string') return v.slice(0, 10)
    }
  } catch { /* the default relay only reads pages: try the public page below */ }
  // Composer's public symphony page has the date too, and any relay can read it
  const pub = `https://backtest-api.composer.trade/api/v1/public/symphonies/${id}`
  try {
    const resp = await relayFetch(pub, `./composer-public/api/v1/public/symphonies/${id}`, corsProxy, { signal: AbortSignal.timeout(20000) })
    if (!resp.ok) return undefined
    const v = (await resp.json() as Record<string, unknown>).last_semantic_update_at
    return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : undefined
  } catch { return undefined }
}

async function fetchScore(id: string, corsProxy: string): Promise<Record<string, unknown>> {
  const url = composerScoreUrl(id)
  const path = url.replace('https://api.composer.trade', './composer')
  let resp: Response
  try {
    resp = await relayFetch(url, path, corsProxy, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(20000),
    })
  } catch {
    throw new Error(`Couldn't reach Composer. Open ${url} in your browser, copy the JSON and paste it here instead.`)
  }
  if (resp.status === 404) throw new Error(`Symphony ${id} was not found, or it isn't public.`)
  if (!resp.ok) {
    throw new Error(`Composer returned ${resp.status}. Open ${url} in your browser, copy the JSON and paste it here instead.`)
  }
  const json = await resp.json() as Record<string, unknown>
  if (!json.id) json.id = id
  return json
}

/** The symphony ID from a Composer link (…/symphony/<id>…), or a bare ID. */
export function extractSymphonyId(input: string): string | null {
  const s = input.trim()
  const match = s.match(/symphony\/([A-Za-z0-9_-]+)/)
  if (match) return match[1]
  // Bare IDs are 20 mixed-case letters and digits, unlike tickers
  if (/^[A-Za-z0-9]{16,32}$/.test(s) && /[a-z]/.test(s) && /[A-Z]/.test(s)) return s
  return null
}
