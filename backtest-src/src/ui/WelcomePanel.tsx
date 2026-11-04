// The app's home page: the landing page's vision and feature list, in the app's own style.
interface Props {
  onStart: () => void
  colors: Record<string, string>
}

type Status = 'available' | 'progress' | 'planned'
const STATUS: Record<Status, [string, string]> = {
  available: ['Available', 'var(--ti-color-success)'],
  progress: ['In progress', 'var(--ti-color-info)'],
  planned: ['Planned', 'var(--ti-color-text-muted)'],
}

const FEATURES: [string, string, Status, string][] = [
  ['🔗', 'Quick Start: Your Strategies as They Are', 'available',
    'Paste a Composer symphony or link, a QuantMage spell, or a fixed-weight list. Conditions, weights, filters, switches and netting are evaluated the way the source platform does.'],
  ['🎯', 'Accuracy You Can Check', 'progress',
    'Every simulated fund is fitted to the days its real prices exist, with financing and expense costs solved from the data, and scored against those real prices on years the fit never saw. The scores are used internally for now; they will be published once the method is refined.'],
  ['🕰️', 'Deep History', 'available',
    '66 simulated index series reach back to 1885, and 835 leveraged and inverse funds are extended day by day from their underlying, so a 3× fund launched in 2010 can be tested through 1987, 2000 and 2008.'],
  ['🌪️', 'Volatility Funds Before They Existed', 'available',
    'UVXY, VIXY and VXX rebuilt from spot VIX and VXO back to 1986, fitted to 15 years of simulated futures history. Short holds track closely; gains in crash years tend to be understated.'],
  ['🧭', 'Transparent Tiers', 'available',
    'A strip under the growth chart shows which stretches are real prices, simulated history, or Default Pathing (gaps filled by a stated rule), each named in words as well as color. The run log names where each fund\'s real prices begin.'],
  ['🧹', 'Clean Data', 'available',
    'Bad prints in the price feed are repaired before a backtest runs and reported in the run log, and missing days follow Default Pathing instead of silently dropping out.'],
  ['💸', 'Realistic Costs', 'progress',
    'Leveraged funds already carry fitted financing and expense drag. An optional slippage model, charged only on what trades each day, is planned.'],
  ['📊', 'Full Metrics and a Printable Report', 'available',
    'Sharpe, Sortino, Calmar, Omega, Ulcer Index, VaR, CVaR and 30+ more, with equity, drawdown, rolling and allocation charts, and a six-page report you can save and print.'],
  ['💾', 'Private and Offline', 'available',
    'The whole app is one HTML file that opens from disk, with no server. Prices are cached on your own disk with npm run fetch, all computation runs in your browser, and nothing about your strategies leaves your machine.'],
]

export function WelcomePanel({ onStart, colors }: Props) {
  const { panel, border, text, textMuted, tabActive } = colors

  const tag = (s: Status) => (
    <span style={{
      display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 999,
      border: '1px solid currentColor', color: STATUS[s][1], whiteSpace: 'nowrap',
    }}>{STATUS[s][0]}</span>
  )

  const button = (label: string) => (
    <button onClick={onStart} style={{
      background: tabActive, color: 'var(--ti-color-on-accent)', border: 'none',
      borderRadius: 8, padding: '12px 32px', fontSize: 15, fontWeight: 700,
    }}>{label}</button>
  )

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingTop: 16 }}>
      {/* Hero */}
      <div style={{ background: panel, border: `1px solid ${border}`, borderRadius: 12, padding: '28px 28px 24px', marginBottom: 28 }}>
        <div style={{ color: tabActive, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 12, marginBottom: 8 }}>
          📈 Provenance, the Synthetic Backtesting Engine
        </div>
        <h1 style={{ margin: '0 0 12px', fontSize: 30, fontWeight: 800, lineHeight: 1.2, maxWidth: '24ch' }}>
          Backtest a strategy across a century, and know which days are real.
        </h1>
        <p style={{ color: textMuted, fontSize: 15, lineHeight: 1.6, margin: '0 0 12px' }}>
          Most funds are young. Synthetic Backtester rebuilds the years before they existed from their underlying indexes,
          fits each simulated fund to the history it can be checked against, and marks every day of a backtest as real, simulated or filled.
        </p>
        <p style={{ color: textMuted, fontSize: 15, lineHeight: 1.6, margin: '0 0 20px' }}>
          The vision: a backtester where every number can be traced, showing which prices are real, how each simulated year was built,
          how far the simulation drifted from reality where both exist, and what trading would really have cost.
          Long history makes a backtest meaningful; showing its seams makes it trustworthy.
        </p>
        {button('Start Backtesting →')}
      </div>

      {/* Features */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>What the Engine Does</h2>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: textMuted, flexWrap: 'wrap' }}>
          <span>{tag('available')} built and in the app</span>
          <span>{tag('progress')} partly built</span>
          <span>{tag('planned')} on the roadmap</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(380px, 100%), 1fr))', gap: 16, marginBottom: 32 }}>
        {FEATURES.map(([icon, title, status, desc]) => (
          <div key={title} style={{
            background: panel, border: `1px solid ${border}`,
            borderRadius: 12, padding: 20, display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 28 }}>{icon}</span>
            <div>
              <div style={{ marginBottom: 6 }}>{tag(status)}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{title}</div>
              <div style={{ color: textMuted, fontSize: 13, lineHeight: 1.6 }}>{desc}</div>
              {title.startsWith('Quick Start') && (
                <div style={{
                  marginTop: 10, border: `1px solid ${border}`, borderRadius: 8, padding: '8px 12px',
                  fontFamily: 'monospace', fontSize: 13, color: text,
                }}>
                  <div style={{ color: textMuted }}># Simple fixed-weight portfolio</div>
                  <div>SPY 60, TLT 40</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 40, color: textMuted, fontSize: 12, textAlign: 'center' }}>
        <p>Simulated years are estimates, not real prices. Backtests are hypothetical and are not investment advice.</p>
        <p>Data sources: Yahoo Finance, Tiingo, FRED, Testfolio simulated series, Cboe VIX and VXO.</p>
        <p>Planned address: syntheticbacktester.com. Local build, not yet published.</p>
      </div>
    </div>
  )
}
