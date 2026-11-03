import type { PriceSeries } from '../types'
import { relayFetch } from './proxy'

// Yahoo Finance v8 chart API
// Yahoo blocks direct browser requests; see proxy.ts for how requests are routed.

interface YahooResponse {
  chart: {
    result?: Array<{
      timestamp: number[]
      indicators: {
        adjclose?: Array<{ adjclose: (number | null)[] }>
        quote: Array<{ close: (number | null)[]; volume?: (number | null)[] }>
      }
    }>
    error?: { code: string; description: string }
  }
}

export async function fetchYahoo(
  ticker: string,
  startDate: string,
  endDate: string,
  corsProxy = ''
): Promise<PriceSeries> {
  const period1 = Math.floor(new Date(startDate).getTime() / 1000)
  const period2 = Math.floor(new Date(endDate).getTime() / 1000) + 86400

  // Try query1 first, fall back to query2
  for (const host of ['query1', 'query2']) {
    const path = `/v8/finance/chart/${encodeURIComponent(ticker)}` +
      `?interval=1d&period1=${period1}&period2=${period2}&includeAdjustedClose=true&events=div|split`
    const url = `https://${host}.finance.yahoo.com${path}`

    
    try {
      const resp = await relayFetch(url, `./yahoo/${host}${path}`, corsProxy, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(15000),
      })

      if (!resp.ok) continue

      const data: YahooResponse = await resp.json()
      const result = data?.chart?.result?.[0]
      if (!result) continue

      const timestamps = result.timestamp
      const adjCloses = result.indicators.adjclose?.[0]?.adjclose
        ?? result.indicators.quote[0].close

      const volumes = result.indicators.quote[0]?.volume
      if (!timestamps || !adjCloses) continue

      const series: PriceSeries = []
      for (let i = 0; i < timestamps.length; i++) {
        const ac = adjCloses[i]
        if (ac == null || ac <= 0) continue
        const date = new Date(timestamps[i] * 1000).toISOString().split('T')[0]
        const v = volumes?.[i]
        series.push(v != null ? { date, adjClose: ac, volume: v } : { date, adjClose: ac })
      }

      return series.sort((a, b) => a.date < b.date ? -1 : 1)
    } catch {
      // try next host
    }
  }

  throw new Error(
    `Yahoo Finance fetch failed for ${ticker}. ` +
    `Check your connection, or try a different CORS proxy in Settings.`
  )
}
