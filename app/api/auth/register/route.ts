import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['MANUFACTURER', 'SUPPLIER']),
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const limit = rateLimit(clientIp)
    
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password with stronger salt rounds for production
    const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 10
    const passwordHash = await bcrypt.hash(validatedData.password, saltRounds)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        role: validatedData.role,
        companyName: validatedData.companyName,
        contactName: validatedData.contactName,
        phone: validatedData.phone,
        address: validatedData.address,
      },
      select: {
        id: true,
        email: true,
        role: true,
        companyName: true,
      }
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
