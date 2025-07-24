// === BEGIN Dashboard.tsx ===
'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'

type ViewMode = 'weekly' | 'monthly' | '3month' | 'ytd' | 'annual' | 'custom'

type DataPoint = {
  income: number
  spending: number
  month?: string
  week?: string
}

const fullMonthName = (abbr: string) =>
  new Date(`${abbr} 1, 2024`).toLocaleString('en-US', { month: 'long' })

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('monthly')
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(5)
  const [customStart, setCustomStart] = useState<number>(0)
  const [customEnd, setCustomEnd] = useState<number>(5)
  const [goalAmount, setGoalAmount] = useState<number>(20000)
  const router = useRouter()

  const realisticMonthlyData: DataPoint[] = [
    { month: 'Jan', income: 7400, spending: 5200 },
    { month: 'Feb', income: 7500, spending: 5300 },
    { month: 'Mar', income: 7300, spending: 5100 },
    { month: 'Apr', income: 7600, spending: 5400 },
    { month: 'May', income: 7800, spending: 5600 },
    { month: 'Jun', income: 7600, spending: 5450 },
  ]

  const realisticWeeklyData: DataPoint[] = [
    { week: 'Week 1 (Jun 1–7)', income: 1800, spending: 1250 },
    { week: 'Week 2 (Jun 8–14)', income: 1900, spending: 1350 },
    { week: 'Week 3 (Jun 15–21)', income: 1850, spending: 1400 },
    { week: 'Week 4 (Jun 22–28)', income: 1950, spending: 1300 },
  ]

  const categoryData: Record<string, { category: string; amount: number; note?: string }[]> = {
    Jan: [{ category: 'Rent', amount: 2100 }, { category: 'Dining Out', amount: 540 }, { category: 'Groceries', amount: 320 }],
    Feb: [{ category: 'Rent', amount: 2100 }, { category: 'Travel', amount: 1800, note: '🚗 Weekend trip to Napa' }, { category: 'Dining Out', amount: 670, note: '↑ 24% vs Jan' }],
    Mar: [{ category: 'Rent', amount: 2100 }, { category: 'Travel', amount: 2600, note: '✈️ Flight + hotel for spring break' }, { category: 'Dining Out', amount: 780, note: '↑ 16% vs Feb' }],
    Apr: [{ category: 'Rent', amount: 2100 }, { category: 'Groceries', amount: 400 }, { category: 'Dining Out', amount: 500 }],
    May: [{ category: 'Rent', amount: 2100 }, { category: 'Dining Out', amount: 650 }, { category: 'Medical', amount: 300, note: '🩺 Annual check-up' }],
    Jun: [{ category: 'Rent', amount: 2100 }, { category: 'Groceries', amount: 430, note: '⬇️ Down 12% vs May' }, { category: 'Dining Out', amount: 720 }],
  }

  function generateInsights(currentIndex: number) {
    const current = realisticMonthlyData[currentIndex]
    const prev = realisticMonthlyData[currentIndex - 1]
    if (!current || !prev) return []
    const insights = []

    const savedCurrent = current.income - current.spending
    const savedPrev = prev.income - prev.spending
    const diff = savedCurrent - savedPrev
    const rateCurrent = Math.round((savedCurrent / current.income) * 100)
    const ratePrev = Math.round((savedPrev / prev.income) * 100)

    if (diff > 0) {
      insights.push(`✅ You saved $${diff.toLocaleString()} more than in ${prev.month}. Great work!`)
    } else if (diff < 0) {
      insights.push(`⚠️ You saved $${Math.abs(diff).toLocaleString()} less than in ${prev.month}. Want to review spending?`)
    }

    if (rateCurrent !== ratePrev) {
      insights.push(rateCurrent > ratePrev
        ? `📈 Your savings rate improved to ${rateCurrent}% (up from ${ratePrev}%).`
        : `📉 Your savings rate dropped to ${rateCurrent}% (was ${ratePrev}%).`)
    }

    let travel
    if (current.month) {
      travel = categoryData[current.month]?.find(c => c.category === 'Travel')
    }

    return insights
  }

  const ytd = realisticMonthlyData.reduce((acc, m) => {
    acc.income += m.income
    acc.spending += m.spending
    return acc
  }, { income: 0, spending: 0 })

  const summaryRef = useRef<HTMLDivElement>(null)
  const [highlighted, setHighlighted] = useState(false)

  const handleBarClick = (index: number) => {
    setSelectedMonthIndex(index)
    setHighlighted(true)
    summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => setHighlighted(false), 1000)
  }

  const ytdSaved = ytd.income - ytd.spending
  const goalPercent = Math.min(Math.round((ytdSaved / goalAmount) * 100), 100)

  const getRange = (start: number, end: number) => realisticMonthlyData.slice(start, end + 1)

  const selectedRange =
    viewMode === 'custom' ? getRange(customStart, customEnd)
    : viewMode === '3month' ? realisticMonthlyData.slice(-3)
    : viewMode === 'weekly' ? realisticWeeklyData
    : viewMode === 'ytd' ? realisticMonthlyData
    : viewMode === 'annual' ? realisticMonthlyData
    : [realisticMonthlyData[selectedMonthIndex]]

  const rangeIncome = selectedRange.reduce((sum, m) => sum + m.income, 0)
  const rangeSpending = selectedRange.reduce((sum, m) => sum + m.spending, 0)
  const rangeSaved = rangeIncome - rangeSpending
  const rangeRate = Math.round((rangeSaved / rangeIncome) * 100)

  const chartData = selectedRange.map((m, i) => ({
    ...m,
    name: m.month ? fullMonthName(m.month) : m.week ?? `Item ${i + 1}`,
    index: i,
  }))

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navbar />
      <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <h1 className="text-2xl font-bold">👋 Welcome to your Dashboard</h1>
          <p className="text-gray-600">You’re viewing the public dashboard</p>
        </div>
        <div className="space-x-2">
          {['weekly', 'monthly', '3month', 'ytd', 'annual', 'custom'].map((mode) => (
            <button
              key={mode}
              className={`px-3 py-1 rounded-md text-sm font-medium border ${viewMode === mode ? 'bg-black text-white' : 'bg-white text-black'}`}
              onClick={() => setViewMode(mode as ViewMode)}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Month Navigation */}
      {['monthly', 'ytd'].includes(viewMode) && (
        <div className="mb-4 flex justify-between max-w-xs">
          <button
            onClick={() => setSelectedMonthIndex((prev) => Math.max(0, prev - 1))}
            disabled={selectedMonthIndex === 0}
            className="px-3 py-1 rounded-md border text-sm bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            ⬅ Prev
          </button>
          <button
            onClick={() => setSelectedMonthIndex((prev) => Math.min(realisticMonthlyData.length - 1, prev + 1))}
            disabled={selectedMonthIndex === realisticMonthlyData.length - 1}
            className="px-3 py-1 rounded-md border text-sm bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            Next ➡
          </button>
        </div>
      )}

      {/* Custom Range Picker */}
      {viewMode === 'custom' && (
        <div className="mb-6 flex gap-4 items-center">
          <label>
            Start:
            <select className="ml-2 border rounded px-2 py-1" value={customStart} onChange={(e) => setCustomStart(Number(e.target.value))}>
              {realisticMonthlyData.map((m, i) => <option key={m.month} value={i}>{m.month}</option>)}
            </select>
          </label>
          <label>
            End:
            <select className="ml-2 border rounded px-2 py-1" value={customEnd} onChange={(e) => setCustomEnd(Number(e.target.value))}>
              {realisticMonthlyData.map((m, i) => <option key={m.month} value={i}>{m.month}</option>)}
            </select>
          </label>
        </div>
      )}

      {/* Summary */}
      <div
        ref={summaryRef}
        className={`bg-white rounded-xl shadow p-6 mb-6 transition duration-500 ${
          highlighted ? 'ring-2 ring-green-400' : ''
        }`}
      >
        <h2 className="text-lg font-semibold mb-2">
          {viewMode === 'ytd'
            ? '📆 YTD Summary'
            : viewMode === 'custom'
            ? `🗓 Custom Summary (${fullMonthName(realisticMonthlyData[customStart].month!)} to ${fullMonthName(realisticMonthlyData[customEnd].month!)})`
            : viewMode === '3month'
            ? '📉 Last 3 Months'
            : viewMode === 'annual'
            ? '📆 Annual Summary'
            : viewMode === 'weekly'
            ? '🗓 Last 4 Weeks'
            : `📅 ${fullMonthName(realisticMonthlyData[selectedMonthIndex].month!)} Summary`}
        </h2>
        <p className="text-gray-800">
          Income: <strong>${rangeIncome.toLocaleString()}</strong> — Spending:{' '}
          <strong>${rangeSpending.toLocaleString()}</strong> — Saved:{' '}
          <strong className="text-green-600">${rangeSaved.toLocaleString()} ({rangeRate}%)</strong>
        </p>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow p-6 mb-8 focus:outline-none focus:ring-0">
        <h2 className="font-semibold text-lg mb-4">💵 Cash Flow</h2>
        <div className="outline-none ring-0">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="income" radius={[10, 10, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell
                    key={`income-${i}`}
                    fill={['monthly', 'ytd'].includes(viewMode) && i === selectedMonthIndex ? '#16a34a' : '#22C55E'}
                    onClick={['monthly', 'ytd', '3month', 'weekly'].includes(viewMode) ? () => handleBarClick(i) : undefined}
                    style={{ outline: 'none' }}
                  />
                ))}
              </Bar>
              <Bar dataKey="spending" radius={[10, 10, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell
                    key={`spending-${i}`}
                    fill={['monthly', 'ytd'].includes(viewMode) && i === selectedMonthIndex ? '#b91c1c' : '#EF4444'}
                    onClick={['monthly', 'ytd', '3month', 'weekly'].includes(viewMode) ? () => handleBarClick(i) : undefined}
                    style={{ outline: 'none' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Smart Insights */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">📌 Smart Insights</h2>
        {['monthly', 'ytd'].includes(viewMode) &&
          generateInsights(selectedMonthIndex).map((text, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-4">
              <p className="text-gray-700">{text}</p>
            </div>
          ))}
        {viewMode !== 'monthly' && (
          <>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-gray-700">
                ✅ You saved <strong>{rangeRate}%</strong> of your income during this period.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-gray-700">
                📈 Your total savings for this range is <strong>${rangeSaved.toLocaleString()}</strong>.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Category Breakdown (Monthly + YTD View) */}
      {['monthly', 'ytd'].includes(viewMode) &&
        realisticMonthlyData[selectedMonthIndex]?.month &&
        categoryData[realisticMonthlyData[selectedMonthIndex].month] && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">
              📂 Spending Breakdown for {new Date(`${realisticMonthlyData[selectedMonthIndex].month} 1, 2024`).toLocaleString('en-US', { month: 'long' })}
            </h2>
            <div className="bg-white rounded-xl shadow p-4 divide-y">
              {(() => {
                const month = realisticMonthlyData[selectedMonthIndex].month
                const items = categoryData[month]
                const total = items.reduce((sum, item) => sum + item.amount, 0)

                const prevMonth = realisticMonthlyData[selectedMonthIndex - 1]?.month ?? null
                const prevItems = prevMonth ? categoryData[prevMonth] || [] : []

                return items.map((item, i) => {
                  const percent = ((item.amount / total) * 100).toFixed(1)
                  const prevAmount = prevItems.find(p => p.category === item.category)?.amount
                  const change = prevAmount !== undefined ? item.amount - prevAmount : null

                  const changeText = change !== null
                    ? change > 0
                      ? `↑ $${change.toLocaleString()}`
                      : change < 0
                      ? `↓ $${Math.abs(change).toLocaleString()}`
                      : '—'
                    : null

                  const changeColor =
                    typeof change === 'number'
                      ? change > 0
                        ? 'text-red-500'
                        : change < 0
                        ? 'text-green-600'
                        : 'text-gray-400'
                      : 'text-gray-400'

                  return (
                    <div key={i} className="flex justify-between items-start py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">
                          {item.note ? `${item.category} ${item.note}` : item.category}
                        </span>
                        {changeText && change !== null && prevMonth && (
                          <span className={`text-sm ${changeColor}`}>
                            {changeText} vs {prevMonth}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-gray-900 font-semibold">
                          ${item.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">{percent}%</div>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </div>
      )}
    </div>
  )
}