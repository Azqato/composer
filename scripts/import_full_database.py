#!/usr/bin/env python3
"""
import_full_database.py: One-time (safe to re-run) import of the raw
"Full Database.xlsx" spreadsheet into data/database.json, the canonical
JSON source for the full-database initiative (Database Overview /
Leaderboard / Screener).

The xlsx stores max_drawdown as positive; this script normalizes it to
negative to match the strategies.json schema convention.

Usage:
    python scripts/import_full_database.py

Re-running overwrites data/database.json from the current state of the
xlsx. Run scripts/refresh_full_database.py afterward to pull fresh
metrics from the Composer API.
"""

import json
from pathlib import Path

import openpyxl

BASE_DIR = Path(__file__).resolve().parent.parent
XLSX_PATH = BASE_DIR / "data" / "Full Database.xlsx"
JSON_PATH = BASE_DIR / "data" / "database.json"
JS_PATH = BASE_DIR / "data" / "database.js"

FIELDS = [
    "name",
    "symphony_url",
    "symphony_id",
    "annualized_rate_of_return",
    "max_drawdown",
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
    "backtest_days",
    "last_updated",
    "script_errors",
]

# Fields added in V1.9.1 (target schema expansion) that the xlsx does not
# contain. A fresh import initializes these to null; they are only ever
# populated by scripts/refresh_full_database.py hitting the live API.
EXTENDED_FIELDS = [
    "sortino_ratio",
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
    "last_market_days_holdings",
    "active_asset_nodes",
    "total_costs",
    "data_warnings",
    "last_semantic_update_at",
]


def extract_id(url):
    if not url or "/symphony/" not in url:
        return None
    return url.split("/symphony/")[1].split("/")[0]


def main():
    wb = openpyxl.load_workbook(XLSX_PATH, read_only=True, data_only=True)
    ws = wb["Sheet1"]

    entries = []
    for row in ws.iter_rows(min_row=2, values_only=True):
        (name, symphony_url, _sid, arr, max_dd, cum_ret, calmar, sharpe,
         std_dev, mn, mean, median, mx, t1m, t3m, t1y, size, last_updated,
         script_errors) = row

        entry = {
            "name": name,
            "symphony_url": symphony_url,
            "symphony_id": extract_id(symphony_url),
            "annualized_rate_of_return": arr,
            "max_drawdown": -abs(max_dd) if isinstance(max_dd, (int, float)) else None,
            "cumulative_return": cum_ret,
            "calmar_ratio": calmar,
            "sharpe_ratio": sharpe,
            "standard_deviation": std_dev,
            "min": mn,
            "mean": mean,
            "median": median,
            "max": mx,
            "trailing_one_month_return": t1m,
            "trailing_three_month_return": t3m,
            "trailing_one_year_return": t1y,
            "backtest_days": size,
            "last_updated": last_updated.date().isoformat() if hasattr(last_updated, "date") else last_updated,
            "script_errors": script_errors,
        }
        for field in EXTENDED_FIELDS:
            entry[field] = None
        entries.append(entry)

    JSON_PATH.write_text(
        json.dumps(entries, indent=2, ensure_ascii=False, default=str) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(entries)} entries to {JSON_PATH.name}")

    comment = (
        "// Full database data - loaded as a script tag so database.html works with file:// protocol.\n"
        "// To update: run scripts/import_full_database.py or scripts/refresh_full_database.py\n"
    )
    JS_PATH.write_text(
        comment + f"window.DATABASE_DATA = {json.dumps(entries, indent=2, ensure_ascii=False, default=str)};\n",
        encoding="utf-8",
    )
    print(f"Wrote {JS_PATH.name}")


if __name__ == "__main__":
    main()
