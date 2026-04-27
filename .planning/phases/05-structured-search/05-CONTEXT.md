# Phase 5: Structured Search - Context

**Gathered:** 2026-04-27 (updated 2026-04-27)
**Status:** Ready for planning

<domain>
## Phase Boundary

Filter bar, city/zip/area search, Mapbox clustering map, and sort controls — all URL-persistent via nuqs. Phase 4 built the majority of these components; Phase 5 completes the remaining gaps: ZIP disambiguation in LocationSearch, interactive filter pill popovers, DOM sort option, Delaware quick-pick location presets, Prev/Next pagination, and confirming the supercluster map scales to 5k+ listings.

</domain>

<decisions>
## Implementation Decisions

### ZIP vs City Disambiguation (SEARCH-02)
- **D-01:** Auto-detect ZIP: in `LocationSearch.add()`, test if trimmed input matches `/^\d{5}$/`. If true → write to `postalCodes` URL param. If false → write to `cities` param. Single input handles both — no UI refactor needed.
- **D-02 (dropped):** ~~Delaware-scoped validation warning~~ — removed. No warning toast. Silently route and let SimplyRETS return 0 results if the ZIP/city doesn't match Delaware inventory. Less noise, less code.

### Delaware Location Presets (SEARCH-02)
- **D-03:** Show quick-pick city chips below the text input in `LocationSearch`. Preset list: Lewes, Rehoboth Beach, Wilmington, Dover, Newark, Middletown, Millsboro, Milton (8 cities). Tapping a chip adds it to the cities/postalCodes list instantly using the same routing logic as typed input. Chips are hidden if the city is already selected.
- **D-04:** Location search stays inside the More Filters modal/sheet only — no 5th pill added to the top filter bar. Location is an advanced filter.

### Filter Pill Interactivity (SEARCH-01)
- **D-05:** Each desktop filter pill (Price, Beds, Baths, Home Type) opens an inline Popover for that specific filter — not the full More Filters modal. Click "Price" → Popover with PriceRangeSlider; click "Beds" → Popover with BedsBathsSelector (min beds); click "Baths" → Popover with BedsBathsSelector (min baths); click "Home Type" → Popover with PropertyTypeChips. "More Filters" button still opens the full modal for advanced fields (sqft, waterfront, lot size, year built, etc.).
- **D-06:** Mobile keeps the existing single "Filters" button → Sheet pattern. No pill interactivity on mobile. No change to mobile filter UX.

### Sort — Days on Market (SEARCH-04)
- **D-07:** Add `dom-asc` to the `sort` enum in `src/lib/schemas/search-params.ts`. Sorts by `days_on_market` ASC (fewest days = freshest). Label in the dropdown: "Days on Market". This becomes the 6th sort option after existing 5 (date-desc, price-desc, price-asc, beds-desc, sqft-desc).
- **D-08:** Ascending only — no `dom-desc` variant. "Newest" (`date-desc`) already covers the freshness intent from the other direction.

### Pagination Controls (SEARCH-04)
- **D-09:** Prev/Next page navigation rendered at the bottom of the search results list (below the card grid). URL `?page=N` updates the server render via nuqs `parseAsInteger` for the `page` param — already defined in `search-params.ts` schema.
- **D-10:** 24 listings per page (existing schema default, no change to `perPage`). Pagination component shows: "Page X of Y", Prev button (disabled on page 1), Next button (disabled on last page). Page count derived from `totalCount / perPage`.

### Map Rendering Strategy (SEARCH-03)
- **D-11:** Keep supercluster + React `<MapMarker>` components. At any realistic zoom level, supercluster collapses 5k Delaware listings into ~20–50 visible clusters/markers, so React only renders what's visible. "WebGL-rendered" in SEARCH-03 refers to Mapbox GL's canvas already being WebGL — no separate Mapbox layer/source API needed.
- **D-12:** Default map viewport: all of Delaware (zoom ~9, center `[-75.5, 39.0]`). If `bounds` param is present in URL, restore that viewport on mount. No geolocation prompt.

### Claude's Discretion
- Exact popover trigger sizing and close behavior (click-outside closes)
- Popover arrow/anchor positioning relative to pill
- Cluster bubble count display threshold (when to show number vs collapse further)
- `dom-asc` sort label position in the dropdown order
- Pagination component exact styling (button variants, page counter text)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` §Structured Search — SEARCH-01 through SEARCH-04 acceptance criteria (the 4 requirements this phase closes)
- `.planning/ROADMAP.md` §Phase 5 — Phase goal, success criteria, and the 4 pre-named plan files

### Existing Implementation (read before modifying)
- `src/lib/schemas/search-params.ts` — Full URL param schema: `cities`, `postalCodes`, `sort` enum, `bounds`, `page`, `perPage`. Must read before adding `dom-asc` or wiring pagination.
- `src/components/listings/search-filters.tsx` — Full filter bar with nuqs wiring and all 4 FilterPills. Must read before adding Popover interactivity (D-05).
- `src/components/listings/location-search.tsx` — Current LocationSearch to be modified for D-01/D-03.
- `src/components/listings/search-results-header.tsx` — Existing sort dropdown. Add `dom-asc` option here (D-07).
- `src/components/listings/search-map.tsx` — Existing SearchMap with supercluster. Verify bounds-restore on mount (D-12).
- `src/components/listings/search-results-grid.tsx` — Receives `listings` + `totalCount`. Pagination component mounts below the card grid here (D-09/D-10).
- `src/lib/supabase/queries/listings.ts` — `searchListings()` query. Add `dom-asc` sort case (sorts by `days_on_market ASC`).
- `src/components/listings/price-range-slider.tsx` — Used inside Price popover (D-05).
- `src/components/listings/beds-baths-selector.tsx` — Used inside Beds/Baths popovers (D-05).
- `src/components/listings/property-type-chips.tsx` — Used inside Home Type popover (D-05).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/filter-pill.tsx` — FilterPill with `selected` prop and `onClick` prop (currently unused); add onClick to open Popover (D-05)
- `src/components/ui/sheet.tsx` — Mobile filter Sheet; LocationSearch lives inside here
- `src/components/ui/dialog.tsx` — Desktop More Filters modal; LocationSearch also lives inside here
- `src/components/listings/map-marker.tsx` / `map-cluster.tsx` — Existing marker/cluster components; keep as-is
- `src/components/ui/button.tsx` — Button with `variant="outline"` for Prev/Next pagination (D-09)
- `use-supercluster` — npm package already installed; SearchMap already uses it correctly
- `nuqs` v2.8.9 — Already installed and used across all filter components with `useQueryStates`
- shadcn Popover (`src/components/ui/popover.tsx` if exists, or `npx shadcn add popover`) — needed for D-05 pill popovers

### Established Patterns
- nuqs `useQueryStates` with `{ throttleMs: 300, shallow: false }` — established pattern for filter state
- nuqs `parseAsInteger` for `page` param (already in schema, same pattern as `minPrice`, `minBeds`)
- Split Supabase client: `src/lib/supabase/client.ts` (browser) + `src/lib/supabase/server.ts` (server)
- Tailwind v4 CSS-first config — no `tailwind.config.ts`; use CSS variables and `@theme` in `globals.css`
- Constants in `src/lib/constants/` — e.g., `mls.ts`; create `delaware-locations.ts` here for preset chips list (D-03)
- shadcn/ui with `base-nova` style — add Popover via `npx shadcn add popover` if not already present

### Integration Points
- `FilterPill` onClick handlers in `search-filters.tsx`: each pill gets an `onClick` that toggles a local `openPill` state, which controls the corresponding `<Popover open={openPill === 'price'}>` etc.
- `LocationSearch` internal refactor: add `useQueryState("postalCodes", parseAsString)` inside the component; `add()` forks on regex match to call `setPostalCodes` vs `onChange` (cities)
- `search-results-grid.tsx`: add a `<SearchPagination totalCount={totalCount} />` client component below the card grid; it reads/writes `page` via `useQueryState`
- `searchListings()` sort switch: add `case "dom-asc": query = query.order("days_on_market", { ascending: true })`
- `search-results-header.tsx` sort `<select>`: add `<option value="dom-asc">Days on Market</option>` and update the `parseAsStringEnum` array to include `"dom-asc"`

</code_context>

<specifics>
## Specific Ideas

- LocationSearch ZIP detection: single regex `/^\d{5}$/` in the `add()` function — minimal code change, big UX improvement
- Delaware preset chips (D-03): 8 cities rendered as small `bg-accent/10 text-accent text-xs px-3 py-1 rounded-full` chip buttons below the text input; hidden for already-selected cities
- Filter pill popovers (D-05): Popover `align="start"` so it drops below the pill left-aligned; close on outside click via shadcn Popover default behavior
- Pagination (D-09): "Page X of Y" centered between Prev/Next; `Math.ceil(totalCount / 24)` for total pages; page 1 shows no Prev; last page shows no Next
- Map default: SearchMap already initializes at `[-75.5277, 39.0]` zoom 7 — verify it reads `bounds` URL param to call `mapRef.current?.fitBounds()` on mount

</specifics>

<deferred>
## Deferred Ideas

- Mapbox GL layer/source API for raw 5k pin rendering (no clustering) — defer until supercluster shows performance issues with real data
- `dom-desc` sort (longest-listed listings as potential deals) — ascending only for now
- Location filter as a 5th top-bar pill — stays in More Filters modal
- Geolocation-based default map center — statewide default is sufficient for v1.1
- DE_CITIES validation warning for non-Delaware inputs — removed (D-02 dropped); may revisit if buyers report confusion

</deferred>

---

*Phase: 05-structured-search*
*Context gathered: 2026-04-27*
