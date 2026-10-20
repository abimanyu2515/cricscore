# Database

## Overview

PostgreSQL schema (via Supabase) with three core tables for player scores and one standalone table for team match fixtures. Triggers maintain computed stats automatically on score changes.

## Key files

| File | Owns |
|---|---|
| `schema.sql` | Complete DDL: `players`, `score_entries`, `computed_stats`, `matches` tables, triggers, constraints |

## Commands

- Apply schema: Run `schema.sql` in Supabase SQL editor
- Migrations: Add new `ALTER TABLE` statements to `schema.sql` (commented for existing DBs)

## Conventions

- **UUID primary keys**: All tables use `gen_random_uuid()` default
- **Timestamps**: `created_at`/`updated_at` default `now()`; `updated_at` manually set on updates
- **Check constraints**: Enums enforced at DB level (role, batting_hand, bowling_hand, bowling_style)
- **Unique constraints**: `(player_id, match_date, match_label)` on `score_entries` prevents duplicate match entries per player
- **Foreign keys**: `score_entries.player_id` → `players.id` (CASCADE DELETE); `computed_stats.player_id` → `players.id` (CASCADE DELETE)
- **Triggers**:
  - `on_player_created`: After INSERT on `players` → `create_computed_stats()`
  - `on_score_change`: After INSERT/UPDATE/DELETE on `score_entries` → `trigger_recalculate()`
- **Computed stats**: Maintained by trigger function — `total_runs`, `total_wickets`, `batting_avg`, `strike_rate`, `bowling_avg`, `economy`, `highest_score`, `best_figures`, `games_played`
- **Matches table is standalone**: No FK to `players` or `score_entries`; `team_2` is free text. Deliberate tradeoff (see Architecture Decisions)

## Gotchas

- **No match_id on score_entries**: `match_label` + `match_date` is the only match identifier at player-score level. Cannot reliably join to `matches` table.
- **Trigger recalculation**: Any `score_entries` change fires `trigger_recalculate()` — do not manually update `computed_stats` in application code
- **Default values for migrated rows**: `batting_hand`/`bowling_hand`/`bowling_style` have defaults (`Right`/`Right`/`Medium`) but existing rows need explicit migration (see commented ALTER statements in `schema.sql`)
- **Role enum**: Only `Batsman`, `Bowler`, `All-rounder` allowed at DB level
- **Bowling style enum**: `Fast`, `Fast-medium`, `Medium-fast`, `Medium`, `Off spin`, `Leg spin`
- **Best figures format**: Stored as text `'wickets/runs'` (e.g., `'3/24'`) in `computed_stats.best_figures`
- **Match result**: `matches.match_result` is boolean (true=won, false=lost, null=tied); `match_result_desc` is free text for display

## Agent skills

None specific to this area.

## Related specs

- `context/feature-specs/player-role-expansion.md`
- `context/feature-specs/add-matches-section.md`

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._