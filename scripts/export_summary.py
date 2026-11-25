#!/usr/bin/env python3
"""
export_summary.py: Regenerate data/database_summary.json and
data/database_summary.js from data/database.json.

Performance Fix (V1.16, PRD.md Section 14): database.json is ~11MB.
The site's documented <500KB page-weight target (Section 10) is scoped
to the homepage specifically, not this page, but an 11MB fetch still
hurts load time and the Lighthouse/LCP targets that do apply broadly.

Two things drive the size down, neither is dropping fields alone (that
only saved ~26%, most of the weight isn't any single field, it's JSON
format overhead):

1. Columnar layout: one `fields` header array plus a `rows` array of
   plain value arrays, instead of repeating every field name as a key
   on every one of 6,488 objects. This alone is the biggest win.
2. Float rounding to 4 decimal places: these are percentages and
   ratios: 4 decimal places (e.g. 0.1234 = 12.34%) is far more
   precision than any UI ever displays.

Also drops fields unused by any list/filter/score view: cumulative_return,
mean, min, max, active_asset_nodes, total_costs, annualized_turnover,
herfindahl_index (see docs/PRD.md V1.13 for why each is excluded from
scoring; they're not displayed anywhere either, so they're dropped here
too).

Run this after any run of scripts/refresh_full_database.py so the
summary file stays in sync with the full one.

Public and full split (v1.84.0, docs/PRD.md Section 12). The live site shows
only the public set; see scripts/public_database.py for the definitions. This
script is where the split is made. On the owner's machine (database.json
present) it:

  1. reads data/Public Database.xlsx and fails loudly on any symphony_id that
     is not in database.json, so a typo can never silently publish nothing;
  2. merges data/database_public.json back into database.json, row by row,
     newer refresh_date wins, so the weekly CI refresh of the public rows is
     never lost when the local master is next exported;
  3. writes data/database_public.json (+ .js), the committed slice;
  4. writes data/database_summary.json (+ .js), PUBLIC rows only, the file the
     live site loads;
  5. writes data/database_summary_full.json (+ .js), every row, local only,
     which database.html loads instead when opened on this machine;
  6. re-cuts the public data/oos.json from the local data/oos_full.json, so a
     newly published symphony brings its out-of-sample row with it.

In CI (no database.json) it rebuilds the public summary from the committed
slice alone, minus the hidden curated strategies.

Usage:
    python scripts/export_summary.py
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import public_database as pdb  # noqa: E402  (path set above)

BASE_DIR = pdb.BASE_DIR
FULL_JSON_PATH = pdb.FULL_JSON
SUMMARY_JSON_PATH = BASE_DIR / "data" / "database_summary.json"
SUMMARY_JS_PATH = BASE_DIR / "data" / "database_summary.js"
SUMMARY_FULL_JSON_PATH = BASE_DIR / "data" / "database_summary_full.json"
SUMMARY_FULL_JS_PATH = BASE_DIR / "data" / "database_summary_full.js"
OOS_JSON = BASE_DIR / "data" / "oos.json"
OOS_JS = BASE_DIR / "data" / "oos.js"
OOS_FULL_JSON = BASE_DIR / "data" / "oos_full.json"
OOS_FULL_JS = BASE_DIR / "data" / "oos_full.js"

FLOAT_DIGITS = 4

DROPPED_FIELDS = {
    "cumulative_return",
    "mean",
    "min",
    "max",
    "active_asset_nodes",
    "total_costs",
    "annualized_turnover",
    "herfindahl_index",
    # local refresh-order stamp (stamp_leaderboard_scores.py), never shipped
    "leaderboard_rank",
    "leaderboard_score",
    "leaderboard_scored_at",
}


def round_floats(obj):
    if isinstance(obj, float):
        return round(obj, FLOAT_DIGITS)
    if isinstance(obj, dict):
        return {k: round_floats(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [round_floats(v) for v in obj]
    return obj


def collect_fields(entries):
    """Every field any entry carries, in first-seen order, minus the dropped ones.

    This used to read entries[0].keys() alone. Every entry happens to carry an
    identical key set today, so the two agree, but the old form would silently
    drop a field the day one was added to later entries without backfilling the
    first: the column would vanish from the summary with no error anywhere, and
    the site reads the summary, not database.json. First-seen order is preserved
    so the column layout stays byte-stable when nothing has changed.
    """
    fields = []
    seen = set()
    for entry in entries:
        for k in entry.keys():
            if k not in seen:
                seen.add(k)
                fields.append(k)
    return [k for k in fields if k not in DROPPED_FIELDS]


def write_summary(entries, json_path, js_path, fields, note):
    rows = [round_floats([entry.get(f) for f in fields]) for entry in entries]
    payload = {"fields": fields, "rows": rows}
    text = json.dumps(payload, separators=(",", ":"), ensure_ascii=False)
    json_path.write_text(text, encoding="utf-8")
    comment = (
        f"// {note}\n"
        "// Shape: { fields: [...], rows: [[...], ...] }, reconstruct objects client-side (see database.html).\n"
        "// To update: run scripts/export_summary.py after scripts/refresh_full_database.py.\n"
    )
    js_path.write_text(comment + f"window.DATABASE_SUMMARY_DATA = {text};\n", encoding="utf-8")
    print(f"Wrote {len(rows)} rows x {len(fields)} fields to {json_path.name} (+ {js_path.name})")


def newer(a, b):
    """True when row a carries a strictly later refresh_date than row b."""
    return str(a.get("refresh_date") or "") > str(b.get("refresh_date") or "")


def build_local():
    """Owner's machine: database.json is the master. Returns (slice, public_ids, entries)."""
    entries = pdb.load(FULL_JSON_PATH)
    index = {e.get("symphony_id"): i for i, e in enumerate(entries) if e.get("symphony_id")}

    xlsx_ids = pdb.read_xlsx_ids()
    if not pdb.PUBLIC_XLSX.exists():
        print(f"note: {pdb.PUBLIC_XLSX.name} not found; the public set is the visible curated strategies only")
    unknown = [sid for sid in xlsx_ids if sid not in index]
    if unknown:
        print(f"FAIL: {len(unknown)} symphony_id(s) in {pdb.PUBLIC_XLSX.name} are not in database.json:")
        for sid in unknown[:20]:
            print(f"  {sid}")
        print("Fix the id (copy the row from data/Full Database.xlsx), or add the symphony to the database first.")
        raise SystemExit(1)

    # Pull back rows the weekly CI job refreshed in the committed slice.
    merged = 0
    if pdb.PUBLIC_JSON.exists():
        for row in pdb.load(pdb.PUBLIC_JSON):
            i = index.get(row.get("symphony_id"))
            if i is None:
                print(f"note: {row.get('symphony_id')} is in database_public.json but not database.json; dropped")
                continue
            if newer(row, entries[i]):
                # The slice never carries the local leaderboard stamp; keep it.
                keep = {k: entries[i][k] for k in pdb.LEADERBOARD_FIELDS if k in entries[i]}
                entries[i] = {**row, **keep}
                merged += 1
    if merged:
        pdb.write_database(FULL_JSON_PATH, entries)
        print(f"Merged {merged} newer row(s) from database_public.json into database.json")

    visible = pdb.visible_curated_ids()
    hidden = pdb.hidden_curated_ids()
    missing = [sid for sid in visible + hidden if sid not in index]
    if missing:
        print(f"warning: {len(missing)} curated strategy id(s) have no database.json row: {missing}")
    # A hidden curated strategy stays off the public summary even if the sheet
    # lists it, so the rule is the same here and in CI: public = slice - hidden.
    public_ids = (set(visible) | set(xlsx_ids)) - set(hidden)
    slice_ids = public_ids | set(hidden)
    slice_rows = [{k: v for k, v in e.items() if k not in pdb.LEADERBOARD_FIELDS}
                  for e in entries if e.get("symphony_id") in slice_ids]
    pdb.write_database(pdb.PUBLIC_JSON, slice_rows)
    print(f"Wrote {len(slice_rows)} rows to {pdb.PUBLIC_JSON.name} (+ {pdb.PUBLIC_JS.name}): "
          f"{len(public_ids & set(index))} public, {len(slice_ids - public_ids)} hidden curated")
    return slice_rows, public_ids, entries


def write_oos(payload, json_path, js_path):
    """Same bytes scripts/refresh_oos.py writes, so either writer may run next."""
    text = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"
    json_path.write_text(text, encoding="utf-8")
    js_path.write_text(
        "// Out-of-sample statistics, loaded as a script tag so database.html works\n"
        "// with the file:// protocol. To update: run scripts/refresh_oos.py\n"
        "window.OOS_DATA = " + text.rstrip("\n") + ";\n",
        encoding="utf-8",
    )


def cut_oos(public_ids):
    """Locally, re-cut the public data/oos.json from the local data/oos_full.json.

    Without this a newly published symphony would have no out-of-sample row on
    the live site until the next weekly run. Rows the CI job refreshed in
    oos.json are pulled into oos_full first (later requested_end wins), the
    same rule scripts/refresh_oos.py applies."""
    if not OOS_FULL_JSON.exists():
        print(f"note: {OOS_FULL_JSON.name} not found; {OOS_JSON.name} left as it is")
        return
    full = json.loads(OOS_FULL_JSON.read_text(encoding="utf-8"))
    public = json.loads(OOS_JSON.read_text(encoding="utf-8")) if OOS_JSON.exists() else {"series": {}}
    pulled = 0
    for sid, row in public.get("series", {}).items():
        old = full["series"].get(sid)
        if old is None or str(row.get("requested_end") or "") > str(old.get("requested_end") or ""):
            full["series"][sid] = row
            pulled += 1
    if pulled:
        write_oos(full, OOS_FULL_JSON, OOS_FULL_JS)
        print(f"Merged {pulled} newer row(s) from {OOS_JSON.name} into {OOS_FULL_JSON.name}")
    cut = dict(full)
    cut["series"] = {k: v for k, v in full["series"].items() if k in public_ids}
    if cut != public:
        write_oos(cut, OOS_JSON, OOS_JS)
    print(f"{OOS_JSON.name}: {len(cut['series'])} public series of {len(full['series'])}")


def build_ci():
    """No database.json (CI, fresh clone): the committed slice is all there is."""
    slice_rows = pdb.load(pdb.PUBLIC_JSON)
    hidden = set(pdb.hidden_curated_ids())
    public_ids = {e.get("symphony_id") for e in slice_rows} - hidden
    print(f"database.json absent: building the public summary from {pdb.PUBLIC_JSON.name}")
    return slice_rows, public_ids, None


def main():
    if pdb.has_full():
        slice_rows, public_ids, entries = build_local()
    else:
        slice_rows, public_ids, entries = build_ci()

    public_rows = [e for e in slice_rows if e.get("symphony_id") in public_ids]
    # One column layout for both summaries, so a page reading either one sees
    # the same fields. Derived from the widest source available.
    fields = collect_fields(entries if entries is not None else slice_rows)

    write_summary(public_rows, SUMMARY_JSON_PATH, SUMMARY_JS_PATH, fields,
                  "Public database summary: the featured set the live site shows (v1.84.0).")
    if entries is not None:
        write_summary(entries, SUMMARY_FULL_JSON_PATH, SUMMARY_FULL_JS_PATH, fields,
                      "FULL database summary, local only, never committed (v1.84.0).")
        cut_oos({e.get("symphony_id") for e in public_rows})

    print(f"\nPublic summary: {SUMMARY_JSON_PATH.stat().st_size / 1024:.1f} KB")
    if entries is not None:
        print(f"Full summary:   {SUMMARY_FULL_JSON_PATH.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
