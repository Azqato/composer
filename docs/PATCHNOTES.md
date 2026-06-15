# ComposerAtlas — Changelog

All notable changes to ComposerAtlas are documented in this file.
Format: `[VERSION] - YYYY-MM-DD`

---

## [1.5.2] - 2026-06-15

### Added — 9 new glossary concepts (17 total)

Added rich multi-section entries for nine new concepts referenced throughout the site:

**Indicators:** Simple Moving Average (SMA), Exponential Moving Average (EMA), MACD

**Strategy Concepts:** Mean Reversion, Volatility Decay

**Risk Metrics:** Standard Deviation, Annualized Rate of Return (ARR)

**Asset Classes:** Managed Futures, Inverse ETFs

Each entry includes Definition, How It Works, In Practice, Limitations, and an extended "Building in Composer.trade" section with strategy-specific examples from the library. Added new tags to relevant strategies (`macd`, `mean-reversion`, `standard-deviation`, `managed-futures`, `inverse-etfs`) so related strategy counts are populated on glossary cards. Updated tag label display in `js/app.js`.

**Files changed:** `data/glossary.json`, `data/glossary.js`, `data/strategies.json`, `data/strategies.js`, `js/app.js`

---

## [1.5.1] - 2026-06-15

### Fix — Glossary card titles are now clickable links

Made the concept name in each glossary card a clickable anchor link pointing to the detail page (`glossary.html?slug=…`), matching the existing behavior on strategy cards.

**File changed:** `js/app.js`

---

## [1.5.0] - 2026-06-14

### Added — 6 new strategies (24 total)

Added six new Composer symphonies to the strategy library, expanding the catalog from 18 to 24 strategies. Each entry was analyzed from the Composer API backtest metrics and logic tree, with full `how_it_works` narrative, `signals` breakdown, and `risk_profile` section.

| Strategy | Symphony ID | ARR | Max DD |
|---|---|---|---|
| SOXX Group | `7PBSP926Mp40r6bPnP0j` | 111.2% | -69.2% |
| SOXL Growth v2.4.5 RL | `CW8oWU12S6vEvn2Hh7jD` | 143.1% | -82.5% |
| Inside Nancy Pelosi's Chips - V3 | `HgK8mCeBnH4fQFNcfZ7q` | 73.1% | -86.2% |
| Top Cap by MA + RSI ETF Hedge | `wadbe3IfwvSES5vk6yiu` | 133.3% | -57.8% |
| Mean Reversion Comparison to Python Code | `KJqNBGxYyyKuCcEfdHhq` | 81.8% | -81.7% |
| SPY, Energy, Chips, Commodities | `rtyBIBOKEY2cPSbJSQX8` | 73.9% | -65.3% |

**Notable additions:**
- **SOXX Group** — Garen/DN's K Wave V6 system with the '30-20-10 Double Pop' multi-timeframe RSI cascade for semiconductor mean-reversion
- **SOXL Growth v2.4.5 RL** — Reinforcement-learning-optimized SOXL strategy; identified by ML-precision decimal thresholds (RSI <= 62.1995, StdDev <= 4.9226) and highest drawdown in the library (82.5%)
- **Inside Nancy Pelosi's Chips - V3** — Semiconductor mean-reversion using SOXX 5-day momentum extremes and individual NVDA/AMD RSI signals at extreme thresholds (RSI > 90 and < 15)
- **Top Cap by MA + RSI ETF Hedge** — Minimalist 3-branch strategy: SPY RSI(6d) >= 90 → UVXY; RSI(6d) <= 28 → leveraged attack [TQQQ,LABU,SPXL]; normal → mega-cap momentum filter [WMT,MSTR,AMZN,KO,BRK/B,AAPL,TSLA]
- **Mean Reversion Comparison to Python Code** — Built to cross-validate a Python backtest; minimal SPY MA + TQQQ RSI(10d) logic that serves as a performance baseline vs Holy Grail
- **SPY, Energy, Chips, Commodities** — VIXM RSI(40d) Black Swan Catcher paired with a multi-sector rotator spanning [SOXX,NVDA,AMD,SPY,DBC,XLE,ENPH]

**Files changed:** `data/strategies.json`, `data/strategies.js`, `docs/PATCHNOTES.md`, `docs/PRD.md`, `README.md`

---

## [1.4.2] - 2026-06-14

### Fix — Repo-rename-proof BASE URL detection

Replaced hardcoded string matching in the `BASE` detection with a hostname check:

```js
// Before — breaks whenever the repo is renamed
const BASE = (_seg && _seg.toLowerCase() === 'composer') ? '/' + _seg : '';

// After — detects GitHub Pages by host; works regardless of repo name
const BASE = (window.location.hostname.endsWith('.github.io') && _seg) ? '/' + _seg : '';
```

The previous approach required updating the string literal every time the GitHub repository was renamed (from `ComposerAtlas` → `composer` in v1.4.1). The new approach detects GitHub Pages environments by their `*.github.io` hostname and automatically uses whatever the first path segment is as the base. Behaviour is identical on all environments: GitHub Pages gets `/composer`, localhost gets `''`, `file://` is handled separately in `u()`.

**Files changed:** `js/app.js`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.4.1] - 2026-06-14

### Infra — GitHub repository renamed from `ComposerAtlas` to `composer`

The GitHub repository was renamed from `Azqato/ComposerAtlas` to `Azqato/composer`. The GitHub Pages URL changed accordingly.

| | Before | After |
|---|---|---|
| Repository | `https://github.com/Azqato/ComposerAtlas` | `https://github.com/Azqato/composer` |
| Live site | `https://azqato.github.io/ComposerAtlas/` | `https://azqato.github.io/composer/` |

**Critical fix — `js/app.js` BASE detection:** The `BASE` constant is derived from the first URL path segment and used to prefix all internal links. Before: checked for `'composeratlas'` (case-insensitive). After: checks for `'composer'`. Without this fix all navigation and deep links would resolve to the server root.

```js
// Before
const BASE = (_seg && _seg.toLowerCase() === 'composeratlas') ? '/' + _seg : '';

// After
const BASE = (_seg && _seg.toLowerCase() === 'composer') ? '/' + _seg : '';
```

**Also updated:** `robots.txt` sitemap URL, `README.md` clone/live/actions URLs, `docs/PRD.md` live URL, repository URL, route table, and BASE detection code example.

**Files changed:** `js/app.js`, `robots.txt`, `README.md`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.4.0] - 2026-06-14

### Added — 5 new strategies (18 total)

Added five new Composer symphonies to the strategy library, expanding the catalog from 13 to 18 strategies. Each entry was analyzed from the Composer API logic tree and includes full `how_it_works` narrative, `signals` breakdown, and `risk_profile` section.

| Slug | Name | ARR | Max DD | Sharpe | Calmar | Days |
|---|---|---|---|---|---|---|
| `holy-grail` | The Holy Grail (Original) | 153.9% | -47.4% | 1.80 | 3.24 | 3,693 |
| `tqqq-long-term` | TQQQ For The Long Term | 165.4% | -53.6% | 1.86 | 3.08 | 3,693 |
| `wooden-arkk` | Wooden ARKK Machine 2.2 | 244.2% | -44.5% | 2.25 | 5.48 | 1,028 |
| `super-semiconductors` | Super Semiconductors | 102.6% | -42.9% | 1.71 | 2.39 | 3,614 |
| `four-horsemen` | The Four Horsemen of the Apocalypse | 166.8% | -45.3% | 2.18 | 3.68 | 3,629 |

**Strategy highlights:**
- **Holy Grail** uses TQQQ's own 200d MA as the trend gate (not SPY), with a 5% rebalance corridor rather than daily rebalancing; bear mode uses sequential dip-buys on TECL/SOXL and a SQQQ/BSV RSI filter.
- **TQQQ For The Long Term** gates on SPY's 200d MA with dual overbought checks (TQQQ RSI + SPXL RSI); bear mode adds SQQQ dip-buy as an unusual re-entry into the inverse position after market bounces.
- **Wooden ARKK Machine 2.2** is a pure mean-reversion system: IEI vs SPHB RSI(7) selects the regime, then buys the single worst-performing asset from a 7-ETF long pool (risk-off) or 5-ETF inverse pool (risk-on) using 4-day MA sort.
- **Super Semiconductors** (Dereck Nielsen) uses SPY EMA(8)/SMA(200) gate + MACD on SMH to switch between top-3 stock selection from a 19-stock universe, partial SHY/SMH hedge, SOXL dip-buy, or bear-mode SOXS short.
- **Four Horsemen** runs multiple parallel components with different time horizons, the most complex logic tree in the library: QQQ 252d return < -20% activates a deep bear routing protocol with tiered thresholds and bear-rally detection.

**Files changed:** `data/strategies.json`, `data/strategies.js`, `README.md`, `docs/PATCHNOTES.md`

---

## [1.3.0] - 2026-06-14

### Changed
- Consolidated 12 documentation files into 4 canonical documents: README.md, docs/PRD.md, docs/DESIGN.md, docs/PATCHNOTES.md
- Moved all operational, technical, API, schema, roadmap, security, and tenet content into docs/PRD.md as consolidated sections
- README.md rewritten as developer-facing quick-start (no marketing language)
- docs/DESIGN.md expanded to include all required sections: philosophy, full color palette, typography, spacing, breakpoints, component patterns, accessibility, animation
- File naming standardized from .MD to .md

### Removed
- docs/ComposerAPI.MD (content moved to PRD.md § Composer API Reference)
- docs/GLOSSARY-SCHEMA.MD (content moved to PRD.md § Data Schemas)
- docs/METRICS.MD (content moved to PRD.md § Data Schemas)
- docs/PRFAQ.MD (content moved to PRD.md § FAQ)
- docs/ROADMAP.MD (content moved to PRD.md § Roadmap)
- docs/RUNBOOK.MD (content moved to PRD.md § Operational Runbook)
- docs/SECURITY.MD (content moved to PRD.md § Security)
- docs/TENETS.MD (content moved to PRD.md § Tenets)
- docs/TRD.MD (content moved to PRD.md § Architecture & Technical Reference)
- README.MD (root, uppercase) replaced by README.md (lowercase)

---

## [1.2.1] - 2026-06-14

### Docs — Documented URL-based strategy addition workflow

Added "Adding a Strategy from a Composer URL (Streamlined)" section to `docs/RUNBOOK.MD` — the preferred method for adding new strategies. Documents the full automated workflow: extract symphony ID from URL, fetch backtest metrics and logic tree from the Composer API (no auth required), AI analysis of IF/ELSE logic tree to draft all content fields, name/slug proposal with user confirmation, and dual-file insertion into `data/strategies.json` + `data/strategies.js`.

The prior "Adding a New Strategy" workflow is retained and renamed "Manual" for cases where the API is unavailable.

**Files changed:** `docs/RUNBOOK.MD` (v1.7 → v1.8), `docs/PATCHNOTES.MD`

---

## [1.2.0] - 2026-06-14

### Refactor — Consolidated folder structure: flat root .html files

Eliminated the `strategies/` and `glossary/` subdirectories entirely. Each section's listing and detail views are now served from a single root-level `.html` file.

| Before | After |
|---|---|
| `strategies/index.html` (listing) | `strategies.html` (listing + detail) |
| `strategies/detail/index.html` (detail) | ↑ same file, `?slug=X` triggers detail view |
| `glossary/index.html` (listing) | `glossary.html` (listing + detail) |
| `glossary/detail/index.html` (detail) | ↑ same file, `?slug=X` triggers detail view |

**How it works:** Each combined page checks `new URLSearchParams(window.location.search).get('slug')` on load. `null` → render listing into `#content`; non-null → render detail view for that slug. Same file, same assets, different render path.

**URL changes:**

| Old URL | New URL |
|---|---|
| `/ComposerAtlas/strategies/` | `/ComposerAtlas/strategies.html` |
| `/ComposerAtlas/strategies/detail/?slug=X` | `/ComposerAtlas/strategies.html?slug=X` |
| `/ComposerAtlas/glossary/` | `/ComposerAtlas/glossary.html` |
| `/ComposerAtlas/glossary/detail/?slug=X` | `/ComposerAtlas/glossary.html?slug=X` |

**`u()` simplified** (`js/app.js`): Removed depth-detection logic (no longer needed — all pages are at root depth 0). `file://` path now just strips the leading `/` and maps `'/'` → `'index.html'`. Function shrank from 12 lines to 5.

**Files changed:** `strategies.html` (new), `glossary.html` (new), `js/app.js`, `index.html`, `404.html`, `docs/RUNBOOK.MD` (v1.6 → v1.7), `docs/PATCHNOTES.MD`

**Deleted:** `strategies/index.html`, `strategies/detail/index.html`, `glossary/index.html`, `glossary/detail/index.html`

---

## [1.1.9] - 2026-06-14

### Fix — s90 50/40 maxDD: remove incorrect 2026 Frontrunner reference

The `how_it_works` and `risk_profile` content incorrectly stated the strategy paired with "the 2026 Frontrunner." It uses a different frontrunner component. Updated all three occurrences to "a frontrunner component" / "the frontrunner component" — neutral phrasing that doesn't assert which frontrunner is used.

**Files changed:** `data/strategies.json`, `data/strategies.js`, `docs/PATCHNOTES.MD`

---

## [1.1.8] - 2026-06-14

### Feature — Strategy card titles are now clickable links

Strategy card titles (`<h2 class="card-title">`) now link to the strategy detail page, identical to the "View Strategy →" button on each card. Clicking the title navigates to `/strategies/detail/?slug=...`.

**Implementation:** Wrapped `s.name` in an `<a>` tag inside `renderStrategyCard()`. Added `.card-title a { color: inherit; text-decoration: none; }` so the link inherits the heading color and the existing `.card:hover .card-title { color: var(--color-green); }` rule applies naturally — hovering the card turns both the title text and the link green with no additional CSS required.

**Files changed:** `js/app.js`, `css/main.css`, `docs/PATCHNOTES.MD`

---

## [1.1.7] - 2026-06-14

### Content — Added Low Catchers strategy (13th symphony)

Added **s90 50/40 maxDD (Half Low Catch)** (`s90-half-low-catch`) — a multi-asset extreme dip-buying strategy that pairs the 2026 Frontrunner with a dedicated low-catching component.

**Strategy summary:**

The low-catchers component is a waterfall of extreme oversold conditions across 9+ 3x leveraged ETFs. Entry thresholds are the tightest in the library (RSI 14–22). The strategy only deploys in catastrophic conditions: QQQ 10-day MA return < -2.4%, SOXL 1/2/5-day crash thresholds (-31%/-37%/-57%), UVXY RSI > 88 (extreme fear), or individual ETF RSI bottoms across LABU, YINN, UDOW, FAS, TNA, URTY, KORU, NAIL, and others.

**Key metrics (as of 2026-06-14, backtest 551 days):**

| Metric | Value |
|---|---|
| Annualized Return | 735% |
| Max Drawdown | -29.6% |
| Sharpe Ratio | 3.04 |
| Calmar Ratio | 24.8 |
| Standard Deviation | 79.7% |
| Backtest Days | 551 (~1.5 yrs) |

**Important:** Backtest covers ~1.5 years only (from early 2024). Metrics reflect a predominantly bull market and should be interpreted with caution.

Metrics fetched via Composer API (`POST /api/v0.1/symphonies/K8ql2SKFd4VDBemIstEr/backtest`).

**Files changed:** `data/strategies.json`, `data/strategies.js`, `docs/PATCHNOTES.MD`

---

## [1.1.6] - 2026-06-13

### Design — 🗺️ emoji replaces "CA" monogram as site logo and favicon

Replaced the green "CA" monogram with the 🗺️ map emoji across all logo touchpoints.

**favicon.svg** — Replaced the dark-background rectangle + "CA" JetBrains Mono text with a plain 32×32 SVG that renders the emoji. All 7 HTML pages already reference `favicon.svg` via `<link rel="icon">` so no HTML changes were needed.

**Nav logo mark** (`js/app.js`) — Changed `<span class="nav-logo-mark">CA</span>` to `<span class="nav-logo-mark">🗺️</span>`.

**`.nav-logo-mark` CSS** (`css/main.css`) — Removed `font-family: var(--font-mono)`, `font-weight: 700`, and `color: var(--color-green)` (irrelevant to emoji rendering). Replaced with an emoji-safe font stack (`'Segoe UI Emoji'`, `'Apple Color Emoji'`, `'Noto Color Emoji'`) and bumped `font-size` to `1.25rem` for visual balance.

**Files changed:** `favicon.svg`, `js/app.js`, `css/main.css`

---

### Docs — Strategy building best practice added to PRD

Added a "Content Notes (Pending Placement)" section to `docs/PRD.MD` to stage content destined for the website. First entry: avoid lookback periods shorter than 10 days to prevent overfitting and OOS drift.

**Files changed:** `docs/PRD.MD`

---

## [1.1.5] - 2026-06-08

### Fix — Stats bar values now use primary white color

Homepage stats bar numbers (12 Strategies, Best Sharpe, Top ARR, 8 Concepts) were inconsistently colored — the Sharpe and ARR values had `text-green` class applied, making them green while the Strategies and Concepts counts were white. All four stat values now consistently use `--color-primary` (`#f0f0f0`).

**Files changed:** `index.html`

---

## [1.1.4] - 2026-06-08

### Docs — Full documentation audit: all 12 docs updated to reflect v1.1.x site state

All documentation files in `docs/` updated to match the current state of the live site. No code changes.

**TRD.MD (v1.3 → v1.4)**
- Updated BASE URL detection snippet to the case-insensitive version (`split('/')[1]` + `.toLowerCase()`)
- Updated `--color-secondary` from `#888888` to `#b0b0b0` in the CSS vars block; removed `--color-green-muted` (removed in v1.1.1)
- Updated GitHub Actions workflow to show rsync-based deploy with exclusion list
- Fixed page route table: `/composeratlas/` → `/ComposerAtlas/` (correct casing)
- Added documentation of the `u()` URL helper function

**DESIGN.MD (v1.1 → v1.2)**
- Fixed all color token names: `--color-text-primary/secondary/disabled` → `--color-primary/secondary/disabled` (matching actual CSS)
- Updated `--color-secondary` value from `#888888` to `#b0b0b0` (updated in v1.0.7)
- Removed `--color-green-muted` row (removed in v1.1.1)
- Added Footer component spec (missing from v1.1)
- Fixed Loading States: removed incorrect claim that data is resolved at build time
- Fixed Error States: removed Astro-specific language; describes actual runtime JSON error handling
- Fixed Mobile Nav: removed "Implemented as Astro island" note; replaced with correct vanilla JS description
- Updated contrast ratio for `--color-secondary`: ~5.7:1 → ~9.4:1 (brighter value)

**METRICS.MD (v1.1 → v1.2)**
- Fixed `tags` field description: `/src/content/glossary/` → `data/glossary.json`
- Fixed color token names in Color Coding table: `--color-text-primary` → `--color-primary`

**PRD.MD (v1.0 → v1.1)**
- Updated strategy count 10 → 12 throughout
- Fixed Dependencies section: "Chosen JS framework (TBD)" → "Vanilla HTML/CSS/JavaScript — zero build dependencies"

**ROADMAP.MD (v1.0 → v1.1)**
- Marked V1.0 as Complete (was "In Development"); added live URL
- All V1.0 deliverables checked; count corrected 10 → 12
- Updated V1.1 status to "In Progress (current; at v1.1.3)"; checked completed items
- Updated V1.2 to "Partially Complete"; checked items delivered via `scripts/update_metrics.py`

**SECURITY.MD (v1.0 → v1.1)**
- Replaced npm-specific dependency management guidance with correct zero-dependency posture

**GLOSSARY-SCHEMA.MD (v1.0 → v2.0)**
- Complete rewrite: replaced Astro Content Collections / Markdown file approach with actual JSON-based structure
- Documents `data/glossary.json` and `data/glossary.js` sync requirement
- New JSON entry schema with all fields; section structure documented
- Updated all 8 canonical glossary entries from "Planned" to "Complete"

**PRFAQ.MD (v1.0 → v1.1)**
- Updated strategy count reference from "10" to "12"

**Files changed:** `docs/TRD.MD`, `docs/DESIGN.MD`, `docs/METRICS.MD`, `docs/PRD.MD`, `docs/ROADMAP.MD`, `docs/SECURITY.MD`, `docs/GLOSSARY-SCHEMA.MD`, `docs/PRFAQ.MD`

---

## [1.1.3] - 2026-06-08

### Design — Footer simplified to match azqato.github.io

Replaced the multi-column footer (logo, tagline, nav links, disclaimer block) with a clean centered layout matching the spacing and approach of azqato.github.io.

**Before:** Two-column flex layout with logo/tagline on the left, nav links on the right, a divider, and a stacked disclaimer block below. `padding: 40px 0`.

**After:** Single centered column. `padding: 2rem`, `text-align: center`. Three elements stacked:
1. Nav links row (centered, `gap: 16px`)
2. One-line legal disclaimer (`max-width: 560px`, `color: --color-disabled`)
3. Copyright + "Built by Azqato" attribution

**Files changed:** `css/main.css`, `js/app.js`

---

## [1.1.2] - 2026-06-08

### Fix — All internal links broken on GitHub Pages (case-sensitive BASE detection)

Every internal link generated by `u()` was broken on the live GitHub Pages deployment — nav links (Strategies, Glossary, About), strategy card "View Strategy" buttons, breadcrumbs, sidebar links, and error-state back buttons. Only hardcoded relative URLs (like the homepage hero CTA) were immune.

**Root cause:** `BASE` was computed as:
```js
const BASE = window.location.pathname.startsWith('/composeratlas') ? '/composeratlas' : '';
```
The GitHub repository is named `ComposerAtlas` (capital C), so the live URL path is `/ComposerAtlas/...`. The case-sensitive `startsWith` check always failed, `BASE` became `''`, and every `u()` call produced an absolute path from the server root (e.g. `/strategies/detail/`) instead of `/ComposerAtlas/strategies/detail/`.

**Fix:** Extract the first URL path segment and compare case-insensitively, preserving actual casing from the live URL:
```js
const _seg = window.location.pathname.split('/')[1];
const BASE = (_seg && _seg.toLowerCase() === 'composeratlas') ? '/' + _seg : '';
```

Also updated the homepage hero Glossary CTA to route through `u('/glossary/')` via JavaScript instead of a hardcoded `href="glossary/"`, making it consistent with every other internal link on the site.

**Files changed:** `js/app.js`, `index.html`

---

## [1.1.1] - 2026-06-08

### Cleanup — Pre-Launch Optimization

Cleaned up project structure and deployment pipeline in preparation for the initial GitHub Pages launch.

**Deploy workflow** (`deploy.yml`): Previous workflow uploaded the entire repository to GitHub Pages, including files that should never be publicly served. Updated to use `rsync` to build a clean `_site/` folder before upload. Files now excluded from deployment:

- `data/symphony_scores.json` — 14MB raw EDN logic tree data; for AI analysis only, not user-facing
- `docs/` — Internal project documentation (RUNBOOK, TRD, PATCHNOTES, etc.)
- `scripts/` — Python data sync scripts
- `strategies.xlsx` — Source spreadsheet reference
- `README.MD`, `.gitignore`, `.github/` — Dev/CI config

**CSS**: Removed unused `--color-green-muted: #00a854` custom property. It was defined in `:root` but never referenced anywhere in the stylesheet.

**JS**: Removed unused `i` parameter from `renderBreadcrumb`'s map callback.

**Files changed:** `.github/workflows/deploy.yml`, `css/main.css`, `js/app.js`, `docs/RUNBOOK.MD` (v1.5 → v1.6)

---

## [1.1.0] - 2026-06-08

### Content — Logic Tree Analysis: Full Strategy Rewrites

All 12 strategy pages have been rewritten from scratch based on analysis of the actual IF/ELSE logic trees stored in `data/symphony_scores.json`. The previous content was generic placeholder text that did not accurately reflect how each symphony works. This release corrects the record.

**What changed per strategy:**

| Field | Before | After |
|---|---|---|
| `how_it_works` | 2-3 generic paragraphs describing momentum/rotation | 3 precise paragraphs derived from actual logic tree structure |
| `signals` | Approximate — often missing or mislabeled | Verified against actual IF branches: ETF tickers, RSI thresholds, and conditions confirmed |
| `tags` | Multiple errors (see below) | Corrected per actual logic used |
| `risk_profile` | Cited stale metric figures | Updated to match current API metrics; stale Calmar/return figures removed |

**Tag corrections across all 12 strategies:**

- `rsi` — Added to all 12 strategies (was missing from Frontrunner, TQQQ FTLT, Safety Checks, KMLM Switcher, UPRO FTLT)
- `vix-tiers` — Added to all 12 strategies (all use UVXY RSI >65 via the Frontrunner component; tag was absent from most)
- `200d-ma` — Removed from Frontrunner (no SMA comparison exists in its logic tree); correctly added to TQQQ FTLT, UPRO FTLT, Safety Checks, Leveraged TQQQ Symphony where absent
- `200d-ma` — Removed from KMLM Switcher and SOXL Growth (neither uses a Price > SMA signal in its terminal logic)
- `max-drawdown` — Added to SOXL Growth; this is the only strategy using MaxDD as a primary regime gate
- `200d-ma` — Removed from SOXL Growth (MaxDD is the primary signal, not an SMA comparison)

**Key content corrections (selected highlights):**

- **Frontrunner**: Recharacterized from "momentum/trend-follower" to "cash-first dip-buying strategy that defaults to BIL T-bills" — the actual behavior
- **KMLM Switcher**: Removed description of KMLM ETF as the switching instrument; actual switch signal is XLK (Technology SPDR) relative RSI; LABU biotech dip-buy documented
- **Sometimes TQQQ**: Documented multi-period RSI (10/20/60/100), 6 cumulative return windows (1d/6d/10d/60d/62d/252d), and full bond cross-asset signal set (TLT/BND/IEF/AGG/CORP/PSQ)
- **Safety Checks**: Documented 10-condition ensemble voting structure (the most accurate description of its behavior)
- **Manhattan Project**: Documented BIL RSI yield signal, 8-ETF leveraged basket on SPY RSI <30, and 20+ ETF universe
- **SOXL Growth**: Documented MaxDD(SOXL) ≥50% regime gate, standard deviation thresholds (3.8%/4.92%/5.41%/18%), and TMF/TMV in-position Treasury pairing

**Process:** See RUNBOOK.MD § "Re-Analyzing Strategy Logic Trees" for the full documented procedure.

**Files changed:** `data/strategies.json`, `data/strategies.js`, `docs/RUNBOOK.MD` (v1.4 → v1.5)

---

## [1.0.9] - 2026-06-08

### Data — Symphony logic trees fetched and stored for analysis

Added `data/symphony_scores.json` containing the full IF/ELSE logic tree for all 12 symphonies, fetched from `GET /api/v0.1/symphonies/{id}/score`. This file is for AI analysis and future reference only — it is not served to the website.

Updated `scripts/update_metrics.py` to also refresh `symphony_scores.json` on every run, keeping logic trees in sync alongside backtest metrics. Run the script monthly (or whenever symphonies are edited) to keep all data current.

**Files changed:** `data/symphony_scores.json` (new), `scripts/update_metrics.py`, `docs/RUNBOOK.MD` (v1.3 → v1.4)

---

## [1.0.8] - 2026-06-08

### Data — Live backtest metrics refreshed via Composer API

All 12 strategy metrics updated by fetching fresh backtest data directly from the Composer API (`POST /api/v0.1/symphonies/{id}/backtest`). No API key required.

Updated fields per strategy: `annualized_rate_of_return`, `max_drawdown`, `cumulative_return`, `calmar_ratio`, `sharpe_ratio`, `standard_deviation`, `min`, `mean`, `median`, `max`, `trailing_one_month_return`, `trailing_three_month_return`, `trailing_one_year_return`, `backtest_days`, `last_updated`.

**Files changed:** `data/strategies.json`, `data/strategies.js`

**Added:** `scripts/update_metrics.py` — reusable Python script to refresh all metrics on demand. Run with `python scripts/update_metrics.py` from the project root.

---

## [1.0.7] - 2026-06-08

### Fix: Secondary text legibility across all pages

Lightened the `--color-secondary` CSS token from `#888888` to `#b0b0b0`. This improves readability of all body/description text on a dark background — including the hero subtitle, strategy descriptions, glossary concept descriptions, how-it-works paragraphs, prose section text, and card descriptions.

**Files changed:** `css/main.css`

---

## [1.0.6] - 2026-06-08

### Glossary — 5-Paragraph Essays for All 8 Concepts

Each glossary concept now includes a dedicated "Building with…" essay section that explains why the concept is useful for systematic investing and shows concrete examples of how to apply it when building symphonies in Composer.trade.

**New sections added to all 8 concepts:**

| Concept | Essay Title |
|---|---|
| RSI | "Building with RSI in Composer.trade" |
| 200-Day Moving Average | "Building with the 200-Day MA in Composer.trade" |
| Momentum Investing | "Building Momentum Strategies in Composer.trade" |
| VIX Tiers | "Building VIX-Tiered Symphonies in Composer.trade" |
| Leveraged ETFs | "Building Systematic Leveraged ETF Symphonies in Composer.trade" |
| Sharpe Ratio | "Using Sharpe Ratio to Build Better Symphonies in Composer.trade" |
| Calmar Ratio | "Using Calmar Ratio to Design Better Symphonies in Composer.trade" |
| Max Drawdown | "Managing Max Drawdown When Building Symphonies in Composer.trade" |

Each essay covers: why the concept matters for systematic investing, how it functions as a signal or metric in a Composer.trade symphony, practical examples of building with it (signal combinations, thresholds, symphony architecture), and limitations to watch for.

**Files changed:** `data/glossary.json`, `data/glossary.js`

No rendering changes required — the existing `glossary/detail/index.html` page renders sections from the data array automatically, so the new essay sections appear without any code changes.

---

## [1.0.5] - 2026-06-08

### Nav + Footer — Support link and Azqato attribution

**Navigation**
- Added "Support" link to desktop nav, mobile nav drawer, and footer nav — links to `https://azqato.github.io/support.html` (opens in new tab)
- External links in nav now include `target="_blank" rel="noopener noreferrer"` automatically via the `external: true` flag on link objects

**Footer**
- Added "Made by Azqato." centered below the copyright line — links to `https://azqato.github.io/` (opens in new tab)

**Files changed:** `js/app.js`

---

## [1.0.4] - 2026-06-08

### Fix: Navigation broken on file:// protocol

All internal links now work correctly when the site is opened by double-clicking HTML files.

#### Problem

Navigation links in `renderNav()`, `renderFooter()`, and inline page scripts were constructed as `BASE + '/strategies/'`, producing absolute paths like `/strategies/`. On `file://` protocol, `/strategies/` resolves to the filesystem root (e.g., `file:///strategies/`), not relative to the project folder — so every nav click went to a dead 404.

#### Fix

Added a `u(path)` helper function to `js/app.js`:
- On HTTP/HTTPS: returns `BASE + path` (unchanged behavior — absolute paths work fine on a server)
- On `file://`: determines the current page's depth in the directory tree (0 = root, 1 = `strategies/` or `glossary/`, 2 = `strategies/detail/` or `glossary/detail/`) and returns a relative path (e.g., `../../strategies/`) so the browser resolves it correctly

All link constructions across `js/app.js` and the inline scripts in `strategies/detail/index.html`, `glossary/detail/index.html`, and `404.html` have been updated to use `u()` instead of `BASE + '/'`.

---

## [1.0.3] - 2026-06-08

### File:// Protocol Compatibility — Open Without a Server

The site now works by double-clicking any HTML file directly. No Python server required.

#### Problem

The previous implementation loaded strategy and glossary data via `fetch()`. Browsers block `fetch()` on the `file://` protocol due to CORS restrictions, meaning the site would only work when served over HTTP (e.g., `python -m http.server`).

#### Solution

Converted data loading to a `<script>`-tag-based approach:

**Files Added**
- `data/strategies.js` — Assigns `window.STRATEGIES_DATA = [...]` with all 12 strategies. Loaded before `app.js` via `<script>` tag.
- `data/glossary.js` — Assigns `window.GLOSSARY_DATA = [...]` with all 8 glossary concepts.

**Files Updated**
- `js/app.js` — `loadStrategies()` and `loadGlossary()` now check `window.STRATEGIES_DATA` / `window.GLOSSARY_DATA` first. Falls back to `fetch()` only if the globals are absent.
- All 7 HTML pages — Added `<script src="[path]/data/strategies.js">` and `<script src="[path]/data/glossary.js">` before the `app.js` include. Relative paths adjusted per directory depth.

#### Result

- Open `index.html` by double-clicking — site loads fully, no server needed.
- GitHub Pages continues to work unchanged (HTTP origin, globals are just loaded first).
- Python server still works as before (fetch fallback or globals — both load the same data).
- `data/strategies.json` and `data/glossary.json` remain the source-of-truth files. When updating data, keep the corresponding `.js` files in sync.

#### Documentation Updated

- `docs/TRD.MD` (v1.2 → v1.3) — Added `data/*.js` files to directory structure; updated data layer section to describe dual-mode loading (globals + fetch fallback)
- `docs/RUNBOOK.MD` (v1.2 → v1.3) — Updated "Adding a Strategy" and "Adding a Glossary Entry" workflows to require updating both `.json` and `.js` files; updated "Local Dev" section; updated troubleshooting

---

## [1.0.2] - 2026-06-08

### Site Build — Vanilla HTML/CSS/JS MVP

Full site built from scratch as a zero-dependency vanilla web application. No build tooling required. Deployable directly to GitHub Pages.

#### Architecture Change

Switched from planned Astro 5.x build system to vanilla HTML/CSS/JS:
- **Removed:** `package.json`, `astro.config.mjs`, `tailwind.config.mjs`, `tsconfig.json`, `src/` directory
- **Rationale:** Eliminates Node.js installation requirement. The hosted site and all development workflows now have zero npm/build dependencies.
- **GitHub Actions:** Updated workflow uploads repository root directly — no build step required.

#### Files Created

**Core**
- `css/main.css` — Complete design system: CSS custom properties (design tokens), base reset, typography, nav, cards, metrics table, tags/badges, buttons, footer, prose, responsive grid layout
- `js/app.js` — Shared utilities loaded on every page: BASE URL detection, data loading (`loadStrategies()`, `loadGlossary()`), format helpers (`formatPct`, `formatLargePct`, `formatRatio`, `formatDate`, `formatBacktestDays`, `colorClass`), nav and footer rendering, card/table render helpers
- `favicon.svg` — CA monogram SVG icon
- `robots.txt`
- `.github/workflows/deploy.yml` — Simplified GitHub Actions deploy (no build step, uploads repo root)

**Data**
- `data/glossary.json` — All 8 glossary concepts in structured JSON format with sections, paragraphs, and optional tables
- `data/strategies.json` — (previously created) 12 real strategies, all fields from spreadsheet

**Pages**
- `index.html` — Home page: hero section, live stats bar (strategy count, best Sharpe, top ARR), 3-column strategy card grid loaded via JS
- `strategies/index.html` — Strategy listing page with full 3-column grid
- `strategies/detail/index.html` — Strategy detail: reads `?slug=` from URL, renders tags, how-it-works, signals, risk profile, full metrics table; sticky sidebar with other strategies list
- `glossary/index.html` — Glossary listing with concept cards sorted by category
- `glossary/detail/index.html` — Concept detail: renders all sections with prose formatting, optional formula box, tables; sidebar with related strategies and other concepts
- `about.html` — Static about page with disclaimers and tech stack info
- `404.html` — Custom 404 page

#### Documentation Updated

- `docs/TRD.MD` (v1.1 → v1.2) — Updated framework decision to vanilla HTML/CSS/JS, updated directory structure, data access patterns, page routes, deploy pipeline, removed Astro/Tailwind/TypeScript references
- `docs/RUNBOOK.MD` (v1.1 → v1.2) — Updated all commands to use Python HTTP server, updated strategy/glossary workflows to target JSON files directly, updated troubleshooting section for vanilla JS issues
- `.gitignore` — Removed Astro-specific entries (`node_modules/`, `dist/`, `.astro/`)

---

## [1.0.1] - 2026-06-08

### Documentation — Foundational Design Buildout

Major expansion of all project documentation to bring the design and technical foundation to a complete, actionable state. All framework and architecture decisions have been made and recorded. The project is now ready for code scaffolding.

#### TRD.MD (v1.0 → v1.1)
- **Framework decision made:** Astro 5.x selected as the static site generator
- **Styling decision made:** Tailwind CSS + CSS custom properties for design tokens
- **Language decision made:** TypeScript in strict mode
- Added complete directory structure for the Astro project
- Added TypeScript `Strategy` interface mirroring the METRICS.MD schema
- Added Astro Content Collections configuration for glossary Markdown files
- Added build-time data loading patterns (static JSON import via `getStaticPaths()`)
- Added full GitHub Actions deploy workflow (build + deploy jobs)
- Added Astro config with `site`, `base`, and integrations (`tailwind`, `sitemap`)
- Added Tailwind config with complete design token color palette
- Added SEO strategy: per-page meta, Open Graph tags, sitemap, robots.txt
- Added performance budget (Lighthouse targets, LCP, TBT, CLS, payload targets)
- Added future technical considerations table (search, charts, analytics, AdSense)

#### DESIGN.MD (v1.0 → v1.1)
- Added `--color-surface-raised`, `--color-border-hover`, `--color-text-disabled`, and muted color variants (`-muted` at 12% opacity) to the palette
- Added semantic color rules — explicit rules for when each color may and may not be used
- Added typography table with exact size, weight, and line-height per element level
- Added Google Fonts `<link>` loading code with `font-display: swap`
- Added responsive breakpoints table (base/sm/md/lg/xl/2xl)
- Added spacing scale (4px base unit, full token table)
- Added border-radius reference by context
- Added elevation system (flat/surface/raised via border rather than shadow)
- Added full page layout wireframes: Home, Strategy Detail, Glossary Index, Glossary Detail, About
- Added two-column body layout spec for Strategy Detail and Glossary Detail pages
- Added Navigation section: full desktop and mobile nav specs including drawer behavior
- Expanded all component specs (StrategyCard, StrategyCardCompact, MetricsTable, GlossaryTag, CTAButton, ConceptCard, Breadcrumb) with exact states (default/hover/focus/active), transitions, and color codes
- Added Loading States section with skeleton card shimmer spec
- Added Error States section (build-time failure behavior, 404 page requirement)
- Added Motion and Transitions table covering all interactive elements
- Added Accessibility section: contrast ratios, focus management, semantic HTML requirements, screen reader guidelines, WCAG 2.1 AA target
- Added `prefers-reduced-motion` CSS rule

#### METRICS.MD (v1.0 → v1.1)
- Added `slug` field to MVP schema (required — human-readable URL slug used as route param)
- Added Slug Convention section with derivation rules and examples
- Added Metric Calculation Notes for Calmar ratio, Sharpe ratio, standard deviation, and period returns
- Added Display Order section — defines the three-group order for MetricsTable rendering
- Added Tag Vocabulary section mapping tag strings to glossary slugs and concept names
- Updated Sample JSON Entry to include `slug` field
- Clarified `max_drawdown` is always negative; clarified `description` must not contain HTML

#### RUNBOOK.MD (v1.0 → v1.1)
- Updated all commands to Astro-specific (`npm run dev` → Astro dev server at `localhost:4321`)
- Added JSON validation command using Node.js
- Added Step 2 (slug generation) to the "Adding a New Strategy" workflow
- Added Step 5 (tag verification) to the "Adding a New Strategy" workflow
- Added strategy logic content step referencing `strategyContent.ts`
- Updated Glossary Entry workflow to reference Astro Content Collections
- Added Content Collection Error troubleshooting entry (Zod validation errors)
- Added local dev port conflict workaround
- Updated versioning convention table
- Removed references to placeholder `npm run validate` command

#### README.MD
- Updated Tech Stack section to reflect Astro, Tailwind CSS, TypeScript, Content Collections, GitHub Actions
- Updated Repo Structure to the full Astro directory layout
- Added Local Development section with commands
- Added Documentation table with links to all docs files
- Added Disclaimer section
- Added `GLOSSARY-SCHEMA.MD` to docs file list

### Added
- `docs/GLOSSARY-SCHEMA.MD` — new document defining the full structure for glossary Markdown entries
  - Frontmatter schema with Zod-compatible field definitions
  - Category value table with display labels and color assignments
  - Required and optional body section specifications with per-section checklists
  - Full example entry (RSI) demonstrating every section
  - Pre-commit checklist for new glossary entries
  - Canonical glossary entry tracker table (8 MVP entries, all Planned)

---

## [1.0.0] - 2026-06-08

### Added
- Initial project scaffold and documentation suite
- README.MD, PRD.MD, TRD.MD, DESIGN.MD, METRICS.MD
- ROADMAP.MD, PATCHNOTES.MD, PRFAQ.MD, TENETS.MD, SECURITY.MD, RUNBOOK.MD
- Defined MVP scope: 10 strategy pages, concept glossary, static JSON data layer
- Defined design system: dark mode, Composer.trade-inspired color palette
- Defined strategy metrics schema (17 core fields + extended schema for future use)

### Status
- Pre-launch: development begins with Claude Code
