'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import Link from 'next/link'

interface RFQ {
  id: string
  materialType: string
  materialGrade: string
  quantity: number
  unit: string
  targetPrice: number | null
  isActive: boolean
  createdAt: string
  manufacturer: {
    companyName: string
  }
}

export default function RFQsPage() {
  const { data: session } = useSession()
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetch('/api/rfqs?my=true')
        .then((res) => res.json())
        .then((data) => {
          setRfqs(data.rfqs || [])
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
        <h1 className="text-3xl font-bold">My RFQs</h1>
        <Link
          href="/dashboard/rfqs/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Create RFQ
        </Link>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : rfqs.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-4">No RFQs yet</p>
          <Link
            href="/dashboard/rfqs/new"
            className="text-primary-600 hover:underline"
          >
            Create your first RFQ
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {rfqs.map((rfq) => (
            <div key={rfq.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">
                    {rfq.materialType} - {rfq.materialGrade}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Quantity: {rfq.quantity} {rfq.unit}
                  </p>
                  {rfq.targetPrice && (
                    <p className="text-gray-600">Target Price: ${rfq.targetPrice}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Created: {new Date(rfq.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      rfq.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {rfq.isActive ? 'Active' : 'Inactive'}
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
