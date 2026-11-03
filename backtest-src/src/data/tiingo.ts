import type { PriceSeries } from '../types'

// Tiingo natively supports CORS from browsers.
// Free tier: 500 requests/day, 50 API calls/hour, up to 30 years history.

interface TiingoPoint {
  date: string
  adjClose: number
  close?: number
}

export async function fetchTiingo(
  ticker: string,
  startDate: string,
  endDate: string,
  token: string
): Promise<PriceSeries> {
  if (!token) throw new Error('Tiingo API token not configured')

  const url = `https://api.tiingo.com/tiingo/daily/${encodeURIComponent(ticker)}/prices` +
    `?startDate=${startDate}&endDate=${endDate}&token=${token}&resampleFreq=daily`

  const resp = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    signal: AbortSignal.timeout(15000),
  })

  if (resp.status === 404) throw new Error(`Ticker ${ticker} not found on Tiingo`)
  if (resp.status === 401) throw new Error('Invalid Tiingo API token')
  if (!resp.ok) throw new Error(`Tiingo error ${resp.status} for ${ticker}`)

  const data: TiingoPoint[] = await resp.json()

  return data
    .filter(p => p.adjClose > 0)
    .map(p => ({ date: p.date.split('T')[0], adjClose: p.adjClose }))
    .sort((a, b) => a.date < b.date ? -1 : 1)
}
