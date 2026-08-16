#!/usr/bin/env python3
"""
refresh_prices.py: Fetch full daily adjusted-close history for the Signal Miner
ticker universe and write:
  - data/prices.json
  - data/prices.js   (window.PRICES_DATA, for file:// compatibility)

The Signal Miner page (signal-miner.html) reads this committed data and runs the
entire signal-generation + backtest in the browser. No live fetching happens
client-side (Yahoo's chart API is CORS-blocked from browsers and rate-limits
datacenter traffic), so this script plays the same role refresh_rsi.py plays
for the RSI page: a server-side (or local) fetch that commits static data.

Usage:
    python scripts/refresh_prices.py

No API key required. Run from the project root. Intended to run on a weekly
schedule via a GitHub Action; safe to run manually any time.
"""

import json
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
PRICES_JSON = BASE_DIR / "data" / "prices.json"
PRICES_JS = BASE_DIR / "data" / "prices.js"

# Only keep history from this date onward. Bounds the file size and starts
# after the youngest widely-used leveraged/vol tickers (e.g. reformed SVXY)
# have clean data.
START_DATE = "2018-01-01"
API_CALL_DELAY_SECONDS = 1
USER_AGENT = "Mozilla/5.0 (compatible; composer-atlas-signal-miner/1.0)"

# Signal Miner universe. The 20 Frontrunner RSI tickers (see refresh_rsi.py) plus
# the common signal / hedge / leveraged tickers used across the strategy library
# and the community IF-THEN signal miners.
TICKERS = [
    # --- Frontrunner RSI signal universe ---
    ("XLF", "Financial Select Sector SPDR"),
    ("SPYV", "SPDR Portfolio S&P 500 Value"),
    ("VTV", "Vanguard Value ETF"),
    ("SPY", "SPDR S&P 500 ETF"),
    ("IOO", "iShares Global 100 ETF"),
    ("UUP", "Invesco DB US Dollar Index Bullish"),
    ("FXI", "iShares China Large-Cap ETF"),
    ("QQQE", "Direxion NASDAQ-100 Equal Weighted"),
    ("XLK", "Technology Select Sector SPDR"),
    ("QQQ", "Invesco QQQ Trust"),
    ("XLE", "Energy Select Sector SPDR"),
    ("VOX", "Vanguard Communication Services ETF"),
    ("TECL", "Direxion Daily Technology Bull 3x"),
    ("SOXX", "iShares Semiconductor ETF"),
    ("RETL", "Direxion Daily Retail Bull 3x"),
    ("XLY", "Consumer Discretionary Select Sector SPDR"),
    ("EEM", "iShares MSCI Emerging Markets ETF"),
    ("GLD", "SPDR Gold Shares"),
    ("XLP", "Consumer Staples Select Sector SPDR"),
    ("TLT", "iShares 20+ Year Treasury Bond ETF"),
    # --- Common signal / hedge / diversifier tickers ---
    ("VIXM", "ProShares VIX Mid-Term Futures"),
    ("BTAL", "AGFiQ US Market Neutral Anti-Beta"),
    ("KMLM", "KFA Mount Lucas Managed Futures"),
    ("DBMF", "iMGP DBi Managed Futures Strategy"),
    ("BIL", "SPDR Bloomberg 1-3 Month T-Bill"),
    # --- Leveraged / inverse / volatility tickers ---
    ("TQQQ", "ProShares UltraPro QQQ 3x"),
    ("SQQQ", "ProShares UltraPro Short QQQ 3x"),
    ("SOXL", "Direxion Daily Semiconductor Bull 3x"),
    ("UPRO", "ProShares UltraPro S&P500 3x"),
    ("TMF", "Direxion Daily 20+ Year Treasury Bull 3x"),
    ("TMV", "Direxion Daily 20+ Year Treasury Bear 3x"),
    ("UVXY", "ProShares Ultra VIX Short-Term Futures"),
    ("VXX", "iPath Series B S&P 500 VIX Short-Term"),
    ("SVXY", "ProShares Short VIX Short-Term Futures"),
    ("PSQ", "ProShares Short QQQ"),
    ("GDXU", "MicroSectors Gold Miners 3x Leveraged ETN"),
    ("GDXD", "MicroSectors Gold Miners -3x Inverse ETN"),
]


def fetch_daily_closes(symbol: str) -> dict:
    """Returns {date_iso: adjusted_close} from START_DATE onward."""
    url = (
        f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
        f"?range=10y&interval=1d&events=div,splits"
    )
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    result = data["chart"]["result"][0]
    timestamps = result["timestamp"]
    quote = result["indicators"]["quote"][0]
    adjclose = result["indicators"].get("adjclose", [{}])[0].get("adjclose", quote["close"])

    out = {}
    for ts, close in zip(timestamps, adjclose):
        if close is None:
            continue
        d = datetime.fromtimestamp(ts, tz=timezone.utc).date().isoformat()
        if d >= START_DATE:
            out[d] = round(float(close), 4)
    return out


def refresh() -> tuple[list, dict]:
    """Returns (master_dates, {symbol: {name, closes_aligned_to_master}})."""
    fetched = {}
    failed = []

    for i, (symbol, name) in enumerate(TICKERS):
        if i > 0:
            time.sleep(API_CALL_DELAY_SECONDS)
        print(f"  {symbol} ... ", end="", flush=True)
        try:
            series = fetch_daily_closes(symbol)
            fetched[symbol] = {"name": name, "series": series}
            first = min(series) if series else "?"
            print(f"{len(series)} rows (from {first})")
        except Exception as exc:
            print(f"FAILED: {exc}")
            failed.append(symbol)

    if failed:
        print(f"\nWARNING: {len(failed)} tickers failed: {', '.join(failed)}")

    # Master date axis = sorted union of every ticker's trading days.
    all_dates = set()
    for info in fetched.values():
        all_dates.update(info["series"].keys())
    master = sorted(all_dates)

    # Align each ticker onto the master axis; None where the ticker has no bar.
    tickers_out = {}
    for symbol, info in fetched.items():
        series = info["series"]
        closes = [series.get(d) for d in master]
        tickers_out[symbol] = {"name": info["name"], "closes": closes}

    return master, tickers_out


def write_output(master: list, tickers_out: dict) -> None:
    payload = {
        "refreshed_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "start": START_DATE,
        "dates": master,
        "tickers": tickers_out,
    }

    # Compact separators keep the file small (it is mostly numbers).
    text = json.dumps(payload, separators=(",", ":"), ensure_ascii=False)
    PRICES_JSON.write_text(text + "\n", encoding="utf-8")
    print(f"\nWrote {PRICES_JSON.name} ({len(text) // 1024} KB, {len(master)} dates, {len(tickers_out)} tickers)")

    comment = (
        "// Signal Miner price history - loaded as a script tag so the page works with file:// protocol.\n"
        "// To update: run scripts/refresh_prices.py\n"
    )
    body = f"window.PRICES_DATA = {text};\n"
    PRICES_JS.write_text(comment + body, encoding="utf-8")
    print(f"Wrote {PRICES_JS.name}")


if __name__ == "__main__":
    print("-- Signal Miner Price Refresh --------------------")
    master, tickers_out = refresh()
    if not tickers_out:
        raise SystemExit("No tickers succeeded; refusing to write empty output.")
    write_output(master, tickers_out)
    print("\nDone.")
