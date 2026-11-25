#!/usr/bin/env python3
"""
refresh_full_database.py: Fetch fresh backtest data from the Composer API
for entries in data/database.json (the full ~6,800-symphony raw database,
distinct from the 36 curated strategies in data/strategies.json).

Target schema (locked in PRD.md Section 14, V1.9.1): every DIRECT_FIELD is
overwritten in full on every successful call (no partial/backfill merging),
and fields with no meaningful value for an entry are stored as explicit
null rather than omitted, so every entry in database.json always has the
same set of keys.

`flag`/`error` (PRD.md Section 12 / V1.14 Part B, consolidated v1.11.9,
split v1.11.11) are the single source of truth for a row's error/warning
state - written directly here on every call, replacing the older separate
script_errors/data_warnings fields. `flag` is "excluded" | "caution" |
"retry" | null (the category); `error` is the original message/object
(a script error string, or Composer's data_warnings object) or null.

Entries whose refresh_date is less than STALE_AFTER_DAYS old are skipped.
Saves a checkpoint every CHECKPOINT_EVERY rows so a crash mid-run (e.g. an
unprintable character in a strategy name, a network blip) never loses
progress already made.

WARNING: this script loads database.json into memory once at startup and
overwrites the whole file with that in-memory copy on every checkpoint.
While this run is active in the background, do not run any other script
that also writes database.json (
sync_storage_to_database.py); their changes will be silently overwritten
on this script's next checkpoint. Stop this script first if you need to
run one of those.

Usage:
    python scripts/refresh_full_database.py [LIMIT] [--force]

    LIMIT: optional int, max number of rows to process this run (default:
    all rows due for refresh). Use a small LIMIT to test in batches before
    running against the full backlog.

    --force: ignore the staleness check and re-refresh every entry with a
    symphony_id, including ones updated today. Needed the first time this
    script runs after a schema change (e.g. V1.9.1's field expansion),
    since rows refreshed under the old schema look "fresh" by refresh_date
    but are missing the new fields.
"""

import json
import math
import os
import re
import sys
import time
import urllib.error
import urllib.request
from datetime import date, timedelta
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE_DIR = Path(__file__).resolve().parent.parent
# database.json is local only since v1.84.0 (docs/PRD.md Section 12). On the
# owner's machine this refreshes the full master. In CI, where it is absent, it
# refreshes the committed public slice, data/database_public.json, and
# scripts/export_summary.py merges those rows back into the master the next
# time it runs locally (newer refresh_date wins).
sys.path.insert(0, str(Path(__file__).resolve().parent))
import public_database as pdb  # noqa: E402  (path set above)
JSON_PATH = pdb.database_path()
JS_PATH, JS_GLOBAL = pdb.js_twin(JSON_PATH)

API_BASE = "https://api.composer.trade"
UA = "Mozilla/5.0 (compatible; composer-metrics-updater/1.0)"
BODY = {
    "capital": 10000,
    "broker": "alpaca",
    "slippage_percent": 0.0005,
    "apply_reg_fee": True,
    "apply_taf_fee": True,
}

STALE_AFTER_DAYS = 7
# The GitHub workflow always runs at this default. A local run may pass
# `--delay SECONDS` to try a shorter pause (PRD.md Section 13, Rate Limits);
# with an override, the run stops after MAX_CONSECUTIVE_429 rate-limit
# failures in a row so a too-fast pace never hammers the API.
API_CALL_DELAY_SECONDS = 2
MAX_CONSECUTIVE_429 = 3
CHECKPOINT_EVERY = 10

# `flag` classification (PRD.md Section 12 / V1.14 Part B). Permanent
# failures are excluded from default views; transient ones are left
# unflagged and picked up again by the staleness check on a future run.
PERMANENT_CODES = {"404", "422"}
TRANSIENT_CODES = {"429", "500", "503"}
CODE_RE = re.compile(r"\b(404|422|429|500|503)\b")

# stats fields that map 1:1 onto our schema (same key name both sides)
DIRECT_STATS_FIELDS = [
    "annualized_rate_of_return",
    "cumulative_return",
    "calmar_ratio",
    "sharpe_ratio",
    "sortino_ratio",
    "standard_deviation",
    "min",
    "mean",
    "median",
    "max",
    "win_rate",
    "skewness",
    "kurtosis",
    "tail_ratio",
    "top_one_day_contribution",
    "top_five_percent_day_contribution",
    "top_ten_percent_day_contribution",
    "herfindahl_index",
    "annualized_turnover",
    "trailing_one_day_return",
    "trailing_one_week_return",
    "trailing_two_week_return",
    "trailing_one_month_return",
    "trailing_three_month_return",
    "trailing_one_year_return",
]

COST_FIELDS = ["reg_fee", "taf_fee", "cat_fee", "slippage", "spread_markup", "subscription"]


def classify_error(reason):
    """Bucket a failed call's error text into excluded (permanent) or retry (transient)."""
    match = CODE_RE.search(reason)
    if match and match.group(1) in PERMANENT_CODES:
        return "excluded"
    if (match and match.group(1) in TRANSIENT_CODES) or "timeout" in reason.lower():
        return "retry"
    print(f"  WARNING: unrecognized error shape, defaulting to 'retry': {reason!r}")
    return "retry"


def post(url, body):
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": UA},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def write_atomic(path, entries):
    """Write to a temp file beside `path`, then swap it in, so a run killed
    mid-write leaves the previous complete file rather than a truncated one."""
    tmp = Path(str(path) + ".tmp")
    tmp.write_text(json.dumps(entries, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def write_js(entries):
    comment = (
        "// Database data - loaded as a script tag so it works with the file:// protocol.\n"
        "// Written by scripts/refresh_full_database.py and scripts/export_summary.py.\n"
    )
    JS_PATH.write_text(
        comment + f"window.{JS_GLOBAL} ={json.dumps(entries, indent=2, ensure_ascii=False)};\n",
        encoding="utf-8",
    )


def apply_backtest_result(entry, result):
    """Overwrite entry's metrics block in full from a successful API response."""
    stats = result.get("stats", {})

    for field in DIRECT_STATS_FIELDS:
        entry[field] = stats.get(field)

    entry["max_drawdown"] = -abs(stats["max_drawdown"]) if "max_drawdown" in stats else None
    entry["backtest_days"] = stats.get("size")

    entry["last_market_days_holdings"] = result.get("last_market_days_holdings")
    entry["active_asset_nodes"] = result.get("active_asset_nodes")

    costs = result.get("costs") or {}
    entry["total_costs"] = sum(costs.get(f, 0) or 0 for f in COST_FIELDS) if costs else None

    warnings = result.get("data_warnings") or None
    entry["flag"] = "caution" if warnings else None
    entry["error"] = warnings

    # legend carries the symphony's current name keyed by id. Originally
    # skipped as "redundant" since most entries already had a name from the
    # xlsx scrape, but the ~5,500 entries that scrape never named still need
    # it. Only overwrite when the API actually returns one; never null out
    # an existing name just because legend happened to omit it this call.
    legend = result.get("legend") or {}
    api_name = (legend.get(entry["symphony_id"]) or {}).get("name")
    if api_name:
        entry["name"] = api_name

    # Date of the symphony's last logic edit. The "days since" figure (how
    # long the current logic has run untouched, i.e. genuinely
    # out-of-sample) is computed at render time in database.html, not
    # stored here, since a stored duration goes stale the moment a day
    # passes without a fresh API call. The API returns a full timestamp
    # with time-of-day/timezone; only the date portion is stored.
    raw_oos = result.get("last_semantic_update_at")
    entry["oos_date"] = raw_oos.split("T")[0] if raw_oos else None


# Share of the Leaderboard pool, by stored score, that `--priority` refreshes
# first. The owner's chosen cut (2026-11-24); a plain share of the pool, not a
# tier, because database.json stores numbers only.
PRIORITY_TOP_SHARE = 0.10


def priority_order(due, entries):
    """Local-only refresh order (`--priority`): the top PRIORITY_TOP_SHARE of the
    Leaderboard pool first, in rank order, then the rest by Sharpe (highest
    first), then rows that have never been backtested, then `excluded` rows
    last. Rank is the stored `leaderboard_rank` that
    scripts/stamp_leaderboard_scores.py reads off the live page, so a change to
    the scoring model needs no edit here.
    Returns (ordered rows, number of rows in the top block)."""
    stamped = [e.get("leaderboard_scored_at") for e in entries if e.get("leaderboard_scored_at")]
    if not stamped:
        raise SystemExit("--priority needs leaderboard scores in database.json. "
                         "Run scripts/stamp_leaderboard_scores.py first.")
    pool = sum(1 for e in entries if isinstance(e.get("leaderboard_rank"), int))
    cut = math.ceil(PRIORITY_TOP_SHARE * pool)
    print(f"Leaderboard scores stamped {max(stamped)}; top {PRIORITY_TOP_SHARE:.0%} = rank 1 to {cut} of {pool}.")

    def top(e):
        r = e.get("leaderboard_rank")
        return isinstance(r, int) and r <= cut

    def key(e):
        if top(e):
            return (0, e["leaderboard_rank"])
        if e.get("flag") == "excluded":
            return (3, 0)
        s = e.get("sharpe_ratio")
        if isinstance(s, (int, float)):
            return (1, -s)
        return (2, 0)

    ordered = sorted(due, key=key)  # stable: ties keep file order
    return ordered, sum(1 for e in ordered if top(e))


def main():
    args = sys.argv[1:]
    priority = "--priority" in args
    dry_run = "--dry-run" in args
    args = [a for a in args if a not in ("--priority", "--dry-run")]
    force = "--force" in args
    args = [a for a in args if a != "--force"]
    delay = API_CALL_DELAY_SECONDS
    delay_overridden = "--delay" in args
    if delay_overridden:
        i = args.index("--delay")
        delay = float(args[i + 1])
        del args[i:i + 2]
    # --gap SECONDS: pace call START to call START (the response time counts
    # toward the gap) instead of pausing a fixed time after each response.
    gap = None
    if "--gap" in args:
        i = args.index("--gap")
        gap = float(args[i + 1])
        del args[i:i + 2]
        delay_overridden = True
    # --scratch DIR (local): checkpoints go to DIR/database.json instead of the
    # repo, so a cloud-synced repo folder (OneDrive) sees one write at the end,
    # not one every CHECKPOINT_EVERY rows. A scratch copy newer than the repo
    # file is a cut-short run, and this run resumes from it.
    work = None
    if "--scratch" in args:
        i = args.index("--scratch")
        work = Path(args[i + 1]) / "database.json"
        del args[i:i + 2]
        work.parent.mkdir(parents=True, exist_ok=True)
    limit = int(args[0]) if args else None

    source = JSON_PATH
    if work and work.exists() and work.stat().st_mtime > JSON_PATH.stat().st_mtime:
        source = work
        print(f"Resuming from the scratch copy {work} (newer than {JSON_PATH.name}).")
    entries = json.loads(source.read_text(encoding="utf-8"))
    stale_cutoff = date.today() - timedelta(days=STALE_AFTER_DAYS)
    today = date.today().isoformat()

    due = [
        e for e in entries
        if e.get("symphony_id")
        and (force or not e.get("refresh_date") or date.fromisoformat(e["refresh_date"]) <= stale_cutoff)
    ]
    if priority:
        due, n_top = priority_order(due, entries)
        print(f"Priority order: {n_top} due top-ranked rows first, then the rest by Sharpe; excluded last.")
    if limit:
        due = due[:limit]
    if dry_run:
        print(f"Dry run: {len(due)} rows due, no API calls made. First and last 5:")
        for e in due[:5] + due[-5:]:
            print(f"  {e.get('sharpe_ratio')!s:>8}  {e.get('flag')!s:>8}  {e.get('name')}")
        return

    pace = f"a {gap:g}s start-to-start gap" if gap is not None else f"a {delay:g}s pause"
    print(f"Processing {len(due)} rows at {pace} between calls...")
    ok = fail = 0
    streak_429 = 0
    started = time.time()
    last_start = None

    try:
        for i, entry in enumerate(due):
            if delay_overridden and streak_429 >= MAX_CONSECUTIVE_429:
                print(f"\nStopping: {streak_429} consecutive HTTP 429s at {pace}. "
                      f"Remaining rows stay due for the next run.")
                break
            if i > 0:
                if gap is not None:
                    time.sleep(max(0.0, gap - (time.time() - last_start)))
                else:
                    time.sleep(delay)
            last_start = time.time()

            name = entry.get("name") or entry["symphony_id"]
            print(f"[{i + 1}/{len(due)}] {name} ({entry['symphony_id']}) ... ", end="", flush=True)
            try:
                result = post(f"{API_BASE}/api/v0.1/symphonies/{entry['symphony_id']}/backtest", BODY)
                apply_backtest_result(entry, result)
                entry["refresh_date"] = today
                ok += 1
                streak_429 = 0
                print("OK")
            except urllib.error.HTTPError as e:
                streak_429 = streak_429 + 1 if e.code == 429 else 0
                reason = f"HTTPError {e.code}: {e.reason}"
                entry["flag"] = classify_error(reason)
                entry["error"] = reason
                fail += 1
                print(f"FAILED: {reason}")
            except Exception as e:
                reason = f"{type(e).__name__}: {e}"
                entry["flag"] = classify_error(reason)
                entry["error"] = reason
                fail += 1
                print(f"FAILED: {reason}")

            if (i + 1) % CHECKPOINT_EVERY == 0:
                write_atomic(work or JSON_PATH, entries)
                print(f"  -- checkpoint saved at {i + 1} rows --")
    finally:
        write_atomic(JSON_PATH, entries)
        write_js(entries)
        if work and work.exists():
            work.unlink()  # its contents are now in the repo file
        mins = (time.time() - started) / 60
        print(f"\nSaved. OK={ok} FAIL={fail} in {mins:.1f} min")


if __name__ == "__main__":
    main()
