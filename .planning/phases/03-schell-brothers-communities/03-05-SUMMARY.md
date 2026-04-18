---
phase: 03-schell-brothers-communities
plan: "05"
subsystem: community-pages
tags:
  - communities
  - next-js-app-router
  - seo
  - json-ld
  - open-graph
  - sitemap
  - supabase
  - isr
dependency_graph:
  requires:
    - 03-01 (Community types, sync pipeline, Supabase communities table, queries)
    - 03-02 (CommunityCard, community-index hero design, state filter spec)
    - 03-03 (CommunityHero, CommunityOverview, CommunityAmenities, CommunitySchools, CommunityHoa, CommunityFloorPlans)
    - 03-04 (CommunityVideos, CommunityListings, CommunityMap, ScheduleTourModal, fetchNearbyPOI)
  provides:
    - /communities index page with state filter (ISR 24hr)
    - /communities/[slug] detail page assembling all 6 section components + map + tour CTA (ISR 24hr)
    - Dynamic OG image generation at /communities/[slug]/opengraph-image
    - CommunityJsonLd schema.org Residence structured data
    - Sitemap with all community URLs + static pages
    - loading.tsx skeleton + not-found.tsx for community routes
    - CommunityPageClient (client wrapper managing ScheduleTourModal state)
    - CommunityIndexClient (client wrapper managing state filter)
  affects:
    - Phase 04 (Buyer Accounts) — tour lead capture pipeline already wired (/api/leads)
    - Phase 10 (SEO & Performance) — JSON-LD, OG, and sitemap infrastructure in place
tech_stack:
  added:
    - "@vercel/og (ImageResponse) — dynamic OG image generation at edge runtime"
  patterns:
    - "ISR with revalidate=86400 + dynamicParams=true for community detail pages"
    - "generateStaticParams with try/catch empty-array fallback for build-time DB unavailability"
    - "Server-fetched POI passed as props to client map component (no client-side token exposure)"
    - "JSON-LD XSS escape: JSON.stringify().replace(/</g, '\\u003c') before dangerouslySetInnerHTML"
    - "CommunityPageClient pattern: thin 'use client' wrapper managing modal state, all data fetching stays in RSC"
    - "OG image uses hex color (#c49a3c) not OKLCH — Satori does not support OKLCH"
key_files:
  created:
    - src/app/communities/page.tsx
    - src/app/communities/[slug]/page.tsx
    - src/app/communities/[slug]/loading.tsx
    - src/app/communities/[slug]/not-found.tsx
    - src/app/communities/[slug]/opengraph-image.tsx
    - src/components/communities/community-json-ld.tsx
    - src/components/communities/community-index-hero.tsx
    - src/components/communities/community-state-filter.tsx
    - src/components/communities/community-index-grid.tsx
    - src/components/communities/community-index-client.tsx
    - src/components/communities/community-page-client.tsx
    - supabase/migrations/20260416300000_create_communities.sql
  modified:
    - src/app/sitemap.ts
key_decisions:
  - "CommunityPageClient wraps the entire detail page body to isolate 'use client' boundary — RSC page.tsx remains a pure server component"
  - "OG image uses hex #c49a3c (gold) instead of OKLCH token — Satori renderer does not support OKLCH color space"
  - "dynamicParams=true ensures communities added after build (via sync cron) are served via on-demand ISR without requiring a full redeploy"
  - "supabase db push confirmed: 40 communities upserted, 0 errors — communities table live in production"
  - "sitemap.ts uses try/catch so build succeeds even when Supabase is unreachable at build time"
patterns-established:
  - "ISR pattern for community/listing detail pages: revalidate=86400, dynamicParams=true, generateStaticParams with empty-array fallback"
  - "JSON-LD XSS prevention: replace /</g with \\u003c before dangerouslySetInnerHTML"
  - "OG image edge function: community brand image + overlay + gold price/wordmark"
requirements-completed:
  - SCHELL-01
  - SCHELL-02
  - SCHELL-03
  - SCHELL-04
  - SCHELL-05
  - SCHELL-06
  - SCHELL-07
duration: ~90min (includes supabase db push checkpoint + UAT)
completed: "2026-04-17"
---

# Phase 03 Plan 05: Final Assembly — Community Pages & SEO Summary

**Complete Schell Brothers community presence: index page with state filter, ISR detail pages wiring all 6 section components, dynamic OG images, JSON-LD Residence schema, sitemap, and 40 communities live in production Supabase.**

## Performance

- **Duration:** ~90 min (including supabase db push checkpoint + Phase 3 UAT)
- **Started:** 2026-04-17
- **Completed:** 2026-04-17
- **Tasks:** 4 (Task 0: DB push [checkpoint], Task 1: Index components, Task 2: Detail page, Task 3: OG + sitemap + build, Task 4: UAT [checkpoint])
- **Files modified:** 13

## Accomplishments

- Delivered complete `/communities` route group: index with state filter + detail pages for all 40 Schell Brothers communities
- SEO layer complete: `generateMetadata`, `CommunityJsonLd` (schema.org Residence), dynamic OG images at edge, sitemap with 40+ community URLs
- Production database live: `supabase db push` applied `20260416300000_create_communities.sql`; sync confirmed 40 communities upserted with 0 errors
- Build verified at 175 pages with 0 TypeScript or compilation errors
- UAT passed: tour modal opens correctly, Mapbox map renders with POI markers, index state filter works, JSON-LD present in page source

## Task Commits

| Task | Name | Commit | Type |
|------|------|--------|------|
| 1 | Community index page components + JSON-LD | `39098e9` | feat |
| 2 | Community detail page assembly | `279060e` | feat |
| 3 | OG image + sitemap + build verification | `65fb7b0` | feat |

## Files Created/Modified

- `src/app/communities/page.tsx` — Index RSC: getAllCommunities, metadata, CommunityIndexClient, revalidate=86400
- `src/app/communities/[slug]/page.tsx` — Detail RSC: generateStaticParams, generateMetadata, parallel data fetch (community + listings + POI), all section components, ISR 24hr
- `src/app/communities/[slug]/loading.tsx` — Skeleton layout matching detail page sections
- `src/app/communities/[slug]/not-found.tsx` — "Community Not Found" page with link back to /communities
- `src/app/communities/[slug]/opengraph-image.tsx` — Edge OG image: featured image + overlay + 72px community name + gold (#c49a3c) price + wordmark
- `src/components/communities/community-json-ld.tsx` — schema.org Residence JSON-LD with XSS escape (\u003c), optional GeoCoordinates and Offer
- `src/components/communities/community-index-hero.tsx` — "Schell Brothers Communities" hero, font-display, muted subheading
- `src/components/communities/community-state-filter.tsx` — State filter pills with role="radiogroup" aria-label, aria-checked, mobile scroll
- `src/components/communities/community-index-grid.tsx` — CommunityCard grid 1/2/3-col, sold-out grayscale + badge, empty state per state
- `src/components/communities/community-index-client.tsx` — "use client" wrapper managing filter state; passes onFilterChange to StateFilter, passes filter to IndexGrid
- `src/components/communities/community-page-client.tsx` — "use client" wrapper managing tourModalOpen; passes onScheduleTour to CommunityHero and CommunityListings; renders ScheduleTourModal
- `src/app/sitemap.ts` — Static pages + dynamic community URLs; try/catch for DB unavailability
- `supabase/migrations/20260416300000_create_communities.sql` — Communities table pushed to production

## Decisions Made

- **CommunityPageClient isolation:** The detail page is an RSC that passes all fetched data to a `"use client"` wrapper. This keeps all data fetching server-side while isolating modal state (tourModalOpen) in a thin client layer — follows the same pattern as ContactAgentModal in Phase 2 listings.
- **OG image color:** Used hex `#c49a3c` instead of OKLCH gold token. Satori (the renderer powering `@vercel/og`) does not support modern color functions. The hex value is the perceptual equivalent of `oklch(0.735 0.115 80)`.
- **dynamicParams = true:** New communities synced after the last build (via the 2am UTC cron) are served on-demand via ISR without requiring a full Vercel redeploy. The 24hr `revalidate` ensures stale data is refreshed.
- **sitemap try/catch:** Supabase is not guaranteed to be reachable during Vercel build time (cold start, env vars not yet injected). The try/catch ensures the static build succeeds with just the static entries; community URLs are added once the runtime is available.

## Deviations from Plan

None — plan executed exactly as written. The `supabase db push` checkpoint and Phase 3 UAT checkpoint were both completed successfully by the user and approved.

## Issues Encountered

None — all three code tasks passed TypeScript checks and build verification on first attempt. UAT passed on all 10 verification criteria: index page, detail page sections, tour modal, tour form submission, Mapbox POI markers, YouTube facade (where IDs populated), sitemap.xml, JSON-LD source, and mobile performance.

## Threat Mitigations Applied

| Threat ID | Status | Detail |
|-----------|--------|--------|
| T-03-13 | Mitigated | `CommunityJsonLd` escapes `<` as `\u003c` via `JSON.stringify().replace(/</g, "\\u003c")` — same XSS prevention pattern as Phase 2 `ListingJsonLd` |
| T-03-14 | Accepted | OG images expose only public community data (name, location, price) — already visible on page |
| T-03-15 | Mitigated | `generateStaticParams` returns `[]` on any error; `dynamicParams=true` handles missing pre-built pages; ISR 24hr limits rebuild storm |
| T-03-16 | Mitigated | Community slugs are generated from trusted Heartbeat sync data with state prefix; no user-controlled slug input |

## Known Stubs

None — all data paths are live. Community index and detail pages query production Supabase. Sync confirmed 40 communities upserted. Tour modal POSTs to `/api/leads` which was wired in Phase 2.

## Self-Check

| Item | Status |
|------|--------|
| src/app/communities/page.tsx | CONFIRMED (commit 39098e9) |
| src/app/communities/[slug]/page.tsx | CONFIRMED (commit 279060e) |
| src/app/communities/[slug]/loading.tsx | CONFIRMED (commit 279060e) |
| src/app/communities/[slug]/not-found.tsx | CONFIRMED (commit 279060e) |
| src/app/communities/[slug]/opengraph-image.tsx | CONFIRMED (commit 65fb7b0) |
| src/components/communities/community-json-ld.tsx | CONFIRMED (commit 39098e9) |
| src/components/communities/community-index-hero.tsx | CONFIRMED (commit 39098e9) |
| src/components/communities/community-state-filter.tsx | CONFIRMED (commit 39098e9) |
| src/components/communities/community-index-grid.tsx | CONFIRMED (commit 39098e9) |
| src/app/sitemap.ts | CONFIRMED (commit 65fb7b0) |
| Production DB push (40 communities) | CONFIRMED (user checkpoint) |
| UAT all 10 criteria | CONFIRMED (user approved) |
| npm run build 175 pages 0 errors | CONFIRMED (commit 65fb7b0) |
| Commit 39098e9 | FOUND |
| Commit 279060e | FOUND |
| Commit 65fb7b0 | FOUND |

## Self-Check: PASSED

## Next Phase Readiness

Phase 3 (Schell Brothers Communities) is complete. All 40 community pages are live with:
- Full SEO infrastructure (metadata, JSON-LD, OG images, sitemap)
- Live listings integration via `/api/listings?communityId={id}`
- Tour lead capture via `/api/leads`
- Interactive Mapbox maps with POI

Ready to proceed to Phase 04: Buyer Accounts & AI Recommendations.

---
*Phase: 03-schell-brothers-communities*
*Completed: 2026-04-17*
