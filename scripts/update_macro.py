"""Download economic series from FRED into data/macro.json and data/macro.js.

The Ticker Lookup page reads data/macro.js for its economy views (CPI and core
CPI so far). FRED sends no CORS headers, so a browser page cannot fetch it
directly; this script runs outside the browser (locally, or later from a
scheduled GitHub Actions job) and writes a static file the page can load.

No API key is needed: it uses FRED's public CSV download (fredgraph.csv).
FRED often times out from cloud runners (GitHub Actions), so each download is
retried, and if FRED still fails the newest three years come from the BLS
public API (the original source; same values) and are merged into the file
already in the repo.

    python scripts/update_macro.py
"""
import csv
import io
import json
import os
import sys
import time
import urllib.request
from datetime import datetime, timezone

# FRED series id -> what the page calls it.
SERIES = {
    'CPIAUCSL': 'Consumer Price Index for All Urban Consumers: All Items, seasonally adjusted',
    'CPILFESL': 'Consumer Price Index for All Urban Consumers: All Items Less Food and Energy, seasonally adjusted',
}
URL = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id='
# The same series in BLS's own ids (seasonally adjusted).
BLS_IDS = {'CPIAUCSL': 'CUSR0000SA0', 'CPILFESL': 'CUSR0000SA0L1E'}
BLS_URL = 'https://api.bls.gov/publicAPI/v1/timeseries/data/'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def get(req, tries=3):
    for i in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                return r.read().decode('utf-8')
        except Exception as e:  # timeouts, resets, 5xx
            print(f'  attempt {i + 1} failed: {e}')
            if i + 1 == tries:
                raise
            time.sleep(15 * (i + 1))


def fetch_bls(existing):
    """Newest three years from BLS, merged over the file already on disk."""
    y = datetime.now(timezone.utc).year
    body = json.dumps({'seriesid': list(BLS_IDS.values()), 'startyear': str(y - 2), 'endyear': str(y)}).encode()
    req = urllib.request.Request(BLS_URL, data=body, headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (composer-atlas macro update)'})
    d = json.loads(get(req))
    if d.get('status') != 'REQUEST_SUCCEEDED':
        raise SystemExit(f'BLS: {d.get("status")} {d.get("message")}')
    back = {v: k for k, v in BLS_IDS.items()}
    out = {}
    for sr in d['Results']['series']:
        sid = back[sr['seriesID']]
        old = existing['series'][sid]
        merged = dict(zip(old['dates'], old['values']))
        for x in sr['data']:
            if x['period'].startswith('M') and x['period'] != 'M13' and x['value'] not in ('', '-'):
                merged[f"{x['year']}-{x['period'][1:]}"] = round(float(x['value']), 3)
        dates = sorted(merged)
        out[sid] = {'title': SERIES[sid], 'dates': dates, 'values': [merged[k] for k in dates]}
    return out


def fetch(series_id):
    req = urllib.request.Request(URL + series_id, headers={'User-Agent': 'Mozilla/5.0 (composer-atlas macro update)'})
    text = get(req)
    rows = list(csv.reader(io.StringIO(text)))
    dates, values = [], []
    for row in rows[1:]:
        if len(row) < 2 or row[1] in ('', '.'):
            continue  # FRED marks a missing month with "."
        dates.append(row[0][:7])  # YYYY-MM
        values.append(round(float(row[1]), 3))
    if len(dates) < 24:
        raise SystemExit(f'{series_id}: only {len(dates)} rows, refusing to write')
    return {'title': SERIES[series_id], 'dates': dates, 'values': values}


def main():
    out = {
        'asOf': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'source': 'Federal Reserve Bank of St. Louis (FRED), fredgraph.csv; CPI data from the U.S. Bureau of Labor Statistics',
        'series': {},
    }
    path = os.path.join(ROOT, 'data', 'macro.json')
    try:
        for sid in SERIES:
            out['series'][sid] = fetch(sid)
    except Exception as e:
        print(f'FRED failed ({e}); using the BLS API for the newest months')
        with open(path, encoding='utf-8') as f:
            existing = json.load(f)
        out['series'] = fetch_bls(existing)
        out['source'] = 'U.S. Bureau of Labor Statistics (FRED history; newest months from the BLS API)'
    for sid, s in out['series'].items():
        print(f'{sid}: {len(s["dates"])} months, {s["dates"][0]} to {s["dates"][-1]}, latest {s["values"][-1]}')
    # A daily job should commit only when FRED has something new, so an
    # unchanged download leaves the files (and their asOf stamp) alone.
    try:
        with open(path, encoding='utf-8') as f:
            if json.load(f).get('series') == out['series']:
                print('no change; files left as they are')
                return 0
    except (OSError, ValueError):
        pass
    body = json.dumps(out, separators=(',', ':'))
    with open(os.path.join(ROOT, 'data', 'macro.json'), 'w', encoding='utf-8') as f:
        f.write(body)
    with open(os.path.join(ROOT, 'data', 'macro.js'), 'w', encoding='utf-8') as f:
        f.write('window.__MACRO__=' + body + ';\n')
    print('wrote data/macro.json and data/macro.js')


if __name__ == '__main__':
    sys.exit(main())
