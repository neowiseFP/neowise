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

type ViewMode = 'weekly' | 'monthly'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('monthly')
  const router = useRouter()

  const mockData = {
    monthly: [
      { name: 'Jan', income: 7200, spending: 4800 },
      { name: 'Feb', income: 7100, spending: 5000 },
      { name: 'Mar', income: 7300, spending: 5100 },
      { name: 'Apr', income: 7500, spending: 5200 },
      { name: 'May', income: 7600, spending: 5250 },
      { name: 'Jun', income: 7400, spending: 5300 },
    ],
    weekly: [
      { name: 'Week 1', income: 1800, spending: 1200 },
      { name: 'Week 2', income: 1700, spending: 1300 },
      { name: 'Week 3', income: 1900, spending: 1250 },
      { name: 'Week 4', income: 1800, spending: 1350 },
    ],
  }

  const netWorthHistory = [
    { name: 'Jan', net: 112000 },
    { name: 'Feb', net: 115000 },
    { name: 'Mar', net: 118500 },
    { name: 'Apr', net: 121000 },
    { name: 'May', net: 124000 },
    { name: 'Jun', net: 128000 },
  ]

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
          {['weekly', 'monthly'].map((mode) => (
            <button
              key={mode}
              className={`px-3 py-1 rounded-md text-sm font-medium border ${
                viewMode === mode ? 'bg-black text-white' : 'bg-white text-black'
              }`}
              onClick={() => setViewMode(mode as ViewMode)}
            >
              {mode[0].toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold text-sm text-gray-500 mb-1">You Saved</h2>
          <p className="text-2xl font-bold text-green-600">
            ${viewMode === 'monthly' ? 2400 : 600}
          </p>
          <p className="text-sm text-gray-500">Nice work this {viewMode} 💪</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 col-span-2">
          <h2 className="font-semibold text-sm text-gray-500 mb-1">Net Worth</h2>
          <p className="text-lg font-medium mb-2">$128,000</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={netWorthHistory}>
              <XAxis dataKey="name" />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="net" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cash Flow Bar Chart */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold text-lg mb-4">💵 Cash Flow ({viewMode})</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockData[viewMode]}>
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
      <div className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold">📌 Smart Insights</h2>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-700">
            💡 You spent 22% more on dining out this month compared to last month.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-700">
            💸 Subscriptions added up to $480 this month. Want to review them?
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-700">
            📈 Your savings rate this month is 33%. Keep it up!
          </p>
        </div>
      </div>
    </div>
  )
}