# -*- coding: utf-8 -*-
"""Derive data/overfit.json (+ .js twin) for the Overfit Check page (V2.4).

Three things come out of this: the population findings the page leads with, the
"par" curve the Overfit Score is read against, and a compact per-symphony index
so a pasted URL or ID can be looked up in the browser without shipping the 19MB
database.

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

**THE FITTED-ERA SPLIT, added 2026-09-08.** The full backtest RUNS THROUGH
TODAY, so it already contains the out-of-sample window inside it. Comparing the
two directly compares a period against a superset of itself, which drags them
together and understates the degradation. The full window is the fitted era
chained onto the untouched era, so the fitted era is recoverable by arithmetic
rather than by another 3,000 API calls:

    (1 + cum_full) = (1 + cum_fitted) * (1 + cum_oos)
    years          = ln(1 + cumulative_return) / ln(1 + annualized_rate_of_return)

Window length comes from that log ratio and NOT from `backtest_days`, which is
in *trading* days (1704 = 6.77 years) and would need a conversion factor that is
itself an assumption. Verified to 3.55e-15 log points against the stored full
cumulative, on 3,236 of 3,257 rows.

**THE OVERFIT SCORE.** `100 * (1 - delivered / fitted)`, clamped to 0..100,
where both terms are annualized rates over their own eras. It is deliberately
**one measured quantity with no weights**: docs/PRD.md rules out a composite
score because its weights would be unfalsifiable and would invite the very
optimisation the page exists to detect. A single ratio has no weights to tune,
is reversible (the reader can recover the inputs, which are printed beside it),
and can be checked against outcomes.

**It contains no population data at all.** That is the point. The population
supplies only the separate `par` curve shown next to the score, the way par is
shown beside a golf score, because the expected shortfall is itself a strong
function of how big the fitted rate was (rho -0.556 between fitted rate and
retention). Reading a score without par would flag every ambitious backtest.
Keeping par *outside* the number also keeps the score clear of the peer-ranking
framing the owner rejected 2026-08-28.

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
import math
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE = BASE_DIR / "data" / "database.json"
OOS = BASE_DIR / "data" / "oos.json"
JSON_PATH = BASE_DIR / "data" / "overfit.json"
JS_PATH = BASE_DIR / "data" / "overfit.js"

NOISE_FLAGS = ("caution", "excluded", "duplicate")
MIN_OOS_DAYS = 365          # a year unedited, matching the spec's cohort
QUINTILES = 5
MIN_FITTED_YEARS = 0.5      # below this, annualizing a stub window explodes
PAR_WINDOW = 200            # neighbours each side for the sliding par median
PAR_POINTS = 24             # par curve samples written to the page
CEILING_MIN_FITTED_YEARS = 5.0   # removes short-window noise from the ceiling

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


def years_of(cum, arr):
    """Window length implied by a cumulative return and its annualized rate.

    Preferred over backtest_days, which is in trading days and would need an
    assumed conversion factor."""
    if cum is None or arr is None or cum <= -1 or arr <= -1 or arr == 0:
        return None
    try:
        return math.log1p(cum) / math.log1p(arr)
    except ValueError:
        return None


def fitted_era(row, o):
    """(fitted_arr, fitted_years) for the era the author could tune against, or
    None when the split cannot be taken honestly."""
    cf, af = num(row.get("cumulative_return")), num(row.get("annualized_rate_of_return"))
    co, ao = num(o.get("cumulative_return")), num(o.get("annualized_rate_of_return"))
    yf, yo = years_of(cf, af), years_of(co, ao)
    if None in (cf, af, co, ao, yf, yo):
        return None
    yi = yf - yo
    if yi < MIN_FITTED_YEARS:
        return None
    ratio = (1.0 + cf) / (1.0 + co)
    if ratio <= 0:
        return None
    return (ratio ** (1.0 / yi) - 1.0, yi)


def overfit_score(delivered, fitted):
    """How much of the fitted era's rate failed to survive, 0..100.

    One quantity, no weights, no population input. A negative fitted rate has no
    promise to break, so it is not scored."""
    if delivered is None or fitted is None or fitted <= 0:
        return None
    return max(0.0, min(100.0, 100.0 * (1.0 - delivered / fitted)))


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


def split_cohort(usable, series):
    """Every row where the fitted era can be recovered, with its score."""
    out = []
    for r in usable:
        o = series.get(r.get("symphony_id"))
        if not o:
            continue
        fe = fitted_era(r, o)
        ao = num(o.get("annualized_rate_of_return"))
        if fe is None or ao is None:
            continue
        fitted, fyears = fe
        if fitted <= 0:
            continue
        out.append({
            "row": r, "oos": o, "fitted": fitted, "fitted_years": fyears,
            "delivered": ao, "score": overfit_score(ao, fitted),
        })
    out.sort(key=lambda x: x["fitted"])
    return out


def par_curve(split):
    """Median score among neighbours in fitted rate: what a backtest THIS BIG
    typically loses. Sampled down to PAR_POINTS for transport; the page
    interpolates between them.

    Nonparametric on purpose. Fitting a curve here would put a functional-form
    assumption underneath the one number the page asks readers to trust."""
    n = len(split)
    if n < 2 * PAR_WINDOW:
        return {"fitted": [], "score": []}
    scores = [x["score"] for x in split]
    fitted = [x["fitted"] for x in split]
    xs, ys = [], []
    for k in range(PAR_POINTS):
        i = int(round(k * (n - 1) / float(PAR_POINTS - 1)))
        lo, hi = max(0, i - PAR_WINDOW), min(n, i + PAR_WINDOW + 1)
        xs.append(r4(fitted[i]))
        ys.append(round(median(scores[lo:hi]), 1))
    return {"fitted": xs, "score": ys}


def score_distribution(split):
    s = sorted(x["score"] for x in split)
    n = len(s)
    if not n:
        return {}
    q = lambda p: round(s[min(n - 1, int(p / 100.0 * n))], 1)
    return {
        "n": n, "p10": q(10), "p25": q(25), "p50": q(50), "p75": q(75), "p90": q(90),
        "at_zero": round(100.0 * sum(1 for x in s if x <= 0) / n, 1),
        "at_hundred": round(100.0 * sum(1 for x in s if x >= 100) / n, 1),
    }


def ceiling_table(split):
    """Median untouched return by fitted-rate decile, restricted to long fitted
    windows so short-window noise cannot drive it.

    The finding: a better backtest predicts a better future right up to roughly
    +240% a year, and above that it reverses, with the top decile delivering
    less than the most modest one."""
    long = [x for x in split if x["fitted_years"] >= CEILING_MIN_FITTED_YEARS]
    n = len(long)
    if n < 100:
        return {"n": 0, "bins": [], "min_fitted_years": CEILING_MIN_FITTED_YEARS}
    bins = []
    for d in range(10):
        g = long[d * n // 10:(d + 1) * n // 10]
        if not g:
            continue
        bins.append({
            "fitted": r4(median([x["fitted"] for x in g])),
            "delivered": r4(median([x["delivered"] for x in g])),
            "n": len(g),
        })
    peak = max(bins, key=lambda b: b["delivered"]) if bins else None
    return {
        "n": n, "bins": bins,
        "min_fitted_years": CEILING_MIN_FITTED_YEARS,
        "peak_fitted": peak["fitted"] if peak else None,
        "peak_delivered": peak["delivered"] if peak else None,
        "top_fitted": bins[-1]["fitted"] if bins else None,
        "top_delivered": bins[-1]["delivered"] if bins else None,
        "bottom_fitted": bins[0]["fitted"] if bins else None,
        "bottom_delivered": bins[0]["delivered"] if bins else None,
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
    cols = {k: [] for k in (
        "ids", "names", "backtest_arr", "trailing_year", "oos_days", "turnover",
        "true_oos_arr", "true_oos_excess", "true_oos_days", "true_oos_cumulative",
        "true_oos_spy", "fitted_arr", "fitted_years", "score")}
    for r in usable:
        sid = r.get("symphony_id")
        if not sid:
            continue
        o = series.get(sid) or {}
        cols["ids"].append(sid)
        cols["names"].append(r.get("name") or "")
        cols["backtest_arr"].append(r4(num(r.get("annualized_rate_of_return"))))
        cols["trailing_year"].append(r4(num(r.get("trailing_one_year_return"))))
        cols["oos_days"].append(oos_days(r))
        cols["turnover"].append(round(r["annualized_turnover"], 1)
                                if num(r.get("annualized_turnover")) is not None else None)
        ao = num(o.get("annualized_rate_of_return"))
        cols["true_oos_arr"].append(r4(ao))
        cols["true_oos_excess"].append(r4(num(o.get("excess_return"))))
        cols["true_oos_days"].append(num(o.get("oos_calendar_days")))
        # Cumulative over the untouched window, and SPY's cumulative over the
        # same window. An annualized rate alone is easy to misread across a
        # multi-year window, and excess_return is itself cumulative, so showing
        # it beside an annualized figure without its cumulative sibling puts two
        # different units next to each other under similar labels.
        cols["true_oos_cumulative"].append(r4(num(o.get("cumulative_return"))))
        cols["true_oos_spy"].append(r4(num(o.get("spy_return"))))
        fe = fitted_era(r, o) if o else None
        cols["fitted_arr"].append(r4(fe[0]) if fe else None)
        cols["fitted_years"].append(round(fe[1], 2) if fe else None)
        sc = overfit_score(ao, fe[0]) if fe else None
        cols["score"].append(round(sc, 1) if sc is not None else None)
    return cols


def main():
    rows = load(DATABASE)
    series = load(OOS).get("series", {})

    usable = [r for r in rows
              if r.get("flag") not in NOISE_FLAGS
              and num(r.get("annualized_rate_of_return")) is not None]

    trailing, trailing_stats = trailing_cohort(usable)
    _pairs, true_stats = true_oos_cohort(usable, series)
    split = split_cohort(usable, series)
    turnover = turnover_table(trailing)
    index = build_index(usable, series)

    payload = {
        "generated": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "reference_date": TODAY.isoformat(),
        "pool": len(usable),
        "min_oos_days": MIN_OOS_DAYS,
        "cohorts": {"trailing": trailing_stats, "true_oos": true_stats},
        "turnover": turnover,
        "par": par_curve(split),
        "score_distribution": score_distribution(split),
        "ceiling": ceiling_table(split),
        "index": index,
    }

    text = json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n"
    JSON_PATH.write_text(text, encoding="utf-8")
    JS_PATH.write_text(
        "// Overfit Check data, loaded as a script tag so overfit.html works\n"
        "// with the file:// protocol. To update: run scripts/build_overfit.py\n"
        "window.OVERFIT_DATA = " + text.rstrip("\n") + ";\n",
        encoding="utf-8")

    d = payload["score_distribution"]
    print("pool %d, trailing %d, true-OOS %d, fitted split %d, index %d rows"
          % (len(usable), trailing_stats["n"], true_stats["n"], len(split), len(index["ids"])))
    print("score p10/p50/p90 = %.1f / %.1f / %.1f" % (d["p10"], d["p50"], d["p90"]))
    print("wrote %s (%.0f KB) and its .js twin"
          % (JSON_PATH.name, JSON_PATH.stat().st_size / 1024.0))


if __name__ == "__main__":
    main()
