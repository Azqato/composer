#!/usr/bin/env python3
"""Deploy gate: database.json is keyed by symphony_id, and its two companion files agree.

`symphony_id` is the primary key of the community database. Nothing enforced
that until v1.25.2, and by then one duplicate had been sitting in the file for
an unknown length of time: two rows for chkrQ6BnXCw31n7OIEaK, identical except
that one URL ended /details and the other /factsheet. It got in because
sync_storage_to_database.py deduplicated on the URL string rather than the id,
so a second URL for the same symphony read as a new symphony. That specific hole
is closed, but the file is also edited by hand (the AddSymphony.csv route, and
ad-hoc cluster corrections), and a hand edit cannot be prevented by fixing a
script. So this gate checks the invariant on the artifact itself, whatever
produced it.

Five checks, each on a failure that is silent without one:

  1. Every entry has a non-empty symphony_id. A null key makes every
     downstream join wrong and nothing would say so.
  2. symphony_ids are unique. A duplicate shows the same symphony twice in
     every list view and counts it twice in every total.
  3. The id embedded in symphony_url matches the symphony_id field. These are
     written by different code paths at different times and can disagree;
     a mismatch means one of them is lying about which symphony the row is.
  4. database_summary.json has the same row count, in the same order, as
     database.json. The site reads the summary, not the full file, so a stale
     summary makes real symphonies invisible with no error anywhere. This
     drifted once already: four symphonies were unreachable on the live site
     until v1.25.1 (see docs/PRD.md Section 24, discrepancy 5).
  5. Every symphony in database.json has its URL archived in storage.csv.
     storage.csv holds every symphony URL ever seen and never loses one, so an
     approved symphony must always be in it: database.json is a subset of the
     archive, never the other way round (docs/PRD.md Section 12). Five entries
     violated this at v1.25.4, four of them the same ones check 4 exists for,
     which is one cause showing up twice: the hand-run addition routes write
     database.json and stop. Fix with scripts/sync_database_to_storage.py.
     The reverse gap is not checked and must not be: storage.csv holding
     symphonies that database.json does not is the design working.

Public / full split (v1.84.0, docs/PRD.md Section 12). database.json is local
only, so in CI checks 1 to 3 run on the committed slice, data/database_public.json,
and check 4 compares the public summary against that slice. Locally checks 1 to
3 run on database.json, and check 4 additionally demands that the local full
summary matches database.json and that every slice row is in database.json.
Both places demand that every visible curated strategy is in the public summary.

Read-only. Exits non-zero on any failure, so it can gate a release.

    python scripts/check_database_keys.py
"""

import csv
import json
import re
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import public_database as pdb  # noqa: E402  (path set above)

BASE_DIR = Path(__file__).resolve().parent.parent
FULL_JSON_PATH = BASE_DIR / "data" / "database.json"
SUMMARY_JSON_PATH = BASE_DIR / "data" / "database_summary.json"
SUMMARY_FULL_JSON_PATH = BASE_DIR / "data" / "database_summary_full.json"
STORAGE_PATH = BASE_DIR / "data" / "storage.csv"

URL_ID_RE = re.compile(r"/symphony/([A-Za-z0-9]+)")

# How many offending rows to name before truncating. Enough to act on, not
# enough to bury the summary line under a wall of ids.
MAX_REPORTED = 10


def report(failures, label, items):
    """Record a failed check and print up to MAX_REPORTED examples."""
    if not items:
        print(f"  ok   {label}")
        return
    failures.append(label)
    print(f"  FAIL {label}: {len(items)}")
    for item in items[:MAX_REPORTED]:
        print(f"         {item}")
    if len(items) > MAX_REPORTED:
        print(f"         ... and {len(items) - MAX_REPORTED} more")


def summary_drift(summary_path, expected_ids, source_name):
    """Lines describing how a columnar summary's ids differ from expected_ids."""
    summary = json.loads(summary_path.read_text(encoding="utf-8"))
    id_col = summary["fields"].index("symphony_id")
    summary_ids = [row[id_col] for row in summary["rows"]]
    drift = []
    if summary_ids != expected_ids:
        drift.append(
            f"{summary_path.name} has {len(summary_ids)} rows, expected {len(expected_ids)} from {source_name}"
        )
        only_source = [s for s in expected_ids if s not in set(summary_ids)]
        only_summary = [s for s in summary_ids if s not in set(expected_ids)]
        for sid in only_source[:MAX_REPORTED]:
            drift.append(f"expected, missing from summary: {sid}")
        for sid in only_summary[:MAX_REPORTED]:
            drift.append(f"in summary, not expected: {sid}")
        if not only_source and not only_summary:
            drift.append("same ids, different order: re-run scripts/export_summary.py")
    return drift


def main():
    source = pdb.database_path()
    entries = json.loads(source.read_text(encoding="utf-8"))
    print(f"checking {len(entries)} entries in {source.name}")
    failures = []

    missing = [
        f"index {i}: symphony_url={e.get('symphony_url')!r}"
        for i, e in enumerate(entries)
        if not e.get("symphony_id")
    ]
    report(failures, "every entry has a symphony_id", missing)

    counts = Counter(e["symphony_id"] for e in entries if e.get("symphony_id"))
    dupes = []
    for sid, count in counts.most_common():
        if count < 2:
            break
        rows = [i for i, e in enumerate(entries) if e.get("symphony_id") == sid]
        dupes.append(f"{sid} x{count} at indexes {rows}")
    report(failures, "symphony_ids are unique", dupes)

    mismatched = []
    for i, e in enumerate(entries):
        sid = e.get("symphony_id")
        url = e.get("symphony_url") or ""
        match = URL_ID_RE.search(url)
        if sid and match and match.group(1) != sid:
            mismatched.append(f"index {i}: id={sid} but url carries {match.group(1)}")
    report(failures, "symphony_url agrees with symphony_id", mismatched)

    # Check 4. The public summary is the slice minus the hidden curated
    # strategies, in slice order. On the owner's machine the slice is derived
    # from database.json, so it is rebuilt here from database.json the same way.
    hidden = set(pdb.hidden_curated_ids())
    slice_rows = json.loads(pdb.PUBLIC_JSON.read_text(encoding="utf-8"))
    slice_ids = [e.get("symphony_id") for e in slice_rows]
    drift = summary_drift(
        SUMMARY_JSON_PATH, [sid for sid in slice_ids if sid not in hidden], pdb.PUBLIC_JSON.name
    )
    report(failures, "database_summary.json is in sync with the public slice", drift)

    summary = json.loads(SUMMARY_JSON_PATH.read_text(encoding="utf-8"))
    id_col = summary["fields"].index("symphony_id")
    shown = {row[id_col] for row in summary["rows"]}
    unshown = [sid for sid in pdb.visible_curated_ids() if sid not in shown]
    report(failures, "every visible curated strategy is in the public summary", unshown)

    if pdb.has_full():
        full_ids = [e.get("symphony_id") for e in entries]
        full_set = set(full_ids)
        orphan = [sid for sid in slice_ids if sid not in full_set]
        out_of_order = [] if orphan or [s for s in full_ids if s in set(slice_ids)] == slice_ids else [
            "database_public.json is not in database.json order: re-run scripts/export_summary.py"
        ]
        report(failures, "database_public.json is a slice of database.json", orphan + out_of_order)
        if SUMMARY_FULL_JSON_PATH.exists():
            drift = summary_drift(SUMMARY_FULL_JSON_PATH, full_ids, FULL_JSON_PATH.name)
        else:
            drift = [f"{SUMMARY_FULL_JSON_PATH.name} is missing: run scripts/export_summary.py"]
        report(failures, "database_summary_full.json is in sync (local)", drift)
    else:
        print("  skip database_summary_full.json is in sync (database.json is local-only, not present)")

    # storage.csv is local-only since 2026-11-06 (in .gitignore), so CI and the
    # deploy gate never have it. Skip check 5 there; it still runs locally.
    if not pdb.has_full():
        print("  skip every symphony is archived in storage.csv (database.json is local-only, not present)")
    elif not STORAGE_PATH.exists():
        print("  skip every symphony is archived in storage.csv (file is local-only, not present)")
    else:
        with open(STORAGE_PATH, encoding="utf-8", newline="") as f:
            archived = set()
            for row in csv.DictReader(f):
                url = row["url"]
                match = URL_ID_RE.search(url or "")
                archived.add(match.group(1) if match else url)
        unarchived = [
            f"{e['symphony_id']} ({e.get('name') or 'unnamed'})"
            for e in entries
            if e.get("symphony_id") and e["symphony_id"] not in archived
        ]
        report(failures, "every symphony is archived in storage.csv", unarchived)

    if failures:
        print("\nFAIL")
        print("Fix: re-run scripts/export_summary.py if only the summary drifted.")
        print("Fix: run scripts/sync_database_to_storage.py if only the archive lags.")
        print("A duplicate or mismatched key is a data defect; see docs/PRD.md Section 11.")
        return 1
    print("\nPASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
