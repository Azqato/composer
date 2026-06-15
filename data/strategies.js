// Strategies data — loaded as a script tag so the site works with file:// protocol.
// To update metrics: run scripts/update_metrics.py
// To update content (how_it_works, signals, tags, risk_profile): analyze data/symphony_scores.json
//   and follow the process in RUNBOOK.MD § "Re-Analyzing Strategy Logic Trees"
window.STRATEGIES_DATA = [
  {
    "slug": "zoops-2026-frontrunner",
    "name": "zoop's 2026 Frontrunner",
    "symphony_url": "https://app.composer.trade/symphony/4aI4kVT5cEc0XJpTLei3/details",
    "symphony_id": "4aI4kVT5cEc0XJpTLei3",
    "annualized_rate_of_return": 0.9151825393930761,
    "max_drawdown": -0.2156243977901494,
    "cumulative_return": 228.46185499999999,
    "calmar_ratio": 4.244336674200258,
    "sharpe_ratio": 1.7856658111890469,
    "standard_deviation": 0.4045812835565686,
    "min": -0.15378150618128872,
    "mean": 0.0028668530392616898,
    "median": 0.00010908666491116215,
    "max": 0.5462930005644508,
    "trailing_one_month_return": 0.00843442265403005,
    "trailing_three_month_return": 0.061631209399330755,
    "trailing_one_year_return": 0.10282214114643384,
    "backtest_days": 2107,
    "description": "A momentum-driven strategy designed to front-run emerging market trends by positioning in leading leveraged ETFs before broad participation catches up.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "vix-tiers"
    ],
    "last_updated": "2026-06-08",
    "how_it_works": [
      "The 2026 Frontrunner is a dip-buying strategy that defaults to T-bills (BIL) and only rotates into leveraged ETFs when extreme short-term RSI signals an oversold entry opportunity. The strategy checks RSI(10) — a fast 10-period RSI — against tight thresholds: semiconductors (SMH) below 23, Nasdaq 100 (QQQ) below 28, or S&P 500 (SPY) below 28 each trigger a corresponding 3x leveraged buy (SOXL, TQQQ, or UPRO respectively). Priority is top-to-bottom: semiconductor oversold signals are checked first.",
      "If no oversold condition is detected, the strategy checks for high-volatility or overbought conditions. When consumer discretionary (XLY) RSI exceeds 79, it rotates into VXX (VIX futures ETN) as a volatility hedge. If UVXY RSI exceeds 65, the strategy evaluates SPY's current return vs. its moving-average return: if SPY is trending above its average, it shorts via SPXU; if SPY is underperforming its average, it holds TQQQ instead.",
      "When none of the above conditions fire, the strategy defaults to BIL — a 1-3 month T-bill ETF that earns risk-free interest while waiting for the next actionable signal. This cash-first, extremes-only approach means the Frontrunner is often inactive, making each entry more deliberate than a buy-and-hold strategy. It is also the base component (50% weight) shared by all other symphonies in this library."
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
    "risk_profile": "Aggressive. Despite spending most of its time in T-bills, the Frontrunner concentrates entries in 3x leveraged ETFs at the most volatile market extremes — buying into oversold conditions that can continue lower before recovering. The ~21.6% max drawdown is lower than other leveraged strategies in this library because time-in-market is limited, but individual entries at RSI extremes carry significant short-term reversal risk. Best suited for investors who want systematic dip-buying exposure rather than constant equity allocation.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-holy-grail-2026",
    "name": "zoop's Holy Grail (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/Y2xvfu7iFNyO6up77gBI/details",
    "symphony_id": "Y2xvfu7iFNyO6up77gBI",
    "annualized_rate_of_return": 1.1302210816552938,
    "max_drawdown": -0.44668658859672916,
    "cumulative_return": 44142.148724,
    "calmar_ratio": 2.5302328534328637,
    "sharpe_ratio": 1.6549281024810618,
    "standard_deviation": 0.5442549683781089,
    "min": -0.15378151525570216,
    "mean": 0.0035742176273169607,
    "median": 0.0020726155521757494,
    "max": 0.5462990875317417,
    "trailing_one_month_return": 0.1979798553869847,
    "trailing_three_month_return": 0.6246588086989904,
    "trailing_one_year_return": 1.1917190696458673,
    "backtest_days": 3563,
    "description": "A multi-signal strategy combining RSI, moving average, and volatility filters to achieve exceptional risk-adjusted returns across full market cycles.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "200d-ma",
      "vix-tiers"
    ],
    "last_updated": "2026-06-08",
    "how_it_works": [
      "The Holy Grail is a 50/50 equal-weight combination of the 2026 Frontrunner and an extended signal block. The second component begins with the same RSI(10) oversold checks as the Frontrunner — buying SOXL, TQQQ, or UPRO on semiconductor/Nasdaq/S&P extreme dips — then runs 14 overbought detection checks before proceeding to its default logic.",
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
        "description": "RSI >79 checks across 8 ETFs plus relative RSI comparisons for sector rotation — any single hit routes to SH."
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
    "risk_profile": "Aggressive. The 14-layer overbought cascade and TQQQ SMA gate provide meaningful downside protection, but ~44.7% max drawdown reflects periods where conditions deteriorate faster than the signals respond. With standard deviation of 54.4%, this is among the more volatile strategies in the library. The extraordinary cumulative return (44,142x) is real but comes with commensurate multi-year drawdown exposure.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-tqqq-long-term-2026",
    "name": "zoop's TQQQ FOR THE LONG TERM (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/yIMvLUHfzAMATCpOKr9T/details",
    "symphony_id": "yIMvLUHfzAMATCpOKr9T",
    "annualized_rate_of_return": 1.1079557035655756,
    "max_drawdown": -0.46103701562730537,
    "cumulative_return": 38046.546055,
    "calmar_ratio": 2.4031816665697585,
    "sharpe_ratio": 1.6296737117401858,
    "standard_deviation": 0.5472908196117655,
    "min": -0.15378149803990993,
    "mean": 0.0035393073865001364,
    "median": 0.002084715720479524,
    "max": 0.5462990790326507,
    "trailing_one_month_return": 0.1979798353539508,
    "trailing_three_month_return": 0.4584318521352049,
    "trailing_one_year_return": 1.0742652993899862,
    "backtest_days": 3563,
    "description": "A long-term TQQQ holding strategy with systematic safety exits to survive major market drawdowns — designed for investors who believe in Nasdaq 100 long-term growth but need protection against devastating losses.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "200d-ma",
      "vix-tiers"
    ],
    "last_updated": "2026-06-08",
    "how_it_works": [
      "TQQQ FOR THE LONG TERM (FTLT) is built around one central question: is SPY above or below its simple moving average? This SMA comparison is the primary trend gate for the second component (50% weight). When SPY is in an uptrend and SPXL (3x S&P 500) RSI is below 80, the strategy defaults to holding TQQQ — leveraged Nasdaq exposure during confirmed broad market uptrends. The Frontrunner component (the other 50%) runs in parallel, adding RSI(10) oversold dip-buying for semiconductors, Nasdaq, and S&P.",
      "The second component also includes a single-asset overbought check: if RSI(SMH) — semiconductors — exceeds 79, it routes to SH rather than TQQQ, treating semiconductor overextension as a warning for the broader tech-heavy Nasdaq exposure. This is a simplified version of the more elaborate overbought cascade in Holy Grail.",
      "When SPY breaks below its SMA, the strategy shifts to dip-buying mode rather than simply holding cash. It checks TQQQ RSI <31 to buy TECL (3x tech), SPY RSI <30 to buy SPXL (3x S&P), and then works through tiered UVXY checks at 65, 74, and 84 before defaulting to TQQQ or SH based on TQQQ's own price vs. SMA. This bearish-regime protocol only re-enters on extreme oversold signals."
    ],
    "signals": [
      {
        "name": "SPY SMA Gate",
        "tag": "200d-ma",
        "description": "SPY price vs. simple moving average is the primary trend classifier — determines uptrend mode vs. bear-recovery mode."
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
        "description": "TQQQ RSI <31 triggers TECL entry; SPY RSI <30 triggers SPXL — contrarian entries during downtrends."
      },
      {
        "name": "Leveraged ETFs",
        "tag": "leveraged-etfs",
        "description": "TQQQ is the default uptrend hold; TECL and SPXL used for bear-regime dip entries."
      }
    ],
    "risk_profile": "Aggressive. The SPY SMA gate and UVXY filters reduce the frequency of destructive leveraged holds, but ~46.1% max drawdown shows that major trend breaks can produce substantial losses before exit signals trigger. The 'long term' framing is appropriate — this strategy requires a multi-year horizon to survive drawdown periods and benefit from the compounding math.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-excellent-adventure-2026",
    "name": "zoop's Excellent Adventure (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/YIiBr33X4rRTVlOWhCNq/details",
    "symphony_id": "YIiBr33X4rRTVlOWhCNq",
    "annualized_rate_of_return": 1.2312268519064586,
    "max_drawdown": -0.45642494775588927,
    "cumulative_return": 84996.108341,
    "calmar_ratio": 2.6975450355201844,
    "sharpe_ratio": 1.8252538621432777,
    "standard_deviation": 0.5083875831914649,
    "min": -0.16154382257391187,
    "mean": 0.0036822873003409056,
    "median": 0.0012689826240455115,
    "max": 0.5462991181026375,
    "trailing_one_month_return": 0.12597476562015086,
    "trailing_three_month_return": 0.642553995269153,
    "trailing_one_year_return": 1.9080229951845054,
    "backtest_days": 3563,
    "description": "An adventurous multi-asset leveraged strategy that aggressively pursues compounding through dynamic rotation across high-momentum instruments.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "200d-ma",
      "vix-tiers"
    ],
    "last_updated": "2026-06-08",
    "how_it_works": [
      "The Excellent Adventure shares its structural skeleton with the Holy Grail — a 50/50 split between the Frontrunner and an extended signal block with the same 14 RSI overbought checks across tech ETFs and sector rotation comparisons. Any overbought trigger routes to SH. The critical distinction is in what happens when all 14 checks pass and volatility is normal.",
      "After clearing the overbought cascade and the UVXY >65 check, the strategy adds two more RSI guards that are not present in Holy Grail: QQQ RSI >80 or SPY RSI >80 both trigger SH. Then RSI(TQQQ) <31 triggers a TECL dip-buy. The final gate is a cross-asset bond momentum check: RSI(10)(IEF) vs. the baseline RSI. If Treasury bond short-term momentum is positive (IEF's 10-period RSI exceeds the baseline), the strategy holds TQQQ. Otherwise, it defaults to SH.",
      "This IEF momentum confirmation is the 'adventure' — using bond relative strength as a cross-asset signal before equity entry. When short-term Treasuries are gaining momentum, the strategy interprets the macro environment as supportive for risk assets and enters TQQQ. When bond momentum is flat or negative, it waits in SH regardless of how equities look on their own."
    ],
    "signals": [
      {
        "name": "14-Layer Overbought Shield",
        "tag": "rsi",
        "description": "RSI >79 across 8 ETFs plus defensive sector relative RSI checks — any single hit routes to SH."
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
    "risk_profile": "Aggressive. With ~45.6% max drawdown and 50.8% standard deviation, this strategy is at the upper end of the aggressive spectrum. The IEF bond filter and 14-layer overbought cascade are real risk controls, but 3x leverage during confirmed bull phases means individual positions can experience 40-50% losses in sharp reversals. The 1-year trailing return of +190.8% illustrates both the potential and the concentration risk.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-sometimes-tqqq-2026",
    "name": "zoop's Sometimes TQQQ (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/uAaEkEq8cPOmGgfEWTOU/details",
    "symphony_id": "uAaEkEq8cPOmGgfEWTOU",
    "annualized_rate_of_return": 1.8188689659486466,
    "max_drawdown": -0.34904341414414863,
    "cumulative_return": 2319234.4954830003,
    "calmar_ratio": 5.2110107002262085,
    "sharpe_ratio": 2.471982493791462,
    "standard_deviation": 0.46142328092601886,
    "min": -0.14134423073603497,
    "mean": 0.004526310605860866,
    "median": 0.001470997021301157,
    "max": 0.5462991732643412,
    "trailing_one_month_return": 0.13070480441906884,
    "trailing_three_month_return": 0.46331988471156693,
    "trailing_one_year_return": 1.3894893449523078,
    "backtest_days": 3563,
    "description": "A precision timing strategy that holds TQQQ only when multiple independent signals confirm a favorable entry, achieving the highest backtested cumulative return in this library.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "200d-ma",
      "vix-tiers"
    ],
    "last_updated": "2026-06-08",
    "how_it_works": [
      "Sometimes TQQQ is the most complex strategy in the library. It pairs the Frontrunner with a multi-layer decision tree that interrogates bond market conditions, multi-period momentum, and cumulative return thresholds before committing to TQQQ. The strategy truly only holds TQQQ 'sometimes' — when a very specific constellation of cross-asset conditions align. Uniquely, when UVXY RSI exceeds 65, this strategy routes to SH rather than SPXU, making it more conservative on volatility spikes than its siblings.",
      "In uptrend conditions (SPY above SMA), the strategy evaluates 60-period SPY RSI and 100-period QQQ momentum to calibrate between TQQQ and UPRO exposure, with corporate bond (CORP) 60-day cumulative return as a tiebreaker. When Treasury RSI (TLT 20-period) falls below its baseline — signaling rising long rates — the strategy adds further filters: 6-day TQQQ cumulative return thresholds to detect crash conditions, 1-day momentum checks, and multi-period RSI from BND, IEF, and AGG before allowing a re-entry.",
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
    "risk_profile": "Aggressive with exceptional risk management. A Calmar ratio of 5.21 and Sharpe of 2.47 represent one of the best risk-adjusted profiles in the library. The ~34.9% max drawdown and 46.1% standard deviation are still substantial — but among the lowest in the leveraged TQQQ suite. The multi-layer bond and momentum confirmation requirements significantly restrict time-in-risk and improve entry quality.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-safety-checks-2026",
    "name": "zoop's Safety Checks (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/RLt1Rzz79I6Fa2X9QKqY/details",
    "symphony_id": "RLt1Rzz79I6Fa2X9QKqY",
    "annualized_rate_of_return": 1.0235754666069372,
    "max_drawdown": -0.43746880799338306,
    "cumulative_return": 21349.252731,
    "calmar_ratio": 2.3397678826564916,
    "sharpe_ratio": 1.6316422686907408,
    "standard_deviation": 0.5106208734272314,
    "min": -0.14134419993428937,
    "mean": 0.003306153176030379,
    "median": 0.0019706666526155825,
    "max": 0.5462990021169967,
    "trailing_one_month_return": 0.1979797219248418,
    "trailing_three_month_return": 0.48711344121970046,
    "trailing_one_year_return": 1.095861073300207,
    "backtest_days": 3563,
    "description": "A risk-managed leveraged ETF strategy with multiple pre-position safety checks designed to reduce drawdowns while maintaining strong long-term compounding.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "200d-ma",
      "vix-tiers"
    ],
    "last_updated": "2026-06-08",
    "how_it_works": [
      "Safety Checks takes an ensemble voting approach to position sizing. After the Frontrunner component (50% weight), the second half is itself an equal-weight portfolio of 10 independent safety conditions evaluated in parallel. Each condition tests a different aspect of QQQ's market state: 75-day cumulative return vs. moving-average return, 3-day return vs. standard deviation, 20-period EMA vs. SMA, multi-period RSI levels (10-period, 50-period, 100-period), and Price(QQQ) vs. SMA — checked from multiple angles.",
      "Each of the 10 conditions independently routes to either TQQQ (via a Price(SPY) > SMA gate and TQQQ/SPXL RSI check) or SH. Because all 10 are equal-weighted, the combined second component holds TQQQ proportional to how many conditions are currently passing — all 10 passing means near-full TQQQ allocation from this component, 5 of 10 means approximately equal TQQQ and SH.",
      "This consensus-voting structure creates a gradual risk-on/risk-off spectrum rather than binary switching. As market conditions deteriorate across multiple metrics simultaneously, the strategy systematically reduces TQQQ exposure signal by signal. Each condition that passes is a vote for equity; each that fails is a vote for defense. The strategy never has a single catastrophic 'gate open' moment — it degrades gracefully across its ensemble of checks."
    ],
    "signals": [
      {
        "name": "10-Condition QQQ Ensemble",
        "tag": "rsi",
        "description": "Parallel evaluation of cumulative return, EMA, multi-period RSI (10/50/100), and SMA conditions — each independently routes to TQQQ or SH."
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
    "risk_profile": "Aggressive with gradual exposure scaling. The 10-condition ensemble creates a risk-on/risk-off spectrum rather than binary switching, smoothing the transitions that cause large single-period losses in simpler strategies. Still carries a ~43.7% max drawdown, reflecting that simultaneous multi-condition failures during sharp bear markets can produce significant drawdowns before the ensemble fully exits.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-manhattan-project-2026",
    "name": "zoop's Manhattan Project (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/cCi1mupGsluFmre7HpOm/details",
    "symphony_id": "cCi1mupGsluFmre7HpOm",
    "annualized_rate_of_return": 1.53363237058498,
    "max_drawdown": -0.34753548282347213,
    "cumulative_return": 512964.36678599997,
    "calmar_ratio": 4.412879968759841,
    "sharpe_ratio": 2.095146040456704,
    "standard_deviation": 0.5023616424068266,
    "min": -0.1537814863726107,
    "mean": 0.004176670658595195,
    "median": 0.0018214619175200841,
    "max": 0.546299171350038,
    "trailing_one_month_return": -0.0030621340223171423,
    "trailing_three_month_return": -0.09038142009661843,
    "trailing_one_year_return": 0.11040861379967248,
    "backtest_days": 3563,
    "description": "A complex, multi-signal systematic strategy that integrates multiple independent market indicators to construct optimal leveraged positions — approaching market timing as a scientific discipline.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "200d-ma",
      "vix-tiers"
    ],
    "last_updated": "2026-06-08",
    "how_it_works": [
      "The Manhattan Project is the most sophisticated multi-asset symphony in the library. In addition to the Frontrunner (50% weight), it adds a second signal block that routes through Treasury bonds (TLT price and RSI), short-term yields (BIL RSI), and commodity volatility (DBC standard deviation) as cross-market regime classifiers before determining equity exposure. The BIL RSI signal is a key differentiator: when T-bill prices weaken (BIL RSI falls below baseline, signaling rising short-term yields), the strategy turns cautious and routes to SH or TQQQ based on SPY RSI.",
      "When SPY RSI falls below 30 — a very oversold broad market — the strategy triggers one of its most aggressive entries: a diversified basket of eight 3x leveraged ETFs simultaneously (SOXL, TECL, XHB, TQQQ, SPXL, UDOW, FAS, TNA). This 8-ETF leveraged basket treats extreme oversold broad-market conditions as a high-conviction buy signal across all leveraged sectors at once.",
      "In moderate market conditions, the strategy routes through TLT's price vs. SMA and RSI state, SPY's EMA-vs-SMA acceleration, SPY moving-average return comparisons, and DBC standard deviation to select from a wide ETF universe — including inverse tech (TECS, SOXS, SQQQ), Treasury leveraged ETFs (TMF for bull, TMV for bear), energy (ERX), healthcare (CURE), and emerging markets (EEM). This cross-asset routing makes the Manhattan Project capable of being positioned in almost any market regime."
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
    "risk_profile": "Aggressive. A Calmar ratio of 4.41 and Sharpe of 2.10 indicate strong risk-adjusted performance, but ~34.8% max drawdown and 50.2% standard deviation confirm this remains a high-risk allocation. The cross-asset signal depth gives it more regime awareness than simpler strategies, but complexity does not eliminate drawdowns. The recent 3-month return of -9% is a reminder that even sophisticated multi-asset routing can underperform in fast-moving markets.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-kmlm-switcher-2026",
    "name": "zoop's KMLM Switcher (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/4AuTagHMeiS4usdZEuDK/details",
    "symphony_id": "4AuTagHMeiS4usdZEuDK",
    "annualized_rate_of_return": 2.874055952530382,
    "max_drawdown": -0.2946384752957222,
    "cumulative_return": 1609.291459,
    "calmar_ratio": 9.754516784156431,
    "sharpe_ratio": 2.657879531163838,
    "standard_deviation": 0.5688222078739303,
    "min": -0.18946903067033927,
    "mean": 0.005999448028490243,
    "median": 0.0024150909826095024,
    "max": 0.5470862789225439,
    "trailing_one_month_return": 0.290299876640812,
    "trailing_three_month_return": 0.879852285296642,
    "trailing_one_year_return": 1.7439457922122115,
    "backtest_days": 1373,
    "description": "A regime-switching strategy that rotates between KMLM (a managed futures trend-following ETF) and leveraged equity ETFs, positioning for gains in both trending and rallying markets.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "vix-tiers"
    ],
    "last_updated": "2026-06-08",
    "how_it_works": [
      "The KMLM Switcher pairs the Frontrunner with a second component focused on individual leveraged ETF dip-buying and tech-sector relative momentum. After the full 14-layer overbought cascade (which routes to SH on any RSI >79 extreme) and the UVXY volatility check, the strategy evaluates individual oversold readings: TQQQ RSI <30 triggers a TQQQ entry, SOXL RSI <30 triggers SOXL, SPXL RSI <30 triggers SPXL. A unique signal not found in other strategies: LABU (3x Biotech) RSI below 25 triggers a biotech sector dip-buy.",
      "When none of the individual dip-buy thresholds are met, the strategy uses a single relative RSI comparison as its default switch: if the 10-period RSI of XLK (Technology Select Sector SPDR) exceeds the baseline RSI — indicating tech sector short-term momentum is above average — it holds a four-ETF basket of TQQQ, SOXL, TECL, and SPXL simultaneously. When tech sector momentum falls below the threshold, the strategy holds SH.",
      "The strategy's shorter backtest history (≈5.3 years, reflecting instruments available since 2020) and the binary nature of its default allocation — full four-ETF leveraged basket vs. SH based on a single XLK RSI comparison — make it one of the more decisive regime-switchers in the library. The LABU biotech dip-buy and the sector-RSI comparison are unique features not found in the other 11 strategies."
    ],
    "signals": [
      {
        "name": "XLK Sector Relative Momentum",
        "tag": "momentum",
        "description": "10-period XLK RSI vs. baseline RSI — the primary regime switch: above baseline holds 4-ETF leveraged basket, below holds SH."
      },
      {
        "name": "Individual ETF RSI Dip-Buys",
        "tag": "rsi",
        "description": "TQQQ, SOXL, SPXL at RSI <30 and LABU at RSI <25 trigger targeted oversold entries before the XLK check."
      },
      {
        "name": "14-Layer Overbought Cascade",
        "tag": "rsi",
        "description": "RSI >79 checks across major ETFs plus defensive sector relative RSI comparisons — any trigger routes to SH."
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
    "risk_profile": "Aggressive with a shorter track record. The best Calmar ratio in the library (9.75) and a 2.66 Sharpe reflect strong risk-adjusted performance, but ~29.5% max drawdown and 56.9% standard deviation confirm this is not a conservative allocation. The 5.3-year backtest reflects performance in a predominantly bull market — interpret long-term metrics cautiously relative to the 14-year backtests available for other strategies in this library.",
    "author_note": "Note: KMLM launched in November 2020. The 5.3-year backtest is shorter than most strategies here. Metrics are accurate as of last_updated."
  },
  {
    "slug": "zoops-upro-ftlt-2026",
    "name": "zoop's UPRO FTLT (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/9ETFQi5cmSWq2mT4ZH2d/details",
    "symphony_id": "9ETFQi5cmSWq2mT4ZH2d",
    "annualized_rate_of_return": 0.9392140574739014,
    "max_drawdown": -0.3337858153382369,
    "cumulative_return": 11689.952691,
    "calmar_ratio": 2.8138225602012557,
    "sharpe_ratio": 1.6435768458586608,
    "standard_deviation": 0.4667362571203277,
    "min": -0.15378150537913315,
    "mean": 0.003044114703673433,
    "median": 0.0016016579824111865,
    "max": 0.546298952157517,
    "trailing_one_month_return": 0.0960804283908192,
    "trailing_three_month_return": 0.2083946162136594,
    "trailing_one_year_return": 0.6451869571968825,
    "backtest_days": 3563,
    "description": "The S&P 500 counterpart to TQQQ FTLT — holds UPRO (3x S&P 500) for the long term with systematic safety exits, offering slightly lower returns and lower volatility than the QQQ-based version.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "200d-ma",
      "vix-tiers"
    ],
    "last_updated": "2026-06-08",
    "how_it_works": [
      "UPRO FTLT ('For The Long Term') mirrors the TQQQ FTLT structure exactly — but substitutes UPRO (ProShares UltraPro S&P 500, 3x) for TQQQ in every branch. Where TQQQ FTLT defaults to Nasdaq 100 leverage, UPRO FTLT defaults to broad S&P 500 leverage. The core trend gate is Price(SPY) > SMA(): when SPY is above its simple moving average and SPXL (another 3x S&P ETF) RSI is below 80, the strategy holds UPRO. The Frontrunner component (50% weight) runs in parallel with its standard RSI(10) dip-buy logic.",
      "In downtrend conditions (SPY below SMA), the strategy does not simply hold cash. It checks TQQQ RSI <31 to dip-buy TECL (3x tech), SPY RSI <30 to re-enter UPRO, and works through tiered UVXY checks at 65, 74, and 84 — evaluating TQQQ price vs. its own SMA before deciding whether to hold UPRO or switch to SH. Even in a downtrend, the strategy actively looks for oversold re-entry points into UPRO.",
      "The UPRO-for-TQQQ substitution produces meaningfully lower volatility — the S&P 500's broader sector diversification vs. Nasdaq 100's tech concentration reduces the standard deviation from 54-55% to 46.7%, and max drawdown from ~46% to ~33%. For investors who want leveraged compounding but prefer broad market diversification over Nasdaq concentration, UPRO FTLT is the S&P 500 alternative within this strategy family."
    ],
    "signals": [
      {
        "name": "SPY SMA Gate",
        "tag": "200d-ma",
        "description": "SPY price vs. simple moving average is the primary trend classifier — determines uptrend UPRO hold vs. bear-recovery mode."
      },
      {
        "name": "SPXL RSI Overbought Check",
        "tag": "rsi",
        "description": "SPXL RSI >80 prevents UPRO entry even when SPY is above SMA — blocks leveraged entries at overbought extremes."
      },
      {
        "name": "UVXY Volatility Tiers",
        "tag": "vix-tiers",
        "description": "Tiered UVXY RSI checks at 65, 74, and 84 with TQQQ-vs-SMA confirmation determine SPXU entry or defensive routing."
      },
      {
        "name": "TECL/UPRO Dip-Buys",
        "tag": "rsi",
        "description": "TQQQ RSI <31 triggers TECL entry; SPY RSI <30 triggers UPRO — contrarian leveraged re-entries during downtrends."
      },
      {
        "name": "Leveraged ETFs",
        "tag": "leveraged-etfs",
        "description": "UPRO (3x S&P 500) is the core risk-on hold throughout; TECL used for bear-regime dip entries."
      }
    ],
    "risk_profile": "Aggressive. Lower volatility than TQQQ-based strategies — 46.7% standard deviation vs. 54-55% for TQQQ strategies, and ~33.4% max drawdown vs. ~46% for TQQQ FTLT. The S&P 500's broader diversification relative to Nasdaq 100 concentration is the source of this risk reduction. Still unsuitable for capital that cannot tolerate multi-year drawdown periods.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-leveraged-tqqq-symphony-2026",
    "name": "zoop's Leveraged TQQQ Symphony (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/U6lT1G0PdE9fUxoy2opg/details",
    "symphony_id": "U6lT1G0PdE9fUxoy2opg",
    "annualized_rate_of_return": 1.084316404765925,
    "max_drawdown": -0.47588721396993927,
    "cumulative_return": 32437.240462,
    "calmar_ratio": 2.2785155241309316,
    "sharpe_ratio": 1.6405152324295282,
    "standard_deviation": 0.5315768217675951,
    "min": -0.1537814928532728,
    "mean": 0.003460555052842128,
    "median": 0.00143988271064166,
    "max": 0.5462990618509198,
    "trailing_one_month_return": 0.08771821626178067,
    "trailing_three_month_return": 0.4788680993534258,
    "trailing_one_year_return": 1.201572164556155,
    "backtest_days": 3563,
    "description": "An orchestrated TQQQ strategy that coordinates multiple timing signals like instruments in a symphony — each signal plays its role, and the strategy only acts when they are in harmony.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "200d-ma",
      "vix-tiers"
    ],
    "last_updated": "2026-06-08",
    "how_it_works": [
      "The Leveraged TQQQ Symphony refines the standard 'SPY above SMA equals TQQQ' approach with three overbought guards that can block entry even during confirmed uptrends. When SPY is above its SMA, the strategy checks three conditions before entering TQQQ: TQQQ RSI >79 (TQQQ is overbought), SPY RSI >80 (S&P is overbought), and — uniquely — SPY 60-period RSI >60 (medium-term momentum is extended). All three must be absent for the strategy to hold TQQQ.",
      "The 60-period RSI check is the symphony's distinguishing feature. While short-term RSI (14-period) can look normal even during extended rallies, the 60-period RSI captures medium-term overbought conditions that develop over weeks. A 60-period SPY RSI above 60 signals that the market has been trending strongly for an extended period — increasing the risk of a mean-reversion event. The strategy accepts missed upside during these extended runs to reduce exposure near tops.",
      "When SPY is below its SMA, the strategy uses QQQ's own price vs. SMA and a cumulative return threshold: if QQQ is above its SMA but has already gained more than 5.5% cumulatively (momentum chasing risk), the strategy abstains. If QQQ has not yet rallied far, it buys TQQQ as a recovery play. When QQQ is also below its SMA, it holds SH."
    ],
    "signals": [
      {
        "name": "SPY SMA Trend Gate",
        "tag": "200d-ma",
        "description": "SPY price vs. SMA is the primary trend classifier — uptrend mode applies three overbought guards; downtrend mode uses QQQ momentum checks."
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
    "risk_profile": "Aggressive. At ~47.6% max drawdown and 53.2% standard deviation, this is among the higher-risk strategies in the library. The 60-period RSI guard and cumulative return cap reduce overbought entry frequency but cannot prevent losses when underlying trends reverse sharply. The 1-year trailing return of +120.2% demonstrates the reward available for tolerating this level of volatility.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-tqqq-200d-ma-3x-2026",
    "name": "zoop's TQQQ 200d MA 3x Leverage (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/ZBpjzxS9RkLzft9NNWhO/details",
    "symphony_id": "ZBpjzxS9RkLzft9NNWhO",
    "annualized_rate_of_return": 1.0917815184052229,
    "max_drawdown": -0.38973223523365874,
    "cumulative_return": 34119.591200999996,
    "calmar_ratio": 2.801363140389606,
    "sharpe_ratio": 1.6492042773514752,
    "standard_deviation": 0.5310755255513387,
    "min": -0.15378149948708497,
    "mean": 0.003475603287047423,
    "median": 0.001919369681755434,
    "max": 0.5462990676184805,
    "trailing_one_month_return": 0.18371261977064668,
    "trailing_three_month_return": 0.5790832252428406,
    "trailing_one_year_return": 1.0853310604764341,
    "backtest_days": 3563,
    "description": "The most straightforward strategy in the library: hold TQQQ when QQQ is above its 200-day moving average, otherwise hold cash. Simple, transparent, and historically powerful.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "200d-ma",
      "vix-tiers"
    ],
    "last_updated": "2026-06-08",
    "how_it_works": [
      "TQQQ 200d MA 3x Leverage is the most transparent TQQQ strategy in the suite: the second component (50% weight) checks TQQQ's own price directly against its simple moving average — not SPY, not QQQ, but TQQQ itself. When TQQQ is above its SMA and RSI is below 77 (a slightly more sensitive overbought threshold than the 79-80 used elsewhere), the strategy holds TQQQ. When TQQQ is overbought or below its SMA, it moves to SH.",
      "The only exception to the strict SMA rule is an extreme oversold dip-buy: if TQQQ RSI falls below 30 while below the SMA, the strategy buys TQQQ against the trend as a mean-reversion bet, treating RSI <30 as a high-probability recovery signal that temporarily overrides the SMA exit. Outside of this exception, the strategy is a clean and auditable one-decision system: above SMA and not overbought equals TQQQ, everything else equals SH.",
      "The Frontrunner component (the other 50%) adds the standard oversold entries for semiconductors, Nasdaq, and S&P via RSI(10), plus the VXX/SPXU volatility routing through UVXY. The combined strategy uses the TQQQ SMA rule for its default path and Frontrunner's extreme-condition overrides for edge cases — making it one of the easiest to understand and audit in the entire library."
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
        "description": "UVXY RSI >65 routes to SPXU or TQQQ based on SPY trend direction — inherited from Frontrunner."
      },
      {
        "name": "Leveraged ETFs",
        "tag": "leveraged-etfs",
        "description": "TQQQ is the sole risk-on asset; SH is the defensive asset — the cleanest binary in the library."
      }
    ],
    "risk_profile": "Aggressive. Despite its simplicity, this strategy has a ~39% max drawdown — TQQQ can still fall 30-40% before crossing below its SMA, and the strategy can be whipsawed in choppy markets near the average. Its transparency makes it the most auditable and explainable entry point for investors new to systematic leveraged strategies.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "zoops-soxl-growth-2026",
    "name": "zoop's SOXL Growth (2026 Edition)",
    "symphony_url": "https://app.composer.trade/symphony/wcEUcb13v7M8bEluRc1h/details",
    "symphony_id": "wcEUcb13v7M8bEluRc1h",
    "annualized_rate_of_return": 1.6463643282773504,
    "max_drawdown": -0.6570145580114246,
    "cumulative_return": 949451.828748,
    "calmar_ratio": 2.5058262533183053,
    "sharpe_ratio": 1.7539457909124614,
    "standard_deviation": 0.6874498794620166,
    "min": -0.21153412645535685,
    "mean": 0.004784721518038425,
    "median": 0.0011899368491807838,
    "max": 0.5462991538225772,
    "trailing_one_month_return": 0.0011901219871452984,
    "trailing_three_month_return": 0.5015458076043677,
    "trailing_one_year_return": 5.45785172826146,
    "backtest_days": 3563,
    "description": "The highest-risk, highest-return strategy in the library. Uses SOXL (3x Semiconductors) as its core instrument, accepting the most extreme drawdowns in exchange for explosive growth potential.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "max-drawdown",
      "vix-tiers"
    ],
    "last_updated": "2026-06-08",
    "how_it_works": [
      "SOXL Growth is structurally unique in the library: its primary signal is MaxDD (running maximum drawdown) of SOXL rather than a price-vs-SMA comparison. When SOXL's maximum drawdown reaches or exceeds 50%, the strategy enters a 'deep drawdown mode' where it calibrates position size using TQQQ's standard deviation of daily returns as a secondary volatility gauge. Low TQQQ volatility (std-dev ≤ 3.8%) routes to a three-ETF basket of SOXL, TQQQ, and SPXL; higher volatility triggers further branching based on TQQQ RSI and cumulative return readings.",
      "When SOXL's max drawdown is below 50% (a 'normal' drawdown regime), the strategy switches to using SOXL's own RSI and standard deviation. Below RSI 62.2 with low volatility (std-dev ≤ 4.92%), it holds SOXL alone. As RSI or volatility rises, nuanced sub-conditions comparing cumulative returns and MaxDD(TQQQ) thresholds determine whether to stay in SOXL, expand to a basket, or shift to SH.",
      "The risk-on basket in both regimes frequently includes TMF (3x 20-year Treasury Bull) or TMV (3x 20-year Treasury Bear) alongside SOXL — using Treasury duration exposure as a hedge within the leveraged position itself. This Treasury pairing inside an equity basket is a distinctive feature not found in the other 11 strategies, reflecting a more portfolio-construction-aware approach to managing semiconductor 3x leverage."
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
        "description": "Long and inverse Treasury ETFs held alongside equity positions as an in-position duration hedge — not a standalone defensive asset."
      },
      {
        "name": "UVXY Volatility Check",
        "tag": "vix-tiers",
        "description": "UVXY RSI >65 routes to SPXU or TQQQ — inherited from the Frontrunner component (50% weight)."
      }
    ],
    "risk_profile": "Extremely Aggressive. The highest-risk strategy in the library with ~65.7% max drawdown and 68.7% standard deviation. SOXL's 3x semiconductor leverage produces the most extreme price swings of any instrument in this suite. The MaxDD and standard deviation signals help time entries and exits, but semiconductor sector concentration means major sector drawdowns can produce 60-80% peak-to-trough losses even with protective routing. Only appropriate as a small satellite allocation within a diversified portfolio.",
    "author_note": "Metrics are accurate as of the last_updated date. Update quarterly via RUNBOOK.MD."
  },
  {
    "slug": "s90-half-low-catch",
    "name": "s90 50/40 maxDD (Half Low Catch)",
    "symphony_url": "https://app.composer.trade/symphony/K8ql2SKFd4VDBemIstEr/details",
    "symphony_id": "K8ql2SKFd4VDBemIstEr",
    "annualized_rate_of_return": 7.35042518506566,
    "max_drawdown": -0.29629341433851586,
    "cumulative_return": 103.467384,
    "calmar_ratio": 24.8079262965588,
    "sharpe_ratio": 3.0375887179332737,
    "standard_deviation": 0.7974475286785684,
    "min": -0.1400939559893225,
    "mean": 0.009612371493086469,
    "median": 0.004293722588756044,
    "max": 0.5462788092451374,
    "trailing_one_month_return": 0.5933654062266869,
    "trailing_three_month_return": 2.029829823245447,
    "trailing_one_year_return": 8.56041524740928,
    "backtest_days": 551,
    "description": "A multi-asset extreme dip-buying strategy that catches catastrophic 3x ETF crashes across semiconductors, biotech, China, financials, small caps, and global markets — only entering at RSI thresholds far below typical oversold levels.",
    "tags": [
      "rsi",
      "leveraged-etfs",
      "momentum",
      "vix-tiers"
    ],
    "last_updated": "2026-06-14",
    "how_it_works": [
      "Low Catchers is a 50/50 combination of a frontrunner component and a dedicated low-catching component. The low-catchers half works as a waterfall of extreme oversold conditions across a diversified basket of 3x leveraged ETFs — defaulting to cash (BIL via the frontrunner) and only deploying capital when market conditions reach truly catastrophic thresholds. Unlike the other strategies in this library that use RSI extremes in the 22–31 range, Low Catchers pushes entry thresholds far lower — as tight as RSI 14 for some ETFs.",
      "The low-catchers component opens with two initial gates: if QQQ's 10-day moving-average return falls below -2.4% (broad Nasdaq deterioration), the strategy buys SOXL. If QQQ is not yet weak, it checks for catastrophic SOXL crashes directly — a 1-day return below -31%, 2-day cumulative return below -37%, or 5-day cumulative return below -57% each trigger a SOXL entry. These are flash-crash and multi-day collapse conditions, not routine corrections. When UVXY's 10-period RSI exceeds 88 — far above the 65 threshold used elsewhere in this library — the strategy also buys SOXL, treating extreme volatility panic as a contrarian semiconductor buy signal.",
      "After the SOXL-specific triggers, the component cascades through individual 3x ETF RSI checks in strict priority order: LABU (3x biotech) RSI < 22, YINN (3x China) RSI < 14, UDOW (3x Dow) RSI < 18, FAS (3x financials) RSI < 15, TNA (3x small cap) RSI < 16, URTY (3x Russell 2000) RSI < 16, KORU (3x South Korea) RSI < 17, NAIL (3x homebuilders), and additional ETFs further down the tree. Each asset independently catches its own sector's extreme bottom. If no condition triggers, the frontrunner component's BIL default preserves capital until the next opportunity."
    ],
    "signals": [
      {
        "name": "Extreme Multi-ETF RSI Waterfall",
        "tag": "rsi",
        "description": "10-period RSI thresholds of 14–22 across LABU, YINN, UDOW, FAS, TNA, URTY, KORU, NAIL, and others — the tightest RSI entry gates in the library."
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
        "description": "UVXY RSI(10) > 88 — far above the library standard of 65 — triggers SOXL as a contrarian panic-buy at extreme volatility spikes."
      },
      {
        "name": "Diversified 3x Leveraged Basket",
        "tag": "leveraged-etfs",
        "description": "SOXL, LABU, YINN, UDOW, FAS, TNA, URTY, KORU, NAIL — nine or more 3x leveraged ETFs across sectors and geographies, each caught at their own extreme RSI bottom."
      }
    ],
    "risk_profile": "Extremely Aggressive with a short backtest. At 79.7% standard deviation, this is the most volatile strategy in the library — exceeding even SOXL Growth's 68.7%. The 29.6% max drawdown is low relative to the volatility because the strategy spends most of its time in BIL (via the frontrunner component) and only deploys at extreme market conditions. However, with only 551 days of backtest history (~1.5 years, from early 2024), the extraordinary metrics — 735% ARR, Calmar 24.8, Sharpe 3.04 — reflect a predominantly bull market with the specific volatility spikes this strategy is optimized to catch. These figures should be interpreted with significant caution; a longer out-of-sample record is required before they can be taken at face value.",
    "author_note": "Note: Backtest covers approximately 1.5 years (≈551 days from early 2024). All metrics reflect this short window. Interpret with caution. Metrics are accurate as of the last_updated date."
  }
];
