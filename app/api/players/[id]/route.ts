import { supabase, supabaseAdmin } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const { data, error } = await supabase
        .from('players')
        .select(`
            id, name, role,
            computed_stats(
                total_runs,
                total_wickets,
                batting_avg,
                strike_rate,
                bowling_avg,
                economy,
                highest_score,
                best_figures,
                games_played                
            )
        `).eq('id', id).single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const body = await request.json()
    const { name, role } = body

    if (!name || !role) {
        return NextResponse.json({ error: "Name and role are required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
        .from('players')
        .update({ name, role })
        .eq('id', id)
        .select('id, name, role ')
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    const { error } = await supabaseAdmin
        .from('players')
        .delete()
        .eq('id', id)

    if (error) { 
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}