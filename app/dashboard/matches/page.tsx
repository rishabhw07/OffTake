'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'

interface Match {
  id: string
  matchScore: number
  matchReasons: string
  status: string
  rfq: any
  offtakeBaseline: any
  supplyListing: {
    id: string
    materialType: string
    materialGrade: string
    availableVolume: number
    unit: string
    supplier: {
      companyName: string
    }
  }
  contactRequests: Array<{
    id: string
    isAccepted: boolean
    isMutualOptIn: boolean
  }>
}

export default function MatchesPage() {
  const { data: session } = useSession()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [requestingContact, setRequestingContact] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      fetch('/api/matches')
        .then((res) => res.json())
        .then((data) => {
          setMatches(data.matches || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [session])

  const handleRequestContact = async (matchId: string) => {
    setRequestingContact(matchId)
    try {
      const response = await fetch('/api/contact-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId }),
      })

      if (response.ok) {
        alert('Contact request sent!')
        // Refresh matches
        const res = await fetch('/api/matches')
        const data = await res.json()
        setMatches(data.matches || [])
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to send contact request')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setRequestingContact(null)
    }
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div>Please sign in</div>
      </DashboardLayout>
    )
  }

  const isManufacturer = session.user.role === 'MANUFACTURER'

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Matches</h1>
      {loading ? (
        <div>Loading...</div>
      ) : matches.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600">No matches found yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => {
            const demand = match.rfq || match.offtakeBaseline
            const hasMutualOptIn = match.contactRequests.some((cr) => cr.isMutualOptIn)
            const hasContactRequest = match.contactRequests.length > 0

            return (
              <div key={match.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-4 mb-2">
                      <span className="text-2xl font-bold text-primary-600">
                        {Math.round(match.matchScore)}%
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {match.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mt-2">
                      {isManufacturer ? (
                        <>
                          Your {match.rfq ? 'RFQ' : 'Offtake Baseline'} matches with{' '}
                          {hasMutualOptIn ? (
                            <span className="text-primary-600">
                              {match.supplyListing.supplier.companyName}
                            </span>
                          ) : (
                            'Anonymous Supplier'
                          )}
                        </>
                      ) : (
                        <>
                          Your Supply Listing matches with{' '}
                          {hasMutualOptIn ? (
                            <span className="text-primary-600">
                              {demand?.manufacturer?.companyName || 'Anonymous Manufacturer'}
                            </span>
                          ) : (
                            'Anonymous Manufacturer'
                          )}
                        </>
                      )}
                    </h3>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {isManufacturer ? (
                        <>
                          <div>
                            <p className="text-sm text-gray-600">Your Requirement:</p>
                            <p className="font-medium">
                              {demand?.materialType} - {demand?.materialGrade}
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty: {demand?.quantity} {demand?.unit}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Matched Supply:</p>
                            <p className="font-medium">
                              {match.supplyListing.materialType} - {match.supplyListing.materialGrade}
                            </p>
                            <p className="text-sm text-gray-600">
                              Available: {match.supplyListing.availableVolume} {match.supplyListing.unit}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="text-sm text-gray-600">Your Supply:</p>
                            <p className="font-medium">
                              {match.supplyListing.materialType} - {match.supplyListing.materialGrade}
                            </p>
                            <p className="text-sm text-gray-600">
                              Available: {match.supplyListing.availableVolume} {match.supplyListing.unit}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Matched Requirement:</p>
                            <p className="font-medium">
                              {demand?.materialType} - {demand?.materialGrade}
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty: {demand?.quantity} {demand?.unit}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    {match.matchReasons && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">Match Reasons:</p>
                        <p className="text-sm">{match.matchReasons}</p>
                      </div>
                    )}
                  </div>
                </div>
                {!hasMutualOptIn && (
                  <div className="mt-4 pt-4 border-t">
                    {!hasContactRequest ? (
                      <button
                        onClick={() => handleRequestContact(match.id)}
                        disabled={requestingContact === match.id}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                      >
                        {requestingContact === match.id ? 'Sending...' : 'Request Contact'}
                      </button>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Contact request pending mutual opt-in
                      </p>
                    )}
                  </div>
                )}
                {hasMutualOptIn && (
                  <div className="mt-4 pt-4 border-t">
                    <a
                      href={`/dashboard/negotiations?matchId=${match.id}`}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 inline-block"
                    >
                      Start Negotiation
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
