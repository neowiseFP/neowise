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
} from 'recharts'

type ViewMode = 'monthly' | 'ytd'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('monthly')
  const router = useRouter()

  const realisticMonthlyData = [
    { month: 'Jan', income: 7400, spending: 5200 },
    { month: 'Feb', income: 7500, spending: 5300 },
    { month: 'Mar', income: 7300, spending: 5100 },
    { month: 'Apr', income: 7600, spending: 5400 },
    { month: 'May', income: 7800, spending: 5600 },
    { month: 'Jun', income: 7600, spending: 5450 },
  ]

  const currentMonth = realisticMonthlyData[5] // June
  const saved = currentMonth.income - currentMonth.spending
  const savingsRate = Math.round((saved / currentMonth.income) * 100)

  const ytd = realisticMonthlyData.reduce(
    (acc, m) => {
      acc.income += m.income
      acc.spending += m.spending
      return acc
    },
    { income: 0, spending: 0 }
  )
  const ytdSaved = ytd.income - ytd.spending
  const ytdRate = Math.round((ytdSaved / ytd.income) * 100)

  const chartData = realisticMonthlyData.map((m) => ({
    name: m.month,
    income: m.income,
    spending: m.spending,
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
          {['monthly', 'ytd'].map((mode) => (
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

      {/* Summary */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        {viewMode === 'monthly' ? (
          <div>
            <h2 className="text-lg font-semibold mb-2">📅 June Summary</h2>
            <p className="text-gray-800">
              Income: <strong>${currentMonth.income.toLocaleString()}</strong> — Spending:{' '}
              <strong>${currentMonth.spending.toLocaleString()}</strong> — Saved:{' '}
              <strong className="text-green-600">${saved.toLocaleString()} ({savingsRate}%)</strong>
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-2">📆 YTD Summary</h2>
            <p className="text-gray-800">
              Income: <strong>${ytd.income.toLocaleString()}</strong> — Spending:{' '}
              <strong>${ytd.spending.toLocaleString()}</strong> — Saved:{' '}
              <strong className="text-green-600">${ytdSaved.toLocaleString()} ({ytdRate}%)</strong>
            </p>
          </div>
        )}
      </div>

      {/* Cash Flow Chart */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4">💵 Cash Flow</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="income" fill="#22C55E" radius={[4, 4, 0, 0]} />
            <Bar dataKey="spending" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Smart Insights */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">📌 Smart Insights</h2>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-700">
            ✅ You're saving <strong>{savingsRate}%</strong> of your income this month — up from 27%
            last month.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-700">
            💸 Subscriptions hit <strong>$480</strong> this month — trending up.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-700">
            📈 You've saved <strong>${ytdSaved.toLocaleString()}</strong> YTD. You're on pace to save
            over <strong>${Math.round((ytdSaved / 6) * 12).toLocaleString()}</strong> by year end.
          </p>
        </div>
      </div>
    </div>
  )
}