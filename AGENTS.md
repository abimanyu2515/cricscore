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