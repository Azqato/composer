"""Daily price feed for the Backtester clone at /backtest/.

Default (daily, .github/workflows/refresh-backtest-prices.yml):
    python scripts/update_backtest_recent.py
Writes backtest/price-cache/_recent.js: the last ~30 trading days of every ticker that has a
snapshot file in backtest/price-cache/. One small file (about 200 KB), so the daily commit
does not grow the repository by the 40 MB that rewriting every snapshot would.

Full refresh (monthly, or by hand):
    python scripts/update_backtest_recent.py --full
Rewrites every snapshot file with its whole history, so _recent.js only ever needs to carry
the last few weeks.

Prices come straight from Yahoo's chart API (adjusted closes, the same series the
Backtester's own fetcher stores), with no relay: this runs on a server, not in a browser.
The page splices recent days onto each snapshot, rescaled on their last shared day, so a
dividend between the two downloads cannot put a step in the series.

Add tickers (full history, new snapshot files):
    python scripts/update_backtest_recent.py --add SPTL URTY

Safety: a ticker that fails keeps its previous entry; if more than a fifth fail (Yahoo
blocking the runner), nothing is written and the script exits non-zero.
"""
import json
import re
import sys
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ATLAS = Path(__file__).resolve().parent.parent
CACHE = ATLAS / "backtest" / "price-cache"
RECENT = CACHE / "_recent.js"
USER_AGENT = "Mozilla/5.0 (ComposerAtlas backtest price feed)"
RECENT_DAYS = 30
MAX_FAIL_SHARE = 0.2


def snapshot_files():
    """{ticker: path} for every shipped snapshot, ticker read from the file itself."""
    out = {}
    for path in sorted(CACHE.glob("*.js")):
        if path.name.startswith("_"):
            continue
        with open(path, encoding="utf-8") as f:
            head = f.read(400)
        m = re.search(r'__BT_PRICES__\["([^"]+)"\]', head)
        if m:
            out[m.group(1)] = path
    return out


def fetch(ticker, full):
    """(dates, adjusted closes, volumes) from Yahoo's daily chart."""
    span = "period1=0&period2=%d" % int(time.time()) if full else "range=3mo"
    url = ("https://query1.finance.yahoo.com/v8/finance/chart/%s?%s&interval=1d"
           "&includeAdjustedClose=true&events=div%%7Csplit" % (urllib.request.quote(ticker), span))
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    result = data["chart"]["result"][0]
    stamps = result.get("timestamp") or []
    quote = result["indicators"]["quote"][0]
    raw = quote.get("close") or [None] * len(stamps)
    adj = (result["indicators"].get("adjclose") or [{}])[0].get("adjclose") or raw
    vol = quote.get("volume") or [None] * len(stamps)
    dates, closes, volumes = [], [], []
    for k, ts in enumerate(stamps):
        c = adj[k]
        # Yahoo can leave the newest day's adjusted close blank while it processes the day;
        # the newest day has no pending adjustment, so its plain close is right (see refresh_rsi.py).
        if c is None and k == len(stamps) - 1:
            c = raw[k]
        if c is None or c <= 0:
            continue
        d = datetime.fromtimestamp(ts, tz=timezone.utc).date().isoformat()
        if dates and d == dates[-1]:
            continue
        dates.append(d)
        closes.append(c)
        volumes.append(vol[k])
    # A run before the close would store today's unfinished price as if final; drop it.
    if dates and dates[-1] >= session_open_date():
        dates, closes, volumes = dates[:-1], closes[:-1], volumes[:-1]
    return dates, closes, volumes


def session_open_date():
    """Today's New York date while the session is unfinished (before 4:30 pm), else a date after today."""
    from zoneinfo import ZoneInfo
    ny = datetime.now(ZoneInfo("America/New_York"))
    if ny.hour * 60 + ny.minute < 16 * 60 + 30:
        return ny.date().isoformat()
    return "9999-12-31"


def read_recent():
    if not RECENT.exists():
        return {}
    text = RECENT.read_text(encoding="utf-8")
    m = re.search(r"window\.__BT_RECENT__ = (\{.*\});", text, re.S)
    return json.loads(m.group(1))["prices"] if m else {}


def run_daily(tickers):
    old = read_recent()
    prices, failed = {}, []
    for t in tickers:
        try:
            dates, closes, _ = fetch(t, full=False)
            if not dates:
                raise ValueError("no rows")
            prices[t] = {"dates": dates[-RECENT_DAYS:], "closes": [round(c, 6) for c in closes[-RECENT_DAYS:]]}
        except Exception as e:  # keep yesterday's entry for this ticker
            failed.append("%s (%s)" % (t, e))
            if t in old:
                prices[t] = old[t]
        time.sleep(0.25)
    if len(failed) > MAX_FAIL_SHARE * len(tickers):
        sys.exit("%d of %d tickers failed; nothing written. First: %s" % (len(failed), len(tickers), failed[:3]))
    as_of = max((p["dates"][-1] for p in prices.values()), default="")
    body = json.dumps({"asOf": as_of, "prices": prices}, separators=(",", ":"))
    RECENT.write_text(
        "// Written by scripts/update_backtest_recent.py. Last %d trading days per ticker.\n"
        "window.__BT_RECENT__ = %s;\n" % (RECENT_DAYS, body), encoding="utf-8", newline="\n")
    print("Wrote %s: %d tickers through %s, %.0f KB. Failed: %d %s"
          % (RECENT.name, len(prices), as_of, RECENT.stat().st_size / 1024, len(failed), failed[:5]))


def run_full(files):
    failed, written = [], 0
    for t, path in files.items():
        try:
            dates, closes, volumes = fetch(t, full=True)
            old = path.read_text(encoding="utf-8")
            old_n = len(re.search(r'"dates":\[(.*?)\]', old).group(1).split(","))
            if len(dates) < 0.9 * old_n:  # a truncated answer must not shrink a good snapshot
                raise ValueError("only %d rows, snapshot has %d" % (len(dates), old_n))
            entry = {"ticker": t, "fetchedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                     "dates": dates, "closes": closes, "volumes": volumes}
            path.write_text(
                "window.__BT_PRICES__ = window.__BT_PRICES__ || {};\n"
                "window.__BT_PRICES__[%s] = %s;\n" % (json.dumps(t), json.dumps(entry, separators=(",", ":"))),
                encoding="utf-8", newline="\n")
            written += 1
        except Exception as e:
            failed.append("%s (%s)" % (t, e))
        time.sleep(0.4)
    print("Full refresh: %d rewritten, %d failed %s" % (written, len(failed), failed[:5]))
    if len(failed) > MAX_FAIL_SHARE * len(files):
        sys.exit("Too many failures; check before committing.")


def add_tickers(tickers):
    for t in tickers:
        path = CACHE / (re.sub(r"[^A-Za-z0-9.-]", "_", t) + ".js")  # same file name rule as fetch.mjs
        if path.exists():
            print("%s already has a snapshot; skipped" % t)
            continue
        dates, closes, volumes = fetch(t, full=True)
        if not dates:
            sys.exit("%s: Yahoo returned no prices" % t)
        entry = {"ticker": t, "fetchedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                 "dates": dates, "closes": closes, "volumes": volumes}
        path.write_text(
            "window.__BT_PRICES__ = window.__BT_PRICES__ || {};\n"
            "window.__BT_PRICES__[%s] = %s;\n" % (json.dumps(t), json.dumps(entry, separators=(",", ":"))),
            encoding="utf-8", newline="\n")
        print("Added %s: %d days, %s to %s" % (t, len(dates), dates[0], dates[-1]))


def main():
    if "--add" in sys.argv:
        add_tickers([a.upper() for a in sys.argv[sys.argv.index("--add") + 1:]])
    files = snapshot_files()
    if "--full" in sys.argv:
        run_full(files)
    run_daily(sorted(files))


if __name__ == "__main__":
    main()
