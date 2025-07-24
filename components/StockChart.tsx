'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import StockSummary from '@/components/StockSummary'

type QuoteData = {
  name: string
  price: number
  marketCap: number
  currency: string
}

export default function StockChart({ symbol = 'NASDAQ:AAPL' }: { symbol: string }) {
  const [chartId, setChartId] = useState('')
  const [quote, setQuote] = useState<QuoteData | null>(null)

  useEffect(() => {
    const id = `tv_chart_${symbol.replace(/[^a-zA-Z0-9]/g, '')}`
    setChartId(id)

    if (typeof window !== 'undefined' && (window as any).TradingView) {
      new (window as any).TradingView.widget({
        width: '100%',
        height: 400,
        symbol,
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: 'light',
        style: '1',
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        withdateranges: true,
        hide_side_toolbar: false,
        allow_symbol_change: false,
        container_id: id,
      })
    }
  }, [symbol])

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol.replace(
            'NASDAQ:',
            ''
          )}?modules=price`
        )
        const json = await res.json()
        const priceData = json.quoteSummary?.result?.[0]?.price
        if (!priceData) return

        setQuote({
          name: priceData.longName || priceData.shortName || symbol,
          price: priceData.regularMarketPrice?.raw,
          marketCap: priceData.marketCap?.raw,
          currency: priceData.currency || 'USD',
        })
      } catch (err) {
        console.error('Error fetching stock quote:', err)
      }
    }

    fetchQuote()
  }, [symbol])

  return (
    <div className="w-full mb-4">
      <div id={chartId} className="mb-4" />
      <Script src="https://s3.tradingview.com/tv.js" strategy="afterInteractive" />
      {quote && (
        <StockSummary
          name={quote.name}
          symbol={symbol.replace('NASDAQ:', '')}
          price={quote.price}
          marketCap={quote.marketCap}
          currency={quote.currency}
        />
      )}
    </div>
  )
}