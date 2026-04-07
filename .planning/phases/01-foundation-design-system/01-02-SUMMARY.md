---
phase: 01-foundation-design-system
plan: 02
subsystem: infra
tags: [supabase, pgvector, clerk, nextjs, auth, postgresql, middleware]

# Dependency graph
requires:
  - phase: 01-01
    provides: Next.js 16 project with all Phase 1 deps installed, root layout, font system
provides:
  - Supabase config.toml for local dev initialization
  - pgvector migration: listings table with vector(1536) column and ivfflat index
  - Browser Supabase client (createBrowserClient via @supabase/ssr)
  - Server Supabase client with async cookies() for Next.js 16 SSR
  - Clerk middleware protecting /agent (role check) and /dashboard/favorites/offers routes
  - ClerkProvider wrapping root layout
  - Sign-in page at /sign-in/[[...sign-in]]
  - Sign-up page at /sign-up/[[...sign-up]]
affects: [03-design-tokens, 04-navigation, 05-listings, 06-mapbox, 07-supabase, 08-offer-pipeline]

# Tech tracking
tech-stack:
  added:
    - supabase CLI (npx supabase init / migration new)
    - pgvector extension via SQL migration
  patterns:
    - Supabase client split: client.ts (browser) + server.ts (server with async cookies)
    - Clerk middleware with createRouteMatcher for fine-grained route protection
    - Role-based /agent route protection via sessionClaims.metadata.role (publicMetadata pattern)
    - Type assertion for Clerk sessionClaims.metadata (typed as {} — needs cast to access custom fields)

key-files:
  created:
    - supabase/config.toml
    - supabase/migrations/20260407181051_enable_pgvector.sql
    - src/lib/supabase/client.ts
    - src/lib/supabase/server.ts
    - src/middleware.ts
    - src/app/(auth)/sign-in/[[...sign-in]]/page.tsx
    - src/app/(auth)/sign-up/[[...sign-up]]/page.tsx
  modified:
    - src/app/layout.tsx

key-decisions:
  - "Used (sessionClaims?.metadata as { role?: string })?.role type assertion — Clerk types metadata as {} requiring cast to access publicMetadata.role"
  - "Docker not available in dev environment — npx supabase start must be run manually by user"
  - "supabase migration list requires supabase link — migration existence confirmed via filesystem check"
  - "Role-based agent access uses publicMetadata.role per ROADMAP.md locked decision (not Clerk Organizations)"

patterns-established:
  - "Supabase pattern: Always split browser (client.ts) and server (server.ts) clients — server uses async cookies()"
  - "Auth pattern: Clerk middleware in src/middleware.ts with createRouteMatcher; role checks via publicMetadata cast"
  - "Route pattern: Auth pages use catchall [[...route]] segments under (auth) group"

requirements-completed: [INFRA-02, INFRA-03]

# Metrics
duration: 20min
completed: 2026-04-07
---

# Phase 01 Plan 02: Supabase + Clerk Auth Integration Summary

**Supabase local dev with pgvector migration (listings table + ivfflat index), Clerk middleware protecting agent/dashboard routes, and sign-in/sign-up pages rendering Clerk components**

## Performance

- **Duration:** 20 min
- **Started:** 2026-04-07T18:25:00Z
- **Completed:** 2026-04-07T18:45:00Z
- **Tasks:** 2 (+ 1 human-verify checkpoint pending)
- **Files modified:** 8

## Accomplishments
- Supabase initialized with config.toml; migration creates pgvector extension + listings table with vector(1536) embedding column and ivfflat cosine similarity index
- Browser and server Supabase clients created using @supabase/ssr pattern; server client correctly awaits cookies() for Next.js 16
- Clerk middleware at src/middleware.ts protects /agent routes (role check via publicMetadata.role) and /dashboard/favorites/offers (auth required)
- ClerkProvider added to root layout wrapping entire app
- Sign-in and sign-up pages created as catchall routes under (auth) group

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize Supabase with pgvector and create database clients** - `346583d` (feat)
2. **Task 2: Integrate Clerk auth with middleware and auth pages** - `059bf95` (feat)

**Plan metadata:** (pending — created after SUMMARY)

## Files Created/Modified
- `supabase/config.toml` - Supabase local dev configuration
- `supabase/migrations/20260407181051_enable_pgvector.sql` - pgvector extension + listings table with vector(1536) + ivfflat index
- `src/lib/supabase/client.ts` - Browser client via createBrowserClient
- `src/lib/supabase/server.ts` - Server client with async cookies() for SSR cookie handling
- `src/middleware.ts` - Clerk middleware with route protection (agent role + protected routes)
- `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` - Sign-in page with centered SignIn component
- `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` - Sign-up page with centered SignUp component
- `src/app/layout.tsx` - Updated to wrap children with ClerkProvider

## Decisions Made
- Type assertion `(sessionClaims?.metadata as { role?: string })?.role` required because Clerk types `sessionClaims.metadata` as `{}` — custom publicMetadata fields need explicit cast
- Docker unavailable in the execution environment; `npx supabase start` deferred to user manual step
- `supabase migration list` requires a linked Supabase project — migration verified via filesystem presence instead

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript type error on sessionClaims.metadata.role**
- **Found during:** Task 2 (Clerk middleware build verification)
- **Issue:** `sessionClaims?.metadata?.role` fails TypeScript — Clerk types `metadata` as `{}`, so `.role` doesn't exist on that type
- **Fix:** Added type assertion `(sessionClaims?.metadata as { role?: string })?.role`
- **Files modified:** src/middleware.ts
- **Verification:** `npm run build` passes with 0 type errors
- **Committed in:** `059bf95` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — TypeScript type assertion)
**Impact on plan:** Necessary for build to pass. No scope creep; assertion is idiomatic Clerk pattern for publicMetadata access.

## Issues Encountered
- `npx supabase migration list` requires a linked project (`supabase link`) — confirmed migration file exists on filesystem at `supabase/migrations/20260407181051_enable_pgvector.sql` instead
- Docker not installed in execution environment — `npx supabase start` skipped; user must run manually

## Human Checkpoint Required

**Status: AWAITING USER VERIFICATION**

All code tasks are complete and committed. The following verification steps require manual action:

### What to Verify

1. **Supabase local dev** (requires Docker):
   ```bash
   npx supabase start
   ```
   Expected: Supabase starts without errors, outputs local API URL and anon key

2. **Run migration** (after Supabase starts):
   ```bash
   npx supabase db reset
   ```
   Expected: Migration applies, pgvector extension enabled, listings table created

3. **Update .env.local** with the local Supabase credentials output by `supabase start`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase start output>
   ```

4. **Start dev server**:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 — confirm app loads normally

5. **Check sign-in page**: Visit http://localhost:3000/sign-in
   Expected: Clerk sign-in form renders (may show keyless mode notice if no real Clerk keys set)

6. **Verify middleware file**: Confirm `src/middleware.ts` exists (not `middleware.ts` at root)

### Resume Signal
After verifying, proceed to Plan 03 (Design Tokens).

## User Setup Required

Before Clerk auth works in production or development with real accounts:
- Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from Clerk dashboard to `.env.local`
- Set `CLERK_SIGN_IN_URL=/sign-in` and `CLERK_SIGN_UP_URL=/sign-up` in `.env.local`
- To enable agent role: set `publicMetadata: { role: "agent" }` on the agent user in Clerk dashboard

## Next Phase Readiness
- Supabase client utilities ready for all subsequent plans that need DB access
- Clerk auth ready for buyer account features (Plan 4+) once real keys are configured
- Middleware route protection active for /agent and /dashboard routes
- Sign-in/sign-up pages functional in keyless mode for local dev

---
*Phase: 01-foundation-design-system*
*Completed: 2026-04-07*
