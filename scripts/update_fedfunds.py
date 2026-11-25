"""Download the effective federal funds rate into data/yields/FEDFUNDS.js.

The Ticker Lookup page shows it like a Treasury yield (daily, bps changes).
Source: the Federal Reserve Bank of New York's EFFR, published each business
day at about 9 AM ET for the day before (markets.newyorkfed.org, no key; it
answers from GitHub's runners, where FRED times out). The NY Fed's history
starts in July 2000, so the first run also takes FRED's DFF series (the same
rate, from 1954) for the years before that, weekdays only.

Also stores the FOMC target range on the latest day and adds the rate's last
two readings to data/yields/_latest.js. Files are left untouched when nothing
changed.

    python scripts/update_fedfunds.py           # update (last 30 readings)
    python scripts/update_fedfunds.py --full    # rebuild the whole history
"""
import csv
import io
import json
import os
import sys
import time
import urllib.request
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'yields')
KEY, NAME = 'FEDFUNDS', 'Federal Funds Rate'
NYFED = 'https://markets.newyorkfed.org/api/rates/unsecured/effr/'
FRED = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=DFF'
PREFIX = 'window.__YIELDS__=window.__YIELDS__||{};window.__YIELDS__["FEDFUNDS"]='


def get(url, tries=3, timeout=60):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (composer-atlas rates update)'})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read().decode('utf-8-sig')
        except Exception as e:
            print(f'  attempt {i + 1} failed: {e}')
            if i + 1 == tries:
                raise
            time.sleep(10 * (i + 1))


def nyfed(path):
    rows = json.loads(get(NYFED + path))['refRates']
    out, target = {}, None
    for r in sorted(rows, key=lambda r: r['effectiveDate']):
        if r.get('percentRate') is None:
            continue
        out[r['effectiveDate']] = round(float(r['percentRate']), 2)
        if r.get('targetRateFrom') is not None and r.get('targetRateTo') is not None:
            target = [float(r['targetRateFrom']), float(r['targetRateTo'])]
    return out, target


def fred_before(cutoff):
    out = {}
    for row in csv.DictReader(io.StringIO(get(FRED, timeout=120))):
        d = row.get('observation_date') or row.get('DATE')
        v = row.get('DFF')
        if d and d < cutoff and v not in ('', '.', None) and date.fromisoformat(d).weekday() < 5:
            out[d] = round(float(v), 2)
    return out


def read_js(path, marker):
    try:
        with open(path, encoding='utf-8') as f:
            body = f.read().strip()
        return json.loads(body[body.index(marker) + len(marker):].rstrip(';'))
    except (OSError, ValueError):
        return None


def main():
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, KEY + '.js')
    old = read_js(path, '"]=')
    merged = {}
    if '--full' in sys.argv or not old:
        merged.update(fred_before('2000-07-03'))
        rows, target = nyfed(f'search.json?startDate=2000-07-01&endDate={date.today().isoformat()}')
        print(f'seed: {len(merged)} FRED days before July 2000, {len(rows)} NY Fed days')
    else:
        merged.update(zip(old['dates'], old['values']))
        rows, target = nyfed('last/30.json')
    merged.update(rows)
    if len(merged) < 1000:
        raise SystemExit(f'only {len(merged)} readings, refusing to write')
    dates = sorted(merged)
    data = {'key': KEY, 'name': NAME, 'source': 'Federal Reserve Bank of New York, effective federal funds rate (EFFR); FRED DFF before July 2000',
            'dates': dates, 'values': [merged[d] for d in dates],
            'target': target or (old or {}).get('target')}
    if old and all(old.get(k) == data[k] for k in ('dates', 'values', 'target')):
        print('no change; files left as they are')
        return
    with open(path, 'w', encoding='utf-8') as f:
        f.write(PREFIX + json.dumps(data, separators=(',', ':')) + ';\n')
    lp = os.path.join(OUT, '_latest.js')
    latest = read_js(lp, '__YIELDS_LATEST__=') or {}
    latest[KEY] = [dates[-1], data['values'][-1], dates[-2], data['values'][-2], NAME]
    with open(lp, 'w', encoding='utf-8') as f:
        f.write('window.__YIELDS_LATEST__=' + json.dumps(latest, separators=(',', ':')) + ';\n')
    print(f'{KEY}: {len(dates)} days, {dates[0]} to {dates[-1]}, latest {data["values"][-1]}%, target {data["target"]}')


if __name__ == '__main__':
    sys.exit(main())
