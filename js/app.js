/* =============================================
   Composer Atlas — Shared App Utilities
   Loaded on every page. Provides:
     - BASE URL detection
     - Data loading
     - Format utilities
     - Nav + Footer rendering
   ============================================= */

'use strict';

// ---- Base URL ----
// On GitHub Pages (*.github.io), the first path segment is the repo name (e.g. /composer).
// On localhost or a custom domain the site is served at root, so BASE is empty.
const _seg = window.location.pathname.split('/')[1];
const BASE = (window.location.hostname.endsWith('.github.io') && _seg) ? '/' + _seg : '';

// ---- URL helper ----
// On HTTP/HTTPS: prepends BASE for absolute paths (works on both localhost and GitHub Pages).
// On file://: strips the leading slash since all pages are at root depth.
function u(path) {
  if (window.location.protocol !== 'file:') return BASE + path;
  const [pathPart, qs] = path.split('?');
  const rel = pathPart === '/' ? 'index.html' : pathPart.replace(/^\//, '');
  return rel + (qs ? '?' + qs : '');
}

// ---- Data loading ----
// Prefers window globals set by data/strategies.js and data/glossary.js (works on file://).
// Falls back to fetch() when those script tags are absent (e.g. HTTP server without them).
async function loadStrategies() {
  if (window.STRATEGIES_DATA) return window.STRATEGIES_DATA;
  const res = await fetch(`${BASE}/data/strategies.json`);
  if (!res.ok) throw new Error('Failed to load strategies.json');
  return res.json();
}

async function loadGlossary() {
  if (window.GLOSSARY_DATA) return window.GLOSSARY_DATA;
  const res = await fetch(`${BASE}/data/glossary.json`);
  if (!res.ok) throw new Error('Failed to load glossary.json');
  return res.json();
}

// ---- Format utilities ----
function formatPct(n) {
  const pct = (n * 100).toFixed(2);
  return n >= 0 ? `+${pct}%` : `${pct}%`;
}

function formatLargePct(n) {
  const pct = n * 100;
  const formatted = pct.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return n >= 0 ? `+${formatted}%` : `${formatted}%`;
}

function formatRatio(n) {
  return n.toFixed(2);
}

function formatDate(iso) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatBacktestDays(days) {
  const years = Math.round(days / 252);
  return `~${years} yrs (${days.toLocaleString()} trading days)`;
}

function colorClass(n) {
  if (n > 0) return 'text-green';
  if (n < 0) return 'text-pink';
  return 'text-primary';
}

// ---- Tag class lookup ----
const TAG_CLASSES = {
  'rsi': 'tag-rsi',
  '200d-ma': 'tag-200d-ma',
  'momentum': 'tag-momentum',
  'vix-tiers': 'tag-vix-tiers',
  'leveraged-etfs': 'tag-leveraged-etfs',
  'sharpe-ratio': 'tag-sharpe-ratio',
  'calmar-ratio': 'tag-calmar-ratio',
  'max-drawdown': 'tag-max-drawdown',
  'zoop': 'tag-zoop',
};

function tagClass(slug) {
  return TAG_CLASSES[slug] || 'tag-default';
}

function tagLabel(slug) {
  const labels = {
    'rsi': 'RSI',
    '200d-ma': '200d MA',
    'momentum': 'Momentum',
    'vix-tiers': 'VIX Tiers',
    'leveraged-etfs': 'Leveraged ETFs',
    'sharpe-ratio': 'Sharpe Ratio',
    'calmar-ratio': 'Calmar Ratio',
    'max-drawdown': 'Max Drawdown',
    'macd': 'MACD',
    'mean-reversion': 'Mean Reversion',
    'standard-deviation': 'Std Deviation',
    'managed-futures': 'Managed Futures',
    'inverse-etfs': 'Inverse ETFs',
    'zoop': "Zoop's Strategies",
  };
  return labels[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function renderTag(slug) {
  return `<a href="${u('/glossary.html?slug=' + slug)}" class="tag ${tagClass(slug)}">${tagLabel(slug)}</a>`;
}

// ---- Category helpers ----
const CATEGORY_LABELS = {
  'indicator': 'Indicator',
  'risk-metric': 'Risk Metric',
  'asset-class': 'Asset Class',
  'strategy-concept': 'Strategy Concept',
};

function badgeClass(category) {
  return `badge-${category}`;
}

// ---- Nav rendering ----
function renderNav() {
  const path = window.location.pathname;
  const search = window.location.search;

  function isActive(href) {
    const hrefPath = href.split('?')[0];
    if (hrefPath === BASE + '/' || hrefPath === BASE) {
      return path === BASE + '/' || path === BASE;
    }
    return path.startsWith(hrefPath) && hrefPath !== BASE + '/';
  }

  const links = [
    { href: u('/strategies.html'), label: 'Strategies' },
    { href: u('/glossary.html'), label: 'Glossary' },
    { href: u('/about.html'), label: 'About' },
    { href: 'https://azqato.github.io/stocks/', label: 'Individual Stocks' },
    { href: 'https://azqato.github.io/leveraged-strategies/', label: 'Leveraged Strategies' },
    { href: 'https://azqato.github.io/support.html', label: 'Support', external: true },
  ];

  const desktopLinks = links.map(l =>
    `<a href="${l.href}"${l.external ? ' target="_blank" rel="noopener noreferrer"' : ''} class="nav-link${isActive(l.href) ? ' active' : ''}">${l.label}</a>`
  ).join('');

  const mobileLinks = [
    { href: u('/'), label: 'Home' },
    ...links,
  ].map(l =>
    `<a href="${l.href}"${l.external ? ' target="_blank" rel="noopener noreferrer"' : ''} class="mobile-nav-link${isActive(l.href) ? ' active' : ''}">${l.label}</a>`
  ).join('');

  const nav = document.getElementById('nav-root');
  if (!nav) return;

  nav.innerHTML = `
    <div class="nav-inner">
      <a href="${u('/')}" class="nav-logo">
        <span class="nav-logo-mark">🗺️</span>
        <span class="nav-logo-text">Composer Atlas</span>
      </a>
      <div class="nav-links">
        ${desktopLinks}
      </div>
      <div class="nav-actions">
        <a href="https://composer.trade" target="_blank" rel="noopener noreferrer"
          class="btn btn-outline-green nav-cta">Open Composer ↗</a>
        <button class="nav-hamburger" id="nav-toggle"
          aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="mobile-menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
    <div class="nav-mobile" id="mobile-menu" role="navigation" aria-label="Mobile navigation">
      ${mobileLinks}
      <a href="https://composer.trade" target="_blank" rel="noopener noreferrer"
        class="btn btn-outline-green mobile-nav-cta">Open Composer ↗</a>
    </div>
  `;

  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.contains('open');
      menu.classList.toggle('open', !isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
  }
}

// ---- Footer rendering ----
function renderFooter() {
  const footer = document.getElementById('footer-root');
  if (!footer) return;
  const year = new Date().getFullYear();
  footer.innerHTML = `
    <nav class="footer-links">
      <a href="${u('/strategies.html')}">Strategies</a>
      <a href="${u('/glossary.html')}">Glossary</a>
      <a href="${u('/about.html')}">About</a>
      <a href="https://azqato.github.io/support.html" target="_blank" rel="noopener noreferrer">Support</a>
      <a href="https://composer.trade" target="_blank" rel="noopener noreferrer">Composer.trade ↗</a>
    </nav>
    <p class="footer-legal">Not affiliated with Composer Technologies, Inc. All metrics are backtested historical data and do not guarantee future results. Not financial advice.</p>
    <p class="footer-copy">&copy; ${year} Composer Atlas &middot; Built by <a href="https://azqato.github.io/" target="_blank" rel="noopener noreferrer">Azqato</a></p>
  `;
}

// ---- Breadcrumb rendering ----
// crumbs: [{label, href?}]  — last crumb has no href (current page)
function renderBreadcrumb(containerId, crumbs) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const parts = crumbs.map(c => {
    if (!c.href) return `<span class="current">${c.label}</span>`;
    return `<a href="${c.href}">${c.label}</a>`;
  });
  const joined = parts.join('<span class="breadcrumb-sep">/</span>');
  el.innerHTML = `<nav class="breadcrumb" aria-label="Breadcrumb">${joined}</nav>`;
}

// ---- Strategy Card rendering ----
function renderStrategyCard(s) {
  const tags = (s.tags || []).slice(0, 4).map(renderTag).join('');
  return `
    <article class="card">
      <h2 class="card-title"><a href="${u('/strategies.html?slug=' + s.slug)}">${s.name}</a></h2>
      <p class="card-desc">${s.description}</p>
      <div class="card-metrics">
        <div>
          <p class="card-metric-label">ARR</p>
          <p class="card-metric-value ${colorClass(s.annualized_rate_of_return)}">${formatPct(s.annualized_rate_of_return)}</p>
        </div>
        <div>
          <p class="card-metric-label">Max DD</p>
          <p class="card-metric-value ${colorClass(s.max_drawdown)}">${formatPct(s.max_drawdown)}</p>
        </div>
        <div>
          <p class="card-metric-label">Sharpe</p>
          <p class="card-metric-value ${colorClass(s.sharpe_ratio)}">${formatRatio(s.sharpe_ratio)}</p>
        </div>
      </div>
      ${tags ? `<div class="card-tags">${tags}</div>` : ''}
      <div class="card-footer">
        <a href="${u('/strategies.html?slug=' + s.slug)}" class="btn btn-sm" style="color:var(--color-green)">
          View Strategy →
        </a>
      </div>
    </article>
  `;
}

// ---- Concept Card rendering ----
function renderConceptCard(concept, strategyCount) {
  const badgeCls = badgeClass(concept.category);
  const categoryLabel = CATEGORY_LABELS[concept.category] || concept.category;
  const countText = strategyCount > 0
    ? `<span style="font-size:0.75rem;color:var(--color-disabled)">${strategyCount} ${strategyCount === 1 ? 'strategy' : 'strategies'}</span>`
    : '';
  return `
    <article class="card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px">
        <span class="badge ${badgeCls}">${categoryLabel}</span>
        ${countText}
      </div>
      <h2 class="card-title"><a href="${u('/glossary.html?slug=' + concept.slug)}">${concept.name}</a></h2>
      <p class="card-desc" style="-webkit-line-clamp:2">${concept.description}</p>
      <div class="card-footer">
        <a href="${u('/glossary.html?slug=' + concept.slug)}" class="btn btn-sm" style="color:var(--color-green)">
          Learn more →
        </a>
      </div>
    </article>
  `;
}

// ---- Metrics Table rendering ----
function renderMetricsTable(s) {
  function row(label, value, cls) {
    return `<div class="metrics-row"><dt>${label}</dt><dd class="${cls || ''}">${value}</dd></div>`;
  }

  const groups = [
    {
      label: 'Returns',
      rows: [
        row('Annualized Return', formatPct(s.annualized_rate_of_return), colorClass(s.annualized_rate_of_return)),
        row('Cumulative Return', formatLargePct(s.cumulative_return), colorClass(s.cumulative_return)),
      ],
    },
    {
      label: 'Risk',
      rows: [
        row('Max Drawdown', formatPct(s.max_drawdown), colorClass(s.max_drawdown)),
        row('Std Deviation', formatPct(s.standard_deviation), 'text-primary'),
      ],
    },
    {
      label: 'Risk-Adjusted',
      rows: [
        row('Sharpe Ratio', formatRatio(s.sharpe_ratio), colorClass(s.sharpe_ratio)),
        row('Calmar Ratio', formatRatio(s.calmar_ratio), colorClass(s.calmar_ratio)),
      ],
    },
    {
      label: 'Monthly Distribution',
      rows: [
        row('Min Month', formatPct(s.min), colorClass(s.min)),
        row('Mean Month', formatPct(s.mean), colorClass(s.mean)),
        row('Median Month', formatPct(s.median), colorClass(s.median)),
        row('Max Month', formatPct(s.max), colorClass(s.max)),
      ],
    },
    {
      label: 'Trailing Returns',
      rows: [
        row('1-Month', formatPct(s.trailing_one_month_return), colorClass(s.trailing_one_month_return)),
        row('3-Month', formatPct(s.trailing_three_month_return), colorClass(s.trailing_three_month_return)),
        row('1-Year', formatPct(s.trailing_one_year_return), colorClass(s.trailing_one_year_return)),
      ],
    },
    {
      label: 'Metadata',
      rows: [
        row('Backtest Period', formatBacktestDays(s.backtest_days), 'text-primary font-mono'),
        row('Last Updated', formatDate(s.last_updated), 'text-secondary'),
      ],
    },
  ];

  return groups.map(g => `
    <div class="metrics-section">
      <p class="metrics-section-label">${g.label}</p>
      <dl class="metrics-table">${g.rows.join('')}</dl>
    </div>
  `).join('');
}

// ---- Compact strategy list item ----
function renderStrategyListItem(s) {
  return `
    <a href="${u('/strategies.html?slug=' + s.slug)}" class="strategy-list-item">
      <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.name}</span>
      <span class="arr ${colorClass(s.annualized_rate_of_return)}">${formatPct(s.annualized_rate_of_return)}</span>
    </a>
  `;
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  renderFooter();
});
