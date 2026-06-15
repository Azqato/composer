#!/usr/bin/env python3
"""
update_metrics.py — Fetch fresh data from the Composer API and update:
  - data/strategies.json + data/strategies.js  (backtest metrics for all 18 strategies)
  - data/symphony_scores.json                   (full logic trees for all 18 symphonies)

Symphony scores are stored for AI analysis and future reference only.
They are NOT served to the website.

Usage:
    python scripts/update_metrics.py

No API key required. Run from the project root or the scripts/ folder.
Run regularly (monthly or after any symphony logic changes).
"""

import json
import urllib.request
from datetime import date
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


def get(url: str) -> dict:
    with urllib.request.urlopen(url, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def post(url: str, body: dict) -> dict:
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


# ---- Backtest metrics ----

def update_strategies() -> list:
    strategies = json.loads(STRATEGIES_JSON.read_text(encoding="utf-8"))
    today = date.today().isoformat()
    failed = []

    for s in strategies:
        sym_id = s["symphony_id"]
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
            print(f"FAILED — {exc}")
            failed.append(s["name"])

    if failed:
        print(f"\nWARNING: {len(failed)} strategies failed:")
        for name in failed:
            print(f"  - {name}")

    return strategies


def write_strategies_json(strategies: list) -> None:
    STRATEGIES_JSON.write_text(
        json.dumps(strategies, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"\nWrote {STRATEGIES_JSON.name}")


def write_strategies_js(strategies: list) -> None:
    comment = (
        "// Strategies data — loaded as a script tag so the site works with file:// protocol.\n"
        "// To update metrics: run scripts/update_metrics.py\n"
    )
    body = f"window.STRATEGIES_DATA = {json.dumps(strategies, indent=2, ensure_ascii=False)};\n"
    STRATEGIES_JS.write_text(comment + body, encoding="utf-8")
    print(f"Wrote {STRATEGIES_JS.name}")


# ---- Symphony logic trees ----

def update_scores(strategies: list) -> dict:
    scores = {}
    failed = []

    for s in strategies:
        slug   = s["slug"]
        sym_id = s["symphony_id"]
        print(f"  {s['name']} ... ", end="", flush=True)
        try:
            score = get(
                f"{API_BASE}/api/v0.1/symphonies/{sym_id}/score?score_version=v1"
            )
            scores[slug] = score
            print("OK")
        except Exception as exc:
            print(f"FAILED — {exc}")
            failed.append(s["name"])

    if failed:
        print(f"\nWARNING: {len(failed)} scores failed:")
        for name in failed:
            print(f"  - {name}")

    return scores


def write_scores_json(scores: dict) -> None:
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
