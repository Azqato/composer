#!/usr/bin/env python3
"""
add_original_tag.py: One-time script that renames the three non-Holy-Grail
"original" source strategies to include an "(Original)" suffix (matching the
existing holy-grail naming convention), adds the 'original' glossary entry,
and applies the 'original' tag to all 4 strategies that document a
baseline, unmodified version of their logic alongside a remixed edition
elsewhere in the library.

Usage:
    python scripts/add_original_tag.py
"""

import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
GLOSSARY_JSON = BASE_DIR / "data" / "glossary.json"
GLOSSARY_JS = BASE_DIR / "data" / "glossary.js"
STRATEGIES_JSON = BASE_DIR / "data" / "strategies.json"
STRATEGIES_JS = BASE_DIR / "data" / "strategies.js"

RENAMES = {
    "tqqq-long-term": "TQQQ For The Long Term (Original)",
    "soxl-growth-rl": "SOXL Growth (Original)",
    "simons-kmlm-switcher": "Simon's KMLM Switcher (Original)",
}

ORIGINAL_SLUGS = [
    "holy-grail",
    "tqqq-long-term",
    "soxl-growth-rl",
    "simons-kmlm-switcher",
]

ORIGINAL_ENTRY = {
    "slug": "original",
    "name": "Original Strategies",
    "category": "strategy-concept",
    "description": "Marks a strategy as the original, unmodified version of its logic, before later editions remixed it with additional layers like frontrunner dip-buys or extra risk checks.",
    "formula": None,
    "related_tags": ["original"],
    "last_updated": "2026-07-06",
    "sections": [
        {
            "title": "What 'Original' Means",
            "paragraphs": [
                "The 'Original' tag marks a strategy as the baseline, unmodified version of its trading logic, the form it took before anyone layered additional conditions on top of it. Later editions of the same strategy often add things the original build never had: a frontrunner-style RSI dip-buy layer, extra overbought or volatility guards, additional asset legs, or tighter regime-detection rules. The original entry is what the strategy looked like before any of that was added.",
                "Four strategies currently carry this tag: The Holy Grail, TQQQ For The Long Term, SOXL Growth, and Simon's KMLM Switcher. Each also has a remixed edition elsewhere in this library that builds on the original by adding its own dip-buy layers and risk-management refinements.",
            ]
        },
        {
            "title": "Why It's Useful",
            "paragraphs": [
                "Keeping the original version documented alongside its remixed edition lets readers see exactly what changed and why: which conditions were added, which assets were introduced, and how those additions affected the backtested metrics. Without the original for comparison, it's easy to assume a strategy's full rule set was there from the start, when in practice much of the risk management was added later.",
                "This also makes it easier to evaluate a modification on its own merits. If a remixed edition outperforms the original, the 'Original' tag lets a reader trace that improvement back to a specific added layer rather than crediting the strategy's core logic for gains that came from a later addition.",
            ]
        }
    ]
}


def main():
    glossary = json.loads(GLOSSARY_JSON.read_text(encoding="utf-8"))

    if not any(e["slug"] == "original" for e in glossary):
        glossary.append(ORIGINAL_ENTRY)
        GLOSSARY_JSON.write_text(
            json.dumps(glossary, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"glossary.json: {len(glossary)} entries")

        content = GLOSSARY_JSON.read_text(encoding="utf-8")
        js = (
            "// To update content: edit this file and data/glossary.json in sync.\n"
            f"window.GLOSSARY_DATA = {content.rstrip()};\n"
        )
        GLOSSARY_JS.write_text(js, encoding="utf-8")
        print("glossary.js written")
    else:
        print("original slug already exists in glossary, skipping glossary write")

    strategies = json.loads(STRATEGIES_JSON.read_text(encoding="utf-8"))
    slug_map = {s["slug"]: i for i, s in enumerate(strategies)}

    for slug, new_name in RENAMES.items():
        if slug not in slug_map:
            print(f"WARNING: strategy slug not found: {slug}")
            continue
        strategies[slug_map[slug]]["name"] = new_name
        print(f"Renamed {slug} -> {new_name}")

    for slug in ORIGINAL_SLUGS:
        if slug not in slug_map:
            print(f"WARNING: strategy slug not found: {slug}")
            continue
        tags = strategies[slug_map[slug]].setdefault("tags", [])
        if "original" not in tags:
            tags.append("original")
            print(f"Added original tag to {slug}")

    STRATEGIES_JSON.write_text(
        json.dumps(strategies, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print("strategies.json written")

    header = STRATEGIES_JS.read_text(encoding="utf-8").split("\n")[0:2]
    s_content = STRATEGIES_JSON.read_text(encoding="utf-8")
    s_js = "\n".join(header) + "\nwindow.STRATEGIES_DATA = " + s_content.rstrip() + ";\n"
    STRATEGIES_JS.write_text(s_js, encoding="utf-8")
    print("strategies.js written")


if __name__ == "__main__":
    main()
