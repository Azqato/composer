# PRD.MD - Product Requirements Document
# ComposerAtlas

**Version:** 1.1
**Status:** Active
**Last Updated:** 2026-06-08

---

## Overview

ComposerAtlas is a browser-only, static website that serves as a curated strategy library and educational reference hub for Composer.trade users and systematic investing enthusiasts. It showcases user-provided Composer symphonies, explains their logic in plain language, and educates visitors on the underlying signals and concepts.

---

## Problem Statement

Retail investors interested in rules-based, systematic investing lack a central, accessible resource that:
- Aggregates and explains Composer.trade strategies in plain language
- Bridges the gap between raw quant concepts and practical application
- Provides transparent breakdowns of strategy logic, not just backtest returns

---

## Goals

- Launch a public-facing MVP with 12 strategy pages and a concept glossary
- Require zero server infrastructure; run entirely in the browser via GitHub Pages
- Establish a scalable JSON-based strategy database that can grow to thousands of entries
- Generate passive revenue via Google AdSense (post-MVP) and direct user donations

---

## Non-Goals (MVP)

- No user accounts or authentication
- No community features or comments
- No newsletter or email capture at launch
- No scripted or automated metric updates (manual commits only for MVP)
- No mobile app

---

## Target Users

**Primary:** Self-directed retail investors who use or are considering Composer.trade
**Secondary:** Intermediate traders learning RSI, momentum, VIX strategies, and leveraged ETF mechanics
**Tertiary:** Quant-curious beginners who want educational breakdowns of systematic strategies

---

## Features

### MVP (V1.0)

#### Strategy Library
- Index page listing all available strategies with key metrics at a glance
- Each strategy has a dedicated page containing:
  - Strategy name and description
  - Link to clone on Composer.trade (symphony_url)
  - Logic breakdown in plain English
  - Key metrics table (see METRICS.MD for full schema)
  - Explanation of signals used (cross-linked to glossary)
  - Risk profile summary

#### Concept Glossary
- Dedicated pages for each core investing concept:
  - RSI (Relative Strength Index)
  - 200-Day Moving Average
  - Momentum Investing
  - VIX Tiers
  - Leveraged ETFs (TQQQ, UPRO, SOXL, etc.)
  - Calmar Ratio
  - Sharpe Ratio
  - Max Drawdown
  - Additional concepts as needed
- Each glossary page cross-links to strategies that use that concept

#### Data Layer
- `/data/strategies.json` serves as the flat-file database
- All strategy metrics and metadata stored in JSON
- JavaScript fetches and renders data at runtime
- Schema is extensible for future metric additions
- Updated via GitHub commit for MVP; script-based updates planned for future

#### Monetization
- Donation link: [https://azqato.github.io/support.html](https://azqato.github.io/support.html)
- Google AdSense: integrated post-MVP

#### Navigation
- Top-level nav: Strategies, Glossary, About, Support
- Strategy pages include breadcrumb navigation
- Glossary cross-links to relevant strategy pages and vice versa

---

## Post-MVP Backlog (V2+)

- Script-based JSON update workflow for strategy metrics
- Search and filter on strategy index page
- Strategy comparison tool
- Performance chart visualizations per strategy
- Community submission form for new strategies
- Newsletter / Substack integration
- Tag-based filtering (e.g., filter by signal type, asset class)

---

## Success Metrics

- 12 strategy pages live at launch
- Full glossary live at launch
- Page load time under 2 seconds on desktop
- Zero server costs at launch
- At least 1 donation received in first 30 days (qualitative validation)

---

## Constraints

- Must run entirely in browser with no server infrastructure
- Must host on GitHub Pages (github.io subdomain)
- Must use a static JSON file as the data source
- Must be maintainable by a single developer

---

## Dependencies

- Composer.trade (external platform; strategy links depend on their availability)
- GitHub Pages (hosting)
- Vanilla HTML/CSS/JavaScript — zero build dependencies; no npm/Node.js required

---

## Content Notes (Pending Placement)

The following items are queued for inclusion in the site as best practices, FAQ entries, or educational callouts. Exact placement TBD.

### Strategy Building Best Practices

- **Avoid short lookback periods to prevent overfitting:** Do not use checks shorter than 10 days (e.g., `1d`). Very short windows cause the algorithm to be extremely twitchy and will not match the backtest in out-of-sample (OOS) performance.
