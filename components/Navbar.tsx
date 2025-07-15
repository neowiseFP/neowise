'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) =>
    pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-blue-500'

  return (
    <nav className="flex items-center justify-between px-6 py-4 shadow bg-white">
      <div className="text-lg font-bold">Neo</div>
      <div className="flex gap-6">
        <Link href="/chat" className={isActive('/chat')}>Chat</Link>
        <Link href="/dashboard/cashflow" className={isActive('/dashboard/cashflow')}>Cash Flow</Link>
        <Link href="/dashboard/planning" className={isActive('/dashboard/planning')}>Planning</Link>
      </div>
    </nav>
  )
}
