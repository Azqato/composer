#!/usr/bin/env python3
"""run_full_refresh.py: the owner's whole local full-database refresh, in order.
Local only (needs data/database.json), manual, never in CI. Does not commit.

The order is forced by what each step reads:

  1. refresh_full_database.py --priority   database.json (in-sample backtests)
  2. export_summary.py                     summaries <- database.json; merges CI rows back
  3. refresh_oos.py                        picks candidates from the SUMMARY's in-sample
                                           scores, so it must follow step 2
  4. stamp_leaderboard_scores.py           the page's score gives 35 of 100 points to
                                           out-of-sample, so it must follow step 3
  5. build_strategy_extras.py              reads database.json
  6. build_overfit.py                      reads the summary and oos_full
  7. check_database_keys.py                the deploy gate; must PASS before committing

The GitHub workflows are unchanged: they still refresh the public set on their
own days (docs/PRD.md Section 11). Both API steps keep the proven 2-second pause.
Expect about 5 hours for step 1 and about 3 for step 3 when nearly every row is
due (a fresh week of prices makes every out-of-sample row due).

    python scripts/run_full_refresh.py                 # everything
    python scripts/run_full_refresh.py --from export   # resume after a finished step 1
    python scripts/run_full_refresh.py --from stamp    # e.g. after a manual OOS run

A step that exits non-zero stops the routine; rerun with --from that step. Both
API steps checkpoint, so a resumed step picks up where it stopped.
"""
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SCRIPTS = BASE_DIR / "scripts"

# Checkpoints of the two long API steps go here, outside the OneDrive-synced
# repo, so OneDrive uploads each repo file once at the end of its step instead
# of a 20 MB database.json every 30 seconds for hours. Downloads is not synced.
# An interrupted step leaves its checkpoint here and the rerun resumes from it.
SCRATCH = str(Path.home() / "Downloads" / "composer-refresh-work")

STEPS = [
    ("refresh", ["refresh_full_database.py", "--priority", "--scratch", SCRATCH]),
    ("export", ["export_summary.py"]),
    ("oos", ["refresh_oos.py", "--scratch", SCRATCH]),
    ("stamp", ["stamp_leaderboard_scores.py"]),
    ("extras", ["build_strategy_extras.py"]),
    ("overfit", ["build_overfit.py"]),
    ("check", ["check_database_keys.py"]),
]

PUBLIC_FILES = (
    "data/database_public.json data/database_public.js "
    "data/database_summary.json data/database_summary.js "
    "data/oos.json data/oos.js "
    "data/strategy_extras.json data/strategy_extras.js "
    "data/overfit.json data/overfit.js"
)


def stamp():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def main():
    if not (BASE_DIR / "data" / "database.json").exists():
        raise SystemExit("data/database.json not found: this routine is for the owner's machine only.")
    names = [n for n, _ in STEPS]
    start = names[0]
    if "--from" in sys.argv:
        start = sys.argv[sys.argv.index("--from") + 1]
        if start not in names:
            raise SystemExit(f"--from must be one of: {', '.join(names)}")

    began = time.time()
    for name, argv in STEPS[names.index(start):]:
        print(f"\n===== [{stamp()}] step '{name}': {' '.join(argv)} =====", flush=True)
        t = time.time()
        code = subprocess.run([sys.executable, "-u", str(SCRIPTS / argv[0])] + argv[1:],
                              cwd=BASE_DIR).returncode
        print(f"===== [{stamp()}] step '{name}' exited {code} after {(time.time() - t) / 60:.1f} min =====",
              flush=True)
        if code != 0:
            raise SystemExit(f"Stopped at '{name}'. Fix it, then: python scripts/run_full_refresh.py --from {name}")

    print(f"\nAll steps done in {(time.time() - began) / 3600:.1f} h. Nothing was committed. To publish:")
    print(f"  git add {PUBLIC_FILES}")
    print('  git commit -m "data: local full database refresh - YYYY-MM-DD" && git push origin main')


if __name__ == "__main__":
    main()
