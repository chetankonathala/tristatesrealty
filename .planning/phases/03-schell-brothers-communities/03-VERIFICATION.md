---
phase: 03-schell-brothers-communities
verified: 2026-04-17T22:00:00Z
status: passed
score: 18/18 must-haves verified
gaps: []
deferred: []
human_verification: []
---

# Phase 3: Schell Brothers Communities — Verification Report

**Phase Goal:** Full Schell Brothers community pages — index page with state filter, detail pages with all sections (hero, overview, amenities, schools, HOA, floor plans, videos, map with POI, schedule tour modal), community sync pipeline from Heartbeat API, SEO (JSON-LD, OG images, sitemap), DB schema live in production.
**Verified:** 2026-04-17T22:00:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | Communities table exists in Supabase with all required columns | VERIFIED | `supabase/migrations/20260416300000_create_communities.sql` — 30+ columns, 5 indexes, RLS with public read + service_role write. SUMMARY confirms `supabase db push` applied, 40 communities upserted. |
| 2  | Heartbeat client fetches multi-state communities with graceful error handling | VERIFIED | `src/lib/schell/client.ts` exports `SCHELL_DIVISIONS` (keys 1-4), `fetchCommunitiesByDivision` (try/catch, `Array.isArray` guard, discovery logging), `fetchAllStateCommunities`. Existing `fetchDelawareCommunities` and `fetchFloorPlans` intact. |
| 3  | Community TypeScript types exist for page rendering | VERIFIED | `src/types/community.ts` exports `Community`, `CommunityWithListings`, `CommunityCardData` with correct shape. |
| 4  | Query functions exist to read communities by slug and list all | VERIFIED | `src/lib/supabase/queries/communities.ts` exports `getCommunityBySlug`, `getAllCommunities`, `getCommunityListings`, `getCommunityFloorPlanCount`. All query against `communities` table via Supabase. |
| 5  | Schell Brothers S3 image domain is whitelisted in next.config.ts | VERIFIED | `next.config.ts` contains `heartbeat-page-designer-production.s3.amazonaws.com`, `www.schellbrothers.com`, `schellbrothers.com` in `remotePatterns`. |
| 6  | Nightly cron syncs all Schell Brothers communities into DB | VERIFIED | `src/lib/schell/sync.ts` exports `syncCommunities` with `CommunitySyncResult`; calls `fetchAllStateCommunities`, upserts batches of 50 on `community_id`, marks stale as `is_active: false`, calls `revalidateTag("communities", {})`. `syncSchellListings` is untouched. |
| 7  | Community sync cron route is auth-protected and scheduled nightly | VERIFIED | `src/app/api/communities/sync/route.ts` exports `GET` with `CRON_SECRET` bearer validation, `runtime = "nodejs"`, `maxDuration = 120`. `vercel.json` has both `/api/communities/sync` (`0 2 * * *`) and `/api/listings/sync` (`0 3 * * *`). |
| 8  | CommunityHero renders video/image hero with gradient, name, price, CTA | VERIFIED | `community-hero.tsx`: `"use client"`, `next/image` with `priority` + `fill`, gradient `rgba(10,10,10,0.85)`, `Intl.NumberFormat` price, "SOLD OUT" badge, "Join Waitlist" / "Schedule a Tour" CTA, Framer Motion stagger, reduced-motion guard. |
| 9  | CommunityOverview renders description with read-more and sales center card | VERIFIED | `community-overview.tsx`: `"use client"`, 500-char truncation threshold, "Read more" / "Show less" toggle, Google Maps directions link when `sales_center_address` is truthy. |
| 10 | CommunityAmenities renders icon grid; returns null when empty | VERIFIED | `community-amenities.tsx`: server component, returns `null` when empty, Lucide icon map (Waves/Dumbbell/Baby/Building/TreePine/CircleDot/Dog/Check), 4-col grid, `StaggerChildren`. |
| 11 | CommunitySchools/Hoa/FloorPlans render with proper empty states | VERIFIED | Schools: `article` elements with `aria-label`, green left border, returns null when all fields null. HOA: 3-col grid, zero-fee message, returns null when all null. FloorPlans: `"use client"`, `schellbrothers.com` prefixed links, `target="_blank" rel="noopener"`, StaggerChildren, empty state message. |
| 12 | YouTube videos render as facade thumbnails (click-to-load iframe) | VERIFIED | `community-videos.tsx`: `"use client"`, imports `react-lite-youtube-embed` and its CSS, `poster="maxresdefault"`, returns `null` when both arrays empty, native `<video>` for custom URLs. |
| 13 | Community map shows gold center pin with POI markers; tour modal captures leads | VERIFIED | `community-map.tsx`: `"use client"`, `import "mapbox-gl/dist/mapbox-gl.css"`, dynamic import of Map, `MapPin` (gold), `GraduationCap` (green), `UtensilsCrossed` (amber), category filter pills (`aria-pressed`), `Popup`, `NavigationControl`. `schedule-tour-modal.tsx`: zodResolver, honeypot field (`sr-only`, `aria-hidden`), POSTs to `/api/leads`, `useUser()` pre-fill, success state, error state. |
| 14 | POI data fetched server-side and passed as props to client map | VERIFIED | `src/lib/mapbox/poi.ts`: server-side, Mapbox Search Box API, Haversine distance, `{ next: { revalidate: 86400 } }`, empty-array fallback. Page RSC fetches in `Promise.all` and passes `schools`/`restaurants` to `CommunityPageClient`. |
| 15 | Community index page lists all active communities with state filter | VERIFIED | `src/app/communities/page.tsx`: RSC, `getAllCommunities({ activeOnly: true })`, `revalidate = 86400`, renders `CommunityIndexHero` + `CommunityIndexClient`. `CommunityStateFilter`: `role="radiogroup"`, `aria-label="Filter by state"`, `aria-checked`. `CommunityIndexGrid`: filters by state, renders `CommunityCard`, sold-out grayscale + badge, empty state. |
| 16 | Community detail page renders all sections at /communities/[slug] | VERIFIED | `src/app/communities/[slug]/page.tsx`: RSC, `generateStaticParams` (try/catch empty fallback), `generateMetadata` (seo_title/description fallback), `revalidate = 86400`, `dynamicParams = true`, `notFound()` when null, parallel `Promise.all` fetch, passes all props to `CommunityPageClient`. Client assembles: Hero → Overview → Amenities → FloorPlans → Videos → Schools → HOA → Listings (with `communityId`) → Map → Tour CTA Banner → JSON-LD → ScheduleTourModal. |
| 17 | SEO: JSON-LD, OG images, and sitemap include community pages | VERIFIED | `community-json-ld.tsx`: `@type: "Residence"`, `< → \u003c` XSS escape. `opengraph-image.tsx`: `runtime = "edge"`, `size = { width: 1200, height: 630 }`, featured image + overlay + 72px name + gold (#c49a3c) + location + price. `sitemap.ts`: static pages + dynamic community URLs from `getAllCommunities`, try/catch for build-time DB unavailability. |
| 18 | DB schema live in production; 40 communities synced | VERIFIED | SUMMARY-05 confirms: `supabase db push` applied migration, sync confirmed 40 communities upserted with 0 errors. UAT passed all 10 criteria including sitemap.xml, JSON-LD in source, and modal form submission. |

**Score:** 18/18 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/20260416300000_create_communities.sql` | Communities table schema with RLS | VERIFIED | CREATE TABLE, 5 indexes, RLS public read + service_role write |
| `src/lib/schell/client.ts` | Multi-state Heartbeat client | VERIFIED | Exports `SCHELL_DIVISIONS`, `fetchCommunitiesByDivision`, `fetchAllStateCommunities`, existing functions preserved |
| `src/types/community.ts` | Community TypeScript types | VERIFIED | Exports `Community`, `CommunityWithListings`, `CommunityCardData` |
| `src/lib/supabase/queries/communities.ts` | Community database queries | VERIFIED | Exports `getCommunityBySlug`, `getAllCommunities`, `getCommunityListings`, `getCommunityFloorPlanCount` |
| `src/lib/schell/sync.ts` | Extended sync with community upsert | VERIFIED | Exports `syncCommunities`, `CommunitySyncResult`; `syncSchellListings` unchanged |
| `src/app/api/communities/sync/route.ts` | Cron endpoint for community sync | VERIFIED | GET with CRON_SECRET auth, nodejs runtime, maxDuration=120 |
| `vercel.json` | Nightly cron schedule | VERIFIED | `/api/communities/sync` at `0 2 * * *` |
| `src/components/communities/community-hero.tsx` | Full-bleed hero with video/image + CTA | VERIFIED | "use client", next/image priority+fill, gradient, Intl.NumberFormat, sold-out badge, Framer Motion stagger |
| `src/components/communities/community-overview.tsx` | Description with read-more | VERIFIED | "use client", 500-char truncation, sales center card, Google Maps link |
| `src/components/communities/community-amenities.tsx` | Amenities grid with icons | VERIFIED | Returns null when empty, 8-icon Lucide map, 4-col grid, StaggerChildren |
| `src/components/communities/community-schools.tsx` | School info cards | VERIFIED | article elements with aria-label, green left border, null when all fields null |
| `src/components/communities/community-hoa.tsx` | HOA info display | VERIFIED | 3-col grid, zero-fee message, null when all fields null |
| `src/components/communities/community-floor-plans.tsx` | Floor plan card grid | VERIFIED | "use client", schellbrothers.com prefixed links, StaggerChildren, empty state |
| `src/components/communities/community-videos.tsx` | YouTube facade + custom video | VERIFIED | "use client", LiteYouTubeEmbed with CSS, native video, null when empty |
| `src/components/communities/community-map.tsx` | Mapbox map with POI markers | VERIFIED | "use client", mapbox CSS, dynamic import, gold/green/amber markers, filter pills, Popup, NavigationControl |
| `src/components/communities/schedule-tour-modal.tsx` | Tour booking form modal | VERIFIED | zodResolver, honeypot (sr-only, aria-hidden), POST to /api/leads, useUser() pre-fill, success + error states |
| `src/lib/mapbox/poi.ts` | Server-side POI fetch | VERIFIED | Exports `fetchNearbyPOI`, `POIFeature`; Mapbox Search Box API; Haversine; 24h ISR cache; graceful fallback |
| `src/components/communities/community-listings.tsx` | Live community listings grid | VERIFIED | "use client", ListingCard reuse, communityId-based "View All" link, max 6 listings, empty state with Schedule Tour CTA |
| `src/app/communities/page.tsx` | Community index page | VERIFIED | RSC, getAllCommunities, revalidate=86400, CommunityIndexHero + CommunityIndexClient |
| `src/app/communities/[slug]/page.tsx` | Community detail page with ISR | VERIFIED | generateStaticParams (try/catch), generateMetadata, revalidate=86400, dynamicParams=true, parallel fetch, notFound() |
| `src/app/communities/[slug]/loading.tsx` | Loading skeleton | VERIFIED | Skeleton layout matching hero + content sections |
| `src/app/communities/[slug]/not-found.tsx` | Not-found page | VERIFIED | "Community Not Found" heading, link back to /communities |
| `src/app/communities/[slug]/opengraph-image.tsx` | Dynamic OG image | VERIFIED | runtime="edge", size {1200,630}, featured image + overlay + gold (#c49a3c) wordmark/price |
| `src/components/communities/community-json-ld.tsx` | JSON-LD structured data | VERIFIED | @type Residence, GeoCoordinates, Offer, XSS escape (\u003c) |
| `src/app/sitemap.ts` | Sitemap with community URLs | VERIFIED | Static pages + dynamic community URLs, try/catch for build-time DB unavailability |
| `src/components/communities/community-state-filter.tsx` | State filter pills | VERIFIED | "use client", role="radiogroup", aria-label="Filter by state", aria-checked, mobile scroll |
| `src/components/communities/community-index-grid.tsx` | Community index grid | VERIFIED | CommunityCard reuse, state filter, sold-out grayscale + badge, empty state per state |
| `src/components/communities/community-index-hero.tsx` | Index page hero | VERIFIED | "Schell Brothers Communities" heading, muted subheading |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `queries/communities.ts` | `communities` table | Supabase `.from("communities")` | WIRED | `.from("communities").select(...)` confirmed in file |
| `src/lib/schell/client.ts` | Heartbeat API | `fetchCommunitiesByDivision` | WIRED | `heartbeatGet` with `division_parent_id` param confirmed |
| `sync.ts` | `communities` table | Supabase upsert | WIRED | `.from("communities").upsert(batch, { onConflict: "community_id" })` confirmed |
| `api/communities/sync/route.ts` | `sync.ts` | `syncCommunities()` call | WIRED | `import { syncCommunities } from "@/lib/schell/sync"` + `await syncCommunities()` confirmed |
| `vercel.json` | `/api/communities/sync` | cron schedule | WIRED | `"path": "/api/communities/sync", "schedule": "0 2 * * *"` confirmed |
| `schedule-tour-modal.tsx` | `/api/leads` | `fetch` POST | WIRED | `fetch("/api/leads", { method: "POST", ... })` confirmed |
| `community-map.tsx` | `src/lib/mapbox/poi.ts` | POIFeature props from RSC | WIRED | `import type { POIFeature }`, props typed and consumed; RSC page passes `schools`/`restaurants` |
| `community-listings.tsx` | `listing-card.tsx` | `ListingCard` reuse | WIRED | `import { ListingCard }` + `<ListingCard key={listing.mls_id} listing={listing} />` confirmed |
| `[slug]/page.tsx` | `queries/communities.ts` | `getCommunityBySlug` + `getCommunityListings` | WIRED | Both imports and calls confirmed in page.tsx |
| `[slug]/page.tsx` | `src/lib/mapbox/poi.ts` | `fetchNearbyPOI` server-side | WIRED | `import { fetchNearbyPOI }` + `Promise.all` call confirmed |
| `sitemap.ts` | `queries/communities.ts` | `getAllCommunities` for URLs | WIRED | `import { getAllCommunities }` + call confirmed in sitemap.ts |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `communities/page.tsx` | `communities` | `getAllCommunities({ activeOnly: true })` → Supabase `communities` table | Yes — real DB query with `is_active` filter, order by sold_out + name | FLOWING |
| `[slug]/page.tsx` | `community`, `listings`, `schools`, `restaurants` | `getCommunityBySlug` (Supabase), `getCommunityListings` (Supabase), `fetchNearbyPOI` (Mapbox API, 24h ISR) | Yes — all four sources produce live data | FLOWING |
| `syncCommunities` | `allCommunities` rows | `fetchAllStateCommunities()` → Heartbeat API → upsert to Supabase | Yes — 40 communities confirmed upserted in production | FLOWING |

### Behavioral Spot-Checks

| Behavior | Evidence | Status |
|----------|----------|--------|
| Index page queries Supabase for active communities | `getAllCommunities({ activeOnly: true })` with `is_active` filter, wrapped in try/catch | PASS |
| Detail page parallel-fetches community + listings + POI | `Promise.all([getCommunityListings, fetchNearbyPOI school, fetchNearbyPOI restaurant])` | PASS |
| Tour modal POSTs lead to `/api/leads` with community context | `fetch("/api/leads", { method: "POST" })` with `community_name`, `listing_url`, `user_id` | PASS |
| Sync upserts on `community_id` conflict | `.upsert(batch, { onConflict: "community_id" })` | PASS |
| Sitemap includes community URLs dynamically | `getAllCommunities` called in sitemap, try/catch fallback confirmed | PASS |
| OG image renders at edge runtime | `export const runtime = "edge"` + `ImageResponse` with community data | PASS |
| UAT (user visual approval) | User confirmed: 40 communities synced, index with state filter, all sections visible, tour modal works, sitemap confirmed | PASS |

### Requirements Coverage

| Requirement | Plans | Status | Evidence |
|-------------|-------|--------|----------|
| SCHELL-01 | 03-01, 03-02, 03-05 | SATISFIED | DB schema + sync pipeline + query functions + index page |
| SCHELL-02 | 03-01, 03-03, 03-05 | SATISFIED | Community types + all 6 detail section components + detail page assembly |
| SCHELL-03 | 03-04, 03-05 | SATISFIED | YouTube facade (LiteYouTubeEmbed) + CommunityVideos |
| SCHELL-04 | 03-02, 03-04 | SATISFIED | CommunityMap + fetchNearbyPOI + sync pipeline ISR revalidation |
| SCHELL-05 | 03-04, 03-05 | SATISFIED | ScheduleTourModal + POST to /api/leads |
| SCHELL-06 | 03-05 | SATISFIED | JSON-LD Residence schema + OG images + generateMetadata + sitemap |
| SCHELL-07 | 03-04, 03-05 | SATISFIED | CommunityListings with ListingCard reuse + communityId "View All" link |

### Anti-Patterns Found

| File | Pattern | Severity | Assessment |
|------|---------|----------|------------|
| `community-floor-plans.tsx` line 40-43 | `planUrl` has dual `undefined` branches (both `raw.floorPlanUrl` absent paths return `undefined`) | Info | Non-breaking dead code; card link falls back gracefully to no-href. Not a rendering stub. |
| `community-listings.tsx` line 20 | `communitySlug: _communitySlug` parameter unused (prefixed with `_`) | Info | Parameter accepted for API surface consistency but unused in rendered output. Not a stub. |

No blockers, no stubs, no placeholder anti-patterns found. All empty states are explicit design decisions (return null for sections with no data, graceful fallback messages for listings).

### Human Verification Required

None. User UAT performed and approved per SUMMARY-05:

> UAT passed all 10 verification criteria: index page, detail page sections, tour modal, tour form submission, Mapbox POI markers, YouTube facade (where IDs populated), sitemap.xml, JSON-LD source, and mobile performance.

### Gaps Summary

No gaps. All 18 observable truths are verified against the actual codebase. Every artifact exists, is substantive (not a stub or placeholder), is properly wired to its data sources, and produces real data. The DB schema is confirmed live in production with 40 communities. The UAT note from the user confirms visual approval of all community page sections, state filter, tour modal, and sitemap.

---

_Verified: 2026-04-17T22:00:00Z_
_Verifier: Claude (gsd-verifier)_
