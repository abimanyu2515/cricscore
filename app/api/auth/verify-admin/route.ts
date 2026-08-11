import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const { pin } = body

  if (!pin) {
    return NextResponse.json(
      { error: "PIN is required" },
      { status: 400 }
    )
  }

  if (pin !== process.env.ADMIN_PIN) {
    return NextResponse.json(
      { error: "Invalid PIN" },
      { status: 401 }
    )
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('cricscore_admin', 'granted', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  })
  response.cookies.set('cricscore_access', 'granted', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 1 * 1, // 1 minute
    sameSite: 'lax',
    path: '/',
  })

  return response
}