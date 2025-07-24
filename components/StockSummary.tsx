'use client'

type StockSummaryProps = {
  name: string
  symbol: string
  price: number
  marketCap?: number
  currency?: string
}

export default function StockSummary({
  name,
  symbol,
  price,
  marketCap,
  currency = 'USD',
}: StockSummaryProps) {
  const formatCap = (value: number | undefined) => {
    if (!value) return '—'
    if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(1)}T`
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    return value.toString()
  }

  return (
    <div className="bg-white border p-4 rounded-xl shadow-sm mb-4 text-sm">
      <div className="font-semibold text-gray-900 mb-1">{name} ({symbol})</div>
      <div className="text-gray-700">
        <div>Price: <strong>{currency} ${price.toLocaleString()}</strong></div>
        <div>Market Cap: <strong>{formatCap(marketCap)}</strong></div>
      </div>
    </div>
  )
}