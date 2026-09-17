# CricScore

CricScore is a mobile-first Next.js cricket score tracker for managing players, recording per-match batting/bowling entries, and viewing live leaderboard rankings. Built for the **THUNDERBOLTS** team.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript (strict)
- **Database:** Supabase + PostgreSQL (`players`, `score_entries`, `computed_stats` via triggers)
- **Styling:** Tailwind CSS 4, `font-sans` for player names, `font-mono` elsewhere; zinc (general), cyan (batting), purple (bowling)
- **Icons:** `lucide-react`
- **Animations:** `motion`
- **Notifications:** `sonner` (Toaster)
- **Analytics:** `@vercel/analytics`
- **PWA:** `public/manifest.json` + `public/sw.js` registered in `app/layout.tsx`

## Core Features

- Site-wide access gate with a 5-digit PIN (`/access`), enforced by `proxy.ts` (30-day `httpOnly` cookie)
- Admin gate (`/admin-access` + `AdminPinDialog`) for `/admin` and score-entry edits — stateless, re-prompted every visit
- Player listing with role filters (Batsman, Bowler, All-rounder) via `FilterRow`
- Add players (any authenticated user) with expanded style selects; edit/delete players (admin only)
- Per-player profile (`/player/[id]/profile`) with `ProfileHeader`, `StatsGrid`, and filtered `MatchHistory`
- Add score (`/player/[id]/add-score`) and edit score (`/player/[id]/add-score/[entryId]/edit`) with server-side run-breakdown validation
- Leaderboard (`/leaderboard`) with `LeaderBoardTable` — sticky name column, horizontally scrollable stats, rank-1 highlighted
- Match History filter by month + year (`ListFilter` button + dialog)
- Player batting/bowling style display (`Right/Left-hand bat • Right/Left-arm {Fast,Medium,Off spin,…}`)
- Single-tap to add score / long-press to view profile (`app/hooks/useLongPress.ts` with scroll/move guards)
- Overlay Sidebar (`components/ui/Sidebar.tsx`) triggered from `TopNav` — menus: Overall Stats (`/leaderboard`), Manage Players (`/admin`)

## AI Assistant

LYST — natural-language cricket stats assistant on `/` (floating `ASK LYST` button in `components/ui/TopNav.tsx:5` → `components/assistant/AssistantChat.tsx:1`) powered by Gemini function calling. Answers questions about player performance, comparisons, and statistics conversationally without exposing tool internals.

- **Route:** `POST /api/assistant` (`app/api/assistant/route.ts:15`) — accepts `{message, history}` (history capped to last 10, message max 2000 chars), builds `Content[]` stateless and delegates to `runAssistantTurn` (`lib/assistant/assistantOrchestrator.ts:45`). Gated behind `cricscore_access` cookie in `proxy.ts`.
- **Orchestrator:** `runAssistantTurn` loops `generateContent` until no `functionCall` parts remain, handling parallel calls in one turn and pushing `candidate.content` as-is to preserve `thoughtSignature` (`lib/assistant/assistantOrchestrator.ts:104`).

### Tool tiers

All declarations in `lib/assistant/assistantTools.ts:61` (dispatcher `executeToolCall` at `lib/assistant/assistantTools.ts:27` delegates to `lib/assistant/tools.ts`); system prompt routing rules in `lib/assistant/assistantSystemPrompt.ts:10`.

- **Tier 1 — fixed, fast lookups (precomputed data):**
  - `get_player_stats` — single player `computed_stats` + derived aggregates
  - `get_leaderboard` — ranked batting/bowling slice (batting `total_runs → batting_avg → strike_rate → batInnings ASC`; bowling `total_wickets → economy ASC → bowling_avg ASC → best_figures`)
  - `compare_players` — side-by-side 2-5 players
- **Tier 2 — flexible filtered queries (when Tier 1 shape doesn't fit):**
  - `query_team_data` — allowlisted tables `players/score_entries/computed_stats`, allowlisted columns/operators (`eq/neq/gt/gte/lt/lte/like/ilike/in`), parameterized Supabase builder, hard cap 200 rows (`lib/assistant/tools.ts:266`)
- **Tier 3 — derived/computed (deterministic in `lib/`, never by the model):**
  - `getPlayerVsOpponentStats` — `match_label ilike opponent` aggregates
  - `simulateStatChange` — hypothetical next-innings projection (not-out ≠ dismissal, maiden = 0 runs, `oversToBalls` conversion)
  - `getInningsToReachCumulativeThreshold` — sequential scan by `match_date ASC` to cumulative threshold
  - `getInningsToNthMilestoneOccurrence` — innings for one player's Nth occurrence of `runs >= threshold` (requires `player_id`, single-player only)
  - `getFirstToReachMilestone` — earliest `match_date` where `runs|wickets >= threshold` across all players, with tie detection
  - `getPlayerFormOverLastN` — windowed last N innings (`type: batting|bowling`), warns if fewer than N available

### Model configuration

- **Models:** dual-model routing via `lib/assistant/modelQueue.ts:10` — `gemini-3.1-flash-lite` and `gemini-3.5-flash-lite` (two independent per-model queues). `pickLeastLoadedModel()` (`lib/assistant/modelQueue.ts:65`) picks the least-loaded model once per conversation; `enqueueModelCall` (`lib/assistant/modelQueue.ts:77`) enqueues on that model's queue. Roughly doubles effective throughput within free-tier limits.
- **Temperature:** `0` (`lib/assistant/assistantOrchestrator.ts:77`) for deterministic tool-selection behavior.
- **Client:** `lib/assistant/gemini.ts:1` (`GoogleGenAI`, `GEMINI_API_KEY` from env, mirrors `lib/supabase.ts` pattern).

### Reliability safeguards

- **Rate-limit handling:** per-model queue spacing `MIN_GAP_MS=4200` (~14 RPM safety margin under 15 RPM ceiling) + exponential backoff on 429/503 (`MAX_RETRIES=3`, `BASE_DELAY_MS=2000` doubling) in `lib/assistant/modelQueue.ts:13` and `lib/assistant/geminiRetry.ts:9` (legacy single-queue reference). Route maps quota/rate-limit → `429` and high-demand/overload → `503` with friendly messages (`app/api/assistant/route.ts:51`).
- **Duplicate tool-call detection:** `lib/duplicateCallDetect.ts:31` — `createToolCallTracker` + `handleFunctionCallsForRound` canonicalize args (sorted keys) to short-circuit identical calls within a turn with a `note` result instead of re-executing.
- **Round cap:** `MAX_TOOL_ROUNDS=4` (`lib/assistant/assistantOrchestrator.ts:9`). If the model still requests tool calls on the final round the loop throws `MAX_TOOL_ROUNDS exceeded` (route surfaces `500`); progress-tracker notes a forced-final-round fallback (`FunctionCallingConfigMode.NONE`) as defense-in-depth but the current code throws rather than forcing a text-only final turn.
- **Player name resolution:** cached roster injected into context — `getPlayerRoster()` (`lib/playerRoster.ts:16`, `CACHE_TTL_MS=5*60*1000`, stale-cache fallback, `invalidatePlayerRosterCache` on mutations) listed in `systemInstructionWithRoster` (`lib/assistant/assistantOrchestrator.ts:54`); model must resolve names from roster, never call `query_team_data` on `players` to look up an id, and never print ids.
- **Ambiguity & ties:** ambiguous player names (multiple matches or no clear match) — assistant asks the user to clarify before calling tools (`lib/assistant/assistantOrchestrator.ts:62` + system prompt). Tied `getFirstToReachMilestone` (`tied: true`, `players[]` at same `match_date`) — reported explicitly as a tie, not guessed (`lib/assistant/tools.ts:729`, system prompt `lib/assistant/assistantSystemPrompt.ts:58`).

### Known limitation

The assistant cannot determine order of events **within** a single match (e.g., which of two players who reached a milestone in the same match did so first) — only final match totals per player are recorded (`score_entries.match_date` + aggregates), no in-match sequence data. `getFirstToReachMilestone` returns `tied: true` with all players at the earliest `matchDate` in this case, and the assistant reports it as a tie rather than guessing.

### Testing the assistant under load

- **Script:** `scripts/load-test-assistant.mjs:1` — fires `CONCURRENCY` (default 10) concurrent `POST /api/assistant` requests spanning Tier 1/2/3 queries; authenticates once via `POST /api/auth/verify-access` and reuses the `cricscore_access` cookie.
- **Run:** `node scripts/load-test-assistant.mjs` (or `BASE_URL=https://your-app.vercel.app CONCURRENCY=10 node scripts/load-test-assistant.mjs`); auto-loads `ACCESS_PIN` from `.env.local`.
- **Checks:** concurrent request handling, rate-limit (`429`) vs success breakdown, average/slowest response time, and that no `MAX_TOOL_ROUNDS` or redirect-to-`/access` regressions occur.

## Access Control

Enforced by `proxy.ts:3` (site-wide) plus the admin dialog on `/admin`:

1. **Site access:** every route except `/access`, `/admin-access`, `/api/auth/verify-access`, `/api/auth/verify-admin` requires `cricscore_access=granted`. Missing cookie → `302 /access`. Set by `POST /api/auth/verify-access` (`app/api/auth/verify-access/route.ts:16`) with `maxAge: 30 days`, `httpOnly`, `sameSite: lax`.
2. **Admin access:** `/admin` renders `AdminPinDialog` on every visit; verification calls `POST /api/auth/verify-admin` (`app/api/auth/verify-admin/route.ts:14`). **No persistent `cricscore_admin` cookie is used** — access is not remembered (see `context/project-overview.md:5`). The current `verify-admin` handler re-sets `cricscore_access` for 1 minute as a side-effect; `proxy.ts` does not check a separate admin cookie.

## App Flow

```mermaid
flowchart TD
  A[Any / route] --> B{Access PIN valid?}
  B -- No --> C[/access/]
  B -- Yes --> D[Home /]
  D --> E[Filter & Browse Players - FilterRow]
  E --> F[Tap card -> Add Score /player/:id/add-score]
  E --> G[Long-press card -> Profile /player/:id/profile]
  F --> H[Submit -> validation -> score_entries]
  G --> I[StatsGrid + MatchHistory]
  I --> J[Edit Entry /player/:id/add-score/:entryId/edit - admin PIN required]
  I --> K[Filter MatchHistory by month/year]
  D --> L[Leaderboard /leaderboard - LeaderBoardTable]
  D --> M{Sidebar -> Manage Players?}
  M -- Yes --> N[/admin - AdminPinDialog/]
  N --> O[ManagePlayers / AdminPlayerList]
```

## Player Card Interaction

`app/hooks/useLongPress.ts:1` distinguishes tap vs long-press with a 300 ms delay, `MOVEMENT_THRESHOLD:15px`, and scroll cancellation — fixes the home-screen scrolling/redirecting bug.

- **Tap** (`onShortPress`) → `router.push('/player/[id]/add-score')`
- **Long-press** (`onLongPress`) → `router.push('/player/[id]/profile')`

## API + Data Flow

```mermaid
flowchart LR
  UI[Client Pages] --> API[Next.js Route Handlers - app/api]
  API --> R[(Supabase Read Client - lib/supabase.ts)]
  API --> W[(Supabase Admin Client - lib/supabase.ts)]
  R --> DB[(Supabase DB)]
  W --> DB

  UI -->|POST /api/auth/verify-access| API
  UI -->|POST /api/auth/verify-admin| API
  UI -->|GET /api/players| API
  UI -->|POST/PATCH/DELETE /api/players*| API
  UI -->|GET/POST/PATCH /api/players/:id/scores*| API
```

`GET /api/players` (`app/api/players/route.ts:20`) now does a single `players` + `computed_stats` query plus a single `score_entries` query, then aggregates `derived_stats` in JS (no N+1):

- `computed_stats` fields: `games_played`, `total_runs`, `total_wickets`, `batting_avg`, `strike_rate`, `bowling_avg`, `economy`, `highest_score`, `best_figures`
- `derived_stats` (`types/leaderboardProps.ts:1`): `batInnings`, `ballsFaced`, `fours`, `sixes`, `notOuts`, `bowlInnings`, `oversBowled`, `runsGiven`, `threeWi`, `fiveWi`

Leaderboard sorting is client-side in `app/leaderboard/page.tsx:77`: batting by `total_runs → batting_avg → strike_rate → batInnings ASC`; bowling by `total_wickets → economy ASC → bowling_avg ASC → best_figures`.

## Score Entry Validation Flow

```mermaid
flowchart TD
  A[Submit score form] --> B{match_date and match_label present?}
  B -- No --> E1[400: required fields]
  B -- Yes --> C{runs > 0 and balls_faced > 0?}
  C -- No --> E2[400: invalid batting input]
  C -- Yes --> D{run breakdown valid? singles+doubles*2+triples*3+fours*4+sixes*6 == runs}
  D -- No --> E3[400: runs mismatch]
  D -- Yes --> F{bowling data has overs?}
  F -- No --> E4[400: overs required]
  F -- Yes --> G[Persist to score_entries]
  G --> H[201/200 success -> trigger_recalculate -> computed_stats]
```

Validation lives in `app/api/players/[id]/scores/route.ts` and `app/api/players/[id]/scores/[entryId]/route.ts`. `match_date` + `match_label` is `UNIQUE` per player (`db/schema.sql:57`); `match_date`/`match_label` are immutable on edit.


## Database Schema

`db/schema.sql:1`:

| Table | Key Columns |
|---|---|
| `players` | `id uuid PK`, `name text`, `role check(Batsman/Bowler/All-rounder)`, `batting_hand`, `bowling_hand`, `bowling_style`, `created_at`, trigger `on_player_created → create_computed_stats()` |
| `score_entries` | `id`, `player_id FK CASCADE`, `match_date date`, `match_label text`, `runs/balls_faced/singles/doubles/triples/fours/sixes`, `how_out/not_out`, `overs_bowled numeric(4,1)/runs_given/wickets/maidens`, `UNIQUE(player_id, match_date, match_label)`, trigger `on_score_change → trigger_recalculate()` |
| `computed_stats` | `player_id UNIQUE FK CASCADE`, `total_runs/wickets`, `batting_avg/strike_rate/bowling_avg/economy`, `highest_score`, `best_figures`, `games_played`, `last_updated` |

## Routes

| Route | Purpose |
|---|---|
| `/access` | Site-wide 5-digit PIN gate |
| `/admin-access` | Admin 4-digit PIN gate (standalone page) |
| `/` | Player cards grid, `FilterRow`, `AddPlayerCard`/`AddPlayerDialog`, `TopNav` + `Sidebar` |
| `/leaderboard` | Batting/Bowling `LeaderBoardTable` with `LeaderBoardTabs` |
| `/admin` | `ManagePlayers` — edit `name`/`role`/`batting_hand`/`bowling_hand`/`bowling_style`, delete player (admin PIN dialog) |
| `/player/[id]/profile` | `ProfileHeader` + `StatsGrid` + `MatchHistory` (filterable) |
| `/player/[id]/add-score` | `ScoreHeader` + `DateMatchRow` + `StatInputCard` + `ScoreAction` — create entry |
| `/player/[id]/add-score/[entryId]/edit` | Edit existing entry (match_date/label read-only) + delete entry |

`components/ui/Sidebar.tsx:24` currently returns `null` outside `/` (only homepage shows the hamburger), though `context/feature-specs/create-sidebar.md` intended it on all routes — TopNav is present on other routes but the trigger is home-only. `BottomNav` (`app/components/BottomNav.tsx`) has been removed.

## API Endpoints

| Endpoint | Methods | Description |
|---|---|---|
| `/api/auth/verify-access` | `POST` | Verifies `ACCESS_PIN`, sets `cricscore_access` (`30d`) |
| `/api/auth/verify-admin` | `POST` | Verifies `ADMIN_PIN` (re-sets `cricscore_access` for 1 min; no admin cookie) |
| `/api/players` | `GET` | List players + `computed_stats` + `derived_stats` (single-query aggregation) |
| `/api/players` | `POST` | Create player `{name, role, batting_hand, bowling_hand, bowling_style}` |
| `/api/players/[id]` | `GET`, `PATCH`, `DELETE` | Read/update/delete player (style fields with migration fallback) |
| `/api/players/[id]/scores` | `GET`, `POST` | List/create score entries |
| `/api/players/[id]/scores/[entryId]` | `GET`, `PATCH`, `DELETE` | Read/update/delete single entry (includes delete-score flow + toast) |
| `/api/assistant` | `POST` | AI assistant chat — `{message, history}` → `runAssistantTurn` → Gemini tool loop → `{text}` or `{error, detail}` (`429/503/500`) |

All handlers use `supabase` (anon) for reads and `supabaseAdmin` (service role) for writes, with input validation at the boundary.

## Project Structure

```
cricscore/
├── proxy.ts                          # site-wide cookie gate (matcher excludes _next/static, etc.)
├── next.config.js / tsconfig.json / postcss.config.mjs
├── app/
│   ├── layout.tsx / globals.css      # fonts (Geist/Rajdhani/Share_Tech_Mono), Toaster, Analytics, SW registration
│   ├── page.tsx                      # home: fetch /api/players, FilterRow, PlayerCardWrapper grid, ASK LYST
│   ├── access/page.tsx               # 5-digit PIN gate
│   ├── admin-access/page.tsx         # 4-digit PIN gate
│   ├── admin/page.tsx                # admin panel (AdminPinDialog + ManagePlayers)
│   ├── leaderboard/page.tsx          # Overall Stats: tabs + LeaderBoardTable (sorting)
│   ├── player/[id]/profile/page.tsx # ProfileHeader/StatsGrid/MatchHistory
│   ├── player/[id]/add-score/page.tsx
│   ├── player/[id]/add-score/[entryId]/edit/page.tsx
│   ├── hooks/useLongPress.ts
│   └── api/
│       ├── assistant/route.ts        # LYST chat — {message,history} → runAssistantTurn
│       ├── auth/verify-access/route.ts
│       ├── auth/verify-admin/route.ts
│       └── players/
│           ├── route.ts
│           ├── [id]/route.ts
│           └── [id]/scores/
│               ├── route.ts
│               └── [entryId]/route.ts
├── components/
│   ├── assistant/ AssistantChat.tsx, AssistantMessage.tsx
│   ├── ui/  AddPlayerCard.tsx, AddPlayerDialog.tsx, AdminPinDialog.tsx, ConfirmDeleteDialog.tsx, FilterRow.tsx, PlayerCard.tsx, PlayerCardWrapper.tsx, Sidebar.tsx, TopNav.tsx, StarBorder.tsx
│   ├── admin/  AdminHeader.tsx, AdminPlayerItem.tsx, AdminPlayerList.tsx, ManagePlayers.tsx
│   ├── leaderboard/ LeaderBoardHeader.tsx, LeaderBoardTable.tsx, LeaderBoardTabs.tsx
│   ├── profile/ MatchHistory.tsx, MatchHistoryFilterDialog.tsx, MatchHistoryItem.tsx, ProfileHeader.tsx, StatsGrid.tsx
│   └── addScore/ DateMatchRow.tsx, ScoreAction.tsx, ScoreHeader.tsx, StatInputCard.tsx
├── lib/
│   ├── supabase.ts / constants.ts / playerStyles.ts / utils.ts
│   ├── playerRoster.ts               # cached roster (CACHE_TTL_MS 5min)
│   ├── duplicateCallDetect.ts        # canonical duplicate tool-call detection
│   └── assistant/
│       ├── assistantOrchestrator.ts  # runAssistantTurn, MAX_TOOL_ROUNDS=4, temperature 0
│       ├── assistantTools.ts         # executeToolCall + functionDeclarations (10 tools)
│       ├── assistantSystemPrompt.ts  # ASSISTANT_SYSTEM_INSTRUCTION
│       ├── tools.ts                  # Tier1/2/3 implementations (allowlisted query, derived calcs)
│       ├── modelQueue.ts             # dual-model routing + rate-limit queue (gemini-3.1/3.5-flash-lite)
│       ├── gemini.ts                 # GoogleGenAI client
│       └── geminiRetry.ts            # legacy single-queue backoff helper
├── types/ leaderboardProps.ts, playerCardProps.ts, profileHeaderProps.ts, statsGridProps.ts, dateMatchRowProps.ts, matchHistoryItemProps.ts, scoreHeaderProps.ts, statInputCardProps.ts
├── db/schema.sql
├── scripts/load-test-assistant.mjs   # concurrent load tester for /api/assistant
├── context/ project-overview.md, architecture-context.md, code-standards.md, ai-workflow-rules.md, progress-tracker.md, feature-specs/
└── public/ logo.png, manifest.json, sw.js
```

See also `AGENTS.md` and `context/architecture-context.md` for boundaries and invariants.

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ACCESS_PIN=5_digit_site_pin
ADMIN_PIN=4_digit_admin_pin
GEMINI_API_KEY=your_gemini_api_key   # required for AI Assistant (LYST) — Gemini function calling
```

Never commit `.env.local`; see Boundaries below.

## Local Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # type-check + Next.js build
npm run lint -- --fix
npm run format   # Prettier
```

PWA: `npm run build` + serve requires `manifest.json`/`sw.js` under `public/`.


## Boundaries & Do Not Touch

- Never modify `.env` / `.env.local` via tooling; never edit `.next/`; never edit `package-lock.json` directly.
- Do not place app logic in `public/`.
- `components/ui/*` are foundation components — keep reusable, put feature logic in app-level components.

## Verification

```bash
npm run build   # must pass
npx tsc --noEmit
npx eslint components/leaderboard/LeaderBoardTable.tsx components/profile/MatchHistory.tsx --ext .ts,.tsx
```
