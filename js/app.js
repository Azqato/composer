/* =============================================
   Composer Atlas: Shared App Utilities
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

// The featured strategies joined to data/database.json and data/k1.json at build
// time by scripts/build_strategy_extras.py. Keyed by slug. Returns {} rather than
// throwing when the file is absent, so a strategy page still renders its original
// content if this one file fails to load: the sections that need it are each
// guarded, and a missing outlier panel is far better than a blank page.
async function loadStrategyExtras() {
  if (window.STRATEGY_EXTRAS_DATA) return window.STRATEGY_EXTRAS_DATA;
  try {
    const res = await fetch(`${BASE}/data/strategy_extras.json`);
    if (!res.ok) return {};
    return await res.json();
  } catch (e) {
    return {};
  }
}

async function loadGlossary() {
  if (window.GLOSSARY_DATA) return window.GLOSSARY_DATA;
  const res = await fetch(`${BASE}/data/glossary.json`);
  if (!res.ok) throw new Error('Failed to load glossary.json');
  return res.json();
}

// ---- Inline markdown for authored strategy content ----
// The smallest thing that works: **bold** and `code`, nothing else. Curated
// content in data/strategies.json is already inserted as HTML by every other
// section on the page, so this does not escape its input; it is a convenience
// for the author, not a sanitiser, and the trust boundary is unchanged. Kept
// deliberately tiny rather than reaching for a markdown library, which would be
// the project's first runtime dependency for two rules.
function mdInline(s) {
  return String(s == null ? '' : s)
    .replace(/[*][*]([^*]+)[*][*]/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// ---- Format utilities ----
function formatPct(n) {
  const pct = (n * 100).toFixed(1);
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
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
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
  'original': 'tag-original',
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
    'zoop': "zoop's Strategies",
    'original': 'Original Strategies',
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

  // Primary nav. `children` turns an item into a dropdown group (the tools live
  // there to keep the top level from getting crowded). ETF Cloner is intentionally
  // not in the nav; it's reachable from the footer and the homepage Explore grid.
  const links = [
    { href: u('/'), label: 'Home' },
    { href: u('/strategies.html'), label: 'Strategies' },
    { href: u('/database.html'), label: 'Database' },
    { label: 'Tools', children: [
      { href: u('/rsi.html'), label: 'RSI Signals' },
      { href: u('/signal-miner.html'), label: 'Signal Miner' },
      { href: u('/converter.html'), label: 'Converter' },
      { href: u('/nodes.html'), label: 'Nodes' },
      { href: u('/k1.html'), label: 'K1 Lookup' },
    ] },
    { href: u('/glossary.html'), label: 'Glossary' },
    { href: 'https://azqato.com/invests', label: 'Azqato Invests', external: true },
    { href: 'https://azqato.com/support.html', label: 'Support', external: true },
  ];

  const ext = l => (l.external ? ' target="_blank" rel="noopener noreferrer"' : '');

  const desktopLinks = links.map(l => {
    if (l.children) {
      const anyActive = l.children.some(c => isActive(c.href));
      const menu = l.children.map(c =>
        `<a href="${c.href}"${ext(c)} class="nav-dropdown-link${isActive(c.href) ? ' active' : ''}">${c.label}</a>`
      ).join('');
      return `<div class="nav-dropdown">` +
        `<button type="button" class="nav-link nav-dropdown-toggle${anyActive ? ' active' : ''}" aria-haspopup="true" aria-expanded="false">` +
        `${l.label}<span class="nav-caret" aria-hidden="true">▾</span></button>` +
        `<div class="nav-dropdown-menu">${menu}</div></div>`;
    }
    return `<a href="${l.href}"${ext(l)} class="nav-link${isActive(l.href) ? ' active' : ''}">${l.label}</a>`;
  }).join('');

  const mobileLinks = links.map(l => {
    if (l.children) {
      return `<span class="mobile-nav-group">${l.label}</span>` +
        l.children.map(c =>
          `<a href="${c.href}"${ext(c)} class="mobile-nav-link mobile-nav-sublink${isActive(c.href) ? ' active' : ''}">${c.label}</a>`
        ).join('');
    }
    return `<a href="${l.href}"${ext(l)} class="mobile-nav-link${isActive(l.href) ? ' active' : ''}">${l.label}</a>`;
  }).join('');

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

  // Desktop Tools dropdown: hover/focus opens it via CSS; this adds click-to-open
  // for touch/keyboard, plus outside-click and Escape to close.
  const dropdowns = nav.querySelectorAll('.nav-dropdown');
  dropdowns.forEach(dd => {
    const btn = dd.querySelector('.nav-dropdown-toggle');
    if (!btn) return;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const willOpen = !dd.classList.contains('open');
      dropdowns.forEach(o => { o.classList.remove('open'); o.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false'); });
      dd.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
    });
  });
  if (dropdowns.length) {
    document.addEventListener('click', e => {
      dropdowns.forEach(dd => {
        if (!dd.contains(e.target)) {
          dd.classList.remove('open');
          dd.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
        }
      });
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        dropdowns.forEach(dd => {
          dd.classList.remove('open');
          dd.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
        });
      }
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
      <a href="${u('/')}">Home</a>
      <a href="${u('/strategies.html')}">Strategies</a>
      <a href="${u('/database.html')}">Database</a>
      <a href="${u('/rsi.html')}">RSI</a>
      <a href="${u('/signal-miner.html')}">Signal Miner</a>
      <a href="${u('/glossary.html')}">Glossary</a>
      <a href="${u('/converter.html')}">Converter</a>
      <a href="${u('/nodes.html')}">Nodes</a>
      <a href="${u('/k1.html')}">K1 Lookup</a>
      <a href="${u('/etf-cloner.html')}">ETF Cloner</a>
      <a href="${u('/about.html')}">About</a>
      <a href="https://azqato.com/support.html" target="_blank" rel="noopener noreferrer">Support</a>
      <a href="https://composer.trade" target="_blank" rel="noopener noreferrer">Composer.trade ↗</a>
    </nav>
    <p class="footer-legal">Not affiliated with Composer Technologies, Inc. All metrics are backtested historical data and do not guarantee future results. Not financial advice.</p>
    <p class="footer-copy">&copy; ${year} Composer Atlas &middot; Built by <a href="https://azqato.com/" target="_blank" rel="noopener noreferrer">Azqato</a></p>
  `;
}

// ---- Breadcrumb rendering ----
// crumbs: [{label, href?}] : last crumb has no href (current page)
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
    return `<div class="metrics-row"><dt>${metricLabel(label)}</dt><dd class="${cls || ''}">${value}</dd></div>`;
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
      // These four are DAILY returns, not monthly, and were labelled "Month" until v1.27.8.
      // The arithmetic settles it: volatility drag means an arithmetic mean compounded over
      // a year must come out above the geometric annualized return, and it does for all 31
      // featured strategies read as daily (mean 0.353% -> 143% a year against a stated ARR
      // of 110%) and for none of them read as monthly (the same figure gives 4.3% a year
      // against that 110%). The stored `max` corroborates it: 54.63% for strategies holding
      // SOXL, whose best single day was 54.79% on 2025-04-09. A monthly reading would have
      // told a visitor the worst month was -15% when that is a single day.
      label: 'Daily Distribution',
      rows: [
        row('Worst Day', formatPct(s.min), colorClass(s.min)),
        row('Mean Day', formatPct(s.mean), colorClass(s.mean)),
        row('Median Day', formatPct(s.median), colorClass(s.median)),
        row('Best Day', formatPct(s.max), colorClass(s.max)),
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

// ---- Glossary links on metric labels (V1.20 item 12) ----
// Only labels the glossary actually defines appear here. An unmapped label stays
// plain text on purpose: a link that lands on "No concept with slug" is worse than
// no link, and the fix for a missing term is to write the term. That is why the
// seven distribution and cost terms were written first, in v1.27.8, before any of
// this linking existed.
const METRIC_GLOSSARY = {
  'Annualized Return': 'annualized-return',
  'Max Drawdown': 'max-drawdown',
  'Std Deviation': 'standard-deviation',
  'Sharpe Ratio': 'sharpe-ratio',
  'Calmar Ratio': 'calmar-ratio',
  'Sortino Ratio': 'sortino-ratio',
  'Win Rate': 'win-rate',
  'Tail Ratio': 'tail-ratio',
  'Skewness': 'skewness',
  'Kurtosis': 'kurtosis',
  'Herfindahl Index': 'herfindahl-index',
  'Annualized Turnover': 'annualized-turnover',
  'Backtest Period': 'backtesting',
};

function metricLabel(label) {
  const slug = METRIC_GLOSSARY[label];
  if (!slug) return label;
  return `<a class="metric-term" href="${u('/glossary.html?slug=' + slug)}">${label}</a>`;
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
