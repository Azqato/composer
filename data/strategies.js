// Strategies data - loaded as a script tag so the site works with file:// protocol.
// To update metrics: run scripts/update_metrics.py
window.STRATEGIES_DATA = [
  {
    "slug": "zoops-2026-frontrunner",
    "hidden": true,
    "name": "zoop's 2026 Frontrunner",
    "symphony_url": "https://app.composer.trade/symphony/4aI4kVT5cEc0XJpTLei3/details",
    "symphony_id": "4aI4kVT5cEc0XJpTLei3",
    "annualized_rate_of_return": 0.905177087134655,
    "max_drawdown": -0.21562736065764898,
    "cumulative_return": 253.74811699999998,
    "calmar_ratio": 4.197876764682949,
    "sharpe_ratio": 1.7875043064531217,
    "standard_deviation": 0.4004231590425174,
    "min": -0.15378145304873725,
    "mean": 0.0028403100047304096,
    "median": 0.0001091088077493918,
    "max": 0.5462918735474047,
    "trailing_one_month_return": 0.0027672210571665357,
    "trailing_three_month_return": 0.12860429589798228,
    "trailing_one_year_return": 0.2130601617527088,
    "backtest_days": 2165,
    "description": "A momentum-driven strategy designed to front-run emerging market trends by positioning in leading leveraged ETFs before broad participation catches up.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "vix-tiers",
      "inverse-etfs",
      "zoop"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "Structurally, the Frontrunner is a cash-first dip-buyer: it parks in T-bills (BIL) by default and only deploys into 3x leveraged ETFs (SOXL, TQQQ, or UPRO) when a fast RSI(10) reading crosses tight oversold thresholds, with semiconductors checked first. A second branch uses XLY and UVXY RSI to rotate into volatility (VXX) or a short (SPXU) when markets overheat. The purpose is to spend most of its time earning risk-free interest and act only at genuine short-term extremes, making each entry deliberate rather than continuous. It is also the 50% base component shared by every other zoop symphony, so understanding it explains half of this library.",
      "Over a roughly 8-year backtest it posts a {annualized_rate_of_return:0} annualized return with a {max_drawdown_abs:0} max drawdown, a notably lower drawdown than the other leveraged zoop strategies precisely because its time-in-market is limited. Its {sharpe_ratio} Sharpe and {calmar_ratio} Calmar reflect that favorable risk-adjusted trade-off. The main caveat is that buying into oversold conditions means individual entries can keep falling before they recover, so the smooth equity curve masks sharp single-trade risk. It best suits an investor who wants systematic dip-buying exposure rather than a constant leveraged allocation."
    ],
    "how_it_works": [
      "The 2026 Frontrunner is a dip-buying strategy that defaults to T-bills (BIL) and only rotates into leveraged ETFs when extreme short-term RSI signals an oversold entry opportunity. The strategy checks RSI(10), a fast 10-period RSI, against tight thresholds: semiconductors (SMH) below 23, Nasdaq 100 (QQQ) below 28, or S&P 500 (SPY) below 28 each trigger a corresponding 3x leveraged buy (SOXL, TQQQ, or UPRO respectively). Priority is top-to-bottom: semiconductor oversold signals are checked first.",
      "If no oversold condition is detected, the strategy checks for high-volatility or overbought conditions. When consumer discretionary (XLY) RSI exceeds 79, it rotates into VXX (VIX futures ETN) as a volatility hedge. If UVXY RSI exceeds 65, the strategy evaluates SPY's current return vs. its moving-average return: if SPY is trending above its average, it shorts via SPXU; if SPY is underperforming its average, it holds TQQQ instead.",
      "When none of the above conditions fire, the strategy defaults to BIL, a 1-3 month T-bill ETF that earns risk-free interest while waiting for the next actionable signal. This cash-first, extremes-only approach means the Frontrunner is often inactive, making each entry more deliberate than a buy-and-hold strategy. It is also the base component (50% weight) shared by all other zoop symphonies in this library."
    ],
    "signals": [
      {
        "name": "RSI(10) Oversold Dip-Buy",
        "tag": "rsi",
        "description": "10-period RSI on SMH (<23), QQQ (<28), and SPY (<28) triggers 3x leveraged entries at short-term extremes."
      },
      {
        "name": "UVXY Volatility Monitor",
        "tag": "vix-tiers",
        "description": "UVXY RSI >65 switches from equity to SPXU (if SPY trending above MA) or TQQQ (if not)."
      },
      {
        "name": "VXX Overbought Hedge",
        "tag": "vix-tiers",
        "description": "XLY RSI >79 (consumer discretionary overbought) rotates into VXX as a direct volatility position."
      },
      {
        "name": "Leveraged ETFs",
        "tag": "leveraged-etfs",
        "description": "SOXL, TQQQ, UPRO, and SPXU used for amplified entry and hedging at RSI extremes."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "Entries route into TQQQ, UPRO and SOXL, all 3x funds, with SPXU as a 3x inverse leg. The strategy spends most of its time in T-bills, so the leverage arrives in short bursts rather than as a continuous hold. That is why its max drawdown is the second lowest in this library despite the instruments involved.",
      "backtest_limits": "The record is bounded by VXX and begins in early 2018, which is the longest window this strategy's own holdings allow. It covers the 2020 COVID crash and the 2022 tech bear and nothing before them, so there is no 2008 financial crisis in it and no full secular cycle.",
      "signal": "Entries fire at RSI extremes, buying oversold conditions that can keep falling before they recover. Limited time in market lowers the portfolio drawdown but does nothing to reduce the short-term reversal risk carried by any individual entry.",
      "hedge": "SPXU and VXX are both reachable, so an inverse leg and a volatility leg exist. Both decay and are unsuitable as long-term holds, and VXX is also the instrument that limits how far back this strategy can be tested at all.",
      "concentration": "When invested, every state is US large-cap index leverage or SOXL. Rotating between them changes the leverage target rather than the underlying bet.",
      "suitability": "Best suited to investors who want systematic dip-buying exposure rather than a constant equity allocation."
    },
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-holy-grail-2026",
    "hidden": true,
    "name": "zoop's Holy Grail (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/Y2xvfu7iFNyO6up77gBI/details",
    "symphony_id": "Y2xvfu7iFNyO6up77gBI",
    "annualized_rate_of_return": 1.1014913573628315,
    "max_drawdown": -0.44685095406231135,
    "cumulative_return": 43219.962388,
    "calmar_ratio": 2.4650084045903897,
    "sharpe_ratio": 1.623968334879958,
    "standard_deviation": 0.5472830357268897,
    "min": -0.1537815175131163,
    "mean": 0.003526866350148594,
    "median": 0.001999305424038589,
    "max": 0.5462990683976081,
    "trailing_one_month_return": 0.11296812134051137,
    "trailing_three_month_return": 0.07557748294313882,
    "trailing_one_year_return": 0.788221215619525,
    "backtest_days": 3621,
    "description": "A multi-signal strategy combining RSI, moving average, and volatility filters to achieve exceptional risk-adjusted returns across full market cycles.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "200d-ma",
      "vix-tiers",
      "inverse-etfs",
      "zoop"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "This is a full-cycle, multi-signal strategy that layers RSI, the 200-day moving average, and volatility filters on top of the shared Frontrunner dip-buy base. The moving-average gate defines the broad regime, RSI handles overbought and oversold timing, and the volatility check routes into hedges when conditions turn turbulent. The intent is to capture leveraged upside in bull trends while using multiple independent confirmations to step aside before the worst of a drawdown, the 'holy grail' being strong compounding that still survives full market cycles.",
      "Across a long 14-year backtest it returns {annualized_rate_of_return:0}% annualized, the result of combining many signals over many regimes. The trade-off is a deep {max_drawdown_abs:0} max drawdown and high {standard_deviation:0}% volatility, marking it as an aggressive leveraged strategy, and the {sharpe_ratio} Sharpe and {calmar_ratio} Calmar are solid but not exceptional for the risk taken. The long backtest is a real strength here: it has been tested through 2018, 2020, and 2022 stress periods rather than a single favorable stretch. It suits investors comfortable holding through large paper losses in pursuit of high long-run growth."
    ],
    "how_it_works": [
      "The Holy Grail is a 50/50 equal-weight combination of the 2026 Frontrunner and an extended signal block. The second component begins with the same RSI(10) oversold checks as the Frontrunner, buying SOXL, TQQQ, or UPRO on semiconductor/Nasdaq/S&P extreme dips, then runs 14 overbought detection checks before proceeding to its default logic.",
      "The 14 overbought tests cover RSI >79 on SMH, QQQ, SPY, TQQQ, TECL, QQQE, VOOG, VOOV, and XLY, plus relative RSI comparisons for consumer staples (XLP), value stocks (VTV), and leveraged financials (FAS) against a baseline RSI. If any single check detects overbought conditions or a defensive sector rotation pattern, the strategy shorts via SH (ProShares Short S&P500). This breadth-of-overbought approach catches market extremes that any individual indicator would miss.",
      "When no extreme is detected and UVXY volatility is normal, the strategy falls back to TQQQ's own price vs. its simple moving average: hold TQQQ when above SMA (and RSI <79), dip-buy TECL if TQQQ RSI falls below 31, dip-buy SOXL if SOXL RSI falls below 30, or short via SH when TQQQ is below SMA without an extreme oversold reading."
    ],
    "signals": [
      {
        "name": "RSI(10) Oversold Entry",
        "tag": "rsi",
        "description": "10-period RSI on SMH/QQQ/SPY triggers 3x leveraged buys at extreme lows."
      },
      {
        "name": "14-Layer Overbought Shield",
        "tag": "rsi",
        "description": "RSI >79 checks across 8 ETFs plus relative RSI comparisons for sector rotation, any single hit routes to SH."
      },
      {
        "name": "TQQQ SMA Filter",
        "tag": "200d-ma",
        "description": "TQQQ price vs. simple moving average is the primary trend gate in the default path."
      },
      {
        "name": "UVXY Volatility Check",
        "tag": "vix-tiers",
        "description": "UVXY RSI >65 routes to SPXU (if SPY above MA return) or TQQQ."
      },
      {
        "name": "Leveraged ETFs",
        "tag": "leveraged-etfs",
        "description": "TQQQ is the default risk-on hold; TECL and SOXL used for dip entries; SH for shorting."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "Risk-on states hold TQQQ, UPRO, TECL and SOXL, all 3x funds, with SPXU as the inverse leg.",
      "backtest_limits": "Bounded by SOXL, the record begins in 2012 and contains no 2008 financial crisis. The extraordinary cumulative return is real arithmetic over that window, and it is also the product of compounding 3x leverage through a period with no secular bear market in it.",
      "signal": "A 14-layer overbought cascade and a TQQQ moving-average gate are genuine downside protection. The drawdown record shows the limit of them: stretches where conditions deteriorated faster than the signals responded.",
      "hedge": "SH and SPXU are the defensive legs, both inverse rather than volatility instruments. They only help once the signals have already flipped, so they do nothing during the response lag the drawdown record exposes.",
      "concentration": "Every risk-on holding is US large-cap growth or semiconductors. Rotating between TQQQ, TECL and SOXL changes which leveraged fund is held, not what it is exposed to."
    },
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-tqqq-long-term-2026",
    "hidden": true,
    "name": "zoop's TQQQ FOR THE LONG TERM (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/yIMvLUHfzAMATCpOKr9T/details",
    "symphony_id": "yIMvLUHfzAMATCpOKr9T",
    "annualized_rate_of_return": 1.0799617846605174,
    "max_drawdown": -0.4610374921086001,
    "cumulative_return": 37273.744563,
    "calmar_ratio": 2.3424597850409223,
    "sharpe_ratio": 1.5995475605525247,
    "standard_deviation": 0.5502521049511573,
    "min": -0.15378149167016442,
    "mean": 0.003492676238744109,
    "median": 0.0020476687350257095,
    "max": 0.5462990579919482,
    "trailing_one_month_return": 0.112968121330554,
    "trailing_three_month_return": 0.0755774710941588,
    "trailing_one_year_return": 0.6923908735040956,
    "backtest_days": 3621,
    "description": "A long-term TQQQ holding strategy with systematic safety exits to survive major market drawdowns, designed for investors who believe in Nasdaq 100 long-term growth but need protection against devastating losses.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "200d-ma",
      "vix-tiers",
      "inverse-etfs",
      "zoop"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "The logic is a long-term TQQQ (3x Nasdaq 100) holding wrapped in systematic safety exits. Rather than buy-and-hold, it uses the 200-day moving average and RSI/volatility checks to step out of leveraged tech before major breakdowns, then re-enter when conditions stabilize, all on top of the shared Frontrunner dip-buy base. It is built for the investor who believes in Nasdaq 100 growth over the long run but cannot stomach the catastrophic, decay-amplified losses that come from holding a 3x ETF unhedged through a bear market.",
      "Over roughly 14 years it compounds at {annualized_rate_of_return:0}% annualized, but the headline risk is a {max_drawdown_abs:0} max drawdown and {standard_deviation:0} volatility; the safety exits soften the worst leveraged-tech crashes without eliminating them. Its {sharpe_ratio} Sharpe and {calmar_ratio} Calmar are typical for this aggressive cohort. The value proposition is less about beating the other zoop variants and more about converting an un-survivable 3x buy-and-hold into something an investor can actually hold through a cycle."
    ],
    "how_it_works": [
      "TQQQ FOR THE LONG TERM (FTLT) is built around one central question: is SPY above or below its simple moving average? This SMA comparison is the primary trend gate for the second component (50% weight). When SPY is in an uptrend and SPXL (3x S&P 500) RSI is below 80, the strategy defaults to holding TQQQ, leveraged Nasdaq exposure during confirmed broad market uptrends. The Frontrunner component (the other 50%) runs in parallel, adding RSI(10) oversold dip-buying for semiconductors, Nasdaq, and S&P.",
      "The second component also includes a single-asset overbought check: if RSI(SMH), semiconductors, exceeds 79, it routes to SH rather than TQQQ, treating semiconductor overextension as a warning for the broader tech-heavy Nasdaq exposure. This is a simplified version of the more elaborate overbought cascade in Holy Grail.",
      "When SPY breaks below its SMA, the strategy shifts to dip-buying mode rather than simply holding cash. It checks TQQQ RSI <31 to buy TECL (3x tech), SPY RSI <30 to buy SPXL (3x S&P), and then works through tiered UVXY checks at 65, 74, and 84 before defaulting to TQQQ or SH based on TQQQ's own price vs. SMA. This bearish-regime protocol only re-enters on extreme oversold signals."
    ],
    "signals": [
      {
        "name": "SPY SMA Gate",
        "tag": "200d-ma",
        "description": "SPY price vs. simple moving average is the primary trend classifier, determines uptrend mode vs. bear-recovery mode."
      },
      {
        "name": "SMH Overbought Check",
        "tag": "rsi",
        "description": "Semiconductor RSI >79 triggers SH even while SPY is above its SMA."
      },
      {
        "name": "UVXY Volatility Tiers",
        "tag": "vix-tiers",
        "description": "Tiered checks at UVXY RSI >65, 74, and 84 modulate defensive routing depth."
      },
      {
        "name": "RSI Oversold Dip-Buys",
        "tag": "rsi",
        "description": "TQQQ RSI <31 triggers TECL entry; SPY RSI <30 triggers SPXL, contrarian entries during downtrends."
      },
      {
        "name": "Leveraged ETFs",
        "tag": "leveraged-etfs",
        "description": "TQQQ is the default uptrend hold; TECL and SPXL used for bear-regime dip entries."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "Holds TQQQ, TECL, SPXL and SOXL in risk-on states. Sustained holds of 3x funds are where the destructive path dependency lives, and reducing their frequency is the whole point of the design.",
      "backtest_limits": "Bounded by SOXL, the record begins in 2012 and contains no 2008 financial crisis. The 'long term' framing in the name is earned by the window: it shows that surviving the drawdowns requires a multi-year horizon.",
      "signal": "A SPY moving-average gate and UVXY-based filters reduce the frequency of destructive leveraged holds, but the drawdown record shows major trend breaks producing substantial losses before the exit signals trigger.",
      "hedge": "SH and SPXU are the inverse legs. UVXY appears as a filter input rather than a position, so volatility is read here but never held.",
      "concentration": "Risk-on exposure is Nasdaq 100 and semiconductors throughout, with no non-equity leg.",
      "suitability": "Requires a multi-year horizon to survive the drawdown periods and benefit from the compounding math."
    },
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-excellent-adventure-2026",
    "hidden": true,
    "name": "zoop's Excellent Adventure (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/YIiBr33X4rRTVlOWhCNq/details",
    "symphony_id": "YIiBr33X4rRTVlOWhCNq",
    "annualized_rate_of_return": 1.1870644271738948,
    "max_drawdown": -0.4564290546607197,
    "cumulative_return": 76706.148376,
    "calmar_ratio": 2.6007643795951663,
    "sharpe_ratio": 1.7840006058510003,
    "standard_deviation": 0.5091589417825065,
    "min": -0.16154385796692727,
    "mean": 0.003604523256406531,
    "median": 0.0011866274542273736,
    "max": 0.5462991067755885,
    "trailing_one_month_return": -0.0802648336489521,
    "trailing_three_month_return": -0.07066983333820864,
    "trailing_one_year_return": 1.1433051022611038,
    "backtest_days": 3621,
    "description": "An adventurous multi-asset leveraged strategy that aggressively pursues compounding through dynamic rotation across high-momentum instruments.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "200d-ma",
      "vix-tiers",
      "inverse-etfs",
      "zoop"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "This variant is the most aggressive of the 'rotation' zoops: it dynamically moves across high-momentum leveraged instruments using RSI, 200-day MA, and volatility signals, aiming to always be positioned in whatever is compounding fastest while the Frontrunner base handles dip-buying. The purpose is maximal participation in leveraged momentum, chasing the strongest trend rather than committing to a single ticker like TQQQ or UPRO.",
      "It delivers {annualized_rate_of_return:0}% annualized over roughly 14 years with the best Sharpe ({sharpe_ratio}) of the core leveraged zoop variants, meaning its return per unit of risk is comparatively efficient despite a {max_drawdown_abs:0} max drawdown and {standard_deviation:0} volatility. The long backtest spanning multiple cycles lends credibility. Still, the 'always in the hottest asset' design makes it whipsaw-prone in choppy, trendless markets, and the deep drawdown places it firmly in aggressive territory."
    ],
    "how_it_works": [
      "The Excellent Adventure shares its structural skeleton with the Holy Grail, a 50/50 split between the Frontrunner and an extended signal block with the same 14 RSI overbought checks across tech ETFs and sector rotation comparisons. Any overbought trigger routes to SH. The critical distinction is in what happens when all 14 checks pass and volatility is normal.",
      "After clearing the overbought cascade and the UVXY >65 check, the strategy adds two more RSI guards that are not present in Holy Grail: QQQ RSI >80 or SPY RSI >80 both trigger SH. Then RSI(TQQQ) <31 triggers a TECL dip-buy. The final gate is a cross-asset bond momentum check: RSI(10)(IEF) vs. the baseline RSI. If Treasury bond short-term momentum is positive (IEF's 10-period RSI exceeds the baseline), the strategy holds TQQQ. Otherwise, it defaults to SH.",
      "This IEF momentum confirmation is the 'adventure', using bond relative strength as a cross-asset signal before equity entry. When short-term Treasuries are gaining momentum, the strategy interprets the macro environment as supportive for risk assets and enters TQQQ. When bond momentum is flat or negative, it waits in SH regardless of how equities look on their own."
    ],
    "signals": [
      {
        "name": "14-Layer Overbought Shield",
        "tag": "rsi",
        "description": "RSI >79 across 8 ETFs plus defensive sector relative RSI checks, any single hit routes to SH."
      },
      {
        "name": "IEF Bond Momentum Gate",
        "tag": "momentum",
        "description": "Final TQQQ entry gate: IEF 10-period RSI must exceed the baseline RSI, using Treasury momentum as cross-asset confirmation."
      },
      {
        "name": "QQQ/SPY RSI Override",
        "tag": "rsi",
        "description": "RSI >80 on QQQ or SPY triggers SH as an additional overbought guard after the 14-layer cascade."
      },
      {
        "name": "UVXY Volatility Check",
        "tag": "vix-tiers",
        "description": "UVXY RSI >65 routes to SPXU (SPY above MA return) or TQQQ (SPY below MA return)."
      },
      {
        "name": "Leveraged ETFs",
        "tag": "leveraged-etfs",
        "description": "TQQQ is the risk-on default; TECL used for extreme dip entries; SH for defensive periods."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "3x funds during confirmed bull phases: TQQQ, UPRO, TECL and SOXL. Individual positions can lose 40 to 50 percent in a sharp reversal.",
      "backtest_limits": "Bounded by SOXL, the record begins in 2012 and contains no 2008 financial crisis.",
      "signal": "An IEF bond filter and a 14-layer overbought cascade are real risk controls, and they gate entry rather than limit position size. A confirmed bull phase still means full 3x exposure.",
      "hedge": "SH and SPXU are the inverse legs. IEF is read as a filter input rather than held as ballast.",
      "concentration": "The strong trailing returns and the drawdown come from the same place: full allocation to a single leveraged growth position at a time."
    },
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-sometimes-tqqq-2026",
    "hidden": true,
    "name": "zoop's Sometimes TQQQ (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/uAaEkEq8cPOmGgfEWTOU/details",
    "symphony_id": "uAaEkEq8cPOmGgfEWTOU",
    "annualized_rate_of_return": 1.7844694468339903,
    "max_drawdown": -0.34972103357838447,
    "cumulative_return": 2467687.811143,
    "calmar_ratio": 5.102551106449334,
    "sharpe_ratio": 2.4392556018761407,
    "standard_deviation": 0.4628395697809105,
    "min": -0.14134423958954223,
    "mean": 0.004480095291103289,
    "median": 0.001461974064826066,
    "max": 0.5462991719094159,
    "trailing_one_month_return": 0.04599177082778816,
    "trailing_three_month_return": 0.1696844051577855,
    "trailing_one_year_return": 1.0704545352912125,
    "backtest_days": 3621,
    "description": "A precision timing strategy that holds TQQQ only when multiple independent signals confirm a favorable entry, achieving the highest backtested cumulative return in this library.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "200d-ma",
      "vix-tiers",
      "inverse-etfs",
      "zoop"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "As the name suggests, this strategy holds TQQQ only when multiple independent signals (RSI, the 200-day MA regime, and volatility filters) simultaneously confirm a favorable entry; otherwise it sits in the defensive Frontrunner base or cash. It is a precision-timing approach: the logic is deliberately selective, trading time-in-market for entry quality, on the thesis that avoiding leveraged exposure during unconfirmed conditions is worth more than capturing every up day.",
      "That selectivity pays off statistically: it records the strongest risk-adjusted profile in the library, a {sharpe_ratio} Sharpe and {calmar_ratio} Calmar, alongside a {annualized_rate_of_return:0}% annualized return and the highest backtested cumulative return here, all over a robust 14-year window. Its {max_drawdown_abs:0} max drawdown is meaningfully shallower than the always-in TQQQ variants. The standout characteristic is this efficiency: by being TQQQ 'sometimes' rather than always, it captures much of the upside with materially less of the pain, making it one of the more compelling profiles for risk-aware leveraged investors."
    ],
    "how_it_works": [
      "Sometimes TQQQ is among the most complex strategies in the library. It pairs the Frontrunner with a multi-layer decision tree that interrogates bond market conditions, multi-period momentum, and cumulative return thresholds before committing to TQQQ. The strategy truly only holds TQQQ 'sometimes', when a very specific constellation of cross-asset conditions align. Uniquely, when UVXY RSI exceeds 65, this strategy routes to SH rather than SPXU, making it more conservative on volatility spikes than its siblings.",
      "In uptrend conditions (SPY above SMA), the strategy evaluates 60-period SPY RSI and 100-period QQQ momentum to calibrate between TQQQ and UPRO exposure, with corporate bond (CORP) 60-day cumulative return as a tiebreaker. When Treasury RSI (TLT 20-period) falls below its baseline, signaling rising long rates, the strategy adds further filters: 6-day TQQQ cumulative return thresholds to detect crash conditions, 1-day momentum checks, and multi-period RSI from BND, IEF, and AGG before allowing a re-entry.",
      "In downtrend conditions (SPY below SMA), the strategy uses 60-day and 252-day QQQ cumulative returns to assess bear depth, PSQ (inverse QQQ) RSI as a confirmation signal, and bond relative returns to judge fixed income sentiment. Unlike strategies that simply hold SH when bearish, Sometimes TQQQ actively re-evaluates multiple timeframes and asset classes each day to determine if conditions support a cautious re-entry or continued avoidance."
    ],
    "signals": [
      {
        "name": "Multi-Period RSI Framework",
        "tag": "rsi",
        "description": "RSI evaluated across 10, 20, 60, and 100-period windows on QQQ, SPY, and TLT for multi-timeframe confirmation."
      },
      {
        "name": "Bond Cross-Asset Signals",
        "tag": "momentum",
        "description": "Cumulative returns and RSI of TLT, BND, IEF, AGG, and CORP used as cross-market regime indicators."
      },
      {
        "name": "Multi-Window Cumulative Returns",
        "tag": "momentum",
        "description": "1d, 6d, 10d, 60d, 62d, and 252d cumulative return windows on TQQQ and QQQ for crash detection and recovery timing."
      },
      {
        "name": "SPY SMA Trend Gate",
        "tag": "200d-ma",
        "description": "SPY price vs. SMA splits the logic between uptrend mode (TQQQ/UPRO calibration) and downtrend mode (bear-depth assessment)."
      },
      {
        "name": "UVXY Volatility Check",
        "tag": "vix-tiers",
        "description": "UVXY RSI >65 routes to SH (not SPXU), making this strategy more defensive on volatility spikes than its siblings."
      },
      {
        "name": "Leveraged ETFs",
        "tag": "leveraged-etfs",
        "description": "TQQQ and UPRO are the risk-on positions; SH is the primary defensive hold."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "Holds TQQQ, UPRO, TECL and SOXL when invested. Its drawdown and volatility are among the lowest in this library's leveraged TQQQ suite, which is still a substantial number in absolute terms.",
      "backtest_limits": "Bounded by SOXL, the record begins in 2012 and contains no 2008 financial crisis.",
      "signal": "Multi-layer bond and momentum confirmation requirements significantly restrict time in risk and improve entry quality. That is the source of its Calmar and Sharpe, which are among the best risk-adjusted figures in this library.",
      "hedge": "SH is the only defensive instrument reachable, an unleveraged inverse position. There is no volatility leg.",
      "concentration": "Five instruments in total, and every invested state is US large-cap growth or semiconductor leverage."
    },
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-safety-checks-2026",
    "hidden": true,
    "name": "zoop's Safety Checks (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/RLt1Rzz79I6Fa2X9QKqY/details",
    "symphony_id": "RLt1Rzz79I6Fa2X9QKqY",
    "annualized_rate_of_return": 0.9922790077374115,
    "max_drawdown": -0.4366406184726529,
    "cumulative_return": 20069.79548,
    "calmar_ratio": 2.272530235982978,
    "sharpe_ratio": 1.593057743138934,
    "standard_deviation": 0.5143963377360359,
    "min": -0.14134420726820573,
    "mean": 0.003251837574891675,
    "median": 0.0018937274360779632,
    "max": 0.5462989576779729,
    "trailing_one_month_return": 0.11296812133977041,
    "trailing_three_month_return": 0.07557739730341484,
    "trailing_one_year_return": 0.699458698210129,
    "backtest_days": 3621,
    "description": "A risk-managed leveraged ETF strategy with multiple pre-position safety checks designed to reduce drawdowns while maintaining strong long-term compounding.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "200d-ma",
      "vix-tiers",
      "inverse-etfs",
      "zoop"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "This strategy front-loads multiple pre-position 'safety checks' (RSI extremes, 200-day MA regime, and volatility conditions) that must clear before it commits to a leveraged ETF, otherwise defaulting to the conservative Frontrunner base. The design philosophy is drawdown reduction first: each check is a veto gate intended to keep the strategy out of leveraged positions during the conditions that historically precede large losses, while still compounding strongly over the long run.",
      "Over roughly 14 years it returns {annualized_rate_of_return:0}% annualized with a {max_drawdown_abs:0} max drawdown and {standard_deviation:0} volatility; the {sharpe_ratio} Sharpe and {calmar_ratio} Calmar are mid-pack for the cohort. In practice the safety checks moderate rather than eliminate leveraged drawdowns, and the deep max drawdown shows that no set of pre-entry filters fully neutralizes 3x ETF risk in a severe selloff. It suits an investor who wants a more cautious, gated version of leveraged tech exposure but understands the residual downside remains substantial."
    ],
    "how_it_works": [
      "Safety Checks takes an ensemble voting approach to position sizing. After the Frontrunner component (50% weight), the second half is itself an equal-weight portfolio of 10 independent safety conditions evaluated in parallel. Each condition tests a different aspect of QQQ's market state: 75-day cumulative return vs. moving-average return, 3-day return vs. standard deviation, 20-period EMA vs. SMA, multi-period RSI levels (10-period, 50-period, 100-period), and Price(QQQ) vs. SMA, checked from multiple angles.",
      "Each of the 10 conditions independently routes to either TQQQ (via a Price(SPY) > SMA gate and TQQQ/SPXL RSI check) or SH. Because all 10 are equal-weighted, the combined second component holds TQQQ proportional to how many conditions are currently passing, all 10 passing means near-full TQQQ allocation from this component, 5 of 10 means approximately equal TQQQ and SH.",
      "This consensus-voting structure creates a gradual risk-on/risk-off spectrum rather than binary switching. As market conditions deteriorate across multiple metrics simultaneously, the strategy systematically reduces TQQQ exposure signal by signal. Each condition that passes is a vote for equity; each that fails is a vote for defense. The strategy never has a single catastrophic 'gate open' moment, it degrades gracefully across its ensemble of checks."
    ],
    "signals": [
      {
        "name": "10-Condition QQQ Ensemble",
        "tag": "rsi",
        "description": "Parallel evaluation of cumulative return, EMA, multi-period RSI (10/50/100), and SMA conditions, each independently routes to TQQQ or SH."
      },
      {
        "name": "SPY SMA Filter (per condition)",
        "tag": "200d-ma",
        "description": "Each of the 10 ensemble conditions routes through Price(SPY) > SMA as a confirming uptrend check before entering TQQQ."
      },
      {
        "name": "Standard Deviation Comparison",
        "tag": "momentum",
        "description": "Short-period cumulative returns vs. standard deviation of returns used as volatility-adjusted momentum checks."
      },
      {
        "name": "UVXY Volatility Check",
        "tag": "vix-tiers",
        "description": "Inherited from Frontrunner (50% weight): UVXY RSI >65 routes to SPXU or TQQQ based on SPY trend."
      },
      {
        "name": "Leveraged ETFs",
        "tag": "leveraged-etfs",
        "description": "TQQQ is the risk-on asset; SH is the defensive asset; allocation between them reflects the ensemble vote count."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "Reaches TQQQ, UPRO and SOXL. Exposure scales gradually rather than switching all at once, so partial leverage is the normal state rather than the exception.",
      "backtest_limits": "Bounded by SOXL, the record begins in 2012 and contains no 2008 financial crisis.",
      "signal": "A 10-condition ensemble creates a risk-on and risk-off spectrum rather than binary switching, smoothing the transitions that cause large single-period losses in simpler strategies. The drawdown record shows its limit: simultaneous multi-condition failures during sharp bear markets still produce significant losses before the ensemble fully exits.",
      "hedge": "SH is the only defensive instrument, an unleveraged inverse position, and there is no volatility leg.",
      "concentration": "Only four instruments are reachable in total. The ensemble's nuance is in when to be invested, not in what to hold."
    },
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-manhattan-project-2026",
    "hidden": true,
    "name": "zoop's Manhattan Project (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/cCi1mupGsluFmre7HpOm/details",
    "symphony_id": "cCi1mupGsluFmre7HpOm",
    "annualized_rate_of_return": 1.5105034289946722,
    "max_drawdown": -0.3915606880606143,
    "cumulative_return": 556887.9434100001,
    "calmar_ratio": 3.857648316219231,
    "sharpe_ratio": 2.076924097568099,
    "standard_deviation": 0.5023590418058124,
    "min": -0.15378148705381167,
    "mean": 0.004140323807768697,
    "median": 0.0018184990499066078,
    "max": 0.5462991695798993,
    "trailing_one_month_return": 0.10694782168364947,
    "trailing_three_month_return": 0.18364695450989155,
    "trailing_one_year_return": 0.2391730967525474,
    "backtest_days": 3621,
    "description": "A complex, multi-signal systematic strategy that integrates multiple independent market indicators to construct optimal leveraged positions, approaching market timing as a scientific discipline.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "200d-ma",
      "vix-tiers",
      "inverse-etfs",
      "zoop"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "The Manhattan Project is the most signal-dense zoop variant, integrating many independent market indicators (RSI, moving averages, momentum, and volatility tiers) to assemble what it treats as an optimal leveraged position at each rebalance, layered over the Frontrunner base. It approaches market timing as a quasi-scientific exercise: more inputs, more conditional branches, and a composite read of regime intended to position aggressively only when the weight of evidence agrees.",
      "The complexity translates into strong numbers: {annualized_rate_of_return:0}% annualized over roughly 14 years with a {sharpe_ratio} Sharpe and {calmar_ratio} Calmar, and a {max_drawdown_abs:0}% max drawdown that is shallower than most always-on leveraged peers. The long, multi-cycle backtest is a strength. The flip side of heavy signal-stacking is overfitting risk, since many tuned thresholds can fit the historical period more tightly than they generalize, so the excellent backtest should be read with the understanding that complex strategies carry more parameter risk out-of-sample."
    ],
    "how_it_works": [
      "The Manhattan Project is the most sophisticated multi-asset symphony in the library. In addition to the Frontrunner (50% weight), it adds a second signal block that routes through Treasury bonds (TLT price and RSI), short-term yields (BIL RSI), and commodity volatility (DBC standard deviation) as cross-market regime classifiers before determining equity exposure. The BIL RSI signal is a key differentiator: when T-bill prices weaken (BIL RSI falls below baseline, signaling rising short-term yields), the strategy turns cautious and routes to SH or TQQQ based on SPY RSI.",
      "When SPY RSI falls below 30: a very oversold broad market, the strategy triggers one of its most aggressive entries: a diversified basket of eight 3x leveraged ETFs simultaneously (SOXL, TECL, XHB, TQQQ, SPXL, UDOW, FAS, TNA). This 8-ETF leveraged basket treats extreme oversold broad-market conditions as a high-conviction buy signal across all leveraged sectors at once.",
      "In moderate market conditions, the strategy routes through TLT's price vs. SMA and RSI state, SPY's EMA-vs-SMA acceleration, SPY moving-average return comparisons, and DBC standard deviation to select from a wide ETF universe, including inverse tech (TECS, SOXS, SQQQ), Treasury leveraged ETFs (TMF for bull, TMV for bear), energy (ERX), healthcare (CURE), and emerging markets (EEM). This cross-asset routing makes the Manhattan Project capable of being positioned in almost any market regime."
    ],
    "signals": [
      {
        "name": "BIL RSI Yield Signal",
        "tag": "rsi",
        "description": "Rising T-bill yields (BIL RSI below baseline) triggers defensive routing; stable/falling yields supports TQQQ entry."
      },
      {
        "name": "TLT Trend and RSI",
        "tag": "200d-ma",
        "description": "Treasury bond price vs. SMA and RSI levels classify the long-rate regime and route to Treasury ETF exposure (TMF/TMV)."
      },
      {
        "name": "SPY EMA vs. SMA Acceleration",
        "tag": "momentum",
        "description": "Compares SPY's exponential to simple moving average to detect trend acceleration or deceleration as a regime signal."
      },
      {
        "name": "8-ETF Leveraged Basket Entry",
        "tag": "leveraged-etfs",
        "description": "SPY RSI <30 triggers simultaneous entry across 8 diversified 3x ETFs (SOXL, TECL, XHB, TQQQ, SPXL, UDOW, FAS, TNA)."
      },
      {
        "name": "DBC Volatility Filter",
        "tag": "momentum",
        "description": "Commodity standard deviation of returns used as a macro regime signal for cross-asset routing decisions."
      },
      {
        "name": "UVXY Volatility Check",
        "tag": "vix-tiers",
        "description": "UVXY RSI >65 routes to SPXU (SPY above MA return) or TQQQ; higher UVXY tiers trigger deeper defensive routing."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "A wide leveraged set: TQQQ, UPRO, SPXL, TECL, SOXL, FAS, ERX, CURE, TNA, UDOW and TMF, with SPXS, SPXU, SQQQ, TECS and SOXS on the inverse side. Cross-asset breadth does not reduce the leverage, it spreads it across sectors.",
      "backtest_limits": "Bounded by CURE, the record begins in 2012 and contains no 2008 financial crisis. Recent quarters have been negative, which is a reminder that sophisticated cross-asset routing can still underperform in fast-moving markets.",
      "signal": "Cross-asset signal depth gives this more regime awareness than simpler strategies here, but complexity does not eliminate drawdowns and it does make the strategy harder to check by hand. This is one of the larger logic trees in this library.",
      "hedge": "The defensive side is unusually well equipped: SH, SPXU, SPXS, SQQQ, TECS and SOXS, plus TMF, AGG and GLD. Every inverse leg is directional, so none of them pays off in a volatility spike that does not become a sustained decline.",
      "concentration": "Thirty-two instruments spanning US equities, sectors, bonds, gold and international. This is the widest reachable universe of the zoop symphonies."
    },
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-kmlm-switcher-2026",
    "hidden": true,
    "name": "zoop's KMLM Switcher (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/4AuTagHMeiS4usdZEuDK/details",
    "symphony_id": "4AuTagHMeiS4usdZEuDK",
    "annualized_rate_of_return": 2.7093053435360073,
    "max_drawdown": -0.29463959462283507,
    "cumulative_return": 1717.0179859999998,
    "calmar_ratio": 9.195319953532245,
    "sharpe_ratio": 2.5614291645361,
    "standard_deviation": 0.5745071210700973,
    "min": -0.18946902397317633,
    "mean": 0.005839521012470711,
    "median": 0.00229884960706217,
    "max": 0.5470858035125803,
    "trailing_one_month_return": 0.04704005718733972,
    "trailing_three_month_return": 0.12459388135874239,
    "trailing_one_year_return": 1.3020414835511551,
    "backtest_days": 1431,
    "description": "A regime-switching strategy that rotates between KMLM (a managed futures trend-following ETF) and leveraged equity ETFs, positioning for gains in both trending and rallying markets.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "vix-tiers",
      "managed-futures",
      "inverse-etfs",
      "zoop"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "This is a regime-switching strategy that rotates between KMLM, a managed-futures, trend-following ETF that tends to do well when equities struggle, and leveraged equity ETFs, using RSI and volatility signals plus the Frontrunner base. The purpose is to be positioned for gains in two opposite environments: riding leveraged equities when markets rally, and pivoting to managed-futures trend exposure when they do not, creating a more all-weather return stream than a pure equity-leverage approach.",
      "It posts the headline-grabbing numbers of this library: {annualized_rate_of_return:0}% annualized, a {sharpe_ratio} Sharpe, and a remarkable {calmar_ratio} Calmar with only a {max_drawdown_abs:0}% max drawdown. The critical caveat is the backtest length. At roughly 5 years (1,377 trading days) it is far shorter than the 14-year zoop variants, and managed-futures diversification looked especially good across the specific 2021 to 2022 period when KMLM rallied as stocks fell. Those extraordinary ratios are therefore more period-dependent and should be discounted relative to the longer-tested strategies."
    ],
    "how_it_works": [
      "The KMLM Switcher pairs the Frontrunner with a second component focused on individual leveraged ETF dip-buying and tech-sector relative momentum. After the full 14-layer overbought cascade (which routes to SH on any RSI >79 extreme) and the UVXY volatility check, the strategy evaluates individual oversold readings: TQQQ RSI <30 triggers a TQQQ entry, SOXL RSI <30 triggers SOXL, SPXL RSI <30 triggers SPXL. A unique signal not found in other strategies: LABU (3x Biotech) RSI below 25 triggers a biotech sector dip-buy.",
      "When none of the individual dip-buy thresholds are met, the strategy uses a single relative RSI comparison as its default switch: if the 10-period RSI of XLK (Technology Select Sector SPDR) exceeds the baseline RSI, indicating tech sector short-term momentum is above average, it holds a four-ETF basket of TQQQ, SOXL, TECL, and SPXL simultaneously. When tech sector momentum falls below the threshold, the strategy holds SH.",
      "The strategy's shorter backtest history (≈5.5 years, reflecting instruments available since 2020) and the binary nature of its default allocation, full four-ETF leveraged basket vs. SH based on a single XLK RSI comparison, make it one of the more decisive regime-switchers in the library. The LABU biotech dip-buy and the sector-RSI comparison are unique features not found in the other zoop strategies."
    ],
    "signals": [
      {
        "name": "XLK Sector Relative Momentum",
        "tag": "momentum",
        "description": "10-period XLK RSI vs. baseline RSI: the primary regime switch: above baseline holds 4-ETF leveraged basket, below holds SH."
      },
      {
        "name": "Individual ETF RSI Dip-Buys",
        "tag": "rsi",
        "description": "TQQQ, SOXL, SPXL at RSI <30 and LABU at RSI <25 trigger targeted oversold entries before the XLK check."
      },
      {
        "name": "14-Layer Overbought Cascade",
        "tag": "rsi",
        "description": "RSI >79 checks across major ETFs plus defensive sector relative RSI comparisons, any trigger routes to SH."
      },
      {
        "name": "UVXY Volatility Routing",
        "tag": "vix-tiers",
        "description": "UVXY RSI >65 determines SPXU (if SPY above MA return) or TQQQ (if not) before the dip-buy checks."
      },
      {
        "name": "Leveraged ETFs",
        "tag": "leveraged-etfs",
        "description": "4-ETF basket (TQQQ, SOXL, TECL, SPXL) used when XLK momentum is positive; SH when not."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "Reaches TQQQ, SPXL, TECL, SOXL and LABU, all 3x, with SPXU as the inverse leg. LABU adds 3x biotech, a sector with a different volatility profile from the rest of the universe.",
      "backtest_limits": "The shortest window of the zoop symphonies at roughly 5.5 years, and it reflects a predominantly bull market. Its Calmar is among the highest in this library, and that figure should be read against the 14-year records available for most other strategies here rather than taken at face value.",
      "hedge": "SH and SPXU are the inverse legs. KMLM, the managed-futures fund the strategy is named for, is read as a signal input rather than held as a position.",
      "concentration": "Aside from LABU, every risk-on holding is US large-cap growth or semiconductors."
    },
    "author_note": "Note: KMLM launched in November 2020. The 5.5-year backtest is shorter than most strategies here. Metrics are accurate as of last_updated."
  },
  {
    "slug": "zoops-upro-ftlt-2026",
    "hidden": true,
    "name": "zoop's UPRO FTLT (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/9ETFQi5cmSWq2mT4ZH2d/details",
    "symphony_id": "9ETFQi5cmSWq2mT4ZH2d",
    "annualized_rate_of_return": 0.9339335132448936,
    "max_drawdown": -0.333808147698341,
    "cumulative_return": 13091.687201,
    "calmar_ratio": 2.797815211175971,
    "sharpe_ratio": 1.6395474241638748,
    "standard_deviation": 0.46605846394712724,
    "min": -0.15378150474832808,
    "mean": 0.003032241881247161,
    "median": 0.0015673063917343022,
    "max": 0.5462989029846903,
    "trailing_one_month_return": 0.07121471339862961,
    "trailing_three_month_return": 0.19335534832301104,
    "trailing_one_year_return": 0.5343301158885181,
    "backtest_days": 3621,
    "description": "The S&P 500 counterpart to TQQQ FTLT: holds UPRO (3x S&P 500) for the long term with systematic safety exits, offering slightly lower returns and lower volatility than the QQQ-based version.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "200d-ma",
      "vix-tiers",
      "inverse-etfs",
      "zoop"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "This is the S&P 500 counterpart to the TQQQ long-term strategy: it holds UPRO (3x S&P 500) for the long run with the same systematic safety-exit framework of 200-day MA regime gating, RSI/volatility checks, and the Frontrunner dip-buy base. Because the S&P 500 is broader and less concentrated than the Nasdaq 100, the strategy is designed to deliver similar leveraged trend-following behavior with a somewhat smoother ride than its QQQ-based sibling.",
      "Over roughly 14 years it returns {annualized_rate_of_return:0}% annualized with a {max_drawdown_abs:0} max drawdown and {standard_deviation:0} volatility, both lower than the TQQQ version, confirming the broader-index, lower-beta intent, while the {sharpe_ratio} Sharpe and {calmar_ratio} Calmar land mid-pack. It is the natural pick for an investor who wants the long-term-leverage-with-safety-exits concept but prefers S&P 500 breadth over Nasdaq 100 concentration, accepting modestly lower returns for modestly lower volatility."
    ],
    "how_it_works": [
      "UPRO FTLT ('For The Long Term') mirrors the TQQQ FTLT structure exactly, but substitutes UPRO (ProShares UltraPro S&P 500, 3x) for TQQQ in every branch. Where TQQQ FTLT defaults to Nasdaq 100 leverage, UPRO FTLT defaults to broad S&P 500 leverage. The core trend gate is Price(SPY) > SMA(): when SPY is above its simple moving average and SPXL (another 3x S&P ETF) RSI is below 80, the strategy holds UPRO. The Frontrunner component (50% weight) runs in parallel with its standard RSI(10) dip-buy logic.",
      "In downtrend conditions (SPY below SMA), the strategy does not simply hold cash. It checks TQQQ RSI <31 to dip-buy TECL (3x tech), SPY RSI <30 to re-enter UPRO, and works through tiered UVXY checks at 65, 74, and 84, evaluating TQQQ price vs. its own SMA before deciding whether to hold UPRO or switch to SH. Even in a downtrend, the strategy actively looks for oversold re-entry points into UPRO.",
      "The UPRO-for-TQQQ substitution produces meaningfully lower volatility, the S&P 500's broader sector diversification vs. Nasdaq 100's tech concentration reduces the standard deviation from 54-55% to 46.7%, and max drawdown from ~46% to ~{max_drawdown_abs:0}. For investors who want leveraged compounding but prefer broad market diversification over Nasdaq concentration, UPRO FTLT is the S&P 500 alternative within this strategy family."
    ],
    "signals": [
      {
        "name": "SPY SMA Gate",
        "tag": "200d-ma",
        "description": "SPY price vs. simple moving average is the primary trend classifier, determines uptrend UPRO hold vs. bear-recovery mode."
      },
      {
        "name": "SPXL RSI Overbought Check",
        "tag": "rsi",
        "description": "SPXL RSI >80 prevents UPRO entry even when SPY is above SMA, blocks leveraged entries at overbought extremes."
      },
      {
        "name": "UVXY Volatility Tiers",
        "tag": "vix-tiers",
        "description": "Tiered UVXY RSI checks at 65, 74, and 84 with TQQQ-vs-SMA confirmation determine SPXU entry or defensive routing."
      },
      {
        "name": "TECL/UPRO Dip-Buys",
        "tag": "rsi",
        "description": "TQQQ RSI <31 triggers TECL entry; SPY RSI <30 triggers UPRO, contrarian leveraged re-entries during downtrends."
      },
      {
        "name": "Leveraged ETFs",
        "tag": "leveraged-etfs",
        "description": "UPRO (3x S&P 500) is the core risk-on hold throughout; TECL used for bear-regime dip entries."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "Built on UPRO rather than TQQQ, with TECL and SOXL also reachable. Its volatility and max drawdown are meaningfully lower than the TQQQ-based strategies in this library, and the S&P 500's broader base relative to the Nasdaq 100's concentration is the reason.",
      "backtest_limits": "Bounded by SOXL, the record begins in 2012 and contains no 2008 financial crisis.",
      "hedge": "SH and SPXU are the inverse legs, both directional and neither a volatility position.",
      "concentration": "Lower concentration than the Nasdaq-based strategies here is the entire thesis, and it is a difference of degree. This is still a single leveraged US equity bet when invested.",
      "suitability": "Still unsuitable for capital that cannot tolerate multi-year drawdown periods."
    },
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-leveraged-tqqq-symphony-2026",
    "hidden": true,
    "name": "zoop's Leveraged TQQQ Symphony (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/U6lT1G0PdE9fUxoy2opg/details",
    "symphony_id": "U6lT1G0PdE9fUxoy2opg",
    "annualized_rate_of_return": 1.0569417198572046,
    "max_drawdown": -0.47591544426659427,
    "cumulative_return": 31763.687601999998,
    "calmar_ratio": 2.2208603074144744,
    "sharpe_ratio": 1.6089590556408753,
    "standard_deviation": 0.5348761041893101,
    "min": -0.15378149648231176,
    "mean": 0.003415054569370249,
    "median": 0.0013972868033673702,
    "max": 0.5462990374826375,
    "trailing_one_month_return": 0.11296812133878631,
    "trailing_three_month_return": 0.07557745616333289,
    "trailing_one_year_return": 0.7962604689905832,
    "backtest_days": 3621,
    "description": "An orchestrated TQQQ strategy that coordinates multiple timing signals like instruments in a symphony, each signal plays its role, and the strategy only acts when they are in harmony.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "200d-ma",
      "vix-tiers",
      "inverse-etfs",
      "zoop"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "This TQQQ strategy 'orchestrates' multiple timing signals (RSI, 200-day MA, momentum, and volatility tiers) and acts only when they align, much like instruments playing in harmony, on top of the shared Frontrunner base. Conceptually it is close to the other TQQQ-long-term variants but frames its edge as signal coordination: each indicator must agree before leveraged exposure is taken, the goal being to avoid acting on any single signal in isolation.",
      "Across roughly 14 years it compounds at {annualized_rate_of_return:0}% annualized, but it carries the deepest max drawdown of the core TQQQ variants at {max_drawdown_abs:0}, with {standard_deviation:0} volatility and a {sharpe_ratio} Sharpe and {calmar_ratio} Calmar. The long backtest is reassuring, but the relatively weak Calmar shows that requiring signal 'harmony' did not, historically, buy meaningfully better drawdown protection than simpler approaches, making it a solid but not standout member of the TQQQ family."
    ],
    "how_it_works": [
      "The Leveraged TQQQ Symphony refines the standard 'SPY above SMA equals TQQQ' approach with three overbought guards that can block entry even during confirmed uptrends. When SPY is above its SMA, the strategy checks three conditions before entering TQQQ: TQQQ RSI >79 (TQQQ is overbought), SPY RSI >80 (S&P is overbought), and, uniquely, SPY 60-period RSI >60 (medium-term momentum is extended). All three must be absent for the strategy to hold TQQQ.",
      "The 60-period RSI check is the symphony's distinguishing feature. While short-term RSI (14-period) can look normal even during extended rallies, the 60-period RSI captures medium-term overbought conditions that develop over weeks. A 60-period SPY RSI above 60 signals that the market has been trending strongly for an extended period, increasing the risk of a mean-reversion event. The strategy accepts missed upside during these extended runs to reduce exposure near tops.",
      "When SPY is below its SMA, the strategy uses QQQ's own price vs. SMA and a cumulative return threshold: if QQQ is above its SMA but has already gained more than 5.5% cumulatively (momentum chasing risk), the strategy abstains. If QQQ has not yet rallied far, it buys TQQQ as a recovery play. When QQQ is also below its SMA, it holds SH."
    ],
    "signals": [
      {
        "name": "SPY SMA Trend Gate",
        "tag": "200d-ma",
        "description": "SPY price vs. SMA is the primary trend classifier, uptrend mode applies three overbought guards; downtrend mode uses QQQ momentum checks."
      },
      {
        "name": "60-Period SPY RSI Filter",
        "tag": "rsi",
        "description": "Unique medium-term check: RSI(60)(SPY) >60 blocks TQQQ entry in uptrends even when short-term RSI looks healthy."
      },
      {
        "name": "TQQQ/SPY Overbought Guards",
        "tag": "rsi",
        "description": "Short-term RSI on TQQQ (>79) and SPY (>80) as first-pass overbought checks before the 60-period filter."
      },
      {
        "name": "QQQ Cumulative Return Cap",
        "tag": "momentum",
        "description": "CumReturn(QQQ) >5.5% prevents momentum-chasing entries when QQQ is above SMA but has already rallied significantly."
      },
      {
        "name": "UVXY Volatility Check",
        "tag": "vix-tiers",
        "description": "Inherited from Frontrunner: UVXY RSI >65 routes to SPXU or TQQQ based on SPY trend direction."
      },
      {
        "name": "Leveraged ETFs",
        "tag": "leveraged-etfs",
        "description": "TQQQ is the risk-on position; TECL used for TQQQ RSI <31 dip entries; SH is the defensive hold."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "TQQQ, UPRO, TECL and SOXL. It carries one of the deeper drawdowns among the zoop symphonies.",
      "backtest_limits": "Bounded by SOXL, the record begins in 2012 and contains no 2008 financial crisis.",
      "signal": "A 60-period RSI guard and a cumulative return cap reduce the frequency of overbought entries. Neither can prevent losses once the underlying trend reverses sharply.",
      "hedge": "SH and SPXU are the inverse legs, and there is no volatility position.",
      "concentration": "The strong trailing returns and the drawdown are the same phenomenon: full allocation to one leveraged growth position when invested."
    },
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-tqqq-200d-ma-3x-2026",
    "hidden": true,
    "name": "zoop's TQQQ 200d MA 3x Leverage (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/ZBpjzxS9RkLzft9NNWhO/details",
    "symphony_id": "ZBpjzxS9RkLzft9NNWhO",
    "annualized_rate_of_return": 1.0641801803003403,
    "max_drawdown": -0.38973340318602945,
    "cumulative_return": 33408.679141,
    "calmar_ratio": 2.7305336714810164,
    "sharpe_ratio": 1.617404571265624,
    "standard_deviation": 0.5343875194386175,
    "min": -0.1537814902190372,
    "mean": 0.0034298445109814182,
    "median": 0.0018577345740680151,
    "max": 0.5462990440833142,
    "trailing_one_month_return": 0.11296812130432521,
    "trailing_three_month_return": 0.07557746112237429,
    "trailing_one_year_return": 0.7014193130653374,
    "backtest_days": 3621,
    "description": "The most straightforward strategy in the library: hold TQQQ when QQQ is above its 200-day moving average, otherwise hold cash. Simple, transparent, and historically powerful.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "200d-ma",
      "vix-tiers",
      "inverse-etfs",
      "zoop"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "This is the simplest, most transparent strategy in the library: hold TQQQ when QQQ is above its 200-day moving average, otherwise move to cash, with the Frontrunner base handling opportunistic dip-buys. The single 200-day MA gate is one of the most studied and durable trend filters in systematic investing, and the appeal here is exactly that legibility. Anyone can understand, audit, and trust the rule, with no opaque stack of tuned thresholds.",
      "Over roughly 14 years it returns {annualized_rate_of_return:0}% annualized with a {max_drawdown_abs:0} max drawdown, {standard_deviation:0} volatility, and a {sharpe_ratio} Sharpe and {calmar_ratio} Calmar, performance fully competitive with far more complex variants. That is the noteworthy point: a one-rule strategy matches the multi-signal symphonies, a strong argument that most of the value comes from the trend gate itself rather than the added complexity. Its low overfitting risk and interpretability make it an excellent baseline for understanding leveraged trend-following."
    ],
    "how_it_works": [
      "TQQQ 200d MA 3x Leverage is the most transparent TQQQ strategy in the suite: the second component (50% weight) checks TQQQ's own price directly against its simple moving average, not SPY, not QQQ, but TQQQ itself. When TQQQ is above its SMA and RSI is below 77 (a slightly more sensitive overbought threshold than the 79-80 used elsewhere), the strategy holds TQQQ. When TQQQ is overbought or below its SMA, it moves to SH.",
      "The only exception to the strict SMA rule is an extreme oversold dip-buy: if TQQQ RSI falls below 30 while below the SMA, the strategy buys TQQQ against the trend as a mean-reversion bet, treating RSI <30 as a high-probability recovery signal that temporarily overrides the SMA exit. Outside of this exception, the strategy is a clean and auditable one-decision system: above SMA and not overbought equals TQQQ, everything else equals SH.",
      "The Frontrunner component (the other 50%) adds the standard oversold entries for semiconductors, Nasdaq, and S&P via RSI(10), plus the VXX/SPXU volatility routing through UVXY. The combined strategy uses the TQQQ SMA rule for its default path and Frontrunner's extreme-condition overrides for edge cases, making it one of the easiest to understand and audit in the entire library."
    ],
    "signals": [
      {
        "name": "TQQQ Price vs. SMA",
        "tag": "200d-ma",
        "description": "Primary signal: hold TQQQ when TQQQ's own price is above its SMA; hold SH when below."
      },
      {
        "name": "TQQQ RSI (77/30 Thresholds)",
        "tag": "rsi",
        "description": "RSI >77 triggers SH (overbought exit); RSI <30 overrides the SMA rule to buy an extreme dip."
      },
      {
        "name": "RSI(10) Dip-Buys (via Frontrunner)",
        "tag": "rsi",
        "description": "10-period RSI entries on SMH (<23), QQQ (<28), SPY (<28) from the Frontrunner component."
      },
      {
        "name": "UVXY Volatility Routing",
        "tag": "vix-tiers",
        "description": "UVXY RSI >65 routes to SPXU or TQQQ based on SPY trend direction, inherited from Frontrunner."
      },
      {
        "name": "Leveraged ETFs",
        "tag": "leveraged-etfs",
        "description": "TQQQ is the sole risk-on asset; SH is the defensive asset, the cleanest binary in the library."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "TQQQ, UPRO and SOXL long, SPXU inverse. TQQQ can fall 30 to 40 percent before it crosses below its own 200-day average, so the gate limits how long a decline is held, not how deep it gets before the exit.",
      "backtest_limits": "Bounded by SOXL, the record begins in 2012 and contains no 2008 financial crisis.",
      "signal": "A single moving-average crossing is the whole signal, so it can be whipsawed in choppy markets near the average. That transparency is the tradeoff: this is the most auditable and explainable entry point in this library for someone new to systematic leveraged strategies.",
      "hedge": "SH and SPXU are the inverse legs, and neither is a volatility position.",
      "concentration": "Five instruments in total, all US large-cap or semiconductor index leverage."
    },
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-soxl-growth-2026",
    "hidden": true,
    "name": "zoop's SOXL Growth (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/wcEUcb13v7M8bEluRc1h/details",
    "symphony_id": "wcEUcb13v7M8bEluRc1h",
    "annualized_rate_of_return": 1.5808224975385579,
    "max_drawdown": -0.6570146997696064,
    "cumulative_return": 828334.402135,
    "calmar_ratio": 2.40606868931989,
    "sharpe_ratio": 1.7222598421181903,
    "standard_deviation": 0.68429227708243,
    "min": -0.21153412645395864,
    "mean": 0.004676702813851916,
    "median": 0.001172335560026827,
    "max": 0.5462991511698583,
    "trailing_one_month_return": -0.10388465267169877,
    "trailing_three_month_return": -0.10315505214036036,
    "trailing_one_year_return": 3.6103600550017383,
    "backtest_days": 3621,
    "description": "The highest-risk, highest-return strategy among the zoop symphonies. Uses SOXL (3x Semiconductors) as its core instrument, accepting the most extreme drawdowns in exchange for explosive growth potential.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "max-drawdown",
      "vix-tiers",
      "standard-deviation",
      "inverse-etfs",
      "zoop"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "This is the most aggressive zoop symphony, using SOXL (3x Semiconductors) as its core growth engine, governed by RSI, momentum, and volatility signals plus the Frontrunner base. Semiconductors are among the highest-beta corners of the market, and 3x leverage on top compounds that volatility. The strategy deliberately accepts extreme swings in exchange for the explosive upside that semiconductor leadership can deliver during a tech bull run.",
      "The numbers make the trade-off explicit: {annualized_rate_of_return:0}% annualized over roughly 14 years, but a brutal {max_drawdown_abs:0} max drawdown and {standard_deviation:0}% volatility, the highest-risk profile of the zoop set, which is why it carries max-drawdown and standard-deviation tags. Its {sharpe_ratio} Sharpe and {calmar_ratio} Calmar are respectable only because the returns are so large. This is a strategy for investors with the highest risk tolerance and a long horizon who can psychologically and financially survive losing roughly two-thirds of peak value."
    ],
    "how_it_works": [
      "SOXL Growth is structurally unique in the library: its primary signal is MaxDD (running maximum drawdown) of SOXL rather than a price-vs-SMA comparison. When SOXL's maximum drawdown reaches or exceeds 50%, the strategy enters a 'deep drawdown mode' where it calibrates position size using TQQQ's standard deviation of daily returns as a secondary volatility gauge. Low TQQQ volatility (std-dev ≤ 3.8%) routes to a three-ETF basket of SOXL, TQQQ, and SPXL; higher volatility triggers further branching based on TQQQ RSI and cumulative return readings.",
      "When SOXL's max drawdown is below 50% (a 'normal' drawdown regime), the strategy switches to using SOXL's own RSI and standard deviation. Below RSI 62.2 with low volatility (std-dev ≤ 4.92%), it holds SOXL alone. As RSI or volatility rises, nuanced sub-conditions comparing cumulative returns and MaxDD(TQQQ) thresholds determine whether to stay in SOXL, expand to a basket, or shift to SH.",
      "The risk-on basket in both regimes frequently includes TMF (3x 20-year Treasury Bull) or TMV (3x 20-year Treasury Bear) alongside SOXL, using Treasury duration exposure as a hedge within the leveraged position itself. This Treasury pairing inside an equity basket is a distinctive feature not found in the other zoop strategies, reflecting a more portfolio-construction-aware approach to managing semiconductor 3x leverage."
    ],
    "signals": [
      {
        "name": "MaxDD(SOXL) Regime Gate",
        "tag": "max-drawdown",
        "description": "SOXL running maximum drawdown ≥50% triggers 'deep drawdown mode' with TQQQ volatility-based allocation calibration."
      },
      {
        "name": "Standard Deviation Filters",
        "tag": "momentum",
        "description": "TQQQ and SOXL daily return standard deviation thresholds (3.8%, 4.92%, 5.41%, 18%) classify volatility regime within each MaxDD branch."
      },
      {
        "name": "SOXL/TQQQ RSI and Cumulative Returns",
        "tag": "rsi",
        "description": "SOXL RSI (62.2, 57.5), TQQQ RSI (≥50), and cumulative returns (-12%, -20%) calibrate position choice within each MaxDD regime."
      },
      {
        "name": "TMF/TMV Treasury Pairing",
        "tag": "leveraged-etfs",
        "description": "Long and inverse Treasury ETFs held alongside equity positions as an in-position duration hedge, not a standalone defensive asset."
      },
      {
        "name": "UVXY Volatility Check",
        "tag": "vix-tiers",
        "description": "UVXY RSI >65 routes to SPXU or TQQQ: inherited from the Frontrunner component (50% weight)."
      }
    ],
    "risk_profile": {
      "verdict": "Extremely Aggressive",
      "leverage": "SOXL's 3x semiconductor leverage produces the most extreme price swings of any instrument in this suite, and this is the highest-risk strategy among the zoop symphonies on both drawdown and volatility. TMF and TMV add 3x long and short Treasury exposure on top.",
      "backtest_limits": "Bounded by SOXL, the record begins in 2012 and contains no 2008 financial crisis. It does contain the 2022 semiconductor bear, which is where much of the drawdown comes from.",
      "signal": "Max drawdown and standard deviation signals help time entries and exits, but both are computed from realised volatility, so they respond after a move rather than ahead of one.",
      "hedge": "SH and SPXU are the inverse legs, both broad-market rather than semiconductor. TMF is the closest thing to ballast here, and it failed in that role in 2022 when bonds and equities fell together.",
      "concentration": "Semiconductor sector concentration means a major sector drawdown can produce 60 to 80 percent peak-to-trough losses even with protective routing.",
      "suitability": "Only appropriate as a small satellite allocation within a diversified portfolio."
    },
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "s90-half-low-catch",
    "name": "s90 50/40 maxDD (Half Low Catch)",
    "symphony_url": "https://app.composer.trade/symphony/K8ql2SKFd4VDBemIstEr/details",
    "symphony_id": "K8ql2SKFd4VDBemIstEr",
    "annualized_rate_of_return": 4.698815244112119,
    "max_drawdown": -0.4098969834429015,
    "cumulative_return": 64.687383,
    "calmar_ratio": 11.463405279650374,
    "sharpe_ratio": 2.5785312918457013,
    "standard_deviation": 0.7884814491242326,
    "min": -0.16107397204071916,
    "mean": 0.008067952736534437,
    "median": 0.0035055523003677536,
    "max": 0.5462751143280877,
    "trailing_one_month_return": -0.03496827249162604,
    "trailing_three_month_return": -0.15056676549356374,
    "trailing_one_year_return": 4.782322237563528,
    "backtest_days": 605,
    "description": "An equal-weighted 50/50 blend of a 'low catchers' waterfall that waits for catastrophic 3x ETF crashes across semiconductors, biotech, China, financials, small caps, and global markets at RSI thresholds far below typical oversold levels, and a full 's90 50/40 maxDD' bull/bear regime strategy that stays actively invested in leveraged equities and volatility hedges.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "vix-tiers",
      "mean-reversion"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "This strategy is an equal-weighted 50/50 blend of two components that run side by side. The 'low catchers' half is a waterfall of extreme oversold triggers across 3x ETFs (semiconductors, biotech, China, financials, small caps, global markets) that stays dormant until an asset reaches a genuine washout, then buys the snapback at RSI levels far below conventional oversold thresholds. The other half is a complete 's90 50/40 maxDD' bull/bear regime strategy that is always invested, rotating between leveraged equity baskets (SOXL, TQQQ, TECL, UPRO), volatility hedges (UVXY, VIXY), and a small BIL/GLD/TLT ballast sleeve. So the portfolio is never wholly idle: one half hunts capitulation while the other actively trades the trend.",
      "Its backtested figures are spectacular ({annualized_rate_of_return:0} annualized, a {sharpe_ratio} Sharpe, and an {calmar_ratio} Calmar with a {max_drawdown_abs:0} max drawdown) but they demand heavy skepticism. The backtest is just 2.4 years ({backtest_days} trading days), by far the shortest in the library, and a strategy weighted half toward deep-dip-buying will look extraordinary in any window that happens to contain sharp V-shaped recoveries. These returns are almost certainly not repeatable out-of-sample; the strategy is best viewed as an illustration of the mean-reversion-plus-regime concept rather than a realistic expectation, and the short, period-specific backtest is its single most important caveat."
    ],
    "how_it_works": [
      "This strategy is an equal-weighted 50/50 combination of two independent components that run at the same time. The first, 'low catchers,' is a waterfall of extreme oversold conditions across a diversified basket of 3x leveraged ETFs that holds nothing until a genuine washout appears; unlike the other strategies in this library that use RSI extremes in the 22-31 range, it pushes entry thresholds far lower, as tight as RSI 14 for some ETFs. The second, 's90 50/40 maxDD,' is a complete bull/bear regime strategy (described below) that is always invested. Because the two halves are equal-weighted, the portfolio always has the regime component working even while the low-catchers half waits for a crash.",
      "The low-catchers component opens with two initial gates: if QQQ's 10-day moving-average return falls below -2.4% (broad Nasdaq deterioration), the strategy buys SOXL. If QQQ is not yet weak, it checks for catastrophic SOXL crashes directly, a 1-day return below -31%, 2-day cumulative return below -37%, or 5-day cumulative return below -57% each trigger a SOXL entry. These are flash-crash and multi-day collapse conditions, not routine corrections. When UVXY's 10-period RSI exceeds 88, far above the 65 threshold used elsewhere in this library, the strategy also buys SOXL, treating extreme volatility panic as a contrarian semiconductor buy signal.",
      "After the SOXL-specific triggers, the low-catchers component cascades through individual 3x ETF RSI checks in strict priority order: LABU (3x biotech) RSI < 22, YINN (3x China) RSI < 14, UDOW (3x Dow) RSI < 18, FAS (3x financials) RSI < 15, TNA (3x small cap) RSI < 16, URTY (3x Russell 2000) RSI < 16, KORU (3x South Korea) RSI < 17, NAIL (3x homebuilders) RSI < 15, and additional ETFs further down the tree. Each asset independently catches its own sector's extreme bottom, and if none triggers the low-catchers half simply holds nothing that day. The other half, the 's90 50/40 maxDD' regime strategy, first applies the same SOXL crash gates and then splits on SPY's 200-day moving average into a Bull Market and a Bear Market branch. Each branch runs a long ladder of overbought RSI ceilings that rotate into UVXY or VIXY volatility hedges near froth, holds equal-weighted SOXL/TQQQ/TECL or roughly 80% UPRO when the trend is intact, and in the bear branch reserves a small ballast sleeve of about 6.7% each in BIL, GLD and TLT, the drawdown-control element the '50/40 maxDD' name refers to."
    ],
    "signals": [
      {
        "name": "Extreme Multi-ETF RSI Waterfall",
        "tag": "rsi",
        "description": "10-period RSI thresholds of 14–22 across LABU, YINN, UDOW, FAS, TNA, URTY, KORU, NAIL, and others, the tightest RSI entry gates in the library."
      },
      {
        "name": "SOXL Multi-Window Crash Detection",
        "tag": "momentum",
        "description": "1-day (<-31%), 2-day (<-37%), and 5-day (<-57%) cumulative return checks on SOXL trigger semiconductor entries at catastrophic crash levels."
      },
      {
        "name": "QQQ Trend Gate",
        "tag": "momentum",
        "description": "QQQ 10-day moving-average return < -2.4% triggers SOXL as a broad Nasdaq deterioration entry."
      },
      {
        "name": "UVXY Extreme Fear Signal",
        "tag": "vix-tiers",
        "description": "UVXY RSI(10) > 88: far above the library standard of 65, triggers SOXL as a contrarian panic-buy at extreme volatility spikes."
      },
      {
        "name": "Diversified 3x Leveraged Basket",
        "tag": "leveraged-etfs",
        "description": "SOXL, LABU, YINN, UDOW, FAS, TNA, URTY, KORU, NAIL, nine or more 3x leveraged ETFs across sectors and geographies, each caught at their own extreme RSI bottom."
      }
    ],
    "risk_profile": {
      "verdict": "Extremely Aggressive",
      "leverage": "A large leveraged universe: SOXL, TQQQ, TECL, UPRO, UDOW, URTY, TNA, FAS, LABU, DPST, NAIL, KORU, YINN, BITX, AGQ, UGL and TMF, with SQQQ, SBIT, GLL and ZSL on the short side. It is among the most volatile strategies in this library.",
      "backtest_limits": "This is the shortest record here, roughly 2.4 years from early 2024, bounded by SBIT. The extraordinary annualised return and risk-adjusted ratios reflect a predominantly bull market containing exactly the volatility spikes this strategy is built to catch. They should be read with significant caution, and a longer out-of-sample record is required before they can be taken at face value.",
      "signal": "Only the low-catchers half sits idle waiting for extremes; the other half is a fully-invested bull/bear regime strategy, so the portfolio is not mostly in cash. BIL appears only as a small ballast sleeve in the bear branch. The low drawdown relative to the volatility owes more to the regime half's overbought volatility hedges and to the short, favourable test window than to sitting out.",
      "hedge": "UVXY, VIXY, SQQQ, TLT and SBIT are all reachable, so both volatility and inverse legs exist. UVXY and VIXY decay from VIX futures roll costs and work only as short-term positions.",
      "concentration": "Twenty-seven instruments are reachable, but the deployment rule concentrates capital into whichever one is at an extreme. Breadth of universe is not breadth of position."
    },
    "author_note": "Note: Backtest covers approximately 2.4 years (about {backtest_days} trading days from early 2024). All metrics reflect this short window. Interpret with caution. Metrics are accurate as of the last_updated date.",
    "tldr": {
      "thesis": "Two strategies share the book in equal halves. One is a 21-rung ladder waiting for catastrophic oversold prints in leveraged sector funds, which is the half the name advertises. The other is a complete bull/bear engine that is almost always holding leveraged equity. In a reconstruction of the logic over real prices the ladder found something to buy on 15 of {backtest_days} days, so for roughly 97 days in every 100 this is the engine running on the whole portfolio and the low catchers are machinery sitting idle.",
      "works_well_in": [
        "Sustained equity uptrends, which is nearly the whole record. The engine splits on whether SPY closes above its 200-day average, and in a reconstruction over real prices that test passed on 91.1% of days. Its default state on the other side of that gate is 3x long the S&P.",
        "Sharp panics that resolve quickly, because the volatility legs were timed well rather than held. Across only the days the logic named them, UVXY compounded +107.0% over 55 days and VIXY +54.6% over 76 days, while over the backtest window itself those two funds fell 88.6% and 66.7%.",
        "A genuine blow-off top in a metal. The single low-catcher rung that fires with any regularity is the short-silver one, and across its ten fires it returned +105.3%, though +49.4% of that came from one session on 30 January 2026."
      ],
      "struggles_in": [
        "A real bear market, which the record does not contain. The engine's bear branch ran on 53 of {backtest_days} days, in four short stretches between March 2025 and April 2026. Nothing here shows what the logic does in a decline that lasts quarters rather than weeks.",
        "Whipsaw around the 200-day average, where the entire engine changes character on a single crossing. There is no buffer or confirmation on that gate: one close either side of the line swaps a 3x-long default for a branch that can hold volatility.",
        "Any market that does not produce extremes. The low-catcher ladder only pays when something falls far enough to trip a threshold set well below conventional oversold, and 16 of its 21 rungs never fired once in the reconstruction.",
        "Conditions where the cost of holding matters more than the direction. Roughly 22% of days hold a volatility fund, and both UVXY and VIXY lose value structurally whenever they are held for longer than the move they were bought for."
      ]
    },
    "assumptions": {
      "market": [
        "**The 2024 to 2026 window is representative of the future.** This is the largest assumption on the page, and a bigger one here than anywhere else in the library. The backtest is {backtest_days} trading days, the shortest of any strategy here, and it contains one long equity bull market: SPY rose 51.7% across it while SOXL rose 160.0%. Its only declines were brief.",
        "**Leveraged sector funds mean-revert from extremes.** Every rung of the low-catcher ladder is a bet that a fund which has fallen far enough will bounce rather than keep falling. That is a bet the record barely tests, because the thresholds are set so low that almost nothing reached them.",
        "**A 200-day moving average is the right way to tell a bull market from a bear one.** It is the only thing separating the two halves of the engine, and it is a single unbuffered comparison of one close against one average.",
        "**Volatility can be bought profitably as a long position rather than a hedge.** In a sustained uptrend the bull branch buys VIXY when SPY's 60-day or 200-day RSI runs hot, which is a bet against the trend the same branch is otherwise riding."
      ],
      "structural": [
        "**16 of the 21 low-catcher rungs never fired.** In a reconstruction of the logic over real prices across the backtest window, only five ever selected anything: the 2-day SOXL crash rung once, the UVXY spike rung twice, the homebuilder rung once, the bitcoin rung once, and the short-silver rung ten times. The biotech, China, Dow, financials, small-cap, Korea, regional-bank, bond and gold rungs did not trigger on a single day. The ladder the strategy is named for is mostly untested rather than proven.",
        "**One nested test in the bear branch can never pass.** The logic asks whether UVXY's 10-day RSI is above 99 and then, inside that branch, whether the same reading is below 84. Nothing satisfies both, so the UVXY and BIL pair behind the inner test is unreachable and that branch always resolves to SOXL.",
        "**The bull branch carries two assets at zero weight.** Its split allocates 100% to the decision tree and exactly 0% to both GLD and SPY. They appear in the asset list and can never receive capital from that branch.",
        "**The bear branch is only 80% logic.** The remaining fifth is a fixed sleeve of BIL, GLD and TLT at roughly 6.67% each, held regardless of what the tree decides. Since the bear branch ran on 53 days, that sleeve is a small part of a small part of the record.",
        "**Thresholds are tuned to the digit.** RSI limits of 22, 14, 18, 15, 16, 17, 10, 9, 12, 88, 92 and 99 sit beside return limits of -31%, -37%, -57%, -25%, -20%, -16% and -24%. Nothing in the logic explains why any of them is that number rather than the one beside it, and the symphony's own title records a target Sharpe and standard deviation, which is what a fitted result looks like.",
        "**The backtest cannot start earlier, and the reason is an asset the logic never buys.** SBIT, the inverse bitcoin fund, first traded on 2 April 2024 and is the youngest instrument in the universe. From its first close to the last day in this project's price data is 604 trading days, against the {backtest_days} the pipeline records. SBIT is reachable only from the final low-catcher rung, which never fired.",
        "**These are leveraged and inverse funds, and several are thinly traded.** The universe runs to 27 instruments including 3x sector funds, 2x metals funds and inverse bitcoin. Modelled slippage of 0.50% is written into the symphony's own title, which is an unusually frank admission that fills are expected to cost real money."
      ]
    },
    "regimes": [
      {
        "regime": "Sustained equity bull",
        "expected": "Strong",
        "why": "SPY holds above its 200-day average, the engine's default state is 3x long, and the low catchers stay idle. This is the state the headline return was earned in.",
        "example": "1 Apr to 10 Jul 2024: SPY +7.8%, SOXL +43.3%, TECL +39.0%."
      },
      {
        "regime": "Sharp panic, quick resolution",
        "expected": "Strong",
        "why": "The crash rungs and the volatility legs both fire, and the recovery is fast enough that the leveraged longs are back on before the bounce finishes.",
        "example": "3 to 8 Apr 2025, the tariff selloff: SPY -7.5%, SOXL -27.7%, UVXY +54.4%."
      },
      {
        "regime": "Rebound off a panic low",
        "expected": "Strong",
        "why": "The engine returns to leveraged equity while the recovery runs, and the semiconductor leg is the most levered way it can express that.",
        "example": "9 Apr to 30 Jun 2025: SOXL +97.3%, TECL +81.0%, UVXY -42.5%."
      },
      {
        "regime": "Extended drawdown below the 200-day",
        "expected": "Mixed",
        "why": "The bear branch takes over and can hold volatility or inverse funds, but it ran on only 53 days in the whole record, so this is the least evidenced state on the page.",
        "example": "19 Feb to 8 Apr 2025: SPY -18.8%, SOXL -73.7%, UVXY +173.1%, SQQQ +103.6%."
      },
      {
        "regime": "Metal blow-off and crash",
        "expected": "Strong, and almost entirely untested",
        "why": "The short-silver rung is the only low catcher that fires with any regularity. It sells strength rather than buying weakness, which makes it the odd one out in a ladder described as catching lows.",
        "example": "The rung fired on 10 days and returned +105.3%. On 30 Jan 2026 alone SLV fell 28.5%, the largest single-day fall in this site's price history, which begins in 2010, and ZSL rose 49.4%."
      },
      {
        "regime": "Prolonged bear market",
        "expected": "Unknown",
        "why": "There is no such period in the record. The longest continuous stretch below the 200-day average was 24 trading days. Every figure on this page describes a market that recovered quickly.",
        "example": "Bear branch spans: 10 to 21 Mar 2025, 26 Mar to 3 Apr 2025, 7 Apr to 9 May 2025, and 20 Mar to 7 Apr 2026."
      }
    ],
    "regime_note": "**The example column is what the holdings did, not what the strategy returned.** Each figure is the move in that ticker between the first and last trading day of the window, computed from daily closes. The regimes themselves were identified by reconstructing this strategy's state machine over those same closes, which is a reading of the logic rather than a backtest: it carries no fees, no slippage and no rebalance timing, and it answers only which asset the rules would name on a given day. It reproduces the split the strategy is built around, finding the engine on the whole portfolio for 590 of {backtest_days} days and the low catchers active on the other 15, which is the reason it is trusted this far and no further. Prices for 13 of the 27 instruments are not carried in this site's own price file and were fetched separately from the same source for this analysis."
  },
  {
    "slug": "holy-grail",
    "name": "The Holy Grail (Original)",
    "symphony_url": "https://app.composer.trade/symphony/MmQbpf2U5TMQFmr9Nt2e/details",
    "symphony_id": "MmQbpf2U5TMQFmr9Nt2e",
    "annualized_rate_of_return": 1.501603164266371,
    "max_drawdown": -0.4742009103291279,
    "cumulative_return": 836966.9839189999,
    "calmar_ratio": 3.166596966724833,
    "sharpe_ratio": 1.7723461845619297,
    "standard_deviation": 0.6252848994488444,
    "min": -0.22093817160406937,
    "mean": 0.004397703594453766,
    "median": 0.003253490325409114,
    "max": 0.5001155878592585,
    "trailing_one_month_return": 0.11296809364591054,
    "trailing_three_month_return": -0.1453643536462672,
    "trailing_one_year_return": 0.5278989318368661,
    "backtest_days": 3747,
    "description": "A TQQQ-centric trend-following strategy that stays long leveraged tech in bull markets, hedges to UVXY when overbought, and rotates into dip-buying or short positions when TQQQ breaks below its 200-day moving average.",
    "tags": [
      "rsi",
      "200d-ma",
      "leveraged-etfs",
      "momentum",
      "inverse-etfs",
      "original"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "The original Holy Grail is a TQQQ-centric trend-follower: it stays long leveraged tech while TQQQ holds above its 200-day moving average, hedges into UVXY when the market is overbought, and rotates into dip-buying or outright short positions once TQQQ breaks below the 200-day line. The logic is a clean three-state machine of bull (long leverage), froth (volatility hedge), and bear (dip-buy or short), designed to participate fully in uptrends while having explicit, pre-defined responses to overheating and to regime breakdown.",
      "Over a long 15-year backtest it returns {annualized_rate_of_return:0} annualized with a {sharpe_ratio} Sharpe and {calmar_ratio} Calmar, while the {max_drawdown_abs:0} max drawdown and {standard_deviation:0} volatility mark it as aggressive. The lengthy test window through multiple bear markets is a meaningful strength, and the explicit short and hedge branches mean it is built to profit from, not merely survive, downturns. It suits investors who want active bull-and-bear leveraged tech exposure governed by a transparent moving-average regime rule."
    ],
    "how_it_works": [
      "The Holy Grail uses TQQQ's own 200-day moving average as the primary regime gate. When TQQQ is trading above its 200d MA, the strategy enters bull mode and holds an RSI-gated TQQQ position. Within bull mode, if TQQQ's RSI(10) exceeds 79, signaling short-term overbought conditions, the position pivots to UVXY (a leveraged long VIX-futures ETF) as a defensive hedge. Otherwise, the strategy holds TQQQ directly. Each state holds a single asset at full weight and the symphony has no fixed rebalance schedule, so it simply stays in the selected position until a signal flips it, keeping turnover tied to how often the regime and RSI gates change.",
      "When TQQQ falls below its 200-day moving average (bear mode), the strategy shifts to opportunistic dip-buying. The first gate checks if TQQQ RSI(10) is below 31; if so, it buys TECL (3x Technology) as the most beaten-up leveraged tech proxy. If TQQQ RSI isn't that extreme, it checks SOXL RSI(10) below 30 and buys SOXL (3x Semiconductors) as an alternative crash entry. These two sequential checks are designed to capture violent capitulation bounces in tech and semiconductor markets during corrections.",
      "If neither dip-buy condition triggers in bear mode, the strategy evaluates TQQQ relative to its 20-day moving average. If TQQQ is also below the 20d MA, it runs a relative RSI filter between SQQQ (3x inverse QQQ) and BSV (short-term bonds), selecting whichever shows higher RSI(10), either profiting from continued Nasdaq decline or rotating to capital preservation. If TQQQ is below its 200d MA but above the 20d MA, the strategy holds TQQQ outright, trusting the shorter-term uptrend to continue within the longer-term downtrend context."
    ],
    "signals": [
      {
        "name": "TQQQ 200-Day MA Trend Gate",
        "tag": "200d-ma",
        "description": "Primary regime filter: TQQQ's own price vs. its 200d MA. Above = bull mode (RSI-guarded TQQQ). Below = bear mode (dip-buying and defensive logic). Distinct from strategies using SPY as the trend reference."
      },
      {
        "name": "TQQQ RSI(10) Overbought Guard",
        "tag": "rsi",
        "description": "In bull mode: TQQQ RSI(10) > 79 -> rotate to UVXY. Prevents holding a massively extended leveraged position. The 79 threshold is tighter than the 80 commonly used, catching overbought conditions slightly earlier."
      },
      {
        "name": "Bear Dip-Buy: TECL & SOXL",
        "tag": "rsi",
        "description": "In bear mode: TQQQ RSI(10) < 31 -> buy TECL (3x Technology). SOXL RSI(10) < 30 -> buy SOXL (3x Semiconductors). Sequential checks catch tech and semiconductor capitulation events."
      },
      {
        "name": "Bear Momentum Filter: SQQQ vs BSV",
        "tag": "momentum",
        "description": "When in bear mode and no dip-buy triggers: RSI(10) filter between SQQQ and BSV. Selects the higher-RSI asset, either pressing the short-QQQ trade or rotating to short-term bonds for capital preservation."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "TQQQ, TECL and SOXL are the risk-on holdings. The drawdown reflects both the strategy's guardrails and the unavoidable severity of 3x leveraged drawdowns, and UVXY decays rapidly from VIX futures roll costs, so it is not viable as a long-term hold.",
      "backtest_limits": "Bounded by UVXY, the record begins in late 2011 and misses the 2008 financial crisis entirely. It shares that window exactly with TQQQ For The Long Term and Mean Reversion Comparison to Python Code, which makes those three directly comparable to each other and to nothing else in this library.",
      "signal": "Using TQQQ's own 200-day average rather than SPY's as the primary gate means the strategy can flip to bear mode purely from leveraged-instrument volatility: TQQQ can cross below its average while QQQ remains in an uptrend. Because each state holds a single asset at full weight with no fixed rebalance schedule, turnover is driven entirely by how often the regime and RSI gates flip rather than by periodic rebalancing.",
      "hedge": "SQQQ and UVXY are the defensive legs. UVXY functions here only as a short-term hedge during overbought extremes, because its roll decay makes any longer hold a losing position by construction.",
      "concentration": "Six instruments, all Nasdaq, technology or semiconductor exposure, with no non-equity ballast beyond BSV."
    },
    "tldr": {
      "thesis": "One gate decides everything: is TQQQ trading above its own 200-day moving average. Above it, the strategy is 3x long the Nasdaq unless a 10-day RSI above 79 flips it into UVXY for a few days. Below it, four nested tests choose between buying the dip in leveraged tech, going short, or parking in short-term bonds. It holds exactly one fund on every single day of the record, and that fund was TQQQ on 83.4% of all days. The Holy Grail is, in practice, leveraged Nasdaq with an exit.",
      "works_well_in": [
        "Long uptrends, which is most of the record. In a reconstruction of the logic over real prices, TQQQ closed above its 200-day average on 2,945 of {backtest_days} days, and above that gate the strategy held TQQQ on 95.1% of them. The {annualized_rate_of_return} annualized return is overwhelmingly this one state.",
        "Deep bear markets that last long enough for the gate to stay shut. Across the 2022 decline the reconstruction was in SQQQ or bonds for most of the span while SPY fell 24.5%, and SQQQ rose 120.7% over that window. This is the case the strategy was clearly designed for and the case it handles best.",
        "Vertical crashes, for the same reason. Through the COVID crash the reconstruction ended higher while SPY fell 33.7%, because the gate shut early and the short leg carried it. Across the days the rules named it, SQQQ compounded +680.9% over 195 days held.",
        "Frothy tops inside an uptrend. The RSI 79 test moved into UVXY on roughly 5% of above-gate days, and across the 143 days it was ever held UVXY compounded +1,493.3%, against a fund that loses value structurally over any longer horizon."
      ],
      "struggles_in": [
        "Short sharp selloffs, which is the single clearest weakness in the record. The gate shut 42 separate times and the median stretch below it lasted 4 trading days. 25 of those 42 stretches lasted 5 days or fewer, so most of the time the regime switch fires it is switching into a decline that is already over.",
        "Any decline where the bear branch stays long. Below the gate the logic still held TQQQ on 40.4% of days, because its innermost else returns to 3x long whenever TQQQ closes above its 20-day average. Being below the 200-day is not the same as being defensive here.",
        "Falling knives in semiconductors. The SOXL rung buys 3x semis when their 10-day RSI drops under 30, and it is the only leg in the entire strategy that lost money on the days it was held: -14.8% over 20 days.",
        "Choppy markets generally. The allocation changed on 348 of {backtest_days} days, about once every 11 trading days, and every one of those changes is a full move between single concentrated positions rather than a trim."
      ]
    },
    "assumptions": {
      "market": [
        "**The Nasdaq keeps outperforming, and leverage keeps paying for itself.** 83.4% of the capital in this strategy was in TQQQ, and that leg compounded +83,040.9% across the 3,125 days it was held. The {cumulative_return} headline is essentially a bet on 3x Nasdaq that was placed in 2011 and has been right ever since.",
        "**A 200-day moving average separates bull markets from bear markets.** This is the load-bearing assumption of the whole design. It is one close compared to one average, with no buffer, no confirmation window and no second opinion, and it was crossed 83 times in {backtest_years} years.",
        "**Oversold means cheap.** Two of the bear-branch tests buy weakness: TECL when TQQQ's RSI drops below 31, SOXL when its own RSI drops below 30. Both are 3x funds, so each is a bet that a violent decline reverses before leverage compounds against it.",
        "**Overbought means a top is near.** The RSI 79 test in the bull branch sells the trend it is otherwise riding and buys volatility instead. It worked across the record, but it is a countertrend bet inside a trend-following strategy."
      ],
      "structural": [
        "**The bear branch is long 3x Nasdaq on 40.4% of its days.** This is the most important thing on the page and it is not visible from the description. Below the 200-day gate the logic checks four conditions in order, and if none of them fires it holds TQQQ. In the Q4 2018 selloff the reconstruction fell 42.4% while SPY fell 19.2%, and TQQQ fell 57.5% across that window while SQQQ rose 92.7%.",
        "**The strategy is never diversified.** It holds exactly one fund on 100% of days across the entire record. There is no sleeve, no partial hedge and no cash buffer: every day is a single concentrated position in a leveraged or inverse fund, or in BSV.",
        "**The short-and-bonds choice is decided by relative RSI, not by direction.** When TQQQ is below both its 200-day and 20-day averages, the logic ranks SQQQ and BSV by 10-day RSI and takes whichever is higher. It is picking between a 3x inverse fund and a short-term bond fund on a momentum reading, so nothing in that test asks whether shorting is a good idea.",
        "**The safe asset is not very safe and not very productive.** BSV was held on 149 days and compounded +4.7% across them. It is the only unleveraged holding in a six-fund universe where every other name moves at three times the market or worse.",
        "**{standard_deviation} annualized volatility and a {max_drawdown_abs} maximum drawdown are the price of the record above.** A {sharpe_ratio} Sharpe and a {calmar_ratio} Calmar are strong, but they are computed on a path that nearly halved at its worst point, and the underlying holdings routinely move more than 5% in a day. The worst single day in the record was {worst_day}.",
        "**Thresholds are specific in a way the logic does not explain.** RSI limits of 79, 31 and 30, moving averages of 200 and 20 days, an RSI lookback of 10. Nothing in the design says why 79 rather than 78, and a strategy named The Holy Grail with a {sharpe_ratio} Sharpe over {backtest_years} years is exactly what a well-fitted rule set looks like.",
        "**The record starts in late 2011, so the 2008 crisis is absent.** The backtest covers {backtest_days} trading days beginning 3 October 2011, bounded by the launch of UVXY. The one environment that would most test a leveraged trend-follower, a multi-year bear market with a credit event inside it, is not in the sample."
      ]
    },
    "regimes": [
      {
        "regime": "Sustained uptrend",
        "expected": "Strong",
        "why": "TQQQ holds above its 200-day average and the strategy is simply 3x long the Nasdaq. This state covers 2,945 of {backtest_days} days and produced nearly all of the headline return.",
        "example": "2023 AI bull: SPY +26.7%, TQQQ +204.9%, and the reconstruction held TQQQ on 88% of days."
      },
      {
        "regime": "Long, deep bear market",
        "expected": "Strong",
        "why": "The gate stays shut long enough for the short leg to work, and the nested tests spend most of the decline in SQQQ or BSV rather than back in leveraged longs.",
        "example": "2022 bear market: SPY -24.5%, TQQQ -78.8%, SQQQ +120.7%. The reconstruction held SQQQ on 43% of days."
      },
      {
        "regime": "Vertical crash",
        "expected": "Strong",
        "why": "A fall fast enough to break the 200-day average decisively puts the strategy short while the decline is still running, and the inverse fund gains faster than the index falls.",
        "example": "COVID crash, 19 Feb to 23 Mar 2020: SPY -33.7%, TQQQ -69.8%, SQQQ +84.4%, UVXY +552.3%."
      },
      {
        "regime": "Short, sharp selloff",
        "expected": "Poor",
        "why": "The clearest weakness on the page. The gate shuts, but the bear branch's default is still TQQQ, so a decline can inflict full 3x losses before any defensive rung fires, and the reversal often comes before the strategy has committed.",
        "example": "Q4 2018 selloff: SPY -19.2%, TQQQ -57.5%. The reconstruction fell 42.4% despite holding SQQQ on 19% of days."
      },
      {
        "regime": "Choppy market around the 200-day",
        "expected": "Poor",
        "why": "Every crossing of an unbuffered gate is a full switch between concentrated leveraged positions. 25 of the 42 stretches below the gate lasted 5 trading days or fewer.",
        "example": "2015 to early 2016: SPY -12.2%, TQQQ -40.1%, and the reconstruction fell 33.0% while rotating between four funds."
      },
      {
        "regime": "Semiconductor capitulation",
        "expected": "Poor",
        "why": "The SOXL rung buys 3x semiconductors on a 10-day RSI below 30, which is a bet that the worst is over. It is the only leg in the strategy that lost money over the days it was held.",
        "example": "SOXL was named on 20 days across {backtest_days} and compounded -14.8% over them."
      }
    ],
    "regime_note": "**The example column is what the holdings did, not what the strategy returned.** Each ticker figure is the move in that fund between the first and last trading day of the window, computed from daily closes. The regimes themselves were identified by reconstructing this strategy's logic over those same closes, which is a reading of the rules rather than a backtest: it carries no fees, no slippage and no rebalance timing, and it answers only which fund the rules would name on a given day. Where a percentage is attributed to the reconstruction it is quoted to rank a regime as strong or poor, never as a return you could have earned. The reconstruction covers {backtest_days} trading days from 3 October 2011 to 27 August 2026, matching the backtest window on record."
  },
  {
    "slug": "tqqq-long-term",
    "name": "TQQQ For The Long Term (Original)",
    "symphony_url": "https://app.composer.trade/symphony/HukRwDJLlYPLMbrQbua5/details",
    "symphony_id": "HukRwDJLlYPLMbrQbua5",
    "annualized_rate_of_return": 1.6037497821234186,
    "max_drawdown": -0.5362580154101068,
    "cumulative_return": 1517797.753126,
    "calmar_ratio": 2.990630882965806,
    "sharpe_ratio": 1.8281970369273655,
    "standard_deviation": 0.6295112169014132,
    "min": -0.22093821652599954,
    "mean": 0.004566946593062317,
    "median": 0.0039023451988411395,
    "max": 0.5001157150653344,
    "trailing_one_month_return": 0.11296812132487744,
    "trailing_three_month_return": -0.19223164799534498,
    "trailing_one_year_return": 0.4591215655784422,
    "backtest_days": 3747,
    "description": "A TQQQ buy-and-hold strategy with systematic risk management: uses SPY's 200-day moving average to switch between bull-market momentum and bear-market defense, with dual overbought guards on TQQQ and SPXL, RSI-triggered dip-buying on TECL and UPRO, and bear-market RSI filtering between SQQQ and TLT.",
    "tags": [
      "rsi",
      "200d-ma",
      "leveraged-etfs",
      "momentum",
      "inverse-etfs",
      "original"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "This is a TQQQ buy-and-hold core wrapped in a comprehensive risk-management overlay. SPY's 200-day moving average sets the bull/bear regime; in bull markets it runs TQQQ with dual overbought guards on TQQQ and SPXL plus RSI-triggered dip-buying into TECL and UPRO, and in bear markets it filters between SQQQ and the TLT bond hedge by RSI. The purpose is to hold leveraged Nasdaq exposure for the long term while having layered, rules-based defenses against the drawdowns that destroy unhedged 3x positions.",
      "Across roughly 15 years it compounds at {annualized_rate_of_return:0} annualized with a strong {sharpe_ratio} Sharpe and {calmar_ratio} Calmar. The headline risk is a {max_drawdown_abs:0} max drawdown and {standard_deviation:0} volatility, among the deeper drawdowns here, a reminder that even a well-engineered overlay cannot fully tame 3x exposure. The long, multi-cycle backtest and the explicit bond-hedge bear branch are its strengths; it fits a long-horizon investor who wants leveraged tech with genuine defensive machinery rather than naked buy-and-hold."
    ],
    "how_it_works": [
      "TQQQ For The Long Term aims to capture TQQQ's long-run compounding potential while systematically managing the deepest drawdowns. The primary trend gate is SPY's 200-day moving average, when the broad market is in an established uptrend, the strategy runs in bull mode and holds TQQQ. In bull mode it applies two sequential overbought guards: if TQQQ RSI(10) exceeds 79, exit to UVXY; if SPXL (3x S&P500) RSI(10) exceeds 80, also exit to UVXY. These dual checks, one on the QQQ proxy, one on the SPY proxy, catch overbought conditions from two angles. The strategy rebalances daily, unlike the 5% corridor approach used by its cousin Holy Grail.",
      "When SPY falls below its 200-day moving average, the strategy enters bear mode and shifts to selective dip-buying. The first dip-buy check triggers on TQQQ RSI(10) below 31, buying TECL (3x Technology) as a crashed-tech bouncer. The second triggers on SPY RSI(10) below 30, buying UPRO (3x S&P500) on broad-market capitulation. These entries are designed to capture violent mean-reversion bounces at extreme fear levels, the strategy intentionally buys into falling markets at RSI extremes.",
      "If no dip-buy fires, the strategy evaluates TQQQ against its 20-day moving average. When TQQQ is below the 20d MA, it runs a relative RSI filter between SQQQ (3x inverse QQQ) and TLT (20+ Year Treasury Bond ETF), selecting the higher-RSI asset, either pressing the short-Nasdaq trade or taking refuge in long-duration bonds. A secondary check also looks for SQQQ RSI(10) below 31: an unusual signal that buys into the inverse ETF when it itself has become oversold, betting on a mean-reversion bounce in the short position after an extreme market bounce has crushed SQQQ. When TQQQ is above the 20d MA but still in a bear regime, the strategy holds TQQQ outright."
    ],
    "signals": [
      {
        "name": "SPY 200-Day MA Trend Gate",
        "tag": "200d-ma",
        "description": "Primary regime filter using the S&P 500 (not TQQQ) as the trend reference. SPY above 200d MA = bull mode (hold TQQQ). Below = bear mode. Key difference from Holy Grail: SPY 200d is a slower, more stable signal than TQQQ's own 200d MA."
      },
      {
        "name": "Dual Overbought Guard: TQQQ + SPXL RSI",
        "tag": "rsi",
        "description": "Two-layer overbought detection: TQQQ RSI(10) > 79 OR SPXL RSI(10) > 80 -> rotate to UVXY. Checking both the QQQ and SPY leveraged proxies adds redundancy and catches different overbought conditions."
      },
      {
        "name": "Bear Dip-Buy: TECL & UPRO",
        "tag": "rsi",
        "description": "Bear mode: TQQQ RSI(10) < 31 -> TECL (3x Tech dip-buy). SPY RSI(10) < 30 -> UPRO (3x SPY dip-buy). Two distinct dip-buy catches across tech and broad market, using different RSI reference tickers."
      },
      {
        "name": "Bear RSI Filter: SQQQ vs TLT",
        "tag": "momentum",
        "description": "When in bear mode below TQQQ 20d MA: RSI(10) filter between SQQQ and TLT. Selects the stronger momentum asset, either the inverse-QQQ short trade or long-duration treasury bonds as a safe haven."
      },
      {
        "name": "SQQQ Oversold Re-Entry",
        "tag": "rsi",
        "description": "Unusual signal: SQQQ RSI(10) < 31 -> buy SQQQ. Fires when the 3x inverse ETF has itself become oversold (meaning the market bounced hard enough to crush the short). Re-enters the short position at a more favorable level after mean-reversion."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "TQQQ, TECL and UPRO on the long side, SQQQ inverse, UVXY for volatility. Its max drawdown is deeper than its structure would suggest.",
      "backtest_limits": "Bounded by UVXY, the record begins in late 2011 and misses the 2008 financial crisis. It shares its window exactly with Holy Grail, so that comparison is like for like: this strategy's annualised return is slightly higher and its max drawdown materially worse.",
      "signal": "Using SPY's 200-day average as the gate means the strategy can stay in bull mode while TQQQ is already declining, creating a lag between the macro trend break and the defensive pivot. Daily rebalancing reduces drift but increases transaction friction, and the SQQQ dip-buy signal is counterintuitive and adds complexity.",
      "hedge": "SQQQ, UVXY and TLT are all reachable. Standard deviation nearly identical to Holy Grail's confirms both strategies spend similar time in high-volatility leveraged positions despite gating on different instruments.",
      "concentration": "Six instruments, all Nasdaq or technology exposure apart from TLT."
    },
    "tldr": {
      "thesis": "The name is honest about the intent and understates the machinery. This is a bet on 3x Nasdaq with an exit, gated on whether SPY closes above its own 200-day moving average. Above the gate it holds TQQQ unless either of two overbought checks flips it into UVXY. Below the gate, five nested tests pick between dip-buying leveraged tech, going short, and holding long bonds. It holds exactly one fund on every day of the record, and TQQQ was that fund on 85.3% of them, so the {cumulative_return} headline is overwhelmingly one position that has been right since 2011.",
      "works_well_in": [
        "Long uptrends. SPY closed above its 200-day average on 3,187 of {backtest_days} days in a reconstruction of the logic over real prices, and above that gate the strategy held TQQQ on 94.5% of them. Nearly all of the {annualized_rate_of_return} annualized return is this one state.",
        "Deep bear markets, where the short leg gets long enough to work. Across the 2022 decline the reconstruction held SQQQ on 42% of days while SPY fell 24.5% and SQQQ rose 120.7%. Over the whole record SQQQ compounded +870.3% across the 181 days the rules named it.",
        "Vertical crashes. Through the COVID crash the reconstruction ended sharply higher while SPY fell 33.7%, because the gate shut early and the defensive branches carried it.",
        "Frothy tops inside an uptrend. Two separate overbought checks, on TQQQ's 10-day RSI above 79 and SPXL's above 80, move to UVXY. They were followed on 174 days in total, and across those days UVXY compounded +2,285.2%, against a fund that decays structurally over any longer horizon."
      ],
      "struggles_in": [
        "Short sharp selloffs, the clearest weakness in the record. The gate shut 39 separate times and the median stretch below it lasted 5 trading days. 21 of those 39 lasted 5 days or fewer, so most of the time the regime switch fires, it fires into a decline that is nearly over.",
        "Declines the bear branch sits out. Below the gate the logic still held TQQQ on 32.5% of days, because its innermost tests hand back to 3x long whenever TQQQ is above its 20-day average and SQQQ is not oversold. Being below the 200-day is not the same as being defensive.",
        "Rate-driven selloffs, where the safe asset is not safe. TLT is the only leg in the strategy that lost money over the days it was held: -6.6% across 104 days. In 2022, the one bear market in the record, TLT fell 29.3% at the same time as stocks.",
        "Choppy markets generally. The allocation changed on 328 of {backtest_days} days, about once every 11 trading days, and each change is a full move between concentrated single positions in leveraged or inverse funds."
      ]
    },
    "assumptions": {
      "market": [
        "**The Nasdaq keeps outperforming, and leverage keeps paying for itself.** 85.3% of the capital was in TQQQ, and that leg compounded +81,066.2% across the 3,194 days it was held. Everything else in the logic is a modifier on that one position.",
        "**A 200-day moving average on SPY tells you the regime for a Nasdaq strategy.** The gate is measured on the S&P while every risk-on holding is Nasdaq or semiconductor leveraged. It is one close against one average, with no buffer and no confirmation, and it was crossed 77 times in {backtest_years} years.",
        "**Oversold means cheap, and the deeper the leverage the better the bounce.** The bear branch buys TECL when TQQQ's RSI drops below 31 and UPRO when SPY's drops below 30. Both are bets that a violent decline reverses before leverage compounds against them.",
        "**Long-duration Treasuries diversify equity risk.** TLT is the strategy's only defensive holding that is not an inverse fund. That relationship held for most of the record and broke in 2022, which is the one bear market the record contains."
      ],
      "structural": [
        "**Two of the seven conditions are close to decorative.** The SPY-oversold rung, which the description sells as dip-buying on UPRO, actually decided the day's holding 5 times in {backtest_years} years, and UPRO compounded +5.8% across those 5 days. The SQQQ-oversold rung decided 12 days. Both are true far more often than that, but the tests above them almost always resolve first, so they sit near the bottom of a chain that rarely reaches them.",
        "**The bear branch is long 3x Nasdaq on 32.5% of its days.** Below the gate the logic runs five tests in order and, when none of them fires, holds TQQQ. A decline can therefore inflict full 3x losses with the regime gate already shut. In the spring 2025 drawdown the reconstruction held TQQQ on 44% of days while TQQQ fell 56.8%.",
        "**The strategy is never diversified.** It holds exactly one fund on 100% of days across the entire record, with no sleeve, no partial hedge and no cash buffer.",
        "**The short-and-bonds choice is decided by relative RSI, not by direction.** When TQQQ is below its 20-day average, the logic ranks SQQQ and TLT by 10-day RSI and takes whichever is higher. It is choosing between a 3x inverse fund and a 20-year Treasury fund on a momentum reading, and nothing in that test asks whether shorting is a good idea or whether rates are rising.",
        "**{standard_deviation} annualized volatility and a {max_drawdown_abs} maximum drawdown are the price of the record above.** A {sharpe_ratio} Sharpe and a {calmar_ratio} Calmar are strong, but they describe a path that lost more than half its value at the worst point, and the worst single day in the record was {worst_day}.",
        "**Thresholds are specific in a way the logic does not explain.** Two overbought limits that differ by one point, 79 on TQQQ and 80 on SPXL, sit beside oversold limits of 31, 30 and 31, an RSI lookback of 10, and moving averages of 200 and 20 days. Nothing in the design says why 79 rather than 80 on the first test, or why the second needed to exist alongside it.",
        "**The record starts in late 2011, so the 2008 crisis is absent.** The backtest covers {backtest_days} trading days beginning 3 October 2011, and the longest continuous stretch below the gate in that whole span was 87 trading days. A multi-year bear market is not in the sample.",
        "**This is a close sibling of The Holy Grail, and the difference is the gate.** Both hold TQQQ by default and fall back to the same family of rungs. This one measures the regime on SPY rather than on TQQQ itself, which makes it slower to leave a decline and quicker to return to it: its longest stretch below the gate is 87 days against 262 for the Holy Grail's."
      ]
    },
    "regimes": [
      {
        "regime": "Sustained uptrend",
        "expected": "Strong",
        "why": "SPY holds above its 200-day average and the strategy is simply 3x long the Nasdaq. This state covers 3,187 of {backtest_days} days and produced nearly all of the headline return.",
        "example": "2023 AI bull: SPY +26.7%, TQQQ +204.9%, and the reconstruction held TQQQ on 92% of days."
      },
      {
        "regime": "Long, deep bear market",
        "expected": "Strong",
        "why": "The gate stays shut long enough for the short leg to work, and the reconstruction spends more of the decline in SQQQ than in anything else.",
        "example": "2022 bear market: SPY -24.5%, TQQQ -78.8%, SQQQ +120.7%. The reconstruction held SQQQ on 42% of days and TLT on only 5%."
      },
      {
        "regime": "Vertical crash",
        "expected": "Strong",
        "why": "A fall fast enough to break the 200-day average decisively puts the strategy into its defensive branches while the decline is still running.",
        "example": "COVID crash, 19 Feb to 23 Mar 2020: SPY -33.7%, TQQQ -69.8%, SQQQ +84.4%, UVXY +552.3%."
      },
      {
        "regime": "Short, sharp selloff",
        "expected": "Poor",
        "why": "The gate shuts, but the bear branch's fallback is still TQQQ, so a decline can inflict full 3x losses before any defensive rung fires, and the reversal often comes before the strategy has committed.",
        "example": "Spring 2025 drawdown: SPY -18.8%, TQQQ -56.8%. The reconstruction held TQQQ on 44% of days through it."
      },
      {
        "regime": "Choppy market around the 200-day",
        "expected": "Poor",
        "why": "Every crossing of an unbuffered gate is a full switch between concentrated leveraged positions. 21 of the 39 stretches below the gate lasted 5 trading days or fewer.",
        "example": "Feb 2018 volatility spike: SPY -10.1%, TQQQ -28.6%, UVXY +181.4%, and the reconstruction was in TQQQ on 89% of those days."
      },
      {
        "regime": "Rising rates with falling stocks",
        "expected": "Poor",
        "why": "TLT is the only holding meant to be safe, and it is chosen against SQQQ on a momentum reading rather than on any view about rates. When bonds and stocks fall together it is a losing position rather than a hedge.",
        "example": "2022 bear market: TLT -29.3% while SPY fell 24.5%. Over the whole record TLT compounded -6.6% across the 104 days it was held."
      }
    ],
    "regime_note": "**The example column is what the holdings did, not what the strategy returned.** Each ticker figure is the move in that fund between the first and last trading day of the window, computed from daily closes. The regimes themselves were identified by evaluating this strategy's own symphony tree over those same closes, which is a reading of the rules rather than a backtest: it carries no fees, no slippage and no rebalance timing, and it answers only which fund the rules would name on a given day. Branch shares and condition frequencies quoted above come from that evaluation and are used to rank a regime as strong or poor, never as a return you could have earned. The reconstruction covers {backtest_days} trading days from 3 October 2011 to 27 August 2026, matching the backtest window on record."
  },
  {
    "slug": "wooden-arkk",
    "name": "Wooden ARKK Machine 2.2",
    "symphony_url": "https://app.composer.trade/symphony/kl2dR0Rlp4RgZUHAJY2k/details",
    "symphony_id": "kl2dR0Rlp4RgZUHAJY2k",
    "annualized_rate_of_return": 2.2875373742368206,
    "max_drawdown": -0.4452871137621296,
    "cumulative_return": 165.46133,
    "calmar_ratio": 5.137218894366687,
    "sharpe_ratio": 2.1763411280718383,
    "standard_deviation": 0.6414458960615101,
    "min": -0.199631030015459,
    "mean": 0.0055397027183791995,
    "median": 0.002061425123973337,
    "max": 0.28322320981853943,
    "trailing_one_month_return": 0.0016084996374146066,
    "trailing_three_month_return": 0.20294510347586647,
    "trailing_one_year_return": 0.9043690391056873,
    "backtest_days": 1082,
    "description": "A bi-directional mean-reversion strategy built around ARKK's leveraged siblings. Compares IEI and SPHB RSI to determine the market regime, then buys the single worst recent performer from either a long leveraged pool (risk-off) or an inverse ETF pool (risk-on).",
    "tags": [
      "rsi",
      "momentum",
      "leveraged-etfs",
      "mean-reversion",
      "inverse-etfs"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "This is a bi-directional mean-reversion strategy built around ARKK's leveraged siblings. It reads the market regime by comparing IEI (treasuries) and SPHB (high-beta) RSI, then buys the single worst recent performer from either a long leveraged pool (when conditions are risk-off and a bounce is likely) or an inverse-ETF pool (when conditions are risk-on and a pullback is likely). The 'buy the biggest loser' mechanic is pure short-horizon mean reversion, with the IEI-versus-SPHB read deciding which direction to fade.",
      "It shows {annualized_rate_of_return:0} annualized over a roughly 4.3-year (about 1,080-day) backtest with a {sharpe_ratio} Sharpe and {calmar_ratio} Calmar against a {max_drawdown_abs:0} max drawdown. The strong ratios are attractive, but the short record begins around mid-2022 and is skewed toward the high-volatility 2022 to 2025 environment in which fade-the-extreme tactics thrive; the same approach can bleed in calm, persistently trending markets where the worst performer keeps losing. Treat the impressive metrics as period-specific and the strategy as a tactical, volatility-dependent mean-reversion play."
    ],
    "how_it_works": [
      "Wooden ARKK Machine 2.2: named after Cathie Wood's ARKK Innovation ETF, operates on a single regime signal: the relative 7-period RSI of IEI (iShares 3-7 Year Treasury Bond ETF) versus SPHB (Invesco S&P 500 High Beta ETF). When bonds show stronger short-term RSI than high-beta equities, the market is in a risk-off or stressed state. When high-beta equities show stronger RSI than bonds, the market is in risk-on mode. This single comparison routes the entire portfolio into one of two diametrically opposed asset pools.",
      "In risk-off regime (IEI RSI(7) > SPHB RSI(7)), the strategy picks from a long leveraged pool: TARK (2x ARKK Innovation), TECL (3x Technology), UPRO (3x S&P500), TMF (3x Long-Duration Treasuries), YINN (3x China equities), EDC (3x Emerging Markets), and SOXX (semiconductor index). Crucially, it selects the BOTTOM performer by 4-day moving average of returns, the single asset that has fallen the most recently. This is a mean-reversion bet: in a risk-off environment, oversold leveraged longs tend to produce the sharpest bounces when sentiment stabilizes.",
      "In risk-on regime (SPHB RSI(7) > IEI RSI(7)), the strategy switches to the bear pool: SARK (short ARKK), PSQ (1x inverse QQQ), TMV (3x inverse long treasury), DRV (3x inverse real estate), and TYO (3x inverse 7-10yr treasury). Again it selects the BOTTOM 4-day performer. The counterintuitive logic: even during risk-on bull markets, inverse ETFs experience sharp drawdowns followed by violent mean-reversion bounces when markets pause or correct briefly. Picking the most beaten-up inverse ETF when stocks are running hot is a bet on short-term mean reversion within a broader trend. Version 2.2 implies prior iterations with different thresholds or pools exist."
    ],
    "signals": [
      {
        "name": "IEI vs SPHB RSI(7) Regime Gate",
        "tag": "rsi",
        "description": "Single regime signal: IEI (intermediate bonds) RSI(7) vs SPHB (high-beta equities) RSI(7). IEI stronger -> risk-off -> buy worst-performing long leveraged ETF. SPHB stronger -> risk-on -> buy worst-performing inverse ETF. Unique in the library for using relative RSI of two non-target assets."
      },
      {
        "name": "Bottom-1 Mean-Reversion Sort",
        "tag": "momentum",
        "description": "Within each pool, selects the single asset with the lowest 4-day moving average of returns, the most beaten-up recent performer. Pure mean-reversion signal expecting a bounce from maximum distress."
      },
      {
        "name": "Long Pool: TARK/TECL/UPRO/TMF/YINN/EDC/SOXX",
        "tag": "leveraged-etfs",
        "description": "Active in risk-off regime: 7 leveraged long ETFs spanning US tech (TARK 2x ARKK, TECL 3x tech, UPRO 3x SPY), bonds (TMF 3x LT), and international (YINN 3x China, EDC 3x EM), plus SOXX (semis)."
      },
      {
        "name": "Bear Pool: SARK/PSQ/TMV/DRV/TYO",
        "tag": "leveraged-etfs",
        "description": "Active in risk-on regime: 5 inverse and short ETFs. SARK (inverse ARKK), PSQ (1x inverse QQQ), TMV (3x inverse LT bonds), DRV (3x inverse real estate), TYO (3x inverse 7-10yr treasury)."
      }
    ],
    "risk_profile": {
      "verdict": "Extremely Aggressive",
      "leverage": "TARK and SARK are leveraged long and inverse ARKK, alongside TECL, UPRO, EDC, YINN, DRV, TMF, TMV and TYO. Almost every leg in the universe is leveraged in one direction or the other.",
      "backtest_limits": "Roughly 4.3 years from mid-2022, bounded by TARK. That is one partial market cycle: the tail of the 2022 bear and the 2023 to 2025 bull run, an unusually favourable environment for mean reversion in both leveraged long and inverse funds. Its annualised return and Calmar look outstanding, and the short record makes all of those figures provisional.",
      "signal": "The design is counterintuitive: it buys beaten-up inverse ETFs during bull markets. That works in mean-reverting environments and could face extended losses in strongly trending markets, where the worst-performing inverse fund simply continues to decline.",
      "hedge": "PSQ is the only unleveraged inverse position. SARK, TYO and DRV are inverse but leveraged, so they are directional bets rather than ballast, and the drawdown record shows the strategy is not immune to trending crashes.",
      "concentration": "Twelve instruments spanning innovation equities, semiconductors, emerging markets, real estate and Treasuries. The diversification is across sectors, not across the mean-reversion assumption every leg depends on."
    },
    "author_note": "Named after Cathie Wood, founder of ARK Invest and the ARKK ETF. TARK (2x long ARKK) and SARK (inverse ARKK) are the anchors of the two pools. Version 2.2 implies prior iterations exist.",
    "tldr": {
      "thesis": "Two contrarian bets stacked on top of each other. First it compares a 7-day RSI on IEI, an intermediate Treasury fund, against the same reading on SPHB, the high-beta corner of the S&P. Then it picks a basket and, within that basket, buys the single worst performer over the last four days. It never buys strength. It holds exactly one fund on every day of the record and changes that fund roughly every other trading day, which makes it the most active strategy in this library by a wide margin.",
      "works_well_in": [
        "Two-way markets that reverse quickly. Buying the worst four-day performer only pays if declines snap back, and the {backtest_days}-day record is dense with exactly that. The allocation changed on 574 of those days, so the logic gets many small attempts rather than a few large ones.",
        "Sharp equity declines, where the inverse basket does the work. Across the record DRV compounded +117.3% over the 187 days it was held and SARK +73.2% over 219 days, and those two are the largest holdings in the whole strategy.",
        "Sector rotations inside a rising market. The long basket spans leveraged tech, semiconductors, China, emerging markets, long Treasuries and leveraged ARKK, so on any given day something in it has just fallen hard enough to be selected. TECL compounded +363.7% over the 93 days it was named.",
        "Bond and rate reversals. TMV and TMF sit on opposite sides of the same trade, one in each basket, and both were profitable over the days they were held: TMV +135.6% over 57 days and TMF +52.8% over 63."
      ],
      "struggles_in": [
        "Trends that keep going. The filter takes the bottom performer, so a fund that has fallen for four days and keeps falling is bought again and again. In the spring 2025 drawdown the reconstruction held TARK on 41% of days while TARK fell 64.2%.",
        "Rebounds it is positioned against. In the recovery immediately after that drawdown it held SARK on 33% of days while SARK fell 35.0% and TARK rose 108.4%. The same mean-reversion instinct that finds bottoms also sells them.",
        "Any environment where trading costs are real. The allocation changed on 53.0% of days, about once every 1.9 trading days, and the regime gate itself flipped 196 times. None of the figures on this page carries a commission, a spread or a slippage assumption.",
        "Steady one-directional bull markets. The gate put the strategy in the inverse basket on 56.0% of days across a window in which SPY rose 97.4%. PSQ, a short-Nasdaq fund, was held on 133 days and compounded -13.3% across them."
      ]
    },
    "assumptions": {
      "market": [
        "**The worst recent performer is the best thing to buy.** This is the whole engine. Both baskets are ranked by 4-day average return and the bottom one is taken, so the strategy is structurally incapable of buying strength. It is a bet that four days is long enough to identify an overreaction and short enough that the reversal has not already happened.",
        "**Relative strength between Treasuries and high-beta stocks identifies the regime, in the opposite direction to the obvious reading.** When IEI is stronger than SPHB, which is the classic risk-off tell, this strategy buys from its long leveraged basket. When high-beta is stronger, it buys inverse funds. It is contrarian on the regime as well as on the security.",
        "**Reversals will keep arriving as often as they did.** The gate crossed 196 times in {backtest_years} years, and 68 of the 99 stretches on the inverse side lasted 5 trading days or fewer. A market that trends for months rather than days gives this logic almost nothing to do that is not wrong.",
        "**Fills are available at close prices in thinly traded leveraged funds.** TARK, SARK, TYO, EDC and DRV are small, and the strategy expects to move its entire book between them on roughly every other day."
      ],
      "structural": [
        "**The strategy is never diversified and never hedged.** It holds exactly one fund on 100% of days across the entire record. The largest single holding by share of capital is SARK at 20.2%, which sounds moderate but only means the concentration rotates.",
        "**Turnover is the defining structural fact, and it is not in any published figure.** 574 allocation changes across {backtest_days} days is roughly 135 round trips a year, every one of them a complete move of the book between leveraged or inverse funds. Every metric on this page is computed on closing prices with no cost model, so real-world results would diverge from them faster here than on any other strategy in this library.",
        "**Two of the twelve legs lost money over the days they were held.** PSQ compounded -13.3% across 133 days and SOXX -4.7% across 29. PSQ is the third most-held fund in the strategy.",
        "**SOXX is the only unleveraged, non-inverse fund in the universe.** Everything else is 2x, 3x or short. It was held on 29 days and contributes 2.7% of capital, so the twelve-fund basket is effectively eleven leveraged bets and one ordinary one.",
        "**The record is the second shortest of the 24 public strategies here.** {backtest_days} trading days beginning 5 May 2022, bounded by the launch of the leveraged ARKK funds. It contains one bear market, which it happened to start inside, and no rate regime other than the one that began in 2022.",
        "**{standard_deviation} annualized volatility and a {max_drawdown_abs} maximum drawdown are the price of the record above.** A {sharpe_ratio} Sharpe and a {calmar_ratio} Calmar are strong, but they are computed over the second shortest window in this library and by far the highest turnover, which is the combination most likely to flatter a result.",
        "**The lookbacks are short and unexplained.** A 7-day RSI decides the regime and a 4-day average return decides the security. Nothing in the design says why 7 and 4, and at those lengths both readings change constantly, which is why the strategy trades as often as it does."
      ]
    },
    "regimes": [
      {
        "regime": "Choppy, fast-reversing market",
        "expected": "Strong",
        "why": "The home environment. Buying the worst four-day performer needs the decline to reverse within days, and a market that swings both ways gives the logic a fresh attempt roughly every other session.",
        "example": "Across the record the allocation changed on 574 of {backtest_days} days and the regime gate flipped 196 times."
      },
      {
        "regime": "Sharp equity decline",
        "expected": "Strong",
        "why": "The gate tends to sit on the inverse basket and the two largest holdings in the whole strategy, DRV and SARK, are both in it.",
        "example": "Spring 2025 drawdown: SPY -18.8%, SARK +117.9%, DRV +42.7%, PSQ +28.8%."
      },
      {
        "regime": "Sector rotation inside a rising market",
        "expected": "Strong",
        "why": "The long basket spans tech, semiconductors, China, emerging markets and long Treasuries, so on almost any day something in it has fallen far enough to be selected, and rotation is what makes those falls temporary.",
        "example": "2023 AI bull: SPY +26.7%, TECL +211.9%, TARK +131.1%, while YINN fell 57.5% and SARK fell 47.7%."
      },
      {
        "regime": "Sustained one-directional bull",
        "expected": "Mixed",
        "why": "The gate spends most of its time on the inverse basket during rallies, and buying the worst performer inside a basket of short funds means buying whatever the rally has hurt most.",
        "example": "2024 bull: SPY +25.6%, and the reconstruction held SARK on 21% of days and PSQ on 16% while SARK fell 39.1% and PSQ fell 17.0%."
      },
      {
        "regime": "Fast reversal against the position",
        "expected": "Poor",
        "why": "The logic buys weakness and therefore sells strength, so a V-shaped recovery can find it holding the inverse fund it bought at the low.",
        "example": "Spring 2025 rebound: TARK +108.4%, SARK -35.0%, and the reconstruction held SARK on 33% of days."
      },
      {
        "regime": "Long trend with no reversals",
        "expected": "Unknown",
        "why": "There is no such period in the record. The longest continuous stretch on either side of the gate was 46 trading days, and the median stretch on the inverse side was 3. Nothing here shows what happens when four-day losers keep losing for months.",
        "example": "The record covers {backtest_days} days from 5 May 2022, the second shortest of the 24 public strategies in this library."
      }
    ],
    "regime_note": "**The example column is what the holdings did, not what the strategy returned.** Each ticker figure is the move in that fund between the first and last trading day of the window, computed from daily closes, and each holdings share comes from evaluating this strategy's own symphony tree over those same closes. That evaluation is a reading of the rules rather than a backtest: it answers only which fund the rules would name on a given day. It carries no fees, no slippage and no rebalance timing, which matters more here than anywhere else in this library, because this strategy changes its entire position roughly every other trading day. For that reason no reconstructed return is quoted on this page at all, and the regimes above are ranked from holdings and ticker moves rather than from a modelled path. The reconstruction covers {backtest_days} trading days from 5 May 2022 to 27 August 2026, matching the backtest window on record."
  },
  {
    "slug": "super-semiconductors",
    "name": "Super Semiconductors",
    "symphony_url": "https://app.composer.trade/symphony/zTV33nu3o0h5fKpT6IqL/details",
    "symphony_id": "zTV33nu3o0h5fKpT6IqL",
    "annualized_rate_of_return": 0.9939630397518273,
    "max_drawdown": -0.42881883003694565,
    "cumulative_return": 23105.720486000002,
    "calmar_ratio": 2.3179090332068455,
    "sharpe_ratio": 1.6602194860410715,
    "standard_deviation": 0.48326461168130536,
    "min": -0.23488168412995658,
    "mean": 0.0031838306556641856,
    "median": 0.0014168467644178895,
    "max": 0.5462989083495198,
    "trailing_one_month_return": 0.04655786736869039,
    "trailing_three_month_return": 0.03921404204866907,
    "trailing_one_year_return": 2.876181160115426,
    "backtest_days": 3668,
    "description": "A semiconductor-sector specialist by Dereck Nielsen that selects the top 3 performing semiconductor stocks from a 19-company universe during MACD-bullish bull markets, uses tactical dip-buying and partial bond hedges when MACD turns bearish, and actively shorts semiconductors via SOXS or SSG in bear market conditions.",
    "tags": [
      "rsi",
      "200d-ma",
      "momentum",
      "leveraged-etfs",
      "macd",
      "inverse-etfs"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "A semiconductor-sector specialist by Dereck Nielsen, this strategy selects the top 3 performers from a 19-company chip universe during MACD-bullish bull markets, switches to tactical dip-buying and partial bond hedges when MACD turns bearish, and actively shorts semiconductors via SOXS or SSG in confirmed bear conditions. It combines stock-level momentum selection (own the strongest chips) with a sector-level MACD regime switch, so it concentrates in winners during uptrends and flips defensive or short when the sector rolls over.",
      "Over a long 14-year backtest it returns {annualized_rate_of_return:0} annualized with a {sharpe_ratio} Sharpe, {calmar_ratio} Calmar, and a {max_drawdown_abs:0} max drawdown, a relatively contained drawdown for a single-sector strategy, helped by the bond hedges and short branches. The multi-cycle test window and the genuine bear-market shorting logic are strengths. Its main characteristic is concentration: by living entirely in semiconductors it is fully exposed to chip-cycle booms and busts, rewarding investors who specifically want active, regime-aware exposure to that sector."
    ],
    "how_it_works": [
      "Super Semiconductors, designed by Dereck Nielsen, is built around the thesis that semiconductor leadership can be captured systematically while managing sector-specific risk. The outer gate uses an 8-day exponential moving average of SPY versus SPY's 200-day simple moving average, a more sensitive version of the classic 200d MA filter that reacts faster to trend changes. When SPY EMA(8) is above SPY SMA(200), the strategy enters bull mode with two sequential overbought guards: SPY RSI(10) above 80 triggers a rotation to UVXY, and SPY RSI(60) above 60 triggers rotation into the best-performing asset from [TMF, UUP, VIXY, XLP, SPLV] by 15-day return, a defensive basket covering bonds, dollar, volatility hedges, consumer staples, and low-volatility equities.",
      "When neither overbought guard fires in bull mode, the strategy evaluates SMH using a MACD-style signal: comparing SMH's 12-day EMA against its 26-day EMA. A bearish crossover (EMA12 below EMA26) signals deteriorating semiconductor momentum within an otherwise bullish broader market. In this state, the strategy checks SMH against its 25-day moving average: if SMH is below the 25d MA and RSI(10) is below 30, it buys SOXL (3x semiconductors) as an extreme dip-buy. If RSI is not that oversold but SMH is still below the 25d MA, it holds SMH. If SMH is above the 25d MA despite the bearish MACD crossover, it holds 50% SHY (short-term treasuries) and 50% SMH as a partial defensive hedge.",
      "When SMH's MACD is bullish (EMA12 above EMA26) and the broader market is in an uptrend, the strategy enters its most aggressive mode: a momentum filter selects the top 3 performers by 90-day moving average of returns from a hand-curated universe of 19 major semiconductor companies, NVDA, TSM, AVGO, ASML, TXN, QCOM, AMD, INTC, ADI, AMAT, MU, LRCX, SNPS, KLAC, NXPI, MRVL, MCHP, ON, and STM, and equal-weights the three winners. In bear mode (SPY EMA8 below SMA200), the strategy uses SMH RSI(10) below 31 for a SOXL dip-buy, a relative RSI filter between SSG (2x short semis) and BSV (short bonds) when SMH is below its 25d MA, SOXS (3x short semiconductors) when SMH RSI exceeds 70 in a downtrend, or plain SMH as the default hold."
    ],
    "signals": [
      {
        "name": "SPY EMA(8) vs SMA(200) Trend Gate",
        "tag": "200d-ma",
        "description": "Primary regime filter: SPY 8-day EMA vs 200-day SMA. More responsive than a simple price vs. SMA(200) check, the short EMA smooths recent price action. Bull above, bear below."
      },
      {
        "name": "Dual SPY Overbought Guard",
        "tag": "rsi",
        "description": "In bull mode: SPY RSI(10) > 80 -> UVXY (extreme overbought). SPY RSI(60) > 60 -> best of [TMF, UUP, VIXY, XLP, SPLV] by 15d return (elevated medium-term momentum). Two-tier defense from short and medium time-frame overbought signals."
      },
      {
        "name": "SMH MACD Signal (EMA 12/26)",
        "tag": "momentum",
        "description": "SMH EMA(12) vs EMA(26): a MACD crossover applied to the semiconductor ETF. Bearish cross triggers partial hedging (SHY/SMH split or SOXL dip-buy). Bullish cross enables individual stock selection mode."
      },
      {
        "name": "Top-3 Semiconductor Stock Selection",
        "tag": "momentum",
        "description": "Most aggressive mode: selects top 3 of 19 semiconductor stocks (NVDA, TSM, AVGO, ASML, TXN, QCOM, AMD, INTC, ADI, AMAT, MU, LRCX, SNPS, KLAC, NXPI, MRVL, MCHP, ON, STM) by 90-day moving average return. Equal-weights the three winners."
      },
      {
        "name": "SOXL Dip-Buy / SOXS Short",
        "tag": "leveraged-etfs",
        "description": "Leveraged extremes: SMH RSI(10) < 31 -> SOXL (3x semi long) for dip-buying in bear regime. SMH RSI(10) > 70 in bear mode -> SOXS (3x semi short) for pressing an overbought semi rebound within an overall downtrend."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "The primary bull-mode holding is individual semiconductor equities rather than 3x funds, which is why its volatility is among the lowest of the semiconductor strategies in this library and its annualised return is lower too. SOXL and SOXS remain reachable for dip-buying and bear-mode exposure.",
      "backtest_limits": "Bounded by UVXY, the record begins in 2012 and misses the 2008 financial crisis. It does contain the 2022 semiconductor bear market, which is where much of the drawdown came from, alongside SOXL dip-buy losses during extended declines.",
      "signal": "The strategy benefits enormously from semiconductor cycle leadership, and a top-three selection would naturally have been dominated by NVDA through the 2023 to 2025 AI run. A ranking rule that picks winners always looks best over the period whose winners it picked.",
      "hedge": "UVXY and VIXY provide a volatility leg and SOXS and SSG a sector-inverse one. Systematic bear-mode short exposure makes this one of the few strategies here that trades both semiconductor bull and bear cycles rather than only stepping aside.",
      "concentration": "Selecting the top individual names creates significant single-name concentration inside a sector that is already cyclical. That is stock risk and sector risk stacked, not one offsetting the other."
    },
    "author_note": "Created by Dereck Nielsen. Strategy description in Composer reads: 'The goal of this strategy is to invest in the semiconductor sector of the market under normal market conditions. Added a MACD feature to this strategy when the semiconductor ETF SMH is trading above the 200 day moving average of SPY.'",
    "tldr": {
      "thesis": "A semiconductor specialist that spends a surprising amount of its time owning no semiconductors. A smoothed trend gate, an 8-day exponential average of SPY against its 200-day average, splits the logic in two. In the bull half, a 60-day RSI above 60 pulls the whole book out of chips and into a defensive basket of long Treasuries, the dollar, staples and low-volatility equity. Only when the market is rising but not overheated does it run its actual thesis: hold the best three of 19 named chip companies on 90-day momentum. It is one of only four strategies here that buy individual stocks rather than funds, and its 19-name universe is by far the largest of them.",
      "works_well_in": [
        "Semiconductor bull markets with clear leadership. The top-three momentum basket is where the design's conviction lives, and across the record its winners were large: MU compounded +1,354.0% over the 707 days it was held, AMD +814.8% over 724 days and NVDA +813.3% over 710.",
        "Long bear markets, where the short leg gets time to work. Below the trend gate the logic ranks SSG against BSV and takes the stronger, and SSG compounded +125.2% across the 129 days it was named. Through the 2022 decline the reconstruction held SSG on 42% of days while SSG rose 119.6%.",
        "Vertical crashes. The gate is smoothed rather than fast, but a fall steep enough still breaks it, and the defensive rungs sit ready underneath. Through the COVID crash the reconstruction held SSG on 26% of days and SOXL on 17%, while SSG rose 54.6% and SOXS rose 79.5%.",
        "Volatility spikes inside a bull market. The froth branch reaches VIXY and the RSI 80 rung reaches UVXY, and both were profitable across the days they were held: UVXY +429.9% over 78 days and VIXY +82.5% over 22. In the February 2018 spike the reconstruction was in VIXY on 56% of days while VIXY rose 99.6%.",
        "Deep sector capitulations. The SOXL dip-buy rungs fire when SMH's 10-day RSI drops under 30 or 31, and SOXL compounded +1,172.2% across the 107 days the rules named it."
      ],
      "struggles_in": [
        "Strong, broad bull markets, which is the least intuitive weakness on this page. When SPY's 60-day RSI runs above 60 the strategy leaves semiconductors entirely for bonds, the dollar and staples. That condition was true on 15.0% of days and actually selected the holding on 491 of them. Through 2017, when SPY rose 20.8%, the reconstruction held TMF on 18% of days, SPLV on 16% and XLP on 10%.",
        "Sharp sector-specific drawdowns. The gate is deliberately slow, so a chip selloff inside an intact market leaves the strategy long. In the spring 2025 drawdown the reconstruction held SMH on 29% of days and SOXL on 12% while SMH fell 30.1% and SOXL fell 73.7%.",
        "Momentum reversals in single names. The top-three basket is ranked on 90-day average return, which buys what has already run. MRVL is the largest losing leg in the strategy: -49.6% across the 329 days it was held.",
        "Any market where trading costs matter. The allocation changed on 1,229 of {backtest_days} days, about once every three trading days, across a universe of 19 individual stocks and 12 funds."
      ]
    },
    "assumptions": {
      "market": [
        "**Semiconductors are the right sector to specialise in.** The entire design is a bet that chips lead, and the record covers a period in which they did: SMH compounded +266.8% across the 874 days it was held, and it is the largest single holding in the strategy at 22.0% of capital.",
        "**Recent momentum in a single stock predicts the next stretch.** The top-three basket ranks 19 names on 90-day average return and buys the leaders. It is the opposite instinct to the dip-buying rungs sitting a few lines below it in the same tree.",
        "**An overheated market is a reason to leave the sector rather than trim it.** A 60-day RSI above 60 on SPY moves the entire book into TMF, UUP, VIXY, XLP or SPLV. That is a strong claim about a fairly ordinary reading, and it is the single largest determinant of how much of a bull market the strategy actually participates in.",
        "**Long Treasuries hedge equity risk.** TMF is the fifth largest holding at 4.7% of capital. That relationship held for most of the record and broke in 2022, when TMF fell 68.8% during the one full bear market in the window."
      ],
      "structural": [
        "**The 19-company universe was chosen with hindsight, and this is the largest assumption on the page.** NVDA, AMD, AVGO, MU and the rest are a fixed hand-picked list, written after it was known which chip companies mattered. A strategy that picks the best three of 19 names is only as good as the 19, and nothing in the logic selects them. Any company that failed or was acquired over the period is absent by construction.",
        "**It holds individual stocks, and more of them than anything else here.** Three other strategies in this library name single companies, with universes of two, three and four. This one carries 19. Single-name risk, earnings gaps and company-specific failures are all live, and holding three names at a time does not diversify them away.",
        "**The trend gate is smoothed, and the difference is measurable.** Using an 8-day exponential average of SPY rather than a raw close, the gate crossed only 24 times in {backtest_years} years, with a median stretch below it of 31 trading days and only 2 of its 12 stretches lasting 5 days or fewer. The comparable raw-price gates in this library crossed 77 and 83 times. This is the clearest evidence in the library that the smoothing choice, not the 200-day average itself, is what determines whether a trend gate whipsaws.",
        "**Even below the gate it is long semiconductors on 39.2% of days.** The bear half runs three tests and its final fallback is plain SMH. Being below the trend gate is not the same as being defensive here.",
        "**It genuinely diversifies, which is uncommon in this library.** It holds more than one position on 54.2% of days, through the top-three basket and through a paired SHY and SMH allocation. The trend-following strategies reviewed alongside it hold exactly one fund on every single day of their records.",
        "**Turnover is high for a strategy described as a sector specialist.** 1,229 allocation changes across {backtest_days} days is about one every three trading days, and none of the figures on this page carries a commission, a spread or a slippage assumption.",
        "**{standard_deviation} annualized volatility and a {max_drawdown_abs} maximum drawdown are the price of the record above.** A {sharpe_ratio} Sharpe and a {calmar_ratio} Calmar are solid rather than exceptional, and the worst single day in the record was {worst_day}.",
        "**Thresholds are specific in a way the logic does not explain.** RSI limits of 80, 70, 60, 31 and 30, MACD-style averages of 12 and 26 days, moving averages of 200, 25 and 8, and lookbacks of 90, 15 and 10 days. Two of those rungs differ by a single point: SMH's RSI below 30 in one branch and below 31 in another.",
        "**The record starts in January 2012 and covers {backtest_days} trading days**, so it misses the 2008 crisis and the 2000 semiconductor collapse, which is the one event that would most directly test a chip specialist."
      ]
    },
    "regimes": [
      {
        "regime": "Semiconductor bull with clear leaders",
        "expected": "Strong",
        "why": "The top-three momentum basket runs, and in a sector where leadership concentrates, picking three of 19 on 90-day momentum lands on the names that are running.",
        "example": "2023 AI bull: SMH +74.7%, NVDA +246.1%, AMD +130.3%. The reconstruction held SMH on 23% of days and NVDA on 16%."
      },
      {
        "regime": "Long, deep bear market",
        "expected": "Strong",
        "why": "The trend gate stays shut for months rather than days, and the bear half ranks the inverse semiconductor fund against short-term bonds and takes the stronger.",
        "example": "2022 bear market: SPY -24.5%, SMH -44.4%, SSG +119.6%. The reconstruction held SSG on 42% of days."
      },
      {
        "regime": "Vertical crash",
        "expected": "Strong",
        "why": "A fall steep enough breaks even a smoothed gate, and the froth and dip-buy rungs above it fire on the way down.",
        "example": "COVID crash: SPY -33.7%, SMH -31.2%, SSG +54.6%, SOXS +79.5%, UVXY +552.3%."
      },
      {
        "regime": "Overheated broad bull",
        "expected": "Mixed",
        "why": "The 60-day RSI rung pulls the entire book out of semiconductors and into Treasuries, the dollar and staples. Whether that helps or costs depends entirely on how much further the bull market runs.",
        "example": "2017 low-volatility bull: SPY +20.8% and SMH +38.2%, while the reconstruction held TMF on 18% of days, SPLV on 16% and XLP on 10%."
      },
      {
        "regime": "Sector selloff inside an intact market",
        "expected": "Poor",
        "why": "The gate is slow by design, so a chip-specific decline that does not break the broad trend leaves the strategy long, and the SOXL dip-buy rung can add 3x leverage into it.",
        "example": "Spring 2025 drawdown: SMH -30.1%, SOXL -73.7%, MRVL -54.9%. The reconstruction held SMH on 29% of days and SOXL on 12%."
      },
      {
        "regime": "Whipsaw around the trend gate",
        "expected": "Mild",
        "why": "The weakness that dominates the raw-price trend strategies in this library is largely absent here, and that is a measured difference rather than a claim. Only 2 of the 12 stretches below the gate lasted 5 trading days or fewer.",
        "example": "The gate crossed 24 times across {backtest_days} days, about once every 153 trading days."
      }
    ],
    "regime_note": "**The example column is what the holdings did, not what the strategy returned.** Each ticker figure is the move in that stock or fund between the first and last trading day of the window, computed from daily closes, and each holdings share comes from evaluating this strategy's own symphony tree over those same closes. That evaluation is a reading of the rules rather than a backtest: it answers only which positions the rules would name on a given day, and it carries no fees, no slippage and no rebalance timing. Because this strategy changes its allocation about once every three trading days, no reconstructed return is quoted on this page, and the regimes above are ranked from holdings and price moves alone. The reconstruction covers {backtest_days} trading days from 26 January 2012 to 27 August 2026, matching the backtest window on record."
  },
  {
    "slug": "four-horsemen",
    "name": "The Four Horsemen of the Apocalypse",
    "symphony_url": "https://app.composer.trade/symphony/vkJ5YCvzJLBu2KKF6Oy0/details",
    "symphony_id": "vkJ5YCvzJLBu2KKF6Oy0",
    "annualized_rate_of_return": 1.6241215401769589,
    "max_drawdown": -0.45348799433388876,
    "cumulative_return": 1333969.608388,
    "calmar_ratio": 3.581399200132231,
    "sharpe_ratio": 2.1434420697176417,
    "standard_deviation": 0.5076981461240755,
    "min": -0.21726534776659523,
    "mean": 0.004318339544126976,
    "median": 0.0017301998454601897,
    "max": 0.5001156299798002,
    "trailing_one_month_return": -0.04833473197081939,
    "trailing_three_month_return": -0.03612281525094618,
    "trailing_one_year_return": 0.9381315407831454,
    "backtest_days": 3683,
    "description": "A multi-component equal-weight strategy combining parallel market-cycle systems: a SPY 200-day trend engine with 5-ETF momentum selection, a shorter-term TQQQ 20-day component, and a secondary SPY regime component, all sharing dual UVXY overbought guards and a cascading bear-market protocol with dip-buying, deep-bear routing, and QQQ cumulative-return detection.",
    "tags": [
      "rsi",
      "200d-ma",
      "momentum",
      "leveraged-etfs",
      "vix-tiers",
      "inverse-etfs"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "This is a multi-component, equal-weight strategy that runs several market-cycle systems in parallel: a SPY 200-day trend engine with 5-ETF momentum selection, a shorter-term TQQQ 20-day component, and a secondary SPY regime component, all sharing dual UVXY overbought guards and a cascading bear-market protocol that includes dip-buying, deep-bear routing, and a QQQ cumulative-return detector. Equal-weighting independent sub-strategies is a diversification technique: each 'horseman' captures a different timeframe or signal, and blending them smooths the combined equity curve.",
      "Across roughly 14 years it returns {annualized_rate_of_return:0} annualized with a strong {sharpe_ratio} Sharpe and {calmar_ratio} Calmar against a {max_drawdown_abs:0} max drawdown and {standard_deviation:0} volatility. The combination of a long backtest, parallel-system diversification, and layered bear protocols gives it one of the more robust risk-adjusted profiles among the original (non-zoop) strategies. The cost is complexity, since many interacting components are harder to audit and carry more parameter risk, but the multi-system design is a deliberate hedge against any single signal failing."
    ],
    "how_it_works": [
      "The Four Horsemen of the Apocalypse is an equal-weight portfolio of multiple parallel components, each running its own full market-cycle logic simultaneously. The dominant components use SPY's 200-day moving average as the primary regime gate. In bull mode, each shares the same overbought stack: QQQ RSI(10) above 81 OR SPY RSI(10) above 80 triggers UVXY; SPY RSI(60) above 60 triggers rotation into the best-performing defensive asset from [TMF, UUP, VIXY, XLP, VTI/SPLV, IWM, SCO] by 15-day return. When neither overbought condition is met, the bull-mode primary bet is a 21-day momentum filter selecting the top 3 of [TQQQ, SOXL, TECL, UDOW, UPRO] combined with a position in SVXY (short VIX futures, profiting from volatility premium decay in calm markets).",
      "A second parallel component tracks TQQQ's 20-day moving average rather than SPY's 200d MA, adding shorter-term regime sensitivity. When TQQQ is above its 20d MA, this component holds TQQQ outright (with the same dual UVXY overbought guards applied). When TQQQ drops below the 20d MA, it pivots: TQQQ RSI(10) below 31 selects the more oversold of TECL or SOXL by RSI(7) for a short-term tech panic dip-buy. If RSI is not extreme, it runs a relative RSI filter between TLT, PSQ, and BSV to select either a long-bond refuge or an inverse-QQQ position based on which shows stronger recent momentum.",
      "The bear-mode logic within the SPY 200d MA components is the most sophisticated element of the strategy. Beyond standard dip-buys (TQQQ RSI(10) < 31 -> TECL, SMH RSI(10) < 30 -> SOXL, SPY RSI(10) < 30 -> UPRO), the strategy activates a deep bear protocol when QQQ's 252-day cumulative return falls below -20%, confirming a major bear market rather than a correction. Within this state, it routes through QQQ vs. 20d MA position and QQQ 60-day cumulative return thresholds: a 60d loss below -12% triggers a choice between SPY (if SPY is above its 20d MA) or a TLT vs. SQQQ RSI filter for further decline; a 60d loss above -12% routes through TLT vs. SQQQ RSI for TQQQ or SQQQ. Additionally, when QQQ's 10-day cumulative return exceeds +5.5% in a bear market, the strategy positions in PSQ rather than chasing the bounce, recognizing bear market rallies as traps."
    ],
    "signals": [
      {
        "name": "SPY 200-Day MA Primary Regime Gate",
        "tag": "200d-ma",
        "description": "Primary gate across the dominant components: SPY above 200d MA = bull mode (momentum ETF selection + defensive basket). Below = bear mode (dip-buy cascade + deep bear routing). Multiple components run this gate in parallel."
      },
      {
        "name": "Dual UVXY Guard: QQQ + SPY RSI",
        "tag": "vix-tiers",
        "description": "Most aggressive UVXY trigger in the library: QQQ RSI(10) > 81 OR SPY RSI(10) > 80 -> UVXY. Uses QQQ (not TQQQ) for the first check. Plus SPY RSI(60) > 60 -> defensive basket. Three-tier overbought system."
      },
      {
        "name": "Bull Momentum Filter: Top 3 of 5 Leveraged ETFs",
        "tag": "momentum",
        "description": "Primary bull-mode allocation: selects top 3 of [TQQQ, SOXL, TECL, UDOW, UPRO] by 21-day moving average of returns. Concentrates in the strongest recent performers across QQQ, semis, tech, Dow30, and S&P500 3x ETFs. Also holds SVXY for volatility premium."
      },
      {
        "name": "TQQQ 20-Day MA Component",
        "tag": "200d-ma",
        "description": "Parallel component using TQQQ 20d MA (not SPY 200d) as its gate. Adds shorter-term regime sensitivity. Holds TQQQ above the MA; shifts to TECL/SOXL dip-buy or TLT/PSQ/BSV RSI filter below it."
      },
      {
        "name": "Bear Dip-Buy Cascade: TECL, SOXL, UPRO",
        "tag": "rsi",
        "description": "Three-tier bear-mode dip-buying: TQQQ RSI(10) < 31 -> TECL; SMH RSI(10) < 30 -> SOXL; SPY RSI(10) < 30 -> UPRO. Sequential checks covering tech, semiconductors, and broad market capitulation."
      },
      {
        "name": "Deep Bear Protocol: QQQ 252-Day Return",
        "tag": "momentum",
        "description": "Activates when QQQ 252-day cumulative return < -20% (confirmed major bear). Routes through QQQ 20d MA position, QQQ 60d loss thresholds, and TLT vs SQQQ RSI comparison to select from SPY, QQQ, TQQQ, SQQQ, PSQ. Also detects bear-market rallies via QQQ 10d return > +5.5%."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "Bull mode routes into 3x leveraged funds: TQQQ, UPRO and TECL. The sharper structural risk is SVXY, a short-volatility position held in bull mode, which can lose 80 to 90 percent in a single VIX spike event.",
      "backtest_limits": "The record is bounded by SVXY and UVXY, which both began trading on 2011-10-04, so it runs about 14.6 years and contains no 2008 financial crisis: every drawdown here comes from a post-2011 market. Its standard deviation is meaningfully lower than Holy Grail's or TQQQ For The Long Term's at comparable annualised return, which is the comparison that makes this strategy interesting. Those two run about three months longer, so the windows are close rather than identical.",
      "signal": "Several components run in parallel on different time horizons, a SPY 200-day moving average against a TQQQ 20-day, with a deep bear-market protocol that uses QQQ cumulative-return detection. That is more nuanced protection than a simple RSI dip-buy. The cost is that the logic tree is among the largest and most complex in this library, so checking by hand what this strategy would do in a given market is harder here than almost anywhere else on the site.",
      "hedge": "The deep bear protocol rotates defensively rather than holding a standing hedge, and the reachable universe includes PSQ, SQQQ and TLT for that purpose. SVXY is not a hedge despite sitting alongside them: short volatility pays in calm markets and fails in exactly the conditions a hedge exists to cover.",
      "concentration": "The claim worth making about this strategy is diversification: it runs more parallel components than anything else in this library's leveraged tier. The 2022 bear market is the counterexample worth knowing, because all components were simultaneously in bear mode. The diversification is across time horizons and signals, not across outcomes when the whole market falls at once."
    },
    "tldr": {
      "thesis": "Four sub-strategies held in equal quarters, and all four are variants of the same idea. Their names inside the symphony are TQQQ FTLT, TQQQ 20d SMA, TQQQ FTLT with a 20-day modification, and TQQQ 20d SMA with a sideways modification. Each is a complete bull and bear engine built on the same handful of tests, so what looks like a committee of four is closer to one strategy voting four times. Across the record TQQQ was 33.0% of all capital deployed, more than three times the next largest holding.",
      "works_well_in": [
        "Long uptrends. The whole assembly sits on SPY's 200-day average, which was passed on 3,172 of {backtest_days} days in a reconstruction of the logic over real prices, and above that gate a third of the book is in TQQQ. Across the record TQQQ compounded +52,921.5% over the 2,593 days it was held.",
        "Volatility selling in a calm market. SVXY is the second largest holding at 10.9% of capital, and it compounded +4,735.7% across the 2,578 days the rules named it. It is carried at a fixed 33% weight inside one of the four horsemen rather than being selected by any test.",
        "Deep bear markets, where the cascading bear rungs have time to work. Through the 2022 decline the reconstruction held SQQQ on 24% of days and PSQ on 23% while SQQQ rose 120.7% and PSQ rose 41.2%.",
        "Volatility spikes. Two separate overbought guards reach UVXY and a third branch reaches VIXY. UVXY compounded +2,272.6% over 149 days held and VIXY +253.7% over 22. In the February 2018 spike the reconstruction held VIXY on 28% of days and UVXY on 11%, while VIXY rose 99.6% and UVXY rose 181.4%.",
        "Semiconductor and tech leadership, since the leveraged sector funds sit in the top-three momentum basket. TECL compounded +195,040.5% over 1,801 days held and SOXL +318,771.3% over 1,770."
      ],
      "struggles_in": [
        "Sharp selloffs that do not last. The gate crossed 66 times across the record and 19 of its 33 stretches below lasted 5 trading days or fewer, so most regime switches fire into a decline that is nearly over.",
        "Declines the bear half sits out. Below the gate the reconstruction still held TQQQ on 26.4% of days, because several of the four horsemen route back to leveraged long positions through their own fallbacks.",
        "A volatility shock while short volatility. SVXY is held on more days than anything except TQQQ and is not gated by any of the overbought tests protecting the rest of the book. Across the February 2018 spike SVXY fell 92.6%.",
        "Any environment where trading costs are real. The allocation changed on 1,845 of {backtest_days} days, about once every two trading days, spread across up to nine funds at once."
      ]
    },
    "assumptions": {
      "market": [
        "**Leveraged Nasdaq keeps working.** Whatever the four components look like separately, together they put 33.0% of all capital into TQQQ and another 20.4% into TECL, SOXL, UPRO and UDOW. This is a leveraged long-equity strategy with a large and elaborate exit.",
        "**Short volatility is a persistent source of return.** SVXY is carried at a fixed weight rather than selected by any test, and it was held on 2,578 of {backtest_days} days, second only to TQQQ. Nothing gates it when volatility spikes.",
        "**A raw 200-day moving average on SPY identifies the regime.** One close against one average, unbuffered, deciding what all four components do at once. It was crossed 66 times in {backtest_years} years.",
        "**Combining several similar systems reduces risk.** This is the premise of the name and the equal-weight structure. It holds only to the extent the four differ, and their holdings overlap heavily: two of them are roughly half TQQQ on their own."
      ],
      "structural": [
        "**The tree is 498 lines built from 18 distinct tests.** It contains 116 conditional nodes, but only 18 unique expressions among them. One test, a 10-day RSI on TLT against the same reading on SQQQ, appears 28 separate times. The apparent sophistication is repetition rather than range.",
        "**25 of those 116 conditions never selected anything in the whole record.** Entire blocks, including the deleveraging logic behind a QQQ 252-day return below -20%, sit in branches the evaluation never reached across {backtest_days} trading days.",
        "**One block is a literal duplicate of its own sub-branch.** Inside the sideways-market protection, an equal-weight group holds a test for SPY above its 20-day average alongside a second copy of that test's own else-branch. When SPY is below its 20-day average both halves resolve to the same fund, which then receives the full allocation instead of half of it.",
        "**The four components are not four ideas.** All four are named after TQQQ inside the symphony. Two are FTLT variants carrying 28 and 54 conditions; the other two are 20-day moving average variants carrying 5 and 29. The two smaller ones are 49.6% and 55.3% TQQQ by themselves.",
        "**It does hold several positions at once, which most strategies here do not.** The most common state is four distinct funds, on 1,469 of {backtest_days} days, and it ranged from one to nine. That is real breadth in count, though not in kind.",
        "**Turnover is high and appears in no published figure.** 1,845 allocation changes across the record is about one every two trading days, and none of the metrics on this page carries a commission, a spread or a slippage assumption.",
        "**Two legs lost money over the days they were held.** IWM compounded -10.0% across 112 days and SPLV -3.8% across 119. Both are defensive picks inside the froth basket.",
        "**{standard_deviation} annualized volatility and a {max_drawdown_abs} maximum drawdown are the price of the record above.** A {sharpe_ratio} Sharpe and a {calmar_ratio} Calmar are strong, and the worst single day in the record was {worst_day}.",
        "**The record starts in January 2012 and covers {backtest_days} trading days**, bounded by the launch of the leveraged and inverse funds it uses, so the 2008 crisis is absent. It contains one full bear market."
      ]
    },
    "regimes": [
      {
        "regime": "Sustained uptrend",
        "expected": "Strong",
        "why": "SPY holds above its 200-day average and all four components converge on leveraged long positions, with a fixed short-volatility sleeve alongside them.",
        "example": "2023 AI bull: SPY +26.7%, TQQQ +204.9%, TECL +211.9%, SVXY +75.6%. The reconstruction held TQQQ on 39% of days."
      },
      {
        "regime": "Long, deep bear market",
        "expected": "Strong",
        "why": "The gate stays shut long enough for the cascading bear rungs to settle on inverse funds rather than cycling back to leveraged longs.",
        "example": "2022 bear market: SPY -24.5%, TQQQ -78.8%, SQQQ +120.7%, PSQ +41.2%. The reconstruction held SQQQ on 24% of days and PSQ on 23%."
      },
      {
        "regime": "Vertical crash",
        "expected": "Strong",
        "why": "The overbought guards fire on the way in and the bear branches take over on the way down, so the book turns defensive while the decline is still running.",
        "example": "COVID crash: SPY -33.7%, TQQQ -69.8%, SQQQ +84.4%, UVXY +552.3%, PSQ +30.5%."
      },
      {
        "regime": "Overheated bull",
        "expected": "Mixed",
        "why": "A 60-day RSI above 60 on SPY moves parts of the book into short-term bonds, the dollar, staples or long Treasuries, so the strategy steps back from a rally that may continue.",
        "example": "2017 low-volatility bull: SPY +20.8% and TQQQ +112.9%, while the reconstruction held SHV on 18% of days and TMF on 7%."
      },
      {
        "regime": "Volatility shock",
        "expected": "Poor",
        "why": "SVXY is held on more days than any fund except TQQQ and is carried at a fixed weight, outside the overbought guards that protect the leveraged long positions.",
        "example": "February 2018 spike, 26 Jan to 8 Feb: SPY -10.1%, SVXY -92.6%, UVXY +181.4%, VIXY +99.6%."
      },
      {
        "regime": "Short, sharp selloff",
        "expected": "Poor",
        "why": "The gate is an unbuffered comparison of one close to one average, and several components route back to leveraged longs from inside their own bear branches.",
        "example": "Spring 2025 drawdown: SPY -18.8%, TQQQ -56.8%, TECL -62.0%. The reconstruction held TECL on 26% of days and TQQQ on 19%."
      }
    ],
    "regime_note": "**The example column is what the holdings did, not what the strategy returned.** Each ticker figure is the move in that fund between the first and last trading day of the window, computed from daily closes, and each holdings share comes from evaluating this strategy's own symphony tree over those same closes. That evaluation is a reading of the rules rather than a backtest: it answers only which positions the rules would name on a given day, and it carries no fees, no slippage and no rebalance timing. Because this strategy changes its allocation about once every two trading days across as many as nine funds at once, no reconstructed return is quoted on this page, and the regimes above are ranked from holdings and price moves alone. The reconstruction covers {backtest_days} trading days from 4 January 2012 to 27 August 2026, matching the backtest window on record."
  },
  {
    "slug": "soxx-group",
    "name": "SOXX Group",
    "symphony_url": "https://app.composer.trade/symphony/7PBSP926Mp40r6bPnP0j/details",
    "symphony_id": "7PBSP926Mp40r6bPnP0j",
    "annualized_rate_of_return": 1.1037675026271958,
    "max_drawdown": -0.6917425729158794,
    "cumulative_return": 49690.788986,
    "calmar_ratio": 1.595633326389789,
    "sharpe_ratio": 1.4390664366812098,
    "standard_deviation": 0.673202552458029,
    "min": -0.2982779711812592,
    "mean": 0.003844377771152662,
    "median": 0.00010979104150643515,
    "max": 0.5470889577369282,
    "trailing_one_month_return": 0.20398643473772005,
    "trailing_three_month_return": 0.19954077311378415,
    "trailing_one_year_return": 1.0631067342860345,
    "backtest_days": 3663,
    "description": "A semiconductor-specialist strategy by Garen/DN that uses UVXY's 30-day RSI to detect high-volatility regimes and then trades SOXL or SOXS based on the magnitude of single-day moves in SMH, applying a tiered multi-timeframe RSI cascade called the '30-20-10 Double Pop' to catch mean-reversion after extreme semiconductor swings.",
    "tags": [
      "rsi",
      "momentum",
      "leveraged-etfs",
      "mean-reversion",
      "standard-deviation",
      "inverse-etfs"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "A semiconductor specialist by Garen/DN, this strategy uses UVXY's 30-day RSI to detect high-volatility regimes, then trades SOXL or SOXS based on the size of single-day moves in SMH, applying a tiered multi-timeframe RSI cascade it calls the '30-20-10 Double Pop' to catch mean reversion after extreme semiconductor swings. The design is explicitly volatility-gated mean reversion: it only engages when chips are moving violently, and uses nested RSI timeframes to time the snapback in either direction.",
      "Over a long 14-year backtest it returns {annualized_rate_of_return:0} annualized, but the risk is severe: a {max_drawdown_abs:0} max drawdown, {standard_deviation:0} volatility, and the weakest risk-adjusted figures of this group ({sharpe_ratio} Sharpe, {calmar_ratio} Calmar). The noteworthy characteristic is that the strategy takes very large losses relative to its returns, since fading extreme single-sector moves works until a move keeps going, and 3x chip ETFs punish a wrong-way bet harshly. It is a high-conviction, high-pain semiconductor tool, not a balanced allocation."
    ],
    "how_it_works": [
      "SOXX Group: full name 'K Wave V6 (w/ SOXX Double Pops) Pure SOXX l Garen/DN', is built on a single thesis: semiconductor ETFs (SOXX/SMH/SOXL) tend to experience outsized single-day moves followed by mean-reversions, and these moves are more predictable during periods of elevated market volatility. The outer gate checks RSI(UVXY,30d) > 63. When UVXY's 30-day RSI is this elevated, the strategy enters 'high volatility' mode where daily magnitude triggers become active. The specific thresholds (-3%, -5.5%, -7% for down days; +3.5%, +4.5%, +5.5% for up days) represent different tiers of 'pop' severity, each carrying a different expected reversal profile.",
      "The '30-20-10 Double Pop' is the strategy's core signal system. After a significant single-day move, it evaluates SMH's RSI across three decreasing windows: 30-day, 20-day, and 10-day. Thresholds escalate tighter at shorter windows (RSI > 70 at 30d, > 75 at 20d, > 80 at 10d). If any threshold is breached, the strategy holds SOXS, betting that a recent extreme pop is about to fade. RSI(SMH,10d) < 30 inverts the logic and triggers a SOXL buy for extreme oversold conditions. If no RSI threshold fires, the strategy uses SPY RSI(60d) > 50 and a bond-market check (RSI(IEF,200d) vs TLT) to route into either the 'Double Pop Bot' component or the 'SOXL FTLT' component.",
      "The 'SOXL FTLT' (For The Long Term) sub-component is an embedded longer-term fallback that runs when no short-term mean-reversion signal is active. It checks MaxDD(SPY,10d) > 6 (recent drawdown exceeding 6%) to classify the immediate market environment as bear or bull, then uses CumRet(SVXY,5d) > 0 and RSI(TQQQ,60d) > 50 to select between SOXL and BSV via a momentum filter. In plain terms: when the semiconductor pop system gives no strong signal, the strategy defaults to a SPY/SVXY/TQQQ-based momentum classifier. The max drawdown, among the deepest in the library, reflects SOXL's inherent volatility and the strategy's willingness to maintain long semiconductor exposure even through major semiconductor bear markets."
    ],
    "signals": [
      {
        "name": "UVXY RSI(30d) Volatility Gate",
        "tag": "rsi",
        "description": "Primary regime gate: RSI(UVXY,30d) > 63. UVXY's 30-day RSI measures sustained volatility elevation, not just daily spikes. Above 63 activates high-volatility mode where single-day magnitude triggers become relevant. Below 63 routes to the baseline 30-20-10 Double Pop checks."
      },
      {
        "name": "30-20-10 Double Pop RSI Cascade",
        "tag": "rsi",
        "description": "Multi-timeframe RSI cascade on SMH: RSI(30d) > 70 OR RSI(20d) > 75 OR RSI(10d) > 80 -> SOXS (fade the pop). RSI(10d) < 30 -> SOXL (buy the oversold). Three separate RSI windows create a tiered mean-reversion signal, longer windows trigger at lower thresholds."
      },
      {
        "name": "Daily Magnitude Gates (SMH CumRet 1d)",
        "tag": "momentum",
        "description": "In high-volatility mode, the strategy grades single-day SMH moves: < -7% -> immediate SOXL (capitulation). -5.5% to -7% -> 50% SOXL + 50% Double Pop. -3% to -5.5% -> same split. > +5.5% -> SOXS (fade the rip). +4.5% to +5.5% -> 50% SOXS + Double Pop. Tiered responses match position size to move severity."
      },
      {
        "name": "SOXL FTLT Fallback (SVXY + TQQQ Momentum)",
        "tag": "momentum",
        "description": "When no pop signal fires: CumRet(SVXY,5d) > 0 and RSI(TQQQ,60d) > 50 classify the environment as bull or bear. Bull -> BSV/SOXL momentum filter. Bear (MaxDD(SPY,10d) > 6) -> SOXL/BSV bear selector. Functions as the strategy's long-term momentum baseline when short-term signals are quiet."
      }
    ],
    "risk_profile": {
      "verdict": "Extremely Aggressive",
      "leverage": "Only four instruments are reachable, and the strategy is willing to stay in SOXL through extended bear markets. Its volatility reflects both SOXL's 3x amplification and the frequent switching between SOXL and SOXS.",
      "backtest_limits": "Bounded by SOXL, the record begins in 2012 and misses the 2008 financial crisis. It does cover multiple full semiconductor cycles, which is more than most strategies here can say.",
      "signal": "Its Calmar and Sharpe sit in the lower half of this library's leveraged semiconductor strategies, which suggests the 'Double Pop' logic does not dramatically improve on raw buy-and-hold SOXL on a risk-adjusted basis despite its complexity.",
      "hedge": "SOXS is the only defensive position and it is 3x inverse semiconductors, so the defensive state is itself a leveraged directional bet on the same sector.",
      "concentration": "A single-sector strategy with a two-instrument core. There is no diversification available inside it, by design."
    },
    "author_note": "Created by Garen and DN, as credited in the strategy group name 'K Wave V6 (w/ SOXX Double Pops) Pure SOXX l Garen/DN'. The 'K Wave' name references Kondratiev waves, long-term (40-60 year) economic cycles that Garen likely uses as a macro framework. This is version 6 of the K Wave series.",
    "tldr": {
      "thesis": "The largest tree in this library and the smallest set of answers. 1,843 lines and 281 conditional nodes resolve to a choice among exactly four holdings: SOXL, SOXS, and two cash-like bond funds. Every test in it, whether it reads UVXY's volatility, SMH's single-day move, the S&P's drawdown or the relationship between bond and equity RSI, is ultimately asking one question: leveraged long semiconductors, leveraged short semiconductors, or neither. Across the record it answered SOXL 54.6% of the time and spent 61.4% of days changing its mind.",
      "works_well_in": [
        "Semiconductor bull markets. SOXL is the answer more often than everything else combined, and across the 2,486 days the rules named it, it compounded +1,303,173.8%. That single leg is the strategy.",
        "Strong recoveries off a low, where the logic re-enters leveraged long quickly. Through the COVID recovery the reconstruction held SOXL on 79% of days while SOXL rose 185.1%.",
        "Trending markets in either direction, as long as the trend lasts longer than the tests do. The gate that opens the high-volatility branch stayed shut for one stretch of 1,098 trading days, so for years at a time the strategy simply runs its main SOXL-or-cash cascade.",
        "Periods where sitting out is worth something. BSV takes 31.5% of all capital and BIL another 1.3%, so roughly a third of the record is spent in short-duration bonds rather than in either semiconductor position."
      ],
      "struggles_in": [
        "Sharp semiconductor declines, which is a serious problem for a semiconductor strategy. In the spring 2025 drawdown the reconstruction held SOXL on 88% of days while SOXL fell 73.7% and SOXS rose 171.8%. In the Q4 2018 selloff it held SOXL on 85% of days while SOXL fell 57.0% and SOXS rose 75.9%.",
        "Anything involving the short leg. SOXS was held on 1,039 days, more than a quarter of the record, and compounded -73.2% across them. It is the worst-performing leg of any strategy reviewed in this library so far.",
        "High-volatility regimes, in the sense that the branch built for them almost never runs. The top-level gate, a 30-day RSI on UVXY above 63, was true on 39 of {backtest_days} days, or 1.1%.",
        "Any environment where trading costs are real. The allocation changed on 2,248 of {backtest_days} days, about once every 1.6 trading days, which is the highest turnover of any strategy reviewed here."
      ]
    },
    "assumptions": {
      "market": [
        "**Semiconductors go up over time, and 3x leverage is the way to own them.** SOXL is 54.6% of all capital deployed and carries essentially the whole result. The elaborate machinery around it decides when to be out, not what to be in.",
        "**Short-term signals can time a 3x sector fund.** Most of the tests read one-day moves in SMH or 5-day and 10-day windows. The strategy is betting that readings this short carry information about tomorrow, in an instrument that moves three times as fast as the sector.",
        "**The short side is a usable position rather than a hedge.** SOXS is a full holding here, not an overlay, and it is selected by the same short-horizon tests that select the long side.",
        "**Volatility regimes can be identified from UVXY's own 30-day RSI.** That reading is the top-level split of the entire strategy, and across {backtest_years} years it put the logic into its high-volatility branch on 39 days."
      ],
      "structural": [
        "**281 conditional nodes drawn from 32 distinct tests, and 123 of them never selected anything.** Nearly half the conditions in the tree did not decide a single day across {backtest_days} trading days. Three tests, a 10-day maximum drawdown on SPY above 6%, a 5-day cumulative return on SVXY above zero, and a 60-day RSI on TQQQ above 50, each appear 45 separate times.",
        "**The whole tree can only ever say one of four things.** SOXL, SOXS, BSV or BIL. No amount of nesting changes the size of the answer set, and two of the four are cash equivalents.",
        "**The short leg lost three quarters of its value over the days it was used.** SOXS compounded -73.2% across 1,039 days held. For comparison, in the two sharpest semiconductor declines in the record the strategy was in SOXL on 85% and 88% of days. The short position is held often, and mostly not when it would have helped.",
        "**Turnover is the highest in this library.** 2,248 allocation changes across {backtest_days} days is about one every 1.6 trading days, in 3x leveraged funds, and none of the metrics on this page carries a commission, a spread or a slippage assumption.",
        "**It holds one position on 59.4% of days and two on most of the rest.** The equal-weight groups produce a SOXL-and-bonds blend rather than genuine breadth, since there are only four things it can hold.",
        "**{standard_deviation} annualized volatility and a {max_drawdown_abs} maximum drawdown are the price of the record above.** That drawdown is among the deepest in this library, the worst single day in the record was {worst_day}, and a {sharpe_ratio} Sharpe with a {calmar_ratio} Calmar is the weakest risk-adjusted pair of the strategies reviewed so far.",
        "**Thresholds are tuned to a granularity the logic cannot justify.** Single-day SMH return limits of -0.1%, -0.5%, 0.8%, -3%, -5.5% and -7% sit beside RSI limits of 30, 44, 50, 63, 70, 75 and 80 across lookbacks of 10, 20, 30 and 60 days. A test on a one-day move of -0.1% is not distinguishable from noise.",
        "**The record starts in February 2012 and covers {backtest_days} trading days**, bounded by the launch of the leveraged semiconductor funds, so it misses the 2008 crisis and the 2000 semiconductor collapse entirely."
      ]
    },
    "regimes": [
      {
        "regime": "Semiconductor bull market",
        "expected": "Strong",
        "why": "The cascade resolves to SOXL more often than to everything else combined, and 3x exposure to a rising sector is what produced the record.",
        "example": "2023 AI bull: SOXL +237.8%, SOXS -85.1%. The reconstruction held SOXL on 60% of days."
      },
      {
        "regime": "Recovery off a panic low",
        "expected": "Strong",
        "why": "The short-horizon tests re-enter leveraged long quickly once single-day moves turn positive, which is exactly when the sector rebounds fastest.",
        "example": "COVID recovery, 24 Mar to 31 Aug 2020: SOXL +185.1%, and the reconstruction held SOXL on 79% of days."
      },
      {
        "regime": "Long trend in either direction",
        "expected": "Strong",
        "why": "The strategy is at its simplest when nothing triggers, running a plain SOXL-or-bonds cascade. Its high-volatility branch stayed shut for one continuous stretch of 1,098 trading days.",
        "example": "2012 to 2014: SPY +71.4%, SOXL +401.1%. The reconstruction held SOXL on 55% of days and BSV on 35%."
      },
      {
        "regime": "Sharp semiconductor selloff",
        "expected": "Poor",
        "why": "The clearest weakness on the page. The short-horizon tests keep resolving to the long side while the sector falls, and the short leg that exists for exactly this case is barely used.",
        "example": "Spring 2025 drawdown: SOXL -73.7%, SOXS +171.8%, and the reconstruction held SOXL on 88% of days and SOXS on 6%."
      },
      {
        "regime": "Volatility spike",
        "expected": "Unknown",
        "why": "The branch designed for it almost never runs. A 30-day RSI on UVXY above 63 was true on 39 days in {backtest_years} years, so the high-volatility machinery is essentially untested.",
        "example": "February 2018 spike: SPY -10.1%, SOXL -32.5%, and the reconstruction was in BSV or BIL on 77% of days."
      },
      {
        "regime": "Choppy, directionless market",
        "expected": "Poor",
        "why": "The logic reads one-day and five-day moves, so a market with no follow-through flips it repeatedly between a 3x long, a 3x short and cash.",
        "example": "Across the record the allocation changed on 2,248 of {backtest_days} days, about once every 1.6 trading days."
      }
    ],
    "regime_note": "**The example column is what the holdings did, not what the strategy returned.** Each ticker figure is the move in that fund between the first and last trading day of the window, computed from daily closes, and each holdings share comes from evaluating this strategy's own symphony tree over those same closes. That evaluation is a reading of the rules rather than a backtest: it answers only which positions the rules would name on a given day, and it carries no fees, no slippage and no rebalance timing. That caveat matters more here than on any other page in this library, because this strategy changes its allocation about once every 1.6 trading days in 3x leveraged funds. For that reason no reconstructed return is quoted, and the regimes above are ranked from holdings and price moves alone. The reconstruction covers {backtest_days} trading days from 2 February 2012 to 27 August 2026, matching the backtest window on record."
  },
  {
    "slug": "soxl-growth-rl",
    "name": "SOXL Growth (Original)",
    "symphony_url": "https://app.composer.trade/symphony/CW8oWU12S6vEvn2Hh7jD/details",
    "symphony_id": "CW8oWU12S6vEvn2Hh7jD",
    "annualized_rate_of_return": 1.3549040336019345,
    "max_drawdown": -0.8784363484555262,
    "cumulative_return": 561496.574334,
    "calmar_ratio": 1.5424043369609393,
    "sharpe_ratio": 1.4281023527391843,
    "standard_deviation": 0.8555942002817787,
    "min": -0.38592974499252464,
    "mean": 0.004848714644493687,
    "median": 0.004041733456686791,
    "max": 0.5462993651681052,
    "trailing_one_month_return": -0.19470365792036237,
    "trailing_three_month_return": -0.4421700889130006,
    "trailing_one_year_return": 0.3839231667746883,
    "backtest_days": 3894,
    "description": "A machine-learning optimized SOXL strategy (the 'RL' stands for Reinforcement Learning) that uses standard deviation of returns alongside RSI and drawdown thresholds to navigate between long semiconductor exposure, inverse ETFs, and diversified leveraged baskets, with hyper-precise numeric thresholds that reveal its algorithmic origin.",
    "tags": [
      "rsi",
      "momentum",
      "leveraged-etfs",
      "standard-deviation",
      "inverse-etfs",
      "original"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "This is a machine-learning-optimized SOXL strategy (the 'RL' stands for Reinforcement Learning) that uses standard deviation of returns alongside RSI and drawdown thresholds to navigate between long semiconductor exposure, inverse ETFs, and diversified leveraged baskets. The hyper-precise, oddly specific numeric thresholds betray its algorithmic origin: rather than round human-chosen levels, the boundaries were fitted by an optimization process searching for the best historical configuration.",
      "It returns {annualized_rate_of_return:0} annualized over a long 15-year backtest but carries the deepest drawdown in the entire library at {max_drawdown_abs:0}, with extreme {standard_deviation:0} volatility and weak {sharpe_ratio} Sharpe and {calmar_ratio} Calmar ratios. Two cautions dominate. First, an {max_drawdown_abs:0} drawdown means the strategy lost nearly nine-tenths of peak value at its worst, which few investors could hold through. Second, RL and optimized strategies are especially prone to overfitting, because thresholds tuned to maximize a past backtest often degrade out-of-sample. The long test window helps, but the algorithmic curve-fitting risk and catastrophic drawdown are the headline concerns."
    ],
    "how_it_works": [
      "SOXL Growth v2.4.5 RL takes its name from its generation method: 'RL' indicates Reinforcement Learning, a machine-learning technique where an agent learns optimal decisions through trial and reward signals on historical data. The tell is in the thresholds, human-designed strategies use round numbers (RSI > 50, drawdown > 50%), while RL-optimized strategies produce values like RSI(SOXL,32d) <= 62.1995, StdDev(SOXL,105d) <= 4.9226, and RSI(SOXL,30d) >= 57.49. These precise decimals are the fingerprints of an optimizer that tested thousands of parameter combinations. The strategy integrates two categories of signals most strategies ignore: standard deviation of returns (volatility-of-volatility) and maximum drawdown thresholds on the instruments themselves.",
      "The outer gate uses MaxDD(SOXL,60d) >= 50: if SOXL has experienced a 50% or greater drawdown within the last 60 trading days, the strategy enters its 'major drawdown' branch. In this branch, the primary reference switches from SOXL to TQQQ: it checks StdDev(TQQQ,14d) and StdDev(TQQQ,100d) to classify short-term and long-term volatility. Low volatility on both timeframes suggests a potential recovery, routing into [SOXL, TQQQ, SPXL] momentum filter. High short-term volatility but positive RSI(TQQQ,30d) routes to SPXL or SOXS depending on recent vol. A CumRet(TQQQ,8d) <= -20 check catches 8-day crash scenarios and re-enters SOXL as a dip-buy. MaxDD(TQQQ,200d) <= 65 triggers the inverse basket [TMV, SQQQ, SPXS].",
      "When SOXL has NOT experienced a 50%+ drawdown in 60 days (normal regime), the strategy routes through RSI(SOXL,32d) <= 62.2 as a secondary gate. In the RSI-below-threshold path, it checks long-term volatility (StdDev(SOXL,105d) <= 4.92), low long-term vol just holds SOXL outright. Higher long-term vol activates RSI(SOXL,30d) >= 57.49 and StdDev(SOXL,30d) >= 5.41 for current-month assessment: a combination of elevated 30d RSI and high 30d volatility leads to SOXS, otherwise to [SOXL, SPXL, TQQQ] filter. The deep drawdown check CumRet(SOXL,32d) <= -12 re-enters SOXL on a 32-day crash. The max drawdown, the deepest in this library, reflects the strategy's commitment to SOXL even in bear markets, with inverse ETF positions providing only periodic protection."
    ],
    "signals": [
      {
        "name": "MaxDD(SOXL,60d) >= 50 Primary Gate",
        "tag": "momentum",
        "description": "Outer regime gate: has SOXL lost 50%+ at any point in the last 60 trading days? Yes -> major-drawdown branch (references TQQQ volatility). No -> normal-regime branch (references SOXL RSI and vol directly). Unusual for using the instrument's own drawdown as its primary signal."
      },
      {
        "name": "Standard Deviation of Returns Gates",
        "tag": "momentum",
        "description": "Multiple StdDev conditions: StdDev(TQQQ,14d) <= 18, StdDev(TQQQ,100d) <= 3.8, StdDev(TQQQ,30d) >= 5.8, StdDev(SOXL,105d) <= 4.92, StdDev(SOXL,30d) >= 5.41. Volatility-of-volatility is used as a regime signal, the only strategy in this library to do so extensively."
      },
      {
        "name": "RL-Optimized RSI Thresholds",
        "tag": "rsi",
        "description": "RSI thresholds with machine-learning precision: RSI(SOXL,32d) <= 62.1995, RSI(SOXL,30d) >= 57.49, RSI(TQQQ,30d) >= 50. The 32-day RSI window (not 30 or 14) and the 62.1995 threshold are characteristic of reinforcement-learning optimization rather than human design."
      },
      {
        "name": "Inverse ETF Basket: TMV, SQQQ, SPXS",
        "tag": "leveraged-etfs",
        "description": "Bear-mode short basket: picks the bottom 2 by 3-day cumulative return from [TMV, SQQQ, SPXS]. TMV (3x inverse long-duration bonds), SQQQ (3x inverse QQQ), SPXS (3x inverse S&P500). Activates when TQQQ 30-day trend is negative or TQQQ 200-day MaxDD exceeds 65%."
      }
    ],
    "risk_profile": {
      "verdict": "Extremely Aggressive",
      "leverage": "SOXL and SPXL long, SOXS, SPXS and SQQQ inverse, TMF and TMV on Treasuries. It carries the deepest max drawdown in this library, and its volatility is among the highest here, behind only Beta Ballers and The Gold Miner.",
      "backtest_limits": "The longest record of the leveraged strategies here, which gives the optimised parameters more historical basis than most of their peers. It is still much shorter than the two unleveraged 27-year strategies in this library, and length does not address the fitting problem below.",
      "signal": "The thresholds are reinforcement-learning optimised, and the strategy stays long through most downturns relying on those precise exit points rather than a broad regime filter like a 200-day average. Thresholds fitted to historical SOXL and TQQQ behaviour may be overfit and could behave differently in a new regime. Its Calmar and Sharpe are modest for the risk taken.",
      "hedge": "SOXS, SPXS and SQQQ are all leveraged inverse positions, so the defensive states are directional bets rather than ballast. TMF and TMV are the only non-equity legs and they point in opposite directions.",
      "concentration": "Semiconductors are the core exposure, and the strategy has recorded single-month losses approaching half the portfolio. That is what concentration and leverage look like together on a bad month."
    },
    "tldr": {
      "thesis": "A machine-fitted trading rule that says so in its own name. The RL stands for reinforcement learning, and the thresholds show it: this strategy asks whether SOXL's 32-day RSI is at or below 62.1995, whether its 105-day return volatility is at or below 4.9226, whether its 30-day volatility is at or above 5.4135. Underneath the four decimal places it is a simple thing, a switch between 3x long semiconductors and 3x short semiconductors, and it landed on SOXL for 62.4% of all capital and SOXS for 27.1%. It carries the deepest drawdown of any strategy in this library.",
      "works_well_in": [
        "Semiconductor bull markets. SOXL is what the logic chooses more than everything else combined, and across the 2,506 days the rules named it, it compounded +4,073,038.8%. The {cumulative_return} headline is that leg.",
        "Recoveries off a crash low, where the volatility tests clear and the strategy returns to 3x long quickly. Through the COVID recovery the reconstruction held SOXL on 56% of days and SPXL on 18% while SOXL rose 185.1%.",
        "Calm, grinding uptrends. The main branch resolves to plain SOXL whenever SOXL's 32-day RSI is moderate and its 105-day volatility is low, and that pair of conditions decided 1,615 days on its own. Through 2012 to 2014 the reconstruction held SOXL on 81% of days while SOXL rose 401.1%.",
        "Genuine crisis conditions, in the narrow sense that the crisis branch exists and does something. When SOXL's 60-day maximum drawdown reaches 50%, a different half of the tree takes over and reaches SPXS, SQQQ and TMV. That state covered 510 of {backtest_days} days."
      ],
      "struggles_in": [
        "Being short semiconductors during a semiconductor rally, which happened repeatedly. In the 2021 melt-up the reconstruction held SOXS on 54% of days. In the 2023 AI bull it held SOXS on 36% of days while SOXS fell 85.1% and SOXL rose 237.8%.",
        "Anything involving the short leg at all. SOXS was held on 1,056 days, more than a quarter of the record, and compounded -62.0% across them.",
        "Sharp declines the logic reads as ordinary. In the Q4 2018 selloff the reconstruction held SOXL on 79% of days while SOXL fell 57.0% and SOXS rose 75.9%. In the February 2018 volatility spike it held SOXL on 100% of days while SOXL fell 32.5%.",
        "Any environment where the thresholds are slightly wrong. Nothing in the logic is robust to a 62.1995 that should have been 61 or 64, and every one of the 15 conditions in the tree is a hard cutoff of that kind."
      ]
    },
    "assumptions": {
      "market": [
        "**Semiconductors rise over the long run and 3x leverage is the way to own them.** SOXL is 62.4% of all capital deployed and produced essentially the whole result. Everything else in the tree decides when to leave it.",
        "**A fitted threshold generalises to the future.** This is the assumption the whole page turns on. The strategy names its own method, and the numbers it landed on are precise to four decimal places on readings that are themselves noisy.",
        "**Volatility of returns predicts direction.** Five of the 15 conditions test a standard deviation of returns rather than a price or a trend. The design treats a calm market as a reason to be long and a volatile one as a reason to be short.",
        "**The short side is a position rather than a hedge.** SOXS is chosen by the same fitted thresholds that choose SOXL and is held for more than a quarter of the record, so it is a directional bet in its own right."
      ],
      "structural": [
        "**The thresholds are precise to four decimal places, and that is the largest warning on the page.** 62.1995, 4.9226, 5.4135, 57.49, alongside lookbacks of 32 and 105 days. No market process justifies that precision. A rule fitted this finely to {backtest_days} days of history is describing that history rather than a mechanism, and the strategy's own title records the fitting method.",
        "**One basket lists the same fund twice.** In two places the logic ranks TMV, SQQQ, SPXS and SPXS by 3-day return and takes the bottom two. Because SPXS occupies two of the four slots it can win both, in which case it receives the entire allocation rather than half. This is a defect in the symphony rather than a design choice.",
        "**The short leg lost most of its value over the days it was used.** SOXS compounded -62.0% across 1,056 days held. Three of the seven legs in the strategy lost money over their holding days: SOXS, SPXS at -2.9% and TMV at -8.6%.",
        "**TMF is in the universe and was never held.** It appears in two baskets across the record and the logic never once selected it.",
        "**{max_drawdown_abs} is the deepest drawdown of any strategy in this library**, and {standard_deviation} annualized volatility is the third highest. The worst single day in the record was {worst_day}, which is within a rounding error of the worst day recorded anywhere in this library.",
        "**A {sharpe_ratio} Sharpe and a {calmar_ratio} Calmar are modest for the risk taken.** They are the weakest pair among the strategies reviewed so far in this rollout, and they are earned on a path that lost seven eighths of its value at the worst point.",
        "**It is concentrated by construction.** It holds exactly one fund on 90.2% of days, and it can only ever hold eight, every one of them a 3x leveraged fund: four long and four short.",
        "**The record covers {backtest_days} trading days from March 2011**, bounded by the launch of the leveraged semiconductor funds, so it misses the 2008 crisis and the 2000 semiconductor collapse. Turnover is moderate for this library, at one allocation change every 7.4 trading days, but none of the figures here carries a commission, a spread or a slippage assumption."
      ]
    },
    "regimes": [
      {
        "regime": "Calm semiconductor uptrend",
        "expected": "Strong",
        "why": "The main branch resolves to plain SOXL whenever the 32-day RSI is moderate and 105-day volatility is low. That pair decided 1,615 days on its own and is where the record was made.",
        "example": "2012 to 2014: SPY +71.4%, SOXL +401.1%, and the reconstruction held SOXL on 81% of days."
      },
      {
        "regime": "Recovery off a crash low",
        "expected": "Strong",
        "why": "The crisis branch hands back to leveraged long once the drawdown and volatility tests clear, which tends to happen while the rebound is still running.",
        "example": "COVID recovery, 24 Mar to 31 Aug 2020: SOXL +185.1%, SPXL +167.9%. The reconstruction held SOXL on 56% of days and SPXL on 18%."
      },
      {
        "regime": "Prolonged crisis",
        "expected": "Mixed",
        "why": "A 60-day drawdown of 50% or more opens a separate half of the tree that reaches inverse and rate funds. It ran on 510 days in long blocks rather than short bursts, so it is genuinely tested, but two of the strategy's three losing legs, SPXS and TMV, are reachable only from it.",
        "example": "2022 bear market: SOXL -89.8%, SPXS +82.2%, SQQQ +120.7%, TMV +140.7%. The reconstruction held SOXL on 59% of days and SPXS on 15%."
      },
      {
        "regime": "Strong semiconductor rally",
        "expected": "Poor",
        "why": "The fitted thresholds read a fast rally as a reason to be short. This is the most damaging pattern in the record and it recurred.",
        "example": "2023 AI bull: SOXL +237.8%, SOXS -85.1%, and the reconstruction held SOXS on 36% of days. In the 2021 melt-up it held SOXS on 54%."
      },
      {
        "regime": "Sharp selloff below the crisis trigger",
        "expected": "Poor",
        "why": "A decline that does not push SOXL's 60-day drawdown to 50% leaves the strategy in its ordinary branch, which defaults long.",
        "example": "February 2018 spike: SOXL -32.5%, SOXS +38.8%, and the reconstruction held SOXL on 100% of days."
      },
      {
        "regime": "A market unlike the fitted sample",
        "expected": "Unknown",
        "why": "Every threshold in this strategy is a hard cutoff chosen to four decimal places against {backtest_days} days of history. Nothing in the record tests what happens when the readings sit slightly on the other side of them.",
        "example": "The tree contains 15 conditions, all distinct, including a 32-day RSI cutoff at 62.1995 and a 105-day volatility cutoff at 4.9226."
      }
    ],
    "regime_note": "**The example column is what the holdings did, not what the strategy returned.** Each ticker figure is the move in that fund between the first and last trading day of the window, computed from daily closes, and each holdings share comes from evaluating this strategy's own symphony tree over those same closes. That evaluation is a reading of the rules rather than a backtest: it answers only which fund the rules would name on a given day, and it carries no fees, no slippage and no rebalance timing. No reconstructed return is quoted on this page. On a strategy that lost seven eighths of its value at its worst point, a modelled path with no costs would flatter the recovery more than it flatters anything else, so the regimes above are ranked from holdings and price moves alone. The reconstruction covers {backtest_days} trading days from 4 March 2011 to 27 August 2026, matching the backtest window on record."
  },
  {
    "slug": "nancy-pelosi-chips",
    "name": "Inside Nancy Pelosi's Chips - V3",
    "symphony_url": "https://app.composer.trade/symphony/HgK8mCeBnH4fQFNcfZ7q/details",
    "symphony_id": "HgK8mCeBnH4fQFNcfZ7q",
    "annualized_rate_of_return": 0.7546171685344081,
    "max_drawdown": -0.8628312087625853,
    "cumulative_return": 2661.784909,
    "calmar_ratio": 0.8745826076650952,
    "sharpe_ratio": 1.1124367875455714,
    "standard_deviation": 0.7634451508792695,
    "min": -0.3051388655156507,
    "mean": 0.0033701764726642,
    "median": 0.002054214503258933,
    "max": 0.5462984457394342,
    "trailing_one_month_return": 0.3023874912643665,
    "trailing_three_month_return": 0.024612716400582713,
    "trailing_one_year_return": -0.17122011920390412,
    "backtest_days": 3534,
    "description": "A semiconductor mean-reversion strategy named after Nancy Pelosi's famous chip stock trading, using 5-day SOXX cumulative returns to detect weekly momentum extremes and then trading SOXL or SOXS at the reversal point, while applying individual RSI checks on NVDA and AMD to catch extreme overbought and oversold conditions in the key stocks.",
    "tags": [
      "rsi",
      "momentum",
      "leveraged-etfs",
      "mean-reversion",
      "inverse-etfs"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "Named after the well-publicized chip-stock trading, this is a semiconductor mean-reversion strategy that uses 5-day SOXX cumulative returns to detect weekly momentum extremes, then trades SOXL or SOXS at the reversal point, while applying individual RSI checks on NVDA and AMD to catch extreme overbought and oversold conditions in the two bellwether names. The thesis is short-horizon reversion in chips: fade weekly extremes and lean on the most influential individual stocks to confirm the turn.",
      "This is the weakest risk-adjusted profile in the library, and its metrics should be read as a cautionary example: {annualized_rate_of_return:0} annualized over roughly 14 years, but an {max_drawdown_abs:0} max drawdown, the second deepest here behind SOXL Growth (Original), with a {sharpe_ratio} Sharpe and a Calmar of just {calmar_ratio}, meaning the annualized return is actually smaller than the maximum loss endured to earn it. Fading single-sector momentum without a strong regime gate exposes it to ruinous trends where the 'extreme' keeps extending. The long backtest only underscores that the poor ratios are structural, not a small-sample artifact; this strategy illustrates how high single-sector leverage can produce large returns and unacceptable risk simultaneously."
    ],
    "how_it_works": [
      "Inside Nancy Pelosi's Chips - V3 is named after U.S. House Speaker Nancy Pelosi, whose family made large and well-timed trades in semiconductor stocks including NVDA and AVGO during the period when the CHIPS and Science Act (2022) was being debated and signed into law. The strategy's name is an editorial comment on the information advantage that public officials might have in chip-sector legislative timing. The strategy itself uses purely technical signals, no news or legislative calendars, but focuses exclusively on the same semiconductor universe that made Pelosi's trades famous.",
      "The primary logic is a 5-day return mean-reversion framework on SOXX. When SOXX has gained more than 5% in the past five trading days (a strong week), the strategy checks whether today's 1-day return is sharply down (CumRet(SOXX,1d) < -2): if yes, it buys SOXL on the pullback within the strong week, betting the uptrend continues. If the day is not sharply down, it holds SOXS, betting the strong week has already over-extended. The mirror logic applies in the bearish case: CumRet(SOXX,5d) < -5 (weak week) with a positive day (> 2%) triggers SOXS (fading the dead-cat bounce), while a flat or down day triggers SOXL as a continuation dip-buy.",
      "In the normal regime (no extreme 5-day SOXX move), the strategy splits into two co-equal 50% sleeves, one driven by NVDA's individual RSI and one by AMD's, each using very tight thresholds. In each sleeve, RSI(8d) > 90 is an extreme overbought signal (only fires when the stock has gained unusually sharply over eight days) and holds SOXS, while RSI(3d) < 15 is extreme oversold (a severe short-term crash) and holds SOXL. Because the two sleeves are independent, they can disagree, blending to a mixed net position. When neither extreme fires in a sleeve, it uses a SOXX EMA trend cross: if SOXX's 10-day EMA is above its 200-day EMA (sector trending up), it runs a momentum filter that picks the single top 90-day-return name from [SOXX, NVDA, AMD, XLE, ENPH]; if the 10-day EMA is below the 200-day EMA (downtrend), it rotates defensively to the top two 90-day-return names from [SPY, DBC, XLE]."
    ],
    "signals": [
      {
        "name": "SOXX 5-Day Momentum Extremes",
        "tag": "momentum",
        "description": "Primary mean-reversion gate: CumRet(SOXX,5d) > 5 (strong week) or CumRet(SOXX,5d) < -5 (weak week). Within each extreme, the 1-day return determines direction: down-day during a strong week = dip-buy (SOXL); up-day during a strong week = fade the rally (SOXS). Mirrors in the bearish case."
      },
      {
        "name": "NVDA RSI(8d) and RSI(3d) Extremes",
        "tag": "rsi",
        "description": "In normal regime: RSI(NVDA,8d) > 90 -> SOXS (extreme 8-day overbought in NVDA). RSI(NVDA,3d) < 15 -> SOXL (3-day extreme oversold). Thresholds are far tighter than the 79-80 / 30-31 used by most strategies, 90 and 15 fire only in true extremes."
      },
      {
        "name": "AMD RSI(8d) and RSI(3d) Extremes",
        "tag": "rsi",
        "description": "Parallel to NVDA: RSI(AMD,8d) > 90 -> SOXS. RSI(AMD,3d) < 15 -> SOXL. Using AMD as a separate co-equal component to NVDA means each chip leader independently signals overbought/oversold, firing either condition is enough to trigger the positioning."
      },
      {
        "name": "SOXX EMA(10d) vs EMA(200d) Cross",
        "tag": "momentum",
        "description": "When no RSI extreme fires: EMA(SOXX,10d) > EMA(SOXX,200d) (sector trending up) -> momentum filter picking the top 90-day-return name from [SOXX, NVDA, AMD, XLE, ENPH]. 10d EMA below 200d EMA (downtrend) -> defensive rotation to the top two 90-day-return names from [SPY, DBC, XLE]. A conventional trend gate: uptrend routes to chips, downtrend to broad/commodities."
      }
    ],
    "risk_profile": {
      "verdict": "Extremely Aggressive",
      "leverage": "SOXL and SOXS, 3x long and 3x short semiconductors, with constant switching between them. Its max drawdown is the second deepest in this library, behind SOXL Growth (Original).",
      "backtest_limits": "Bounded by ENPH, the record begins in 2012 and misses the 2008 financial crisis. Recent trailing returns have been negative, so the strategy has struggled in the most recent semiconductor cycles rather than only in distant history.",
      "signal": "The name marks this as a third revision, and V3's structure suggests the stock-specific RSI thresholds were updated and an EMA regime filter added after earlier versions underperformed. Its Calmar is among the lowest in this library and below 1.0, meaning the drawdown has not been repaid by the return.",
      "hedge": "SOXS is the only defensive instrument and it is 3x inverse semiconductors. There is no broad-market filter such as a SPY 200-day average, which most other strategies here use to avoid being long through a secular bear market.",
      "concentration": "Nine instruments, almost all semiconductors or energy. Switching between SOXL and SOXS changes direction, not exposure."
    },
    "tldr": {
      "thesis": "The name describes where the stock list came from, not what the strategy does. No congressional disclosure feeds into the logic and nothing in it reacts to a filing. What it actually runs is a short-horizon mean-reversion rule on SOXX, the semiconductor index, wrapped around a momentum picker over a five-name basket. The largest position in a strategy called Chips is ENPH, a solar company, at 23.2% of all capital deployed.",
      "works_well_in": [
        "Sustained single-name leadership, which is where nearly all of the return came from. The momentum filter picks the best of SOXX, NVDA, AMD, XLE and ENPH on 90-day average return, and it landed on the right one repeatedly: ENPH compounded +536.5% across 871 days held and NVDA +429.2% across 801.",
        "Semiconductor uptrends with clean momentum. Through the 2023 AI bull the reconstruction held NVDA on 60% of days while NVDA rose 246.1%.",
        "Sharp one-day reversals inside a strong or weak week. The two mean-reversion rungs at the top of the tree buy SOXL after a heavy week that ends with a down day and short after a weak week that ends with an up day. They decided 376 and 265 days across the record, and SOXL compounded +3,639.5% across the 546 days the rules named it.",
        "Commodity and energy regimes, because the defensive filter reaches SPY, DBC and XLE. Through the 2022 decline the reconstruction held XLE on 33% of days while XLE rose 44.5% and SPY fell 24.5%."
      ],
      "struggles_in": [
        "Anything involving the short leg. SOXS was held on 398 days and compounded -83.1% across them, the worst-performing leg of any strategy reviewed in this rollout so far.",
        "Strong rallies, which the top rungs read as a reason to short. A SOXX five-day return above 5% sends the logic to SOXS unless the most recent day fell more than 2%, and that inner escape fired on only 14 days across the whole record. Through the 2023 AI bull the reconstruction was in SOXS on 18% of days while SOXS fell 85.1%.",
        "Long grinding uptrends without a clear leader. Across 2012 to 2014 the reconstruction ended roughly flat while SPY rose 71.4%, because the momentum filter kept rotating between names that were not the ones running.",
        "Single-name collapses. The filter concentrates into one stock and holds it while it falls. ENPH, the largest position in the strategy, fell 70.2% across the 2015 to 2016 decline and 47.8% through the 2023 AI bull."
      ]
    },
    "assumptions": {
      "market": [
        "**Recent momentum in a single stock predicts the next stretch.** The 90-day average return filter is what actually decides most days, and it is a bet that the best performer of the last quarter is the best holding for the next one.",
        "**A strong week is a reason to short and a weak week a reason to buy.** The two rungs at the top of the tree are pure mean reversion on a 5-day SOXX return, applied through 3x leveraged funds. They are the rules the strategy is described by, and they decided 641 of {backtest_days} days between them.",
        "**An extreme short-horizon RSI marks a turn.** Two nearly identical sub-branches watch for an 8-day RSI above 90 or a 3-day RSI below 15 on NVDA and AMD. The oversold tests decided 319 days between them; the overbought tests, which need a reading above 90, decided 18.",
        "**This basket of five names will keep leading.** The universe was fixed in advance and includes two chip designers, a chip index fund, an energy fund and a solar company. Nothing in the logic revises it."
      ],
      "structural": [
        "**The name is not a signal.** There is no disclosure data anywhere in the logic, no filing date, no trade feed. The connection to the name is the choice of tickers, and the strategy would run identically if the list had come from anywhere else.",
        "**The largest holding is not a chip company.** ENPH, a solar microinverter manufacturer, is 23.2% of all capital deployed, ahead of NVDA at 21.8% and AMD at 16.2%. It is also the most volatile name in the basket, which is why the momentum filter reaches it so often.",
        "**Two of the tree's branches are the same branch twice.** An equal-weight group holds an NVDA half and an AMD half that are identical except for which stock the RSI tests read, and both then run the same trend test and the same two filters. Across the record the two halves named identical holdings on 88.9% of evaluable days, so the split adds far less than it appears to.",
        "**The short leg lost most of its value over the days it was used.** SOXS compounded -83.1% across 398 days. DBC also lost money, at -15.0% across 264 days. Those are the only two losing legs in the strategy, and one of them is its designated defensive position.",
        "**The inner reversal tests almost never fire.** A one-day SOXX move beyond plus or minus 2% decided 18 and 14 days respectively across {backtest_days} trading days. The escape hatches inside the mean-reversion rungs exist mostly on paper.",
        "**{max_drawdown_abs} is the second deepest drawdown in this library**, against a {sharpe_ratio} Sharpe and a {calmar_ratio} Calmar that are among the lowest here. {standard_deviation} annualized volatility on a concentrated single-stock book is the reason, and the worst single day in the record was {worst_day}.",
        "**It is concentrated by construction.** It holds exactly one position on 82.2% of days, and that position is frequently a single stock rather than a fund.",
        "**The record covers {backtest_days} trading days from 7 August 2012, and the reason is a lookback rather than a listing.** ENPH first traded on 30 March 2012 and is the youngest name in the universe, and the momentum filter that reaches it needs 90 days of its history. The record begins the day that becomes computable. The 2008 crisis is absent, and so is any period in which this particular five-name basket was not the interesting one."
      ]
    },
    "regimes": [
      {
        "regime": "Clear single-name leadership",
        "expected": "Strong",
        "why": "The 90-day momentum filter concentrates into one stock and holds it, which is the best case for a picker over a small fixed basket.",
        "example": "2023 AI bull: NVDA +246.1%, and the reconstruction held NVDA on 60% of days."
      },
      {
        "regime": "Sharp reversal inside a volatile week",
        "expected": "Strong",
        "why": "The two mean-reversion rungs are built for exactly this and reach 3x leveraged funds when they fire.",
        "example": "COVID crash: SOXL -78.6% and SOXS +79.5% over the span, with the reconstruction holding SOXL on 43% of days and SOXS on 13%."
      },
      {
        "regime": "Energy or commodity leadership",
        "expected": "Strong",
        "why": "The defensive filter picks the best two of SPY, DBC and XLE, so a period when energy leads and equities fall is one the basket can actually express.",
        "example": "2022 bear market: SPY -24.5%, XLE +44.5%, DBC +21.4%. The reconstruction held XLE on 33% of days and DBC on 17%."
      },
      {
        "regime": "Strong semiconductor rally",
        "expected": "Poor",
        "why": "A SOXX five-day return above 5% sends the logic short unless the most recent day fell more than 2%, and that escape fired on 14 days in the entire record.",
        "example": "2023 AI bull: SOXS -85.1%, and the reconstruction held SOXS on 18% of days even while holding NVDA on 60%."
      },
      {
        "regime": "Broad grind higher with no leader",
        "expected": "Poor",
        "why": "The momentum filter rotates between names on a 90-day reading, and in a market where the index rises steadily but no single name in the basket dominates, it rotates into whatever just finished running.",
        "example": "2012 to 2014: SPY +71.4%, while the reconstruction spread its days across ENPH 34%, SOXL 12%, NVDA 12% and XLE 12%."
      },
      {
        "regime": "Single-name collapse",
        "expected": "Poor",
        "why": "The strategy holds one stock on most days with no stop and no position limit, so a name that turns after a strong quarter is held into the decline.",
        "example": "2015 to early 2016: ENPH -70.2% while SPY fell 12.2%. In the 2023 AI bull ENPH fell 47.8% while the index it belongs to rose."
      }
    ],
    "regime_note": "**The example column is what the holdings did, not what the strategy returned.** Each ticker figure is the move in that stock or fund between the first and last trading day of the window, computed from daily closes, and each holdings share comes from evaluating this strategy's own symphony tree over those same closes. That evaluation is a reading of the rules rather than a backtest: it answers only which positions the rules would name on a given day, and it carries no fees, no slippage and no rebalance timing. Where a window is described as ending roughly flat, that is the reconstruction's own path and is quoted to rank the regime rather than as a return you could have earned. The reconstruction covers {backtest_days} trading days from 7 August 2012 to 27 August 2026, matching the backtest window on record."
  },
  {
    "slug": "top-cap-ma-rsi",
    "name": "Top Cap by MA + RSI ETF Hedge",
    "symphony_url": "https://app.composer.trade/symphony/wadbe3IfwvSES5vk6yiu/details",
    "symphony_id": "wadbe3IfwvSES5vk6yiu",
    "annualized_rate_of_return": 1.2726607736455016,
    "max_drawdown": -0.577621890070606,
    "cumulative_return": 9991.999629,
    "calmar_ratio": 2.203276564691717,
    "sharpe_ratio": 1.5998960665116857,
    "standard_deviation": 0.6384434076978311,
    "min": -0.23446508549517886,
    "mean": 0.00405334562169078,
    "median": 0.0009413687071806454,
    "max": 0.35106210063492216,
    "trailing_one_month_return": 0.20186248596480638,
    "trailing_three_month_return": 0.017992734154164802,
    "trailing_one_year_return": 0.3755940039301906,
    "backtest_days": 2826,
    "description": "A three-branch strategy using SPY's extreme short-term RSI to toggle between UVXY volatility hedge (extreme overbought), leveraged ETF attack (extreme oversold), and momentum selection from a curated mega-cap stock basket spanning value, growth, and crypto-proxy names.",
    "tags": [
      "rsi",
      "momentum"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "This is a clean three-branch strategy gated by SPY's extreme short-term RSI. When SPY is extremely overbought it rotates into a UVXY volatility hedge; when extremely oversold it attacks with leveraged ETFs; and in the normal middle state it runs momentum selection from a curated mega-cap basket spanning value, growth, and crypto-proxy names. The structure is intuitive (hedge the froth, buy the panic, and otherwise own the strongest large caps) which keeps it far more legible than the deeply nested semiconductor strategies.",
      "Over an 11-year backtest it returns {annualized_rate_of_return:0} annualized with a {sharpe_ratio} Sharpe, {calmar_ratio} Calmar, and a {max_drawdown_abs:0} max drawdown. The notable risk is that drawdown: despite using only RSI and momentum, the leveraged-attack branch and high-beta mega-cap basket still produce deep losses in severe selloffs. Its appeal is simplicity and breadth, a transparent rule set over a diversified large-cap universe, for an investor who wants clear logic and accepts aggressive drawdowns."
    ],
    "how_it_works": [
      "Top Cap by MA + RSI ETF Hedge uses SPY's 6-day RSI as a binary traffic light that routes 100% of the portfolio into one of three distinct modes. The RSI window is unusually short, most strategies in this library use 10-day RSI. A 6-day RSI is more sensitive and therefore more selective: it reaches extreme readings (above 90 or below 28) only during very sharp short-term moves, not routine trending action. The 90 and 28 thresholds are also more extreme than the 79-80 / 30-31 used by most comparable strategies, meaning the hedge and leveraged-attack modes fire infrequently. The vast majority of trading days fall into the normal regime and route to the mega-cap stock basket.",
      "When SPY RSI(6d) >= 90, the portfolio rotates entirely to UVXY. This is an extreme overbought hedge: a 6-day RSI of 90 in SPY indicates SPY has moved almost continuously upward for 6 days, a condition historically followed by short-term pullbacks. UVXY (a leveraged long VIX-futures ETF) benefits from both the volatility spike and the reversal momentum. When SPY RSI(6d) <= 28, the strategy swings to its most aggressive allocation: from the leveraged attack basket [TQQQ, LABU, SPXL] it buys the single worst 5-day performer, a mean-reversion bounce play. A 6-day RSI of 28 in SPY means the market has fallen almost uninterrupted for 6 days, which often precedes a sharp relief bounce, precisely when holding 3x leveraged long positions offers the highest risk/reward.",
      "The default regime holds a momentum filter from the mega-cap stock universe: WMT (Walmart), MSTR (MicroStrategy, a Bitcoin treasury company), AMZN (Amazon), KO (Coca-Cola), BRK/B (Berkshire Hathaway Class B), AAPL (Apple), and TSLA (Tesla). This basket spans defensive value names (WMT, KO, BRK/B), mega-cap growth (AMZN, AAPL, TSLA), and a crypto proxy (MSTR). The filter selects the top performer by recent momentum, concentrating the position in whichever of these names is currently leading. This creates an unusual hybrid strategy: highly speculative leveraged ETFs at extremes, conservative mega-caps as the baseline."
    ],
    "signals": [
      {
        "name": "SPY RSI(6d) >= 90: UVXY Overbought Hedge",
        "tag": "rsi",
        "description": "When SPY's 6-day RSI reaches 90+, 100% of portfolio goes to UVXY (leveraged long VIX futures). The 6-day window and 90 threshold create an extremely selective trigger, firing only during sustained near-vertical SPY rallies, not routine momentum. Much more extreme than the 79-80 thresholds used by most strategies in this library."
      },
      {
        "name": "SPY RSI(6d) <= 28: Leveraged Attack",
        "tag": "rsi",
        "description": "When SPY's 6-day RSI hits 28 or below (extreme oversold), buys the single worst 5-day performer from [TQQQ, LABU, SPXL], a mean-reversion bounce bet rather than a momentum pick. LABU (3x biotech) is an unusual choice rarely seen in other strategies here, adding biotech exposure as a potential recovery leader alongside QQQ (TQQQ) and S&P500 (SPXL) leveraged ETFs."
      },
      {
        "name": "Mega-Cap Stock Momentum Filter",
        "tag": "momentum",
        "description": "Default regime: momentum filter over [WMT, MSTR, AMZN, KO, BRK/B, AAPL, TSLA]. Selects the top recent performer. Unique in combining defensive value (WMT, KO, BRK/B), mega-cap tech growth (AMZN, AAPL, TSLA), and a Bitcoin proxy (MSTR). No sector concentration, each name represents a different macro theme."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "SPXL and TQQQ form the leveraged attack basket, and LABU adds 3x biotech, sector volatility beyond the usual TQQQ and SPXL combination. Its max drawdown is materially lower than the pure leveraged semiconductor strategies in this library, which is what the unleveraged mega-cap basket buys.",
      "backtest_limits": "Bounded by LABU, the record begins in 2015 and is shorter than most peers here. MSTR sits in the mega-cap basket and only began its Bitcoin treasury strategy in 2020, so for most of the backtest MSTR was a materially different company, and the Bitcoin correlation the position carries today was largely absent from the data that validated it.",
      "signal": "The UVXY allocation fires during extreme overbought conditions. If the hedge fires early and no pullback follows, the position pays VIX futures roll decay for the whole duration.",
      "hedge": "UVXY is the only hedge leg, and it is a decaying instrument that only works over short holds.",
      "concentration": "The mega-cap basket is a handful of individual names including AAPL, AMZN, TSLA, MSTR, KO, WMT and BRK/B. That is a mix of defensives and high-beta single names rather than an index, so stock-specific risk is real."
    },
    "tldr": {
      "thesis": "Two tests, three outcomes, and that is the entire tree. On 92.5% of days none of the tests fires and the strategy holds whichever of seven large-cap stocks had the best five-day average return. The other two branches are extreme hedges, one into UVXY when SPY's 6-day RSI reaches 90 and one into the worst of three 3x funds when it drops to 28. Despite the name, the ETF hedge decided 213 of {backtest_days} days. What the strategy really is, is a five-day momentum rotation across seven stocks, and MSTR and TSLA between them took 48.3% of all capital deployed.",
      "works_well_in": [
        "Sharp, sustained single-name runs. The rotation concentrates fully into one stock and holds it while it leads. TSLA compounded +1,285.5% across 716 days held and MSTR +1,060.4% across 648.",
        "Markets where a crypto proxy is running. MSTR is in the basket and was its largest contributor in the strongest years: it rose 335.5% through the 2023 AI bull and 322.7% through 2024, with the reconstruction holding it on 35% and 40% of days respectively.",
        "Panic lows, in the narrow case the oversold branch catches one. A 6-day RSI on SPY at or below 28 fired on 191 days and buys the most beaten-down of TQQQ, LABU and SPXL. TQQQ compounded +229.1% and LABU +210.8% across the days the rules named them.",
        "Blow-off tops, again narrowly. The overbought branch fired on 22 days across {backtest_years} years and went to UVXY, which compounded +174.7% across them."
      ],
      "struggles_in": [
        "Broad declines with no obvious leader. The default branch is always fully invested in one stock, with no cash, no bonds and no way to be flat. Through the 2015 to 2016 decline the reconstruction rotated between AMZN, TSLA, WMT and AAPL while every one of them fell.",
        "Defensive rotations. WMT and KO are the two names meant to be steady, and they are the only two losing legs in the strategy: WMT compounded -19.1% across 261 days held and KO -14.2% across 183.",
        "Choppy markets. The ranking uses a five-day average return, so the holding changes on 1,180 of {backtest_days} days, about once every 2.4 trading days, across individual stocks.",
        "Sharp selloffs that never trigger the hedge. The overbought test needs a 6-day RSI of 90 and fired on 22 days in the whole record. In the Q4 2018 selloff the reconstruction held TSLA on 31% of days and LABU on 28% while LABU fell 71.8%."
      ]
    },
    "assumptions": {
      "market": [
        "**Five-day momentum in a single stock predicts the next five days.** This one reading decides 92.5% of days. Nothing else in the logic runs unless SPY reaches an extreme.",
        "**These seven names are the right seven.** The basket is fixed and was chosen after the fact. It contains AAPL, AMZN, TSLA, MSTR, BRK/B, WMT and KO, which is not a list anyone would have written in 2015 without knowing what came next.",
        "**An extreme short-horizon RSI marks a turning point.** Both hedge branches key off a 6-day RSI on SPY, at 90 and at 28. Those are rare readings by construction, and the strategy spends almost all of its life ignoring them.",
        "**Buying the most beaten-down leveraged fund at a panic low pays.** The oversold branch takes the bottom performer of TQQQ, LABU and SPXL, so it deliberately picks the one that has fallen furthest."
      ],
      "structural": [
        "**The hedge in the name decided 213 of {backtest_days} days.** The overbought branch fired on 22 and the oversold branch on 191, which is 7.5% of the record between them. This is a stock-picking strategy with two rarely-used escape hatches, not a hedged one.",
        "**MSTR is in a basket called Top Cap.** It is a software company that became a bitcoin holding vehicle, and it is the second largest position in the strategy at 23.0% of all capital. Including it is the single largest hindsight decision in the design, and it is also what produced the best years in the record.",
        "**The strategy is never diversified and never in cash.** It holds exactly one position on 100% of days across the entire record, and on 92.5% of them that position is a single stock.",
        "**Both defensive names lost money over the days they were held.** WMT compounded -19.1% and KO -14.2%. A five-day momentum ranking reaches a low-volatility staple mainly when everything else is falling, which is when the staple is falling too, just more slowly.",
        "**The symphony's own title advertises a different backtest than the one recorded here.** It reads TESTPORT #019 with +177% from 1 February 2018. The record on this page covers {backtest_days} trading days beginning 3 June 2015 and reports {cumulative_return}. The title is a working label from the author's own testing rather than a description of this window.",
        "**{max_drawdown_abs} maximum drawdown and {standard_deviation} annualized volatility are the price of the record above.** A {sharpe_ratio} Sharpe and a {calmar_ratio} Calmar both rank 14th of the 24 strategies in this library, and the worst single day in the record was {worst_day}.",
        "**Turnover is high for a strategy holding individual stocks.** One allocation change every 2.4 trading days across a seven-name basket, and none of the figures on this page carries a commission, a spread or a slippage assumption.",
        "**The record covers {backtest_days} trading days from June 2015** and contains one full bear market. The 2008 crisis is absent."
      ]
    },
    "regimes": [
      {
        "regime": "Strong single-name leadership",
        "expected": "Strong",
        "why": "The five-day ranking concentrates fully into whichever name is running and stays there while it keeps running. This is the whole strategy working as intended.",
        "example": "2024 bull: MSTR +322.7%, TSLA +62.6%, and the reconstruction held MSTR on 40% of days and TSLA on 19%."
      },
      {
        "regime": "Crypto proxy rally",
        "expected": "Strong",
        "why": "MSTR is the most volatile name in the basket by a wide margin, so a five-day momentum ranking reaches it disproportionately when it moves.",
        "example": "2023 AI bull: MSTR +335.5%, and the reconstruction held it on 35% of days."
      },
      {
        "regime": "Panic low",
        "expected": "Strong",
        "why": "A 6-day RSI on SPY at or below 28 buys the most beaten-down of three 3x funds, which is the highest-beta way to express a bounce.",
        "example": "The oversold branch fired on 191 days, and across them TQQQ compounded +229.1% and LABU +210.8%."
      },
      {
        "regime": "Blow-off top",
        "expected": "Unknown",
        "why": "The overbought branch works when it fires but it fired on 22 days in {backtest_years} years, so there is very little evidence about it either way.",
        "example": "A 6-day RSI of 90 or more on SPY occurred on 22 of {backtest_days} days, and UVXY compounded +174.7% across them."
      },
      {
        "regime": "Broad decline with no leader",
        "expected": "Poor",
        "why": "The default branch is always fully invested in one stock. It has no cash option, and a five-day ranking in a falling market simply picks whichever name fell least last week.",
        "example": "2015 to early 2016: SPY -12.2%, TSLA -37.6%, AAPL -21.0%, BRK/B -12.8%, WMT -7.9%."
      },
      {
        "regime": "Fast selloff below the hedge trigger",
        "expected": "Poor",
        "why": "A decline that never drives SPY's 6-day RSI to 28 leaves the strategy fully invested in a single high-beta stock, and one that does trigger it buys the most beaten-down 3x fund available.",
        "example": "Q4 2018 selloff: SPY -19.2%, LABU -71.8%, AAPL -35.2%. The reconstruction held TSLA on 31% of days and LABU on 28%."
      }
    ],
    "regime_note": "**The example column is what the holdings did, not what the strategy returned.** Each ticker figure is the move in that stock or fund between the first and last trading day of the window, computed from daily closes, and each holdings share comes from evaluating this strategy's own symphony tree over those same closes. That evaluation is a reading of the rules rather than a backtest: it answers only which position the rules would name on a given day, and it carries no fees, no slippage and no rebalance timing. Because the holding changes about once every 2.4 trading days across individual stocks, no reconstructed return is quoted on this page, and the regimes above are ranked from holdings and price moves alone. The reconstruction covers {backtest_days} trading days from 3 June 2015 to 27 August 2026, matching the backtest window on record."
  },
  {
    "slug": "mean-reversion-py",
    "name": "Mean Reversion Comparison to Python Code",
    "symphony_url": "https://app.composer.trade/symphony/KJqNBGxYyyKuCcEfdHhq/details",
    "symphony_id": "KJqNBGxYyyKuCcEfdHhq",
    "annualized_rate_of_return": 0.793712348941015,
    "max_drawdown": -0.8165989487153426,
    "cumulative_return": 5942.871251,
    "calmar_ratio": 0.9719732681381327,
    "sharpe_ratio": 1.2264098699975678,
    "standard_deviation": 0.6457604451062753,
    "min": -0.34465142675978555,
    "mean": 0.0031427261251284074,
    "median": 0.003719855007692674,
    "max": 0.5001155851150532,
    "trailing_one_month_return": 0.11296808351105025,
    "trailing_three_month_return": -0.19223172045370662,
    "trailing_one_year_return": 0.35502651610092273,
    "backtest_days": 3747,
    "description": "A minimalist SPY trend-following strategy with a TQQQ core and a UVXY overbought hedge, originally built to cross-validate a Python backtesting implementation. Uses SPY's moving average as the primary regime gate and TQQQ RSI(10d) as the only secondary signal, choosing between TQQQ, UVXY, or SPY across four simple branches.",
    "tags": [
      "rsi",
      "200d-ma",
      "momentum",
      "mean-reversion"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "This is a deliberately minimalist SPY trend-follower with a TQQQ core and a UVXY overbought hedge, originally written to cross-validate a Python backtesting implementation. SPY's moving average is the only regime gate and TQQQ's 10-day RSI is the only secondary signal, producing just four simple branches that choose between TQQQ, UVXY, and SPY. Its value is pedagogical: it is the clearest possible illustration of a moving-average regime gate plus a single RSI hedge, with nothing else to obscure the mechanism.",
      "Over roughly 15 years it returns about {annualized_rate_of_return:0} annualized, but the bare-bones design shows in the risk: an {max_drawdown_abs:0} max drawdown, {standard_deviation:0} volatility, and a Calmar of {calmar_ratio}, meaning the annualized return has not quite repaid the maximum drawdown, just under the breakeven line for risk-adjusted appeal. With only one hedge and no bond or short branch, it has little defense in a sustained bear market, which is why the drawdown is so deep. It is best understood as a reference implementation and a baseline for what minimal logic achieves, not as an optimized strategy to deploy as-is."
    ],
    "how_it_works": [
      "Mean Reversion Comparison to Python Code was built as a validation tool, its name documents that the Composer symphony was constructed to replicate and compare against a separately coded Python backtesting implementation of the same strategy logic. This makes it structurally one of the simplest strategies in the library, as simplicity is necessary for accurate replication across two environments. The entire decision tree consists of four leaves: UVXY, TQQQ, SPY, or TQQQ (repeated in bear mode). The SPY primary gate checks whether SPY's current price is above its moving average, when true, the market is in an uptrend and the strategy is bullish; when false, the market is in a downtrend.",
      "In bull mode (SPY above its moving average), the strategy then checks RSI(TQQQ,10d) > 79. If TQQQ's 10-day RSI is above 79, the market is considered short-term overbought and the strategy rotates 100% to UVXY as a volatility hedge. This is identical to the logic used by Holy Grail, TQQQ For The Long Term, and The Four Horsemen, the 79 threshold on TQQQ 10d RSI is a standard overbought trigger used across multiple strategies. If RSI is not elevated, the strategy holds TQQQ for the leveraged bull-market upside.",
      "Bear mode (SPY below its moving average) is where this strategy diverges from its relatives. Rather than activating dip-buying on TECL or SOXL, or running a momentum filter between SQQQ and TLT, this strategy simply checks whether TQQQ RSI(10d) > 79. If overbought even in a bear market, it holds SPY outright (not UVXY, the bear-mode overbought response is a downgrade to unlevered equity, not a volatility bet). If RSI is not elevated in bear mode, the strategy holds TQQQ. Holding TQQQ in a sustained bear market explains a max drawdown among the deepest in this library, there is no bear-market exit strategy when RSI is not yet overbought."
    ],
    "signals": [
      {
        "name": "SPY Moving Average Trend Gate",
        "tag": "200d-ma",
        "description": "Primary regime filter: SPY current price vs its moving average. Above = bull mode (TQQQ with UVXY hedge). Below = bear mode (TQQQ default with SPY as the overbought defensive). The simplest form of trend-following regime detection, with no secondary trend filters or duration requirements."
      },
      {
        "name": "TQQQ RSI(10d) > 79 Overbought Signal",
        "tag": "rsi",
        "description": "Shared by bull AND bear mode: RSI(TQQQ,10d) > 79 -> UVXY (bull) or SPY (bear). The same threshold triggers different responses depending on regime. Bull-mode RSI fires into UVXY for active hedging; bear-mode RSI fires into SPY as a passive defensive downgrade rather than a volatility bet."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "The strategy holds TQQQ as the default in both bull and bear regimes whenever RSI is not elevated. That single design choice explains a max drawdown among the deepest in this library: in a sustained bear market like 2022 or 2008, TQQQ can fall more than 80 percent and this strategy would hold it throughout as long as RSI stayed below 79.",
      "backtest_limits": "Bounded by UVXY, the record begins in late 2011 and matches Holy Grail and TQQQ For The Long Term exactly, which allows direct comparison. Against Holy Grail it delivers materially lower annualised return at nearly double the max drawdown. That gap is the measure of what Holy Grail's bear-mode dip-buy and defensive rotation add over this bare-bones implementation.",
      "signal": "There is no time-based exit from bear mode and no alternative long-term bear strategy. Its Calmar is below 1.0, meaning the drawdown has not been repaid by the return, which is precisely the comparison this strategy exists to make.",
      "hedge": "UVXY is the only non-equity instrument in a three-ticker universe, and it is a short-term volatility position rather than ballast.",
      "concentration": "Three instruments. This is a reference implementation rather than a portfolio and should be read as one."
    },
    "tldr": {
      "thesis": "Three conditional nodes, two distinct tests and three tickers. Its name says what it is: a symphony built to cross-check a separately written Python backtest, not a strategy designed to be traded. In practice it holds TQQQ on 96.2% of days and steps into UVXY on the 143 days when TQQQ's 10-day RSI passed 79. The one finding that matters most is that the SPY 200-day moving average gate, the thing the strategy is organised around, never changed a single holding across {backtest_days} days.",
      "works_well_in": [
        "Long Nasdaq uptrends, because that is essentially what it holds. TQQQ compounded +45,244.4% across the 3,603 days the rules named it, and a plain buy and hold of TQQQ over the same window returned +27,038.1%.",
        "Short-term overbought spikes, which is the one thing the logic actually does. UVXY was held on 143 days and compounded +1,493.3% across them, on 3.8% of all capital deployed.",
        "Melt-ups and recoveries, where a 3x fund with no defensive branch is exactly the right instrument. Through the COVID recovery TQQQ rose 270.4% and through the 2023 AI bull 204.9%, with the reconstruction in TQQQ on 96% and 98% of days.",
        "Being compared against. It shares a {backtest_days} day window with Holy Grail and TQQQ For The Long Term exactly, which is what it was built for, and the gap between them is a clean measure of what their extra branches add."
      ],
      "struggles_in": [
        "Bear markets, entirely. The below-the-average half of the tree holds TQQQ too, so falling below the 200-day moving average changes nothing. Through the 2022 bear market the reconstruction held TQQQ on 100% of days while TQQQ fell 78.8%.",
        "Fast crashes. In the Q4 2018 selloff and the 2025 spring drawdown the reconstruction was in TQQQ on 100% of days, and its path matched TQQQ exactly at -57.5% and -56.8%, because the overbought test does not fire on the way down.",
        "Any decline that starts from a calm reading. The only exit is an RSI above 79, which is a sign of strength rather than of danger, so the strategy is always fully invested in a 3x fund when a decline begins.",
        "Comparison with the strategies it was built alongside. Over the identical window it returned {annualized_rate_of_return} against 150.2% for Holy Grail, at {max_drawdown_abs} against Holy Grail's -47.4%."
      ]
    },
    "assumptions": {
      "market": [
        "**The Nasdaq 100 rises over the long run and 3x leverage is the way to own it.** TQQQ is the default on both sides of the tree and 96.2% of all capital deployed. Every other part of the logic only decides when to briefly leave it.",
        "**A 10-day RSI above 79 marks a short-term top.** This is the only test that ever moved money, and the 79 threshold on TQQQ is shared with several other strategies in this library.",
        "**Long volatility is the right expression of an overbought reading.** The bull branch goes to UVXY, a fund that decays structurally and lost more than 99% over the 2012 to 2014 stretch, which only pays if the timing is right.",
        "**SPY's price relative to its 200-day moving average identifies the regime.** The tree is built around this test. The record does not support the assumption, because the two halves it separates behave identically except in a state that never occurred."
      ],
      "structural": [
        "**The 200-day moving average gate never changed a holding.** SPY was above its average on 3,187 of {backtest_days} days and below it on 560, and the gate crossed 77 times. But the only difference between the two halves is what happens when TQQQ's 10-day RSI passes 79, and every one of those 143 days fell on the above-the-average side. The below-the-average RSI test decided zero days.",
        "**SPY is in the universe and was never held.** It appears only as the defensive holding in the branch that never resolved, so one of the strategy's three tickers is dead code.",
        "**It was built as a validation harness, and its name says so.** Simplicity here is a feature of that purpose rather than a design decision about risk, and the page reads it that way.",
        "**{max_drawdown_abs} is the third deepest drawdown among the 24 strategies in this library**, and {worst_day} is the third worst single day. There is no defensive holding anywhere in the tree.",
        "**A {sharpe_ratio} Sharpe and a {calmar_ratio} Calmar both rank 20th of 24 here.** A Calmar below 1.0 means the drawdown was larger than the annualized return that paid for it.",
        "**The comparison it was built for is unflattering to itself.** Over the identical {backtest_days} day window it returned {annualized_rate_of_return} annualized at {max_drawdown_abs}, against 150.2% at -47.4% for Holy Grail and 160.4% at -53.6% for TQQQ For The Long Term.",
        "**Turnover is low**, at one allocation change every 34.1 trading days, and it holds exactly one asset on 100% of days. None of the figures here carries a commission, a spread or a slippage assumption.",
        "**The record covers {backtest_days} trading days from 3 October 2011, bounded by UVXY**, which first traded on 4 October 2011. The 2008 crisis and the 2000 collapse of the index this strategy is leveraged to are both absent, and so is any period in which a levered Nasdaq position was a losing decade-long bet."
      ]
    },
    "regimes": [
      {
        "regime": "Sustained Nasdaq uptrend",
        "expected": "Strong",
        "why": "The strategy is a 3x Nasdaq position with a rare exit. In a long uptrend that is the whole point and nothing gets in the way.",
        "example": "2012 to 2014: SPY +71.4%, TQQQ +442.6%, with the reconstruction in TQQQ on 95% of days."
      },
      {
        "regime": "Recovery off a crash low",
        "expected": "Strong",
        "why": "There is no re-entry condition to satisfy, because the strategy never left. It holds the rebound in full from the first day.",
        "example": "COVID recovery: TQQQ +270.4%, and the reconstruction held it on 96% of days."
      },
      {
        "regime": "Sharp overbought spike",
        "expected": "Strong",
        "why": "A 10-day RSI above 79 on TQQQ is the one test that moves money, and it reaches a fund that can move several hundred percent in weeks.",
        "example": "Across the 143 days the rules named UVXY it compounded +1,493.3%, on 3.8% of all capital deployed."
      },
      {
        "regime": "Bear market",
        "expected": "Poor",
        "why": "There is no defensive branch. Falling below the 200-day moving average moves the logic into a half of the tree that also holds TQQQ, so nothing changes.",
        "example": "2022 bear market: TQQQ -78.8%, with the reconstruction in TQQQ on 100% of days and its path matching TQQQ exactly."
      },
      {
        "regime": "Fast selloff from a calm reading",
        "expected": "Poor",
        "why": "The only exit requires an overbought RSI, which is the opposite of what a decline produces, so the strategy is fully invested in a 3x fund throughout.",
        "example": "Q4 2018 selloff: SPY -19.2%, TQQQ -57.5%, UVXY +143.9%, and the reconstruction held TQQQ on 100% of days."
      },
      {
        "regime": "Prolonged low-volatility drift",
        "expected": "Mixed",
        "why": "The RSI test fires more often in calm markets, and UVXY loses value structurally in them, so the hedge is most active exactly where it costs the most.",
        "example": "2017 low-volatility bull: TQQQ +112.9%, UVXY -93.2%, and the reconstruction was in UVXY on 12% of days, its highest share of any window."
      }
    ],
    "regime_note": "**The example column is what the holdings did, not what the strategy returned.** Each ticker figure is the move in that fund between the first and last trading day of the window, computed from daily closes, and each holdings share comes from evaluating this strategy's own symphony tree over those same closes. That evaluation is a reading of the rules rather than a backtest: it answers only which fund the rules would name on a given day, and it carries no fees, no slippage and no rebalance timing. Where a window says the reconstruction matched TQQQ exactly, that is because the overbought test did not fire once inside it, so the modelled path and the fund's own price move are the same number. The reconstruction covers {backtest_days} trading days from 3 October 2011 to 27 August 2026, matching the backtest window on record."
  },
  {
    "slug": "spy-energy-chips",
    "name": "SPY, Energy, Chips, Commodities",
    "symphony_url": "https://app.composer.trade/symphony/rtyBIBOKEY2cPSbJSQX8/details",
    "symphony_id": "rtyBIBOKEY2cPSbJSQX8",
    "annualized_rate_of_return": 0.7139909336204879,
    "max_drawdown": -0.6541687771698292,
    "cumulative_return": 1915.988561,
    "calmar_ratio": 1.0914475874398515,
    "sharpe_ratio": 1.1671977056920806,
    "standard_deviation": 0.6300661690904844,
    "min": -0.2608042999814142,
    "mean": 0.0029183007420500473,
    "median": 0.002074817386810368,
    "max": 0.3288889852107426,
    "trailing_one_month_return": -0.011403967303490359,
    "trailing_three_month_return": -0.07725480607746626,
    "trailing_one_year_return": 0.03434163458598993,
    "backtest_days": 3534,
    "description": "A two-component strategy combining a VIXM Black Swan Catcher (holding mid-term VIX when volatility has been persistently elevated) with a multi-sector momentum rotator that selects the best performer from a diversified pool spanning semiconductor leaders, broad market, energy, commodities, and clean energy.",
    "tags": [
      "rsi",
      "momentum"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "This is a two-component strategy. A 'VIXM Black Swan Catcher' holds mid-term VIX futures when volatility has been persistently elevated, providing a crisis hedge, while a multi-sector momentum rotator selects the single best performer from a diversified pool spanning semiconductor leaders, the broad market, energy, commodities, and clean energy. The combination pairs a tail-risk hedge with a breadth-seeking momentum engine, so the strategy aims to rotate into whatever sector is leading while holding insurance for volatility spikes.",
      "Over roughly 14 years it returns {annualized_rate_of_return:0} annualized with a modest {sharpe_ratio} Sharpe, a {calmar_ratio} Calmar, and a deep {max_drawdown_abs:0} max drawdown. The weak Calmar signals the core issue: the sector-momentum sleeve still suffers large drawdowns, and the VIXM hedge, which bleeds during calm markets, drags on returns more than it protects in this configuration. The diversified sector universe is genuinely broad, but the metrics suggest the hedge-plus-rotation balance is not well tuned; it is a moderate strategy whose risk outweighs its return relative to the leveraged peers here."
    ],
    "how_it_works": [
      "SPY, Energy, Chips, Commodities (originally named with a black swan emoji '🦢' to signal its tail-risk awareness) runs two parallel components. The first is a 'Black Swan Catcher' that watches RSI(VIXM,40d) > 69. VIXM (ProShares VIX Mid-Term Futures ETF) tracks 4-7 month VIX futures rather than the 1-month futures tracked by VXX or the 2x daily version tracked by UVXY. Mid-term VIX moves more slowly and decays less aggressively from contango, making it a more sustainable fear hedge. A 40-day RSI of 69 in VIXM means volatility has been persistently elevated for over a month, this is not a daily spike signal but a sustained-fear detector.",
      "When the Black Swan Catcher is not triggered (RSI(VIXM,40d) <= 69), the entire portfolio falls to the second component: a momentum rotator across [SOXX, NVDA, AMD, SPY, DBC, XLE, ENPH]. This universe deliberately diversifies across uncorrelated sectors: SOXX (semiconductor ETF), NVDA and AMD (individual chip leaders), SPY (broad US equities), DBC (diversified commodity index), XLE (energy sector), and ENPH (Enphase Energy, solar/clean energy). The rotator selects the top performer by recent momentum, whichever asset has shown the strongest trend, and concentrates the full portfolio there. The strategy never holds multiple assets simultaneously in the rotation mode.",
      "The logic encodes a macro view: semiconductors and AI-adjacent companies (SOXX, NVDA, AMD), commodities and energy (DBC, XLE), and clean energy (ENPH) represent the three major secular growth themes of the 2010s-2020s. SPY serves as the benchmark safety net when no sector theme is outperforming. The Black Swan Catcher layer provides protection that the rotation cannot offer, when markets are in a sustained panic (not a single-day spike), VIXM will have persistently elevated RSI and the strategy parks there rather than chasing a collapsing sector. This differs from strategies that use instantaneous RSI(10d) spikes: the 40-day RSI of VIXM measures weeks of sustained fear, not a single day."
    ],
    "signals": [
      {
        "name": "VIXM RSI(40d) > 69 Black Swan Gate",
        "tag": "rsi",
        "description": "RSI(VIXM,40d) > 69 -> HOLD VIXM. Uses the ProShares VIX Mid-Term Futures ETF (not UVXY/VXX) and a 40-day window, producing a slow-burning signal that only triggers after weeks of sustained volatility elevation. Designed to capture multi-week panic periods rather than single-day spikes."
      },
      {
        "name": "Multi-Sector Momentum Rotator",
        "tag": "momentum",
        "description": "Default mode: Filter top-1 of [SOXX, NVDA, AMD, SPY, DBC, XLE, ENPH] by recent return. Spans semiconductors (SOXX, NVDA, AMD), broad market (SPY), commodities (DBC), energy (XLE), and clean energy (ENPH). No leveraged ETFs in the rotation pool, concentrates in the strongest non-leveraged asset."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "The rotation component is unleveraged. Its max drawdown comes not from 3x funds but from holding concentrated positions in volatile sectors through sector-specific crashes, and its Sharpe and Calmar are among the lowest in this library. That is what a large drawdown without leverage's upside looks like.",
      "backtest_limits": "Bounded by ENPH, the record begins around 2012, so the earlier history of ENPH and AMD is underrepresented and the 2008 financial crisis is absent.",
      "signal": "There is no SPY trend gate. The strategy can stay fully in semiconductor stocks through a bear market unless VIXM RSI triggers, and that requires sustained volatility elevation over 40 days rather than an immediate response to the market turning negative.",
      "hedge": "VIXM is the hedge leg. It carries moderate roll decay compared with UVXY and adds meaningful long-duration protection, which is the tradeoff it exists to make.",
      "concentration": "The rotation holds individual names including NVDA, AMD and ENPH. That is single-name risk inside volatile sectors, with no leverage to compensate for carrying it."
    },
    "tldr": {
      "thesis": "One test and one filter. If VIXM's 40-day RSI is above 69 the strategy holds VIXM, and otherwise it holds whichever of seven names had the best 90-day average return. The volatility test, the part the author named Black Swan Catcher, fired on 12 of {backtest_days} days in two episodes: the COVID crash of March 2020 and a single day in August 2024. Everything else in the record is the rotator, and the rotator is really a bet on three names. ENPH, NVDA and AMD took 86.5% of all capital deployed between them.",
      "works_well_in": [
        "Clear single-name leadership. The filter concentrates fully into one holding and stays with it while it leads. ENPH compounded +4,054.3% across the 1,202 days the rules named it and NVDA +1,030.7% across 1,055.",
        "Semiconductor uptrends. Through the 2023 AI bull the reconstruction held NVDA on 83% of days while NVDA rose 246.1%, and through 2024 it held NVDA on 82% while NVDA rose 178.9%.",
        "Energy and commodity leadership, which is what the non-technology half of the basket exists for. Through the 2022 bear market the reconstruction held ENPH on 49% of days and XLE on 47% while XLE rose 44.5% and SPY fell 24.5%.",
        "A genuine volatility shock, in the one case the catcher caught one. Across the COVID crash the reconstruction held VIXM on 48% of days while VIXM rose 97.7%."
      ],
      "struggles_in": [
        "Broad markets rising without a leader in this basket. Through the 2021 melt-up the reconstruction gained 19.8% against SPY's 30.5%, holding four different names across the window.",
        "Sharp declines that do not raise VIXM's 40-day RSI above 69, which is nearly all of them. In the Q4 2018 selloff the reconstruction held AMD on 98% of days while AMD fell 47.0%.",
        "Single-name collapses. The filter holds one stock with no stop and no position limit. Through the 2026 spring wobble it held ENPH on 100% of days while ENPH fell 27.4% and SPY rose 1.6%.",
        "Commodity exposure, which is the only losing leg in the strategy. DBC compounded -6.4% across the 59 days it was held."
      ]
    },
    "assumptions": {
      "market": [
        "**A 90-day average return predicts the next stretch.** This single reading decides 99.7% of days. There is no trend filter, no volatility check and no drawdown limit anywhere in the rotator.",
        "**A persistently elevated VIXM reading marks a crisis worth hiding from.** The threshold is a 40-day RSI above 69, which is a slow reading by design, so it is looking for sustained stress rather than a single bad day.",
        "**Mid-term VIX futures are a workable place to sit during that crisis.** VIXM decays structurally, so this only pays if the escape is brief and well timed.",
        "**These seven names cover the ground that matters.** The basket holds two chip designers, a chip index fund, the broad market, energy, commodities and a solar company. Nothing in the logic revises it, and it was chosen after the fact."
      ],
      "structural": [
        "**The Black Swan Catcher fired on 12 days in 14 years, in exactly two episodes.** Eleven of them are consecutive, 6 to 20 March 2020, and the twelfth is 5 August 2024. It did not fire in the 2022 bear market, the Q4 2018 selloff, the February 2018 volatility spike or the 2025 spring drawdown.",
        "**The rotator is three names wearing a diversified label.** ENPH is 34.0% of all capital deployed, NVDA 29.9% and AMD 22.6%. SPY, DBC and SOXX together account for 6.0%, so the broad market, the commodity fund and the chip index fund are close to decorative.",
        "**The largest holding in the strategy is a solar company.** ENPH is a microinverter manufacturer and the most volatile name in the basket, which is why a 90-day momentum ranking reaches it more often than anything else.",
        "**It is fully concentrated at all times.** It holds exactly one asset on 100% of days, with no cash branch, no bond branch and no partial position.",
        "**{max_drawdown_abs} is the seventh deepest drawdown among the 24 strategies in this library**, on {standard_deviation} annualized volatility, and the worst single day in the record was {worst_day}. A {sharpe_ratio} Sharpe ranks 21st of 24 here, and a {calmar_ratio} Calmar ranks 19th.",
        "**The simpler design beat the complicated one built on the same names.** Inside Nancy Pelosi's Chips rotates over these same seven unleveraged tickers across an identical {backtest_days} day window, and adds leveraged mean-reversion rungs on top. It returned 75.5% a year to this strategy's {annualized_rate_of_return}, but did so on a drawdown of -86.3% against {max_drawdown_abs}, so its Sharpe and Calmar are both lower.",
        "**Turnover is moderate**, at one allocation change every 13.3 trading days across individual stocks, and none of the figures on this page carries a commission, a spread or a slippage assumption.",
        "**The record covers {backtest_days} trading days from 8 August 2012**, bounded by the 90-day lookback on ENPH, the youngest name in the basket, which first traded in March 2012. The 2008 crisis is absent, and so is any period in which this particular seven-name basket was not the interesting one."
      ]
    },
    "regimes": [
      {
        "regime": "Clear single-name leadership",
        "expected": "Strong",
        "why": "A 90-day momentum ranking over a small fixed basket concentrates fully into whatever is running, which is the best case for this design.",
        "example": "2019 recovery: ENPH +431.1%, and the reconstruction held ENPH on 86% of days, ending the window up 330.1% against SPY's 31.1%."
      },
      {
        "regime": "Semiconductor uptrend",
        "expected": "Strong",
        "why": "Three of the seven names are chip exposure, so a semiconductor cycle is the one the basket can express most fully.",
        "example": "2023 AI bull: NVDA +246.1%, AMD +130.3%, and the reconstruction held NVDA on 83% of days, ending up 238.2%."
      },
      {
        "regime": "Energy or commodity leadership",
        "expected": "Strong",
        "why": "XLE and DBC are in the basket, so a market where energy leads and equities fall is one the rotation can rotate into.",
        "example": "2022 bear market: SPY -24.5%, XLE +44.5%, ENPH +34.5%. The reconstruction held ENPH on 49% of days and XLE on 47%, ending up 36.0%."
      },
      {
        "regime": "Sustained volatility shock",
        "expected": "Mixed",
        "why": "The catcher works when it fires, but it has fired in two episodes across the whole record, so there is very little evidence about it either way.",
        "example": "COVID crash: VIXM +97.7% and SPY -33.7%. The reconstruction held VIXM on 48% of days and ended the window up 32.5%."
      },
      {
        "regime": "Broad rally with no leader in the basket",
        "expected": "Poor",
        "why": "The filter always holds exactly one name, so a market where the index rises steadily but none of these seven dominates leaves it rotating into whatever just finished running.",
        "example": "2021 melt-up: SPY +30.5%, while the reconstruction gained 19.8% holding NVDA 40%, XLE 24%, ENPH 18% and AMD 16%."
      },
      {
        "regime": "Fast selloff below the volatility trigger",
        "expected": "Poor",
        "why": "A decline that does not push VIXM's 40-day RSI above 69 leaves the strategy fully invested in one high-beta stock, and the RSI is slow enough that most declines do not.",
        "example": "Q4 2018 selloff: AMD -47.0%, NVDA -56.0%, and the reconstruction held AMD on 98% of days, ending down 47.3% against SPY's 19.2%."
      }
    ],
    "regime_note": "**The example column is what the holdings did, not what the strategy returned.** Each ticker figure is the move in that stock or fund between the first and last trading day of the window, computed from daily closes, and each holdings share comes from evaluating this strategy's own symphony tree over those same closes. Where a window quotes what the reconstruction gained or lost, that is the modelled path of those same holdings: it is a reading of the rules rather than a backtest, it carries no fees, no slippage and no rebalance timing, and it is quoted to rank the regime rather than as a return you could have earned. The allocation changes about once every 13.3 trading days, which is what makes that path meaningful enough to quote here. The reconstruction covers {backtest_days} trading days from 8 August 2012 to 27 August 2026, matching the backtest window on record."
  },
  {
    "slug": "simons-kmlm-switcher",
    "name": "Simon's KMLM Switcher (Original)",
    "symphony_url": "https://app.composer.trade/symphony/u5iBJE751BM5FKPRJvKf/details",
    "symphony_id": "u5iBJE751BM5FKPRJvKf",
    "annualized_rate_of_return": 6.121379571857027,
    "max_drawdown": -0.3204838508911957,
    "cumulative_return": 5224.48878,
    "calmar_ratio": 19.100430660811163,
    "sharpe_ratio": 2.9041637463246106,
    "standard_deviation": 0.78139226282428,
    "min": -0.21878731344009772,
    "mean": 0.00900512333870169,
    "median": 0.004863045641371078,
    "max": 0.38700988732052943,
    "trailing_one_month_return": -0.014258805758368576,
    "trailing_three_month_return": 0.21894750599656798,
    "trailing_one_year_return": 1.1620413740338278,
    "backtest_days": 1098,
    "description": "An aggressive three-layer RSI strategy by Simon: an 11-ticker overbought gate routes to UVXY whenever any market sector overheats; a sequential dip-buy cascade catches 3x ETF crashes at extreme oversold levels; and a KMLM momentum switch toggles between the two most oversold leveraged ETFs when tech leads or defensive SQQQ/TLT positions when managed futures momentum dominates.",
    "tags": [
      "rsi",
      "momentum",
      "leveraged-etfs",
      "managed-futures",
      "inverse-etfs",
      "vix-tiers",
      "original"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "Simon's KMLM Switcher is an aggressive three-layer RSI strategy. An 11-ticker overbought gate routes into UVXY whenever any tracked sector overheats; a sequential dip-buy cascade catches 3x ETF crashes at extreme oversold levels; and a KMLM momentum switch toggles between the two most oversold leveraged ETFs when tech leads, or defensive SQQQ/TLT when managed-futures momentum dominates. The layered design tries to do three jobs at once: hedge froth, buy capitulation, and pick the right regime between leveraged tech and managed-futures defense.",
      "Its backtested numbers are extraordinary ({annualized_rate_of_return:0} annualized, a {sharpe_ratio} Sharpe, and a {calmar_ratio} Calmar against a {max_drawdown_abs:0} max drawdown) but the central caveat is the 4-year ({backtest_days}-day) backtest. Like the related KMLM Switcher, those ratios lean heavily on the 2021 to 2024 window, where managed-futures diversification and sharp dip-buys looked exceptional; such returns are not a reasonable forward expectation. The strategy is a sophisticated, all-weather-style design, but its short, period-specific test means the spectacular metrics should be discounted far more than those of the 14-year-tested strategies."
    ],
    "how_it_works": [
      "The outermost layer checks RSI(10) on 11 market tickers in sequence: QQQE (equal-weight Nasdaq), VTV (value), VOX (communications), TECL (3x tech ETF), VOOG (S&P 500 growth), VOOV (S&P 500 value), XLP (consumer staples), TQQQ (3x QQQ), XLY (consumer discretionary), FAS (3x financials), and SPY. Thresholds range from 75 (XLP) to 80 (XLY, FAS, SPY), with most set at 79. If any single ticker crosses its threshold, 100% of the portfolio rotates to UVXY (a leveraged long VIX-futures ETF). The strategy treats any overbought sector as a systemic early warning, one hot ticker is enough to go defensive. This makes Simon's KMLM Switcher unusual: most strategies rely on 1-2 overbought signals, while this strategy checks 11 in parallel, dramatically increasing the frequency of UVXY rotations.",
      "When none of the 11 overbought conditions fire, the strategy cascades through four dip-buy checks on leveraged ETFs: TQQQ RSI(10) < 30 buys TECL (3x tech), SOXL RSI(10) < 30 buys SOXL, SPXL RSI(10) < 30 buys SPXL, and LABU RSI(10) < 25 buys LABU. These are strict oversold thresholds designed to catch 3x ETF capitulation events, moments when a leveraged instrument has fallen so sharply that RSI reaches extreme lows. Note the first branch reads TQQQ's oversold signal but expresses the trade through TECL rather than TQQQ itself; the remaining three buy the same ETF they measure. Each condition is checked in order; the first one that triggers takes 100% of the portfolio. The LABU threshold of 25 is tighter than the others, reflecting biotech's extreme volatility. This layer only activates in specific crash conditions, when a leveraged ETF is genuinely at panic-sell levels, and not during ordinary pullbacks.",
      "If neither the overbought layer nor the dip-buy layer fires, the strategy's core logic activates: comparing RSI(10) of XLK (iShares US Technology ETF) versus RSI(10) of KMLM (KFA Mount Lucas Managed Futures Index Strategy ETF). When XLK's RSI exceeds KMLM's, tech showing stronger short-term momentum than managed futures, the strategy selects the bottom two performers by RSI(10) from the trio {TECL, SOXL, SVIX (-1x Short VIX Futures)}, equal-weighting them. This is a mean-reversion bet in the most beaten-up leveraged assets during a tech-momentum environment. When KMLM's RSI exceeds XLK's, managed futures outperforming tech, typically a risk-off or trending market signal, the portfolio rotates entirely to whichever of SQQQ (3x inverse QQQ) or TLT (20+ year treasuries) has the higher RSI(10), placing the full portfolio in a defensive or bearish position."
    ],
    "signals": [
      {
        "name": "11-Ticker RSI Overbought Gate",
        "tag": "rsi",
        "description": "RSI(10) above 75-80 on any of 11 tickers (QQQE, VTV, VOX, TECL, VOOG, VOOV, XLP, TQQQ, XLY, FAS, SPY) routes 100% to UVXY. The widest overbought screen in this library, any single trigger is sufficient to go defensive regardless of other market conditions."
      },
      {
        "name": "4-ETF Dip-Buy Cascade",
        "tag": "leveraged-etfs",
        "description": "Sequential RSI(10) < 30 checks on TQQQ, SOXL, and SPXL; RSI(10) < 25 on LABU. Catches extreme 3x ETF capitulation events in tech, semiconductors, broad market, and biotech, each independently checked in order of priority. The TQQQ trigger buys TECL; the other three buy the ETF they measure."
      },
      {
        "name": "XLK vs. KMLM Momentum Switch",
        "tag": "managed-futures",
        "description": "Core signal: XLK RSI(10) > KMLM RSI(10) → bottom-2 by RSI from {TECL, SOXL, SVIX} (equal weight). KMLM RSI(10) > XLK RSI(10) → top-1 by RSI from {SQQQ, TLT}. Uses managed futures momentum as a macro regime detector, when futures outperform tech, the strategy pivots to defensive positions."
      },
      {
        "name": "SVIX Volatility Premium Position",
        "tag": "vix-tiers",
        "description": "SVIX (-1x Short VIX Futures ETF) enters the candidate pool alongside TECL and SOXL when XLK leads KMLM. In calm contango environments SVIX collects VIX roll yield; its negative RSI during volatility spikes makes it a frequent bottom-2 selection, adding a volatility-selling dimension to the leveraged-long rotation."
      },
      {
        "name": "SQQQ Defensive Inversion",
        "tag": "inverse-etfs",
        "description": "When KMLM momentum dominates XLK, SQQQ (3x inverse QQQ) is the aggressive defensive option, selected over TLT when SQQQ's RSI(10) is higher. Positions the strategy to profit from Nasdaq decline during managed-futures-dominant regimes."
      }
    ],
    "risk_profile": {
      "verdict": "Extremely Aggressive",
      "leverage": "Constant rotation between UVXY hedges, 3x dip-buys and momentum-switched leveraged positions across SOXL, SPXL, TECL and LABU, with SQQQ inverse.",
      "backtest_limits": "Roughly 4.3 years from 2022, bounded by SVIX. Its Calmar and Sharpe are the highest in this library and its annualised return among the highest, and all of those figures come from a single window covering the 2022 bear and the 2023 to 2025 bull run, a period that may have been unusually favourable for this style of RSI switching. Interpret with significant caution; a longer out-of-sample record is essential before taking these metrics at face value.",
      "signal": "The 11-ticker UVXY overbought layer appears to provide meaningful downside protection during sharp sell-offs, which is why the max drawdown is moderate given how high the volatility is. Whether that layer generalises beyond the window that produced it is exactly what the short record cannot tell you.",
      "hedge": "UVXY, SQQQ, SVIX and TLT are all reachable. SVIX is short volatility, so it sits on the opposite side of the trade from UVXY and is not a hedge despite appearing in the same universe.",
      "concentration": "Eight instruments, and the leveraged legs are all US growth, semiconductors or biotech."
    },
    "author_note": "'Single pops' in the full symphony name refers to the sequential single-ticker overbought detection: each RSI check fires independently on a single ticker, unlike strategies that require multiple conditions simultaneously. KMLM (KFA Mount Lucas Managed Futures Index Strategy ETF) serves as the macro regime detector, when managed futures momentum outpaces tech, the strategy pivots to defensive or bearish positions.",
    "tldr": {
      "thesis": "Three layers stacked in one 58-line ladder. Eleven overbought tests come first, on eleven different indexes and sectors, and every one of them leads to the same holding: UVXY. Below them sit four oversold rungs that buy a specific 3x fund when it is beaten down. What is left, 81% of the record, reaches a switch that compares tech momentum against managed futures momentum and goes either to the two most oversold leveraged longs or to SQQQ and TLT. The number that should be read first is not the {annualized_rate_of_return} return. It is the {backtest_days} day record, which begins on 12 April 2022, one day before the backtest date written into the strategy's own title.",
      "works_well_in": [
        "Semiconductor and tech uptrends reached through the switch. SOXL compounded +12,316.6% across the 440 days the rules named it and TECL +3,118.8% across 375, and together they take 40.0% of all capital deployed.",
        "Falling markets, which it can be short in. SQQQ is the single largest position in the strategy at 23.1% of capital and compounded +349.8% across 254 days. Through the 2022 bear market the reconstruction held SQQQ on 52% of days while SQQQ rose 120.7%.",
        "Volatility spikes, in the eleven-rung sense. UVXY was held on 134 days, 12.2% of capital, and compounded +245.8% across them.",
        "Calm markets where short volatility pays. SVIX was held on 309 days and compounded +420.5%. Through the 2023 AI bull the reconstruction held it on 15% of days while SVIX rose 155.6%."
      ],
      "struggles_in": [
        "Any market that does not resemble April 2022 onward, because there is no other market in the record. The strategy was fitted from a stated start date and the record begins there, so nothing here is out of sample.",
        "Bonds as a defensive holding. TLT is the only losing leg in the strategy, at -1.5% across 100 days held, and it is one of only two places the logic can go when tech momentum fails.",
        "Sideways leveraged markets where every holding drifts down. Across 2024 SOXL fell 1.8%, SVIX 32.9% and SQQQ 52.2%, while the reconstruction spread its days across those three and TECL in near-equal shares.",
        "Anything that punishes turnover. The allocation changes on 399 of {backtest_days} days, about once every 2.8 trading days, entirely in 3x and inverse funds."
      ]
    },
    "assumptions": {
      "market": [
        "**An extreme 10-day RSI anywhere marks a top everywhere.** The eleven overbought rungs read QQQE, VTV, VOX, TECL, VOOG, VOOV, XLP, TQQQ, XLY, FAS and SPY. Ten of those eleven are things the strategy cannot hold, so the design assumes an overbought reading in one corner of the market is a reason to buy volatility across all of it.",
        "**An extreme oversold reading in a 3x fund is a buy.** The four pop rungs check TQQQ, SOXL, SPXL and LABU below 30 or 25, and buy the leveraged fund itself. This is mean reversion applied to the most volatile instruments available.",
        "**Tech momentum against managed futures momentum identifies the regime.** The switch compares a 10-day RSI on XLK against one on KMLM, and it decided 533 days, more than any other test in the tree.",
        "**When tech is not leading, the right response is to be short or in bonds.** The else side picks the higher-RSI of SQQQ and TLT, so the alternative to being long is a directional short position rather than cash."
      ],
      "structural": [
        "**The whole record is the fitting window.** The symphony's own title reads BT 4/13/22 = A.R. 466% / D.D. 22%, and the {backtest_days} day record begins on 12 April 2022. Every figure on this page describes the period the strategy was tuned on. There is no out-of-sample evidence of any kind.",
        "**The advertised backtest no longer matches the live record.** The title claims an annual 466% at a 22% drawdown. The live metrics report {annualized_rate_of_return} at {max_drawdown_abs}, so the drawdown is ten points deeper than the number in the name.",
        "**Eleven tests, one outcome.** All eleven overbought rungs hold UVXY. One of them, the VOOG rung, never decided a single day, because every day it was true had already been caught by a rung above it. The eleven together decided 134 days, and the most productive of them is the XLP rung at 40 days, a consumer staples signal with the lowest threshold in the ladder.",
        "**The strategy is named after a fund it never holds.** KMLM is a managed futures fund and appears only inside the comparison that names the strategy. Twelve tickers in this tree are signal-only against eight it can hold.",
        "**A {calmar_ratio} Calmar and a {sharpe_ratio} Sharpe both rank second among the 24 strategies in this library.** On a 4.4 year record that is entirely in-sample, those are the numbers to be most careful with, not least so.",
        "**Every holdable asset is a leveraged or inverse fund.** Four 3x longs, one 3x short, one inverse volatility fund, one long volatility fund, and TLT. There is no cash branch and no unlevered equity anywhere.",
        "**{max_drawdown_abs} is shallow for this library**, 19th deepest of 24, but it sits on {standard_deviation} annualized volatility, the fifth highest here, and the worst single day in the record was {worst_day}.",
        "**Turnover is among the highest in this library**, at one allocation change every 2.8 trading days across 3x and inverse funds. It holds two positions on 533 days and one on 565. None of the figures on this page carries a commission, a spread or a slippage assumption."
      ]
    },
    "regimes": [
      {
        "regime": "Tech and semiconductor uptrend",
        "expected": "Strong",
        "why": "The switch sends the logic to the two most oversold of TECL, SOXL and SVIX, which is a leveraged long position taken on a pullback inside an uptrend.",
        "example": "2023 AI bull: SOXL +237.8%, TECL +211.9%, SVIX +155.6%. The reconstruction held SOXL on 26% of days, TECL on 18% and SVIX on 15%."
      },
      {
        "regime": "Sustained decline",
        "expected": "Strong",
        "why": "When tech momentum falls behind managed futures the logic can hold SQQQ outright, so a falling market is a market it is positioned for rather than one it hides from.",
        "example": "From 12 April 2022 through the rest of that bear market: SQQQ +120.7%, SOXL -89.8%, TECL -77.5%. The reconstruction held SQQQ on 52% of days."
      },
      {
        "regime": "Volatility spike",
        "expected": "Strong",
        "why": "Eleven separate overbought rungs all reach UVXY, so there are many ways into the long volatility position and it takes only one of them to fire.",
        "example": "Across the 134 days the eleven rungs named UVXY it compounded +245.8%, on 12.2% of all capital deployed."
      },
      {
        "regime": "Calm market after a shock",
        "expected": "Strong",
        "why": "SVIX is one of the three funds the switch can reach on the long side, and a falling volatility term structure is the one condition it needs.",
        "example": "2025 rebound: SVIX +19.4%, SOXL +97.3%, UVXY -42.5%. The reconstruction held SVIX on 43% of days and SOXL on 35%."
      },
      {
        "regime": "Sideways leveraged market",
        "expected": "Mixed",
        "why": "In a year where the long funds, the short fund and the volatility fund all drift lower, the result depends entirely on the daily switching rather than on the holdings, and holdings shares cannot show whether that switching worked.",
        "example": "2024: SOXL -1.8%, SVIX -32.9%, SQQQ -52.2%, TECL +47.5%, with the reconstruction spread across all four in near-equal shares."
      },
      {
        "regime": "A market unlike April 2022 onward",
        "expected": "Unknown",
        "why": "The record and the fitting window are the same {backtest_days} days. Sixteen conditions with hand-chosen thresholds have never been tested against a market the author did not already have in front of them.",
        "example": "The record begins 12 April 2022, one day before the backtest date written into the strategy's own title."
      }
    ],
    "regime_note": "**The example column is what the holdings did, not what the strategy returned.** Each ticker figure is the move in that fund between the first and last trading day of the window, computed from daily closes, and each holdings share comes from evaluating this strategy's own symphony tree over those same closes. That evaluation is a reading of the rules rather than a backtest: it answers only which funds the rules would name on a given day, and it carries no fees, no slippage and no rebalance timing. No reconstructed return is quoted on this page. The allocation changes about once every 2.8 trading days entirely in 3x and inverse funds, and a costless model of that path would say more about the absence of costs than about the strategy, so the regimes above are ranked from holdings and price moves alone. The reconstruction covers {backtest_days} trading days from 12 April 2022 to 27 August 2026, matching the backtest window on record. Windows earlier than that date are outside the record and are not used here."
  },
  {
    "slug": "bnd-vs-sphb",
    "name": "10d BND vs. 10d SPHB (Original)",
    "symphony_url": "https://app.composer.trade/symphony/0HCtnEKGw1PRt8Om77a3/details",
    "symphony_id": "0HCtnEKGw1PRt8Om77a3",
    "annualized_rate_of_return": 0.9851400790861267,
    "max_drawdown": -0.7002444626035564,
    "cumulative_return": 26134.78238,
    "calmar_ratio": 1.4068516520977674,
    "sharpe_ratio": 1.3847269036781575,
    "standard_deviation": 0.6422871387407016,
    "min": -0.298277971135414,
    "mean": 0.00352933444801871,
    "median": 0.0,
    "max": 0.5462990186513568,
    "trailing_one_month_return": 0.11556298027822609,
    "trailing_three_month_return": 0.5526094311576066,
    "trailing_one_year_return": 4.835709195977967,
    "backtest_days": 3737,
    "description": "A contrarian semiconductor strategy that uses the relative 10-day RSI of BND (total bond market) versus SPHB (high-beta stocks) as a regime signal, buying SOXL when bonds show stronger momentum than high-beta equities and holding cash (SHV) when high-beta stocks lead, with UVXY RSI tiers providing additional nuance within the bond-leading regime.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "mean-reversion",
      "vix-tiers"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "This strategy is built on a counterintuitive premise: when bonds (BND) are outperforming high-beta equities (SPHB) on a 10-day RSI basis, the strategy buys SOXL (3x semiconductors), the riskiest holding in this library. The logic inverts conventional risk-on thinking. BND momentum exceeding SPHB momentum signals a short-term risk-off sentiment extreme, which the strategy reads as a setup for a sharp reversal in speculative assets. The position is binary: fully in SOXL or fully in SHV (cash), with UVXY RSI tiers providing a separate volatility-based crash guard that can redirect to cash or SOXL depending on implied volatility conditions.",
      "Over approximately 14.7 years, the strategy posts {annualized_rate_of_return} annualized returns with a {max_drawdown_abs:0} max drawdown, one of the deepest in this library. The backtest begins around May 2011 when SPHB launched, so it excludes both the 2008 financial crisis and the dot-com bust, two periods that would almost certainly produce larger drawdowns. The 100x+ returns are compelling but the {max_drawdown_abs:0} drawdown and the extreme SOXL concentration are the defining risk characteristics. This suits only investors who can accept losing most of their portfolio value mid-cycle while trusting that a relative RSI signal between bonds and high-beta stocks is a durable edge in semiconductors."
    ],
    "how_it_works": [
      "The strategy's central signal compares the 10-day RSI of BND (Vanguard Total Bond Market ETF) versus SPHB (Invesco S&P 500 High Beta ETF), two proxies at opposite ends of the risk spectrum. When BND's 10-day RSI exceeds SPHB's, the strategy interprets this as a short-term risk-off signal and takes its most aggressive position: holding SOXL (3x leveraged semiconductors). The rationale is mean-reversion. Defensive assets outperforming aggressive ones on a 10-day basis often signals a temporary sentiment extreme, and the leveraged semiconductor position profits from the eventual rotation back to risk-on. The inverse also holds: when SPHB RSI exceeds BND RSI (risk-on environment), the strategy defaults to SHV (near cash), treating high-beta outperformance as a sign the rally may be overextended.",
      "Within the bond-leading regime (BND RSI > SPHB RSI), two sequential conditions refine the default SOXL position. First, if SOXX RSI(10) exceeds 80 (semiconductors overbought despite broad defensiveness), the strategy rotates to SHV to avoid a blow-off top entry. Second, if SOXX is not overbought, the strategy checks UVXY RSI(10) as a volatility gauge. A reading above 84 (extreme panic) triggers an unconditional SOXL buy. Between 74 and 84 (elevated volatility), SOXL is only bought if its own RSI(10) is below 30 (doubly confirmed oversold); otherwise the strategy holds SHV. If UVXY RSI is below 74 (calm market), the strategy simply holds SOXL as the default bond-leading position with no fear signal required.",
      "The risk-on branch (SPHB RSI > BND RSI) is simpler: the only exception to holding SHV is if SOXL RSI(10) falls below 30, which overrides the risk-on signal with a dip-buy. Outside that extreme, the strategy sits in cash when the market is broadly bullish and risk-seeking. This design, holding SOXL when the market is defensive and holding cash when the market is euphoric, makes 10d BND vs. 10d SPHB a high-patience, high-conviction contrarian strategy. SPHB launched in May 2011, which anchors the backtest start date and prevents testing through the 2008 financial crisis or the dot-com bust."
    ],
    "signals": [
      {
        "name": "BND vs. SPHB Relative RSI(10)",
        "tag": "mean-reversion",
        "description": "Primary regime signal: BND RSI(10) > SPHB RSI(10) (bonds outperforming high-beta) defaults to SOXL (contrarian long). SPHB RSI(10) > BND RSI(10) (risk-on) defaults to SHV (cash). Inverts the conventional risk-on/risk-off response: aggressive when the market is defensive, defensive when the market is aggressive."
      },
      {
        "name": "UVXY RSI Tiers (74 and 84)",
        "tag": "vix-tiers",
        "description": "Within the bond-leading regime: UVXY RSI(10) above 84 (extreme panic) buys SOXL unconditionally. Between 74 and 84 (elevated) buys SOXL only if SOXL RSI(10) is below 30, else holds SHV. Below 74 (calm) holds SOXL by default. Two-tier VIX filter calibrates the contrarian long trade by volatility severity."
      },
      {
        "name": "SOXX RSI(10) > 80 Overbought Guard",
        "tag": "rsi",
        "description": "In the bond-leading regime: if SOXX (semiconductor sector ETF) RSI(10) exceeds 80, exit to SHV regardless of other signals. Prevents buying SOXL into a semiconductor blow-off top even when the broader market is rotating defensively."
      },
      {
        "name": "SOXL RSI(10) < 30 Dip-Buy Override",
        "tag": "leveraged-etfs",
        "description": "Applied in both regimes: SOXL RSI(10) below 30 triggers a SOXL dip-buy even in the risk-on branch (which normally defaults to SHV). Catches extreme semiconductor capitulation events that override the conservative risk-on default."
      }
    ],
    "risk_profile": {
      "verdict": "Extremely Aggressive",
      "leverage": "The strategy concentrates exclusively in SOXL or SHV with no middle-ground position. SOXL alone can lose 80 to 90 percent during a semiconductor bear market, which is what produces a max drawdown among the highest in this library.",
      "backtest_limits": "Bounded by SOXL, the record runs from roughly 2011 and covers the 2020 COVID crash, the 2022 tech bear when SOXL fell over 90 percent, and the 2023 to 2025 AI bull run. It does not cover 2008. Its Calmar and Sharpe are respectable given the drawdown severity.",
      "signal": "The signal reads BND against SPHB over 10 days, so a bond fund and a high-beta equity index decide a position in leveraged semiconductors. The instruments being measured are not the instruments being traded.",
      "concentration": "Two instruments. All of the risk sits in one 3x sector fund and the only alternative is cash.",
      "suitability": "Requires exceptional risk tolerance and very long holding periods to survive inevitable periods of severe loss."
    },
    "author_note": "The median daily return was not available from the Composer API for this symphony and is displayed as 0.00%. SPHB (Invesco S&P 500 High Beta ETF) launched in May 2011, which is why the backtest cannot extend to the 2008 financial crisis or the dot-com bust despite both BND and SOXL having longer histories.",
    "tldr": {
      "thesis": "Neither fund in the name is ever held. BND and SPHB are read as signals, and the strategy owns exactly two things: SOXL, a 3x semiconductor fund, and SHV, a Treasury bill fund that stands in for cash. The gate is deliberately contrarian, and it is worth reading twice. When bonds have stronger 10-day momentum than high-beta stocks, which is the risk-off reading, the strategy buys 3x semiconductors. When high-beta stocks lead, it sits in cash. It was in cash on 54.8% of {backtest_days} days.",
      "works_well_in": [
        "Falling markets where high-beta leadership has already broken. Through the 2022 bear market the reconstruction sat in SHV on 67% of days while SOXL fell 89.8% and SPY fell 24.5%.",
        "Semiconductor recoveries taken from a contrarian entry. SOXL compounded a very large gain across the 1,689 days the rules named it, and through the COVID recovery the reconstruction held it on 69% of days while SOXL rose 185.1%.",
        "Long semiconductor uptrends, even at partial participation. Across 2012 to 2014 the reconstruction held SOXL on 44% of days while SOXL rose 401.1%, and through the 2019 recovery it held it on 53% while SOXL rose 223.3%.",
        "Periods when being out is the whole job. SHV is 54.8% of all capital deployed, so more than half of this strategy's life is spent holding Treasury bills, and the record credits it with the drawdowns it avoided."
      ],
      "struggles_in": [
        "Whipsaw, which is the defining problem here. The gate crossed 596 times across {backtest_days} days, about once every six trading days, and 187 of the 299 stretches on the bond-leading side lasted five days or fewer.",
        "Declines where bond momentum leads all the way down, because that is the signal to be long 3x semiconductors. Through the 2025 spring drawdown the reconstruction held SOXL on 85% of days while SOXL fell 73.7%.",
        "Sharp selloffs generally. In the Q4 2018 selloff it held SOXL on 78% of days while SOXL fell 57.0%.",
        "Sustained rallies led by high-beta stocks, which put the strategy in cash for the duration. Through the 2021 melt-up it sat in SHV on 63% of days while SOXL rose 121.9%."
      ]
    },
    "assumptions": {
      "market": [
        "**Relative 10-day momentum between bonds and high-beta stocks identifies the regime.** This comparison decided 1,699 of {backtest_days} days directly and gates every other test in the tree.",
        "**The right response to that signal is the opposite of the obvious one.** Bonds outrunning high-beta stocks is normally read as risk-off, and this strategy reads it as the moment to hold a 3x semiconductor fund. The design is a bet that the reading marks a washout rather than the start of a decline.",
        "**Semiconductors are the right thing to be contrarian in.** There is no other risky holding anywhere in the tree. The signal is about the broad market and bonds; the expression is entirely in one sector, at 3x leverage.",
        "**An extreme volatility reading means capitulation, and a moderate one means danger.** A 10-day RSI on UVXY above 84 buys SOXL, while a reading between 74 and 84 goes to cash unless SOXL is itself oversold. The tiers are ordered so that more fear means more risk taken."
      ],
      "structural": [
        "**The two funds in the name are never held.** BND and SPHB are signal-only, alongside SOXX and UVXY. Four tickers feed the logic and two are holdable.",
        "**It is a binary switch with nothing in between.** SOXL or SHV, one position on 100% of days. There is no partial allocation, no second risky asset and no hedge.",
        "**The gate whipsaws badly.** 596 crossings in {backtest_days} days, a median stretch of three days on the bond-leading side, and 187 of 299 such stretches lasting five days or fewer. Every one of those is a full switch between a 3x fund and Treasury bills.",
        "**Three of the five tests barely matter.** The SOXX overbought rung decided 7 days, the two identical SOXL oversold rungs decided 36 between them, and the upper UVXY tier decided 13. The bond-versus-high-beta comparison decided 1,699 days on its own.",
        "**{max_drawdown_abs} is the fifth deepest drawdown among the 24 strategies in this library**, on {standard_deviation} annualized volatility, and the worst single day in the record was {worst_day}. A {sharpe_ratio} Sharpe and a {calmar_ratio} Calmar both rank 17th of 24.",
        "**Half the record is spent earning a cash return.** SHV compounded +13.6% across the 2,047 days it was held, which is roughly what Treasury bills paid over that stretch. The other half carries all of the risk and all of the return.",
        "**Turnover is meaningful for a two-asset strategy**, at one allocation change every 5.9 trading days, each one a full move between a 3x leveraged fund and a bill fund. None of the figures on this page carries a commission, a spread or a slippage assumption.",
        "**The record covers {backtest_days} trading days from 17 October 2011**, bounded by UVXY, which first traded on 4 October 2011, plus the 10-day lookback its RSI test needs. The 2008 crisis is absent, and so is the 2000 semiconductor collapse."
      ]
    },
    "regimes": [
      {
        "regime": "Decline after high-beta leadership breaks",
        "expected": "Strong",
        "why": "Once high-beta stocks stop leading, the gate flips to the side that holds cash, so the strategy is out of the way for the part of the decline that follows.",
        "example": "2022 bear market: SPY -24.5%, SOXL -89.8%. The reconstruction sat in SHV on 67% of days."
      },
      {
        "regime": "Semiconductor recovery",
        "expected": "Strong",
        "why": "The contrarian gate tends to be on the SOXL side coming out of a washout, and SOXL is the only risky thing it can own.",
        "example": "COVID recovery: SOXL +185.1%, and the reconstruction held it on 69% of days."
      },
      {
        "regime": "Capitulation spike",
        "expected": "Unknown",
        "why": "A 10-day RSI on UVXY above 84 goes straight into SOXL, so the most extreme fear reading in the tree is the one that takes the most risk. It fired on 13 days in {backtest_days}, which is far too few to judge.",
        "example": "That rung was true on 15 of {backtest_days} days and decided 13 of them. The tier below it, a UVXY reading between 74 and 84, goes to cash instead unless SOXL is itself oversold."
      },
      {
        "regime": "High-beta led rally",
        "expected": "Poor",
        "why": "When high-beta stocks lead, the gate holds cash, so the strategy sits out exactly the rallies its own risky asset would benefit from most.",
        "example": "2021 melt-up: SOXL +121.9%, and the reconstruction sat in SHV on 63% of days."
      },
      {
        "regime": "Decline led by bond strength",
        "expected": "Poor",
        "why": "Bonds outrunning high-beta stocks is the signal to be long a 3x semiconductor fund, and a decline in which that stays true holds the position all the way down.",
        "example": "2025 spring drawdown: SOXL -73.7%, and the reconstruction held SOXL on 85% of days."
      },
      {
        "regime": "Choppy market with no clear leadership",
        "expected": "Poor",
        "why": "The gate crosses about once every six trading days and each crossing is a complete switch between a 3x fund and Treasury bills, so an indecisive market maximises the number of round trips.",
        "example": "Across the record the gate crossed 596 times, with a median stretch of three days on the bond-leading side."
      }
    ],
    "regime_note": "**The example column is what the holdings did, not what the strategy returned.** Each ticker figure is the move in that fund between the first and last trading day of the window, computed from daily closes, and each holdings share comes from evaluating this strategy's own symphony tree over those same closes. That evaluation is a reading of the rules rather than a backtest: it answers only which of the two funds the rules would name on a given day, and it carries no fees, no slippage and no rebalance timing. No reconstructed return is quoted on this page. Every allocation change here is a full switch between a 3x leveraged fund and a Treasury bill fund, and one happens about every 5.9 trading days, so a costless model of that path would flatter it substantially. The regimes above are ranked from holdings and price moves alone. The reconstruction covers {backtest_days} trading days from 17 October 2011 to 27 August 2026, matching the backtest window on record."
  },
  {
    "slug": "dip-buying-tech",
    "name": "Dip Buying Tech",
    "symphony_url": "https://app.composer.trade/symphony/98cACZSS00eDg8Kv5BBV/details",
    "symphony_id": "98cACZSS00eDg8Kv5BBV",
    "annualized_rate_of_return": 0.1399019853227934,
    "max_drawdown": -0.2633759166775258,
    "cumulative_return": 35.102553,
    "calmar_ratio": 0.5311874642436941,
    "sharpe_ratio": 0.8151830408584413,
    "standard_deviation": 0.18050459711499295,
    "min": -0.09488481211131794,
    "mean": 0.0005839058982743166,
    "median": 0.0006927661470852442,
    "max": 0.15981225877290273,
    "trailing_one_month_return": 0.026799476773162967,
    "trailing_three_month_return": 0.013823445893288877,
    "trailing_one_year_return": 0.20944809650351526,
    "backtest_days": 6901,
    "description": "A three-branch SPY 200-day MA strategy that holds SPY in bull markets, defaults to XLP (consumer staples) when the market is in a downtrend, and dip-buys XLK (technology ETF) during bear markets when QQQ's 10-day RSI falls below 30, backtested from April 1999 through the dot-com crash as an educational baseline.",
    "tags": [
      "rsi",
      "200d-ma",
      "mean-reversion"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "Dip Buying Tech is explicitly designed as a backtesting study and educational baseline, not a live portfolio strategy. The author built it to test whether a simple two-signal decision tree (a 200-day moving average trend gate plus a single oversold trigger) could survive the dot-com crash, which the 27.2-year backtest window starting April 1999 directly validates. The logic is three branches: hold SPY in bull markets, retreat to XLP consumer staples as the defensive base in bear markets, and dip-buy XLK technology when QQQ's 10-day RSI falls below 30. No leverage, no exotic tickers, nothing hidden.",
      "The {annualized_rate_of_return} annualized return is modest but represents 27-plus years of live-through-it performance including two major crashes and a rate shock, all with a {max_drawdown_abs} max drawdown. Its value is conceptual: it demonstrates that even the simplest possible regime-plus-oversold structure can outperform passive SPY over the long run without leverage. The strategy is intentionally simple enough to explain in one sentence, making it the clearest possible baseline for understanding how more complex strategies in this library build on the same two-signal foundation."
    ],
    "how_it_works": [
      "Dip Buying Tech is one of the simplest strategies in this library: a three-leaf decision tree with a single trend gate and one dip-buy signal. In bull mode, when SPY's current price is above its 200-day simple moving average, the strategy holds SPY outright with 100% allocation. No overbought guards, no leveraged ETFs, no momentum filters. The full Composer name makes the educational intent explicit: 'Dip Buying Tech Below 10d RSI of 30 using XLP as the cash position and XLK as the tech ETF to backtest through the dot com crash.' The strategy was designed as a transparent baseline to test whether adding a single tech dip-buy signal to a SPY 200d MA framework meaningfully improves returns over a 27-year window that includes two catastrophic bear markets.",
      "When SPY crosses below its 200-day moving average, the strategy enters bear mode and shifts to XLP (Consumer Staples Select Sector SPDR Fund) as its default holding. Consumer staples companies generate steady revenues across economic cycles, making XLP one of the most reliable defensive sector rotations. The strategy uses XLP rather than cash or bonds because the 1999 backtest start date predates many bond ETFs, and because XLP provides equity-like returns during mild bear markets while limiting catastrophic losses during severe ones. XLP is essentially the strategy's low-volatility parking position between dip-buy entries.",
      "The one active signal in bear mode is a QQQ RSI dip-buy: when QQQ's 10-day RSI falls below 30, the strategy rotates from XLP to XLK (Technology Select Sector SPDR Fund). A QQQ RSI(10) below 30 requires a sustained sharp decline in the Nasdaq 100, not a single bad day. During bear markets, tech often leads the decline; when RSI hits extreme oversold levels, the strategy bets on a mean-reversion bounce and positions in the unleveraged XLK. The use of XLK over TQQQ or TECL keeps the risk profile conservative even at the dip-buy entry. When QQQ RSI recovers above 30, the strategy returns to XLP until SPY reclaims its 200d moving average."
    ],
    "signals": [
      {
        "name": "SPY 200-Day MA Trend Gate",
        "tag": "200d-ma",
        "description": "Primary regime filter: SPY current price vs. SMA(200). Above 200d MA = bull mode (hold SPY). Below = bear mode (XLP default with QQQ RSI override). The most common trend gate in this library, here used in its simplest possible form."
      },
      {
        "name": "QQQ RSI(10) < 30 Tech Dip-Buy",
        "tag": "rsi",
        "description": "Bear mode only: QQQ 10-day RSI below 30 triggers a rotation from XLP to XLK (1x technology ETF). Catches tech capitulation in bear markets as a contrarian entry. Uses unleveraged XLK rather than TQQQ or TECL, appropriate for a conservative educational baseline and the 1999 start date."
      },
      {
        "name": "XLP Defensive Default",
        "tag": "mean-reversion",
        "description": "When SPY is below its 200d MA and QQQ is not oversold, the strategy holds XLP (consumer staples). Defensive rotation away from growth exposure during downtrends, used as the safety parking position between dip-buy entries."
      }
    ],
    "risk_profile": {
      "verdict": "Conservative",
      "backtest_limits": "At 27 years from 1999 this is one of the two longest records in this library and one of the few that contains the dot-com crash and the 2008 financial crisis as well as the 2020 COVID crash and the 2022 tech bear. Both early crises are visible in the drawdown: even XLP's defensive positioning could not prevent meaningful losses.",
      "signal": "A single RSI dip-buy signal on top of a SPY 200-day framework. Its Calmar and Sharpe are both below 1.0, so the returns have not repaid the drawdown, and the strategy's value is as a clean benchmark for measuring what that one signal actually adds.",
      "concentration": "Three instruments, one of them a broad market index. Concentration is not the risk here.",
      "suitability": "Conservative relative to the rest of this library, with modest returns for a strategy that is always invested and never leveraged. Its value is educational rather than competitive."
    },
    "author_note": "The full Composer name: 'Dip Buying Tech Below 10d RSI of 30 using XLP as the \"cash\" position and XLK as the \"tech\" etf to backtest through the dot com crash. Backtest to April 26th 1999.' The author explicitly positions this as a backtesting study and validation tool rather than a live strategy recommendation."
  },
  {
    "slug": "ob-os-staple-bonds",
    "name": "Ob Os Staple my Bonds (Original)",
    "symphony_url": "https://app.composer.trade/symphony/OmMmeWyyAu0IRN2yOP6k/details",
    "symphony_id": "OmMmeWyyAu0IRN2yOP6k",
    "annualized_rate_of_return": 0.17333919203770498,
    "max_drawdown": -0.19598364492459341,
    "cumulative_return": 78.695655,
    "calmar_ratio": 0.884457435743676,
    "sharpe_ratio": 1.0347129390376162,
    "standard_deviation": 0.16806728861731296,
    "min": -0.09488459461603915,
    "mean": 0.0006900849133385046,
    "median": 0.0004910919404421676,
    "max": 0.16721552315559185,
    "trailing_one_month_return": -0.009660720964300484,
    "trailing_three_month_return": 0.050038885837198066,
    "trailing_one_year_return": 0.012993938051064857,
    "backtest_days": 6901,
    "description": "A two-signal defensive strategy that buys QQQ when the Nasdaq reaches extreme oversold territory (RSI(10) <= 30) and otherwise holds whichever of XLP (consumer staples) or VBF (Invesco Bond Fund) currently has the lower 10-day RSI, always rotating to the more beaten-up defensive asset. The V0.0 Original baseline from 1999, first in a multi-version series.",
    "tags": [
      "rsi",
      "mean-reversion"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "Ob Os Staple my Bonds V0.0 is the original baseline of a multi-version strategy series. The name decodes as Overbought/Oversold (Ob/Os) plus Staples (XLP) plus Bonds (VBF). The core logic is continuous relative-value rotation between two defensive assets: whichever of XLP (consumer staples) and VBF (Invesco Bond Fund) currently has the lower 10-day RSI receives the full allocation. This treats RSI as a relative beaten-down signal rather than an absolute threshold, rotating toward whichever defensive asset has been sold down more recently. The single offensive override fires when QQQ's RSI(10) falls to or below 30, rotating the entire portfolio to unleveraged QQQ for a mean-reversion dip-buy.",
      "The result is one of the most conservative profiles in this library: {annualized_rate_of_return} annualized with a {max_drawdown_abs} max drawdown across 27.2 years including the dot-com crash, 2008 financial crisis, and 2022 rate shock. That combination of steady compounding and low drawdown reflects what a strategy looks like when its default state is always in something defensive. The V0.0 designation means this page covers only the 1999-start original; the author notes later versions (V0.1 through V0.3) use progressively shorter backtest windows, which typically improves reported metrics. This version is best understood as a long-run reference for defensive RSI rotation behavior across full market cycles."
    ],
    "how_it_works": [
      "Ob Os Staple my Bonds V0.0 is the original baseline of a multi-version strategy series. The name decodes as Overbought/Oversold (Ob/Os) + Staples (XLP) + Bonds (VBF). The strategy operates on a single oversold threshold: when QQQ's 10-day RSI falls to or below 30, it exits its defensive position and buys QQQ outright. A QQQ RSI(10) at or below 30 signals a sustained sharp Nasdaq decline, and the strategy enters expecting a mean-reversion bounce. Unlike most strategies in this library that use leveraged ETFs (TQQQ, TECL, SOXL) for dip-buying, V0.0 holds unleveraged QQQ, reflecting both its 1999 origin date when 3x ETFs did not yet exist and its conservative design philosophy.",
      "When QQQ is not in extreme oversold territory, the strategy runs a two-asset competition between XLP (Consumer Staples Select Sector SPDR Fund) and VBF (Invesco Bond Fund, an actively managed bond fund). It evaluates the 10-day RSI of both and holds whichever has the lower reading, always rotating to the more beaten-up of the two. If XLP has been selling off while VBF has been rising, the strategy holds XLP. If VBF has been declining while staples hold steady, it moves to VBF. The result is a defensive portfolio that continuously tilts toward the asset experiencing more near-term stress, applying mean-reversion logic within an already-conservative two-asset universe.",
      "The multi-version series (V0.0 from 1999, V0.1 from 2007, V0.2 from 2010, V0.3 from 2011) stress-tests the same logic across different market eras. V0.0 is the most demanding test, covering both the dot-com crash (Nasdaq fell 78% from 2000 to 2002) and the 2008 financial crisis. The lowest max drawdown in this library, earned since 1999 despite those two historic bear markets, reflects the protective power of the XLP/VBF defensive default and the QQQ dip-buy's discipline in waiting for RSI(10) <= 30 before entering. VBF (Invesco Bond Fund) is an actively managed bond fund, distinct from passive ETFs like BND or TLT, and its inclusion reflects the instruments available at the 1999 backtest start date."
    ],
    "signals": [
      {
        "name": "QQQ RSI(10) <= 30 Oversold Dip-Buy",
        "tag": "rsi",
        "description": "Primary entry signal: QQQ 10-day RSI at or below 30 triggers a full rotation to unleveraged QQQ. Fires only during sustained sharp Nasdaq declines. The <= 30 threshold (not just < 30) means RSI exactly at 30 also triggers, a slightly wider gate than many comparable strategies use."
      },
      {
        "name": "XLP vs. VBF Lower-RSI Rotation",
        "tag": "mean-reversion",
        "description": "Default regime: compares RSI(10) of XLP (consumer staples) and VBF (Invesco Bond Fund) and holds whichever has the lower reading. Always rotates to the more beaten-up defensive asset. A contrarian micro-rotation between two conservative positions, continuously chasing the underperformer within the defensive pair."
      }
    ],
    "risk_profile": {
      "verdict": "Conservative",
      "backtest_limits": "27 years from 1999, one of the two longest records here, covering the dot-com crash, the 2008 financial crisis and the 2022 tech bear. Its max drawdown is the lowest in this library and it was earned across that window rather than in a favourable slice of it.",
      "signal": "The strategy holds unleveraged QQQ only during brief extreme oversold windows and otherwise sits in consumer staples or bonds. That is why recent trailing returns have significantly underperformed the broader bull market, and it is the design working as intended rather than failing.",
      "concentration": "Three instruments, none of them a concentrated position.",
      "suitability": "VBF (Invesco Bond Fund) is an actively managed closed-end bond fund. Anyone replicating this strategy today might substitute a passive alternative such as BND or AGG."
    },
    "author_note": "The strategy notes four versions by start date in its Composer description: V0.0 (1999), V0.1 (2007), V0.2 (2010), V0.3 (2011). The (23,19,1999) in the symphony name likely refers to a specific backtest start date of November 23 or November 19, 1999. This page covers V0.0 only."
  },
  {
    "slug": "sometimes-tqqq",
    "name": "Sometimes TQQQ (Original)",
    "symphony_url": "https://app.composer.trade/symphony/MyRyWhvbdxTsRfzHmE1U/details",
    "symphony_id": "MyRyWhvbdxTsRfzHmE1U",
    "annualized_rate_of_return": 3.2028252812464855,
    "max_drawdown": -0.4554915658944696,
    "cumulative_return": 1879058009.379987,
    "calmar_ratio": 7.03157977240907,
    "sharpe_ratio": 2.7294409682921734,
    "standard_deviation": 0.5870957879095232,
    "min": -0.19943238181920486,
    "mean": 0.0063589019675874036,
    "median": 0.0017605470159425263,
    "max": 0.5731658163279507,
    "trailing_one_month_return": 0.1299414466207205,
    "trailing_three_month_return": 0.10868423476709399,
    "trailing_one_year_return": 1.207787773844431,
    "backtest_days": 3747,
    "description": "A five-regime TQQQ framework that runs unconditional RSI dip-buy and overbought gates first, then routes the bull market through Choppy, Bull 1, and Bull 2 sub-strategies and the bear market through Bear 1 and Bear 2, using layered bond vs. equity momentum signals to decide when TQQQ exposure is warranted and when to rotate to SQQQ, GLD, PSQ, or BIL.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "inverse-etfs",
      "200d-ma",
      "vix-tiers",
      "mean-reversion"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "Sometimes TQQQ earns its name through a priority-first architecture: before any regime analysis, two unconditional safety checks run. If QQQ's 10-day RSI falls below 32, the strategy rotates immediately to TECL (3x tech sector) for an early dip-buy entry. If SPY's 10-day RSI falls below 30, it rotates to UPRO (3x S&P 500). These priority gates can fire regardless of the broader market regime. After the priority checks clear, the strategy routes through five sub-regimes: Choppy, Bull 1, Bull 2, Bear 1, and Bear 2, each deciding whether TQQQ exposure is warranted based on layered bond-versus-equity momentum signals, ultimately choosing between TQQQ, various leveraged alternatives, and defensive positions.",
      "Over approximately 14.7 years the strategy posts {annualized_rate_of_return} annualized returns and a roughly 1.9 billion times cumulative return, among the highest backtest figures in this library, with a {max_drawdown_abs} max drawdown that is large in absolute terms but notably restrained relative to those headline numbers. The backtest starts around October 2011 when UVXY launched, excluding 2008 and the early stages of the 2010 flash crash. The {sharpe_ratio} Sharpe and {calmar_ratio} Calmar are exceptional by any standard. The five-regime depth and the priority-gate architecture are the distinguishing design features: the strategy is not 'always TQQQ' or 'sometimes TQQQ based on one signal' but a carefully sequenced decision tree that treats TQQQ as the preferred outcome and routes away from it only under explicit disqualifying conditions."
    ],
    "how_it_works": [
      "'Sometimes TQQQ' describes the strategy's core design principle: TQQQ (3x Nasdaq 100) is the preferred holding, but only under specific conditions, hence 'sometimes.' Two priority checks run before any regime analysis. If QQQ's 10-day RSI falls below 32, the strategy immediately rotates to TECL (3x technology sector ETF), entering tech recoveries slightly above the classic 30 threshold for earlier positioning. If QQQ is not that oversold but SPY's 10-day RSI falls below 30 (a broader market capitulation signal), it rotates to UPRO (3x S&P 500). These two dip-buy gates are unconditional: they fire regardless of what the SPY 200-day moving average or any other regime signal says. Their counterparts at the upper end of the RSI range are overbought exits: if QQQ RSI(10) exceeds 81 or SPY RSI(10) exceeds 80, the strategy buys UVXY (2x long VIX) as an overbought hedge, converting extreme RSI readings into volatility-long positions.",
      "If no RSI extreme is active and SPY is above its simple moving average (bull market), the strategy enters one of three bull sub-regimes. A 60-day SPY RSI reading above 61 signals an extended or choppy bull market, routing to a sub-strategy that compares QQQ's 100-day RSI against VPU (Vanguard Utilities ETF) and uses CORP vs. BIL cumulative returns to choose between UPRO, SPY, SH (1x inverse S&P), or BIL. When the 60-day SPY RSI is below 61 (healthy trend pace), the strategy further splits on TLT vs. PSQ RSI: if TLT RSI is below PSQ RSI, it enters the Bull 1 sub-strategy; otherwise Bull 2. Both sub-strategies target TQQQ as the primary holding, using layered cumulative return comparisons (60-day BND vs. BIL, BND vs. SH RSI, BND vs. QQQ RSI) to confirm bond conditions support staying long 3x Nasdaq, and routing to PSQ (1x inverse Nasdaq), GLD, or SQQQ (3x inverse) when they do not.",
      "When SPY falls below its moving average (bear market), the strategy routes into one of two bear sub-strategies. If QQQ has lost more than 12% over 60 days (Bear 1, deep bear), it distinguishes between a mature bear (QQQ down 20%+ over 252 days, suggesting capitulation near) and an ongoing decline, using QQQ's 20-day moving average plus TLT-vs-SQQQ RSI and 10-day bounce detection to choose between unleveraged QQQ, TQQQ dip-buys, and SQQQ. In the shallower bear (Bear 2, QQQ down less than 12% over 60 days), TQQQ's own moving average becomes the key gate: above it the strategy seeks exposure through TQQQ or SQQQ based on bond strength; below it the strategy rotates to GLD or SQQQ based on IEF vs. PSQ momentum. The layered architecture means the strategy almost always has a directional opinion rather than defaulting to cash."
    ],
    "signals": [
      {
        "name": "QQQ and SPY RSI(10) Dip-Buy Gates",
        "tag": "mean-reversion",
        "description": "Two unconditional priority gates: QQQ RSI(10) < 32 rotates to TECL (3x tech sector dip-buy, slightly above the classic 30 for early entry). SPY RSI(10) < 30 rotates to UPRO (3x S&P500 broad-market dip-buy). Both fire before any regime analysis, overriding the SPY 200d MA gate and sub-strategy routing."
      },
      {
        "name": "UVXY Overbought Exits",
        "tag": "vix-tiers",
        "description": "QQQ RSI(10) > 81 or SPY RSI(10) > 80 triggers a rotation to UVXY (2x long VIX). Converts overbought RSI extremes into volatility-long positions, hedging against sudden reversals at market peaks. Applied in the bull market path after the dip-buy gates."
      },
      {
        "name": "SPY 200d MA Bull and Bear Gate",
        "tag": "200d-ma",
        "description": "Primary trend gate: SPY above its simple moving average routes to bull sub-strategies (Choppy Market, Bull 1, Bull 2). Below routes to bear sub-strategies (Bear 1, Bear 2). Applied after the RSI priority gates; the five named sub-strategies only activate once this gate resolves."
      },
      {
        "name": "Bond vs. Equity Momentum Router",
        "tag": "momentum",
        "description": "Multiple bond vs. equity momentum comparisons determine TQQQ exposure across sub-strategies: TLT RSI vs. PSQ RSI (routes Bull 1 vs. Bull 2), 60-day BND vs. BIL cumulative returns (confirms bond health supports TQQQ), IEF RSI vs. PSQ RSI (bear context), BND RSI vs. SH RSI. Strong bond momentum relative to inverse-equity signals supports TQQQ; weak bond momentum routes to PSQ, SQQQ, GLD, or BIL."
      }
    ],
    "risk_profile": {
      "verdict": "Extremely Aggressive",
      "leverage": "Frequent 3x positions in TQQQ, TECL and UPRO. Its cumulative return over the full window is among the highest backtest figures in this library, and that number is the compounding of leverage across 14 years rather than a repeatable expectation.",
      "backtest_limits": "Bounded by UVXY, the record begins in late 2011. It covers the post-2011 secular bull market in technology, the 2020 COVID crash and recovery and the 2022 tech bear, and misses the 2008 financial crisis. Its risk-adjusted ratios are exceptional, and every figure here should be read with caution given how strongly leveraged funds compound over long periods.",
      "hedge": "PSQ, SH, SQQQ and UVXY are all reachable, plus GLD and BIL. That is an unusually broad defensive set for a strategy in this tier.",
      "concentration": "The last recorded holdings show the strategy fully allocated to TQQQ. A backtest that compounds a small initial stake into an implausible figure is one that spent its later years fully invested in a single leveraged fund, and that concentration is inherent in the result rather than incidental to it."
    },
    "author_note": "The symphony name in Composer is 'Sometimes TQQQ v2'. Authored by Guybogles (Discord: aly9923); last semantic update June 26, 2024. The backtest_days field ({backtest_days}) is estimated from the API's first_day and last_market_day fields, as the size field returned None for this symphony. The backtest begins approximately October 2011 when UVXY first became available. The author notes: 'Please feel free to change the 60d SPY RSI check as well as any VIX ticker to whatever you feel comfortable with.'"
  },
  {
    "slug": "triple-accelerator",
    "name": "Triple Accelerator",
    "symphony_url": "https://app.composer.trade/symphony/0jPwZ5Lm2Y3xH24oEijB/details",
    "symphony_id": "0jPwZ5Lm2Y3xH24oEijB",
    "annualized_rate_of_return": 0.7649041403503729,
    "max_drawdown": -0.6166825567353839,
    "cumulative_return": 4639.342178,
    "calmar_ratio": 1.2403531314387255,
    "sharpe_ratio": 1.3509440245162985,
    "standard_deviation": 0.5189422046377381,
    "min": -0.15039553781215198,
    "mean": 0.0027819915493042316,
    "median": 0.003302106042876396,
    "max": 0.5001155817697016,
    "trailing_one_month_return": 0.11151419564423493,
    "trailing_three_month_return": -0.1698636315630323,
    "trailing_one_year_return": 0.18899264947149952,
    "backtest_days": 3744,
    "description": "A three-asset rotation between TQQQ, SPY, and UVXY controlled by two nested gates: a top-level TQQQ RSI(10) overbought check that triggers a UVXY volatility hedge when RSI exceeds 79, and an SPY 200-day moving average gate that routes between TQQQ in the bull case and unleveraged SPY in the bear case.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "200d-ma",
      "vix-tiers"
    ],
    "last_updated": "2026-08-27",
    "ai_summary": [
      "Triple Accelerator is authored by Inverteum Capital as a minimal but purposeful rotation across three assets: TQQQ, SPY and UVXY. The backtest begins around October 2011, coinciding with UVXY's inception. Its Sharpe and Calmar reflect a strategy that earns strong returns by staying leveraged through bull markets while managing the two main failure modes of 3x leverage: overbought reversals and trend deterioration.",
      "The architecture is deliberately simple: a single TQQQ RSI(10) check runs first -- if RSI exceeds 79, the strategy rotates to UVXY as a volatility hedge against an overbought market. If not, an SPY 200-day moving average gate decides the allocation: TQQQ during confirmed uptrends, unleveraged SPY during downtrends. The result is a three-state machine with about 12.6 annual portfolio switches (annualized turnover). The roughly 56% win rate and right-skewed return distribution (skewness 1.14, max single-day gain of 50.0%) suggest a strategy that captures large upside days while the MA gate limits prolonged drawdown exposure."
    ],
    "how_it_works": [
      "Triple Accelerator uses a two-gate decision tree evaluated top-down. The first gate checks TQQQ's 10-day RSI: if it exceeds 79, the strategy allocates entirely to UVXY, a leveraged long VIX-futures ETF. This overbought hedge runs unconditionally before any trend analysis, which means the strategy can hold UVXY even in a nominal bull market when leveraged tech has become technically extreme. The intuition is that when TQQQ RSI(10) is above 79 the market has been rising hard, mean-reversion risk is elevated, and a volatility spike from a sudden reversal is the most likely near-term scenario -- UVXY profits from exactly that.",
      "If the RSI overbought condition is not active, the strategy falls through to the second gate: SPY's current price versus its 200-day simple moving average. Above the moving average (confirmed uptrend), the strategy allocates 100% to TQQQ for maximum leveraged upside in Nasdaq. Below the moving average (downtrend), it rotates to unleveraged SPY rather than going to cash or inverse ETFs, preserving equity exposure while eliminating 3x leverage risk during bear markets. The three resulting states -- UVXY at RSI extremes, TQQQ in bull trends, SPY in bear trends -- cover the full regime space with no overlapping conditions and no default-to-cash dead zones."
    ],
    "signals": [
      {
        "name": "TQQQ RSI(10) Overbought Gate",
        "tag": "rsi",
        "description": "Top-level check: if TQQQ's 10-day RSI exceeds 79, the strategy immediately rotates to UVXY. This gate fires before the SPY 200d MA gate, meaning the UVXY hedge can activate even in a bull market when leveraged tech is technically stretched."
      },
      {
        "name": "SPY 200d MA Bull/Bear Gate",
        "tag": "200d-ma",
        "description": "Secondary check (runs only when TQQQ RSI is not overbought): SPY current price vs. its 200-day moving average routes between TQQQ (above MA, confirmed uptrend) and SPY (below MA, downtrend capital preservation)."
      },
      {
        "name": "UVXY Overbought Hedge",
        "tag": "vix-tiers",
        "description": "UVXY (leveraged long VIX futures) is held exclusively when the TQQQ RSI(10) > 79 gate fires. Unlike strategies that hold UVXY in bear markets, Triple Accelerator deploys UVXY as a mean-reversion play targeting volatility spikes off technically overbought peaks."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "Holds 3x leveraged Nasdaq for the majority of bull-market time. That is the source of both its max drawdown and its annualised volatility, and its Sharpe and Calmar are solid without being exceptional.",
      "backtest_limits": "Bounded by UVXY, the record begins in late 2011 and misses the 2008 financial crisis. At the most recent data collection the strategy was fully allocated to TQQQ with a modest trailing one-year return and negative recent months, which reflects current pressure in technology rather than any change in the strategy.",
      "signal": "Three states and nothing between them. The simplicity is both a strength, minimal overfitting risk, and a constraint: there are no intermediate sub-regimes for choppy or recovering markets. Roughly 44 percent of trading days are negative, and the distribution is right-skewed, so large single-day gains are more frequent than large single-day losses.",
      "hedge": "UVXY is the only non-equity instrument in a three-ticker universe, and its roll decay limits it to short holds.",
      "concentration": "Three instruments. When invested, this is a single leveraged Nasdaq position."
    },
    "author_note": "Strategy authored by Inverteum Capital (blog.inverteum.com). The backtest begins approximately October 2011 coinciding with UVXY's inception date, covering roughly 14.8 years of market history including the 2015-2016 volatility spikes, the February 2018 VIX spike, the 2020 COVID crash and recovery, and the 2022 tech bear market. Last semantic update per Composer: 2026-07-29. Symphony ID: 0jPwZ5Lm2Y3xH24oEijB."
  },
  {
    "slug": "gold-miner-original",
    "name": "The Gold Miner (Original)",
    "symphony_url": "https://app.composer.trade/symphony/tlDwKY3NRXjYU61jCt0g/details",
    "symphony_id": "tlDwKY3NRXjYU61jCt0g",
    "annualized_rate_of_return": 7.095838234688193,
    "max_drawdown": -0.4763707867170872,
    "cumulative_return": 82440.772636,
    "calmar_ratio": 14.895620034950536,
    "sharpe_ratio": 2.7788614764146975,
    "standard_deviation": 0.9001847561406391,
    "min": -0.38598036362403143,
    "mean": 0.009926542621011827,
    "median": 0.0025275437687100055,
    "max": 0.2950107409831786,
    "trailing_one_month_return": 0.5104580642014227,
    "trailing_three_month_return": 1.0932467683468912,
    "trailing_one_year_return": 9.937426442994065,
    "backtest_days": 1363,
    "description": "A four-state rotation between GDXU (3x long gold miners), GDXD (3x inverse gold miners), and GLD (physical gold), using GDXU RSI(10) overbought and oversold gates as priority checks before routing through QQQ momentum and TLT vs. QQQ comparisons to pick the right miner or gold regime. This is the original Gold Miner algorithm by plaindamnscared with GLD replacing BIL as the defensive holding.",
    "tags": [
      "rsi",
      "momentum",
      "leveraged-etfs",
      "inverse-etfs",
      "original"
    ],
    "last_updated": "2026-08-28",
    "ai_summary": [
      "The Gold Miner (Original) is plaindamnscared's original Gold Miner algorithm with one change: BIL (cash) is replaced by GLD (physical gold) as the defensive holding. The backtest begins in March 2021, when GDXU and GDXD launched. Its exceptional Calmar reflects a period dominated by a powerful gold bull market, and the trailing one-year return shows how violently the gold miner sector has re-rated in 2025 and 2026.",
      "The architecture is a four-state machine built around GDXU's RSI. Two priority gates handle extremes: RSI(10) above 79 routes to GDXD (inverse miners, fade the overbought spike), RSI(10) below 30 routes to GDXU (leveraged miners, buy the dip). Between those extremes, two momentum comparisons determine whether to hold GDXU or GLD. The highest annualized standard deviation in this library and a high annual turnover reflect the leveraged 3x miner ETFs at the core; this is an aggressive sector strategy, not a diversified portfolio."
    ],
    "how_it_works": [
      "The strategy uses GDXU's own RSI as its primary signal, evaluating two extremes before consulting any broader market context. If GDXU's 10-day RSI exceeds 79, the strategy immediately rotates to GDXD (a 3x inverse gold miners ETF), treating the overbought reading as a mean-reversion signal. If GDXU's RSI drops below 30, it rotates into GDXU directly as an oversold dip-buy. These two gates fire unconditionally, bypassing all other checks.",
      "When RSI is between 30 and 79, the strategy uses two cumulative return comparisons to route between GDXU and GLD. The first checks whether QQQ's 90-day return exceeds its 70-day return, which signals that the equity trend has been building for a sustained period. If true, a second check compares GDXU's 70-day return against its 75-day return: if the shorter window is lagging (recent momentum fading), it holds GDXU expecting a continuation; if the shorter window is ahead (momentum strong), it rotates to GLD. If QQQ's 90-day return does not exceed its 70-day return, the strategy checks whether TLT's 95-day return is less than QQQ's 35-day return: if bonds are losing to short-term equity momentum, it holds GDXD; otherwise it holds GLD. The result is that GLD acts as a refuge during ambiguous momentum conditions rather than cash, keeping some exposure to gold's safe-haven demand even when the leveraged miner case is unclear."
    ],
    "signals": [
      {
        "name": "GDXU RSI(10) Overbought and Oversold Gates",
        "tag": "rsi",
        "description": "Top-level priority checks on GDXU's 10-day RSI. Above 79 routes immediately to GDXD (fade overbought miners). Below 30 routes immediately to GDXU (buy oversold miners). Both gates fire before any momentum comparisons."
      },
      {
        "name": "QQQ 90d vs. 70d Momentum Router",
        "tag": "momentum",
        "description": "When RSI is between extremes, compares QQQ's 90-day and 70-day cumulative returns to gauge trend duration. A stronger 90-day reading signals a sustained trend and routes to a GDXU vs. GLD sub-check; a weaker 90-day reading routes to a TLT vs. QQQ comparison."
      },
      {
        "name": "GDXU Window Momentum and TLT vs. QQQ Check",
        "tag": "momentum",
        "description": "Two second-level comparisons that finalize the GDXU/GLD/GDXD decision. In the sustained-trend path: GDXU 70d vs. 75d return picks between holding GDXU (lagging recent window) or GLD (leading recent window). In the weakening-trend path: TLT 95d vs. QQQ 35d picks between GDXD (bonds losing to equities) or GLD (bonds winning, flight to safety)."
      }
    ],
    "risk_profile": {
      "verdict": "Extremely Aggressive",
      "leverage": "GDXU and GDXD are 3x long and short gold miners. Its annualised standard deviation is the highest of any strategy in this library, which is what 3x leverage on gold miners produces.",
      "backtest_limits": "Roughly 5.4 years from March 2021, bounded by GDXU's own launch. The record includes the sharp 2022 gold-miner selloff, likely the source of its {max_drawdown_abs:0} max drawdown, but has no pre-2021 history and is dominated by the explosive 2024 to 2026 gold bull market, so the full drawdown profile over a complete commodity cycle is still limited. Its Calmar is exceptional by any measure and comes largely from that recent window.",
      "signal": "The strategy switches roughly every four trading days. Its win rate is only slightly above a coin flip, so the returns come from the shape of the distribution rather than from being right often: winning days are larger than losing days on average.",
      "hedge": "GDXD is the only defensive position and it is 3x inverse gold miners. The defensive state is a leveraged directional bet on the same underlying, so there is no ballast in this strategy at all.",
      "concentration": "Three instruments, all gold. Current holdings are entirely GDXU."
    },
    "author_note": "Originally created by plaindamnscared on Composer. This version is identical to the original except BIL (cash) has been replaced with GLD (physical gold) as the defensive holding. The backtest begins March 2021 coinciding with the GDXU and GDXD inception dates. Last semantic update per Composer: 2026-08-19. Symphony ID: tlDwKY3NRXjYU61jCt0g.",
    "tldr": {
      "thesis": "Gold miners at 3x leverage move far enough in both directions that mechanically rotating between the long leg, the short leg and unlevered gold can compound faster than the sector itself. The whole case rests on the switches being timed well enough to outrun the decay that eats both leveraged legs while it is being wrong.",
      "works_well_in": [
        "A sustained gold-miner trend in either direction. GDXU trend continuation is the single largest state, running 29.8% of days in a reconstruction of the logic over real prices.",
        "Sharp oversold flushes, where the RSI(10) gate below 30 buys the dip without waiting for any momentum confirmation.",
        "Periods when gold holds firm while miners chop. GLD absorbs the indecision, which is the one change this version makes to plaindamnscared's original: BIL became GLD, so the defensive state stays long gold instead of stepping aside into cash."
      ],
      "struggles_in": [
        "Whipsaw with no trend, which is the genuine worst case rather than a down market. Through 2026 to 21 August, GDXU fell 23.5% and GDXD fell 81.9%: both leveraged legs lost at the same time, and only GLD was up, at 6.3%.",
        "Down markets that are choppy rather than smooth. Across the 2022 hiking cycle GDXU lost 73.8% while GDXD, the inverse leg meant to profit from exactly that, gained only 1.4%.",
        "Post-event repricing, where the state flips after the move rather than before it. GDXU lost 41.7% in the 41 trading days after the November 2024 election.",
        "Any environment where the cost of switching matters. The logic changes asset roughly every 4.2 trading days, and GDXU and GDXD are not deeply liquid."
      ]
    },
    "assumptions": {
      "market": [
        "**Gold miners trend, and trends persist long enough to be caught mechanically.** Every branch of this logic is a momentum or mean-reversion bet on a sector that has spent long stretches doing neither.",
        "**Gold is a genuine refuge rather than a lower-beta version of the same trade.** Swapping BIL for GLD turned the defensive state into a directional long-gold position. It paid in 2026, when GLD rose 6.3% while both miner legs fell, and it is still a bet rather than a step aside.",
        "**The 2024 to 2026 gold re-rating is representative of the future.** This is the largest assumption on the page. The backtest is {backtest_days} trading days and contains one enormous sector bull market: GDXU rose 695.2% during 2025 alone. It contains no full commodity bear cycle, because GDXU did not exist before December 2020.",
        "**Equity and bond momentum say something useful about gold miners.** Two of the four routing decisions are made by QQQ and TLT, not by anything gold-related."
      ],
      "structural": [
        "**RSI(10) at 79 and 30 marks something real.** Worth weighing against how rarely it matters: in a reconstruction of the logic over real prices, the two RSI gates fired on 10.6% of days. The momentum branches made the other 89.4% of the decisions, so the strategy is named and described by a signal that runs about one day in ten.",
        "**A 70-day and a 75-day lookback are meaningfully different.** The sustained-trend branch turns on GDXU's 70-day return against its 75-day return, windows that differ by five trading days out of seventy. That comparison is load-bearing and there is nothing in the logic explaining why those two lengths rather than any other pair.",
        "**Daily rebalancing survives real spreads.** At roughly 60 portfolio changes a year in 3x leveraged notes, the gap between the modelled 0.05% slippage and what a real fill costs compounds faster here than on almost anything else in this library.",
        "**Path matters more than direction, because 3x notes reset daily.** Holding the correct directional view through a volatile week can still lose money. That is the mechanism behind both legs falling together in 2026.",
        "**GDXU and GDXD are exchange-traded notes, not funds.** They are senior unsecured debt of the issuing bank, with no basket of assets behind them, and the issuer can call or delist them. That risk sits underneath every state this strategy can occupy except GLD."
      ]
    },
    "regimes": [
      {
        "regime": "Sustained gold-miner bull",
        "expected": "Strong",
        "why": "The trend-continuation branch holds GDXU and 3x compounds with the move. This is the state the headline return was earned in.",
        "example": "2025 full year: GDXU +695.2%, GDXD -97.2%, GLD +61.5%."
      },
      {
        "regime": "Smooth miner downtrend",
        "expected": "Mixed to strong",
        "why": "GDXD pays, but only while the decline is orderly. A clean downtrend is the one case where the short leg earns its decay.",
        "example": "Apr to Sep 2021: GDXU -64.2% while GDXD gained 104.9%."
      },
      {
        "regime": "Hiking cycle and dollar surge",
        "expected": "Poor",
        "why": "Miners fall, but choppily, so the inverse leg decays almost as fast as it gains. Being directionally right is not enough.",
        "example": "Jan to Oct 2022: GDXU -73.8%, and GDXD gained only 1.4% across the same span."
      },
      {
        "regime": "Whipsaw with no trend",
        "expected": "Poor. The worst case.",
        "why": "Both leveraged legs decay at once and every switch pays a spread. There is no state the logic can rotate into that helps, except gold.",
        "example": "Jan to 21 Aug 2026: GDXU -23.5% and GDXD -81.9% together, GLD +6.3%."
      },
      {
        "regime": "Rangebound chop, gold firm",
        "expected": "Mixed",
        "why": "The GLD state absorbs the indecision. This is the regime the BIL-to-GLD swap was made for, and the one where it most clearly beats holding cash.",
        "example": "Jun to Oct 2023: GDXU -45.0% while GLD finished flat at +0.2%."
      },
      {
        "regime": "Post-event repricing",
        "expected": "Poor",
        "why": "A gap repricing happens faster than a 10-day RSI or a 70-day return can register it, so the state flips after the damage.",
        "example": "Nov to Dec 2024, after the US election: GDXU -41.7% in 41 trading days."
      }
    ],
    "regime_note": "**The example column is what the holdings did, not what the strategy returned.** Each figure is the move in that ticker between the first and last trading day of the window, computed from the daily closes in `data/prices.json`. The regimes themselves were identified by reconstructing this strategy's state machine over those same prices, which is a reading of the logic rather than a backtest: it carries no fees and no slippage. It reproduces the pipeline's own turnover figure independently, changing asset every 4.2 trading days against the 60.7 annual rebalances Composer reports, which is the reason it is trusted this far and no further."
  },
  {
    "slug": "safe-sectors-or-bonds-original",
    "name": "Safe Sectors or Bonds (Original)",
    "symphony_url": "https://app.composer.trade/symphony/DtlEo2Y1DWR7hngZkxTB/details",
    "symphony_id": "DtlEo2Y1DWR7hngZkxTB",
    "annualized_rate_of_return": 0.20835954238568655,
    "max_drawdown": -0.40950833292998523,
    "cumulative_return": 170.257053,
    "calmar_ratio": 0.508804157646556,
    "sharpe_ratio": 1.2541166736243374,
    "standard_deviation": 0.16128905889179168,
    "min": -0.12194940044222924,
    "mean": 0.0008026797540848161,
    "median": 0.0006778468904375945,
    "max": 0.23476380533469565,
    "trailing_one_month_return": 0.006347372328380452,
    "trailing_three_month_return": 0.03744582355415571,
    "trailing_one_year_return": 0.023942974136176076,
    "backtest_days": 6847,
    "description": "The original, 1999-start version of the most-copied defensive template on Composer. Each day it holds whichever single fund has the lowest 10-day RSI from a basket of seven safe havens: consumer staples (XLP) plus a set of bond and municipal income funds (BKT, VBF, NAN, MMU, PMM, EVN). There is no leverage and no growth equity, just a daily rotation into the most beaten-down defensive asset on the theory that it is the one most likely to bounce.",
    "tags": [
      "rsi",
      "mean-reversion",
      "original"
    ],
    "last_updated": "2026-08-31",
    "ai_summary": [
      "Safe Sectors or Bonds is a pure defensive mean-reversion rotator, and this entry is its earliest 1999-start form, the seed that dozens of later Composer variants were forked from. The entire strategy is a single selection step: rank seven safe-haven funds by their 10-day RSI and hold the one that is most oversold, rebalanced daily. The pool mixes consumer staples (XLP) with income and municipal bond funds (BKT, VBF, NAN, MMU, PMM, EVN), so the strategy is always parked in something defensive and simply rotates toward whichever one the market has pushed down hardest. There is no leverage, no equity beta beyond staples, and no directional market call.",
      "Its numbers are modest by design and that is the point. Over its full history back to 1999, one of the longest backtests in this library at about 27 years, it compounds at about {annualized_rate_of_return} annualized with a {max_drawdown_abs} max drawdown and the lowest volatility in the library at {standard_deviation}, a {sharpe_ratio} Sharpe and a {calmar_ratio} Calmar. The long window is its real strength: it has lived through the dot-com crash, 2008, 2020, and the 2022 rate shock rather than a single favorable stretch. The main caveat is that a basket of closed-end bond and municipal funds carries interest-rate and liquidity risk of its own, so the safe in the name means low equity beta, not the absence of drawdown."
    ],
    "how_it_works": [
      "The strategy is a single selection rule applied every trading day. It computes the 10-day RSI of all seven candidate funds and allocates 100% to the one with the lowest reading. Because RSI falls as an asset sells off, the lowest RSI is the most recently beaten-down fund, so the rule is a systematic bet that the most oversold defensive holding is the one most likely to mean-revert upward next.",
      "The candidate pool is deliberately defensive. XLP (consumer staples) is the only equity sleeve, and it is one of the lowest-volatility sectors. The other six holdings are income and municipal bond funds (BKT, VBF, NAN, MMU, PMM, EVN), which behave more like rate-sensitive credit than like the stock market. Rotating among them keeps the portfolio in low-beta assets at all times while still expressing a short-horizon reversion view about which one to own.",
      "There is no trend gate, no leverage, and no offensive branch. The strategy never holds growth equities or 3x ETFs, which is why its return is modest and its drawdown shallow relative to almost everything else in this library. The (29,32,1999) in the source symphony name refers to its parameters and the 1999 backtest start; this page documents that original long-history configuration."
    ],
    "signals": [
      {
        "name": "Lowest RSI(10) Defensive Selection",
        "tag": "rsi",
        "description": "Ranks all seven candidate funds by 10-day RSI each day and holds the single lowest one. RSI is used as a relative beaten-down gauge rather than an absolute threshold, so the portfolio always rotates toward the most oversold defensive asset."
      },
      {
        "name": "Staples vs. Bond/Muni Rotation",
        "tag": "mean-reversion",
        "description": "The candidate pool pairs consumer staples (XLP) with six income and municipal bond funds (BKT, VBF, NAN, MMU, PMM, EVN). Rotating among low-beta assets expresses a short-horizon mean-reversion view while keeping the strategy defensive at all times."
      }
    ],
    "risk_profile": {
      "verdict": "Conservative",
      "leverage": "None. The strategy holds a single unleveraged fund at a time, either consumer staples or an income/municipal bond fund. This is the source of its low {standard_deviation} volatility, the lowest in this library.",
      "backtest_limits": "Runs from 1999, one of the longest records here at about 27 years, spanning the dot-com crash, 2008, 2020, and the 2022 rate shock. Its modest Calmar of {calmar_ratio} reflects that steady, low-return profile rather than a period-specific fluke.",
      "signal": "A single daily RSI(10) ranking with no confirmation. The portfolio can rotate frequently between similar defensive funds, and the edge rests entirely on short-horizon mean reversion within a low-beta universe.",
      "concentration": "One fund at a time out of seven. Six of the seven are interest-rate-sensitive bond or municipal funds, so despite the diversified-looking pool the dominant risk is duration and credit, not equities.",
      "suitability": "Fits a capital-preservation sleeve or a low-volatility complement to an aggressive strategy, not a primary growth engine."
    },
    "author_note": "This is the original long-history version of the widely forked Safe Sectors or Bonds template (source symphony name 'Safe Sectors or Bonds (29,32,1999)'), whose 1999 start makes it the longest backtest in this library. It is featured as the original because dozens of later Composer symphonies rebuild the same lowest-RSI defensive rotation on shorter windows. Symphony ID: DtlEo2Y1DWR7hngZkxTB."
  },
  {
    "slug": "tqqq-or-not-original",
    "name": "TQQQ or Not (Original)",
    "symphony_url": "https://app.composer.trade/symphony/g0J87gnk7SausotpUoCt/details",
    "symphony_id": "g0J87gnk7SausotpUoCt",
    "annualized_rate_of_return": 1.0940524548166968,
    "max_drawdown": -0.2968577865288211,
    "cumulative_return": 46456.642523,
    "calmar_ratio": 3.6854430116505577,
    "sharpe_ratio": 2.0503246318860007,
    "standard_deviation": 0.39652943095611587,
    "min": -0.19604640713169263,
    "mean": 0.0032262462680835856,
    "median": 0.000109058198644707,
    "max": 0.5001159290636095,
    "trailing_one_month_return": -0.015908599793851397,
    "trailing_three_month_return": 0.004600794945233799,
    "trailing_one_year_return": 0.3619127331151948,
    "backtest_days": 3663,
    "description": "One of Composer's most-forked leveraged strategies (source name 'TQQQ or not/Pop'). A fast TQQQ RSI(10) above 79 puts the whole book in UVXY as an overbought fade; otherwise the portfolio is a 50/50 blend of two sleeves that run at once. One sleeve holds TQQQ (3x Nasdaq 100) unless a six-day crash or a bond-versus-equity regime read pushes it to cash, and the other is a 'Pop' ensemble of tiered RSI bots on QQQ, SMH and SPY that buy leveraged tech and semis (TQQQ, SPXL, SOXL) when oversold, short them (SQQQ, SOXS) or buy UVXY when overbought, and sit in cash (BIL) otherwise.",
    "tags": [
      "rsi",
      "momentum",
      "mean-reversion",
      "leveraged-etfs",
      "inverse-etfs",
      "vix-tiers",
      "original"
    ],
    "last_updated": "2026-08-31",
    "ai_summary": [
      "TQQQ or Not is the seed of a large family of hold-3x-Nasdaq-but-only-when-conditions-allow strategies, and this is its original long-history build (source name 'TQQQ or not/Pop'). It is not a single default-plus-overrides rule but a small ensemble. One gate sits on top: a fast TQQQ RSI(10) above 79 is read as overbought and puts the whole book in UVXY. Below that gate the portfolio splits 50/50 into two sleeves that run at the same time. The first, 'BlackSwan MeanRev BondSignal', holds TQQQ in a normal market but steps to cash or a volatility pop when a six-day TQQQ crash beyond -12%, a QQQ or TMF drawdown, or a bond-versus-equity regime read says conditions are hostile. The second, 'Pop', is a set of RSI pop-bots across QQQ, SMH and SPY that go long leveraged funds when they are oversold, short them or buy UVXY when overbought, and hold cash otherwise, with a VIXM volatility read switching between a defensive tiered version and a more aggressive one.",
      "Over a long, multi-cycle backtest that begins around 2011 it compounds at about {annualized_rate_of_return:0} annualized with a {max_drawdown_abs} max drawdown, a {sharpe_ratio} Sharpe and a {calmar_ratio} Calmar. That drawdown is notably shallow for a strategy whose upside comes from 3x ETFs, which is the whole appeal of being in TQQQ sometimes rather than always: the overbought fade and the crash and pop gates take it out of the way of the worst leveraged declines. The trade-off is complexity. Many interacting RSI, cumulative-return and cross-asset thresholds fit the historical record more tightly than a single rule would, so some of the backtest polish should be read as parameter tuning rather than durable edge."
    ],
    "how_it_works": [
      "The held universe is small: TQQQ, SPXL and SOXL (leveraged long tech, S&P and semis), SQQQ and SOXS (leveraged inverse), UVXY (volatility) and BIL (cash). One gate sits above everything: if TQQQ's 10-day RSI is above 79, the entire portfolio holds UVXY, treating a fast overbought reading as a pullback setup. When that gate is not triggered, the book is an equal-weight 50/50 blend of two sleeves that are evaluated independently, so on a typical day it can hold a mix such as half TQQQ and half cash. BND, SPY, IEF, TLT, QQQ, SMH, VIXM and TMF are used only as signals, never held.",
      "The first sleeve, 'BlackSwan MeanRev BondSignal', holds TQQQ unless something is wrong. If TQQQ's six-day cumulative return is below -12% it looks for a violent one-day rebound above 5.5% to capture in UVXY, and otherwise runs a small mean-reversion check that keeps TQQQ while it is deeply oversold (RSI(10) below 32) or while TMF's 10-day drawdown is contained, dropping to cash (BIL) if not. In a normal market it holds TQQQ only when QQQ is above its 25-day average and neither QQQ nor TMF is in a drawdown; when QQQ is below that average it defers to a bond-versus-equity regime read (a 60-day SPY RSI, BND versus SPY RSI, and IEF versus TLT RSI) that keeps TQQQ only if bonds are not clearly leading, and sits in cash otherwise.",
      "The second sleeve, 'Pop', is a set of RSI 'pop-bots'. A VIXM 10-day RSI above 70 switches it into a defensive '321 Pop' blend that runs three RSI tiers (10, 20 and 30-day) on both QQQ and SMH, going short (SQQQ or SOXS) when a tier is overbought, long leverage (TQQQ or SOXL) when it is oversold, and cash otherwise. Below that VIXM level it runs 'Pop Bot' and 'Double Popped' groups on TQQQ, SPXL, SOXL and SPY that fade overbought readings into UVXY, dip-buy oversold leverage, and confirm longs against the same 60-day SPY RSI and bond-versus-equity checks before holding TQQQ or falling back to cash. Because both sleeves and the 321 tiers are blended, the strategy frequently holds several positions at once rather than a single name."
    ],
    "signals": [
      {
        "name": "TQQQ RSI(10) Overbought Fade",
        "tag": "rsi",
        "description": "The primary override: TQQQ RSI(10) above 79 rotates out of leveraged tech into UVXY, treating a fast overbought reading as a pullback setup rather than trend continuation."
      },
      {
        "name": "Six-Day Crash and One-Day Pop Check",
        "tag": "mean-reversion",
        "description": "In the first sleeve, when TQQQ's six-day cumulative return falls below -12% a pop branch captures a sharp one-day rebound (single-day gain above 5.5%) in UVXY, otherwise a small mean-reversion check holds TQQQ while it is very oversold or TMF's drawdown is contained, and drops to cash (BIL) if not."
      },
      {
        "name": "Cross-Asset Bond vs. Equity Regime Filter",
        "tag": "momentum",
        "description": "Both sleeves defer to relative RSI comparisons (BND vs SPY, IEF vs TLT) plus a 60-day SPY RSI trend to judge whether bonds or equities lead, keeping each sleeve in TQQQ only when bonds are not clearly leading and sitting in cash (BIL) otherwise."
      },
      {
        "name": "VIXM Volatility Gate and Pop-Bot Tiers",
        "tag": "vix-tiers",
        "description": "A VIXM 10-day RSI above 70 switches the second sleeve into a defensive tiered '321 Pop' version, running 10, 20 and 30-day RSI tiers on QQQ and SMH that short (SQQQ, SOXS) when overbought and buy leverage (TQQQ, SOXL) when oversold; separately, 10-day max-drawdown reads on QQQ and TMF push the first sleeve to cash."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "Upside comes from 3x ETFs (TQQQ, SPXL, SOXL) and it can hold inverse 3x funds (SQQQ, SOXS). The overbought fade and crash gates limit time spent in leverage during declines, which is why the max drawdown is moderate for this asset class.",
      "backtest_limits": "A genuinely long, multi-cycle window that begins around 2011 and covers 2018, 2020 and 2022. The {max_drawdown_abs} max drawdown and {calmar_ratio} Calmar are strong for a leveraged strategy, but the many tuned thresholds mean out-of-sample results may be softer than the backtest.",
      "signal": "A deep, nested decision tree with dozens of RSI, cumulative-return and cross-asset thresholds. This is powerful but hard to audit, and its behavior in a novel regime is less predictable than a single-rule trend filter.",
      "concentration": "Below the top overbought gate the book is a 50/50 blend of two sleeves, and the defensive Pop tier splits across six slots, so it often holds several positions at once rather than one name. That said, in its aggressive states both sleeves can land in leveraged tech at the same time, concentrating risk heavily.",
      "hedge": "UVXY and the inverse ETFs are the defensive states, both directional volatility or short bets rather than ballast, so the defense is itself a leveraged position."
    },
    "author_note": "Featured as the original of the widely forked TQQQ or Not family (source symphony name 'TQQQ or not/Pop'). Dozens of later Composer symphonies rebuild the same 'default to TQQQ, override on overbought, crash and regime signals' pattern. Symphony ID: g0J87gnk7SausotpUoCt."
  },
  {
    "slug": "beta-ballers-original",
    "name": "Beta Ballers (Original)",
    "symphony_url": "https://app.composer.trade/symphony/mlgAKFuUIPZiCT0aV7ho/details",
    "symphony_id": "mlgAKFuUIPZiCT0aV7ho",
    "annualized_rate_of_return": 7.210136099135575,
    "max_drawdown": -0.7829014184855573,
    "cumulative_return": 1485472.491397,
    "calmar_ratio": 9.209507006747856,
    "sharpe_ratio": 2.686215897882829,
    "standard_deviation": 0.9396954908716071,
    "min": -0.23488168415429633,
    "mean": 0.010016765741063968,
    "median": 0.0034318219595957933,
    "max": 0.5815548709117735,
    "trailing_one_month_return": -0.051810000860430194,
    "trailing_three_month_return": 1.0494434219958468,
    "trailing_one_year_return": -0.42328200617982903,
    "backtest_days": 1700,
    "description": "The original Beta Baller + TCCC build, one of the most-forked names in the Composer community, with roughly 200 symphonies in the database sharing the Beta Baller name. It is a large, daily-rebalanced regime-switching machine trading a 33-instrument universe of leveraged, inverse, bond, commodity, currency and volatility ETFs, leaning more on buy-the-dip mean reversion in leveraged funds than on momentum, with layered trend, interest-rate and volatility gates that pull it toward defense when conditions turn. Best treated as a showcase of how far community regime-switching can be pushed, not a set-and-forget allocation.",
    "tags": [
      "rsi",
      "momentum",
      "mean-reversion",
      "leveraged-etfs",
      "inverse-etfs",
      "vix-tiers",
      "original"
    ],
    "last_updated": "2026-08-31",
    "ai_summary": [
      "Strip away the complexity and Beta Ballers is mostly a buy-the-dip bet on leveraged funds: when a high-beta ETF sells off, it tends to buy the weakest recent performer expecting a bounce, and it wraps that core idea in layers of trend, interest-rate and volatility gates that pull it into inverse funds, bonds, commodities or volatility when conditions turn hostile. Despite the aggressive name it is more mean-reversion than momentum, with more of its selection steps picking the weakest recent performer than the strongest. That same density of branches and hand-tuned thresholds is the catch, making it powerful in the conditions it was shaped around but genuinely hard to reason about, and impossible to treat as a simple black box.",
      "The headline numbers are extraordinary, and they deserve equal skepticism. Since its December 2019 backtest start it shows about {annualized_rate_of_return:0} annualized against a {max_drawdown_abs} max drawdown, a {sharpe_ratio} Sharpe and a {calmar_ratio} Calmar. Three cautions dominate. The drawdown is brutal, meaning you would have had to sit through losing more than three-quarters of the account at the worst point; the backtest window opens right before the 2020 to 2021 leveraged bull run and leans heavily on it, while the trailing one-year return here is negative; and the sheer number of tuned branches makes overfitting a genuine risk rather than a footnote. Treat it as the seed concept behind a large family and a study in aggressive design, not a recommendation to deploy capital as it stands."
    ],
    "how_it_works": [
      "Beta Ballers rebalances daily across a 33-instrument held universe: leveraged long equity (TQQQ, UPRO, SPXL, SOXL, TECL, QLD, MVV, USD, CURE), unleveraged sector and international equity (PUI, EEM, EFA, EPI, EWZ), inverse equity (SQQQ, SPXS, SPXU, SOXS, TECS), volatility (UVXY, VIXY), treasuries and cash (TMF, TMV, AGG, SHY, BIL), commodities and energy (UCO, ERX, DBC, GLD) and currencies (UUP, EUO, YCS). TLT, IEF, HIBL and SPY appear only as signals, never held. The single top-level switch compares the 7-day RSI of BIL against IEF; the branch where BIL is relatively stronger is tiny (buy volatility if SPY is overbought, otherwise hold SOXL), and almost the entire tree lives in the other branch.",
      "That main branch runs a cascade of gates. It first checks the S&P for stress: a 6-day SPY RSI below 27 is treated as extreme oversold (going long leveraged, or short via SOXS/SQQQ depending on a SHY-versus-HIBL RSI check), and a 10-day SPY RSI below 30 triggers a dip-buy that takes the worst 5-day performer from a leveraged basket. Failing those, it reads volatility through UVXY's 10-day RSI, holding UVXY outright between the 74 and 84 tiers and dropping into a large 'bear market / high inflation' sub-tree above 84 and, in the normal case, below 74. That sub-tree is driven by interest rates: TLT relative to its 200-day average and the sign of TLT's 20-day return split it into rising-rate baskets (favoring TMV) and falling-rate baskets (favoring TMF), and inside each, a 210-day EMA versus 360-day SMA of SPY plus a SPY-versus-DBC trend comparison route between offensive leveraged baskets and defensive ones.",
      "Positions are chosen by 74 filter steps that rank a small pool over 5 to 22-day windows of moving-average return, cumulative return or RSI and take a single name. Most of them, 46 of 74, select the bottom of the pool (the weakest recent performer), so the engine is more contrarian dip-buying than trend-chasing, with 28 momentum-style top picks alongside. Tactical overlays recur throughout the tree: a TQQQ 11-day RSI above 77 flips to UVXY as an overbought fade (8 times), a TQQQ 10-day RSI below 30 forces a dip-buy, a 6-day TQQQ crash beyond -10% paired with a one-day pop above 5.5% buys UVXY, a 2-day SPY drop of -2% and an SPXU-6-day-versus-UPRO-3-day comparison flag crashes, and 'Defense | Modified' groups compare the 20-day standard deviation of DBC against SPY to decide when to sit in bonds, gold, cash-like SHY and BIL, or inverse funds."
    ],
    "signals": [
      {
        "name": "BIL vs. IEF RSI Switch",
        "tag": "rsi",
        "description": "A 7-day RSI comparison of BIL (cash) against IEF (treasuries) is both the top-level switch and the single most-repeated condition in the tree (15 uses). At the top it gates a tiny branch; deeper in the tree it is the recurring offense-versus-defense toggle that picks between leveraged and defensive baskets."
      },
      {
        "name": "TLT Interest-Rate Regime",
        "tag": "200d-ma",
        "description": "The large sub-tree that holds most of the logic is driven by rates: TLT against its 200-day moving average, and the sign of TLT's 20-day return, split it into rising-rate baskets (favoring 3x short treasuries, TMV) and falling-rate baskets (favoring 3x long treasuries, TMF)."
      },
      {
        "name": "Mean-Reversion and Momentum Rotations",
        "tag": "mean-reversion",
        "description": "74 filter steps rank small pools by 5 to 22-day moving-average return, cumulative return or RSI and take a single name. 46 of the 74 pick the weakest performer (buy-the-dip mean reversion) and 28 pick the strongest (momentum), so the engine leans contrarian rather than trend-chasing."
      },
      {
        "name": "TQQQ Overbought/Crash Gates and UVXY Tiers",
        "tag": "vix-tiers",
        "description": "Tactical overlays layered across the tree: TQQQ RSI(11) above 77 flips to UVXY (8 uses) and RSI(10) below 30 forces a dip-buy, a six-day TQQQ crash beyond -10% with a one-day pop above 5.5% buys UVXY, and UVXY's own 10-day RSI tiers at 74 and 84 gate volatility exposure."
      }
    ],
    "risk_profile": {
      "verdict": "Extremely Aggressive",
      "leverage": "The offensive baskets are built largely from leveraged ETFs, mostly 3x (TQQQ, UPRO, SPXL, SOXL, TECL, TMF, TMV) with some 2x (QLD, MVV, USD, UCO, ERX, EUO, YCS), and even the defensive rotations often land in leveraged inverse or 3x-bond instruments. That is what produces both the {annualized_rate_of_return:0} annualized figure and the roughly {max_drawdown_abs:0} max drawdown.",
      "backtest_limits": "The record begins in December 2019, so it is dominated by the 2020 to 2021 leveraged bull market and does not include a full pre-2020 cycle. The trailing one-year return in this refresh is negative, a reminder that the headline annualized number is period-driven.",
      "signal": "A very large, deeply nested tree with dozens of branches and tuned thresholds. This flexibility is its strength in-sample and its overfitting risk out-of-sample; behavior in a genuinely new regime is hard to predict.",
      "concentration": "Despite touching 30-plus tickers, the strategy holds only one or a few sleeves at a time via its bottom-1 and top-1 selection steps, so daily concentration is high.",
      "hedge": "Defensive states include 3x inverse ETFs, TMF, GLD, AGG, SHY and BIL, a genuine mix, but the inverse and 3x-bond options are directional leveraged bets rather than pure ballast."
    },
    "author_note": "The original Beta Baller + TCCC collaborative build (source symphony version V3.0.2, backtest dated 1 December 2019), featured as the original of roughly 200 forked variants that share the Beta Baller name. The source symphony credits a group of community authors (Deez, BrianE, HinnomTX, DereckN, Garen, DJKeyhole, comrade). Its marketing name advertises a much higher no-fee return; the metrics shown here are Composer's standard backtest with slippage and fees applied. Symphony ID: mlgAKFuUIPZiCT0aV7ho."
  },
  {
    "slug": "rains-unified-best-signals",
    "name": "Rain's Unified Best Signals (Original)",
    "symphony_url": "https://app.composer.trade/symphony/sEUgeRfSayPbBh8mJxSy/details",
    "symphony_id": "sEUgeRfSayPbBh8mJxSy",
    "annualized_rate_of_return": 4.608541051460858,
    "max_drawdown": -0.21892657661206716,
    "cumulative_return": 17880.241288999998,
    "calmar_ratio": 21.05062401641207,
    "sharpe_ratio": 3.2593443773850104,
    "standard_deviation": 0.5795596002717976,
    "min": -0.11723769210072243,
    "mean": 0.007495969541688048,
    "median": 0.00309751011178927,
    "max": 0.5462990358105186,
    "trailing_one_month_return": 0.1863580020709117,
    "trailing_three_month_return": 0.14570274906845482,
    "trailing_one_year_return": 1.116624742283404,
    "backtest_days": 1430,
    "description": "A grand unified ensemble by Rain that blends the 'best signals' of several well-known Composer strategies, TQQQ For The Long Term, The Holy Grail, KMLM Fund Surfing, Garen Phillips' Buy the Dips, and a Safe Sectors defensive rotation, into a single always-hedged system. An aggressive leveraged-Nasdaq frontrunner sits on top, rotating into volatility hedges when the market overheats and catching oversold dips, before handing off to the unified core. It is built for investors who want broad, leveraged tech exposure diversified across many independent, community-tested signals rather than any single rule.",
    "tags": [
      "rsi",
      "momentum",
      "leveraged-etfs",
      "inverse-etfs",
      "200d-ma",
      "managed-futures",
      "vix-tiers",
      "mean-reversion",
      "original"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "Stripped to its essence, Rain's Unified Best Signals is a diversified, permanently-hedged bet on leveraged US tech that refuses to lean on any one signal. It stacks a large number of independent community strategies, TQQQ For The Long Term, The Holy Grail, KMLM Fund Surfing, Garen Phillips' dip-buyer, and a Safe Sectors bond rotation, and equal-weights them so that trend, momentum, mean-reversion, and managed-futures signals all vote at once. A VIX 'frontrunner' layer sits in front, stepping into UVXY or VIXY the moment several indices reach overbought RSI extremes, and a defensive 'Safe Sectors or Bonds' rotation absorbs capital whenever the leveraged sleeves stand down. The idea is that blending many proven signals smooths the ride and keeps the drawdown far shallower than any single leveraged strategy would.",
      "The backtested numbers are extraordinary and unusually well-balanced: {annualized_rate_of_return:0} annualized with a {sharpe_ratio} Sharpe and a {calmar_ratio} Calmar, against a {max_drawdown_abs:0} max drawdown that is remarkably shallow for {standard_deviation:0} volatility and heavy 3x exposure. Three cautions matter. First, the backtest is short, roughly 5.7 years, and only went out-of-sample in November 2025, so almost the entire record is an in-sample fit spanning the 2022 bear and the 2023 to 2025 AI bull, a stretch unusually kind to hedged dip-buyers. Second, the sheer complexity, dozens of stacked, individually-tuned thresholds, carries real overfitting risk: an ensemble this large can fit its own window more tightly than it generalizes. Third, it is still a leveraged system, so the shallow historical drawdown should be read as a property of a favourable, mostly in-sample window rather than a guarantee. Best understood as an ambitious attempt to diversify signal risk within leveraged tech, whose spectacular ratios deserve heavier discounting than a long, out-of-sample record would."
    ],
    "how_it_works": [
      "Rain's Unified Best Signals is organized as an 'Aggressive Leveraged VIX/Long Frontrunner' wrapped around a large unified core. The frontrunner runs first as a ladder of overbought checks: if SPY RSI(10) exceeds 80, TECL exceeds 79, XLP exceeds 77.5, QQQ exceeds 79, or QQQE exceeds 79, the strategy steps into a volatility hedge, UVXY at the most extreme readings and VIXY at the milder ones. If nothing is overbought, it checks for a deep oversold dip: when TQQQ RSI(10) is below 31 it buys SOXL if SMH RSI(10) is below 23, TECL if QQQ RSI(10) is below 27, and otherwise routes through a 'Check With Bonds' gate that compares AGG against SH to pick either the defensive 'Safe Sectors or Bonds' basket or TECL. Only when neither the overbought ladder nor the oversold dip fires does the frontrunner hand off to the unified core.",
      "The core, named in the symphony as 'Rain's Unified Signals: TQQQ FTLT, Holy Grail & KMLM,' is an equal-weight blend of two parallel sub-strategies: one gated on SPY's 200-day moving average and one on TQQQ's 200-day moving average. Each runs the same modules. A 'Bull Cross' (price above the 200-day MA while the 3-day average is still below it, a fresh crossover) selects the top 2 by RSI(10) from {TQQQ, TECL, SPXL, TMF}; a 'Bear Cross' selects the top 2 from {SQQQ, TECS, SPXU, TMF, TMV}. In an established uptrend above the 200-day MA, the core stacks several named community modules, 'SPY on Bonds' (20-day AGG RSI vs 60-day SH RSI, plus an HYG-vs-SPY check), 'SPY on Staples' (20-day XLP RSI vs 20-day SH RSI), Garen Phillips' 'Buy the Dips' (QQQ 5-day return below -6%), and 'KMLM Fund Surfing', each of which either commits to TQQQ-led leveraged sleeves or steps aside to the defensive basket.",
      "'KMLM Fund Surfing' is the recurring regime switch: when XLK's 10-day RSI is above KMLM's (tech momentum beating managed futures), the module holds a TQQQ-heavy sleeve blended with TECL and SOXL; when KMLM leads, it rotates to the defensive basket or shorts through SQQQ and a {SQQQ, TECS, SOXS} sleeve. Below the 200-day moving average, each sub-strategy drops into 20-day SMA blocks on QQQ and TQQQ that use 10-day IEF vs 20-day PSQ RSI and a TQQQ 10-day return above 15% blow-off check to choose between TQQQ, SQQQ, and defense, with a deep-bear branch (QQQ 60-day return below -12%) comparing 15-day AGG RSI against TQQQ and QQQ. The defensive leaf throughout is 'Safe Sectors or Bonds,' a filter that buys the single lowest-RSI(10) name from {BSV, TLT, LQD, VBF, XLP, UGE, XLV, XLU}, a mean-reversion rotation across bonds and low-volatility sectors; its most recent selection, utilities (XLU), made up the bulk of the portfolio alongside a TQQQ sleeve."
    ],
    "signals": [
      {
        "name": "KMLM Fund Surfing (XLK vs KMLM RSI)",
        "tag": "managed-futures",
        "description": "The core regime switch, reused across the ensemble: XLK RSI(10) > KMLM RSI(10) (tech momentum beating managed futures) commits to a TQQQ-led leveraged sleeve with TECL and SOXL. When KMLM leads, the module rotates to the defensive basket or shorts via SQQQ and a {SQQQ, TECS, SOXS} sleeve."
      },
      {
        "name": "VIX Overbought Frontrunner",
        "tag": "vix-tiers",
        "description": "A ladder of RSI(10) ceilings across SPY (>80), TECL (>79), XLP (>77.5), QQQ (>79) and QQQE (>79). Any breach steps the whole portfolio into UVXY at the most extreme readings or VIXY at milder ones, front-running froth before the core logic runs."
      },
      {
        "name": "Dual 200-Day MA Regime (SPY + TQQQ)",
        "tag": "200d-ma",
        "description": "The unified core equal-weights two sub-strategies, one gated on SPY's 200-day MA and one on TQQQ's 200-day MA, each with fresh-crossover Bull Cross and Bear Cross momentum baskets. Running both references diversifies the trend signal across the broad market and leveraged Nasdaq."
      },
      {
        "name": "Safe Sectors or Bonds Rotation",
        "tag": "mean-reversion",
        "description": "The recurring defensive leaf: a filter that buys the single lowest-RSI(10) name from {BSV, TLT, LQD, VBF, XLP, UGE, XLV, XLU}. A mean-reversion rotation across bonds and low-volatility sectors that absorbs capital whenever the leveraged sleeves stand down; utilities (XLU) was its most recent pick."
      },
      {
        "name": "Bond and Staples Momentum Gates",
        "tag": "momentum",
        "description": "Relative-strength gates decide whether the leveraged sleeves engage: 20-day AGG vs 60-day SH, 10-day IEF vs 20-day PSQ, 20-day XLP vs 20-day SH, 15-day AGG vs TQQQ/QQQ, and HYG vs SPY. Strong bond or staples momentum routes to defense; weak bond momentum clears the way for TQQQ-led sleeves."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "The risk-on sleeves are 3x leveraged funds, TQQQ, TECL, SPXL and SOXL, with SQQQ, TECS, SPXU and SOXS on the short side and TMF/TMV on leveraged Treasuries. Even so, its max drawdown is one of the shallowest among the leveraged strategies here, a consequence of the ensemble's constant hedging rather than of low exposure.",
      "backtest_limits": "The record is short, roughly 5.7 years, and only went out-of-sample on 8 November 2025, so nearly the entire backtest is an in-sample fit. It spans the 2022 bear and the 2023 to 2025 AI bull, a window unusually favourable to hedged, dip-buying leveraged strategies, and does not reach the 2008 or 2020 crashes. The exceptional Calmar and Sharpe should be read against that short, mostly in-sample window.",
      "signal": "This is among the most complex trees in the library: an overbought VIX frontrunner over a two-way 200-day-MA core that itself stacks TQQQ FTLT, Holy Grail, KMLM Fund Surfing, Garen Phillips' dip-buyer and a Safe Sectors rotation. Diversifying across many signals is the whole thesis, but dozens of individually-tuned thresholds also make the strategy hard to audit by hand and raise the odds that some of its edge is fitted to the test window.",
      "hedge": "Defensive states are plentiful: UVXY and VIXY volatility hedges, SQQQ/TECS/SPXU/SOXS inverse sleeves, TMF/TMV on Treasuries, and the 'Safe Sectors or Bonds' rotation across BSV, TLT, LQD, VBF, XLP, UGE, XLV and XLU. The inverse and leveraged-bond legs are directional bets rather than pure ballast, but the safe-sector rotation is genuine defensive breadth.",
      "concentration": "Twenty instruments are reachable, and the equal-weighting spreads capital across many signals. In practice the portfolio still concentrates when the defensive rotation and a leveraged sleeve agree, the most recent holdings were dominated by utilities (XLU) alongside a TQQQ position."
    },
    "author_note": "The source symphony is named Rain's Unified \"Best Signals\". Its internal group names credit the strategies it unifies, TQQQ FTLT, The Holy Grail, KMLM Fund Surfing, and 'A Better Buy the Dips Nasdaq by Garen Phillips | Safe Sectors Mod'. Backtest covers about 5.7 years ({backtest_days} trading days) and went out-of-sample on 2025-11-08; all metrics reflect that mostly in-sample window. Symphony ID: sEUgeRfSayPbBh8mJxSy."
  },
  {
    "slug": "zoops-frontrunner",
    "name": "zoop's Frontrunner",
    "symphony_url": "https://app.composer.trade/symphony/zPBn8HkmTIQ5BEJdff0v/details",
    "symphony_id": "zPBn8HkmTIQ5BEJdff0v",
    "annualized_rate_of_return": 0.7708536056185544,
    "max_drawdown": -0.287898874999705,
    "cumulative_return": 135.198996,
    "calmar_ratio": 2.6775151713230705,
    "sharpe_ratio": 1.6826981938530259,
    "standard_deviation": 0.3782680786802822,
    "min": -0.13417657485229806,
    "mean": 0.002525837352331608,
    "median": 0.0012326353192716466,
    "max": 0.5462810465689152,
    "trailing_one_month_return": 0.00542437090458181,
    "trailing_three_month_return": 0.14584077847885824,
    "trailing_one_year_return": 0.39248924818102693,
    "backtest_days": 2166,
    "description": "zoop's Frontrunner is a compact daily rotator that holds plain SPY most of the time and only leaves it when a 10-day RSI reaches an extreme. A deeply oversold reading routes it into a 3x leveraged long matched to whichever index is most beaten down, while a single overbought reading anywhere across a twelve-name watchlist of indices and sectors routes it into long volatility instead. With five holdable instruments and five ordered rules it is among the simplest strategies in the library, built for investors who want leveraged exposure only at the moments the tape looks stretched. Despite the shared name it is a separate and far simpler symphony than zoop's 2026 Frontrunner.",
    "tags": [
      "rsi",
      "mean-reversion",
      "leveraged-etfs",
      "vix-tiers",
      "zoop"
    ],
    "last_updated": "2026-09-01",
    "ai_summary": [
      "Stripped to its essence, zoop's Frontrunner is a bet that short-term RSI extremes are reliable turning points, and it takes that bet in both directions with leverage. Most of the time it is simply long SPY, so its baseline is the market itself. The strategy only earns or loses its edge in the tails: at the bottom it swaps into a 3x fund to catch the sharpest available bounce, and at the top it swaps into long volatility to front-run the pullback its name refers to. What makes it unusual among the leveraged strategies here is how rarely it is actually leveraged. Every branch is all-or-nothing and the default state is unlevered, which is why its volatility sits far below what a permanent 3x holding would produce. It is best understood as an SPY position with two rented options attached, one on a violent bounce and one on a violent top, rather than as a leveraged strategy that occasionally steps aside.",
      "The backtested numbers are strong: {annualized_rate_of_return:0} annualized with a {sharpe_ratio} Sharpe and a {calmar_ratio} Calmar against a {max_drawdown_abs:0} max drawdown and {standard_deviation:0} volatility, over roughly 8.6 years. Four cautions matter, and the first outweighs the rest. The symphony's logic was last edited on 1 September 2026, so it has no out-of-sample record whatsoever; every figure here describes the same window the rules were selected against. Second, the backtest cannot begin before January 2018 because VXX is the youngest instrument in its universe, so the record misses 2008 and the 2015 to 2016 selloff outright. Third, the thresholds are precise in a way that invites overfitting: 23, 28, 28 and 79 are tuned numbers, and a twelve-name overbought basket carries a great many degrees of freedom for its size. Fourth, the compounded return leans on a small number of days, so it depends on a handful of switches having been timed correctly. The simplicity is a genuine virtue, the whole tree can be audited in a minute, but simplicity is not the same as robustness, and a freshly-edited strategy has earned no evidence yet."
    ],
    "how_it_works": [
      "The entire strategy is one ordered if-else ladder, evaluated top to bottom every day, that resolves to exactly one position. The first three rungs look for oversold conditions and buy the matching leveraged fund. If SMH's 10-day RSI is below 23 it buys SOXL, the 3x semiconductor fund. Otherwise, if QQQ's 10-day RSI is below 28 it buys TQQQ, the 3x Nasdaq-100 fund. Otherwise, if SPY's 10-day RSI is below 28 it buys SPXL, the 3x S&P 500 fund. The ordering is doing real work: semiconductors are checked first and given the tightest threshold of the three, so the deepest dip in the most volatile index takes priority over the broader ones, and SPY is only ever the dip-buy of last resort.",
      "If nothing is oversold, a single overbought check runs. It compares the 10-day RSI of twelve names against one ceiling of 79: SMH, QQQ, SPY, TQQQ, TECL, QQQE, VOOG, VOOV, VTV, FAS, XLP and XLY. The test is an 'any' condition, so one breach anywhere in that list is enough to fire it. When it does, the strategy buys VXX, a long-volatility ETN, front-running an expected pullback rather than merely stepping aside into cash or bonds. The breadth of the watchlist is the point: it spans the Nasdaq and the S&P, growth and value (VOOG, VOOV, VTV), semiconductors and 3x tech (SMH, TECL, TQQQ), financials (FAS) and both consumer sectors (XLP, XLY), so almost any broad rally that pushes one corner of the market to an RSI of 79 will put the portfolio into volatility.",
      "If neither the oversold ladder nor the overbought check fires, the strategy holds SPY, and this is the default state rather than an edge case. Rebalancing is daily and every branch terminates in a single asset, so the portfolio is always 100 percent in one instrument and can switch completely from one day to the next. Exactly five instruments are ever held: SOXL, TQQQ, SPXL, VXX and SPY. As of the most recent market day the ladder was in its default state, with the portfolio entirely in SPY."
    ],
    "signals": [
      {
        "name": "Oversold Leveraged Ladder",
        "tag": "mean-reversion",
        "description": "Three ordered dip-buys on 10-day RSI, each with its own threshold and its own 3x fund: SMH below 23 buys SOXL, then QQQ below 28 buys TQQQ, then SPY below 28 buys SPXL. Order and threshold together mean the narrowest, most volatile index is checked first and has to be the most beaten down to qualify."
      },
      {
        "name": "Twelve-Name Overbought Frontrunner",
        "tag": "vix-tiers",
        "description": "A single RSI(10) ceiling of 79 tested against SMH, QQQ, SPY, TQQQ, TECL, QQQE, VOOG, VOOV, VTV, FAS, XLP and XLY as an 'any' condition. One breach anywhere buys VXX. This is the strategy's namesake move: it goes long volatility on froth rather than waiting for the decline to confirm."
      },
      {
        "name": "SPY as the Default Holding",
        "tag": "rsi",
        "description": "With no RSI extreme in either direction the strategy holds SPY unlevered. This is where it spends most of its time, so the baseline return is the market's and the leveraged and volatility legs act as occasional overlays rather than as the core position."
      },
      {
        "name": "Single-Instrument Daily Rotation",
        "tag": "leveraged-etfs",
        "description": "Every branch of the tree ends in one asset and the symphony rebalances daily, so the portfolio is always fully concentrated in a single instrument and can move from SPY to a 3x fund to VXX on consecutive days. There is no partial sizing and no blending anywhere in the tree."
      }
    ],
    "risk_profile": {
      "verdict": "Aggressive",
      "leverage": "The three dip-buy legs are 3x daily-reset funds, SOXL on semiconductors, TQQQ on the Nasdaq-100 and SPXL on the S&P 500, all of which decay in choppy markets and can lose badly if a dip keeps going. VXX is not leveraged but is arguably the harsher instrument to hold: a long-volatility ETN in structural decay that bleeds steadily whenever the pullback it anticipates does not arrive. The mitigating fact is exposure time rather than exposure size, since the default state is unlevered SPY and the leveraged legs are visited only at RSI extremes.",
      "backtest_limits": "The record runs from 18 January 2018 to 1 September 2026, about 8.6 years. It cannot start earlier because VXX is the youngest instrument in the universe, so 2008 and the 2015 to 2016 selloff are missing entirely. What it does cover is useful: the February 2018 volatility spike, the Q4 2018 drawdown, the 2020 crash and the 2022 bear market are all inside the window. The decisive limitation is not length but freshness: the logic was last edited on 1 September 2026, so the strategy has no out-of-sample record at all and every metric describes the window its own rules were chosen against.",
      "signal": "One indicator carries the whole strategy. Every branch is a 10-day RSI reading, so there is no trend filter, no moving-average regime gate and no confirmation of any kind, and a single indicator misbehaving misroutes the entire portfolio. The thresholds are also finely tuned (23, 28, 28 and 79) and a twelve-name overbought basket offers many degrees of freedom, which is where the overfitting risk sits. The offsetting virtue is auditability: the tree is five rules deep and can be checked by hand in a minute, which is not true of most strategies in this library.",
      "hedge": "VXX is the only defensive state, and it is a directional long-volatility bet rather than ballast. It pays off sharply when a top is called correctly and bleeds when it is not, so it does not behave like the bond and staples rotations that other strategies here fall back on. There is no cash leg, no bond leg and no inverse equity leg anywhere in the tree.",
      "concentration": "Concentration is total by construction. Every branch resolves to one asset, so the portfolio is always 100 percent in a single instrument, and the reachable universe is only five names: SOXL, TQQQ, SPXL, VXX and SPY. Turnover is correspondingly high, since the ladder is re-evaluated daily and any switch is a complete one.",
      "suitability": "Reasonable for someone who wants market exposure as the default and is willing to accept short, violent excursions into 3x funds and long volatility at the edges. It is not a strategy to size on its backtest, because that backtest contains no out-of-sample evidence yet."
    },
    "author_note": "The source symphony is named zoop's Frontrunner (symphony ID zPBn8HkmTIQ5BEJdff0v). It is a distinct symphony from zoop's 2026 Frontrunner (4aI4kVT5cEc0XJpTLei3), which is already in this library under a similar name and a considerably more complex tree. The backtest covers {backtest_days} trading days from 2018-01-18, and the symphony's logic was last edited on 2026-09-01, so none of the record is out-of-sample."
  }
];
