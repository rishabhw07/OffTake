'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface RFQ {
  id: string
  materialType: string
  materialGrade: string
  quantity: number
  unit: string
  targetPrice: number | null
  deliveryLocation: string
  isActive: boolean
  expiresAt: string | null
  createdAt: string
}

export default function RFQList() {
  const { data: session } = useSession()
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRFQs()
  }, [])

  const fetchRFQs = async () => {
    try {
      const res = await fetch('/api/rfqs?my=true')
      const data = await res.json()
      setRfqs(data.rfqs || [])
    } catch (error) {
      console.error('Error fetching RFQs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (rfqs.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <p className="text-gray-600 mb-4">No RFQs yet. Create your first RFQ to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {rfqs.map((rfq) => (
        <div key={rfq.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {rfq.materialType} - {rfq.materialGrade}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Quantity:</span> {rfq.quantity} {rfq.unit}
                </div>
                {rfq.targetPrice && (
                  <div>
                    <span className="font-medium">Target Price:</span> ${rfq.targetPrice}
                  </div>
                )}
                <div>
                  <span className="font-medium">Location:</span> {rfq.deliveryLocation}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <span className={rfq.isActive ? 'text-green-600' : 'text-gray-500'}>
                    {rfq.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <Link
              href={`/dashboard/rfqs/${rfq.id}`}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              View
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
