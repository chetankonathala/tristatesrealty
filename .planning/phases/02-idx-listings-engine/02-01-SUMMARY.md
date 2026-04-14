---
phase: 02-idx-listings-engine
plan: 01
subsystem: database
tags: [supabase, postgres, simplyrets, bright-mls, typescript, npm, next.js]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Next.js project with Supabase client, Tailwind, env.example, next.config.ts

provides:
  - listings table in Supabase Postgres with full IDX schema (36 columns, 16 indexes, RLS)
  - src/types/listing.ts: Listing, ListingSummary, ListingStatus, PropertyType exports
  - src/lib/constants/mls.ts: MLS_ATTRIBUTION, FAIR_HOUSING_ALT, BRIGHT_MLS_LOGO_ALT exports
  - supercluster, use-supercluster, nuqs, resend, @react-email/components installed
  - next.config.ts remotePatterns for SimplyRETS photo CDN domains
  - .env.example documents all Phase 2 env vars (SimplyRETS, CRON_SECRET, Resend, Twilio, Google Maps)

affects:
  - 02-02 (SimplyRETS sync uses listings table + Listing types)
  - 02-03 (listings search API queries listings table)
  - 02-04 (listing cards + map use Listing types + supercluster + use-supercluster)
  - 02-05 (listing detail uses Listing types + MLS_ATTRIBUTION constants)
  - 02-06 (saved searches use nuqs)
  - 02-07 (email alerts use resend + @react-email/components)
  - 02-09 (IDX attribution uses MLS_ATTRIBUTION, FAIR_HOUSING_ALT, BRIGHT_MLS_LOGO_ALT)
  - 02-10 (open house alerts query open_house_date column)

# Tech tracking
tech-stack:
  added:
    - supercluster@8.0.1 (geospatial clustering for map)
    - use-supercluster@1.2.0 (React hook for supercluster)
    - nuqs@2.8.9 (URL search params state management)
    - resend@6.11.0 (transactional email for saved-search alerts)
    - "@react-email/components@1.0.12" (React email templates)
    - "@types/supercluster" (dev: TypeScript types for supercluster)
  patterns:
    - Supabase migrations use CREATE TABLE IF NOT EXISTS + DROP TABLE for schema evolution
    - RLS enabled on all public-readable tables with SELECT-only policy
    - Partial indexes (waterfront, open_house_date) for filtered queries
    - GIN index on text[] features column for array containment queries

key-files:
  created:
    - supabase/migrations/20260413000001_create_listings.sql
    - src/types/listing.ts
    - src/lib/constants/mls.ts
  modified:
    - package.json (5 new deps + 1 dev dep)
    - package-lock.json
    - .env.example (SimplyRETS, CRON_SECRET, Resend, Twilio, Google Maps vars)
    - next.config.ts (remotePatterns for SimplyRETS CDN + image formats)

key-decisions:
  - "Migration 02-01 drops the Phase 1 placeholder listings table (uuid PK, text mls_id) and recreates it with the full IDX schema (BIGINT identity PK, INTEGER mls_id) — incompatible schemas require DROP CASCADE"
  - "listings_public_read RLS policy uses SELECT USING (true) — IDX requires public read, server-side service role key used for all writes"
  - "open_house_date TIMESTAMPTZ column added to base schema to support plan 02-10 D-13 open-house alert trigger"

patterns-established:
  - "Listing types: use src/types/listing.ts Listing/ListingSummary interfaces throughout Phase 2"
  - "MLS attribution: use MLS_ATTRIBUTION.copyright(year) and FAIR_HOUSING_ALT from src/lib/constants/mls.ts for IDX-09 compliance"
  - "SimplyRETS photos: reference via next/image with next.config.ts remotePatterns already configured"

requirements-completed: [IDX-01, IDX-04, IDX-05, IDX-09, IDX-10]

# Metrics
duration: 25min
completed: 2026-04-14
---

# Phase 2 Plan 01: Foundation — listings table, Listing types, MLS constants, Phase 2 deps

**Supabase listings table with 36 columns + 16 indexes + RLS, Listing/ListingSummary TypeScript interfaces, Bright MLS IDX-09 attribution constants, and supercluster/nuqs/resend/react-email dependencies installed**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-04-14T17:10:00Z
- **Completed:** 2026-04-14T17:35:00Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Installed all 5 Phase 2 runtime deps (supercluster, use-supercluster, nuqs, resend, @react-email/components) + @types/supercluster dev dep; build passes
- Created full listings table migration (36 columns, 16 indexes including GIN on features, partial on open_house_date and waterfront, composite idx_listings_search) with RLS SELECT-only policy applied to local Supabase via `supabase db reset`
- Created src/types/listing.ts with Listing, ListingSummary, ListingStatus, PropertyType and src/lib/constants/mls.ts with MLS_ATTRIBUTION, FAIR_HOUSING_ALT, BRIGHT_MLS_LOGO_ALT for IDX-09 compliance

## Task Commits

Each task was committed atomically:

1. **Task 1: Install new dependencies + update env.example + next.config remotePatterns** - `decb5d1` (feat)
2. **Task 2: Create listings table migration + Listing types + MLS constants** - `1547ee2` (feat)
3. **Task 3: Push schema to Supabase** - no separate commit (migration applied via `supabase db reset` to local instance; migration file committed in Task 2)

## Files Created/Modified

- `supabase/migrations/20260413000001_create_listings.sql` - Full listings table schema with all IDX columns, 16 indexes, RLS
- `src/types/listing.ts` - Listing, ListingSummary, ListingStatus, PropertyType TypeScript exports
- `src/lib/constants/mls.ts` - MLS_ATTRIBUTION, FAIR_HOUSING_ALT, BRIGHT_MLS_LOGO_ALT for IDX-09 compliance
- `package.json` - 5 runtime deps + 1 dev dep added
- `package-lock.json` - Updated lock file
- `.env.example` - SimplyRETS, CRON_SECRET, Resend, Twilio, Google Maps env var documentation
- `next.config.ts` - SimplyRETS photo CDN remotePatterns + image/avif, image/webp formats

## Decisions Made

- Migration 02-01 uses `DROP TABLE IF EXISTS listings CASCADE` before `CREATE TABLE` because the Phase 1 placeholder used `uuid` PK and `text` mls_id — incompatible with the Phase 2 schema requiring `BIGINT GENERATED ALWAYS AS IDENTITY` PK and `INTEGER UNIQUE NOT NULL` mls_id.
- `listings_public_read` RLS policy is `SELECT USING (true)` — IDX requires public read access; all writes use server-side service role key (no client write policy).
- `open_house_date TIMESTAMPTZ` added to base schema now (not in Phase 1 placeholder) to satisfy plan 02-10 D-13 open-house trigger dependency.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added DROP TABLE before CREATE TABLE in migration**
- **Found during:** Task 2 (Create listings table migration)
- **Issue:** Phase 1 migration already created a `listings` table (placeholder with uuid PK, text mls_id). The new migration's `CREATE TABLE IF NOT EXISTS` would silently skip creation, leaving the incompatible placeholder table in place.
- **Fix:** Added `DROP TABLE IF EXISTS listings CASCADE` before `CREATE TABLE IF NOT EXISTS listings` in the migration file. Added SQL comment explaining why.
- **Files modified:** supabase/migrations/20260413000001_create_listings.sql
- **Verification:** `supabase db reset` applied both migrations; REST query `GET /rest/v1/listings?limit=1` returned `[]` confirming table exists with correct schema.
- **Committed in:** 1547ee2 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Required for correctness — without DROP, Phase 2 would query a table with wrong column types.

## Issues Encountered

- `supabase db push` failed with "Cannot find project ref. Have you run supabase link?" — the project uses local Supabase dev (127.0.0.1:54321) without a linked remote project. Used `supabase db reset` instead to apply all migrations to the local instance. Task 3 acceptance criteria (migration applied, table queryable) was fully satisfied.

## User Setup Required

None for this plan — all changes are local dev. When deploying to production Supabase, run `supabase db push` after linking the project with `supabase link --project-ref <ref>`.

## Next Phase Readiness

- Plan 02-02 (SimplyRETS sync cron) can proceed: listings table exists, Listing types defined, SIMPLYRETS_API_KEY/SECRET/VENDOR documented in .env.example
- Plan 02-03 through 02-11 all unblocked: listings table, types, and constants are the shared foundation
- Blocker remains: Schell Brothers broker must authorize IDX license before SimplyRETS API credentials can be obtained for production use

## Self-Check: PASSED

- supabase/migrations/20260413000001_create_listings.sql: FOUND
- src/types/listing.ts: FOUND
- src/lib/constants/mls.ts: FOUND
- .planning/phases/02-idx-listings-engine/02-01-SUMMARY.md: FOUND
- commit decb5d1 (Task 1): FOUND
- commit 1547ee2 (Task 2): FOUND

---
*Phase: 02-idx-listings-engine*
*Completed: 2026-04-14*
