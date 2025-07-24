'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

export default function StockChart({ symbol = 'NASDAQ:AAPL' }: { symbol: string }) {
  const [chartId, setChartId] = useState('')

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

  return (
    <div className="w-full mb-4">
      <div id={chartId} />
      <Script src="https://s3.tradingview.com/tv.js" strategy="afterInteractive" />
    </div>
  )
}