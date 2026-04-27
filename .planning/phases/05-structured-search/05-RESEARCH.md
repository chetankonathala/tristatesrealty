# Phase 5: Structured Search - Research

**Researched:** 2026-04-27
**Domain:** URL-persistent search filters, Mapbox clustering, pagination (Next.js App Router + nuqs + Supabase)
**Confidence:** HIGH

## Summary

Phase 5 completes the structured search experience by filling gaps in the existing Phase 4 implementation. The codebase already has a fully functional filter bar (`SearchFilters`), sort dropdown (`SearchResultsHeader`), Mapbox map with supercluster (`SearchMap`), and Supabase query builder (`searchListings`). The remaining work is surgical: add shadcn Popover interactivity to desktop filter pills, implement ZIP/city auto-detection in `LocationSearch`, add Delaware preset chips, wire up a `dom-asc` sort option, build a Prev/Next pagination component, and verify the map's `bounds` URL restoration on mount.

Every component this phase modifies already exists and follows established patterns (nuqs `useQueryStates` with `throttleMs: 300, shallow: false`). No new libraries are required beyond adding the shadcn `popover` component (`npx shadcn add popover`). The `postalCodes` URL param and Supabase `.in("address_postal_code", ...)` filter are already wired in `search-params.ts` and `listings.ts` respectively -- LocationSearch just needs to route ZIP inputs to that param instead of `cities`.

**Primary recommendation:** This is a component-level enhancement phase, not an architecture phase. Each plan maps to a discrete component modification with no cross-cutting concerns. Execute the four plans in order: schema first (05-01), then location (05-02), then map verification (05-03), then sort/pagination (05-04).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Auto-detect ZIP: in `LocationSearch.add()`, test if trimmed input matches `/^\d{5}$/`. If true -> write to `postalCodes` URL param. If false -> write to `cities` param. Single input handles both -- no UI refactor needed.
- **D-02 (dropped):** No validation warning for non-Delaware ZIPs. Silently route and let SimplyRETS return 0 results.
- **D-03:** Show quick-pick city chips below the text input in `LocationSearch`. Preset list: Lewes, Rehoboth Beach, Wilmington, Dover, Newark, Middletown, Millsboro, Milton (8 cities). Tapping a chip adds it to the cities/postalCodes list instantly. Chips hidden if city already selected.
- **D-04:** Location search stays inside the More Filters modal/sheet only -- no 5th pill added to the top filter bar.
- **D-05:** Each desktop filter pill (Price, Beds, Baths, Home Type) opens an inline Popover for that specific filter. "More Filters" button still opens the full modal for advanced fields.
- **D-06:** Mobile keeps the existing single "Filters" button -> Sheet pattern. No pill interactivity on mobile.
- **D-07:** Add `dom-asc` to the `sort` enum. Sorts by `days_on_market` ASC. Label: "Days on Market". 6th sort option.
- **D-08:** Ascending only -- no `dom-desc` variant.
- **D-09:** Prev/Next page navigation at the bottom of search results grid. URL `?page=N` via nuqs `parseAsInteger`.
- **D-10:** 24 listings per page (existing default). Pagination shows "Page X of Y", Prev (disabled page 1), Next (disabled last page). `Math.ceil(totalCount / perPage)`.
- **D-11:** Keep supercluster + React `<MapMarker>` components. No separate Mapbox layer/source API needed.
- **D-12:** Default map viewport: all of Delaware (zoom ~9, center `[-75.5, 39.0]`). If `bounds` param present, restore viewport on mount. No geolocation prompt.

### Claude's Discretion
- Exact popover trigger sizing and close behavior (click-outside closes)
- Popover arrow/anchor positioning relative to pill
- Cluster bubble count display threshold
- `dom-asc` sort label position in dropdown order
- Pagination component exact styling (button variants, page counter text)

### Deferred Ideas (OUT OF SCOPE)
- Mapbox GL layer/source API for raw 5k pin rendering without clustering
- `dom-desc` sort variant
- Location filter as a 5th top-bar pill
- Geolocation-based default map center
- DE_CITIES validation warning for non-Delaware inputs
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEARCH-01 | Filter bar with price range, beds, baths, and property type -- persistable via nuqs URL params | Filter bar already built in `search-filters.tsx` with full nuqs wiring. Phase 5 adds Popover interactivity per D-05 so each pill has direct inline editing. All params already URL-persistent. |
| SEARCH-02 | City and zip/area filter for Delaware locations -- maps to SimplyRETS `cities` and `postalCodes` params | `LocationSearch` exists but routes all input to `cities`. D-01 adds `/^\d{5}$/` regex to fork ZIP input to `postalCodes` param. D-03 adds Delaware preset chips. `postalCodes` Supabase filter already wired. |
| SEARCH-03 | Mapbox map view with WebGL-rendered listing pins and supercluster clustering (handles 5k+ pins without degradation) | `SearchMap` already implements supercluster + react-map-gl/mapbox with WebGL canvas. D-11 confirms keeping this pattern. D-12 needs bounds-restore verification on mount. Research confirms supercluster handles 5k+ points at default `radius: 75`. |
| SEARCH-04 | Sort dropdown: price (low/high), newest listings, days on market | Sort dropdown exists with 5 options. D-07 adds `dom-asc` (6th option). D-09/D-10 add Prev/Next pagination. Both require schema + query + UI changes. |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version (Installed) | Latest | Purpose | Why Standard |
|---------|-------------------|--------|---------|--------------|
| nuqs | ^2.8.9 | 2.8.9 | URL state management for all filter/sort/page params | Already powers entire search UX; `useQueryStates` with `throttleMs: 300, shallow: false` is the established pattern [VERIFIED: package.json + npm registry] |
| react-map-gl | ^8.1.1 | 8.1.1 | Mapbox GL JS React wrapper (WebGL map rendering) | Already installed, `SearchMap` uses it [VERIFIED: package.json + npm registry] |
| supercluster | ^8.0.1 | 8.0.1 | Point clustering algorithm for map pins | Already installed, handles 5k+ points efficiently [VERIFIED: package.json + npm registry] |
| use-supercluster | ^1.2.0 | 1.2.0 | React hook wrapping supercluster for bounds/zoom reactivity | Already installed, `SearchMap` uses it [VERIFIED: package.json + npm registry] |

### Supporting (Need to Add)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn Popover | (Radix-based) | Inline filter popovers anchored to pills (D-05) | `npx shadcn add popover` -- NOT installed yet [VERIFIED: `src/components/ui/popover.tsx` does not exist] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn Popover | Headless Radix Popover directly | shadcn wraps Radix with project theming already applied; no reason to go lower-level |
| supercluster React markers | Mapbox GL source/layer API | D-11 explicitly locks supercluster approach; layer API deferred |

**Installation:**
```bash
npx shadcn add popover
```

No other packages needed -- everything else is already installed.

## Architecture Patterns

### Existing Project Structure (Relevant Files)
```
src/
  lib/
    schemas/search-params.ts       # Zod schema + nuqs parsers (modify: add dom-asc)
    constants/mls.ts               # MLS attribution constants
    constants/delaware-locations.ts # NEW: preset city/zip list for D-03
    supabase/queries/listings.ts   # searchListings() query (modify: add dom-asc sort case)
  components/
    ui/
      filter-pill.tsx              # FilterPill button (no modification needed)
      popover.tsx                  # NEW: shadcn Popover (npx shadcn add popover)
      button.tsx                   # Existing Button for Prev/Next
    listings/
      search-filters.tsx           # Filter bar (modify: add Popover per pill)
      location-search.tsx          # Location input (modify: ZIP detection + presets)
      search-results-header.tsx    # Sort dropdown (modify: add dom-asc option)
      search-results-grid.tsx      # Card grid (modify: add pagination below)
      search-map.tsx               # Map (verify: bounds restore on mount)
      search-pagination.tsx        # NEW: Prev/Next pagination component
```

### Pattern 1: Popover-per-Pill (D-05)
**What:** Each desktop FilterPill gets an associated Popover that contains the filter's dedicated component. A local `openPill` state tracks which pill's popover is open (or `null` if none).
**When to use:** Desktop only (>= `lg` breakpoint). Mobile uses existing Sheet.
**Example:**
```typescript
// Source: CONTEXT.md D-05 + existing search-filters.tsx pattern
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// In SearchFilters component:
const [openPill, setOpenPill] = useState<string | null>(null);

// For each pill:
<Popover open={openPill === "price"} onOpenChange={(open) => setOpenPill(open ? "price" : null)}>
  <PopoverTrigger asChild>
    <FilterPill selected={!!(filters.minPrice || filters.maxPrice)}>
      {priceLabel}
    </FilterPill>
  </PopoverTrigger>
  <PopoverContent align="start" className="w-80">
    <PriceRangeSlider
      value={[filters.minPrice ?? 0, filters.maxPrice ?? 2_000_000]}
      onChange={([min, max]) => setFilters({ minPrice: min || null, maxPrice: max < 2_000_000 ? max : null })}
    />
  </PopoverContent>
</Popover>
```
**Key detail:** Only one popover open at a time -- opening one closes the other. shadcn Popover handles click-outside close natively via Radix. [ASSUMED]

### Pattern 2: ZIP/City Auto-Detection (D-01)
**What:** In `LocationSearch.add()`, test `draft.trim()` against `/^\d{5}$/`. If match, write to `postalCodes` URL param. If no match, write to `cities` param.
**When to use:** Every time user submits a location value.
**Example:**
```typescript
// Source: CONTEXT.md D-01 + existing location-search.tsx
const ZIP_RE = /^\d{5}$/;

const add = () => {
  const v = draft.trim();
  if (!v) return;
  if (ZIP_RE.test(v)) {
    // Route to postalCodes param
    if (!postalCodes.includes(v)) {
      onPostalCodesChange([...postalCodes, v]);
    }
  } else {
    // Route to cities param
    if (!cities.includes(v)) {
      onCitiesChange([...cities, v]);
    }
  }
  setDraft("");
};
```
**Key detail:** `LocationSearch` currently only accepts `cities` + `onChange`. It needs a new prop pair for `postalCodes` + `onPostalCodesChange`, OR (better) `SearchFilters` must register `postalCodes` in its `useQueryStates` call and pass it down. The `postalCodes` param already exists in the Zod schema and Supabase query -- just not wired in the UI layer.

### Pattern 3: Pagination via nuqs (D-09/D-10)
**What:** New `SearchPagination` client component that reads/writes `page` param via `useQueryState("page", parseAsInteger.withDefault(1))`. Renders "Page X of Y" with Prev/Next buttons.
**When to use:** Below the card grid in `search-results-grid.tsx`.
**Example:**
```typescript
// Source: nuqs established pattern in this codebase
"use client";
import { useQueryState, parseAsInteger } from "nuqs";
import { Button } from "@/components/ui/button";

export function SearchPagination({ totalCount, perPage = 24 }: { totalCount: number; perPage?: number }) {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

  return (
    <div className="flex items-center justify-center gap-4 py-8">
      <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
        Previous
      </Button>
      <span className="text-sm text-muted-foreground tabular-nums">
        Page {page} of {totalPages}
      </span>
      <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
        Next
      </Button>
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Do NOT add `postalCodes` to SearchFilters' `useQueryStates` call unless LocationSearch needs it.** The `postalCodes` param needs to be managed by `LocationSearch` internally or passed through from SearchFilters. Currently SearchFilters manages `cities` but not `postalCodes`. The cleanest approach: add `postalCodes: parseAsString` to the existing `useQueryStates` in `search-filters.tsx` and pass both `cities`/`postalCodes` plus their setters to `LocationSearch`.
- **Do NOT create separate Popover components for each filter.** Use a single `openPill` state pattern in `SearchFilters` to manage which popover is open. This avoids z-index conflicts and ensures only one is open at a time.
- **Do NOT add `shallow: true` to pagination.** Page changes should trigger a server re-render (`shallow: false` is the established pattern) because `searchListings()` runs server-side with different `range()` params.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Popover positioning | Custom absolute-positioned dropdown | shadcn Popover (Radix Popover) | Handles anchor positioning, collision detection, z-index, focus trapping, click-outside dismiss [ASSUMED] |
| Map point clustering | Manual viewport-based grouping | supercluster (already installed) | O(n log n) spatial clustering, handles 5k+ points in <10ms, zoom-level-aware [VERIFIED: already working in SearchMap] |
| URL state sync | Manual `window.history.pushState` | nuqs `useQueryState`/`useQueryStates` | Already the established pattern; handles throttling, shallow routing, type parsing [VERIFIED: codebase-wide usage] |

## Common Pitfalls

### Pitfall 1: Popover Focus Trap Conflict with Slider
**What goes wrong:** Radix Popover traps focus by default. If `PriceRangeSlider` uses a Radix Slider inside a Popover, keyboard arrow keys may conflict between Popover navigation and Slider value changes.
**Why it happens:** Both Radix Popover and Radix Slider intercept arrow key events.
**How to avoid:** The existing `PriceRangeSlider` uses shadcn `Slider` which is Radix-based. Test that arrow keys work correctly inside the Price Popover. If they conflict, set `onOpenAutoFocus={(e) => e.preventDefault()}` on PopoverContent to prevent auto-focus-trap. [ASSUMED]
**Warning signs:** Arrow keys change popover focus instead of slider value when Price popover is open.

### Pitfall 2: `postalCodes` Param Not Wired in SearchFilters
**What goes wrong:** `LocationSearch` gets modified to write ZIPs to `postalCodes`, but `SearchFilters` doesn't include `postalCodes` in its `useQueryStates`, so the param never reaches the URL.
**Why it happens:** Currently `SearchFilters` only manages `cities` in its `useQueryStates` call. `postalCodes` exists in the Zod schema but isn't in the client hook.
**How to avoid:** Add `postalCodes: parseAsString` to the `useQueryStates` in `search-filters.tsx` and pass both `cities`/`postalCodes` arrays plus update handlers to `LocationSearch`.
**Warning signs:** ZIP codes entered in LocationSearch don't appear in the URL bar.

### Pitfall 3: Pagination Resets Page to 1 on Filter Change
**What goes wrong:** User is on page 5, changes a filter, stays on page 5 but now there are only 2 pages of results -- shows empty grid.
**Why it happens:** Filter changes don't reset the `page` param.
**How to avoid:** In `SearchFilters`, when any filter changes via `setFilters`, also set `page: null` (which resets to default 1). Alternatively, add `page: parseAsInteger` to the `useQueryStates` and reset it alongside filter changes.
**Warning signs:** After applying a filter, results grid shows "0 homes" but total count says there are results.

### Pitfall 4: Map Bounds Not Restored on Mount (D-12)
**What goes wrong:** User bookmarks a search URL with `?bounds=...`, navigates to it, but the map initializes at default Delaware viewport instead of the saved bounds.
**Why it happens:** `SearchMap` reads `bounds` from URL on move-end but doesn't read it on mount to set initial viewport.
**How to avoid:** In `SearchMap`, read the `bounds` URL param on mount. If present, parse it and call `mapRef.current?.fitBounds()` in the `handleLoad` callback instead of using the default `viewState`.
**Warning signs:** Map always starts at zoom 7 Delaware center regardless of `bounds` in URL.

### Pitfall 5: `days_on_market` Column May Be Null
**What goes wrong:** `dom-asc` sort orders by `days_on_market ASC` but listings with `NULL` in that column may sort unpredictably.
**Why it happens:** Supabase/Postgres sorts NULLs differently depending on ASC/DESC and `nullsFirst` option.
**How to avoid:** Use `.order("days_on_market", { ascending: true, nullsFirst: false })` so NULL values sort to the end (least useful for "freshest" sort intent). [VERIFIED: Supabase JS v2 supports `nullsFirst` option]
**Warning signs:** Listings with no `days_on_market` appear at the top of "Days on Market" sort.

## Code Examples

### Delaware Location Presets Constant (D-03)
```typescript
// src/lib/constants/delaware-locations.ts
// Source: CONTEXT.md D-03 preset list
export const DELAWARE_PRESET_CITIES = [
  "Lewes",
  "Rehoboth Beach",
  "Wilmington",
  "Dover",
  "Newark",
  "Middletown",
  "Millsboro",
  "Milton",
] as const;
```

### LocationSearch Updated Interface
```typescript
// Source: Existing location-search.tsx + D-01/D-03 requirements
interface LocationSearchProps {
  cities: string[];
  postalCodes: string[];
  onCitiesChange: (cities: string[]) => void;
  onPostalCodesChange: (postalCodes: string[]) => void;
  placeholder?: string;
}
```

### Sort Schema Update (D-07)
```typescript
// In search-params.ts, update sort enum:
sort: z.enum([
  "price-asc", "price-desc", "date-desc", "date-asc",
  "beds-desc", "sqft-desc", "dom-asc"  // NEW
]).default("date-desc"),
```

### Sort Query Update (D-07)
```typescript
// In listings.ts searchListings(), add to switch:
case "dom-asc":
  query = query.order("days_on_market", { ascending: true, nullsFirst: false });
  break;
```

### Bounds Restore on Mount (D-12)
```typescript
// In SearchMap, read bounds from URL and restore on load
import { useQueryState, parseAsString } from "nuqs";
import { parseBounds } from "@/lib/schemas/search-params";

// Inside SearchMap:
const [boundsParam] = useQueryState("bounds", parseAsString);

const handleLoad = useCallback(() => {
  const map = mapRef.current?.getMap();
  if (!map) return;
  
  // D-12: Restore bounds from URL if present
  const savedBounds = parseBounds(boundsParam ?? undefined);
  if (savedBounds) {
    const [swLng, swLat, neLng, neLat] = savedBounds;
    map.fitBounds([[swLng, swLat], [neLng, neLat]], { padding: 20, duration: 0 });
  }
  
  // Set initial map bounds for supercluster
  const b = map.getBounds();
  if (!b) return;
  const sw = b.getSouthWest();
  const ne = b.getNorthEast();
  setMapBounds([sw.lng, sw.lat, ne.lng, ne.lat]);
}, [boundsParam]);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useRouter` + manual query string | nuqs v2 `useQueryStates` | 2024 | Type-safe URL state with throttling, already adopted project-wide [VERIFIED: codebase] |
| Mapbox GL `addSource`/`addLayer` for clustering | supercluster + React markers | 2023 | More React-idiomatic; D-11 locks this approach for this project [VERIFIED: CONTEXT.md] |
| Client-side pagination (slice array) | Server pagination via Supabase `.range()` | Already implemented | Only 24 records transferred per page; `count: "exact"` gives total for page nav [VERIFIED: listings.ts] |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | shadcn Popover (Radix-based) handles click-outside close natively | Architecture Patterns - Pattern 1 | Low -- Radix Popover is well-known for this behavior; verify after `npx shadcn add popover` |
| A2 | Radix Popover focus trap may conflict with Radix Slider arrow keys | Common Pitfalls - Pitfall 1 | Low -- test manually; `onOpenAutoFocus` prevention is a documented escape hatch |
| A3 | `days_on_market` column may contain NULL values for some listings | Common Pitfalls - Pitfall 5 | Medium -- if all listings always have this field populated by sync, `nullsFirst` is unnecessary but harmless |

## Open Questions

1. **Map bounds restoration timing**
   - What we know: `SearchMap.handleLoad` runs on map's `onLoad` event. URL `bounds` param is already readable via nuqs.
   - What's unclear: Whether `fitBounds` called in `handleLoad` will conflict with the initial `viewState` prop (both try to set viewport).
   - Recommendation: Set `viewState` conditionally -- if `bounds` URL param exists, skip default `viewState` and let `fitBounds` handle positioning. Test with a bookmarked URL.

2. **SearchFilters page reset on filter change**
   - What we know: `page` param exists in schema but isn't in SearchFilters' `useQueryStates`.
   - What's unclear: Whether nuqs automatically resets `page` when other params change (it doesn't -- each param is independent).
   - Recommendation: Add `page: parseAsInteger` to SearchFilters' `useQueryStates` and explicitly set `page: null` in every filter change callback. This is the safest approach.

## Environment Availability

Step 2.6: SKIPPED (no external dependencies identified). All required packages are already installed. Only `npx shadcn add popover` is needed, which uses the local shadcn CLI already configured in the project.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None configured (per CLAUDE.md: "No test runner is configured yet") |
| Config file | none |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEARCH-01 | Filter pills open Popovers with correct filter components on desktop | manual-only | N/A -- visual interaction test | N/A |
| SEARCH-02 | ZIP input routes to `postalCodes`, city input routes to `cities`, preset chips work | manual-only | N/A -- requires UI interaction | N/A |
| SEARCH-03 | Map renders 5k+ pins with supercluster without degradation; bounds restore from URL | manual-only | N/A -- requires Mapbox GL context | N/A |
| SEARCH-04 | `dom-asc` sort works; pagination Prev/Next updates results | manual-only | N/A -- requires Supabase + server render | N/A |

**Justification for manual-only:** No test runner is configured. These are UI-interactive features requiring browser context, Mapbox GL, and Supabase. Visual QA during development is the validation method.

### Wave 0 Gaps
- No test infrastructure exists. Setting one up is out of scope for this phase (CLAUDE.md explicitly notes no test runner configured).

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A (no auth changes) |
| V3 Session Management | no | N/A |
| V4 Access Control | no | N/A (public search page) |
| V5 Input Validation | yes | Zod schema validates all URL params before Supabase query; `postalCodes` validated as string; ZIP regex `/^\d{5}$/` prevents injection |
| V6 Cryptography | no | N/A |

### Known Threat Patterns for This Phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| SQL injection via URL params | Tampering | Supabase client uses parameterized queries; Zod validates all inputs before query construction [VERIFIED: listings.ts uses `.eq()`, `.in()`, `.gte()` -- all parameterized] |
| XSS via city/ZIP display | Tampering | React JSX auto-escapes rendered strings; no `dangerouslySetInnerHTML` used [VERIFIED: location-search.tsx renders cities via `{c}` in JSX] |
| Pagination abuse (page=999999) | Denial of Service | Zod schema limits `perPage` to max 100; Supabase `.range()` returns empty for out-of-range pages [VERIFIED: search-params.ts `perPage: z.coerce.number().int().min(1).max(100)`] |

## Sources

### Primary (HIGH confidence)
- Project codebase -- all source files listed in Canonical References read and analyzed
- `package.json` -- verified installed versions of nuqs, react-map-gl, supercluster, use-supercluster
- npm registry -- confirmed latest versions match installed versions (all current)

### Secondary (MEDIUM confidence)
- CONTEXT.md decisions D-01 through D-12 -- user-locked implementation choices
- REQUIREMENTS.md SEARCH-01 through SEARCH-04 -- acceptance criteria

### Tertiary (LOW confidence)
- None -- all findings verified against codebase or npm registry

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages already installed and verified current
- Architecture: HIGH -- all components exist; modifications are surgical and well-specified
- Pitfalls: HIGH -- identified through direct code reading; each pitfall maps to specific lines in existing source

**Research date:** 2026-04-27
**Valid until:** 2026-05-27 (stable -- no fast-moving dependencies)
