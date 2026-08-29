# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Create Sidebar (overlay navigation)

## Current Goal

- Implement `context/feature-specs/create-sidebar.md`: overlay sidebar accessible from all routes (top-right icon), first row Appname + close icon, menus Overall Stats (/leaderboard) and Manage Players (/admin); home: remove Overall Stats button + lock icon, delete BottomNav; add-score/edit: centered player name + top-right sidebar; profile: top-right sidebar; leaderboard: replace BACK with // OVERALL STATS left, sidebar icon right; no sidebar in /admin.

## Completed

- Overall stats refactor: replaced `LeaderBoardList`/`LeaderBoardItem` with `LeaderBoardTable` (components/leaderboard/LeaderBoardTable.tsx) — sticky fixed name column, horizontally scrollable stat columns, rank 1 highlighted brighter per section.
- `/api/players` GET now returns `games_played`, `highest_score`, `bowling_avg` from `computed_stats` plus `derived_stats` aggregated server-side from `score_entries` (bat/bowl innings, BF, 4s, 6s, NOs, overs, runs given, 3WI, 5WI) in a single query (no N+1).
- Added `types/leaderboardProps.ts`; removed all `any` usage from leaderboard page.

## In Progress

- Create Sidebar overlay (50%): global Sidebar component + header/layout updates pending verification.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Leaderboard aggregates (innings, BF, 4s, 6s, NOs, overs, runs given, 3WI, 5WI) are computed server-side in `/api/players` GET by joining `score_entries` in JS, rather than client-side N+1 fetches; `computed_stats` trigger-maintained fields remain the source for runs/wickets/averages/economy/HS/BBM.

## Session Notes

- Build and TypeScript pass; lint clean for changed files (remaining repo-wide lint errors pre-exist in unrelated files).
