<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Application Building Context

Read the following files in order before implementing or making any architectural decision:

1. `context/project-overview.md` — product definition, goals, features, and scope
2. `context/architecture-context.md` — system structure, boundaries, storage model, and invariants
3. `context/code-standards.md` — implementation rules and conventions
4. `context/ai-workflow-rules.md` — development workflow, scoping rules, and delivery approach
5. `context/progress-tracker.md` — current phase, completed work, open questions, and next steps

Update `context/progress-tracker.md` after each meaningful implementation change.

If implementation changes the architecture, scope, or standards documented in the context files, update the relevant file before continuing.

## 🛑 Boundaries & Do Not Touch
* NEVER modify `.env` or `.env.local` files.
* DO NOT edit files in the `.next/` directory; it is auto-generated.
* NEVER modify `package-lock.json` directly; only modify it via `npm install`.
* Do not place application logic inside the `public/` folder.

## 🛠️ Commands
Use these commands to verify your work before declaring a task complete:
* **Dev Server:** `npm run dev` (Runs on port 3000)
* **Build:** `npm run build` (Run this to verify type-checking and Next.js build steps pass)
* **Lint:** `npm run lint -- --fix`
* **Format:** `npm run format` (Prettier)

## 📁 Project Structure
```
cricscore/
   ├── .env.local                       # Frontend environment variables
   ├── package.json                     # Next.js dependencies
   ├── next.config.ts                   # Next.js configuration
   ├── tsconfig.json                    # TypeScript configuration
   ├── postcss.config.mjs               # PostCSS (Tailwind)
   ├──proxy.ts                          # Middleware support and cookie storage
   ├──.gitignore
   ├──README.md
   ├── app/
   │   ├── access/                      # Login / Register pages
   |   ├── admin/
   |   ├── admin-access/
   |   ├── api/
   |   |    ├── auth/
   |   |    |   ├──verify-access
   |   |    |   └──verify-admin
   |   |    └──players/
   |   |        └──[id]/
   |   |            └──scores/
   |   |                └──[entryid]/
   |   ├── hooks/
   |   ├── leaderboard
   |   ├── player/
   |   |   └──[id]
   |   |       ├──add-score
   |   |       └──profile
   |   ├── globals.css
   |   ├── layout.tsx
   |   └── page.tsx
   ├── components/
   │   ├── addScore/
   |   ├── admin/
   |   ├── leaderboard/
   |   ├── profile/
   |   └── ui/
   ├── context/
   ├── db
   ├── lib/               
   ├── types/
   └── public/                          # Static assets
```



* `src/app/` - App Router pages, layouts, loading, and error states.
* `src/components/` - Reusable, Layout-specific components (headers, footers, sidebars) and UI components (e.g., shadcn/ui buttons, inputs)
* `src/app/api/auth` - Contains backend basic pin-based verification with cookie storage.
* `src/app/api/players` - Contains backend routes to fetch, edit, create, delete and calculate players data & scores.
* `src/lib/` - Utility functions, fetch wrappers, and shared constants.
* `src/types/` - Global TypeScript interfaces and type definitions.

## Stack

- **Language / Runtime**: TypeScript, Node 20
- **Framework**: Next.js 16 (App Router)
- **Key dependencies**: @supabase/supabase-js, @google/genai, react, react-dom, tailwindcss, motion, gsap, lucide-react, sonner, clsx, tailwind-merge
- **Package manager**: npm

## Build approach

<TBD, set by /scope>

## Specs

Stored in `context/feature-specs/`. Format: `context/feature-specs/feature-title.md`.

## Rules

- Keep modules small and single-purpose
- Fix root causes — do not layer workarounds
- Do not mix unrelated concerns in one component or route
- Respect system boundaries defined in `architecture-context.md`
- Strict TypeScript mode; avoid `any`; use explicit interfaces
- Default to React Server Components; add `"use client"` only for browser interactivity
- Mobile-first styling; desktop styles behind `lg:` breakpoint
- Player names: `font-sans` + `font-bold`; everything else: `font-mono`
- Zinc backgrounds; cyan for batting; purple for bowling; `#b9e03c` for animated underlines
- Validate and parse request input before any logic; enforce auth before mutations
- Project metadata and relationships in PostgreSQL via Supabase; computed stats maintained by triggers
- Shared infrastructure in `lib/`; UI composition only in `components/`; route handlers in `app/api/`

## Agent skills

- [audit](.agents/skills/audit/): `opencode/opencode`, context bootstrapper for AGENTS.md files
- [architect](.agents/skills/architect/): `opencode/opencode`, design decisions and build specs
- [check](.agents/skills/check/): `opencode/opencode`, verify behavior and code review
- [debug](.agents/skills/debug/): `opencode/opencode`, root cause analysis and fix
- [develop](.agents/skills/develop/): `opencode/opencode`, feature implementation from approved design
- [document](.agents/skills/document/): `opencode/opencode`, PR/changelog/release notes
- [find-skills](.agents/skills/find-skills/): `opencode/opencode`, skill discovery
- [opencode](.agents/skills/opencode/): `opencode/opencode`, OpenCode usage and configuration
- [report](.agents/skills/report/): `opencode/opencode`, issue reporting
- [scope](.agents/skills/scope/): `opencode/opencode`, product scope management
- [sync](.agents/skills/sync/): `opencode/opencode`, context reconciliation
- [test](.agents/skills/test/): `opencode/opencode`, test suite generation

## Context files

- [app/api/AGENTS.md](app/api/AGENTS.md): API routes — auth, players, scores, matches, assistant; cookie vs header auth, validation patterns
- [components/AGENTS.md](components/AGENTS.md): UI by feature — RSC default, mobile-first, styling tokens, Sidebar/TopNav duality
- [lib/AGENTS.md](lib/AGENTS.md): Shared infra — Supabase singletons, assistant orchestration (dual Gemini, temp 0, thoughtSignature)
- [db/AGENTS.md](db/AGENTS.md): Schema — 4 tables, triggers, computed stats, standalone matches table, no match_id FK