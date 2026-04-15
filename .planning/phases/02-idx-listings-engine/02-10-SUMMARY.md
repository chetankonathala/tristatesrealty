---
phase: 02-idx-listings-engine
plan: 10
subsystem: api
tags: [resend, twilio, react-email, supabase, cron, notifications, saved-searches]

# Dependency graph
requires:
  - phase: 02-01
    provides: listings.open_house_date column for open_house trigger
  - phase: 02-02
    provides: transform.ts pickEarliestUpcomingOpenHouse populates open_house_date
  - phase: 02-09
    provides: saved_searches table, SavedSearch type, listAllActiveSavedSearches query
provides:
  - Resend email delivery: sendListingAlert wrapping Resend SDK with dark-themed React Email template
  - Twilio SMS delivery: sendListingAlertSms using raw REST API (no SDK)
  - Match-detection engine: runSavedSearchNotifications with all 4 D-13 triggers
  - Cron-protected notify route at /api/saved-searches/notify
  - Vercel cron schedule for both sync and notify jobs
affects: [phase-03, phase-04, buyer-accounts, agent-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Service-role Supabase client pattern for cron routes (no Next.js cookie context)
    - Sequential cron processing with per-search try/catch isolation
    - PII-safe logging (search.id only, never email/phone in logs)

key-files:
  created:
    - src/emails/listing-alert.tsx
    - src/lib/notifications/resend.ts
    - src/lib/notifications/twilio.ts
    - src/lib/saved-searches/match.ts
    - src/app/api/saved-searches/notify/route.ts
    - supabase/migrations/20260415114148_saved_searches_price_snapshot.sql
  modified:
    - vercel.json
    - src/types/saved-search.ts

key-decisions:
  - "Twilio uses raw fetch to Twilio REST API — no SDK to keep deps small"
  - "searchListingsService reimplemented with service-role client (cron has no Next.js cookie context)"
  - "open_house trigger: listing qualifies if open_house_date is non-null, within 7 days, and either unseen or scheduled after last_notified_at"
  - "price_drop trigger backed by last_seen_prices JSONB snapshot persisted per cycle"
  - "Cron processing is sequential per search with isolated try/catch — one failure doesn't halt the batch"
  - "PII-safe logging: only search.id logged on errors, never email or phone"

patterns-established:
  - "Service-role Supabase client for all cron/background routes (no cookie forwarding needed)"
  - "Sequential cron loop with per-item try/catch for fault isolation"
  - "Snapshot-based change detection: persist last_seen_mls_ids + last_seen_prices after each run"

requirements-completed: [IDX-10]

# Metrics
duration: 25min
completed: 2026-04-14
---

# Phase 02 Plan 10: Saved-Search Alert Delivery Pipeline Summary

**Resend email + Twilio SMS alert pipeline with 4-trigger match engine (new_listing, price_drop, status_pending, open_house) backed by real DB columns, cron-protected notify route, and Vercel cron schedule**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-04-14T17:20:00Z
- **Completed:** 2026-04-14T17:45:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- React Email template with dark theme (#0A0A0A bg, #C9A84C gold accent) rendering up to 6 listing cards per alert
- Resend SDK wrapper and raw Twilio REST sender honoring user email_alerts/sms_alerts preferences
- Full match-detection engine covering all 4 D-13 trigger events — none are stubs
- open_house trigger reads real `listings.open_house_date` column populated by plan 02-02 transform
- price_drop trigger compares current list_price against `last_seen_prices` JSONB snapshot persisted after each cycle
- Cron-protected route requires `Authorization: Bearer ${CRON_SECRET}` — 401 on miss (T-02-10-01 mitigated)
- Vercel cron schedule: sync every 15 min, notify offset at 5/20/35/50 min

## Task Commits

1. **Task 1: Resend client + React Email template + Twilio sender** - `383b8e6` (feat)
2. **Task 2: Match-detection logic + notify route + vercel.json cron schedule** - `07830a4` (feat)

## Files Created/Modified

- `src/emails/listing-alert.tsx` - Dark-themed React Email template with listing cards, manage/unsubscribe links, Equal Housing Opportunity footer
- `src/lib/notifications/resend.ts` - sendListingAlert wrapping Resend SDK
- `src/lib/notifications/twilio.ts` - sendListingAlertSms using raw Twilio REST API (no SDK)
- `src/lib/saved-searches/match.ts` - runSavedSearchNotifications with 4 D-13 triggers and service-role Supabase client
- `src/app/api/saved-searches/notify/route.ts` - CRON_SECRET-protected POST/GET route, maxDuration=300
- `vercel.json` - Added crons array with /api/listings/sync and /api/saved-searches/notify schedules
- `src/types/saved-search.ts` - Added last_seen_prices field
- `supabase/migrations/20260415114148_saved_searches_price_snapshot.sql` - Adds last_seen_prices JSONB column

## Decisions Made

- Twilio uses raw `fetch` to Twilio REST API — no SDK dependency needed, keeps bundle small
- `searchListingsService` is a service-role reimplementation of `searchListings` — the existing query function uses `createClient()` from `@/lib/supabase/server` which requires Next.js cookie context unavailable in cron routes
- open_house trigger: qualifies if `open_house_date` is non-null, within the next 7 days, AND either the listing was never seen before OR the open_house_date timestamp is newer than `last_notified_at`
- PII-safe logging: only `search.id` appears in console.error calls, never email address or phone number (T-02-10-02 mitigated)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added service-role Supabase search function for cron context**
- **Found during:** Task 2 (match-detection logic)
- **Issue:** `searchListings` in `listings.ts` calls `createClient()` from `@/lib/supabase/server` which uses `cookies()` — this throws in cron/background route context where no Next.js request is active
- **Fix:** Implemented `searchListingsService()` inline in `match.ts` using the service-role `createClient` from `@supabase/supabase-js`. Covers all the same filter fields, fetches Active + Pending + ActiveUnderContract statuses so status-change trigger can fire
- **Files modified:** `src/lib/saved-searches/match.ts`
- **Verification:** `npm run build` passes; route compiles and registers correctly

**2. [Rule 2 - Missing Critical] Added last_seen_prices migration and updated SavedSearch type**
- **Found during:** Task 2 (match-detection logic)
- **Issue:** Plan 02-09 migration (`20260413000002_create_saved_searches.sql`) included `last_seen_mls_ids` and `last_notified_at` but not `last_seen_prices JSONB`, which the price_drop trigger requires. SavedSearch type also missing the field.
- **Fix:** Created `supabase/migrations/20260415114148_saved_searches_price_snapshot.sql` with `ADD COLUMN IF NOT EXISTS` for `last_seen_prices`, `last_seen_mls_ids`, and `last_notified_at` (idempotent). Added `last_seen_prices: Record<string, number> | null` to `SavedSearch` type.
- **Files modified:** `supabase/migrations/20260415114148_saved_searches_price_snapshot.sql`, `src/types/saved-search.ts`
- **Verification:** TypeScript passes; build passes

---

**Total deviations:** 2 auto-fixed (both Rule 2 — missing critical functionality)
**Impact on plan:** Both fixes are necessary for correct operation. No scope creep — the service-role search function is a direct equivalent of the existing one adapted for the cron context.

## Issues Encountered

None beyond the two deviations documented above.

## User Setup Required

The following environment variables must be configured for the alert pipeline to function:

- `RESEND_API_KEY` — Resend dashboard API key
- `RESEND_FROM_EMAIL` — Verified sender address (defaults to `alerts@tristatesrealty.com`)
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` — Twilio credentials (SMS silently skipped if absent)
- `CRON_SECRET` — Bearer token Vercel passes to cron routes; set in Vercel project settings

Run `npx supabase db push` to apply the `last_seen_prices` migration to the remote database.

## Next Phase Readiness

- Alert delivery pipeline complete — IDX-10 fully delivered
- Cron schedule registered in `vercel.json`; will activate on next Vercel deploy
- `runSavedSearchNotifications` is the integration point; can be tested manually by calling `POST /api/saved-searches/notify` with `Authorization: Bearer <CRON_SECRET>`
- Phase 03 (Schell Brothers Communities) has no dependency on this plan

## Threat Flags

No new threat surface beyond what was modeled in the plan's threat register. All T-02-10-0x threats addressed:
- T-02-10-01: CRON_SECRET bearer check implemented (401 on miss)
- T-02-10-02: PII-safe logging (search.id only in all console.error calls)
- T-02-10-03: search.name escaped by React Email JSX; no raw HTML injection path
- T-02-10-05: Sequential try/catch per search; failures don't halt the batch

---
*Phase: 02-idx-listings-engine*
*Completed: 2026-04-14*
