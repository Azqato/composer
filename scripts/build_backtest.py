"""Build the Composer Atlas Backtester clone (backtest-src/) into backtest/index.html.

Usage: python scripts/build_backtest.py   (runs `npm run build` in backtest-src/ first)

backtest-src/ is an independent clone of the Backtester repo, taken 2026-11-03 at commit
c9aa3f4. It is edited here, not synced. See PRD "The Backtester Clone".
Fails if the page would come within 2 MiB of Cloudflare's 25 MiB per-file limit.
"""
import subprocess
import sys
from pathlib import Path

ATLAS = Path(__file__).resolve().parent.parent
SRC_DIR = ATLAS / "backtest-src"
BUILT = SRC_DIR / "dist" / "backtester.html"
DST = ATLAS / "backtest" / "index.html"
BUDGET = 23 * 1024 * 1024


def main():
    subprocess.run("npm run build", cwd=SRC_DIR, shell=True, check=True)
    out = BUILT.read_text(encoding="utf-8").replace(
        "<head>", "<head>\n    <!-- Built from backtest-src/ by scripts/build_backtest.py. Do not edit here. -->", 1)
    size = len(out.encode("utf-8"))
    if size > BUDGET:
        sys.exit("Page is %.2f MiB, over the 23 MiB budget." % (size / 2**20))
    DST.write_text(out, encoding="utf-8", newline="")
    print("Built backtest/index.html (%.2f MiB)" % (size / 2**20))


if __name__ == "__main__":
    main()
