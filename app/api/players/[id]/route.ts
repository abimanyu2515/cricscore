import { supabase, supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

const VALID_BOWLING_STYLES = ['Fast', 'Fast-medium', 'Medium-fast', 'Medium', 'Off spin', 'Leg spin'] as const

function normalizeBattingHand(v: unknown): string {
  return v === 'Left' ? 'Left' : 'Right'
}
function normalizeBowlingHand(v: unknown): string {
  return v === 'Left' ? 'Left' : 'Right'
}
function normalizeBowlingStyle(v: unknown): string {
  if (typeof v === 'string' && (VALID_BOWLING_STYLES as readonly string[]).includes(v)) return v
  return 'Medium'
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    let res: any = await supabase
        .from('players')
        .select(`
            id, name, role, batting_hand, bowling_hand, bowling_style,
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

    if (res.error && /batting_hand|bowling_hand|bowling_style|column/i.test(res.error.message)) {
        const fallback: any = await supabase
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
        if (!fallback.error && fallback.data) {
            res = { data: { ...fallback.data, batting_hand: 'Right', bowling_hand: 'Right', bowling_style: 'Medium' }, error: null }
        } else {
            return NextResponse.json({ error: fallback.error?.message ?? res.error.message }, { status: 500 })
        }
    }

    if (res.error) {
        return NextResponse.json({ error: res.error.message }, { status: 500 })
    }

    return NextResponse.json(res.data)
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const body = await request.json()
    const { name, role, batting_hand, bowling_hand, bowling_style } = body

    if (!name || !role) {
        return NextResponse.json({ error: "Name and role are required" }, { status: 400 })
    }

    const updatePayload: Record<string, string> = { name, role }
    if (batting_hand !== undefined) updatePayload.batting_hand = normalizeBattingHand(batting_hand)
    if (bowling_hand !== undefined) updatePayload.bowling_hand = normalizeBowlingHand(bowling_hand)
    if (bowling_style !== undefined) updatePayload.bowling_style = normalizeBowlingStyle(bowling_style)

    let patchRes: any = await supabaseAdmin
        .from('players')
        .update(updatePayload)
        .eq('id', id)
        .select('id, name, role, batting_hand, bowling_hand, bowling_style')
        .single()

    if (patchRes.error && /batting_hand|bowling_hand|bowling_style|column/i.test(patchRes.error.message)) {
        // fallback when columns not yet migrated: only update name/role
        const fallbackPayload: Record<string, string> = { name, role }
        patchRes = await supabaseAdmin
            .from('players')
            .update(fallbackPayload)
            .eq('id', id)
            .select('id, name, role')
            .single()
        if (!patchRes.error && patchRes.data) {
            patchRes.data = { ...patchRes.data, batting_hand: updatePayload.batting_hand ?? 'Right', bowling_hand: updatePayload.bowling_hand ?? 'Right', bowling_style: updatePayload.bowling_style ?? 'Medium' }
        }
    }

    if (patchRes.error) {
        return NextResponse.json({ error: patchRes.error.message }, { status: 500 })
    }

    return NextResponse.json(patchRes.data)
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