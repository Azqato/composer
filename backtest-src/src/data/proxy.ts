// Yahoo and Composer don't allow requests from web pages (no CORS headers), so:
// - under `npm run dev` requests go through the dev server's forwarders (vite.config.ts), no third party;
// - otherwise (dist/backtester.html opened from disk) through the CORS proxy set in Settings,
//   or corsproxy.io when none is set.

export const DEFAULT_CORS_PROXY = 'https://corsproxy.io/?'

/**
 * @param url      the real https URL
 * @param devPath  the same request through the dev forwarder, e.g. "./yahoo/query1/v8/..."
 */
export function proxiedUrl(url: string, devPath: string, corsProxy: string): string {
  const proxy = corsProxy.trim()
  // "{url}" in the setting marks where the encoded URL goes (keyed proxies); otherwise it's a prefix
  if (proxy.includes('{url}')) return proxy.replace('{url}', encodeURIComponent(url))
  if (proxy) return proxy + url
  if (import.meta.env.DEV) return devPath
  return DEFAULT_CORS_PROXY + url
}

// Default relay when none is set: r.jina.ai, a reader service that fetches the page server-side and
// allows any origin (file:// included). Composer Atlas uses it for the same reason; public CORS proxies
// (corsproxy.io, cors.sh, allorigins, codetabs) were key-gated or failing when tested on 2026-10-31.
// Its JSON reply wraps the original body in data.content and the original status in data.httpStatus.
const READER_RELAY = 'https://r.jina.ai/'

// The built file checks once whether `npm run dev` is running on this machine; if so it uses that
// server's forwarders (vite.config.ts), so no third party sees the request.
const LOCAL_HELPER = 'http://localhost:5173/'
let helperUp: Promise<boolean> | null = null
function localHelperUp(): Promise<boolean> {
  helperUp ??= fetch(LOCAL_HELPER + 'app/', { method: 'HEAD', signal: AbortSignal.timeout(800) })
    .then(r => r.ok, () => false)
  return helperUp
}

/**
 * fetch() a Yahoo price or Composer symphony URL. Order: the dev forwarder (inside the dev app, or from the
 * built file when `npm run dev` is running), then the relay set in Settings, then the reader relay.
 */
export async function relayFetch(url: string, devPath: string, corsProxy: string, init: RequestInit = {}): Promise<Response> {
  if (import.meta.env.DEV && !corsProxy.trim()) return fetch(devPath, init)
  if (!import.meta.env.DEV && await localHelperUp()) {
    try { return await fetch(LOCAL_HELPER + devPath.replace(/^\.\//, ''), init) } catch { /* stopped: fall through */ }
  }
  if (corsProxy.trim()) return fetch(proxiedUrl(url, devPath, corsProxy), init)
  if (init.method && init.method !== 'GET') throw new Error('The reader relay only reads pages')
  const resp = await fetch(READER_RELAY + url, { ...init, headers: { Accept: 'application/json' } })
  if (!resp.ok) return resp  // 429 when its free tier is rate-limited
  const wrapped = await resp.json() as { data?: { content?: string; httpStatus?: number } }
  const status = wrapped.data?.httpStatus ?? 200
  return new Response(wrapped.data?.content ?? '', { status, headers: { 'Content-Type': 'application/json' } })
}
