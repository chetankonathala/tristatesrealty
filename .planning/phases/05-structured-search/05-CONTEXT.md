# Phase 5: Structured Search - Context

**Gathered:** 2026-04-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Filter bar, city/zip/area search, Mapbox clustering map, and sort controls — all URL-persistent via nuqs. Phase 4 built the majority of these components; Phase 5 completes the 4 specific gaps: ZIP disambiguation in LocationSearch, DOM sort option, Delaware quick-pick location presets, and verifying the supercluster map scales to 5k+ listings.

</domain>

<decisions>
## Implementation Decisions

### ZIP vs City Disambiguation (SEARCH-02)
- **D-01:** Auto-detect ZIP: in `LocationSearch.add()`, test if trimmed input matches `/^\d{5}$/`. If true → write to `postalCodes` URL param. If false → write to `cities` param. Single input handles both — no UI refactor needed.
- **D-02:** Delaware-scoped validation — after auto-routing, show a non-blocking warning toast if the ZIP isn't in the 19000–19999 range or if the city name isn't in the DE_CITIES whitelist. Warning does NOT prevent the filter from being applied. Whitelist of ~30 Delaware cities lives in `src/lib/constants/delaware-locations.ts`. Middletown, Newark, etc. (shared city names) are included without disambiguation.

### Sort — Days on Market (SEARCH-04)
- **D-03:** Add `dom-asc` to the `sort` enum in `src/lib/schemas/search-params.ts`. Sorts by `days_on_market` ASC (fewest days = freshest). Label in the dropdown: "Days on Market". This becomes the 6th sort option.
- **D-04:** Ascending only — no `dom-desc` variant needed. "Newest" (`date-desc`) already covers the freshness intent from the other direction.

### Delaware Location Presets (SEARCH-02)
- **D-05:** Show quick-pick city chips below the text input in `LocationSearch`. Preset list: Lewes, Rehoboth Beach, Wilmington, Dover, Newark, Middletown, Millsboro, Milton (8 cities). Tapping a chip adds it to the cities list instantly using the same `onChange` path as typing. Chips are not shown for already-selected cities.
- **D-06:** Location search stays inside the More Filters modal/sheet only — no 5th pill added to the top filter bar. Location is an advanced filter.

### Map Rendering Strategy (SEARCH-03)
- **D-07:** Keep supercluster + React `<MapMarker>` components. At any realistic zoom level, supercluster collapses 5k Delaware listings into ~20–50 visible clusters/markers, so React only renders what's visible. "WebGL-rendered" in SEARCH-03 refers to Mapbox GL's canvas already being WebGL — no separate Mapbox layer/source API needed.
- **D-08:** Default map viewport: all of Delaware (zoom ~9, center `[-75.5, 39.0]`). If `bounds` param is present in URL, restore that viewport on mount. No geolocation prompt.

### Claude's Discretion
- Exact DE_CITIES whitelist content (beyond the 8 preset chips — include all ~30 known DE cities)
- Warning toast styling and copy ("Did you mean a Delaware ZIP/city?")
- Cluster bubble count display threshold (when to show number vs collapse further)
- `dom-asc` sort label capitalization and position in dropdown order

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` §Structured Search — SEARCH-01 through SEARCH-04 acceptance criteria (the 4 requirements this phase closes)
- `.planning/ROADMAP.md` §Phase 5 — Phase goal, success criteria, and the 4 pre-named plan files

### Existing Implementation (read before modifying)
- `src/lib/schemas/search-params.ts` — Full URL param schema including `cities`, `postalCodes`, `sort` enum, `bounds`. Planner must understand what's already defined before adding `dom-asc`.
- `src/components/listings/search-filters.tsx` — Full filter bar with nuqs wiring. Planner must read before any filter changes.
- `src/components/listings/location-search.tsx` — Current LocationSearch implementation to be modified for D-01/D-02/D-05.
- `src/components/listings/search-results-header.tsx` — Existing sort dropdown. Add `dom-asc` option and update enum here.
- `src/components/listings/search-map.tsx` — Existing SearchMap with supercluster. Verify 5k-pin scale behavior; no architecture change needed.
- `src/lib/supabase/queries/listings.ts` — `searchListings()` query. Must add `dom-asc` sort case alongside existing sort handling.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/filter-pill.tsx` — FilterPill with selected state; used in top bar (not needed for this phase but already wired)
- `src/components/ui/sheet.tsx` — Mobile filter Sheet; LocationSearch lives inside here
- `src/components/ui/dialog.tsx` — Desktop More Filters modal; LocationSearch also lives inside here
- `src/components/listings/map-marker.tsx` / `map-cluster.tsx` — Existing marker/cluster components; keep as-is
- `use-supercluster` — npm package already installed; SearchMap already uses it correctly
- `nuqs` v2.8.9 — Already installed and used across all filter components with `useQueryStates`

### Established Patterns
- nuqs `useQueryStates` with `{ throttleMs: 300, shallow: false }` — established pattern for filter state. ZIP routing uses same pattern.
- Split Supabase client: `src/lib/supabase/client.ts` (browser) + `src/lib/supabase/server.ts` (server)
- Tailwind v4 CSS-first config — no `tailwind.config.ts`; use CSS variables and `@theme` in `globals.css`
- Constants in `src/lib/constants/` — e.g., `mls.ts` exists; create `delaware-locations.ts` here for city whitelist + preset chips

### Integration Points
- `LocationSearch` receives `cities: string[]` + `onChange: (cities: string[]) => void` — needs to expand to handle ZIP routing internally (write `postalCodes` directly via `useQueryState` inside the component, not via the parent `onChange` prop)
- `searchListings()` already handles `postalCodes` param (line ~50: `query.in("address_postal_code", postalCodes)`) — no query change needed, just add `dom-asc` sort case
- `search-results-header.tsx` sort `<select>` must stay in sync with `searchParamsSchema.sort` enum

</code_context>

<specifics>
## Specific Ideas

- LocationSearch ZIP detection: single regex `/^\d{5}$/` in the `add()` function — minimal code change, big UX improvement
- Delaware preset chips: 8 cities (Lewes, Rehoboth Beach, Wilmington, Dover, Newark, Middletown, Millsboro, Milton) — render as small `bg-accent/10` chip buttons below the text input, hidden if already selected
- Map default is already correct in SearchMap (`longitude: -75.5277, latitude: 39.0, zoom: 7`) — verify it uses `bounds` URL param to restore viewport on mount

</specifics>

<deferred>
## Deferred Ideas

- Mapbox GL layer/source API for raw 5k pin rendering (no clustering) — only needed if supercluster performance degrades at sub-county zoom levels; defer until we have real load data
- `dom-desc` sort (longest-listed listings as "deals") — deferred; ascending only for now
- Location filter as a 5th top-bar pill — deferred; stays in More Filters modal
- Geolocation-based default map center — deferred; statewide default is sufficient for v1.1

</deferred>

---

*Phase: 05-structured-search*
*Context gathered: 2026-04-27*
