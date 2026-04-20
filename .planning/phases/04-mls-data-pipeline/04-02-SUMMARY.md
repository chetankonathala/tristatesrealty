---
phase: "04"
plan: "02"
subsystem: mls-data-pipeline
tags: [listing-card, mls-attribution, coming-soon, days-on-market, bright-mls, idx-compliance]
dependency_graph:
  requires: [04-01]
  provides: [compliant-listing-cards, refactored-mls-attribution, compact-attribution-footer]
  affects: [listing-card, mls-attribution, listings-page, types]
tech_stack:
  added: []
  patterns:
    - MLS_ATTRIBUTION constants used for all copyright/attribution text (no hardcoded strings)
    - compact prop pattern for context-appropriate attribution rendering
key_files:
  created: []
  modified:
    - src/types/listing.ts
    - src/components/cards/listing-card.tsx
    - src/components/listings/mls-attribution.tsx
    - src/app/listings/page.tsx
    - src/components/sections/featured-listings.tsx
key_decisions:
  - "MlsAttribution compact mode renders single copyright line only (no logos) for search results footer"
  - "Days on market display: <=7 days shows 'New' label, >7 shows numeric count"
  - "Coming Soon badge uses blue (bg-blue-500) to match status dot color"
metrics:
  duration: 3min
  completed: "2026-04-20"
  tasks_completed: 3
  files_modified: 5
---

# Phase 04 Plan 02: ListingCard + MlsAttribution Enhancement Summary

**One-liner:** ListingCard enhanced with days-on-market, per-card office attribution, and ComingSoon blue badge; MlsAttribution rewritten to use MLS_ATTRIBUTION constants with Bright MLS logo and compact search-results mode.

## What Was Built

### Task 1: ListingSummary type + ListingCard enhancements

**src/types/listing.ts:**
- Added `listing_office_name: string | null` to `ListingSummary` interface (was already in `Listing` and `SUMMARY_FIELDS` query, just missing from the summary type)

**src/components/cards/listing-card.tsx:**
- Days-on-market row: shows "New" when `days_on_market <= 7`, otherwise "X days"; renders alongside truncated `listing_office_name`
- Coming Soon badge: blue `bg-blue-500` badge renders when `status === "ComingSoon"`
- Status dot: added `ComingSoon` → `bg-blue-500` branch to `statusColor` constant
- Badges condition updated: `(isNew || listing.status === "Pending" || listing.status === "ComingSoon")`

**src/lib/supabase/queries/listings.ts:**
- `listing_office_name` was already present in `SUMMARY_FIELDS` — no change needed

### Task 2: MlsAttribution rewrite

**src/components/listings/mls-attribution.tsx** — complete rewrite:
- Imports `MLS_ATTRIBUTION`, `FAIR_HOUSING_ALT`, `BRIGHT_MLS_LOGO_ALT` from `@/lib/constants/mls`
- Uses `MLS_ATTRIBUTION.copyright(year)` — zero hardcoded copyright text
- Uses `MLS_ATTRIBUTION.providedBy(firm, agent, phone)` — zero hardcoded agent/office text
- Uses `MLS_ATTRIBUTION.lastUpdatedLabel` for sync timestamp label
- Renders both Fair Housing logo AND Bright MLS logo (`/images/bright-mls-logo.svg`) side by side
- Added `compact?: boolean` prop: when true, renders single `<p>` with copyright only (for search results footer)
- Zero references to "Schell Brothers" or "New construction"

### Task 3: Compact attribution footer on search results page

**src/app/listings/page.tsx:**
- Added `import { MlsAttribution } from "@/components/listings/mls-attribution"`
- Renders `<MlsAttribution compact ... />` below `SearchResultsGrid`
- Satisfies MLS-05: Bright MLS compliance attribution on every listing surface

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript type error in featured-listings.tsx placeholder data**
- **Found during:** Task 1 build verification
- **Issue:** `PLACEHOLDER_LISTINGS` in `featured-listings.tsx` typed as `ListingSummary[]` did not include the new required `listing_office_name` field, causing a TypeScript build failure
- **Fix:** Added `listing_office_name: null` to all 6 placeholder listing objects
- **Files modified:** `src/components/sections/featured-listings.tsx`
- **Commit:** 7e1ac20

**2. [Observation] SUMMARY_FIELDS already included listing_office_name**
- `src/lib/supabase/queries/listings.ts` already had `listing_office_name` in `SUMMARY_FIELDS` from a prior edit — no change needed to that file

## Threat Model Coverage

| Threat | Disposition | Status |
|--------|-------------|--------|
| T-04-04: Info Disclosure (office name in card) | accept | Office name is public IDX data — required by display rules |
| T-04-05: Tampering (MlsAttribution data) | accept | Data from Supabase (trusted internal store), no user input |

## Known Stubs

None. All fields are properly wired from the database through `SUMMARY_FIELDS` to the UI.

## Self-Check

Files created/modified:
- src/types/listing.ts — modified (listing_office_name added to ListingSummary)
- src/components/cards/listing-card.tsx — modified (days_on_market, ComingSoon badge, office attribution)
- src/components/listings/mls-attribution.tsx — rewritten (constants, Bright MLS logo, compact mode)
- src/app/listings/page.tsx — modified (compact MlsAttribution footer added)
- src/components/sections/featured-listings.tsx — modified (Rule 1 fix: listing_office_name: null on placeholders)

Commits:
- 7e1ac20: feat(04-02): add listing_office_name to ListingSummary, enhance ListingCard
- 04481a4: feat(04-02): rewrite MlsAttribution using MLS_ATTRIBUTION constants + Bright MLS logo
- affff2a: feat(04-02): add compact Bright MLS compliance footer to search results page

## Self-Check: PASSED
