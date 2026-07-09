# Composer Atlas

A curated strategy library and educational reference for Composer.trade users. Covers 28 symphonies with plain-English logic breakdowns, backtested metrics, and a concept glossary.

**Full Database (live):** `database.html` is a separate section covering the full community symphony database (thousands of entries, not just the 28 curated strategies), with an All Strategies table, a Screener with switchable metric views and a bucketed filter grid, and a Leaderboard with a 20-metric percentile-rank scoring model. Non-strategy noise and near-identical duplicates are flagged and filterable. Still a work in progress in the sense that the Leaderboard scoring model is due for a revision. See `docs/PRD.md` Section 14 (Roadmap) for the full status.

## Live Site

https://composeratlas.com

## Tech Stack

| Layer | Choice |
|---|---|
| HTML | Vanilla `.html` files: no framework, no build step |
| CSS | CSS custom properties for design tokens; no preprocessor |
| JavaScript | Vanilla ES2020: `fetch()` for data, DOM manipulation for rendering |
| Data | `data/strategies.json` + `data/glossary.json` (source of truth); `.js` mirror files for `file://` compatibility |
| Hosting | GitHub Pages: serves the repository root directly |
| CI/CD | GitHub Actions: rsync to `_site/`, then upload; no build step |
| Scripts | Python 3 (stdlib only): no pip dependencies |

## Prerequisites

- **Python**: any version; used for local HTTP server and `scripts/update_metrics.py`
- **Git**
- **No Node.js required.** There is no `package.json`, no `node_modules`, and no build step.

## Installation

```bash
git clone https://github.com/Azqato/composer.git
```

No further install step.

## Running Locally

**Option 1; Python HTTP server (recommended for testing fetch behavior):**

```bash
python -m http.server 8000
# Site at http://localhost:8000/
```

**Option 2; Open directly in browser:**

Double-click any `.html` file (e.g. `index.html`). This works because data is loaded via `window.STRATEGIES_DATA` / `window.GLOSSARY_DATA` globals set by `data/strategies.js` and `data/glossary.js` before `app.js` runs.

## Environment Variables

None. The Composer API endpoints used by `scripts/update_metrics.py` require no authentication.

## Scripts

### `scripts/update_metrics.py`

Fetches fresh data from the Composer API and rewrites three files:

- `data/strategies.json`: backtest metrics for all 28 strategies (ARR, max drawdown, Sharpe, Calmar, standard deviation, trailing returns, backtest days)
- `data/strategies.js`: same data assigned to `window.STRATEGIES_DATA`
- `data/symphony_scores.json`: full IF/ELSE logic trees for all 28 symphonies (for AI analysis only; not served publicly)

```bash
python scripts/update_metrics.py
```

Run from the project root. No API key required. Run monthly or after any symphony logic changes.

After running, commit the updated data files:

```bash
git add data/strategies.json data/strategies.js data/symphony_scores.json
git commit -m "data: refresh metrics and symphony scores - YYYY-MM-DD"
git push origin main
```

### Full Database scripts (`database.html`)

Separate pipeline for the full community symphony database, not the curated 28. See `docs/PRD.md` Section 10 for the full directory listing and Section 14 for status. `refresh_full_database.py` runs automatically every Sunday via `.github/workflows/refresh-full-database.yml`; everything else in this table is manual-only by design, see each script's docstring.

| Script | Purpose |
|---|---|
| `import_full_database.py` | One-time: imports the raw source spreadsheet into `data/database.json` |
| `refresh_full_database.py` | Resumable, checkpointed API refresh; automated weekly. **Do not run other scripts that write `database.json` while this is running**, see the script's docstring |
| `sync_storage_to_database.py` | Adds any URL in `data/storage.csv` missing from `database.json` as a new unrefreshed row |
| `export_summary.py` | Derives the slim `data/database_summary.json`/`.js` used by the site from the full `database.json`; run after every refresh |
| `export_full_database_to_xlsx.py` | Local-only, occasional: regenerates a spreadsheet snapshot from the JSON |
| `flag_name_noise.py` | Flags non-strategy noise (test ports, WIP builds) by name pattern; manual-only |
| `dedupe_symphonies.py` | Flags near-identical duplicate symphonies via logic-tree comparison; manual-only, makes hundreds of live API calls per run |
| `purge_flagged_entries.py` | Removes entries by `flag` level from `database.json`, enforcing a `storage.csv` safety check first |

`database.json`, `database_summary.json`, and `storage.csv` are committed and live as of v1.12.0.

## Build and Deploy

There is no build step. Push to `main` and GitHub Actions deploys automatically within 1-2 minutes.

The workflow (`/.github/workflows/deploy.yml`) uses `rsync` to copy the repository to a `_site/` staging folder, excluding internal files that are not user-facing, then uploads `_site/` to GitHub Pages.

**Excluded from public deployment:**
- `data/symphony_scores.json` (14MB AI analysis file)
- `docs/`
- `scripts/`
- `strategies.xlsx`
- `.gitignore`, `.github/`

Monitor deploy status at: `https://github.com/Azqato/composer/actions`

## Documentation

Full documentation is in [`/docs`](docs/):

| File | Contents |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | Master reference: product requirements, architecture, runbook, data schemas, API reference, roadmap, security, tenets, FAQ |
| [`docs/DESIGN.md`](docs/DESIGN.md) | Design system: color palette, typography, spacing, breakpoints, component specs, accessibility |
| [`docs/PATCHNOTES.md`](docs/PATCHNOTES.md) | Changelog |

## Disclaimer

Composer Atlas is an independent educational resource. It is not affiliated with Composer Technologies, Inc. or any strategy authors. All featured strategies are presented for informational purposes only. Past performance does not guarantee future results. Nothing on this site constitutes financial advice.

## License

MIT
