A chat-based assistant named "LYST" that answers natural-language questions about THUNDERBOLTS player and match data. The assistant uses a hybrid tool-use pattern: narrow tools for precomputed stats, one structured query tool for arbitrary filters, and computed tools for logic that requires deterministic multi-step reasoning (projections, sequential/cumulative milestones, windowed form). The model never computes cricket-specific arithmetic itself when a tool exists to do it correctly.

## Implementation

### AI Assistant UI

- The AI Assistant should be displayed as a floating interface in the home page not in a separate route.
- In the home page the TopNav (Not inside sidebar, explicitly between AppName and Sidebar Icon) include "ASK LYST" rounded button, when clicked a floating interface should appear with a greeting related to team and cricket.
- The floating AI interface should contain, an text-only input and a send button.

### Request flow

1. Client sends the user's message from `components/assistant/AssistantChat.tsx` (`"use client"` — needs streaming/interactivity) to `app/api/assistant/route.ts`.
2. Route handler sits behind the existing `cricscore_access` cookie gate in `proxy.ts` — no separate auth layer needed.
3. Route calls `models.generateContent` on the Gemini API (`lib/gemini.ts`) with `tools: [{ functionDeclarations: [...] }]` built from the tool list below, plus `systemInstruction` (see System Prompt Rules).
4. If the model responds with a `functionCall` part, the route executes the corresponding `lib/` function using `functionCall.args` directly (Gemini returns args as a structured object, not a JSON string — no `JSON.parse` needed) and appends a `functionResponse` part to `contents` for a second `generateContent` call. The raw tool result is never returned to the user directly.
5. Final natural-language answer (from `response.text`) streams back to the client.

### Gemini API specifics

- **Client setup:** `lib/gemini.ts` wraps `@google/genai`, mirroring the `lib/supabase.ts` pattern — one shared client, API key read from `GEMINI_API_KEY` in `.env.local`, never exposed client-side.
- **Tool declarations:** each `lib/` tool function gets a matching `FunctionDeclaration` with `name`, `description`, and `parameters` in OpenAPI-subset JSON Schema (`type`, `properties`, `required`) — this schema is the contract the model fills in, so keep it in sync with the actual `lib/` function signature.
- **Call strategy:** set `toolConfig.functionCallingConfig.mode` to `AUTO` (model decides per-turn whether to call a tool) rather than `ANY`/`NONE` — `AUTO` is what makes "answer whatever isn't a tool match" from earlier in this spec actually work.
- **Multi-turn loop:** the route manually appends the model's `functionCall` turn and the tool's `functionResponse` turn to `contents` before the follow-up call — Gemini does not auto-loop server-side the way some SDKs do server-managed tool loops; only the Python SDK's automatic-function-calling mode does that, and this project is on the JS/TS SDK.
- **Cost/rate-limit awareness:** `gemini-3.1-flash-lite` free tier is request-per-day and request-per-minute limited, not context-limited — log/monitor call volume in dev so the assistant doesn't silently start failing under the daily cap during testing.

### Tool tiers

**Tier 1 — Narrow tools** (precomputed, from `computed_stats`, no model math, preferred whenever applicable)

| Tool               | Signature                                                                   | Purpose                                                                                   |
| ------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `get_player_stats` | `(player_id)`                                                               | Runs, wickets, batting/bowling average, strike rate, economy, highest score, best figures |
| `get_leaderboard`  | `({ category: 'batting' \| 'bowling', order?: 'top' \| 'bottom', limit? })` | Ranked list, sliced server-side — never let the model truncate a list itself              |
| `compare_players`  | `(player_ids[])`                                                            | Side-by-side stats for multiple players                                                   |

**Tier 2 — Query tool** (arbitrary filter/aggregate, no sequencing, fallback only)

| Tool              | Signature                                        | Purpose                                                                                                                                                 |
| ----------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query_team_data` | `({ table, select, filters, orderBy?, limit? })` | Structured spec translated through an allowlisted, parameterized Supabase query builder. Used only when no narrow or computed tool covers the question. |

**Tier 3 — Computed tools** (deterministic, sequential, or windowed logic — never left to the model to reconstruct)

| Tool                                   | Signature                                                                          | Purpose                                                                                                                    |
| -------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `getPlayerVsOpponentStats`             | `(player_id, opponent)`                                                            | Aggregated stats filtered to matches against one opponent (`match_label`), with correct not-out/undefined-average handling |
| `simulateStatChange`                   | `({ player_id, hypothetical: { runs?, is_out?, overs?, runs_given?, wickets? } })` | Projects a stat given a hypothetical next-match outcome; encodes not-out ≠ dismissal and maiden = 0 runs conceded          |
| `getInningsToReachCumulativeThreshold` | `({ table, metric, threshold, order, limit? })`                                    | Fewest/most innings for a running total (runs, fours, sixes, wickets) to cross a threshold                                 |
| `getInningsToNthMilestoneOccurrence`   | `({ scoreThreshold, occurrenceCount, order, limit? })`                             | Fewest/most innings until the Nth single-innings milestone occurrence (`occurrenceCount: 1` = first century/fifty)         |
| `getPlayerFormOverLastN`               | `({ player_id, n, type: 'batting' \| 'bowling' })`                                 | Deterministic windowed aggregate over a player's last N innings                                                            |

### Which tier a new question belongs to

1. Does a `computed_stats` field already answer it exactly? → Tier 1.
2. Is it a flat filter/aggregate with no ordering-dependence? → Tier 2.
3. Does it require a running total, first/Nth occurrence, a hypothetical, or a time-window aggregate? → Tier 3 — check if an existing computed tool's shape covers it (parameterize) before writing a new one.

### System prompt rules

- Prefer Tier 1 tools whenever a question matches what they return; never recompute a Tier 1 stat from raw data.
- Only call `query_team_data` when no other tool covers the question.
- Answer only what the user asked — do not volunteer unrelated stats present in a tool's result.
- If `batting_avg`, `bowling_avg`, or `economy` is null (undefined due to zero dismissals/overs), state that plainly rather than reporting 0.
- If a question implies data the schema doesn't capture (e.g., a structured opponent field), say so rather than guessing from `match_label`.

### Query tool guardrails (non-negotiable)

- Read-only anon Supabase client only — never `supabaseAdmin`.
- Structured JSON spec translated to a parameterized query builder call — no raw SQL string ever constructed from model output.
- Allowlisted tables/columns/operators only, matching `types/` definitions.
- Hard row cap (e.g. 200).
- No `INSERT`/`UPDATE`/`DELETE` code path exists in the translation layer — not just prompt-instructed against.

## Scope Limits

- **No mutations.** The assistant never creates, edits, or deletes players or score entries. Natural-language score parsing (if built later) only produces a structured draft that still passes through the existing validated `POST /api/players/[id]/scores` endpoint — it is a separate feature unit, not part of this spec.
- **No opponent-team queries until `match_label` data is verified.** `getPlayerVsOpponentStats` assumes `match_label` reliably stores opponent names. Do not ship this tool until a `SELECT DISTINCT match_label` audit confirms consistent naming (or a normalization/matching strategy is added).
- **No admin actions.** The assistant cannot bypass admin PIN requirements; anything currently gated to admins in `architecture-context.md` stays gated.
- **No cross-team data.** This is a single-team app; the assistant only ever reasons over THUNDERBOLTS data.
- **No new database writes for assistant state.** Conversation history is not persisted server-side beyond what's needed for the current session's completion loop.
- **General cricket knowledge questions unrelated to team data** are answered from the model's own knowledge, without tool calls — this is in scope but should be clearly distinguishable in the system prompt from team-data answers.

## Check When Done

1. All 9 tools are implemented in `lib/` with the signatures above, and route handlers in `app/api/assistant/route.ts` stay thin — no business logic in the route itself.
2. Every Tier 1 tool call returns identical numbers to what's already displayed on the leaderboard/profile pages for the same player — no drift between assistant answers and the rest of the app.
3. `query_team_data` cannot be coaxed (via adversarial prompts) into touching a non-allowlisted table/column, exceeding the row cap, or performing a write.
4. Computed tools correctly handle: zero-dismissal averages, zero-over economies, players who never reach a given threshold, and players with fewer than N innings for windowed queries.
5. The model prefers Tier 1 over Tier 2/3 tools in a side-by-side test of overlapping questions (e.g., "wickets taken" should never trigger `query_team_data`).
6. Scope-limit violations are manually tested and confirmed refused: a mutation request, an admin-gated action, and a cross-team question.
7. `progress-tracker.md` is updated to reflect completed vs. in-progress tools, and any open questions (e.g., `match_label` audit result) are logged there, not left implicit.
8. `npm run build` and `npx tsc --noEmit` pass with no `any` usage introduced in the new `lib/` modules or route handler.
