import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const offtakeBaselineSchema = z.object({
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
  frequency: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
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
    const validatedData = offtakeBaselineSchema.parse(body)

    const baseline = await prisma.offtakeBaseline.create({
      data: {
        manufacturerId: session.user.id,
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
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
    await findMatchesForBaseline(baseline.id)

    return NextResponse.json({ baseline }, { status: 201 })
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
    const myBaselines = searchParams.get('my') === 'true'

    const where: any = {}
    if (myBaselines && session.user.role === 'MANUFACTURER') {
      where.manufacturerId = session.user.id
    }

    const baselines = await prisma.offtakeBaseline.findMany({
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
    const anonymizedBaselines = baselines.map(baseline => {
      if (baseline.manufacturerId !== session.user.id && baseline.isAnonymous) {
        return {
          ...baseline,
          manufacturer: { companyName: 'Anonymous Manufacturer' }
        }
      }
      return baseline
    })

    return NextResponse.json({ baselines: anonymizedBaselines })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function findMatchesForBaseline(baselineId: string) {
  const baseline = await prisma.offtakeBaseline.findUnique({
    where: { id: baselineId }
  })

  if (!baseline) return

  const supplyListings = await prisma.supplyListing.findMany({
    where: {
      isActive: true,
      materialType: baseline.materialType,
      materialGrade: baseline.materialGrade,
    }
  })

  for (const listing of supplyListings) {
    let matchScore = 0
    const reasons: string[] = []

    if (listing.materialType === baseline.materialType) {
      matchScore += 30
      reasons.push('Material type matches')
    }
    if (listing.materialGrade === baseline.materialGrade) {
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
