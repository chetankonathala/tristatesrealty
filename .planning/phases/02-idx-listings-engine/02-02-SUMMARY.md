---
phase: 02-idx-listings-engine
plan: "02"
subsystem: api
tags: [simplyrets, supabase, next-cache, cron, revalidate, idx, listings]

# Dependency graph
requires:
  - phase: 02-01
    provides: Listing type, listings table schema, Supabase client pattern

provides:
  - SimplyRETS REST client (fetchProperties, fetchProperty) with Basic Auth and openHouses include
  - Response transformer (transformSimplyRetsListing) mapping API shape to Listing DB row
  - Paginated sync routine (syncListings) with lastId cursor, upsert on mls_id conflict
  - Cron-protected /api/listings/sync route (Bearer CRON_SECRET, POST+GET, maxDuration 300s)
  - On-demand ISR revalidate route /api/listings/revalidate (same CRON_SECRET guard)
  - open_house_date populated from earliest upcoming SimplyRETS openHouses entry (D-13 trigger)

affects: [02-03, 02-04, 02-05, 02-06, 02-07, 02-08, 02-10, 02-11]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Service-role Supabase client created inline in sync.ts (server-only), never imported in client bundle"
    - "lastId cursor pagination for SimplyRETS /properties endpoint (not offset-based)"
    - "revalidateTag with empty CacheLifeConfig {} for Next.js 16 compatibility"
    - "Dual POST+GET export on sync route for Vercel Cron GET-first compatibility"

key-files:
  created:
    - src/lib/simplyrets/types.ts
    - src/lib/simplyrets/client.ts
    - src/lib/simplyrets/transform.ts
    - src/lib/simplyrets/sync.ts
    - src/app/api/listings/sync/route.ts
    - src/app/api/listings/revalidate/route.ts
  modified: []

key-decisions:
  - "Next.js 16 revalidateTag requires second profile argument — pass empty CacheLifeConfig {} for default TTL"
  - "sync.ts uses createClient from @supabase/supabase-js directly (service-role key) rather than createServerClient from @supabase/ssr — cookie-free server-to-server call"
  - "openHouses include appended automatically by fetchProperties if not already present — callers don't need to remember"
  - "pickEarliestUpcomingOpenHouse filters past open houses by comparing Date.parse(t) >= Date.now()"

patterns-established:
  - "Pattern: SimplyRETS pagination — use lastId cursor, limit=500, loop until listings.length < 500"
  - "Pattern: Cron auth — Authorization: Bearer ${CRON_SECRET} header check; 401 on missing/wrong secret"
  - "Pattern: Service client — getServiceClient() in server-only module using SUPABASE_SERVICE_ROLE_KEY"

requirements-completed: [IDX-01, IDX-02]

# Metrics
duration: 25min
completed: 2026-04-14
---

# Phase 02 Plan 02: SimplyRETS Data Pipeline Summary

**SimplyRETS Basic Auth client + paginated sync with Supabase upsert, ISR revalidateTag calls, cron-protected /api/listings/sync, and on-demand /api/listings/revalidate routes**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-04-14T17:03:01Z
- **Completed:** 2026-04-14T17:28:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- SimplyRETS client and type definitions covering all API response fields including openHouses
- Transformer that maps SimplyRETS API shape to Listing DB row, including open_house_date from earliest upcoming open house (prerequisite for D-13 alert trigger in plan 02-10)
- Full sync routine with lastId cursor pagination, service-role Supabase upsert, and ISR tag revalidation
- Cron-protected sync endpoint (POST+GET for Vercel Cron) and on-demand revalidate endpoint, both guarded by CRON_SECRET Bearer token

## Task Commits

Each task was committed atomically:

1. **Task 1: SimplyRETS client + types + transformer** - `fcdaeae` (feat)
2. **Task 2: Sync routine + cron sync route + revalidate route** - `d09f1db` (feat)

## Files Created/Modified

- `src/lib/simplyrets/types.ts` - SimplyRetsListing, SimplyRetsSearchParams, and supporting interfaces matching API response shape
- `src/lib/simplyrets/client.ts` - fetchProperties (with auto openHouses include) and fetchProperty using Basic Auth
- `src/lib/simplyrets/transform.ts` - transformSimplyRetsListing mapping API response to Listing DB row including open_house_date
- `src/lib/simplyrets/sync.ts` - syncListings paginated loop with Supabase service-role upsert and ISR revalidation
- `src/app/api/listings/sync/route.ts` - Cron-protected route, exports POST and GET, maxDuration=300
- `src/app/api/listings/revalidate/route.ts` - On-demand ISR revalidation, accepts ?tag= query param

## Decisions Made

- Next.js 16 changed `revalidateTag` to require a second `profile` argument (`string | CacheLifeConfig`). Used `{}` (empty CacheLifeConfig, all fields optional) to get default TTL behavior without hard-coding a profile name.
- `sync.ts` uses `createClient` from `@supabase/supabase-js` directly with the service-role key rather than the cookie-forwarding `createServerClient` from `@supabase/ssr` — sync is a server-to-server operation with no user session.
- `fetchProperties` appends `include=openHouses` automatically if not already present so callers cannot accidentally omit it and break the D-13 trigger.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Next.js 16 revalidateTag signature change**
- **Found during:** Task 2 (sync routine + routes)
- **Issue:** `npm run build` failed with "Expected 2 arguments, but got 1" on every `revalidateTag(tag)` call. Next.js 16 added a required second `profile: string | CacheLifeConfig` argument that was not present in the plan's provided code.
- **Fix:** Added `{}` as the second argument to all `revalidateTag` calls in `sync.ts` and `revalidate/route.ts`. Empty `CacheLifeConfig` satisfies the type (all fields optional) and uses default TTL behavior.
- **Files modified:** `src/lib/simplyrets/sync.ts`, `src/app/api/listings/revalidate/route.ts`
- **Verification:** `npm run build` exits 0 after fix
- **Committed in:** `d09f1db` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — Next.js 16 API change)
**Impact on plan:** Required for build to pass; no scope change, no behavioral difference from intended logic.

## Issues Encountered

- None beyond the revalidateTag API change documented above.

## User Setup Required

None — no external service configuration required beyond environment variables already listed in `.env.example` (`SIMPLYRETS_API_KEY`, `SIMPLYRETS_API_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`).

## Next Phase Readiness

- SimplyRETS pipeline complete — listings flow from Bright MLS into Supabase on each cron trigger
- `/api/listings/sync` callable immediately once `SIMPLYRETS_API_KEY`, `SIMPLYRETS_API_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, and `CRON_SECRET` are set in environment
- Plans 02-03 through 02-11 can now query the `listings` table with real data
- Blocker: Schell Brothers broker IDX authorization must be confirmed before `/api/listings/sync` can pull real Bright MLS data (SimplyRETS demo credentials will return demo listings in the meantime)

---
*Phase: 02-idx-listings-engine*
*Completed: 2026-04-14*
