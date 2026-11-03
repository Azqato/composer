import type { DrawdownPeriod } from '../types'

export interface DrawdownSeries {
  underwater: number[]   // fraction below last ATH at each index, <= 0
  periods: DrawdownPeriod[]
}

/** Compute underwater plot and identify discrete drawdown periods */
export function computeDrawdowns(dates: string[], values: number[]): DrawdownSeries {
  const n = values.length
  const underwater: number[] = new Array(n).fill(0)
  let peak = values[0]
  for (let i = 0; i < n; i++) {
    if (values[i] > peak) peak = values[i]
    underwater[i] = values[i] / peak - 1
  }

  const periods: DrawdownPeriod[] = []
  let inDD = false
  let peakIdx = 0
  let valleyIdx = 0

  for (let i = 1; i < n; i++) {
    if (!inDD) {
      if (underwater[i] < 0) {
        inDD = true
        peakIdx = i - 1
        valleyIdx = i
      }
    } else {
      if (values[i] < values[valleyIdx]) {
        valleyIdx = i
      }
      if (underwater[i] >= 0) {
        // recovered
        periods.push({
          peak: dates[peakIdx],
          valley: dates[valleyIdx],
          recovery: dates[i],
          depth: underwater[valleyIdx],
          durationDays: i - peakIdx,
          recoveryDays: i - valleyIdx,
        })
        inDD = false
        peakIdx = i
      }
    }
  }

  // Ongoing drawdown
  if (inDD) {
    periods.push({
      peak: dates[peakIdx],
      valley: dates[valleyIdx],
      recovery: null,
      depth: underwater[valleyIdx],
      durationDays: n - 1 - peakIdx,
      recoveryDays: null,
    })
  }

  // Sort by depth (worst first)
  periods.sort((a, b) => a.depth - b.depth)

  return { underwater, periods }
}

export function currentDrawdown(underwater: number[]): { depth: number; days: number } {
  const last = underwater[underwater.length - 1]
  if (last >= 0) return { depth: 0, days: 0 }
  let days = 0
  for (let i = underwater.length - 1; i >= 0; i--) {
    if (underwater[i] < 0) days++
    else break
  }
  return { depth: last, days }
}

export function maxDrawdown(underwater: number[]): number {
  return Math.min(0, ...underwater)
}

export function longestDrawdownDays(periods: DrawdownPeriod[]): number {
  return periods.reduce((m, p) => Math.max(m, p.durationDays), 0)
}

export function avgDrawdown(periods: DrawdownPeriod[]): number {
  if (periods.length === 0) return 0
  return periods.reduce((s, p) => s + p.depth, 0) / periods.length
}

export function avgDrawdownDays(periods: DrawdownPeriod[]): number {
  if (periods.length === 0) return 0
  return periods.reduce((s, p) => s + p.durationDays, 0) / periods.length
}
