'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const isManufacturer = session?.user?.role === 'MANUFACTURER'
  const isSupplier = session?.user?.role === 'SUPPLIER'

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/matches', label: 'Matches' },
    ...(isManufacturer
      ? [
          { href: '/dashboard/rfqs', label: 'My RFQs' },
          { href: '/dashboard/offtake-baselines', label: 'Offtake Baselines' },
        ]
      : []),
    ...(isSupplier
      ? [{ href: '/dashboard/supply-listings', label: 'Supply Listings' }]
      : []),
    { href: '/dashboard/agreements', label: 'Agreements' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-bold text-primary-600">
                OffTake
              </Link>
              <div className="flex space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === item.href
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {session?.user?.companyName}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
