---
phase: "04"
plan: "01"
subsystem: mls-data-pipeline
tags: [simplyrets, sync, cron, delta, full, rate-limiting]
dependency_graph:
  requires: []
  provides: [working-sync-pipeline, delta-sync, full-sync, vercel-crons]
  affects: [listings-table, vercel-cron-schedule]
tech_stack:
  added: []
  patterns:
    - delta sync via modified timestamp comparison
    - full sync with stale listing closure
    - 250ms pagination rate-limit delay
key_files:
  created: []
  modified:
    - src/app/api/listings/sync/route.ts
    - src/lib/simplyrets/sync.ts
    - vercel.json
key_decisions:
  - "Default mode for sync route is delta (not full) — safer for frequent cron calls"
  - "changedMlsIds in delta mode only tracks actually-changed listings (not all fetched)"
  - "stale cleanup only runs in full mode — avoids incorrectly closing listings during delta"
metrics:
  duration: 2min
  completed: "2026-04-20"
  tasks_completed: 2
  files_modified: 3
---

# Phase 04 Plan 01: MLS Sync Pipeline Fix Summary

**One-liner:** Delta/full sync with modified-timestamp comparison, ComingSoon status, 250ms rate-limiting, and Vercel 15-min delta + 3am full crons — fixing the broken route that called `syncSchellListings`.

## What Was Built

The sync pipeline was broken: `src/app/api/listings/sync/route.ts` imported and called `syncSchellListings` from `@/lib/schell/sync` instead of `syncListings` from `@/lib/simplyrets/sync`. This meant the MLS listing sync never actually ran.

### Task 1: Rewired sync route + delta/full mode in syncListings

**src/app/api/listings/sync/route.ts:**
- Removed `syncSchellListings` import
- Added `import { syncListings } from "@/lib/simplyrets/sync"`
- Extracts `?mode=delta|full` from URL params (default: `delta`)
- Passes `{ mode }` to `syncListings`, returns mode in response body

**src/lib/simplyrets/sync.ts:**
- Signature: `syncListings(opts: { mode: "delta" | "full" } = { mode: "full" })`
- Added `"ComingSoon"` to status filter array
- Delta mode: queries existing `mls_id, modified` from DB, filters to only changed listings (new date > DB date), skips pages with zero changes
- Full mode: upserts all listings, then marks any non-Closed DB listing absent from API response as `Closed` (stale cleanup)
- 250ms `setTimeout` delay between every pagination request (rate-limit guard)
- Logging for both modes including total fetched vs upserted counts

### Task 2: Vercel cron schedules

**vercel.json:**
- Replaced single `0 3 * * *` cron with two entries:
  - `*/15 * * * *` → `/api/listings/sync?mode=delta`
  - `0 3 * * *` → `/api/listings/sync?mode=full`
- Kept `/api/communities/sync` at `0 2 * * *` unchanged

## Deviations from Plan

None — plan executed exactly as written.

## Threat Model Coverage

| Threat | Disposition | Status |
|--------|-------------|--------|
| T-04-01: Spoofing (CRON_SECRET) | mitigate | Bearer token check preserved in rewritten route |
| T-04-02: DoS (SimplyRETS rate limit) | mitigate | 250ms delay added between all pagination requests |
| T-04-03: Supabase service key elevation | accept | Service key used server-side only, no change |

## Known Stubs

None.

## Self-Check

Files created/modified:
- src/app/api/listings/sync/route.ts — modified
- src/lib/simplyrets/sync.ts — modified
- vercel.json — modified

Commits:
- 07ae6a1: feat(04-01): rewire sync route + add delta/full mode to syncListings
- 25c9a6a: chore(04-01): configure Vercel crons for 15-min delta + 3am full sync

## Self-Check: PASSED
