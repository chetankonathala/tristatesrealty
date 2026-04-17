---
phase: 03-schell-brothers-communities
plan: "03"
subsystem: community-detail-components
tags: [communities, components, hero, amenities, schools, hoa, floor-plans, framer-motion]
dependency_graph:
  requires: ["03-01"]
  provides: [community-hero, community-overview, community-amenities, community-schools, community-hoa, community-floor-plans]
  affects: [community-detail-page]
tech_stack:
  added: []
  patterns: [framer-motion-viewport-stagger, next-image-fill, read-more-toggle, external-link-prefixing]
key_files:
  created:
    - src/components/communities/community-hero.tsx
    - src/components/communities/community-overview.tsx
    - src/components/communities/community-amenities.tsx
    - src/components/communities/community-schools.tsx
    - src/components/communities/community-hoa.tsx
    - src/components/communities/community-floor-plans.tsx
  modified: []
decisions:
  - "Used Framer Motion Easing type assertion to satisfy framer-motion v12 strict type for ease property"
  - "CommunityOverview returns null when both description and short_description are null (graceful empty state)"
  - "FloorPlanCard links to schellbrothers.com with URL prefixing to prevent external link injection (T-03-08 mitigation)"
metrics:
  duration: 4min
  completed_date: "2026-04-17T20:12:46Z"
  tasks_completed: 2
  files_created: 6
  files_modified: 0
---

# Phase 03 Plan 03: Community Detail Section Components Summary

Six community detail page section components built to UI-SPEC contract: CommunityHero, CommunityOverview, CommunityAmenities, CommunitySchools, CommunityHoa, and CommunityFloorPlans — all TypeScript-clean, accessibility-attributed, and animated with FadeIn/StaggerChildren viewport triggers.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | CommunityHero + CommunityOverview + CommunityAmenities | 182f350 | community-hero.tsx, community-overview.tsx, community-amenities.tsx |
| 2 | CommunitySchools + CommunityHoa + CommunityFloorPlans | 56743fe | community-schools.tsx, community-hoa.tsx, community-floor-plans.tsx |

## What Was Built

### CommunityHero (`src/components/communities/community-hero.tsx`)
Client component. Full-bleed section (50vh mobile / 70vh desktop) with `next/image` `priority`+`fill`. Gradient overlay `rgba(10,10,10,0.85)`. Sold-out desaturation via CSS `filter: grayscale(0.6) brightness(0.8)` and "SOLD OUT" destructive badge top-right. Price formatted with `Intl.NumberFormat`. CTA swaps to "Join Waitlist" when sold out. Framer Motion staggered reveal (0/100/200/300ms delays, translate-y 16px, 600ms ease-out) with reduced-motion guard.

### CommunityOverview (`src/components/communities/community-overview.tsx`)
Client component. Description truncated at 500 chars with "Read more" / "Show less" toggle. Fade gradient over truncated text. If `sales_center_address` is truthy, renders a card with MapPin icon and "Get Directions" ghost button linking to `https://www.google.com/maps/dir/?api=1&destination={encoded}`. Wrapped in FadeIn.

### CommunityAmenities (`src/components/communities/community-amenities.tsx`)
Server component. Returns null when `amenities.length === 0`. Grid 2/3/4 columns by breakpoint. Each amenity chip in `<li>` inside `<ul aria-label="Community amenities">`. Lucide icon map: Pool/Swimming→Waves, Fitness/Gym→Dumbbell, Playground→Baby, Clubhouse/Club→Building, Trail/Walking/Path→TreePine, Tennis→CircleDot, Dog/Pet→Dog, default→Check. Icons are `aria-hidden`. Chips wrapped in StaggerChildren (30ms stagger).

### CommunitySchools (`src/components/communities/community-schools.tsx`)
Server component. Returns null when all three school fields are null. District subheading rendered only when `school_district` is truthy. Cards are `<article>` elements with `aria-label="{level}: {name}"`, bg-card, `border-l-[3px] border-l-green-500`. Wrapped in FadeIn.

### CommunityHoa (`src/components/communities/community-hoa.tsx`)
Server component. Returns null when all HOA fields (name, fee, yearly_fee) are all null. Zero-fees variant shows "No HOA fees for this community" in muted-foreground. Otherwise 3-column grid showing whichever fields are non-null. Wrapped in FadeIn.

### CommunityFloorPlans (`src/components/communities/community-floor-plans.tsx`)
Client component. Count badge (Badge `featured` variant). 1/2/3-column grid. Each card is an `<a>` linking to `https://www.schellbrothers.com{raw_data.floorPlanUrl}` with `target="_blank" rel="noopener"`. Images via `next/image` with `loading="lazy"`, placeholder gradient div when no image. Specs: beds/baths/sqft pipe-separated. Filter tags from `raw_data.filters` (max 3). ExternalLink icon revealed on hover. Empty state message. StaggerChildren at 60ms stagger per card.

## Threat Model Compliance

| Threat ID | Mitigation Applied |
|-----------|-------------------|
| T-03-07 | All text content rendered via React JSX — no `dangerouslySetInnerHTML` anywhere in these components. React escapes all strings. |
| T-03-08 | Floor plan external URLs always prefixed with `https://www.schellbrothers.com` — raw `floorPlanUrl` is appended, never used as a full URL. `rel="noopener"` on all external links. |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Framer Motion v12 strict Easing type**
- **Found during:** Task 1 TypeScript verification
- **Issue:** `ease: "easeOut"` passed as plain string to motion props fails tsc under framer-motion v12 strict types (`Easing` is a specific union, not `string`)
- **Fix:** Imported `Easing` type from framer-motion and assigned `const EASE_OUT: Easing = "easeOut"` for use in motion transition objects
- **Files modified:** src/components/communities/community-hero.tsx
- **Commit:** 182f350

## Known Stubs

None — all components wire directly to Community or Listing type data. No hardcoded placeholders in rendered output. Floor plan image falls back to a gradient placeholder div (intentional UI fallback, not a data stub).

## Self-Check: PASSED

Files confirmed present:
- FOUND: src/components/communities/community-hero.tsx
- FOUND: src/components/communities/community-overview.tsx
- FOUND: src/components/communities/community-amenities.tsx
- FOUND: src/components/communities/community-schools.tsx
- FOUND: src/components/communities/community-hoa.tsx
- FOUND: src/components/communities/community-floor-plans.tsx

Commits confirmed:
- FOUND: 182f350 (Task 1)
- FOUND: 56743fe (Task 2)
