#!/usr/bin/env python3
"""
add_ai_summary.py - Adds the `ai_summary` field to every strategy.

The AI Summary is a Claude-authored analysis displayed above the "How It Works"
section on each strategy page. For each strategy, Claude reviews the structure,
assets, signals/logic, performance metrics, and backtest period, then explains
why someone would follow it, the purpose behind its logic, and any noteworthy
characteristics (short backtests, high drawdown, period-dependent returns).

This script writes the `ai_summary` (an array of paragraph strings) into both
`data/strategies.json` and `data/strategies.js`, inserting it immediately before
`how_it_works` so the data file reads in display order. Safe to re-run: it
overwrites any existing `ai_summary` and leaves all other fields untouched.

Usage:
    python scripts/add_ai_summary.py
"""

import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(ROOT, "data", "strategies.json")
JS_PATH = os.path.join(ROOT, "data", "strategies.js")

JS_HEADER = (
    "// Strategies data - loaded as a script tag so the site works with file:// protocol.\n"
    "// To update metrics: run scripts/update_metrics.py\n"
    "window.STRATEGIES_DATA = "
)

# slug -> list of paragraph strings
AI_SUMMARIES = {
    "zoops-2026-frontrunner": [
        "Structurally, the Frontrunner is a cash-first dip-buyer: it parks in T-bills (BIL) by default and only deploys into 3x leveraged ETFs (SOXL, TQQQ, or UPRO) when a fast RSI(10) reading crosses tight oversold thresholds, with semiconductors checked first. A second branch uses XLY and UVXY RSI to rotate into volatility (VXX) or a short (SPXU) when markets overheat. The purpose is to spend most of its time earning risk-free interest and act only at genuine short-term extremes, making each entry deliberate rather than continuous. It is also the 50% base component shared by every other zoop symphony, so understanding it explains half of this library.",
        "Over a roughly 8-year backtest it posts a 91% annualized return with a 22% max drawdown, a notably lower drawdown than the other leveraged zoop strategies precisely because its time-in-market is limited. Its 1.78 Sharpe and 4.23 Calmar reflect that favorable risk-adjusted trade-off. The main caveat is that buying into oversold conditions means individual entries can keep falling before they recover, so the smooth equity curve masks sharp single-trade risk. It best suits an investor who wants systematic dip-buying exposure rather than a constant leveraged allocation.",
    ],
    "zoops-holy-grail-2026": [
        "This is a full-cycle, multi-signal strategy that layers RSI, the 200-day moving average, and volatility filters on top of the shared Frontrunner dip-buy base. The moving-average gate defines the broad regime, RSI handles overbought and oversold timing, and the volatility check routes into hedges when conditions turn turbulent. The intent is to capture leveraged upside in bull trends while using multiple independent confirmations to step aside before the worst of a drawdown, the 'holy grail' being strong compounding that still survives full market cycles.",
        "Across a long 14-year backtest it returns 113% annualized, the result of combining many signals over many regimes. The trade-off is a deep 45% max drawdown and high 54% volatility, marking it as an aggressive leveraged strategy, and the 1.65 Sharpe and 2.53 Calmar are solid but not exceptional for the risk taken. The long backtest is a real strength here: it has been tested through 2018, 2020, and 2022 stress periods rather than a single favorable stretch. It suits investors comfortable holding through large paper losses in pursuit of high long-run growth.",
    ],
    "zoops-tqqq-long-term-2026": [
        "The logic is a long-term TQQQ (3x Nasdaq 100) holding wrapped in systematic safety exits. Rather than buy-and-hold, it uses the 200-day moving average and RSI/volatility checks to step out of leveraged tech before major breakdowns, then re-enter when conditions stabilize, all on top of the shared Frontrunner dip-buy base. It is built for the investor who believes in Nasdaq 100 growth over the long run but cannot stomach the catastrophic, decay-amplified losses that come from holding a 3x ETF unhedged through a bear market.",
        "Over roughly 14 years it compounds at 111% annualized, but the headline risk is a 46% max drawdown and 55% volatility; the safety exits soften the worst leveraged-tech crashes without eliminating them. Its 1.63 Sharpe and 2.40 Calmar are typical for this aggressive cohort. The value proposition is less about beating the other zoop variants and more about converting an un-survivable 3x buy-and-hold into something an investor can actually hold through a cycle.",
    ],
    "zoops-excellent-adventure-2026": [
        "This variant is the most aggressive of the 'rotation' zoops: it dynamically moves across high-momentum leveraged instruments using RSI, 200-day MA, and volatility signals, aiming to always be positioned in whatever is compounding fastest while the Frontrunner base handles dip-buying. The purpose is maximal participation in leveraged momentum, chasing the strongest trend rather than committing to a single ticker like TQQQ or UPRO.",
        "It delivers 122% annualized over roughly 14 years with the best Sharpe (1.82) of the core leveraged zoop variants, meaning its return per unit of risk is comparatively efficient despite a 46% max drawdown and 51% volatility. The long backtest spanning multiple cycles lends credibility. Still, the 'always in the hottest asset' design makes it whipsaw-prone in choppy, trendless markets, and the deep drawdown places it firmly in aggressive territory.",
    ],
    "zoops-sometimes-tqqq-2026": [
        "As the name suggests, this strategy holds TQQQ only when multiple independent signals (RSI, the 200-day MA regime, and volatility filters) simultaneously confirm a favorable entry; otherwise it sits in the defensive Frontrunner base or cash. It is a precision-timing approach: the logic is deliberately selective, trading time-in-market for entry quality, on the thesis that avoiding leveraged exposure during unconfirmed conditions is worth more than capturing every up day.",
        "That selectivity pays off statistically: it records the strongest risk-adjusted profile in the library, a 2.47 Sharpe and 5.22 Calmar, alongside a 182% annualized return and the highest backtested cumulative return here, all over a robust 14-year window. Its 35% max drawdown is meaningfully shallower than the always-in TQQQ variants. The standout characteristic is this efficiency: by being TQQQ 'sometimes' rather than always, it captures much of the upside with materially less of the pain, making it one of the more compelling profiles for risk-aware leveraged investors.",
    ],
    "zoops-safety-checks-2026": [
        "This strategy front-loads multiple pre-position 'safety checks' (RSI extremes, 200-day MA regime, and volatility conditions) that must clear before it commits to a leveraged ETF, otherwise defaulting to the conservative Frontrunner base. The design philosophy is drawdown reduction first: each check is a veto gate intended to keep the strategy out of leveraged positions during the conditions that historically precede large losses, while still compounding strongly over the long run.",
        "Over roughly 14 years it returns 102% annualized with a 44% max drawdown and 51% volatility; the 1.63 Sharpe and 2.36 Calmar are mid-pack for the cohort. In practice the safety checks moderate rather than eliminate leveraged drawdowns, and the deep max drawdown shows that no set of pre-entry filters fully neutralizes 3x ETF risk in a severe selloff. It suits an investor who wants a more cautious, gated version of leveraged tech exposure but understands the residual downside remains substantial.",
    ],
    "zoops-manhattan-project-2026": [
        "The Manhattan Project is the most signal-dense zoop variant, integrating many independent market indicators (RSI, moving averages, momentum, and volatility tiers) to assemble what it treats as an optimal leveraged position at each rebalance, layered over the Frontrunner base. It approaches market timing as a quasi-scientific exercise: more inputs, more conditional branches, and a composite read of regime intended to position aggressively only when the weight of evidence agrees.",
        "The complexity translates into strong numbers: 154% annualized over roughly 14 years with a 2.10 Sharpe and 4.43 Calmar, and a 35% max drawdown that is shallower than most always-on leveraged peers. The long, multi-cycle backtest is a strength. The flip side of heavy signal-stacking is overfitting risk, since many tuned thresholds can fit the historical period more tightly than they generalize, so the excellent backtest should be read with the understanding that complex strategies carry more parameter risk out-of-sample.",
    ],
    "zoops-kmlm-switcher-2026": [
        "This is a regime-switching strategy that rotates between KMLM, a managed-futures, trend-following ETF that tends to do well when equities struggle, and leveraged equity ETFs, using RSI and volatility signals plus the Frontrunner base. The purpose is to be positioned for gains in two opposite environments: riding leveraged equities when markets rally, and pivoting to managed-futures trend exposure when they do not, creating a more all-weather return stream than a pure equity-leverage approach.",
        "It posts the headline-grabbing numbers of this library: 280% annualized, a 2.63 Sharpe, and a remarkable 9.52 Calmar with only a 30% max drawdown. The critical caveat is the backtest length. At roughly 5 years (1,377 trading days) it is far shorter than the 14-year zoop variants, and managed-futures diversification looked especially good across the specific 2021 to 2022 period when KMLM rallied as stocks fell. Those extraordinary ratios are therefore more period-dependent and should be discounted relative to the longer-tested strategies.",
    ],
    "zoops-upro-ftlt-2026": [
        "This is the S&P 500 counterpart to the TQQQ long-term strategy: it holds UPRO (3x S&P 500) for the long run with the same systematic safety-exit framework of 200-day MA regime gating, RSI/volatility checks, and the Frontrunner dip-buy base. Because the S&P 500 is broader and less concentrated than the Nasdaq 100, the strategy is designed to deliver similar leveraged trend-following behavior with a somewhat smoother ride than its QQQ-based sibling.",
        "Over roughly 14 years it returns 94% annualized with a 33% max drawdown and 47% volatility, both lower than the TQQQ version, confirming the broader-index, lower-beta intent, while the 1.64 Sharpe and 2.81 Calmar land mid-pack. It is the natural pick for an investor who wants the long-term-leverage-with-safety-exits concept but prefers S&P 500 breadth over Nasdaq 100 concentration, accepting modestly lower returns for modestly lower volatility.",
    ],
    "zoops-leveraged-tqqq-symphony-2026": [
        "This TQQQ strategy 'orchestrates' multiple timing signals (RSI, 200-day MA, momentum, and volatility tiers) and acts only when they align, much like instruments playing in harmony, on top of the shared Frontrunner base. Conceptually it is close to the other TQQQ-long-term variants but frames its edge as signal coordination: each indicator must agree before leveraged exposure is taken, the goal being to avoid acting on any single signal in isolation.",
        "Across roughly 14 years it compounds at 109% annualized, but it carries the deepest max drawdown of the core TQQQ variants at 48%, with 53% volatility and a 1.64 Sharpe and 2.28 Calmar. The long backtest is reassuring, but the relatively weak Calmar shows that requiring signal 'harmony' did not, historically, buy meaningfully better drawdown protection than simpler approaches, making it a solid but not standout member of the TQQQ family.",
    ],
    "zoops-tqqq-200d-ma-3x-2026": [
        "This is the simplest, most transparent strategy in the library: hold TQQQ when QQQ is above its 200-day moving average, otherwise move to cash, with the Frontrunner base handling opportunistic dip-buys. The single 200-day MA gate is one of the most studied and durable trend filters in systematic investing, and the appeal here is exactly that legibility. Anyone can understand, audit, and trust the rule, with no opaque stack of tuned thresholds.",
        "Over roughly 14 years it returns 109% annualized with a 39% max drawdown, 53% volatility, and a 1.65 Sharpe and 2.80 Calmar, performance fully competitive with far more complex variants. That is the noteworthy point: a one-rule strategy matches the multi-signal symphonies, a strong argument that most of the value comes from the trend gate itself rather than the added complexity. Its low overfitting risk and interpretability make it an excellent baseline for understanding leveraged trend-following.",
    ],
    "zoops-soxl-growth-2026": [
        "This is the most aggressive zoop symphony, using SOXL (3x Semiconductors) as its core growth engine, governed by RSI, momentum, and volatility signals plus the Frontrunner base. Semiconductors are among the highest-beta corners of the market, and 3x leverage on top compounds that volatility. The strategy deliberately accepts extreme swings in exchange for the explosive upside that semiconductor leadership can deliver during a tech bull run.",
        "The numbers make the trade-off explicit: 164% annualized over roughly 14 years, but a brutal 66% max drawdown and 69% volatility, the highest-risk profile of the zoop set, which is why it carries max-drawdown and standard-deviation tags. Its 1.75 Sharpe and 2.50 Calmar are respectable only because the returns are so large. This is a strategy for investors with the highest risk tolerance and a long horizon who can psychologically and financially survive losing roughly two-thirds of peak value.",
    ],
    "s90-half-low-catch": [
        "This is a multi-asset extreme dip-buying strategy that waits for catastrophic crashes in 3x ETFs across semiconductors, biotech, China, financials, small caps, and global markets, entering only at RSI levels far below conventional oversold thresholds. The structure is essentially a basket of deep-mean-reversion triggers: it does nothing most of the time and fires only when an asset has fallen to a genuine washout, betting on the sharp snapback that often follows panic selling.",
        "Its backtested figures are spectacular (735% annualized, a 3.04 Sharpe, and a 24.81 Calmar with only a 30% max drawdown) but they demand heavy skepticism. The backtest is just 2 years (551 trading days), by far the shortest in the library, and a deep-dip-buying strategy will look extraordinary in any window that happens to contain sharp V-shaped recoveries. These returns are almost certainly not repeatable out-of-sample; the strategy is best viewed as an illustration of the mean-reversion concept rather than a realistic expectation, and the short, period-specific backtest is its single most important caveat.",
    ],
    "holy-grail": [
        "The original Holy Grail is a TQQQ-centric trend-follower: it stays long leveraged tech while TQQQ holds above its 200-day moving average, hedges into UVXY when the market is overbought, and rotates into dip-buying or outright short positions once TQQQ breaks below the 200-day line. The logic is a clean three-state machine of bull (long leverage), froth (volatility hedge), and bear (dip-buy or short), designed to participate fully in uptrends while having explicit, pre-defined responses to overheating and to regime breakdown.",
        "Over a long 15-year backtest it returns 154% annualized with a 1.80 Sharpe and 3.24 Calmar, while the 47% max drawdown and 62% volatility mark it as aggressive. The lengthy test window through multiple bear markets is a meaningful strength, and the explicit short and hedge branches mean it is built to profit from, not merely survive, downturns. It suits investors who want active bull-and-bear leveraged tech exposure governed by a transparent moving-average regime rule.",
    ],
    "tqqq-long-term": [
        "This is a TQQQ buy-and-hold core wrapped in a comprehensive risk-management overlay. SPY's 200-day moving average sets the bull/bear regime; in bull markets it runs TQQQ with dual overbought guards on TQQQ and SPXL plus RSI-triggered dip-buying into TECL and UPRO, and in bear markets it filters between SQQQ and the TLT bond hedge by RSI. The purpose is to hold leveraged Nasdaq exposure for the long term while having layered, rules-based defenses against the drawdowns that destroy unhedged 3x positions.",
        "Across roughly 15 years it compounds at 165% annualized with a strong 1.86 Sharpe and 3.08 Calmar. The headline risk is a 54% max drawdown and 63% volatility, among the deeper drawdowns here, a reminder that even a well-engineered overlay cannot fully tame 3x exposure. The long, multi-cycle backtest and the explicit bond-hedge bear branch are its strengths; it fits a long-horizon investor who wants leveraged tech with genuine defensive machinery rather than naked buy-and-hold.",
    ],
    "wooden-arkk": [
        "This is a bi-directional mean-reversion strategy built around ARKK's leveraged siblings. It reads the market regime by comparing IEI (treasuries) and SPHB (high-beta) RSI, then buys the single worst recent performer from either a long leveraged pool (when conditions are risk-off and a bounce is likely) or an inverse-ETF pool (when conditions are risk-on and a pullback is likely). The 'buy the biggest loser' mechanic is pure short-horizon mean reversion, with the IEI-versus-SPHB read deciding which direction to fade.",
        "It shows 244% annualized over a 4-year backtest with a 2.25 Sharpe and 5.48 Calmar against a 45% max drawdown. The strong ratios are attractive, but the roughly 1,028-day backtest is relatively short and skewed toward the high-volatility 2021 to 2024 environment in which fade-the-extreme tactics thrive; the same approach can bleed in calm, persistently trending markets where the worst performer keeps losing. Treat the impressive metrics as period-specific and the strategy as a tactical, volatility-dependent mean-reversion play.",
    ],
    "super-semiconductors": [
        "A semiconductor-sector specialist by Dereck Nielsen, this strategy selects the top 3 performers from a 19-company chip universe during MACD-bullish bull markets, switches to tactical dip-buying and partial bond hedges when MACD turns bearish, and actively shorts semiconductors via SOXS or SSG in confirmed bear conditions. It combines stock-level momentum selection (own the strongest chips) with a sector-level MACD regime switch, so it concentrates in winners during uptrends and flips defensive or short when the sector rolls over.",
        "Over a long 14-year backtest it returns 103% annualized with a 1.71 Sharpe, 2.39 Calmar, and a 43% max drawdown, a relatively contained drawdown for a single-sector strategy, helped by the bond hedges and short branches. The multi-cycle test window and the genuine bear-market shorting logic are strengths. Its main characteristic is concentration: by living entirely in semiconductors it is fully exposed to chip-cycle booms and busts, rewarding investors who specifically want active, regime-aware exposure to that sector.",
    ],
    "four-horsemen": [
        "This is a multi-component, equal-weight strategy that runs several market-cycle systems in parallel: a SPY 200-day trend engine with 5-ETF momentum selection, a shorter-term TQQQ 20-day component, and a secondary SPY regime component, all sharing dual UVXY overbought guards and a cascading bear-market protocol that includes dip-buying, deep-bear routing, and a QQQ cumulative-return detector. Equal-weighting independent sub-strategies is a diversification technique: each 'horseman' captures a different timeframe or signal, and blending them smooths the combined equity curve.",
        "Across roughly 14 years it returns 167% annualized with a strong 2.18 Sharpe and 3.68 Calmar against a 45% max drawdown and 51% volatility. The combination of a long backtest, parallel-system diversification, and layered bear protocols gives it one of the more robust risk-adjusted profiles among the original (non-zoop) strategies. The cost is complexity, since many interacting components are harder to audit and carry more parameter risk, but the multi-system design is a deliberate hedge against any single signal failing.",
    ],
    "soxx-group": [
        "A semiconductor specialist by Garen/DN, this strategy uses UVXY's 30-day RSI to detect high-volatility regimes, then trades SOXL or SOXS based on the size of single-day moves in SMH, applying a tiered multi-timeframe RSI cascade it calls the '30-20-10 Double Pop' to catch mean reversion after extreme semiconductor swings. The design is explicitly volatility-gated mean reversion: it only engages when chips are moving violently, and uses nested RSI timeframes to time the snapback in either direction.",
        "Over a long 14-year backtest it returns 111% annualized, but the risk is severe: a 69% max drawdown, 66% volatility, and the weakest risk-adjusted figures of this group (1.46 Sharpe, 1.61 Calmar). The noteworthy characteristic is that the strategy takes very large losses relative to its returns, since fading extreme single-sector moves works until a move keeps going, and 3x chip ETFs punish a wrong-way bet harshly. It is a high-conviction, high-pain semiconductor tool, not a balanced allocation.",
    ],
    "soxl-growth-rl": [
        "This is a machine-learning-optimized SOXL strategy (the 'RL' stands for Reinforcement Learning) that uses standard deviation of returns alongside RSI and drawdown thresholds to navigate between long semiconductor exposure, inverse ETFs, and diversified leveraged baskets. The hyper-precise, oddly specific numeric thresholds betray its algorithmic origin: rather than round human-chosen levels, the boundaries were fitted by an optimization process searching for the best historical configuration.",
        "It returns 143% annualized over a long 15-year backtest but carries the second-deepest drawdown in the entire library at 82%, with extreme 85% volatility and weak 1.47 Sharpe and 1.74 Calmar ratios. Two cautions dominate. First, an 82% drawdown means the strategy lost more than four-fifths of peak value at its worst, which few investors could hold through. Second, RL and optimized strategies are especially prone to overfitting, because thresholds tuned to maximize a past backtest often degrade out-of-sample. The long test window helps, but the algorithmic curve-fitting risk and catastrophic drawdown are the headline concerns.",
    ],
    "nancy-pelosi-chips": [
        "Named after the well-publicized chip-stock trading, this is a semiconductor mean-reversion strategy that uses 5-day SOXX cumulative returns to detect weekly momentum extremes, then trades SOXL or SOXS at the reversal point, while applying individual RSI checks on NVDA and AMD to catch extreme overbought and oversold conditions in the two bellwether names. The thesis is short-horizon reversion in chips: fade weekly extremes and lean on the most influential individual stocks to confirm the turn.",
        "This is the weakest risk-adjusted profile in the library, and its metrics should be read as a cautionary example: 73% annualized over roughly 14 years, but an 86% max drawdown, the deepest here, with a 1.10 Sharpe and a Calmar of just 0.85, meaning the annualized return is actually smaller than the maximum loss endured to earn it. Fading single-sector momentum without a strong regime gate exposes it to ruinous trends where the 'extreme' keeps extending. The long backtest only underscores that the poor ratios are structural, not a small-sample artifact; this strategy illustrates how high single-sector leverage can produce large returns and unacceptable risk simultaneously.",
    ],
    "top-cap-ma-rsi": [
        "This is a clean three-branch strategy gated by SPY's extreme short-term RSI. When SPY is extremely overbought it rotates into a UVXY volatility hedge; when extremely oversold it attacks with leveraged ETFs; and in the normal middle state it runs momentum selection from a curated mega-cap basket spanning value, growth, and crypto-proxy names. The structure is intuitive (hedge the froth, buy the panic, and otherwise own the strongest large caps) which keeps it far more legible than the deeply nested semiconductor strategies.",
        "Over an 11-year backtest it returns 133% annualized with a 1.64 Sharpe, 2.31 Calmar, and a 58% max drawdown. The notable risk is that drawdown: despite using only RSI and momentum, the leveraged-attack branch and high-beta mega-cap basket still produce deep losses in severe selloffs. Its appeal is simplicity and breadth, a transparent rule set over a diversified large-cap universe, for an investor who wants clear logic and accepts aggressive drawdowns.",
    ],
    "mean-reversion-py": [
        "This is a deliberately minimalist SPY trend-follower with a TQQQ core and a UVXY overbought hedge, originally written to cross-validate a Python backtesting implementation. SPY's moving average is the only regime gate and TQQQ's 10-day RSI is the only secondary signal, producing just four simple branches that choose between TQQQ, UVXY, and SPY. Its value is pedagogical: it is the clearest possible illustration of a moving-average regime gate plus a single RSI hedge, with nothing else to obscure the mechanism.",
        "Over roughly 15 years it returns 82% annualized, but the bare-bones design shows in the risk: an 82% max drawdown, 65% volatility, and a Calmar of exactly 1.00, where the annualized return equals the maximum drawdown, the breakeven line for risk-adjusted appeal. With only one hedge and no bond or short branch, it has little defense in a sustained bear market, which is why the drawdown is so deep. It is best understood as a reference implementation and a baseline for what minimal logic achieves, not as an optimized strategy to deploy as-is.",
    ],
    "spy-energy-chips": [
        "This is a two-component strategy. A 'VIXM Black Swan Catcher' holds mid-term VIX futures when volatility has been persistently elevated, providing a crisis hedge, while a multi-sector momentum rotator selects the single best performer from a diversified pool spanning semiconductor leaders, the broad market, energy, commodities, and clean energy. The combination pairs a tail-risk hedge with a breadth-seeking momentum engine, so the strategy aims to rotate into whatever sector is leading while holding insurance for volatility spikes.",
        "Over roughly 14 years it returns 74% annualized with a modest 1.19 Sharpe, a 1.13 Calmar, and a deep 65% max drawdown. The weak Calmar signals the core issue: the sector-momentum sleeve still suffers large drawdowns, and the VIXM hedge, which bleeds during calm markets, drags on returns more than it protects in this configuration. The diversified sector universe is genuinely broad, but the metrics suggest the hedge-plus-rotation balance is not well tuned; it is a moderate strategy whose risk outweighs its return relative to the leveraged peers here.",
    ],
    "simons-kmlm-switcher": [
        "Simon's KMLM Switcher is an aggressive three-layer RSI strategy. An 11-ticker overbought gate routes into UVXY whenever any tracked sector overheats; a sequential dip-buy cascade catches 3x ETF crashes at extreme oversold levels; and a KMLM momentum switch toggles between the two most oversold leveraged ETFs when tech leads, or defensive SQQQ/TLT when managed-futures momentum dominates. The layered design tries to do three jobs at once: hedge froth, buy capitulation, and pick the right regime between leveraged tech and managed-futures defense.",
        "Its backtested numbers are extraordinary (654% annualized, a 3.01 Sharpe, and a 20.42 Calmar against a 32% max drawdown) but the central caveat is the 4-year (1,049-day) backtest. Like the related KMLM Switcher, those ratios lean heavily on the 2021 to 2024 window, where managed-futures diversification and sharp dip-buys looked exceptional; such returns are not a reasonable forward expectation. The strategy is a sophisticated, all-weather-style design, but its short, period-specific test means the spectacular metrics should be discounted far more than those of the 14-year-tested strategies.",
    ],
}


def insert_ai_summary(strategy):
    """Return a new ordered dict with ai_summary inserted before how_it_works."""
    slug = strategy["slug"]
    if slug not in AI_SUMMARIES:
        print(f"  WARNING: no AI summary defined for slug '{slug}' - skipping")
        return strategy
    out = {}
    for key, value in strategy.items():
        if key == "ai_summary":
            continue  # drop any existing copy; we re-insert in the right spot
        if key == "how_it_works":
            out["ai_summary"] = AI_SUMMARIES[slug]
        out[key] = value
    # Fallback: strategy has no how_it_works - append at end
    if "ai_summary" not in out:
        out["ai_summary"] = AI_SUMMARIES[slug]
    return out


def main():
    with open(JSON_PATH, encoding="utf-8") as f:
        strategies = json.load(f)

    updated = [insert_ai_summary(s) for s in strategies]

    missing = [s["slug"] for s in updated if "ai_summary" not in s]
    if missing:
        raise SystemExit(f"ERROR: missing ai_summary for: {missing}")

    payload = json.dumps(updated, indent=2, ensure_ascii=False)

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        f.write(payload + "\n")

    with open(JS_PATH, "w", encoding="utf-8") as f:
        f.write(JS_HEADER + payload + ";\n")

    print(f"Wrote ai_summary for {len(AI_SUMMARIES)} strategies to:")
    print(f"  {JSON_PATH}")
    print(f"  {JS_PATH}")


if __name__ == "__main__":
    main()
