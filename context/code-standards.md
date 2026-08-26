# Code Standards

## General

- Keep modules small and single-purpose.
- Fix root causes — do not layer workarounds.
- Do not mix unrelated concerns in one component or route.
- Respect the system boundaries defined in `architecture-context.md`.

## TypeScript

- Strict mode is required throughout the project.
- Avoid `any`; use explicit interfaces or narrowly scoped types.
- Validate unknown external input at system boundaries before trusting it.
- Use `interface` for object contracts.

## Next.js

- Default to React Server Components.
- Add `"use client"` only when the component needs browser interactivity, hooks, or real-time state.
- Keep route handlers focused on a single responsibility.
- Long-running work belongs in background tasks, not in request handlers.

## Styling

- Here "font-sans" is set default text for Player names in bold.
- Except player names explicitly use "font-mono" for all the other purposes.
- Use the shades of zinc for general backgroud colors, shades of cyan for batting related features and purple for bowling realted feature.

## API Routes

- Validate and parse request input before any logic runs.
- Enforce auth and project ownership checks before any mutation.
- Return consistent, predictable response shapes.
- Keep route handlers thin — push complexity into shared modules or background tasks.

## Data and Storage

- Project metadata and relationships belong in PostgreSQL via Supabase.
- There are three tables present in the database and used in the app.
- `players` table to store players data
- `score_entries` table to store the players scores
- `computed stats` table is used to calculate and compute the players overall stats from `score_entries` table.
- Refer `db/schema.sql` to checkout schemas of all the three tables. 

## File Organization

- `lib/` — shared infrastructure: Prisma client, auth helpers, utilities.
- `components/` — UI composition only; no business logic.
- `app/api/` — route handlers for auth, triggering, and persistence.
- `app/hooks` — custom hooks to perform particular tasks.
- `types` — TypeScript types for components props.
- `db` — database tables schema
- Name files after the responsibility they contain, not the technology.
