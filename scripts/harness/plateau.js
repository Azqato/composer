/* Parameter plateau scoring (V2.2 item A).

   The plateau columns are a diagnostic, which makes them exactly the kind of
   feature that can be wrong for months without anyone noticing: nothing
   downstream consumes them, so a bad number has no second symptom. Everything
   below is therefore an INDEPENDENT recomputation, not a re-reading of what
   the page already decided.

   What it proves:
     1. Every row on screen either has both plateau cells or neither, and a
        combined AND row has neither, by design.
     2. The plateau endpoints really score inside the band, and the neighbour
        one step past each endpoint really does not (or is genuinely off the
        lattice). This is the whole claim the column makes.
     3. The neighbourhood median lies inside the range of the values it is a
        median of, and is drawn from the row plus its scored neighbours.
     4. No neighbour spec violates the canonical p1 < p2 rule that pushCmpSpecs
        enforces on same-ticker comparisons, so the ring never scores a spec
        the run itself would refuse to build.
     5. Window neighbours come from the RUN'S ACTIVE grid, not from WINDOWS.
        A min-period floor removes windows from the lattice and the ring must
        move with it.
     6. Neighbours are re-evaluated, not read out of the Pass 1 store: a losing
        neighbour must appear as a low number that breaks the plateau, and the
        store cannot supply one because it never kept it.
     7. The whole pass costs what the comment claims it costs.
*/
(function () {
  const OUT = [];
  const log = m => OUT.push(m);
  let fails = 0;
  const chk = (ok, msg) => { if (!ok) { fails++; log('FAIL ' + msg); } else log('ok   ' + msg); };

  window.confirm = () => true;

  function waitFor(fn, ms) {
    return new Promise((res, rej) => {
      const t0 = Date.now();
      (function tick() {
        let v; try { v = fn(); } catch (e) { return rej(e); }
        if (v) return res(v);
        if (Date.now() - t0 > ms) return rej(new Error('timeout: ' + fn));
        setTimeout(tick, 25);
      })();
    });
  }

  async function main() {
    await waitFor(() => window.__t && window.__t.PD && document.getElementById('sl-run'), 60000);
    const T = window.__t;
    document.getElementById('sl-cpu').value = 'max';

    // A min-period floor of 12 is deliberate: it drops 5, 7 and 10 from the
    // grid, so check 5 below is a real test rather than a tautology.
    const MINP = 12;
    T.targets.clear(); ['QQQ'].forEach(s => T.targets.add(s));
    T.compares.clear(); ['SPY', 'QQQ', 'TLT'].forEach(s => T.compares.add(s));
    document.getElementById('sl-minp').value = String(MINP);
    // Pairing OFF for the main pass. At the shipped setting the top 100 is 99
    // combined rows and one single, so every single-row assertion below would
    // rest on a sample of one and prove almost nothing. The combined-row case
    // is checked separately at the end, where pairing is turned back on.
    document.getElementById('sl-combo').value = '1';
    T.syncChips();

    const panel = document.getElementById('sl-results-panel');
    panel.style.display = 'none';
    document.getElementById('sl-run').click();
    await waitFor(() => panel.style.display !== 'none', 900000);
    await waitFor(() => document.querySelectorAll('#sl-body tr').length, 120000);

    const sc = T.sigCache;
    const W = sc.W;
    chk(Array.isArray(W) && W.length > 0, 'sigCache carries the run active window grid W');
    chk(W.every(p => p >= MINP), `W is filtered by the min period: [${W.join(', ')}]`);
    chk(W.indexOf(5) === -1 && W.indexOf(10) === -1,
        'W really did lose 5 and 10, so the window-lattice checks are not vacuous');

    // ---- 1. every displayed row is scored, or explicitly is not ----
    const rows = T.selectTop(T.lastResults, T.DISPLAY_CAP, T.sortKey, false, '').rows;
    const metric = T.plateauMetric();
    log(`ranking metric: ${metric}; ${rows.length} rows on screen`);

    let singles = 0, combos = 0, scored = 0, comboScored = 0;
    for (const r of rows) {
      const pl = T.plateauFor(r, metric);
      if (r.single) { singles++; if (pl) scored++; } else { combos++; if (pl) comboScored++; }
    }
    chk(singles > 20, `${singles} single rows on screen (pairing off, so the sample is singles)`);
    chk(scored === singles, `every single row scored: ${scored} of ${singles}`);
    chk(comboScored === 0, `${combos} combined rows on screen, ${comboScored} scored`);

    const cells = document.querySelectorAll('#sl-body tr td.plat');
    chk(cells.length === rows.length * 2,
        `${cells.length} plateau cells rendered for ${rows.length} rows (two each)`);

    // ---- the independent recomputation ----
    // Rebuilt here rather than imported, so a bug in the page's own scorer
    // cannot hide inside the check that is supposed to catch it.
    function scoreOf(spec, target) {
      const [L, R] = T.leftRight(spec, sc.cache);
      const arr = new Uint8Array(T.N);
      const scalarR = typeof R === 'number';
      const gt = spec.dir === 'GT';
      for (let i = 0; i < T.N; i++) {
        const a = L[i];
        const b = scalarR ? R : R[i];
        arr[i] = (a === a && b === b && (gt ? a > b : a < b)) ? 1 : 0;
      }
      const m = T.backtest(arr, sc.targetLret[target], sc.win.s0, sc.win.len);
      return m[metric];
    }

    // ---- 2. the endpoints hold and the step past them does not ----
    // Parsed back out of the rendered text on purpose: what the reader is told
    // is what gets checked, not an internal the reader never sees.
    let checkedEnds = 0, endHold = 0, endBreak = 0, endEdge = 0, endRing = 0;
    let checkedMed = 0;

    for (const r of rows) {
      if (!r.single) continue;
      const pl = T.plateauFor(r, metric);
      if (!pl) continue;
      const self = r[metric];
      const floor = self - T.PLATEAU_DROP * Math.abs(self);
      const f = T.FAM[r.spec.f];

      // Level axis where there is one, otherwise the first window axis. This
      // mirrors what the cell quotes for the single-window families; for cmp
      // the cell may quote the tighter axis, so both are walked.
      const axes = [];
      const lm = T.levelMover(r.spec);
      if (lm) axes.push({ kind: 'level', move: lm.move, radius: T.PLATEAU_LVL_RADIUS });
      for (const slot of (f.kind === 'cmp' ? ['p1', 'p2'] : ['p1'])) {
        const mv = T.windowMover(r.spec, slot);
        if (mv) axes.push({ kind: slot, move: mv, radius: T.PLATEAU_WIN_RADIUS });
      }

      for (const a of axes) {
        // Walk outward exactly as the page does, but with our own scorer.
        for (const dir of [-1, 1]) {
          let n = 0, stop = 'break';
          while (n < a.radius) {
            const sp = a.move(dir * (n + 1));
            if (!sp) { stop = 'edge'; break; }
            const v = scoreOf(sp, r.target);
            if (v !== v || v < floor) break;
            n++;
          }
          // Same rule the page uses: holding all the way out is only "may run
          // wider" if there is lattice left to run into.
          if (n === a.radius && stop === 'break') {
            stop = a.move(dir * (a.radius + 1)) ? 'ring' : 'edge';
          }

          // Every step INSIDE the run must hold. This is the claim.
          for (let k = 1; k <= n; k++) {
            const sp = a.move(dir * k);
            const v = scoreOf(sp, r.target);
            if (!(v >= floor)) { fails++; log(`FAIL ${a.kind} step ${dir * k} of "${r.label}" is ${v}, below floor ${floor}`); }
            else endHold++;
          }
          // And the step just past it must not, unless the lattice ended.
          const past = a.move(dir * (n + 1));
          if (stop === 'edge') { endEdge++; }
          else if (stop === 'ring') { endRing++; }
          else {
            const v = scoreOf(past, r.target);
            if (v === v && v >= floor) { fails++; log(`FAIL ${a.kind} plateau of "${r.label}" stopped early: step ${dir * (n + 1)} scores ${v} >= floor ${floor}`); }
            else endBreak++;
          }
          checkedEnds++;

          // ---- 4. no neighbour breaks the canonical same-ticker rule ----
          if (f.kind === 'cmp' && r.spec.t1 === r.spec.t2) {
            for (let k = 1; k <= a.radius; k++) {
              const sp = a.move(dir * k);
              if (sp && !(sp.p1 < sp.p2)) {
                fails++; log(`FAIL same-ticker neighbour p1=${sp.p1} p2=${sp.p2} violates p1 < p2`);
              }
            }
          }
          // ---- 5. window neighbours come from the active grid ----
          if (a.kind !== 'level') {
            for (let k = 1; k <= a.radius; k++) {
              const sp = a.move(dir * k);
              if (sp && W.indexOf(a.kind === 'p2' ? sp.p2 : sp.p1) === -1) {
                fails++; log(`FAIL window neighbour ${a.kind}=${a.kind === 'p2' ? sp.p2 : sp.p1} is not in the active grid`);
              }
            }
          }
        }
      }

      // ---- 3. the median is a median of real values ----
      const pool = [self];
      for (const a of axes) {
        const rad = a.kind === 'level' ? 2 : 1;
        for (let k = -rad; k <= rad; k++) {
          if (!k) continue;
          const sp = a.move(k);
          if (!sp) continue;
          const v = scoreOf(sp, r.target);
          if (v === v) pool.push(v);
        }
      }
      pool.sort((x, y) => x - y);
      const h = pool.length >> 1;
      const want = pool.length % 2 ? pool[h] : (pool[h - 1] + pool[h]) / 2;
      if (Math.abs(want - pl.med) > 1e-9) {
        fails++; log(`FAIL median for "${r.label}": page ${pl.med}, recomputed ${want} over ${pool.length} values`);
      } else checkedMed++;
      if (!(pl.med >= pool[0] - 1e-9 && pl.med <= pool[pool.length - 1] + 1e-9)) {
        fails++; log(`FAIL median ${pl.med} is outside [${pool[0]}, ${pool[pool.length - 1]}]`);
      }
    }

    chk(fails === 0 || true, `walked ${checkedEnds} plateau ends across ${singles} rows`);
    chk(endHold > 0, `${endHold} in-band steps verified against an independent backtest`);
    chk(endBreak + endEdge + endRing === checkedEnds,
        `every end accounted for: ${endBreak} genuine breaks, ${endEdge} lattice edges, ${endRing} still holding at the search radius`);
    chk(checkedMed === scored, `${checkedMed} neighbourhood medians reproduced exactly`);

    // ---- 6. the ring evaluates, it does not look up ----
    // The Pass 1 store keeps only specs with total > 0 and finite Sortino and
    // Calmar. So if the scorer can return a value for a spec that loses, it
    // cannot be reading the store. The far end of a level grid is a reliable
    // source of those: RSI < 2 never fires, and a signal that never fires has
    // a total of exactly 0, which the store would have thrown away.
    let losers = 0, probed = 0, holesSeen = 0;
    for (const r of rows) {
      if (!r.single) continue;
      const lm = T.levelMover(r.spec);
      if (!lm) continue;
      for (const j of [0, lm.grid.length - 1]) {
        const sp = Object.assign({}, r.spec, { level: lm.grid[j] });
        const m = T.plateauScore(sp, r.target);
        probed++;
        if (!m) { holesSeen++; continue; }
        if (!(m.total > 0) || m.sortino !== m.sortino || m.calmar !== m.calmar) losers++;
      }
      if (probed >= 40) break;
    }
    chk(probed > 0, `${probed} grid-extreme neighbours probed`);
    chk(losers > 0,
        `${losers} of them are specs Pass 1 discarded, and the ring scored them anyway: ` +
        `these values are re-evaluated, not read out of the store`);
    log(`     ${holesSeen} unscorable neighbours seen, counted as holes rather than as zeros`);

    // ---- 7. cost ----
    // Second pass, so the memo is warm. The first pass above is the cold one.
    const t0 = performance.now();
    let n = 0;
    for (const r of rows) { if (T.plateauFor(r, metric)) n++; }
    const warm = performance.now() - t0;
    log(`     ${n} memoised lookups in ${warm.toFixed(1)}ms`);
    chk(warm < 50, `a re-render costs ${warm.toFixed(1)}ms once memoised`);

    // ---- distribution, which is the point of shipping the diagnostic first ----
    // The roadmap entry says to look at what plateau widths real runs produce
    // before choosing band widths or re-ranking on the neighbourhood. This is
    // that measurement, printed rather than asserted.
    const widths = {}, ratios = [];
    let ringBound = 0, edgeBound = 0, ends = 0;
    for (const r of rows) {
      if (!r.single) continue;
      const pl = T.plateauFor(r, metric);
      if (!pl) continue;
      widths[pl.steps] = (widths[pl.steps] || 0) + 1;
      if (r[metric]) ratios.push(pl.med / r[metric]);
      ringBound += (pl.title.match(/still holding at the edge of the search/g) || []).length;
      edgeBound += (pl.title.match(/stops at the end of the grid/g) || []).length;
      ends += (pl.title.match(/side (?:ends|stops|still)/g) || []).length;
    }
    chk(ringBound === endRing && edgeBound === endEdge && ends === checkedEnds,
        `the page's own account of every axis end matches the independent walk: ` +
        `${ringBound}/${endRing} at the search radius, ${edgeBound}/${endEdge} at the grid edge, ` +
        `${ends}/${checkedEnds} ends`);

    ratios.sort((a, b) => a - b);
    const q = p => ratios[Math.min(ratios.length - 1, Math.floor(p * ratios.length))];
    log('measurement, quoted rather than asserted:');
    log('     plateau width (steps on the quoted axis): ' +
        Object.keys(widths).sort((a, b) => a - b).map(k => k + ' -> ' + widths[k] + ' rows').join(', '));
    log(`     neighbourhood median as a fraction of the row's own ${metric}: ` +
        `p10 ${q(0.1).toFixed(2)}, median ${q(0.5).toFixed(2)}, p90 ${q(0.9).toFixed(2)}`);
    log(`     ${ringBound} axis ends were still holding at the search radius and ` +
        `${edgeBound} ran off the lattice, out of ${ends} ends`);

    // ---- one worked example, for the record ----
    const ex = rows.find(r => r.single && T.FAM[r.spec.f].kind === 'lvl');
    if (ex) {
      const pl = T.plateauFor(ex, metric);
      log('example: ' + ex.label + '  ->  ' + ex.target);
      log(`     ${metric} ${ex[metric].toFixed(3)}, nbhd median ${pl.med.toFixed(3)}, plateau ${pl.text}`);
      log('     ' + pl.title.replace(/\n/g, '\n     '));
    }

    // ---- 8. pairing back on: combined rows report nothing, and say why ----
    document.getElementById('sl-combo').value = '2';
    document.getElementById('sl-combo').dispatchEvent(new Event('change'));
    await waitFor(() => T.lastResults.count > 0 &&
                        T.selectTop(T.lastResults, T.DISPLAY_CAP, T.sortKey, false, '')
                         .rows.some(r => !r.single), 300000);
    const mixed = T.selectTop(T.lastResults, T.DISPLAY_CAP, T.sortKey, false, '').rows;
    const nCombo = mixed.filter(r => !r.single).length;
    chk(nCombo > 0, `${nCombo} combined rows present once pairing is on`);
    chk(mixed.filter(r => !r.single).every(r => T.plateauFor(r, metric) === null),
        'every combined row reports no plateau at all');
    await waitFor(() => {
      const tds = document.querySelectorAll('#sl-body tr td.plat');
      return tds.length && [...tds].some(td => /single signals only/.test(td.innerHTML));
    }, 60000).then(() => chk(true, 'the empty cell explains itself rather than showing a bare dash'))
             .catch(() => chk(false, 'the empty cell explains itself rather than showing a bare dash'));

    log(fails ? `*** ${fails} FAILURES ***` : 'ALL CHECKS PASSED');
    const d = document.createElement('pre');
    d.id = 'HARNESS'; d.textContent = OUT.join('\n');
    document.body.appendChild(d);
  }

  main().catch(e => {
    const d = document.createElement('pre');
    d.id = 'HARNESS';
    d.textContent = 'HARNESS EXCEPTION: ' + (e && e.message) + '\n' + (e && e.stack) + '\n' + OUT.join('\n');
    document.body.appendChild(d);
  });
})();
