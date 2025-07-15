'use client'
import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleLogin = async () => {
    const redirectUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/dashboard/cashflow'
        : 'https://www.neowise.io/dashboard/cashflow'

    console.log('Redirecting to:', redirectUrl)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
        shouldCreateUser: true,
      },
    })

    if (!error) setSent(true)
    else alert(error.message)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">🔐 Sign in to Neowise</h1>

        {sent ? (
          <div className="text-center text-green-600">
            ✅ Check your email for a magic link.
          </div>
        ) : (
          <div className="space-y-4">
            <input
              className="w-full border rounded px-3 py-2"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handleLogin}
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition"
            >
              Send Magic Link
            </button>
          </div>
        )}
      </div>
    </div>
  )
}