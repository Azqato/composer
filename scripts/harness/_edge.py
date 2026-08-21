# -*- coding: utf-8 -*-
"""Shared headless-Edge runner for the Signal Miner harnesses.

Everything here exists because of four traps that were each learned the hard
way. They are encoded once, in this module, so no individual harness has to
remember them.

TRAP 1: THE PAGE IS AN IIFE.
    signal-miner.html wraps its entire script in `(function () { ... })();`,
    so nothing inside it is reachable from an injected sibling <script>. A
    harness that tries gets "WINDOWS is not defined". The fix is to splice a
    `window.__t = { ... }` hook in before the trailing `})();` in the TEST
    COPY of the page. See `build()`.

TRAP 2: BIND BY GETTER, NOT BY VALUE.
    Several page-level bindings are reassigned after load (`targets`,
    `compares`, `sigCache`, `PD`, `N`, `DATES`). A hook that captures the
    value at parse time holds a stale reference forever, and the symptom is
    silent: two harness cases run the identical selection and report
    identical numbers. Always expose those through `get x() { return x; }`.

TRAP 3: THE CPU THROTTLE FEEDS BACK ON ITSELF UNDER VIRTUAL TIME.
    Pass 1 sleeps `busy * FACTOR` between batches. Under
    --virtual-time-budget that interacts badly and a run can crawl or hang.
    Neutralise it in the TEST COPY ONLY, and identically on both sides of any
    A/B, by forcing FACTOR to 0 at cpu=max. `throttle=False` does this.

TRAP 4: READ THE DUMPED DOM AS BYTES.
    --dump-dom emits UTF-8. Letting Python decode it as the console codepage
    dies on the first non-ASCII byte (the page uses a middot separator). Take
    subprocess stdout as bytes and .decode('utf-8', 'replace').

Also: USE EDGE, NEVER CHROME, so the owner's browser session is untouched.
`window.confirm` auto-dismisses under --headless=new and is stubbed to true.
"""
import io
import os
import re
import subprocess
import sys
import tempfile

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(REPO, 'signal-miner.html')

EDGE_CANDIDATES = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "/usr/bin/microsoft-edge",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
]

# Everything a harness might want. Reassigned bindings go through getters
# (trap 2); plain functions and frozen tables can be captured by value.
HOOK = """    window.__t = {
      WINDOWS, MIN_PERIOD_OPTS, RSI_LEVELS, FAMILIES, FAM, INDICATORS,
      activeWindows, windowInfo, buildSpecs, countSpecs, famSpecCount, specAt,
      specLabel, buildCaches, neededIndicators, evalSpec, evalSpecAt,
      composerCondition, composerFlat, pctGrid, scaledPctGrid, syncChips,
      get targets() { return targets; },
      get compares() { return compares; },
      get sigCache() { return sigCache; },
      get PD() { return PD; },
      get N() { return N; },
      get DATES() { return DATES; },
      get UNIVERSE() { return UNIVERSE; }
    };
    window.confirm = function () { return true; };
"""

TAIL = "  })();\n  </script>"


def edge_path():
    env = os.environ.get('EDGE_PATH')
    if env and os.path.exists(env):
        return env
    for c in EDGE_CANDIDATES:
        if os.path.exists(c):
            return c
    raise SystemExit('Microsoft Edge not found. Set EDGE_PATH. (Do not substitute '
                     'Chrome: it would disturb the running browser session.)')


def build(driver_js, page=PAGE, throttle=False, out_prefix='_harness'):
    """Write a test copy of the page with the hook spliced in and `driver_js`
    attached. Returns (html_path, js_path) for the caller to clean up."""
    src = io.open(page, encoding='utf-8').read()

    if not throttle:                                            # trap 3
        old = "const FACTOR = cpu === 'max' ? 0.25"
        if src.count(old) != 1:
            raise SystemExit('throttle line not found or not unique; the page changed '
                             'shape and _edge.py needs updating')
        src = src.replace(old, "const FACTOR = cpu === 'max' ? 0")

    if src.count(TAIL) != 1:                                    # trap 1
        raise SystemExit('IIFE tail not found or not unique; the page changed shape '
                         'and _edge.py needs updating')
    src = src.replace(TAIL, HOOK + TAIL)

    js_name = out_prefix + '_driver.js'
    html_name = out_prefix + '.html'
    src = src.replace('</body>', '<script src="%s"></script></body>' % js_name)

    html_path = os.path.join(REPO, html_name)
    js_path = os.path.join(REPO, js_name)
    io.open(html_path, 'w', encoding='utf-8', newline='').write(src)
    io.open(js_path, 'w', encoding='utf-8', newline='').write(
        io.open(os.path.join(HERE, driver_js), encoding='utf-8').read())
    return html_path, js_path


def run(driver_js, timeout=1800, throttle=False, flags=(), profile='default'):
    """Build, drive, and return the text the driver left in <pre id="HARNESS">."""
    prefix = '_harness_' + os.path.splitext(os.path.basename(driver_js))[0]
    html_path, js_path = build(driver_js, throttle=throttle, out_prefix=prefix)
    prof = os.path.join(tempfile.gettempdir(), 'composer-harness-' + profile)
    url = 'file:///' + html_path.replace('\\', '/').replace(' ', '%20')
    argv = [edge_path(), '--headless=new', '--disable-gpu', '--no-sandbox',
            '--virtual-time-budget=2000000000', '--user-data-dir=' + prof]
    argv += list(flags)
    argv += ['--dump-dom', url]
    try:
        dom = subprocess.run(argv, capture_output=True, timeout=timeout).stdout
    finally:
        for f in (html_path, js_path):
            try:
                os.remove(f)
            except OSError:
                pass
    html = dom.decode('utf-8', 'replace')                        # trap 4
    m = re.search(r'<pre id="HARNESS">(.*?)</pre>', html, re.S)
    if not m:
        return 'NO HARNESS OUTPUT (the driver threw before it could report)'
    return (m.group(1).replace('&quot;', '"').replace('&gt;', '>')
            .replace('&lt;', '<').replace('&amp;', '&'))


def main(driver_js, **kw):
    txt = run(driver_js, **kw)
    print(txt)
    ok = 'ALL CHECKS PASSED' in txt or 'DONE' in txt
    sys.exit(0 if ok else 1)
