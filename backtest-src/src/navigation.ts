// ─── Navigation: the one source for routes, the menu and overview pages ──────
// Every area of the app is listed here. A new page is added in three places at once:
// its entry below (route + menu item), a card on its area's overview page, and its component in App.tsx.
// Paths are lowercase and hyphenated, and served as hash routes (#/run-backtest) so any local static server works.

export type PageId = 'WELCOME' | 'RUN_BACKTEST' | 'SETTINGS'

export interface NavPage {
  id: PageId
  path: string        // '' is the home page
  label: string
  icon: string
  description: string // shown on overview cards
}

export interface NavArea extends NavPage {
  // A multi-page area's own path is its overview page; children render as a dropdown in the menu.
  children?: NavPage[]
}

export const NAV: NavArea[] = [
  { id: 'WELCOME', path: '', label: 'Welcome', icon: '🏠', description: 'Getting started.' },
  { id: 'RUN_BACKTEST', path: 'run-backtest', label: 'Run Backtest', icon: '📊', description: 'Backtest a symphony against a benchmark.' },
  { id: 'SETTINGS', path: 'settings', label: 'Settings', icon: '⚙️', description: 'API keys, data sources, theme and cached price history.' },
]

export const HOME: NavPage = NAV[0]

export const BRAND = 'Synthetic Backtester'

// Browser tab title: "<page> - <brand>", the brand alone on the home page.
export function titleFor(page: NavPage): string {
  return page.id === HOME.id ? BRAND : `${page.label} - ${BRAND}`
}

function allPages(): NavPage[] {
  return NAV.flatMap(a => [a, ...(a.children ?? [])])
}

export function hrefFor(id: PageId): string {
  const page = allPages().find(p => p.id === id) ?? HOME
  return '#/' + page.path
}

// '#/run-backtest' → RUN_BACKTEST. Unknown paths fall back to the home page.
export function pageFromHash(hash: string): NavPage {
  const path = hash.replace(/^#\/?/, '').replace(/\/$/, '').toLowerCase()
  return allPages().find(p => p.path === path) ?? HOME
}
