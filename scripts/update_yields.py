"""Download U.S. Treasury yields into data/yields/ for the Ticker Lookup page.

The same yields as the Azqato weekly report's Treasury and TIPS table: the
1M, 3M, 6M, 1Y, 2Y, 5Y, 7Y, 10Y, 20Y and 30Y Treasury par yields and the 5Y,
10Y and 30Y TIPS real yields, daily, from the U.S. Treasury's own yield-curve
CSVs (home.treasury.gov), the source the report uses. No key, no FRED (which
times out from GitHub's runners).

Each series is written to data/yields/<KEY>.js, loaded only when that yield is
opened, and data/yields/_latest.js carries every series' latest two readings
for the maturity links and the inversion check.

First run (no files yet): every year since 1990 (TIPS since 2003). Later runs:
this year only, plus last year in January, merged over the files on disk.
Files are left untouched when nothing changed, so a daily job commits only on
days with new readings.

    python scripts/update_yields.py           # update
    python scripts/update_yields.py --full    # rebuild the whole history
"""
import csv
import io
import json
import os
import sys
import time
import urllib.request
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'yields')
URL = ('https://home.treasury.gov/resource-center/data-chart-center/interest-rates/'
       'daily-treasury-rates.csv/{y}/all?type={t}&field_tdr_date_value={y}&page&_format=csv')
NOMINAL, REAL = 'daily_treasury_yield_curve', 'daily_treasury_real_yield_curve'
FIRST = {NOMINAL: 1990, REAL: 2003}

# key, CSV type, CSV column, name
SERIES = [
    ('US1M', NOMINAL, '1 Mo', '1-Month Treasury Yield'),
    ('US3M', NOMINAL, '3 Mo', '3-Month Treasury Yield'),
    ('US6M', NOMINAL, '6 Mo', '6-Month Treasury Yield'),
    ('US1Y', NOMINAL, '1 Yr', '1-Year Treasury Yield'),
    ('US2Y', NOMINAL, '2 Yr', '2-Year Treasury Yield'),
    ('US5Y', NOMINAL, '5 Yr', '5-Year Treasury Yield'),
    ('US7Y', NOMINAL, '7 Yr', '7-Year Treasury Yield'),
    ('US10Y', NOMINAL, '10 Yr', '10-Year Treasury Yield'),
    ('US20Y', NOMINAL, '20 Yr', '20-Year Treasury Yield'),
    ('US30Y', NOMINAL, '30 Yr', '30-Year Treasury Yield'),
    ('TIPS5Y', REAL, '5 YR', '5-Year TIPS Real Yield'),
    ('TIPS10Y', REAL, '10 YR', '10-Year TIPS Real Yield'),
    ('TIPS30Y', REAL, '30 YR', '30-Year TIPS Real Yield'),
]
PREFIX = 'window.__YIELDS__=window.__YIELDS__||{};window.__YIELDS__["{k}"]='


def get(url, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (composer-atlas yields update)'})
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read().decode('utf-8-sig')
        except Exception as e:
            print(f'  attempt {i + 1} failed: {e}')
            if i + 1 == tries:
                raise
            time.sleep(10 * (i + 1))


def year_rows(kind, year):
    """{column: {iso date: value}} for one year of one curve."""
    text = get(URL.format(y=year, t=kind))
    out = {}
    for row in csv.DictReader(io.StringIO(text)):
        m, d, y = row['Date'].split('/')
        iso = f'{y}-{m}-{d}'
        for col, v in row.items():
            if col != 'Date' and v not in ('', None, 'N/A'):
                out.setdefault(col.strip(), {})[iso] = round(float(v), 2)
    return out


def read_existing(key):
    path = os.path.join(OUT, key + '.js')
    try:
        with open(path, encoding='utf-8') as f:
            body = f.read().strip()
        return json.loads(body[body.index('"]=') + 3:].rstrip(';'))
    except (OSError, ValueError):
        return None


def main():
    full = '--full' in sys.argv
    os.makedirs(OUT, exist_ok=True)
    have = {k: read_existing(k) for k, *_ in SERIES}
    seed = full or any(v is None for v in have.values())
    now = datetime.now(timezone.utc)
    got = {NOMINAL: {}, REAL: {}}
    for kind in (NOMINAL, REAL):
        years = range(FIRST[kind], now.year + 1) if seed else ([now.year - 1] if now.month == 1 else []) + [now.year]
        for y in years:
            for col, vals in year_rows(kind, y).items():
                got[kind].setdefault(col, {}).update(vals)
        print(f'{kind}: {len(list(years))} year(s)')
    changed, latest = 0, {}
    for key, kind, col, name in SERIES:
        merged = {} if seed or not have[key] else dict(zip(have[key]['dates'], have[key]['values']))
        merged.update(got[kind].get(col, {}))
        if len(merged) < 200:
            raise SystemExit(f'{key}: only {len(merged)} readings, refusing to write')
        dates = sorted(merged)
        data = {'key': key, 'name': name, 'source': 'U.S. Department of the Treasury, daily ' +
                ('par yield curve' if kind == NOMINAL else 'par real yield curve'), 'dates': dates,
                'values': [merged[d] for d in dates]}
        latest[key] = [dates[-1], data['values'][-1], dates[-2], data['values'][-2], name]
        old = have[key]
        if old and old.get('dates') == data['dates'] and old.get('values') == data['values']:
            continue
        with open(os.path.join(OUT, key + '.js'), 'w', encoding='utf-8') as f:
            f.write(PREFIX.replace('{k}', key) + json.dumps(data, separators=(',', ':')) + ';\n')
        changed += 1
        print(f'{key}: {len(dates)} days, {dates[0]} to {dates[-1]}, latest {data["values"][-1]}%')
    if changed:
        with open(os.path.join(OUT, '_latest.js'), 'w', encoding='utf-8') as f:
            f.write('window.__YIELDS_LATEST__=' + json.dumps(latest, separators=(',', ':')) + ';\n')
    print(f'{changed} series written' if changed else 'no change; files left as they are')


if __name__ == '__main__':
    sys.exit(main())
