import { supabase, supabaseAdmin } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

export async function GET( request: Request, { params }: { params: Promise<{ id: string }> } ) {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    let query = supabase
        .from('score_entries')
        .select('*')
        .eq('player_id', id)
        .order('match_date', { ascending: false })

    if (date) {
        query = query.eq('match_date', date)
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await request.json()

    const {
        match_date,
        match_label,
        runs,
        balls_faced,
        singles,
        doubles,
        triples,
        fours,
        sixes,
        how_out,
        not_out,
        overs_bowled, 
        runs_given,
        wickets,
        maidens
    } = body

    // Validate required fields
    if (!match_date || !match_label) {
        return NextResponse.json(
            { error: "Match date and label are required to save scores" },
            { status: 400 }
        )
    }

    // Validate runs and balls faced 
    if (runs > 0 && (!balls_faced || balls_faced === 0)) {
        return NextResponse.json(
            { error: "You must specify the number of balls faced when scoring runs" },
            { status: 400 }
        )
    }

    // Validate runs breakdown
    const run_sum = (singles * 1) + (doubles * 2) + (triples * 3) + (fours * 4) + (sixes * 6)

    if (run_sum > runs) {
        return NextResponse.json(
            { error: "The total runs must be equal to the runs breakdown of singles, doubles, triples, fours, and sixes" },
            { status: 400 }
        )
    }

    // Validate overs bowled
    if ((runs_given || wickets) && (!overs_bowled || overs_bowled === 0)) {
        return NextResponse.json(
            { error: "You must specify the number of overs bowled when scoring runs given or taking wickets" },
            { status: 400 }
        )
    }

    const { data, error } = await supabaseAdmin
        .from('score_entries')
        .insert({
            player_id: id,
            match_date,
            match_label,
            runs,
            balls_faced,
            singles,
            doubles,
            triples,
            fours,
            sixes,
            how_out,
            not_out,
            overs_bowled, 
            runs_given,
            wickets,
            maidens
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}