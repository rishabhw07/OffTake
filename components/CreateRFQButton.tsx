'use client'

import { useState } from 'react'
import CreateRFQModal from './CreateRFQModal'

export default function CreateRFQButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
      >
        Create RFQ
      </button>
      <CreateRFQModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
