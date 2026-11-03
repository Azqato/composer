import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import type { Config, BacktestResult, BacktestStatus } from './types'
import { DEFAULT_CONFIG } from './types'
import { onWebsite, SITE_BASE } from './navigation'
import { WelcomePanel } from './ui/WelcomePanel'
import { BacktestPanel } from './ui/BacktestPanel'
import { SettingsPanel } from './ui/SettingsPanel'
import { themeColors } from './ui/theme'

// ─── Load config from localStorage ───────────────────────────────────────────

function loadConfig(): Config {
  try {
    const raw = localStorage.getItem('backtestConfig')
    if (raw) {
      // Composer key fields were removed 2026-10-31; drop values saved before then
      const { composerKeyId: _id, composerSecret: _secret, ...saved } = JSON.parse(raw)
      return { ...DEFAULT_CONFIG, ...saved }
    }
  } catch { /* ignore */ }
  return DEFAULT_CONFIG
}

function saveConfig(cfg: Config) {
  localStorage.setItem('backtestConfig', JSON.stringify(cfg))
}

// ─── App root ─────────────────────────────────────────────────────────────────

export function App() {
  const [config, setConfig] = useState<Config>(loadConfig)
  // Composer Atlas: one page. Welcome, Run Backtest and Settings are stacked sections; the old tab
  // addresses (#/run-backtest, /backtest/settings/ via its stub's ?p=) land here and scroll there.
  const runRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const scrollTo = (r: React.RefObject<HTMLDivElement>) => r.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null)
  const [backtestStatus, setBacktestStatus] = useState<BacktestStatus>('idle')
  const [backtestError, setBacktestError] = useState<string | null>(null)
  const [backtestLog, setBacktestLog] = useState<string[]>([])

  // Apply theme to body
  useEffect(() => {
    document.body.classList.toggle('dark', config.darkTheme)
    document.body.classList.toggle('light', !config.darkTheme)
  }, [config.darkTheme])

  useEffect(() => {
    const old = (new URLSearchParams(location.search).get('p') ?? location.hash.replace(/^#\/?/, '')).replace(/\/$/, '')
    if (location.hash || location.search) {
      history.replaceState(null, '', onWebsite() ? SITE_BASE : location.pathname)
    }
    if (old === 'run-backtest') setTimeout(() => scrollTo(runRef), 50)
    if (old === 'settings') setTimeout(() => scrollTo(settingsRef), 50)
  }, [])

  const updateConfig = useCallback((updates: Partial<Config>) => {
    setConfig(prev => {
      const next = { ...prev, ...updates }
      saveConfig(next)
      return next
    })
  }, [])

  const onBacktestResult = useCallback((result: BacktestResult) => {
    setBacktestResult(result)
    setBacktestStatus('done')
  }, [])

  const dark = config.darkTheme
  // Roles from the color standard (tokens.css), resolved for inline styles and charts
  const colors = useMemo(() => themeColors(dark), [dark])

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text }}>
      {/* Title bar */}
      <div style={{
        background: colors.accentBg,
        color: colors.onAccent, padding: '8px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.02em' }}>
          📈 Synthetic Backtester
        </span>
        <span style={{ flex: 1 }} />
        {([['📊 Run Backtest', runRef], ['⚙️ Settings', settingsRef]] as const).map(([label, ref]) => (
          <button key={label} onClick={() => scrollTo(ref)}
            style={{ background: 'transparent', border: 'none', color: colors.onAccent, padding: '4px 8px', fontSize: 13, cursor: 'pointer' }}>
            {label}{label.includes('Run') && (backtestStatus === 'fetching' || backtestStatus === 'computing') && ' ⟳'}
          </button>
        ))}
        <button
          onClick={() => updateConfig({ darkTheme: !dark })}
          style={{ background: 'transparent', border: `1px solid ${colors.onAccent}`, color: colors.onAccent, borderRadius: 6, padding: '4px 10px' }}
        >
          {dark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {/* Panel content */}
      <div style={{ padding: '16px', maxWidth: 1600, margin: '0 auto' }}>
        <WelcomePanel onStart={() => scrollTo(runRef)} colors={colors} />
        <div ref={runRef} style={{ scrollMarginTop: 16, marginTop: 24 }}>
          <BacktestPanel
            config={config}
            backtestResult={backtestResult}
            backtestStatus={backtestStatus}
            backtestError={backtestError}
            backtestLog={backtestLog}
            onResult={onBacktestResult}
            onStatus={setBacktestStatus}
            onError={setBacktestError}
            onLog={setBacktestLog}
            colors={colors}
          />
        </div>
        <div ref={settingsRef} style={{ scrollMarginTop: 16, marginTop: 32 }}>
          <h2 style={{ fontSize: 18, margin: '0 0 12px' }}>⚙️ Settings</h2>
          <SettingsPanel config={config} onUpdate={updateConfig} colors={colors} />
        </div>
      </div>
    </div>
  )
}
