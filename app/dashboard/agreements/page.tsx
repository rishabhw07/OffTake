'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'

interface Agreement {
  id: string
  finalPrice: number
  quantity: number
  status: string
  createdAt: string
  manufacturer: {
    companyName: string
  }
  supplier: {
    companyName: string
  }
}

export default function AgreementsPage() {
  const { data: session } = useSession()
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetch('/api/agreements')
        .then((res) => res.json())
        .then((data) => {
          setAgreements(data.agreements || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [session])

  if (!session) {
    return (
      <DashboardLayout>
        <div>Please sign in</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Agreements</h1>
      {loading ? (
        <div>Loading...</div>
      ) : agreements.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600">No agreements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {agreements.map((agreement) => (
            <div key={agreement.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">
                    Agreement with{' '}
                    {session.user.role === 'MANUFACTURER'
                      ? agreement.supplier.companyName
                      : agreement.manufacturer.companyName}
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Final Price</p>
                      <p className="font-medium">${agreement.finalPrice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quantity</p>
                      <p className="font-medium">{agreement.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Created: {new Date(agreement.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      agreement.status === 'EXECUTED'
                        ? 'bg-green-100 text-green-800'
                        : agreement.status === 'NEGOTIATING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {agreement.status}
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
