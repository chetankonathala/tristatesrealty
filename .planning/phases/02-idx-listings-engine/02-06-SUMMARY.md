---
phase: 02-idx-listings-engine
plan: "06"
subsystem: listings-search-page
tags: [listings, search, nuqs, rsc, map, split-layout]
dependency_graph:
  requires: ["02-03", "02-04", "02-05"]
  provides: ["/listings page", "NuqsAdapter app-wide", "SearchResultsGrid", "EmptyState"]
  affects: ["src/app/layout.tsx", "src/app/listings/"]
tech_stack:
  added: []
  patterns: ["RSC server component reads URL params via searchParams Promise", "nuqs NuqsAdapter wraps entire app", "dynamic() import with ssr:false for map component", "D-01 desktop split layout via CSS gridTemplateColumns"]
key_files:
  created:
    - src/app/listings/page.tsx
    - src/app/listings/loading.tsx
    - src/app/listings/error.tsx
    - src/components/listings/search-results-grid.tsx
    - src/components/listings/empty-state.tsx
  modified:
    - src/app/layout.tsx
decisions:
  - "Button asChild pattern unavailable (base-ui/react Button, no Radix Slot) — used Link with buttonVariants className instead"
  - "NuqsAdapter placed inside ClerkProvider body to preserve existing provider hierarchy"
metrics:
  duration: 28min
  completed_date: "2026-04-15"
  tasks_completed: 2
  files_changed: 6
---

# Phase 02 Plan 06: /listings Search Page Assembly Summary

**One-liner:** RSC /listings page wiring searchListings + nuqs URL state through D-01 split layout (60/40 desktop, list-first mobile) with NuqsAdapter added app-wide.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | NuqsAdapter + EmptyState + SearchResultsGrid | 379fdd1 | layout.tsx, empty-state.tsx, search-results-grid.tsx |
| 2 | /listings RSC page + loading.tsx + error.tsx | c27cc61 | page.tsx, loading.tsx, error.tsx |

## What Was Built

**`src/app/layout.tsx`** — NuqsAdapter from `nuqs/adapters/next/app` now wraps the entire app (inside ClerkProvider body), enabling `useQueryState` / `useQueryStates` hooks to work in all client components app-wide.

**`src/components/listings/empty-state.tsx`** — Two-variant component: `no-results` ("No Homes Match Your Search") and `error` ("We Couldn't Load Listings") with per UI-SPEC copy. Uses `buttonVariants` + Link for the clear-filters CTA since the project's Button (base-ui) does not support `asChild`.

**`src/components/listings/search-results-grid.tsx`** — Client component that:
- Reads `view` query param via `useQueryState` (split / list / map)
- Holds `selectedMlsId` state for marker↔card highlight sync
- Desktop: CSS grid with dynamic `gridTemplateColumns` (60/40, 100/0, 0/100) per view mode (D-01)
- Mobile: list-first with sticky "Show Map" / "Show List" toggle button (D-03)
- Dynamically imports `SearchMap` with `ssr: false`
- Dispatches `require-sign-in` custom event for unauthenticated save attempts (wired in plan 02-09)

**`src/app/listings/page.tsx`** — Async RSC that:
- Awaits `searchParams` Promise (Next 15 pattern)
- Wraps `parseSearchParams` in try/catch (T-02-06-01 threat mitigation)
- Calls `searchListings(parsed)` for DB query
- Renders `SearchFilters` → `ActiveFilterBar` → `SearchResultsHeader` → `SearchResultsGrid`
- ISR `revalidate = 900` (15-min fallback, on-demand revalidation via plan 02-02)
- Metadata: "Homes for Sale in DE, MD, NJ, PA | Tri States Realty"

**`src/app/listings/loading.tsx`** — 9 `ListingCardSkeleton` placeholders in responsive grid (1 col → 2 col → 3 col).

**`src/app/listings/error.tsx`** — Client error boundary using `EmptyState variant="error"` plus a reset button.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Button `asChild` prop not supported**
- **Found during:** Task 1 — TypeScript error on `EmptyState` no-results variant
- **Issue:** Project's `Button` component uses `@base-ui/react/button` (not Radix), which has no `asChild` / Slot pattern. `Property 'asChild' does not exist` TS error.
- **Fix:** Replaced `<Button asChild variant="outline"><Link>...</Link></Button>` with `<Link className={cn(buttonVariants({ variant: "outline" }))}>Clear Filters</Link>` — identical visual output, no TS error.
- **Files modified:** `src/components/listings/empty-state.tsx`
- **Commit:** 379fdd1

## Threat Mitigations Applied

| Threat | Mitigation |
|--------|-----------|
| T-02-06-01: Tampering via searchParams | `parseSearchParams` wrapped in try/catch in page.tsx; invalid input falls back to defaults |
| T-02-06-02: Unbounded result set DoS | `searchListings` paginates via `perPage` capped at 100 in plan 02-03 schema |

## Known Stubs

None — all data paths are wired. `onRequireSignIn` in `SearchResultsGrid` dispatches a `require-sign-in` custom event (intentional stub; plan 02-09 SignInRequiredModal will listen for it).

## Threat Flags

None — no new network endpoints or auth paths introduced beyond what the plan specifies.

## Self-Check: PASSED

- [x] `src/app/listings/page.tsx` — exists
- [x] `src/app/listings/loading.tsx` — exists
- [x] `src/app/listings/error.tsx` — exists
- [x] `src/components/listings/search-results-grid.tsx` — exists
- [x] `src/components/listings/empty-state.tsx` — exists
- [x] `src/app/layout.tsx` — NuqsAdapter present
- [x] Commit 379fdd1 — exists (Task 1)
- [x] Commit c27cc61 — exists (Task 2)
- [x] `npm run build` — exits 0, `/listings` shown as dynamic route
