import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const rfqSchema = z.object({
  materialType: z.string().min(1),
  materialGrade: z.string().min(1),
  technicalSpecs: z.string().min(1),
  tolerances: z.string().optional(),
  complianceRequirements: z.string().min(1),
  incoterms: z.string().min(1),
  deliveryLocation: z.string().min(1),
  deliverySchedule: z.string().min(1),
  targetPrice: z.number().optional(),
  pricingFormula: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  expiresAt: z.string().datetime().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'MANUFACTURER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = rfqSchema.parse(body)

    const rfq = await prisma.rFQ.create({
      data: {
        manufacturerId: session.user.id,
        ...validatedData,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
      },
      include: {
        manufacturer: {
          select: {
            companyName: true,
          }
        }
      }
    })

    // Trigger matching algorithm
    // This would run in background in production
    await findMatchesForRFQ(rfq.id)

    return NextResponse.json({ rfq }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const myRFQs = searchParams.get('my') === 'true'

    const where: any = {}
    if (myRFQs && session.user.role === 'MANUFACTURER') {
      where.manufacturerId = session.user.id
    }

    const rfqs = await prisma.rFQ.findMany({
      where,
      include: {
        manufacturer: {
          select: {
            companyName: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Anonymize if user is not the owner
    const anonymizedRFQs = rfqs.map(rfq => {
      if (rfq.manufacturerId !== session.user.id && rfq.isAnonymous) {
        return {
          ...rfq,
          manufacturer: { companyName: 'Anonymous Manufacturer' }
        }
      }
      return rfq
    })

    return NextResponse.json({ rfqs: anonymizedRFQs })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function findMatchesForRFQ(rfqId: string) {
  const rfq = await prisma.rFQ.findUnique({
    where: { id: rfqId }
  })

  if (!rfq) return

  // Find matching supply listings
  const supplyListings = await prisma.supplyListing.findMany({
    where: {
      isActive: true,
      materialType: rfq.materialType,
      materialGrade: rfq.materialGrade,
    }
  })

  for (const listing of supplyListings) {
    // Calculate match score (simplified - in production, use more sophisticated algorithm)
    let matchScore = 0
    const reasons: string[] = []

    if (listing.materialType === rfq.materialType) {
      matchScore += 30
      reasons.push('Material type matches')
    }
    if (listing.materialGrade === rfq.materialGrade) {
      matchScore += 30
      reasons.push('Material grade matches')
    }
    // Add more matching logic based on specs, location, etc.

    if (matchScore >= 50) {
      await prisma.match.create({
        data: {
          rfqId: rfq.id,
          supplyListingId: listing.id,
          matchScore,
          matchReasons: JSON.stringify(reasons),
        }
      })
    }
  }
}
