#!/usr/bin/env python3
"""
public_database.py: shared paths and rules for the public / full database split
(v1.84.0, docs/PRD.md Section 12 "Public and Full Database").

The live site shows only the PUBLIC set of community symphonies. The full
database lives on the owner's machine and is never committed.

    data/database.json / .js         FULL master, local only (.gitignore)
    data/database_public.json / .js  committed slice, the CI refresh target
    data/Public Database.xlsx        local list of extra public ids (.gitignore)

The PUBLIC set (what database.html, the Leaderboard and the Screener show) is:

    every VISIBLE curated strategy in data/strategies.json, always,
    plus every symphony_id listed in data/Public Database.xlsx.

The SLICE (what data/database_public.json holds) is the public set plus the
HIDDEN curated strategies. Hidden strategies are not shown in the database,
but scripts/build_strategy_extras.py joins every curated strategy, hidden ones
included, and in CI the slice is the only database it can read.

On the owner's machine database.json exists and is the master. In CI it does
not, so every script that reads the database falls back to the slice. That
one rule is the whole CI story: database_path() below.

Standard library only, except read_xlsx_ids(), which imports openpyxl. It is
called only when the xlsx exists, and the xlsx never exists in CI.
"""

import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA = BASE_DIR / "data"

FULL_JSON = DATA / "database.json"
FULL_JS = DATA / "database.js"
PUBLIC_JSON = DATA / "database_public.json"
PUBLIC_JS = DATA / "database_public.js"
PUBLIC_XLSX = DATA / "Public Database.xlsx"
STRATEGIES = DATA / "strategies.json"

FULL_JS_GLOBAL = "DATABASE_DATA"
PUBLIC_JS_GLOBAL = "DATABASE_PUBLIC_DATA"

# Written by scripts/stamp_leaderboard_scores.py, read by
# `refresh_full_database.py --priority`. Local to database.json only: never in
# the summaries, never in the committed public slice, and carried across when a
# CI-refreshed slice row is merged back (export_summary.py).
LEADERBOARD_FIELDS = ("leaderboard_rank", "leaderboard_score", "leaderboard_scored_at")


def has_full():
    """True on the owner's machine, False in CI and in a fresh clone."""
    return FULL_JSON.exists()


def database_path():
    """The database every reader should use: the full master when present,
    otherwise the committed public slice."""
    return FULL_JSON if has_full() else PUBLIC_JSON


def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def load_database():
    return load(database_path())


def js_twin(json_path):
    """The .js twin and its window global for a database .json path."""
    json_path = Path(json_path)
    if json_path == FULL_JSON:
        return FULL_JS, FULL_JS_GLOBAL
    if json_path == PUBLIC_JSON:
        return PUBLIC_JS, PUBLIC_JS_GLOBAL
    raise ValueError(f"no known .js twin for {json_path}")


def write_database(json_path, entries):
    """Write a database .json and its .js twin together, in the exact format
    scripts/refresh_full_database.py has always used. Never write one alone."""
    json_path = Path(json_path)
    js_path, global_name = js_twin(json_path)
    json_path.write_text(
        json.dumps(entries, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    comment = (
        "// Database data - loaded as a script tag so it works with the file:// protocol.\n"
        "// Written by scripts/refresh_full_database.py and scripts/export_summary.py.\n"
    )
    js_path.write_text(
        comment + f"window.{global_name} = {json.dumps(entries, indent=2, ensure_ascii=False)};\n",
        encoding="utf-8",
    )


def strategies():
    return load(STRATEGIES)


def visible_curated_ids():
    return [s["symphony_id"] for s in strategies() if s.get("symphony_id") and not s.get("hidden")]


def hidden_curated_ids():
    return [s["symphony_id"] for s in strategies() if s.get("symphony_id") and s.get("hidden")]


def read_xlsx_ids():
    """symphony_ids listed in data/Public Database.xlsx, in sheet order.

    Only the symphony_id column is read. The other columns exist so rows can be
    copied straight across from data/Full Database.xlsx, which has the same
    layout. Returns [] when the file is absent (always the case in CI)."""
    if not PUBLIC_XLSX.exists():
        return []
    import openpyxl  # local-only dependency, never reached in CI

    wb = openpyxl.load_workbook(PUBLIC_XLSX, read_only=True, data_only=True)
    ws = wb.worksheets[0]
    rows = ws.iter_rows(values_only=True)
    header = next(rows, None) or ()
    header = [str(h).strip() if h is not None else "" for h in header]
    if "symphony_id" not in header:
        wb.close()
        raise SystemExit(
            f"{PUBLIC_XLSX.name}: no 'symphony_id' column in the header row. "
            "Copy the header row from data/Full Database.xlsx."
        )
    col = header.index("symphony_id")
    ids = []
    for row in rows:
        if col < len(row) and row[col] not in (None, ""):
            ids.append(str(row[col]).strip())
    wb.close()
    return ids
