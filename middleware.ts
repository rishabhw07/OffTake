import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Add security headers
    const response = NextResponse.next()
    
    // Additional security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // Force HTTPS in production
    if (process.env.NODE_ENV === 'production') {
      const proto = req.headers.get('x-forwarded-proto')
      if (proto === 'http') {
        return NextResponse.redirect(
          `https://${req.headers.get('host')}${req.nextUrl.pathname}`,
          301
        )
      }
    }
    
    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect dashboard routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
  ],
}
