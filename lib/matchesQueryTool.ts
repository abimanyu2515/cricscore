import { supabase } from "@/lib/supabase";

// ── matches table row (subset relevant to assistant tools) ──
interface MatchesRow {
  id: string;
  match_date: string;
  match_type: string;
  location: string;
  team_1: string;
  team_2: string;
  score_1: number | null;
  overs_played_1: number | null;
  score_2: number | null;
  overs_played_2: number | null;
  match_result_desc: string;
  match_result: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// ─────────────────────────────────────────────────────────────
// Tool 1: get_team_record
// ─────────────────────────────────────────────────────────────

export interface GetTeamRecordArgs {
  match_type?: string;
}

export interface GetTeamRecordResult {
  total: number;
  won: number;
  lost: number;
  tied: number;
  match_type: string | null;
  breakdown: { won: number; lost: number; tied: number; total: number };
  message?: string;
  error?: string;
}

/**
 * Single grouped aggregate: count(*) from matches group by match_result.
 * Optional match_type filter (exact match). No other filters — use query_matches instead.
 */
export async function get_team_record(args: GetTeamRecordArgs = {}): Promise<GetTeamRecordResult> {
  const rawType = typeof args.match_type === "string" ? args.match_type.trim() : "";
  const matchType = rawType.length > 0 ? rawType : null;

  let query = supabase.from("matches").select("match_result, match_type");

  if (matchType) {
    query = query.eq("match_type", matchType);
  }

  const res = await query;

  if (res.error) {
    return {
      total: 0,
      won: 0,
      lost: 0,
      tied: 0,
      match_type: matchType,
      breakdown: { won: 0, lost: 0, tied: 0, total: 0 },
      error: res.error.message,
    };
  }

  const rows = res.data as Pick<MatchesRow, "match_result" | "match_type">[];

  let won = 0;
  let lost = 0;
  let tied = 0;

  for (const r of rows) {
    if (r.match_result === true) won += 1;
    else if (r.match_result === false) lost += 1;
    else tied += 1;
  }

  const total = rows.length;

  if (total === 0 && matchType) {
    return {
      total: 0,
      won: 0,
      lost: 0,
      tied: 0,
      match_type: matchType,
      breakdown: { won: 0, lost: 0, tied: 0, total: 0 },
      message: `No matches found${matchType ? ` for match_type '${matchType}'` : ""}`,
    };
  }

  return {
    total,
    won,
    lost,
    tied,
    match_type: matchType,
    breakdown: { won, lost, tied, total },
  };
}

// ─────────────────────────────────────────────────────────────
// Tool 2: query_matches
// ─────────────────────────────────────────────────────────────

const ALLOWED_MATCHES_COLUMNS = new Set([
  "match_date",
  "team_2",
  "match_type",
  "location",
  "match_result",
]);

const ALLOWED_MATCHES_OPERATORS = new Set([
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "like",
  "ilike",
  "in",
]);

interface QueryMatchesFilter {
  column: string;
  op: string;
  value: string | number | boolean | Array<string | number | boolean>;
}

export interface QueryMatchesArgs {
  select?: string;
  filters?: QueryMatchesFilter[];
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}

export interface QueryMatchesResult {
  rows: MatchesRow[];
  rowCount: number;
  limit: number;
  select: string;
  error?: string;
}

/**
 * Allowlisted, parameterized query builder scoped ONLY to the `matches` table.
 * Filterable columns: match_date (range), team_2, match_type, location, match_result.
 * No raw SQL — all filters via Supabase parameterized builder. Hard cap 200 rows.
 */
export async function query_matches(args: QueryMatchesArgs): Promise<QueryMatchesResult> {
  const rawSelect = typeof args.select === "string" && args.select.trim().length > 0 ? args.select.trim() : "*";

  const requestedCols = rawSelect === "*" ? ["*"] : rawSelect.split(",").map((c) => c.trim()).filter(Boolean);

  if (requestedCols[0] !== "*") {
    for (const col of requestedCols) {
      const bare = col.split("(")[0].trim();
      if (!ALLOWED_MATCHES_COLUMNS.has(bare)) {
        return {
          rows: [],
          rowCount: 0,
          limit: 0,
          select: rawSelect,
          error: `Column '${bare}' not allowlisted for matches. Allowed: ${[...ALLOWED_MATCHES_COLUMNS].join(", ")}`,
        };
      }
    }
  }

  // Normalize "*" to explicit allowlisted columns to avoid leaking non-allowlisted fields
  const selectStr = requestedCols[0] === "*" ? [...ALLOWED_MATCHES_COLUMNS].join(", ") : requestedCols.join(", ");

  const rowCap = 200;
  const limit = typeof args.limit === "number" ? Math.min(Math.max(Math.floor(args.limit), 1), rowCap) : 50;

  let query = supabase.from("matches").select(selectStr);

  if (Array.isArray(args.filters)) {
    for (const f of args.filters) {
      if (!f || typeof f.column !== "string" || typeof f.op !== "string") {
        return { rows: [], rowCount: 0, limit, select: selectStr, error: "Each filter must have column, op, value" };
      }
      if (!ALLOWED_MATCHES_COLUMNS.has(f.column)) {
        return { rows: [], rowCount: 0, limit, select: selectStr, error: `Filter column '${f.column}' not allowlisted for matches. Allowed: ${[...ALLOWED_MATCHES_COLUMNS].join(", ")}` };
      }
      if (!ALLOWED_MATCHES_OPERATORS.has(f.op)) {
        return { rows: [], rowCount: 0, limit, select: selectStr, error: `Operator '${f.op}' not allowlisted. Allowed: ${[...ALLOWED_MATCHES_OPERATORS].join(", ")}` };
      }
      const op = f.op;
      const col = f.column;
      const val = f.value;

      if (op === "eq") query = query.eq(col, val as string);
      else if (op === "neq") query = query.neq(col, val as string);
      else if (op === "gt") query = query.gt(col, val as string);
      else if (op === "gte") query = query.gte(col, val as string);
      else if (op === "lt") query = query.lt(col, val as string);
      else if (op === "lte") query = query.lte(col, val as string);
      else if (op === "ilike") query = query.ilike(col, String(val));
      else if (op === "like") query = query.like(col, String(val));
      else if (op === "in") {
        if (!Array.isArray(val)) return { rows: [], rowCount: 0, limit, select: selectStr, error: "'in' operator requires array value" };
        query = query.in(col, val as string[]);
      }
    }
  }

  if (args.orderBy && typeof args.orderBy.column === "string") {
    if (!ALLOWED_MATCHES_COLUMNS.has(args.orderBy.column)) {
      return { rows: [], rowCount: 0, limit, select: selectStr, error: `orderBy column '${args.orderBy.column}' not allowlisted for matches` };
    }
    query = query.order(args.orderBy.column, { ascending: args.orderBy.ascending ?? true });
  }

  query = query.limit(limit);

  const res = await query;
  if (res.error) return { rows: [], rowCount: 0, limit, select: selectStr, error: res.error.message };
  const rows = (res.data as unknown as MatchesRow[]) ?? [];
  return { rows, rowCount: rows.length, limit, select: selectStr };
}
