# Composer Atlas: Changelog

All notable changes to Composer Atlas are documented in this file.
Format: `[VERSION] - YYYY-MM-DD`

---

## [1.22.15] - 2026-08-20

### Results are stored as columns, so a large run holds half the memory

An owner report from a second machine: the run finished faster but the tab died with a memory error. That machine has 48GB of RAM, which is the useful clue, because the limit was never the machine's.

**A browser tab has its own heap ceiling and it does not grow with installed memory.** Measured in Edge on that class of hardware: 3,586 MB. Whether the box has 8GB or 48GB, the tab gets the same allowance, and "Out of memory" is that allowance running out rather than Windows running short.

**What was filling it.** After v1.22.13 removed the survivor cache, the remaining cost was one JavaScript object per result. A 3,000,000-signal run produces about 2,500,000 of them, and each costs roughly 300 bytes: the object header and slack, eight separately heap-allocated doubles, and a label string built eagerly for every row when only the 100 on screen are ever read.

Results are now stored as columns. Eight `Float64Array`s for the metrics, a `Uint32Array` of spec indices and a `Uint8Array` of target indices: 69 bytes per row, flat, outside the object heap, with nothing for the garbage collector to trace. Row objects are built only where one is actually needed, which is the 100 rows displayed, the at-most-150 per target fed into pairing, and the saved snapshot. Labels are derived from the spec at that point instead of stored.

Two related savings came with it. Sorting used to build a throwaway object per row on every click; it now carries indices and materialises only the rows it keeps. And the Time-in-Market / Max Drawdown filter used to produce a second full array of row objects alongside the first, so a large run paid for its results twice; that is now a list of indices at four bytes per row.

**Measured on the same 3,042,720-signal run:**

| | Before | After |
|---|---|---|
| Peak JS heap | 1,144 MB | **527 MB** |
| Peak process memory | 2,459 MB | **1,502 MB** |
| Wall time | 140s | **110s** |

Against the tab ceiling that is roughly 2.2x more headroom, moving the crash point from about 7.8M retained rows to about 17M. The speedup is a side effect of not tracing millions of objects on every collection.

**One row per signal PER TARGET.** Worth knowing when sizing a run: the estimate line counts signals, deliberately, because the target count does not change how many conditions exist. Retention is not the same shape. Two targets on a 3M-signal run keeps up to 6M rows.

**Verified against the previous build.** Both were driven through an identical scripted session covering 47,163 results: the default sort, sorting by a text column and a numeric one, two text filters, a live re-filter, the single-row export, the combined ladder export and the baselines. Output was byte-for-byte identical, 25,088 characters. The snapshot round trip was tested separately, running once and reloading against the same profile so `localStorage` survived, since that path builds the result set differently. Also identical.

**Still on the table:** the `specs` array is now the largest single item at roughly 300 MB of the remaining 527 MB, about 3M small objects. Packing those the same way would take the heap to around 230 MB, but it touches `evalSpec`, `specLabel` and the exporter, so it was left out of this change.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.22.14] - 2026-08-20

### Leverage and Inverse are now separate ticker groups

The Signal Miner's chip groups had one 22-ticker block called "Leveraged & inverse", the largest group on the page by a wide margin and the only one whose **All** button did not express anything anyone actually wants: it selected fifteen bull funds and seven bear funds in a single click.

It is now two groups:

- **Leverage (15)** TQQQ, QLD, SPXL, SSO, UDOW, SOXL, USD, TECL, RETL, FAS, LABU, TNA, YINN, TMF, GDXU
- **Inverse (7)** SQQQ, PSQ, SPXU, SH, SOXS, TMV, GDXD

Membership goes by direction rather than by multiple, so the 1x shorts SH and PSQ sit in Inverse next to the 3x ones.

**Factor & dividend is now Value & Dividend**, same six tickers (SPYV, VIG, VIGI, SCHD, SCHG, SPHB), owner's wording.

**Bonds & cash is now Bonds**, same ten tickers (TLT, IEF, IEI, SHY, SHV, LQD, BND, BNDW, BSV, BIL). BIL and SHV are the cash-like ones and still live here.

Only labels changed. The universe is still 72 tickers, no price series moved, and any saved selection is unaffected because selection is stored per ticker, not per group.

**Files changed:** `scripts/refresh_prices.py`, `data/prices.json`, `data/prices.js`, `docs/PRD.md`

---

## [1.22.13] - 2026-08-20

### Large runs no longer fill memory, and the countdown stops lying

Two owner reports: the machine bogs down after about 2,000,000 signals, and the status line read "1 second left" at 2,100,585 of 3,050,000.

**Memory.** Pass 1 kept the day-by-day array of every surviving signal so pairing could AND them together later. At 4,183 bytes each, a 3,000,000-signal run held around 4GB at a 50% survival rate, which is where a browser tab's heap runs out. It also turned out to be almost entirely unused: pairing only ever reads the top 150 survivors per target, so on a run that size over 99.9% of what was retained was never read. Nothing is cached now. The handful of arrays pairing needs are rebuilt on the spot, which takes under a millisecond.

Re-filtering is still instant and results are unchanged. Retention was the cost, not the work.

**Countdown.** The estimate came from measured compute scaled by the CPU factor, which assumed idle time exactly matched what the throttle asked for. When real idle ran longer, through timer clamping, a backgrounded tab, or garbage collection, elapsed time overtook the projection and the countdown stuck at zero with a third of the run left. It now projects from actual throughput and shows "estimating..." for the first five batches.

**Verified by running it.** Both builds were driven through the same 3,042,720-signal run in a headless browser, with memory sampled from outside. Before: 14,264 MB peak and the run never finished. After: 2,747 MB peak, finished in 139 seconds. A smaller session that both builds could complete was compared row by row across every metric column and came out byte-for-byte identical, so the change affects memory only.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.22.12] - 2026-08-20

### Batch size scales with the CPU level

Max 250, High 200, Medium 150, Low 100, replacing the uniform 150 from v1.22.11.

The reason is the `setTimeout` clamp. Browsers round a nested timer's delay up to roughly 4ms, and the throttle sleeps for `busy x FACTOR`, so a level with a small factor on a small batch asks for a sub-clamp sleep, gets rounded up, and holds less CPU than its label claims. A larger batch at the faster levels makes the requested sleep clear the clamp.

Max is still short of its nominal 80%, landing near 64%, because closing that gap fully would need a batch around 550, which is where Max was when it was crashing browsers. The error only ever runs toward less CPU, so the readout overstates load rather than hiding it.

**Correction to the v1.22.11 note:** that entry claimed the old 500-signal batch was likely contributing to the crashes. The arithmetic does not support it. At roughly 29 microseconds per signal a 500-batch blocks for about 14ms, which is a long frame, not a hang. The uncapped duty cycle and the documented memory ceiling are the plausible causes; batch size in this range is not.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.22.11] - 2026-08-20

### Lower CPU ceilings; Max no longer means 100%

Reported by the owner: the Max setting was crashing browsers. It ran with no throttle at all and, less obviously, on a batch of 500 signals where every other level used 150.

New targets, with the throttle factor derived from each one as `100/duty - 1` and checked to round-trip:

| Option | Was | Now | `FACTOR` |
|---|---|---|---|
| Max | 100% | ~80% | 0.25 |
| High | ~50% | ~40% | 1.5 |
| Medium (default) | ~25% | ~20% | 4 |
| Low | ~10% | ~10% | 9 |

Batch size is now a uniform 150 at every level. That matters as much as the percentage: the batch boundary is the only point the run yields to the browser, so the old 500 held the main thread for over three times as long between breaths.

Results are identical at every setting. Only speed and heat change.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.22.10] - 2026-08-20

### Shorter progress line

The run status now ends at the time remaining: "Backtesting 3,042,720 signals... 303,000 (10%) · ~25% CPU · 5m 17s left". The projected total and the idle-time breakdown are gone. Both were only ever there to explain why a throttled run takes longer than its compute time, which the CPU percentage already implies.

The projection itself is unchanged, since the remaining figure is still derived from it.

**Files changed:** `signal-miner.html`

---

## [1.22.9] - 2026-08-20

### The combine bar now says what a mixed-target ladder actually does

Raised by a Signal Miner user via the owner: selecting rows with different targets and exporting them as one Frontrunner is misleading, because the ladder buys only one thing.

That is correct about the behaviour. A ladder holds exactly one ticker on any given day, whichever branch fires first, so a selection spanning TQQQ, SOXL and TECL is a rotation between them, not a combined position. The bar counted the targets but never said what followed from that.

Selecting across targets is still allowed, since a deliberate rotation is a legitimate strategy. What changed is that a mixed-target selection now shows a line stating the ladder rotates rather than holds together, and that each row's metrics describe its own signal and target alone, not the rotation. Single-target selections show nothing new.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.22.8] - 2026-08-20

### Lowercase "calmar" in the exported description

The combined export's `description` now reads "ordered by the calmar ratio each signal scored standalone". Only the capital C changed. The column header in the table is untouched.

**Files changed:** `signal-miner.html`

---

## [1.22.7] - 2026-08-20

### The deploy now refuses to publish a broken page

Two checks moved into `scripts/` and into the deploy workflow, ahead of the build step. If either fails the deploy stops and the previously published site stays up.

`scripts/check_html_js.py` catches the v1.22.2 failure: a stray apostrophe inside a JS string that closes it early and kills the whole inline script, while the page still serves a healthy-looking 200 with its static HTML intact. It checks every inline `<script>` on the site for strings running past end of line and for unbalanced brackets, and it understands regex literals, which is what previously made it unusable on converter.html, database.html and etf-cloner.html. Confirmed against all 11 pages, and confirmed to fail on a copy with the outage deliberately reintroduced.

`scripts/check_composer_ladder.py` catches the v1.22.5 failure: output that is valid JSON but the wrong shape. It walks the combined export's tree asserting that every `if` has exactly two children and every else holds exactly one thing, and it guards against drifting from the real builder by pattern-matching the exporter in `signal-miner.html` first.

No change to the site itself.

**Files changed:** `.github/workflows/deploy.yml`, `scripts/check_html_js.py` (new), `scripts/check_composer_ladder.py` (new), `docs/PRD.md`

---

## [1.22.6] - 2026-08-20

### Shorter data-refresh line, reworded export description

The line under the Signal Miner heading now reads "Data last refreshed Aug 20, 2026 · 72 tickers" and drops the trailing "through 2026-08-20". The full range, including the last close, is still spelled out in the data note further down the page.

The combined export's `description` was reworded to "Composer Atlas Signal Miner built this strategy. Branches are ordered by the Calmar ratio each signal scored standalone, holding cash when a signal is off." This drops the sentence warning that the chain itself has never been backtested, which was the last place that caveat appeared after v1.22.4 removed the paragraph under the combine bar. It stays recorded in the PRD.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.22.5] - 2026-08-20

### Fix: the combined JSON export produced a symphony Composer would not take

The combined export built the wrong structure. It emitted a single `if` step holding every selected signal as a sibling branch, with the last one marked as the else. Composer does not work that way: an `if` step takes exactly two children, the condition branch and an else, and each further rung of a ladder is nested **inside** the previous rung's else.

The builder now recurses. The deepest else holds the cash proxy, and every else above it holds the next `if`. Priority is still Calmar descending, so the ladder reads the same way; only the shape it is written in changed.

The single-row export was never affected, because with one rung the flat and nested shapes are identical. That is also why this survived five versions: the verification port asserted the shape the builder produced rather than the shape Composer requires. The port now checks the invariant directly, that every `if` has exactly two children and every else holds exactly one thing.

Reported by the owner with a screenshot of a correctly formed Composer symphony.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.22.4] - 2026-08-20

### A Default button, a shorter example label, and less text around the combine bar

The Target tickers row gains a **Default** button to the left of the example loader, which resets the whole form: TQQQ against QQQ, SPY, IWM and DIA, every signal family on, and all four filters back to their documented values. The example button is now labelled **Community V2 Example** rather than "Load community V2 example".

Both loaders now clear the cached run when they swap the ticker set. Previously loading a preset left the previous run's results in `sigCache`, so the live filter controls would keep re-filtering results that no longer matched the tickers on screen.

The explanatory paragraph under the combine bar is gone. The warning that a chained ladder has never been backtested as a whole still ships inside the exported symphony's `description`, which is where it reaches the person pasting it into Composer; the wording there no longer points at the removed note.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.22.3] - 2026-08-20

### Buy-and-hold benchmarks lose their explanatory paragraph

The block of text under the benchmark row is gone. The numbers and the heading speak for themselves, and BIL posting a Calmar of 402 because cash has no drawdown is worth noticing on its own rather than being explained away.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.22.2] - 2026-08-20

### Hotfix: Signal Miner would not load

A stray apostrophe in the text under the buy-and-hold benchmarks ("Ignore BIL's Sortino...") closed a JavaScript string early, which is a syntax error, which stopped the entire page script from running. The page rendered its static text and then did nothing: no ticker chips, no signal families, an empty min-period dropdown, and a status line stuck on "Loading price data...".

Introduced in v1.22.1 and fixed here. The wording now avoids the apostrophe entirely and is less preachy about it, since BIL posting a Calmar of 402 is funny and correct rather than something to scold the reader about.

**Files changed:** `signal-miner.html`

---

## [1.22.1] - 2026-08-20

### AND pairs are now built from the Calmar-ranked survivors

When Calmar became the default ranking in v1.22.0, one place still ranked by Sortino: the cut that decides which single signals get fed into AND pairing. Only the top 150 survivors per target are paired, so that cut was choosing candidates on one metric while the table ranked them on another.

It now ranks by Calmar, matching the table.

**This changes your results, not just their order.** A different set of survivors reaches the cap, so different AND pairs get generated in the first place, and some pairs that existed before will not appear. Single-signal rows are unaffected. This shipped as its own release rather than folded into v1.22.0 precisely so the change is visible.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.22.0] - 2026-08-20

### Select several signals and export them as one symphony

Requested by Haverel Mink in the Composer Discord: *"What if you could write the frontrunner JSON from the results table, rather than building it one-by-one?"*

Every result row now has a **checkbox**. Tick as many as you like and hit **Copy combined JSON** to get a single Frontrunner-shaped symphony: one `if` block with a branch per signal and a cash fallback, ready to paste into Composer. No more exporting rows one at a time and stitching them together by hand.

**Branches are ordered by Calmar, highest first.** Ladder position is a real strategy decision, since the top branch pre-empts every branch below it on any day several fire, so the order is derived from the metric rather than from the order you happened to tick the boxes. That makes the export deterministic and means there is no list to drag around. A row with no finite Calmar sorts to the bottom instead of landing somewhere arbitrary.

Your selection survives sorting, filtering and the 100-row display cap, so a row can scroll out of view and still export.

**One thing to be clear about, and it is stated on screen too: the combined symphony has not been backtested.** Every row's metrics come from testing that signal alone, holding cash when it was off. Chaining several together produces a strategy nobody has measured, and a ladder of individually strong signals can easily be worse than any one of its parts. Treat the export as a starting point to test in Composer, not a finished strategy.

### Calmar is now the default ranking

The results table now sorts by **Calmar** instead of Sortino on load, and the saved snapshot keeps the top 100 by Calmar to match. Following the v1.21.0 fix, Calmar is annualized return over worst drawdown, so it is comparable across runs of different lengths and reads the way the term normally does: above 1.0 means a typical year's gain exceeds the worst peak-to-trough loss.

Snapshots saved before this release are discarded, since they were ranked by a different metric. One run rebuilds them.

### Buy-and-hold now compares against fixed benchmarks

The buy-and-hold strip used to show one row per target you had selected, so the yardstick moved every time you changed the selection and two runs could not be compared to each other. It now always shows the same four: **TQQQ, QQQ, SPY and BIL**.

BIL is there as the cash floor. It is what a signal earns while it is switched off, so anything that cannot beat it is not paying for its own complexity. One caveat now stated on screen: **ignore BIL's Sortino and Calmar.** Cash has almost no drawdown, and both ratios divide by drawdown, which inflates them to meaningless numbers (BIL scores a Calmar of 402 on a short window). Compare BIL on Total Return and Annualized only.

If a benchmark listed later than the window you are testing, the strip says "from" and the date rather than pretending it existed and sat flat.

### Load community V2 example moved

The button now sits in the Target tickers row, just left of Select all, instead of down by the Run button.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.21.2] - 2026-08-20

### Eight duplicate ETFs removed from the ticker universe

The universe drops from **80 to 72 tickers**, making a select-all run about **19% lighter** in both compute and memory. Removed: **UPRO, VGSH, VGLT, VGIT, SOXX, VTV, SVIX, IJR**.

Every removal was a pair where two funds track the same thing, and in each case the **older fund was kept**: SPXL over UPRO, SHY over VGSH, TLT over VGLT, IEF over VGIT, SMH over SOXX, SPYV over VTV, SVXY over SVIX, and IWM over IJR. Redundant tickers are worse here than in an ordinary list, because signal count grows with the *square* of your selection and two near-identical funds produce near-identical "discoveries" that look like independent confirmation but are not.

**Several funds that look like duplicates were deliberately kept**, because they are not: SPY and VTI (S&P 500 vs total market), IEF and IEI (7-10 year vs 3-7 year treasuries), BND and BNDW (US vs world bonds), and QQQ and QQQE (cap-weighted vs equal-weighted). These move together day to day but hold genuinely different things, and that difference is exactly what a signal miner might be looking for.

If you had any of the removed tickers selected, your saved selection drops them automatically on next load. Nothing else changes, and the page is about 250KB lighter.

**Files changed:** `scripts/refresh_prices.py`, `data/prices.json`, `data/prices.js`, `signal-miner.html`, `docs/PRD.md`

---

## [1.21.1] - 2026-08-20

### Fixed: target tickers were forced into your signal conditions

Choosing TECL as a target and XLK plus KMLM as signals still produced conditions measured on **TECL**, and there was no way to stop it. Signal Miner merged the two boxes into one pool before generating conditions, so the Signal set could only ever add tickers, never restrict them.

**Conditions now come from the Signal set only.** The Target set says what you hold; the Signal set says what gets measured. That is what the labels always implied.

Rules that read their own target, like *if RSI(TECL) > 79 then hold TECL*, are a common and legitimate Composer pattern and are **not** lost. You now ask for them by putting the ticker in **both** boxes, which produces exactly the same signals the old behavior did. The difference is that it is now your choice.

Two side effects worth expecting. Runs get **smaller**, sometimes a lot: three targets against two signals drops from 1,560 signals to 396, because targets no longer multiply into the condition pool. And if your Signal set is empty the run now stops with a message instead of silently scoring nothing.

The starting selection is unchanged: Target TQQQ with signals QQQ, SPY, IWM, DIA. Note this means the default no longer generates TQQQ-on-TQQQ conditions. Add TQQQ to the signal box if you want those back.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.21.0] - 2026-08-20

### Fixed: max drawdown was wrong, and it was hiding your best results

**Max drawdown has been wrong since Signal Miner shipped.** It measured the gap between current and peak value in *return units* instead of as a percentage of the peak. Those are the same number only while a strategy has barely moved. Once one compounds, the gap gets denominated in the grown balance and runs straight past -100%: buy-and-hold TQQQ over the new 2010 history reported **-16761%**, where the real figure is **-81.7%**. SPY reported -133.6% against a true -33.7%.

**This mattered more than it looks.** The Max Drawdown floor defaults to -0.8, and on the broken numbers anything that had compounded meaningfully fell below it. Both SPY and QQQ fail that filter on the old formula and pass on the correct one. The tool was quietly throwing away its strongest signals, and extending history to 2010 made it worse by giving returns more room to multiply. **If you have run backtests before, the results are worth running again.**

**Calmar was affected too**, and separately wrong: it divided *total* return by drawdown, so it grew simply with the length of the backtest. Buy-and-hold TQQQ scored 418 on the 2010 axis. It now uses annualized return over drawdown, the standard definition, giving TQQQ 0.52. Above 1.0 now means what it should: a typical year's gain exceeds the worst peak-to-trough loss. Calmar sorting will rank differently than before.

Also corrected: Time in Market was computed against a denominator one day off, showing 0.9998 instead of 1.0 for an always-active signal.

### New: a buy-and-hold line to measure signals against

Above the results table there is now a **buy-and-hold row for each target**, scored over the exact same window with the exact same maths. Every signal is a bet that being in the target *sometimes* beats being in it *always*, and until now there was nothing on screen to check that against. A 300% return reads like a discovery until you see that just holding the thing returned more, with no rules and no assumptions.

It does not sort, does not get filtered away, and does not take up one of the 100 result slots, because a fixed reference is only useful if it stays put.

Saved results from before this release are discarded rather than shown, since the drawdown and Calmar numbers in them are wrong. One run rebuilds them.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.20.1] - 2026-08-20

### Price history now goes back to 2010, not 2018

Signal Miner's data set extends from **2018-01-02 back to 2010-01-04**: 4183 trading days instead of 2170, nearly doubling the history behind every backtest. This covers the entire leveraged-ETF era, since TQQQ, UPRO, SPXL, TNA, FAS and TMF all launched in 2010 or earlier, and adds the 2010 flash crash, the 2011 debt-ceiling selloff and the 2015-16 correction as testable regimes.

**A bug turned up while doing this.** The fetch script asked Yahoo for a fixed `range=10y` and then filtered to `START_DATE`, so the start date could only ever *narrow* that ten-year window, never widen it. Moving it back would have silently done nothing: the first attempt returned every ticker starting 2016-08-22, exactly ten years back, regardless of the setting. The script now sends explicit `period1`/`period2` bounds, so the requested window is the window you get.

Runs are correspondingly slower, since there is roughly twice as much history to score per signal. The page is now about 2.6MB of price data, up from 1.4MB.

Two things worth knowing. Fifty-five of the eighty tickers now have full coverage, and the rest list partway through, so the **common sample window matters more than it used to**: picking one recently listed fund still shortens the whole run to that fund's history, and the meta line under the table names whichever ticker is binding it. And as previously decided, **SVXY's pre-February-2018 history describes a different product** (it was a -1x fund before being reformed to -0.5x), so signals spanning that boundary are measuring a blend. In practice this affects SVXY alone: Yahoo's VXX is the Series B ETN and simply has no data before 2018, so there is nothing there to splice.

**Files changed:** `scripts/refresh_prices.py`, `data/prices.json`, `data/prices.js`, `docs/PRD.md`

---

## [1.20.0] - 2026-08-20

### Annualized return added to the results table

The results table now has an **Annualized** column, sitting right after Total Return and sortable like every other metric. It answers the question Total Return cannot: a 400% gain reads very differently over eight years than over two.

It is a true CAGR, computed over the **run's sample window** rather than over days in market. A signal that sits in cash most of the time is not credited as though the idle stretches did not happen, because that flat time is part of what you actually earned.

Worth knowing before you sort by it: the sample window is the same for every row in a given run, so **Annualized ranks results in exactly the same order Total Return does.** It is there to make the size of a number readable, not to give you a second opinion on which signal is best. Sortino and Calmar remain the columns that rank differently. For the same reason it is deliberately left out of quantile pruning, where it would just apply the Total Return filter twice.

The saved-results snapshot carries the new column, and the storage key moved to `v2` so a snapshot saved before this release is discarded rather than restored with an empty Annualized column. One run rebuilds it.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.19.1] - 2026-08-20

### Your last results are still there when you come back

Signal Miner now saves the **top 100 rows by Sortino** from your last run, locally in your browser, and shows them when you return instead of an empty table. The sample window, the result count and the run date come back with them, and **Copy JSON still works** on every saved row.

One deliberate limitation, stated plainly on screen rather than hidden: **sorting is disabled on restored results.** Only the rows you can see are saved, not the millions behind them, because the full run holds hundreds of megabytes of signal data that no browser will store and that would take longer to reload than to recompute. Sorting the saved 100 would look like it worked while quietly ranking a subset instead of the whole run, so the column headers are greyed out until you run a backtest. The filter box still works, since narrowing what is on screen is honest.

As with the ticker selection, nothing leaves your browser.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.19.0] - 2026-08-20

### Fixed: short-history tickers were being scored unfairly

Signals built on a recently listed fund were penalised for history that fund never had.

Time in Market and the average return feeding Sortino were both divided by the length of the **entire** price history, back to 2018, even when the ticker involved did not list until much later. A fund with `null` prices before it existed cannot fire a signal there, so those days counted against it for nothing. IBIT covers about 30% of the history, which meant an IBIT signal could never report Time in Market above 0.30 no matter how well it actually traded.

Each run now picks a **common sample window**: it starts where the most recently listed of your selected tickers begins, and every signal in that run is scored over that same stretch. On a simulated ticker with 30% coverage, Time in Market corrected from 0.166 to 0.555, its true rate of 361 firing days out of the 650 available, and **Sortino had been understated by 70%**. Total return and max drawdown do not change, since the trades were always the same; only the denominators were wrong.

Two things follow from this, both now shown in the interface. Results are comparable within a run but **not between runs using different tickers**, so the window and the ticker that set it are stated with the results and in the pre-run estimate. And because one recent ticker shrinks the window for everything else, the estimate warns when your selection covers less than 60% of available history, and refuses to run below 30 shared days.

If you have been running signals on IBIT, ETHA, SVIX, KMLM, GDXU, GDXD or DBMF, your earlier results understated them. Worth re-running.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.18.4] - 2026-08-20

### Fixed: every comparison signal was being generated twice

Reported from the results table, where four rows showed the identical signal with identical metrics. They were four spellings of one condition:

```
CumRet(10d) of SOXX < CumRet(10d) of SMH   AND   StdDev-Return(50d) of VOX > StdDev-Return(30d) of QQQE
CumRet(10d) of SOXX < CumRet(10d) of SMH   AND   StdDev-Return(30d) of QQQE < StdDev-Return(50d) of VOX
CumRet(10d) of SMH > CumRet(10d) of SOXX   AND   StdDev-Return(50d) of VOX > StdDev-Return(30d) of QQQE
CumRet(10d) of SMH > CumRet(10d) of SOXX   AND   StdDev-Return(30d) of QQQE < StdDev-Return(50d) of VOX
```

`X < Y` and `Y > X` say the same thing, and the signal builder was emitting both. It walked every ordered pair of tickers and emitted both directions for each, so every two-sided comparison existed twice, and every AND pair four times (two spellings per condition, squared).

Comparisons are now generated once per unordered operand pair, keeping both directions, which loses nothing: `Y > X` is still found, it just gets written `X < Y`. Same-ticker comparisons keep only the shorter window on the left, which also removes the degenerate case of comparing a series to itself, always false and previously backtested anyway. Fast-versus-slow comparisons on one ticker are real signals and are untouched.

**This makes runs roughly twice as fast and halves their memory**, since half of every search was spent rediscovering mirror images. At 80 tickers that is 7.47M signals down to 3.75M. The lower memory also raises the point at which a large run exhausts the tab.

Verified by running the old and new builders side by side and comparing every condition in canonical form: nothing lost, nothing added, no duplicates left. The pre-run signal estimate was updated to match, so it no longer reads about 2x high.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.18.3] - 2026-08-20

### Signal Miner remembers your tickers

New defaults on a first visit: Target **TQQQ**, signals **QQQ, SPY, IWM, DIA**. Previously it opened on QQQ against KMLM/VIXM/TLT.

More usefully, the ticker selection now survives a refresh. Whatever you had picked comes back, stored locally in your own browser. Nothing is sent anywhere, consistent with the site collecting no user data at all.

Only the tickers persist. Signal families, CPU load and the filters reset each visit on purpose, since those decide how hard a run works your machine and are better as a deliberate choice than something inherited from a session you have forgotten about. Selections are checked against the current ticker list when restored, so a ticker removed from the universe later cannot leave a broken selection behind, and if you clear everything and refresh you get your cleared state back rather than having the defaults reimposed.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.18.2] - 2026-08-20

### Results table no longer freezes on huge runs

Reported after a run left roughly 8 million rows cached: the browser locked up when displaying and re-sorting them.

The cause was not rendering. The table only ever drew a few hundred rows, but it got there by filtering, copying, and running a **full sort over every cached row** first, then slicing off the top. On millions of rows that allocated several large arrays and blocked the main thread for seconds, and it happened again on every single sort click.

Sorting is now a bounded selection: one linear pass keeps a buffer of just the rows that will be shown, rejecting most rows in a single comparison against the worst one kept. The full result set still lives in the cache and is still ranked across in its entirety, so sorting means the same thing as before; only the amount of ordering work changed. Verified against the old comparator across every sort column, both directions, with NaN values and heavy ties present.

The display cap is now **100 rows** (was 500), the results filter box is debounced 250ms rather than re-running on every keystroke, and filter matching no longer builds a throwaway lowercased string per row. For result sets above 200,000 rows the table now dims and shows a spinner while a pass runs, so a slow sort reads as working rather than crashed.

One known limit remains: changing the section-3 filters still rebuilds the result set synchronously, so those can still stall on a very large run.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.18.1] - 2026-08-20

### Signal Miner progress shows time remaining

Long runs previously showed only a projected *total*, which meant working out how much longer to wait required watching the percentage and doing the arithmetic. The status line now leads with time remaining: `12m 35s left of ~12m 30s total (idle ~11m 15s)`.

Remaining is computed as projected total minus measured wall-clock elapsed, so the two figures always agree and the countdown is monotonic. Total itself is still projected from compute time scaled by the duty factor rather than from elapsed, which matters more than it sounds: at a batch boundary the current batch's sleep has not run yet, so projecting from elapsed would understate the total by the whole throttle factor on the first reading and then climb steadily, looking broken. Verified by simulating the loop across the Max, Medium and Low settings.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.18.0] - 2026-08-20

### Signal Miner universe more than doubles, with grouped tickers and select-all

**80 tickers, up from 37.** The original list was inherited from a community tool and had real holes: one bond fund, no small caps, no developed international, no broad-market total-market fund. It now covers broad market, factor and dividend, sector, international, a full bond ladder, commodities and crypto, volatility and hedges, and leveraged and inverse, with 43 additions including SPXL, SMH, IWM, VTI, EFA, DIA, and the IEF/IEI/SHY/SHV/BND/BSV/VGSH/VGIT/VGLT bond set. Nothing was removed.

**Crypto arrives as ETFs, not spot.** IBIT and ETHA are included rather than BTC-USD and ETH-USD. Spot crypto trades weekends, which would have stretched the shared date axis from ~2,170 trading days to ~2,800 calendar days and silently redefined every existing signal, since window lengths count rows: `RSI(10)` would have become 10 calendar days with 2 in 7 missing. The ETFs trade the normal NYSE calendar, so the axis is unchanged. They are also real Composer assets, so "Copy JSON" still exports a valid symphony.

**Chips are grouped, with All buttons.** 80 chips in a flat row is unusable, so tickers are now grouped by asset class, each group has its own **All** toggle, and each row has a whole-universe select and a clear. Grouping is carried in `prices.json` as a new `group` field on each ticker, so the list and its grouping stay in one place.

**Limited-history tickers are flagged.** Seven funds list after the 2018 start (ETHA at 24% coverage, IBIT 30%, SVIX 51%, KMLM/GDXU/GDXD 66%, DBMF 84%). Their metrics are fit to a shorter sample, and the default Min Time in Market floor of 0.05 will not screen that out, so they now render with a dashed chip border and a "limited history" tooltip.

Selecting everything is heavy, by design rather than by accident: 80 tickers is roughly 8.2M signals before the target multiplier, well past the 100k warn threshold. The estimate readout and the existing confirm prompt both still apply.

**Files changed:** `signal-miner.html`, `scripts/refresh_prices.py`, `data/prices.json`, `data/prices.js`, `docs/PRD.md`

---

## [1.17.1] - 2026-08-16

### Homepage curated count corrected, dedupe audit finding recorded

The homepage stats bar read **29 Curated** while `data/strategies.json` has held **30** entries for some time. The stats bar is hardcoded by design (loading the full database client-side just for five numbers would blow the homepage's page-weight target), which is exactly how it drifted. Corrected to 30 here and in the six places the PRD still said 29.

Also recorded a **known limitation of `dedupe_symphonies.py`** in the PRD: its keeper rule (longest `oos_date`, then earliest `symphony_id`) does not always keep the copy with the most watchers. A manual audit of 3 duplicate clusters found 2 agreed, but one kept an 8-watcher copy over a structurally identical 173-watcher sibling. Left as-is deliberately, since watcher count is a popularity signal rather than a correctness one and promoting it would trade away backtest length. This had been sitting in a loose spreadsheet rather than the docs; the two stray `.xlsx` working files in the repo root were removed once their contents were captured or confirmed redundant.

**Files changed:** `index.html`, `docs/PRD.md`

---

## [1.17.0] - 2026-08-15

### Leaderboard ranking in the Screener + tag filtering on the strategy index

Two features that make existing data usable rather than adding new data.

**Leaderboard Rank / Tier / Score in the Screener.** All three Screener views (Overview, Risk-Adjusted, Distribution) now carry sortable **Rank**, **Tier**, and **Score** columns, and the filter grid gains a **Leaderboard Tier** select with cumulative options ("S+ only", "S or better", … "C or better") that match the "Over X" threshold style of every other filter. Previously the Leaderboard's scoring and the Screener's filtering ignored each other entirely; now you can filter to, say, A-or-better and then screen those by drawdown and Sharpe in one pass. Scoring runs **once globally** over the full eligible pool and both tabs read the same index, so a symphony's rank and tier mean the same thing everywhere and do not shift as you filter. (Re-scoring within the filtered subset was considered and rejected: it would make the tier filter circular, since filtering to "S or better" would immediately re-tier the survivors.) Rows awaiting a metric refresh show a dash and drop out when a tier floor is set.

**Tag filtering on the strategy index.** The tags every strategy already carries are now clickable filters on `strategies.html` instead of read-only labels. They are grouped into Signal / Risk metric / Asset class / Collection, each chip shows how many strategies carry it, and only tags present in the data are offered. Selecting several combines them with **AND**, so each tag narrows the list further, and the header switches to "N of 30 strategies" while filtered. Selections are written to a **`?tags=` query param**, making a filtered view linkable and letting it survive a refresh or a back-navigation from a strategy detail page.

**Files changed:** `database.html`, `strategies.html`, `css/main.css`, `docs/PRD.md`

---

## [1.16.10] - 2026-08-15

### Signal Miner CPU load levels renamed; monetization removed from the roadmap

**CPU load levels renamed** to a single consistent intensity scale: **Max** (100% CPU), **High** (~50%), **Medium** (~25%, default), **Low** (~10%). Previously "Full speed / Balanced / Easy on CPU / Coolest", which mixed a speed scale with a heat scale. The percentages stay in the option text since the names are now abstract. The underlying option values were renamed to match (`max`/`high`/`medium`/`low`); the old values were a trap, because `eco` referred to the 25% tier and would have collided with an "Eco" label on the 10% tier. Behavior is unchanged.

**Monetization removed from the product plan.** The former V3.0 "Monetization Expansion" roadmap section (premium strategy tier, newsletter integration, performance alerts) is removed entirely rather than deferred, along with the Google AdSense goal and backlog item. Composer Atlas is free and unmonetized; the only funding channel is voluntary reader donations via Buy Me a Coffee, linked as Support in the nav and footer. Non-Goals now explicitly rule out ads, paid tiers, paywalled content, sponsored placement, email capture, and any user data collection, and Tenet 7 (Independence and Integrity) records the stance and the reason behind it.

**Files changed:** `signal-miner.html`, `docs/PRD.md`

---

## [1.16.9] - 2026-08-15

### Signal Miner CPU throttle reworked to a duty-cycle rate limiter with a time estimate

Reworked the **CPU load** control from fixed pauses to an adaptive **duty-cycle** limiter: after each batch the run idles for a multiple of the time that batch actually spent computing, so the processor holds a target busy fraction no matter how fast the machine is (heat tracks duty cycle, not absolute idle time). The four levels now map to a stable CPU-busy target: **Full speed (100%)**, **Balanced (~50%)**, **Easy on CPU (~25%, default)**, and a new **Coolest (~10%)** tier for maximum heat reduction. While a run is going, the status line now shows a live estimate of total run time and idle time (measured from actual compute so far), e.g. `... 12% · ~25% CPU · est. total 6m (idle ~4m)`. Results are unaffected; this only governs how hot and how fast the run goes.

**Files changed:** `signal-miner.html`

---

## [1.16.8] - 2026-08-15

### Signal Miner: default Prune quantile is now 0 (show everything)

Changed the default **Prune quantile** from `0.5` to `0` (in both the form and the example/reset preset), so a fresh run no longer trims any single signals before pairing them into combinations; all qualifying signals are shown by default. Raising the quantile still prunes as before for anyone who wants a smaller, more selective set of combinations.

**Files changed:** `signal-miner.html`

---

## [1.16.7] - 2026-08-15

### ETF Cloner ticker fix, Signal Miner live filters, mobile overflow hardening

Three fixes in one pass:

- **ETF Cloner share-class tickers now use Composer/Crescendo format.** Holdings feeds render multi-class tickers with a dot (`BRK.B`, `BF.B`) or dash (`BRK-B`), but Composer *and* Crescendo require the slash form `BRK/B` or the symphony will not save or backtest (community-reported and confirmed). `cleanSym()` now normalizes a trailing single-letter class suffix to `/X`, so both input paths (live fetch and file upload) and both the on-screen table and the emitted JSON use the compatible form. Plain tickers and multi-letter suffixes are left untouched; QA'd against `BRK.B`/`BRK-B`/`BF.B`/`LEN.B` (→ slash) and `VTI`/`VT`/`AAPL` (unchanged).

- **Signal Miner filters update results live, no re-run.** After a backtest, changing **Min Time in Market**, **Max Drawdown floor**, **Prune quantile**, or the **AND-pairing** toggle now re-filters the results instantly (debounced) instead of forcing a full re-run. The expensive Pass 1 caches every valid single-signal result plus the arrays needed for pairing; the filters re-apply against that cache and recompute only the cheap pairing step. Changing tickers, families, or the min period still needs a fresh run (those change which signals exist).

- **Mobile overflow hardening at ~390px.** Hardened `body` with `overflow-x: clip` and `overflow-wrap: break-word` so the page can no longer scroll sideways (which was clipping the nav/hamburger) and long tickers/IDs/URLs wrap instead of forcing width. `clip` does not make `<body>` a scroll container, so sticky/fixed positioning and the fixed nav are unaffected. Should still be eyeballed at ~390px on a device.

**Files changed:** `etf-cloner.html`, `signal-miner.html`, `css/main.css`, `docs/PRD.md`

---

## [1.16.6] - 2026-08-15

### Renamed Signal Lab → Signal Miner; added a CPU-load throttle

**Rename:** "Signal Lab" is now **Signal Miner** — a name that describes what the tool actually does (brute-force mine a large combinatorial space of IF/THEN rules and backtest them). The page moved to `signal-miner.html` and the label updated across the nav Tools dropdown, footer, homepage Explore card, and page copy. The old `signal-lab.html` URL now serves a `noindex` redirect stub that forwards to the new URL (preserving any query string), so existing links keep working.

**CPU throttle:** Added a **CPU load** control (Easy on CPU / Balanced / Full speed, defaulting to Easy). "Easy" processes signals in smaller batches and idles briefly between them, so a big run no longer pins the processor at 100% and spins up fans; "Full speed" is the previous unthrottled behavior for anyone who wants maximum speed. This trades some wall-clock time for lower sustained CPU load and heat.

**Files changed:** `signal-miner.html` (renamed from `signal-lab.html`), `signal-lab.html` (new redirect stub), `js/app.js`, `index.html`, `docs/PRD.md`

---

## [1.16.5] - 2026-08-15

### Navigation: move About out of the primary nav

Removed **About** from the primary nav to trim the top level further; it remains in the footer sitemap (its complete-sitemap role is unchanged). Nav top level is now Home, Strategies, Database, Tools, Glossary, Azqato Invests, Support.

**Files changed:** `js/app.js`

---

## [1.16.4] - 2026-08-15

### Signal Lab: no hard signal cap, warn-and-confirm instead; new default floors

Removed the hard 120k-signal stop that blocked large runs outright. A run above 100,000 signals now shows a confirm dialog explaining that the batch is large and may make the browser slow or unresponsive, and asks whether to proceed — the user can run it anyway or cancel. Also changed two defaults: **Min Time in Market** `0.025` → `0.05` and **Max Drawdown floor** `-0.5` → `-0.8` (both in the form and the example/reset preset). The live signal-count estimate still turns red past 100k as a heads-up, but no longer implies the run is blocked.

**Files changed:** `signal-lab.html`

---

## [1.16.3] - 2026-08-15

### Navigation: Tools dropdown; ETF Cloner added to footer + homepage

Reworked the primary nav to reduce top-level crowding: **RSI Signals**, **Signal Lab**, and **Converter** now live under a single **Tools** dropdown (hover or focus on desktop, click for touch/keyboard, with outside-click and Escape to close), leaving the top level as Home, Strategies, Database, Tools, Glossary, About, Azqato Invests, and Support. Added **ETF Cloner** to the footer sitemap and as a card in the homepage "Everything on this site" Explore grid; it remains intentionally out of the primary nav. This resolves the tracked footer-rule exception from 1.16.0 — every public page is once again linked from the footer.

**Files changed:** `js/app.js`, `css/main.css`, `index.html`

---

## [1.16.2] - 2026-08-15

### ETF Cloner: filter holdings to real companies; fully hide the file input

Issuer holdings files (and the live feed) list cash, futures, collateral, pending dividends, and currency as holding rows, and those line items can carry a "ticker" that collides with a real security — most notably a cash row of `USD` resolving to **USD**, the ProShares Ultra Semiconductors ETF. The tool now drops all such non-company rows, both by **name** (a cash/futures/collateral/dividend/currency blocklist) and by **currency-code ticker** (`USD`, `EUR`, `JPY`, …), on both the live-fetch and uploaded-file paths; the remaining company weights renormalize to 100%. Validated against the exact junk rows seen in a real QQQ file (all excluded) plus tricky real names that must be kept (FUTU Holdings, Forward Air, Option Care Health). Also hardened the dropzone's hidden file `<input>` (visually-hidden clip pattern) so the native picker control never paints on hover.

**Files changed:** `etf-cloner.html`

---

## [1.16.1] - 2026-08-15

### ETF Cloner: weighting toggle now governs uploaded baskets; required-columns note

Moved the **Match ETF weights / Equal weight** toggle out of the live-fetch panel and into the Holdings results panel, so a single control re-renders whatever result is shown (previously it read as disconnected when working from an uploaded file). Added a note to the upload panel that the imported file must contain a **Ticker** column and a **Weight** column (header labels like "Symbol" or "Weight (%)" are recognized; column order and extra columns do not matter).

**Files changed:** `etf-cloner.html`

---

## [1.16.0] - 2026-08-15

### Added ETF Cloner: turn any ETF into a Composer holdings-clone symphony

Added `etf-cloner.html`, a standalone tool that generates a Composer symphony replicating an ETF's holdings. Two independent, fully client-side input paths: (1) **type a ticker** to pull the fund's top ~25 holdings live (read from stockanalysis.com's `__data.json` route through a CORS relay, since issuer files and holdings APIs are otherwise CORS-blocked or key-gated), and (2) **upload the issuer's own holdings file** for the complete basket — CSV parsed directly, and `.xlsx` unzipped **natively in the browser** (`DecompressionStream('deflate-raw')` + `DOMParser`, no library), with a generic column-mapper that finds the Ticker/Weight/Name columns across issuer layouts. Either way it outputs a Composer symphony (`root` → `wt-cash-specified` to match fund weights, or `wt-cash-equal`) with copy-to-clipboard and download. Weights use a large denominator so hundreds of tiny full-basket positions never round to a zero weight; validated end to end against a real State Street SPY file (503 holdings, weights summing exactly). Nothing is uploaded anywhere and there is no server component.

The page is indexable but, at the user's request, is intentionally **not** linked from the primary nav, the footer sitemap, or the homepage Explore grid for now — the current tracked exception to the "footer links every public page" rule (see PRD Section 14, V2.2).

**Files changed:** `etf-cloner.html`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.15.0] - 2026-08-15

### Added Signal Lab: a client-side IF/THEN signal miner and backtester

Added `signal-lab.html`, a new standalone tool that brute-forces Composer-style "IF condition THEN invest in target" signals and backtests each one, reworked from scratch from a community Google Colab notebook by IAMCAPTAINNOW. It generates all five signal families (RSI vs level, RSI vs RSI, cumulative return vs level/return, return moving-average compare, return std-dev compare), plus 2-signal AND combinations with sequential quantile pruning, and ranks the survivors in a sortable, filterable table with a copy-as-Composer button per row. A selectable minimum signal period (default 10 days) filters the window grids, which span 10d to 200d.

Everything runs **entirely client-side in the browser** (in chunked passes with a progress bar so the UI never freezes); there is no server. The only input is `data/prices.json`, a committed snapshot of full daily adjusted-close history for a 37-ticker universe (the 20 Frontrunner RSI tickers plus common hedge, diversifier, and leveraged/inverse/volatility tickers, including GDXU and GDXD), fetched by the new `scripts/refresh_prices.py`. The backtest engine was validated to match an independent pandas reference to within 1e-6 on every metric.

The page is `noindex` and **not linked from navigation**, reached by direct URL only (same treatment as `converter.html`). The `prices.json` snapshot was shipped without automated refresh at first (scheduled the same day, see 1.15.1).

**Files changed:** `signal-lab.html`, `data/prices.json`, `data/prices.js`, `scripts/refresh_prices.py`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.15.5] - 2026-08-15

### Processed AddSymphony.csv: 2 new symphonies added

Added 2 new URLs from `data/AddSymphony.csv` to `data/database.json` directly, fetched real backtest data for each, and cleared the CSV back to its header. New entries: "Pals Minor Spell of Summon Money (Core Logic)" (`zY4jRnXoFC9e1Pt97YDS`), "PP MAX TEC" (`P7RLUTtWmTjkJBaNBQT9`). Database now has 6,667 entries.

**Files changed:** `data/database.json`, `data/database.js`, `data/AddSymphony.csv`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.15.5] - 2026-08-15

### Signal Lab "Copy" now exports a pasteable Composer symphony

Changed the Signal Lab results-table copy button from a plain-English string to **"Copy JSON"**, which puts a complete Composer symphony on the clipboard, ready to paste straight into the Composer editor. The output mirrors Composer's real export schema (`root` → `wt-cash-equal` → `if` → `if-child` then/else), with the target asset in the THEN branch and a cash proxy (BIL) in the ELSE branch, matching the tool's "hold cash when the signal is off" backtest. Each condition is emitted both as the modern `condition` object (a `compound` of `binary-compound` sub-conditions, with `ticker: "%"` + a `tickers` array, cumulative-return levels as whole-number percents, and `{ "constant": ... }` for fixed levels) and the legacy flat `lhs-fn`/`comparator`/`rhs-*` fields. AND-combined rows export as an "all of" compound; single signals as a one-condition compound. Node ids are freshly generated (`crypto.randomUUID` with a fallback). Validated field-for-field against a real Composer export.

**Files changed:** `signal-lab.html`, `docs/PATCHNOTES.md`

---

## [1.15.4] - 2026-08-15

### Made the converter indexable

Removed the `<meta name="robots" content="noindex, nofollow">` tag from `converter.html`. Now that the converter has a footer link and a homepage Explore card, it should be discoverable in search like every other page. No page on the site carries a `noindex` meta anymore. The converter remains out of the primary nav by design.

**Files changed:** `converter.html`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.15.3] - 2026-08-15

### Formalized the navigation & linking model; footer is now a full sitemap

Codified a three-surface linking model (documented in PRD Section 10, "Navigation & Linking Model") and brought the site into line with it:

- **Footer = complete sitemap.** The footer now links *every* public-facing page. Added **Home** (and reordered so About sits at the end of the internal links). Only `404.html` is excluded.
- **Homepage "Everything on this site" grid = one card per self-built tool/section.** Added a **Converter** card (🔧), so the grid now covers all six internal footer tools (Strategies, Database, RSI, Signal Lab, Glossary, Converter). The grid moved from `.grid-5` to `.grid-3` (a balanced 3x2 for six cards; the unused `.grid-5` rule was removed), and the subhead changed from "Five ways to explore" to "Six ways to explore and build."
- **Primary nav = curated destinations.** Unchanged in this release; the converter stays out of the nav by design.

Net effect: the converter, previously footer-only, now also has a homepage Explore card (it remains `noindex` and out of the nav). Going forward, every new public page must be added to the footer; tools/sections also get an Explore card; only primary destinations go in the nav.

**Files changed:** `js/app.js`, `index.html`, `css/main.css`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.15.2] - 2026-08-15

### Linked Signal Lab into navigation; added "Home" nav link

Promoted Signal Lab from a direct-URL-only tool to a first-class page: added it to the primary nav bar (between RSI and Glossary), the footer, and a new fifth homepage Explore card (with a 🧪 icon; the Explore grid moved from `.grid-4` to a new `.grid-5` layout, and the section copy changed from "Four ways" to "Five ways"). Removed its `noindex` meta so it can be indexed. The Symphony → JSON converter was given a footer link only (staying out of the nav and homepage, and keeping its `noindex`). Also added a "Home" link as the first item in the primary nav (previously only the logo and the mobile menu linked home); the mobile menu now derives from the same shared link list, so Home is no longer duplicated there.

Refreshed the homepage overview now that the site is fully built out: the hero blurb now mentions mining and backtesting your own signals, and the "How to use this site" section grew from three steps to four (adding a "Mine your own signals" step for Signal Lab, `.grid-3` to `.grid-4`, "Three steps" to "Four steps").

**Files changed:** `js/app.js`, `index.html`, `css/main.css`, `signal-lab.html`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.15.1] - 2026-08-15

### Scheduled weekly price refresh + last-refreshed display

Added `.github/workflows/refresh-prices.yml` to run `scripts/refresh_prices.py` automatically once a week (cron `7 8 * * 6`, 08:07 UTC every Saturday while markets are closed), committing any updated `data/prices.json` / `data/prices.js`. The script takes ~50 seconds to fetch all 37 tickers (a 1-second polite delay between API calls dominates); the full Action completes in roughly 75-90 seconds including checkout and Python setup. Also added a visible "Data last refreshed" indicator to the Signal Lab hero (with a green dot, the formatted `refreshed_at` date, ticker count, and latest covered trading day) and expanded the footer meta line to note the weekly cadence.

**Files changed:** `.github/workflows/refresh-prices.yml`, `signal-lab.html`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.14.16] - 2026-07-29

### Added Symphony → JSON converter tool

Added `converter.html`, a standalone tool that converts a Composer symphony (pasted URL or ID) into clean, formatted JSON and a readable IF/ELSE logic tree. It fetches from the Composer `/score` API with a CORS fallback (open-in-tab link), renders the full step tree including compound "Any of / All of" condition blocks, and offers copy/download plus an optional field-stripping toggle. Defaults to zoop's 2026 Frontrunner as the example on load. The page is `noindex` and **not linked from navigation**, reached by direct URL only.

**Files changed:** `converter.html`

---

## [1.14.15] - 2026-07-29

### Added Triple Accelerator to curated strategies library and full database

Added "Triple Accelerator" by Inverteum Capital (symphony ID `0jPwZ5Lm2Y3xH24oEijB`) to both `data/strategies.json` (curated library, now 30 entries) and `data/database.json` (full database, now 6,665 entries). The strategy is a compact three-state rotation: TQQQ RSI(10) > 79 routes to UVXY (overbought hedge), SPY above 200d MA routes to TQQQ (bull trend), and SPY below 200d MA routes to SPY (bear capital preservation). Stats: 75.4% ARR, 4,053x cumulative return over ~14.8 years, 61.7% max drawdown, 1.34 Sharpe, 1.22 Calmar. Tags: `rsi`, `leveraged-etfs`, `200d-ma`, `vix-tiers`.

**Files changed:** `data/strategies.json`, `data/strategies.js`, `data/database.json`, `data/database.js`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.14.14] - 2026-07-17

### Processed AddSymphony.csv: 10 new symphonies added and refreshed

Added 10 new URLs from `data/AddSymphony.csv` to `data/storage.csv` and `data/database.json` directly (per the established narrow workflow), refreshed all 10 with real backtest data, regenerated the summary export, cleared the CSV back to its header. New entries: Some Dip Buys, TECL Dip, BSC REMOVED | Single Popped, Safe Dips/Rips l 10 Jan 2011, Hi-Volume DipRip, Basic RSI OB/OS Framework, High Win Rate Test V2, FR 11/14/2025 Front Runner Current | NOVA'd | Interstellar RL, When QQQ is cheap AND world is ending buy TQQQ and some UVXY also, Nested BTD (YINN/YANG surgically removed).

**Files changed:** `data/database.json`, `data/database.js`, `data/database_summary.json`, `data/database_summary.js`, `data/storage.csv`, `data/AddSymphony.csv`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.14.13] - 2026-07-17

### Processed AddSymphony.csv: 3 new symphonies added and refreshed

Added 3 new URLs from `data/AddSymphony.csv` to `data/storage.csv` and `data/database.json` directly (per the established narrow workflow), refreshed all 3 with real backtest data, regenerated the summary export, cleared the CSV back to its header. New entries: "L/S" (`d2IT6JJmlGr1YqtiLfz3`), "BIL+ (2x, No BTC)" (`oUF7srtPrrr5X7ipcCXM`), "BSC" (`GojyU2D4nF50GI33A7za`).

**Files changed:** `data/database.json`, `data/database.js`, `data/database_summary.json`, `data/database_summary.js`, `data/storage.csv`, `data/AddSymphony.csv`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.14.12] - 2026-07-15

### Confirmed the full 2026-Edition replacement mapping; added zoop's KMLM Switcher

User confirmed the SPXL/UPRO ticker-swap mapping, submitted the KMLM Switcher replacement (added to `data/database.json` and refreshed with real backtest data: +231.7% ARR, 2.36 Sharpe), and decided Manhattan Project should be removed outright rather than replaced. Full 12-strategy mapping (11 replacements + 1 removal) now locked in the Section 14 roadmap entry, ready to apply to the curated set whenever that work is picked up.

**Files changed:** `data/database.json`, `data/database.js`, `data/database_summary.json`, `data/database_summary.js`, `data/storage.csv`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.14.11] - 2026-07-15

### Added 10 new symphonies via AddSymphony.csv; mapped to curated 2026-Edition replacements

Processed `data/AddSymphony.csv` per the documented workflow: added the 10 new URLs to `data/storage.csv` and `data/database.json` directly (explicitly *not* via `scripts/sync_storage_to_database.py`, per the storage.csv-divergence warning added this session), refreshed each with real backtest data, regenerated the summary export, cleared the CSV back to its header.

Also documented two operational incidents from this session for future reference: (1) `sync_storage_to_database.py` pulled in 1,055 stale/purged entries instead of 10 when first tried — reverted before committing, redone by adding rows directly; (2) a background `refresh_full_database.py` run (legitimately processing the full ~6,600-row backlog, not stuck) was mistaken for a batch of zombie processes and killed via `taskkill /F /IM python.exe` — lost ~7 rows of uncheckpointed progress (harmless, picked up on a future run) but was a real mistake worth a permanent note against blind process cleanup in this environment.

Once refreshed, the 10 new symphonies' real names revealed a clear mapping to 9 of the 12 curated "zoop's X (2026 Edition)" strategies (documented in Section 14, V2.2) — logged as the next roadmap item, not yet applied to `data/strategies.json`. Two open questions flagged: one probable match (SPXL vs. UPRO ticker swap) needs confirmation, and two curated strategies (Manhattan Project, KMLM Switcher) have no submitted replacement yet.

**Files changed:** `data/database.json`, `data/database.js`, `data/database_summary.json`, `data/database_summary.js`, `data/storage.csv`, `data/AddSymphony.csv`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.14.10] - 2026-07-15

### Fixed orphaned duplicate pointers; 8 more clusters swapped to most-watched member

Fixed a bug from the previous "Holy Grail" override: 3 other cluster members still referenced the old (now itself flagged) kept ID instead of the new one. A one-off headless-Chrome scrape sampled 13 duplicate clusters' "Watched by N" counts (not exposed by the API) and found the current `symphony_id`-based tiebreak had picked the most-watched member in only 2 of 13 — swapped the other 8 correctly-mismatched clusters to their most-watched member, updating every cluster member's pointer consistently this time (not just the swapped pair): Mean Reversion Comparison to Python Code, TQQQ FTLT w/Sideways Market Mods (FINAL), Nuclear Energy with Feaver Frontrunner V5, S&P Symphony w/ Leverage, TQQQ or Not - Non-Degen Gambler Variant, "We know this works. We just get greedy.", Inside Nancy Pelosi's Chips- V3, Copy of Holy Grail simplified.

**Files changed:** `data/database.json`, `data/database.js`, `data/database_summary.json`, `data/database_summary.js`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.14.9] - 2026-07-15

### Manual duplicate override: "The Holy Grail" restored as the kept entry

The dedup pipeline's deterministic tiebreak (earliest `symphony_id` when `oos_date` ties) had picked "The Holy Grail (Buy Copy)" over the plain-named "The Holy Grail" as the canonical kept row within a 5-member identical cluster — correct per the documented policy, but not what the user wanted for this specific strategy. Manually swapped which of the two carries `flag: null` vs. `flag: "duplicate"` directly in `data/database.json`, regenerated `data/database.js` and `data/database_summary.json`/`.js`. Also logged a future-state idea to the roadmap: eventually basing the dedup tiebreak on a symphony's "Watched by N" popularity count instead of `symphony_id` — not buildable yet, that count isn't exposed by the API endpoints this pipeline uses.

**Files changed:** `data/database.json`, `data/database.js`, `data/database_summary.json`, `data/database_summary.js`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.14.8] - 2026-07-15

### Added data/AddSymphony.csv: a manual symphony-submission inbox

New single-column CSV (`url`), same format as `storage.csv`, where the user drops new Composer symphony URLs to submit for database inclusion. Documented the full workflow in `docs/PRD.md`'s Operational Runbook: check each URL against `storage.csv` for duplicates, append survivors to `storage.csv`, add them to `database.json` as new unrefreshed rows, refresh and regenerate the summary export, then clear the file back to its header. Manual-only by design, same posture as `flag_name_noise.py`/`dedupe_symphonies.py` — never runs automatically or from a scheduled workflow.

**Files changed:** `data/AddSymphony.csv` (new), `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.14.7] - 2026-07-15

### Redesigned the homepage stats bar; trimmed ~331KB of dead page weight

Replaced the original 5 homepage stats (Best Sharpe/Top ARR were cherry-picked maximums from the curated 29) with 5 chosen for honesty and site-wide scope after rating ~30 candidate stats for homepage importance: **6,640 Strategies** (full database), **+48.7% Median ARR** (full-DB median), **-34.7% Median Drawdown** (full-DB median), **29 Curated**, **Last Refreshed** (Jul 12, 2026). Currently hardcoded static values, to be replaced later by a small derived stats file rather than loading the full `database_summary.json` client-side (would blow the homepage's own <500KB page-weight target). Also removed `data/strategies.js`/`data/glossary.js` from `index.html` — dead weight (~331KB combined) now that the homepage no longer computes stats or renders strategies client-side.

**Files changed:** `index.html`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.14.6] - 2026-07-15

### Roadmap: Leaderboard Ranking coming to the Screener (V2.2, next up)

Documentation only, nothing built yet. Decided to surface the V1.17 Leaderboard score/tier inside the Screener both as a bucket-filter select (Tier: S+/S/A/B/C/F, matching the existing dropdown pattern) and as a sortable Rank/Score/Tier column added to all three Screener views (Overview, Risk-Adjusted, Distribution), reusing the existing `computeScores()`/`computeTiers()` logic against the Screener's already-filtered pool.

**Files changed:** `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.14.5] - 2026-07-15

### Redesigned the homepage as a marketing/landing page

`index.html` no longer renders the strategy grid inline (all 29 cards) — that's `strategies.html`'s job now, and it already has its own listing sorted the same way. New homepage structure: rewritten hero copy framing the whole site (not just curated strategies), the existing stats bar unchanged, a new 4-card "Explore the Site" grid (Strategies / Database / RSI Signals / Glossary), and a new 3-step "How to use this site" section. Modeled structurally after a landing page built for a sibling project, adapted to this site's own design tokens. New CSS: `.grid-4`, `.explore-icon`, `.step-num`.

**Files changed:** `index.html`, `css/main.css`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.14.4] - 2026-07-15

### Nav reorder, strategies.html sort/copy, homepage hero link fix

Reordered the top nav to Strategies, Database, RSI, Glossary, About, Azqato Invests, Support (`js/app.js`, desktop + mobile). `strategies.html`'s listing now sorts by longest backtest first, matching the homepage grid exactly, and its intro copy now explains these are "merely a set of featured, highlighted strategies" with a link to the full Database for anyone wanting more. The homepage's "Browse Strategies" button previously jumped to an in-page `#strategies` anchor; now links to `strategies.html`, same `u()`-based pattern already used for the Glossary button. Also added a Roadmap item (V2.2) for a pre-existing mobile overflow bug at ~390px width, found while testing `strategies.html` and confirmed sitewide via `about.html` — not yet fixed, needs root-cause investigation.

**Files changed:** `js/app.js`, `strategies.html`, `index.html`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.14.3] - 2026-07-15

### Screener refinements: search box, dropped flag toggle, denser bucket options

`database.html`: added a "Search by name..." textbox to the left of the Filter button on All Strategies and Leaderboard (Screener already had one); all three name-search boxes (including Screener's pre-existing one) now filter live on every keystroke instead of requiring Enter/blur, with focus/cursor position preserved across the re-render. Removed Screener's 3-state flag toggle (Default/All/Broken) entirely — Screener is now always Working-only, matching Leaderboard's existing non-toggleable behavior; only All Strategies keeps a toggle. Screener's bucket dropdowns expanded from 4-5 sparse percentile options to a uniform 9 deciles (10th-90th, 10% steps) + Any = 10 options per field, for all 20 fields.

Also corrected a stale "28 curated strategies" count to 29 in two spots in `docs/PRD.md` and in `README.md` (library grew to 29 in a prior update), and removed README's now-outdated note that the Leaderboard scoring model was "due for a revision" (V1.17 shipped it 2026-07-13).

**Files changed:** `database.html`, `css/main.css`, `docs/PRD.md`, `README.md`, `docs/PATCHNOTES.md`

---

## [1.14.2] - 2026-07-15

### Added AI Summaries for 4 strategies; documented required add-strategy step

Added `ai_summary` content for the 4 strategies that were missing it: `bnd-vs-sphb`, `dip-buying-tech`, `ob-os-staple-bonds`, and `sometimes-tqqq`. All 29 strategies now have AI Summaries.

Updated `scripts/add_ai_summary.py` with entries for all 4 new slugs. Ran the script to write summaries into `data/strategies.json` and `data/strategies.js`.

Updated `docs/PRD.md` to make adding a slug to `scripts/add_ai_summary.py` an explicit required step in both the manual and automated add-strategy workflows. The script is the canonical store for all summaries; writing `ai_summary` directly in the JSON without also updating the script means the entry is not tracked in the canonical location and will produce a warning on future script runs.

**Files changed:** `data/strategies.json`, `data/strategies.js`, `scripts/add_ai_summary.py`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.14.1] - 2026-07-13

### Tightened S+ tier from top 1% to top 0.25%

Launch feedback: top 1% (62/6,225 eligible entries) produced too many S+ strategies. Tightened to top 0.25%, now 16 entries. S's band absorbs the difference (9.75% instead of 9%, keeping S+ combined with S at the same top-10% boundary); A/B/C/F unchanged.

**Files changed:** `database.html`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.14.0] - 2026-07-13

### Shipped V1.17: Leaderboard scoring model revision

Reweighted all 20 existing metrics against the site's actual mission (best return + long backtest + relatively safe) instead of the original category-based point split, raised the clamp constant from 0.22 to 0.14 so top performers separate more, and redefined S+ from an unreachable "literal perfect score" into a real top-1% rank cut (confirmed live: 62 of 6,225 eligible entries now land in S+). Category display collapsed from 7 to 4 (Return / Risk-Adjusted+Downside Risk / Shape & Concentration / Longevity) in the breakdown and Methodology modals. No metrics were dropped; nothing changed about eligibility or the noise-exclusion rule. Full rationale, every metric's weight, and the clamp-constant testing that led to 0.14 are documented in `docs/PRD.md` Section 14, V1.17.

**Files changed:** `database.html`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.13.8] - 2026-07-13

### Roadmap: planned cross-links between curated strategies and the full database (V2.2)

Documentation only, nothing implemented. Confirmed all 29 curated strategies already exist as rows in the full database (matched by `symphony_id`), and that both pipelines redundantly backtest the same 29 symphonies via identical Composer API calls on separate schedules. Decided to add navigational cross-links only (a "View in full database" link from strategy detail pages, a "★ Curated" badge on matching `database.html` rows) rather than merging the two metrics pipelines into one source of truth — that bigger option was considered and explicitly deferred (not rejected) pending a real decision on flagged-row fallback behavior, since it introduces a coupling risk the cross-link-only approach doesn't. Full writeup added under V2.2 in Section 14.

**Files changed:** `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.13.7] - 2026-07-13

### Fixed: formatDate() off-by-one day in timezones behind UTC

The database Last-Updated badge showed "Jul 11, 2026" when the underlying `refresh_date` was actually `2026-07-12`. Root cause: `formatDate()` in `js/app.js` built a `Date` at UTC midnight (`iso + 'T00:00:00Z'`) but called `.toLocaleDateString()` without a `timeZone` option, so the browser rendered it in the viewer's local timezone — any timezone behind UTC (all of the Americas) shows the previous calendar day. Fixed by adding `timeZone: 'UTC'` to the formatting options. This is a shared helper used everywhere a date-only field is displayed (strategy detail pages' "Last Updated" row, the database badge, etc.), so the fix corrects all of them, not just the one badge that surfaced it.

**Files changed:** `js/app.js`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.13.6] - 2026-07-13

### Fixed: RSI workflow silently never fired on its first weekday test

Data was last refreshed Friday 2026-07-10 23:06 UTC — all 3 of Friday's slots ran fine, but Monday's (2026-07-13) 15:00 UTC slot, the schedule's first real weekday test, never fired at all (confirmed via the GitHub Actions API: 0 runs since Friday, while sibling scheduled workflows in this repo fired normally in the same window). Root cause: `refresh-rsi.yml`'s cron was `0 15,19,22 * * 1-5`, on-the-hour — GitHub Actions' most congested scheduling slot, prone to being delayed for hours or dropped on public repos. The two sibling workflows (`refresh-full-database.yml`, `update-metrics.yml`) already avoid this by offsetting their cron minute (`:07`, `:20` respectively); `refresh-rsi.yml` was the one workflow that didn't get the same treatment when it was written. Fixed by changing to `7 15,19,22 * * 1-5`.

**Files changed:** `.github/workflows/refresh-rsi.yml`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.13.5] - 2026-07-13

### Replaced "work in progress" text with a Last-Updated badge

`database.html`'s "This section is a work in progress." line is gone, replaced with a pill badge (green dot + "Last database update: [date]") computed client-side as the max `refresh_date` across all loaded entries — same visual pattern as an equivalent badge on a sibling site. `rsi.html`'s existing "Last refreshed" line was restyled to match the same `.updated-badge` component instead of being plain text. Also dropped the stale "(in progress)" from `database.html`'s meta description.

**Files changed:** `database.html`, `rsi.html`, `css/main.css`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.13.4] - 2026-07-13

### Added: Sometimes TQQQ (Original) — 29 strategies total

- **Sometimes TQQQ (Original)** (`sometimes-tqqq`, symphony `MyRyWhvbdxTsRfzHmE1U`): Five-regime TQQQ framework. Two unconditional priority gates: QQQ RSI(10) < 32 rotates to TECL (3x tech dip-buy); SPY RSI(10) < 30 rotates to UPRO (3x S&P500 dip-buy). Overbought guards: QQQ RSI(10) > 81 or SPY RSI(10) > 80 rotates to UVXY. Bull market routes through three sub-strategies (Choppy Market, Bull 1, Bull 2) using SPY 60d RSI and TLT vs. PSQ momentum; bear market through two (Bear 1 deep, Bear 2 shallow). Bond vs. equity momentum comparisons (BND vs. BIL, IEF vs. PSQ, BND vs. SH) determine TQQQ vs. PSQ/SQQQ/GLD/BIL at each sub-strategy. ARR 326.5%, max DD 45.6%, Sharpe 2.76, Calmar 7.17, ~14.7-year backtest from ~October 2011 (UVXY launch). Authored by Guybogles (Discord: aly9923). Tags: `rsi`, `leveraged-etfs`, `inverse-etfs`, `200d-ma`, `vix-tiers`, `mean-reversion`.

**Files changed:** `data/strategies.json`, `data/strategies.js`, `docs/PATCHNOTES.md`, `docs/PRD.md`

---

## [1.13.3] - 2026-07-09

### Fixed: RSI signal colors never actually rendered (CSS specificity bug)

The `.rsi-*` classes added in v1.13.2 were bare single-class selectors (`.rsi-oversold { color: ... }`), which lost the cascade to `.db-table td`'s own `color` rule — a class+type selector (specificity 0,1,1) beats a single class (0,1,0) regardless of source order. Every row on `rsi.html` rendered in the default table text color; the entire signal color-coding feature silently never worked. Caught by building a temporary all-five-tiers test page to visually confirm each color. Fixed by rescoping every rule to `.db-table td.rsi-x`. Also brightened the two inner tiers (`#890000`→`#e04545`, `#008900`→`#2fb92f`) for legibility against the dark table background; both extremes (`#ff0000`/`#00ff00`) unchanged.

**Files changed:** `css/main.css`, `docs/PRD.md`, `docs/DESIGN.md`

---

## [1.13.2] - 2026-07-09

### Custom RSI signal color palette (user-specified, not the standard tokens)

Per explicit user direction, replaced the RSI signal tier colors with a literal green (oversold)→red (overbought) gradient instead of reusing `--color-green`/`--color-yellow`/`--color-pink`: `.rsi-extreme-overbought` `#00ff00` bold, `.rsi-overbought` `#008900`, `.rsi-neutral` `#b0b0b0`, `.rsi-oversold` `#890000`, `.rsi-extreme-oversold` `#ff0000` bold. No opacity tricks; both extreme tiers bold, inner three are not. Documented as a deliberate token exception in `docs/DESIGN.md` (bumped to v1.6) since it inverts the site's usual green-good/pink-bad convention specifically for this page.

**Files changed:** `css/main.css`, `docs/PRD.md`, `docs/DESIGN.md`, `docs/PATCHNOTES.md`

---

## [1.13.1] - 2026-07-09

### Retuned RSI signal thresholds

The 70/30 thresholds shipped in v1.13.0 rendered every one of the 20 tickers as "Neutral" on launch day (all landed between 34.7 and 65.2 RSI), making the page look inert on a typical day. Retuned to: ≥79 Extreme Overbought, 70–78 Overbought, 42–69 Neutral, 29–41 Oversold, ≤28 Extreme Oversold. No new color tokens, still reuses `--color-green`/`--color-yellow`/`--color-pink`.

**Files changed:** `rsi.html`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.13.0] - 2026-07-09

### Shipped V2.1: Live RSI Signals Page

New `rsi.html` page showing live 10-day RSI (Wilder's smoothing) for the 20-ticker Frontrunner signal universe. `scripts/refresh_rsi.py` fetches Yahoo Finance daily adjusted closes and writes `data/rsi.json`/`.js`; a new `.github/workflows/refresh-rsi.yml` runs it automatically 3x/day on weekdays (`0 15,19,22 * * 1-5`). Table is sortable by Ticker/RSI, defaults to descending RSI, and color-codes each row into five signal tiers (Extreme Oversold → Extreme Overbought) using the existing `--color-green`/`--color-yellow`/`--color-pink` tokens rather than introducing a new color. Added "RSI" to the top nav (desktop + mobile) after "Database". Built ahead of its numbered slot per explicit user request (2026-07-08/09), same pattern as V1.16.

**Files changed:** `rsi.html` (new), `scripts/refresh_rsi.py` (new), `data/rsi.json`/`.js` (new), `.github/workflows/refresh-rsi.yml` (new), `js/app.js`, `css/main.css`, `README.md`, `docs/PRD.md`

---

## [1.12.4] - 2026-07-09

### Renumbered roadmap now that V2.0 has shipped

Since V2.0 (Full Database Goes Public) is complete, renumbered the remaining V2.x backlog to read sequentially from the next version forward: the Live RSI Signals Page is now **V2.1** (still built next, ahead of V1.17), Scale + Discovery moves to **V2.2**, and Community Signals moves to **V2.3**. No scope or priority changes, only version labels and cross-references. Documentation only.

**Files changed:** `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.12.3] - 2026-07-08

### Prioritized V2.3 (Live RSI Signals Page) ahead of its numbered slot

Per user request, V2.3 (fully speced in a prior session, before this thread — locked ticker list, RSI formula/methodology, data source, page design, nav placement, refresh cadence) moves to the front of the build queue, ahead of V1.17 (Leaderboard scoring revision) and V2.1/V2.2. Same pattern as V1.16 being built ahead of its numbered slot. Cross-referenced the reprioritization on both V2.3's and V1.17's status lines. Documentation only — implementation not yet started.

**Files changed:** `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.12.2] - 2026-07-08

### Roadmap cleanup: closed stale V1.14/V1.15 checklist items

Found while reviewing "next steps" — a few checklist items were left unchecked from before V1.14/V1.15 were actually completed. Marked Part A (name-based noise) done, marked V1.15's status Complete (was still "In Progress"), closed out the Leaderboard/Screener/Filter Panel re-verification item (covered by all the live CDP testing done throughout V1.14), and closed the recovery-rate item with the final counts rather than a separately-tracked metric that was never actually built. Documentation only, no code changes.

**Files changed:** `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.12.1] - 2026-07-08

### Added "Azqato Invests" to the nav

New nav link, `https://azqato.com/invests`, positioned before "Support" in both desktop and mobile nav (both derive from the same `links` array in `js/app.js`, so one change covers both). Verified live via the CDP harness: correct position on desktop, correct position in the mobile drawer, and no regression of the mobile horizontal-overflow fix from the previous entry.

**Files changed:** `js/app.js`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.12.0] - 2026-07-08

### V2.0: Full Database goes live

`data/database.json`/`.js`, `data/database_summary.json`/`.js`, and `data/storage.csv` are committed and public for the first time — the code has been live on `database.html` since v1.11.2, but the data files were deliberately withheld until the full refresh and V1.14 noise-filtering pass completed. Final numbers at go-live: 6,640 total entries — 6,221 clean, 229 `duplicate`, 88 `excluded`, 88 `caution`, 14 `retry`.

**Pre-launch mobile audit found and fixed two real, pre-existing sitewide CSS bugs**, not specific to this page or introduced this session: (1) `.nav-cta` (the "Open Composer" nav button) had equal CSS specificity to `.btn`'s `display: inline-flex` and lost the cascade regardless of viewport — the button never actually hid on mobile, anywhere on the site. Fixed by reordering `.nav-cta`'s rule after `.btn`'s. (2) `.db-tabs` (page tabs, Screener's view switcher, the flag-mode toggle) had no `overflow-x`, so on narrow viewports its content forced the whole page to scroll horizontally instead of scrolling internally. Fixed with `overflow-x: auto`. Also fixed a `database.html`-specific version of the same underlying problem: `.page` (a `flex: 1` child of `body { display: flex }`) had no `min-width: 0`, letting its widest descendant (the data table) force the whole page wider than the viewport instead of `.db-table-wrap`'s own `overflow-x: auto` containing it. Verified via headless-Chrome screenshots at a 390px mobile viewport before and after each fix — first attempt at verification gave false readings due to a mistake in the CDP test harness (`mobile: true` in `Emulation.setDeviceMetricsOverride` was reporting an incorrect `window.innerWidth`), caught and corrected before trusting the results.

**Added `.github/workflows/refresh-full-database.yml`**: automates `scripts/refresh_full_database.py` weekly (Sunday 01:07 UTC), plus regenerates `database_summary.json`/`.js` so the live site's actual data source stays in sync. `STALE_AFTER_DAYS` (7) matches this weekly cadence exactly, so essentially the entire database is "due" every run (~4.5-5 hours at the proven-safe throttle) — unlike `update-metrics.yml`'s near-no-op daily runs over 25 strategies. Designed around a mid-run timeout: the refresh step has its own 340-minute cap with `continue-on-error: true`, and the summary-regen/commit steps run with `if: always()`, so a cut-short run still commits whatever was checkpointed rather than losing it. Confirmed with the user this is scoped to `refresh_full_database.py` only — `flag_name_noise.py`/`dedupe_symphonies.py` remain explicitly manual-only, not wired into this or any workflow.

**Updated `README.md`** and Section 6's Feature List (`docs/PRD.md`) to describe the Full Database section as live rather than "in progress, not fully public."

**Files changed:** `data/database.json` (new), `data/database.js` (new), `data/database_summary.json` (new), `data/database_summary.js` (new), `data/storage.csv` (new), `data/Full Database.xlsx` (new), `.github/workflows/refresh-full-database.yml` (new), `css/main.css`, `README.md`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.11.23] - 2026-07-08

### V1.14 complete: dedup pipeline finished its full run

`scripts/dedupe_symphonies.py` (launched in the previous entry) finished processing all 362 candidate clusters (842 candidate rows): **225 rows flagged `duplicate`** this run (229 total including the earlier validation test), **23 logic-tree fetches failed** (mostly `404`s, likely symphonies deleted/made private since being scraped — left ungrouped rather than force-refreshed, a known gap, not a crash). Regenerated `database_summary.json`/`.js` and `Full Database.xlsx` to match.

**Confirmed the sequencing worked as designed** on the real "Holy Grail simplified" cluster used throughout this whole thread as the running example: `flag_name_noise.py` (run first) had already flagged `TESTPORT #016:...` as `excluded`, so by the time dedup ran it was never a candidate — the `symphony_id` tiebreak picked a legitimately-named row among the remaining three instead. Updated the PRD's documented example to reflect this real outcome rather than the earlier prediction.

Final database-wide `flag` tally: 6,221 clean, 229 duplicate, 88 excluded, 88 caution, 14 retry (6,640 total entries). Marked V1.14 (both Part A and Part B) as **Implemented** in the roadmap.

**Files changed:** `data/database.json`, `data/database.js`, `data/database_summary.json`, `data/database_summary.js`, `data/Full Database.xlsx`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.11.22] - 2026-07-08

### V1.14 Part A implemented: name-noise flagging + logic-tree dedup pipeline, plus a manual-only rule

Built out the full V1.14 Part A pipeline designed over the previous several entries:

**`scripts/flag_name_noise.py`** (new): flags `TESTPORT #`/`[Work]`/`STILL BUILDING` rows with `flag = "excluded"` (reusing the existing level, no new UI surface needed), no API calls. Run: flagged 88 rows.

**`scripts/dedupe_symphonies.py`** (new): implements the full dedup policy from the last several entries — normalize-name clustering (candidate-finding only), logic-tree structural equality as the primary identity check (one `GET /symphonies/{id}/score` call per candidate row), metrics-tolerance fallback, `oos_date`→`symphony_id` tiebreak with no name-based priority, flags losers `flag = "duplicate"` without deleting anything. Tested against a real 5-member "Holy Grail" family before the full run (correctly kept the row matching the hand-computed tiebreak, correctly left two near-miss rows alone since their names didn't normalize into the same candidate cluster — an accepted soft-miss, not a bug). Full run launched against all 362 candidate clusters (842 rows); in progress as of this entry.

Also purged the remaining 41 `excluded` (404/422) rows via the existing `scripts/purge_flagged_entries.py`.

**Documented a manual-only rule**, per user request: neither script (nor any other full-database maintenance script) should ever be added to a GitHub Actions workflow or other CI/scheduled job. `dedupe_symphonies.py` makes hundreds of live API calls per run and can take 20-30+ minutes; running it unattended risks hammering Composer's API far more than a human would choose to. Added explicit warnings to both scripts' docstrings and a new Operational Runbook section ("Name-Based Noise & De-Duplication").

**Files changed:** `data/database.json`, `data/database.js`, `data/database_summary.json`, `data/database_summary.js`, `data/Full Database.xlsx`, `scripts/flag_name_noise.py` (new), `scripts/dedupe_symphonies.py` (new), `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.11.21] - 2026-07-08

### Replaced All Strategies' "Last Updated" column with "OOS"

Per user decision, no reason to show users how stale a row's `refresh_date` is. Swapped the column for `oos_date` (days since the strategy's logic was last edited), reusing the existing `formatOosDays()`/`isDuration` rendering path already built for the Screener's bucket filters — no new formatting logic needed. Verified via the CDP harness: header reads "OOS", cells render as e.g. "114d"/"163d" instead of a calendar date.

**Files changed:** `database.html`, `docs/PATCHNOTES.md`

---

## [1.11.20] - 2026-07-08

### Added a "Duplicates" flag-mode placeholder to All Strategies/Screener

Per user decision, added `"Duplicates"` as a 4th flag-mode toggle option on both All Strategies and Screener, positioned between "Broken" and "All" (full order: Working, Broken, Duplicates, All). Filters to `flag === 'duplicate'` specifically, distinct from "Broken" (`caution`/`excluded`). "Working" (the default view) now also excludes `duplicate`-flagged rows via a shared `isNoiseFlag()` check covering all three noise categories.

This is a placeholder: no row in the database currently has `flag: "duplicate"` — the V1.14 Part A dedup pipeline that would set it (logic-tree structural comparison, tiebreak, flagging) is fully designed (see the last several PATCHNOTES entries) but not yet built. "Duplicates" correctly shows 0 results until that pipeline runs. Verified via the same headless-Chrome CDP harness used for the original flag-mode work: toggle order/labels correct, "Duplicates" mode returns 0 as expected.

**Files changed:** `database.html`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.11.19] - 2026-07-08

### All Strategies page copy/layout tweaks: description text, toolbar layout, flag-mode relabel

Small batch of UI tweaks, not previously versioned:

- **Page description** shortened and split into two paragraphs: "A community-sourced database of thousands of Composer.trade symphonies, not just the 25 curated strategies." / "This section is a work in progress." (dropped "gathered from many locations").
- **All Strategies toolbar**: removed the "N with usable metrics" secondary text; the Filter button now sits in that spot instead (right side of the toolbar).
- **Flag-mode toggle relabeled and reordered**: "Default" → "Working"; order changed from Working/All/Broken to Working/Broken/All. Applies to both All Strategies and Screener automatically, since both share the same `flagToggleHtml()`/`FLAG_MODES` code.

**Files changed:** `database.html`

---

## [1.11.18] - 2026-07-08

### V1.14 Part A dedup: tiebreak confirmed as-is, candidate-finding elaborated, losers now flagged instead of deleted (documentation only, nothing implemented)

Three follow-ups resolved from the previous entry, all documentation:

**Tiebreak confirmed with no name-based priority.** Per user decision, `symphony_id` sort is used exactly as specified even when it produces a counterintuitive keeper — no special-casing for `TESTPORT #`/WIP-marker names. Demonstrated with two more real clusters: the 4-way "Holy Grail simplified" cluster (already-known example, full walkthrough of the ID sort); and a 6-row "TQQQ For The Long Term V2 (226.7% RR/46.1% Max DD)" cluster that splits into two identical sub-groups (one where `oos_date` differs and the primary rule decides directly, one where it ties and falls to the ID sort) plus one genuine remix correctly excluded from both.

**Candidate-finding elaborated:** name-normalization alone, no corroborating signal (e.g. holdings matching) needed — reasoned through why the two possible failure modes of the name filter are asymmetric (false positives are harmless since the structural check catches them; false negatives are just a soft "didn't dedupe as aggressively as possible," never a wrong deletion). Flagged that the normalization regex needs `(Buy Copy)` added, currently missing alongside `(Invest Copy)`.

**Disposition changed:** duplicates are now flagged, not deleted — a real policy reversal from the v1.11.16 "delete outright" plan, specific to dedup (the already-executed 404/422 `excluded` purge from v1.11.14 is unaffected). New `flag` value `"duplicate"` proposed for all cluster losers. UI: proposed an independent toggle from the existing Default/All/Broken control, not folded into "Broken," per user request that it be filterable — not yet confirmed/built.

**Files changed:** `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.11.17] - 2026-07-08

### V1.14 Part A dedup: logic-tree structural comparison adopted as the primary identity check (documentation only, nothing implemented)

Follow-up to v1.11.16's metrics-tolerance dedup policy. Investigated whether symphony structure could be compared directly instead of inferring duplication from backtest metrics — it can, via `GET /api/v0.1/symphonies/{id}/score?score_version=v1` (already documented in Section 13, Logic Tree Endpoint), a single lightweight GET per symphony that returns the full IF/ELSE logic tree, no backtest execution required.

**Tested live against the real 4-row "Holy Grail simplified" cluster** from the previous entry: raw responses differ in size/hash (Composer assigns a unique UUID to every node, even on literal clones), but after stripping every `id` field (root and nested) and the root `name` field, all four rows hash **byte-for-byte identical** — confirming they're genuinely the same underlying strategy logic, not just similar-performing.

**Revised the policy** to make this the primary identity check, with the earlier metrics-tolerance approach (3 percentage points absolute / 3% relative, same-`refresh_date`-only) demoted to a fallback for when the logic-tree endpoint is unavailable. The structural check needs no tolerance threshold (exact match, not "close enough") and no same-day-refresh alignment, since logic tree structure doesn't drift day to day the way backtest metrics do.

**Still open, not yet decided:** whether name-normalization alone is a strong enough signal for finding dedup *candidates* in the first place (before spending an API call on the structural check); the TESTPORT/WIP-marker-vs-tiebreak-priority question from the previous entry, still unresolved; and the disposition of the standalone name-pattern noise rules (TESTPORT #, WIP markers) independent of dedup.

**Files changed:** `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.11.16] - 2026-07-08

### V1.14 Part A: de-duplication policy decided (documentation only, nothing implemented)

Planning session for the near-identical-name-cluster de-duplication policy — no code, no data changes, per user request to document the discussion before implementing.

**Decided:** cluster rows by normalized name (strip `TESTPORT #N:`/`Copy of`/`(Invest Copy)` patterns); within a cluster, only compare metrics between rows refreshed on the *same day* (force a refresh first if not), on a fixed field subset (`annualized_rate_of_return`, `max_drawdown`, `trailing_one_year_return`, `cumulative_return`, `sharpe_ratio`, `calmar_ratio`, `backtest_days`); rows differing on any of those are genuine remixes and all stay; identical rows keep the longest `oos_date`, tiebreaking on lexicographically-earliest `symphony_id`; losers get deleted outright (URL preserved in `storage.csv` first, reusing the `purge_flagged_entries.py` safety-invariant pattern), not just flagged.

**Found and presented a real example** from the live data: a 4-way "Holy Grail simplified" cluster, all refreshed the same day, all target metrics *and* `oos_date` identical — a full tie that falls through to the `symphony_id` tiebreak, which lands on the `TESTPORT #016:`-prefixed row. Surfaced a real conflict this exposes: `TESTPORT #` is supposed to be its own separate noise pattern (excluded outright), so it probably shouldn't be eligible to "win" a dedup tiebreak — likely resolution is pattern-based exclusion running before/taking priority over the dedup tiebreak, but this isn't finalized yet.

**Still open, not yet decided:** whether name-normalization alone is a reliable-enough clustering signal or needs corroboration (e.g. matching `last_market_days_holdings`); the TESTPORT-vs-tiebreak priority question above; and the disposition (delete vs. flag) of the other Part A noise patterns (`TESTPORT #`, WIP markers) independent of dedup.

**Files changed:** `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.11.15] - 2026-07-08

### V1.14 Part B UI: flag-based exclusion on All Strategies/Screener/Leaderboard; Screener redesigned as a Finviz-style bucketed filter grid

**Flag-based exclusion**, per user decisions: All Strategies and Screener each get an independent 3-state toggle — **Default** (excludes `caution`/`excluded` rows), **All** (shows everything), **Broken** (shows only flagged rows). Leaderboard is *not* toggleable — it always excludes flagged rows from its scoring pool and recomputes percentile ranks/tiers accordingly, since unlike the other two tabs this can't be a simple post-hoc render filter. `retry` (transient 429/500/503/timeout) is deliberately never treated as noise — those rows behave normally and clear on their own via the next refresh.

**Screener redesigned**: replaced the hidden, click-to-open Filter Panel (previously shared with All Strategies) with an always-visible, Finviz-style grid of one label+dropdown per field (20 fields, plus a free-text name search), per a reference screenshot the user provided. All Strategies is unchanged and keeps its existing specific-value Filter Panel — the two tabs now intentionally have different filter UIs, not a shared component. Bucket thresholds (25th/50th/75th/90th percentile per field) are computed live from the loaded dataset rather than hardcoded, so they don't go stale as the database changes. `backtest_days`/`oos_date` use natural-language duration labels ("Over 3.5 years") instead of raw day counts, per user request. The "Broken" toggle label itself was also a direct rename from an initial "Flagged Only" per user request.

**Testing:** no `chromium-cli` or Playwright available in this environment, so verification was done by driving headless Chrome directly over its DevTools Protocol remote-debugging websocket (custom Python harness, not saved as a project asset). Confirmed: All Strategies mode counts correct across all three states; Leaderboard has zero flag-toggle UI; Screener bucket selects render with live percentile-derived options and correctly filter results (e.g. "ARR: Over 50%" cut 6,549 → 3,268); zero console errors throughout. One false alarm caught and resolved: the bucket grid initially screenshotted as a single stacked column — root cause was stale browser cache serving pre-edit CSS, not a real layout bug, confirmed once cache was disabled for the test session.

Also folded in the results of the 845-row background refresh (entries with a null `oos_date`) that completed during this work: 790 OK, 55 failed (transient), current flag distribution 6,538 clean / 88 caution / 41 excluded / 14 retry. Re-synced `database_summary.json`/`.js` and `Full Database.xlsx`.

**Files changed:** `database.html`, `css/main.css`, `data/database_summary.json`, `data/database_summary.js`, `data/Full Database.xlsx`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.11.14] - 2026-07-08

### Purged all 404/422 `excluded` entries from the database; added a reusable purge script

Per user decision, removed all 1,004 entries flagged `excluded` (permanent 404/422 failures) from `data/database.json` outright, rather than just filtering them from views. Before deletion, confirmed all 1,004 `symphony_url`s were already present in `data/storage.csv` (the durable URL backup) — nothing is lost; any of them can be re-promoted back into `database.json` unrefreshed later via `scripts/sync_storage_to_database.py` if a symphony ever becomes valid again. Database now has 6,681 entries (down from 7,685).

**Built `scripts/purge_flagged_entries.py`**, a reusable tool for this and future cleanses rather than a one-off: takes one or more `flag` levels as CLI arguments (`excluded`, `caution`, `retry`), aborts with no changes if any purge candidate's URL is missing from `storage.csv` (the safety invariant above, enforced automatically), and regenerates every downstream export in one run (`database.js`, `database_summary.json`/`.js`, `Full Database.xlsx`). Documented in `docs/PRD.md`'s Operational Runbook under "Purging Flagged Full-Database Entries". Tested with a safe no-op call (`retry caution`, 0 matches since those were already cleared — see v1.11.12 below) and an invalid-argument call, both behaved correctly.

**Files changed:** `data/database.json`, `data/database.js`, `data/database_summary.json`, `data/database_summary.js`, `data/Full Database.xlsx`, `scripts/purge_flagged_entries.py` (new), `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.11.13] - 2026-07-08

### Reordered trailing fields: `oos_date`, `refresh_date`, `flag`, `error`

Per user decision, reordered the last four keys on every `data/database.json` entry from `flag, refresh_date, oos_date, error` to `oos_date, refresh_date, flag, error`. Cosmetic only — no value changes. Regenerated `database.js`, `database_summary.json`/`.js`, and `Full Database.xlsx`.

**Files changed:** `data/database.json`, `data/database.js`, `data/database_summary.json`, `data/database_summary.js`, `data/Full Database.xlsx`

---

## [1.11.12] - 2026-07-08

### Reset all `caution`/`retry`-flagged entries to null, queuing them for re-refresh

Per user decision, all 197 entries flagged `caution` (88) or `retry` (109) had `flag`, `error`, and `refresh_date` reset to `null`. This puts them back in the "due" queue for the next `scripts/refresh_full_database.py` run — a fresh API attempt rather than trusting the existing flagged state. `excluded` entries (404/422) were left untouched at this step; see v1.11.14 above for their eventual removal. Regenerated `database.js`, `database_summary.json`/`.js`, and `Full Database.xlsx`.

**Files changed:** `data/database.json`, `data/database.js`, `data/database_summary.json`, `data/database_summary.js`, `data/Full Database.xlsx`

---

## [1.11.11] - 2026-07-08

### Split `flag` back into `flag` (category) + `error` (message), per user decision on reflection

After thinking it over, the combined `flag = {"level": ..., "reason": ...}` object from v1.11.8/v1.11.9 wasn't the right shape. Split into two sibling fields: `flag` is now just the plain category string (`"excluded"`, `"caution"`, `"retry"`, or `null`), and `error` holds the original message on its own — a string for script errors, or Composer's `data_warnings` object for `"caution"` rows.

**`scripts/refresh_full_database.py`**: `classify_error()` now returns a plain string instead of a dict; the success path (`apply_backtest_result()`) and both failure branches in `main()` set `entry["flag"]`/`entry["error"]` as two separate assignments instead of one combined object.

**Migrated all 7,685 existing entries**, splitting the `{level, reason}` object into the two fields. Counts unchanged from before the split: 1,004 excluded, 88 caution, 109 retry, 6,484 clean.

**Fixed the other live consumer**: `database.html`'s ⚠ badge, which read `e.flag.level === 'caution'`, updated to `e.flag === 'caution'`.

**Updated `scripts/export_full_database_to_xlsx.py`**: `flag` is no longer in the nested-object JSON-serialization list (it's a plain string now); `error` is conditionally serialized only when it's actually a dict (the `data_warnings` case), left as a plain string otherwise, since it's a mixed-type field.

**Tested live** against a mixed batch — 15 clean rows plus 5 already-known `excluded` rows in the same run, deliberately exercising both the success and failure write paths together. Verified correct `flag`/`error` shapes across all four cases (clean, a live `422`, a live `404`, and an existing `caution` row), and confirmed zero entries anywhere in the dataset still use the old combined-object shape.

**Files changed:** `data/database.json`, `data/database.js`, `data/database_summary.json`, `data/database_summary.js`, `data/Full Database.xlsx`, `scripts/refresh_full_database.py`, `scripts/export_full_database_to_xlsx.py`, `database.html`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.11.10] - 2026-07-08

### Renamed `last_updated`→`refresh_date` and `last_semantic_update_at`→`oos_date`; `oos_date` truncated to `YYYY-MM-DD`

Renamed two fields across the full-database schema (`data/database.json`) for clarity: `last_updated` → `refresh_date` (when this entry's metrics were last successfully refreshed) and `last_semantic_update_at` → `oos_date` (when the symphony's underlying logic was last edited — the out-of-sample reference date). Scoped strictly to `database.json`'s own schema; `strategies.json` and `glossary.json` each have their own independent `last_updated` field, untouched.

`oos_date` is also now truncated to plain `YYYY-MM-DD` at write time, both retroactively (5,795 existing non-null values) and going forward in `scripts/refresh_full_database.py`. Previously it stored the Composer API's full timestamp verbatim, including time-of-day and a named timezone (e.g. `2026-03-16T08:11:33.345904-04:00[America/New_York]`) — far more precision than the field is ever used for (the "days since last edit" computation in `database.html`'s `oosDaysValue()` only ever needed the date).

Updated every touchpoint in the full-database pipeline: `scripts/refresh_full_database.py` (write path + staleness check), `scripts/export_full_database_to_xlsx.py`, `scripts/import_full_database.py` (legacy bootstrap script, already out of sync with the current xlsx column layout for unrelated reasons — noted in its docstring, not fixed this session), and `database.html` (2 references: the All Strategies "Last Updated" column, and `oosDaysValue()`'s live-computation input).

**Caught and fixed a live regression from the previous flag-consolidation pass**: All Strategies' ⚠ warning badge was still reading `e.data_warnings` directly, which no longer exists after that field was removed in v1.11.9 — the badge would have silently gone dark. Fixed to read `e.flag && e.flag.level === 'caution'`.

**Testing:** ran a real `--force 20` live-API batch after the rename and spot-checked results — confirmed correctly-named fields and a properly truncated `oos_date` sourced from an actual API response, not just the retroactive backfill. Also (unintentionally) confirmed a pre-existing, unrelated behavior while testing the staleness check: permanently-`excluded` rows (404/422) never get `refresh_date` advanced on failure, so they always look "due" and would be retried by a plain no-argument run — not new behavior, not fixed this session, just newly visible. Caught the resulting 1,109-row live run early (checkpoint-safe, no data loss) and stopped it since it wasn't the intended test.

**Files changed:** `data/database.json`, `data/database.js`, `data/database_summary.json`, `data/database_summary.js`, `data/Full Database.xlsx`, `scripts/refresh_full_database.py`, `scripts/export_full_database_to_xlsx.py`, `scripts/import_full_database.py`, `database.html`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.11.9] - 2026-07-08

### Consolidated `flag` as the sole error/warning field, removed `script_errors`/`data_warnings`

Following up on v1.11.8's derived `flag` field: `script_errors` and `data_warnings` are now gone entirely, replaced by `flag` as the single write target.

**Rewrote `scripts/refresh_full_database.py`** to compute and write `entry["flag"]` directly on every API call — a new `classify_error()` helper buckets failures into `"excluded"` (404/422, permanent) or `"retry"` (429/500/503/timeout, transient; unrecognized shapes default to `"retry"` with a printed warning), and success handling inline-classifies the API's `data_warnings` response into `{"level": "caution", "reason": ...}`. No more separate `script_errors`/`data_warnings` writes.

**Stripped `script_errors` and `data_warnings`** from all 7,685 existing entries in `data/database.json`/`.js` — their content is fully preserved in `flag.reason`, nothing was lost. **Deleted `scripts/add_flag_field.py`**, the one-time migration script from v1.11.8; its job (backfilling `flag` from those two fields) no longer applies once the fields don't exist and the refresh script writes `flag` natively.

**Updated the export scripts**: `scripts/export_full_database_to_xlsx.py`'s nested-field serialization list dropped `data_warnings` (kept `flag`); regenerated `Full Database.xlsx` (36 columns, down from 38) and `data/database_summary.json`/`.js` (28 fields, down from 30).

**Extensively tested with two independent 50-record live batches** against the real Composer API: 50 from the front of the array (`--force` limit) and 50 from the back (a manual bottom-slice test harness, since the front-only `LIMIT` argument doesn't support slicing from the tail). The second batch hit a real transient `429 Too Many Requests` mid-run, which was correctly classified `{"level": "retry", ...}` — a live test of the failure path, not just the success path. Post-test audit confirmed zero entries retain `script_errors`/`data_warnings`, and `flag.level` counts are internally consistent: 6,484 clean + 88 caution + 109 retry + 1,004 excluded = 7,685.

Scrapped a second proposed change this session (replacing `last_semantic_update_at` with a stored `oos_days` day-count) per user decision — it would have traded the Filter Panel/Leaderboard's current live, always-accurate OOS-days computation for a value that goes stale between refreshes; not pursued.

**Files changed:** `scripts/refresh_full_database.py`, `scripts/export_full_database_to_xlsx.py`, `data/database.json`, `data/database.js`, `data/database_summary.json`, `data/database_summary.js`, `data/Full Database.xlsx`, `docs/PRD.md`, `docs/PATCHNOTES.md`. **Deleted:** `scripts/add_flag_field.py`.

---

## [1.11.8] - 2026-07-08

### Implemented: unified `flag` field on the full database, derived from `script_errors`/`data_warnings`

Full database refresh (`scripts/refresh_full_database.py`) finished all 7,685 rows. Re-ran the `script_errors`/`data_warnings` audit against the complete dataset per the gate documented in V1.14 Part B: final counts are 1,113 `script_errors` (14.48%, up sharply from the 1.3% partial-sample figure — concentrated almost entirely in the second half of the run, largely `422`) and 88 `data_warnings` (1.15%).

**Added `scripts/add_flag_field.py`**, a one-time migration that derives a single `flag` field per entry from the existing `script_errors`/`data_warnings` values: `{"level": "excluded" | "caution" | "retry", "reason": ...}` or `null`. Classification checks `data_warnings` first (caution) since a warning only ever occurs on a successful backtest; otherwise `script_errors` is bucketed `excluded` (404/422, permanent) or `retry` (429/500/503/timeout, transient). Final tally across all 7,685 entries: 1,004 excluded, 88 caution, 109 retry, 6,484 clean. Backfilled onto `data/database.json`/`data/database.js`; `script_errors`/`data_warnings` are left untouched as the underlying audit trail.

**Updated and re-ran the downstream exports** to keep everything in sync: `scripts/export_full_database_to_xlsx.py` (added `flag` to the nested-object JSON-string serialization list, regenerated `data/Full Database.xlsx`) and `scripts/export_summary.py` (regenerated `data/database_summary.json`/`.js`; `flag` passes through automatically since it isn't in `DROPPED_FIELDS`).

**Documented the new field** in the Full Database JSON Schema (`docs/PRD.md` Section 12) and updated V1.14 Part B's checklist to reflect the field now existing in the data — the UI work to actually read `flag.level` (⚠ badges in All Strategies, default exclusion in Leaderboard/Screener) is still not built. Also flagged an open item: the newly-excluded `422`/`404` rows haven't been spot-checked by hand yet, given how much higher the final error rate came in versus the partial-sample estimate.

**Files changed:** `data/database.json`, `data/database.js`, `data/database_summary.json`, `data/database_summary.js`, `data/Full Database.xlsx`, `scripts/add_flag_field.py` (new), `scripts/export_full_database_to_xlsx.py`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.11.7] - 2026-07-08

### Documented: `local-maestro` added to the V4.0 roadmap entry

Reviewed `local-maestro` (`Gabraham4/local-maestro`), an offline, local recreation of MyMaestro.co for multi-strategy portfolio correlation and risk analysis (Returns/Correlations/Volatility/Exposure/Metrics tabs, CARP metric, Plotly.js reports), validated by its author at ~97–99.9% accuracy against the real MyMaestro.co. Folded it into the existing V4.0 roadmap section in `docs/PRD.md` as the fifth candidate fork, alongside the three signal-discovery Python tools and `quantstats-js`. Unlike those four (which analyze a single strategy), `local-maestro` answers a different question — how a set of strategies correlate/diversify each other as a portfolio — and shares `quantstats-js`'s core gap: it needs daily equity-curve series per strategy, which Atlas's `database.json` schema doesn't currently store. Its own `data_loader.py` already solves that data-loading problem for Composer backtest-cache JSON, so it's worth cross-referencing if that schema gap is ever addressed. No code was touched or repos cloned/executed this session — documentation only.

**Files changed:** `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.11.6] - 2026-07-08

### Documented: `quantstats-js` added to the V4.0 roadmap entry, plus an explicit adaptation-required note for all four tools

Reviewed `quantstats-js` (`whsmacon/quantstats-js`), a zero-dependency JS/Node port of the Python `quantstats` portfolio-analytics library (40+ metrics, HTML tearsheet with 13+ SVG charts), and folded it into the existing V4.0 roadmap section in `docs/PRD.md` alongside the three previously-reviewed Python tools. Unlike those three, it's pure JavaScript and could in principle run client-side, which is more compatible with Atlas's static, no-backend architecture — but it's still authored against Node.js/npm conventions and a raw daily-returns data shape Atlas's `database.json` schema doesn't currently store, so it is not a drop-in either.

Added an explicit **adaptation-required** callout to the V4.0 section that applies to all four candidate tools: each was built as an independent standalone project, and integrating any of them means rebuilding the integration surface against Atlas's actual data layer and static front-end structure, not just installing/cloning them. No code was touched or repos cloned/executed this session — documentation only.

**Files changed:** `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.11.5] - 2026-07-08

### Documented: V4.0 roadmap entry for signal-discovery/robustness tooling (extreme future state, no implementation)

Reviewed three external repos (`composer_json_fuzz_tester`, `rsi_search`, `strategy_generation`, all `VoxMachina1`) as candidate forks while the full database refresh ran in the background. Added a new **V4.0: Signal Discovery & Robustness Tooling** section to `docs/PRD.md` (Section 14, after V3.0) documenting what each tool does, why it matters (turns Atlas from a strategy *catalog* into a robustness/discovery tool, and gives V2.2 Community Signals a technical engine), and the major architectural implications of ever integrating them — namely that all three are local Python CLI tools requiring their own Tiingo API key and real compute, which conflicts with Atlas's current fully-static, zero-server-cost architecture (Tenet 4). Explicitly marked as extreme future state per user direction: no forking, cloning, or implementation work was done this session, documentation only.

**Files changed:** `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.11.4] - 2026-07-08

### Planned: V1.14 Noise Filtering plan expanded with a data-quality (error/warning-based) filtering policy

**Resumed the paused full-scale refresh.** `scripts/refresh_full_database.py` restarted against the 3,978 rows still due (3,707 already refreshed out of 7,685 total). Confirmed no new failure pattern emerged versus the pre-pause run, same 404/422/429/500/503/timeout mix.

**Audited every `script_errors` and `data_warnings` value in the database** (partial refresh snapshot, 3,707/7,685 rows processed at audit time): 98 entries (1.3%) carry a `script_errors` value, 40 (0.5%) carry a `data_warnings` value. Breakdown: 42 `404 Not Found` + 45 `422 Unprocessable Entity` (87 total, 1.1% of the database) are permanent, dead symphonies or ones that can't be backtested; 12 are transient (`429`/`500`/`503`/timeout) and will clear on their own via the normal refresh retry cycle. All 40 `data_warnings` share one shape, `"Close price data is not available for TICKER after DATE"`, a mid-backtest delisting on a holding, not a fetch failure.

**Decided and documented the V1.14 data-quality filtering policy** in `docs/PRD.md` (Section 14, V1.14 Part B): entries with a permanent 404/422 error get excluded from default Leaderboard/Screener views (flagged, not deleted); entries with a `data_warnings` value get excluded from default Leaderboard/Screener views too but stay visible in All Strategies with a ⚠ indicator, since the backtest itself succeeded, the metrics are just potentially skewed; entries with a transient 429/500/503/timeout error are left unflagged, since the ongoing refresh's staleness check will retry and clear them. Implementation is explicitly gated on V1.15 (Full-Scale Refresh) finishing first, since the error mix above is from a partial sample and may shift once every row has had a real API attempt.

**Files changed:** `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.11.3] - 2026-07-07

### Changed: Pushed the full-database code to GitHub (data withheld); fixed a data-loss race condition

**Pushed to `main` (commit `88cf45e`), deliberately partial.** `database.html`, its CSS/JS, and the full-database scripts are now live on composeratlas.com via the "Database" nav link. `data/database.json`/`.js`, `data/database_summary.json`/`.js`, `data/storage.csv`, and `data/Full Database.xlsx` were intentionally left out (all still untracked in git), the live page will fail to fetch its data until those are pushed separately. This is accepted and expected, not a bug; `.github/workflows/deploy.yml` was not modified, since none of the withheld files were ever in its exclusion list to begin with.

**Race condition found and fixed while syncing `storage.csv`.** Ran `scripts/sync_storage_to_database.py` to add 1,197 URLs from `storage.csv` into `database.json` (6,488 → 7,685 entries) while a `refresh_full_database.py` background run was still active. The sync appeared to succeed, but the still-running refresh script had loaded the file into memory *before* the sync and periodically overwrites the whole file with that stale in-memory copy on every checkpoint, silently reverting the sync a few checkpoints later. Caught via a routine entry-count check coming back wrong (6,488 instead of the expected 7,685). Recovered cleanly: stopped the running refresh, re-ran the sync (now nothing to overwrite it), regenerated `database_summary.json`, and restarted the refresh against the correct 7,685-entry file. No data was permanently lost, refresh progress up to that point was real and intact.

**Operational rule added to both scripts' docstrings and `docs/PRD.md`:** never run another script that writes `database.json` while a refresh is running in the background, stop it first.

**Background refresh paused (user request, logging out):** stopped cleanly at 3,706/7,685 entries refreshed. Verified `database.json` is valid and intact before stopping. Safe to resume any time.

**Docs audit:** corrected several "not yet pushed to GitHub" / "stays local" statements across `docs/PRD.md` that were true when written but became stale the moment the code push above happened; updated strategy count (25 → 28) and added the Full Database section to `README.md`, which hadn't been touched all session.

**Files changed:** `docs/PRD.md`, `docs/PATCHNOTES.md`, `README.md`, `scripts/refresh_full_database.py`, `scripts/sync_storage_to_database.py`, `data/database.json`, `data/database.js`, `data/database_summary.json`, `data/database_summary.js`

---

## [1.11.2] - 2026-07-07

### Added: Leaderboard score breakdown modal + Methodology button

Each Leaderboard row's Score cell is now clickable (styled identically to every other value cell, no distinct "link" look, just a hover underline), opening a modal that breaks the score down by all 7 categories and all 20 metrics for that specific strategy, distinguishing "no data" (metric never entered the ranking) from "scored zero" (present, but bottom of the pack).

A "Methodology" button next to Filter opens a second modal explaining the model in plain language: percentile-rank scoring, the clamp curve, missing-data handling, and tier assignment, plus the full category/metric point-value breakdown.

Both modals share one component (`openModal()`/`closeModal()`, a single `#modal-overlay` in the page), closable via the × button, clicking outside the panel, or Escape. Widened from 640px to 880px after the first pass looked cramped for the metric list. Also narrowed the Leaderboard's Rank column (was taking up more width than its short content needed).

**Files changed:** `database.html`, `css/main.css`, `docs/PATCHNOTES.md`

---

## [1.11.1] - 2026-07-07

### Added: Synced 1,197 new URLs from storage.csv into database.json

`data/storage.csv` had grown to 7,685 URLs (from its 6,489 seed at creation, v1.10.1), 1,197 of them not yet present in `data/database.json`. New `scripts/sync_storage_to_database.py` (safe to re-run) adds any storage.csv URL missing from database.json as a new, unrefreshed entry (every field null except `symphony_url`/`symphony_id`), so the next `refresh_full_database.py` run picks them up like any other due row. `database.json` grows from 6,488 to 7,685 entries; `data/database_summary.json` (the Performance Fix's slim derivative, V1.16) regenerated to match, still ~80% smaller than the full file.

**Files changed:** `data/database.json`, `data/database.js`, `data/database_summary.json`, `data/database_summary.js`, `scripts/sync_storage_to_database.py` (new), `docs/PATCHNOTES.md`

---

## [1.11.0] - 2026-07-07

### Added: Performance Fix, Filter Panel, Screener, and Leaderboard all shipped together

Built out of roadmap order at the user's explicit request: Performance Fix (originally V1.16) done first, then V1.11 (Filter Panel), V1.12 (Screener), and V1.13 (Leaderboard) in one batch. All four still gated behind the "not yet pushed to GitHub" rule, none of this is live.

**Performance Fix.** Found the "<500KB" target this item was framed around is actually scoped to the homepage specifically (Section 10), not database.html, a mistake in earlier docs, corrected rather than carried forward. The real problem was still worth fixing: `database.json` had grown to ~11.5MB as the background refresh populated more rows. Dropping 8 unused fields alone only saved ~26%, most of the weight was JSON format overhead (repeating ~29 field names as keys across 6,488 objects), not any field's data. The actual fix: a **columnar** format (`{fields: [...], rows: [[...], ...]}`) plus **rounding floats to 4 decimal places**. Result: ~11.5MB → ~2.3MB uncompressed (79.9% reduction), ~540KB gzipped in production. New `scripts/export_summary.py` derives `data/database_summary.json`/`.js` from `database.json`; `database.html` now loads the summary file and reconstructs row objects client-side via `rowsFromColumnar()`.

**Filter Panel (V1.11).** Shared searchable field-picker + operator (`=`, `>`, `<`, `>=`, `<=`, `between`, `contains`) + value filter, stackable rows (AND logic), Cancel/Apply. 20 filterable fields including a `holding` type matching tickers against `last_market_days_holdings`. One `createFilterController()` factory, three independent instances (All Strategies, Screener, Leaderboard).

**Screener (V1.12).** Reuses the Filter Panel. Three switchable column views (Overview, Risk-Adjusted, Distribution) built in full now rather than deferred, per explicit decision. Order-by dropdown skipped in favor of the existing click-to-sort column headers.

**Leaderboard (V1.13).** The 20-metric, 1,000-point, 7-category scoring model (locked in v1.10.7) implemented for real: `computeScores()` (percentile rank + clamp curve per metric) and `computeTiers()` (rank-based S/A/B/C/F cuts with round-up ties, S+ for a perfect score). Eligibility gated on `sharpe_ratio` being present (the "has been refreshed" proxy used throughout this session). Ships without noise-exclusion, an accepted, documented gap, since Noise Filtering (V1.14) doesn't exist yet.

Also removed OOS Days from the All Strategies table display per a mid-session request (kept in the underlying data for filter/scoring use, just not shown as a column there).

**Files changed:** `database.html`, `css/main.css`, `scripts/export_summary.py` (new), `docs/PRD.md`, `docs/DESIGN.md`, `docs/PATCHNOTES.md`

---

## [1.10.7] - 2026-07-07

### Changed: Leaderboard scoring model finalized and validated against real data

Docs-only change, no code yet (implementation is still V1.13, not started). Final iteration on the scoring methodology after a full metric-by-metric review.

**Final model: 20 metrics, 1,000 points, 7 categories** (up from the earlier 10-metric/4-category version): Return (200: ARR, Median), Trailing Returns (100, split across 1yr/3mo/1mo/2wk), Risk-Adjusted (200: Sharpe/Calmar/Sortino/Win Rate at 50 each), Downside Risk (200: Max Drawdown, Standard Deviation, `min` removed as likely redundant with Max Drawdown for this leveraged-ETF-heavy dataset), Asymmetry/Shape (100, split across Skewness/Tail Ratio/Kurtosis), Concentration/Fragility (100, split across the three Top-Day-Contribution metrics, lower=better), Longevity (100: Backtest Days 75 / OOS Days 25).

**Explicitly excluded, each with a documented reason:** Cumulative Return, Mean, Max, Herfindahl Index, Total Costs, Annualized Turnover, Min.

**Validated live:** implemented the full model in a throwaway script and ran it against the 2,282 database entries refreshed so far. Confirmed the math works correctly end to end, and the top-25 output surfaced real, expected noise: roughly half the top 25 were the same underlying strategies double/triple-counted via TESTPORT ports and clone/copy duplicates. This is exactly the problem Noise Filtering (V1.14) exists to solve. Decision: accept this as a known, temporary gap rather than reordering V1.13/V1.14, Leaderboard ships first without noise-exclusion and picks it up once V1.14 lands.

**Files changed:** `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.10.6] - 2026-07-07

### Added: "Metrics" tab on database.html

New tab next to Screener explaining every metric available in `database.json` (29 total, across Return, Risk, Risk-Adjusted, Consistency/Concentration, Trading Behavior/Cost, and Longevity categories) in independent, plain-English descriptions, no explanation references another metric by name, so each one stands alone. Static `.prose`-styled content, same component used for glossary detail pages, no data loading required.

**Files changed:** `database.html`, `docs/PATCHNOTES.md`

---

## [1.10.5] - 2026-07-07

### Changed: Leaderboard scoring model finalized (all decisions locked)

Docs-only change, no code. Every open question from v1.10.4 is now answered.

**Locked model:** 10 metrics, 100 points each, 1,000 total, across 4 equal-standing categories: Return (ARR, trailing 1yr), Risk-Adjusted (Sharpe, Calmar, Sortino, Win Rate), Risk-Safety (Max Drawdown, Std Deviation), Longevity (backtest_days, OOS days). Percentile-rank + clamp curve per metric (`100 × (percentile - 0.22) / (1 - 2×0.22)`), clamp constant kept at 0.22 for launch with re-evaluation explicitly deferred to post-rollout as its own checklist item. Missing data is a hard zero against a fixed 1,000 denominator. Noise-flagged entries excluded from the ranking pool entirely. Tier split kept at S/A/B/C/F 10/10/20/25/25% with an S+ carve-out for a perfect score.

**Sequencing conflict flagged, not resolved:** Leaderboard (V1.13) excludes noise-flagged entries by design, but Noise Filtering (V1.14) ships after it per the confirmed roadmap order, so the `is_noise` flag won't exist yet when Leaderboard first launches. Documented in `docs/PRD.md` as an open decision rather than silently working around it.

**Files changed:** `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.10.4] - 2026-07-07

### Added: Leaderboard scoring methodology documented (V1.13)

Docs-only change, no code. Fetched and read the sibling Individual Stocks site's screener source (`github.com/Azqato/stocks`: `screener.js`, `screener.html`, `docs/PRD.md`, `docs/PATCHNOTES.md`) to understand its relative-percentile scoring model, per the user's request to base the Leaderboard's tier list on the same methodology.

**Methodology captured in full:** weighted pillars summing to 100, percentile-rank-based scoring (not raw value) with a clamp curve (`20 × (percentile - 0.22) / (1 - 2×0.22)`, bottom/top 22% flattened) that keeps a perfect 100 rare, missing data scored as a hard zero against a fixed denominator, and rank-based tiers (S/A/B/C/F at 10/10/20/25/25%, plus a special S+ for perfect scores) with ties rounding up into the better tier.

**Proposed (not decided) pillar translation** for our schema: Return (ARR, trailing 1yr) ~ stock Growth pillar; Risk-Adjusted (Sharpe, Calmar, Sortino) ~ Valuation pillar; Risk/Safety (Max Drawdown, Std Deviation) ~ Balance Sheet pillar; Win Rate/backtest length/turnover/costs as context-only, weight-0 columns.

**Explicitly left open, flagged as real decisions needing confirmation, not assumptions:** exact pillar/metric/weight assignments, whether `backtest_days` should gate scoring eligibility outright (a 6-month vs. 15-year backtest aren't comparable the way two mature stocks are) rather than just being a context column, whether the 0.22 clamp constant transfers as-is given how different our ARR distribution shape is from stock fundamentals, whether Noise Filtering (V1.14) should exclude flagged entries from the percentile pool before scoring, and whether the 10/10/20/25/25 tier split fits a 6,000+ entry pool the same way it fits ~100-500 stocks.

**Files changed:** `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.10.3] - 2026-07-07

### Changed: Roadmap reordered (V1.11-V1.16)

Docs-only change, no code. Per explicit sequencing decisions: the shared filter panel (searchable field-picker + operator + value, from the community "Symphony Search Tool" reference) is now its own near-term roadmap item, built first, ahead of and reused by the Screener tab. Screener now comes before Leaderboard. Noise Filtering moves to after Screener Tab creation, rather than before Leaderboard as originally sequenced.

**New order:** V1.11 Filter Panel (Shared Component) → V1.12 Screener Tab → V1.13 Leaderboard Tab → V1.14 Noise Filtering → V1.15 Full-Scale Refresh → V1.16 Performance Fix → V2.0 Full Database Goes Public.

All cross-references updated (the "not yet pushed to GitHub" gate, the Performance Fix gate, the Section 6 in-progress checklist).

**Files changed:** `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.10.2] - 2026-07-07

### Changed: Nav restructured; Individual Stocks and Leveraged Strategies moved off primary nav

Top navigation reordered to **About, Strategies, Database, Glossary, Support** (was Strategies, Glossary, Database, About, Individual Stocks, Leveraged Strategies, Support). Footer nav reordered to match.

Removed the direct external nav links to Individual Stocks and Leveraged Strategies, originally added in v1.5.7. The sites aren't gone, they're presented instead on `about.html` in a new "More From Azqato" section: a short description of what each sibling site is, how it relates to Composer.trade and this library, and a CTA button linking out to it.

**Files changed:** `js/app.js`, `about.html`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.10.1] - 2026-07-07

### Changed: Renamed full_database.json to database.json; added storage.csv URL backup

**Rename.** `data/full_database.json` and `data/full_database.js` are now `data/database.json` and `data/database.js`. The `window.FULL_DATABASE_DATA` global is now `window.DATABASE_DATA`, matching the `STRATEGIES_DATA`/`GLOSSARY_DATA` naming convention already used elsewhere. Updated every reference: `database.html`, `scripts/import_full_database.py`, `scripts/refresh_full_database.py`, `scripts/export_full_database_to_xlsx.py`, `docs/PRD.md`, `docs/DESIGN.md`. Script filenames were intentionally left as-is, only the data files were renamed. Historical `docs/PATCHNOTES.md` entries describing past work under the old filename were left untouched as an accurate record of what happened at the time, rather than rewritten.

**Resumed the full-scale refresh.** Paused since v1.9.5 pending this rename; now running against the renamed `database.json`, 6,127 rows due.

**Added `data/storage.csv`.** A single-column (`url`), append-only, deduplicated backup of every Composer symphony URL ever shared, referenced, or added to the site, independent of whether it ever backtested successfully. Its purpose is durability: `database.json` can be rebuilt, re-scoped, or have entries dropped (e.g. by the upcoming Noise Filtering pass), but `storage.csv` is meant to never lose a URL once it's been seen. `symphony_url` (here just `url`) is the primary key, one row per unique symphony regardless of how many times it's been discussed. Seeded with 6,489 unique URLs from the union of `database.json` and `strategies.json`. Documented in `docs/PRD.md` Section 12.

**Also fixed:** Section 12's Metric Display Guidelines still documented percentages as rendering to 2 decimal places; corrected to 1, matching the `formatPct()` change made earlier in the session but never reflected in the docs at the time.

**Files changed:** `data/database.json` (renamed from `data/full_database.json`), `data/database.js` (renamed from `data/full_database.js`), `data/storage.csv` (new), `database.html`, `scripts/import_full_database.py`, `scripts/refresh_full_database.py`, `scripts/export_full_database_to_xlsx.py`, `docs/PRD.md`, `docs/DESIGN.md`, `docs/PATCHNOTES.md`

---

## [1.10.0] - 2026-07-07

### Added: 3 new strategies (28 total)

- **10d BND vs. 10d SPHB (Original)** (`bnd-vs-sphb`, symphony `0HCtnEKGw1PRt8Om77a3`): Contrarian semiconductor strategy using relative BND vs. SPHB RSI(10) as a regime signal. Buys SOXL when bonds outperform high-beta stocks (risk-off = contrarian long), holds SHV when high-beta leads (risk-on = cash). UVXY RSI tiers (74/84) and SOXX/SOXL RSI guards refine the bond-leading regime. ARR 100.6%, max DD 70%, ~14.7-year backtest from SPHB's May 2011 launch date. Tags: `rsi`, `leveraged-etfs`, `mean-reversion`, `vix-tiers`.
- **Dip Buying Tech** (`dip-buying-tech`, symphony `98cACZSS00eDg8Kv5BBV`): Three-branch educational baseline: SPY above 200d MA = hold SPY; SPY below 200d MA = hold XLP (consumer staples); XLP default except when QQQ RSI(10) < 30 = dip-buy XLK (1x tech ETF). Backtested from April 1999 through the dot-com crash. ARR 14.0%, max DD 26.3%, 27.2-year backtest. Tags: `rsi`, `200d-ma`, `mean-reversion`.
- **Ob Os Staple my Bonds (Original)** (`ob-os-staple-bonds`, symphony `OmMmeWyyAu0IRN2yOP6k`): Conservative two-signal strategy: QQQ RSI(10) <= 30 = buy unleveraged QQQ; otherwise hold whichever of XLP or VBF (Invesco Bond Fund) has the lower RSI(10). V0.0 original baseline of a multi-version series (V0.0/1999, V0.1/2007, V0.2/2010, V0.3/2011). ARR 17.4%, max DD 19.6%, 27.2-year backtest. Tags: `rsi`, `mean-reversion`.

**Files changed:** `data/strategies.json`, `data/strategies.js`, `docs/PATCHNOTES.md`, `docs/PRD.md`

---

## [1.9.5] - 2026-07-07

### Tested: Composer API rate limits (4 tests, token-bucket behavior identified)

Before committing hours of wall-clock time to the sequential (1-call-per-2-seconds) full-scale refresh, paused it at 140/6,488 clean rows to test whether a faster approach was viable.

**Four one-time tests against `/backtest`, at four different rates:**
- ~100 req/sec (100-worker thread pool, 10 batches): 25 succeeded, then `HTTP 429: Too Many Requests` on the remaining 975
- ~20 req/sec (20-worker thread pool): 25 succeeded, then 429s
- ~2 req/sec (2-worker thread pool): 25 succeeded, then 429s
- Sequential 1 req/sec (no concurrency at all): 25 succeeded, then 429s

Every test topped out at exactly 25 successful calls regardless of rate, from 1 req/sec all the way to 100 concurrent req/sec. Combined with the fact that the original 0.5 req/sec throttle (1 call per 2 seconds) sustained 140 consecutive calls with zero failures, this points to a token-bucket limiter: burst capacity of ~25 requests, refilling at roughly the already-proven-safe 0.5 req/sec rate. At 0.5 req/sec, consumption matches the refill rate so the bucket never empties; at any faster rate, the initial bucket drains and every call after the 25th gets throttled regardless of how much faster than "25 per window" the attempted rate was. Likely enforced by a Cloudflare layer in front of the documented 500 req/sec API limit, not the API's own application-layer limit. No data corruption resulted from any of the four tests: failed calls set `script_errors` but never touch `last_updated`, so every rate-limited row is still correctly queued as "due" for the next run. Early-bail safeguards (stop after 3 consecutive failures) were added to each test script and worked correctly, avoiding wasted retries once a test had clearly hit the wall.

**Conclusion:** the existing sequential 1-call-per-2-seconds throttle in `refresh_full_database.py` is the only rate confirmed safe for a sustained run; no further rate testing is planned. 240 rows now carry the full v1.9.1 schema (140 from the paused sequential run + 25 from each of the 4 tests). Documented in `docs/PRD.md` Section 13's Rate Limits table. Resuming the full sequential background refresh remains a normal next step.

**Files changed:** `data/full_database.json`, `data/full_database.js`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.9.4] - 2026-07-07

### Added: xlsx export tool; started full-scale refresh; fixed table width clipping

**xlsx export tool.** `data/Full Database.xlsx` stopped being written to back in v1.9.0 (`data/full_database.json` became the canonical source), so it's been silently going stale ever since. Added `scripts/export_full_database_to_xlsx.py`, a local-only, occasional-use script (the reverse direction of `import_full_database.py`) that regenerates the spreadsheet from the current JSON on demand. Nested fields (`last_market_days_holdings`, `active_asset_nodes`, `data_warnings`) are serialized to a JSON string per cell since spreadsheet cells can't hold nested structures. Not run automatically, not part of the deploy pipeline, meant to be triggered manually every so often (e.g. monthly) for offline review.

**Full-scale refresh started early.** Added a `--force` flag to `refresh_full_database.py` (the normal 7-day staleness check would otherwise skip the ~110 rows already touched in earlier passes, leaving them permanently missing the v1.9.1 field expansion). Launched `refresh_full_database.py --force` in the background against all 6,488 entries. This is V1.12's work on the roadmap; started now rather than waiting for its turn, since it's a multi-hour, throttled, I/O-bound job that can run unattended while Noise Filtering, Leaderboard, and Screener get built in the foreground. Verification and recovery-rate measurement against the roadmap's V1.12 checklist still happens once it completes.

### Fixed: All Strategies table clipped by the page's max-width

The table's rightmost columns (Win Rate, Backtest, Last Updated) were cut off, hidden behind the page's normal `1280px` container without an obvious way to see them beyond scrolling. Added a `.db-table-bleed` wrapper that lets the table break out to `92vw` (capped at `1600px`, centered) on viewports 1300px and wider, giving it natural side padding instead of either staying clipped or running edge-to-edge. Below 1300px the table stays in the normal container and scrolls horizontally as before.

**Files changed:** `scripts/export_full_database_to_xlsx.py` (new), `scripts/refresh_full_database.py`, `database.html`, `css/main.css`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.9.3] - 2026-07-07

### Changed: All Strategies table redesigned to match a reference community tool

Reformatted `database.html`'s All Strategies table against a reference screenshot of a community Composer symphony search tool: dense sortable columns, a toolbar header with a result-count pill, sticky first column, and icon-style first/prev/next/last pagination. All of it built with the site's existing dark palette, `Inter`/`JetBrains Mono` typography, and green/pink color-coding conventions, no new dependencies or visual language introduced.

**Public column set finalized** (via clarifying questions, since this table is user-facing): Symphony, ARR, 1-Year Trailing Return, Max Drawdown, Sharpe, Calmar, Sortino, Win Rate, Backtest Length, Last Updated, and a Data Warnings indicator. Deliberately excluded for now: Cumulative Return, Standard Deviation/Volatility, skewness/kurtosis/tail ratio, annualized turnover, and total costs, kept off the public table as more advanced metrics better suited to a future detail view or the Screener's advanced filters.

**Sorting:** click any sortable column header to sort the full dataset (not just the visible page) ascending/descending; entries with a null value for the sorted field always sort last regardless of direction.

**Symphony column:** widened to a fixed 420px with ellipsis truncation and a `title` tooltip for the full name, several community-authored names in this dataset run well past 100 characters and don't reasonably fit unwrapped.

**Security fix found in the process:** `name` values in this dataset come from many different community authors (unlike the curated 25 strategies, which are hand-entered), so they were being inserted into `innerHTML` and an HTML `title` attribute without escaping, an XSS risk if any entry ever contained something like `<script>` or a stray `"`. Added an `escapeHtml()` helper and applied it everywhere `name` renders, plus `encodeURI()` on `symphony_url`.

**Copy fix:** the page's intro paragraph previously claimed this was "every symphony pulled from Composer.trade." Corrected: it's a community-sourced database gathered from many locations, not a first-party Composer.trade export.

**Files changed:** `database.html`, `css/main.css`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.9.2] - 2026-07-07

### Fixed: database.html failed to load on file:// protocol

`database.html` shipped in v1.9.0 with `fetch()`-only data loading and no `window.*_DATA` global fallback, the pattern every other page on the site uses (documented since v1.0.3). Opening the page via `file://` (double-clicking the HTML file, the primary way this local-only feature has been reviewed so far) failed with "Failed to load database / Failed to fetch," since browsers block `fetch()` on `file://` due to CORS.

**Fix:**
- Added `data/full_database.js`, assigns `window.FULL_DATABASE_DATA`, same convention as `data/strategies.js` and `data/glossary.js`
- `scripts/import_full_database.py` and `scripts/refresh_full_database.py` now write the `.json` and `.js` twins in sync on every run, matching how `update_metrics.py` keeps the curated 25's twin files in sync
- `database.html`'s data loader (`loadFullDatabase()`) now checks `window.FULL_DATABASE_DATA` first and only falls back to `fetch()` when the global is absent
- Verified via local HTTP server smoke test and `.js` syntax validation

**Files changed:** `database.html`, `data/full_database.js` (new), `scripts/import_full_database.py`, `scripts/refresh_full_database.py`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.9.1] - 2026-07-07

### Added: Full Database target schema expansion (not yet public)

Locked and implemented the target schema for `data/full_database.json`, decided via 7 clarifying questions covering which API fields to capture, schema shape, null-handling, and refresh policy.

**Decisions:**
- Capture all newly-discovered `stats` fields from Section 13's earlier findings: `sortino_ratio`, `win_rate`, `skewness`, `kurtosis`, `tail_ratio`, concentration metrics (`top_one_day_contribution`, `top_five_percent_day_contribution`, `top_ten_percent_day_contribution`, `herfindahl_index`), `annualized_turnover`, and finer trailing windows (1-day/1-week/2-week)
- Capture both `last_market_days_holdings` and `active_asset_nodes` now, ahead of the Screener (V1.11), rather than deferring
- Capture costs as one summed `total_costs` field rather than the per-category breakdown or skipping entirely
- Capture `data_warnings`
- Schema shape: flat top-level fields, matching `strategies.json` convention (no nested sub-object)
- Null handling: every entry always has the same keys; unrefreshed or not-yet-meaningful fields are explicit `null`, never omitted
- Refresh policy: full overwrite of the metrics block on every successful API call, no partial backfill logic

**Correction found during live validation:** `active_asset_nodes` is not a ticker list as originally assumed in v1.9.0's API notes, it's a dict of internal node UUID → weight. Real ticker holdings live in `last_market_days_holdings` instead. Corrected in `docs/PRD.md` Section 13, and the Screener roadmap item (V1.11) updated to use the correct field.

**What was added:**
- `scripts/refresh_full_database.py`: rewritten to capture the full 17-field extended schema per successful API call, via a new `apply_backtest_result()` helper
- `scripts/import_full_database.py`: now initializes the 17 extended fields to `null` on a fresh xlsx import, so schema shape is consistent regardless of import path
- All 6,488 existing entries in `data/full_database.json` migrated in place to carry the new keys (`null` where not yet refreshed under the new schema); the 105 rows already refreshed in v1.9.0 were not disturbed
- Validated live against 5 real symphonies, 0 failures; confirmed the new fields populate correctly

**Files changed:** `scripts/refresh_full_database.py`, `scripts/import_full_database.py`, `data/full_database.json`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.9.0] - 2026-07-07

### Added: Full Database Foundation (not yet public)

Started work recreating, on composeratlas.com itself, the daily metrics-refresh pipeline that `data/Full Database.xlsx` was originally built for. That file holds 6,488 symphonies scraped by an external Google Apps Script that hit its daily `urlfetch` quota; only 953 rows ever got usable metrics, the remaining 5,535 carry the error `Exception: Service invoked too many times for one day: urlfetch.` and no data. This release lays the foundation to fix that using Composer's real API, and to eventually build a Leaderboard and Screener on top of the full database. **Nothing in this release is deployed or linked from the public site's deploy pipeline yet**; it stays local until the roadmap items in PRD.md Section 14 (V1.9-V1.12) are complete.

**Investigation findings:**
- Confirmed live against 5 real symphonies that Composer's actual API (`POST /api/v0.1/symphonies/{id}/backtest`) returns far more data per call than `strategies.json` currently captures: `sortino_ratio`, `win_rate`, `skewness`, `kurtosis`, `tail_ratio`, concentration metrics, live holdings (`last_market_days_holdings`), cost breakdown (`costs`), and finer trailing-return windows. Documented in `docs/PRD.md` Section 13.
- The full database contains significant non-strategy noise: test ports (`TESTPORT #NNN`), "Invest Copy" duplicates, "Copy of Copy of..." chains, and WIP builds mixed in with real strategies. Flagged as a roadmap item (noise filtering) before any full-database view goes public.

**What was added:**
- `data/full_database.json`: canonical JSON source for the full ~6,500-symphony database, imported from the raw xlsx (`max_drawdown` sign normalized to match `strategies.json` convention)
- `scripts/import_full_database.py`: one-time, re-runnable xlsx → JSON importer
- `scripts/refresh_full_database.py`: resumable, checkpointed (every 10 rows) API refresh script; on failure, pastes the API's actual error text into `script_errors` instead of guessing. Validated live against 105 rows (5 + 100 in a follow-up batch) with 0 failures.
- `database.html`: new tabbed page (All Strategies / Leaderboard / Screener). All Strategies renders a paginated table (50 rows/page) against the full dataset with select metrics (ARR, Max DD, Sharpe, Calmar, Backtest Days, Last Updated); Leaderboard and Screener render a "Coming Soon" empty state.
- `.db-tabs`, `.db-tab-panel`, `.db-table`, `.db-pagination` component patterns added to `css/main.css` and documented in `docs/DESIGN.md`
- "Database" nav link added to desktop nav, mobile nav, and footer (`js/app.js`)
- `docs/PRD.md` Section 14 Roadmap: added versioned plan V1.9 through V2.0 covering full-scale refresh, target schema expansion, noise filtering, Leaderboard, Screener, and the data-weight fix required before this can go public (`full_database.json` is ~4MB, over the site's 500KB page-weight target)

**Known limitation carried forward:** `refresh_full_database.py` currently only updates `last_updated` and `script_errors`, not the actual metric fields; full metric repopulation is scoped to V1.9.1.

**Files changed:** `data/full_database.json` (new), `data/Full Database.xlsx` (5 + 100 rows refreshed), `database.html` (new), `css/main.css`, `js/app.js`, `scripts/import_full_database.py` (new), `scripts/refresh_full_database.py` (new), `docs/PRD.md`, `docs/DESIGN.md`, `docs/PATCHNOTES.md`

---

## [1.8.0] - 2026-07-06

### Added: "Original Strategies" tag marking unmodified baseline logic

Four strategies (The Holy Grail, TQQQ For The Long Term, SOXL Growth, Simon's KMLM Switcher) are the original, unmodified versions of their trading logic, documented alongside a remixed edition elsewhere in the library that adds layers the original build never had, frontrunner-style RSI dip-buys, extra overbought or volatility guards, additional asset legs, and so on. These four now carry a new `original` tag so readers can find the baseline version and compare it against what a later remix added.

**Renamed for clarity (matching the existing "The Holy Grail (Original)" convention):**
- "TQQQ For The Long Term" → "TQQQ For The Long Term (Original)"
- "SOXL Growth v2.4.5 RL" → "SOXL Growth (Original)"
- "Simon's KMLM Switcher" → "Simon's KMLM Switcher (Original)"

**What was added:**
- `original` tag applied to `holy-grail`, `tqqq-long-term`, `soxl-growth-rl`, `simons-kmlm-switcher` in `data/strategies.json` / `data/strategies.js`
- New "Original Strategies" glossary entry (`data/glossary.json` / `data/glossary.js`, 20 concepts total) explaining what the tag means and why the baseline version is worth keeping alongside its remix
- `.tag-original` CSS class and `TAG_CLASSES` / tag-label entries in `js/app.js`
- `scripts/add_original_tag.py`: reproducible, re-runnable script that performed the renames, tag additions, and glossary entry in sync

### Changed: External nav links open in a new tab

"Individual Stocks" and "Leveraged Strategies" in the top nav now open in a new tab (`target="_blank" rel="noopener noreferrer"`), matching the existing behavior of the "Support" link, since all three point to external sites outside this repo.

### Fixed: Documentation drift after recent library growth

Full pass over README, PRD, DESIGN, and `about.html` to reconcile stale figures and pipeline descriptions against the current site state:
- Strategy count corrected from 24 to 25 in `README.md` and `about.html`
- Glossary concept count corrected from 19 to 20 across `docs/PRD.md`
- PRD Section 4 (Non-Goals) no longer claims there's no automated metric pipeline: `.github/workflows/update-metrics.yml` has run `scripts/update_metrics.py` daily since v1.6.x, corrected here
- PRD Section 11 runbook rewritten to describe the daily automated refresh (with 7-day staleness skip and self-healing retry) instead of a stale "run monthly" manual instruction
- DESIGN.md's tag color table now includes the previously-undocumented `zoop` tag and the new `original` tag
- `scripts/update_metrics.py` docstring no longer hardcodes a stale strategy count
- PRD Section 14 (Roadmap) V2.0 "Tag-based filtering on strategy index" item expanded to describe filtering by the tag taxonomy already generated for every strategy (signal, asset class, and collection tags)

**Files changed:** `data/strategies.json`, `data/strategies.js`, `data/glossary.json`, `data/glossary.js`, `js/app.js`, `css/main.css`, `about.html`, `README.md`, `docs/PRD.md`, `docs/DESIGN.md`, `scripts/add_original_tag.py`, `scripts/update_metrics.py`, `docs/PATCHNOTES.md`

---

## [1.7.2] - 2026-06-22

### Chore: Full em-dash audit and removal across all project files

Removed all 696 em-dash instances (Unicode U+2014) from every project file: HTML pages, documentation, JavaScript, CSS, and JSON data. No HTML entity `&mdash;` forms were found. Double-dash `--` sequences were audited and confirmed to be Markdown/CSS syntax only, not punctuation substitutes, so no changes were made there.

**Replacement rules applied by context:**

- `**Label**: description` for bold label introductions (was `**Label** [em-dash] description`)
- `` `code`: description `` for inline code labels (was `` `code` [em-dash] description ``)
- `### Heading: Subtitle` for heading separators (was `### Heading [em-dash] Subtitle`)
- `Title: Site Name` for page title separators (was `Title [em-dash] Site Name`)
- Comma for mid-sentence asides in prose
- Semicolon for adjacent independent clauses
- Parentheses for supplementary information

**Files changed:** `404.html`, `about.html`, `glossary.html`, `index.html`, `strategies.html`, `README.md`, `js/app.js`, `css/main.css`, `docs/DESIGN.md`, `docs/PATCHNOTES.md`, `docs/PRD.md`, `data/glossary.json`, `data/glossary.js`, `data/strategies.json`, `data/strategies.js`

**Writing Style documented:** PRD Section 19 "Writing Style" added. Covers the em-dash prohibition (both literal U+2014 and `&mdash;` entity), approved replacement patterns, a pattern table, the double-dash rule, and the audit process.

---

## [1.7.1] - 2026-06-22

### Changed: Homepage: "Longest Backtest" stat + sort by backtest length

Added a fifth stat to the homepage stats bar: **Longest Backtest**, which reads `~15 yrs` (the max `backtest_days` across all strategies, rounded to nearest year).

Also changed the homepage strategy grid sort order from the default JSON order to **longest backtest first**, so strategies with the most validated history surface at the top.

**Files changed:** `index.html`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.7.0] - 2026-06-22

### Added: AI Summary section on every strategy page

Every strategy detail page now opens with an **AI Summary**: a Claude-authored analysis displayed in a distinct purple-accented box directly above the "How It Works" section. For each strategy, Claude reviews the symphony's structure, assets, signals/logic, performance metrics, and backtest period, then explains in plain English **why** someone would follow it, the **purpose** behind its logic, and any **noteworthy characteristics**: short backtests, deep drawdowns, or period-dependent returns that warrant skepticism.

The summaries are deliberately even-handed in line with the Transparency Over Hype and Education Before Promotion tenets: strategies with spectacular-but-short backtests (e.g. s90 Half Low Catch at ~2 years / +735% ARR, Simon's KMLM Switcher at ~4 years / +654% ARR) and those with catastrophic drawdowns (Inside Nancy Pelosi's Chips −86%, SOXL Growth v2.4.5 RL −82%, Calmar ≤ 1.0) are explicitly flagged so readers discount the headline figures appropriately.

**What was added:**
- New `ai_summary` field (array of paragraph strings) on all 25 strategies in `data/strategies.json` and `data/strategies.js`, inserted immediately before `how_it_works`
- `AI Summary` render block in `strategies.html`, placed above How It Works; renders nothing when the field is absent
- `.ai-summary` component (box, header, ✦ mark, paragraphs) in `css/main.css`
- `scripts/add_ai_summary.py`: reproducible, re-runnable script that holds every summary keyed by slug and writes both data files in sync

**Process documented:** PRD Section 11 gains a "Generating the AI Summary" runbook; the streamlined URL-based add-strategy workflow now drafts `ai_summary` automatically; Section 12 schema documents the new field; DESIGN.md documents the `.ai-summary` component.

**Files changed:** `data/strategies.json`, `data/strategies.js`, `strategies.html`, `css/main.css`, `scripts/add_ai_summary.py`, `docs/PRD.md`, `docs/DESIGN.md`, `docs/PATCHNOTES.md`

---

## [1.6.0] - 2026-06-22

### Added: Simon's KMLM Switcher strategy (strategy #25)

Added Simon's KMLM Switcher (`simons-kmlm-switcher`) to the strategy library, bringing the total to 25 strategies. Symphony ID: `u5iBJE751BM5FKPRJvKf`.

**Strategy overview:** A three-layer RSI engine that first screens 11 market tickers for overbought conditions (routing to UVXY), then cascades through 4 leveraged ETF dip-buy checks at extreme oversold levels, and finally runs a core KMLM momentum switch, holding the two most oversold assets from {TECL, SOXL, SVIX} when tech leads, or rotating to the stronger of {SQQQ, TLT} when managed futures momentum dominates.

**Key metrics (backtest from ~April 2022, 1,049 trading days):** ARR +654.3%, Max DD −32.0%, Sharpe 3.01, Calmar 20.4. Highest ARR, Sharpe, and Calmar in the library.

**Tags:** `rsi`, `momentum`, `leveraged-etfs`, `managed-futures`, `inverse-etfs`, `vix-tiers`

**Files changed:** `data/strategies.json`, `data/strategies.js`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.5.9] - 2026-06-15

### Fixed: Site-wide accuracy audit (strategies, glossary, counts)

Full fact-check of every strategy, glossary concept, and HTML page. Corrected numbers and superlatives that had drifted out of sync after the library grew from the original 12 zoop symphonies to 24 strategies and after backtest-metric refreshes.

**Counts & dynamic stats:**
- `about.html`: "12 strategy symphonies" → "24"
- `index.html`: the homepage "Concepts" stat was hardcoded to `8`; it now reads `glossary.length` (19)
- Glossary "Zoop's Strategies", "11 strategies in this collection" → "12"; added the missing 12th row (SOXL Growth 2026) and rebuilt the whole stats table to current ARR/Sharpe/Max DD values
- `zoops-soxl-growth-2026` was missing the `zoop` tag: added, so it now appears under the Zoop's Strategies concept

**Stale metric citations corrected to match `strategies.json`:**
- Excellent Adventure 1-yr trailing +190.8% → +170.0%; Manhattan 3-mo −9% → −1.5% and Calmar 4.41 → 4.43; Leveraged TQQQ 1-yr +120.2% → +120.4%; Safety Checks Max DD ~43.7% → ~43.5%; Holy Grail 2026 cumulative 44,142x → 44,866x
- KMLM Switcher Calmar 9.75/10.31 → 9.52 and Sharpe 2.66 → 2.63 (glossary Calmar/Managed Futures sections too); backtest ≈5.3 yrs → ≈5.5 yrs
- s90 Half Low Catch backtest "~1.5 years" → "~2.2 years" (551 trading days ÷ 252); also in PATCHNOTES s90 entry
- Glossary Sharpe range "1.65 to 2.70" → "~1.10 to 3.04"; Calmar "In Practice" Frontrunner 4.62 → 4.23, Sometimes TQQQ 5.61 → 5.22; Max Drawdown range floor "−65% (SOXL Growth)" → "−86% (Inside Nancy Pelosi's Chips)"; ARR range updated

**Superlatives corrected (no longer true at 24 strategies):**
- zoop SOXL Growth "highest-risk/return strategy in the library" → "among the zoop symphonies"
- SOXL Growth RL "highest max drawdown" → "second-highest (behind Inside Nancy Pelosi's Chips)"
- s90 "most volatile in the library" → "second only to SOXL Growth v2.4.5 RL"; Wooden ARKK "second-highest std dev" → "among the highest"; SPY/Energy/Chips "lowest Sharpe/Calmar" → "among the lowest"; several "other 11 strategies" / library-only-uniqueness claims rescoped to the zoop set

**Files changed:** `index.html`, `about.html`, `data/strategies.json`, `data/strategies.js`, `data/glossary.json`, `data/glossary.js`, `scripts/add_glossary.py`, `scripts/add_zoop.py`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.5.8] - 2026-06-15

### Changed: Brand name displayed as "Composer Atlas" (with a space)

The site's display name is now rendered as **Composer Atlas** (two words) instead of the previous one-word **ComposerAtlas**. This applies everywhere the name appears as a brand/product label: page `<title>` tags, the nav logo text, the footer copyright, the hero eyebrow, the About page, and all body/glossary prose that references the library by name. Documentation (PRD, DESIGN, README, this changelog) was updated to match.

Literal technical identifiers were intentionally left unchanged because they are real strings, not display text:

- The GitHub repository (`Azqato/composer`) and its prior name (`Azqato/ComposerAtlas`)
- Historical GitHub Pages URLs and route-table paths (`/ComposerAtlas/...`)

No functional or routing behaviour changed, this is a presentation-only rename.

**Files changed:** `index.html`, `about.html`, `glossary.html`, `strategies.html`, `404.html`, `js/app.js`, `css/main.css`, `data/glossary.js`, `data/glossary.json`, `scripts/add_glossary.py`, `scripts/add_zoop.py`, `README.md`, `docs/PRD.md`, `docs/DESIGN.md`, `docs/PATCHNOTES.md`

---

## [1.5.8] - 2026-07-09

### Docs — V2.3 RSI Signals Page added to roadmap

Added a detailed implementation plan for the Live RSI Signals page as roadmap item V2.3 in `docs/PRD.md`. No code changes in this patch.

**Plan covers:** purpose and context (Frontrunner signal universe), full ticker list (20 tickers), RSI formula spec (Wilder's 10-period smoothing), two data-source options (Python refresh script vs. live client-side fetch) with tradeoffs and a recommended starting approach, `data/rsi.json` schema, `scripts/refresh_rsi.py` responsibilities, `rsi.html` page design (table layout, default sort, color-coding thresholds for 5 signal levels), CSS additions, nav placement decision, complete file change list, and four open questions to resolve before implementation begins.

**Files changed:** `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.5.7] - 2026-06-15

### Added: "Individual Stocks" and "Leveraged Strategies" nav links

Added two new top navigation links between "About" and "Support", pointing to sibling Azqato sites:

- **Individual Stocks**: links to `https://azqato.github.io/stocks/` (same tab)
- **Leveraged Strategies**: links to `https://azqato.github.io/leveraged-strategies/` (same tab)

Both links appear in the desktop nav, mobile nav drawer, and follow the existing nav link rendering pipeline. They open in the same tab (no `target="_blank"`) unlike the Support link.

**Files changed:** `js/app.js`, `docs/PATCHNOTES.md`, `docs/PRD.md`

---

## [1.5.6] - 2026-06-15

### Added: "Backtesting" glossary concept (19th entry)

Added a comprehensive glossary entry for `backtesting` covering the full lifecycle of how backtests work, both in general and specific to Composer.trade's engine.

**Sections included:**
- **Definition**: what backtesting is and its role as an evaluation tool vs. a prediction tool
- **How It Works**: simulation mechanics, cost accounting, importance of data range and market regime coverage
- **Common Backtesting Pitfalls**: survivorship bias, look-ahead bias, overfitting (data dredging), curve fitting
- **Backtesting vs. Forward Testing**: paper trading as the live-environment complement
- **How Composer.trade Runs Backtests**: daily rebalance lag, adjusted price data, what costs ARE and are NOT modeled (expense ratios embedded in NAV; commissions/spreads not modeled)
- **Reading a Composer Backtest**: CAGR, max drawdown, Sharpe, benchmark comparison, ETF launch date constraints; includes summary table of the four core metrics
- **Limitations of Backtesting**: regime change risk, short leveraged ETF history (TQQQ ~15 years), overfitting risk in Composer's condition-rich environment

**Files changed:** `data/glossary.json`, `data/glossary.js`, `docs/PATCHNOTES.md`, `docs/PRD.md`

---

## [1.5.5] - 2026-06-15

### Infra: Move ad-hoc scripts to `scripts/` folder

Moved `_add_glossary.py` and `_add_zoop.py` from the project root into `scripts/` (renamed to `add_glossary.py` and `add_zoop.py`, dropping the underscore prefix). Updated all internal file paths from hardcoded absolute Windows paths to the portable `Path(__file__).resolve().parent.parent` pattern used by `update_metrics.py`. Deleted the originals from the project root.

Documented the convention in `docs/PRD.md`: all Python scripts must live in the `scripts/` folder. Directory structure updated to list all three scripts. Tech stack table updated to note the `scripts/` convention.

**Files changed:** `scripts/add_glossary.py` (new), `scripts/add_zoop.py` (new), `docs/PRD.md`
**Deleted:** `_add_glossary.py`, `_add_zoop.py` (project root)

---

## [1.5.4] - 2026-06-15

### Fix: Improve disabled text legibility

Updated `--color-disabled` from `#444444` to `#c0c0c0` globally. This affects all secondary UI text: stat bar labels ("Strategies", "Best Sharpe", "Top ARR", "Concepts"), breadcrumb separators, section counts, and strategy card metadata. The previous value was near-invisible against the dark background.

**File changed:** `css/main.css`

---

## [1.5.3] - 2026-06-15

### Added: "Zoop's Strategies" glossary concept and tag

Added a glossary entry for `zoop` covering who Zoop (Azqato) is, the design philosophy behind his strategy suite, and an overview of all 11 zoops-* strategies with their headline metrics. Added the `zoop` tag (orange) to all 11 zoops-* strategies, with a label and CSS class so it renders distinctively on strategy cards.

**Files changed:** `data/glossary.json`, `data/glossary.js`, `data/strategies.json`, `data/strategies.js`, `js/app.js`, `css/main.css`

---

## [1.5.2] - 2026-06-15

### Added: 9 new glossary concepts (17 total)

Added rich multi-section entries for nine new concepts referenced throughout the site:

**Indicators:** Simple Moving Average (SMA), Exponential Moving Average (EMA), MACD

**Strategy Concepts:** Mean Reversion, Volatility Decay

**Risk Metrics:** Standard Deviation, Annualized Rate of Return (ARR)

**Asset Classes:** Managed Futures, Inverse ETFs

Each entry includes Definition, How It Works, In Practice, Limitations, and an extended "Building in Composer.trade" section with strategy-specific examples from the library. Added new tags to relevant strategies (`macd`, `mean-reversion`, `standard-deviation`, `managed-futures`, `inverse-etfs`) so related strategy counts are populated on glossary cards. Updated tag label display in `js/app.js`.

**Files changed:** `data/glossary.json`, `data/glossary.js`, `data/strategies.json`, `data/strategies.js`, `js/app.js`

---

## [1.5.1] - 2026-06-15

### Fix: Glossary card titles are now clickable links

Made the concept name in each glossary card a clickable anchor link pointing to the detail page (`glossary.html?slug=…`), matching the existing behavior on strategy cards.

**File changed:** `js/app.js`

---

## [1.5.0] - 2026-06-14

### Added: 6 new strategies (24 total)

Added six new Composer symphonies to the strategy library, expanding the catalog from 18 to 24 strategies. Each entry was analyzed from the Composer API backtest metrics and logic tree, with full `how_it_works` narrative, `signals` breakdown, and `risk_profile` section.

| Strategy | Symphony ID | ARR | Max DD |
|---|---|---|---|
| SOXX Group | `7PBSP926Mp40r6bPnP0j` | 111.2% | -69.2% |
| SOXL Growth v2.4.5 RL | `CW8oWU12S6vEvn2Hh7jD` | 143.1% | -82.5% |
| Inside Nancy Pelosi's Chips - V3 | `HgK8mCeBnH4fQFNcfZ7q` | 73.1% | -86.2% |
| Top Cap by MA + RSI ETF Hedge | `wadbe3IfwvSES5vk6yiu` | 133.3% | -57.8% |
| Mean Reversion Comparison to Python Code | `KJqNBGxYyyKuCcEfdHhq` | 81.8% | -81.7% |
| SPY, Energy, Chips, Commodities | `rtyBIBOKEY2cPSbJSQX8` | 73.9% | -65.3% |

**Notable additions:**
- **SOXX Group**: Garen/DN's K Wave V6 system with the '30-20-10 Double Pop' multi-timeframe RSI cascade for semiconductor mean-reversion
- **SOXL Growth v2.4.5 RL**: Reinforcement-learning-optimized SOXL strategy; identified by ML-precision decimal thresholds (RSI <= 62.1995, StdDev <= 4.9226) and highest drawdown in the library (82.5%)
- **Inside Nancy Pelosi's Chips - V3**: Semiconductor mean-reversion using SOXX 5-day momentum extremes and individual NVDA/AMD RSI signals at extreme thresholds (RSI > 90 and < 15)
- **Top Cap by MA + RSI ETF Hedge**: Minimalist 3-branch strategy: SPY RSI(6d) >= 90 → UVXY; RSI(6d) <= 28 → leveraged attack [TQQQ,LABU,SPXL]; normal → mega-cap momentum filter [WMT,MSTR,AMZN,KO,BRK/B,AAPL,TSLA]
- **Mean Reversion Comparison to Python Code**: Built to cross-validate a Python backtest; minimal SPY MA + TQQQ RSI(10d) logic that serves as a performance baseline vs Holy Grail
- **SPY, Energy, Chips, Commodities**: VIXM RSI(40d) Black Swan Catcher paired with a multi-sector rotator spanning [SOXX,NVDA,AMD,SPY,DBC,XLE,ENPH]

**Files changed:** `data/strategies.json`, `data/strategies.js`, `docs/PATCHNOTES.md`, `docs/PRD.md`, `README.md`

---

## [1.4.2] - 2026-06-14

### Fix: Repo-rename-proof BASE URL detection

Replaced hardcoded string matching in the `BASE` detection with a hostname check:

```js
// Before, breaks whenever the repo is renamed
const BASE = (_seg && _seg.toLowerCase() === 'composer') ? '/' + _seg : '';

// After, detects GitHub Pages by host; works regardless of repo name
const BASE = (window.location.hostname.endsWith('.github.io') && _seg) ? '/' + _seg : '';
```

The previous approach required updating the string literal every time the GitHub repository was renamed (from `ComposerAtlas` → `composer` in v1.4.1). The new approach detects GitHub Pages environments by their `*.github.io` hostname and automatically uses whatever the first path segment is as the base. Behaviour is identical on all environments: GitHub Pages gets `/composer`, localhost gets `''`, `file://` is handled separately in `u()`.

**Files changed:** `js/app.js`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.4.1] - 2026-06-14

### Infra: GitHub repository renamed from `ComposerAtlas` to `composer`

The GitHub repository was renamed from `Azqato/ComposerAtlas` to `Azqato/composer`. The GitHub Pages URL changed accordingly.

| | Before | After |
|---|---|---|
| Repository | `https://github.com/Azqato/ComposerAtlas` | `https://github.com/Azqato/composer` |
| Live site | `https://azqato.github.io/ComposerAtlas/` | `https://azqato.github.io/composer/` |

**Critical fix; `js/app.js` BASE detection:** The `BASE` constant is derived from the first URL path segment and used to prefix all internal links. Before: checked for `'composeratlas'` (case-insensitive). After: checks for `'composer'`. Without this fix all navigation and deep links would resolve to the server root.

```js
// Before
const BASE = (_seg && _seg.toLowerCase() === 'composeratlas') ? '/' + _seg : '';

// After
const BASE = (_seg && _seg.toLowerCase() === 'composer') ? '/' + _seg : '';
```

**Also updated:** `robots.txt` sitemap URL, `README.md` clone/live/actions URLs, `docs/PRD.md` live URL, repository URL, route table, and BASE detection code example.

**Files changed:** `js/app.js`, `robots.txt`, `README.md`, `docs/PRD.md`, `docs/PATCHNOTES.md`

---

## [1.4.0] - 2026-06-14

### Added: 5 new strategies (18 total)

Added five new Composer symphonies to the strategy library, expanding the catalog from 13 to 18 strategies. Each entry was analyzed from the Composer API logic tree and includes full `how_it_works` narrative, `signals` breakdown, and `risk_profile` section.

| Slug | Name | ARR | Max DD | Sharpe | Calmar | Days |
|---|---|---|---|---|---|---|
| `holy-grail` | The Holy Grail (Original) | 153.9% | -47.4% | 1.80 | 3.24 | 3,693 |
| `tqqq-long-term` | TQQQ For The Long Term | 165.4% | -53.6% | 1.86 | 3.08 | 3,693 |
| `wooden-arkk` | Wooden ARKK Machine 2.2 | 244.2% | -44.5% | 2.25 | 5.48 | 1,028 |
| `super-semiconductors` | Super Semiconductors | 102.6% | -42.9% | 1.71 | 2.39 | 3,614 |
| `four-horsemen` | The Four Horsemen of the Apocalypse | 166.8% | -45.3% | 2.18 | 3.68 | 3,629 |

**Strategy highlights:**
- **Holy Grail** uses TQQQ's own 200d MA as the trend gate (not SPY), with a 5% rebalance corridor rather than daily rebalancing; bear mode uses sequential dip-buys on TECL/SOXL and a SQQQ/BSV RSI filter.
- **TQQQ For The Long Term** gates on SPY's 200d MA with dual overbought checks (TQQQ RSI + SPXL RSI); bear mode adds SQQQ dip-buy as an unusual re-entry into the inverse position after market bounces.
- **Wooden ARKK Machine 2.2** is a pure mean-reversion system: IEI vs SPHB RSI(7) selects the regime, then buys the single worst-performing asset from a 7-ETF long pool (risk-off) or 5-ETF inverse pool (risk-on) using 4-day MA sort.
- **Super Semiconductors** (Dereck Nielsen) uses SPY EMA(8)/SMA(200) gate + MACD on SMH to switch between top-3 stock selection from a 19-stock universe, partial SHY/SMH hedge, SOXL dip-buy, or bear-mode SOXS short.
- **Four Horsemen** runs multiple parallel components with different time horizons, the most complex logic tree in the library: QQQ 252d return < -20% activates a deep bear routing protocol with tiered thresholds and bear-rally detection.

**Files changed:** `data/strategies.json`, `data/strategies.js`, `README.md`, `docs/PATCHNOTES.md`

---

## [1.3.0] - 2026-06-14

### Changed
- Consolidated 12 documentation files into 4 canonical documents: README.md, docs/PRD.md, docs/DESIGN.md, docs/PATCHNOTES.md
- Moved all operational, technical, API, schema, roadmap, security, and tenet content into docs/PRD.md as consolidated sections
- README.md rewritten as developer-facing quick-start (no marketing language)
- docs/DESIGN.md expanded to include all required sections: philosophy, full color palette, typography, spacing, breakpoints, component patterns, accessibility, animation
- File naming standardized from .MD to .md

### Removed
- docs/ComposerAPI.MD (content moved to PRD.md § Composer API Reference)
- docs/GLOSSARY-SCHEMA.MD (content moved to PRD.md § Data Schemas)
- docs/METRICS.MD (content moved to PRD.md § Data Schemas)
- docs/PRFAQ.MD (content moved to PRD.md § FAQ)
- docs/ROADMAP.MD (content moved to PRD.md § Roadmap)
- docs/RUNBOOK.MD (content moved to PRD.md § Operational Runbook)
- docs/SECURITY.MD (content moved to PRD.md § Security)
- docs/TENETS.MD (content moved to PRD.md § Tenets)
- docs/TRD.MD (content moved to PRD.md § Architecture & Technical Reference)
- README.MD (root, uppercase) replaced by README.md (lowercase)

---

## [1.2.1] - 2026-06-14

### Docs: Documented URL-based strategy addition workflow

Added "Adding a Strategy from a Composer URL (Streamlined)" section to `docs/RUNBOOK.MD`: the preferred method for adding new strategies. Documents the full automated workflow: extract symphony ID from URL, fetch backtest metrics and logic tree from the Composer API (no auth required), AI analysis of IF/ELSE logic tree to draft all content fields, name/slug proposal with user confirmation, and dual-file insertion into `data/strategies.json` + `data/strategies.js`.

The prior "Adding a New Strategy" workflow is retained and renamed "Manual" for cases where the API is unavailable.

**Files changed:** `docs/RUNBOOK.MD` (v1.7 → v1.8), `docs/PATCHNOTES.MD`

---

## [1.2.0] - 2026-06-14

### Refactor: Consolidated folder structure: flat root .html files

Eliminated the `strategies/` and `glossary/` subdirectories entirely. Each section's listing and detail views are now served from a single root-level `.html` file.

| Before | After |
|---|---|
| `strategies/index.html` (listing) | `strategies.html` (listing + detail) |
| `strategies/detail/index.html` (detail) | ↑ same file, `?slug=X` triggers detail view |
| `glossary/index.html` (listing) | `glossary.html` (listing + detail) |
| `glossary/detail/index.html` (detail) | ↑ same file, `?slug=X` triggers detail view |

**How it works:** Each combined page checks `new URLSearchParams(window.location.search).get('slug')` on load. `null` → render listing into `#content`; non-null → render detail view for that slug. Same file, same assets, different render path.

**URL changes:**

| Old URL | New URL |
|---|---|
| `/ComposerAtlas/strategies/` | `/ComposerAtlas/strategies.html` |
| `/ComposerAtlas/strategies/detail/?slug=X` | `/ComposerAtlas/strategies.html?slug=X` |
| `/ComposerAtlas/glossary/` | `/ComposerAtlas/glossary.html` |
| `/ComposerAtlas/glossary/detail/?slug=X` | `/ComposerAtlas/glossary.html?slug=X` |

**`u()` simplified** (`js/app.js`): Removed depth-detection logic (no longer needed, all pages are at root depth 0). `file://` path now just strips the leading `/` and maps `'/'` → `'index.html'`. Function shrank from 12 lines to 5.

**Files changed:** `strategies.html` (new), `glossary.html` (new), `js/app.js`, `index.html`, `404.html`, `docs/RUNBOOK.MD` (v1.6 → v1.7), `docs/PATCHNOTES.MD`

**Deleted:** `strategies/index.html`, `strategies/detail/index.html`, `glossary/index.html`, `glossary/detail/index.html`

---

## [1.1.9] - 2026-06-14

### Fix: s90 50/40 maxDD: remove incorrect 2026 Frontrunner reference

The `how_it_works` and `risk_profile` content incorrectly stated the strategy paired with "the 2026 Frontrunner." It uses a different frontrunner component. Updated all three occurrences to "a frontrunner component" / "the frontrunner component", neutral phrasing that doesn't assert which frontrunner is used.

**Files changed:** `data/strategies.json`, `data/strategies.js`, `docs/PATCHNOTES.MD`

---

## [1.1.8] - 2026-06-14

### Feature: Strategy card titles are now clickable links

Strategy card titles (`<h2 class="card-title">`) now link to the strategy detail page, identical to the "View Strategy →" button on each card. Clicking the title navigates to `/strategies/detail/?slug=...`.

**Implementation:** Wrapped `s.name` in an `<a>` tag inside `renderStrategyCard()`. Added `.card-title a { color: inherit; text-decoration: none; }` so the link inherits the heading color and the existing `.card:hover .card-title { color: var(--color-green); }` rule applies naturally, hovering the card turns both the title text and the link green with no additional CSS required.

**Files changed:** `js/app.js`, `css/main.css`, `docs/PATCHNOTES.MD`

---

## [1.1.7] - 2026-06-14

### Content: Added Low Catchers strategy (13th symphony)

Added **s90 50/40 maxDD (Half Low Catch)** (`s90-half-low-catch`), a multi-asset extreme dip-buying strategy that pairs the 2026 Frontrunner with a dedicated low-catching component.

**Strategy summary:**

The low-catchers component is a waterfall of extreme oversold conditions across 9+ 3x leveraged ETFs. Entry thresholds are the tightest in the library (RSI 14–22). The strategy only deploys in catastrophic conditions: QQQ 10-day MA return < -2.4%, SOXL 1/2/5-day crash thresholds (-31%/-37%/-57%), UVXY RSI > 88 (extreme fear), or individual ETF RSI bottoms across LABU, YINN, UDOW, FAS, TNA, URTY, KORU, NAIL, and others.

**Key metrics (as of 2026-06-14, backtest 551 days):**

| Metric | Value |
|---|---|
| Annualized Return | 735% |
| Max Drawdown | -29.6% |
| Sharpe Ratio | 3.04 |
| Calmar Ratio | 24.8 |
| Standard Deviation | 79.7% |
| Backtest Days | 551 (~2.2 yrs) |

**Important:** Backtest covers ~2.2 years only (from early 2024). Metrics reflect a predominantly bull market and should be interpreted with caution.

Metrics fetched via Composer API (`POST /api/v0.1/symphonies/K8ql2SKFd4VDBemIstEr/backtest`).

**Files changed:** `data/strategies.json`, `data/strategies.js`, `docs/PATCHNOTES.MD`

---

## [1.1.6] - 2026-06-13

### Design: 🗺️ emoji replaces "CA" monogram as site logo and favicon

Replaced the green "CA" monogram with the 🗺️ map emoji across all logo touchpoints.

**favicon.svg**: Replaced the dark-background rectangle + "CA" JetBrains Mono text with a plain 32×32 SVG that renders the emoji. All 7 HTML pages already reference `favicon.svg` via `<link rel="icon">` so no HTML changes were needed.

**Nav logo mark** (`js/app.js`); Changed `<span class="nav-logo-mark">CA</span>` to `<span class="nav-logo-mark">🗺️</span>`.

**`.nav-logo-mark` CSS** (`css/main.css`); Removed `font-family: var(--font-mono)`, `font-weight: 700`, and `color: var(--color-green)` (irrelevant to emoji rendering). Replaced with an emoji-safe font stack (`'Segoe UI Emoji'`, `'Apple Color Emoji'`, `'Noto Color Emoji'`) and bumped `font-size` to `1.25rem` for visual balance.

**Files changed:** `favicon.svg`, `js/app.js`, `css/main.css`

---

### Docs: Strategy building best practice added to PRD

Added a "Content Notes (Pending Placement)" section to `docs/PRD.MD` to stage content destined for the website. First entry: avoid lookback periods shorter than 10 days to prevent overfitting and OOS drift.

**Files changed:** `docs/PRD.MD`

---

## [1.1.5] - 2026-06-08

### Fix: Stats bar values now use primary white color

Homepage stats bar numbers (12 Strategies, Best Sharpe, Top ARR, 8 Concepts) were inconsistently colored, the Sharpe and ARR values had `text-green` class applied, making them green while the Strategies and Concepts counts were white. All four stat values now consistently use `--color-primary` (`#f0f0f0`).

**Files changed:** `index.html`

---

## [1.1.4] - 2026-06-08

### Docs: Full documentation audit: all 12 docs updated to reflect v1.1.x site state

All documentation files in `docs/` updated to match the current state of the live site. No code changes.

**TRD.MD (v1.3 → v1.4)**
- Updated BASE URL detection snippet to the case-insensitive version (`split('/')[1]` + `.toLowerCase()`)
- Updated `--color-secondary` from `#888888` to `#b0b0b0` in the CSS vars block; removed `--color-green-muted` (removed in v1.1.1)
- Updated GitHub Actions workflow to show rsync-based deploy with exclusion list
- Fixed page route table: `/composeratlas/` → `/ComposerAtlas/` (correct casing)
- Added documentation of the `u()` URL helper function

**DESIGN.MD (v1.1 → v1.2)**
- Fixed all color token names: `--color-text-primary/secondary/disabled` → `--color-primary/secondary/disabled` (matching actual CSS)
- Updated `--color-secondary` value from `#888888` to `#b0b0b0` (updated in v1.0.7)
- Removed `--color-green-muted` row (removed in v1.1.1)
- Added Footer component spec (missing from v1.1)
- Fixed Loading States: removed incorrect claim that data is resolved at build time
- Fixed Error States: removed Astro-specific language; describes actual runtime JSON error handling
- Fixed Mobile Nav: removed "Implemented as Astro island" note; replaced with correct vanilla JS description
- Updated contrast ratio for `--color-secondary`: ~5.7:1 → ~9.4:1 (brighter value)

**METRICS.MD (v1.1 → v1.2)**
- Fixed `tags` field description: `/src/content/glossary/` → `data/glossary.json`
- Fixed color token names in Color Coding table: `--color-text-primary` → `--color-primary`

**PRD.MD (v1.0 → v1.1)**
- Updated strategy count 10 → 12 throughout
- Fixed Dependencies section: "Chosen JS framework (TBD)" → "Vanilla HTML/CSS/JavaScript: zero build dependencies"

**ROADMAP.MD (v1.0 → v1.1)**
- Marked V1.0 as Complete (was "In Development"); added live URL
- All V1.0 deliverables checked; count corrected 10 → 12
- Updated V1.1 status to "In Progress (current; at v1.1.3)"; checked completed items
- Updated V1.2 to "Partially Complete"; checked items delivered via `scripts/update_metrics.py`

**SECURITY.MD (v1.0 → v1.1)**
- Replaced npm-specific dependency management guidance with correct zero-dependency posture

**GLOSSARY-SCHEMA.MD (v1.0 → v2.0)**
- Complete rewrite: replaced Astro Content Collections / Markdown file approach with actual JSON-based structure
- Documents `data/glossary.json` and `data/glossary.js` sync requirement
- New JSON entry schema with all fields; section structure documented
- Updated all 8 canonical glossary entries from "Planned" to "Complete"

**PRFAQ.MD (v1.0 → v1.1)**
- Updated strategy count reference from "10" to "12"

**Files changed:** `docs/TRD.MD`, `docs/DESIGN.MD`, `docs/METRICS.MD`, `docs/PRD.MD`, `docs/ROADMAP.MD`, `docs/SECURITY.MD`, `docs/GLOSSARY-SCHEMA.MD`, `docs/PRFAQ.MD`

---

## [1.1.3] - 2026-06-08

### Design: Footer simplified to match azqato.github.io

Replaced the multi-column footer (logo, tagline, nav links, disclaimer block) with a clean centered layout matching the spacing and approach of azqato.github.io.

**Before:** Two-column flex layout with logo/tagline on the left, nav links on the right, a divider, and a stacked disclaimer block below. `padding: 40px 0`.

**After:** Single centered column. `padding: 2rem`, `text-align: center`. Three elements stacked:
1. Nav links row (centered, `gap: 16px`)
2. One-line legal disclaimer (`max-width: 560px`, `color: --color-disabled`)
3. Copyright + "Built by Azqato" attribution

**Files changed:** `css/main.css`, `js/app.js`

---

## [1.1.2] - 2026-06-08

### Fix: All internal links broken on GitHub Pages (case-sensitive BASE detection)

Every internal link generated by `u()` was broken on the live GitHub Pages deployment, nav links (Strategies, Glossary, About), strategy card "View Strategy" buttons, breadcrumbs, sidebar links, and error-state back buttons. Only hardcoded relative URLs (like the homepage hero CTA) were immune.

**Root cause:** `BASE` was computed as:
```js
const BASE = window.location.pathname.startsWith('/composeratlas') ? '/composeratlas' : '';
```
The GitHub repository is named `ComposerAtlas` (capital C), so the live URL path is `/ComposerAtlas/...`. The case-sensitive `startsWith` check always failed, `BASE` became `''`, and every `u()` call produced an absolute path from the server root (e.g. `/strategies/detail/`) instead of `/ComposerAtlas/strategies/detail/`.

**Fix:** Extract the first URL path segment and compare case-insensitively, preserving actual casing from the live URL:
```js
const _seg = window.location.pathname.split('/')[1];
const BASE = (_seg && _seg.toLowerCase() === 'composeratlas') ? '/' + _seg : '';
```

Also updated the homepage hero Glossary CTA to route through `u('/glossary/')` via JavaScript instead of a hardcoded `href="glossary/"`, making it consistent with every other internal link on the site.

**Files changed:** `js/app.js`, `index.html`

---

## [1.1.1] - 2026-06-08

### Cleanup: Pre-Launch Optimization

Cleaned up project structure and deployment pipeline in preparation for the initial GitHub Pages launch.

**Deploy workflow** (`deploy.yml`): Previous workflow uploaded the entire repository to GitHub Pages, including files that should never be publicly served. Updated to use `rsync` to build a clean `_site/` folder before upload. Files now excluded from deployment:

- `data/symphony_scores.json`: 14MB raw EDN logic tree data; for AI analysis only, not user-facing
- `docs/`: Internal project documentation (RUNBOOK, TRD, PATCHNOTES, etc.)
- `scripts/`: Python data sync scripts
- `strategies.xlsx`: Source spreadsheet reference
- `README.MD`, `.gitignore`, `.github/`: Dev/CI config

**CSS**: Removed unused `--color-green-muted: #00a854` custom property. It was defined in `:root` but never referenced anywhere in the stylesheet.

**JS**: Removed unused `i` parameter from `renderBreadcrumb`'s map callback.

**Files changed:** `.github/workflows/deploy.yml`, `css/main.css`, `js/app.js`, `docs/RUNBOOK.MD` (v1.5 → v1.6)

---

## [1.1.0] - 2026-06-08

### Content: Logic Tree Analysis: Full Strategy Rewrites

All 12 strategy pages have been rewritten from scratch based on analysis of the actual IF/ELSE logic trees stored in `data/symphony_scores.json`. The previous content was generic placeholder text that did not accurately reflect how each symphony works. This release corrects the record.

**What changed per strategy:**

| Field | Before | After |
|---|---|---|
| `how_it_works` | 2-3 generic paragraphs describing momentum/rotation | 3 precise paragraphs derived from actual logic tree structure |
| `signals` | Approximate: often missing or mislabeled | Verified against actual IF branches: ETF tickers, RSI thresholds, and conditions confirmed |
| `tags` | Multiple errors (see below) | Corrected per actual logic used |
| `risk_profile` | Cited stale metric figures | Updated to match current API metrics; stale Calmar/return figures removed |

**Tag corrections across all 12 strategies:**

- `rsi`: Added to all 12 strategies (was missing from Frontrunner, TQQQ FTLT, Safety Checks, KMLM Switcher, UPRO FTLT)
- `vix-tiers`: Added to all 12 strategies (all use UVXY RSI >65 via the Frontrunner component; tag was absent from most)
- `200d-ma`: Removed from Frontrunner (no SMA comparison exists in its logic tree); correctly added to TQQQ FTLT, UPRO FTLT, Safety Checks, Leveraged TQQQ Symphony where absent
- `200d-ma`: Removed from KMLM Switcher and SOXL Growth (neither uses a Price > SMA signal in its terminal logic)
- `max-drawdown`: Added to SOXL Growth; this is the only strategy using MaxDD as a primary regime gate
- `200d-ma`: Removed from SOXL Growth (MaxDD is the primary signal, not an SMA comparison)

**Key content corrections (selected highlights):**

- **Frontrunner**: Recharacterized from "momentum/trend-follower" to "cash-first dip-buying strategy that defaults to BIL T-bills", the actual behavior
- **KMLM Switcher**: Removed description of KMLM ETF as the switching instrument; actual switch signal is XLK (Technology SPDR) relative RSI; LABU biotech dip-buy documented
- **Sometimes TQQQ**: Documented multi-period RSI (10/20/60/100), 6 cumulative return windows (1d/6d/10d/60d/62d/252d), and full bond cross-asset signal set (TLT/BND/IEF/AGG/CORP/PSQ)
- **Safety Checks**: Documented 10-condition ensemble voting structure (the most accurate description of its behavior)
- **Manhattan Project**: Documented BIL RSI yield signal, 8-ETF leveraged basket on SPY RSI <30, and 20+ ETF universe
- **SOXL Growth**: Documented MaxDD(SOXL) ≥50% regime gate, standard deviation thresholds (3.8%/4.92%/5.41%/18%), and TMF/TMV in-position Treasury pairing

**Process:** See RUNBOOK.MD § "Re-Analyzing Strategy Logic Trees" for the full documented procedure.

**Files changed:** `data/strategies.json`, `data/strategies.js`, `docs/RUNBOOK.MD` (v1.4 → v1.5)

---

## [1.0.9] - 2026-06-08

### Data: Symphony logic trees fetched and stored for analysis

Added `data/symphony_scores.json` containing the full IF/ELSE logic tree for all 12 symphonies, fetched from `GET /api/v0.1/symphonies/{id}/score`. This file is for AI analysis and future reference only, it is not served to the website.

Updated `scripts/update_metrics.py` to also refresh `symphony_scores.json` on every run, keeping logic trees in sync alongside backtest metrics. Run the script monthly (or whenever symphonies are edited) to keep all data current.

**Files changed:** `data/symphony_scores.json` (new), `scripts/update_metrics.py`, `docs/RUNBOOK.MD` (v1.3 → v1.4)

---

## [1.0.8] - 2026-06-08

### Data: Live backtest metrics refreshed via Composer API

All 12 strategy metrics updated by fetching fresh backtest data directly from the Composer API (`POST /api/v0.1/symphonies/{id}/backtest`). No API key required.

Updated fields per strategy: `annualized_rate_of_return`, `max_drawdown`, `cumulative_return`, `calmar_ratio`, `sharpe_ratio`, `standard_deviation`, `min`, `mean`, `median`, `max`, `trailing_one_month_return`, `trailing_three_month_return`, `trailing_one_year_return`, `backtest_days`, `last_updated`.

**Files changed:** `data/strategies.json`, `data/strategies.js`

**Added:** `scripts/update_metrics.py`: reusable Python script to refresh all metrics on demand. Run with `python scripts/update_metrics.py` from the project root.

---

## [1.0.7] - 2026-06-08

### Fix: Secondary text legibility across all pages

Lightened the `--color-secondary` CSS token from `#888888` to `#b0b0b0`. This improves readability of all body/description text on a dark background, including the hero subtitle, strategy descriptions, glossary concept descriptions, how-it-works paragraphs, prose section text, and card descriptions.

**Files changed:** `css/main.css`

---

## [1.0.6] - 2026-06-08

### Glossary: 5-Paragraph Essays for All 8 Concepts

Each glossary concept now includes a dedicated "Building with…" essay section that explains why the concept is useful for systematic investing and shows concrete examples of how to apply it when building symphonies in Composer.trade.

**New sections added to all 8 concepts:**

| Concept | Essay Title |
|---|---|
| RSI | "Building with RSI in Composer.trade" |
| 200-Day Moving Average | "Building with the 200-Day MA in Composer.trade" |
| Momentum Investing | "Building Momentum Strategies in Composer.trade" |
| VIX Tiers | "Building VIX-Tiered Symphonies in Composer.trade" |
| Leveraged ETFs | "Building Systematic Leveraged ETF Symphonies in Composer.trade" |
| Sharpe Ratio | "Using Sharpe Ratio to Build Better Symphonies in Composer.trade" |
| Calmar Ratio | "Using Calmar Ratio to Design Better Symphonies in Composer.trade" |
| Max Drawdown | "Managing Max Drawdown When Building Symphonies in Composer.trade" |

Each essay covers: why the concept matters for systematic investing, how it functions as a signal or metric in a Composer.trade symphony, practical examples of building with it (signal combinations, thresholds, symphony architecture), and limitations to watch for.

**Files changed:** `data/glossary.json`, `data/glossary.js`

No rendering changes required, the existing `glossary/detail/index.html` page renders sections from the data array automatically, so the new essay sections appear without any code changes.

---

## [1.0.5] - 2026-06-08

### Nav + Footer: Support link and Azqato attribution

**Navigation**
- Added "Support" link to desktop nav, mobile nav drawer, and footer nav: links to `https://azqato.github.io/support.html` (opens in new tab)
- External links in nav now include `target="_blank" rel="noopener noreferrer"` automatically via the `external: true` flag on link objects

**Footer**
- Added "Made by Azqato." centered below the copyright line: links to `https://azqato.github.io/` (opens in new tab)

**Files changed:** `js/app.js`

---

## [1.0.4] - 2026-06-08

### Fix: Navigation broken on file:// protocol

All internal links now work correctly when the site is opened by double-clicking HTML files.

#### Problem

Navigation links in `renderNav()`, `renderFooter()`, and inline page scripts were constructed as `BASE + '/strategies/'`, producing absolute paths like `/strategies/`. On `file://` protocol, `/strategies/` resolves to the filesystem root (e.g., `file:///strategies/`), not relative to the project folder, so every nav click went to a dead 404.

#### Fix

Added a `u(path)` helper function to `js/app.js`:
- On HTTP/HTTPS: returns `BASE + path` (unchanged behavior: absolute paths work fine on a server)
- On `file://`: determines the current page's depth in the directory tree (0 = root, 1 = `strategies/` or `glossary/`, 2 = `strategies/detail/` or `glossary/detail/`) and returns a relative path (e.g., `../../strategies/`) so the browser resolves it correctly

All link constructions across `js/app.js` and the inline scripts in `strategies/detail/index.html`, `glossary/detail/index.html`, and `404.html` have been updated to use `u()` instead of `BASE + '/'`.

---

## [1.0.3] - 2026-06-08

### File:// Protocol Compatibility: Open Without a Server

The site now works by double-clicking any HTML file directly. No Python server required.

#### Problem

The previous implementation loaded strategy and glossary data via `fetch()`. Browsers block `fetch()` on the `file://` protocol due to CORS restrictions, meaning the site would only work when served over HTTP (e.g., `python -m http.server`).

#### Solution

Converted data loading to a `<script>`-tag-based approach:

**Files Added**
- `data/strategies.js`: Assigns `window.STRATEGIES_DATA = [...]` with all 12 strategies. Loaded before `app.js` via `<script>` tag.
- `data/glossary.js`: Assigns `window.GLOSSARY_DATA = [...]` with all 8 glossary concepts.

**Files Updated**
- `js/app.js`: `loadStrategies()` and `loadGlossary()` now check `window.STRATEGIES_DATA` / `window.GLOSSARY_DATA` first. Falls back to `fetch()` only if the globals are absent.
- All 7 HTML pages: Added `<script src="[path]/data/strategies.js">` and `<script src="[path]/data/glossary.js">` before the `app.js` include. Relative paths adjusted per directory depth.

#### Result

- Open `index.html` by double-clicking: site loads fully, no server needed.
- GitHub Pages continues to work unchanged (HTTP origin, globals are just loaded first).
- Python server still works as before (fetch fallback or globals: both load the same data).
- `data/strategies.json` and `data/glossary.json` remain the source-of-truth files. When updating data, keep the corresponding `.js` files in sync.

#### Documentation Updated

- `docs/TRD.MD` (v1.2 → v1.3), Added `data/*.js` files to directory structure; updated data layer section to describe dual-mode loading (globals + fetch fallback)
- `docs/RUNBOOK.MD` (v1.2 → v1.3), Updated "Adding a Strategy" and "Adding a Glossary Entry" workflows to require updating both `.json` and `.js` files; updated "Local Dev" section; updated troubleshooting

---

## [1.0.2] - 2026-06-08

### Site Build: Vanilla HTML/CSS/JS MVP

Full site built from scratch as a zero-dependency vanilla web application. No build tooling required. Deployable directly to GitHub Pages.

#### Architecture Change

Switched from planned Astro 5.x build system to vanilla HTML/CSS/JS:
- **Removed:** `package.json`, `astro.config.mjs`, `tailwind.config.mjs`, `tsconfig.json`, `src/` directory
- **Rationale:** Eliminates Node.js installation requirement. The hosted site and all development workflows now have zero npm/build dependencies.
- **GitHub Actions:** Updated workflow uploads repository root directly: no build step required.

#### Files Created

**Core**
- `css/main.css`: Complete design system: CSS custom properties (design tokens), base reset, typography, nav, cards, metrics table, tags/badges, buttons, footer, prose, responsive grid layout
- `js/app.js`: Shared utilities loaded on every page: BASE URL detection, data loading (`loadStrategies()`, `loadGlossary()`), format helpers (`formatPct`, `formatLargePct`, `formatRatio`, `formatDate`, `formatBacktestDays`, `colorClass`), nav and footer rendering, card/table render helpers
- `favicon.svg`: CA monogram SVG icon
- `robots.txt`
- `.github/workflows/deploy.yml`: Simplified GitHub Actions deploy (no build step, uploads repo root)

**Data**
- `data/glossary.json`: All 8 glossary concepts in structured JSON format with sections, paragraphs, and optional tables
- `data/strategies.json`: (previously created) 12 real strategies, all fields from spreadsheet

**Pages**
- `index.html`: Home page: hero section, live stats bar (strategy count, best Sharpe, top ARR), 3-column strategy card grid loaded via JS
- `strategies/index.html`: Strategy listing page with full 3-column grid
- `strategies/detail/index.html`: Strategy detail: reads `?slug=` from URL, renders tags, how-it-works, signals, risk profile, full metrics table; sticky sidebar with other strategies list
- `glossary/index.html`: Glossary listing with concept cards sorted by category
- `glossary/detail/index.html`: Concept detail: renders all sections with prose formatting, optional formula box, tables; sidebar with related strategies and other concepts
- `about.html`: Static about page with disclaimers and tech stack info
- `404.html`: Custom 404 page

#### Documentation Updated

- `docs/TRD.MD` (v1.1 → v1.2), Updated framework decision to vanilla HTML/CSS/JS, updated directory structure, data access patterns, page routes, deploy pipeline, removed Astro/Tailwind/TypeScript references
- `docs/RUNBOOK.MD` (v1.1 → v1.2), Updated all commands to use Python HTTP server, updated strategy/glossary workflows to target JSON files directly, updated troubleshooting section for vanilla JS issues
- `.gitignore`: Removed Astro-specific entries (`node_modules/`, `dist/`, `.astro/`)

---

## [1.0.1] - 2026-06-08

### Documentation: Foundational Design Buildout

Major expansion of all project documentation to bring the design and technical foundation to a complete, actionable state. All framework and architecture decisions have been made and recorded. The project is now ready for code scaffolding.

#### TRD.MD (v1.0 → v1.1)
- **Framework decision made:** Astro 5.x selected as the static site generator
- **Styling decision made:** Tailwind CSS + CSS custom properties for design tokens
- **Language decision made:** TypeScript in strict mode
- Added complete directory structure for the Astro project
- Added TypeScript `Strategy` interface mirroring the METRICS.MD schema
- Added Astro Content Collections configuration for glossary Markdown files
- Added build-time data loading patterns (static JSON import via `getStaticPaths()`)
- Added full GitHub Actions deploy workflow (build + deploy jobs)
- Added Astro config with `site`, `base`, and integrations (`tailwind`, `sitemap`)
- Added Tailwind config with complete design token color palette
- Added SEO strategy: per-page meta, Open Graph tags, sitemap, robots.txt
- Added performance budget (Lighthouse targets, LCP, TBT, CLS, payload targets)
- Added future technical considerations table (search, charts, analytics, AdSense)

#### DESIGN.MD (v1.0 → v1.1)
- Added `--color-surface-raised`, `--color-border-hover`, `--color-text-disabled`, and muted color variants (`-muted` at 12% opacity) to the palette
- Added semantic color rules: explicit rules for when each color may and may not be used
- Added typography table with exact size, weight, and line-height per element level
- Added Google Fonts `<link>` loading code with `font-display: swap`
- Added responsive breakpoints table (base/sm/md/lg/xl/2xl)
- Added spacing scale (4px base unit, full token table)
- Added border-radius reference by context
- Added elevation system (flat/surface/raised via border rather than shadow)
- Added full page layout wireframes: Home, Strategy Detail, Glossary Index, Glossary Detail, About
- Added two-column body layout spec for Strategy Detail and Glossary Detail pages
- Added Navigation section: full desktop and mobile nav specs including drawer behavior
- Expanded all component specs (StrategyCard, StrategyCardCompact, MetricsTable, GlossaryTag, CTAButton, ConceptCard, Breadcrumb) with exact states (default/hover/focus/active), transitions, and color codes
- Added Loading States section with skeleton card shimmer spec
- Added Error States section (build-time failure behavior, 404 page requirement)
- Added Motion and Transitions table covering all interactive elements
- Added Accessibility section: contrast ratios, focus management, semantic HTML requirements, screen reader guidelines, WCAG 2.1 AA target
- Added `prefers-reduced-motion` CSS rule

#### METRICS.MD (v1.0 → v1.1)
- Added `slug` field to MVP schema (required: human-readable URL slug used as route param)
- Added Slug Convention section with derivation rules and examples
- Added Metric Calculation Notes for Calmar ratio, Sharpe ratio, standard deviation, and period returns
- Added Display Order section: defines the three-group order for MetricsTable rendering
- Added Tag Vocabulary section mapping tag strings to glossary slugs and concept names
- Updated Sample JSON Entry to include `slug` field
- Clarified `max_drawdown` is always negative; clarified `description` must not contain HTML

#### RUNBOOK.MD (v1.0 → v1.1)
- Updated all commands to Astro-specific (`npm run dev` → Astro dev server at `localhost:4321`)
- Added JSON validation command using Node.js
- Added Step 2 (slug generation) to the "Adding a New Strategy" workflow
- Added Step 5 (tag verification) to the "Adding a New Strategy" workflow
- Added strategy logic content step referencing `strategyContent.ts`
- Updated Glossary Entry workflow to reference Astro Content Collections
- Added Content Collection Error troubleshooting entry (Zod validation errors)
- Added local dev port conflict workaround
- Updated versioning convention table
- Removed references to placeholder `npm run validate` command

#### README.MD
- Updated Tech Stack section to reflect Astro, Tailwind CSS, TypeScript, Content Collections, GitHub Actions
- Updated Repo Structure to the full Astro directory layout
- Added Local Development section with commands
- Added Documentation table with links to all docs files
- Added Disclaimer section
- Added `GLOSSARY-SCHEMA.MD` to docs file list

### Added
- `docs/GLOSSARY-SCHEMA.MD`: new document defining the full structure for glossary Markdown entries
  - Frontmatter schema with Zod-compatible field definitions
  - Category value table with display labels and color assignments
  - Required and optional body section specifications with per-section checklists
  - Full example entry (RSI) demonstrating every section
  - Pre-commit checklist for new glossary entries
  - Canonical glossary entry tracker table (8 MVP entries, all Planned)

---

## [1.0.0] - 2026-06-08

### Added
- Initial project scaffold and documentation suite
- README.MD, PRD.MD, TRD.MD, DESIGN.MD, METRICS.MD
- ROADMAP.MD, PATCHNOTES.MD, PRFAQ.MD, TENETS.MD, SECURITY.MD, RUNBOOK.MD
- Defined MVP scope: 10 strategy pages, concept glossary, static JSON data layer
- Defined design system: dark mode, Composer.trade-inspired color palette
- Defined strategy metrics schema (17 core fields + extended schema for future use)

### Status
- Pre-launch: development begins with Claude Code
