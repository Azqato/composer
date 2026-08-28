#!/usr/bin/env python3
"""
build_strategy_extras.py: join the 31 featured strategies to the full database
and to the K-1 database, and write the result as a small file the strategy
pages can load directly.

    data/strategies.json  +  data/database.json  +  data/k1.json
        -> data/strategy_extras.json  +  data/strategy_extras.js

Why a build step and not a browser join. `data/database.json` is 6,669 entries
and roughly 5 MB. Shipping it to a strategy page so that page could read one
row out of it would undo the page-weight work done in v1.16. The join key is
`symphony_id`, it is stable, and it changes only when the featured set changes,
so it belongs in a build artifact rather than in every visitor's browser.

Why it fails loudly. A missing `symphony_id` would otherwise render a strategy
page with an empty metrics block: still HTTP 200, still laid out correctly,
simply missing the sections. That is the same failure shape that took the
Signal Miner down in v1.22.2 and it is the reason check_html_js.py exists. So a
join miss here is a non-zero exit, not a warning.

Usage:
    python scripts/build_strategy_extras.py

Run it after any refresh that touches data/database.json or data/k1.json, and
after adding or removing a featured strategy. scripts/check_strategy_extras.py
rebuilds this in memory and fails the deploy if the committed file disagrees,
so a forgotten run is caught rather than shipped.

This script is deliberately NOT wired into .github/workflows/update-metrics.yml.
A join miss must fail the person who caused it, at their desk, rather than
breaking the nightly metrics job and its sitemap commit for everyone.
"""

import json
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
STRATEGIES = BASE_DIR / "data" / "strategies.json"
DATABASE = BASE_DIR / "data" / "database.json"
K1 = BASE_DIR / "data" / "k1.json"
OUT_JSON = BASE_DIR / "data" / "strategy_extras.json"
OUT_JS = BASE_DIR / "data" / "strategy_extras.js"

# Fields carried over from the database row. Everything here is already
# computed by the Composer API and stored; none of it is derived by this
# script. Items 2, 3, 6 and 8 of the V1.20 roadmap consume the ones the pages
# do not render yet, which is why they are carried now rather than added later
# one at a time.
CARRY = [
    "oos_date",
    "refresh_date",
    "top_one_day_contribution",
    "top_five_percent_day_contribution",
    "top_ten_percent_day_contribution",
    "sortino_ratio",
    "win_rate",
    "skewness",
    "kurtosis",
    "tail_ratio",
    "herfindahl_index",
    "annualized_turnover",
    "total_costs",
]

# The cash sleeve is a position, not a holding anyone receives a tax form for.
CASH = "$USD"


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


def build():
    strategies = load(STRATEGIES)
    database = load(DATABASE)
    k1 = load(K1)["tickers"]

    by_id = {}
    for row in database:
        by_id[row["symphony_id"]] = row

    missing = [s["slug"] for s in strategies if s["symphony_id"] not in by_id]
    if missing:
        raise SystemExit(
            "FAIL: %d featured strateg%s have no row in data/database.json: %s\n"
            "The strategy page for each of these would render with its new sections\n"
            "silently empty. Add the symphony to the database and refresh it, or\n"
            "remove it from data/strategies.json." % (
                len(missing), "y" if len(missing) == 1 else "ies", ", ".join(missing))
        )

    extras = {}
    unknown = set()

    for s in strategies:
        row = by_id[s["symphony_id"]]
        holdings = row.get("last_market_days_holdings") or {}
        tickers = sorted(t for t in holdings if t != CASH)

        # `last_market_days_holdings` keys are the ticker universe the logic can
        # reach; its values are today's position, and most of them are 0.0. So a
        # ticker appearing here means the strategy CAN hold it, not that it does,
        # and the page must not claim otherwise. `held` carries the distinction.
        k1_holdings = []
        etn_holdings = []
        for t in tickers:
            fund = k1.get(t)
            if fund is None:
                # Expected for individual stocks, which were deliberately purged
                # from the K-1 database in v1.27.5: a stock never issues a K-1.
                # Reported in the run summary rather than failing, because this
                # script cannot tell a stock from a fund nobody has checked yet.
                unknown.add(t)
                continue
            if fund.get("k1") is True:
                k1_holdings.append({
                    "ticker": t,
                    "name": fund.get("name"),
                    "tax_form": fund.get("tax_form") or "Schedule K-1",
                    "held": bool(holdings.get(t)),
                })
            if (fund.get("structure") or "").upper() == "ETN":
                etn_holdings.append({
                    "ticker": t,
                    "name": fund.get("name"),
                    "held": bool(holdings.get(t)),
                })

        entry = {"symphony_id": s["symphony_id"]}
        for key in CARRY:
            entry[key] = row.get(key)
        entry["holdings"] = {t: holdings[t] for t in tickers}
        entry["k1_holdings"] = k1_holdings
        entry["etn_holdings"] = etn_holdings
        extras[s["slug"]] = entry

    return strategies, extras, sorted(unknown)


def payload(extras):
    return json.dumps(extras, indent=2, ensure_ascii=False, sort_keys=True)


def main():
    strategies, extras, unknown = build()
    body = payload(extras)

    OUT_JSON.write_text(body + "\n", encoding="utf-8")
    OUT_JS.write_text(
        "// Strategy extras: the featured strategies joined to the full database and the\n"
        "// K-1 database at build time. Loaded as a script tag so strategies.html works\n"
        "// with the file:// protocol.\n"
        "// To update: run scripts/build_strategy_extras.py\n"
        "window.STRATEGY_EXTRAS_DATA = " + body + ";\n",
        encoding="utf-8",
    )

    k1_count = sum(1 for e in extras.values() if e["k1_holdings"])
    etn_count = sum(1 for e in extras.values() if e["etn_holdings"])
    no_oos = sorted(k for k, e in extras.items() if not e.get("oos_date"))
    outlier = sorted(
        k for k, e in extras.items()
        if (e.get("top_five_percent_day_contribution") or 0) > 1
    )

    print("Joined %d of %d featured strategies, 0 misses." % (len(extras), len(strategies)))
    print("  holding a K-1 issuer: %d" % k1_count)
    print("  holding an ETN:       %d" % etn_count)
    print("  best 5%% of days above 100%% of total return: %d" % len(outlier))
    if no_oos:
        print("  no oos_date (the panel renders as \"not recorded\"): %s" % ", ".join(no_oos))
    if unknown:
        print("  held but not in the K-1 database (%d): %s" % (len(unknown), ", ".join(unknown)))
        print("    Expected for individual stocks. Anything here that is a fund is a real gap:")
        print("    add it to data/k1_seed.txt and rerun scripts/refresh_k1.py.")
    print("Wrote %s and %s" % (OUT_JSON.name, OUT_JS.name))
    return 0


if __name__ == "__main__":
    sys.exit(main())
