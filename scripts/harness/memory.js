/* Roadmap item 3: where is the memory ceiling on the current search space?

   The v1.22.15 profile (527 MB peak heap) was taken on a 3,042,720-signal run,
   before v1.23 grew the search space and before specs went columnar. This
   re-measures it.

   The constraint that makes this matter: a tab's JS heap ceiling is FIXED and
   does NOT grow with installed RAM. It was measured at 3,586 MB on a 48GB
   machine, so this is a property of the tab, not of the hardware.

   Run with --enable-precise-memory-info, or performance.memory buckets to
   100KB granularity and the peak is meaningless. */
(function () {
  const OUT = [];
  const log = m => OUT.push(m);

  const MB = v => (v / 1048576).toFixed(0) + ' MB';

  // TRAP: under --virtual-time-budget the page clock advances fast whenever
  // the renderer is idle, so a Date.now() deadline inside a driver expires
  // long before a long compute has finished. The first version of this
  // harness "timed out" on all three cases at 82 MB peak, i.e. before Pass 1
  // had really started. Count POLLS, not milliseconds; the subprocess timeout
  // in run_harness.py is the real guard.
  function waitFor(fn, polls) {
    return new Promise((res, rej) => {
      let n = 0;
      (function tick() {
        let v; try { v = fn(); } catch (e) { return rej(e); }
        if (v) return res(v);
        if (++n > (polls || 4000000)) return rej(new Error('gave up after ' + n + ' polls'));
        setTimeout(tick, 25);
      })();
    });
  }

  async function main() {
    await waitFor(() => window.__t && window.__t.PD && document.getElementById('sl-run'));
    const T = window.__t;
    const TK = Object.keys(T.PD.tickers);

    if (!performance.memory) {
      log('performance.memory unavailable: rerun with --enable-precise-memory-info');
      log('DONE');
      const p = document.createElement('pre'); p.id = 'HARNESS';
      p.textContent = OUT.join('\n'); document.body.appendChild(p);
      return;
    }
    log('heap ceiling (fixed, does not scale with RAM): ' + MB(performance.memory.jsHeapSizeLimit));

    document.getElementById('sl-cpu').value = 'max';

    for (const nT of [20, 40, 72]) {
      T.targets.clear(); T.targets.add('QQQ');
      T.compares.clear(); TK.slice(0, nT).forEach(s => T.compares.add(s));
      T.syncChips();

      let peak = 0;
      const sampler = setInterval(() => {
        const u = performance.memory.usedJSHeapSize;
        if (u > peak) peak = u;
      }, 100);

      const panel = document.getElementById('sl-results-panel');
      panel.style.display = 'none';
      const t0 = performance.now();
      document.getElementById('sl-run').click();
      try {
        await waitFor(() => panel.style.display !== 'none');
      } catch (e) {
        clearInterval(sampler);
        log(`tickers=${nT}: DID NOT COMPLETE (${e.message}), peak ${MB(peak)}`);
        continue;
      }
      const ms = performance.now() - t0;
      clearInterval(sampler);

      const sc = T.sigCache;
      const specs = sc.store.specs.n, rows = sc.store.n, days = sc.win.len;
      const work = specs * sc.tgt.length * days;
      log(`tickers=${nT} specs=${specs.toLocaleString()} rows=${rows.toLocaleString()} ` +
          `days=${days} | peak heap ${MB(peak)} | ${(ms / 1000).toFixed(1)}s unthrottled | ` +
          `${(ms * 1e6 / work).toFixed(2)} ns per spec-target-day | ` +
          `${(peak / specs).toFixed(1)} bytes per spec`);
    }

    log('DONE');
    const p = document.createElement('pre');
    p.id = 'HARNESS'; p.textContent = OUT.join('\n');
    document.body.appendChild(p);
  }

  main().catch(e => {
    const p = document.createElement('pre');
    p.id = 'HARNESS';
    p.textContent = 'HARNESS EXCEPTION: ' + (e && e.message) + '\n' + (e && e.stack) + '\n' + OUT.join('\n');
    document.body.appendChild(p);
  });
})();
