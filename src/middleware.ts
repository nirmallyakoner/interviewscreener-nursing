import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const method = request.method
  
  console.log('[Middleware] Request:', {
    pathname,
    method,
    url: request.url,
    timestamp: new Date().toISOString()
  })
  
  // Handle webhook trailing slash issue for Retell
  if (pathname === '/api/retell/webhook/') {
    console.log('[Middleware] ✅ Rewriting webhook URL (removing trailing slash)')
    const url = request.nextUrl.clone()
    url.pathname = '/api/retell/webhook'
    return NextResponse.rewrite(url)
  }

  // Update Supabase session for all non-webhook routes
  // Webhooks don't need session management as they use service role keys
  if (!pathname.startsWith('/api/retell/webhook') && !pathname.startsWith('/api/razorpay/webhook')) {
    console.log('[Middleware] 🔄 Updating Supabase session')
    return await updateSession(request)
  }

  console.log('[Middleware] ⏭️  Passing through to handler')
  return NextResponse.next()
}

export const config = {
  // Match all routes except static files and images
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
