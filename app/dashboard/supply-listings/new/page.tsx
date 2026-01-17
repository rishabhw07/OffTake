'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

export default function NewSupplyListingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    materialType: '',
    materialGrade: '',
    technicalSpecs: '',
    quality: '',
    availableVolume: '',
    unit: '',
    volumeOverTime: '',
    preferredDeliveryModes: '',
    deliveryLocation: '',
    pricingStructure: '',
    validFrom: '',
    validUntil: '',
  })

  if (!session || session.user.role !== 'SUPPLIER') {
    return (
      <DashboardLayout>
        <div>Unauthorized</div>
      </DashboardLayout>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/supply-listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          availableVolume: parseFloat(formData.availableVolume),
          validFrom: formData.validFrom || new Date().toISOString(),
          validUntil: formData.validUntil || undefined,
        }),
      })

      if (response.ok) {
        router.push('/dashboard/supply-listings')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to create supply listing')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Create Supply Listing</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material Type *
              </label>
              <input
                type="text"
                required
                value={formData.materialType}
                onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material Grade *
              </label>
              <input
                type="text"
                required
                value={formData.materialGrade}
                onChange={(e) => setFormData({ ...formData, materialGrade: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Technical Specifications *
            </label>
            <textarea
              required
              value={formData.technicalSpecs}
              onChange={(e) => setFormData({ ...formData, technicalSpecs: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quality / Certifications *
            </label>
            <textarea
              required
              value={formData.quality}
              onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Volume *
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.availableVolume}
                onChange={(e) => setFormData({ ...formData, availableVolume: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <input
                type="text"
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="kg, tons, units, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volume Over Time *
            </label>
            <textarea
              required
              value={formData.volumeOverTime}
              onChange={(e) => setFormData({ ...formData, volumeOverTime: e.target.value })}
              rows={2}
              placeholder="e.g., 1000 tons/month for 12 months"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Delivery Modes *
            </label>
            <textarea
              required
              value={formData.preferredDeliveryModes}
              onChange={(e) => setFormData({ ...formData, preferredDeliveryModes: e.target.value })}
              rows={2}
              placeholder="e.g., FOB, CIF, EXW"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Location
            </label>
            <input
              type="text"
              value={formData.deliveryLocation}
              onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pricing Structure *
            </label>
            <textarea
              required
              value={formData.pricingStructure}
              onChange={(e) => setFormData({ ...formData, pricingStructure: e.target.value })}
              rows={3}
              placeholder="e.g., $X per ton, or formula-based pricing"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid From *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid Until
              </label>
              <input
                type="datetime-local"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
