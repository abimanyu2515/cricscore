import { Type } from "@google/genai";
import type { FunctionDeclaration } from "@google/genai";
import {
  get_player_stats,
  get_leaderboard,
  compare_players,
  query_team_data,
  getPlayerVsOpponentStats,
  simulateStatChange,
  getInningsToReachCumulativeThreshold,
  getInningsToNthMilestoneOccurrence,
  getFirstToReachMilestone,
  getPlayerFormOverLastN,
} from "@/lib/assistant/tools";
import type {
  GetLeaderboardArgs,
  QueryTeamDataArgs,
  SimulateStatChangeArgs,
  GetInningsToReachCumulativeThresholdArgs,
  GetInningsToNthMilestoneArgs,
  GetFirstToReachMilestoneArgs,
  GetPlayerFormOverLastNArgs,
} from "@/lib/assistant/tools";

// ── dispatcher ──

export async function executeToolCall(name: string, args: unknown): Promise<unknown> {
  const record = args as Record<string, unknown>;
  switch (name) {
    case "get_player_stats":
      return get_player_stats(record as unknown as { player_id: string });
    case "get_leaderboard":
      return get_leaderboard(record as unknown as GetLeaderboardArgs);
    case "compare_players":
      return compare_players(record as unknown as { player_ids: string[] });
    case "query_team_data":
      return query_team_data(record as unknown as QueryTeamDataArgs);
    case "getPlayerVsOpponentStats":
      return getPlayerVsOpponentStats(record as unknown as { player_id: string; opponent: string });
    case "simulateStatChange":
      return simulateStatChange(record as unknown as SimulateStatChangeArgs);
    case "getInningsToReachCumulativeThreshold":
      return getInningsToReachCumulativeThreshold(record as unknown as GetInningsToReachCumulativeThresholdArgs);
    case "getInningsToNthMilestoneOccurrence":
      return getInningsToNthMilestoneOccurrence(record as unknown as GetInningsToNthMilestoneArgs);
    case "getFirstToReachMilestone":
      return getFirstToReachMilestone(record as unknown as GetFirstToReachMilestoneArgs);
    case "getPlayerFormOverLastN":
      return getPlayerFormOverLastN(record as unknown as GetPlayerFormOverLastNArgs);
    default:
      console.error(
        "Temporary system error retrieving data — this is not a problem with your query. Do not retry with different arguments; instead inform the user the data is temporarily unavailable."
      )
      return { error: `Unknown tool ${name}` };
  }
}

// ── FunctionDeclarations for Gemini (OpenAPI-subset JSON Schema) ──
// Keep in sync with the actual lib/ function signatures above.

export const functionDeclarations: FunctionDeclaration[] = [
  {
    name: "get_player_stats",
    description:
      "Get precomputed and derived stats for a single THUNDERBOLTS player by id. Returns runs, wickets, batting/bowling average, strike rate, economy, highest score, best figures. Prefer this over query_team_data whenever a question matches computed_stats.",
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
    description:
      "Ranked leaderboard for THUNDERBOLTS. Sliced server-side. Use for top/bottom batting/bowling rankings. Category batting ranked by total_runs then avg then SR; bowling ranked by wickets then economy then bowling avg.",
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
        player_ids: {
          type: Type.ARRAY,
          description: "Array of player UUIDs (2-5)",
          items: { type: Type.STRING },
        },
      },
      required: ["player_ids"],
    },
  },
  {
    name: "query_team_data",
    description:
      "Fallback structured query for arbitrary flat filter/aggregate questions only when no narrow or computed tool covers it. Read-only, allowlisted tables/columns, hard cap 200 rows. No mutations.",
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
    description:
      "Aggregated stats for a player filtered to matches where match_label contains the opponent string. Correctly handles not-out and undefined averages. Do not use until match_label audit confirms naming — if no matches, report that plainly.",
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
    description:
      "Project stats given a hypothetical next-match outcome. Encodes not-out != dismissal and maiden = 0 runs conceded. Returns current vs projected batting_avg, economy, bowling_avg etc.",
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
    description:
      "Fewest/most innings for a running total (runs, fours, sixes, wickets etc) to cross a cumulative threshold. Deterministic ordered by match_date ascending.",
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
    description:
      "Windowed aggregate over a player's last N innings. Type batting returns last N batting innings; bowling returns last N bowling innings.",
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
