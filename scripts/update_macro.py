"""Download economic series from FRED into data/macro.json and data/macro.js.

The Ticker Lookup page reads data/macro.js for its economy views (CPI and core
CPI so far). FRED sends no CORS headers, so a browser page cannot fetch it
directly; this script runs outside the browser (locally, or later from a
scheduled GitHub Actions job) and writes a static file the page can load.

No API key is needed: it uses FRED's public CSV download (fredgraph.csv).

    python scripts/update_macro.py
"""
import csv
import io
import json
import os
import sys
import urllib.request
from datetime import datetime, timezone

# FRED series id -> what the page calls it.
SERIES = {
    'CPIAUCSL': 'Consumer Price Index for All Urban Consumers: All Items, seasonally adjusted',
    'CPILFESL': 'Consumer Price Index for All Urban Consumers: All Items Less Food and Energy, seasonally adjusted',
}
URL = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id='
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def fetch(series_id):
    req = urllib.request.Request(URL + series_id, headers={'User-Agent': 'Mozilla/5.0 (composer-atlas macro update)'})
    with urllib.request.urlopen(req, timeout=60) as r:
        text = r.read().decode('utf-8')
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
    for sid in SERIES:
        s = fetch(sid)
        out['series'][sid] = s
        print(f'{sid}: {len(s["dates"])} months, {s["dates"][0]} to {s["dates"][-1]}, latest {s["values"][-1]}')
    # A daily job should commit only when FRED has something new, so an
    # unchanged download leaves the files (and their asOf stamp) alone.
    path = os.path.join(ROOT, 'data', 'macro.json')
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
