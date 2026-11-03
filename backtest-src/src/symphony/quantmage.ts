// ─── QuantMage spell import (Crescendo's QuantMageSpellReader) ───────────────
// Turns a QuantMage spell ({ "incantation": … }) into the score format the evaluator reads,
// using three blocks Composer doesn't have: switch, mixed and enter-exit. Like Crescendo, a
// spell that uses anything not modeled here is refused with the full list, never half-imported.

type Json = Record<string, unknown>

export function isQuantMageSpell(json: unknown): boolean {
  return !!json && typeof json === 'object' && 'incantation' in (json as Json)
}

/** Indicators with the same meaning (and units) as a Composer function */
const INDICATORS: Record<string, string> = {
  RelativeStrengthIndex: 'relative-strength-index',
  CumulativeReturn: 'cumulative-return',
  CurrentPrice: 'current-price',
  MovingAverage: 'moving-average-price',
  ExponentialMovingAverage: 'exponential-moving-average-price',
  Volatility: 'standard-deviation-return',
}

export function fromQuantMage(spell: Json): { score: Json; warnings: string[] } {
  const warnings: string[] = []
  const unsupported: string[] = []
  const text = (j: unknown, k: string, d = '') => {
    const v = j && typeof j === 'object' ? (j as Json)[k] : undefined
    return v == null ? d : String(v)
  }
  const number = (j: unknown, k: string, d: number) => {
    const v = j && typeof j === 'object' ? Number((j as Json)[k]) : NaN
    return Number.isFinite(v) ? v : d
  }
  const at = (name: string) => (name ? ` at "${name}"` : '')
  const cash = (kind: string, name: string): Json => {
    warnings.push(`${kind}${at(name)} has an empty branch, held as cash`)
    return { step: 'asset', ticker: 'ZEROX' }
  }
  const child = (j: unknown, kind: string, name: string): Json =>
    j && typeof j === 'object' ? node(j as Json) : cash(kind, name)

  function operand(ind: unknown, ticker: string, where: string): Json | null {
    const type = text(ind, 'type', '?')
    const fn = INDICATORS[type]
    if (!fn) { unsupported.push(`indicator "${type}"${at(where)}`); return null }
    if (ticker.startsWith('@')) unsupported.push(`economic series "${ticker}"`)
    return { fn, ticker, params: { window: number(ind, 'window', 0) } }
  }

  function condition(c: unknown, where: string): Json {
    if (!c || typeof c !== 'object') { unsupported.push(`a block without a condition${at(where)}`); return {} }
    const type = text(c, 'condition_type', '?')
    if (type === 'AllOf' || type === 'AnyOf') {
      const parts = ((c as Json).conditions as unknown[] | undefined) ?? []
      return { 'condition-type': 'compound', operator: type === 'AllOf' ? 'all' : 'any',
        conditions: parts.map(p => condition(p, where)) }
    }
    if (type !== 'SingleCondition') { unsupported.push(`condition type "${type}"`); return {} }
    const kind = text(c, 'type', '?')
    const lhs = operand((c as Json).lh_indicator, text(c, 'lh_ticker_symbol'), where)
    let rhs: Json | null
    if (kind === 'IndicatorAndNumber') rhs = { constant: number(c, 'rh_value', 0) }
    else if (kind === 'BothIndicators') rhs = operand((c as Json).rh_indicator, text(c, 'rh_ticker_symbol'), where)
    else { unsupported.push(`condition "${kind}"${at(where)}`); return {} }
    return {
      'condition-type': 'binary',
      comparator: (c as Json).greater_than === true ? 'gt' : 'lt',
      lhs: lhs ?? {}, rhs: rhs ?? {},
      'for-days': number(c, 'for_days', 1),
      'lhs-days-ago': number(c, 'lh_days_ago', 0),
      'rhs-days-ago': number(c, 'rh_days_ago', 0),
      'rhs-weight': number(c, 'rh_weight', 1),
      'rhs-bias': number(c, 'rh_bias', 0),
    }
  }

  function node(j: Json): Json {
    const type = text(j, 'incantation_type', '?')
    const name = text(j, 'name')
    const list = (k: string) => ((j[k] as unknown[] | undefined) ?? [])
    switch (type) {
      case 'Ticker':
        return { step: 'asset', ticker: text(j, 'symbol'), name }
      case 'IfElse':
        return { step: 'if', name, children: [
          { step: 'if-child', condition: condition(j.condition, name), children: [child(j.then_incantation, 'If', name)] },
          { step: 'if-child', 'is-else-condition?': true, children: [child(j.else_incantation, 'If', name)] },
        ] }
      case 'Weighted': {
        const kids = list('incantations').map(k => child(k, 'Weighted', name))
        const wt = text(j, 'type', 'Equal')
        if (wt === 'Equal' && list('weights').length === 0) return { step: 'wt-cash-equal', name, children: kids }
        if (wt === 'InverseVolatility') {
          return { step: 'wt-inverse-vol', name, 'window-days': number(j, 'inverse_volatility_window', 0), children: kids }
        }
        unsupported.push(`weighting "${wt}"${at(name)}`)
        return { step: 'wt-cash-equal', children: kids }
      }
      case 'Filtered': {
        if (text(j, 'weight_type', 'Equal') !== 'Equal') unsupported.push(`filter weighting "${text(j, 'weight_type')}"${at(name)}`)
        const sort = j.sort_indicator
        const fn = INDICATORS[text(sort, 'type', '?')]
        if (!fn) unsupported.push(`indicator "${text(sort, 'type', '?')}"${at(name)}`)
        return { step: 'filter', name, 'sort-by-fn': fn ?? '', 'sort-by-window-days': number(sort, 'window', 0),
          'select-fn': j.bottom === true ? 'bottom' : 'top', 'select-n': number(j, 'count', 1),
          children: list('incantations').map(k => child(k, 'Filter', name)) }
      }
      case 'Switch': {
        const conditions = list('conditions').map(c => condition(c, name))
        const kids = list('incantations').map(k => child(k, 'Switch', name))
        if (conditions.length === 0 || kids.length !== conditions.length + 1) {
          unsupported.push(`a Switch with ${conditions.length} conditions and ${kids.length} branches${at(name)} (needs one more branch than conditions)`)
        }
        return { step: 'switch', name, conditions, children: kids }
      }
      case 'Mixed': {
        const from = number(j, 'from_value', 0), to = number(j, 'to_value', 0)
        if (from === to) unsupported.push(`a Mixed block whose from and to values are equal${at(name)}`)
        return { step: 'mixed', name, operand: operand(j.indicator, text(j, 'ticker_symbol'), name) ?? {}, from, to,
          children: [child(j.from_incantation, 'Mixed', name), child(j.to_incantation, 'Mixed', name)] }
      }
      case 'EnterExit':
        return { step: 'enter-exit', name,
          enter: condition(j.enter_condition, name), exit: condition(j.exit_condition, name),
          children: [child(j.enter_incantation, 'Enter/Exit', name), child(j.exit_incantation, 'Enter/Exit', name)] }
      default:
        unsupported.push(`block "${type}"${at(name)}`)
        return { step: 'asset', ticker: 'ZEROX' }
    }
  }

  const rootNode = child(spell.incantation, 'Spell', '')
  if (unsupported.length > 0) {
    throw new Error(`This spell uses ${unsupported.length} QuantMage feature(s) not modeled here: ${unsupported.join('; ')}`)
  }
  if (number(spell, 'slippage_bps', 0) > 0) warnings.push('slippage_bps is ignored')
  const threshold = text(spell, 'trading_type', 'Daily') === 'Threshold'
  return {
    score: {
      step: 'root',
      name: text(spell, 'name', 'Imported spell'),
      rebalance: threshold ? 'none' : 'daily',
      'rebalance-corridor-width': threshold ? number(spell, 'threshold', 0) / 100 : 0,
      children: [rootNode],
    },
    warnings,
  }
}
