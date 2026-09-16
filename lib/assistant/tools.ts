import { supabase } from "@/lib/supabase";
import { Type } from "@google/genai";
import type { FunctionDeclaration } from "@google/genai";

// ── helpers ──

function oversToBalls(overs: number): number {
  const intPart = Math.floor(overs);
  const frac = overs - intPart;
  // supabase stores 4.2 => 4 overs + 2 balls. Multiply frac by 10 to get balls.
  const ballsFromFrac = Math.round(frac * 10);
  return intPart * 6 + ballsFromFrac;
}

function ballsToOvers(balls: number): number {
  const overs = Math.floor(balls / 6);
  const rem = balls % 6;
  // return as numeric overs_bowled style e.g. 4.2
  return overs + rem / 10;
}

// ------ Table type for querying and retrieving data ------
interface ComputedStatsRow {
  player_id: string;
  total_runs: number | null;
  total_wickets: number | null;
  batting_avg: number | null;
  strike_rate: number | null;
  bowling_avg: number | null;
  economy: number | null;
  highest_score: number | null;
  best_figures: string | null;
  games_played: number | null;
}

interface PlayerRow {
  id: string;
  name: string;
  role: string | null;
  batting_hand?: string | null;
  bowling_hand?: string | null;
  bowling_style?: string | null;
}

interface ScoreEntryRow {
  id: string;
  player_id: string;
  match_date: string;
  match_label: string;
  runs: number | null;
  balls_faced: number | null;
  fours: number | null;
  sixes: number | null;
  singles: number | null;
  doubles: number | null;
  triples: number | null;
  not_out: boolean | null;
  how_out: string | null;
  overs_bowled: number | null;
  runs_given: number | null;
  wickets: number | null;
  maidens: number | null;
  created_at?: string | null;
}

// ------ End of table type for querying and retrieving data ------

// ── Tier 1 ──

export interface GetPlayerStatsResult {
  player: PlayerRow | null;
  computed_stats: ComputedStatsRow | null;
  derived: {
    batInnings: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
    notOuts: number;
    bowlInnings: number;
    oversBowled: number;
    runsGiven: number;
    threeWi: number;
    fiveWi: number;
    fifties: number;
    hundreds: number;
  } | null;
  error?: string;
}

export async function get_player_stats(args: { player_id: string }): Promise<GetPlayerStatsResult> {
  const playerId = args.player_id;
  if (!playerId) return { player: null, computed_stats: null, derived: null, error: "player_id is required" };

  const playerRes = await supabase.from("players").select("id, name, role, batting_hand, bowling_hand, bowling_style").eq("id", playerId).single();
  if (playerRes.error) return { player: null, computed_stats: null, derived: null, error: playerRes.error.message };

  const statsRes = await supabase.from("computed_stats").select("player_id, total_runs, total_wickets, batting_avg, strike_rate, bowling_avg, economy, highest_score, best_figures, games_played").eq("player_id", playerId).single();
  // computed_stats may not exist for new player — treat as null not error
  const computed = statsRes.error ? null : (statsRes.data as ComputedStatsRow);

  const entriesRes = await supabase.from("score_entries").select("player_id, runs, balls_faced, fours, sixes, not_out, overs_bowled, runs_given, wickets").eq("player_id", playerId);
  if (entriesRes.error) return { player: playerRes.data as PlayerRow, computed_stats: computed, derived: null, error: entriesRes.error.message };

  let batInnings = 0, ballsFaced = 0, fours = 0, sixes = 0, notOuts = 0, bowlInnings = 0, oversBowled = 0, runsGiven = 0, threeWi = 0, fiveWi = 0, fifties = 0, hundreds = 0;
  for (const e of entriesRes.data as ScoreEntryRow[]) {
    const runs = Number(e.runs) || 0;
    const bf = Number(e.balls_faced) || 0;
    const wkts = Number(e.wickets) || 0;
    const rg = Number(e.runs_given) || 0;
    const ov = Number(e.overs_bowled) || 0;
    const hasBatted = bf > 0 || runs > 0;
    if (hasBatted) {
      batInnings += 1;
      if (e.not_out) notOuts += 1;
      if (runs >= 100) {
        hundreds += 1;
      } else if (runs >= 50) {
        fifties += 1;
      }
    }
    const hasBowled = ov > 0 || rg > 0;
    if (hasBowled) {
      bowlInnings += 1;
      if (wkts >= 3) threeWi += 1;
      if (wkts >= 5) fiveWi += 1;
    }
    ballsFaced += bf;
    fours += Number(e.fours) || 0;
    sixes += Number(e.sixes) || 0;
    oversBowled += ov;
    runsGiven += rg;
  }

  return {
    player: playerRes.data as PlayerRow,
    computed_stats: computed,
    derived: { batInnings, ballsFaced, fours, sixes, notOuts, bowlInnings, oversBowled, runsGiven, threeWi, fiveWi, fifties, hundreds },
  };
}

export interface GetLeaderboardArgs {
  category: "batting" | "bowling";
  order?: "top" | "bottom";
  limit?: number;
}

export async function get_leaderboard(args: GetLeaderboardArgs) {
  const category = args.category === "bowling" ? "bowling" : "batting";
  const order = args.order === "bottom" ? "bottom" : "top";
  const limit = typeof args.limit === "number" ? Math.min(Math.max(args.limit, 1), 50) : 10;

  const playersRes = await supabase.from("players").select("id, name, role, computed_stats(total_runs, total_wickets, batting_avg, strike_rate, bowling_avg, economy, highest_score, best_figures, games_played)").order("created_at", { ascending: true });
  if (playersRes.error) return { error: playersRes.error.message, players: [] };

  const entriesRes = await supabase.from("score_entries").select("player_id, runs, balls_faced, fours, sixes, not_out, overs_bowled, runs_given, wickets");
  if (entriesRes.error) return { error: entriesRes.error.message, players: [] };

  // build derived map like /api/players route
  const derived = new Map<string, { batInnings: number; ballsFaced: number; fours: number; sixes: number; notOuts: number; bowlInnings: number; oversBowled: number; runsGiven: number; threeWi: number; fiveWi: number; fifties: number; hundreds: number }>();
  for (const e of entriesRes.data as ScoreEntryRow[]) {
    const pid = e.player_id as string;
    if (!pid) continue;
    const cur = derived.get(pid) ?? { batInnings: 0, ballsFaced: 0, fours: 0, sixes: 0, notOuts: 0, bowlInnings: 0, oversBowled: 0, runsGiven: 0, threeWi: 0, fiveWi: 0, fifties: 0, hundreds: 0 };
    const runs = Number(e.runs) || 0;
    const bf = Number(e.balls_faced) || 0;
    const wkts = Number(e.wickets) || 0;
    const rg = Number(e.runs_given) || 0;
    const ov = Number(e.overs_bowled) || 0;
    if (bf > 0 || runs > 0) {
      cur.batInnings += 1;
      if (e.not_out) cur.notOuts += 1;
      if (runs >= 100) {
        cur.hundreds += 1;
      } else if (runs >= 50) {
        cur.fifties += 1;
      }
    }
    if (ov > 0 || rg > 0) {
      cur.bowlInnings += 1;
      if (wkts >= 3) cur.threeWi += 1;
      if (wkts >= 5) cur.fiveWi += 1;
    }
    cur.ballsFaced += bf;
    cur.fours += Number(e.fours) || 0;
    cur.sixes += Number(e.sixes) || 0;
    cur.oversBowled += ov;
    cur.runsGiven += rg;
    derived.set(pid, cur);
  }

  type Enriched = {
    id: string; name: string; role: string | null;
    computed_stats: { total_runs: number | null; total_wickets: number | null; batting_avg: number | null; strike_rate: number | null; bowling_avg: number | null; economy: number | null; highest_score: number | null; best_figures: string | null; games_played: number | null } | null;
    derived_stats: typeof derived extends Map<string, infer V> ? V : never;
  };

  const enriched: Enriched[] = (playersRes.data as unknown as Array<{ id: string; name: string; role: string | null; computed_stats: Enriched["computed_stats"] | Enriched["computed_stats"][] }>).map((p) => {
    const cs = Array.isArray(p.computed_stats) ? (p.computed_stats[0] ?? null) : p.computed_stats;
    // computed_stats comes as array due to supabase relation — normalize
    return {
      id: p.id,
      name: p.name,
      role: p.role,
      computed_stats: cs as Enriched["computed_stats"],
      derived_stats: derived.get(p.id) ?? { batInnings: 0, ballsFaced: 0, fours: 0, sixes: 0, notOuts: 0, bowlInnings: 0, oversBowled: 0, runsGiven: 0, threeWi: 0, fiveWi: 0, fifties: 0, hundreds: 0 },
    };
  });

  const compareOptionalNumbersAsc = (a: number | null | undefined, b: number | null | undefined): number => {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    return a - b;
  };
  const parseBestFigures = (bf: string | null | undefined) => {
    const [wRaw = "0", rRaw = "0"] = (bf ?? "0/0").split("/");
    const w = Number.parseInt(wRaw, 10);
    const r = Number.parseInt(rRaw, 10);
    return { wickets: Number.isFinite(w) ? w : 0, runs: Number.isFinite(r) ? r : 0 };
  };

  if (category === "batting") {
    enriched.sort((a, b) => {
      const runsA = a.computed_stats?.total_runs ?? 0;
      const runsB = b.computed_stats?.total_runs ?? 0;
      if (runsB !== runsA) return runsB - runsA;
      const avgA = a.computed_stats?.batting_avg ?? 0;
      const avgB = b.computed_stats?.batting_avg ?? 0;
      if (avgB !== avgA) return avgB - avgA;
      const srA = a.computed_stats?.strike_rate ?? 0;
      const srB = b.computed_stats?.strike_rate ?? 0;
      if (srB !== srA) return srB - srA;
      return compareOptionalNumbersAsc(a.derived_stats.batInnings, b.derived_stats.batInnings);
    });
  } else {
    enriched.sort((a, b) => {
      const wA = a.computed_stats?.total_wickets ?? 0;
      const wB = b.computed_stats?.total_wickets ?? 0;
      if (wB !== wA) return wB - wA;
      const ecoOrder = compareOptionalNumbersAsc(a.computed_stats?.economy, b.computed_stats?.economy);
      if (ecoOrder !== 0) return ecoOrder;
      const avgOrder = compareOptionalNumbersAsc(a.computed_stats?.bowling_avg, b.computed_stats?.bowling_avg);
      if (avgOrder !== 0) return avgOrder;
      const { wickets: wbA, runs: rbA } = parseBestFigures(a.computed_stats?.best_figures);
      const { wickets: wbB, runs: rbB } = parseBestFigures(b.computed_stats?.best_figures);
      if (wbB !== wbA) return wbB - wbA;
      if (rbA !== rbB) return rbA - rbB;
      return 0;
    });
  }

  const sliced = order === "bottom" ? [...enriched].reverse().slice(0, limit) : enriched.slice(0, limit);
  return { category, order, limit, players: sliced };
}

export async function compare_players(args: { player_ids: string[] }) {
  const ids = Array.isArray(args.player_ids) ? args.player_ids.filter((id) => typeof id === "string" && id.length > 0).slice(0, 5) : [];
  if (ids.length < 2) return { error: "Provide at least 2 player_ids (max 5)", players: [] };
  const results = await Promise.all(ids.map((id) => get_player_stats({ player_id: id })));
  return { players: results };
}

// ── Tier 2 ──

const ALLOWLIST_TABLES = ["players", "score_entries", "computed_stats"] as const;
type AllowTable = typeof ALLOWLIST_TABLES[number];

const ALLOWLIST_COLUMNS: Record<AllowTable, Set<string>> = {
  players: new Set(["id", "name", "role", "batting_hand", "bowling_hand", "bowling_style", "created_at"]),
  score_entries: new Set(["id", "player_id", "match_date", "match_label", "runs", "balls_faced", "singles", "doubles", "triples", "fours", "sixes", "how_out", "not_out", "overs_bowled", "runs_given", "wickets", "maidens", "created_at"]),
  computed_stats: new Set(["id", "player_id", "total_runs", "total_wickets", "batting_avg", "strike_rate", "bowling_avg", "economy", "highest_score", "best_figures", "games_played", "last_updated"]),
};

const ALLOWLIST_OPERATORS = new Set(["eq", "neq", "gt", "gte", "lt", "lte", "ilike", "like", "in"]);

interface QueryFilter {
  column: string;
  op: string;
  value: string | number | boolean | Array<string | number>;
}

export interface QueryTeamDataArgs {
  table: string;
  select: string;
  filters?: QueryFilter[];
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}

export async function query_team_data(args: QueryTeamDataArgs) {
  const table = args.table as AllowTable;
  if (!ALLOWLIST_TABLES.includes(table)) {
    return { error: `Table not allowlisted. Allowed: ${ALLOWLIST_TABLES.join(", ")}`, rows: [] };
  }

  const rawSelect = typeof args.select === "string" ? args.select : "*";
  const requestedCols = rawSelect === "*" ? ["*"] : rawSelect.split(",").map((c) => c.trim()).filter(Boolean);
  if (requestedCols[0] !== "*") {
    for (const col of requestedCols) {
      // allow e.g. "players(name)"? For simplicity only bare columns — reject joins
      const bare = col.split("(")[0].trim();
      if (!ALLOWLIST_COLUMNS[table].has(bare)) {
        return { error: `Column '${bare}' not allowlisted for table '${table}'. Allowed: ${[...ALLOWLIST_COLUMNS[table]].join(", ")}`, rows: [] };
      }
    }
  }
  const selectStr = requestedCols[0] === "*" ? "*" : requestedCols.join(", ");

  const rowCap = 200;
  const limit = typeof args.limit === "number" ? Math.min(Math.max(Math.floor(args.limit), 1), rowCap) : 50;

  let query = supabase.from(table).select(selectStr);

  if (Array.isArray(args.filters)) {
    for (const f of args.filters) {
      if (!f || typeof f.column !== "string" || typeof f.op !== "string") {
        return { error: "Each filter must have column, op, value", rows: [] };
      }
      if (!ALLOWLIST_COLUMNS[table].has(f.column)) {
        return { error: `Filter column '${f.column}' not allowlisted for '${table}'`, rows: [] };
      }
      if (!ALLOWLIST_OPERATORS.has(f.op)) {
        return { error: `Operator '${f.op}' not allowlisted. Allowed: ${[...ALLOWLIST_OPERATORS].join(", ")}`, rows: [] };
      }
      const op = f.op;
      const col = f.column;
      const val = f.value;
      // use parameterized builder — never raw SQL
      if (op === "eq") query = query.eq(col, val as string);
      else if (op === "neq") query = query.neq(col, val as string);
      else if (op === "gt") query = query.gt(col, val as string);
      else if (op === "gte") query = query.gte(col, val as string);
      else if (op === "lt") query = query.lt(col, val as string);
      else if (op === "lte") query = query.lte(col, val as string);
      else if (op === "ilike") query = query.ilike(col, String(val));
      else if (op === "like") query = query.like(col, String(val));
      else if (op === "in") {
        if (!Array.isArray(val)) return { error: "'in' operator requires array value", rows: [] };
        query = query.in(col, val as string[]);
      }
    }
  }

  if (args.orderBy && typeof args.orderBy.column === "string") {
    if (!ALLOWLIST_COLUMNS[table].has(args.orderBy.column)) {
      return { error: `orderBy column '${args.orderBy.column}' not allowlisted for '${table}'`, rows: [] };
    }
    query = query.order(args.orderBy.column, { ascending: args.orderBy.ascending ?? true });
  }

  query = query.limit(limit);

  const res = await query;
  if (res.error) return { error: res.error.message, rows: [] };
  return { table, select: selectStr, rows: res.data, rowCount: (res.data as unknown[]).length, limit };
}

// ── Tier 3 ──

export async function getPlayerVsOpponentStats(args: { player_id: string; opponent: string }) {
  const playerId = args.player_id;
  const opponent = typeof args.opponent === "string" ? args.opponent.trim() : "";
  if (!playerId || !opponent) return { error: "player_id and opponent are required", stats: null };

  const playerRes = await supabase.from("players").select("id, name").eq("id", playerId).single();
  if (playerRes.error) return { error: playerRes.error.message, stats: null };

  // fetch all entries for player and filter by match_label ilike opponent
  const entriesRes = await supabase.from("score_entries").select("*").eq("player_id", playerId).ilike("match_label", `%${opponent}%`);
  if (entriesRes.error) return { error: entriesRes.error.message, stats: null };

  const rows = entriesRes.data as ScoreEntryRow[];
  if (rows.length === 0) {
    return { player: playerRes.data, opponent, matches: 0, stats: null, message: `No matches found vs opponent containing '${opponent}'` };
  }

  let totalRuns = 0, ballsFaced = 0, fours = 0, sixes = 0, dismissals = 0, batInnings = 0;
  let totalWickets = 0, totalOversBalls = 0, runsGiven = 0;
  let highestScore = 0;
  let bestFigures: string | null = null;
  let bestWickets = -1, bestRuns = Infinity;

  for (const e of rows) {
    const runs = Number(e.runs) || 0;
    const bf = Number(e.balls_faced) || 0;
    const wkts = Number(e.wickets) || 0;
    const rg = Number(e.runs_given) || 0;
    const ov = Number(e.overs_bowled) || 0;

    const hasBatted = bf > 0 || runs > 0;
    if (hasBatted) {
      batInnings += 1;
      totalRuns += runs;
      ballsFaced += bf;
      fours += Number(e.fours) || 0;
      sixes += Number(e.sixes) || 0;
      if (!e.not_out) dismissals += 1;
      if (runs > highestScore) highestScore = runs;
    }
    const hasBowled = ov > 0 || rg > 0;
    if (hasBowled) {
      totalWickets += wkts;
      totalOversBalls += oversToBalls(ov);
      runsGiven += rg;
      // best figures
      if (wkts > bestWickets || (wkts === bestWickets && rg < bestRuns)) {
        bestWickets = wkts;
        bestRuns = rg;
        bestFigures = `${wkts}/${rg}`;
      }
    }
  }

  const batting_avg = dismissals > 0 ? Number((totalRuns / dismissals).toFixed(2)) : null;
  const strike_rate = ballsFaced > 0 ? Number(((totalRuns / ballsFaced) * 100).toFixed(2)) : null;
  const oversBowled = totalOversBalls / 6;
  const economy = totalOversBalls > 0 ? Number((runsGiven / (totalOversBalls / 6)).toFixed(2)) : null;
  // const bowling_avg = totalWickets > 0 ? Number((runsGiven / totalWickets).toFixed(2)) : null;

  return {
    player: playerRes.data,
    opponent,
    matches: rows.length,
    stats: {
      totalRuns, ballsFaced, fours, sixes, batInnings, dismissals,
      batting_avg, strike_rate, highestScore,
      totalWickets, oversBowled: Number(oversBowled.toFixed(1)), runsGiven, economy, bestFigures,
    },
  };
}

export interface SimulateStatChangeArgs {
  player_id: string;
  hypothetical: {
    runs?: number;
    is_out?: boolean;
    overs?: number;
    runs_given?: number;
    wickets?: number;
  };
}

export async function simulateStatChange(args: SimulateStatChangeArgs) {
  const playerId = args.player_id;
  const hypo = args.hypothetical ?? {};
  if (!playerId) return { error: "player_id is required" };

  const playerStats = await get_player_stats({ player_id: playerId });
  if (playerStats.error) return { error: playerStats.error };
  if (!playerStats.computed_stats) return { error: "No computed stats found for player" };

  const cs = playerStats.computed_stats;
  const derived = playerStats.derived;
  if (!derived) return { error: "No derived stats" };

  const runsAdd = typeof hypo.runs === "number" ? hypo.runs : 0;
  const isOut = typeof hypo.is_out === "boolean" ? hypo.is_out : true; // default dismissed
  const oversAdd = typeof hypo.overs === "number" ? hypo.overs : 0;
  const runsGivenAdd = typeof hypo.runs_given === "number" ? hypo.runs_given : 0;
  const wicketsAdd = typeof hypo.wickets === "number" ? hypo.wickets : 0;

  // Validate maiden: if overs>0 and runs_given===0 then maiden implied, but no separate handling beyond economy 0.
  const currentRuns = cs.total_runs ?? 0;
  const currentWickets = cs.total_wickets ?? 0;
  const batInnings = derived.batInnings;
  const notOuts = derived.notOuts;
  const dismissals = batInnings - notOuts;
  const ballsFaced = derived.ballsFaced; // we don't have balls for hypo — assume balls = runs if not provided? Use ballsFaced not incremented unless we estimate. We'll treat hypo doesn't add ballsFaced unless runs implies balls? Simpler: don't project SR without balls.
  // For projection we need to handle is_out logic
  const newTotalRuns = currentRuns + runsAdd;
  const newDismissals = dismissals + (isOut ? 1 : 0);
  const newBatInnings = batInnings + 1; // hypothetical adds one innings
  const newNotOuts = notOuts + (isOut ? 0 : 1);
  const newBattingAvg = newDismissals > 0 ? Number((newTotalRuns / newDismissals).toFixed(2)) : null;
  const newHighestScore = Math.max(cs.highest_score ?? 0, runsAdd);

  // bowling projection
  const currentRunsGiven = derived.runsGiven;
  const currentOversBalls = oversToBalls(derived.oversBowled);
  const addBalls = oversToBalls(oversAdd);
  const newOversBalls = currentOversBalls + addBalls;
  const newRunsGiven = currentRunsGiven + runsGivenAdd;
  const newWickets = currentWickets + wicketsAdd;
  const newOvers = newOversBalls / 6;
  const newEconomy = newOversBalls > 0 ? Number((newRunsGiven / (newOversBalls / 6)).toFixed(2)) : null;
  const newBowlingAvg = newWickets > 0 ? Number((newRunsGiven / newWickets).toFixed(2)) : null;
  const isMaiden = oversAdd > 0 && runsGivenAdd === 0;

  return {
    player: playerStats.player,
    current: {
      total_runs: currentRuns,
      batting_avg: cs.batting_avg,
      strike_rate: cs.strike_rate,
      highest_score: cs.highest_score,
      total_wickets: currentWickets,
      economy: cs.economy,
      bowling_avg: cs.bowling_avg,
      oversBowled: derived.oversBowled,
      runsGiven: currentRunsGiven,
      dismissals, batInnings, notOuts, ballsFaced,
    },
    hypothetical: { runs: runsAdd, is_out: isOut, overs: oversAdd, runs_given: runsGivenAdd, wickets: wicketsAdd, isMaiden },
    projected: {
      total_runs: newTotalRuns,
      batInnings: newBatInnings,
      notOuts: newNotOuts,
      dismissals: newDismissals,
      batting_avg: newBattingAvg,
      highest_score: newHighestScore,
      total_wickets: newWickets,
      oversBowled: Number(newOvers.toFixed(1)),
      runsGiven: newRunsGiven,
      economy: newEconomy,
      bowling_avg: newBowlingAvg,
    },
    notes: [
      isOut ? "Hypothetical counts as dismissal." : "Not-out does not increment dismissal for average.",
      isMaiden ? "Maiden over: 0 runs conceded in this hypothetical." : "",
    ].filter(Boolean),
  };
}

export interface GetInningsToReachCumulativeThresholdArgs {
  table: string;
  metric: string;
  threshold: number;
  order: "fewest" | "most";
  limit?: number;
}

export async function getInningsToReachCumulativeThreshold(args: GetInningsToReachCumulativeThresholdArgs) {
  const metric = typeof args.metric === "string" ? args.metric : "";
  const threshold = Number(args.threshold);
  const order = args.order === "most" ? "most" : "fewest";
  const limit = typeof args.limit === "number" ? Math.min(Math.max(Math.floor(args.limit), 1), 20) : 10;

  const allowedMetrics = new Set(["runs", "fours", "sixes", "wickets", "runs_given", "balls_faced"]);
  if (!allowedMetrics.has(metric)) return { error: `Metric not allowed. Allowed: ${[...allowedMetrics].join(", ")}` };
  if (!Number.isFinite(threshold) || threshold <= 0) return { error: "threshold must be positive number" };

  // We only support score_entries table for cumulative
  const table = args.table === "score_entries" ? "score_entries" : "score_entries";
  void table; // keep signature but enforce

  const playersRes = await supabase.from("players").select("id, name");
  if (playersRes.error) return { error: playersRes.error.message, results: [] };

  const entriesRes = await supabase.from("score_entries").select("player_id, match_date, created_at, runs, fours, sixes, wickets, runs_given, balls_faced").order("match_date", { ascending: true }).order("created_at", { ascending: true });
  if (entriesRes.error) return { error: entriesRes.error.message, results: [] };

  const byPlayer = new Map<string, ScoreEntryRow[]>();
  for (const e of entriesRes.data as ScoreEntryRow[]) {
    const pid = e.player_id as string;
    if (!pid) continue;
    const arr = byPlayer.get(pid) ?? [];
    arr.push(e);
    byPlayer.set(pid, arr);
  }

  const getMetricValue = (e: ScoreEntryRow): number => {
    if (metric === "runs") return Number(e.runs) || 0;
    if (metric === "fours") return Number(e.fours) || 0;
    if (metric === "sixes") return Number(e.sixes) || 0;
    if (metric === "wickets") return Number(e.wickets) || 0;
    if (metric === "runs_given") return Number(e.runs_given) || 0;
    if (metric === "balls_faced") return Number(e.balls_faced) || 0;
    return 0;
  };

  type Result = { player_id: string; player_name: string; innings_needed: number | null; total_at_threshold: number | null; reached: boolean };
  const results: Result[] = [];

  for (const p of playersRes.data as PlayerRow[]) {
    const entries = byPlayer.get(p.id) ?? [];
    let cum = 0;
    let inningsNeeded: number | null = null;
    let totalAt: number | null = null;
    for (let i = 0; i < entries.length; i++) {
      cum += getMetricValue(entries[i]);
      if (cum >= threshold) {
        inningsNeeded = i + 1;
        totalAt = cum;
        break;
      }
    }
    results.push({ player_id: p.id, player_name: p.name, innings_needed: inningsNeeded, total_at_threshold: totalAt, reached: inningsNeeded !== null });
  }

  const reachedOnly = results.filter((r) => r.reached);
  // sort by innings_needed
  reachedOnly.sort((a, b) => (a.innings_needed ?? 0) - (b.innings_needed ?? 0));
  const sorted = order === "most" ? [...reachedOnly].reverse().slice(0, limit) : reachedOnly.slice(0, limit);
  // include never-reached if fewest? We return reached list plus note
  return {
    metric, threshold, order, limit,
    results: sorted,
    notReached: results.filter((r) => !r.reached).map((r) => ({ player_id: r.player_id, player_name: r.player_name })),
    totalPlayers: results.length,
  };
}

export interface GetInningsToNthMilestoneArgs {
  player_id: string;
  scoreThreshold: number;
  occurrenceCount: number;
  order?: "fewest" | "most";
  limit?: number;
}

export async function getInningsToNthMilestoneOccurrence(args: GetInningsToNthMilestoneArgs) {
  const playerId = typeof args.player_id === "string" ? args.player_id.trim() : "";
  if (!playerId) {
    return { error: "player_id is required — this tool answers how many of ONE named player's own innings it took to reach a threshold N times. It cannot compare across players." };
  }
  const scoreThreshold = Number(args.scoreThreshold);
  const occurrenceCount = Number(args.occurrenceCount);

  if (!Number.isFinite(scoreThreshold) || scoreThreshold <= 0) return { error: "scoreThreshold must be positive number" };
  if (!Number.isFinite(occurrenceCount) || occurrenceCount < 1) return { error: "occurrenceCount must be >=1" };

  const playerRes = await supabase.from("players").select("id, name").eq("id", playerId).single();
  if (playerRes.error) return { error: playerRes.error.message };
  if (!playerRes.data) return { error: "Player not found" };

  const entriesRes = await supabase.from("score_entries").select("player_id, match_date, created_at, runs").eq("player_id", playerId).order("match_date", { ascending: true }).order("created_at", { ascending: true });
  if (entriesRes.error) return { error: entriesRes.error.message };

  const entries = entriesRes.data as ScoreEntryRow[];
  let count = 0;
  let inningsNeeded: number | null = null;
  for (let i = 0; i < entries.length; i++) {
    const runs = Number(entries[i].runs) || 0;
    if (runs >= scoreThreshold) {
      count += 1;
      if (count === occurrenceCount) {
        inningsNeeded = i + 1;
        break;
      }
    }
  }

  return {
    player_id: playerId,
    player_name: (playerRes.data as PlayerRow).name,
    scoreThreshold,
    occurrenceCount,
    innings_needed: inningsNeeded,
    reached: inningsNeeded !== null,
    total_innings: entries.length,
    milestone: scoreThreshold,
    occurrence: occurrenceCount,
  };
}

export interface GetFirstToReachMilestoneArgs {
  metric: "runs" | "wickets";
  scoreThreshold: number;
}

export interface GetFirstToReachMilestoneResult {
  metric: "runs" | "wickets";
  scoreThreshold: number;
  matchDate: string | null;
  tied: boolean;
  player?: { id: string; name: string };
  players?: { id: string; name: string }[];
  message?: string;
  error?: string;
}

export async function getFirstToReachMilestone(args: GetFirstToReachMilestoneArgs): Promise<GetFirstToReachMilestoneResult> {
  const metric = args.metric;
  if (metric !== "runs" && metric !== "wickets") {
    return { metric: "runs", scoreThreshold: Number(args.scoreThreshold) || 0, matchDate: null, tied: false, error: "metric is required and must be 'runs' or 'wickets'" };
  }
  const scoreThreshold = Number(args.scoreThreshold);
  if (!Number.isFinite(scoreThreshold) || scoreThreshold <= 0) {
    return { metric, scoreThreshold, matchDate: null, tied: false, error: "scoreThreshold must be positive number" };
  }

  const filterColumn = metric === "runs" ? "runs" : "wickets";
  const selectColumns = metric === "runs" ? "player_id, match_date, runs" : "player_id, match_date, wickets";

  const entriesRes = await supabase
    .from("score_entries")
    .select(selectColumns)
    .gte(filterColumn, scoreThreshold)
    .order("match_date", { ascending: true });

  if (entriesRes.error) {
    return { metric, scoreThreshold, matchDate: null, tied: false, error: entriesRes.error.message };
  }

  const rows = entriesRes.data as ScoreEntryRow[];
  if (rows.length === 0) {
    const unit = metric === "runs" ? "runs" : "wickets";
    return { metric, scoreThreshold, matchDate: null, tied: false, message: `No player has reached ${scoreThreshold} ${unit} in an innings` };
  }

  const minDate = rows.reduce((min, r) => (r.match_date < min ? r.match_date : min), rows[0].match_date);

  const atMinDate = rows.filter((r) => r.match_date === minDate);

  const distinctPlayerIds = [...new Set(atMinDate.map((r) => r.player_id).filter(Boolean) as string[])];

  if (distinctPlayerIds.length === 0) {
    return { metric, scoreThreshold, matchDate: minDate, tied: false, error: "No player found at earliest date" };
  }

  const playersRes = await supabase.from("players").select("id, name").in("id", distinctPlayerIds);
  if (playersRes.error) {
    return { metric, scoreThreshold, matchDate: minDate, tied: false, error: playersRes.error.message };
  }

  const idToName = new Map<string, string>();
  for (const p of playersRes.data as PlayerRow[]) {
    idToName.set(p.id, p.name);
  }

  const playerList: { id: string; name: string }[] = distinctPlayerIds.map((id) => ({
    id,
    name: idToName.get(id) ?? "Unknown",
  }));

  if (playerList.length === 1) {
    return { metric, scoreThreshold, matchDate: minDate, tied: false, player: playerList[0] };
  }

  return { metric, scoreThreshold, matchDate: minDate, tied: true, players: playerList };
}

export interface GetPlayerFormOverLastNArgs {
  player_id: string;
  n: number;
  type: "batting" | "bowling";
}

export async function getPlayerFormOverLastN(args: GetPlayerFormOverLastNArgs) {
  const playerId = args.player_id;
  const n = Math.min(Math.max(Math.floor(Number(args.n) || 0), 1), 50);
  const type = args.type === "bowling" ? "bowling" : "batting";
  if (!playerId) return { error: "player_id is required" };
  if (!Number.isFinite(n) || n < 1) return { error: "n must be >=1" };

  const playerRes = await supabase.from("players").select("id, name").eq("id", playerId).single();
  if (playerRes.error) return { error: playerRes.error.message };

  const entriesRes = await supabase.from("score_entries").select("*").eq("player_id", playerId).order("match_date", { ascending: false }).order("created_at", { ascending: false }).limit(n);
  if (entriesRes.error) return { error: entriesRes.error.message };
  const rows = entriesRes.data as ScoreEntryRow[];
  if (rows.length === 0) return { player: playerRes.data, n, type, matches: 0, stats: null, message: "No innings found" };
  if (rows.length < n) {
    // still return partial but note fewer than N
  }

  if (type === "batting") {
    let totalRuns = 0, ballsFaced = 0, fours = 0, sixes = 0, dismissals = 0, innings = 0;
    let highestScore = 0;
    for (const e of rows) {
      const runs = Number(e.runs) || 0;
      const bf = Number(e.balls_faced) || 0;
      const hasBatted = bf > 0 || runs > 0;
      if (!hasBatted) continue;
      innings += 1;
      totalRuns += runs;
      ballsFaced += bf;
      fours += Number(e.fours) || 0;
      sixes += Number(e.sixes) || 0;
      if (!e.not_out) dismissals += 1;
      if (runs > highestScore) highestScore = runs;
    }
    const batting_avg = dismissals > 0 ? Number((totalRuns / dismissals).toFixed(2)) : null;
    const strike_rate = ballsFaced > 0 ? Number(((totalRuns / ballsFaced) * 100).toFixed(2)) : null;
    return {
      player: playerRes.data,
      n, type, matches: rows.length, innings,
      stats: { totalRuns, ballsFaced, fours, sixes, dismissals, batting_avg, strike_rate, highestScore, notOuts: innings - dismissals },
      warning: rows.length < n ? `Only ${rows.length} innings available, fewer than requested ${n}` : undefined,
    };
  } else {
    let totalWickets = 0, totalRunsGiven = 0, totalBalls = 0, innings = 0;
    let bestFigures: string | null = null;
    let bestWickets = -1, bestRuns = Infinity;
    for (const e of rows) {
      const wkts = Number(e.wickets) || 0;
      const rg = Number(e.runs_given) || 0;
      const ov = Number(e.overs_bowled) || 0;
      const hasBowled = ov > 0 || rg > 0;
      if (!hasBowled) continue;
      innings += 1;
      totalWickets += wkts;
      totalRunsGiven += rg;
      totalBalls += oversToBalls(ov);
      if (wkts > bestWickets || (wkts === bestWickets && rg < bestRuns)) {
        bestWickets = wkts;
        bestRuns = rg;
        bestFigures = `${wkts}/${rg}`;
      }
    }
    const oversBowled = totalBalls / 6;
    const economy = totalBalls > 0 ? Number((totalRunsGiven / (totalBalls / 6)).toFixed(2)) : null;
    const bowling_avg = totalWickets > 0 ? Number((totalRunsGiven / totalWickets).toFixed(2)) : null;
    return {
      player: playerRes.data,
      n, type, matches: rows.length, innings,
      stats: { totalWickets, runsGiven: totalRunsGiven, oversBowled: Number(oversBowled.toFixed(1)), economy, bowling_avg, bestFigures },
      warning: rows.length < n ? `Only ${rows.length} innings available, fewer than requested ${n}` : undefined,
    };
  }
}

// ── executor map ──

export const toolExecutors: Record<string, (args: Record<string, unknown>) => Promise<unknown>> = {
  get_player_stats: (args) => get_player_stats(args as unknown as { player_id: string }),
  get_leaderboard: (args) => get_leaderboard(args as unknown as GetLeaderboardArgs),
  compare_players: (args) => compare_players(args as unknown as { player_ids: string[] }),
  query_team_data: (args) => query_team_data(args as unknown as QueryTeamDataArgs),
  getPlayerVsOpponentStats: (args) => getPlayerVsOpponentStats(args as unknown as { player_id: string; opponent: string }),
  simulateStatChange: (args) => simulateStatChange(args as unknown as SimulateStatChangeArgs),
  getInningsToReachCumulativeThreshold: (args) => getInningsToReachCumulativeThreshold(args as unknown as GetInningsToReachCumulativeThresholdArgs),
  getInningsToNthMilestoneOccurrence: (args) => getInningsToNthMilestoneOccurrence(args as unknown as GetInningsToNthMilestoneArgs),
  getFirstToReachMilestone: (args) => getFirstToReachMilestone(args as unknown as GetFirstToReachMilestoneArgs),
  getPlayerFormOverLastN: (args) => getPlayerFormOverLastN(args as unknown as GetPlayerFormOverLastNArgs),
};

// ── FunctionDeclarations for Gemini ──

export const functionDeclarations: FunctionDeclaration[] = [
  {
    name: "get_player_stats",
    description: "Get precomputed and derived stats for a single THUNDERBOLTS player by id. Returns runs, wickets, batting/bowling average, strike rate, economy, highest score, best figures. Prefer this over query_team_data whenever a question matches computed_stats.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        player_id: { type: Type.STRING, description: "UUID of the player" },
      },
      required: ["player_id"],
    },
  },
  {
    name: "get_leaderboard",
    description: "Ranked leaderboard for THUNDERBOLTS. Sliced server-side. Use for top/bottom batting/bowling rankings. Category batting ranked by total_runs then avg then SR; bowling ranked by wickets then economy",
    parameters: {
      type: Type.OBJECT,
      properties: {
        category: { type: Type.STRING, description: "batting or bowling" },
        order: { type: Type.STRING, description: "top (default) or bottom" },
        limit: { type: Type.NUMBER, description: "number of players to return (1-50, default 10)" },
      },
      required: ["category"],
    },
  },
  {
    name: "compare_players",
    description: "Side-by-side comparison for 2-5 players. Returns each player's computed and derived stats.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        player_ids: { type: Type.ARRAY, description: "Array of player UUIDs (2-5)", items: { type: Type.STRING } },
      },
      required: ["player_ids"],
    },
  },
  {
    name: "query_team_data",
    description: "Fallback structured query for arbitrary flat filter/aggregate questions only when no narrow or computed tool covers it. Read-only, allowlisted tables/columns, hard cap 200 rows. No mutations.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        table: { type: Type.STRING, description: "Allowlisted table: players, score_entries, computed_stats" },
        select: { type: Type.STRING, description: "Comma-separated column list or * . Columns must be allowlisted for the table." },
        filters: {
          type: Type.ARRAY,
          description: "Optional filters",
          items: {
            type: Type.OBJECT,
            properties: {
              column: { type: Type.STRING },
              op: { type: Type.STRING },
              value: { type: Type.STRING, description: "Filter value" },
            },
            required: ["column", "op", "value"],
          },
        },
        orderBy: {
          type: Type.OBJECT,
          description: "Optional ordering",
          properties: {
            column: { type: Type.STRING },
            ascending: { type: Type.BOOLEAN },
          },
          required: ["column"],
        },
        limit: { type: Type.NUMBER, description: "Row limit 1-200, default 50" },
      },
      required: ["table", "select"],
    },
  },
  {
    name: "getPlayerVsOpponentStats",
    description: "Aggregated stats for a player filtered to matches where match_label contains the opponent string. Correctly handles not-out and undefined averages. Do not use until match_label audit confirms naming — if no matches, report that plainly.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        player_id: { type: Type.STRING },
        opponent: { type: Type.STRING, description: "Opponent substring to match inside match_label" },
      },
      required: ["player_id", "opponent"],
    },
  },
  {
    name: "simulateStatChange",
    description: "Project stats given a hypothetical next-match outcome. Encodes not-out != dismissal and maiden = 0 runs conceded. Returns current vs projected batting_avg, economy, bowling_avg etc.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        player_id: { type: Type.STRING },
        hypothetical: {
          type: Type.OBJECT,
          description: "Hypothetical next innings outcome",
          properties: {
            runs: { type: Type.NUMBER },
            is_out: { type: Type.BOOLEAN, description: "true if dismissed, false if not out" },
            overs: { type: Type.NUMBER, description: "Overs bowled as numeric e.g. 4.2 for 4 overs 2 balls" },
            runs_given: { type: Type.NUMBER },
            wickets: { type: Type.NUMBER },
          },
        },
      },
      required: ["player_id", "hypothetical"],
    },
  },
  {
    name: "getInningsToReachCumulativeThreshold",
    description: "Fewest/most innings for a running total (runs, fours, sixes, wickets etc) to cross a cumulative threshold. Deterministic ordered by match_date ascending.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        table: { type: Type.STRING, description: "Table, currently only score_entries" },
        metric: { type: Type.STRING },
        threshold: { type: Type.NUMBER },
        order: { type: Type.STRING },
        limit: { type: Type.NUMBER },
      },
      required: ["table", "metric", "threshold", "order"],
    },
  },
  {
    name: "getInningsToNthMilestoneOccurrence",
    description:
      "Answers how many of ONE named player's own innings it took to reach a score threshold N times (e.g. how many innings for Rahul to score three fifties). Requires player_id. It answers questions about ONE named player's own innings count to a threshold. It CANNOT compare across multiple players. It must NOT be used for \"who was first/who reached it first among all players\" style questions — use getFirstToReachMilestone for that. Deterministic ordered by match_date ascending.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        player_id: { type: Type.STRING, description: "UUID of the player — REQUIRED. This tool only handles ONE named player." },
        scoreThreshold: { type: Type.NUMBER, description: "Runs threshold per innings e.g. 100, 50" },
        occurrenceCount: { type: Type.NUMBER, description: "Nth occurrence, 1 = first" },
        order: { type: Type.STRING, description: "Deprecated, ignored for single player; kept for compatibility" },
        limit: { type: Type.NUMBER, description: "Deprecated, ignored for single player; kept for compatibility" },
      },
      required: ["player_id", "scoreThreshold", "occurrenceCount"],
    },
  },
  {
    name: "getFirstToReachMilestone",
    description:
      "Determines which player was FIRST to reach a given threshold — for BATTING milestones (e.g. first half-century: metric='runs', scoreThreshold=50) or BOWLING milestones (e.g. first 3-wicket haul: metric='wickets', scoreThreshold=3). You MUST specify metric — do not call this tool without it. If tied: true, multiple players reached it in the same match and you don't have data on who did so first within that match — report it as a tie.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        metric: { type: Type.STRING, description: "Metric to check: 'runs' for batting milestones, 'wickets' for bowling milestones", enum: ["runs", "wickets"] },
        scoreThreshold: { type: Type.NUMBER, description: "Threshold value e.g. 50 for half-century (runs) or 3 for 3-wicket haul (wickets)" },
      },
      required: ["metric", "scoreThreshold"],
    },
  },
  {
    name: "getPlayerFormOverLastN",
    description: "Windowed aggregate over a player's last N innings. Type batting returns last N batting innings; bowling returns last N bowling innings.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        player_id: { type: Type.STRING },
        n: { type: Type.NUMBER, description: "Window size 1-50" },
        type: { type: Type.STRING },
      },
      required: ["player_id", "n", "type"],
    },
  },
];
