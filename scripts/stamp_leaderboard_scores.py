#!/usr/bin/env python3
"""stamp_leaderboard_scores.py: write the live Leaderboard's rank and score
onto every row of data/database.json. Local only, manual, never in CI.

The scores are taken FROM THE PAGE, not recomputed here. database.html is opened
in headless Edge exactly as the owner opens it locally (file://, so it loads the
full summary), and a driver script reads `rankBySymphonyId`, the map the page
builds from its canonical scoring model for the Screener and strategy pages.
So when the scoring model in database.html changes, the next stamp follows it
with no edit here. That is the point: scripts/analyze_leaderboard.py is a
hand-kept Python mirror of the same engine and can drift; this cannot.

Fields written (PRD Section 12, "Public and Full Database"), on every row,
null for rows outside the Leaderboard pool (flagged, or never backtested):
  leaderboard_rank       1 = top of the canonical model
  leaderboard_score      unrounded, as the page ranks it
  leaderboard_scored_at  ISO date of this stamp
Numbers only, by the owner's choice: the letter tier is a public display, the
page derives it itself, and it is not stored here.

They live in database.json only: export_summary.py drops them from the
summaries and strips them from the committed public slice.

Used by `refresh_full_database.py --priority`. Scores are percentiles across the
pool, so they are a snapshot: re-stamp after each export_summary.py run.

    python scripts/stamp_leaderboard_scores.py
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import date
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parent / "harness"))
import public_database as pdb  # noqa: E402
from _edge import edge_path  # noqa: E402  (Edge only, never Chrome)

PAGE = BASE_DIR / "database.html"
FULL_JSON = BASE_DIR / "data" / "database.json"
SUMMARY_FULL = BASE_DIR / "data" / "database_summary_full.json"

# Runs after the page's own scripts. Waits for the ranking, then reports it in a
# <pre> that --dump-dom carries out. Timeouts are effectively infinite because
# virtual time races ahead of real time (docs/PRD.md, headless harness notes).
DRIVER = r"""
<script>
(function poll() {
  var ready = typeof rankBySymphonyId !== 'undefined' && rankBySymphonyId.size > 0;
  if (!ready) { setTimeout(poll, 50); return; }
  var rows = [];
  rankBySymphonyId.forEach(function (v, id) { rows.push([id, v.rank, v.score]); });
  var pre = document.createElement('pre');
  pre.id = 'LBSTAMP';
  pre.textContent = JSON.stringify({ model: CANONICAL_MODEL.id, rows: rows });
  document.body.appendChild(pre);
})();
</script>
"""


def scores_from_page():
    src = PAGE.read_text(encoding="utf-8")
    if src.count("</body>") != 1 or "rankBySymphonyId" not in src or "CANONICAL_MODEL" not in src:
        raise SystemExit("database.html changed shape: rankBySymphonyId / CANONICAL_MODEL / </body> "
                         "not found as expected. Update DRIVER in this script.")
    # The copy lives in a temp folder; <base> points its relative data/ and js/
    # paths back at the repo, so nothing is written into the working tree.
    base = PAGE.parent.as_uri() + "/"
    src = src.replace("<head>", f'<head><base href="{base}">', 1)
    src = src.replace("</body>", DRIVER + "</body>")
    tmp = tempfile.mkdtemp(prefix="composer-lbstamp-")
    html = Path(tmp) / "database_stamp.html"
    html.write_text(src, encoding="utf-8")
    prof = Path(tmp) / "profile"
    argv = [edge_path(), "--headless=new", "--disable-gpu", "--no-sandbox",
            "--virtual-time-budget=2000000000", f"--user-data-dir={prof}",
            "--disable-sync", "--disable-component-update",  # trap 13, see harness/_edge.py
            "--dump-dom", html.as_uri()]
    try:
        dom = subprocess.run(argv, capture_output=True, timeout=600).stdout.decode("utf-8", "replace")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    m = re.search(r'<pre id="LBSTAMP">(.*?)</pre>', dom, re.S)
    if not m:
        raise SystemExit("No scores came back from the page (it threw, or never built its ranking). "
                         "Open database.html locally and check the Leaderboard renders.")
    txt = m.group(1).replace("&quot;", '"').replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&")
    return json.loads(txt)


def main():
    if SUMMARY_FULL.exists() and SUMMARY_FULL.stat().st_mtime < FULL_JSON.stat().st_mtime:
        print("note: database.json is newer than database_summary_full.json, and the page scores the "
              "summary. Run scripts/export_summary.py first for scores that include the latest refresh.")
    got = scores_from_page()
    by_id = {sid: (rank, score) for sid, rank, score in got["rows"]}

    entries = pdb.load(FULL_JSON)
    known = {e.get("symphony_id") for e in entries}
    stray = [sid for sid in by_id if sid not in known]
    if stray:
        raise SystemExit(f"{len(stray)} scored id(s) are not in database.json (summary out of step?): {stray[:5]}")

    today = date.today().isoformat()
    for e in entries:
        rank, score = by_id.get(e.get("symphony_id"), (None, None))
        e.pop("leaderboard_tier", None)  # stored briefly on 2026-11-24, dropped by owner's choice
        e["leaderboard_rank"] = rank
        e["leaderboard_score"] = score
        e["leaderboard_scored_at"] = today if rank is not None else None
    pdb.write_database(FULL_JSON, entries)

    scores = sorted((s for _r, s in by_id.values()), reverse=True)
    print(f"Stamped {len(by_id)} of {len(entries)} rows from the '{got['model']}' model "
          f"(score {scores[0]:.1f} at rank 1, {scores[-1]:.1f} at rank {len(scores)}).")


if __name__ == "__main__":
    main()
