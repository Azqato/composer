import { useState, useEffect } from 'react'
import { listCachedTickers, clearCache } from '../data/cache'

interface Props {
  colors: Record<string, string>
}

interface CacheEntry {
  ticker: string
  count: number
  start: string
  end: string
}

export function CachePanel({ colors }: Props) {
  const { panel, border, text, textMuted, tabActive } = colors
  const [entries, setEntries] = useState<CacheEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState<string | null>(null)

  async function refresh() {
    setLoading(true)
    const data = await listCachedTickers()
    setEntries(data.sort((a, b) => a.ticker < b.ticker ? -1 : 1))
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  async function handleClear(ticker?: string) {
    setClearing(ticker ?? '__all__')
    await clearCache(ticker)
    await refresh()
    setClearing(null)
  }

  const thStyle: React.CSSProperties = {
    padding: '8px 12px', fontWeight: 700, fontSize: 12,
    background: colors.tabBg, borderBottom: `1px solid ${border}`, textAlign: 'left',
  }
  const tdStyle: React.CSSProperties = {
    padding: '6px 12px', fontSize: 12, borderBottom: `1px solid ${border}`,
  }

  const totalDataPoints = entries.reduce((s, e) => s + e.count, 0)

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ background: panel, border: `1px solid ${border}`, borderRadius: 10, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15 }}>Cached Price Data</h3>
            <div style={{ fontSize: 12, color: textMuted, marginTop: 4 }}>
              {entries.length} tickers · {totalDataPoints.toLocaleString()} cached segments · Stored in IndexedDB
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={refresh}
              style={{ background: colors.tabBg, color: tabActive, border: `1px solid ${tabActive}`, borderRadius: 6, padding: '6px 14px', fontSize: 12 }}
            >
              ↻ Refresh
            </button>
            <button
              onClick={() => handleClear()}
              disabled={clearing === '__all__' || entries.length === 0}
              style={{ background: colors.panel, color: colors.danger, border: `1px solid ${colors.danger}`, borderRadius: 6, padding: '6px 14px', fontSize: 12 }}
            >
              {clearing === '__all__' ? 'Clearing...' : '🗑 Clear All'}
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ color: textMuted, textAlign: 'center', padding: 40 }}>Loading...</div>
        ) : entries.length === 0 ? (
          <div style={{ color: textMuted, textAlign: 'center', padding: 40 }}>
            No cached data. Run a backtest to populate the cache.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Ticker</th>
                  <th style={thStyle}>Segments</th>
                  <th style={thStyle}>From</th>
                  <th style={thStyle}>To</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.ticker}>
                    <td style={{ ...tdStyle, fontWeight: 700, fontFamily: 'monospace' }}>{e.ticker}</td>
                    <td style={tdStyle}>{e.count}</td>
                    <td style={tdStyle}>{e.start}</td>
                    <td style={tdStyle}>{e.end}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => handleClear(e.ticker)}
                        disabled={clearing === e.ticker}
                        style={{
                          background: 'transparent', color: colors.danger,
                          border: `1px solid ${colors.danger}`, borderRadius: 4, padding: '2px 8px',
                          fontSize: 11, cursor: 'pointer',
                        }}
                      >
                        {clearing === e.ticker ? '...' : 'Clear'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: textMuted, textAlign: 'center' }}>
        Cache is stored in your browser's IndexedDB. Clearing the cache forces a fresh fetch on next backtest.
      </div>
    </div>
  )
}
