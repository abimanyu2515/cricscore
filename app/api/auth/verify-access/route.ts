import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json();
    const { pin } = body;

    if (!pin) {
        return NextResponse.json({ error: "Pin is required" }, { status: 400 });
    }

    if (pin !== process.env.ACCESS_PIN) {
        return NextResponse.json({ error: "Invalid pin" }, { status: 401 });
    }

    const res = NextResponse.json({ status: 200 });
    res.cookies.set("cricscore_access", "granted", { 
        httpOnly: true, 
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax"
    });

    return res
}
