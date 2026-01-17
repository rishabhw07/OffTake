import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const agreementSchema = z.object({
  matchId: z.string(),
  finalPrice: z.number().positive(),
  finalTerms: z.string().min(1),
  quantity: z.number().positive(),
  deliverySchedule: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = agreementSchema.parse(body)

    // Verify match exists and mutual opt-in has occurred
    const match = await prisma.match.findUnique({
      where: { id: validatedData.matchId },
      include: {
        rfq: true,
        offtakeBaseline: true,
        supplyListing: true,
        contactRequests: true,
      }
    })

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    const hasMutualOptIn = match.contactRequests.some(
      cr => cr.isMutualOptIn
    )

    if (!hasMutualOptIn) {
      return NextResponse.json(
        { error: 'Mutual opt-in required before creating agreement' },
        { status: 400 }
      )
    }

    // Determine manufacturer and supplier
    const demand = match.rfq || match.offtakeBaseline
    if (!demand) {
      return NextResponse.json(
        { error: 'Invalid match' },
        { status: 400 }
      )
    }

    const manufacturerId = demand.manufacturerId
    const supplierId = match.supplyListing.supplierId

    // Verify user is one of the parties
    if (session.user.id !== manufacturerId && session.user.id !== supplierId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const agreement = await prisma.agreement.create({
      data: {
        matchId: validatedData.matchId,
        rfqId: match.rfqId,
        offtakeBaselineId: match.offtakeBaselineId,
        supplyListingId: match.supplyListingId,
        manufacturerId,
        supplierId,
        finalPrice: validatedData.finalPrice,
        finalTerms: validatedData.finalTerms,
        quantity: validatedData.quantity,
        deliverySchedule: validatedData.deliverySchedule,
      }
    })

    // Update match status
    await prisma.match.update({
      where: { id: validatedData.matchId },
      data: { status: 'CLOSED' }
    })

    return NextResponse.json({ agreement }, { status: 201 })
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

    const agreements = await prisma.agreement.findMany({
      where: {
        OR: [
          { manufacturerId: session.user.id },
          { supplierId: session.user.id }
        ]
      },
      include: {
        manufacturer: {
          select: {
            companyName: true,
          }
        },
        supplier: {
          select: {
            companyName: true,
          }
        },
        match: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ agreements })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
