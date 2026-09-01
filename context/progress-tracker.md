# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- None.

## Current Goal

- None.

## Completed

- Overall stats refactor: replaced `LeaderBoardList`/`LeaderBoardItem` with `LeaderBoardTable` (components/leaderboard/LeaderBoardTable.tsx) — sticky fixed name column, horizontally scrollable stat columns, rank 1 highlighted brighter per section.
- `/api/players` GET now returns `games_played`, `highest_score`, `bowling_avg` from `computed_stats` plus `derived_stats` aggregated server-side from `score_entries` (bat/bowl innings, BF, 4s, 6s, NOs, overs, runs given, 3WI, 5WI) in a single query (no N+1).
- Added `types/leaderboardProps.ts`; removed all `any` usage from leaderboard page.
- Completed Sidebar containing app name with the mentioned routes Overall Stats and Manage players.
- Added Sidebar component in TopNav
- Player Role Expansion (`context/feature-specs/player-role-expansion.md`): batting/bowling style display on profiles via `components/profile/ProfileHeader.tsx` + `lib/playerStyles.ts` (`Right/Left-hand bat • Right/Left-arm {Fast,Fast-medium,Medium-fast,Medium,Off spin,Leg spin}`), `components/ui/AddPlayerDialog.tsx` and `components/admin/AdminPlayerItem.tsx`/`AdminPlayerList.tsx` + `app/admin/page.tsx` wired with batting hand + bowling hand/style selects, defaults `Right/Right/Medium` assigned via `db/schema.sql` ALTER columns with fallback defaults in `/api/players` + `/api/players/[id]` GET/POST/PATCH for pre-migration rows, wired through API/DB.
- Match History Filter (`context/feature-specs/match-history-filter.md`): year/month filtering on `/player/[id]/profile` via `components/profile/MatchHistory.tsx` (header `// MATCH HISTORY` justified between + Filter button with `ListFilter` icon) + `components/profile/MatchHistoryFilterDialog.tsx` (month/year `<select>` boxes, Clear/Apply), default displays last 3 `score_entries` by `match_date` desc, filtered client-side by `getMonth()+1`/`getFullYear()` when month+year selected.

## In Progress

- None.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Leaderboard aggregates (innings, BF, 4s, 6s, NOs, overs, runs given, 3WI, 5WI) are computed server-side in `/api/players` GET by joining `score_entries` in JS, rather than client-side N+1 fetches; `computed_stats` trigger-maintained fields remain the source for runs/wickets/averages/economy/HS/BBM.
- Added Sidebar component in TopNav for clean access and visibility.

## Session Notes

- Build and TypeScript pass; lint clean for changed files (remaining repo-wide lint errors pre-exist in unrelated files). Player Role Expansion build verified `npm run build` + `tsc --noEmit` clean.
- Match History Filter build verified `npm run build` passes, `npx eslint components/profile/MatchHistory.tsx components/profile/MatchHistoryFilterDialog.tsx` clean.
