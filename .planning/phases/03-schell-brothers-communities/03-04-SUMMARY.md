---
phase: 03-schell-brothers-communities
plan: "04"
subsystem: community-interactive-components
tags:
  - communities
  - mapbox
  - youtube-facade
  - lead-capture
  - listings
dependency_graph:
  requires:
    - 03-01 (Community type, CommunityWithListings)
    - 02-xx (ListingCard, ListingSummary, ContactAgentModal pattern, /api/leads route)
  provides:
    - CommunityVideos (YouTube facade + native video grid)
    - CommunityListings (live listings grid with communityId filter CTA)
    - CommunityMap (Mapbox POI map with school/restaurant markers)
    - ScheduleTourModal (tour lead capture form)
    - fetchNearbyPOI (server-side POI utility with Haversine distance)
  affects:
    - /communities/[slug]/page.tsx (RSC page composes these components)
tech_stack:
  added:
    - react-lite-youtube-embed (already installed; first use in this plan)
  patterns:
    - YouTube facade (click-to-load iframe, ~8KB vs ~500KB per video)
    - Server-side POI fetch passed as props to client map component
    - Honeypot spam prevention on lead form
    - Native date input with [color-scheme:dark] for dark theme
    - buttonVariants() for Link styled as button (base-ui Button lacks asChild)
key_files:
  created:
    - src/components/communities/community-videos.tsx
    - src/components/communities/community-listings.tsx
    - src/components/communities/community-map.tsx
    - src/components/communities/schedule-tour-modal.tsx
    - src/lib/mapbox/poi.ts
  modified: []
decisions:
  - "Native <input type='date'> used instead of shadcn Calendar: avoids react-day-picker dep, better mobile UX, matches dark theme with [color-scheme:dark]"
  - "buttonVariants() applied to Link for 'View All' CTA: base-ui Button does not support asChild prop unlike shadcn Button"
  - "Listing structural compatibility: Listing type satisfies ListingSummary structurally so ListingCard accepts it without casting"
metrics:
  duration: "3min"
  completed: "2026-04-17T20:21:40Z"
  tasks: 3
  files: 5
---

# Phase 03 Plan 04: Community Interactive Components Summary

**One-liner:** YouTube facade embeds, Mapbox POI map with school/restaurant markers, honeypot-protected tour lead form, and live listing grid — all wired to existing infrastructure.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | CommunityVideos + CommunityListings | 293505a | community-videos.tsx, community-listings.tsx |
| 2 | POI utility + CommunityMap | cfc918a | poi.ts, community-map.tsx |
| 3 | ScheduleTourModal | 0d710c7 | schedule-tour-modal.tsx |

## What Was Built

### CommunityVideos (`src/components/communities/community-videos.tsx`)
- Client component; returns `null` when both `youtubeVideoIds` and `customVideoUrls` are empty (section hidden — no "no videos" message)
- YouTube: `react-lite-youtube-embed` with `poster="maxresdefault"` — thumbnail loads immediately (~20KB), iframe with full YouTube JS (~500KB) loads only on user click
- YouTube embed title set to `"{communityName} — Schell Brothers Community Tour"` for accessibility
- Custom videos: native `<video controls preload="metadata">` with `aria-label` and `<source type="video/mp4">`
- Responsive 1-col / 2-col grid with rounded borders
- Wrapped in FadeIn scroll reveal

### CommunityListings (`src/components/communities/community-listings.tsx`)
- Client component accepting `Listing[]` (structurally compatible with `ListingSummary` consumed by `ListingCard`)
- Responsive 1/2/3-col grid via Tailwind; shows max 6 listings
- "View All N Homes" CTA links to `/listings?communityId={communityId}` using `buttonVariants({ variant: "outline" })` on a Next.js `Link` (base-ui Button lacks `asChild`)
- Empty state: "No Active Listings Right Now" heading + body + "Schedule a Tour" outline button calling `onScheduleTour` prop
- Count display: "{N} homes available" in font-bold tabular-nums
- Wrapped in FadeIn

### `fetchNearbyPOI` + `POIFeature` (`src/lib/mapbox/poi.ts`)
- Server-side utility (no "use client") — called from RSC page, results passed as props to client map
- Mapbox Search Box API: `https://api.mapbox.com/search/searchbox/v1/category/{school|restaurant}`
- `{ next: { revalidate: 86400 } }` for 24h ISR cache — communities change slowly
- Haversine formula calculates distance in miles, rounded to 1 decimal
- Graceful `try/catch` returns `[]` on any fetch error — map renders with just the center pin

### CommunityMap (`src/components/communities/community-map.tsx`)
- Client component with `import "mapbox-gl/dist/mapbox-gl.css"` per CLAUDE.md
- Dynamic import of `react-map-gl/mapbox` Map (SSR disabled)
- Mapbox dark-v11 style, centered on community lat/lng at zoom 13
- Gold community center pin: `MapPin` with `fill-accent stroke-background drop-shadow`, 44px hit target
- School markers: green circles (`bg-green-500/90`), `GraduationCap` 16px white icon, 44px hit target
- Restaurant markers: amber circles (`bg-amber-500/90`), `UtensilsCrossed` 16px white icon, 44px hit target
- Category filter pills: `aria-pressed`, toggleable, gold-outlined when active / muted when inactive
- "Nearby" pill rendered as disabled with `aria-disabled="true"` for future use
- Click-to-popup: `react-map-gl Popup` showing POI name (bold), category (Label 12px muted), distance (Label 12px muted)
- `NavigationControl` at bottom-right
- Map container: `h-[320px] md:h-[480px]` per UI-SPEC

### ScheduleTourModal (`src/components/communities/schedule-tour-modal.tsx`)
- Client component extending the `ContactAgentModal` pattern
- Zod `tourSchema`: name (required, max 100), email (required), phone (max 30, optional), preferred_date (optional string), message (max 2000, optional), honeypot (max 0, must be empty)
- Honeypot: `<input type="text" className="sr-only" tabIndex={-1} autoComplete="off" aria-hidden="true" />` — silently shows success on bot submissions without POSTing
- Native `<input type="date">` with `[color-scheme:dark]` class — avoids shadcn Calendar dep, better mobile native pickers
- `preferred_date` encoded into message: `"Preferred tour date: {date}\n{message}"`
- POSTs to `/api/leads` with `community_name`, `listing_url` (`/communities/{slug}`), `user_id`
- `useUser()` from `@clerk/nextjs` pre-fills name and email for authenticated users
- Success state: Framer Motion `scale: 0 → 1` checkmark (300ms), "Tour Requested" heading, green confirmation body
- Error state: inline `text-destructive` message + sonner toast
- All labels: 12px uppercase tracking-[0.05em] muted per UI-SPEC
- All inputs have associated `<label>`, `aria-required`, `aria-describedby` for validation errors

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] base-ui Button lacks asChild — used buttonVariants() on Link instead**
- **Found during:** Task 1 (CommunityListings)
- **Issue:** TypeScript error: `Property 'asChild' does not exist on type 'ButtonProps'` — the project uses `@base-ui/react/button` wrapped in a custom Button, not shadcn's Button. base-ui does not support the `asChild` pattern.
- **Fix:** Used `buttonVariants({ variant: "outline" })` (CVA function exported from button.tsx) applied as `className` directly on Next.js `Link` — achieves identical visual result
- **Files modified:** `src/components/communities/community-listings.tsx`
- **Commit:** 293505a

**2. [Rule 2 - Missing Critical Functionality] Native date input used instead of shadcn Calendar**
- **Found during:** Task 3 (ScheduleTourModal)
- **Issue:** UI-SPEC specified shadcn Calendar component, but plan notes explicitly override this — Calendar requires `react-day-picker` dep, worse mobile UX than native pickers, and shadcn Calendar not installed. Plan already documented the override rationale.
- **Fix:** Native `<input type="date">` with `[color-scheme:dark]` Tailwind utility — matches dark theme, zero new deps, superior mobile UX
- **Files modified:** `src/components/communities/schedule-tour-modal.tsx`
- **Commit:** 0d710c7

## Known Stubs

None — all components are fully wired. `CommunityVideos` returns `null` when video arrays are empty (expected behavior until agent populates YouTube IDs — not a stub, documented design decision). `CommunityListings` has a complete empty state. All empty/null states are explicit graceful renders.

## Threat Flags

No new trust boundaries introduced beyond those in the plan's threat model:
- T-03-09 (honeypot spam prevention): Implemented — `honeypot` field in Zod schema enforces max(0), silently succeeds
- T-03-10 (tour form input validation): Implemented — Zod validates all fields client-side before POST; server `/api/leads` re-validates with its own schema
- T-03-11 (Mapbox token): Accept — `NEXT_PUBLIC_MAPBOX_TOKEN` is public by design; POI fetch runs server-side in RSC (cleaner pattern)
- T-03-12 (YouTube injection): Mitigated — `react-lite-youtube-embed` accepts only video ID strings, no user-controlled URLs in iframe src

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/components/communities/community-videos.tsx | FOUND |
| src/components/communities/community-listings.tsx | FOUND |
| src/components/communities/community-map.tsx | FOUND |
| src/components/communities/schedule-tour-modal.tsx | FOUND |
| src/lib/mapbox/poi.ts | FOUND |
| Commit 293505a (Task 1) | FOUND |
| Commit cfc918a (Task 2) | FOUND |
| Commit 0d710c7 (Task 3) | FOUND |
