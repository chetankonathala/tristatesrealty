---
phase: 02-idx-listings-engine
plan: "09"
subsystem: saved-searches
tags: [saved-searches, supabase, clerk, rls, api-route, modal]
dependency_graph:
  requires: ["02-01", "02-06"]
  provides: ["saved-searches-table", "saved-searches-api", "saved-search-button", "sign-in-required-modal"]
  affects: ["02-10"]
tech_stack:
  added: []
  patterns:
    - "Service role Supabase client (bypasses anon RLS) + manual user_id filter for Clerk-based auth"
    - "Base UI render prop pattern for button-as-link (no asChild support in @base-ui/react/button)"
    - "Window CustomEvent bus for cross-component sign-in trigger (SavedSearchButton → SignInRequiredModal)"
key_files:
  created:
    - supabase/migrations/20260413000002_create_saved_searches.sql
    - src/types/saved-search.ts
    - src/lib/supabase/queries/saved-searches.ts
    - src/app/api/saved-searches/route.ts
    - src/components/listings/saved-search-button.tsx
    - src/components/listings/sign-in-required-modal.tsx
  modified:
    - src/app/layout.tsx
decisions:
  - "Service role key used for all saved_searches queries; RLS blocks anon access entirely — Clerk userId passed manually"
  - "CustomEvent 'require-sign-in' decouples SavedSearchButton from SignInRequiredModal (no direct import between components)"
  - "D-14 enforced: one-click save with no naming modal — criteria captured directly from URL search params"
metrics:
  duration: "34min"
  completed_date: "2026-04-15"
  tasks_completed: 2
  files_created: 6
  files_modified: 1
---

# Phase 02 Plan 09: Saved Searches — Data Model, API, and UI Summary

**One-liner:** Supabase saved_searches table with RLS + Clerk-protected CRUD API + one-click SavedSearchButton capturing URL filters + globally-mounted SignInRequiredModal triggered via window event bus.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Migration + types + queries + API route | 8f9d70e | supabase/migrations/20260413000002_create_saved_searches.sql, src/types/saved-search.ts, src/lib/supabase/queries/saved-searches.ts, src/app/api/saved-searches/route.ts |
| 2 | SavedSearchButton + SignInRequiredModal + layout wiring | 1219e74 | src/components/listings/saved-search-button.tsx, src/components/listings/sign-in-required-modal.tsx, src/app/layout.tsx |

## What Was Built

**Task 1: Data layer + API**
- `supabase/migrations/20260413000002_create_saved_searches.sql`: `saved_searches` table with uuid PK, user_id (TEXT for Clerk), criteria (JSONB), email_alerts, sms_alerts, alert_frequency, phone_number, email_address, last_seen_mls_ids (INTEGER[]), is_active, timestamps. RLS enabled with a deny-all anon policy. Two indexes: user_id + active partial.
- `src/types/saved-search.ts`: `SavedSearch` and `CreateSavedSearchInput` TypeScript interfaces.
- `src/lib/supabase/queries/saved-searches.ts`: `listSavedSearches`, `createSavedSearch`, `deleteSavedSearch`, `listAllActiveSavedSearches` — all use service role client.
- `src/app/api/saved-searches/route.ts`: GET/POST/DELETE, all gated by `auth()` from `@clerk/nextjs/server`. POST validates via Zod `searchParamsSchema`. DELETE filters by both `id` + `user_id` (IDOR protection, T-02-09-02).

**Task 2: UI components**
- `SavedSearchButton`: `useAuth()` from Clerk; signed-out users trigger `require-sign-in` CustomEvent; signed-in users POST current URL params as criteria in one click (D-14). Toast feedback via sonner.
- `SignInRequiredModal`: Listens for `require-sign-in` window CustomEvent. Shows "Sign in to save homes" dialog with Sign In + Create Account links including `redirect_url` parameter. Mounted globally in root layout.
- `src/app/layout.tsx`: `<SignInRequiredModal />` added inside `NuqsAdapter` as global singleton.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed `asChild` usage incompatible with base-ui Button**
- **Found during:** Task 2 TypeScript compilation
- **Issue:** Plan specified `<Button asChild>` pattern (Radix UI convention), but project uses `@base-ui/react/button` which does not support `asChild` — it uses a `render` prop instead.
- **Fix:** Replaced `<Button asChild><Link /></Button>` with `<Button render={<Link href="..." />}>` in `sign-in-required-modal.tsx`
- **Files modified:** src/components/listings/sign-in-required-modal.tsx
- **Commit:** 1219e74

### Infrastructure Note

`supabase db push` could not be executed — Docker daemon not running in this environment. The migration file is correctly authored and will apply when `supabase db push` is run with the Supabase stack available (local or remote). TypeScript compilation and `npm run build` both pass without it since the table schema is only referenced at runtime.

## Known Stubs

None — all API routes are fully wired to Supabase queries. SavedSearchButton posts to real `/api/saved-searches` endpoint.

## Threat Flags

No new threat surface beyond what is documented in the plan's threat model.

## Self-Check: PASSED

Files verified:
- FOUND: supabase/migrations/20260413000002_create_saved_searches.sql
- FOUND: src/types/saved-search.ts
- FOUND: src/lib/supabase/queries/saved-searches.ts
- FOUND: src/app/api/saved-searches/route.ts
- FOUND: src/components/listings/saved-search-button.tsx
- FOUND: src/components/listings/sign-in-required-modal.tsx
- FOUND: SignInRequiredModal in src/app/layout.tsx

Commits verified:
- 8f9d70e: feat(02-09): saved searches migration, types, queries, and API route
- 1219e74: feat(02-09): SavedSearchButton + SignInRequiredModal + global layout wiring

Build: npm run build passed (8 routes, /api/saved-searches listed as dynamic)
TypeScript: npx tsc --noEmit passed (no errors)
