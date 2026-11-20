#!/usr/bin/env python3
"""
export_full_database_to_xlsx.py: Regenerate data/Full Database.xlsx from
data/database.json (the canonical JSON source).

Local-only maintenance script, not part of the site's data pipeline or
deploy (composeratlas.com and all import/refresh tooling read from the
JSON, not the xlsx). Run this occasionally (e.g. monthly) if you want an
up-to-date spreadsheet snapshot for offline review.

Overwrites data/Full Database.xlsx completely, including its column
layout. Any manual edits made directly in the spreadsheet will be lost;
the JSON is the source of truth, not the other way around.

Fields holding nested objects (last_market_days_holdings,
active_asset_nodes) are serialized to a compact JSON string per cell,
since spreadsheet cells can't hold nested structures. `error` is mixed
type (a plain string for script errors, or an object for Composer's
data_warnings on a "caution"-flagged row) and is only JSON-serialized
when its value is actually a dict/list.

Usage:
    python scripts/export_full_database_to_xlsx.py
    python scripts/export_full_database_to_xlsx.py --seed-public

--seed-public (v1.84.0) creates data/Public Database.xlsx instead: the same
columns, holding only the visible curated strategies. That file is the owner's
list of which symphonies the live site shows (docs/PRD.md Section 12); only its
symphony_id column is read, by scripts/export_summary.py. It refuses to run if
the file already exists, because unlike Full Database.xlsx it is hand-edited
and must never be regenerated over the owner's additions.
"""

import json
from datetime import date
from pathlib import Path

import sys

import openpyxl

sys.path.insert(0, str(Path(__file__).resolve().parent))
import public_database as pdb  # noqa: E402  (path set above)

BASE_DIR = Path(__file__).resolve().parent.parent
JSON_PATH = BASE_DIR / "data" / "database.json"
XLSX_PATH = BASE_DIR / "data" / "Full Database.xlsx"

JSON_FIELDS = {"last_market_days_holdings", "active_asset_nodes"}


def main():
    entries = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    if not entries:
        print("No entries in database.json, nothing to export.")
        return

    headers = list(entries[0].keys())
    out_path = XLSX_PATH
    if "--seed-public" in sys.argv[1:]:
        out_path = pdb.PUBLIC_XLSX
        if out_path.exists():
            raise SystemExit(f"{out_path.name} already exists; it is hand-edited, so it is never overwritten.")
        visible = set(pdb.visible_curated_ids())
        entries = [e for e in entries if e.get("symphony_id") in visible]

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Sheet1"
    ws.append(headers)

    for entry in entries:
        row = []
        for key in headers:
            val = entry.get(key)
            if key in JSON_FIELDS and val is not None:
                val = json.dumps(val, ensure_ascii=False)
            elif key == "error" and isinstance(val, (dict, list)):
                val = json.dumps(val, ensure_ascii=False)
            elif key == "refresh_date" and val:
                val = date.fromisoformat(val)
            row.append(val)
        ws.append(row)

    wb.save(out_path)
    print(f"Wrote {len(entries)} rows ({len(headers)} columns) to {out_path.name}")


if __name__ == "__main__":
    main()
