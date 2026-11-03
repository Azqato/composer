import type { DataTier, TierSegment } from '../types'
import { tierShares } from '../engine/tiers'

// The data-tier strip under the growth chart (DESIGN.md "History tiers"): each stretch of the
// backtest is named in words as well as color.
const TIER: Record<DataTier, { label: string; color: string; note: string }> = {
  real: { label: 'Real', color: 'var(--bt-tier-real)', note: 'real prices for everything held' },
  simulated: { label: 'Simulated', color: 'var(--bt-tier-simulated)', note: 'at least one fund held was simulated' },
  filled: { label: 'Filled', color: 'var(--bt-tier-pathing)', note: 'a fund held had no price that day; its last price was carried forward (Default Pathing)' },
}

export function TierStrip({ segments, dates, textMuted }: { segments: TierSegment[]; dates: string[]; textMuted: string }) {
  if (segments.length === 0 || dates.length === 0) return null
  const index = new Map(dates.map((d, i) => [d, i]))
  const shares = tierShares(segments, dates)
  const present = (Object.keys(TIER) as DataTier[]).filter(t => shares[t] > 0)

  return (
    <div style={{ margin: '4px 60px 0 60px' }}>
      <div role="img" aria-label={`Data tiers: ${present.map(t => `${TIER[t].label} ${pct(shares[t])}`).join(', ')}`}
        style={{ display: 'flex', height: 10, borderRadius: 3, overflow: 'hidden' }}>
        {segments.map(s => {
          const days = (index.get(s.end) ?? 0) - (index.get(s.start) ?? 0) + 1
          return <div key={s.start} title={`${TIER[s.tier].label}: ${s.start} to ${s.end}`}
            style={{ flex: `${days} 0 0`, minWidth: 1, background: TIER[s.tier].color }} />
        })}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: 11, color: textMuted, marginTop: 6 }}>
        {present.map(t => (
          <span key={t} title={TIER[t].note} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span aria-hidden style={{ width: 10, height: 10, borderRadius: 2, background: TIER[t].color }} />
            {TIER[t].label} {pct(shares[t])}
          </span>
        ))}
      </div>
    </div>
  )
}

const pct = (v: number) => `${(v * 100).toFixed(v > 0 && v < 0.01 ? 1 : 0)}%`
