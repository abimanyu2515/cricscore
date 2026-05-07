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

  return NextResponse.json({ success: true })
}