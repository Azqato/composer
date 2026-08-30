#!/usr/bin/env python3
"""
update_metrics.py: Fetch fresh data from the Composer API and update:
  - data/strategies.json + data/strategies.js  (backtest metrics for all strategies)
  - data/symphony_scores.json                   (full logic trees for all symphonies)

Symphony scores are stored for AI analysis and future reference only.
They are NOT served to the website.

Usage:
    python scripts/update_metrics.py

No API key required. Run from the project root or the scripts/ folder.
Run regularly (daily, or after any symphony logic changes).

Strategies whose last_updated is less than STALE_AFTER_DAYS old are skipped,
so this script can be run daily and will only refresh what's actually due
(and automatically retry any strategy that failed on a previous run).
"""

import json
import time
import urllib.request
from datetime import date, timedelta
from pathlib import Path

# ---- Paths ----
BASE_DIR        = Path(__file__).resolve().parent.parent
STRATEGIES_JSON = BASE_DIR / "data" / "strategies.json"
STRATEGIES_JS   = BASE_DIR / "data" / "strategies.js"
SCORES_JSON     = BASE_DIR / "data" / "symphony_scores.json"

# ---- Backtest parameters ----
BACKTEST_PARAMS = {
    "capital": 10000,
    "broker": "alpaca",
    "slippage_percent": 0.0005,
    "apply_reg_fee": True,
    "apply_taf_fee": True,
}

API_BASE = "https://api.composer.trade"

STALE_AFTER_DAYS = 7
API_CALL_DELAY_SECONDS = 2

# Fields in the API stats object that map 1:1 to our schema
DIRECT_FIELDS = [
    "annualized_rate_of_return",
    "cumulative_return",
    "calmar_ratio",
    "sharpe_ratio",
    "standard_deviation",
    "min",
    "mean",
    "median",
    "max",
    "trailing_one_month_return",
    "trailing_three_month_return",
    "trailing_one_year_return",
]


# Composer's edge (Cloudflare) blocks requests without a browser-like
# User-Agent (error code 1010), so every request needs one set explicitly.
USER_AGENT = "Mozilla/5.0 (compatible; composer-metrics-updater/1.0)"


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def post(url, body):
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": USER_AGENT},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


# ---- Backtest metrics ----

def update_strategies():
    strategies = json.loads(STRATEGIES_JSON.read_text(encoding="utf-8"))
    today = date.today().isoformat()
    stale_cutoff = date.today() - timedelta(days=STALE_AFTER_DAYS)
    failed = []
    calls_made = 0

    for s in strategies:
        sym_id = s["symphony_id"]

        last_updated = s.get("last_updated")
        if last_updated and date.fromisoformat(last_updated) > stale_cutoff:
            continue

        if calls_made > 0:
            time.sleep(API_CALL_DELAY_SECONDS)
        calls_made += 1

        print(f"  {s['name']} ... ", end="", flush=True)
        try:
            result = post(
                f"{API_BASE}/api/v0.1/symphonies/{sym_id}/backtest",
                BACKTEST_PARAMS,
            )
            stats = result["stats"]

            for field in DIRECT_FIELDS:
                if field in stats:
                    s[field] = stats[field]

            # API returns max_drawdown as positive; schema stores it negative
            s["max_drawdown"] = -abs(stats["max_drawdown"])

            # API calls it "size"; schema calls it backtest_days
            s["backtest_days"] = stats["size"]

            s["last_updated"] = today

            print(
                f"ARR {stats['annualized_rate_of_return']:+.1%}  "
                f"DD -{stats['max_drawdown']:.1%}  "
                f"Sharpe {stats['sharpe_ratio']:.2f}"
            )

        except Exception as exc:
            print(f"FAILED: {exc}")
            failed.append(s["name"])

    if calls_made == 0:
        print(f"  Nothing due (all strategies updated within the last {STALE_AFTER_DAYS} days)")

    if failed:
        print(f"\nWARNING: {len(failed)} strategies failed:")
        for name in failed:
            print(f"  - {name}")

    return strategies


def write_strategies_json(strategies):
    STRATEGIES_JSON.write_text(
        json.dumps(strategies, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"\nWrote {STRATEGIES_JSON.name}")


def write_strategies_js(strategies):
    comment = (
        "// Strategies data - loaded as a script tag so the site works with file:// protocol.\n"
        "// To update metrics: run scripts/update_metrics.py\n"
    )
    body = f"window.STRATEGIES_DATA = {json.dumps(strategies, indent=2, ensure_ascii=False)};\n"
    STRATEGIES_JS.write_text(comment + body, encoding="utf-8")
    print(f"Wrote {STRATEGIES_JS.name}")


# ---- Symphony logic trees ----

def update_scores(strategies):
    # Start from the existing file so a failed fetch keeps the last-known
    # score instead of being dropped from the output.
    scores = json.loads(SCORES_JSON.read_text(encoding="utf-8")) if SCORES_JSON.exists() else {}
    failed = []

    for i, s in enumerate(strategies):
        slug   = s["slug"]
        sym_id = s["symphony_id"]

        if i > 0:
            time.sleep(API_CALL_DELAY_SECONDS)

        print(f"  {s['name']} ... ", end="", flush=True)
        try:
            score = get(
                f"{API_BASE}/api/v0.1/symphonies/{sym_id}/score?score_version=v1"
            )
            scores[slug] = score
            print("OK")
        except Exception as exc:
            print(f"FAILED: {exc}")
            failed.append(s["name"])

    if failed:
        print(f"\nWARNING: {len(failed)} scores failed:")
        for name in failed:
            print(f"  - {name}")

    return scores


def write_scores_json(scores):
    SCORES_JSON.write_text(
        json.dumps(scores, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {SCORES_JSON.name}")


# ---- Main ----

if __name__ == "__main__":
    print("── Backtest metrics ──────────────────────────")
    strategies = update_strategies()
    write_strategies_json(strategies)
    write_strategies_js(strategies)

    print("\n── Symphony logic trees ──────────────────────")
    scores = update_scores(strategies)
    write_scores_json(scores)

    print("\nDone.")
