# Composer Atlas: Design System

**Version:** 1.11
**Status:** Active
**Last Updated:** 2026-08-24

All values in this document are derived from `css/main.css` and `js/app.js`: the source files are the
ground truth. Where this document and the CSS disagree, the CSS wins and the disagreement is marked
inline as a **Discrepancy** rather than quietly overwritten, so the author can decide which side was
the mistake. See PRD.md Section 24, "Documentation Versus Reality", for the full register.

**Scope, stated plainly.** This document covers the shared design system in `css/main.css`, which is
what every page loads. It does **not** yet cover the three tool pages that carry their own inline
`<style>` blocks on top of it. See Section 10, "Undocumented Surfaces", for what those are and why
they are called out rather than left silently missing.

---

## 1. Design Philosophy

Composer Atlas uses a dark, editorial visual language inspired by Composer.trade's interface. It pairs the energy and color vocabulary of Composer with the structured, wiki-style readability of a reference document. The result is a site that feels authoritative and trustworthy without being sterile.

Every visual decision serves the user's ability to understand information. Color is used semantically. Typography is used for hierarchy. Whitespace is not wasted. Nothing is decorative for its own sake.

---

## 2. Color Palette

All colors are defined as CSS custom properties in the `:root` block of `css/main.css`.

### CSS Custom Properties

| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#0d0d0d` | Page background (`body` background) |
| `--color-surface` | `#141414` | Card and panel background |
| `--color-surface-raised` | `#1a1a1a` | Elevated surface; hover state background; nav active state |
| `--color-border` | `#1f1f1f` | Default borders and dividers |
| `--color-border-hover` | `#2e2e2e` | Border color on hover |
| `--color-primary` | `#f0f0f0` | Body text, headings, primary content |
| `--color-secondary` | `#b0b0b0` | Labels, captions, metadata, muted text, `<p>` elements |
| `--color-disabled` | `#444444` | Disabled states, breadcrumb separators, metric labels |

> **Discrepancy (found 2026-08-24).** The row above is the original text and is kept as written. The
> observed value in `css/main.css` is **`#c0c0c0`**, not `#444444`. The evidence says the code is
> right and this table went stale: PATCHNOTES v1.5.4 (2026-06-15), "Fix: Improve disabled text
> legibility", records the change from `#444444` to `#c0c0c0` as deliberate, made because `#444444`
> was illegible on `#0d0d0d`. Trust `css/main.css`.
>
> A second-order note for the author, not a change made here: at `#c0c0c0` the token is a *light*
> grey, so the name `--color-disabled` now reads backwards and the usage column above ("disabled
> states") describes an intent the value no longer serves. Renaming it is a real refactor across
> every page, so it is flagged, not done.
| `--color-green` | `#00e676` | Positive returns, CTAs, active nav, highlights, "View Strategy" links |
| `--color-pink` | `#ff4d8d` | Negative returns, max drawdown, warning states |
| `--color-blue` | `#4d9fff` | Links, interactive element hover borders, focus rings, "Built by" link |
| `--color-yellow` | `#f5c518` | Neutral caution indicators, mean/median return values |
| `--color-purple` | `#a78bfa` | Momentum tag, strategy-concept badge |

### Inline rgba() Values (Not Named Properties)

The following color variants appear as inline `rgba()` values in `css/main.css` and are not defined as named CSS custom properties:

| Usage | Value |
|---|---|
| Tag background: RSI, 200d-MA | `rgba(77, 159, 255, 0.08)` |
| Tag border: RSI, 200d-MA | `rgba(77, 159, 255, 0.25)` |
| Tag background: momentum | `rgba(167, 139, 250, 0.08)` |
| Tag border: momentum | `rgba(167, 139, 250, 0.25)` |
| Tag background: vix-tiers | `rgba(245, 197, 24, 0.08)` |
| Tag border: vix-tiers | `rgba(245, 197, 24, 0.25)` |
| Tag background: leveraged-etfs | `rgba(255, 77, 141, 0.08)` |
| Tag border: leveraged-etfs | `rgba(255, 77, 141, 0.25)` |
| Tag background: sharpe/calmar/max-drawdown | `rgba(0, 230, 118, 0.08)` |
| Tag border: sharpe/calmar/max-drawdown | `rgba(0, 230, 118, 0.25)` |
| Badge background: indicator | `rgba(77, 159, 255, 0.1)` |
| Badge border: indicator | `rgba(77, 159, 255, 0.2)` |
| Badge background: risk-metric | `rgba(255, 77, 141, 0.1)` |
| Badge border: risk-metric | `rgba(255, 77, 141, 0.2)` |
| Badge background: asset-class | `rgba(245, 197, 24, 0.1)` |
| Badge border: asset-class | `rgba(245, 197, 24, 0.2)` |
| Badge background: strategy-concept | `rgba(167, 139, 250, 0.1)` |
| Badge border: strategy-concept | `rgba(167, 139, 250, 0.2)` |
| Inline code background | `rgba(0, 230, 118, 0.08)` |
| Nav background | `rgba(13, 13, 13, 0.95)` |

### Semantic Color Rules

- **Green**: used exclusively for positive values and primary CTAs. Never decorative.
- **Pink**: used exclusively for negative values (drawdown, losses). Never decorative.
- **Purple**: reserved for momentum tags and strategy-concept glossary badges.
- **Blue**: reserved for interactive states (links, focus rings, hover borders). Not used for data values.
- **Yellow**: used for neutral/caution indicators (mean period return, median period return).

### Contrast Ratios (WCAG AA)

| Foreground | Background | Ratio |
|---|---|---|
| `#f0f0f0` (primary) | `#0d0d0d` (bg) | ~15:1 |
| `#b0b0b0` (secondary) | `#0d0d0d` (bg) | ~9.4:1 |
| `#00e676` (green) | `#0d0d0d` (bg) | ~8.4:1 |
| `#c0c0c0` (disabled, observed) | `#0d0d0d` (bg) | ~11:1 |
| `#ff4d8d` (pink) | `#0d0d0d` (bg) | ~4.6:1 (minimum) |
| `#0d0d0d` (bg) | `#00e676` (CTA button) | ~15:1 |

---

## 3. Typography

### Font Families

Defined in `:root` in `css/main.css` and loaded via Google Fonts:

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

Google Fonts import (in `css/main.css`):
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
```

- **Inter**: body text, UI labels, headings, nav links
- **JetBrains Mono**: metric values, strategy IDs, code blocks, `font-mono` utility class

### Type Scale (from css/main.css)

| Element | CSS Rule | Size | Weight | Line Height |
|---|---|---|---|---|
| `h1` | `h1` | `2rem` (32px) | `700` | `1.2` |
| `h2` | `h2` | `1.375rem` (22px) | `700` | `1.3` |
| `h3` | `h3` | `1.125rem` (18px) | `600` | `1.4` |
| `h4` | `h4` | `0.9375rem` (15px) | `600` | n/a |
| Body | `body` | `0.9375rem` (15px) | `400` | `1.6` |
| Hero title | `.hero-title` | `clamp(1.75rem, 4vw, 3rem)` | `700` | `1.15` |
| Hero description | `.hero-desc` | `1.0625rem` (17px) | `400` | `1.7` |
| Card title | `.card-title` | `0.9375rem` (15px) | `600` | `1.4` |
| Card description | `.card-desc` | `0.875rem` (14px) | `400` | `1.6` |
| Metric value (card) | `.card-metric-value` | `0.875rem` (14px) | `500` | n/a |
| Metrics row label | `.metrics-row dt` | `0.875rem` (14px) | (inherited) | n/a |
| Metrics row value | `.metrics-row dd` | `0.875rem` (14px) | `500` (mono) | n/a |
| Label / eyebrow | `.label`, `.card-metric-label` | `0.6875rem` (11px) | `500` | n/a |
| Tag / badge | `.tag`, `.badge` | `0.75rem` (12px) | `500` | n/a |
| Nav link | `.nav-link` | `0.875rem` (14px) | (inherited) | n/a |
| Mobile nav link | `.mobile-nav-link` | `0.9375rem` (15px) | (inherited) | n/a |
| Footer link | `.footer-links a` | `0.8rem` (12.8px) | (inherited) | n/a |
| Footer legal | `.footer-legal` | `0.75rem` (12px) | (inherited) | `1.6` |
| Footer copy | `.footer-copy` | `0.75rem` (12px) | (inherited) | n/a |
| Prose body | `.prose p` | `0.9375rem` (15px) | (inherited) | `1.7` |
| Prose heading | `.prose h2` | `1.125rem` (18px) | `700` | n/a |
| Stat value | `.stat-value` | `1.5rem` (24px) | `700` (mono) | `1` |
| Stat label | `.stat-label` | `0.75rem` (12px) | (inherited) | n/a |

### Color of Text by Context

- Default `<p>` elements: `color: var(--color-secondary)` (set globally in CSS)
- Headings (`h1`–`h4`): inherit `--color-primary` from body, or set explicitly
- `.text-primary` class: `--color-primary`
- `.text-secondary` class: `--color-secondary`
- `.text-disabled` class: `--color-disabled`

---

## 4. Spacing System

**Base unit: 4px.** All spacing values in the codebase are multiples of 4.

### Named CSS Custom Properties

| Token | Value | Usage |
|---|---|---|
| `--nav-height` | `56px` | Fixed nav bar height; `padding-top` on `.page` |
| `--page-px` | `24px` | Horizontal page padding in `.container` and `.nav-inner` |
| `--max-width` | `1280px` | Maximum content width |

### Utility Classes (from css/main.css)

| Class | Value |
|---|---|
| `.py-12` | `padding-top: 48px; padding-bottom: 48px` |
| `.mt-8` | `margin-top: 32px` |
| `.mb-4` | `margin-bottom: 16px` |
| `.mb-6` | `margin-bottom: 24px` |
| `.mb-8` | `margin-bottom: 32px` |
| `.mb-10` | `margin-bottom: 40px` |

### Common Spacing Values in Use

| Value | Context |
|---|---|
| `2px` | Tag padding vertical |
| `4px` | Icon-text gap, breadcrumb gap |
| `5px` | Nav hamburger bar gap, `.btn-sm` vertical padding |
| `6px` | Tag padding horizontal, card-tags gap, breadcrumb gap |
| `8px` | Card tags gap, nav logo gap, metrics section label margin |
| `10px` | Metrics row padding vertical |
| `12px` | Card footer gap, signal header gap, `.btn-sm` horizontal padding |
| `16px` | Card padding, metrics row padding horizontal, section header margin, footer link gap |
| `20px` | Card padding (`.card { padding: 20px }`), metrics section margin |
| `24px` | Page horizontal padding (`--page-px`), section header margin, breadcrumb margin |
| `28px` | Prose h2 margin-top |
| `32px` | Sidebar gap, `.mt-8` |
| `40px` | Grid-2 gap, about-content h2 margin-top |
| `48px` | Hero bottom padding, `.py-12` |
| `56px` | Nav height (`--nav-height`) |
| `64px` | Hero top padding |

---

## 5. Border Radius

Defined as CSS custom properties in `css/main.css`:

| Token | Value | Used On |
|---|---|---|
| `--radius-sm` | `4px` | Tags, badges, tooltip-style elements, hamburger bar border-radius |
| `--radius-md` | `8px` | Buttons, nav links, mobile nav links, metrics table, signal cards, risk box, formula box, compact list |
| `--radius-lg` | `12px` | Cards (`.card`) |

---

## 6. Breakpoints

Mobile-first. Base styles target the smallest viewport; media queries add complexity at larger sizes.

| Min Width | Applied To | What Changes |
|---|---|---|
| `0px` (base) | All elements | Single-column layout; mobile nav visible; hamburger shown |
| `480px` | `.nav-logo-text` | Site name text appears next to 🗺️ emoji in nav |
| `640px` | `.grid-3` | Strategy/glossary card grid changes from 1-column to 2-column |
| `768px` | `.nav-links`, `.nav-cta`, `.nav-hamburger` | Desktop nav links appear; hamburger hides; nav CTA appears |
| `1024px` | `.grid-3`, `.grid-2`, `.detail-sidebar-sticky` | Grid-3 goes to 3-column; Grid-2 (detail layout) goes to `2fr 1fr`; sidebar becomes sticky |

**One max-width query also exists**, and it is the only rule in the stylesheet that runs the other
direction:

| Max Width | Applied To | What Changes |
|---|---|---|
| `640px` | `.tagfilter-label` | The tag-filter bar's label takes `flex-basis: 100%`, dropping the filter chips onto their own row below it (`css/main.css:657`) |

**Narrow-screen hardening (v1.16.7).** `body` carries `overflow-x: clip` and `overflow-wrap:
break-word`. This is not a breakpoint but it governs behaviour below roughly 390px: it stops a stray
overflowing child from letting the whole page scroll sideways and clipping the fixed nav. `clip` is
used rather than `hidden` deliberately, because `hidden` would make `<body>` a scroll container and
break `position: sticky` and `position: fixed` inside it.

**Max content width:** `1280px` (`--max-width`), centered via `.container { max-width: var(--max-width); margin: 0 auto; padding: 0 var(--page-px); }`.

---

## 7. Component Patterns

### Navigation

**Desktop nav (768px+):**

- Fixed to top of viewport; `z-index: 100`; height: `56px` (`--nav-height`)
- Background: `rgba(13, 13, 13, 0.95)` with `backdrop-filter: blur(8px)` and `border-bottom: 1px solid var(--color-border)`
- Logo: 🗺️ emoji (`font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji'`, `font-size: 1.25rem`) + "Composer Atlas" text (hidden below 480px)
- Logo hover: transitions to `--color-green` in 150ms
- Nav links: `--color-secondary` default; `--color-primary` + `bg-surface` on active/hover; 150ms transition
- "Open Composer ↗" button: `.btn-outline-green`: green border, green text; switches to green bg on hover
- Active route detection: `isActive()` function in `renderNav()` in `js/app.js`

**Mobile nav (< 768px):**

- Hamburger button: `36x36px`, `border-radius: --radius-md`; three `1.5px` bars
- Hamburger animates to X when open: bar 1 → `translateY(6.5px) rotate(45deg)`, bar 2 → `opacity: 0`, bar 3 → `translateY(-6.5px) rotate(-45deg)`
- `aria-expanded` attribute drives animation via CSS
- Mobile menu: `.nav-mobile` with class `.open` toggled by JS event listener on `#nav-toggle`
- Mobile menu panel: `background: --color-bg`, `border-top: 1px solid --color-border`, `padding: 12px 16px 16px`, `flex-direction: column`, `gap: 2px`
- Mobile nav links: `0.9375rem`, `padding: 10px 12px`, full-width tap targets

**Nav rendered by:** `renderNav()` in `js/app.js` into `<nav id="nav-root">`.

---

### Buttons

All buttons use `.btn` base class.

| Variant | Class | Background | Text | Border | Hover |
|---|---|---|---|---|---|
| Green filled | `.btn-green` | `--color-green` | `--color-bg` | Transparent | `opacity: 0.9` |
| Outline (default) | `.btn-outline` | Transparent | `--color-primary` | `--color-border` | Border → `--color-border-hover`, bg → surface |
| Outline green | `.btn-outline-green` | Transparent | `--color-green` | `--color-green` | bg → green, text → bg |

| Size | Class | Padding | Font Size |
|---|---|---|---|
| Default | `.btn` | `8px 16px` | `0.875rem` (14px) |
| Small | `.btn-sm` | `5px 12px` | `0.8125rem` (13px) |
| Large | `.btn-lg` | `11px 22px` | `0.9375rem` (15px) |
| Nav CTA | `.btn-outline-green` (override) | `5px 12px` | `0.8125rem` (13px) |

Transition: `opacity 0.15s, background 0.15s, color 0.15s, border-color 0.15s`

All external links use `target="_blank" rel="noopener noreferrer"`.

---

### Strategy Card

Used on the home page strategy grid (`renderStrategyCard()` in `js/app.js`).

```html
<article class="card">
  <h2 class="card-title"><a href="...">Strategy Name</a></h2>
  <p class="card-desc">Short description (3-line clamp)</p>
  <div class="card-metrics">  <!-- 3-column grid -->
    ARR / Max DD / Sharpe
  </div>
  <div class="card-tags"><!-- tag pills --></div>
  <div class="card-footer">
    <a href="..." class="btn btn-sm" style="color:var(--color-green)">View Strategy →</a>
  </div>
</article>
```

**States:**
- Default: `background: --color-surface`, `border: 1px solid --color-border`, `border-radius: --radius-lg (12px)`, `padding: 20px`
- Hover: `border-color: --color-border-hover`; card title color → `--color-green`
- Transition: `border-color 0.15s`

**Card metrics grid:** `grid-template-columns: repeat(3, 1fr)`, `gap: 12px`
- Metric label: `0.6875rem`, `500`, uppercase, `letter-spacing: 0.08em`, `--color-disabled`
- Metric value: `--font-mono`, `0.875rem`, `500`, color-coded (see Section 12 display guidelines)

**Card description:** `-webkit-line-clamp: 3`

---

### StrategyCardCompact

Slim variant used in glossary page sidebars (`renderStrategyListItem()` in `js/app.js`). Single row: strategy name + ARR.

```html
<a href="..." class="strategy-list-item">
  <span>Strategy Name</span>
  <span class="arr text-green">+31.20%</span>
</a>
```

Container: `.strategy-list-compact`: `border: 1px solid --color-border`, `border-radius: --radius-md`, `overflow: hidden`

Row: `.strategy-list-item`: `display: flex`, `justify-content: space-between`, `padding: 10px 12px`, `font-size: 0.875rem`, `--color-secondary`

Hover: `background: --color-surface-raised`, color → `--color-primary`; transition: `background 0.15s`

---

### Concept Card (Glossary)

Used on the glossary index (`renderConceptCard()` in `js/app.js`).

Same `.card` base structure. Contains: category badge + strategy count row, card title (concept name), description (2-line clamp), "Learn more →" link.

Category badge colors: blue (indicator), pink (risk-metric), yellow (asset-class), purple (strategy-concept). See Section 2 for rgba values.

---

### Metrics Table

Used on strategy detail pages (`renderMetricsTable()` in `js/app.js`).

Structure: grouped `<div class="metrics-section">` blocks, each with a section label and a `<dl class="metrics-table">` containing `<div class="metrics-row">` items.

```css
.metrics-table {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.metrics-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-border);
}
```

- `<dt>` (label): `0.875rem`, `--color-secondary`
- `<dd>` (value): `--font-mono`, `0.875rem`, `500`, color-coded

Groups: Returns, Risk, Risk-Adjusted, Monthly Distribution, Trailing Returns, Metadata.

---

### Tags (GlossaryTag Pills)

Rendered by `renderTag(slug)` in `js/app.js` as `<a href="/glossary.html?slug=...">` links.

```css
.tag {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 4px;  /* --radius-sm */
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid;
  transition: opacity 0.15s;
}
.tag:hover { opacity: 0.8; }
```

Tag color assignments (from `TAG_CLASSES` in `js/app.js`):

| Slug | CSS Class | Color |
|---|---|---|
| `rsi`, `200d-ma` | `.tag-rsi`, `.tag-200d-ma` | Blue |
| `momentum` | `.tag-momentum` | Purple |
| `vix-tiers` | `.tag-vix-tiers` | Yellow |
| `leveraged-etfs` | `.tag-leveraged-etfs` | Pink |
| `sharpe-ratio`, `calmar-ratio`, `max-drawdown` | `.tag-sharpe-ratio`, etc. | Green |
| `zoop` | `.tag-zoop` | Orange |
| `original` | `.tag-original` | Neutral gray |
| Unknown | `.tag-default` | Surface-raised + secondary |

---

### Category Badges (ConceptCard)

Used on glossary index and detail pages.

```css
.badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid;
}
```

| Category | Class | Color |
|---|---|---|
| `indicator` | `.badge-indicator` | Blue |
| `risk-metric` | `.badge-risk-metric` | Pink |
| `asset-class` | `.badge-asset-class` | Yellow |
| `strategy-concept` | `.badge-strategy-concept` | Purple |

---

### Signal Cards

Used on strategy detail pages to list signals used by the strategy.

```css
.signal-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 8px;
}
.signal-name { font-family: var(--font-mono); font-size: 0.875rem; font-weight: 600; }
.signal-desc { font-size: 0.875rem; color: var(--color-secondary); line-height: 1.6; }
```

Header row: `.signal-header`: `display: flex`, `align-items: center`, `gap: 10px`, `margin-bottom: 8px`. Contains: signal name + a tag pill linking to the related glossary concept.

---

### AI Summary Box

Used at the top of strategy detail pages, directly above the "How It Works" section, to present the Claude-authored `ai_summary` analysis. A purple accent distinguishes it as machine-generated commentary rather than first-party editorial copy.

```css
.ai-summary {
  background: linear-gradient(180deg, rgba(167, 139, 250, 0.06), rgba(167, 139, 250, 0.02));
  border: 1px solid rgba(167, 139, 250, 0.25);
  border-radius: var(--radius-lg);
  padding: 20px 22px;
}
.ai-summary-mark { width: 26px; height: 26px; border-radius: var(--radius-sm); background: rgba(167, 139, 250, 0.12); color: var(--color-purple); }
.ai-summary-title { font-size: 1.125rem; font-weight: 700; color: var(--color-primary); }
.ai-summary-p { font-size: 0.9375rem; color: var(--color-secondary); line-height: 1.75; }
```

Header row: `.ai-summary-header` with `display: flex`, `align-items: center`, `gap: 10px`. Contains a `✦` mark in `.ai-summary-mark` plus the `AI Summary` title. Each `ai_summary` paragraph renders as a `.ai-summary-p`.

---

### Risk Profile Box

```css
.risk-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
  font-size: 0.875rem;
  color: var(--color-secondary);
  line-height: 1.7;
}
```

---

### Formula Box

Used on glossary detail pages when a concept has a formula.

```css
.formula-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-top: 16px;
}
.formula-label { font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; color: var(--color-disabled); margin-bottom: 6px; }
.formula-value { font-family: var(--font-mono); font-size: 0.875rem; color: var(--color-green); }
```

---

### Breadcrumb

```css
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: var(--color-secondary);
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.breadcrumb-sep { color: var(--color-disabled); }
.breadcrumb a { color: var(--color-secondary); transition: color 0.15s; }
.breadcrumb a:hover { color: var(--color-primary); }
.breadcrumb .current { color: var(--color-primary); }
```

Rendered by `renderBreadcrumb(containerId, crumbs)` in `js/app.js`. Wrapped in `<nav aria-label="Breadcrumb">`.

---

### Footer

Rendered by `renderFooter()` in `js/app.js` into `<footer id="footer-root">`.

```css
footer {
  border-top: 1px solid var(--color-border);
  background: var(--color-bg);
  padding: 2rem;
  text-align: center;
}
.footer-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; margin-bottom: 1rem; }
.footer-links a { font-size: 0.8rem; color: var(--color-secondary); transition: color 0.15s; }
.footer-links a:hover { color: var(--color-primary); }
.footer-legal { font-size: 0.75rem; color: var(--color-secondary); line-height: 1.6; max-width: 560px; margin: 0 auto 0.5rem; }
.footer-copy { font-size: 0.75rem; color: var(--color-secondary); }
.footer-copy a { color: var(--color-blue); }
.footer-copy a:hover { color: var(--color-primary); }
```

Three stacked elements: links row, legal disclaimer, copyright + "Built by Azqato".

---

### Tabs (Database Page)

Used on `database.html` to switch between All Strategies, Leaderboard, and Screener views (`renderNav()`-adjacent inline script in `database.html`).

```css
.db-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--color-border); margin-bottom: 24px; }
.db-tab {
  background: none; border: none; border-bottom: 2px solid transparent;
  color: var(--color-secondary); font-size: 0.9375rem; font-weight: 500;
  padding: 10px 16px; cursor: pointer; transition: color 0.15s, border-color 0.15s;
}
.db-tab:hover { color: var(--color-primary); }
.db-tab.active { color: var(--color-primary); border-bottom-color: var(--color-green); }
.db-tab-panel[hidden] { display: none; }
```

Markup: a `role="tablist"` container of `button[role="tab"]` elements, each with a `data-tab` attribute matching a sibling `.db-tab-panel[role="tabpanel"]` id. JS toggles `.active` and `aria-selected` on the clicked tab and `hidden` on the corresponding panels; no page navigation occurs on tab switch.

**Coming-soon panel:** an unbuilt tab (e.g. Leaderboard, Screener) renders the existing `.empty-state` pattern with `.empty-eyebrow` reading "Coming Soon" instead of building a placeholder from scratch.

---

### Data Table (Database Page)

Used on `database.html`'s All Strategies tab to render the full raw symphony database (thousands of rows) without the card-grid layout used elsewhere on the site.

```css
.db-table-wrap { overflow-x: auto; border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.db-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; white-space: nowrap; }
.db-table th {
  text-align: left; padding: 10px 16px; background: var(--color-surface-raised);
  color: var(--color-disabled); font-size: 0.6875rem; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid var(--color-border);
}
.db-table td { padding: 10px 16px; color: var(--color-primary); font-family: var(--font-mono); border-bottom: 1px solid var(--color-border); }
.db-table td:first-child { font-family: var(--font-sans); white-space: normal; max-width: 360px; }
.db-pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 20px; }
```

**Why a table instead of cards:** at full-database scale (~6,500 rows), the card grid used for the curated strategy library (31 entries as of 2026-08-24) does not scale; a dense table with client-side pagination (50 rows/page) keeps the DOM light while still fitting the site's existing color-coded metric conventions (Section 12/PRD.md Metric Display Guidelines apply identically here: green positive, pink negative).

**Resolved (V1.16, Performance Fix):** the table loads `data/database_summary.json` (a columnar, float-rounded derivative of the full `database.json`, ~2.3MB vs. ~11.5MB, ~540KB gzipped), not the full file. Note the site's `<500KB` target (Section 13) is scoped to the homepage specifically; it never literally bound this page, an earlier version of this note over-generalized it. See PRD.md Section 14, V1.16 for the full before/after and what actually drove the size down (columnar layout beat dropping fields alone by a wide margin).

---

### Filter Panel (database.html, V1.11)

Shared component reused by both the All Strategies tab and the Screener tab (V1.12), each gets its own independent filter state (`createFilterController()` instance), but both use the same field list and match logic.

```css
.filter-panel { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 16px; margin-bottom: 16px; }
.filter-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.filter-row select, .filter-row input { background: var(--color-surface-raised); border: 1px solid var(--color-border); color: var(--color-primary); border-radius: var(--radius-sm); padding: 6px 8px; font-size: 0.8125rem; }
.filter-remove { background: none; border: none; color: var(--color-pink); cursor: pointer; }
```

A "Filter" button sits directly above each tab's result-count line. Clicking it toggles a panel below the toolbar: an empty state ("No filters applied") until at least one row exists, each row a field-picker + operator dropdown + value input + delete icon, an "Add filter" button to stack more rows (AND logic between them), and Cancel/Apply. Apply closes the panel and re-filters the table in place; Cancel discards unsaved edits back to the last-applied state. Field list is restricted to real fields in `database_summary.json` (see PRD.md Section 12), never fabricated columns.

### Tier Badge (Leaderboard, database.html, V1.13)

```css
.tier-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 28px; padding: 2px 8px; border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; border: 1px solid; }
.tier-sp { color: var(--color-green); background: rgba(0, 230, 118, 0.14); border-color: rgba(0, 230, 118, 0.35); }
.tier-s  { color: var(--color-green); background: rgba(0, 230, 118, 0.08); border-color: rgba(0, 230, 118, 0.25); }
.tier-a  { color: var(--color-blue); background: rgba(77, 159, 255, 0.08); border-color: rgba(77, 159, 255, 0.25); }
.tier-b  { color: var(--color-yellow); background: rgba(245, 197, 24, 0.08); border-color: rgba(245, 197, 24, 0.25); }
.tier-c  { color: var(--color-secondary); background: var(--color-surface-raised); border-color: var(--color-border); }
.tier-f  { color: var(--color-pink); background: rgba(255, 77, 141, 0.08); border-color: rgba(255, 77, 141, 0.25); }
```

Six tiers (S+, S, A, B, C, F), color intensity roughly tracking favorability: S+/S green, A blue, B yellow, C neutral/secondary, F pink. S+ is visually distinguished from S by a stronger background/border opacity rather than a different hue, since both represent "top tier," S+ is just the perfect-score special case.

---

### RSI Signal Colors (rsi.html, shipped V2.1)

```css
.db-table td.rsi-extreme-oversold   { color: #ff0000; font-weight: 700; }
.db-table td.rsi-oversold           { color: #e04545; }
.db-table td.rsi-neutral            { color: #b0b0b0; }
.db-table td.rsi-overbought         { color: #2fb92f; }
.db-table td.rsi-extreme-overbought { color: #00ff00; font-weight: 700; }
```

Five tiers, thresholds ≥79 / 70–78 / 42–69 / 29–41 / ≤28 (see PRD.md Section 14, V2.1; the section comment in `css/main.css:1634` says V2.2, which is a
stale label on the code side, not a second palette). These are **literal hex values, not the
standard token palette**, a deliberate exception. The user specified a green (oversold, "buy the dip") → red (overbought) gradient for this page rather than the site's usual green-good/pink-bad convention (`--color-green`/`--color-pink`), so the colors are hardcoded rather than aliased to tokens that carry a different semantic elsewhere on the site. Both extreme tiers are bold; the three inner tiers are not. The user's original inner-tier values (`#890000` / `#008900`) were too low-contrast against the dark table background (`--color-surface` `#141414`) to read at all; brightened to `#e04545` / `#2fb92f` while keeping the bright `#ff0000`/`#00ff00` extremes unchanged.

**Selector specificity note:** these rules must be scoped as `.db-table td.rsi-x`, not a bare `.rsi-x` class. `.db-table td` (class+type, specificity 0,1,1) otherwise wins over a bare single-class selector (0,1,0) regardless of source order, which silently prevented any of these colors from rendering until this was caught and fixed.

---

### Stats Bar (Homepage)

```css
.stats-bar {
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  padding: 16px 0;
}
.stats-inner { display: flex; flex-wrap: wrap; gap: 32px; }
.stat-value { font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700; color: var(--color-primary); line-height: 1; }
.stat-label { font-size: 0.75rem; color: var(--color-disabled); margin-top: 4px; }
```

Stat values use `--color-primary` (not `--color-green`), consistent white for all five stats.

Five stats (left to right): Strategies, Best Sharpe, Top ARR, Concepts, Longest Backtest. The Longest Backtest stat reads the max `backtest_days` across all strategies and displays it as `~X.X years` (e.g. `~15.2 years`). The strategy grid on the homepage is sorted by `backtest_days` descending (longest first).

---

### Hero Section (Homepage)

```css
.hero { padding: 64px 0 48px; }
.hero-eyebrow { font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-green); margin-bottom: 12px; }
.hero-title { font-size: clamp(1.75rem, 4vw, 3rem); font-weight: 700; line-height: 1.15; color: var(--color-primary); margin-bottom: 16px; max-width: 600px; }
.hero-desc { font-size: 1.0625rem; color: var(--color-secondary); line-height: 1.7; max-width: 540px; margin-bottom: 32px; }
```

---

### Grid Layouts

`.grid-3`: strategy/glossary index cards:
- Base: `grid-template-columns: 1fr`
- 640px+: `repeat(2, 1fr)`
- 1024px+: `repeat(3, 1fr)`
- `gap: 16px`

`.grid-2`: strategy/glossary detail two-column layout:
- Base: `grid-template-columns: 1fr`, `gap: 40px`
- 1024px+: `grid-template-columns: 2fr 1fr`

`.detail-sidebar`: `display: flex; flex-direction: column; gap: 32px`

`.detail-sidebar-sticky` (1024px+); `position: sticky; top: calc(var(--nav-height) + 20px)`

---

### Prose (Glossary Content)

Long-form text sections use `.prose` wrapper.

```css
.prose h2 { font-size: 1.125rem; font-weight: 700; color: var(--color-primary); margin: 28px 0 12px; }
.prose p { font-size: 0.9375rem; color: var(--color-secondary); line-height: 1.7; margin-bottom: 14px; }
.prose strong { color: var(--color-primary); font-weight: 600; }
.prose code { font-family: var(--font-mono); font-size: 0.875em; color: var(--color-green); background: rgba(0,230,118,0.08); padding: 1px 5px; border-radius: 3px; }
.prose pre { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 16px; font-family: var(--font-mono); font-size: 0.8125rem; color: var(--color-primary); line-height: 1.6; }
.prose table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.prose th { padding: 8px 12px; background: var(--color-surface-raised); color: var(--color-primary); font-weight: 600; border-bottom: 1px solid var(--color-border); }
.prose td { padding: 8px 12px; color: var(--color-secondary); border-bottom: 1px solid var(--color-border); }
.prose ul { list-style: disc; padding-left: 20px; margin-bottom: 14px; }
.prose li { color: var(--color-secondary); font-size: 0.9375rem; line-height: 1.7; margin-bottom: 6px; }
```

---

### Loading State

Shown while data loads from JSON (before `loadStrategies()` / `loadGlossary()` resolve):

```css
.loading { display: flex; align-items: center; justify-content: center; min-height: 400px; }
.spinner { width: 32px; height: 32px; border: 2px solid var(--color-border); border-top-color: var(--color-green); border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
```

---

### Error State

Shown when JSON parse fails:

```css
.error-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; gap: 12px; }
.error-state h2 { color: var(--color-primary); }
.error-state p { color: var(--color-secondary); }
```

---

### Empty / 404 State

```css
.empty-state { display: flex; flex-direction: column; align-items: center; min-height: 50vh; text-align: center; gap: 16px; padding: 48px 24px; }
.empty-eyebrow { font-family: var(--font-mono); font-size: 0.875rem; font-weight: 700; color: var(--color-green); text-transform: uppercase; letter-spacing: 0.1em; }
.empty-title { font-size: 2rem; font-weight: 700; color: var(--color-primary); }
.empty-desc { max-width: 380px; }
```

The custom `404.html` uses this pattern. Both hosts serve it automatically for unmatched routes:
Cloudflare Pages (the canonical host, `composeratlas.com`) and GitHub Pages
(`azqato.github.io/composer/`). See PRD.md Section 10 for the two-host arrangement.

---

### Explore / Step Cards (Homepage)

Two small modifiers layered on the standard `.card` base, used by the homepage's "Everything on this
site" grid and its numbered how-it-works row. There is no `.explore-card` or `.step-card` class: the
card itself is a plain `.card`, and only the ornament is styled.

```css
.explore-icon { font-size: 1.5rem; margin-bottom: 12px; }   /* the emoji at the top of a card */
.step-num {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--color-green); color: var(--color-bg);
  font-family: var(--font-mono); font-weight: 700; font-size: 0.8125rem;
  margin-bottom: 12px; flex-shrink: 0;
}
```

`.step-num` is the one place in the system where green is used as a **fill behind text** rather than
as the text colour, which is why it inverts to `--color-bg` for legibility.

---

### Tag Filter Bar (strategies.html, V1.17)

The filter panel above the strategy index. Reuses the `.tag` pills from the cards below it rather
than inventing a second chip style, so a filter chip and the tag it filters on are visibly the same
object.

```css
.tagfilter { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 16px 18px; margin-bottom: 32px; }
.tagfilter-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.tagfilter-title { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-disabled); }
.tagfilter-group { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px; padding: 6px 0; }
.tagfilter-group + .tagfilter-group { border-top: 1px solid var(--color-border); }
.tagfilter-label { flex: 0 0 88px; font-size: 0.75rem; color: var(--color-disabled); }
.tagfilter-tags { display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; }
.tagfilter-tag { opacity: 0.62; font: inherit; font-size: 0.75rem; font-weight: 500; }
.tagfilter-tag:hover { opacity: 0.85; }
.tagfilter-tag.active { opacity: 1; box-shadow: 0 0 0 1px currentColor inset; }
.tagfilter-count { margin-left: 5px; opacity: 0.7; font-size: 0.6875rem; }
```

**Selection is expressed by opacity plus an inset ring, not by a different colour.** An inactive chip
sits at `opacity: 0.62` and an active one at `1` with a `currentColor` inset ring, so each chip keeps
its own semantic tag colour in both states. This is deliberate: recolouring a chip on selection would
break the Section 2 rule that a tag's colour identifies its concept.

**Accessibility caveat, recorded rather than fixed:** opacity plus a one-pixel ring is a weak
distinction on its own, and the ring is the part carrying the state for anyone who cannot separate
the two opacity levels. Worth revisiting if the bar grows.

Below `640px` the label takes a full row (see Breakpoints above) so the chips are not squeezed into
the remaining 88px-offset column.

---

### Database Toolbar (database.html)

The header row above each database table: heading, live result-count pill, name search, and the
Filter button.

```css
.db-toolbar { display: flex; gap: 8px 16px; }
.db-toolbar h2 { display: inline; color: var(--color-primary); font-size: 1.125rem; }
.db-count-pill {
  display: inline-flex; padding: 2px 10px; border-radius: 999px;
  background: var(--color-surface-raised); border: 1px solid var(--color-border);
  color: var(--color-secondary); font-size: 0.75rem;
}
.db-search-input {
  background: var(--color-surface-raised); border: 1px solid var(--color-border);
  color: var(--color-primary); border-radius: var(--radius-sm);
  padding: 6px 10px; font-size: 0.8125rem; width: 200px; max-width: 100%;
}
```

`border-radius: 999px` is the pill idiom used here and by `.updated-badge` below. It is the only
radius in the system not drawn from the `--radius-*` tokens, because a pill is "fully round" rather
than a size choice.

---

### Last-Updated Badge (database.html, rsi.html)

A green-dot pill stating when the underlying data last refreshed. Replaced the old "this section is a
work in progress" line in v1.13.5.

```css
.updated-badge {
  display: inline-flex; gap: 8px; padding: 6px 14px; border-radius: 999px;
  background: var(--color-surface-raised); border: 1px solid var(--color-border);
  color: var(--color-green); font-size: 0.8125rem;
}
.updated-badge-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-green); }
```

The dot is decorative and duplicated by the adjacent text, so it needs no accessible name.

---

### Screener Bucketed Filter Grid (database.html, V1.12 redesign)

The Screener's always-visible filter grid, one labelled dropdown per numeric field, which replaced
the hidden click-to-open Filter Panel on that tab only.

```css
.screener-filter-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px 12px; background: var(--color-surface);
  border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 16px;
}
.screener-filter-cell { display: flex; flex-direction: column; gap: 4px; }
.screener-filter-cell label { color: var(--color-secondary); font-size: 0.6875rem; }
.screener-filter-cell select,
.screener-filter-cell input {
  background: var(--color-surface-raised); border: 1px solid var(--color-border);
  color: var(--color-primary); border-radius: var(--radius-sm);
  padding: 6px 8px; font-size: 0.8125rem; width: 100%;
}
```

`auto-fill` with a `160px` minimum is what makes this responsive without a breakpoint: the grid sheds
columns on its own as the viewport narrows.

---

### Modal (database.html, V1.13)

One shared overlay serves both the per-row score breakdown and the Methodology explainer. There is a
single `#modal-overlay` in the page, driven by `openModal()` / `closeModal()`.

```css
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 24px;
}
.modal-overlay[hidden] { display: none; }
.modal-panel {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); max-width: 880px; width: 100%;
  display: flex; flex-direction: column;
}
.modal-header { display: flex; padding: 16px 20px; border-bottom: 1px solid var(--color-border); }
.modal-header h2 { font-size: 1.0625rem; color: var(--color-primary); }
.modal-close { background: none; border: none; color: var(--color-secondary); font-size: 1.5rem; padding: 4px 8px; }
.modal-close:hover { color: var(--color-primary); }
```

`z-index: 1000` sits deliberately above the fixed nav's `z-index: 100`, so an open modal covers the
nav rather than letting it float over the panel. Closable by the X, by clicking the overlay, and by
Escape.

**Accessibility gap, recorded not fixed:** the panel does not trap focus and does not set
`role="dialog"` / `aria-modal="true"`. Tabbing out of an open modal reaches the page behind it. This
is the largest known gap against the Section 9 target and is listed in PRD.md Section 25 as an open
risk.

---

## 8. Undocumented Surfaces

Five tool pages carry their own inline `<style>` block on top of `css/main.css`. They are listed
here rather than left silently absent, because a design system that quietly omits a third of the
site's interface is worse than one that admits the boundary.

| Page | Inline CSS | Prefix | What it styles |
|---|---|---|---|
| `signal-miner.html` | ~126 lines | `.sl-*` | The whole Signal Miner interface: ticker chip rows and groups, the family checkbox grid, the parameter fields, the run status and progress line, the results table and its wrapper, the buy-and-hold baseline strip, and the combine bar |
| `converter.html` | ~53 lines | `.conv-*`, `.t-*`, `.j-*` | Panels and actions, plus two syntax highlighters: `.t-*` for the rendered logic tree (`.t-fn`, `.t-cond`, `.t-asset`, `.t-wt`, `.t-kw`, `.t-muted`) and `.j-*` for raw JSON (`.j-key`, `.j-str`, `.j-num`, `.j-bool`, `.j-null`) |
| `etf-cloner.html` | ~70 lines | `.ec-*`, `.j-*` | Panels, the file drop zone, the live/full mode toggle, the holdings table wrapper, and the same `.j-*` JSON highlighter |
| `nodes.html` | ~36 lines | `.nd-*` | Panels and actions, the oversized node total, the breakdown table (including the muted `tr.excluded` rows for what is deliberately not counted), and the quoted node definition. No syntax highlighter: this page prints one number and a table, not JSON (v1.26.0) |
| `k1.html` | ~62 lines | `.k1-*` | The lookup form and its hint line, the result panel, the oversized Yes/No verdict and its subtitle, the fact rows beneath it (`.k1-label` + value pairs), the caveat note, and the collapsible fund table: `.k1-filters` and `.k1-filter` for the All/K-1/No K-1 pills and the Expand toggle (`.on` marks the active pill, `.k1-toggle` pushes the toggle to the right edge), and `td.yes`/`td.no` for the verdict column. `.k1-wrap` caps at `60vh` and scrolls, since the table is 184 rows expanded, and `th` is `position: sticky` so the sortable headers stay reachable while scrolling. `button.k1-sort` makes each header a real button for keyboard use, styled to look like the header text it replaced; its `.arrow` is shown only when the button carries `aria-sort`, so the visible indicator and the announced state cannot drift apart. `.k1-warn` is the one loud element on the page: a pink-bordered tinted block, used only when etfdb's `Distributes K1` flag contradicts its own `Structure` field. It is deliberately not styled like `.k1-note`, because a reader who mistakes a contested answer for a settled one files their taxes wrong, and grey caveat text is read as boilerplate. `.k1-export` carries the `margin-left: auto` that pushes the right-hand button group over, with `.k1-toggle` sitting beside it. No syntax highlighter: this page prints a verdict and a table, not JSON (v1.27.0, table reworked v1.27.2, warning and export v1.27.7) |

`rsi.html`, `database.html`, `index.html`, `about.html`, `strategies.html`, `glossary.html` and
`404.html` carry **no** inline style at all; everything they render is in `css/main.css` and
documented above.

**The `.j-*` JSON highlighter is duplicated** between `converter.html` and `etf-cloner.html`. Both
copies define the same five classes. Nothing has gone wrong with that yet, but it is exactly the kind
of pair that drifts, and it is the strongest candidate for promotion into `css/main.css` if a third
page ever needs to print JSON.

**Why these were never folded into the shared stylesheet.** Each tool is a single self-contained page
whose styles are used nowhere else, so keeping them inline means one file to open when working on
that tool, and no dead rules loaded by every other page on the site. That trade is defensible and is
not being reversed here. What was not defensible was leaving it undocumented.

**Documenting them properly is open work**, listed in PRD.md Section 25. Anyone changing a tool's
appearance should keep to the tokens in Section 2 and the type scale in Section 3, which all three
pages already do.

---

## 9. Accessibility Standards

**Target: WCAG 2.1 Level AA**

### Focus Management

All interactive elements have visible focus rings:

```css
/* Implemented via browser defaults + no focus suppression */
/* Target: outline: 2px solid #4d9fff; outline-offset: 2px */
```

Tab order follows visual reading order. Mobile nav hamburger: `aria-expanded` attribute updates on open/close; `aria-controls="mobile-menu"`.

### Semantic HTML

- One `<h1>` per page
- Proper heading hierarchy (no skipping levels)
- Strategy cards use `<article>` elements
- Nav uses `<nav id="nav-root">` (with `aria-label="Mobile navigation"` on the mobile menu)
- Breadcrumb uses `<nav aria-label="Breadcrumb">` with `.current` class on current item
- Metrics table uses `<dl>` with `<dt>` / `<dd>` pairs (not `<table>`)
- Footer links use `<nav class="footer-links">`

### Screen Reader Support

- External links rendered with descriptive context (link text includes destination)
- Metric color coding is never the sole means of conveying meaning: values include sign (`+` / `-`)
- Strategy card metric labels are visible text above each value

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

---

## 10. Animation and Motion

Keep motion minimal and purposeful. No page transitions at MVP.

### Transition Table (from css/main.css)

| Element | Property | Duration | Easing |
|---|---|---|---|
| Cards (hover) | `border-color` | `0.15s` | `ease` (default) |
| Nav links | `color`, `background` | `0.15s` | `ease` |
| Nav logo | `color` | `0.15s` | `ease` |
| Nav hamburger background | `background` | `0.15s` | `ease` |
| Hamburger bars (open/close) | `transform`, `opacity` | `0.2s` | `ease` |
| Mobile nav links | `color`, `background` | `0.15s` | `ease` |
| Buttons | `opacity`, `background`, `color`, `border-color` | `0.15s` | `ease` |
| Tags (hover) | `opacity` | `0.15s` | `ease` |
| Compact strategy list items | `background` | `0.15s` | `ease` |
| Breadcrumb links | `color` | `0.15s` | `ease` |
| Footer links | `color` | `0.15s` | `ease` |
| About content links | `opacity` | `0.15s` | `ease` |
| Loading spinner | `transform` (rotate) | `0.6s` | `linear` (infinite) |

### Rules

- All transitions use `ease` timing unless continuity demands `linear` (spinner)
- Duration ceiling: `0.2s` for most interactions; spinner at `0.6s` is a persistent animation, not a transition
- `prefers-reduced-motion` sets all transition and animation durations to `0.01ms` (effectively instant)
- No decorative animations; no entrance animations; no scroll-triggered effects at MVP
