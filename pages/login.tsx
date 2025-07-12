'use client'
import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (!error) setSent(true)
    else alert(error.message)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Sign in to Neowise</h1>
      {sent ? (
        <p>Check your email for a magic link.</p>
      ) : (
        <div className="space-y-4">
          <input
            className="border p-2 w-64 rounded"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={handleLogin}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Send Magic Link
          </button>
        </div>
      )}
    </div>
  )
}