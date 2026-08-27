#!/usr/bin/env python3
"""
refresh_k1.py: Build and refresh data/k1.json, the master K-1 database behind k1.html.

What question this answers: **does this ETF issue a Schedule K-1 instead of a 1099?**
It matters because a K-1 arrives late (often after the April filing deadline), complicates
a return, and can create taxable income even in a year the holder sold nothing. Plenty of
Composer symphonies hold these instruments without their authors realising it.

**The signal is the fund's legal structure, not a "has K-1" field.** No data source
publishes a K-1 flag directly. etfdb.com publishes a `Structure` field on every fund page,
and structure determines the tax form:

    Commodity Pool  -> Schedule K-1.  A partnership for tax purposes; income, gains and
                       losses pass through to holders. This is the whole answer: every
                       leveraged/inverse VIX product, most futures-based commodity funds,
                       and several leveraged Treasury funds sit here.
    ETF             -> Form 1099.     A regulated investment company under the 1940 Act.
    ETN             -> Form 1099-B.   A senior unsecured debt note, not a fund at all.
    Grantor Trust   -> Form 1099-B.   Direct undivided interest in the underlying (the
                       physical metal trusts). Taxed at the 28% collectibles rate, which
                       is why their long-term rate reads 28.00% rather than 20.00%.
    UIT             -> Form 1099.     Unit investment trust (SPY, QQQ and DIA are these).

**A second, independent field corroborates every verdict**, which is why both are stored.
etfdb's Tax Analysis block gives max short- and long-term capital gains rates, and they
fall out of the structure rather than being copied from it:

    27.84% / 27.84%  identical, and neither a standard rate: the 60/40 blend that
                     Section 1256 contracts get. Commodity pools, and nothing else.
    39.60% / 28.00%  the collectibles rate. Grantor trusts.
    39.60% / 20.00%  ordinary rates. Everything else.

So a Commodity Pool whose rates are not 27.84/27.84, or a non-pool whose rates are, is a
contradiction between two independent readings. The script records `agrees: false` on that
row rather than silently preferring one, because a disagreement means the page shape
changed or the fund is genuinely unusual, and both deserve a human look. Nothing in this
file is inferred from the ticker symbol or the fund's name.

**When a human look finds the source wrong, the correction lives in `OVERRIDES` below**, not in
`data/k1.json`, because a hand-edited row is silently undone by the next refresh. Each entry
carries the reasoning that justified it and the page prints that reasoning rather than quietly
showing a different answer. One entry exists today: see the table for what earned it.

**Why this is a build script and not a live lookup.** etfdb.com sits behind Cloudflare bot
mitigation and sends no `access-control-allow-origin` header, so a browser cannot read it
from k1.html and neither can a public CORS relay. The lookup is therefore local: this
script fetches on a maintainer's machine, and the page ships the answers. That also makes
the page instant and keeps working offline, which a live lookup never would.

Politeness: one request at a time, 1.5s apart, browser User-Agent (a default urllib agent
is refused). A checkpoint is written every 10 tickers, so an interrupted run keeps its
progress and re-running skips what it already has.

Usage:
    python scripts/refresh_k1.py                 # fetch anything missing or stale
    python scripts/refresh_k1.py --all           # re-fetch every known ticker
    python scripts/refresh_k1.py SOXL USO UVXY   # add or refresh specific tickers
    python scripts/refresh_k1.py --seed          # add the built-in candidate list first

Structures change rarely (a fund would have to reorganise), so the default staleness
window is deliberately long. Re-run after adding tickers, then commit data/k1.json and
data/k1.js together: the .js twin is what k1.html reads over file://.
"""

import argparse
import datetime
import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
JSON_PATH = BASE_DIR / "data" / "k1.json"
JS_PATH = BASE_DIR / "data" / "k1.js"
SEED_PATH = BASE_DIR / "data" / "k1_seed.txt"

SOURCE_URL = "https://etfdb.com/etf/{}/"
# The public page the site links to for a human to verify a verdict themselves. The
# #expense anchor lands on the overview block that carries the Structure field.
HUMAN_URL = "https://etfdb.com/etf/{}/#expense"

# etfdb refuses Python's default User-Agent. This is not an attempt to look like something
# it is not; the requests are slow, sequential and few.
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

THROTTLE_SECONDS = 1.5
CHECKPOINT_EVERY = 10
STALE_AFTER_DAYS = 180

# The one structure that means a K-1. Kept as a set rather than a string comparison
# because etfdb has used both "Commodity Pool" and "Commodity Pool " in the past.
K1_STRUCTURES = {"commodity pool"}

# Structure -> the form a holder actually receives. Anything not listed here is reported
# as an unrecognised structure rather than guessed at.
TAX_FORMS = {
    "commodity pool": "Schedule K-1",
    "etf": "Form 1099",
    "etn": "Form 1099-B",
    "grantor trust": "Form 1099-B",
    "uit": "Form 1099",
    "unit investment trust": "Form 1099",
}

# The capital-gains rate pair each structure implies, used only to corroborate.
EXPECTED_RATES = {
    "commodity pool": ("27.84%", "27.84%"),
    "grantor trust": ("39.60%", "28.00%"),
}
DEFAULT_RATES = ("39.60%", "20.00%")

# Corrections to the source, each one verified against SEC EDGAR and each one kept here rather
# than edited into data/k1.json, because a hand-edited row is silently undone by the next refresh.
#
# **The bar for adding an entry is a positive independent finding, never a hunch.** The test that
# produced the entry below is worth repeating for any future candidate: EDGAR publishes
# `company_tickers_mf.json`, and it lists **only** funds registered under the Investment Company Act
# of 1940. Series and class identifiers are a 1940-Act construct, so a commodity pool cannot appear
# in that file and a registered fund cannot be a commodity pool. Presence there is therefore proof
# of 1099 treatment rather than an argument for it. The whole database was swept against that file
# when it was built: of 42 tickers the source called commodity pools, exactly one appeared.
OVERRIDES = {
    "CMDY": {
        "structure": "ETF",
        "k1": False,
        "tax_form": "Form 1099",
        "override": (
            "etfdb lists this as a Commodity Pool, which would mean a K-1. SEC EDGAR lists it "
            "with a 1940-Act series and class identifier (S000061337, class "
            "C000198581, CIK 1524513), so it is a registered "
            "investment company and issues a 1099. The capital gains rates on etfdb's own page "
            "(39.60%/20.00%, not the 27.84%/27.84% every real commodity pool shows) agree with "
            "EDGAR rather than with the structure label."
        ),
    },
    # The five below change no verdict. They exist because the two source fields contradict each
    # other on these rows, which would otherwise print "treat this answer as unconfirmed" over an
    # answer that has in fact been confirmed. An entry that only carries a note is the honest way
    # to say "checked, and the verdict stands".
    "SOYB": {
        "override": (
            "etfdb's capital gains rates for this fund (39.60%/20.00%) do not match its own "
            "Commodity Pool structure, so the two readings disagree. The structure is the correct "
            "one: SEC EDGAR shows the shares are issued by Teucrium Commodity Trust, which files a "
            "10-K and does not appear in EDGAR's register of 1940-Act funds. It sends a K-1."
        ),
    },
    "TAGS": {
        "override": (
            "Same as SOYB, and the same issuer. The rates on etfdb disagree with its own Commodity "
            "Pool structure; EDGAR shows Teucrium Commodity Trust, a 10-K filer absent from the "
            "1940-Act fund register. It sends a K-1."
        ),
    },
    "IBIT": {
        "override": (
            "A spot bitcoin trust, not a fund. EDGAR shows it filing a 10-K and absent from the "
            "1940-Act fund register, which rules out RIC treatment, and its sponsor's own tax "
            "disclosure treats holders as owning the bitcoin directly. That is grantor trust "
            "treatment: a 1099-B, not a K-1. etfdb labels the structure 'ETF' and gives rates that "
            "match neither, which is why the two readings disagree here."
        ),
    },
    "ETHA": {
        "override": (
            "A spot ether trust, and the same reasoning as IBIT: a 10-K filer, absent from the "
            "1940-Act fund register, taxed to holders as direct ownership of the underlying. A "
            "1099-B, not a K-1."
        ),
    },
    "OUNZ": {
        "override": (
            "A physical gold grantor trust, the structure that lets a holder take delivery of the "
            "metal. EDGAR shows a 10-K filer absent from the 1940-Act fund register. The 28.00% "
            "long-term rate on etfdb's own page is the collectibles rate and confirms grantor "
            "trust treatment, contradicting the 'ETF' structure label on the same page. Either "
            "way it is a 1099-B and not a K-1."
        ),
    },
}


def fetch(ticker):
    """Return the fund page HTML, or None if etfdb has no such ticker (404)."""
    req = urllib.request.Request(
        SOURCE_URL.format(ticker),
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "en-US,en;q=0.9",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as err:
        if err.code == 404:
            return None
        raise


def parse(html, ticker):
    """Pull structure, name and the two tax rates out of a fund page."""
    text = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html))

    def grab(pattern):
        match = re.search(pattern, text)
        return match.group(1).strip() if match else None

    name = grab(r"<title>(.*?)</title>")
    if name is None:
        match = re.search(r"<title>(.*?)</title>", html, re.S)
        name = re.sub(r"\s+", " ", match.group(1)).strip() if match else None
    if name:
        name = name.replace("&amp;", "&").replace("&#39;", "'").replace("&quot;", '"')
        # Most fund pages title themselves with the fund's name. A minority fall back to a
        # generic SEO title ("SVIX ETF Guide | Stock Quote, Holdings, Fact Sheet and More"),
        # which is not a name and must not be stored as one: the page would then print the
        # boilerplate where the fund name goes. Cut the marketing tail, and if nothing
        # meaningful survives, record no name at all and let the page show the ticker alone.
        name = re.split(r"\s+ETF Guide\b|\s+\|\s+", name)[0].strip()
        if not name or name.upper() == ticker.upper() or len(name) < 4:
            name = None

    return {
        "name": name,
        "brand": grab(r"Brand\s+(.+?)\s+Structure"),
        "structure": grab(r"Structure\s+(.+?)\s+Expense Ratio"),
        "st_rate": grab(r"Max ST Capital Gains Rate\s+([\d.]+%)"),
        "lt_rate": grab(r"Max LT Capital Gains Rate\s+([\d.]+%)"),
    }


def classify(parsed, today):
    """Turn a parsed page into a database row, including the corroboration check."""
    structure = parsed.get("structure")
    key = (structure or "").strip().lower()

    row = {
        "name": parsed.get("name"),
        "brand": parsed.get("brand"),
        "structure": structure,
        "k1": None,
        "tax_form": TAX_FORMS.get(key),
        "st_rate": parsed.get("st_rate"),
        "lt_rate": parsed.get("lt_rate"),
        "agrees": None,
        "checked": today,
    }

    if key in TAX_FORMS:
        row["k1"] = key in K1_STRUCTURES
    else:
        # Unrecognised structure. Do not guess: leave k1 null so the page says
        # "unknown" rather than asserting a wrong answer about someone's taxes.
        row["tax_form"] = None

    rates = (parsed.get("st_rate"), parsed.get("lt_rate"))
    if all(rates):
        expected = EXPECTED_RATES.get(key, DEFAULT_RATES)
        row["agrees"] = rates == expected
    return row


def load():
    if JSON_PATH.exists():
        return json.loads(JSON_PATH.read_text(encoding="utf-8"))
    return {"refreshed_at": None, "source": "etfdb.com", "tickers": {}}


def save(db):
    db["refreshed_at"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    db["tickers"] = dict(sorted(db["tickers"].items()))
    payload = json.dumps(db, indent=1, ensure_ascii=False)
    JSON_PATH.write_text(payload + "\n", encoding="utf-8")
    # Every .json in data/ has a .js twin assigning a window global, so the site works
    # from file:// where fetch() of a local path is blocked. See docs/PRD.md Section 10.
    JS_PATH.write_text("window.K1_DATA = " + payload + ";\n", encoding="utf-8")


def due(row, today, force):
    if force or not row:
        return True
    checked = row.get("checked")
    if not checked:
        return True
    age = (
        datetime.date.fromisoformat(today) - datetime.date.fromisoformat(checked)
    ).days
    return age >= STALE_AFTER_DAYS


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("tickers", nargs="*", help="specific tickers to add or refresh")
    parser.add_argument("--all", action="store_true", help="re-fetch every known ticker")
    parser.add_argument(
        "--seed", action="store_true", help="add the tickers in data/k1_seed.txt first"
    )
    args = parser.parse_args()

    db = load()
    today = datetime.date.today().isoformat()

    wanted = [t.strip().upper() for t in args.tickers if t.strip()]
    if args.seed:
        if not SEED_PATH.exists():
            print(f"No seed list at {SEED_PATH}")
            return 1
        for line in SEED_PATH.read_text(encoding="utf-8").splitlines():
            line = line.split("#", 1)[0].strip().upper()
            if line:
                wanted.append(line)
    if not wanted:
        wanted = list(db["tickers"])

    # Preserve first-seen order while dropping repeats.
    seen = set()
    queue = [t for t in wanted if not (t in seen or seen.add(t))]
    todo = [t for t in queue if due(db["tickers"].get(t), today, args.all)]

    print(f"{len(db['tickers'])} ticker(s) known, {len(queue)} requested, {len(todo)} to fetch")
    if not todo:
        print("Nothing to do.")
        return 0

    fetched = missing = failed = 0
    for index, ticker in enumerate(todo, 1):
        try:
            html = fetch(ticker)
        except Exception as err:  # noqa: BLE001 - one bad ticker must not end the run
            print(f"  !! {ticker}: {err}")
            failed += 1
            html = ""
        else:
            if html is None:
                # Not on etfdb at all. Recorded rather than skipped, so the page can say
                # "not an ETF we can find" instead of "no answer", and so a re-run does
                # not keep asking.
                db["tickers"][ticker] = {
                    "name": None, "brand": None, "structure": None, "k1": None,
                    "tax_form": None, "st_rate": None, "lt_rate": None,
                    "agrees": None, "checked": today, "not_found": True,
                }
                print(f"  -- {ticker}: not found on etfdb")
                missing += 1
                html = ""
            else:
                row = classify(parse(html, ticker), today)
                # A verified correction wins over the source, and says so on the row so the
                # page can show its reasoning instead of just asserting a different answer.
                if ticker in OVERRIDES:
                    row.update(OVERRIDES[ticker])
                    # The agrees flag was computed against the structure the source published,
                    # so it has to be recomputed against the corrected one. Leaving it alone
                    # would make the page report a disagreement it had just resolved.
                    rates = (row.get("st_rate"), row.get("lt_rate"))
                    if all(rates):
                        key = (row.get("structure") or "").strip().lower()
                        row["agrees"] = rates == EXPECTED_RATES.get(key, DEFAULT_RATES)
                db["tickers"][ticker] = row
                flag = "" if row["agrees"] is not False else "   <-- RATES DISAGREE"
                print(
                    f"  ok {ticker:<6} {str(row['structure']):<16} "
                    f"K-1={str(row['k1']):<5} {row['st_rate']}/{row['lt_rate']}{flag}"
                )
                fetched += 1

        if index % CHECKPOINT_EVERY == 0:
            save(db)
        if index < len(todo):
            time.sleep(THROTTLE_SECONDS)

    save(db)

    rows = db["tickers"]
    yes = sum(1 for r in rows.values() if r.get("k1") is True)
    no = sum(1 for r in rows.values() if r.get("k1") is False)
    unknown = len(rows) - yes - no
    # A row with a verified override has already had its hand check; reporting it again as
    # needing one would bury the rows that genuinely do under noise that never shrinks.
    disagree = [t for t, r in rows.items()
                if r.get("agrees") is False and not r.get("override")]
    resolved = sum(1 for r in rows.values() if r.get("override"))

    print(f"\n{fetched} fetched, {missing} not on etfdb, {failed} failed")
    print(f"{len(rows)} ticker(s) in {JSON_PATH.name}: {yes} issue a K-1, {no} do not, {unknown} unknown")
    if resolved:
        print(f"{resolved} row(s) carry a verified override; see OVERRIDES in this file")
    if disagree:
        print(f"structure and tax rates disagree on {len(disagree)}: {', '.join(sorted(disagree))}")
        print("Check those by hand before trusting them, then record what you found in OVERRIDES.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
