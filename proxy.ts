import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessCookie = request.cookies.get('cricscore_access')
  const adminCookie = request.cookies.get('cricscore_admin')

  const isAccessGranted = accessCookie?.value === 'granted'
  const isAdminGranted = adminCookie?.value === 'granted'

  const isAccessPage = pathname === '/access'
  const isAdminAccessPage = pathname === '/admin-access'
  const isVerifyAccessApi = pathname === '/api/auth/verify-access'
  const isVerifyAdminApi = pathname === '/api/auth/verify-admin'

  // Always allow the PIN entry pages and their APIs to load
  if (isAccessPage || isAdminAccessPage || isVerifyAccessApi || isVerifyAdminApi) {
    return NextResponse.next()
  }

  // Gate 1 — site-wide access PIN (checked first, applies to everything)
  if (!isAccessGranted) {
    return NextResponse.redirect(new URL('/access', request.url))
  }

  // Gate 2 — admin PIN (only applies to /admin routes)
  const isAdminRoute = pathname.startsWith('/admin')
  if (isAdminRoute && !isAdminGranted) {
    return NextResponse.redirect(new URL('/admin-access', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon-.*\\.png).*)',
  ],
}