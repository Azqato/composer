import { useState, useCallback, useEffect, useMemo } from 'react'
import type { Config, BacktestResult, BacktestStatus } from './types'
import { DEFAULT_CONFIG } from './types'
import { NAV, hrefFor, titleFor } from './navigation'
import { useRoute, navigate } from './router'
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
  const route = useRoute()
  const activeTab = route.id
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null)
  const [backtestStatus, setBacktestStatus] = useState<BacktestStatus>('idle')
  const [backtestError, setBacktestError] = useState<string | null>(null)
  const [backtestLog, setBacktestLog] = useState<string[]>([])

  // Apply theme to body
  useEffect(() => {
    document.body.classList.toggle('dark', config.darkTheme)
    document.body.classList.toggle('light', !config.darkTheme)
  }, [config.darkTheme])

  useEffect(() => { document.title = titleFor(route) }, [route])

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
        <button
          onClick={() => updateConfig({ darkTheme: !dark })}
          style={{ background: 'transparent', border: `1px solid ${colors.onAccent}`, color: colors.onAccent, borderRadius: 6, padding: '4px 10px' }}
        >
          {dark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {/* Main nav, generated from NAV (src/navigation.ts) */}
      <nav style={{
        display: 'flex', background: colors.panel,
        borderBottom: `1px solid ${colors.border}`,
        padding: '0 8px',
      }}>
        {NAV.map(page => (
          <a
            key={page.id}
            href={hrefFor(page.id)}
            aria-current={activeTab === page.id ? 'page' : undefined}
            style={{
              background: activeTab === page.id ? colors.tabBg : 'transparent',
              color: activeTab === page.id ? colors.tabActive : colors.textMuted,
              borderBottom: activeTab === page.id ? `2px solid ${colors.tabActive}` : '2px solid transparent',
              padding: '10px 16px',
              fontWeight: activeTab === page.id ? 700 : 400,
              fontSize: 13,
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
          >
            {page.icon} {page.label}
            {page.id === 'RUN_BACKTEST' && (backtestStatus === 'fetching' || backtestStatus === 'computing') && ' ⟳'}
          </a>
        ))}
      </nav>

      {/* Panel content */}
      <div style={{ padding: '16px', maxWidth: 1600, margin: '0 auto' }}>
        {activeTab === 'WELCOME' && (
          <WelcomePanel onStart={() => navigate(hrefFor('RUN_BACKTEST'))} colors={colors} />
        )}
        {activeTab === 'RUN_BACKTEST' && (
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
        )}
        {activeTab === 'SETTINGS' && (
          <SettingsPanel config={config} onUpdate={updateConfig} colors={colors} />
        )}
      </div>
    </div>
  )
}
