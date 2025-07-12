'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'
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

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('monthly')
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(5)
  const [customStart, setCustomStart] = useState<number>(0)
  const [customEnd, setCustomEnd] = useState<number>(5)
  const router = useRouter()

  const realisticMonthlyData = [
    { month: 'Jan', income: 7400, spending: 5200 },
    { month: 'Feb', income: 7500, spending: 5300 },
    { month: 'Mar', income: 7300, spending: 5100 },
    { month: 'Apr', income: 7600, spending: 5400 },
    { month: 'May', income: 7800, spending: 5600 },
    { month: 'Jun', income: 7600, spending: 5450 },
  ]

  const getRange = (start: number, end: number) =>
    realisticMonthlyData.slice(start, end + 1)

  const selectedRange =
    viewMode === 'custom'
      ? getRange(customStart, customEnd)
      : viewMode === '3month'
      ? realisticMonthlyData.slice(-3)
      : viewMode === 'weekly'
      ? [
          { month: 'Week 1', income: 1800, spending: 1200 },
          { month: 'Week 2', income: 1700, spending: 1300 },
          { month: 'Week 3', income: 1900, spending: 1250 },
          { month: 'Week 4', income: 1800, spending: 1350 },
        ]
      : viewMode === 'annual'
      ? realisticMonthlyData
      : [realisticMonthlyData[selectedMonthIndex]]

  const rangeIncome = selectedRange.reduce((sum, m) => sum + m.income, 0)
  const rangeSpending = selectedRange.reduce((sum, m) => sum + m.spending, 0)
  const rangeSaved = rangeIncome - rangeSpending
  const rangeRate = Math.round((rangeSaved / rangeIncome) * 100)

  const chartData = selectedRange.map((m, i) => ({
    ...m,
    name: m.month,
    index: i,
  }))
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setUser(session.user)
        setLoading(false)
        if (window.location.hash) {
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      } else {
        setTimeout(async () => {
          const { data: retry } = await supabase.auth.getSession()
          if (retry.session) {
            setUser(retry.session.user)
            setLoading(false)
            if (window.location.hash) {
              window.history.replaceState({}, document.title, window.location.pathname)
            }
          } else {
            router.push('/login')
          }
        }, 1000)
      }
    }

    checkSession()
  }, [router])

  if (loading) return <p className="p-8 text-center">Loading...</p>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold">👋 Welcome to your Dashboard</h1>
          <p className="text-gray-600">
            Logged in as: <strong>{user?.email}</strong>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/login')
              }}
              className="ml-4 px-3 py-1 rounded-md text-sm font-medium border bg-white text-black hover:bg-gray-100"
            >
              Log out
            </button>
          </p>
        </div>
        <div className="space-x-2">
          {['weekly', 'monthly', '3month', 'ytd', 'annual', 'custom'].map((mode) => (
            <button
              key={mode}
              className={`px-3 py-1 rounded-md text-sm font-medium border ${
                viewMode === mode ? 'bg-black text-white' : 'bg-white text-black'
              }`}
              onClick={() => setViewMode(mode as ViewMode)}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Selector */}
      {viewMode === 'custom' && (
        <div className="mb-6 flex gap-4 items-center">
          <label>
            Start:
            <select
              className="ml-2 border rounded px-2 py-1"
              value={customStart}
              onChange={(e) => setCustomStart(Number(e.target.value))}
            >
              {realisticMonthlyData.map((m, i) => (
                <option key={m.month} value={i}>
                  {m.month}
                </option>
              ))}
            </select>
          </label>
          <label>
            End:
            <select
              className="ml-2 border rounded px-2 py-1"
              value={customEnd}
              onChange={(e) => setCustomEnd(Number(e.target.value))}
            >
              {realisticMonthlyData.map((m, i) => (
                <option key={m.month} value={i}>
                  {m.month}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* Summary */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">
          {viewMode === 'ytd'
            ? '📆 YTD Summary'
            : viewMode === 'custom'
            ? `🗓 Custom Summary (${realisticMonthlyData[customStart].month} to ${realisticMonthlyData[customEnd].month})`
            : viewMode === '3month'
            ? '📉 Last 3 Months'
            : viewMode === 'annual'
            ? '📆 Annual Summary'
            : viewMode === 'weekly'
            ? '🗓 Last 4 Weeks'
            : `📅 ${realisticMonthlyData[selectedMonthIndex].month} Summary`}
        </h2>
        <p className="text-gray-800">
          Income: <strong>${rangeIncome.toLocaleString()}</strong> — Spending:{' '}
          <strong>${rangeSpending.toLocaleString()}</strong> — Saved:{' '}
          <strong className="text-green-600">
            ${rangeSaved.toLocaleString()} ({rangeRate}%)
          </strong>
        </p>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow p-6 mb-8 outline-none focus:outline-none">
        <h2 className="font-semibold text-lg mb-4">💵 Cash Flow</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="income">
              {chartData.map((_, i) => (
                <Cell
                  key={`income-${i}`}
                  fill={
                    viewMode === 'monthly' && i === selectedMonthIndex
                      ? '#16a34a'
                      : '#22C55E'
                  }
                  onClick={
                    viewMode === 'monthly' ? () => setSelectedMonthIndex(i) : undefined
                  }
                />
              ))}
            </Bar>
            <Bar dataKey="spending">
              {chartData.map((_, i) => (
                <Cell
                  key={`spending-${i}`}
                  fill={
                    viewMode === 'monthly' && i === selectedMonthIndex
                      ? '#b91c1c'
                      : '#EF4444'
                  }
                  onClick={
                    viewMode === 'monthly' ? () => setSelectedMonthIndex(i) : undefined
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Smart Insights */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">📌 Smart Insights</h2>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-700">
            ✅ You saved <strong>{rangeRate}%</strong> of your income during this period.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-700">
            💡 Spending appears consistent, but we’ll surface trends as we analyze categories.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-700">
            📈 Your total savings for this range is{' '}
            <strong>${rangeSaved.toLocaleString()}</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}