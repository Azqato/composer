# Signal Miner headless harnesses

The Signal Miner has no build step and no JS runtime available in this
environment, so there is no `npm test`. What exists instead is a set of
drivers that run the real page end to end in **headless Microsoft Edge** and
report from inside it. They are the reason the numbers in `docs/PRD.md` are
measured rather than asserted.

Run them from the repository root:

```
python scripts/run_harness.py verify      # spec lockstep + dual-path equality
python scripts/run_harness.py live        # end-to-end run, window, rendering
python scripts/run_harness.py inertness   # cross-ticker operand degeneracy
python scripts/run_harness.py memory      # peak heap and throughput
python scripts/run_harness.py all         # verify + live, the two gates
```

`verify` and `live` gate any change to `signal-miner.html`. The other two are
measurement tools: run them when a figure in the PRD needs re-establishing,
not on every edit.

## Use Edge, never Chrome

Every harness launches Edge deliberately, so the owner's Chrome session stays
untouched. `EDGE_PATH` overrides the executable if it lives somewhere unusual.

## The four traps

All four are encoded once in `_edge.py`. They are documented here because each
one cost real time to find and every one of them fails *silently* or with a
misleading error.

**1. The page is an IIFE.** `signal-miner.html` wraps its whole script in
`(function () { ... })();`. Nothing inside is reachable from an injected
sibling `<script>`, and the symptom is `WINDOWS is not defined`. The fix is to
splice a `window.__t = { ... }` hook in before the trailing `})();` in the
test copy of the page.

**2. Bind by getter, not by value.** `targets`, `compares`, `sigCache`, `PD`,
`N` and `DATES` are all reassigned after load. A hook that captures the value
at parse time holds a stale reference forever. This one is nasty because it
does not throw: two harness cases silently run the same selection and report
identical numbers, which reads as a suspiciously stable result rather than a
bug. Always use `get x() { return x; }`.

**3. The CPU throttle feeds back on itself under virtual time.** Pass 1 sleeps
`busy * FACTOR` between batches, which interacts badly with
`--virtual-time-budget`; a run can crawl or appear to hang. Neutralise it in
the **test copy only** by forcing `FACTOR` to 0 at `cpu === 'max'`, and do it
identically on both sides of any A/B comparison.

**4. Read the dumped DOM as bytes.** `--dump-dom` emits UTF-8. Letting Python
decode it as the console codepage dies on the first non-ASCII byte, and the
page uses a middot as a separator, so this happens immediately. Take
`subprocess` stdout as bytes and `.decode('utf-8', 'replace')`.

## Trap 5: wall-clock deadlines are meaningless inside a driver

Under `--virtual-time-budget` the page clock races ahead whenever the
renderer is idle, so a `Date.now()` deadline inside a driver expires long
before a long compute has finished. The first version of the memory harness
reported "timeout" on all three cases at an 82 MB peak, which is Pass 1 not
having meaningfully started. It reads as a hang or a crash, not as a broken
timeout. Count **polls**, not milliseconds, and let the `subprocess` timeout
in `run_harness.py` be the real guard.

## Two cheaper traps

`window.confirm` **auto-dismisses** under `--headless=new`, so a run that
trips the large-batch confirm silently does nothing. `_edge.py` stubs it to
return true.

And when a driver asserts on rendered output: `renderResults()` is debounced
through `requestRender()`, so `#sl-results-panel` becomes visible *before*
`#sl-body` is filled. Wait on the row count, not on the panel, or the check is
an intermittent race.

## Writing a new harness

Drop a `.js` driver in this directory, register it in `run_harness.py`, and
have it append its output to a `<pre id="HARNESS">` element. Print
`ALL CHECKS PASSED` when every assertion holds (the runner greps for it), or
`DONE` for a measurement harness that has nothing to assert.

## If a harness appears to hang

Check for leftover `msedge.exe` processes first. A killed run can leave
instances holding the shared `--user-data-dir`, and the next run then blocks
on the profile lock rather than on anything in the page. `taskkill /F /IM
msedge.exe` and delete the profile directory under the system temp folder.
