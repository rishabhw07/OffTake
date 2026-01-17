import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const contactRequest = await prisma.contactRequest.findUnique({
      where: { id: params.id },
      include: {
        match: true,
      }
    })

    if (!contactRequest) {
      return NextResponse.json(
        { error: 'Contact request not found' },
        { status: 404 }
      )
    }

    if (contactRequest.requestedToId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Accept the request
    await prisma.contactRequest.update({
      where: { id: params.id },
      data: { isAccepted: true }
    })

    // Check if both parties have accepted (mutual opt-in)
    const allRequests = await prisma.contactRequest.findMany({
      where: { matchId: contactRequest.matchId }
    })

    const bothAccepted = allRequests.every(req => req.isAccepted)

    if (bothAccepted) {
      // Mutual opt-in achieved - deanonymize
      await prisma.contactRequest.updateMany({
        where: { matchId: contactRequest.matchId },
        data: { isMutualOptIn: true }
      })

      await prisma.match.update({
        where: { id: contactRequest.matchId },
        data: { status: 'MUTUAL_OPT_IN' }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
