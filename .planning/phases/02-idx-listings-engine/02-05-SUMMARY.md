---
phase: 02-idx-listings-engine
plan: "05"
subsystem: ui
tags: [react-map-gl, mapbox, supercluster, use-supercluster, nuqs, listing-card, next-image]

# Dependency graph
requires:
  - phase: 02-idx-listings-engine/02-01
    provides: ListingSummary type, Supabase listings table, MLS constants
  - phase: 02-idx-listings-engine/02-03
    provides: search params schema, listing query functions, nuqs integration
provides:
  - SearchMap component with supercluster clustering and search-as-you-move
  - MapMarker with 44px a11y hit target and selected pulse animation
  - MapCluster with diameter scaling 32/40/52px per pointCount
  - Extended ListingCard with Save button, status dot, photo counter, NEW/PENDING badges
  - ListingCardSkeleton matching card dimensions
affects:
  - "02-06: search page assembly (consumes SearchMap + ListingCard)"
  - "02-09: sign-in required modal (onRequireSignIn callback wiring)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SearchMap writes URL bounds param via nuqs on map moveEnd (D-02 search-as-you-move)"
    - "Supercluster GeoJSON points pattern: filter nullish lat/lng before mapping"
    - "Cluster expansion zoom capped at 16 to prevent over-zooming"
    - "ListingCard Save button uses e.stopPropagation() to prevent Link navigation"
    - "Auth-gated UI: onRequireSignIn callback pattern (parent wires to SignInRequiredModal)"

key-files:
  created:
    - src/components/listings/search-map.tsx
    - src/components/listings/map-marker.tsx
    - src/components/listings/map-cluster.tsx
    - src/components/listings/listing-card-skeleton.tsx
  modified:
    - src/components/cards/listing-card.tsx
    - src/components/sections/featured-listings.tsx

key-decisions:
  - "ListingCard fully rewritten to accept ListingSummary — old image/beds/baths/sqft props removed; featured-listings.tsx updated to use ListingSummary shape with placeholder data"
  - "SearchMap uses controlled viewState (useState + onMove) rather than initialViewState only — enables flyTo on selection change"
  - "MapBounds initialized on map onLoad event and updated on onMoveEnd for correct initial cluster render"

patterns-established:
  - "Pattern: Map component files live in src/components/listings/ (not src/components/map/) for search-specific components"
  - "Pattern: Auth-gated card actions pass onRequireSignIn callback — parent decides modal behavior"

requirements-completed: [IDX-03]

# Metrics
duration: 22min
completed: 2026-04-14
---

# Phase 02 Plan 05: Search Map + Extended Listing Card Summary

**Mapbox dark-v11 SearchMap with supercluster clustering and search-as-you-move URL bounds sync; ListingCard rewritten for ListingSummary with Save/status-dot/photo-counter**

## Performance

- **Duration:** 22 min
- **Started:** 2026-04-14T17:05:00Z
- **Completed:** 2026-04-14T17:27:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- SearchMap emits URL `bounds` param on every map moveEnd (D-02 search-as-you-move), enabling server re-query
- Clicking a MapMarker calls `onSelect(mlsId)` so the parent list can highlight the corresponding card (D-04)
- MapCluster and MapMarker match UI-SPEC contracts (diameter scaling, 44px hit targets, gold accent, pulse ring)
- ListingCard fully replaces old prop API with `ListingSummary` shape — price, photo carousel, status dot, Save heart, badges
- ListingCardSkeleton ready for loading states in plan 02-06

## Task Commits

1. **Task 1: SearchMap + MapMarker + MapCluster** - `a2daffc` (feat)
2. **Task 2: Extended ListingCard + ListingCardSkeleton** - `00ffa11` (feat)

## Files Created/Modified

- `src/components/listings/search-map.tsx` - Mapbox Map with useSupercluster, bounds→URL, flyTo on selection
- `src/components/listings/map-marker.tsx` - Gold MapPin Marker, selected pulse, 44px touch target
- `src/components/listings/map-cluster.tsx` - Cluster circle with 32/40/52px diameter by count
- `src/components/listings/listing-card-skeleton.tsx` - Skeleton matching 4:3 card shape
- `src/components/cards/listing-card.tsx` - Rewritten: ListingSummary props, Save button, status dot, photo counter, NEW/PENDING badges, highlighted border
- `src/components/sections/featured-listings.tsx` - Updated to construct ListingSummary placeholder objects

## Decisions Made

- ListingCard fully rewritten (not just extended) because old props (`image`, `beds`, `sqft`) were incompatible with `ListingSummary` — cleaner to replace than to keep two prop APIs
- `featured-listings.tsx` updated to use `ListingSummary` shape with proper placeholder objects including mls_id, status, lat/lng fields
- SearchMap uses `useState(viewState)` + `onMove` for controlled map state rather than uncontrolled `initialViewState` — this is required for the `flyTo` on selectedMlsId to work alongside user panning

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated featured-listings.tsx to use new ListingCard prop API**
- **Found during:** Task 2 (after rewriting listing-card.tsx)
- **Issue:** `featured-listings.tsx` used old props (`image`, `beds`, `baths`, `sqft`, `featured`, `isNew`) — TypeScript compilation would fail
- **Fix:** Rewrote placeholder data as proper `ListingSummary` objects; updated component to pass `listing={listing}` prop
- **Files modified:** `src/components/sections/featured-listings.tsx`
- **Verification:** `npx tsc --noEmit` and `npm run build` both pass
- **Committed in:** `00ffa11` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary cascading update — changing the ListingCard prop interface requires updating all callers. No scope creep.

## Issues Encountered

- Map component files (search-map.tsx, map-marker.tsx, map-cluster.tsx) already existed as untracked files from earlier work in this wave. Verified they matched the plan spec exactly, then committed them as Task 1.

## Known Stubs

- `featured-listings.tsx` placeholder listings use hardcoded `ListingSummary` objects with Unsplash image URLs. These are intentional homepage placeholders — real data will be wired from Supabase in a future plan when the search/detail pages are live.

## User Setup Required

None — no external service configuration required for this plan.

## Next Phase Readiness

- SearchMap ready for assembly into the split-layout search page (plan 02-06)
- ListingCard ready to render real listings from Supabase query results
- `onRequireSignIn` callback on ListingCard ready to wire to SignInRequiredModal (plan 02-09)
- MapMarker `selected` prop ready for D-04 map↔list highlighting in plan 02-06

---
*Phase: 02-idx-listings-engine*
*Completed: 2026-04-14*

## Self-Check: PASSED

- FOUND: src/components/listings/search-map.tsx
- FOUND: src/components/listings/map-marker.tsx
- FOUND: src/components/listings/map-cluster.tsx
- FOUND: src/components/listings/listing-card-skeleton.tsx
- FOUND: src/components/cards/listing-card.tsx
- FOUND commit: a2daffc (Task 1)
- FOUND commit: 00ffa11 (Task 2)
