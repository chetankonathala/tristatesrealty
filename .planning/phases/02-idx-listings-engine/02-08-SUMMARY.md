---
phase: 02-idx-listings-engine
plan: 08
subsystem: ui
tags: [react, nextjs, schema-org, mapbox, json-ld, mls, fair-housing, xss, seo]

# Dependency graph
requires:
  - phase: 02-01
    provides: MLS_ATTRIBUTION constants, mls.ts
  - phase: 02-03
    provides: ListingCard component, ListingSummary type, getComparableSales query

provides:
  - PriceHistoryTable component (IDX-05)
  - StreetViewEmbed component with Google Maps Embed API (IDX-06)
  - LocationMap component with Mapbox dark-v11 (IDX-06)
  - ListingJsonLd structured data script (IDX-07)
  - ComparableSalesGrid component reusing ListingCard (IDX-08)
  - MlsAttribution strip with Fair Housing + Bright MLS logos (IDX-09)
  - public/images/fair-housing-logo.svg asset
  - public/images/bright-mls-logo.svg asset

affects: [02-11, 02-10, seo, idx-compliance]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "XSS-safe JSON-LD: JSON.stringify + .replace(/</g, '\\u003c') before dangerouslySetInnerHTML"
    - "Client map component: 'use client' + dynamic import for ssr:false + mapbox-gl.css at top"
    - "MLS attribution: always use constants from src/lib/constants/mls.ts — never hardcode MLS copy"
    - "Empty state pattern: check array.length === 0, render muted-foreground message"

key-files:
  created:
    - src/components/listings/price-history-table.tsx
    - src/components/listings/street-view-embed.tsx
    - src/components/listings/location-map.tsx
    - src/components/listings/comparable-sales-grid.tsx
    - src/components/listings/mls-attribution.tsx
    - src/components/listings/listing-jsonld.tsx
    - public/images/fair-housing-logo.svg
    - public/images/bright-mls-logo.svg
  modified: []

key-decisions:
  - "XSS mitigation T-02-08-01: escape '<' to '\\u003c' in JSON-LD via .replace(/</g, '\\u003c') — JSON.stringify alone does not escape angle brackets"
  - "LocationMap imports mapbox-gl/dist/mapbox-gl.css inline per CLAUDE.md requirement for client map components"
  - "StreetViewEmbed uses encodeURIComponent on address for safe URL construction in iframe src"
  - "PriceHistoryTable accepts optional history prop — empty array renders empty state rather than throwing"

patterns-established:
  - "JSON-LD XSS escape: always .replace(/</g, '\\u003c') before dangerouslySetInnerHTML in any script injection pattern"
  - "Fair Housing assets: always use src/lib/constants/mls.ts FAIR_HOUSING_ALT and BRIGHT_MLS_LOGO_ALT constants for img alt text"

requirements-completed: [IDX-05, IDX-06, IDX-07, IDX-08, IDX-09]

# Metrics
duration: 7min
completed: 2026-04-14
---

# Phase 02 Plan 08: Meta/SEO + Secondary Content Components Summary

**Six listing detail components built: price history table, Street View iframe, Mapbox location map, comparable sales grid, MLS attribution strip with SVG logos, and XSS-safe RealEstateListing JSON-LD (T-02-08-01 mitigated)**

## Performance

- **Duration:** 7 min
- **Started:** 2026-04-15T03:51:31Z
- **Completed:** 2026-04-15T03:58:47Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Price history table with date/event/price/% change columns and arrow indicators, plus empty state (IDX-05)
- Google Street View embed via Maps Embed API v1 iframe with a11y title attribute and fallback when API key absent (IDX-06)
- Mapbox dark-v11 location map with MapPin marker via react-map-gl dynamic import (IDX-06)
- RealEstateListing JSON-LD with all required schema.org fields; `<` escaped to `\u003c` to block script injection from MLS remarks/address data (IDX-07, T-02-08-01)
- Comparable sales grid reusing ListingCard in responsive 1/2/3 column layout with empty state (IDX-08)
- MLS attribution strip rendering Fair Housing + Bright MLS SVG logos via next/image, copyright with dynamic year, listing firm/agent attribution, last synced timestamp (IDX-09)
- Fair Housing and Bright MLS placeholder SVG logo assets created in public/images/

## Task Commits

Each task was committed atomically:

1. **Task 1: PriceHistoryTable + StreetViewEmbed + LocationMap + Fair Housing assets** - `29ac6fd` (feat)
2. **Task 2: ComparableSalesGrid + MlsAttribution + ListingJsonLd** - `0c7e758` (feat)

## Files Created/Modified

- `src/components/listings/price-history-table.tsx` - Price history table with date/event/price/change columns; empty state
- `src/components/listings/street-view-embed.tsx` - Google Street View iframe via Maps Embed API; fallback for missing key
- `src/components/listings/location-map.tsx` - Mapbox dark-v11 client component with dynamic import; MapPin marker
- `src/components/listings/comparable-sales-grid.tsx` - ListingCard grid for comps; accepts `comps: ListingSummary[]`
- `src/components/listings/mls-attribution.tsx` - MLS attribution strip; Fair Housing + Bright MLS logos; copyright + timestamp
- `src/components/listings/listing-jsonld.tsx` - RealEstateListing schema.org JSON-LD; XSS-safe `<` escape
- `public/images/fair-housing-logo.svg` - Equal Housing Opportunity placeholder SVG (aria-label set)
- `public/images/bright-mls-logo.svg` - Bright MLS placeholder SVG

## Decisions Made

- XSS mitigation (T-02-08-01): `JSON.stringify(jsonLd).replace(/</g, "\\u003c")` applied before `dangerouslySetInnerHTML`. JSON.stringify does not escape `<` by default; without this, an MLS `remarks` field containing `</script>` could break out of the JSON-LD context.
- LocationMap includes `import "mapbox-gl/dist/mapbox-gl.css"` per CLAUDE.md Mapbox section requirement — CSS import required in client map components.
- StreetViewEmbed uses `encodeURIComponent(address)` to prevent URL injection in the iframe `src` attribute.

## Deviations from Plan

None - plan executed exactly as written. The `mapbox-gl/dist/mapbox-gl.css` import was added to `location-map.tsx` per CLAUDE.md requirement (not in the plan code snippet), but this is a documented project convention, not a deviation.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is documented in `.env.example`; `StreetViewEmbed` gracefully degrades when the key is absent.

## Next Phase Readiness

- All 6 secondary content components ready to compose into the listing detail page (plan 02-11)
- ComparableSalesGrid wired to `getComparableSales` query (plan 02-01) — RSC in 02-11 will call the query and pass results as `comps` prop
- MlsAttribution requires `synced_at` from `Listing.synced_at` — already in Listing type
- ListingJsonLd requires full `Listing` object — available via `getListingByMlsId`
- SVG logo assets are placeholders — can be replaced with official Bright MLS / Fair Housing assets without code changes

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: XSS (mitigated) | src/components/listings/listing-jsonld.tsx | MLS remarks/address injected into JSON-LD script; mitigated via `\u003c` escape (T-02-08-01) |

---
*Phase: 02-idx-listings-engine*
*Completed: 2026-04-14*
