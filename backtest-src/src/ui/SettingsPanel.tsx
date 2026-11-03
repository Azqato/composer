import type { Config } from '../types'
import { CachePanel } from './CachePanel'

interface Props {
  config: Config
  onUpdate: (updates: Partial<Config>) => void
  colors: Record<string, string>
}

export function SettingsPanel({ config, onUpdate, colors }: Props) {
  const { panel, border, text, textMuted } = colors

  const inputStyle: React.CSSProperties = {
    width: '100%', background: colors.bg, color: text,
    border: `1px solid ${colors.borderStrong}`, borderRadius: 6, padding: '7px 10px',
    fontFamily: 'monospace', fontSize: 13,
  }
  const labelStyle: React.CSSProperties = { fontSize: 12, color: textMuted, fontWeight: 600, marginBottom: 4, display: 'block' }
  const sectionStyle: React.CSSProperties = { background: panel, border: `1px solid ${border}`, borderRadius: 10, padding: 20, marginBottom: 16 }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', paddingTop: 8 }}>

      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>Data Sources</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Primary Source</label>
            <select
              value={config.primaryService}
              onChange={e => onUpdate({ primaryService: e.target.value as 'YAHOO' | 'TIINGO' })}
              style={{ ...inputStyle, fontFamily: 'inherit' }}
            >
              <option value="YAHOO">Yahoo Finance</option>
              <option value="TIINGO">Tiingo</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Secondary (fallback)</label>
            <select
              value={config.secondaryService}
              onChange={e => onUpdate({ secondaryService: e.target.value as 'YAHOO' | 'TIINGO' })}
              style={{ ...inputStyle, fontFamily: 'inherit' }}
            >
              <option value="TIINGO">Tiingo</option>
              <option value="YAHOO">Yahoo Finance</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Tiingo API Token</label>
          <input
            type="password"
            value={config.tiingoToken}
            onChange={e => onUpdate({ tiingoToken: e.target.value })}
            placeholder="tiingo_xxxxxxxxxxxxxxxxxxxxxxxx"
            style={inputStyle}
          />
          <div style={{ fontSize: 11, color: textMuted, marginTop: 4 }}>
            Free at <a href="https://api.tiingo.com" target="_blank" rel="noopener noreferrer">api.tiingo.com</a> (500 req/day). Tiingo natively supports browser CORS.
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>FRED API Key (optional, for precise risk-free rate)</label>
          <input
            type="password"
            value={config.fredApiKey}
            onChange={e => onUpdate({ fredApiKey: e.target.value })}
            placeholder="abcdef1234567890..."
            style={inputStyle}
          />
          <div style={{ fontSize: 11, color: textMuted, marginTop: 4 }}>
            Free at <a href="https://fred.stlouisfed.org/docs/api/api_key.html" target="_blank" rel="noopener noreferrer">fred.stlouisfed.org</a>. Without this, a recent historical average T-bill rate is used.
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>CORS Proxy URL (optional)</label>
          <input
            type="text"
            value={config.corsProxy}
            onChange={e => onUpdate({ corsProxy: e.target.value })}
            placeholder="Empty: r.jina.ai"
            style={inputStyle}
          />
          <div style={{ fontSize: 11, color: textMuted, marginTop: 4 }}>
            Yahoo and Composer block requests from web pages. Opened from disk, the app reads <code>price-cache/</code> first
            (filled by <code>npm run fetch</code>) and downloads anything missing, including Composer links, through
            <code>npm run dev</code> when it is running, otherwise through a relay.
            Left empty, that is <code>r.jina.ai</code> (free, rate-limited). Or set your own, e.g. <code>{'https://corsproxy.io/?key=YOUR_KEY&url={url}'}</code>.
            The relay sees the symphony IDs and tickers you load. Not used under <code>npm run dev</code>, which forwards requests itself.
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>Appearance</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={config.darkTheme}
            onChange={e => onUpdate({ darkTheme: e.target.checked })}
          />
          <span style={{ fontSize: 14 }}>Dark Theme</span>
        </label>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>SIM Data</h3>
        <p style={{ fontSize: 13, color: textMuted, margin: '0 0 12px' }}>
          The <code>testfolio-sim.csv</code> file (12.5 MB, bundled into the app) provides extended price history back to 1885 for 70+ tickers.
          It's bundled with the app and loaded automatically when you run a backtest.
        </p>
        <p style={{ fontSize: 13, color: textMuted, margin: '0 0 12px' }}>
          If you have a local copy of BacktestReport.jar, the SIM file can be extracted from it and hosted alongside the app.
        </p>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={config.deepVolatility !== false}
            onChange={e => onUpdate({ deepVolatility: e.target.checked })}
          />
          <span style={{ fontSize: 14 }}>Volatility funds back to 1986</span>
        </label>
        <p style={{ fontSize: 13, color: textMuted, margin: '6px 0 0 26px' }}>
          In Synthetic history, UVIX, UVXY, VIXY and VXX are simulated from spot VIX and VXO before 2005-12-20.
          Spot is not tradable, so these years are estimates: they track short holds well but understate gains in crashes.
          Turn off to start these funds in 2005.
        </p>
      </div>

      <CachePanel colors={colors} />

      <div style={{ fontSize: 11, color: textMuted, textAlign: 'center', paddingBottom: 16 }}>
        All settings are stored in <code>localStorage</code> only. No data is transmitted to any server except directly to configured API providers.
      </div>
    </div>
  )
}
