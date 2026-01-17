'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import Link from 'next/link'

interface SupplyListing {
  id: string
  materialType: string
  materialGrade: string
  availableVolume: number
  unit: string
  isActive: boolean
  createdAt: string
}

export default function SupplyListingsPage() {
  const { data: session } = useSession()
  const [listings, setListings] = useState<SupplyListing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetch('/api/supply-listings?my=true')
        .then((res) => res.json())
        .then((data) => {
          setListings(data.listings || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [session])

  if (!session || session.user.role !== 'SUPPLIER') {
    return (
      <DashboardLayout>
        <div>Unauthorized</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Supply Listings</h1>
        <Link
          href="/dashboard/supply-listings/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Create Supply Listing
        </Link>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : listings.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-4">No supply listings yet</p>
          <Link
            href="/dashboard/supply-listings/new"
            className="text-primary-600 hover:underline"
          >
            Create your first supply listing
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">
                    {listing.materialType} - {listing.materialGrade}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Available Volume: {listing.availableVolume} {listing.unit}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Created: {new Date(listing.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      listing.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {listing.isActive ? 'Active' : 'Inactive'}
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
