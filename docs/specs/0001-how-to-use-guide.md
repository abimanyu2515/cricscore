# 0001. How to Use Guide

**Date**: 2026-10-20
**Status**: Proposed

## Summary

A new `/how-to-use` route that teaches new users every core flow in CricScore: entering the PIN, adding players, tapping to score, long pressing for profiles, viewing the leaderboard, understanding the matches page, and admin actions. The guide is a static page with expandable stepper cards, linked from the desktop TopNav and mobile Sidebar so it's always one click away.

## Context

New users often miss the single tap vs long press distinction, the run breakdown validation, or the admin PIN requirement for edits. The existing UI has no onboarding. A dedicated help page reduces support questions and lets users self serve. No database changes or API work needed — this is a content page built from existing components and styling tokens.

## Requirements

**User stories**:
- As a new user, I want a clear walkthrough so I can start scoring matches without guessing.
- As a returning user, I want a permanent reference I can open from the nav to remind myself of scoring rules or admin limits.
- As an admin, I want the guide to explain what I can and cannot edit (match date and label are locked).

**Acceptance criteria**:
- **AC-1**: Visiting `/how-to-use` renders a page with six sections (Quick Start, Scoring Rules, Profile & History, Admin Actions, Matches Page) in order.
- **AC-2**: Desktop TopNav shows "HOW TO USE" link with animated underline matching existing nav items (uncomment existing button).
- **AC-3**: Mobile Sidebar includes "How to Use" item in its menu array with correct link.
- **AC-4**: Each section uses an expandable stepper card: numbered step visible at a glance, tap expands for details, tips, and rules.
- **AC-5**: Page is publicly accessible with no authentication gate (works before PIN entry).
- **AC-6**: Responsive layout stacks vertically on mobile, comfortable grid on desktop; uses existing tokens (`font-mono`, zinc backgrounds, cyan/purple accents, `#b9e03c` underlines).
- **AC-7**: Zero new API routes, database changes, or environment variables.

## Options considered

### Option 1: Static page with expandable cards (chosen)

A single route rendering authored content in expandable stepper cards. No CMS, no external assets for MVP.

**Pros**:
- Fast to build, no backend work
- Content version controlled with code
- Matches existing aesthetic using current tokens

**Cons**:
- Content updates require deploy
- No analytics on which sections users read

### Option 2: Onboarding modal flow

First time users see a modal sequence on homepage after login.

**Pros**:
- Catches users at moment of need
- Can track completion

**Cons**:
- Intrusive for returning users
- Harder to reference later
- More complex state (dismissal, localStorage)

### Option 3: External docs site (Notion, GitBook)

Link out to a separate documentation site.

**Pros**:
- Rich editing, search, analytics
- Non developers can update

**Cons**:
- Context switch for users
- Extra maintenance surface
- Overkill for a single help page

## Decision

**Chosen option**: Option 1: Static page with expandable cards

A single `/how-to-use` route with expandable stepper cards, linked from TopNav (desktop) and Sidebar (mobile). Content authored in component, deployed with code.

**Implementation skills**: None new — uses existing Next.js, Tailwind, lucide-react patterns.

## Rationale

The guide is reference material, not a one time onboarding flow. Users need to return to it (scoring rules, admin limits). A static page linked from persistent nav satisfies this with minimal code. Expandable cards keep the page scannable — users see all section titles at once, tap only what they need. No CMS or external tool justified for this scope.

## Feature design

**Data model sketch**:
No database entities. Content is authored in the page component as structured JSX/markdown objects.

**State transitions**:
None.

**API surface**:
No endpoints. Page is a React Server Component (static content) with client side expand/collapse via `useState`.

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Render guide page | Section titles, step text, tips, rules | Authored constants in component |
| Render TopNav link | "HOW TO USE" label, `/how-to-use` href | Hardcoded in TopNav |
| Render Sidebar item | "How to Use" label, `/how-to-use` href | Added to Sidebar `menuItems` array |

**Key invariants**:
- Page must render without auth context (no `useSession`, no redirect)
- Expandable cards must not trigger navigation on tap (only toggle open/close)
- Animated underline on TopNav link must match existing nav items exactly

**Security model**:
Public route. No authorization checks. No sensitive data displayed.

**Configuration required**:
None.

**Critical test scenarios**:
- Happy path: Visit `/how-to-use` directly, all six sections render, expand/collapse works, nav links present on desktop and mobile. Verifies **AC-1**, **AC-2**, **AC-3**, **AC-4**, **AC-6**
- Failure case: JavaScript disabled — core content still readable as static HTML (RSC renders markdown). Verifies **AC-6**
- Auth/permission: Unauthenticated user (before PIN) can access page and see all content. Verifies **AC-5**

## Build plan

1. Create `app/how-to-use/page.tsx` with guide content and expandable stepper cards, satisfies **AC-1**, **AC-4**, **AC-6**
2. Create reusable `components/ui/GuideStepperCard.tsx` (expandable card component), satisfies **AC-4**
3. Uncomment "HOW TO USE" button in `components/ui/TopNav.tsx` (lines 72-78), satisfies **AC-2**
4. Add "How to Use" item to `Sidebar.tsx` `menuItems` array, satisfies **AC-3**
5. Verify no auth middleware blocks `/how-to-use` (should be public), satisfies **AC-5**
6. Build and lint check, satisfies **AC-7**

## Consequences

**Positive**:
- New users self onboard without asking teammates
- Single source of truth for scoring rules and admin limits
- No runtime dependencies or external services

**Negative / tradeoffs**:
- Content changes require code deploy (acceptable for low frequency updates)
- No visibility into which sections users actually read

**Neutral**:
- Adds one new route and two small component files
- Reuses all existing styling — no new design tokens

## Follow-up

- [ ] Consider adding simple view tracking (client side event) if product wants adoption data
- [ ] Add screenshot/GIF placeholders in content for future visual aids
- [ ] If guide grows large, split into sub pages with a sidebar index

## References

**Project sources**:
- `AGENTS.md` (styling tokens, component conventions)
- `components/ui/TopNav.tsx` (existing commented HOW TO USE button)
- `components/ui/Sidebar.tsx` (mobile menu items array)
- `context/feature-specs/create-sidebar.md` (sidebar pattern reference)