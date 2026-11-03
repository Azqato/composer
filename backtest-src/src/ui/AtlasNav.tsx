// Composer Atlas: the site's navigation, drawn in the Backtester's own colors.
// The links mirror the primary nav in js/app.js (keep them in step when that changes). This page
// shows itself under Tools as if it were listed; the real site nav does not link here yet.
import { useEffect, useRef, useState } from 'react'
import type { ThemeColors } from './theme'

type Link = { href: string; label: string; external?: boolean; current?: boolean }
type Item = Link | { label: string; children: Link[] }

const NAV: Item[] = [
  { href: '/', label: 'Home' },
  { href: '/strategies', label: 'Strategies' },
  { href: '/database', label: 'Database' },
  { label: 'Tools', children: [
    { href: '/rsi', label: 'RSI Signals' },
    { href: '/signal-miner', label: 'Signal Miner' },
    { href: '/converter', label: 'Converter' },
    { href: '/nodes', label: 'Nodes' },
    { href: '/k1', label: 'K1 Lookup' },
    { href: '/rsi-backtest', label: 'RSI Backtester' },
    { href: '/backtest/', label: 'Synthetic Backtester', current: true },
    { href: '/overfit', label: 'Overfit Check' },
  ] },
  { href: '/guides', label: 'Guides' },
  { href: '/glossary', label: 'Glossary' },
  { href: '/referral', label: 'Referral' },
  { href: 'https://azqato.com/invests', label: 'Azqato Invests', external: true },
  { href: 'https://azqato.com/support.html', label: 'Support', external: true },
]

const ext = (l: Link) => l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}

export function AtlasNav({ colors, dark, onToggleTheme }: { colors: ThemeColors; dark: boolean; onToggleTheme: () => void }) {
  const [toolsOpen, setToolsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [narrow, setNarrow] = useState(() => window.innerWidth < 1100)
  const toolsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 1100)
    const onDoc = (e: MouseEvent) => { if (!toolsRef.current?.contains(e.target as Node)) setToolsOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setToolsOpen(false); setMobileOpen(false) } }
    window.addEventListener('resize', onResize)
    document.addEventListener('click', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('resize', onResize)
      document.removeEventListener('click', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const linkStyle = (active = false): React.CSSProperties => ({
    color: active ? colors.onAccent : colors.onAccent, opacity: active ? 1 : 0.85,
    fontWeight: active ? 700 : 500, fontSize: 13.5, textDecoration: 'none',
    padding: '6px 10px', borderRadius: 6, whiteSpace: 'nowrap',
    background: active ? 'rgba(255,255,255,0.16)' : 'transparent',
    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  })
  const btn: React.CSSProperties = {
    background: 'transparent', border: `1px solid ${colors.onAccent}`, color: colors.onAccent,
    borderRadius: 6, padding: '4px 10px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 13, textDecoration: 'none',
  }

  return (
    <header style={{ background: colors.accentBg, color: colors.onAccent, position: 'relative', zIndex: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
        <a href="/" style={{ color: colors.onAccent, textDecoration: 'none', fontSize: 18, fontWeight: 700, letterSpacing: '0.02em', display: 'flex', gap: 8, alignItems: 'center', marginRight: 12 }}>
          <span>🗺️</span><span>Composer Atlas</span>
        </a>

        {!narrow && (
          <nav aria-label="Main" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {NAV.map(item => 'children' in item ? (
              <div key={item.label} ref={toolsRef} style={{ position: 'relative' }}
                onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
                <button type="button" aria-haspopup="true" aria-expanded={toolsOpen}
                  onClick={() => setToolsOpen(o => !o)}
                  style={linkStyle(item.children.some(c => c.current))}>
                  {item.label} ▾
                </button>
                {toolsOpen && (
                  <div role="menu" style={{
                    position: 'absolute', top: '100%', left: 0, minWidth: 200, padding: 6, marginTop: 0,
                    background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column',
                  }}>
                    {item.children.map(c => (
                      <a key={c.href} href={c.href} {...ext(c)} aria-current={c.current ? 'page' : undefined}
                        style={{
                          color: c.current ? colors.tabActive : colors.text, fontWeight: c.current ? 700 : 400,
                          background: c.current ? colors.tabBg : 'transparent',
                          padding: '7px 10px', borderRadius: 6, fontSize: 13.5, textDecoration: 'none',
                        }}>
                        {c.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a key={item.href} href={item.href} {...ext(item)} style={linkStyle()}>{item.label}</a>
            ))}
          </nav>
        )}

        <span style={{ flex: 1 }} />
        {!narrow && <a href="https://composer.trade" target="_blank" rel="noopener noreferrer" style={btn}>Open Composer ↗</a>}
        <button onClick={onToggleTheme} style={btn}>{dark ? '☀️ Light' : '🌙 Dark'}</button>
        {narrow && (
          <button aria-label="Menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(o => !o)} style={{ ...btn, fontSize: 16, padding: '2px 10px' }}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        )}
      </div>

      {narrow && mobileOpen && (
        <nav aria-label="Mobile" style={{
          display: 'flex', flexDirection: 'column', padding: '4px 16px 12px',
          background: colors.panel, borderBottom: `1px solid ${colors.border}`,
        }}>
          {NAV.flatMap(item => 'children' in item
            ? [<span key={item.label} style={{ color: colors.textMuted, fontSize: 12, fontWeight: 600, padding: '10px 4px 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>,
               ...item.children.map(c => (
                 <a key={c.href} href={c.href} {...ext(c)} style={{ color: c.current ? colors.tabActive : colors.text, fontWeight: c.current ? 700 : 400, padding: '8px 4px 8px 16px', textDecoration: 'none', fontSize: 14 }}>{c.label}</a>
               ))]
            : [<a key={item.href} href={item.href} {...ext(item)} style={{ color: colors.text, padding: '8px 4px', textDecoration: 'none', fontSize: 14 }}>{item.label}</a>])}
          <a href="https://composer.trade" target="_blank" rel="noopener noreferrer" style={{ ...btn, color: colors.text, borderColor: colors.border, marginTop: 10, textAlign: 'center', padding: '8px 10px' }}>Open Composer ↗</a>
        </nav>
      )}
    </header>
  )
}
