'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import Link from 'next/link'

interface OfftakeBaseline {
  id: string
  materialType: string
  materialGrade: string
  quantity: number
  unit: string
  frequency: string
  isActive: boolean
  createdAt: string
}

export default function OfftakeBaselinesPage() {
  const { data: session } = useSession()
  const [baselines, setBaselines] = useState<OfftakeBaseline[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetch('/api/offtake-baselines?my=true')
        .then((res) => res.json())
        .then((data) => {
          setBaselines(data.baselines || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [session])

  if (!session || session.user.role !== 'MANUFACTURER') {
    return (
      <DashboardLayout>
        <div>Unauthorized</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Offtake Baselines</h1>
        <Link
          href="/dashboard/offtake-baselines/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Create Offtake Baseline
        </Link>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : baselines.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-4">No offtake baselines yet</p>
          <Link
            href="/dashboard/offtake-baselines/new"
            className="text-primary-600 hover:underline"
          >
            Create your first offtake baseline
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {baselines.map((baseline) => (
            <div key={baseline.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">
                    {baseline.materialType} - {baseline.materialGrade}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Quantity: {baseline.quantity} {baseline.unit} ({baseline.frequency})
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Created: {new Date(baseline.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      baseline.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {baseline.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
