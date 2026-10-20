# API Routes

## Overview

Authenticated request handlers for the CricScore app. Handles pin-based user authentication, admin verification, player CRUD, score entry with validation, match fixtures, and the AI assistant endpoint. All routes enforce the `cricscore_access` cookie gate via `proxy.ts` middleware.

## Key files

| File | Owns |
|---|---|
| `auth/verify-access/route.ts` | 5-digit pin verification, sets 30-day `cricscore_access` cookie |
| `auth/verify-admin/route.ts` | 4-digit admin pin verification, no cookie (per-request only) |
| `players/route.ts` | GET all players with computed stats, POST new player |
| `players/[id]/route.ts` | GET single player, PATCH name/role (admin), DELETE player (admin) |
| `players/[id]/scores/route.ts` | POST new score entry with run-division validation |
| `players/[id]/scores/[entryId]/route.ts` | PATCH score (admin), DELETE score (admin) |
| `matches/route.ts` | GET all matches, POST new match (admin) |
| `assistant/route.ts` | AI assistant endpoint (Tier 1/2/3 tools, dual Gemini models) |

## Commands

Same as root: `npm run dev`, `npm run build`, `npm run lint -- --fix`, `npm run format`

## Conventions

- All routes are protected by `proxy.ts` middleware checking `cricscore_access` cookie (except `verify-access` and `verify-admin` which establish it)
- Admin routes (`verify-admin`, player PATCH/DELETE, score PATCH/DELETE, matches POST) require additional `admin_pin` header validated against `ADMIN_PIN` env var
- Request validation happens before any logic: parse JSON, check required fields, return 400 for invalid input
- Supabase access: use `supabase` (anon client) for reads, `supabaseAdmin` (service role) for writes that bypass RLS
- Response shape: `{ data: ... }` on success, `{ error: string }` on failure with appropriate HTTP status
- Route handlers stay thin — push complex logic to `lib/` (e.g., `lib/assistant/orchestrator.ts`, `lib/playerRoster.ts`)
- No `any` types — explicit interfaces in `types/` for request/response payloads
- Date handling: `match_date` stored as `date` (no timezone), parsed with `new Date()` in server context

## Gotchas

- **Cookie vs header auth**: User auth = cookie (30 days). Admin auth = `admin_pin` header every request (no cookie stored). Do not conflate.
- **Run division validation**: `players/[id]/scores/route.ts` enforces `singles + doubles*2 + triples*3 + fours*4 + sixes*6 === runs` before insert
- **Bowling validation**: If `overs_bowled > 0` then `runs_given` and `wickets` must be present; if `wickets > 0` then `overs_bowled` must be > 0
- **Computed stats trigger**: `score_entries` insert/update/delete fires `trigger_recalculate()` which updates `computed_stats` — do not manually compute in routes
- **Match-label uniqueness**: `score_entries` has unique constraint on `(player_id, match_date, match_label)` — duplicate entries for same player/date/label will 409
- **AI assistant tool loop**: `assistant/route.ts` calls `runAssistantTurn` (max 4 rounds, temperature 0). Tool declarations in `lib/assistant/tools.ts` (12 tools across 3 tiers)
- **No match_id FK**: `score_entries` uses free-text `match_label` + `match_date`; `matches` table is standalone. Do not attempt to join them.

## Agent skills

None specific to this area.

## Related specs

- `context/feature-specs/player-role-expansion.md`
- `context/feature-specs/match-history-filter.md`
- `context/feature-specs/ai-assistant.md`
- `context/feature-specs/add-matches-section.md`

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._