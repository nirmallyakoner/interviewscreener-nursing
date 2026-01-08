import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const method = request.method
  
  console.log('[Middleware] Request:', {
    pathname,
    method,
    url: request.url,
    timestamp: new Date().toISOString()
  })
  
  // Handle webhook trailing slash issue
  if (pathname === '/api/retell/webhook/') {
    console.log('[Middleware] ✅ Rewriting webhook URL (removing trailing slash)')
    // Rewrite to the route without trailing slash instead of redirecting
    const url = request.nextUrl.clone()
    url.pathname = '/api/retell/webhook'
    return NextResponse.rewrite(url)
  }

  console.log('[Middleware] ⏭️  Passing through to handler')
  return NextResponse.next()
}

export const config = {
  matcher: '/api/retell/:path*',
}
