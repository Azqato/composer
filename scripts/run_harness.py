# -*- coding: utf-8 -*-
"""Run one of the Signal Miner headless-Edge harnesses.

    python scripts/run_harness.py verify      # spec lockstep + dual-path equality
    python scripts/run_harness.py live        # end-to-end run, window, rendering
    python scripts/run_harness.py inertness   # cross-ticker operand degeneracy
    python scripts/run_harness.py memory      # peak heap and throughput
    python scripts/run_harness.py all         # verify + live (the two gates)

`verify` and `live` are the two that gate a change to signal-miner.html. The
other two are measurement tools, run when a number in docs/PRD.md needs
re-establishing rather than on every edit.

Exits non-zero if a harness reports a failure, so this is CI-shaped.

See scripts/harness/_edge.py for the four traps this all rests on, and
scripts/harness/README.md for what each harness actually checks.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'harness'))
import _edge  # noqa: E402

HARNESSES = {
    'verify':    dict(driver='verify_specs.js', timeout=1200),
    'live':      dict(driver='live_run.js', timeout=1800),
    'inertness': dict(driver='inertness.js', timeout=1800),
    'memory':    dict(driver='memory.js', timeout=3600,
                      flags=('--enable-precise-memory-info',)),
}

GATES = ['verify', 'live']


def one(name):
    cfg = dict(HARNESSES[name])
    driver = cfg.pop('driver')
    print('=' * 70)
    print(name)
    print('=' * 70)
    txt = _edge.run(driver, profile=name, **cfg)
    print(txt)
    bad = ('FAIL' in txt or 'EXCEPTION' in txt or 'NO HARNESS OUTPUT' in txt
           or not ('ALL CHECKS PASSED' in txt or 'DONE' in txt))
    print(('FAILED: ' if bad else 'ok: ') + name)
    return not bad


def main():
    which = sys.argv[1] if len(sys.argv) > 1 else 'all'
    names = GATES if which == 'all' else [which]
    for n in names:
        if n not in HARNESSES:
            raise SystemExit('unknown harness %r; pick from %s or "all"'
                             % (n, ', '.join(sorted(HARNESSES))))
    ok = True
    for n in names:
        ok = one(n) and ok
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
