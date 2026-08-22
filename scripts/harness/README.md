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

## The traps

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

## Trap 6: the browser profile

`_edge.py` gives every invocation a **fresh** `--user-data-dir` under the
system temp directory, and that is deliberate. A single shared profile fails
in two directions, and both look like a hang or a crash in the page:

- a killed run leaves `msedge.exe` holding the profile lock, so the next run
  blocks on the lock rather than on anything the harness is doing;
- deleting the directory races with Edge's shutdown, which still holds file
  handles for a moment. The result is a half-deleted profile, and the driver
  then throws before it can report, surfacing as `NO HARNESS OUTPUT`.

Cleanup is best effort and some leftovers stay in temp. That is the right
trade. Pass an explicit `profile=` name only when a harness genuinely needs
state to survive between two Edge invocations, which today means a
`localStorage` round trip and nothing else.

If something still looks stuck, check for stray `msedge.exe` processes:
`taskkill /F /IM msedge.exe`.

## Traps 7 and 8, cheaper but just as silent

`window.confirm` **auto-dismisses** under `--headless=new`, so a run that
trips the large-batch confirm silently does nothing. `_edge.py` stubs it to
return true.

And when a driver asserts on rendered output: `renderResults()` is debounced
through `requestRender()`, so `#sl-results-panel` becomes visible *before*
`#sl-body` is filled. Wait on the row count, not on the panel, or the check is
an intermittent race.

## Traps 9 and 10: why timing lives outside this directory

**Trap 9: under virtual time, the page clock is not a clock.** This is the
trap that cost the most, because it fails by producing plausible numbers.
`--virtual-time-budget` is what makes `--dump-dom` wait for asynchronous work
instead of dumping at the load event, and every harness here depends on it. The
price is that the page clock is *paused* during synchronous compute and
*fast-forwarded* through idle gaps. Measured, with one driver and two run sizes:

| Run | Real duration | `performance.now()` elapsed | Summed `busyMs` |
|---|---|---|---|
| 4 tickers | 3.68s | 1,154 ms | 63 ms |
| 8 tickers | 9.44s | 4,095,136 ms | 70 ms |

Neither column measures anything, and the fast-forwarding is not even monotone
in the work. At 16 tickers the accumulated virtual time crossed the 2e9 ms
budget, Edge shut the browser down mid-run, and the harness reported
`NO HARNESS OUTPUT` with no other symptom. The budget cannot simply be raised:
2e9 is already close to the largest value the flag accepts.

A wrong throughput figure derived this way (4.5 ns per spec-target-day, five
times too fast) reached production in code comments, the patch notes and the
PRD before it was caught. **Never quote a duration measured inside this rig.**
Timing lives in `scripts/measure_throughput.py`, which runs Edge without
virtual time and without `--dump-dom`, and reads results off stderr through
`console.info` so the parent process can timestamp them.

**Trap 10: a real-time headless run needs four more flags.** Dropping virtual
time introduces two problems that virtual time was hiding:

- A headless tab counts as **hidden**, and a hidden tab has its timers clamped
  to roughly one per second. Pass 1 yields through `setTimeout` between
  batches, so without `--disable-background-timer-throttling`,
  `--disable-backgrounding-occluded-windows` and
  `--disable-renderer-backgrounding` a run does about one batch per second and
  what you measure is the clamp.
- **A fresh `--user-data-dir` is not a clean browser.** Edge still loads the
  machine's extensions, which log continuously into the same stderr channel the
  result is being read from, and open network tabs of their own. Pass
  `--disable-extensions --no-first-run --no-default-browser-check`.

## The two-invocation pattern (`settings`)

Most harnesses run once on a throwaway profile. `settings` cannot: it tests
whether the section-3 controls survive a refresh, and a single page load has no
way to observe one. So `run_harness.py` drives `settings.js` **twice** over one
shared `--user-data-dir`, selecting the half to run with `config={'phase': N}`:

- it **deletes the profile directory first**, so phase 1 is genuinely a browser
  that has never seen the page and the shipped defaults can be asserted;
- phase 1 checks the HTML attributes against `DEFAULT_SETTINGS`, changes every
  control, and lets the change listeners persist;
- phase 2 is a **new browser process** over the same profile. It asserts the
  controls came back changed, clicks Default, and asserts everything reset and
  wrote through to storage.

Two things to know if you write another one. Reloading from inside the driver
is not a substitute: `window.__cfg` is re-injected on every load, so a
self-reload loops forever. And a two-phase harness must pass **both** phases, so
`run_harness.py` counts `ALL CHECKS PASSED` twice rather than looking for it
once.

`localStorage` works on `file://` in headless Edge, and the test copy is written
to the same path every time, so both invocations share an origin.

**Trap 11: a shared profile name must not be a fixed one.** The profile the two
phases share is named `settings-<pid>`, not `settings`. A killed or backgrounded
harness leaves an `msedge.exe` holding its profile directory, `shutil.rmtree`
then fails silently under `ignore_errors=True`, and the next run's Edge exits
against the locked directory in about a tenth of a second. What you see is
`NO HARNESS OUTPUT` on both phases with no JavaScript error anywhere, which
reads exactly like a driver that hangs, and costs an hour of instrumenting a
driver that was fine. A per-invocation name cannot collide with a leftover, and
`run_settings` now says so explicitly if the directory survives the delete.

If you do hit a locked profile, list the offenders before killing anything:

```powershell
Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" |
  Where-Object { $_.CommandLine -like '*composer-harness*' }
```

Filter on `composer-harness` rather than killing `msedge.exe` wholesale, so the
browser session you are actually using is left alone.

## Writing a new harness

Drop a `.js` driver in this directory, register it in `run_harness.py`, and
have it append its output to a `<pre id="HARNESS">` element. Print
`ALL CHECKS PASSED` when every assertion holds (the runner greps for it), or
`DONE` for a measurement harness that has nothing to assert.
