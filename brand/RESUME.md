# Brand build: where this stands

**Working note, not documentation.** The real documentation is in `docs/PRD.md` (`## Brand Identity`,
the why) and `docs/DESIGN.md` (Section 11, the how). This file exists so a cold session can pick the
work up without re-deriving it, and it should be deleted when the brand work closes.

**Last updated:** 2026-09-28. **All seven phases are complete.** What is left is a decision, not work.

---

## The one thing that is open

**Adoption.** Nothing built here is wired into the site. `favicon.svg` in the repository root is still
the map emoji, the nav mark is still the emoji, and `css/main.css` has not been touched. Adopting the
system is the owner's call and a separate change, and the files that would make it a small one already
exist: `brand/logo/favicon.svg`, the icon PNGs, and `brand/kit/site.webmanifest`.

`brand/mockups/` is also still empty. Every mockup in the presentation is drawn in CSS and SVG, and a
real photograph would replace one.

---

## What was built

| Phase | Output |
|---|---|
| 1. Foundation | `docs/PRD.md` > `## Brand Identity` > `### Brand Brief` |
| 2. Competitive edge | Same file, `### Competitive Analysis`. Eight brands, a twelve-row cliche table, and the finding that **SoFi acquired Composer in June 2026** so the platform is now "Composer by SoFi" while the repo docs still call it independent |
| 3. Concepts | Four directions in `brand/concepts/`, all render-checked. Owner chose **C and D as one system, locked up with B** |
| 4. Logo system | **37 files** in `brand/logo/` |
| 5. Brand kit | **8 files** in `brand/kit/` |
| 6. Presentation | `brand/presentation.html` and `brand/brand-guidelines.pdf`, 15 pages A4 landscape |
| 7. Showcase | `brand/brand-design.html`, interactive, **gitignored and never linked** |

**Seven scripts in `brand/build/`:** five generators, one render checker (`contact_sheet.py`) and one
typesetting library (`lib_type.py`). **They are the source. The SVGs are output.** Editing a file in
`brand/logo/` produces something the next build overwrites.

## The system in one paragraph

A square **neatline** frames a **graticule** whose interior **meridians bow**, the way they do in a
pseudocylindrical projection, with one **index cell** filled green. The bow is the load-bearing
decision: straighten it and the mark is a spreadsheet. The primary mark is 3x3 and used above 32px;
the compact mark is the same idea at 2x2 with a heavier stroke and a deeper bow, and it is the only
version that holds at 16px. The wordmark is Archivo SemiBold caps, hand-kerned, with a green graticule
tick in place of the word space.

## Deploy posture, decided 2026-09-28

**`brand/` is committed and excluded from both hosts**, so the served site is unchanged by it.

- `.assetsignore` has a `brand/` entry. This matters because wrangler serves **everything not listed**,
  so without it the commit would have added 104 public URLs and 4.6 MB.
- `.github/workflows/deploy.yml` has a matching `--exclude='brand'`. The two files do not read each
  other and the PRD records that they drift; they were changed together on purpose.
- `brand/brand-design.html` is additionally in `.gitignore`, so it is not even committed.

## Traps that cost real time, so they do not cost it twice

1. **`currentColor` in an SVG loaded through an `<img>` resolves against that SVG's own root, never
   the host page.** A baked `color="#16191f"` made every dark-ground test show a dark mark on a dark
   ground **and report success**. Everything is emitted as dark-ink and light-ink pairs because of it.
2. **A transparent PNG has the same problem with no fix.** It bakes one ink and a browser never says
   what colour the tab strip will be, so the raster favicons are opaque and bring their own ground.
3. **Headless Edge needs a profile per process.** A shared `--user-data-dir` deadlocks against a
   previous run that has not fully exited, and the symptom is a hang with no output. Do **not** kill
   stray `msedge` processes: the owner's own browser runs under the same executable.
4. **Space lockups from the ink, not the canvas.** The symbols carry a 9-unit inset on a 64-unit
   canvas, so a gap measured from the canvas edge silently adds 14% of the scaled symbol.
5. **Bash heredocs and `python -c` mangle** backslashes and triple quotes on this content. Use the
   Write tool for scratchpad scripts and the Edit tool for surgical changes.
6. **A `%` in a CSS string breaks Python's `%` formatting.** Escape it as `%%`.

## Carried over from the v1.83.2 documentation work, still open

- **`data/Full Database.xlsx` is not in `.assetsignore`**, so Cloudflare still serves it. Needs its own
  push with its own check that no page requests the file.
- A V1.20 line in the PRD reads "all 31 strategies today" where the file holds 36 with 24 visible.
- `docs/DESIGN.md`'s opening scope note points at "Section 10, Undocumented Surfaces", which is
  actually Section 8. **Pre-existing drift, not introduced here.**
