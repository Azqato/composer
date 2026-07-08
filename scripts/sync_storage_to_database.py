#!/usr/bin/env python3
"""
sync_storage_to_database.py: Add any URL present in data/storage.csv but
missing from data/database.json as a new, unrefreshed entry.

data/storage.csv is the durable backup: URLs get pasted into it whenever
a symphony is discussed, referenced, or added anywhere on the site,
independent of whether it's ever made it into the database. This script
is the other direction, promoting storage.csv entries into database.json
so they actually get picked up by scripts/refresh_full_database.py.

New entries are added with every field null except name (also null,
matching how originally-unscraped rows look), symphony_url, and
symphony_id, so they're indistinguishable from any other not-yet-
refreshed row and will be picked up by the next refresh run.

Safe to re-run: URLs already in database.json are skipped.

Usage:
    python scripts/sync_storage_to_database.py
"""

import csv
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_PATH = BASE_DIR / "data" / "storage.csv"
JSON_PATH = BASE_DIR / "data" / "database.json"
JS_PATH = BASE_DIR / "data" / "database.js"


def extract_id(url):
    if not url or "/symphony/" not in url:
        return None
    return url.split("/symphony/")[1].split("/")[0]


def main():
    with open(STORAGE_PATH, encoding="utf-8", newline="") as f:
        storage_urls = [row["url"] for row in csv.DictReader(f)]

    entries = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    existing_urls = {e["symphony_url"] for e in entries if e.get("symphony_url")}
    template_keys = list(entries[0].keys())

    new_urls = [u for u in storage_urls if u not in existing_urls]
    print(f"{len(storage_urls)} URLs in storage.csv, {len(existing_urls)} already in database.json, {len(new_urls)} new")

    for url in new_urls:
        entry = {k: None for k in template_keys}
        entry["symphony_url"] = url
        entry["symphony_id"] = extract_id(url)
        entries.append(entry)

    JSON_PATH.write_text(
        json.dumps(entries, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(f"Wrote {len(entries)} total entries to {JSON_PATH.name} (+{len(new_urls)})")

    comment = (
        "// Full database data - loaded as a script tag so database.html works with file:// protocol.\n"
        "// To update: run scripts/import_full_database.py or scripts/refresh_full_database.py\n"
    )
    JS_PATH.write_text(
        comment + f"window.DATABASE_DATA = {json.dumps(entries, indent=2, ensure_ascii=False)};\n",
        encoding="utf-8",
    )
    print(f"Wrote {JS_PATH.name}")


if __name__ == "__main__":
    main()
