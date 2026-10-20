# Library (Shared Infrastructure)

## Overview

Shared utilities, database clients, and the AI assistant orchestration system. This is the only place business logic lives outside of API routes. All modules are server-safe (no `"use client"`) unless explicitly noted.

## Key files

| File | Owns |
|---|---|
| `supabase.ts` | Anon (`supabase`) and service-role (`supabaseAdmin`) clients; single-instance pattern |
| `constants.ts` | App-wide constants: `TEAM_NAME`, `ACCESS_PIN`/`ADMIN_PIN` references, stat categories |
| `utils.ts` | `cn` (clsx + tailwind-merge), `formatDate`, `calculateStrikeRate`, `calculateEconomy` |
| `playerStyles.ts` | Batting/bowling style labels and badge color mappings (cyan/purple) |
| `playerRoster.ts` | In-memory player roster cache (5 min TTL) for assistant tools |
| `duplicateCallDetect.ts` | Assistant duplicate tool-call detection (per conversation) |
| `matchesQueryTool.ts` | Isolated `matches` table tools for assistant (no join to player stats) |
| `assistant/gemini.ts` | Gemini client wrapper (`@google/genai`), mirrors `supabase.ts` pattern |
| `assistant/modelQueue.ts` | Dual-model routing (`gemini-3.1-flash-lite` + `gemini-3.5-flash-lite`), least-loaded pick, 4200ms min gap, exponential backoff |
| `assistant/assistantSystemPrompt.ts` | `ASSISTANT_SYSTEM_INSTRUCTION` (10 tools, tier descriptions, no-join rule for matches) |
| `assistant/assistantTools.ts` | `executeToolCall` dispatcher + 12 `FunctionDeclaration` schemas (OpenAPI subset) |
| `assistant/assistantOrchestrator.ts` | `runAssistantTurn` loop (max 4 rounds, temperature 0, parallel tool execution, thoughtSignature preservation) |
| `assistant/tools.ts` | 12 tool implementations (Tier 1: player stats, leaderboard, compare; Tier 2: query_team_data; Tier 3: vs opponent, simulate, cumulative threshold, nth milestone, first-to-reach, form) |

## Commands

Same as root. Additionally:
- `npx tsc --noEmit` — type-check only (used in CI)
- Load test assistant: `node scripts/load-test-assistant.mjs`

## Conventions

- **Single-instance clients**: `supabase.ts` and `gemini.ts` export singletons — import them, never create new instances
- **Anon vs admin client**: `supabase` (anon key) for reads respecting RLS; `supabaseAdmin` (service role) for writes bypassing RLS (admin routes only)
- **Assistant temperature 0**: Tool selection is deterministic classification — `temperature: 0` in `assistantOrchestrator.ts:77`
- **ThoughtSignature preservation**: `runAssistantTurn` pushes `candidate.content` as-is (including `thoughtSignature` parts) to satisfy Gemini 3 function calling
- **Tool schema discipline**: All `FunctionDeclaration` schemas use OpenAPI subset (type, properties, required, enum); no `any`, no optional without default
- **Parameterized Supabase queries**: Never string-interpolate — use `.eq()`, `.gte()`, `.ilike()` builders; hard cap 200 rows
- **Cache invalidation**: `invalidatePlayerRosterCache()` called after player create/update/delete
- **Error mapping**: Assistant route maps Gemini errors → 429 (quota) / 503 (high demand) with friendly messages
- **Strict TypeScript**: No `any` in `lib/assistant/*` or `app/api/assistant/route.ts`; explicit interfaces for all tool args/returns

## Gotchas

- **Dual model rate limits**: Free tier ~15 RPM each; `MIN_GAP_MS=4200` enforces spacing; `modelQueue.ts` retries 503 with backoff
- **Max tool rounds = 4**: Orchestrator throws `MAX_TOOL_ROUNDS exceeded` on round 5 — do not increase without reason (temperature 0 fixed the convergence issues)
- **Tier 2 allowlist only**: `query_team_data` allowlisted to `players`/`score_entries`/`computed_stats` columns only; `matches` has separate `matchesQueryTool.ts`
- **No cross-boundary joins**: Assistant system prompt (rule 7) forbids correlating `matches` rows with `score_entries` — loose `match_date` correlation is unreliable by design
- **Player roster cache**: 5 min TTL means new players won't appear in assistant until cache refresh or `invalidatePlayerRosterCache()`
- **Duplicate call detection**: Tracks `(toolName, argsHash)` per conversation; forces final round to text-only if duplicate detected
- **Bowling milestone metric**: `getFirstToReachMilestone` requires `metric: "runs" | "wickets"` — no default, model must specify

## Agent skills

None specific to this area.

## Related specs

- `context/feature-specs/ai-assistant.md`
- `context/feature-specs/add-matches-section.md`

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._