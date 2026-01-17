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

    const agreement = await prisma.agreement.findUnique({
      where: { id: params.id }
    })

    if (!agreement) {
      return NextResponse.json(
        { error: 'Agreement not found' },
        { status: 404 }
      )
    }

    // Verify user is one of the parties
    if (agreement.manufacturerId !== session.user.id && 
        agreement.supplierId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Execute the agreement
    const updatedAgreement = await prisma.agreement.update({
      where: { id: params.id },
      data: {
        status: 'EXECUTED',
        executedAt: new Date(),
      }
    })

    return NextResponse.json({ agreement: updatedAgreement })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
