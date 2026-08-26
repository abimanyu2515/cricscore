# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Overall Stats refactor (leaderboard)

## Current Goal

- Implement `context/feature-specs/refactor-overall-stats.md`: replace LeaderBoardList/LeaderBoardItem with table views (fixed name column, horizontally scrollable attributes) for batting & bowling sections.

## Completed

- Overall stats refactor: replaced `LeaderBoardList`/`LeaderBoardItem` with `LeaderBoardTable` (components/leaderboard/LeaderBoardTable.tsx) — sticky fixed name column, horizontally scrollable stat columns, rank 1 highlighted brighter per section.
- `/api/players` GET now returns `games_played`, `highest_score`, `bowling_avg` from `computed_stats` plus `derived_stats` aggregated server-side from `score_entries` (bat/bowl innings, BF, 4s, 6s, NOs, overs, runs given, 3WI, 5WI) in a single query (no N+1).
- Added `types/leaderboardProps.ts`; removed all `any` usage from leaderboard page.

## In Progress

- None.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Leaderboard aggregates (innings, BF, 4s, 6s, NOs, overs, runs given, 3WI, 5WI) are computed server-side in `/api/players` GET by joining `score_entries` in JS, rather than client-side N+1 fetches; `computed_stats` trigger-maintained fields remain the source for runs/wickets/averages/economy/HS/BBM.

## Session Notes

- Build and TypeScript pass; lint clean for changed files (remaining repo-wide lint errors pre-exist in unrelated files).
