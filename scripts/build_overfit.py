# -*- coding: utf-8 -*-
"""Derive data/overfit.json (+ .js twin) for the Overfit Check page (V2.4).

Two things come out of this: the population findings the page leads with, and a
compact per-symphony index so a pasted URL or ID can be looked up in the browser
without shipping the 4MB database summary.

**Why two population cohorts and not one.** They measure different things and
the page reports both side by side, per owner decision 2026-09-07:

  trailing  Every symphony whose logic has gone at least a year unedited, with
            its backtested annual return compared against the actual return of
            the last twelve months. Unbiased: it includes the whole database,
            weak rows and all. But the backtest window still overlaps the year
            being measured, so it is out-of-sample with respect to *editing*
            rather than a clean holdout.

  true_oos  The rows in data/oos.json, each re-backtested over its own untouched
            period alone, so the window genuinely excludes everything the author
            could have fitted to. Strictly better per row, and **biased as a
            population**: those rows were selected by in-sample score for the
            Leaderboard's candidate set, so this cohort is roughly the stronger
            half of the database. Any figure from it describes that half, not
            the database, and the page must say so.

**Costs are already inside the backtest.** `total_costs` is reported by the same
backtest that produced `annualized_rate_of_return`, and refresh_full_database.py
requests it with slippage and both fee flags on. So the in-sample figure is net
of modelled costs, and the turnover result below is not simply "the backtest
ignored trading costs". Real slippage on a high-turnover strategy can still
exceed the model, which is why the page reports an association and not a cause.

Read-only against the database. Writes only its two output files.

    python scripts/build_overfit.py
"""
import datetime as dt
import io
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE = BASE_DIR / "data" / "database.json"
OOS = BASE_DIR / "data" / "oos.json"
JSON_PATH = BASE_DIR / "data" / "overfit.json"
JS_PATH = BASE_DIR / "data" / "overfit.js"

NOISE_FLAGS = ("caution", "excluded", "duplicate")
MIN_OOS_DAYS = 365          # a year unedited, matching the spec's cohort
QUINTILES = 5

TODAY = dt.date.today()


def num(v):
    return v if isinstance(v, (int, float)) else None


def oos_days(row):
    raw = row.get("oos_date")
    if not raw:
        return None
    try:
        return (TODAY - dt.date.fromisoformat(str(raw).split("[")[0][:10])).days
    except ValueError:
        return None


def median(xs):
    xs = sorted(xs)
    n = len(xs)
    if not n:
        return None
    return xs[n // 2] if n % 2 else (xs[n // 2 - 1] + xs[n // 2]) / 2.0


def r4(v):
    """Round for transport. Four decimals on a return fraction is a hundredth of
    a percentage point, far finer than anything the page displays."""
    return None if v is None else round(v, 4)


def load(path):
    return json.loads(io.open(path, encoding="utf-8").read())


def share(rows, pred):
    return round(100.0 * sum(1 for r in rows if pred(r)) / len(rows), 1) if rows else None


def trailing_cohort(usable):
    """Backtested annual return against the actual last twelve months, for every
    symphony whose logic has gone a year untouched."""
    c = [r for r in usable
         if (oos_days(r) or 0) >= MIN_OOS_DAYS
         and num(r.get("trailing_one_year_return")) is not None]
    arr = "annualized_rate_of_return"
    t1y = "trailing_one_year_return"
    return c, {
        "n": len(c),
        "median_backtest": r4(median([r[arr] for r in c])),
        "median_actual": r4(median([r[t1y] for r in c])),
        "delivered_full": share(c, lambda r: r[t1y] >= r[arr]),
        "delivered_half": share(c, lambda r: r[t1y] >= 0.5 * r[arr]),
        "positive": share(c, lambda r: r[t1y] > 0),
    }


def true_oos_cohort(usable, series):
    """The same comparison against a real out-of-sample backtest."""
    arr = "annualized_rate_of_return"
    pairs = [(r, series[r["symphony_id"]]) for r in usable if r["symphony_id"] in series]
    pairs = [(r, o) for r, o in pairs if num(o.get(arr)) is not None]
    return pairs, {
        "n": len(pairs),
        "median_backtest": r4(median([r[arr] for r, _o in pairs])),
        "median_actual": r4(median([o[arr] for _r, o in pairs])),
        "delivered_full": share(pairs, lambda p: p[1][arr] >= p[0][arr]),
        "delivered_half": share(pairs, lambda p: p[1][arr] >= 0.5 * p[0][arr]),
        "positive": share(pairs, lambda p: p[1][arr] > 0),
        "beat_spy": share(pairs, lambda p: (num(p[1].get("excess_return")) or 0) > 0),
        "median_days": median([o.get("oos_calendar_days") or 0 for _r, o in pairs]),
    }


def turnover_table(cohort):
    """Quintiles of annualized turnover against how much of the backtest
    survived. The strongest predictor in the database, and the one nobody
    reaches for when asked about overfitting."""
    c = [r for r in cohort if num(r.get("annualized_turnover")) is not None]
    c.sort(key=lambda r: r["annualized_turnover"])
    n = len(c)
    arr, t1y = "annualized_rate_of_return", "trailing_one_year_return"
    out, bounds = [], []
    for q in range(QUINTILES):
        g = c[q * n // QUINTILES:(q + 1) * n // QUINTILES]
        if not g:
            continue
        if q < QUINTILES - 1:
            bounds.append(round(g[-1]["annualized_turnover"], 1))
        out.append({
            "n": len(g),
            "lo": round(g[0]["annualized_turnover"], 1),
            "hi": round(g[-1]["annualized_turnover"], 1),
            "median_backtest": r4(median([r[arr] for r in g])),
            "median_actual": r4(median([r[t1y] for r in g])),
            "median_gap": r4(median([r[t1y] - r[arr] for r in g])),
        })
    return {"bounds": bounds, "quintiles": out, "n": n}


def build_index(usable, series):
    """Columnar, because 6,700 symphony ids as JSON object keys cost more than
    every number attached to them. Parallel arrays, one entry per id, nulls
    where a field is missing. The page rebuilds a Map on load.

    Names are carried despite costing more than every other column combined
    (194KB gzipped without them, 289KB with). Without a name the result is a
    wall of numbers about an opaque 20-character id, and the reader has no way
    to tell whether the thing they pasted resolved to the thing they meant."""
    ids, names, arr, t1y, days, turn = [], [], [], [], [], []
    oarr, oexc, odays = [], [], []
    for r in usable:
        sid = r.get("symphony_id")
        if not sid:
            continue
        o = series.get(sid) or {}
        ids.append(sid)
        names.append(r.get("name") or "")
        arr.append(r4(num(r.get("annualized_rate_of_return"))))
        t1y.append(r4(num(r.get("trailing_one_year_return"))))
        days.append(oos_days(r))
        turn.append(round(r["annualized_turnover"], 1)
                    if num(r.get("annualized_turnover")) is not None else None)
        oarr.append(r4(num(o.get("annualized_rate_of_return"))))
        oexc.append(r4(num(o.get("excess_return"))))
        odays.append(num(o.get("oos_calendar_days")))
    return {
        "ids": ids,
        "names": names,
        "backtest_arr": arr,
        "trailing_year": t1y,
        "oos_days": days,
        "turnover": turn,
        "true_oos_arr": oarr,
        "true_oos_excess": oexc,
        "true_oos_days": odays,
    }


def main():
    rows = load(DATABASE)
    series = load(OOS).get("series", {})

    usable = [r for r in rows
              if r.get("flag") not in NOISE_FLAGS
              and num(r.get("annualized_rate_of_return")) is not None]

    trailing, trailing_stats = trailing_cohort(usable)
    _pairs, true_stats = true_oos_cohort(usable, series)
    turnover = turnover_table(trailing)
    index = build_index(usable, series)

    payload = {
        "generated": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "reference_date": TODAY.isoformat(),
        "pool": len(usable),
        "min_oos_days": MIN_OOS_DAYS,
        "cohorts": {"trailing": trailing_stats, "true_oos": true_stats},
        "turnover": turnover,
        "index": index,
    }

    text = json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n"
    JSON_PATH.write_text(text, encoding="utf-8")
    JS_PATH.write_text(
        "// Overfit Check data, loaded as a script tag so overfit.html works\n"
        "// with the file:// protocol. To update: run scripts/build_overfit.py\n"
        "window.OVERFIT_DATA = " + text.rstrip("\n") + ";\n",
        encoding="utf-8")

    print("pool %d, trailing cohort %d, true-OOS cohort %d, index %d rows"
          % (len(usable), trailing_stats["n"], true_stats["n"], len(index["ids"])))
    print("wrote %s (%.0f KB) and its .js twin"
          % (JSON_PATH.name, JSON_PATH.stat().st_size / 1024.0))


if __name__ == "__main__":
    main()
