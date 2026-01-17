import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const negotiationSchema = z.object({
  matchId: z.string(),
  proposedPrice: z.number().optional(),
  proposedTerms: z.string().min(1),
  notes: z.string().optional(),
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
    const validatedData = negotiationSchema.parse(body)

    // Verify match exists and mutual opt-in has occurred
    const match = await prisma.match.findUnique({
      where: { id: validatedData.matchId },
      include: {
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
        { error: 'Mutual opt-in required before negotiation' },
        { status: 400 }
      )
    }

    const negotiation = await prisma.negotiation.create({
      data: {
        matchId: validatedData.matchId,
        initiatedById: session.user.id,
        proposedPrice: validatedData.proposedPrice,
        proposedTerms: validatedData.proposedTerms,
        notes: validatedData.notes,
      }
    })

    // Update match status
    await prisma.match.update({
      where: { id: validatedData.matchId },
      data: { status: 'NEGOTIATING' }
    })

    return NextResponse.json({ negotiation }, { status: 201 })
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
    const matchId = searchParams.get('matchId')

    const where: any = {}
    if (matchId) {
      where.matchId = matchId
    }

    const negotiations = await prisma.negotiation.findMany({
      where,
      include: {
        match: {
          include: {
            rfq: true,
            offtakeBaseline: true,
            supplyListing: true,
          }
        },
        initiatedBy: {
          select: {
            companyName: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ negotiations })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
