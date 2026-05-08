import { supabase, supabaseAdmin } from "@/app/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string; entryId: string }> }
) {
    const { id, entryId } = await params

    const { data, error } = await supabase
        .from('score_entries')
        .select('*')
        .eq('id', entryId)
        .eq('player_id', id)
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string; entryId: string }> }
) {
    const { id, entryId } = await params
    const body = await request.json()

    const { 
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
        maidens,
     } = body
     
     if (runs > 0 && (!balls_faced || balls_faced == 0)) {
        return NextResponse.json(
            { error: "Balls faced must be greater than 0 if runs are scored" },
            { status: 400 }
        )
     }

     const run_sum = (singles * 1) + (doubles * 2) + (triples * 3) + (fours * 4) + (sixes * 6)
     if (run_sum !== runs) {
        return NextResponse.json(
            { error: "Runs do not match the sum of individual scoring components" },
            { status: 400 }
        )
     }

     if ((runs_given > 0 || wickets > 0) && (!overs_bowled || overs_bowled == 0)) {
        return NextResponse.json(
            { error: "Overs bowled must be greater than 0 if runs are given or wickets are taken" },
            { status: 400 }
        )
     }

     const { data, error } = await supabaseAdmin
        .from('score_entries')
        .update({
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
            maidens,
            updated_at: new Date().toISOString(),
        }).eq('id', entryId).eq('player_id', id)
        .select().single()
    
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; entryId: string }> }
) {
    const { id, entryId } = await params

    const { error } = await supabaseAdmin
        .from('score_entries')
        .delete()
        .eq('id', entryId)
        .eq('player_id', id)    

    if (error) {
        return NextResponse.json({ error: error.message, status: 500 })
    }

    return NextResponse.json({ success: true })
}
