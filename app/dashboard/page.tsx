'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    rfqs: 0,
    baselines: 0,
    listings: 0,
    matches: 0,
    agreements: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      const isManufacturer = session.user.role === 'MANUFACTURER'
      
      Promise.all([
        isManufacturer
          ? fetch('/api/rfqs?my=true').then((res) => res.json()).then((data) => data.rfqs?.length || 0).catch(() => 0)
          : Promise.resolve(0),
        isManufacturer
          ? fetch('/api/offtake-baselines?my=true').then((res) => res.json()).then((data) => data.baselines?.length || 0).catch(() => 0)
          : Promise.resolve(0),
        !isManufacturer
          ? fetch('/api/supply-listings?my=true').then((res) => res.json()).then((data) => data.listings?.length || 0).catch(() => 0)
          : Promise.resolve(0),
        fetch('/api/matches').then((res) => res.json()).then((data) => data.matches?.length || 0).catch(() => 0),
        fetch('/api/agreements').then((res) => res.json()).then((data) => data.agreements?.length || 0).catch(() => 0),
      ]).then(([rfqs, baselines, listings, matches, agreements]) => {
        setStats({ rfqs, baselines, listings, matches, agreements })
        setLoading(false)
      })
    }
  }, [session])

  if (!session) {
    return null
  }

  const isManufacturer = session.user.role === 'MANUFACTURER'

  const statCards = [
    {
      label: isManufacturer ? 'Active RFQs' : 'Supply Listings',
      value: isManufacturer ? stats.rfqs : stats.listings,
      href: isManufacturer ? '/dashboard/rfqs' : '/dashboard/supply-listings',
    },
    ...(isManufacturer
      ? [
          {
            label: 'Offtake Baselines',
            value: stats.baselines,
            href: '/dashboard/offtake-baselines',
          },
        ]
      : []),
    {
      label: 'Matches',
      value: stats.matches,
      href: '/dashboard/matches',
    },
    {
      label: 'Agreements',
      value: stats.agreements,
      href: '/dashboard/agreements',
    },
  ]

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat) => (
                <a
                  key={stat.label}
                  href={stat.href}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
                >
                  <div className="text-2xl font-bold text-primary-600">{stat.value}</div>
                  <div className="text-gray-600 mt-2">{stat.label}</div>
                </a>
              ))}
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Welcome, {session.user.companyName}!</h2>
              <p className="text-gray-700">
                {isManufacturer
                  ? 'Post RFQs or offtake baselines to find suppliers. All listings are anonymous until mutual opt-in.'
                  : 'Post supply listings to match with manufacturer RFQs. All listings are anonymous until mutual opt-in.'}
              </p>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
