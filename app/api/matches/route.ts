import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get matches relevant to the user
    let matches

    if (session.user.role === 'MANUFACTURER') {
      matches = await prisma.match.findMany({
        where: {
          OR: [
            { rfq: { manufacturerId: session.user.id } },
            { offtakeBaseline: { manufacturerId: session.user.id } }
          ]
        },
        include: {
          rfq: {
            include: {
              manufacturer: {
                select: {
                  companyName: true,
                }
              }
            }
          },
          offtakeBaseline: {
            include: {
              manufacturer: {
                select: {
                  companyName: true,
                }
              }
            }
          },
          supplyListing: {
            include: {
              supplier: {
                select: {
                  companyName: true,
                }
              }
            }
          },
          contactRequests: true,
        },
        orderBy: {
          matchScore: 'desc'
        }
      })
    } else {
      matches = await prisma.match.findMany({
        where: {
          supplyListing: {
            supplierId: session.user.id
          }
        },
        include: {
          rfq: {
            include: {
              manufacturer: {
                select: {
                  companyName: true,
                }
              }
            }
          },
          offtakeBaseline: {
            include: {
              manufacturer: {
                select: {
                  companyName: true,
                }
              }
            }
          },
          supplyListing: {
            include: {
              supplier: {
                select: {
                  companyName: true,
                }
              }
            }
          },
          contactRequests: true,
        },
        orderBy: {
          matchScore: 'desc'
        }
      })
    }

    // Anonymize matches based on status
    const anonymizedMatches = matches.map(match => {
      const isMutualOptIn = match.contactRequests.some(
        cr => cr.isMutualOptIn
      )

      if (!isMutualOptIn) {
        if (session.user.role === 'MANUFACTURER') {
          return {
            ...match,
            supplyListing: {
              ...match.supplyListing,
              supplier: { companyName: 'Anonymous Supplier' }
            }
          }
        } else {
          const demand = match.rfq || match.offtakeBaseline
          if (demand) {
            return {
              ...match,
              rfq: match.rfq ? {
                ...match.rfq,
                manufacturer: { companyName: 'Anonymous Manufacturer' }
              } : null,
              offtakeBaseline: match.offtakeBaseline ? {
                ...match.offtakeBaseline,
                manufacturer: { companyName: 'Anonymous Manufacturer' }
              } : null,
            }
          }
        }
      }

      return match
    })

    return NextResponse.json({ matches: anonymizedMatches })
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
