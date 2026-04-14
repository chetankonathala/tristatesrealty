---
phase: 02-idx-listings-engine
plan: 03
subsystem: api
tags: [zod, supabase, search-params, query-functions, idx, listings]

# Dependency graph
requires:
  - phase: 02-idx-listings-engine/02-01
    provides: listings table schema and Supabase server client
provides:
  - Zod schema for URL search params with parser/serializer (src/lib/schemas/search-params.ts)
  - Supabase query functions for listings: searchListings, getListingByMlsId, getTopListingsForStaticParams, getComparableSales
affects:
  - 02-04 (search page RSC consuming searchListings)
  - 02-05 (detail page RSC consuming getListingByMlsId + getComparableSales)
  - 02-06 (map view consuming searchListings with bounds param)
  - 02-07 and later (any wave 3+ plan importing query functions)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Zod coerce for URL string-to-number/boolean transformation
    - Supabase query builder chaining for parameterized filters (no SQL injection)
    - SUMMARY_FIELDS constant string to limit SELECT columns for list views
    - Bounding box approximation via lat/lng deltas for comparable sales radius search

key-files:
  created:
    - src/lib/schemas/search-params.ts
    - src/lib/supabase/queries/listings.ts
  modified: []

key-decisions:
  - "SUMMARY_FIELDS includes open_house_date to match ListingSummary type (plan omitted it)"
  - "perPage capped at 100 in Zod schema (T-02-03-04 DoS mitigation)"
  - "getComparableSales uses bounding box approximation (1 deg lat ~= 69 miles) — accurate enough for 1-mile radius without PostGIS"
  - "searchListings defaults status to Active when param is undefined"

patterns-established:
  - "Pattern: parseMultiValue for comma-separated multi-select filter params (type, cities, counties, postalCodes)"
  - "Pattern: parseBounds parses 'swLng,swLat,neLng,neLat' string to typed 4-tuple for map viewport filtering"
  - "Pattern: All URL input validated through Zod before reaching Supabase query builder"

requirements-completed: [IDX-03, IDX-04, IDX-05, IDX-08]

# Metrics
duration: 2min
completed: 2026-04-14
---

# Phase 02 Plan 03: Search Params Schema + Listing Query Functions Summary

**Zod URL search params schema covering all IDX-04 filters and four Supabase query functions (searchListings, getListingByMlsId, getComparableSales, getTopListingsForStaticParams) ready for Wave 3 RSC consumption**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-14T22:34:22Z
- **Completed:** 2026-04-14T22:35:43Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- `searchParamsSchema` with 22 typed filter fields, Zod coercion from URL strings, state enum (DE/MD/NJ/PA), view enum (map/list/split), sort enum (6 modes), perPage capped at 100
- `parseSearchParams` / `parseBounds` / `parseMultiValue` utility functions for URL → typed params
- `searchListings` applies all IDX-04 filters via Supabase query builder (no SQL injection); supports 6 sort modes + pagination
- `getListingByMlsId` single-listing fetch for detail page (IDX-05)
- `getComparableSales` filters closed sales by lat/lng bounding box + time window (IDX-08)
- `getTopListingsForStaticParams` returns top 500 active listings for ISR generateStaticParams

## Task Commits

Each task was committed atomically:

1. **Task 1: URL search params Zod schema + parser** - `0b597cf` (feat)
2. **Task 2: Supabase listing query functions** - `1ae02aa` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/lib/schemas/search-params.ts` - Zod schema, SearchParams type, parseSearchParams, parseBounds, parseMultiValue
- `src/lib/supabase/queries/listings.ts` - searchListings, getListingByMlsId, getTopListingsForStaticParams, getComparableSales

## Decisions Made
- Added `open_house_date` to SUMMARY_FIELDS (plan omitted it but ListingSummary type requires it — Rule 1 auto-fix)
- `getComparableSales` uses bounding box approximation rather than PostGIS for radius; sufficient for 1-mile radius at this phase
- `searchListings` defaults `status` to `"Active"` when not specified in params

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added open_house_date to SUMMARY_FIELDS**
- **Found during:** Task 2 (Supabase listing query functions)
- **Issue:** Plan's SUMMARY_FIELDS string omitted `open_house_date` but `ListingSummary` type in `src/types/listing.ts` includes it as a required field. Omitting it would cause type mismatches when callers access `listing.open_house_date`.
- **Fix:** Added `open_house_date` to SUMMARY_FIELDS constant so `searchListings` and `getComparableSales` return the full ListingSummary shape.
- **Files modified:** src/lib/supabase/queries/listings.ts
- **Verification:** npx tsc --noEmit passes; npm run build passes
- **Committed in:** 1ae02aa (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** Necessary for type correctness. No scope creep.

## Issues Encountered
None - TypeScript compiled clean on first attempt, build passed.

## User Setup Required
None - no external service configuration required for this plan.

## Known Stubs
None - this plan creates pure query/schema logic with no UI rendering.

## Next Phase Readiness
- `searchListings` ready for Wave 3 search page RSC (02-04)
- `getListingByMlsId` + `getComparableSales` ready for detail page RSC (02-05)
- `parseSearchParams` ready for nuqs integration in client search components
- All query functions depend on Supabase `listings` table being populated (requires IDX sync from 02-02)

---
*Phase: 02-idx-listings-engine*
*Completed: 2026-04-14*
