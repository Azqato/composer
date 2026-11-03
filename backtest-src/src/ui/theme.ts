// ─── Theme: the color standard's roles (tokens.css) resolved to values ───────
// Inline styles and Plotly need concrete colors, so read the roles off <html> after setting the theme.

const ROLES = {
  bg: '--ti-color-canvas',
  panel: '--ti-color-surface',
  border: '--ti-color-border',
  borderStrong: '--ti-color-border-strong',
  text: '--ti-color-text',
  textMuted: '--ti-color-text-muted',
  accent: '--ti-color-accent',
  accentBg: '--ti-color-accent-bg',
  onAccent: '--ti-color-on-accent',
  tabActive: '--ti-color-accent',
  tabBg: '--ti-color-accent-muted',
  success: '--ti-color-success',
  warning: '--ti-color-warning',
  danger: '--ti-color-danger',
  info: '--ti-color-info',
  strategy: '--bt-series-strategy',
  benchmark: '--bt-series-benchmark',
  compare: '--bt-series-compare',
  gain: '--bt-gain',
  loss: '--bt-loss',
  oos: '--bt-oos',
} as const

export type ThemeColors = Record<keyof typeof ROLES, string>

export function themeColors(dark: boolean): ThemeColors {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  const css = getComputedStyle(document.documentElement)
  return Object.fromEntries(
    Object.entries(ROLES).map(([k, v]) => [k, css.getPropertyValue(v).trim()]),
  ) as ThemeColors
}
