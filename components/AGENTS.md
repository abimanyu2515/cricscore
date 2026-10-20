# Components

## Overview

UI composition layer organized by feature. Each subfolder owns a distinct surface or interaction pattern. Components are either React Server Components (default) or Client Components (`"use client"` only where browser interactivity, hooks, or real-time state requires it).

## Key files

| File | Owns |
|---|---|
| `ui/Sidebar.tsx` | Mobile drawer (lg:hidden) + desktop hidden; animated underline on hover |
| `ui/TopNav.tsx` | Desktop navbar (hidden lg:flex) with OVERALL STATS, MANAGE PLAYERS, ASK LYST |
| `ui/PlayerCard.tsx` | Player card: single-tap → add score, long-press → profile |
| `ui/AddPlayerDialog.tsx` | Dialog for creating players (name, role, batting/bowling hand/style) |
| `ui/AdminPinDialog.tsx` | Admin pin prompt for protected actions |
| `ui/ConfirmDeleteDialog.tsx` | Generic delete confirmation |
| `profile/ProfileHeader.tsx` | Player name, role, batting/bowling style badges |
| `profile/StatsGrid.tsx` | Grid of computed stats (runs, avg, SR, wickets, economy, HS, BBM) |
| `profile/MatchHistory.tsx` | List of score entries with year/month filter dialog |
| `profile/MatchHistoryFilterDialog.tsx` | Month/year select filters |
| `addScore/StatInputCard.tsx` | Batting/bowling input fields with run-division validation |
| `addScore/ScoreAction.tsx` | Submit/cancel buttons for score entry |
| `leaderboard/LeaderBoardTable.tsx` | Sticky name column, horizontal scroll, rank 1 highlight |
| `leaderboard/LeaderBoardTabs.tsx` | Batting/Bowling/All-rounder tabs |
| `matches/MatchResults.tsx` | Grid of MatchResultCard (1 col sm → 3 cols xl) |
| `matches/MatchResultCard.tsx` | Single match card: result, teams, scores, location, date, type |
| `matches/AddMatchDialog.tsx` | Admin dialog to create match fixtures |
| `assistant/AssistantChat.tsx` | Floating chat UI (text input, send, markdown rendering) |
| `assistant/AssistantMessage.tsx` | Single message bubble (user/assistant) |

## Commands

Same as root.

## Conventions

- **Default to RSC**: Add `"use client"` only for: `onClick`/`onLongPress` handlers, `useState`/`useRef`/`useEffect`, `motion`/`gsap` animations, `sonner` toasts, `react-markdown` streaming
- **Mobile-first**: Desktop styles behind `lg:` breakpoint; mobile drawer in `Sidebar.tsx`, desktop inline nav in `TopNav.tsx`
- **Styling tokens**: `font-sans` + `font-bold` for player names; `font-mono` for everything else; zinc backgrounds; cyan for batting; purple for bowling; `#b9e03c` (lime) for animated underlines
- **Dialog pattern**: All dialogs use `sonner` for toast feedback; form validation inline before submit
- **Long press**: `useLongPress` hook (`app/hooks/useLongPress.ts`) with 500ms threshold for profile navigation
- **No business logic in components**: Data fetching in route/pages, mutations via `fetch` to API routes, complex logic in `lib/`
- **TypeScript**: Props interfaces in `types/` (e.g., `PlayerCardProps`, `LeaderBoardTableProps`); strict mode, no `any`
- **Component naming**: PascalCase file = PascalCase export; one default export per file

## Gotchas

- **Sidebar/TopNav duality**: Both exist simultaneously; `Sidebar` is `lg:hidden` drawer, `TopNav` is `hidden lg:flex` bar. Do not merge — they serve different breakpoints.
- **Animation dependency**: Underline animation (`w-0 → w-full duration-300`) uses `group-hover` on parent `group relative` — changing layout breaks it.
- **PlayerCard interaction**: Single tap (`onClick`) vs long press (`onLongPress`) both on same card; long press must not trigger click (handled in hook).
- **LeaderBoardTable sticky column**: `position: sticky; left: 0; z-index: 10` on name column — horizontal scroll requires `overflow-x-auto` on wrapper.
- **AssistantChat**: Only mounted on homepage (`app/page.tsx`); not a separate route. State resets on navigation.
- **MatchResultCard**: `match_result` boolean (true=won, false=lost, null=tied) — UI derives badge color from this.
- **Protected foundation**: `components/ui/*` are shadcn-style primitives — do not modify unless explicitly required. Feature logic goes in feature folders (`addScore/`, `profile/`, etc.).

## Agent skills

None specific to this area.

## Related specs

- `context/feature-specs/create-sidebar.md`
- `context/feature-specs/refactor-overall-stats.md`
- `context/feature-specs/player-role-expansion.md`
- `context/feature-specs/match-history-filter.md`
- `context/feature-specs/ai-assistant.md`
- `context/feature-specs/add-matches-section.md`

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._