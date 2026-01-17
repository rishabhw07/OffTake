import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const supplyListingSchema = z.object({
  materialType: z.string().min(1),
  materialGrade: z.string().min(1),
  technicalSpecs: z.string().min(1),
  quality: z.string().min(1),
  availableVolume: z.number().positive(),
  unit: z.string().min(1),
  volumeOverTime: z.string().min(1),
  preferredDeliveryModes: z.string().min(1),
  deliveryLocation: z.string().optional(),
  pricingStructure: z.string().min(1),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'SUPPLIER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = supplyListingSchema.parse(body)

    const listing = await prisma.supplyListing.create({
      data: {
        supplierId: session.user.id,
        ...validatedData,
        validFrom: new Date(validatedData.validFrom),
        validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : null,
      },
      include: {
        supplier: {
          select: {
            companyName: true,
          }
        }
      }
    })

    // Trigger matching algorithm
    await findMatchesForSupplyListing(listing.id)

    return NextResponse.json({ listing }, { status: 201 })
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
    const myListings = searchParams.get('my') === 'true'

    const where: any = {}
    if (myListings && session.user.role === 'SUPPLIER') {
      where.supplierId = session.user.id
    }

    const listings = await prisma.supplyListing.findMany({
      where,
      include: {
        supplier: {
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
    const anonymizedListings = listings.map(listing => {
      if (listing.supplierId !== session.user.id && listing.isAnonymous) {
        return {
          ...listing,
          supplier: { companyName: 'Anonymous Supplier' }
        }
      }
      return listing
    })

    return NextResponse.json({ listings: anonymizedListings })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function findMatchesForSupplyListing(listingId: string) {
  const listing = await prisma.supplyListing.findUnique({
    where: { id: listingId }
  })

  if (!listing) return

  // Find matching RFQs
  const rfqs = await prisma.rfq.findMany({
    where: {
      isActive: true,
      materialType: listing.materialType,
      materialGrade: listing.materialGrade,
    }
  })

  for (const rfq of rfqs) {
    let matchScore = 0
    const reasons: string[] = []

    if (rfq.materialType === listing.materialType) {
      matchScore += 30
      reasons.push('Material type matches')
    }
    if (rfq.materialGrade === listing.materialGrade) {
      matchScore += 30
      reasons.push('Material grade matches')
    }

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

  // Find matching offtake baselines
  const baselines = await prisma.offtakeBaseline.findMany({
    where: {
      isActive: true,
      materialType: listing.materialType,
      materialGrade: listing.materialGrade,
    }
  })

  for (const baseline of baselines) {
    let matchScore = 0
    const reasons: string[] = []

    if (baseline.materialType === listing.materialType) {
      matchScore += 30
      reasons.push('Material type matches')
    }
    if (baseline.materialGrade === listing.materialGrade) {
      matchScore += 30
      reasons.push('Material grade matches')
    }

    if (matchScore >= 50) {
      await prisma.match.create({
        data: {
          offtakeBaselineId: baseline.id,
          supplyListingId: listing.id,
          matchScore,
          matchReasons: JSON.stringify(reasons),
        }
      })
    }
  }
}
