# Composer Atlas: Master Reference Document

**Version:** 1.11.1
**Status:** Active
**Last Updated:** 2026-07-07

This is the single authoritative reference for Composer Atlas. It consolidates product requirements, architecture, operational runbook, data schemas, API reference, roadmap, security posture, project tenets, FAQ, and documentation process.

---

## Table of Contents

**Part A; Product Requirements**
1. [Problem Statement](#1-problem-statement)
2. [Target Users](#2-target-users)
3. [Goals](#3-goals)
4. [Non-Goals](#4-non-goals)
5. [User Stories](#5-user-stories)
6. [Feature List](#6-feature-list)
7. [Constraints](#7-constraints)
8. [Assumptions](#8-assumptions)
9. [Success Criteria](#9-success-criteria)

**Part B; Technical & Operational Reference**
10. [Architecture & Technical Reference](#10-architecture--technical-reference)
11. [Operational Runbook](#11-operational-runbook)
12. [Strategy & Glossary Data Schemas](#12-strategy--glossary-data-schemas)
13. [Composer API Reference](#13-composer-api-reference)
14. [Roadmap](#14-roadmap)
15. [Security](#15-security)
16. [Tenets](#16-tenets)
17. [FAQ](#17-faq)
18. [Documentation Process](#18-documentation-process)
19. [Writing Style](#19-writing-style)

---

## Part A: Product Requirements

---

## 1. Problem Statement

Retail investors interested in rules-based, systematic investing lack a central, accessible resource that:

- Aggregates and explains Composer.trade strategies in plain language
- Bridges the gap between raw quant concepts and practical application
- Provides transparent breakdowns of strategy logic, not just backtest returns

There is no dedicated site for Composer.trade strategy discovery and education. Strategy authors share symphonies publicly on Composer, but the platform itself does not provide educational context about how the logic works or what signals are in play.

---

## 2. Target Users

**Primary; Composer.trade users**
Self-directed retail investors who already use Composer.trade. They want to understand strategies before cloning them, or want to see how other authors have approached a problem they are solving.

**Secondary; Systematic investing learners**
Intermediate traders learning RSI, momentum, VIX strategies, and leveraged ETF mechanics. They know what a moving average is but have not yet built a systematic strategy. Composer Atlas explains concepts in the context of real strategies.

**Tertiary; Quant-curious beginners**
Investors curious about algorithmic or rules-based investing who do not yet know the terminology. The glossary serves as their entry point; strategy pages show them real examples.

---

## 3. Goals

- Launch a public-facing site with 25 strategy pages and a concept glossary
- Require zero server infrastructure; run entirely in the browser via GitHub Pages
- Establish a scalable JSON-based strategy database that can grow to thousands of entries
- Educate users on the signals and logic behind each strategy, not just its returns
- Generate passive revenue via Google AdSense (post-MVP) and direct user donations

---

## 4. Non-Goals

- No user accounts or authentication
- No community features or comments
- No newsletter or email capture at launch
- No manual metric update pipeline needed day-to-day: `scripts/update_metrics.py` runs daily via `.github/workflows/update-metrics.yml` and commits automatically; `scripts/update_metrics.py` can still be run manually for an immediate refresh
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

### MVP: Shipped (V1.0–V1.2.1)

**Strategy Library**
- Index page listing all 28 strategies with key metrics at a glance (ARR, Max DD, Sharpe)
- Each strategy has a dedicated page with: name, description, tags, "Open in Composer" CTA, an AI Summary (Claude-authored analysis above How It Works), plain-English logic breakdown, signals used (cross-linked to glossary), risk profile, and full metrics table
- Strategy card titles are clickable links

**Concept Glossary**
- Index page listing all 20 glossary concepts with category badges and strategy-use counts
- Each concept has a dedicated page with: definition, how it works, in practice examples, limitations, formula (when applicable), and a "Building with..." essay section
- Concepts cross-link back to strategies that use them

**Data Layer**
- `data/strategies.json`: flat-file database of all 28 strategies
- `data/glossary.json`: flat-file database of all 20 glossary concepts
- Dual-mode loading: `window.STRATEGIES_DATA` / `window.GLOSSARY_DATA` globals for `file://` compatibility; `fetch()` fallback for HTTP
- `scripts/update_metrics.py`: reusable script to refresh all metrics and logic trees from the Composer API

**Navigation & Structure**
- Fixed top nav: About, Strategies, Database, Glossary, Support (v1.10.2; previously included direct external links to Individual Stocks and Leveraged Strategies, now presented as a "More From Azqato" section on the About page instead)
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

### In Progress: Full Database Initiative (Not Yet Public)

Separate from the 25 curated strategies, `data/database.json` holds the full raw
symphony database (6,488 entries) originally scraped by an external Google Apps Script.
Only ~953 entries have usable backtest metrics; the rest failed on the script's daily
`urlfetch` quota. The goal is to recreate that refresh pipeline on composeratlas.com
itself against the real Composer API, then build a Leaderboard and Screener on top of
the full database. **This work stays off the public deploy until it is fully vetted**:
`database.html` exists in the working tree but is not yet excluded from or included in
any deploy decision; see Section 14 Roadmap for the phased plan.

- [x] `data/database.json` imported from the raw xlsx as the canonical JSON source (v1.9.0)
- [x] `scripts/import_full_database.py`: one-time, re-runnable xlsx → JSON importer (v1.9.0)
- [x] `scripts/refresh_full_database.py`: resumable, checkpointed API refresh script, mirrors `update_metrics.py` conventions (v1.9.0)
- [x] `database.html` template: tabbed page (All Strategies / Leaderboard / Screener); only All Strategies is implemented, the other two render a "Coming Soon" state (v1.9.0)
- [x] Target schema expansion: 17 new fields locked and captured (v1.9.1)
- [x] Filter panel (shared component, All Strategies first) (v1.10.x)
- [x] Screener tab (reuses the filter panel), full multi-view column switcher (v1.10.x)
- [x] Leaderboard tab, 20-metric/1,000-point scoring model (v1.10.x)
- [x] Performance Fix: columnar + float-rounded summary JSON, ~80% size reduction (v1.10.x)
- [ ] Noise filtering (test ports, "Invest Copy" duplicates, WIP builds) before any full-database view is public; Leaderboard/Screener/Filter Panel all ship without it for now, an accepted known gap
- [ ] Full-scale metric refresh (currently only `last_updated`/`script_errors` are refreshed; actual metric fields are not yet repopulated at scale)

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

## Part B: Technical & Operational Reference

---

## 10. Architecture & Technical Reference

### Overview

Composer Atlas is a fully static, browser-only application. There is no server, no API backend, no database service, and no authentication layer. All data is stored in flat JSON files and served via GitHub Pages. All page rendering is done in the browser via vanilla JavaScript, no build step is required.

### Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| HTML | Vanilla `.html` files | No build step; open in browser or serve with any static host |
| CSS | CSS custom properties | Design token system without requiring a preprocessor |
| JavaScript | Vanilla ES2020 | `fetch()` for data, DOM manipulation for rendering |
| Fonts | Google Fonts CDN | No local build needed |
| Hosting | GitHub Pages | Serves static files directly from repository root |
| CI/CD | GitHub Actions | rsync to `_site/`, upload artifact, deploy |
| Scripts | Python 3 (stdlib only) | Data refresh; no pip dependencies. All `.py` files must live in `scripts/` |

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
│   ├── strategies.json         # 28 strategy entries, source of truth
│   ├── strategies.js           # Same data as window.STRATEGIES_DATA, for file:// compat
│   ├── glossary.json           # 8 glossary concept entries, source of truth
│   ├── glossary.js             # Same data as window.GLOSSARY_DATA, for file:// compat
│   ├── symphony_scores.json    # Full logic trees; AI analysis only, not served publicly
│   ├── database.json           # Full raw ~6,500-symphony database (not the curated 25); see Section 14
│   ├── database.js             # Same data as window.DATABASE_DATA, for file:// compat
│   ├── database_summary.json   # Columnar, float-rounded subset of database.json for list/filter/score views (v1.16)
│   ├── database_summary.js     # Same data as window.DATABASE_SUMMARY_DATA, for file:// compat (v1.16)
│   ├── Full Database.xlsx      # Raw source spreadsheet; database.json is generated from this
│   └── storage.csv             # Append-only URL backup, single `url` column, deduped (v1.10.1)
├── js/
│   └── app.js                  # Shared utilities: format, nav, footer, render helpers
├── scripts/                    # All Python scripts live here, never in the project root
│   ├── update_metrics.py       # Fetches backtest metrics + logic trees from Composer API (curated 25)
│   ├── add_glossary.py         # One-time: added 9 glossary entries (v1.5.2), safe to re-run
│   ├── add_zoop.py             # One-time: added Zoop glossary entry + zoop tags (v1.5.3)
│   ├── add_ai_summary.py       # Writes the ai_summary field on all strategies (v1.7.0), safe to re-run
│   ├── import_full_database.py # One-time: xlsx → data/database.json (v1.9.0), safe to re-run
│   ├── refresh_full_database.py # Resumable, checkpointed API refresh for the full database (v1.9.0)
│   ├── export_full_database_to_xlsx.py # Local-only, occasional: regenerates the xlsx from the JSON (v1.9.4)
│   ├── export_summary.py       # Derives database_summary.json/.js from database.json (v1.16); run after every refresh
│   └── sync_storage_to_database.py # Adds storage.csv URLs missing from database.json as new unrefreshed rows (v1.11.1)
├── index.html                  # Home page (hero + strategy grid)
├── strategies.html             # Strategy listing + detail (?slug=X), single file
├── glossary.html               # Glossary listing + concept detail (?slug=X), single file
├── database.html                # Full-database tabs: All Strategies / Leaderboard / Screener (v1.9.0)
├── about.html                   # About page
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

- `data/strategies.json`: source of truth; JSON array of strategy objects
- `data/strategies.js`: assigns `window.STRATEGIES_DATA = [...]`; keeps data accessible on `file://` protocol

Both files must always be kept in sync. When editing `strategies.json`, make the identical change in `strategies.js`.

**glossary.json and glossary.js**

- `data/glossary.json`: source of truth; JSON array of concept objects
- `data/glossary.js`: assigns `window.GLOSSARY_DATA = [...]`

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

**Full database dataset:** `database.html` uses the identical pattern via its own inline `loadFullDatabase()` (not a shared `js/app.js` function, since this dataset is not part of the curated-library data layer). `data/database.js` assigns `window.DATABASE_DATA`; both `scripts/import_full_database.py` and `scripts/refresh_full_database.py` write the `.json` and `.js` twins in sync, same as `update_metrics.py` does for the curated 25. A v1.9.0/v1.9.1 oversight shipped `database.html` with `fetch()`-only loading (no global fallback), which fails with "Failed to fetch" on `file://`; fixed in v1.9.2.

### BASE URL and `u()` Helper

```javascript
// On GitHub Pages (*.github.io) the first path segment is the repo name (e.g. /composer).
// On localhost or a custom domain the site is served at root, so BASE is empty.
const _seg = window.location.pathname.split('/')[1];
const BASE = (window.location.hostname.endsWith('.github.io') && _seg) ? '/' + _seg : '';

// All internal links use u() instead of BASE + path directly
function u(path) {
  if (window.location.protocol !== 'file:') return BASE + path;
  // On file://, all pages are at root depth, strip the leading slash
  // Maps '/' → 'index.html'; '/strategies.html?slug=X' → 'strategies.html?slug=X'
  const [pathPart, qs] = path.split('?');
  const rel = pathPart === '/' ? 'index.html' : pathPart.replace(/^\//, '');
  return rel + (qs ? '?' + qs : '');
}
```

Detects GitHub Pages by hostname (`*.github.io`) rather than matching the repo name, repo-rename-proof and works on any custom domain without changes.

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
| `/composer/database.html` | `database.html` | Tabs: All Strategies (implemented), Leaderboard, Screener (both "Coming Soon") |
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
| Performance charts | Chart.js or uPlot: loaded as a module script |
| Build system upgrade | Migrate to Astro 5.x |
| Analytics | Plausible (privacy-friendly): post-MVP only |

---

## 11. Operational Runbook

### Local Development Setup

**Prerequisites:** Python (any version), Git. No Node.js required.

**Option 1; Python HTTP server:**
```bash
python -m http.server 8000
# Site at http://localhost:8000/
```

**Option 2; Open directly:** Double-click any `.html` file. Site loads fully because `data/strategies.js` and `data/glossary.js` are loaded as script tags before `app.js`.

**Validate JSON before committing:**
```bash
python -c "import json; json.load(open('data/strategies.json')); print('Valid JSON')"
python -c "import json; json.load(open('data/glossary.json')); print('Valid JSON')"
```

---

### Adding a Strategy from a Composer URL (Streamlined: Preferred)

Provide a Composer.trade symphony URL to Claude Code and it automates the entire workflow.

**What you need to provide:**
- A Composer.trade symphony URL (any form: `/symphony/ID`, `/symphony/ID/factsheet`, `/symphony/ID/details`)
- Optional: preferred strategy name and slug (if omitted, Claude Code proposes them and asks for confirmation)

**What Claude Code does automatically:**
1. Extracts the symphony ID from the URL
2. Fetches backtest metrics via `POST /api/v0.1/symphonies/{id}/backtest` (no auth required)
3. Fetches the logic tree via `GET /api/v0.1/symphonies/{id}/score`
4. Analyzes the logic tree to determine: primary trend gate, volatility routing, dip-buy conditions, cross-asset signals, correct canonical tags
5. Drafts all content fields: `description`, `ai_summary`, `how_it_works`, `signals`, `risk_profile`
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

**Step 2: Generate a slug.** Derive from the strategy name: lowercase, spaces → hyphens, remove special characters. Examples: "VIX Tier Rotator" → `vix-tier-rotator`. Do not change a slug after a strategy page is live, it breaks inbound links.

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
  "ai_summary": ["AI analysis paragraph 1 (structure, assets, logic, why follow it).", "AI analysis paragraph 2 (metrics, backtest period, noteworthy characteristics)."],
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

`.github/workflows/update-metrics.yml` runs `scripts/update_metrics.py` automatically every day and commits any changes. The script skips any strategy whose `last_updated` is under `STALE_AFTER_DAYS` (7) old, so most daily runs are a no-op except for retrying anything that failed on a previous run. No manual action is required for routine refreshes.

To force an immediate refresh (e.g. after a symphony logic change), run manually:

```bash
python scripts/update_metrics.py
```

This script:
1. Hits `POST /api/v0.1/symphonies/{id}/backtest` for all strategies not refreshed in the last 7 days → rewrites `data/strategies.json` and `data/strategies.js`
2. Hits `GET /api/v0.1/symphonies/{id}/score` for the same strategies → rewrites `data/symphony_scores.json`

No API key required. After a manual run:

```bash
git add data/strategies.json data/strategies.js data/symphony_scores.json
git commit -m "data: refresh metrics and symphony scores - YYYY-MM-DD"
git push origin main
```

**symphony_scores.json is for AI analysis only**: it is not served to the website. It contains the full EDN logic tree for each symphony, used to explain strategy logic in future conversations.

---

### Updating Metrics (Manual: Single Strategy)

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

Composer Atlas deploys automatically via GitHub Actions on every push to `main`. No manual steps required.

- **Live URL:** https://composeratlas.com (Cloudflare Pages, linked directly to this GitHub repo)
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

**Structural pattern (original 13 zoop 2026 symphonies):** The first 13 strategies all share this structure:
```
[EqualWeight]
  ├── zoop's 2026 Frontrunner (50%)    ← shared base component
  └── [Strategy-specific component] (50%)
```
Strategies added in v1.4.0 and v1.5.0 (11 entries) are standalone symphonies and do not use this shared Frontrunner pattern.

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

### Generating the AI Summary

Every strategy page renders an **AI Summary** in a purple-accented box directly above "How It Works." It is a Claude-authored analysis stored in the `ai_summary` field (an array of paragraph strings) and is distinct from `how_it_works`: where `how_it_works` walks through the mechanics step by step, the AI Summary stands back and *evaluates* the strategy for the reader.

**What each summary must cover.** For every strategy, Claude analyzes and then synthesizes:

1. **Structure**: the overall shape of the logic (e.g. cash-first dip-buyer, three-state trend machine, parallel equal-weight components, shared Frontrunner base).
2. **Assets**: the instruments it trades (3x ETFs, sector ETFs, bonds, volatility products, individual stocks).
3. **Signals & logic**: the indicators and gates that drive decisions (RSI thresholds, 200-day MA regime, MACD, volatility tiers, momentum selection).
4. **Performance metrics**: ARR, max drawdown, Sharpe, Calmar, and standard deviation, read together rather than cherry-picked.
5. **Backtest period**: how many years/trading days, and whether that window is long enough to trust.

From that analysis, each summary then states:

- **Why someone would follow it**: the investor profile and the problem it solves.
- **The purpose behind its logic**: the thesis the rules are expressing.
- **Noteworthy characteristics**: anything a reader should weigh carefully, especially **short backtests** (e.g. < ~5 years is period-dependent), **high drawdowns** (e.g. deeper than ~50%), a **Calmar at or below 1.0** (return no larger than the worst loss), or **overfitting risk** in optimized/RL strategies.

**Tone and tenets.** Summaries follow the *Transparency Over Hype* and *Education Before Promotion* tenets: they are even-handed and explicitly discount spectacular-but-fragile backtests rather than amplifying them. If a strategy looks too good because of a short or favorable test window, say so.

**Format.** Two paragraphs is the standard: paragraph 1 covers structure/assets/logic and why-follow/purpose; paragraph 2 covers metrics/backtest period and noteworthy characteristics. Plain text only, with no HTML or markdown inside the strings. The site-wide footer already carries the "not financial advice" disclaimer, so the AI Summary box does not repeat one.

**How to write or update summaries.**

1. Open `scripts/add_ai_summary.py`. It holds an `AI_SUMMARIES` dict keyed by strategy `slug`, each value a list of paragraph strings.
2. Add or edit the entry for the relevant slug, using the strategy's metrics, `how_it_works`, `signals`, `risk_profile`, and (when deeper logic detail is needed) its tree in `data/symphony_scores.json`.
3. Run the script, it rewrites both data files in sync and inserts `ai_summary` immediately before `how_it_works`:
   ```bash
   python scripts/add_ai_summary.py
   ```
4. Validate and preview:
   ```bash
   python -c "import json; json.load(open('data/strategies.json')); print('Valid JSON')"
   python -m http.server 8000
   # http://localhost:8000/strategies.html?slug=<slug>
   ```
5. Update `docs/PATCHNOTES.md`, then commit `data/strategies.json`, `data/strategies.js`, `scripts/add_ai_summary.py`, and the patch notes.

When adding a brand-new strategy, you may instead author `ai_summary` directly in the JSON entry (as in the manual template above), the script is the bulk/maintenance path, not the only way to set the field.

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

**Local dev, data not loading when opened directly**
- Confirm `data/strategies.js` and `data/glossary.js` are present
- Confirm each HTML page has `<script src="data/strategies.js">` and `<script src="data/glossary.js">` before the `app.js` script tag
- All pages are at root level: all script src paths use `data/` (no `../` prefix needed)

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
| `slug` | string | Yes | URL slug (e.g., `vix-tier-rotator`). Used as `?slug=` param. Must be lowercase, hyphen-separated, unique. Do not change after a page is live: breaks inbound links. |
| `name` | string | Yes | Display name (e.g., "VIX Tier Rotator") |
| `symphony_url` | string | Yes | Full URL to clone on Composer.trade |
| `symphony_id` | string | Yes | Composer symphony ID (alphanumeric segment from URL) |
| `annualized_rate_of_return` | float | Yes | Annualized return as decimal (e.g., `0.312` = 31.2%) |
| `max_drawdown` | float | Yes | Maximum drawdown as decimal: always negative (e.g., `-0.187` = -18.7%) |
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
| `ai_summary` | string[] | Recommended | Claude-authored analysis. Each string becomes a `<p>` inside the AI Summary box, rendered above How It Works. See "Generating the AI Summary" in Section 11. |
| `how_it_works` | string[] | Recommended | Paragraphs explaining strategy logic. Each string becomes a `<p>` tag. |
| `signals` | object[] | Recommended | Signals used. Each: `{ "name": string, "tag": string, "description": string }`. `tag` must match a glossary slug. |
| `risk_profile` | string | Recommended | Risk summary for the strategy detail page. |
| `author_note` | string | Optional | Curator note (plain text, no HTML). Displayed on the detail page when present. |

**Metric calculation notes:**
- `calmar_ratio` = `annualized_rate_of_return` / abs(`max_drawdown`)
- `sharpe_ratio`: pull directly from Composer's displayed value; Composer uses its own internal risk-free rate baseline
- `max_drawdown`: the Composer API returns this as a positive number; the script stores it negative. Always store negative.
- `backtest_days`: the API field is `size`; the script maps it to `backtest_days`
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

### Full Database JSON Schema

All fields in `data/database.json`. This is a separate, lighter schema from
`strategies.json`: it holds the raw ~6,500-entry database (see Section 14 Roadmap),
not the 25 curated strategies. `data/database.js` is its `.js` twin (assigns
`window.DATABASE_DATA`, same file:// compat pattern as `strategies.js`/`glossary.js`).

| Field | Type | Description |
|---|---|---|
| `name` | string \| null | Symphony name as scraped; may be null on entries that never finished scraping |
| `symphony_url` | string | Full URL to the symphony on Composer.trade; always present, the true unique key |
| `symphony_id` | string \| null | Extracted from `symphony_url`; used to call the Composer API |
| `annualized_rate_of_return` through `trailing_one_year_return` | float \| null | Same meaning and sign conventions as the matching fields in `strategies.json` Section 12; `null` when the entry has no usable metrics yet |
| `backtest_days` | integer \| null | Backtest length in trading days (API field `size`) |
| `last_updated` | string \| null | ISO date this entry's metrics were last refreshed |
| `script_errors` | string \| null | Error message from the most recent failed refresh attempt (either the original Apps Script scrape or `scripts/refresh_full_database.py`); `null` when the last attempt succeeded |

**Extended fields (added v1.9.1, target schema expansion):** every entry has these keys; `null` until the entry has been through `scripts/refresh_full_database.py` under the new schema (full overwrite policy, see Section 11-adjacent script docstring).

| Field | Type | Description |
|---|---|---|
| `sortino_ratio` | float \| null | Downside-only risk-adjusted return |
| `win_rate` | float \| null | Fraction of winning periods |
| `skewness`, `kurtosis` | float \| null | Return distribution shape |
| `tail_ratio` | float \| null | Ratio of right-tail to left-tail extremes |
| `top_one_day_contribution`, `top_five_percent_day_contribution`, `top_ten_percent_day_contribution` | float \| null | How concentrated returns are in a handful of days |
| `herfindahl_index` | float \| null | Portfolio concentration score |
| `annualized_turnover` | float \| null | Trading frequency |
| `trailing_one_day_return`, `trailing_one_week_return`, `trailing_two_week_return` | float \| null | Finer-grained trailing windows, in addition to the existing 1mo/3mo/1yr |
| `last_market_days_holdings` | object \| null | Current live allocation, ticker symbol → dollar amount (e.g. `{"TQQQ": 7537.17, "$USD": 0.36}`). This is where real ticker symbols live, not `active_asset_nodes` |
| `active_asset_nodes` | object \| null | Internal node UUID → weight (e.g. `{"875f367e-...": 1.0}`). **Not a ticker list**; corrected after live validation in v1.9.1, do not use for a ticker/holding filter |
| `total_costs` | float \| null | Sum of the API's `costs` object (`reg_fee` + `taf_fee` + `cat_fee` + `slippage` + `spread_markup` + `subscription`); the per-category breakdown is not separately stored |
| `data_warnings` | object \| null | Composer's own flag that a backtest's underlying data may be shaky; `null` when Composer reports none |

**Known data quality issues (as of v1.9.0):**
- Only ~953 of 6,488 entries have usable metrics; the rest have `script_errors` set and all metric fields `null`
- The dataset includes non-strategy noise: test ports (e.g. names prefixed `TESTPORT #`), "Invest Copy" duplicates, "Copy of Copy of..." chains, and WIP builds; none of this is filtered yet (see Section 14 Roadmap, Noise Filtering)
- `name` collisions are common (the same strategy cloned/modified many times under a near-identical name); `symphony_url` is the only guaranteed-unique key, not `name`

---

### Database Summary JSON Schema

`data/database_summary.json` (added v1.16, Performance Fix): a derived, lighter subset of `database.json` used by every list/filter/score view (All Strategies, Filter Panel, Screener, Leaderboard). Not hand-edited, regenerated by `scripts/export_summary.py` after every `refresh_full_database.py` run.

**Shape is columnar, not one object per entry:**
```json
{ "fields": ["name", "symphony_url", ...], "rows": [["zoop's 2026 Frontrunner", "https://...", ...], ...] }
```
Field names are stored once in the `fields` array; each entry is a positional value array in `rows`, not a `{key: value}` object. This is the single biggest driver of the size reduction (repeating ~29 field names as object keys across 6,488 entries was most of the old file's weight, not any field's actual data). Reconstruct plain row objects client-side before use (see `rowsFromColumnar()` in `database.html`).

**Field list:** every `database.json` field except `cumulative_return`, `mean`, `min`, `max`, `active_asset_nodes`, `total_costs`, `annualized_turnover`, `herfindahl_index` (dropped, see V1.16/V1.13 for why each is unused). All floats rounded to 4 decimal places (percentages/ratios never need more precision than that in any UI).

There is no `.js` twin naming inconsistency to worry about here, `data/database_summary.js` follows the same convention as every other twin file, assigning `window.DATABASE_SUMMARY_DATA` to the identical columnar payload.

---

### Storage CSV Schema

`data/storage.csv` (added v1.10.1): a single-column, append-only backup of every Composer symphony URL ever shared, referenced, or added to the site or the full database, independent of whether it was ever successfully backtested. Its purpose is durability, not analysis: `database.json` can be rebuilt, re-scoped, or have entries dropped (e.g. during Noise Filtering), but `storage.csv` is meant to never lose a URL once it's been seen.

| Field | Type | Description |
|---|---|---|
| `url` | string | Full Composer.trade symphony URL. The only column, and the primary key: one row per unique URL, never duplicated |

**Maintenance:** manually append new URLs as they come up in conversation or get added anywhere on the site; deduplicate against the existing file before adding (`url` is the primary key, exactly one row per symphony regardless of how many times it's been discussed or how many other files reference it). Seeded on creation (v1.10.1) from the union of every `symphony_url` in `data/database.json` and `data/strategies.json`, 6,489 unique URLs at seed time.

**Promoting storage.csv URLs into the database:** `scripts/sync_storage_to_database.py` (v1.11.1) adds any `storage.csv` URL not yet in `database.json` as a new, unrefreshed entry (every field null except `symphony_url`/`symphony_id`), so it gets picked up by the next `refresh_full_database.py` run like any other due row. Run this whenever `storage.csv` has grown since the last sync; it's safe to re-run (already-present URLs are skipped).

---

### Metric Display Guidelines

**Formatting:**
- Float percentages: display as `+XX.X%` or `-XX.X%` (multiply by 100, 1 decimal place; always include sign)
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
  "slug": "string",          // URL slug, must match tag values in strategies.json
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

**Canonical glossary entries (current; 20 total):**

| Slug | Name | Category |
|---|---|---|
| `rsi` | RSI | indicator |
| `200d-ma` | 200-Day Moving Average | indicator |
| `sma` | Simple Moving Average | indicator |
| `ema` | Exponential Moving Average | indicator |
| `macd` | MACD | indicator |
| `momentum` | Momentum Investing | strategy-concept |
| `vix-tiers` | VIX Tiers | strategy-concept |
| `mean-reversion` | Mean Reversion | strategy-concept |
| `volatility-decay` | Volatility Decay | strategy-concept |
| `zoop` | Zoop's Strategies | strategy-concept |
| `original` | Original Strategies | strategy-concept |
| `backtesting` | Backtesting | strategy-concept |
| `leveraged-etfs` | Leveraged ETFs | asset-class |
| `managed-futures` | Managed Futures | asset-class |
| `inverse-etfs` | Inverse ETFs | asset-class |
| `sharpe-ratio` | Sharpe Ratio | risk-metric |
| `calmar-ratio` | Calmar Ratio | risk-metric |
| `max-drawdown` | Max Drawdown | risk-metric |
| `standard-deviation` | Standard Deviation | risk-metric |
| `annualized-return` | Annualized Rate of Return | risk-metric |

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

Composer Atlas uses only the two unauthenticated endpoints listed below. No credentials are stored or required.

### Rate Limits

| Endpoint | Documented Limit |
|---|---|
| All endpoints (default) | 1 req/sec |
| `POST /symphonies/{id}/backtest` | 500 req/sec |

**Empirically observed (v1.9.4-v1.9.5):** the documented 500 req/sec ceiling does not hold in practice. Four one-time tests against `/backtest`, at four different rates:

| Test | Result |
|---|---|
| Sequential, 1 call per 2 seconds (0.5 req/sec), the original throttle | 140 consecutive calls, **zero** failures |
| Sequential, 1 call per second (1 req/sec) | 25 succeeded, then `HTTP 429: Too Many Requests` |
| ~2 concurrent req/sec | 25 succeeded, then 429s |
| ~20 concurrent req/sec | 25 succeeded, then 429s |
| ~100 concurrent req/sec | 25 succeeded, then 429s |

**Conclusion: this behaves like a token-bucket limiter, not a flat requests-per-second cap.** Burst capacity is ~25 requests, refilling at roughly the rate already proven safe (~0.5 req/sec, i.e. 1 call per 2 seconds). At 0.5 req/sec, consumption matches the refill rate, so the bucket never empties and the run sustains indefinitely (140/140, zero failures). At every faster rate tested, from 1 req/sec all the way to 100 concurrent req/sec, the initial ~25-request bucket drains and then every subsequent call gets throttled until it refills, regardless of how much faster than 25/window the attempted rate was. Whatever is enforcing it is likely a Cloudflare layer in front of the documented API limit, not the API's own application-layer limit. Failed calls do not corrupt data: `apply_backtest_result()` is never called on failure, and `last_updated` is only advanced on success, so a 429'd row just stays correctly marked "due" for the next run.

**Practical takeaway:** stick to the existing 1-call-per-2-seconds sequential throttle for any bulk refresh. There is no known safe way to go faster without triggering the bucket; do not re-test higher rates without a specific reason, each test costs ~25 wasted/retried calls plus whatever cooldown the bucket needs to refill.

The sequential, 1-call-per-2-seconds throttle already used by `update_metrics.py` and `refresh_full_database.py` is the validated, sustainable approach; it processed 140 consecutive rows with zero failures before being intentionally paused. Do not attempt higher concurrency against this endpoint without re-testing carefully at small scale first.

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
| `min`, `mean`, `median`, `max` | float | Monthly distribution: maps 1:1 |
| `trailing_one_month_return`, etc. | float | Maps 1:1 |
| `max_drawdown` | float | **Returned as positive by API; stored as negative in schema** |
| `size` | integer | Backtest days; stored as `backtest_days` in schema |

Full response also includes `dvm_capital`, `tdvm_weights`, `rebalance_days`, `last_market_days_holdings`, `costs`, `legend`, `data_warnings`, `benchmark_errors`.

**Available `stats` fields not yet captured by any schema** (confirmed live against 5 real symphonies on 2026-07-07; candidates for the Leaderboard/Screener target schema, see Section 14 Roadmap):

| Field | Notes |
|---|---|
| `sortino_ratio` | Downside-only risk-adjusted return; strong leaderboard/screener candidate |
| `win_rate` | Fraction of winning periods |
| `skewness`, `kurtosis` | Return distribution shape; tail-risk indicators |
| `tail_ratio` | Ratio of right-tail to left-tail extremes |
| `top_one_day_contribution`, `top_five_percent_day_contribution`, `top_ten_percent_day_contribution` | How concentrated returns are in a handful of days |
| `herfindahl_index` | Portfolio concentration score |
| `annualized_turnover` | Trading frequency; proxy for fee/tax drag not otherwise modeled |
| `trailing_one_day_return`, `trailing_one_week_return`, `trailing_two_week_return` | Finer-grained trailing windows than the three currently stored |

**Available top-level fields not yet captured by any schema:**

| Field | Notes |
|---|---|
| `last_market_days_holdings` | Current live allocation (ticker → $ amount); screener candidate ("currently holding TQQQ") |
| `active_asset_nodes` | **Not a ticker list** (corrected in v1.9.1 after live validation): a dict of internal node UUID → weight. Real ticker symbols live in `last_market_days_holdings` instead. |
| `costs` (`reg_fee`, `taf_fee`, `cat_fee`, `slippage`, `spread_markup`) | Real cost drag beyond the net return figure |
| `data_warnings` | Composer's own flag that a backtest's underlying data may be shaky |
| `dvm_capital`, `rebalance_days` | Full daily capital time series; heavy, more suited to a future performance chart than a leaderboard row |

### Logic Tree Endpoint

`GET /api/v0.1/symphonies/{symphony-id}/score`

| Param | In | Required | Notes |
|---|---|---|---|
| `symphony-id` | path | yes | |
| `score_version` | query | yes | `"v1"` or `"v2"`: use `"v1"` |

Returns the symphony's full IF/ELSE logic tree as a nested JSON object. The `step` field on each node indicates its type: `"root"`, `"if"`, `"asset"`, `"group"`, `"filter"`, etc. The `children` array contains nested nodes.

Used by `update_metrics.py` to refresh `data/symphony_scores.json`.

### Symphony ID Reference

All 24 Composer Atlas strategies with their Composer symphony IDs:

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
| SOXX Group | `7PBSP926Mp40r6bPnP0j` |
| SOXL Growth v2.4.5 RL | `CW8oWU12S6vEvn2Hh7jD` |
| Inside Nancy Pelosi's Chips - V3 | `HgK8mCeBnH4fQFNcfZ7q` |
| Top Cap by MA + RSI ETF Hedge | `wadbe3IfwvSES5vk6yiu` |
| Mean Reversion Comparison to Python Code | `KJqNBGxYyyKuCcEfdHhq` |
| SPY, Energy, Chips, Commodities | `rtyBIBOKEY2cPSbJSQX8` |
| Simon's KMLM Switcher | `u5iBJE751BM5FKPRJvKf` |
| 10d BND vs. 10d SPHB (Original) | `0HCtnEKGw1PRt8Om77a3` |
| Dip Buying Tech | `98cACZSS00eDg8Kv5BBV` |
| Ob Os Staple my Bonds (Original) | `OmMmeWyyAu0IRN2yOP6k` |

Use these IDs with `/backtest`, `/score`, `/versions`, and portfolio endpoints.

---

## 14. Roadmap

### V1.0: MVP

**Launched:** 2026-06-08 | **Status:** Complete
**Live URL:** https://azqato.github.io/composer/

- [x] Vanilla HTML/CSS/JS scaffolded (zero build dependencies)
- [x] GitHub Pages deployment configured (rsync workflow; docs/scripts excluded)
- [x] `data/strategies.json` with 13 strategies
- [x] Strategy index page (all 13 with key metrics)
- [x] 13 strategy detail pages (logic breakdown, metrics table, Composer CTA)
- [x] Concept glossary index and 8 detail pages
- [x] Cross-linking: strategies and glossary
- [x] Top navigation: Strategies, Glossary, About, Individual Stocks, Leveraged Strategies, Support
- [x] About page, Support link, Custom 404 page
- [x] Dark mode design system
- [x] Mobile-responsive layout

### V1.1: Polish + Content Quality

**Status:** Complete (at v1.1.5)

- [x] All 12 strategy pages rewritten from logic tree analysis (v1.1.0); 13th added (v1.1.7)
- [x] `scripts/update_metrics.py` live (v1.0.8)
- [x] Fix: navigation broken on `file://` protocol: `u()` helper added (v1.0.4)
- [x] Fix: all links broken on GitHub Pages: case-insensitive BASE detection (v1.1.2)
- [x] Footer simplified to match azqato.github.io (v1.1.3)
- [ ] Google AdSense integration (pending approval)
- [ ] Performance audit and Lighthouse optimization

### V1.2: Data Tooling + Structure Refactor

**Status:** Mostly Complete (at v1.2.1)

- [x] `scripts/update_metrics.py` pulls from Composer API (backtest + score), no auth required
- [x] Streamlined URL-based strategy addition workflow documented in Runbook (v1.8)
- [x] Folder structure consolidated: flat root `.html` files; `strategies/` and `glossary/` subdirs eliminated (v1.2.0)
- [x] URL patterns: `?slug=X` replaces `/detail/?slug=X` (v1.2.0)
- [x] `u()` helper simplified: depth-agnostic (v1.2.0)
- [ ] Validation: script checks required fields before writing

### V1.3: Documentation Consolidation

**Status:** Complete (at v1.3.0)

- [x] 12 scattered documentation files consolidated into 4 canonical docs: `README.md`, `docs/PRD.md`, `docs/DESIGN.md`, `docs/PATCHNOTES.md`
- [x] All operational, technical, API, schema, roadmap, security, and tenet content moved into `docs/PRD.md`
- [x] File naming standardized from `.MD` to `.md`

### V1.4: Strategy Library Expansion + Infra

**Status:** Complete (at v1.4.2)

- [x] 5 new strategies added: Holy Grail (Original), TQQQ For The Long Term, Wooden ARKK Machine 2.2, Super Semiconductors, The Four Horsemen of the Apocalypse: library grows to 18 (v1.4.0)
- [x] GitHub repository renamed from `Azqato/ComposerAtlas` to `Azqato/composer`; GitHub Pages URL updated (v1.4.1)
- [x] BASE URL detection made repo-rename-proof: hostname-based (`*.github.io`) instead of hardcoded string match (v1.4.2)

### V1.5: Strategy Library Expansion + Glossary Expansion

**Status:** Complete (at v1.5.9)

- [x] 6 new strategies added: SOXX Group, SOXL Growth v2.4.5 RL, Inside Nancy Pelosi's Chips V3, Top Cap by MA + RSI ETF Hedge, Mean Reversion Comparison to Python Code, SPY Energy Chips Commodities: library grows to 24 (v1.5.0)
- [x] 9 new glossary concepts added: SMA, EMA, MACD, Mean Reversion, Volatility Decay, Standard Deviation, Annualized Return, Managed Futures, Inverse ETFs: glossary grows to 17 (v1.5.2)
- [x] Zoop's Strategies glossary entry added with overview of all 11 zoops-* symphonies and headline metrics (v1.5.3)
- [x] Backtesting glossary entry added covering general backtest mechanics and Composer-specific behavior: glossary grows to 19 (v1.5.6)

### V1.6: Strategy Library Expansion

**Status:** Complete (at v1.6.0)

- [x] Simon's KMLM Switcher added: library grows to 25 (v1.6.0)

### V1.7: AI Summaries

**Status:** Complete (at v1.7.0)

- [x] `ai_summary` field added to all 25 strategies; Claude-authored analysis box renders above How It Works on every strategy page (v1.7.0)
- [x] `scripts/add_ai_summary.py` added; "Generating the AI Summary" runbook and schema field documented (v1.7.0)
- [x] Homepage: "Longest Backtest" fifth stat added to stats bar; strategy grid sorted by backtest length (longest first) (v1.7.1)

### V1.9: Full Database Foundation

**Status:** Complete (at v1.9.0)

- [x] Investigated `data/Full Database.xlsx` (6,488 rows from a prior Google Apps Script scrape); found only 953 rows have usable metrics, the rest failed on the script's daily `urlfetch` quota (v1.9.0)
- [x] Confirmed live against 5 real symphonies that Composer's actual API (not scraping) returns far more data than currently captured: `sortino_ratio`, `win_rate`, `skewness`, `kurtosis`, `tail_ratio`, concentration metrics, live holdings, cost breakdown; documented in Section 13 (v1.9.0)
- [x] `data/database.json` created as the canonical JSON source, imported from the xlsx via `scripts/import_full_database.py` (v1.9.0)
- [x] `scripts/refresh_full_database.py` built: resumable, checkpointed (every 10 rows), captures the API's actual error text into `script_errors` on failure (v1.9.0)
- [x] Validated the refresh script against 105 rows live (5 + 100), 0 failures (v1.9.0)
- [x] `database.html` template shipped: tabbed page (All Strategies / Leaderboard / Screener); All Strategies renders a paginated table against the full dataset, the other two tabs render a "Coming Soon" state (v1.9.0)
- [x] `.db-tabs` / `.db-table` component patterns documented in `docs/DESIGN.md` (v1.4 design doc revision) (v1.9.0)
- [x] Nav/footer updated with a "Database" link (v1.9.0)
- **Not yet pushed to GitHub**: this entire initiative stays local until V1.16 below is complete

### V1.9.1: Target Schema Expansion

**Status:** Complete (at v1.9.1)

- [x] Decided the full field set via 7 clarifying questions: all newly-discovered stats fields (sortino_ratio, win_rate, skewness, kurtosis, tail_ratio, concentration metrics, annualized_turnover, finer trailing windows), both holdings fields, costs summed into `total_costs`, and `data_warnings` (v1.9.1)
- [x] Decided schema shape (flat, top-level, matching `strategies.json` convention), null-handling (explicit null, never omit a key), and refresh policy (full overwrite every successful call) (v1.9.1)
- [x] `refresh_full_database.py` updated to capture the expanded field set (v1.9.1)
- [x] `import_full_database.py` updated so a fresh xlsx import also initializes the extended fields to null (v1.9.1)
- [x] All 6,488 existing entries in `database.json` migrated in place to carry the new keys (null where not yet refreshed), without disturbing the 105 rows already refreshed under the old schema (v1.9.1)
- [x] Validated live against 5 real symphonies; discovered and corrected a documentation error: `active_asset_nodes` is not a ticker list (it's node UUID → weight), real ticker holdings are in `last_market_days_holdings` (v1.9.1)
- [x] Full Database JSON Schema (Section 12) and API Reference (Section 13) updated to match

### V1.9.2: file:// Loading Fix

**Status:** Complete (at v1.9.2)

- [x] Bug: `database.html` shipped in v1.9.0 with `fetch()`-only data loading, no `window.*_DATA` global fallback like every other page uses; failed with "Failed to fetch" when opened via `file://` (double-click) instead of a server (v1.9.2)
- [x] `data/database.js` added (assigns `window.DATABASE_DATA`), matching the `strategies.js`/`glossary.js` convention (v1.9.2)
- [x] `scripts/import_full_database.py` and `scripts/refresh_full_database.py` updated to write the `.json`/`.js` twins in sync, matching `update_metrics.py` (v1.9.2)
- [x] `database.html`'s inline `loadFullDatabase()` now checks `window.DATABASE_DATA` first, `fetch()` fallback (v1.9.2)
- [x] Verified via local HTTP server smoke test; `.js` twin syntax validated (v1.9.2)

### V1.9.3: All Strategies Table Redesign

**Status:** Complete (at v1.9.3)

- [x] Reformatted the All Strategies table to match a reference community strategy-search tool's density and layout (toolbar header with result-count pill, sortable columns with click-to-toggle asc/desc arrows, sticky first column, icon-style first/prev/next/last pagination), while keeping the site's existing dark palette, `Inter`/`JetBrains Mono` typography, and color-coding conventions intact (v1.9.3)
- [x] Finalized the public-facing column set via clarifying questions: Symphony, ARR, 1-Year Trailing Return, Max Drawdown, Sharpe, Calmar, Sortino, Win Rate, Backtest Length, Last Updated, and a Data Warnings indicator; explicitly excluded Cumulative Return, Volatility, skewness/kurtosis/tail ratio, turnover, and total costs from the public table for now (v1.9.3)
- [x] Client-side sort implemented on the full dataset (not just the visible page), nulls always sort last (v1.9.3)
- [x] Symphony column widened to a fixed 420px with ellipsis truncation and a hover tooltip (`title` attribute) for the full name, after two rounds of "wider please" turned up names too long to reasonably fit unwrapped (v1.9.3)
- [x] Security fix found while widening the column: `name` is community-sourced from many different authors (unlike the curated 25 strategies), so inserting it into `innerHTML` and an HTML `title` attribute without escaping was an XSS risk; added `escapeHtml()` and applied it, plus `encodeURI()` on `symphony_url` (v1.9.3)
- [x] Intro copy corrected: no longer claims the database is "every symphony pulled from Composer.trade"; now accurately describes it as a community-sourced database gathered from many locations (v1.9.3)

### V1.9.4: xlsx Export Tool + Table Width Fix

**Status:** Complete (at v1.9.4)

- [x] `scripts/export_full_database_to_xlsx.py` added: local-only, occasional-use script that regenerates `data/Full Database.xlsx` from `data/database.json` (the reverse direction of `import_full_database.py`), so the spreadsheet can still be reviewed offline even though it's no longer part of the live pipeline. Nested fields (`last_market_days_holdings`, `active_asset_nodes`, `data_warnings`) are serialized to a JSON string per cell (v1.9.4)
- [x] Confirmed `Full Database.xlsx` is otherwise frozen: nothing in the pipeline writes back to it since v1.9.0, `database.json`/`.js` are the sole canonical source (v1.9.4)
- [x] Kicked off a full-scale `--force` background refresh of all 6,488 entries under the new v1.9.1 schema (a `--force` flag was added to `refresh_full_database.py` so already-touched rows aren't skipped by the 7-day staleness check and get backfilled with the new fields too); this is V1.12's work started early since it's a long-running, throttled background job with no reason to wait (v1.9.4)
- [x] Fixed: the All Strategies table was clipped by `.container`'s 1280px max-width, cutting off the rightmost columns. Added a `.db-table-bleed` wrapper (92vw, capped at 1600px, centered) that only activates above a 1300px viewport so the table gets natural side padding instead of running edge-to-edge; below that width it stays in the normal container and scrolls horizontally as before (v1.9.4)

### V1.9.5: API Rate-Limit Testing

**Status:** Complete (at v1.9.5)

- [x] The `--force` background refresh from v1.9.4 was paused at 140/6,488 rows (clean, zero failures) to test whether a faster approach was viable before committing hours of wall-clock time to the sequential throttle (v1.9.5)
- [x] Four one-time tests run against `/backtest` at four different rates (~100 concurrent req/sec, ~20 concurrent req/sec, ~2 concurrent req/sec, and fully sequential 1 req/sec): all four topped out at exactly 25 successful calls before `HTTP 429: Too Many Requests` started, regardless of rate. Combined with the original 0.5 req/sec throttle's 140/140 clean run, this points to a token-bucket limiter (burst capacity ~25, refill rate ~0.5 req/sec) rather than a flat requests-per-second cap. Findings documented in Section 13 (v1.9.5)
- [x] Added an early-bail safeguard to the concurrency and sequential tests (stop after 3 consecutive all-fail batches/calls) so a confirmed rate-limit doesn't get burned through pointlessly (v1.9.5)
- [x] Confirmed no data corruption from the failed calls: `script_errors` is set but `last_updated` is untouched on failure, so every rate-limited row remains correctly queued as "due" for the next run (v1.9.5)
- [x] Conclusion: the sequential 1-call-per-2-seconds throttle already built into `refresh_full_database.py` is the only rate confirmed safe for a sustained run; no further rate testing planned. 240 rows now carry the full v1.9.1 schema (140 sequential + 25 x 4 test runs). Resuming the full sequential run is a normal next step whenever wanted, not blocked on anything new (v1.9.5)

### V1.10: Strategy Library Expansion

**Status:** Complete (at v1.10.0)

- [x] 10d BND vs. 10d SPHB (Original) added: contrarian SOXL/SHV switcher using BND vs. SPHB relative RSI(10), with UVXY and SOXX RSI guards (v1.10.0)
- [x] Dip Buying Tech added: three-branch SPY 200d MA baseline with QQQ RSI(10) < 30 XLK dip-buy; backtested from April 1999 (v1.10.0)
- [x] Ob Os Staple my Bonds (Original) added: V0.0 defensive baseline using QQQ oversold dip-buy and lower-RSI rotation between XLP/VBF; backtested from 1999 (v1.10.0)
- [x] Library grows to 28 strategies (v1.10.0)

### V1.10.1: Database Rename + Storage Backup

**Status:** Complete (at v1.10.1)

- [x] `data/full_database.json`/`.js` renamed to `data/database.json`/`.js`; `window.FULL_DATABASE_DATA` renamed to `window.DATABASE_DATA` for consistency with the `STRATEGIES_DATA`/`GLOSSARY_DATA` naming convention. All references updated across `database.html`, `scripts/import_full_database.py`, `scripts/refresh_full_database.py`, `scripts/export_full_database_to_xlsx.py`, and this document. Script filenames themselves were intentionally left unrenamed (only the data files), and historical `docs/PATCHNOTES.md` entries describing past work under the old filename were left as an accurate record rather than rewritten (v1.10.1)
- [x] Resumed the full-scale forward refresh (paused since v1.9.5) against the renamed `database.json`, 6,127 rows due (v1.10.1)
- [x] `data/storage.csv` added: single-column (`url`), append-only, deduplicated backup of every symphony URL ever shared or referenced, independent of `database.json`'s scope so it survives future noise-filtering drops or rebuilds. Seeded with 6,489 unique URLs from the union of `database.json` and `strategies.json`. Documented in Section 12 (v1.10.1)
- [x] Fixed a stale doc: Metric Display Guidelines (Section 12) still said percentages render to 2 decimal places; corrected to 1, matching the `formatPct()` change made earlier but never reflected in the docs (v1.10.1)

### V1.10.2: Nav Restructure

**Status:** Complete (at v1.10.2)

- [x] Top nav reordered to About, Strategies, Database, Glossary, Support (was Strategies, Glossary, Database, About, Individual Stocks, Leveraged Strategies, Support) (v1.10.2)
- [x] Removed the direct external nav links to Individual Stocks and Leveraged Strategies (originally added in v1.5.7); the sites themselves aren't gone, just moved out of primary nav (v1.10.2)
- [x] Added a "More From Azqato" section to `about.html`: a short description of each sibling site and its relevance to Composer Atlas, plus a CTA button linking to each (v1.10.2)
- [x] Footer nav links reordered to match (v1.10.2)

### V1.11: Filter Panel (Shared Component)

**Status:** Complete (built ahead of its roadmap slot, per explicit user request, alongside V1.12-V1.13)

**Decisions locked before implementation:** ships on **All Strategies** first, placed above the result-count line; holdings filter included at launch (accepting a heavier data payload, addressed by V1.16 instead of scoping the filter down); reuses click-to-sort column headers rather than a separate Order-by dropdown.

**Design reference (community "Symphony Search Tool"):** searchable field-picker + operator + value per row, "Add filter" to stack rows (AND logic), Cancel/Apply, empty state until a filter exists.

- [x] `createFilterController(opts)` in `database.html`: a reusable factory (not a separate loaded file, both consuming tabs live in the same HTML page, so a JS module boundary wasn't necessary, shared functions were enough), each tab instantiates its own controller with independent applied/pending filter state
- [x] `FILTER_FIELDS`: 20 filterable fields (all core return/risk/ratio metrics, `backtest_days`, derived `oos_days`, plus a `holding` type for ticker matching against `last_market_days_holdings`) and `NUMBER_OPS` (`=`, `>`, `<`, `>=`, `<=`, `between`, the last accepting a `"min, max"` value)
- [x] `matchesFilter()` / `matchesAllFilters()`: the actual filter engine, client-side, no backend
- [x] Wired into All Strategies (`allFilterController`) and Screener (`screenerFilterController`); Leaderboard also got its own instance (`leaderboardFilterController`) for consistency, though not originally scoped as a V1.11 requirement
- [x] `.filter-panel`, `.filter-row`, `.filter-empty` CSS added to `css/main.css`, documented in `docs/DESIGN.md`

### V1.12: Screener Tab

**Status:** Complete (full multi-view switcher built now, per explicit user decision, not deferred to a later pass)

**Design reference (Finviz):** Order-by control skipped per decision (reuses click-to-sort headers instead); the secondary column-view tab row was built in full now.

- [x] Reuses the V1.11 Filter Panel component (`screenerFilterController`) as-is
- [x] `SCREENER_VIEWS`: three switchable column sets, Overview (ARR/1Y/Max DD/Sharpe/Calmar/Backtest), Risk-Adjusted (Sharpe/Calmar/Sortino/Win Rate/Max DD/Std Dev), Distribution (Median/Skewness/Kurtosis/Tail Ratio/three Concentration columns), each reusing the same `.db-table` rendering pattern with a different `columns` array
- [x] View-switch tabs render as `.db-tab` buttons nested inside the Screener panel (visually distinct row from the top-level All Strategies/Leaderboard/Screener/Metrics tabs)
- [x] Own sort state and pagination, independent of All Strategies' (switching views resets sort, since different views expose different sortable columns)
- [ ] CSV export of the filtered result set (still just a "reasonable future equivalent" per the Finviz reference, not built)

### V1.13: Leaderboard Tab

**Status:** Complete (built ahead of its roadmap slot, per explicit user request, alongside V1.11-V1.12)

**Sequencing conflict, resolved as an accepted known gap:** the scoring model excludes noise-flagged entries from the ranking pool, but Noise Filtering (V1.14) ships *after* Leaderboard, so the `is_noise` flag won't exist yet at launch. Confirmed live in the preview below, TESTPORT/Invest-Copy/duplicate-name entries do show up in the early top ranks. **Decision: accepted as-is for now**, Leaderboard ships without noise-exclusion and gains it once V1.14 lands; order does not swap.

**Design reference (user-specified):** relative-percentile methodology adapted from the sibling Individual Stocks site's screener (`azqato.com/stocks/screener.html`, source: `github.com/Azqato/stocks` `screener.js` + `docs/PRD.md`). Core mechanics: rank every metric by percentile among eligible entries (not raw value), apply a clamp curve so only the top ~22% of a metric earns full marks (keeps a perfect score rare), missing data scores a hard zero against a fixed denominator, and tiers are assigned by rank (not absolute score) with ties rounding up into the better tier.

**Locked scoring model: 20 metrics, 1,000 points total, across 7 categories.**

| Category | Metric | Direction | Points |
|---|---|---|---|
| **A. Return** | `annualized_rate_of_return` | higher better | 100 |
| | `median` | higher better | 100 |
| **B. Trailing Returns** | `trailing_one_year_return` | higher better | 50 |
| | `trailing_three_month_return` | higher better | 25 |
| | `trailing_one_month_return` | higher better | 15 |
| | `trailing_two_week_return` | higher better | 10 |
| **C. Risk-Adjusted** | `sharpe_ratio` | higher better | 50 |
| | `calmar_ratio` | higher better | 50 |
| | `sortino_ratio` | higher better | 50 |
| | `win_rate` | higher better | 50 |
| **D. Downside Risk** | `max_drawdown` | higher (less-negative) better | 100 |
| | `standard_deviation` | lower better, inverted | 100 |
| **E. Asymmetry / Shape** | `skewness` | higher better | 40 |
| | `tail_ratio` | higher better | 30 |
| | `kurtosis` | lower better, inverted | 30 |
| **F. Concentration / Fragility** | `top_one_day_contribution` | lower better, inverted | 50 |
| | `top_five_percent_day_contribution` | lower better, inverted | 25 |
| | `top_ten_percent_day_contribution` | lower better, inverted | 25 |
| **G. Longevity** | `backtest_days` | higher better | 75 |
| | OOS days (derived from `last_semantic_update_at`) | higher better | 25 |

Category totals: A 200 / B 100 / C 200 / D 200 / E 100 / F 100 / G 100 = **1,000**. Three "major" categories (Return, Risk-Adjusted, Downside Risk) at 200 each; four "supporting" categories at 100 each.

**Explicitly excluded from scoring, with reasons:**
- `cumulative_return`: redundant with ARR compounded over `backtest_days`; would double-reward long-running strategies who'd already score well on Longevity
- `mean`: near-duplicate of ARR (same "how much does it make on average" concept, different units)
- `max` (best single period): ambiguous alone, conceptually overlaps with the Concentration category anyway
- `herfindahl_index`: no clear better/worse direction for this domain, many of these strategies deliberately concentrate into 1-2 leveraged ETFs by design; kept as a potential future display-only context column, not scored
- `total_costs`, `annualized_turnover`: removed per explicit decision, not scored
- `min` (worst single period): removed per explicit decision, likely too correlated with `max_drawdown` for this leveraged-ETF-heavy dataset (the worst single month and the worst drawdown tend to be the same crash event for these instruments)

**Mechanics:** each metric's raw values are ranked across all eligible entries, ties averaged, converted to a percentile (inverted for "lower better" metrics), then `points = clamp(cap × (percentile - 0.22) / (1 - 2×0.22), 0, cap)` where `cap` is that metric's point value from the table above. Missing data scores 0 for that metric only; the 1,000 denominator never shrinks. Tiers by rank over the eligible pool: S/A/B/C/F at 10/10/20/25/25%, ties round up into the better tier, plus a special **S+** for a perfect 1,000/1,000. Clamp constant stays at **0.22** for launch.

**Validated with a live preview (v1.10.x, this session):** ran the full model against the 2,282 entries refreshed so far. The math held up correctly (proper score differentiation, missing-field entries still scored, tiers computed correctly), and the top 25 confirmed the sequencing gap concretely, roughly 10-12 of the top 25 rows were distinct strategies, the rest were the same handful of strategies double- or triple-counted via TESTPORT ports, "Invest Copy"/"Copy of" clones, and renamed duplicates (e.g. three "Golden Ratio FTLT" name variants, two "Lowcore" TESTPORT numbering variants of the same strategy). Confirms Noise Filtering (V1.14) is doing real, necessary work later, not a nice-to-have.

- [x] Implemented the scoring engine per the table above: `computeScores()` (percentile rank + clamp curve per metric, summed to a 0-1,000 score) and `computeTiers()` (rank-based cuts with round-up ties and the S+ carve-out), both in `database.html`
- [x] Eligibility gate: only entries with `sharpe_ratio` present (the same proxy used throughout this session's live previews for "has been refreshed") enter the ranking pool; the toolbar explicitly states how many entries were excluded as not-yet-refreshed
- [x] Reuses the V1.11 Filter Panel (`leaderboardFilterController`, filters the already-ranked pool) and the standard `.db-pagination` pattern
- [x] Table columns: Rank, Tier (`.tier-badge`), Score (`X / 1,000`), Symphony, ARR, Sharpe, Calmar, Max Drawdown
- [x] Shipped without noise-exclusion (accepted gap, documented above); wiring in the V1.14 `is_noise` exclusion is still pending until that field exists
- [ ] **Post-rollout:** re-evaluate the 0.22 clamp constant against the actual score distribution at full scale; explicitly deferred, not skipped
- [ ] Surface `sortino_ratio` and `win_rate` more broadly once V1.15 Full-Scale Refresh completes (currently ~3,800/6,488 entries refreshed and climbing)

### V1.14: Noise Filtering

**Status:** Planned; sequenced after Screener Tab (V1.12) per user decision

- [ ] Define exclusion rules for non-strategy noise: `TESTPORT #` prefix, "Invest Copy" suffix, "Copy of Copy of..." chains, "[Work]" / "STILL BUILDING" WIP markers
- [ ] Decide a de-duplication policy for near-identical name clusters (e.g. the many "TQQQ For The Long Term" variants): keep first/canonical only, or keep all with a "variant of" link
- [ ] Add a filter flag (e.g. `is_noise: true`) at import time rather than deleting rows, so the raw dataset is preserved
- [ ] All-Strategies, Leaderboard, and Screener views default to excluding flagged noise, with an explicit toggle to show everything

### V1.15: Full-Scale Refresh

**Status:** In Progress; background run started early in V1.9.4 (the API pulling itself doesn't need to wait for its roadmap slot, only verification/finalization does)

- [x] `scripts/refresh_full_database.py --force` launched in the background against all 6,488 entries, populating the full v1.9.1 field set for every row, not just `last_updated`/`script_errors` (started v1.9.4)
- [ ] Monitor for new failure patterns beyond the original quota error once complete
- [ ] Measure and document the real recovery rate against the 5,535 originally-broken rows
- [ ] Decide a policy for rows that still fail after a real API attempt (e.g. deleted symphony, private symphony): flag vs. drop
- [ ] Leaderboard, Screener, and the Filter Panel (built against a partial dataset in V1.11/V1.12/V1.13) get re-verified against the full refreshed dataset

### V1.16: Performance Fix (Data Weight)

**Status:** Complete (built ahead of its roadmap slot, per explicit user request, before V1.11-V1.15)

**Correction made during implementation:** the "<500KB" target this item was framed around (Section 10, Performance Targets) is actually scoped to `Total page weight (home)`, the homepage specifically, not database.html. That number never literally bound this page; citing it as a hard constraint on database.html in earlier roadmap entries was a mistake, corrected here rather than silently carried forward. The underlying concern (an oversized payload still hurts load time and the Lighthouse/LCP targets that do apply broadly) was real regardless.

**What was tried and what actually worked:** dropping unused fields alone (`cumulative_return`, `mean`, `min`, `max`, `active_asset_nodes`, `total_costs`, `annualized_turnover`, `herfindahl_index`) only reduced the file by ~26%, most of the weight wasn't any single field, it was JSON format overhead: every one of 6,488 objects repeating full field names as keys, plus indentation whitespace. The real fix: **columnar format** (`{ fields: [...], rows: [[...], ...] }`, field names stored once, not per-entry) combined with **rounding floats to 4 decimal places** (percentages/ratios never need more precision than that in any UI). Net result on the live dataset: ~11.5MB uncompressed → ~2.3MB uncompressed (79.9% reduction), ~540KB gzipped (what a browser actually transfers in production; Cloudflare Pages serves gzip/brotli automatically).

- [x] `scripts/export_summary.py` added: derives `data/database_summary.json` + `.js` from `data/database.json`, columnar layout, 4-decimal float rounding, drops the 8 unused fields listed above
- [x] `database.html` rewired to load `database_summary.json`/`.js` (`window.DATABASE_SUMMARY_DATA`) instead of the full `database.json`/`.js`; a `rowsFromColumnar()` helper reconstructs plain row objects client-side so the rest of the page's code is unaffected by the wire-format change
- [x] Verified end to end: page loads, data renders, size reduction measured and confirmed (see above)
- [ ] Re-measure actual Lighthouse/LCP numbers once the page is live (not yet possible pre-deploy)

### V2.0: Full Database Goes Public

**Status:** Planned; blocked on V1.9-V1.16 above

- [ ] Full docs and content audit of `database.html`, Leaderboard, and Screener (same bar as any other public page: em-dash check, accuracy check, mobile responsiveness)
- [ ] Decide deploy posture: update `.github/workflows/deploy.yml` rsync exclusion list to include `data/database.json` and `database.html`; keep `Full Database.xlsx` excluded (raw source artifact, not needed at runtime)
- [ ] First commit and push touching this feature, only after every item above is checked off
- [ ] Update Section 6 Feature List: move "Full Database Initiative" from "In Progress" to "Shipped"

### V2.1: Scale + Discovery (Curated Library)

**Status:** Backlog

- [ ] Client-side search (Fuse.js or similar)
- [ ] Tag-based filtering on strategy index: let visitors filter the strategy grid by the tags already generated for every strategy (signal type, e.g. `rsi`, `200d-ma`, `momentum`; asset class, e.g. `leveraged-etfs`, `inverse-etfs`; collection, e.g. `zoop`, `original`), instead of only using tags as read-only labels
- [ ] Strategy comparison view
- [ ] Performance chart per strategy
- [ ] Expand strategy library toward 50+ entries
- [ ] Expand glossary

### V2.2: Community Signals

**Status:** Backlog

- [ ] Strategy submission form
- [ ] Curator notes field visible on strategy pages
- [ ] Related strategies section on each strategy page

### V3.0: Monetization Expansion

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

Composer Atlas is a fully static, browser-only website with no server infrastructure, no user accounts, no authentication, and no database service. This architecture significantly limits the attack surface.

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

**JSON data integrity.** `data/strategies.json` is the only data source and is committed to the public repo. All changes go through GitHub's commit history, a full audit trail. No PII in strategy entries.

**XSS prevention.** All dynamic content rendered from JSON must be escaped before DOM insertion. Do not use `innerHTML` with unsanitized JSON values. Strategy descriptions and names in JSON must not contain HTML tags. The `app.js` render functions use template literals with escaped data.

**Dependency management.** Composer Atlas has zero npm/Node.js dependencies. External resources are limited to Google Fonts CDN (fonts only; no JS). If a CDN dependency is ever added, it must be from an official source with SRI (Subresource Integrity) hash verification.

**External links.** All links to external sites must use `target="_blank"` with `rel="noopener noreferrer"` to prevent tab-napping.

**GitHub repository.** Repository is public, treat all committed content as fully public. Never commit `.env` files, credentials, or PII. Branch protection on `main` is recommended: require PR review before merge.

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

Composer Atlas exists to teach first. Strategy pages explain the logic, signals, and reasoning behind every symphony. A visitor who understands why a strategy works is more valuable than one who blindly clones it.

*If we cannot explain a strategy in plain English, we do not feature it yet.*

### 3. Simplicity Over Complexity

Every feature should reduce friction, not add it. The site should feel like a well-organized wiki, not a bloated dashboard. When in doubt, remove the element.

*If a feature requires a tutorial to use, reconsider the feature.*

### 4. Zero Cost to Operate

Composer Atlas runs on GitHub Pages with no server, no database service, and no paid infrastructure. Every technical decision must be evaluated against this constraint. Complexity that introduces operational cost is rejected at MVP.

*If it requires a server, find a static alternative.*

### 5. Data Is the Product

The strategy database is the most valuable asset of Composer Atlas. Metrics must be accurate, schema must be consistent, and updates must be logged. A strategy with stale or incorrect data should be flagged or removed.

*If the data is wrong, the site is wrong.*

### 6. Design With Intention

Every visual decision should serve the user's ability to understand information. Color is used semantically (green = positive, pink = negative). Typography is used for hierarchy. White space is not wasted. We do not decorate for the sake of decoration.

*If an element does not aid comprehension, remove it.*

### 7. Independence and Integrity

Composer Atlas is not affiliated with Composer.trade. We do not receive compensation for featuring any strategy. Our editorial choices are not for sale. If we ever establish a formal partnership or receive compensation, it will be disclosed prominently.

*If it creates a conflict of interest, disclose it or avoid it.*

### 8. Open and Maintainable

The codebase is public, readable, and maintainable by a single developer. We do not introduce dependencies or patterns that create lock-in or require specialist knowledge to maintain.

*If the next developer cannot understand it in 10 minutes, simplify it.*

---

## 17. FAQ

### User FAQ

**Q: What is Composer Atlas?**
A: Composer Atlas is a free reference website that showcases 25 curated Composer.trade strategies, explains how they work in plain language, and educates visitors on the investing concepts behind them.

**Q: Who is this for?**
A: Self-directed retail investors who use Composer.trade, are curious about systematic investing, or want to learn about concepts like RSI, VIX strategies, momentum, or leveraged ETFs.

**Q: Are these strategies financial advice?**
A: No. Composer Atlas is an educational resource. All strategies are presented for informational purposes only. Past performance does not guarantee future results. Always do your own research before investing.

**Q: Can I clone these strategies on Composer.trade?**
A: Yes. Each strategy page includes a direct link to clone the symphony on Composer.trade.

**Q: Is Composer Atlas free?**
A: Yes. The site is free to access. If you find it valuable, you can support development via a donation at https://azqato.com/support.html.

**Q: Who curates the strategies?**
A: Strategies are selected and maintained by the site owner. All featured strategies are presented with full transparency on their logic and metrics.

**Q: How often are metrics updated?**
A: Metrics are updated manually via GitHub commits. Each strategy page displays a last updated date.

**Q: Is Composer Atlas affiliated with Composer.trade?**
A: No. Composer Atlas is an independent, community-built resource. Composer.trade is a separate company and platform.

### Operational FAQ

**Q: Why build this as a static site?**
A: Zero server cost, zero maintenance overhead, maximum reliability. GitHub Pages is free, fast, and requires no infrastructure management.

**Q: Why JSON instead of a real database?**
A: At MVP scale (10-100 strategies), a flat JSON file is sufficient, fast, and requires no backend. The schema is designed to migrate easily to a real database if scale demands it.

**Q: How does the site make money?**
A: Google AdSense (post-MVP) and direct user donations via https://azqato.com/support.html.

**Q: What happens if Composer.trade changes their URLs?**
A: The `symphony_url` field in the JSON can be updated per strategy via a commit. A future script will automate this check.

**Q: How do I add a new strategy?**
A: See Section 11 (Operational Runbook) for the full process. The preferred method is providing a Composer URL to Claude Code.

**Q: What is the long-term vision?**
A: Become the canonical public reference for Composer.trade strategy discovery and education, eventually hosting thousands of strategies with search, filtering, and comparison tools.

### Content Notes

**Strategy building best practice, avoid short lookback periods:**
Do not use RSI or return checks shorter than 10 days (e.g., `1d`). Very short windows make the algorithm extremely twitchy and will not match the backtest in out-of-sample (OOS) performance.

---

## 18. Documentation Process

### 4-File Structure

As of v1.3.0 (2026-06-14), Composer Atlas documentation lives in exactly 4 files:

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

---

## 19. Writing Style

### Em-Dash Prohibition

Em-dashes are prohibited in all project files: HTML pages, documentation (.md files), JavaScript, CSS, and JSON data. This applies to both forms:

- **Literal Unicode character** (U+2014): the literal character (cannot be stored in this file)
- **HTML entity**: `&mdash;`

A text search for one form will not catch the other. Both must be searched independently when auditing for compliance.

**Why:** Em-dashes read as an AI writing pattern. They are a hallmark of AI-generated prose and undermine the editorial voice of the site.

### Approved Replacements

Choose the replacement that best fits the sentence, in order of preference:

| Replacement | When to use |
|---|---|
| **Comma** | Most natural replacement in most cases; keeps the sentence flowing without drawing attention |
| **Colon** | When introducing a list, explanation, or elaboration after a complete clause |
| **Semicolon** | When connecting two closely related independent clauses that could stand alone as sentences |
| **Parentheses** | For asides or extra information that is supplementary rather than central to the sentence |
| **Period** | Sometimes the cleanest fix is splitting into two sentences; shorter sentences are often clearer |

### Common Patterns and Their Fixes

| Original | Fixed | Rule Used |
|---|---|---|
| `**Label** [em-dash] description` | `**Label**: description` | Colon (label introducing explanation) |
| `` `code` [em-dash] what it does `` | `` `code`: what it does `` | Colon (code label) |
| `### Section [em-dash] Subtitle` | `### Section: Subtitle` | Colon (heading) |
| `Feature [em-dash] works like X` | `Feature, works like X` | Comma (mid-sentence aside) |
| `It loads data [em-dash] no server needed` | `It loads data; no server needed` | Semicolon (two independent clauses) |
| `Signal [em-dash] fires when X` | `Signal: fires when X` | Colon (label introducing condition) |

### Double-Dash Punctuation (`--`)

The `--` character sequence used as a punctuation substitute (e.g., `word--word` or `word -- word`) is also prohibited. Do not confuse this with CSS custom property syntax (`--color-bg`, `--nav-height`), which is valid and must not be changed.

### Audit Process

When auditing for em-dash compliance, run both searches independently:

```bash
# Search for literal em-dash
python -c "
import os
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d != '.git']
    for f in files:
        if any(f.endswith(e) for e in ['.html','.md','.js','.css','.json']):
            text = open(os.path.join(root,f), encoding='utf-8').read()
            if chr(8212) in text:
                print(f'{f}: {text.count(chr(8212))} em-dashes')
"

# Search for HTML entity (grep)
grep -r '&mdash;' --include='*.html' --include='*.md' .
```

The `scripts/add_ai_summary.py` script contains the canonical AI Summary content. When updating summaries, verify the new text contains no em-dashes before committing.
