import { supabase, supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";
import type { derivedStatsProps } from "@/types/leaderboardProps";

export async function GET() {
    const [playersRes, entriesRes] = await Promise.all([
        supabase
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
            .order('created_at', { ascending: true }),
        supabase
            .from('score_entries')
            .select('player_id, runs, balls_faced, fours, sixes, not_out, overs_bowled, runs_given, wickets')
    ])

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
        const runsGiven = Number(entry.runs_given) || 0
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
            threeWi: 0,
            fiveWi: 0,
        }

        const hasBatted = ballsFaced > 0 || runs > 0
        if (hasBatted) {
            stats.batInnings += 1
            if (entry.not_out) stats.notOuts += 1
        }

        const hasBowled = oversBowled > 0 || runsGiven > 0
        if (hasBowled) {
            stats.bowlInnings += 1
            if (wickets >= 3) stats.threeWi += 1
            if (wickets >= 5) stats.fiveWi += 1
        }

        stats.ballsFaced += ballsFaced
        stats.fours += Number(entry.fours) || 0
        stats.sixes += Number(entry.sixes) || 0
        stats.oversBowled += oversBowled
        stats.runsGiven += runsGiven

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
