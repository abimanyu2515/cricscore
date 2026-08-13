import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessCookie = request.cookies.get('cricscore_access')

  const isAccessGranted = accessCookie?.value === 'granted'

  const isAccessPage = pathname === '/access'
  const isAdminAccessPage = pathname === '/admin-access'
  const isVerifyAccessApi = pathname === '/api/auth/verify-access'
  const isVerifyAdminApi = pathname === '/api/auth/verify-admin'

  // Always allow the PIN entry pages and their APIs to load
  if (isAccessPage || isAdminAccessPage || isVerifyAccessApi || isVerifyAdminApi) {
    return NextResponse.next()
  }

  // Gate — site-wide access PIN (applies to every route)
  if (!isAccessGranted) {
    return NextResponse.redirect(new URL('/access', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon-.*\\.png).*)',
  ],
}