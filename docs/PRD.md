# ComposerAtlas — Master Reference Document

**Version:** 1.3
**Status:** Active
**Last Updated:** 2026-06-14

This is the single authoritative reference for ComposerAtlas. It consolidates product requirements, architecture, operational runbook, data schemas, API reference, roadmap, security posture, project tenets, FAQ, and documentation process.

---

## Table of Contents

**Part A — Product Requirements**
1. [Problem Statement](#1-problem-statement)
2. [Target Users](#2-target-users)
3. [Goals](#3-goals)
4. [Non-Goals](#4-non-goals)
5. [User Stories](#5-user-stories)
6. [Feature List](#6-feature-list)
7. [Constraints](#7-constraints)
8. [Assumptions](#8-assumptions)
9. [Success Criteria](#9-success-criteria)

**Part B — Technical & Operational Reference**
10. [Architecture & Technical Reference](#10-architecture--technical-reference)
11. [Operational Runbook](#11-operational-runbook)
12. [Strategy & Glossary Data Schemas](#12-strategy--glossary-data-schemas)
13. [Composer API Reference](#13-composer-api-reference)
14. [Roadmap](#14-roadmap)
15. [Security](#15-security)
16. [Tenets](#16-tenets)
17. [FAQ](#17-faq)
18. [Documentation Process](#18-documentation-process)

---

## Part A — Product Requirements

---

## 1. Problem Statement

Retail investors interested in rules-based, systematic investing lack a central, accessible resource that:

- Aggregates and explains Composer.trade strategies in plain language
- Bridges the gap between raw quant concepts and practical application
- Provides transparent breakdowns of strategy logic, not just backtest returns

There is no dedicated site for Composer.trade strategy discovery and education. Strategy authors share symphonies publicly on Composer, but the platform itself does not provide educational context about how the logic works or what signals are in play.

---

## 2. Target Users

**Primary — Composer.trade users**
Self-directed retail investors who already use Composer.trade. They want to understand strategies before cloning them, or want to see how other authors have approached a problem they are solving.

**Secondary — Systematic investing learners**
Intermediate traders learning RSI, momentum, VIX strategies, and leveraged ETF mechanics. They know what a moving average is but have not yet built a systematic strategy. ComposerAtlas explains concepts in the context of real strategies.

**Tertiary — Quant-curious beginners**
Investors curious about algorithmic or rules-based investing who do not yet know the terminology. The glossary serves as their entry point; strategy pages show them real examples.

---

## 3. Goals

- Launch a public-facing site with 13 strategy pages and a concept glossary
- Require zero server infrastructure; run entirely in the browser via GitHub Pages
- Establish a scalable JSON-based strategy database that can grow to thousands of entries
- Educate users on the signals and logic behind each strategy, not just its returns
- Generate passive revenue via Google AdSense (post-MVP) and direct user donations

---

## 4. Non-Goals

- No user accounts or authentication
- No community features or comments
- No newsletter or email capture at launch
- No fully automated metric update pipeline (script-based updates via `scripts/update_metrics.py` are available but require a manual run and commit)
- No mobile app
- No light mode (dark mode only at MVP)

---

## 5. User Stories

**As a Composer.trade user,** I want to see a list of curated strategies with key metrics so that I can quickly compare options before deciding which to investigate further.

**As a Composer.trade user,** I want to read a plain-English explanation of how a strategy works so that I can understand the logic before cloning it.

**As a learner,** I want to click on a signal tag (e.g., "RSI") and read a dedicated page explaining what it is and how it is used in practice so that I can deepen my understanding while exploring strategies.

**As a learner,** I want to see which strategies use a specific concept (e.g., VIX tiers) so that I can find examples of that concept applied in real symphonies.

**As a visitor,** I want to click a single button to open a strategy directly on Composer.trade so that I can clone it without manually searching.

**As a curator,** I want a documented, repeatable process for adding a new strategy from a URL so that the site can grow without increasing per-entry effort.

**As a curator,** I want metrics to stay current without rebuilding the site so that visitors see accurate data after each market refresh.

---

## 6. Feature List

### MVP — Shipped (V1.0–V1.2.1)

**Strategy Library**
- Index page listing all 13 strategies with key metrics at a glance (ARR, Max DD, Sharpe)
- Each strategy has a dedicated page with: name, description, tags, "Open in Composer" CTA, plain-English logic breakdown, signals used (cross-linked to glossary), risk profile, and full metrics table
- Strategy card titles are clickable links

**Concept Glossary**
- Index page listing all 8 glossary concepts with category badges and strategy-use counts
- Each concept has a dedicated page with: definition, how it works, in practice examples, limitations, formula (when applicable), and a "Building with..." essay section
- Concepts cross-link back to strategies that use them

**Data Layer**
- `data/strategies.json` — flat-file database of all 13 strategies
- `data/glossary.json` — flat-file database of all 8 glossary concepts
- Dual-mode loading: `window.STRATEGIES_DATA` / `window.GLOSSARY_DATA` globals for `file://` compatibility; `fetch()` fallback for HTTP
- `scripts/update_metrics.py` — reusable script to refresh all metrics and logic trees from the Composer API

**Navigation & Structure**
- Fixed top nav: Strategies, Glossary, About, Support
- Mobile hamburger menu with drawer
- Breadcrumb navigation on all sub-pages
- Custom 404 page
- About page with disclaimer
- Footer with nav links, legal disclaimer, attribution

**Design**
- Dark mode design system (see docs/DESIGN.md)
- Mobile-responsive layout
- 🗺️ map emoji favicon and nav logo mark

**Deploy**
- GitHub Actions auto-deploy on push to `main`; rsync excludes internal docs and large files

### Future Backlog (Post-MVP)

- Client-side search across strategies and glossary
- Tag-based filtering on strategy index
- Strategy comparison view (side-by-side metrics)
- Performance chart per strategy
- Expand strategy library toward 50+ entries
- Expand glossary with additional concepts
- Google AdSense integration
- Community strategy submission form
- Curator notes visible on strategy pages
- Related strategies section on each strategy page
- Newsletter integration
- Premium strategy tier
- Strategy performance alerts

---

## 7. Constraints

- Must run entirely in browser with no server infrastructure
- Must host on GitHub Pages
- Must use static JSON files as the data source
- Must be maintainable by a single developer
- No Node.js/npm dependencies at any stage (Python only for scripts)
- Zero operational cost at launch

---

## 8. Assumptions

- Composer.trade will remain available and symphony URLs will remain stable
- The Composer API backtest and score endpoints will continue to work without authentication
- GitHub Pages free tier is sufficient for the expected traffic at MVP scale
- A flat JSON file is sufficient for up to ~100 strategies without performance issues
- Backtested data from the Composer API is accurate enough to display as-is, with a last-updated date shown on each strategy page

---

## 9. Success Criteria

- 13 strategy pages live at launch with accurate metrics
- All 8 glossary concepts live at launch with full content
- Page load time under 2 seconds on desktop
- Zero server costs at launch
- At least 1 donation received in first 30 days (qualitative validation)
- Site works correctly by double-clicking HTML files locally (no server required)
- All internal links work on both GitHub Pages and `file://` protocol

---

## Part B — Technical & Operational Reference

---

## 10. Architecture & Technical Reference

### Overview

ComposerAtlas is a fully static, browser-only application. There is no server, no API backend, no database service, and no authentication layer. All data is stored in flat JSON files and served via GitHub Pages. All page rendering is done in the browser via vanilla JavaScript — no build step is required.

### Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| HTML | Vanilla `.html` files | No build step; open in browser or serve with any static host |
| CSS | CSS custom properties | Design token system without requiring a preprocessor |
| JavaScript | Vanilla ES2020 | `fetch()` for data, DOM manipulation for rendering |
| Fonts | Google Fonts CDN | No local build needed |
| Hosting | GitHub Pages | Serves static files directly from repository root |
| CI/CD | GitHub Actions | rsync to `_site/`, upload artifact, deploy |
| Scripts | Python 3 (stdlib only) | Data refresh; no pip dependencies |

**V2 upgrade path:** Astro 5.x is the preferred migration target if the site grows beyond ~20 pages or content management complexity increases. The data schema, design system, and directory conventions are compatible with an Astro migration.

### Directory Structure

```
ComposerAtlas/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deploy (no build step)
├── css/
│   └── main.css                # Full design system: tokens, layout, components
├── data/
│   ├── strategies.json         # 13 strategy entries — source of truth
│   ├── strategies.js           # Same data as window.STRATEGIES_DATA — for file:// compat
│   ├── glossary.json           # 8 glossary concept entries — source of truth
│   ├── glossary.js             # Same data as window.GLOSSARY_DATA — for file:// compat
│   └── symphony_scores.json    # Full logic trees — AI analysis only, not served publicly
├── js/
│   └── app.js                  # Shared utilities: format, nav, footer, render helpers
├── scripts/
│   └── update_metrics.py       # Fetches backtest metrics + logic trees from Composer API
├── index.html                  # Home page (hero + strategy grid)
├── strategies.html             # Strategy listing + detail (?slug=X) — single file
├── glossary.html               # Glossary listing + concept detail (?slug=X) — single file
├── about.html                  # About page
├── 404.html                    # Custom 404 page
├── favicon.svg                 # 🗺️ map emoji SVG favicon
├── robots.txt
├── .gitignore
└── docs/                       # All documentation (excluded from public deploy)
```

### CSS Custom Properties (Design Tokens)

All design tokens are defined as CSS variables in `css/main.css`:

```css
:root {
  --color-bg:             #0d0d0d;
  --color-surface:        #141414;
  --color-surface-raised: #1a1a1a;
  --color-border:         #1f1f1f;
  --color-border-hover:   #2e2e2e;
  --color-primary:        #f0f0f0;
  --color-secondary:      #b0b0b0;
  --color-disabled:       #444444;
  --color-green:          #00e676;
  --color-pink:           #ff4d8d;
  --color-blue:           #4d9fff;
  --color-yellow:         #f5c518;
  --color-purple:         #a78bfa;
  --font-sans:            'Inter', system-ui, -apple-system, sans-serif;
  --font-mono:            'JetBrains Mono', 'Fira Code', monospace;
  --radius-sm:            4px;
  --radius-md:            8px;
  --radius-lg:            12px;
  --nav-height:           56px;
  --max-width:            1280px;
  --page-px:              24px;
}
```

Dark mode is the only supported mode in MVP.

### Data Layer

**strategies.json and strategies.js**

- `data/strategies.json` — source of truth; JSON array of strategy objects
- `data/strategies.js` — assigns `window.STRATEGIES_DATA = [...]`; keeps data accessible on `file://` protocol

Both files must always be kept in sync. When editing `strategies.json`, make the identical change in `strategies.js`.

**glossary.json and glossary.js**

- `data/glossary.json` — source of truth; JSON array of concept objects
- `data/glossary.js` — assigns `window.GLOSSARY_DATA = [...]`

**Dual-mode loading (from `js/app.js`):**

```javascript
async function loadStrategies() {
  if (window.STRATEGIES_DATA) return window.STRATEGIES_DATA;
  const res = await fetch(`${BASE}/data/strategies.json`);
  if (!res.ok) throw new Error('Failed to load strategies.json');
  return res.json();
}
```

The same pattern applies to `loadGlossary()`. This ensures the site works in all three environments: double-click (`file://`), Python HTTP server, and GitHub Pages.

### BASE URL and `u()` Helper

```javascript
// On GitHub Pages (*.github.io) the first path segment is the repo name (e.g. /composer).
// On localhost or a custom domain the site is served at root, so BASE is empty.
const _seg = window.location.pathname.split('/')[1];
const BASE = (window.location.hostname.endsWith('.github.io') && _seg) ? '/' + _seg : '';

// All internal links use u() instead of BASE + path directly
function u(path) {
  if (window.location.protocol !== 'file:') return BASE + path;
  // On file://, all pages are at root depth — strip the leading slash
  // Maps '/' → 'index.html'; '/strategies.html?slug=X' → 'strategies.html?slug=X'
  const [pathPart, qs] = path.split('?');
  const rel = pathPart === '/' ? 'index.html' : pathPart.replace(/^\//, '');
  return rel + (qs ? '?' + qs : '');
}
```

Detects GitHub Pages by hostname (`*.github.io`) rather than matching the repo name — repo-rename-proof and works on any custom domain without changes.

### JS Utility Functions (js/app.js)

| Function | Signature | Purpose |
|---|---|---|
| `loadStrategies()` | `async () => object[]` | Returns strategy array from global or fetch |
| `loadGlossary()` | `async () => object[]` | Returns glossary array from global or fetch |
| `formatPct(n)` | `(float) => string` | `0.312` → `+31.20%`; always includes sign |
| `formatLargePct(n)` | `(float) => string` | For cumulative returns; rounds to nearest integer |
| `formatRatio(n)` | `(float) => string` | `1.43` → `"1.43"` (2 decimal places) |
| `formatDate(iso)` | `(string) => string` | `"2026-06-08"` → `"Jun 8, 2026"` |
| `formatBacktestDays(days)` | `(int) => string` | `551` → `"~2 yrs (551 trading days)"` |
| `colorClass(n)` | `(float) => string` | Returns `text-green`, `text-pink`, or `text-primary` |
| `tagClass(slug)` | `(string) => string` | Returns CSS class for tag pill styling |
| `tagLabel(slug)` | `(string) => string` | Returns display label for a tag slug |
| `renderTag(slug)` | `(string) => string` | Returns full `<a class="tag ...">` HTML |
| `badgeClass(category)` | `(string) => string` | Returns CSS class for category badge |
| `renderNav()` | `() => void` | Injects nav HTML into `#nav-root`; wires hamburger toggle |
| `renderFooter()` | `() => void` | Injects footer HTML into `#footer-root` |
| `renderBreadcrumb(id, crumbs)` | `(string, object[]) => void` | Renders breadcrumb nav into element by ID |
| `renderStrategyCard(s)` | `(object) => string` | Returns strategy card HTML |
| `renderConceptCard(concept, count)` | `(object, int) => string` | Returns glossary concept card HTML |
| `renderMetricsTable(s)` | `(object) => string` | Returns full metrics table HTML (grouped sections) |
| `renderStrategyListItem(s)` | `(object) => string` | Returns compact sidebar strategy row HTML |

### Page Routes

| URL (GitHub Pages) | File | Rendering |
|---|---|---|
| `/composer/` | `index.html` | JS renders strategy grid |
| `/composer/strategies.html` | `strategies.html` | Listing view (no slug) |
| `/composer/strategies.html?slug=foo` | `strategies.html` | Detail view for `foo` |
| `/composer/glossary.html` | `glossary.html` | Listing view (no slug) |
| `/composer/glossary.html?slug=foo` | `glossary.html` | Detail view for `foo` |
| `/composer/about.html` | `about.html` | Static HTML |
| `/composer/404.html` | `404.html` | GitHub Pages error page |

**Listing/detail routing:** Each combined page checks `new URLSearchParams(window.location.search).get('slug')` on load. `null` → listing view; non-null → detail view for that slug.

### GitHub Actions Deploy Pipeline

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - name: Build deploy folder
        run: |
          mkdir -p _site
          rsync -a \
            --exclude='.git' \
            --exclude='.github' \
            --exclude='_site' \
            --exclude='docs' \
            --exclude='scripts' \
            --exclude='data/symphony_scores.json' \
            --exclude='strategies.xlsx' \
            --exclude='README.MD' \
            --exclude='.gitignore' \
            . _site/
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '_site'
      - uses: actions/deploy-pages@v4
        id: deployment
```

### Performance Targets

| Metric | Target |
|---|---|
| Lighthouse Performance | 85+ |
| Lighthouse Accessibility | 90+ |
| Largest Contentful Paint (LCP) | < 2s (desktop) |
| Total page weight (home) | < 500KB uncompressed |
| JS shipped to client | < 15KB (app.js + page scripts) |

### Browser Support

Chrome 100+, Firefox 100+, Safari 15+, Edge 100+. No IE11. Requires: `fetch()`, `URLSearchParams`, CSS custom properties, `async/await`.

### Future Technical Considerations

| Feature | Approach |
|---|---|
| Client-side search | Fuse.js filter over loaded JSON |
| Tag filtering on index | Vanilla JS DOM filter |
| Performance charts | Chart.js or uPlot — loaded as a module script |
| Build system upgrade | Migrate to Astro 5.x |
| Analytics | Plausible (privacy-friendly) — post-MVP only |

---

## 11. Operational Runbook

### Local Development Setup

**Prerequisites:** Python (any version), Git. No Node.js required.

**Option 1 — Python HTTP server:**
```bash
python -m http.server 8000
# Site at http://localhost:8000/
```

**Option 2 — Open directly:** Double-click any `.html` file. Site loads fully because `data/strategies.js` and `data/glossary.js` are loaded as script tags before `app.js`.

**Validate JSON before committing:**
```bash
python -c "import json; json.load(open('data/strategies.json')); print('Valid JSON')"
python -c "import json; json.load(open('data/glossary.json')); print('Valid JSON')"
```

---

### Adding a Strategy from a Composer URL (Streamlined — Preferred)

Provide a Composer.trade symphony URL to Claude Code and it automates the entire workflow.

**What you need to provide:**
- A Composer.trade symphony URL (any form: `/symphony/ID`, `/symphony/ID/factsheet`, `/symphony/ID/details`)
- Optional: preferred strategy name and slug (if omitted, Claude Code proposes them and asks for confirmation)

**What Claude Code does automatically:**
1. Extracts the symphony ID from the URL
2. Fetches backtest metrics via `POST /api/v0.1/symphonies/{id}/backtest` (no auth required)
3. Fetches the logic tree via `GET /api/v0.1/symphonies/{id}/score`
4. Analyzes the logic tree to determine: primary trend gate, volatility routing, dip-buy conditions, cross-asset signals, correct canonical tags
5. Drafts all content fields: `description`, `how_it_works`, `signals`, `risk_profile`
6. Proposes name and slug; asks for confirmation before inserting
7. Inserts the complete entry into `data/strategies.json` and `data/strategies.js`
8. Updates `docs/PATCHNOTES.md`

**Example usage:**
```
"Add this strategy: https://app.composer.trade/symphony/K8ql2SKFd4VDBemIstEr/factsheet
 Name: s90 50/40 maxDD (Half Low Catch), slug: s90-half-low-catch"
```

**Known limitations:**
- Very complex symphonies with very large logic trees may require truncation; Claude Code will note this
- Short backtests (<1 year) yield metrics sensitive to the covered market period; surfaced in `risk_profile` and `author_note`
- Always review drafted content and correct any characterizations that do not match the strategy's actual intent

---

### Adding a New Strategy (Manual)

Use when you prefer full control or the Composer API is unavailable.

**Step 1: Gather metrics.** Collect all required fields from Composer.trade. See the schema in Section 12.

**Step 2: Generate a slug.** Derive from the strategy name: lowercase, spaces → hyphens, remove special characters. Examples: "VIX Tier Rotator" → `vix-tier-rotator`. Do not change a slug after a strategy page is live — it breaks inbound links.

**Step 3: Update both data files.** Append to `data/strategies.json`, then make the identical addition to `data/strategies.js` (inside the `window.STRATEGIES_DATA = [...]` array).

```json
{
  "slug": "strategy-slug-here",
  "name": "Strategy Name Here",
  "symphony_url": "https://app.composer.trade/symphony/SYMPHONY_ID/details",
  "symphony_id": "SYMPHONY_ID",
  "annualized_rate_of_return": 0.000,
  "max_drawdown": -0.000,
  "cumulative_return": 0.000,
  "calmar_ratio": 0.00,
  "sharpe_ratio": 0.00,
  "standard_deviation": 0.000,
  "min": -0.000,
  "mean": 0.000,
  "median": 0.000,
  "max": 0.000,
  "trailing_one_month_return": 0.000,
  "trailing_three_month_return": 0.000,
  "trailing_one_year_return": 0.000,
  "backtest_days": 0,
  "description": "Plain-English description. 1-3 sentences. No HTML.",
  "tags": ["tag1", "tag2"],
  "last_updated": "YYYY-MM-DD",
  "how_it_works": ["Paragraph 1.", "Paragraph 2.", "Paragraph 3."],
  "signals": [
    { "name": "Signal Name", "tag": "related-tag", "description": "What this signal does." }
  ],
  "risk_profile": "Risk level and description."
}
```

**Step 4: Verify tags.** Confirm every tag has a matching glossary entry. See the tag vocabulary in Section 12.

**Step 5: Test locally.**
```bash
python -m http.server 8000
# Navigate to http://localhost:8000/strategies.html?slug=strategy-slug-here
```

**Step 6: Update PATCHNOTES.md.** Add a versioned entry.

**Step 7: Commit and push.**
```bash
git add data/strategies.json data/strategies.js docs/PATCHNOTES.md
git commit -m "feat: add [Strategy Name] strategy"
git push origin main
```

---

### Updating Metrics (Script)

Run monthly or after any symphony logic changes:

```bash
python scripts/update_metrics.py
```

This script:
1. Hits `POST /api/v0.1/symphonies/{id}/backtest` for all 13 strategies → rewrites `data/strategies.json` and `data/strategies.js`
2. Hits `GET /api/v0.1/symphonies/{id}/score` for all 13 strategies → rewrites `data/symphony_scores.json`

No API key required. After running:

```bash
git add data/strategies.json data/strategies.js data/symphony_scores.json
git commit -m "data: refresh metrics and symphony scores - YYYY-MM-DD"
git push origin main
```

**symphony_scores.json is for AI analysis only** — it is not served to the website. It contains the full EDN logic tree for each symphony, used to explain strategy logic in future conversations.

---

### Updating Metrics (Manual — Single Strategy)

1. Open `data/strategies.json` and `data/strategies.js`. Locate the entry by `slug`.
2. Update changed metric values. Set `last_updated` to today's date.
   - **Important:** `max_drawdown` is always stored as a negative number (e.g., `-0.432`, not `0.432`).
3. Validate JSON: `python -c "import json; json.load(open('data/strategies.json')); print('Valid JSON')"`
4. Commit: `git add data/strategies.json data/strategies.js && git commit -m "data: update metrics for [Strategy Name] - YYYY-MM-DD"`

---

### Adding a Glossary Entry

**Step 1: Add to both glossary files.**

Append a new entry to `data/glossary.json`, then make the identical addition to `data/glossary.js`.

```json
{
  "slug": "concept-slug",
  "name": "Concept Name",
  "category": "indicator",
  "description": "One-sentence description (under 160 characters).",
  "formula": "Optional formula string, or null",
  "related_tags": ["concept-slug"],
  "last_updated": "YYYY-MM-DD",
  "sections": [
    { "title": "Definition", "paragraphs": ["..."] },
    { "title": "How It Works", "paragraphs": ["..."] },
    { "title": "In Practice", "paragraphs": ["..."] },
    { "title": "Limitations", "paragraphs": ["..."] }
  ]
}
```

Valid `category` values: `"indicator"`, `"risk-metric"`, `"asset-class"`, `"strategy-concept"`

**Step 2: Tag related strategies.** Ensure relevant strategies in `data/strategies.json` include this concept's tag.

**Step 3: Test locally.**
```bash
python -m http.server 8000
# Navigate to http://localhost:8000/glossary.html?slug=concept-slug
```

**Step 4: Commit.**
```bash
git add data/glossary.json data/glossary.js data/strategies.json docs/PATCHNOTES.md
git commit -m "feat: add glossary entry for [Concept Name]"
git push origin main
```

---

### Removing a Strategy

1. Delete the entry from `data/strategies.json` and `data/strategies.js`.
2. Update `docs/PATCHNOTES.md` documenting the removal with a reason.
3. Commit:
```bash
git add data/strategies.json data/strategies.js docs/PATCHNOTES.md
git commit -m "remove: [Strategy Name] - [reason]"
git push origin main
```

---

### Deployment Workflow

ComposerAtlas deploys automatically via GitHub Actions on every push to `main`. No manual steps required.

- **Live URL:** https://azqato.github.io/composer
- **Repository:** https://github.com/Azqato/composer
- **Deploy time:** Typically 1-2 minutes after push

To monitor: go to GitHub → Actions tab → find "Deploy to GitHub Pages" run. Green = deployed; red = failed (check logs).

The workflow excludes from public deployment: `data/symphony_scores.json`, `docs/`, `scripts/`, `strategies.xlsx`, `README.MD`, `.gitignore`, `.github/`.

---

### Checking for Broken Composer Links

Periodically verify that `symphony_url` links still resolve on Composer.trade:

1. Open `data/strategies.json`
2. For each entry, open the `symphony_url` in a browser
3. If broken: update the URL or remove the strategy
4. Recommended frequency: monthly

---

### Re-Analyzing Strategy Logic Trees

When a symphony author updates their logic, or when existing `how_it_works`, `signals`, `tags`, or `risk_profile` content needs to be verified against the actual IF/ELSE structure.

**Step 1: Refresh symphony_scores.json.**
```bash
python scripts/update_metrics.py
```

**Step 2: Have an AI analyze the logic trees.** `data/symphony_scores.json` is ~14MB of raw EDN-format logic tree data. Provide the file to Claude Code (or any AI with a large context window) and ask it to:
1. Parse each symphony's logic tree into human-readable IF/ELSE pseudocode
2. Identify: primary trend gate, volatility routing, dip-buy conditions, cross-asset signals, terminal leaf allocations
3. Compare findings to existing `how_it_works`, `signals`, and `tags`
4. Flag discrepancies

**Structural pattern (2026 library):** All 13 symphonies share this structure:
```
[EqualWeight]
  ├── zoop's 2026 Frontrunner (50%)    ← shared base component
  └── [Strategy-specific component] (50%)
```

The Frontrunner always contributes: RSI(10) oversold dip-buys (SMH <23 → SOXL; QQQ <28 → TQQQ; SPY <28 → UPRO), XLY RSI >79 → VXX, UVXY RSI >65 → SPXU or TQQQ, default → BIL. Therefore every strategy automatically inherits `rsi` and `vix-tiers` tags.

**Step 3: Update `strategies.json` and `strategies.js`** with corrected `tags`, `signals`, `how_it_works`, and `risk_profile`.

**Step 4: Validate and test.**
```bash
python -c "import json; json.load(open('data/strategies.json')); print('Valid JSON')"
python -m http.server 8000
```

**Step 5: Update PATCHNOTES.md** with a minor version entry.

**Step 6: Commit.**
```bash
git add data/strategies.json data/strategies.js data/symphony_scores.json docs/PATCHNOTES.md
git commit -m "content: re-analyze logic trees and update strategy content - YYYY-MM-DD"
git push origin main
```

---

### Troubleshooting

**Site not updating after push**
1. GitHub → Actions tab → check build/deploy status
2. If failed: check the error log
3. If deployed but looks old: hard refresh (Ctrl+Shift+R) or clear browser cache
4. GitHub Pages CDN propagation can take up to 5 minutes

**Strategy or glossary page shows blank / spinner stuck**
- Open browser dev tools → Console tab
- Check for JavaScript errors
- Confirm `data/strategies.js` and `data/glossary.js` exist and contain valid JavaScript
- If using Python HTTP server, also confirm `data/strategies.json` and `data/glossary.json` are valid JSON

**JSON parse error in browser**
- Look for `SyntaxError: Unexpected token` in the browser console
- Validate: `python -c "import json; json.load(open('data/strategies.json')); print('OK')"`
- Common causes: trailing comma on last array item, missing quotes, unclosed bracket

**Strategy not found**
- Confirm the `slug` in `strategies.json` exactly matches the `?slug=` query parameter in the URL (case-sensitive)

**Local dev — data not loading when opened directly**
- Confirm `data/strategies.js` and `data/glossary.js` are present
- Confirm each HTML page has `<script src="data/strategies.js">` and `<script src="data/glossary.js">` before the `app.js` script tag
- All pages are at root level — all script src paths use `data/` (no `../` prefix needed)

---

### Versioning Convention

| Change Type | Version Bump | Example |
|---|---|---|
| New site sections, breaking schema changes | Major (X.0.0) | Adding user auth |
| New features, new strategies, new glossary entries | Minor (1.X.0) | Adding a new strategy page |
| Metric updates, bug fixes, copy corrections | Patch (1.0.X) | Refreshing trailing return figures |

Update `docs/PATCHNOTES.md` for every change, including data-only updates.

---

## 12. Strategy & Glossary Data Schemas

### Strategy JSON Schema

All fields in `data/strategies.json`. Both `strategies.json` and `strategies.js` must always be kept in sync.

| Field | Type | Required | Description |
|---|---|---|---|
| `slug` | string | Yes | URL slug (e.g., `vix-tier-rotator`). Used as `?slug=` param. Must be lowercase, hyphen-separated, unique. Do not change after a page is live — breaks inbound links. |
| `name` | string | Yes | Display name (e.g., "VIX Tier Rotator") |
| `symphony_url` | string | Yes | Full URL to clone on Composer.trade |
| `symphony_id` | string | Yes | Composer symphony ID (alphanumeric segment from URL) |
| `annualized_rate_of_return` | float | Yes | Annualized return as decimal (e.g., `0.312` = 31.2%) |
| `max_drawdown` | float | Yes | Maximum drawdown as decimal — always negative (e.g., `-0.187` = -18.7%) |
| `cumulative_return` | float | Yes | Total cumulative return since inception as decimal |
| `calmar_ratio` | float | Yes | Annualized return / abs(max drawdown). Higher is better. |
| `sharpe_ratio` | float | Yes | (Return − risk-free rate) / std deviation. Higher is better. |
| `standard_deviation` | float | Yes | Annualized standard deviation of returns |
| `min` | float | Yes | Minimum single-period return observed |
| `mean` | float | Yes | Mean single-period return |
| `median` | float | Yes | Median single-period return |
| `max` | float | Yes | Maximum single-period return observed |
| `trailing_one_month_return` | float | Yes | Return over trailing 1-month period |
| `trailing_three_month_return` | float | Yes | Return over trailing 3-month period |
| `trailing_one_year_return` | float | Yes | Return over trailing 1-year period |
| `backtest_days` | integer | Yes | Backtest length in trading days. Display as `~X yrs (N trading days)` using `Math.round(days / 252)`. |
| `description` | string | Yes | Short plain-English description (1-3 sentences). No HTML tags. |
| `tags` | string[] | Yes | Concept tags for glossary cross-linking. Must match `slug` values in `data/glossary.json`. |
| `last_updated` | string | Yes | ISO date metrics were last updated (YYYY-MM-DD) |
| `how_it_works` | string[] | Recommended | Paragraphs explaining strategy logic. Each string becomes a `<p>` tag. |
| `signals` | object[] | Recommended | Signals used. Each: `{ "name": string, "tag": string, "description": string }`. `tag` must match a glossary slug. |
| `risk_profile` | string | Recommended | Risk summary for the strategy detail page. |
| `author_note` | string | Optional | Curator note (plain text, no HTML). Displayed on the detail page when present. |

**Metric calculation notes:**
- `calmar_ratio` = `annualized_rate_of_return` / abs(`max_drawdown`)
- `sharpe_ratio` — pull directly from Composer's displayed value; Composer uses its own internal risk-free rate baseline
- `max_drawdown` — the Composer API returns this as a positive number; the script stores it negative. Always store negative.
- `backtest_days` — the API field is `size`; the script maps it to `backtest_days`
- Period returns (min, mean, median, max) represent single-period (typically monthly) returns, not annualized

**Slug convention:**
- Lowercase, spaces → hyphens, remove special characters
- "VIX Tier Rotator" → `vix-tier-rotator`
- "TQQQ/BIL Switcher" → `tqqq-bil-switcher`
- Append `-2` if a collision occurs
- Never change a slug after a page is live

**Extended schema fields (post-MVP, optional):**

| Field | Type | Description |
|---|---|---|
| `inception_date` | string (ISO date) | Date strategy was created on Composer |
| `benchmark` | string | Benchmark ticker (e.g., `"SPY"`) |
| `assets` | string[] | List of tickers the strategy can hold |
| `rebalance_frequency` | string | `"daily"`, `"weekly"`, `"monthly"` |
| `risk_level` | string | `"conservative"`, `"moderate"`, `"aggressive"` |
| `trailing_five_year_return` | float | 5-year trailing return |
| `sortino_ratio` | float | Sortino ratio (penalizes only downside volatility) |
| `beta` | float | Beta relative to benchmark |
| `alpha` | float | Alpha relative to benchmark |

---

### Metric Display Guidelines

**Formatting:**
- Float percentages: display as `+XX.XX%` or `-XX.XX%` (multiply by 100; always include sign)
- Ratios (Sharpe, Calmar): plain decimal `X.XX`, no percent sign
- All numeric values: monospace font (`font-mono`)
- `last_updated`: human-readable (e.g., `Jun 8, 2026`)

**Color coding:**

| Value Type | Color |
|---|---|
| Positive return / ARR / trailing returns | `--color-green` |
| Negative return / max drawdown | `--color-pink` |
| Calmar ratio, Sharpe ratio | `--color-primary` (no color coding) |
| Standard deviation | `--color-primary` |
| Min period return (negative) | `--color-pink` |
| Max period return (positive) | `--color-green` |
| Mean / median period return | `--color-yellow` |

**MetricsTable display order (as implemented in `renderMetricsTable()`):**
1. Returns: Ann. Return, Cumulative Return
2. Risk: Max Drawdown, Std Deviation
3. Risk-Adjusted: Sharpe Ratio, Calmar Ratio
4. Monthly Distribution: Min Month, Mean Month, Median Month, Max Month
5. Trailing Returns: 1-Month, 3-Month, 1-Year
6. Metadata: Backtest Period, Last Updated

---

### Canonical Tag Vocabulary

Tags must match the `slug` of a glossary entry in `data/glossary.json`. All 8 current tags:

| Tag | Glossary Slug | Concept |
|---|---|---|
| `rsi` | `rsi` | Relative Strength Index |
| `200d-ma` | `200d-ma` | 200-Day Moving Average |
| `momentum` | `momentum` | Momentum Investing |
| `vix-tiers` | `vix-tiers` | VIX Tier Rotation |
| `leveraged-etfs` | `leveraged-etfs` | Leveraged ETFs |
| `sharpe-ratio` | `sharpe-ratio` | Sharpe Ratio |
| `calmar-ratio` | `calmar-ratio` | Calmar Ratio |
| `max-drawdown` | `max-drawdown` | Max Drawdown |

Add new tags only when a corresponding glossary entry exists or is planned.

---

### Glossary Concept JSON Schema

All fields in `data/glossary.json`. Both `glossary.json` and `glossary.js` must always be kept in sync.

```json
{
  "slug": "string",          // URL slug — must match tag values in strategies.json
  "name": "string",          // Display name
  "category": "string",      // "indicator" | "risk-metric" | "asset-class" | "strategy-concept"
  "description": "string",   // One-sentence definition (under 160 chars)
  "formula": "string|null",  // Mathematical formula in plain text, or null
  "related_tags": ["string"],// Tags in strategies.json that map to this concept
  "last_updated": "string",  // ISO date of last content revision (YYYY-MM-DD)
  "sections": [
    {
      "title": "string",
      "paragraphs": ["string"],
      "table": {              // Optional: renders as a two-column table
        "headers": ["string"],
        "rows": [["string"]]
      }
    }
  ]
}
```

**Category values:**

| Value | Display Label | Badge Color | Used For |
|---|---|---|---|
| `indicator` | Indicator | Blue | RSI, 200d MA, momentum signals |
| `risk-metric` | Risk Metric | Pink | Sharpe ratio, Calmar ratio, max drawdown |
| `asset-class` | Asset Class | Yellow | Leveraged ETFs, bonds, equity indices |
| `strategy-concept` | Strategy Concept | Purple | VIX tiers, defensive rotation, rebalancing |

**Required sections (in order):** Definition, How It Works, In Practice, Limitations

**Optional sections:** Additional sections with any title. All 8 MVP entries include a "Building with [Concept] in Composer.trade" essay section.

**Canonical glossary entries (MVP):**

| Slug | Name | Category |
|---|---|---|
| `rsi` | RSI | indicator |
| `200d-ma` | 200-Day Moving Average | indicator |
| `momentum` | Momentum Investing | strategy-concept |
| `vix-tiers` | VIX Tiers | strategy-concept |
| `leveraged-etfs` | Leveraged ETFs | asset-class |
| `sharpe-ratio` | Sharpe Ratio | risk-metric |
| `calmar-ratio` | Calmar Ratio | risk-metric |
| `max-drawdown` | Max Drawdown | risk-metric |

**Glossary entry checklist (before committing):**
- [ ] `slug` is lowercase, hyphen-separated, unique
- [ ] `slug` matches a tag value used in `strategies.json`
- [ ] `category` is one of the four valid values
- [ ] `description` is one sentence, under 160 characters
- [ ] `sections` includes all required sections: Definition, How It Works, In Practice, Limitations
- [ ] `last_updated` is today's date
- [ ] Identical entry added to `data/glossary.js`
- [ ] JSON validates: `python -c "import json; json.load(open('data/glossary.json')); print('OK')"`
- [ ] Detail page renders correctly at `http://localhost:8000/glossary.html?slug=your-slug`

---

## 13. Composer API Reference

Base URL: `https://api.composer.trade`

### Authentication

Most endpoints require no authentication. Try without auth first. If auth is required:

```
x-api-key-id: <key-id>
authorization: Bearer <key-secret>
```

Get credentials: Composer.trade → Settings → API Access → Generate New API Key.

ComposerAtlas uses only the two unauthenticated endpoints listed below. No credentials are stored or required.

### Rate Limits

| Endpoint | Limit |
|---|---|
| All endpoints (default) | 1 req/sec |
| `POST /symphonies/{id}/backtest` | 500 req/sec |

### Backtest Endpoint

`POST /api/v0.1/symphonies/{symphony-id}/backtest`

**Request body used by `update_metrics.py`:**

```json
{
  "capital": 10000,
  "broker": "alpaca",
  "slippage_percent": 0.0005,
  "apply_reg_fee": true,
  "apply_taf_fee": true
}
```

**Key response fields (under `stats`):**

| Field | Type | Notes |
|---|---|---|
| `annualized_rate_of_return` | float | Maps 1:1 to schema field |
| `cumulative_return` | float | Maps 1:1 |
| `calmar_ratio` | float | Maps 1:1 |
| `sharpe_ratio` | float | Maps 1:1 |
| `standard_deviation` | float | Maps 1:1 |
| `min`, `mean`, `median`, `max` | float | Monthly distribution — maps 1:1 |
| `trailing_one_month_return`, etc. | float | Maps 1:1 |
| `max_drawdown` | float | **Returned as positive by API; stored as negative in schema** |
| `size` | integer | Backtest days; stored as `backtest_days` in schema |

Full response also includes `dvm_capital`, `tdvm_weights`, `rebalance_days`, `last_market_days_holdings`, `costs`, `legend`, `data_warnings`, `benchmark_errors`.

### Logic Tree Endpoint

`GET /api/v0.1/symphonies/{symphony-id}/score`

| Param | In | Required | Notes |
|---|---|---|---|
| `symphony-id` | path | yes | |
| `score_version` | query | yes | `"v1"` or `"v2"` — use `"v1"` |

Returns the symphony's full IF/ELSE logic tree as a nested JSON object. The `step` field on each node indicates its type: `"root"`, `"if"`, `"asset"`, `"group"`, `"filter"`, etc. The `children` array contains nested nodes.

Used by `update_metrics.py` to refresh `data/symphony_scores.json`.

### Symphony ID Reference

All 18 ComposerAtlas strategies with their Composer symphony IDs:

| Strategy | Symphony ID |
|---|---|
| zoop's 2026 Frontrunner | `4aI4kVT5cEc0XJpTLei3` |
| zoop's Holy Grail (2026 Edition) | `Y2xvfu7iFNyO6up77gBI` |
| zoop's TQQQ FOR THE LONG TERM (2026 Edition) | `yIMvLUHfzAMATCpOKr9T` |
| zoop's Excellent Adventure (2026 Edition) | `YIiBr33X4rRTVlOWhCNq` |
| zoop's Sometimes TQQQ (2026 Edition) | `uAaEkEq8cPOmGgfEWTOU` |
| zoop's Safety Checks (2026 Edition) | `RLt1Rzz79I6Fa2X9QKqY` |
| zoop's Manhattan Project (2026 Edition) | `cCi1mupGsluFmre7HpOm` |
| zoop's KMLM Switcher (2026 Edition) | `4AuTagHMeiS4usdZEuDK` |
| zoop's UPRO FTLT (2026 Edition) | `9ETFQi5cmSWq2mT4ZH2d` |
| zoop's Leveraged TQQQ Symphony (2026 Edition) | `U6lT1G0PdE9fUxoy2opg` |
| zoop's TQQQ 200d MA 3x Leverage (2026 Edition) | `ZBpjzxS9RkLzft9NNWhO` |
| zoop's SOXL Growth (2026 Edition) | `wcEUcb13v7M8bEluRc1h` |
| s90 50/40 maxDD (Half Low Catch) | `K8ql2SKFd4VDBemIstEr` |
| The Holy Grail (Original) | `MmQbpf2U5TMQFmr9Nt2e` |
| TQQQ For The Long Term | `HukRwDJLlYPLMbrQbua5` |
| Wooden ARKK Machine 2.2 | `kl2dR0Rlp4RgZUHAJY2k` |
| Super Semiconductors | `zTV33nu3o0h5fKpT6IqL` |
| The Four Horsemen of the Apocalypse | `vkJ5YCvzJLBu2KKF6Oy0` |

Use these IDs with `/backtest`, `/score`, `/versions`, and portfolio endpoints.

---

## 14. Roadmap

### V1.0 — MVP

**Launched:** 2026-06-08 | **Status:** Complete
**Live URL:** https://azqato.github.io/composer/

- [x] Vanilla HTML/CSS/JS scaffolded (zero build dependencies)
- [x] GitHub Pages deployment configured (rsync workflow; docs/scripts excluded)
- [x] `data/strategies.json` with 13 strategies
- [x] Strategy index page (all 13 with key metrics)
- [x] 13 strategy detail pages (logic breakdown, metrics table, Composer CTA)
- [x] Concept glossary index and 8 detail pages
- [x] Cross-linking: strategies and glossary
- [x] Top navigation: Strategies, Glossary, About, Support
- [x] About page, Support link, Custom 404 page
- [x] Dark mode design system
- [x] Mobile-responsive layout

### V1.1 — Polish + Content Quality

**Status:** Complete (at v1.1.5)

- [x] All 12 strategy pages rewritten from logic tree analysis (v1.1.0); 13th added (v1.1.7)
- [x] `scripts/update_metrics.py` live (v1.0.8)
- [x] Fix: navigation broken on `file://` protocol — `u()` helper added (v1.0.4)
- [x] Fix: all links broken on GitHub Pages — case-insensitive BASE detection (v1.1.2)
- [x] Footer simplified to match azqato.github.io (v1.1.3)
- [ ] Google AdSense integration (pending approval)
- [ ] Performance audit and Lighthouse optimization

### V1.2 — Data Tooling + Structure Refactor

**Status:** Mostly Complete (at v1.2.1)

- [x] `scripts/update_metrics.py` pulls from Composer API (backtest + score) — no auth required
- [x] Streamlined URL-based strategy addition workflow documented in Runbook (v1.8)
- [x] Folder structure consolidated: flat root `.html` files; `strategies/` and `glossary/` subdirs eliminated (v1.2.0)
- [x] URL patterns: `?slug=X` replaces `/detail/?slug=X` (v1.2.0)
- [x] `u()` helper simplified — depth-agnostic (v1.2.0)
- [ ] Validation: script checks required fields before writing

### V2.0 — Scale + Discovery

**Status:** Backlog

- [ ] Client-side search (Fuse.js or similar)
- [ ] Tag-based filtering on strategy index
- [ ] Strategy comparison view
- [ ] Performance chart per strategy
- [ ] Expand strategy library toward 50+ entries
- [ ] Expand glossary

### V2.1 — Community Signals

**Status:** Backlog

- [ ] Strategy submission form
- [ ] Curator notes field visible on strategy pages
- [ ] Related strategies section on each strategy page

### V3.0 — Monetization Expansion

**Status:** Ideation

- [ ] Premium strategy tier
- [ ] Newsletter integration
- [ ] Strategy performance alerts

### Icebox

- User accounts / saved strategies
- Portfolio simulator
- Community forum
- Mobile app

---

## 15. Security

ComposerAtlas is a fully static, browser-only website with no server infrastructure, no user accounts, no authentication, and no database service. This architecture significantly limits the attack surface.

### Architecture Security Posture

| Concern | Status | Notes |
|---|---|---|
| Server-side vulnerabilities | N/A | No server exists |
| SQL injection | N/A | No database service |
| Authentication bypass | N/A | No auth layer |
| Secret/key exposure | Low risk | No API keys in client code |
| XSS (Cross-Site Scripting) | Managed | See below |
| Supply chain attacks | Low risk | Zero npm dependencies |
| Data exfiltration | N/A | No user data collected |
| HTTPS | Required | GitHub Pages enforces HTTPS |

### Key Security Practices

**No secrets in client code.** No API keys, tokens, or credentials are stored in the repository or rendered in client-side JavaScript. The Composer API endpoints used for data refresh require no authentication. The `symphony_url` values are public by nature.

**JSON data integrity.** `data/strategies.json` is the only data source and is committed to the public repo. All changes go through GitHub's commit history — a full audit trail. No PII in strategy entries.

**XSS prevention.** All dynamic content rendered from JSON must be escaped before DOM insertion. Do not use `innerHTML` with unsanitized JSON values. Strategy descriptions and names in JSON must not contain HTML tags. The `app.js` render functions use template literals with escaped data.

**Dependency management.** ComposerAtlas has zero npm/Node.js dependencies. External resources are limited to Google Fonts CDN (fonts only; no JS). If a CDN dependency is ever added, it must be from an official source with SRI (Subresource Integrity) hash verification.

**External links.** All links to external sites must use `target="_blank"` with `rel="noopener noreferrer"` to prevent tab-napping.

**GitHub repository.** Repository is public — treat all committed content as fully public. Never commit `.env` files, credentials, or PII. Branch protection on `main` is recommended: require PR review before merge.

### Google AdSense (Post-MVP)

When AdSense is integrated: use only the official Google AdSense script tag. Do not load ad scripts from unverified third-party sources. Review AdSense policy compliance before enabling.

### Responsible Disclosure

If you discover a security issue (e.g., malicious content injection via JSON, broken external link pointing to a compromised domain), report it by opening a GitHub Issue tagged `security` or contacting the repository owner directly. Reports acknowledged within 72 hours; confirmed issues addressed in the next available release.

### Out of Scope

- Security of Composer.trade (third-party platform)
- Security of the user's Composer.trade account
- Investment losses from using featured strategies

---

## 16. Tenets

These tenets guide every product, design, and technical decision. When trade-offs arise, consult this list. Order matters: higher tenets take precedence over lower ones.

### 1. Transparency Over Hype

Every strategy is presented with its full metrics, including drawdowns and risk figures. We never cherry-pick data to make a strategy look better than it is. Visitors should leave with an accurate picture, not an inflated one.

*If we are tempted to hide a metric because it looks bad, we show it anyway.*

### 2. Education Before Promotion

ComposerAtlas exists to teach first. Strategy pages explain the logic, signals, and reasoning behind every symphony. A visitor who understands why a strategy works is more valuable than one who blindly clones it.

*If we cannot explain a strategy in plain English, we do not feature it yet.*

### 3. Simplicity Over Complexity

Every feature should reduce friction, not add it. The site should feel like a well-organized wiki, not a bloated dashboard. When in doubt, remove the element.

*If a feature requires a tutorial to use, reconsider the feature.*

### 4. Zero Cost to Operate

ComposerAtlas runs on GitHub Pages with no server, no database service, and no paid infrastructure. Every technical decision must be evaluated against this constraint. Complexity that introduces operational cost is rejected at MVP.

*If it requires a server, find a static alternative.*

### 5. Data Is the Product

The strategy database is the most valuable asset of ComposerAtlas. Metrics must be accurate, schema must be consistent, and updates must be logged. A strategy with stale or incorrect data should be flagged or removed.

*If the data is wrong, the site is wrong.*

### 6. Design With Intention

Every visual decision should serve the user's ability to understand information. Color is used semantically (green = positive, pink = negative). Typography is used for hierarchy. White space is not wasted. We do not decorate for the sake of decoration.

*If an element does not aid comprehension, remove it.*

### 7. Independence and Integrity

ComposerAtlas is not affiliated with Composer.trade. We do not receive compensation for featuring any strategy. Our editorial choices are not for sale. If we ever establish a formal partnership or receive compensation, it will be disclosed prominently.

*If it creates a conflict of interest, disclose it or avoid it.*

### 8. Open and Maintainable

The codebase is public, readable, and maintainable by a single developer. We do not introduce dependencies or patterns that create lock-in or require specialist knowledge to maintain.

*If the next developer cannot understand it in 10 minutes, simplify it.*

---

## 17. FAQ

### User FAQ

**Q: What is ComposerAtlas?**
A: ComposerAtlas is a free reference website that showcases 18 curated Composer.trade strategies, explains how they work in plain language, and educates visitors on the investing concepts behind them.

**Q: Who is this for?**
A: Self-directed retail investors who use Composer.trade, are curious about systematic investing, or want to learn about concepts like RSI, VIX strategies, momentum, or leveraged ETFs.

**Q: Are these strategies financial advice?**
A: No. ComposerAtlas is an educational resource. All strategies are presented for informational purposes only. Past performance does not guarantee future results. Always do your own research before investing.

**Q: Can I clone these strategies on Composer.trade?**
A: Yes. Each strategy page includes a direct link to clone the symphony on Composer.trade.

**Q: Is ComposerAtlas free?**
A: Yes. The site is free to access. If you find it valuable, you can support development via a donation at https://azqato.github.io/support.html.

**Q: Who curates the strategies?**
A: Strategies are selected and maintained by the site owner. All featured strategies are presented with full transparency on their logic and metrics.

**Q: How often are metrics updated?**
A: Metrics are updated manually via GitHub commits. Each strategy page displays a last updated date.

**Q: Is ComposerAtlas affiliated with Composer.trade?**
A: No. ComposerAtlas is an independent, community-built resource. Composer.trade is a separate company and platform.

### Operational FAQ

**Q: Why build this as a static site?**
A: Zero server cost, zero maintenance overhead, maximum reliability. GitHub Pages is free, fast, and requires no infrastructure management.

**Q: Why JSON instead of a real database?**
A: At MVP scale (10-100 strategies), a flat JSON file is sufficient, fast, and requires no backend. The schema is designed to migrate easily to a real database if scale demands it.

**Q: How does the site make money?**
A: Google AdSense (post-MVP) and direct user donations via https://azqato.github.io/support.html.

**Q: What happens if Composer.trade changes their URLs?**
A: The `symphony_url` field in the JSON can be updated per strategy via a commit. A future script will automate this check.

**Q: How do I add a new strategy?**
A: See Section 11 (Operational Runbook) for the full process. The preferred method is providing a Composer URL to Claude Code.

**Q: What is the long-term vision?**
A: Become the canonical public reference for Composer.trade strategy discovery and education, eventually hosting thousands of strategies with search, filtering, and comparison tools.

### Content Notes

**Strategy building best practice — avoid short lookback periods:**
Do not use RSI or return checks shorter than 10 days (e.g., `1d`). Very short windows make the algorithm extremely twitchy and will not match the backtest in out-of-sample (OOS) performance.

---

## 18. Documentation Process

### 4-File Structure

As of v1.3.0 (2026-06-14), ComposerAtlas documentation lives in exactly 4 files:

| File | Purpose | Who Updates It |
|---|---|---|
| `README.md` | Developer quick-start: setup, run, deploy, links to /docs | Update when install steps, tech stack, or scripts change |
| `docs/PRD.md` | Master reference: everything except design | Update for any product, architecture, schema, API, or process change |
| `docs/DESIGN.md` | Design system: colors, type, spacing, components | Update when CSS tokens, component specs, or layout changes |
| `docs/PATCHNOTES.md` | Changelog | Add an entry for every change |

### Where Content Lives

- **New product requirement or feature decision** → `docs/PRD.md` Part A (Sections 1-9)
- **Architecture change, new utility function, deploy change** → `docs/PRD.md` Section 10
- **New operational workflow or troubleshooting step** → `docs/PRD.md` Section 11
- **Schema field added or changed** → `docs/PRD.md` Section 12
- **Composer API notes** → `docs/PRD.md` Section 13
- **Roadmap update** → `docs/PRD.md` Section 14
- **Security posture change** → `docs/PRD.md` Section 15
- **Color token or component spec change** → `docs/DESIGN.md`
- **Every change** → `docs/PATCHNOTES.md` (new entry)

### What Not to Do

- Do not create new documentation files for individual topics. Consolidate into the existing 4 files.
- Do not let `README.md` grow beyond the quick-start role. Deep technical content belongs in `docs/PRD.md`.
- Do not skip `docs/PATCHNOTES.md` entries, even for data-only updates.

### Consolidation History

On 2026-06-14, 12 documentation files were consolidated into the current 4-file structure:

| Old File | Content Moved To |
|---|---|
| `docs/TRD.MD` | `docs/PRD.md` Section 10 |
| `docs/RUNBOOK.MD` | `docs/PRD.md` Section 11 |
| `docs/METRICS.MD` | `docs/PRD.md` Section 12 |
| `docs/GLOSSARY-SCHEMA.MD` | `docs/PRD.md` Section 12 |
| `docs/ComposerAPI.MD` | `docs/PRD.md` Section 13 |
| `docs/ROADMAP.MD` | `docs/PRD.md` Section 14 |
| `docs/SECURITY.MD` | `docs/PRD.md` Section 15 |
| `docs/TENETS.MD` | `docs/PRD.md` Section 16 |
| `docs/PRFAQ.MD` | `docs/PRD.md` Section 17 |
| `docs/PRD.MD` | `docs/PRD.md` Part A |
| `docs/DESIGN.MD` | `docs/DESIGN.md` |
| `docs/PATCHNOTES.MD` | `docs/PATCHNOTES.md` |
| `README.MD` (uppercase) | `README.md` (lowercase) |
