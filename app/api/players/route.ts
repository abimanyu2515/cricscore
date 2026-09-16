import { supabase, supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";
import type { derivedStatsProps } from "@/types/leaderboardProps";
import { invalidatePlayerRosterCache } from "@/lib/playerRoster";

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

export async function GET() {
    let playersRes = await supabase
            .from('players')
            .select(`
                id,
                name,
                role,
                batting_hand,
                bowling_hand,
                bowling_style,
                computed_stats(
                    games_played,
                    total_runs,
                    total_wickets,
                    batting_avg,
                    strike_rate,
                    bowling_avg,
                    economy,
                    highest_score,
                    best_figures
                )
            `)
            .order('created_at', { ascending: true })

    // Fallback if style columns not yet migrated in live DB
    if (playersRes.error && /batting_hand|bowling_hand|bowling_style|column/i.test(playersRes.error.message)) {
        const fallback = await supabase
            .from('players')
            .select(`
                id,
                name,
                role,
                computed_stats(
                    games_played,
                    total_runs,
                    total_wickets,
                    batting_avg,
                    strike_rate,
                    bowling_avg,
                    economy,
                    highest_score,
                    best_figures
                )
            `)
            .order('created_at', { ascending: true })
        if (!fallback.error) {
            // inject defaults client-side for not-yet-migrated rows
            const dataWithDefaults = (fallback.data as unknown[]).map((p) => ({
                ...(p as object),
                batting_hand: 'Right',
                bowling_hand: 'Right',
                bowling_style: 'Medium',
            }))
            playersRes = { data: dataWithDefaults, error: null } as unknown as typeof playersRes
        }
    }

    const entriesRes = await supabase
            .from('score_entries')
            .select('player_id, runs, balls_faced, fours, sixes, not_out, overs_bowled, runs_given, wickets, maidens')

    if (playersRes.error) {
        return NextResponse.json({ error: playersRes.error.message }, { status: 500 })
    }
    if (entriesRes.error) {
        return NextResponse.json({ error: entriesRes.error.message }, { status: 500 })
    }

    const derived = new Map<string, derivedStatsProps>()

    for (const entry of entriesRes.data) {
        const playerId = entry.player_id as string | null
        if (!playerId) continue

        const runs = Number(entry.runs) || 0
        const ballsFaced = Number(entry.balls_faced) || 0
        const wickets = Number(entry.wickets) || 0
        const maidens = Number(entry.maidens) || 0
        const oversBowled = Number(entry.overs_bowled) || 0

        const stats = derived.get(playerId) ?? {
            batInnings: 0,
            ballsFaced: 0,
            fours: 0,
            sixes: 0,
            notOuts: 0,
            bowlInnings: 0,
            oversBowled: 0,
            runsGiven: 0,
            maidens: 0,
            threeWi: 0,
            fiveWi: 0,
            fifties: 0,
            hundreds: 0,
        }

        const hasBatted = ballsFaced > 0 || runs > 0
        if (hasBatted) {
            stats.batInnings += 1
            if (entry.not_out) stats.notOuts += 1
            if (runs >= 100) {
                stats.hundreds += 1
            } else if (runs >= 50) {
                stats.fifties += 1
            }
        }

        const hasBowled = oversBowled > 0
        if (hasBowled) {
            stats.bowlInnings += 1
            if (wickets >= 3) stats.threeWi += 1
            if (wickets >= 5) stats.fiveWi += 1
        }

        stats.ballsFaced += ballsFaced
        stats.fours += Number(entry.fours) || 0
        stats.sixes += Number(entry.sixes) || 0
        stats.oversBowled += oversBowled
        stats.runsGiven += Number(entry.runs_given) || 0
        stats.maidens += maidens

        derived.set(playerId, stats)
    }

    const players = playersRes.data.map((player) => ({
        ...player,
        derived_stats: derived.get(player.id) ?? null,
    }))

    return NextResponse.json(players)
} 

export async function POST(request: Request) {
    const body = await request.json()
    const { name, role, batting_hand, bowling_hand, bowling_style } = body

    if (!name || !role) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const bh = normalizeBattingHand(batting_hand)
    const bwh = normalizeBowlingHand(bowling_hand)
    const bws = normalizeBowlingStyle(bowling_style)

    let insertRes: any = await supabaseAdmin
        .from('players')
        .insert({ name, role, batting_hand: bh, bowling_hand: bwh, bowling_style: bws })
        .select('id, name, role, batting_hand, bowling_hand, bowling_style')
        .single()

    if (insertRes.error && /batting_hand|bowling_hand|bowling_style|column/i.test(insertRes.error.message)) {
        insertRes = await supabaseAdmin
            .from('players')
            .insert({ name, role })
            .select('id, name, role')
            .single()
        if (!insertRes.error && insertRes.data) {
            insertRes.data = { ...insertRes.data, batting_hand: bh, bowling_hand: bwh, bowling_style: bws }
        }
    }

    if (insertRes.error) {
        return NextResponse.json({ error: insertRes.error.message }, { status: 500 })
    }

    invalidatePlayerRosterCache()
    
    return NextResponse.json(insertRes.data, { status: 201 })
}
