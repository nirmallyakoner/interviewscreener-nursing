import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle webhook trailing slash issue
  if (request.nextUrl.pathname === '/api/retell/webhook/') {
    // Rewrite to the route without trailing slash instead of redirecting
    const url = request.nextUrl.clone()
    url.pathname = '/api/retell/webhook'
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/retell/:path*',
}
