import { supabase, supabaseAdmin } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
    const { data, error } = await supabase
        .from('players')
        .select(`
            id,
            name,
            role,
            computed_stats(
                total_runs,
                total_wickets,
                batting_avg,
                strike_rate,
                economy,
                best_figures
            )
        `)
        .order('created_at', { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
} 

export async function POST(request: Request) {
    const body = await request.json()
    const { name, role } = body

    if (!name || !role) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
        .from('players')
        .insert({ name, role})
        .select('id, name, role')
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data, { status: 201 })
}
