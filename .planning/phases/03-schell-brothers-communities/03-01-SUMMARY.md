---
plan: 03-01
phase: 03-schell-brothers-communities
status: completed
completed_at: 2026-04-17
---

## Summary

Foundation layer for Schell Brothers community pages: DB schema, multi-state Heartbeat client, TypeScript types, and Supabase query functions.

## What Was Built

- **supabase/migrations/20260416300000_create_communities.sql** — communities table with 30+ columns, 5 indexes (slug, state, is_active, division_id, community_id), RLS with public read + service_role write
- **src/lib/schell/client.ts** — extended with `SCHELL_DIVISIONS` (IDs 1-4), `fetchCommunitiesByDivision` (graceful error handling, discovery logging), `fetchAllStateCommunities` (sequential with 300ms delay)
- **src/types/community.ts** — `Community`, `CommunityWithListings`, `CommunityCardData` interfaces
- **src/lib/supabase/queries/communities.ts** — `getCommunityBySlug`, `getAllCommunities`, `getCommunityListings`, `getCommunityFloorPlanCount`
- **next.config.ts** — added `heartbeat-page-designer-production.s3.amazonaws.com`, `www.schellbrothers.com`, `schellbrothers.com` to remotePatterns
- **package.json** — added `react-lite-youtube-embed`, `@mapbox/search-js-react`

## Key Decisions

- Delaware division_id=1 is confirmed; IDs 2-4 assumed sequential and silently skipped if empty
- Heartbeat divisions log `[Heartbeat] division_parent_id=X: returned N communities` for discovery
- Listings linked to communities via `raw_data->>communityId` filter (Supabase JSONB)

## Self-Check: PASSED

- TypeScript compiles clean
- All required exports present
- RLS policies applied to communities table
