import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            OffTake
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Privacy-First Procurement Platform for Materials
          </p>
          <p className="text-lg text-gray-600 mb-12">
            Connect manufacturers and suppliers through RFQs and long-term offtake agreements.
            All listings are anonymous until mutual opt-in.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
