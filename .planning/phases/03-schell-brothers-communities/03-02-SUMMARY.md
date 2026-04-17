---
phase: 03-schell-brothers-communities
plan: "02"
subsystem: schell-sync
tags: [sync, cron, supabase, communities, heartbeat]
dependency_graph:
  requires: ["03-01"]
  provides: ["communities-sync-pipeline"]
  affects: ["communities-table", "vercel-crons"]
tech_stack:
  added: []
  patterns:
    - Supabase service-role upsert with batch chunking (50 rows per batch)
    - CRON_SECRET bearer token auth on sync route (401 on mismatch)
    - State-prefixed slug generation to prevent cross-state collisions
    - Stale-record deactivation pattern (mark is_active=false rather than delete)
key_files:
  created:
    - src/app/api/communities/sync/route.ts
  modified:
    - src/lib/schell/sync.ts
    - vercel.json
decisions:
  - "revalidateTag called with two args (revalidateTag tag, {}) matching existing codebase convention in sync.ts"
  - "Community sync runs at 2am UTC, 1 hour before listings sync at 3am — ensures communities table is fresh before floor-plan sync runs"
  - "syncSchellListings left entirely unchanged — communities sync is an additive export"
metrics:
  duration: "8min"
  completed: "2026-04-17"
  tasks: 2
  files: 3
requirements:
  - SCHELL-01
  - SCHELL-04
---

# Phase 03 Plan 02: Community Sync Pipeline Summary

**One-liner:** Nightly cron pipeline syncs all Schell Brothers communities from Heartbeat API across all state divisions into the Supabase communities table, with state-prefixed slugs and stale-record deactivation.

## What Was Built

### Task 1 — Extended sync.ts with syncCommunities()

Added `CommunitySyncResult` interface and `syncCommunities()` function to `src/lib/schell/sync.ts`, keeping `syncSchellListings` entirely unchanged.

Key behaviors:
- Calls `fetchAllStateCommunities()` (iterates all 4 SCHELL_DIVISIONS with 300ms delay)
- Filters communities missing `city` or `state` (incomplete Heartbeat records)
- Generates state-prefixed slugs: `de-cardinal-grove`, `md-amberleigh` — prevents slug collisions when communities share names across states
- Parses `priced_from` string (e.g. `"$450,000"`) to numeric `price_from` via regex strip of non-numeric chars
- Upserts in batches of 50 on `community_id` conflict
- Marks communities absent from the fetched set as `is_active: false` (soft-delete pattern)
- Calls `revalidateTag("communities", {})` after upsert; logs warn on failure rather than throwing

### Task 2 — Cron route + vercel.json schedule

Created `src/app/api/communities/sync/route.ts`:
- `GET` handler with `CRON_SECRET` bearer token validation (401 on mismatch, passes if `CRON_SECRET` env unset)
- `runtime = "nodejs"`, `maxDuration = 120` (multi-state sync can take 10-30s)
- Returns `{ ok: true, ...CommunitySyncResult }` on success, `{ error }` with 500 on failure
- Logs errors via `console.error` for Vercel function log visibility

Updated `vercel.json`:
- Added `/api/communities/sync` at `0 2 * * *` (2am UTC)
- Existing `/api/listings/sync` at `0 3 * * *` unchanged
- Communities sync intentionally runs 1 hour before listings sync

## Deviations from Plan

None — plan executed exactly as written. One minor adjustment: used `revalidateTag("communities", {})` (two-arg form) to match the existing convention already used in `syncSchellListings`, which avoids introducing a TypeScript error from the one-arg form.

## Threat Mitigations Applied

| Threat ID | Mitigation |
|-----------|-----------|
| T-03-04 | CRON_SECRET bearer validation in route.ts — returns 401 on mismatch |
| T-03-05 | All Heartbeat fields mapped to typed columns (TEXT, NUMERIC, BOOLEAN, JSONB); no raw HTML stored |
| T-03-06 | maxDuration=120 set; 300ms inter-request delay inherited from fetchAllStateCommunities |

## Known Stubs

None — syncCommunities is fully wired end-to-end. The communities table receives real data from the Heartbeat API. Video fields (youtube_video_ids, custom_video_urls) and SEO fields (seo_title, seo_description) are not populated by sync — these are editorial fields managed manually and addressed in a later plan.

## Self-Check

- [x] `src/lib/schell/sync.ts` modified and committed (5e5d911)
- [x] `src/app/api/communities/sync/route.ts` created and committed (eccb0cd)
- [x] `vercel.json` updated and committed (eccb0cd)
- [x] `npx tsc --noEmit` passes with 0 errors
- [x] `syncCommunities` and `CommunitySyncResult` exported from sync.ts
- [x] `syncSchellListings` unchanged
- [x] vercel.json has both cron entries
