// Strategies data - loaded as a script tag so the site works with file:// protocol.
// To update metrics: run scripts/update_metrics.py
window.STRATEGIES_DATA = [
  {
    "slug": "zoops-2026-frontrunner",
    "name": "zoop's 2026 Frontrunner",
    "symphony_url": "https://app.composer.trade/symphony/4aI4kVT5cEc0XJpTLei3/details",
    "symphony_id": "4aI4kVT5cEc0XJpTLei3",
    "annualized_rate_of_return": 0.9111725291852342,
    "max_drawdown": -0.21562515970222984,
    "cumulative_return": 253.42548100000002,
    "calmar_ratio": 4.22572454180917,
    "sharpe_ratio": 1.7917362279487365,
    "standard_deviation": 0.40143513390511804,
    "min": -0.1537815543973604,
    "mean": 0.002854229653131953,
    "median": 0.0001091083276777427,
    "max": 0.5462929935338656,
    "trailing_one_month_return": 0.09725005569689849,
    "trailing_three_month_return": 0.13472965226971878,
    "trailing_one_year_return": 0.21416192450855798,
    "backtest_days": 2154,
    "description": "A momentum-driven strategy designed to front-run emerging market trends by positioning in leading leveraged ETFs before broad participation catches up.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "vix-tiers",
      "inverse-etfs",
      "zoop"
    ],
    "last_updated": "2026-08-17",
    "ai_summary": [
      "Structurally, the Frontrunner is a cash-first dip-buyer: it parks in T-bills (BIL) by default and only deploys into 3x leveraged ETFs (SOXL, TQQQ, or UPRO) when a fast RSI(10) reading crosses tight oversold thresholds, with semiconductors checked first. A second branch uses XLY and UVXY RSI to rotate into volatility (VXX) or a short (SPXU) when markets overheat. The purpose is to spend most of its time earning risk-free interest and act only at genuine short-term extremes, making each entry deliberate rather than continuous. It is also the 50% base component shared by every other zoop symphony, so understanding it explains half of this library.",
      "Over a roughly 8-year backtest it posts a 91% annualized return with a 22% max drawdown, a notably lower drawdown than the other leveraged zoop strategies precisely because its time-in-market is limited. Its 1.78 Sharpe and 4.23 Calmar reflect that favorable risk-adjusted trade-off. The main caveat is that buying into oversold conditions means individual entries can keep falling before they recover, so the smooth equity curve masks sharp single-trade risk. It best suits an investor who wants systematic dip-buying exposure rather than a constant leveraged allocation."
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
    "risk_profile": "Aggressive. Despite spending most of its time in T-bills, the Frontrunner concentrates entries in 3x leveraged ETFs at the most volatile market extremes, buying into oversold conditions that can continue lower before recovering. The ~21.6% max drawdown is lower than other leveraged strategies in this library because time-in-market is limited, but individual entries at RSI extremes carry significant short-term reversal risk. Best suited for investors who want systematic dip-buying exposure rather than constant equity allocation.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-holy-grail-2026",
    "name": "zoop's Holy Grail (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/Y2xvfu7iFNyO6up77gBI/details",
    "symphony_id": "Y2xvfu7iFNyO6up77gBI",
    "annualized_rate_of_return": 1.1162855983435755,
    "max_drawdown": -0.44668770561062854,
    "cumulative_return": 46266.141501,
    "calmar_ratio": 2.4990291524088333,
    "sharpe_ratio": 1.6360371083173133,
    "standard_deviation": 0.547667726215678,
    "min": -0.15378150151415337,
    "mean": 0.0035555742980818094,
    "median": 0.002040796223728658,
    "max": 0.5462990846874773,
    "trailing_one_month_return": 0.023593708328504936,
    "trailing_three_month_return": 0.30085681989785673,
    "trailing_one_year_return": 0.7575334074054292,
    "backtest_days": 3610,
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
    "last_updated": "2026-08-17",
    "ai_summary": [
      "This is a full-cycle, multi-signal strategy that layers RSI, the 200-day moving average, and volatility filters on top of the shared Frontrunner dip-buy base. The moving-average gate defines the broad regime, RSI handles overbought and oversold timing, and the volatility check routes into hedges when conditions turn turbulent. The intent is to capture leveraged upside in bull trends while using multiple independent confirmations to step aside before the worst of a drawdown, the 'holy grail' being strong compounding that still survives full market cycles.",
      "Across a long 14-year backtest it returns 113% annualized, the result of combining many signals over many regimes. The trade-off is a deep 45% max drawdown and high 54% volatility, marking it as an aggressive leveraged strategy, and the 1.65 Sharpe and 2.53 Calmar are solid but not exceptional for the risk taken. The long backtest is a real strength here: it has been tested through 2018, 2020, and 2022 stress periods rather than a single favorable stretch. It suits investors comfortable holding through large paper losses in pursuit of high long-run growth."
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
    "risk_profile": "Aggressive. The 14-layer overbought cascade and TQQQ SMA gate provide meaningful downside protection, but ~44.7% max drawdown reflects periods where conditions deteriorate faster than the signals respond. With standard deviation of 54.4%, this is among the more volatile strategies in the library. The extraordinary cumulative return (44,866x) is real but comes with commensurate multi-year drawdown exposure.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-tqqq-long-term-2026",
    "name": "zoop's TQQQ FOR THE LONG TERM (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/yIMvLUHfzAMATCpOKr9T/details",
    "symphony_id": "yIMvLUHfzAMATCpOKr9T",
    "annualized_rate_of_return": 1.0944536073779725,
    "max_drawdown": -0.461037074558565,
    "cumulative_return": 39877.601769,
    "calmar_ratio": 2.3738950027519863,
    "sharpe_ratio": 1.6114232663205001,
    "standard_deviation": 0.5506451739332053,
    "min": -0.15378150191324358,
    "mean": 0.003521120812551848,
    "median": 0.0020606922355592694,
    "max": 0.5462990758834927,
    "trailing_one_month_return": 0.023593708338317088,
    "trailing_three_month_return": 0.30085678963300655,
    "trailing_one_year_return": 0.6633476180733342,
    "backtest_days": 3610,
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
    "last_updated": "2026-08-17",
    "ai_summary": [
      "The logic is a long-term TQQQ (3x Nasdaq 100) holding wrapped in systematic safety exits. Rather than buy-and-hold, it uses the 200-day moving average and RSI/volatility checks to step out of leveraged tech before major breakdowns, then re-enter when conditions stabilize, all on top of the shared Frontrunner dip-buy base. It is built for the investor who believes in Nasdaq 100 growth over the long run but cannot stomach the catastrophic, decay-amplified losses that come from holding a 3x ETF unhedged through a bear market.",
      "Over roughly 14 years it compounds at 111% annualized, but the headline risk is a 46% max drawdown and 55% volatility; the safety exits soften the worst leveraged-tech crashes without eliminating them. Its 1.63 Sharpe and 2.40 Calmar are typical for this aggressive cohort. The value proposition is less about beating the other zoop variants and more about converting an un-survivable 3x buy-and-hold into something an investor can actually hold through a cycle."
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
    "risk_profile": "Aggressive. The SPY SMA gate and UVXY filters reduce the frequency of destructive leveraged holds, but ~46.1% max drawdown shows that major trend breaks can produce substantial losses before exit signals trigger. The 'long term' framing is appropriate, this strategy requires a multi-year horizon to survive drawdown periods and benefit from the compounding math.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-excellent-adventure-2026",
    "name": "zoop's Excellent Adventure (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/YIiBr33X4rRTVlOWhCNq/details",
    "symphony_id": "YIiBr33X4rRTVlOWhCNq",
    "annualized_rate_of_return": 1.2027540307632347,
    "max_drawdown": -0.45642502820076025,
    "cumulative_return": 82125.835695,
    "calmar_ratio": 2.635162308045471,
    "sharpe_ratio": 1.7971202028176052,
    "standard_deviation": 0.5095296121090617,
    "min": -0.16154384776312558,
    "mean": 0.003633674443869098,
    "median": 0.001190825016922803,
    "max": 0.5462991170391072,
    "trailing_one_month_return": 0.037951001742200674,
    "trailing_three_month_return": 0.10343590494085086,
    "trailing_one_year_return": 1.1045293105870169,
    "backtest_days": 3610,
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
    "last_updated": "2026-08-17",
    "ai_summary": [
      "This variant is the most aggressive of the 'rotation' zoops: it dynamically moves across high-momentum leveraged instruments using RSI, 200-day MA, and volatility signals, aiming to always be positioned in whatever is compounding fastest while the Frontrunner base handles dip-buying. The purpose is maximal participation in leveraged momentum, chasing the strongest trend rather than committing to a single ticker like TQQQ or UPRO.",
      "It delivers 122% annualized over roughly 14 years with the best Sharpe (1.82) of the core leveraged zoop variants, meaning its return per unit of risk is comparatively efficient despite a 46% max drawdown and 51% volatility. The long backtest spanning multiple cycles lends credibility. Still, the 'always in the hottest asset' design makes it whipsaw-prone in choppy, trendless markets, and the deep drawdown places it firmly in aggressive territory."
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
    "risk_profile": "Aggressive. With ~45.6% max drawdown and 50.8% standard deviation, this strategy is at the upper end of the aggressive spectrum. The IEF bond filter and 14-layer overbought cascade are real risk controls, but 3x leverage during confirmed bull phases means individual positions can experience 40-50% losses in sharp reversals. The 1-year trailing return of +170.0% illustrates both the potential and the concentration risk.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-sometimes-tqqq-2026",
    "name": "zoop's Sometimes TQQQ (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/uAaEkEq8cPOmGgfEWTOU/details",
    "symphony_id": "uAaEkEq8cPOmGgfEWTOU",
    "annualized_rate_of_return": 1.8064430704585441,
    "max_drawdown": -0.34904964771423896,
    "cumulative_return": 2641156.6836180002,
    "calmar_ratio": 5.175318417560612,
    "sharpe_ratio": 2.455616233517205,
    "standard_deviation": 0.46299446486950996,
    "min": -0.1413442396235045,
    "mean": 0.004511653666516587,
    "median": 0.001462866569261534,
    "max": 0.5462991722111179,
    "trailing_one_month_return": -0.021176200901577347,
    "trailing_three_month_return": 0.33407757417792294,
    "trailing_one_year_return": 1.0313460486695325,
    "backtest_days": 3610,
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
    "last_updated": "2026-08-17",
    "ai_summary": [
      "As the name suggests, this strategy holds TQQQ only when multiple independent signals (RSI, the 200-day MA regime, and volatility filters) simultaneously confirm a favorable entry; otherwise it sits in the defensive Frontrunner base or cash. It is a precision-timing approach: the logic is deliberately selective, trading time-in-market for entry quality, on the thesis that avoiding leveraged exposure during unconfirmed conditions is worth more than capturing every up day.",
      "That selectivity pays off statistically: it records the strongest risk-adjusted profile in the library, a 2.47 Sharpe and 5.22 Calmar, alongside a 182% annualized return and the highest backtested cumulative return here, all over a robust 14-year window. Its 35% max drawdown is meaningfully shallower than the always-in TQQQ variants. The standout characteristic is this efficiency: by being TQQQ 'sometimes' rather than always, it captures much of the upside with materially less of the pain, making it one of the more compelling profiles for risk-aware leveraged investors."
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
    "risk_profile": "Aggressive with exceptional risk management. A Calmar ratio of 5.21 and Sharpe of 2.47 represent one of the best risk-adjusted profiles in the library. The ~34.9% max drawdown and 46.1% standard deviation are still substantial, but among the lowest in the leveraged TQQQ suite. The multi-layer bond and momentum confirmation requirements significantly restrict time-in-risk and improve entry quality.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-safety-checks-2026",
    "name": "zoop's Safety Checks (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/RLt1Rzz79I6Fa2X9QKqY/details",
    "symphony_id": "RLt1Rzz79I6Fa2X9QKqY",
    "annualized_rate_of_return": 1.0136042879049643,
    "max_drawdown": -0.4371550511323792,
    "cumulative_return": 22684.91213,
    "calmar_ratio": 2.318637941571044,
    "sharpe_ratio": 1.6133742314593742,
    "standard_deviation": 0.5145890117517281,
    "min": -0.14134421294143984,
    "mean": 0.003294542267271362,
    "median": 0.0019246011063985824,
    "max": 0.5462990006794213,
    "trailing_one_month_return": 0.02359370834301,
    "trailing_three_month_return": 0.30085662395902113,
    "trailing_one_year_return": 0.6717762010226174,
    "backtest_days": 3610,
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
    "last_updated": "2026-08-17",
    "ai_summary": [
      "This strategy front-loads multiple pre-position 'safety checks' (RSI extremes, 200-day MA regime, and volatility conditions) that must clear before it commits to a leveraged ETF, otherwise defaulting to the conservative Frontrunner base. The design philosophy is drawdown reduction first: each check is a veto gate intended to keep the strategy out of leveraged positions during the conditions that historically precede large losses, while still compounding strongly over the long run.",
      "Over roughly 14 years it returns 102% annualized with a 44% max drawdown and 51% volatility; the 1.63 Sharpe and 2.36 Calmar are mid-pack for the cohort. In practice the safety checks moderate rather than eliminate leveraged drawdowns, and the deep max drawdown shows that no set of pre-entry filters fully neutralizes 3x ETF risk in a severe selloff. It suits an investor who wants a more cautious, gated version of leveraged tech exposure but understands the residual downside remains substantial."
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
    "risk_profile": "Aggressive with gradual exposure scaling. The 10-condition ensemble creates a risk-on/risk-off spectrum rather than binary switching, smoothing the transitions that cause large single-period losses in simpler strategies. Still carries a ~43.5% max drawdown, reflecting that simultaneous multi-condition failures during sharp bear markets can produce significant drawdowns before the ensemble fully exits.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-manhattan-project-2026",
    "name": "zoop's Manhattan Project (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/cCi1mupGsluFmre7HpOm/details",
    "symphony_id": "cCi1mupGsluFmre7HpOm",
    "annualized_rate_of_return": 1.5113039855083752,
    "max_drawdown": -0.39156067353453905,
    "cumulative_return": 537405.434993,
    "calmar_ratio": 3.8596929866989442,
    "sharpe_ratio": 2.0760451671732736,
    "standard_deviation": 0.5028345630342919,
    "min": -0.15378148644668987,
    "mean": 0.004142489144742169,
    "median": 0.001820013038688284,
    "max": 0.5462991702472488,
    "trailing_one_month_return": 0.19773869467511274,
    "trailing_three_month_return": 0.08634091335373628,
    "trailing_one_year_return": 0.094998649420591,
    "backtest_days": 3610,
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
    "last_updated": "2026-08-17",
    "ai_summary": [
      "The Manhattan Project is the most signal-dense zoop variant, integrating many independent market indicators (RSI, moving averages, momentum, and volatility tiers) to assemble what it treats as an optimal leveraged position at each rebalance, layered over the Frontrunner base. It approaches market timing as a quasi-scientific exercise: more inputs, more conditional branches, and a composite read of regime intended to position aggressively only when the weight of evidence agrees.",
      "The complexity translates into strong numbers: 154% annualized over roughly 14 years with a 2.10 Sharpe and 4.43 Calmar, and a 35% max drawdown that is shallower than most always-on leveraged peers. The long, multi-cycle backtest is a strength. The flip side of heavy signal-stacking is overfitting risk, since many tuned thresholds can fit the historical period more tightly than they generalize, so the excellent backtest should be read with the understanding that complex strategies carry more parameter risk out-of-sample."
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
    "risk_profile": "Aggressive. A Calmar ratio of 4.43 and Sharpe of 2.10 indicate strong risk-adjusted performance, but ~34.8% max drawdown and 50.2% standard deviation confirm this remains a high-risk allocation. The cross-asset signal depth gives it more regime awareness than simpler strategies, but complexity does not eliminate drawdowns. The recent 3-month return of -1.5% is a reminder that even sophisticated multi-asset routing can underperform in fast-moving markets.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-kmlm-switcher-2026",
    "name": "zoop's KMLM Switcher (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/4AuTagHMeiS4usdZEuDK/details",
    "symphony_id": "4AuTagHMeiS4usdZEuDK",
    "annualized_rate_of_return": 2.835193966623635,
    "max_drawdown": -0.29463776595788693,
    "cumulative_return": 1957.447384,
    "calmar_ratio": 9.62264276409452,
    "sharpe_ratio": 2.6190015993166593,
    "standard_deviation": 0.5747044595211762,
    "min": -0.18946903036455276,
    "mean": 0.005972824994525305,
    "median": 0.002337123060346946,
    "max": 0.5470862800345049,
    "trailing_one_month_return": 0.33846157380012354,
    "trailing_three_month_return": 0.5915211189356684,
    "trailing_one_year_return": 1.4739577765805052,
    "backtest_days": 1420,
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
    "last_updated": "2026-08-17",
    "ai_summary": [
      "This is a regime-switching strategy that rotates between KMLM, a managed-futures, trend-following ETF that tends to do well when equities struggle, and leveraged equity ETFs, using RSI and volatility signals plus the Frontrunner base. The purpose is to be positioned for gains in two opposite environments: riding leveraged equities when markets rally, and pivoting to managed-futures trend exposure when they do not, creating a more all-weather return stream than a pure equity-leverage approach.",
      "It posts the headline-grabbing numbers of this library: 280% annualized, a 2.63 Sharpe, and a remarkable 9.52 Calmar with only a 30% max drawdown. The critical caveat is the backtest length. At roughly 5 years (1,377 trading days) it is far shorter than the 14-year zoop variants, and managed-futures diversification looked especially good across the specific 2021 to 2022 period when KMLM rallied as stocks fell. Those extraordinary ratios are therefore more period-dependent and should be discounted relative to the longer-tested strategies."
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
    "risk_profile": "Aggressive with a shorter track record. One of the highest Calmar ratios in the library (9.52) and a 2.63 Sharpe reflect strong risk-adjusted performance, but ~29.5% max drawdown and 56.9% standard deviation confirm this is not a conservative allocation. The 5.5-year backtest reflects performance in a predominantly bull market, interpret long-term metrics cautiously relative to the 14-year backtests available for other strategies in this library.",
    "author_note": "Note: KMLM launched in November 2020. The 5.5-year backtest is shorter than most strategies here. Metrics are accurate as of last_updated."
  },
  {
    "slug": "zoops-upro-ftlt-2026",
    "name": "zoop's UPRO FTLT (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/9ETFQi5cmSWq2mT4ZH2d/details",
    "symphony_id": "9ETFQi5cmSWq2mT4ZH2d",
    "annualized_rate_of_return": 0.9435748486072917,
    "max_drawdown": -0.33378561736770695,
    "cumulative_return": 13659.700337,
    "calmar_ratio": 2.826888875705585,
    "sharpe_ratio": 1.6488806982074062,
    "standard_deviation": 0.46658590239685893,
    "min": -0.15378150891546916,
    "mean": 0.0030529543195153388,
    "median": 0.0015764691128282715,
    "max": 0.5462989439537709,
    "trailing_one_month_return": 0.13087503508978737,
    "trailing_three_month_return": 0.3358569208514517,
    "trailing_one_year_return": 0.5543805023823338,
    "backtest_days": 3610,
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
    "last_updated": "2026-08-17",
    "ai_summary": [
      "This is the S&P 500 counterpart to the TQQQ long-term strategy: it holds UPRO (3x S&P 500) for the long run with the same systematic safety-exit framework of 200-day MA regime gating, RSI/volatility checks, and the Frontrunner dip-buy base. Because the S&P 500 is broader and less concentrated than the Nasdaq 100, the strategy is designed to deliver similar leveraged trend-following behavior with a somewhat smoother ride than its QQQ-based sibling.",
      "Over roughly 14 years it returns 94% annualized with a 33% max drawdown and 47% volatility, both lower than the TQQQ version, confirming the broader-index, lower-beta intent, while the 1.64 Sharpe and 2.81 Calmar land mid-pack. It is the natural pick for an investor who wants the long-term-leverage-with-safety-exits concept but prefers S&P 500 breadth over Nasdaq 100 concentration, accepting modestly lower returns for modestly lower volatility."
    ],
    "how_it_works": [
      "UPRO FTLT ('For The Long Term') mirrors the TQQQ FTLT structure exactly, but substitutes UPRO (ProShares UltraPro S&P 500, 3x) for TQQQ in every branch. Where TQQQ FTLT defaults to Nasdaq 100 leverage, UPRO FTLT defaults to broad S&P 500 leverage. The core trend gate is Price(SPY) > SMA(): when SPY is above its simple moving average and SPXL (another 3x S&P ETF) RSI is below 80, the strategy holds UPRO. The Frontrunner component (50% weight) runs in parallel with its standard RSI(10) dip-buy logic.",
      "In downtrend conditions (SPY below SMA), the strategy does not simply hold cash. It checks TQQQ RSI <31 to dip-buy TECL (3x tech), SPY RSI <30 to re-enter UPRO, and works through tiered UVXY checks at 65, 74, and 84, evaluating TQQQ price vs. its own SMA before deciding whether to hold UPRO or switch to SH. Even in a downtrend, the strategy actively looks for oversold re-entry points into UPRO.",
      "The UPRO-for-TQQQ substitution produces meaningfully lower volatility, the S&P 500's broader sector diversification vs. Nasdaq 100's tech concentration reduces the standard deviation from 54-55% to 46.7%, and max drawdown from ~46% to ~33%. For investors who want leveraged compounding but prefer broad market diversification over Nasdaq concentration, UPRO FTLT is the S&P 500 alternative within this strategy family."
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
    "risk_profile": "Aggressive. Lower volatility than TQQQ-based strategies, 46.7% standard deviation vs. 54-55% for TQQQ strategies, and ~33.4% max drawdown vs. ~46% for TQQQ FTLT. The S&P 500's broader diversification relative to Nasdaq 100 concentration is the source of this risk reduction. Still unsuitable for capital that cannot tolerate multi-year drawdown periods.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-leveraged-tqqq-symphony-2026",
    "name": "zoop's Leveraged TQQQ Symphony (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/U6lT1G0PdE9fUxoy2opg/details",
    "symphony_id": "U6lT1G0PdE9fUxoy2opg",
    "annualized_rate_of_return": 1.0712708544249856,
    "max_drawdown": -0.47588767182175407,
    "cumulative_return": 33998.607796,
    "calmar_ratio": 2.251100244568292,
    "sharpe_ratio": 1.6212228377785118,
    "standard_deviation": 0.535235353280115,
    "min": -0.15378150033610738,
    "mean": 0.0034433959457308423,
    "median": 0.0014116841641577116,
    "max": 0.5462990583467926,
    "trailing_one_month_return": 0.023593708360790666,
    "trailing_three_month_return": 0.18112644550633217,
    "trailing_one_year_return": 0.7654348045280519,
    "backtest_days": 3610,
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
    "last_updated": "2026-08-17",
    "ai_summary": [
      "This TQQQ strategy 'orchestrates' multiple timing signals (RSI, 200-day MA, momentum, and volatility tiers) and acts only when they align, much like instruments playing in harmony, on top of the shared Frontrunner base. Conceptually it is close to the other TQQQ-long-term variants but frames its edge as signal coordination: each indicator must agree before leveraged exposure is taken, the goal being to avoid acting on any single signal in isolation.",
      "Across roughly 14 years it compounds at 109% annualized, but it carries the deepest max drawdown of the core TQQQ variants at 48%, with 53% volatility and a 1.64 Sharpe and 2.28 Calmar. The long backtest is reassuring, but the relatively weak Calmar shows that requiring signal 'harmony' did not, historically, buy meaningfully better drawdown protection than simpler approaches, making it a solid but not standout member of the TQQQ family."
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
    "risk_profile": "Aggressive. At ~47.6% max drawdown and 53.2% standard deviation, this is among the higher-risk strategies in the library. The 60-period RSI guard and cumulative return cap reduce overbought entry frequency but cannot prevent losses when underlying trends reverse sharply. The 1-year trailing return of +120.4% demonstrates the reward available for tolerating this level of volatility.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-tqqq-200d-ma-3x-2026",
    "name": "zoop's TQQQ 200d MA 3x Leverage (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/ZBpjzxS9RkLzft9NNWhO/details",
    "symphony_id": "ZBpjzxS9RkLzft9NNWhO",
    "annualized_rate_of_return": 1.078590612407866,
    "max_drawdown": -0.38973233299543986,
    "cumulative_return": 35761.466236,
    "calmar_ratio": 2.7675163723726413,
    "sharpe_ratio": 1.6297094847947808,
    "standard_deviation": 0.5347442028226236,
    "min": -0.15378150209885066,
    "mean": 0.0034582448384089435,
    "median": 0.0018791147494416904,
    "max": 0.5462990639857883,
    "trailing_one_month_return": 0.0235937083614004,
    "trailing_three_month_return": 0.28536436782129004,
    "trailing_one_year_return": 0.6722211875506052,
    "backtest_days": 3610,
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
    "last_updated": "2026-08-17",
    "ai_summary": [
      "This is the simplest, most transparent strategy in the library: hold TQQQ when QQQ is above its 200-day moving average, otherwise move to cash, with the Frontrunner base handling opportunistic dip-buys. The single 200-day MA gate is one of the most studied and durable trend filters in systematic investing, and the appeal here is exactly that legibility. Anyone can understand, audit, and trust the rule, with no opaque stack of tuned thresholds.",
      "Over roughly 14 years it returns 109% annualized with a 39% max drawdown, 53% volatility, and a 1.65 Sharpe and 2.80 Calmar, performance fully competitive with far more complex variants. That is the noteworthy point: a one-rule strategy matches the multi-signal symphonies, a strong argument that most of the value comes from the trend gate itself rather than the added complexity. Its low overfitting risk and interpretability make it an excellent baseline for understanding leveraged trend-following."
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
    "risk_profile": "Aggressive. Despite its simplicity, this strategy has a ~39% max drawdown, TQQQ can still fall 30-40% before crossing below its SMA, and the strategy can be whipsawed in choppy markets near the average. Its transparency makes it the most auditable and explainable entry point for investors new to systematic leveraged strategies.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-soxl-growth-2026",
    "name": "zoop's SOXL Growth (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/wcEUcb13v7M8bEluRc1h/details",
    "symphony_id": "wcEUcb13v7M8bEluRc1h",
    "annualized_rate_of_return": 1.605573881801249,
    "max_drawdown": -0.6570145775711538,
    "cumulative_return": 911236.418224,
    "calmar_ratio": 2.4437416407665133,
    "sharpe_ratio": 1.7348860057043636,
    "standard_deviation": 0.6851816159497186,
    "min": -0.21153412645605885,
    "mean": 0.004717111098718526,
    "median": 0.0011875146422578586,
    "max": 0.546299152914971,
    "trailing_one_month_return": -0.09169135481204538,
    "trailing_three_month_return": -0.02645515961465128,
    "trailing_one_year_return": 3.9028580348534403,
    "backtest_days": 3610,
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
    "last_updated": "2026-08-17",
    "ai_summary": [
      "This is the most aggressive zoop symphony, using SOXL (3x Semiconductors) as its core growth engine, governed by RSI, momentum, and volatility signals plus the Frontrunner base. Semiconductors are among the highest-beta corners of the market, and 3x leverage on top compounds that volatility. The strategy deliberately accepts extreme swings in exchange for the explosive upside that semiconductor leadership can deliver during a tech bull run.",
      "The numbers make the trade-off explicit: 164% annualized over roughly 14 years, but a brutal 66% max drawdown and 69% volatility, the highest-risk profile of the zoop set, which is why it carries max-drawdown and standard-deviation tags. Its 1.75 Sharpe and 2.50 Calmar are respectable only because the returns are so large. This is a strategy for investors with the highest risk tolerance and a long horizon who can psychologically and financially survive losing roughly two-thirds of peak value."
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
    "risk_profile": "Extremely Aggressive. The highest-risk strategy among the zoop symphonies with ~65.7% max drawdown and 68.7% standard deviation. SOXL's 3x semiconductor leverage produces the most extreme price swings of any instrument in this suite. The MaxDD and standard deviation signals help time entries and exits, but semiconductor sector concentration means major sector drawdowns can produce 60-80% peak-to-trough losses even with protective routing. Only appropriate as a small satellite allocation within a diversified portfolio.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "s90-half-low-catch",
    "name": "s90 50/40 maxDD (Half Low Catch)",
    "symphony_url": "https://app.composer.trade/symphony/K8ql2SKFd4VDBemIstEr/details",
    "symphony_id": "K8ql2SKFd4VDBemIstEr",
    "annualized_rate_of_return": 5.112054239262865,
    "max_drawdown": -0.3922765099853436,
    "cumulative_return": 70.82495,
    "calmar_ratio": 13.03176231340965,
    "sharpe_ratio": 2.6582056874301987,
    "standard_deviation": 0.7923819361203097,
    "min": -0.16107370386247677,
    "mean": 0.00835838956036492,
    "median": 0.0035654929131896385,
    "max": 0.5462789268516794,
    "trailing_one_month_return": -0.27395452866793424,
    "trailing_three_month_return": 0.09009705065291818,
    "trailing_one_year_return": 4.8021543557507895,
    "backtest_days": 594,
    "description": "A multi-asset extreme dip-buying strategy that catches catastrophic 3x ETF crashes across semiconductors, biotech, China, financials, small caps, and global markets, only entering at RSI thresholds far below typical oversold levels.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "vix-tiers",
      "mean-reversion"
    ],
    "last_updated": "2026-08-17",
    "ai_summary": [
      "This is a multi-asset extreme dip-buying strategy that waits for catastrophic crashes in 3x ETFs across semiconductors, biotech, China, financials, small caps, and global markets, entering only at RSI levels far below conventional oversold thresholds. The structure is essentially a basket of deep-mean-reversion triggers: it does nothing most of the time and fires only when an asset has fallen to a genuine washout, betting on the sharp snapback that often follows panic selling.",
      "Its backtested figures are spectacular (735% annualized, a 3.04 Sharpe, and a 24.81 Calmar with only a 30% max drawdown) but they demand heavy skepticism. The backtest is just 2 years (551 trading days), by far the shortest in the library, and a deep-dip-buying strategy will look extraordinary in any window that happens to contain sharp V-shaped recoveries. These returns are almost certainly not repeatable out-of-sample; the strategy is best viewed as an illustration of the mean-reversion concept rather than a realistic expectation, and the short, period-specific backtest is its single most important caveat."
    ],
    "how_it_works": [
      "Low Catchers is a 50/50 combination of a frontrunner component and a dedicated low-catching component. The low-catchers half works as a waterfall of extreme oversold conditions across a diversified basket of 3x leveraged ETFs, defaulting to cash (BIL via the frontrunner) and only deploying capital when market conditions reach truly catastrophic thresholds. Unlike the other strategies in this library that use RSI extremes in the 22–31 range, Low Catchers pushes entry thresholds far lower, as tight as RSI 14 for some ETFs.",
      "The low-catchers component opens with two initial gates: if QQQ's 10-day moving-average return falls below -2.4% (broad Nasdaq deterioration), the strategy buys SOXL. If QQQ is not yet weak, it checks for catastrophic SOXL crashes directly, a 1-day return below -31%, 2-day cumulative return below -37%, or 5-day cumulative return below -57% each trigger a SOXL entry. These are flash-crash and multi-day collapse conditions, not routine corrections. When UVXY's 10-period RSI exceeds 88, far above the 65 threshold used elsewhere in this library, the strategy also buys SOXL, treating extreme volatility panic as a contrarian semiconductor buy signal.",
      "After the SOXL-specific triggers, the component cascades through individual 3x ETF RSI checks in strict priority order: LABU (3x biotech) RSI < 22, YINN (3x China) RSI < 14, UDOW (3x Dow) RSI < 18, FAS (3x financials) RSI < 15, TNA (3x small cap) RSI < 16, URTY (3x Russell 2000) RSI < 16, KORU (3x South Korea) RSI < 17, NAIL (3x homebuilders), and additional ETFs further down the tree. Each asset independently catches its own sector's extreme bottom. If no condition triggers, the frontrunner component's BIL default preserves capital until the next opportunity."
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
    "risk_profile": "Extremely Aggressive with a short backtest. At 79.7% standard deviation, this is among the most volatile strategies in the library, second only to SOXL Growth v2.4.5 RL's 84.6% and exceeding the zoop SOXL Growth's 68.7%. The 29.6% max drawdown is low relative to the volatility because the strategy spends most of its time in BIL (via the frontrunner component) and only deploys at extreme market conditions. However, with only 551 days of backtest history (~2.2 years, from early 2024), the extraordinary metrics, 735% ARR, Calmar 24.8, Sharpe 3.04, reflect a predominantly bull market with the specific volatility spikes this strategy is optimized to catch. These figures should be interpreted with significant caution; a longer out-of-sample record is required before they can be taken at face value.",
    "author_note": "Note: Backtest covers approximately 2.2 years (≈551 trading days from early 2024). All metrics reflect this short window. Interpret with caution. Metrics are accurate as of the last_updated date."
  },
  {
    "slug": "holy-grail",
    "name": "The Holy Grail (Original)",
    "symphony_url": "https://app.composer.trade/symphony/MmQbpf2U5TMQFmr9Nt2e/details",
    "symphony_id": "MmQbpf2U5TMQFmr9Nt2e",
    "annualized_rate_of_return": 1.51985000394416,
    "max_drawdown": -0.4742008944552393,
    "cumulative_return": 895635.5515010001,
    "calmar_ratio": 3.2050762065519924,
    "sharpe_ratio": 1.7830163779567594,
    "standard_deviation": 0.6258106771302261,
    "min": -0.22093816939388655,
    "mean": 0.004427899550886519,
    "median": 0.0032877878723396314,
    "max": 0.5001155865972102,
    "trailing_one_month_return": 0.08298329149150274,
    "trailing_three_month_return": 0.04966449653667704,
    "trailing_one_year_return": 0.5016783145032393,
    "backtest_days": 3736,
    "description": "A TQQQ-centric trend-following strategy that stays long leveraged tech in bull markets, hedges to UVXY when overbought, and rotates into dip-buying or short positions when TQQQ breaks below its 200-day moving average.",
    "tags": [
      "rsi",
      "200d-ma",
      "leveraged-etfs",
      "momentum",
      "inverse-etfs",
      "original"
    ],
    "last_updated": "2026-08-17",
    "ai_summary": [
      "The original Holy Grail is a TQQQ-centric trend-follower: it stays long leveraged tech while TQQQ holds above its 200-day moving average, hedges into UVXY when the market is overbought, and rotates into dip-buying or outright short positions once TQQQ breaks below the 200-day line. The logic is a clean three-state machine of bull (long leverage), froth (volatility hedge), and bear (dip-buy or short), designed to participate fully in uptrends while having explicit, pre-defined responses to overheating and to regime breakdown.",
      "Over a long 15-year backtest it returns 154% annualized with a 1.80 Sharpe and 3.24 Calmar, while the 47% max drawdown and 62% volatility mark it as aggressive. The lengthy test window through multiple bear markets is a meaningful strength, and the explicit short and hedge branches mean it is built to profit from, not merely survive, downturns. It suits investors who want active bull-and-bear leveraged tech exposure governed by a transparent moving-average regime rule."
    ],
    "how_it_works": [
      "The Holy Grail uses TQQQ's own 200-day moving average as the primary regime gate. When TQQQ is trading above its 200d MA, the strategy enters bull mode and allocates 80% of the portfolio to an RSI-gated TQQQ position. Within that allocation, if TQQQ's RSI(10) exceeds 79, signaling short-term overbought conditions, the position pivots to UVXY (2x long VIX futures) as a defensive hedge. Otherwise, the strategy holds TQQQ directly. A 5% rebalance corridor means positions are only adjusted when drift exceeds that threshold, reducing unnecessary churn compared to daily-rebalancing strategies.",
      "When TQQQ falls below its 200-day moving average (bear mode), the strategy shifts to opportunistic dip-buying. The first gate checks if TQQQ RSI(10) is below 31; if so, it buys TECL (3x Technology) as the most beaten-up leveraged tech proxy. If TQQQ RSI isn't that extreme, it checks SOXL RSI(10) below 30 and buys SOXL (3x Semiconductors) as an alternative crash entry. These two sequential checks are designed to capture violent capitulation bounces in tech and semiconductor markets during corrections.",
      "If neither dip-buy condition triggers in bear mode, the strategy evaluates TQQQ relative to its 20-day moving average. If TQQQ is also below the 20d MA, it runs a relative RSI filter between SQQQ (3x inverse QQQ) and BSV (short-term bonds), selecting whichever shows higher RSI(10), either profiting from continued Nasdaq decline or rotating to capital preservation. If TQQQ is below its 200d MA but above the 20d MA, the strategy holds TQQQ outright, trusting the shorter-term uptrend to continue within the longer-term downtrend context."
    ],
    "signals": [
      {
        "name": "TQQQ 200-Day MA Trend Gate",
        "tag": "200d-ma",
        "description": "Primary regime filter: TQQQ's own price vs. its 200d MA. Above = bull mode (80% TQQQ allocation with RSI guard). Below = bear mode (dip-buying and defensive logic). Distinct from strategies using SPY as the trend reference."
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
    "risk_profile": "Aggressive. A 47.4% max drawdown over ~14.7 years (3,693 trading days) reflects both the strategy's risk management guardrails and the unavoidable severity of 3x leveraged ETF drawdowns. The 62.3% annualized standard deviation is high. Using TQQQ's own 200d MA (rather than SPY's) as the primary gate means the strategy can flip to bear mode purely from leveraged-instrument volatility, TQQQ can cross below its 200d MA while QQQ remains in uptrend. The 5% rebalance corridor reduces friction costs but allows the portfolio to drift significantly between rebalance events. UVXY decays rapidly from VIX futures roll costs and is not suitable as a long-term hold; it functions here only as a short-term hedge during overbought extremes."
  },
  {
    "slug": "tqqq-long-term",
    "name": "TQQQ For The Long Term (Original)",
    "symphony_url": "https://app.composer.trade/symphony/HukRwDJLlYPLMbrQbua5/details",
    "symphony_id": "HukRwDJLlYPLMbrQbua5",
    "annualized_rate_of_return": 1.6229876028488937,
    "max_drawdown": -0.5362580115514187,
    "cumulative_return": 1623611.20264,
    "calmar_ratio": 3.0265050924899324,
    "sharpe_ratio": 1.8388848147368921,
    "standard_deviation": 0.6300467088921959,
    "min": -0.22093821568942096,
    "mean": 0.004597552879193708,
    "median": 0.00394669236443157,
    "max": 0.5001157155039526,
    "trailing_one_month_return": 0.02359370834427943,
    "trailing_three_month_return": -0.007897918517005609,
    "trailing_one_year_return": 0.4340812436942043,
    "backtest_days": 3736,
    "description": "A TQQQ buy-and-hold strategy with systematic risk management: uses SPY's 200-day moving average to switch between bull-market momentum and bear-market defense, with dual overbought guards on TQQQ and SPXL, RSI-triggered dip-buying on TECL and UPRO, and bear-market RSI filtering between SQQQ and TLT.",
    "tags": [
      "rsi",
      "200d-ma",
      "leveraged-etfs",
      "momentum",
      "inverse-etfs",
      "original"
    ],
    "last_updated": "2026-08-17",
    "ai_summary": [
      "This is a TQQQ buy-and-hold core wrapped in a comprehensive risk-management overlay. SPY's 200-day moving average sets the bull/bear regime; in bull markets it runs TQQQ with dual overbought guards on TQQQ and SPXL plus RSI-triggered dip-buying into TECL and UPRO, and in bear markets it filters between SQQQ and the TLT bond hedge by RSI. The purpose is to hold leveraged Nasdaq exposure for the long term while having layered, rules-based defenses against the drawdowns that destroy unhedged 3x positions.",
      "Across roughly 15 years it compounds at 165% annualized with a strong 1.86 Sharpe and 3.08 Calmar. The headline risk is a 54% max drawdown and 63% volatility, among the deeper drawdowns here, a reminder that even a well-engineered overlay cannot fully tame 3x exposure. The long, multi-cycle backtest and the explicit bond-hedge bear branch are its strengths; it fits a long-horizon investor who wants leveraged tech with genuine defensive machinery rather than naked buy-and-hold."
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
    "risk_profile": "Aggressive with a deeper max drawdown than its structure would suggest. The 165.4% ARR is marginally higher than Holy Grail (153.9%) over the same 14.7-year backtest, but the 53.6% max drawdown is significantly worse than Holy Grail's 47.4%. Using SPY's 200d MA as the gate means the strategy can remain in bull mode while TQQQ is already declining, creating a lag between macro trend breaks and the strategy's defensive pivot. The daily rebalance reduces drift but increases transaction friction. The SQQQ dip-buy signal is counterintuitive and adds complexity. Standard deviation of 62.8% matches Holy Grail closely, confirming both strategies spend similar time in high-volatility leveraged positions."
  },
  {
    "slug": "wooden-arkk",
    "name": "Wooden ARKK Machine 2.2",
    "symphony_url": "https://app.composer.trade/symphony/kl2dR0Rlp4RgZUHAJY2k/details",
    "symphony_id": "kl2dR0Rlp4RgZUHAJY2k",
    "annualized_rate_of_return": 2.2487163056155235,
    "max_drawdown": -0.4452692971937168,
    "cumulative_return": 149.246963,
    "calmar_ratio": 5.050238854975908,
    "sharpe_ratio": 2.1514670379746264,
    "standard_deviation": 0.644078544295681,
    "min": -0.19963104712261714,
    "mean": 0.005498864118725548,
    "median": 0.0019932398241524485,
    "max": 0.28322470075679007,
    "trailing_one_month_return": -0.017062594333232095,
    "trailing_three_month_return": 0.04418556535955398,
    "trailing_one_year_return": 0.9663543749239454,
    "backtest_days": 1071,
    "description": "A bi-directional mean-reversion strategy built around ARKK's leveraged siblings. Compares IEI and SPHB RSI to determine the market regime, then buys the single worst recent performer from either a long leveraged pool (risk-off) or an inverse ETF pool (risk-on).",
    "tags": [
      "rsi",
      "momentum",
      "leveraged-etfs",
      "mean-reversion",
      "inverse-etfs"
    ],
    "last_updated": "2026-08-17",
    "ai_summary": [
      "This is a bi-directional mean-reversion strategy built around ARKK's leveraged siblings. It reads the market regime by comparing IEI (treasuries) and SPHB (high-beta) RSI, then buys the single worst recent performer from either a long leveraged pool (when conditions are risk-off and a bounce is likely) or an inverse-ETF pool (when conditions are risk-on and a pullback is likely). The 'buy the biggest loser' mechanic is pure short-horizon mean reversion, with the IEI-versus-SPHB read deciding which direction to fade.",
      "It shows 244% annualized over a 4-year backtest with a 2.25 Sharpe and 5.48 Calmar against a 45% max drawdown. The strong ratios are attractive, but the roughly 1,028-day backtest is relatively short and skewed toward the high-volatility 2021 to 2024 environment in which fade-the-extreme tactics thrive; the same approach can bleed in calm, persistently trending markets where the worst performer keeps losing. Treat the impressive metrics as period-specific and the strategy as a tactical, volatility-dependent mean-reversion play."
    ],
    "how_it_works": [
      "Wooden ARKK Machine 2.2: named after Cathie Wood's ARKK Innovation ETF, operates on a single regime signal: the relative 7-period RSI of IEI (iShares 3-7 Year Treasury Bond ETF) versus SPHB (Invesco S&P 500 High Beta ETF). When bonds show stronger short-term RSI than high-beta equities, the market is in a risk-off or stressed state. When high-beta equities show stronger RSI than bonds, the market is in risk-on mode. This single comparison routes the entire 90% allocated portfolio into one of two diametrically opposed asset pools.",
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
    "risk_profile": "Extremely Aggressive with a short backtest. The 244% ARR and 5.48 Calmar ratio are the highest in this category across ~4.1 years (1,028 trading days from approximately August 2022). This covers only one partial market cycle including the tail end of the 2022 bear and the 2023-2025 bull run, an unusually favorable environment for mean-reversion in both leveraged long and inverse ETFs. Standard deviation of 64.1% is among the highest in the library. The counterintuitive design, buying beaten-up inverse ETFs in bull markets, works in mean-reverting environments but could face extended losses in strongly trending markets where the worst-performing inverse ETF continues to decline. The 44.5% max drawdown indicates the strategy is not immune to trending crashes. Short backtest makes all metrics provisional.",
    "author_note": "Named after Cathie Wood, founder of ARK Invest and the ARKK ETF. TARK (2x long ARKK) and SARK (inverse ARKK) are the anchors of the two pools. Version 2.2 implies prior iterations exist."
  },
  {
    "slug": "super-semiconductors",
    "name": "Super Semiconductors",
    "symphony_url": "https://app.composer.trade/symphony/zTV33nu3o0h5fKpT6IqL/details",
    "symphony_id": "zTV33nu3o0h5fKpT6IqL",
    "annualized_rate_of_return": 1.0037619898120274,
    "max_drawdown": -0.42881858764958114,
    "cumulative_return": 24073.659422999997,
    "calmar_ratio": 2.3407613819023028,
    "sharpe_ratio": 1.6693077484563408,
    "standard_deviation": 0.48367790303924724,
    "min": -0.23488168423766242,
    "mean": 0.003203997108335437,
    "median": 0.0014127908761607522,
    "max": 0.5462989482718346,
    "trailing_one_month_return": 0.082616153354232,
    "trailing_three_month_return": 0.19680939713198287,
    "trailing_one_year_return": 2.548182989645692,
    "backtest_days": 3657,
    "description": "A semiconductor-sector specialist by Dereck Nielsen that selects the top 3 performing semiconductor stocks from a 19-company universe during MACD-bullish bull markets, uses tactical dip-buying and partial bond hedges when MACD turns bearish, and actively shorts semiconductors via SOXS or SSG in bear market conditions.",
    "tags": [
      "rsi",
      "200d-ma",
      "momentum",
      "leveraged-etfs",
      "macd",
      "inverse-etfs"
    ],
    "last_updated": "2026-08-17",
    "ai_summary": [
      "A semiconductor-sector specialist by Dereck Nielsen, this strategy selects the top 3 performers from a 19-company chip universe during MACD-bullish bull markets, switches to tactical dip-buying and partial bond hedges when MACD turns bearish, and actively shorts semiconductors via SOXS or SSG in confirmed bear conditions. It combines stock-level momentum selection (own the strongest chips) with a sector-level MACD regime switch, so it concentrates in winners during uptrends and flips defensive or short when the sector rolls over.",
      "Over a long 14-year backtest it returns 103% annualized with a 1.71 Sharpe, 2.39 Calmar, and a 43% max drawdown, a relatively contained drawdown for a single-sector strategy, helped by the bond hedges and short branches. The multi-cycle test window and the genuine bear-market shorting logic are strengths. Its main characteristic is concentration: by living entirely in semiconductors it is fully exposed to chip-cycle booms and busts, rewarding investors who specifically want active, regime-aware exposure to that sector."
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
    "risk_profile": "Aggressive and sector-concentrated. The 102.6% ARR is lower than pure leveraged-ETF strategies in this library because the primary bull-mode holding is individual semiconductor equities (not 3x ETFs), which contributes to the lower 47.6% standard deviation. The strategy benefits enormously from semiconductor cycle leadership: NVDA's dominance during the AI bull run of 2023-2025 would naturally dominate the top-3 selection. This creates significant single-name concentration risk within an already cyclical sector. The 42.9% max drawdown reflects both the 2022 semiconductor bear market and SOXL dip-buy losses during extended declines. Bear-mode short exposure via SOXS and SSG distinguishes this strategy as one of the few in the library that systematically trade both semiconductor bull AND bear cycles. Attribution: created by Dereck Nielsen.",
    "author_note": "Created by Dereck Nielsen. Strategy description in Composer reads: 'The goal of this strategy is to invest in the semiconductor sector of the market under normal market conditions. Added a MACD feature to this strategy when the semiconductor ETF SMH is trading above the 200 day moving average of SPY.'"
  },
  {
    "slug": "four-horsemen",
    "name": "The Four Horsemen of the Apocalypse",
    "symphony_url": "https://app.composer.trade/symphony/vkJ5YCvzJLBu2KKF6Oy0/details",
    "symphony_id": "vkJ5YCvzJLBu2KKF6Oy0",
    "annualized_rate_of_return": 1.6498424301763515,
    "max_drawdown": -0.4534784051174302,
    "cumulative_return": 1474347.5653600001,
    "calmar_ratio": 3.6381940386976477,
    "sharpe_ratio": 2.1616665773505566,
    "standard_deviation": 0.5080117571811902,
    "min": -0.2172653474198386,
    "mean": 0.004357746176189307,
    "median": 0.0017516633972953777,
    "max": 0.50011563037336,
    "trailing_one_month_return": 0.3036038268303398,
    "trailing_three_month_return": 0.13710468458819114,
    "trailing_one_year_return": 0.9870773668180528,
    "backtest_days": 3672,
    "description": "A multi-component equal-weight strategy combining parallel market-cycle systems: a SPY 200-day trend engine with 5-ETF momentum selection, a shorter-term TQQQ 20-day component, and a secondary SPY regime component, all sharing dual UVXY overbought guards and a cascading bear-market protocol with dip-buying, deep-bear routing, and QQQ cumulative-return detection.",
    "tags": [
      "rsi",
      "200d-ma",
      "momentum",
      "leveraged-etfs",
      "vix-tiers",
      "inverse-etfs"
    ],
    "last_updated": "2026-08-17",
    "ai_summary": [
      "This is a multi-component, equal-weight strategy that runs several market-cycle systems in parallel: a SPY 200-day trend engine with 5-ETF momentum selection, a shorter-term TQQQ 20-day component, and a secondary SPY regime component, all sharing dual UVXY overbought guards and a cascading bear-market protocol that includes dip-buying, deep-bear routing, and a QQQ cumulative-return detector. Equal-weighting independent sub-strategies is a diversification technique: each 'horseman' captures a different timeframe or signal, and blending them smooths the combined equity curve.",
      "Across roughly 14 years it returns 167% annualized with a strong 2.18 Sharpe and 3.68 Calmar against a 45% max drawdown and 51% volatility. The combination of a long backtest, parallel-system diversification, and layered bear protocols gives it one of the more robust risk-adjusted profiles among the original (non-zoop) strategies. The cost is complexity, since many interacting components are harder to audit and carry more parameter risk, but the multi-system design is a deliberate hedge against any single signal failing."
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
    "risk_profile": "Aggressive, but the most structurally diversified strategy in this library's leveraged ETF tier. Running multiple parallel components with different time horizons (SPY 200d MA vs. TQQQ 20d MA) and a deep bear-market protocol with QQQ cumulative-return detection produces a notably better risk-adjusted profile: Sharpe 2.18, Calmar 3.68, and standard deviation of 50.6%, meaningfully lower than Holy Grail (62.3%) or TQQQ Long Term (62.8%) at comparable ARR. The 45.4% max drawdown reflects the 2022 bear market, when all components were simultaneously in bear mode. The SVXY position in bull mode adds tail risk: SVXY can lose 80-90% in a single VIX spike event. The deep bear protocol with QQQ 252d detection provides more nuanced protection than simple RSI dip-buys, but the strategy's logic tree is among the largest and most complex in the library, making manual verification difficult."
  },
  {
    "slug": "soxx-group",
    "name": "SOXX Group",
    "symphony_url": "https://app.composer.trade/symphony/7PBSP926Mp40r6bPnP0j/details",
    "symphony_id": "7PBSP926Mp40r6bPnP0j",
    "annualized_rate_of_return": 1.1200992846468125,
    "max_drawdown": -0.6917425217962425,
    "cumulative_return": 53809.847048,
    "calmar_ratio": 1.619243070005671,
    "sharpe_ratio": 1.4507556921770965,
    "standard_deviation": 0.6730272567111947,
    "min": -0.29827797116083477,
    "mean": 0.0038745957288258003,
    "median": 0.00010884066997696173,
    "max": 0.547088978075231,
    "trailing_one_month_return": 0.0480934931175776,
    "trailing_three_month_return": 0.3094682355960854,
    "trailing_one_year_return": 1.0509322403864756,
    "backtest_days": 3652,
    "description": "A semiconductor-specialist strategy by Garen/DN that uses UVXY's 30-day RSI to detect high-volatility regimes and then trades SOXL or SOXS based on the magnitude of single-day moves in SMH, applying a tiered multi-timeframe RSI cascade called the '30-20-10 Double Pop' to catch mean-reversion after extreme semiconductor swings.",
    "tags": [
      "rsi",
      "momentum",
      "leveraged-etfs",
      "mean-reversion",
      "standard-deviation",
      "inverse-etfs"
    ],
    "last_updated": "2026-08-17",
    "ai_summary": [
      "A semiconductor specialist by Garen/DN, this strategy uses UVXY's 30-day RSI to detect high-volatility regimes, then trades SOXL or SOXS based on the size of single-day moves in SMH, applying a tiered multi-timeframe RSI cascade it calls the '30-20-10 Double Pop' to catch mean reversion after extreme semiconductor swings. The design is explicitly volatility-gated mean reversion: it only engages when chips are moving violently, and uses nested RSI timeframes to time the snapback in either direction.",
      "Over a long 14-year backtest it returns 111% annualized, but the risk is severe: a 69% max drawdown, 66% volatility, and the weakest risk-adjusted figures of this group (1.46 Sharpe, 1.61 Calmar). The noteworthy characteristic is that the strategy takes very large losses relative to its returns, since fading extreme single-sector moves works until a move keeps going, and 3x chip ETFs punish a wrong-way bet harshly. It is a high-conviction, high-pain semiconductor tool, not a balanced allocation."
    ],
    "how_it_works": [
      "SOXX Group: full name 'K Wave V6 (w/ SOXX Double Pops) Pure SOXX l Garen/DN', is built on a single thesis: semiconductor ETFs (SOXX/SMH/SOXL) tend to experience outsized single-day moves followed by mean-reversions, and these moves are more predictable during periods of elevated market volatility. The outer gate checks RSI(UVXY,30d) > 63. When UVXY's 30-day RSI is this elevated, the strategy enters 'high volatility' mode where daily magnitude triggers become active. The specific thresholds (-3%, -5.5%, -7% for down days; +3.5%, +4.5%, +5.5% for up days) represent different tiers of 'pop' severity, each carrying a different expected reversal profile.",
      "The '30-20-10 Double Pop' is the strategy's core signal system. After a significant single-day move, it evaluates SMH's RSI across three decreasing windows: 30-day, 20-day, and 10-day. Thresholds escalate tighter at shorter windows (RSI > 70 at 30d, > 75 at 20d, > 80 at 10d). If any threshold is breached, the strategy holds SOXS, betting that a recent extreme pop is about to fade. RSI(SMH,10d) < 30 inverts the logic and triggers a SOXL buy for extreme oversold conditions. If no RSI threshold fires, the strategy uses SPY RSI(60d) > 50 and a bond-market check (RSI(IEF,200d) vs TLT) to route into either the 'Double Pop Bot' component or the 'SOXL FTLT' component.",
      "The 'SOXL FTLT' (For The Long Term) sub-component is an embedded longer-term fallback that runs when no short-term mean-reversion signal is active. It checks MaxDD(SPY,10d) > 6 (recent drawdown exceeding 6%) to classify the immediate market environment as bear or bull, then uses CumRet(SVXY,5d) > 0 and RSI(TQQQ,60d) > 50 to select between SOXL and BSV via a momentum filter. In plain terms: when the semiconductor pop system gives no strong signal, the strategy defaults to a SPY/SVXY/TQQQ-based momentum classifier. The 69.2% max drawdown (among the highest in the library) reflects SOXL's inherent volatility and the strategy's willingness to maintain long semiconductor exposure even through major semiconductor bear markets."
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
    "risk_profile": "Extremely Aggressive. The 69.2% max drawdown is among the highest in this library, explained by the strategy's willingness to stay in SOXL (3x semiconductors) through extended bear markets. The 66.2% annualized standard deviation reflects both SOXL's inherent volatility amplification and the frequent switching between SOXL and SOXS. The 14.3-year backtest (3,609 days) covers multiple semiconductor cycles. The Calmar ratio of 1.61 and Sharpe of 1.46 are among the weakest in the leveraged semiconductor tier, suggesting the 'Double Pop' logic does not dramatically improve raw buy-and-hold SOXL risk-adjusted returns despite its complexity. Attribution: created by Garen/DN.",
    "author_note": "Created by Garen and DN, as credited in the strategy group name 'K Wave V6 (w/ SOXX Double Pops) Pure SOXX l Garen/DN'. The 'K Wave' name references Kondratiev waves, long-term (40-60 year) economic cycles that Garen likely uses as a macro framework. This is version 6 of the K Wave series."
  },
  {
    "slug": "soxl-growth-rl",
    "name": "SOXL Growth (Original)",
    "symphony_url": "https://app.composer.trade/symphony/CW8oWU12S6vEvn2Hh7jD/details",
    "symphony_id": "CW8oWU12S6vEvn2Hh7jD",
    "annualized_rate_of_return": 1.3766719119115711,
    "max_drawdown": -0.8784363408490792,
    "cumulative_return": 623303.712024,
    "calmar_ratio": 1.5671846073454876,
    "sharpe_ratio": 1.4381631507684132,
    "standard_deviation": 0.8566820115141088,
    "min": -0.3859297474788004,
    "mean": 0.004889081352721241,
    "median": 0.0041305557551114536,
    "max": 0.546299365843538,
    "trailing_one_month_return": -0.22913019227301568,
    "trailing_three_month_return": -0.5321247078101358,
    "trailing_one_year_return": 0.4868671587320865,
    "backtest_days": 3883,
    "description": "A machine-learning optimized SOXL strategy (the 'RL' stands for Reinforcement Learning) that uses standard deviation of returns alongside RSI and drawdown thresholds to navigate between long semiconductor exposure, inverse ETFs, and diversified leveraged baskets, with hyper-precise numeric thresholds that reveal its algorithmic origin.",
    "tags": [
      "rsi",
      "momentum",
      "leveraged-etfs",
      "standard-deviation",
      "inverse-etfs",
      "original"
    ],
    "last_updated": "2026-08-17",
    "ai_summary": [
      "This is a machine-learning-optimized SOXL strategy (the 'RL' stands for Reinforcement Learning) that uses standard deviation of returns alongside RSI and drawdown thresholds to navigate between long semiconductor exposure, inverse ETFs, and diversified leveraged baskets. The hyper-precise, oddly specific numeric thresholds betray its algorithmic origin: rather than round human-chosen levels, the boundaries were fitted by an optimization process searching for the best historical configuration.",
      "It returns 143% annualized over a long 15-year backtest but carries the second-deepest drawdown in the entire library at 82%, with extreme 85% volatility and weak 1.47 Sharpe and 1.74 Calmar ratios. Two cautions dominate. First, an 82% drawdown means the strategy lost more than four-fifths of peak value at its worst, which few investors could hold through. Second, RL and optimized strategies are especially prone to overfitting, because thresholds tuned to maximize a past backtest often degrade out-of-sample. The long test window helps, but the algorithmic curve-fitting risk and catastrophic drawdown are the headline concerns."
    ],
    "how_it_works": [
      "SOXL Growth v2.4.5 RL takes its name from its generation method: 'RL' indicates Reinforcement Learning, a machine-learning technique where an agent learns optimal decisions through trial and reward signals on historical data. The tell is in the thresholds, human-designed strategies use round numbers (RSI > 50, drawdown > 50%), while RL-optimized strategies produce values like RSI(SOXL,32d) <= 62.1995, StdDev(SOXL,105d) <= 4.9226, and RSI(SOXL,30d) >= 57.49. These precise decimals are the fingerprints of an optimizer that tested thousands of parameter combinations. The strategy integrates two categories of signals most strategies ignore: standard deviation of returns (volatility-of-volatility) and maximum drawdown thresholds on the instruments themselves.",
      "The outer gate uses MaxDD(SOXL,60d) >= 50: if SOXL has experienced a 50% or greater drawdown within the last 60 trading days, the strategy enters its 'major drawdown' branch. In this branch, the primary reference switches from SOXL to TQQQ: it checks StdDev(TQQQ,14d) and StdDev(TQQQ,100d) to classify short-term and long-term volatility. Low volatility on both timeframes suggests a potential recovery, routing into [SOXL, TQQQ, SPXL] momentum filter. High short-term volatility but positive RSI(TQQQ,30d) routes to SPXL or SOXS depending on recent vol. A CumRet(TQQQ,8d) <= -20 check catches 8-day crash scenarios and re-enters SOXL as a dip-buy. MaxDD(TQQQ,200d) <= 65 triggers the inverse basket [TMV, SQQQ, SPXS].",
      "When SOXL has NOT experienced a 50%+ drawdown in 60 days (normal regime), the strategy routes through RSI(SOXL,32d) <= 62.2 as a secondary gate. In the RSI-below-threshold path, it checks long-term volatility (StdDev(SOXL,105d) <= 4.92), low long-term vol just holds SOXL outright. Higher long-term vol activates RSI(SOXL,30d) >= 57.49 and StdDev(SOXL,30d) >= 5.41 for current-month assessment: a combination of elevated 30d RSI and high 30d volatility leads to SOXS, otherwise to [SOXL, SPXL, TQQQ] filter. The deep drawdown check CumRet(SOXL,32d) <= -12 re-enters SOXL on a 32-day crash. The 82.5% max drawdown, the highest in this library, reflects the strategy's commitment to SOXL even in bear markets, with inverse ETF positions providing only periodic protection."
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
        "description": "Bear-mode short basket: Filter top-? of [TMV, SQQQ, SPXS]. TMV (3x inverse long-duration bonds), SQQQ (3x inverse QQQ), SPXS (3x inverse S&P500). Activates when TQQQ 30-day trend is negative or TQQQ 200-day MaxDD exceeds 65%."
      }
    ],
    "risk_profile": "Extremely Aggressive: the second-highest max drawdown (82.5%, behind Inside Nancy Pelosi's Chips) and the highest standard deviation (84.6%) in this library. Both figures reflect SOXL's 3x leverage on semiconductors combined with a strategy that stays long through most downturns, relying on RL-optimized thresholds to exit at precise points rather than using broad regime filters like the 200d MA. The 15.3-year backtest (3,840 days) is the longest in the library, giving the RL-optimized parameters more historical basis. However, the precise thresholds may be overfit to historical SOXL/TQQQ behavior and could perform differently in new market regimes. The Calmar ratio of 1.74 and Sharpe of 1.47 are modest for the risk taken. The -47.3% trailing 1-month return recorded at the time of data fetch illustrates the strategy's capacity for catastrophic short-term losses."
  },
  {
    "slug": "nancy-pelosi-chips",
    "name": "Inside Nancy Pelosi's Chips - V3",
    "symphony_url": "https://app.composer.trade/symphony/HgK8mCeBnH4fQFNcfZ7q/details",
    "symphony_id": "HgK8mCeBnH4fQFNcfZ7q",
    "annualized_rate_of_return": 0.7562367938140173,
    "max_drawdown": -0.8624688857115269,
    "cumulative_return": 2630.968763,
    "calmar_ratio": 0.876827913844255,
    "sharpe_ratio": 1.1138655628196876,
    "standard_deviation": 0.7630938160096957,
    "min": -0.3051388656508687,
    "mean": 0.0033729520748169164,
    "median": 0.00206146877694513,
    "max": 0.5462985573365828,
    "trailing_one_month_return": 0.14047731265732377,
    "trailing_three_month_return": 0.017451208618058045,
    "trailing_one_year_return": -0.1859503684676701,
    "backtest_days": 3523,
    "description": "A semiconductor mean-reversion strategy named after Nancy Pelosi's famous chip stock trading, using 5-day SOXX cumulative returns to detect weekly momentum extremes and then trading SOXL or SOXS at the reversal point, while applying individual RSI checks on NVDA and AMD to catch extreme overbought and oversold conditions in the key stocks.",
    "tags": [
      "rsi",
      "momentum",
      "leveraged-etfs",
      "mean-reversion",
      "inverse-etfs"
    ],
    "last_updated": "2026-08-17",
    "ai_summary": [
      "Named after the well-publicized chip-stock trading, this is a semiconductor mean-reversion strategy that uses 5-day SOXX cumulative returns to detect weekly momentum extremes, then trades SOXL or SOXS at the reversal point, while applying individual RSI checks on NVDA and AMD to catch extreme overbought and oversold conditions in the two bellwether names. The thesis is short-horizon reversion in chips: fade weekly extremes and lean on the most influential individual stocks to confirm the turn.",
      "This is the weakest risk-adjusted profile in the library, and its metrics should be read as a cautionary example: 73% annualized over roughly 14 years, but an 86% max drawdown, the deepest here, with a 1.10 Sharpe and a Calmar of just 0.85, meaning the annualized return is actually smaller than the maximum loss endured to earn it. Fading single-sector momentum without a strong regime gate exposes it to ruinous trends where the 'extreme' keeps extending. The long backtest only underscores that the poor ratios are structural, not a small-sample artifact; this strategy illustrates how high single-sector leverage can produce large returns and unacceptable risk simultaneously."
    ],
    "how_it_works": [
      "Inside Nancy Pelosi's Chips - V3 is named after U.S. House Speaker Nancy Pelosi, whose family made large and well-timed trades in semiconductor stocks including NVDA and AVGO during the period when the CHIPS and Science Act (2022) was being debated and signed into law. The strategy's name is an editorial comment on the information advantage that public officials might have in chip-sector legislative timing. The strategy itself uses purely technical signals, no news or legislative calendars, but focuses exclusively on the same semiconductor universe that made Pelosi's trades famous.",
      "The primary logic is a 5-day return mean-reversion framework on SOXX. When SOXX has gained more than 5% in the past five trading days (a strong week), the strategy checks whether today's 1-day return is negative (CumRet(SOXX,1d) < -2): if yes, it buys SOXL on the intraday dip within the strong week, betting the uptrend continues. If the day is not down, it holds SOXS, betting the strong week has already over-extended. The mirror logic applies in the bearish case: CumRet(SOXX,5d) < -5 (weak week) with a positive day (> 2%) triggers SOXS (fading the dead-cat bounce), while a flat or down day triggers SOXL as a continuation dip-buy.",
      "In the normal regime (no extreme 5-day SOXX move), the strategy uses NVDA and AMD's individual RSI at very tight thresholds. RSI(NVDA,8d) > 90 and RSI(AMD,8d) > 90 are extreme overbought signals (only fire when a stock has gained unusually sharply in 8 days) and trigger SOXS. RSI(NVDA,3d) < 15 and RSI(AMD,3d) < 15 are extreme oversold (3-day RSI below 15 is a severe short-term crash) and trigger SOXL. When neither extreme fires, the strategy uses SOXX's 10-day EMA vs current price as the sector trend: if SOXX is below its EMA (near-term weakness), it holds the chip momentum basket [SOXX, NVDA, AMD, XLE, ENPH]; if SOXX is above EMA (trending up), it rotates to the commodity/energy basket [SPY, DBC, XLE]."
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
        "name": "SOXX EMA(10d) vs Price Regime",
        "tag": "momentum",
        "description": "When no extreme fires: EMA(SOXX,10d) > current SOXX price (SOXX below its 10d EMA, near-term weak) -> Filter [SOXX, NVDA, AMD, XLE, ENPH]. EMA < price (SOXX trending up above EMA) -> Filter [SPY, DBC, XLE]. Counterintuitively, weakness routes to chips while strength routes to broad/commodities, a mild contrarian tilt."
      }
    ],
    "risk_profile": "Extremely Aggressive, with the highest max drawdown in this library at 86.2% and a Calmar ratio of only 0.85 (the only strategy below 1.0). The -4.9% trailing 1-year return recorded at data fetch confirms the strategy has struggled in recent semiconductor cycles. The 74.9% standard deviation reflects constant switching between SOXL (3x long) and SOXS (3x short) without a broader market filter like the SPY 200d MA that most other strategies use to prevent being long during secular bear markets. V3 implies prior versions were revised, V3's structure suggests the author updated the stock-specific RSI thresholds and added the EMA regime filter after earlier versions underperformed."
  },
  {
    "slug": "top-cap-ma-rsi",
    "name": "Top Cap by MA + RSI ETF Hedge",
    "symphony_url": "https://app.composer.trade/symphony/wadbe3IfwvSES5vk6yiu/details",
    "symphony_id": "wadbe3IfwvSES5vk6yiu",
    "annualized_rate_of_return": 1.2312155526271127,
    "max_drawdown": -0.5776215987004468,
    "cumulative_return": 7847.9808760000005,
    "calmar_ratio": 2.1315261676452963,
    "sharpe_ratio": 1.5724264562351493,
    "standard_deviation": 0.63746125291806,
    "min": -0.23446509171593788,
    "mean": 0.003977622773464934,
    "median": 0.0009145052441559276,
    "max": 0.3510621303697856,
    "trailing_one_month_return": -0.05937493156700757,
    "trailing_three_month_return": -0.28024628559411324,
    "trailing_one_year_return": 0.04077668539627766,
    "backtest_days": 2815,
    "description": "A three-branch strategy using SPY's extreme short-term RSI to toggle between UVXY volatility hedge (extreme overbought), leveraged ETF attack (extreme oversold), and momentum selection from a curated mega-cap stock basket spanning value, growth, and crypto-proxy names.",
    "tags": [
      "rsi",
      "momentum"
    ],
    "last_updated": "2026-08-17",
    "ai_summary": [
      "This is a clean three-branch strategy gated by SPY's extreme short-term RSI. When SPY is extremely overbought it rotates into a UVXY volatility hedge; when extremely oversold it attacks with leveraged ETFs; and in the normal middle state it runs momentum selection from a curated mega-cap basket spanning value, growth, and crypto-proxy names. The structure is intuitive (hedge the froth, buy the panic, and otherwise own the strongest large caps) which keeps it far more legible than the deeply nested semiconductor strategies.",
      "Over an 11-year backtest it returns 133% annualized with a 1.64 Sharpe, 2.31 Calmar, and a 58% max drawdown. The notable risk is that drawdown: despite using only RSI and momentum, the leveraged-attack branch and high-beta mega-cap basket still produce deep losses in severe selloffs. Its appeal is simplicity and breadth, a transparent rule set over a diversified large-cap universe, for an investor who wants clear logic and accepts aggressive drawdowns."
    ],
    "how_it_works": [
      "Top Cap by MA + RSI ETF Hedge uses SPY's 6-day RSI as a binary traffic light that routes 100% of the portfolio into one of three distinct modes. The RSI window is unusually short, most strategies in this library use 10-day RSI. A 6-day RSI is more sensitive and therefore more selective: it reaches extreme readings (above 90 or below 28) only during very sharp short-term moves, not routine trending action. The 90 and 28 thresholds are also more extreme than the 79-80 / 30-31 used by most comparable strategies, meaning the hedge and leveraged-attack modes fire infrequently. The vast majority of trading days fall into the normal regime and route to the mega-cap stock basket.",
      "When SPY RSI(6d) >= 90, the portfolio rotates entirely to UVXY. This is an extreme overbought hedge: a 6-day RSI of 90 in SPY indicates SPY has moved almost continuously upward for 6 days, a condition historically followed by short-term pullbacks. UVXY (2x long VIX futures) benefits from both the volatility spike and the reversal momentum. When SPY RSI(6d) <= 28, the strategy swings to its most aggressive allocation: the leveraged attack basket of [TQQQ, LABU, SPXL]. A 6-day RSI of 28 in SPY means the market has fallen almost uninterrupted for 6 days, which often precedes a sharp relief bounce, precisely when holding 3x leveraged long positions offers the highest risk/reward.",
      "The default regime holds a momentum filter from the mega-cap stock universe: WMT (Walmart), MSTR (MicroStrategy, a Bitcoin treasury company), AMZN (Amazon), KO (Coca-Cola), BRK/B (Berkshire Hathaway Class B), AAPL (Apple), and TSLA (Tesla). This basket spans defensive value names (WMT, KO, BRK/B), mega-cap growth (AMZN, AAPL, TSLA), and a crypto proxy (MSTR). The filter selects the top performer by recent momentum, concentrating the position in whichever of these names is currently leading. This creates an unusual hybrid strategy: highly speculative leveraged ETFs at extremes, conservative mega-caps as the baseline."
    ],
    "signals": [
      {
        "name": "SPY RSI(6d) >= 90: UVXY Overbought Hedge",
        "tag": "rsi",
        "description": "When SPY's 6-day RSI reaches 90+, 100% of portfolio goes to UVXY (2x long VIX). The 6-day window and 90 threshold create an extremely selective trigger, firing only during sustained near-vertical SPY rallies, not routine momentum. Much more extreme than the 79-80 thresholds used by most strategies in this library."
      },
      {
        "name": "SPY RSI(6d) <= 28: Leveraged Attack",
        "tag": "rsi",
        "description": "When SPY's 6-day RSI hits 28 or below (extreme oversold), rotates to momentum filter of [TQQQ, LABU, SPXL]. LABU (3x biotech) is an unusual choice rarely seen in other strategies here, adds biotech sector exposure as a potential recovery leader alongside QQQ (TQQQ) and S&P500 (SPXL) leveraged ETFs."
      },
      {
        "name": "Mega-Cap Stock Momentum Filter",
        "tag": "momentum",
        "description": "Default regime: momentum filter over [WMT, MSTR, AMZN, KO, BRK/B, AAPL, TSLA]. Selects the top recent performer. Unique in combining defensive value (WMT, KO, BRK/B), mega-cap tech growth (AMZN, AAPL, TSLA), and a Bitcoin proxy (MSTR). No sector concentration, each name represents a different macro theme."
      }
    ],
    "risk_profile": "Aggressive with meaningfully better risk-adjusted metrics than the pure semiconductor leveraged strategies. The 57.8% max drawdown is the lowest in this sub-category, the Calmar ratio of 2.31 is solid, and Sharpe of 1.64 puts it above most leveraged ETF strategies. The 11-year backtest (2,772 days) is shorter than peers. The MSTR position in the mega-cap basket introduces significant Bitcoin correlation risk that was not present for most of the backtest period (MSTR began its Bitcoin treasury strategy in 2020). The UVXY allocation during extreme overbought conditions carries VIX futures roll decay risk if the hedge fires early before an actual pullback. The LABU (3x biotech) exposure in the leveraged attack basket adds sector volatility beyond the typical TQQQ/SPXL combination."
  },
  {
    "slug": "mean-reversion-py",
    "name": "Mean Reversion Comparison to Python Code",
    "symphony_url": "https://app.composer.trade/symphony/KJqNBGxYyyKuCcEfdHhq/details",
    "symphony_id": "KJqNBGxYyyKuCcEfdHhq",
    "annualized_rate_of_return": 0.8048334377690192,
    "max_drawdown": -0.8165989483582968,
    "cumulative_return": 6349.381229,
    "calmar_ratio": 0.9855920576276381,
    "sharpe_ratio": 1.2354663089210625,
    "standard_deviation": 0.6463478941763371,
    "min": -0.34465142707071783,
    "mean": 0.0031688136789561135,
    "median": 0.0037598634180294743,
    "max": 0.5001155842570386,
    "trailing_one_month_return": 0.023593701629840202,
    "trailing_three_month_return": -0.007898280521130396,
    "trailing_one_year_return": 0.3317730310521376,
    "backtest_days": 3736,
    "description": "A minimalist SPY trend-following strategy with a TQQQ core and a UVXY overbought hedge, originally built to cross-validate a Python backtesting implementation. Uses SPY's moving average as the primary regime gate and TQQQ RSI(10d) as the only secondary signal, choosing between TQQQ, UVXY, or SPY across four simple branches.",
    "tags": [
      "rsi",
      "200d-ma",
      "momentum",
      "mean-reversion"
    ],
    "last_updated": "2026-08-17",
    "ai_summary": [
      "This is a deliberately minimalist SPY trend-follower with a TQQQ core and a UVXY overbought hedge, originally written to cross-validate a Python backtesting implementation. SPY's moving average is the only regime gate and TQQQ's 10-day RSI is the only secondary signal, producing just four simple branches that choose between TQQQ, UVXY, and SPY. Its value is pedagogical: it is the clearest possible illustration of a moving-average regime gate plus a single RSI hedge, with nothing else to obscure the mechanism.",
      "Over roughly 15 years it returns 82% annualized, but the bare-bones design shows in the risk: an 82% max drawdown, 65% volatility, and a Calmar of exactly 1.00, where the annualized return equals the maximum drawdown, the breakeven line for risk-adjusted appeal. With only one hedge and no bond or short branch, it has little defense in a sustained bear market, which is why the drawdown is so deep. It is best understood as a reference implementation and a baseline for what minimal logic achieves, not as an optimized strategy to deploy as-is."
    ],
    "how_it_works": [
      "Mean Reversion Comparison to Python Code was built as a validation tool, its name documents that the Composer symphony was constructed to replicate and compare against a separately coded Python backtesting implementation of the same strategy logic. This makes it structurally one of the simplest strategies in the library, as simplicity is necessary for accurate replication across two environments. The entire decision tree consists of four leaves: UVXY, TQQQ, SPY, or TQQQ (repeated in bear mode). The SPY primary gate checks whether SPY's current price is above its moving average, when true, the market is in an uptrend and the strategy is bullish; when false, the market is in a downtrend.",
      "In bull mode (SPY above its moving average), the strategy then checks RSI(TQQQ,10d) > 79. If TQQQ's 10-day RSI has reached or exceeded 79, the market is considered short-term overbought and the strategy rotates 100% to UVXY as a volatility hedge. This is identical to the logic used by Holy Grail, TQQQ For The Long Term, and The Four Horsemen, the 79 threshold on TQQQ 10d RSI is a standard overbought trigger used across multiple strategies. If RSI is not elevated, the strategy holds TQQQ for the leveraged bull-market upside.",
      "Bear mode (SPY below its moving average) is where this strategy diverges from its relatives. Rather than activating dip-buying on TECL or SOXL, or running a momentum filter between SQQQ and TLT, this strategy simply checks whether TQQQ RSI(10d) > 79. If overbought even in a bear market, it holds SPY outright (not UVXY, the bear-mode overbought response is a downgrade to unlevered equity, not a volatility bet). If RSI is not elevated in bear mode, the strategy holds TQQQ. Holding TQQQ in a sustained bear market explains the 81.7% max drawdown, there is no bear-market exit strategy when RSI is not yet overbought."
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
    "risk_profile": "Aggressive. The 81.7% max drawdown is explained by one design choice: the strategy holds TQQQ as the default in BOTH bull and bear regimes (when RSI is not elevated), with no time-based exit from bear mode and no alternative long-term bear strategy. In a sustained bear market like 2022 or 2008, TQQQ can fall 80-90%+ and the strategy would hold it throughout if RSI remained below 79. The 14.7-year backtest (3,693 days) matches Holy Grail and TQQQ For The Long Term exactly, allowing direct metric comparison. Compared to Holy Grail (ARR 153.9%, MaxDD -47.4%), this strategy achieves only 81.8% ARR at nearly double the max drawdown, illustrating that the Holy Grail's bear-mode dip-buy and defensive rotation logic substantially improves both return AND risk management over this bare-bones implementation. The Calmar ratio of 1.00 is barely above break-even on a risk-adjusted basis."
  },
  {
    "slug": "spy-energy-chips",
    "name": "SPY, Energy, Chips, Commodities",
    "symphony_url": "https://app.composer.trade/symphony/rtyBIBOKEY2cPSbJSQX8/details",
    "symphony_id": "rtyBIBOKEY2cPSbJSQX8",
    "annualized_rate_of_return": 0.7281424072898015,
    "max_drawdown": -0.6533916053431674,
    "cumulative_return": 2099.594783,
    "calmar_ratio": 1.1144042888450858,
    "sharpe_ratio": 1.179841780512557,
    "standard_deviation": 0.6305610482478219,
    "min": -0.260803735165853,
    "mean": 0.002952231229708629,
    "median": 0.002088166229716082,
    "max": 0.32888897726840427,
    "trailing_one_month_return": -0.06155473250662302,
    "trailing_three_month_return": 0.14385143189432337,
    "trailing_one_year_return": 0.013929736884024768,
    "backtest_days": 3523,
    "description": "A two-component strategy combining a VIXM Black Swan Catcher (holding mid-term VIX when volatility has been persistently elevated) with a multi-sector momentum rotator that selects the best performer from a diversified pool spanning semiconductor leaders, broad market, energy, commodities, and clean energy.",
    "tags": [
      "rsi",
      "momentum"
    ],
    "last_updated": "2026-08-17",
    "ai_summary": [
      "This is a two-component strategy. A 'VIXM Black Swan Catcher' holds mid-term VIX futures when volatility has been persistently elevated, providing a crisis hedge, while a multi-sector momentum rotator selects the single best performer from a diversified pool spanning semiconductor leaders, the broad market, energy, commodities, and clean energy. The combination pairs a tail-risk hedge with a breadth-seeking momentum engine, so the strategy aims to rotate into whatever sector is leading while holding insurance for volatility spikes.",
      "Over roughly 14 years it returns 74% annualized with a modest 1.19 Sharpe, a 1.13 Calmar, and a deep 65% max drawdown. The weak Calmar signals the core issue: the sector-momentum sleeve still suffers large drawdowns, and the VIXM hedge, which bleeds during calm markets, drags on returns more than it protects in this configuration. The diversified sector universe is genuinely broad, but the metrics suggest the hedge-plus-rotation balance is not well tuned; it is a moderate strategy whose risk outweighs its return relative to the leveraged peers here."
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
    "risk_profile": "Aggressive but unleveraged in the rotation component. The 65.3% max drawdown comes not from 3x ETFs but from holding concentrated positions in volatile sectors (NVDA, AMD, ENPH) during sector-specific crashes. The 13.8-year backtest (3,480 days) begins around 2012, which means ENPH and AMD's earlier history may be underrepresented. Sharpe of 1.19 and Calmar of 1.13 are among the lowest in the library, reflecting the strategy's lack of leverage (in the rotation mode) alongside a still-significant drawdown. The VIXM component carries moderate roll decay versus UVXY but adds meaningful long-duration protection. The strategy does not use a SPY trend gate, it can remain fully in semiconductor stocks during bear markets unless VIXM RSI triggers, which requires sustained (40-day) volatility elevation rather than an immediate response to the market turning negative."
  },
  {
    "slug": "simons-kmlm-switcher",
    "name": "Simon's KMLM Switcher (Original)",
    "symphony_url": "https://app.composer.trade/symphony/u5iBJE751BM5FKPRJvKf/details",
    "symphony_id": "u5iBJE751BM5FKPRJvKf",
    "annualized_rate_of_return": 6.57839011000929,
    "max_drawdown": -0.3204826645301041,
    "cumulative_return": 6272.914708,
    "calmar_ratio": 20.526508413971822,
    "sharpe_ratio": 2.9833570110566847,
    "standard_deviation": 0.7817100103905877,
    "min": -0.2187873135183842,
    "mean": 0.009254444603618866,
    "median": 0.004926857267817608,
    "max": 0.38701001271777735,
    "trailing_one_month_return": 0.721335692962356,
    "trailing_three_month_return": 0.9686006377108969,
    "trailing_one_year_return": 1.4434119511232142,
    "backtest_days": 1087,
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
    "last_updated": "2026-08-17",
    "ai_summary": [
      "Simon's KMLM Switcher is an aggressive three-layer RSI strategy. An 11-ticker overbought gate routes into UVXY whenever any tracked sector overheats; a sequential dip-buy cascade catches 3x ETF crashes at extreme oversold levels; and a KMLM momentum switch toggles between the two most oversold leveraged ETFs when tech leads, or defensive SQQQ/TLT when managed-futures momentum dominates. The layered design tries to do three jobs at once: hedge froth, buy capitulation, and pick the right regime between leveraged tech and managed-futures defense.",
      "Its backtested numbers are extraordinary (654% annualized, a 3.01 Sharpe, and a 20.42 Calmar against a 32% max drawdown) but the central caveat is the 4-year (1,049-day) backtest. Like the related KMLM Switcher, those ratios lean heavily on the 2021 to 2024 window, where managed-futures diversification and sharp dip-buys looked exceptional; such returns are not a reasonable forward expectation. The strategy is a sophisticated, all-weather-style design, but its short, period-specific test means the spectacular metrics should be discounted far more than those of the 14-year-tested strategies."
    ],
    "how_it_works": [
      "The outermost layer checks RSI(10) on 11 market tickers in sequence: QQQE (equal-weight Nasdaq), VTV (value), VOX (communications), TECL (3x tech ETF), VOOG (S&P 500 growth), VOOV (S&P 500 value), XLP (consumer staples), TQQQ (3x QQQ), XLY (consumer discretionary), FAS (3x financials), and SPY. Thresholds range from 75 (XLP) to 80 (XLY, FAS, SPY), with most set at 79. If any single ticker crosses its threshold, 100% of the portfolio rotates to UVXY (2x long VIX futures). The strategy treats any overbought sector as a systemic early warning, one hot ticker is enough to go defensive. This makes Simon's KMLM Switcher unusual: most strategies rely on 1-2 overbought signals, while this strategy checks 11 in parallel, dramatically increasing the frequency of UVXY rotations.",
      "When none of the 11 overbought conditions fire, the strategy cascades through four dip-buy checks on leveraged ETFs: TQQQ RSI(10) < 30, SOXL RSI(10) < 30, SPXL RSI(10) < 30, and LABU RSI(10) < 25. These are strict oversold thresholds designed to catch 3x ETF capitulation events, moments when a leveraged instrument has fallen so sharply that RSI reaches extreme lows. Each condition is checked in order; the first one that triggers takes 100% of the portfolio. The LABU threshold of 25 is tighter than the others, reflecting biotech's extreme volatility. This layer only activates in specific crash conditions, when a leveraged ETF is genuinely at panic-sell levels, and not during ordinary pullbacks.",
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
        "description": "Sequential RSI(10) < 30 checks on TQQQ, SOXL, and SPXL; RSI(10) < 25 on LABU. Catches extreme 3x ETF capitulation events in tech, semiconductors, broad market, and biotech, each independently checked in order of priority."
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
    "risk_profile": "Extremely Aggressive with a short backtest. The 654% annualized return and 4,533% cumulative return over approximately 4.2 years (1,049 trading days from April 2022) are among the highest in this library, achieved through constant rotation between UVXY hedges, 3x ETF dip-buys, and momentum-switched leveraged positions. The 32% max drawdown is surprisingly moderate given the 77% standard deviation, suggesting the 11-ticker UVXY overbought layer provides meaningful downside protection during sharp sell-offs. However, all figures reflect a specific 4-year window covering the 2022 bear market and the 2023-2025 bull run, a period that may have been unusually favorable for this style of RSI-switching. The 20.4 Calmar ratio and 3.01 Sharpe are the highest in the library. Interpret with significant caution; a longer out-of-sample track record is essential before taking these metrics at face value.",
    "author_note": "'Single pops' in the full symphony name refers to the sequential single-ticker overbought detection: each RSI check fires independently on a single ticker, unlike strategies that require multiple conditions simultaneously. KMLM (KFA Mount Lucas Managed Futures Index Strategy ETF) serves as the macro regime detector, when managed futures momentum outpaces tech, the strategy pivots to defensive or bearish positions."
  },
  {
    "slug": "bnd-vs-sphb",
    "name": "10d BND vs. 10d SPHB (Original)",
    "symphony_url": "https://app.composer.trade/symphony/0HCtnEKGw1PRt8Om77a3/details",
    "symphony_id": "0HCtnEKGw1PRt8Om77a3",
    "annualized_rate_of_return": 0.9765885824683918,
    "max_drawdown": -0.7002444292259902,
    "cumulative_return": 23539.234832,
    "calmar_ratio": 1.3946395597146792,
    "sharpe_ratio": 1.376746713867208,
    "standard_deviation": 0.6433525035020147,
    "min": -0.29827797114339705,
    "mean": 0.003514815258153334,
    "median": 0.0,
    "max": 0.5462990738077973,
    "trailing_one_month_return": -0.1444945875251572,
    "trailing_three_month_return": 0.3957003799872527,
    "trailing_one_year_return": 4.8003394073923555,
    "backtest_days": 3722,
    "description": "A contrarian semiconductor strategy that uses the relative 10-day RSI of BND (total bond market) versus SPHB (high-beta stocks) as a regime signal, buying SOXL when bonds show stronger momentum than high-beta equities and holding cash (SHV) when high-beta stocks lead, with UVXY RSI tiers providing additional nuance within the bond-leading regime.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "mean-reversion",
      "vix-tiers"
    ],
    "last_updated": "2026-08-11",
    "ai_summary": [
      "This strategy is built on a counterintuitive premise: when bonds (BND) are outperforming high-beta equities (SPHB) on a 10-day RSI basis, the strategy buys SOXL (3x semiconductors), the riskiest holding in this library. The logic inverts conventional risk-on thinking. BND momentum exceeding SPHB momentum signals a short-term risk-off sentiment extreme, which the strategy reads as a setup for a sharp reversal in speculative assets. The position is binary: fully in SOXL or fully in SHV (cash), with UVXY RSI tiers providing a separate volatility-based crash guard that can redirect to cash or SOXL depending on implied volatility conditions.",
      "Over approximately 14.7 years, the strategy posts 100.6% annualized returns with a 70% max drawdown, one of the deepest in this library. The backtest begins around May 2011 when SPHB launched, so it excludes both the 2008 financial crisis and the dot-com bust, two periods that would almost certainly produce larger drawdowns. The 100x+ returns are compelling but the 70% drawdown and the extreme SOXL concentration are the defining risk characteristics. This suits only investors who can accept losing most of their portfolio value mid-cycle while trusting that a relative RSI signal between bonds and high-beta stocks is a durable edge in semiconductors."
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
    "risk_profile": "Extremely Aggressive. The 100.6% ARR and 27,498x cumulative return over approximately 14.7 years (3,698 trading days from roughly May 2011 when SPHB launched) are exceptional, but the 70% max drawdown is among the highest in this library. The strategy concentrates exclusively in SOXL (3x leveraged semiconductors) or SHV (near cash) with no middle-ground positions. SOXL alone can lose 80-90% during semiconductor bear markets, which explains the severe max drawdown figure. The 63.7% standard deviation reflects the extreme contrast between these two holdings. The backtest covers 2011-2026 including the 2022 tech bear market (when SOXL fell over 90%), the 2020 COVID crash, and the 2023-2025 AI bull run. The Calmar ratio of 1.44 and Sharpe of 1.41 are respectable given the drawdown severity, but this strategy requires exceptional risk tolerance and very long holding periods to survive inevitable periods of severe loss.",
    "author_note": "The median daily return was not available from the Composer API for this symphony and is displayed as 0.00%. SPHB (Invesco S&P 500 High Beta ETF) launched in May 2011, which is why the backtest cannot extend to the 2008 financial crisis or the dot-com bust despite both BND and SOXL having longer histories."
  },
  {
    "slug": "dip-buying-tech",
    "name": "Dip Buying Tech",
    "symphony_url": "https://app.composer.trade/symphony/98cACZSS00eDg8Kv5BBV/details",
    "symphony_id": "98cACZSS00eDg8Kv5BBV",
    "annualized_rate_of_return": 0.14057179506964523,
    "max_drawdown": -0.2632920730403323,
    "cumulative_return": 35.401992,
    "calmar_ratio": 0.5339005973343975,
    "sharpe_ratio": 0.8178530164886437,
    "standard_deviation": 0.1806703328229983,
    "min": -0.09488416001643507,
    "mean": 0.0005863562567035571,
    "median": 0.0006944679938586384,
    "max": 0.15981515188903028,
    "trailing_one_month_return": 0.023948622645061146,
    "trailing_three_month_return": 0.048317355528030737,
    "trailing_one_year_return": 0.2272159348640217,
    "backtest_days": 6886,
    "description": "A three-branch SPY 200-day MA strategy that holds SPY in bull markets, defaults to XLP (consumer staples) when the market is in a downtrend, and dip-buys XLK (technology ETF) during bear markets when QQQ's 10-day RSI falls below 30, backtested from April 1999 through the dot-com crash as an educational baseline.",
    "tags": [
      "rsi",
      "200d-ma",
      "mean-reversion"
    ],
    "last_updated": "2026-08-11",
    "ai_summary": [
      "Dip Buying Tech is explicitly designed as a backtesting study and educational baseline, not a live portfolio strategy. The author built it to test whether a simple two-signal decision tree (a 200-day moving average trend gate plus a single oversold trigger) could survive the dot-com crash, which the 27.2-year backtest window starting April 1999 directly validates. The logic is three branches: hold SPY in bull markets, retreat to XLP consumer staples as the defensive base in bear markets, and dip-buy XLK technology when QQQ's 10-day RSI falls below 30. No leverage, no exotic tickers, nothing hidden.",
      "The 14.0% annualized return is modest but represents 27-plus years of live-through-it performance including two major crashes and a rate shock, all with a 26.3% max drawdown. Its value is conceptual: it demonstrates that even the simplest possible regime-plus-oversold structure can outperform passive SPY over the long run without leverage. The strategy is intentionally simple enough to explain in one sentence, making it the clearest possible baseline for understanding how more complex strategies in this library build on the same two-signal foundation."
    ],
    "how_it_works": [
      "Dip Buying Tech is one of the simplest strategies in this library: a three-leaf decision tree with a single trend gate and one dip-buy signal. In bull mode, when SPY's current price is above its 200-day simple moving average, the strategy holds SPY outright with 100% allocation. No overbought guards, no leveraged ETFs, no momentum filters. The full Composer name makes the educational intent explicit: 'Dip Buying Tech Below 10d RSI of 30 using XLP as the cash position and XLK as the tech ETF to backtest through the dot com crash.' The strategy was designed as a transparent baseline to test whether adding a single tech dip-buy signal to a SPY 200d MA framework meaningfully improves returns over a 27-year window that includes two catastrophic bear markets.",
      "When SPY crosses below its 200-day moving average, the strategy enters bear mode and shifts to XLP (Consumer Staples Select Sector SPDR Fund) as its default holding. Consumer staples companies generate steady revenues across economic cycles, making XLP one of the most reliable defensive sector rotations. The strategy uses XLP rather than cash or bonds because the 1999 backtest start date predates many bond ETFs, and because XLP provides equity-like returns during mild bear markets while limiting catastrophic losses during severe ones. XLP is essentially the strategy's low-volatility parking position between dip-buy entries.",
      "The one active signal in bear mode is a QQQ RSI dip-buy: when QQQ's 10-day RSI falls below 30, the strategy rotates from XLP to XLK (iShares U.S. Technology ETF). A QQQ RSI(10) below 30 requires a sustained sharp decline in the Nasdaq 100, not a single bad day. During bear markets, tech often leads the decline; when RSI hits extreme oversold levels, the strategy bets on a mean-reversion bounce and positions in the unleveraged XLK. The use of XLK over TQQQ or TECL keeps the risk profile conservative even at the dip-buy entry. When QQQ RSI recovers above 30, the strategy returns to XLP until SPY reclaims its 200d moving average."
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
    "risk_profile": "Conservative relative to the rest of this library. The 14.0% ARR over 27.2 years (6,862 trading days from April 1999) is modest for an unleveraged strategy holding SPY, XLK (1x tech), or XLP at all times. The 26.3% max drawdown reflects exposure to the dot-com crash and 2008 financial crisis, during both of which even XLP's defensive positioning could not prevent meaningful losses. The 18.1% standard deviation is among the lowest in the library. The Calmar ratio of 0.53 and Sharpe of 0.81 are below 1.0, indicating underwhelming risk-adjusted returns relative to the drawdown sustained. The strategy's primary value is educational: its simplicity over a 27-year window including the dot-com bust, 2008 crisis, 2020 COVID crash, and 2022 tech bear makes it a clean benchmark for evaluating what a single RSI dip-buy signal adds to a SPY 200d MA framework.",
    "author_note": "The full Composer name: 'Dip Buying Tech Below 10d RSI of 30 using XLP as the \"cash\" position and XLK as the \"tech\" etf to backtest through the dot com crash. Backtest to April 26th 1999.' The author explicitly positions this as a backtesting study and validation tool rather than a live strategy recommendation."
  },
  {
    "slug": "ob-os-staple-bonds",
    "name": "Ob Os Staple my Bonds (Original)",
    "symphony_url": "https://app.composer.trade/symphony/OmMmeWyyAu0IRN2yOP6k/details",
    "symphony_id": "OmMmeWyyAu0IRN2yOP6k",
    "annualized_rate_of_return": 0.17453913813601396,
    "max_drawdown": -0.19596388135239484,
    "cumulative_return": 80.177229,
    "calmar_ratio": 0.8906699384165926,
    "sharpe_ratio": 1.0400264569387387,
    "standard_deviation": 0.1682159893189087,
    "min": -0.09488401264303392,
    "mean": 0.0006942423784594815,
    "median": 0.0004951091236056193,
    "max": 0.1672160664381923,
    "trailing_one_month_return": 0.01536270699384401,
    "trailing_three_month_return": 0.04785836281864064,
    "trailing_one_year_return": 0.019779062688541682,
    "backtest_days": 6886,
    "description": "A two-signal defensive strategy that buys QQQ when the Nasdaq reaches extreme oversold territory (RSI(10) <= 30) and otherwise holds whichever of XLP (consumer staples) or VBF (Invesco Bond Fund) currently has the lower 10-day RSI, always rotating to the more beaten-up defensive asset. The V0.0 Original baseline from 1999, first in a multi-version series.",
    "tags": [
      "rsi",
      "mean-reversion"
    ],
    "last_updated": "2026-08-11",
    "ai_summary": [
      "Ob Os Staple my Bonds V0.0 is the original baseline of a multi-version strategy series. The name decodes as Overbought/Oversold (Ob/Os) plus Staples (XLP) plus Bonds (VBF). The core logic is continuous relative-value rotation between two defensive assets: whichever of XLP (consumer staples) and VBF (Invesco Bond Fund) currently has the lower 10-day RSI receives the full allocation. This treats RSI as a relative beaten-down signal rather than an absolute threshold, rotating toward whichever defensive asset has been sold down more recently. The single offensive override fires when QQQ's RSI(10) falls to or below 30, rotating the entire portfolio to unleveraged QQQ for a mean-reversion dip-buy.",
      "The result is one of the most conservative profiles in this library: 17.4% annualized with a 19.6% max drawdown across 27.2 years including the dot-com crash, 2008 financial crisis, and 2022 rate shock. That combination of steady compounding and low drawdown reflects what a strategy looks like when its default state is always in something defensive. The V0.0 designation means this page covers only the 1999-start original; the author notes later versions (V0.1 through V0.3) use progressively shorter backtest windows, which typically improves reported metrics. This version is best understood as a long-run reference for defensive RSI rotation behavior across full market cycles."
    ],
    "how_it_works": [
      "Ob Os Staple my Bonds V0.0 is the original baseline of a multi-version strategy series. The name decodes as Overbought/Oversold (Ob/Os) + Staples (XLP) + Bonds (VBF). The strategy operates on a single oversold threshold: when QQQ's 10-day RSI falls to or below 30, it exits its defensive position and buys QQQ outright. A QQQ RSI(10) at or below 30 signals a sustained sharp Nasdaq decline, and the strategy enters expecting a mean-reversion bounce. Unlike most strategies in this library that use leveraged ETFs (TQQQ, TECL, SOXL) for dip-buying, V0.0 holds unleveraged QQQ, reflecting both its 1999 origin date when 3x ETFs did not yet exist and its conservative design philosophy.",
      "When QQQ is not in extreme oversold territory, the strategy runs a two-asset competition between XLP (Consumer Staples Select Sector SPDR Fund) and VBF (Invesco Bond Fund, an actively managed bond fund). It evaluates the 10-day RSI of both and holds whichever has the lower reading, always rotating to the more beaten-up of the two. If XLP has been selling off while VBF has been rising, the strategy holds XLP. If VBF has been declining while staples hold steady, it moves to VBF. The result is a defensive portfolio that continuously tilts toward the asset experiencing more near-term stress, applying mean-reversion logic within an already-conservative two-asset universe.",
      "The multi-version series (V0.0 from 1999, V0.1 from 2007, V0.2 from 2010, V0.3 from 2011) stress-tests the same logic across different market eras. V0.0 is the most demanding test, covering both the dot-com crash (Nasdaq fell 78% from 2000 to 2002) and the 2008 financial crisis. The 19.6% max drawdown over 27.2 years despite those two historic bear markets reflects the protective power of the XLP/VBF defensive default and the QQQ dip-buy's discipline in waiting for RSI(10) <= 30 before entering. VBF (Invesco Bond Fund) is an actively managed bond fund, distinct from passive ETFs like BND or TLT, and its inclusion reflects the instruments available at the 1999 backtest start date."
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
    "risk_profile": "Conservative. The 17.4% ARR over 27.2 years (6,862 trading days from April 1999) reflects consistent defensive positioning with a QQQ dip-buy layer. The 19.6% max drawdown is among the lowest in this library, achieved across a window that includes the dot-com crash, 2008 financial crisis, and 2022 tech bear. The 16.8% standard deviation is among the lowest in the library. The Calmar ratio of 0.89 and Sharpe of 1.04 are modest but earned over a demanding 27-year backtest covering catastrophic bear markets. The trailing 1-year return of 2.9% indicates the strategy has significantly underperformed the broader bull market in recent years, as expected for a strategy that holds unleveraged QQQ only during brief extreme oversold windows and otherwise stays in consumer staples or bonds. VBF (Invesco Bond Fund, ticker BFUGX) is an actively managed intermediate-term bond fund; investors replicating this strategy today might substitute a passive alternative like BND or AGG.",
    "author_note": "The strategy notes four versions by start date in its Composer description: V0.0 (1999), V0.1 (2007), V0.2 (2010), V0.3 (2011). The (23,19,1999) in the symphony name likely refers to a specific backtest start date of November 23 or November 19, 1999. This page covers V0.0 only."
  },
  {
    "slug": "sometimes-tqqq",
    "name": "Sometimes TQQQ (Original)",
    "symphony_url": "https://app.composer.trade/symphony/MyRyWhvbdxTsRfzHmE1U/details",
    "symphony_id": "MyRyWhvbdxTsRfzHmE1U",
    "annualized_rate_of_return": 3.2363128246063866,
    "max_drawdown": -0.4554908735506338,
    "cumulative_return": 1940359024.418434,
    "calmar_ratio": 7.105110140580298,
    "sharpe_ratio": 2.740587231771969,
    "standard_deviation": 0.5877470640538214,
    "min": -0.19943237849779394,
    "mean": 0.006391952774830811,
    "median": 0.0017673067056209746,
    "max": 0.5731658166909426,
    "trailing_one_month_return": 0.020979556527274568,
    "trailing_three_month_return": 0.13953671126945122,
    "trailing_one_year_return": 1.164235782889842,
    "backtest_days": 3732,
    "description": "A five-regime TQQQ framework that runs unconditional RSI dip-buy and overbought gates first, then routes the bull market through Choppy, Bull 1, and Bull 2 sub-strategies and the bear market through Bear 1 and Bear 2, using layered bond vs. equity momentum signals to decide when TQQQ exposure is warranted and when to rotate to SQQQ, GLD, PSQ, or BIL.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "inverse-etfs",
      "200d-ma",
      "vix-tiers",
      "mean-reversion"
    ],
    "last_updated": "2026-08-11",
    "ai_summary": [
      "Sometimes TQQQ earns its name through a priority-first architecture: before any regime analysis, two unconditional safety checks run. If QQQ's 10-day RSI falls below 32, the strategy rotates immediately to TECL (3x tech sector) for an early dip-buy entry. If SPY's 10-day RSI falls below 30, it rotates to UPRO (3x S&P 500). These priority gates can fire regardless of the broader market regime. After the priority checks clear, the strategy routes through five sub-regimes: Choppy, Bull 1, Bull 2, Bear 1, and Bear 2, each deciding whether TQQQ exposure is warranted based on layered bond-versus-equity momentum signals, ultimately choosing between TQQQ, various leveraged alternatives, and defensive positions.",
      "Over approximately 14.7 years the strategy posts 326.5% annualized returns and a roughly 1.9 billion times cumulative return, among the highest backtest figures in this library, with a 45.6% max drawdown that is large in absolute terms but notably restrained relative to those headline numbers. The backtest starts around October 2011 when UVXY launched, excluding 2008 and the early stages of the 2010 flash crash. The 2.76 Sharpe and 7.17 Calmar are exceptional by any standard. The five-regime depth and the priority-gate architecture are the distinguishing design features: the strategy is not 'always TQQQ' or 'sometimes TQQQ based on one signal' but a carefully sequenced decision tree that treats TQQQ as the preferred outcome and routes away from it only under explicit disqualifying conditions."
    ],
    "how_it_works": [
      "'Sometimes TQQQ' describes the strategy's core design principle: TQQQ (3x Nasdaq 100) is the preferred holding, but only under specific conditions — hence 'sometimes.' Two priority checks run before any regime analysis. If QQQ's 10-day RSI falls below 32, the strategy immediately rotates to TECL (3x technology sector ETF), entering tech recoveries slightly above the classic 30 threshold for earlier positioning. If QQQ is not that oversold but SPY's 10-day RSI falls below 30 (a broader market capitulation signal), it rotates to UPRO (3x S&P 500). These two dip-buy gates are unconditional: they fire regardless of what the SPY 200-day moving average or any other regime signal says. Their counterparts at the upper end of the RSI range are overbought exits: if QQQ RSI(10) exceeds 81 or SPY RSI(10) exceeds 80, the strategy buys UVXY (2x long VIX) as an overbought hedge, converting extreme RSI readings into volatility-long positions.",
      "If no RSI extreme is active and SPY is above its simple moving average (bull market), the strategy enters one of three bull sub-regimes. A 60-day SPY RSI reading above 61 signals an extended or choppy bull market, routing to a sub-strategy that compares QQQ's 100-day RSI against VPU (Vanguard Utilities ETF) and uses CORP vs. BIL cumulative returns to choose between UPRO, SPY, SH (1x inverse S&P), or BIL. When the 60-day SPY RSI is below 61 (healthy trend pace), the strategy further splits on TLT vs. PSQ RSI: if TLT RSI is below PSQ RSI, it enters the Bull 1 sub-strategy; otherwise Bull 2. Both sub-strategies target TQQQ as the primary holding, using layered cumulative return comparisons (60-day BND vs. BIL, BND vs. SH RSI, BND vs. QQQ RSI) to confirm bond conditions support staying long 3x Nasdaq, and routing to PSQ (1x inverse Nasdaq), GLD, or SQQQ (3x inverse) when they do not.",
      "When SPY falls below its moving average (bear market), the strategy routes into one of two bear sub-strategies. If QQQ has lost more than 12% over 60 days (Bear 1, deep bear), it distinguishes between a mature bear (QQQ down 20%+ over 252 days, suggesting capitulation near) and an ongoing decline, using QQQ and TQQQ moving averages plus 10-day bounce detection to choose between unleveraged QQQ, TQQQ dip-buys, and SQQQ. In the shallower bear (Bear 2, QQQ down less than 12% over 60 days), TQQQ's own moving average becomes the key gate: above it the strategy seeks exposure through TQQQ or SQQQ based on bond strength; below it the strategy rotates to GLD or SQQQ based on IEF vs. PSQ momentum. The layered architecture means the strategy almost always has a directional opinion rather than defaulting to cash."
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
    "risk_profile": "Extremely Aggressive. The 326.5% ARR and approximately 1.9 billion times cumulative return over ~14.7 years (from UVXY's October 2011 launch through mid-2026) are among the highest backtest figures in this library. The 45.6% max drawdown is large in absolute terms but modest relative to these extraordinary returns, producing an exceptional 7.17 Calmar ratio and 2.76 Sharpe. The 58.6% standard deviation reflects the strategy's frequent 3x leveraged positions in TQQQ, TECL, and UPRO. The last_market_days_holdings show the strategy fully allocated to TQQQ at the time of data collection, illustrating the compounding concentration risk inherent in a $10,000-initial backtest that grew to approximately $19 trillion in the model. The trailing 1-year return of 136.5% reflects the 2025-2026 AI and tech bull market. The strategy's 14.7-year backtest covers the post-2011 secular bull market in tech, the 2020 COVID crash and recovery, and the 2022 tech bear — but misses the 2008 financial crisis. All figures should be interpreted with significant caution given the extreme compounding effect of leveraged ETFs over long periods.",
    "author_note": "The symphony name in Composer is 'Sometimes TQQQ v2'. Authored by Guybogles (Discord: aly9923); last semantic update June 26, 2024. The backtest_days field (3721) is estimated from the API's first_day (15251) and last_market_day (20646) fields, as the size field returned None for this symphony. The backtest begins approximately October 2011 when UVXY first became available. The author notes: 'Please feel free to change the 60d SPY RSI check as well as any VIX ticker to whatever you feel comfortable with.'"
  },
  {
    "slug": "triple-accelerator",
    "name": "Triple Accelerator",
    "symphony_url": "https://app.composer.trade/symphony/0jPwZ5Lm2Y3xH24oEijB/details",
    "symphony_id": "0jPwZ5Lm2Y3xH24oEijB",
    "annualized_rate_of_return": 0.7743958975172593,
    "max_drawdown": -0.6166825567353839,
    "cumulative_return": 4911.296388000001,
    "calmar_ratio": 1.2557447734808391,
    "sharpe_ratio": 1.3608031483217964,
    "standard_deviation": 0.5192441339859464,
    "min": -0.15039553781215198,
    "mean": 0.002803924810617859,
    "median": 0.0033254601008471107,
    "max": 0.5001155817697016,
    "trailing_one_month_return": 0.02698237885036603,
    "trailing_three_month_return": -0.0424831786194092,
    "trailing_one_year_return": 0.20432587169269012,
    "backtest_days": 3734,
    "description": "A three-asset rotation between TQQQ, SPY, and UVXY controlled by two nested gates: a top-level TQQQ RSI(10) overbought check that triggers a UVXY volatility hedge when RSI exceeds 79, and an SPY 200-day moving average gate that routes between TQQQ in the bull case and unleveraged SPY in the bear case.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "200d-ma",
      "vix-tiers"
    ],
    "last_updated": "2026-08-12",
    "ai_summary": [
      "Triple Accelerator is authored by Inverteum Capital as a minimal but purposeful rotation across three assets: TQQQ, SPY, and UVXY. Over approximately 14.8 years from around October 2011 (coinciding with UVXY's inception) through July 2026, the strategy delivers 75.4% annualized returns and 4,053x cumulative growth (roughly $10,000 to $40.5 million), with a 61.7% max drawdown. The 1.34 Sharpe and 1.22 Calmar reflect a strategy that earns strong returns by staying leveraged through bull markets while managing the two main failure modes of 3x leverage: overbought reversals and trend deterioration.",
      "The architecture is deliberately simple: a single TQQQ RSI(10) check runs first -- if RSI exceeds 79, the strategy rotates to UVXY as a volatility hedge against an overbought market. If not, an SPY 200-day moving average gate decides the allocation: TQQQ during confirmed uptrends, unleveraged SPY during downtrends. The result is a three-state machine with about 12.7 annual portfolio switches (annualized turnover). The 56.3% win rate and right-skewed return distribution (skewness 1.15, max single-day gain of 50.0%) suggest a strategy that captures large upside days while the MA gate limits prolonged drawdown exposure."
    ],
    "how_it_works": [
      "Triple Accelerator uses a two-gate decision tree evaluated top-down. The first gate checks TQQQ's 10-day RSI: if it exceeds 79, the strategy allocates entirely to UVXY, a 2x long VIX ETF. This overbought hedge runs unconditionally before any trend analysis, which means the strategy can hold UVXY even in a nominal bull market when leveraged tech has become technically extreme. The intuition is that when TQQQ RSI(10) is above 79 the market has been rising hard, mean-reversion risk is elevated, and a volatility spike from a sudden reversal is the most likely near-term scenario -- UVXY profits from exactly that.",
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
        "description": "UVXY (2x long VIX) is held exclusively when the TQQQ RSI(10) > 79 gate fires. Unlike strategies that hold UVXY in bear markets, Triple Accelerator deploys UVXY as a mean-reversion play targeting volatility spikes off technically overbought peaks."
      }
    ],
    "risk_profile": "Aggressive. The 75.4% ARR and 4,053x cumulative return over approximately 14.8 years place Triple Accelerator among the stronger strategies in this library. The 61.7% max drawdown and 51.8% annualized standard deviation reflect the inherent volatility of a strategy that holds 3x leveraged Nasdaq for the majority of bull-market time. The 1.34 Sharpe and 1.22 Calmar are solid but not exceptional, indicating real but manageable risk relative to returns. The 56.3% win rate means roughly 44% of trading days are negative. The right-skewed distribution (skewness 1.15, kurtosis 20.43) indicates that large single-day gains are more frequent than large single-day losses, with the max single-day return reaching 50.0%. As of the data collection date in late July 2026, the strategy is fully allocated to TQQQ with a modest 4.8% trailing 1-year return and negative recent months, indicating current tech market pressure. The three-state simplicity is both a strength (minimal overfitting risk) and a constraint (no intermediate sub-regimes for choppy or recovering markets).",
    "author_note": "Strategy authored by Inverteum Capital (blog.inverteum.com). The backtest begins approximately October 2011 coinciding with UVXY's inception date, covering roughly 14.8 years of market history including the 2015-2016 volatility spikes, the February 2018 VIX spike, the 2020 COVID crash and recovery, and the 2022 tech bear market. Last semantic update per Composer: 2026-07-29. Symphony ID: 0jPwZ5Lm2Y3xH24oEijB."
  }
];
