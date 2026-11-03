"""Copy the Backtester's single-file build into Composer Atlas at /backtest/.

Usage: python scripts/sync_backtester.py
Process (PRD "Backtester Page"): build the Backtester repo's committed main first
(`npm run build` there, never edit or commit it), then run this.

It stamps the source commit into the page, refuses a dirty Backtester tree, and
fails if the file would come within 2 MiB of Cloudflare's 25 MiB per-file limit.
"""
import subprocess
import sys
from datetime import date
from pathlib import Path

ATLAS = Path(__file__).resolve().parent.parent
BT = ATLAS.parent / "Backtester"
SRC = BT / "dist" / "backtester.html"
DST = ATLAS / "backtest" / "index.html"
BUDGET = 23 * 1024 * 1024


def git(*args):
    return subprocess.run(["git", "-C", str(BT), *args], capture_output=True,
                          text=True, check=True).stdout.strip()


def main():
    if git("status", "--porcelain"):
        sys.exit("Backtester has uncommitted changes; sync only committed main.")
    if not SRC.exists():
        sys.exit("No build found; run `npm run build` in the Backtester repo.")
    commit = git("rev-parse", "--short", "HEAD")
    html = SRC.read_text(encoding="utf-8")
    if SRC.stat().st_mtime < float(git("log", "-1", "--format=%ct")):
        sys.exit("Build is older than the last Backtester commit; rebuild first.")
    stamp = "<!-- Synced from Backtester %s on %s by scripts/sync_backtester.py. Do not edit here. -->" % (
        commit, date.today().isoformat())
    out = html.replace("<head>", "<head>\n    " + stamp, 1)
    size = len(out.encode("utf-8"))
    if size > BUDGET:
        sys.exit("Page is %.2f MiB, over the 23 MiB sync budget." % (size / 2**20))
    DST.parent.mkdir(exist_ok=True)
    DST.write_text(out, encoding="utf-8", newline="")
    print("Synced Backtester %s -> backtest/index.html (%.2f MiB)" % (commit, size / 2**20))


if __name__ == "__main__":
    main()
