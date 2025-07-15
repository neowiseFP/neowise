// pages/auth/callback.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (session) {
        router.replace('/dashboard')
      } else {
        // Try to exchange code from URL fragment
        const {
          data: { session: newSession },
          error: exchangeError,
        } = await supabase.auth.exchangeCodeForSession(window.location.hash)

        if (newSession) {
          router.replace('/dashboard')
        } else {
          console.error('Auth error:', error || exchangeError)
          router.replace('/login')
        }
      }
    }

    checkSession()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="text-center text-gray-700 text-lg">Logging you in...</div>
    </div>
  )
}