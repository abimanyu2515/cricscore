# Architecture Context

## Stack

| Layer            | Technology              | Role                                                           |
| ---------------- | ----------------------- | -------------------------------------------------------------- |
| Framework        | Next.js 16 + TypeScript | Full-stack app with server/client boundaries                   |
| UI               | Tailwind     | Component composition and styling                              |                       |
| Database         | Supabse  + PostgreSQL     | Relational metadata: players, match scores and score computation |


## System Boundaries

- `app/api` — Authenticated request handlers: input validation, users/admin verification, storing and retrieving players, scores and stats.
- `lib` — Shared infrastructure: Supabase client, access control helpers, and utilities.
- `components` — UI composition: canvas surfaces, sidebars, dialogs, and interactive elements.
- `db` — Database table schema.

## Storage Model

- **Database**: metadata, relationships, scores and stats.
- Players name, role and scores with corresponding matches and computed overall stats in PostgreSQL.
- `matches` table stores team-level fixture/result data (`team_1`, `team_2`, scores, overs, result, location, date, type) for the `/matches` page. It is **standalone** — no foreign key relationship to `score_entries` or `computed_stats`. `team_2` is free text, not a reference to `players` or any team-registry table.
- Deliberate tradeoff: a `match_id` FK on `score_entries` was considered (to guarantee two players' entries refer to the exact same match) but rejected — as opponent teams grow, a dropdown/select sourced from a `teams` or `matches` table becomes unscrollable/unusable in the add-score flow. Free-typed `match_label` + `match_date` on `score_entries` remains the only match identifier at the player-score level.
- Consequence: there is no reliable programmatic join between a `matches` row and the `score_entries` rows for that same match — only a loose match_date correlation. If a "who played in this match" feature is ever needed, it will require a separate design pass (not solved by this decision).

## Auth and Collaboration Model

- Only verified users with 5-digit pin can access the app.
- Only authenticated users can access protected routes.
- Only the admins can edit players name/role and edit/delete scores of existing matches. 

## Starter System Designs

- This is a mobile-first web app which was already built and depolyed.
- By default there will be a add new player card. User click the add new player card, a dialog appears the user enter the name and chooses the role .
- The player data is stored in the DB. A new player card will be added in the home page.
- When the user adds score to a player, the total runs should match the division of runs.
- The personals stats and overall stats are retrieved from computed stats.
- The admins can access the admin section.

## Score Entry Model

### Score Storing

- Input: User single tap on a player card, enters match label, enters batting and bowling scores.
- Execution: Next backend input validation, checks total runs match the division of runs and checks whether the bowler has bowled a ball if runs or wickets taken.
- Output: The scores are stored in the DB and retrieved in home, screen and personal stats via computed_stats.

## Invariants

1. Client components are used only where browser interactivity or real-time state requires them.
