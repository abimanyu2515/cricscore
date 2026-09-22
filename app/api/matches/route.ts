import { supabase, supabaseAdmin } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("match_date", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

function parseMatchResult(value: unknown): boolean | null {
  if (value === undefined || value === null || String(value).trim() === "") return null
  if (typeof value === "boolean") return value
  const str = String(value).trim().toLowerCase()
  if (str === "true" || str === "won" || str === "win" || str === "1") return true
  if (str === "false" || str === "lost" || str === "loss" || str === "0") return false
  return null
}

export async function POST(request: Request) {
  const body = await request.json()
  const {
    team_1,
    score_1,
    overs_played_1,
    team_2,
    score_2,
    overs_played_2,
    location,
    match_type,
    match_date,
    match_result_desc,
    match_result,
  } = body as {
    team_1?: string
    score_1?: unknown
    overs_played_1?: unknown
    team_2?: string
    score_2?: unknown
    overs_played_2?: unknown
    location?: string
    match_type?: string
    match_date?: string
    match_result_desc?: string
    match_result?: unknown
  }

  // Validation - required fields per spec
  if (!match_date || String(match_date).trim() === "") {
    return NextResponse.json({ error: "Match date is required" }, { status: 400 })
  }
  const rawDate = String(match_date).trim()
  const parsedDate = new Date(rawDate)
  if (isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "Match date must be a valid date (YYYY-MM-DD)" }, { status: 400 })
  }
  if (!team_2 || String(team_2).trim() === "") {
    return NextResponse.json({ error: "Team 2 name is required" }, { status: 400 })
  }
  if (!location || String(location).trim() === "") {
    return NextResponse.json({ error: "Location is required" }, { status: 400 })
  }
  if (!match_type || String(match_type).trim() === "") {
    return NextResponse.json({ error: "Match type is required" }, { status: 400 })
  }
  if (match_result_desc === undefined || match_result_desc === null || String(match_result_desc).trim() === "") {
    return NextResponse.json({ error: "Match result description is required" }, { status: 400 })
  }

  const t1 = team_1 && String(team_1).trim() !== "" ? String(team_1).trim() : "Thunderbolts"
  const t2 = String(team_2).trim()
  const loc = String(location).trim()
  const mType = String(match_type).trim()
  const desc = String(match_result_desc).trim()
  const resultBool = parseMatchResult(match_result)

  const s1 = score_1
  const s2 = score_2
  const o1 = overs_played_1 !== undefined && overs_played_1 !== null && String(overs_played_1).trim() !== "" ? Number(String(overs_played_1).trim()) : 0
  const o2 = overs_played_2 !== undefined && overs_played_2 !== null && String(overs_played_2).trim() !== "" ? Number(String(overs_played_2).trim()) : 0

  const dateVal = String(match_date).trim()

  const { data, error } = await supabaseAdmin
    .from("matches")
    .insert({
      match_date: dateVal,
      match_type: mType,
      location: loc,
      team_1: t1,
      team_2: t2,
      score_1: s1,
      overs_played_1: o1,
      score_2: s2,
      overs_played_2: o2,
      match_result_desc: desc,
      match_result: resultBool,
    })
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
