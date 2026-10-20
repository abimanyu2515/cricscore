# Scope: CricScore

CricScore is a Cricket Score Tracker App for a Cricket Team. A mobile-first web app where players enter scores match-wise, view profiles and stats, and admins manage data via a separate pin.

**Build approach:** Skateboard (get a working slice fast, iterate in small steps)
**Workflow:** Alpha (after /develop run /check verify; Prototype features skip verify)

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use /develop and skip /architect. You decide when a feature is done._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| A | Pin authentication (5-digit user) | Foundation | existing |
| B | Admin pin verification (4-digit) | Foundation | existing |
| C | Add and manage players | Foundation | existing |
| D | Add player score | Foundation | existing |
| E | Player profile and match history | Foundation | existing |
| F | Overall stats leaderboard | Foundation | existing |
| G | Edit or delete existing match data | Foundation | existing |
| H | Matches page (team fixtures) | Foundation | existing |
| I | How to Use guide for new users | Enhancement | in-progress |

## Foundations (existing)

### A. Pin authentication (5-digit user) · existing
Pre-workflow auth: 5-digit pin entry, cookie stored for 30 days. code in `app/access/` `app/api/auth/verify-access/`

### B. Admin pin verification (4-digit) · existing
Pre-workflow admin auth: 4-digit pin, no cookie, required per sensitive action. code in `app/admin-access/` `app/api/auth/verify-admin/`

### C. Add and manage players · existing
Anyone authenticated can create players. Admins can edit name or role, or delete players created by mistake. code in `app/api/players/` `components/addScore/` `app/admin/`

### D. Add player score · existing
Single tap on player card opens score entry. Validates runs breakdown matches total. Stores to DB with computed stats update. code in `app/player/[id]/add-score/` `app/api/players/[id]/scores/`

### E. Player profile and match history · existing
Long press on player card opens profile with runs, average, strike rate, wickets, economy, and match history cards. code in `app/player/[id]/profile/` `components/profile/`

### F. Overall stats leaderboard · existing
Ranks all players with separate batting and bowling tabs. code in `app/leaderboard/` `components/leaderboard/`

### G. Edit or delete existing match data · existing
Admins enter pin to edit score entries (except match date and label). Can delete entries for matches player did not play. code in `app/player/[id]/add-score/[entryId]/edit/` `app/api/players/[id]/scores/[entryId]/`

### H. Matches page (team fixtures) · existing
Standalone matches table for team-level fixtures and results (team_1, team_2, scores, overs, result, location, date, type). No FK to score_entries. code in `app/matches/` `db/`

## Enhancements

### I. How to Use guide for new users · in-progress
A dedicated `/how-to-use` route that walks new users through the app's core flows: pin entry, adding players, scoring (single tap), viewing profiles (long press), leaderboard, matches page, and admin actions. Keeps onboarding self-serve and reduces support questions.

**Done when:** visiting `/how-to-use` shows a clear, step-by-step guide with visual cues for each primary action; accessible from the home page and login screen; works on mobile and desktop.

- [x] Design it (spec): `/architect how-to-use guide`
- [ ] Build it: `/develop how-to-use guide`
   - [ ] Create guide page with expandable stepper cards
   - [ ] Add TopNav link (desktop) and Sidebar item (mobile)
   - [ ] Verify public access and responsive layout
- [ ] Verify it: `/check verify how-to-use guide`
- [ ] Test it: `/test how-to-use guide`
Spec 0001 · code (filled by /develop)