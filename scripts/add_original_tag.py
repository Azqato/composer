#!/usr/bin/env python3
"""
add_original_tag.py: One-time script that renames the three non-Holy-Grail
"original" source strategies to include an "(Original)" suffix (matching the
existing holy-grail naming convention), adds the 'original' glossary entry,
and applies the 'original' tag to all 4 source strategies that zoop's suite
strategies were adapted from.

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
    "description": "Marks a strategy as an independent, non-zoop source symphony that one or more of zoop's suite strategies were adapted from.",
    "formula": None,
    "related_tags": ["original"],
    "last_updated": "2026-07-06",
    "sections": [
        {
            "title": "What 'Original' Means",
            "paragraphs": [
                "The 'Original' tag identifies strategies that are not part of zoop's zoops-* suite, but that directly inspired one of those suite entries. Composer Atlas documents both a source strategy and the zoop-authored adaptation built on top of it, so readers can compare the two side by side.",
                "Four strategies currently carry this tag: The Holy Grail, TQQQ For The Long Term, SOXL Growth, and Simon's KMLM Switcher. Each has a corresponding zoop's suite counterpart (zoop's Holy Grail 2026, zoop's TQQQ For The Long Term 2026, zoop's SOXL Growth 2026, and zoop's KMLM Switcher 2026, respectively) that layers zoop's own risk-management refinements on top of the original logic.",
            ]
        },
        {
            "title": "Why It's Useful",
            "paragraphs": [
                "Tagging these strategies as 'Original' makes the lineage between a source symphony and its zoop-authored adaptation explicit and discoverable, rather than something a reader has to infer from strategy names alone.",
                "See [[zoop]] for more on how the zoops-* suite builds on these source strategies.",
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
