import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const contactRequestSchema = z.object({
  matchId: z.string(),
  message: z.string().optional(),
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
    const { matchId, message } = contactRequestSchema.parse(body)

    // Get the match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        rfq: true,
        offtakeBaseline: true,
        supplyListing: true,
      }
    })

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    // Determine who to contact
    let requestedToId: string
    if (session.user.role === 'MANUFACTURER') {
      requestedToId = match.supplyListing.supplierId
    } else {
      const demand = match.rfq || match.offtakeBaseline
      if (!demand) {
        return NextResponse.json(
          { error: 'Invalid match' },
          { status: 400 }
        )
      }
      requestedToId = demand.manufacturerId
    }

    // Check if request already exists
    const existingRequest = await prisma.contactRequest.findFirst({
      where: {
        matchId,
        requestedById: session.user.id,
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Contact request already sent' },
        { status: 400 }
      )
    }

    // Create contact request
    const contactRequest = await prisma.contactRequest.create({
      data: {
        matchId,
        requestedById: session.user.id,
        requestedToId,
        message,
      }
    })

    // Update match status
    await prisma.match.update({
      where: { id: matchId },
      data: { status: 'CONTACT_REQUESTED' }
    })

    return NextResponse.json({ contactRequest }, { status: 201 })
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

    const requests = await prisma.contactRequest.findMany({
      where: {
        OR: [
          { requestedById: session.user.id },
          { requestedToId: session.user.id }
        ]
      },
      include: {
        match: {
          include: {
            rfq: true,
            offtakeBaseline: true,
            supplyListing: true,
          }
        },
        requestedBy: {
          select: {
            companyName: true,
            email: true,
          }
        },
        requestedTo: {
          select: {
            companyName: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ requests })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
