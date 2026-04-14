---
phase: 02-idx-listings-engine
plan: "04"
subsystem: listings-search-filters
tags: [search, filters, nuqs, url-state, shadcn, base-ui, responsive]
dependency_graph:
  requires: ["02-01", "02-03"]
  provides: ["02-06"]
  affects: []
tech_stack:
  added: ["@base-ui/react/slider"]
  patterns:
    - "base-ui controlled Dialog/Sheet via open prop (not Radix asChild)"
    - "nuqs useQueryStates for multi-param URL filter state"
    - "Compound slider primitive wrapping @base-ui/react/slider"
key_files:
  created:
    - src/components/ui/slider.tsx
    - src/components/listings/price-range-slider.tsx
    - src/components/listings/beds-baths-selector.tsx
    - src/components/listings/property-type-chips.tsx
    - src/components/listings/location-search.tsx
    - src/components/listings/search-filters.tsx
    - src/components/listings/active-filter-bar.tsx
    - src/components/listings/view-toggle.tsx
    - src/components/listings/search-results-header.tsx
  modified: []
decisions:
  - "Used @base-ui/react/slider compound pattern instead of shadcn Radix slider (no Radix installed)"
  - "Dialog/Sheet open state controlled via useState + onOpenChange, not Trigger asChild (base-ui does not support asChild)"
  - "FilterPill uses selected= prop (not active=) per existing filter-pill.tsx interface"
metrics:
  duration: "~20min"
  completed_date: "2026-04-14"
  tasks_completed: 2
  files_created: 9
  files_modified: 0
---

# Phase 2 Plan 4: Search Filter UI Summary

**One-liner:** URL-bound filter system — sticky pill bar, More Filters modal, mobile bottom sheet, active chip bar, view toggle — using nuqs + @base-ui/react.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Slider primitive + filter sub-components | ec7df30 | slider.tsx, price-range-slider.tsx, beds-baths-selector.tsx, property-type-chips.tsx, location-search.tsx |
| 2 | SearchFilters + ActiveFilterBar + ViewToggle + ResultsHeader | 5323809 | search-filters.tsx, active-filter-bar.tsx, view-toggle.tsx, search-results-header.tsx |

## What Was Built

### Task 1: Filter Sub-Components

- **`src/components/ui/slider.tsx`** — Shadcn-style wrapper around `@base-ui/react/slider` compound primitives (Root, Control, Track, Indicator, Thumb). Supports dual-handle range via `value` array and `onValueChange` callback.
- **`src/components/listings/price-range-slider.tsx`** — Dual-handle price range slider with formatted labels ($0k–$5M range, $25k steps). Uses `[number, number]` tuple interface.
- **`src/components/listings/beds-baths-selector.tsx`** — 6-option segmented control (Any, 1+, 2+, 3+, 4+, 5+) with `aria-pressed` state. Used for both Beds and Baths via `label` prop.
- **`src/components/listings/property-type-chips.tsx`** — Multi-select toggle chips for 5 property types (House/Condo/Townhouse/Multi-Family/Land) with checkmark icon on active state.
- **`src/components/listings/location-search.tsx`** — Text input with Enter-to-add, renders selected cities as removable accent chips. Arrays passed as `cities[]` + `onChange` callback.

### Task 2: Composite Filter Components

- **`src/components/listings/search-filters.tsx`** — Top-level filter orchestrator. Desktop: sticky bar with 4 FilterPill components (Price/Beds/Baths/Home Type) + "More Filters" Dialog modal with all advanced fields. Mobile: "Filters" button triggers bottom Sheet drawer. All state via `useQueryStates` (nuqs), `throttleMs: 300`.
- **`src/components/listings/active-filter-bar.tsx`** — Reads URL filter state, renders removable chips for every active filter. Returns `null` when no filters active. "Clear All" resets all nine tracked params.
- **`src/components/listings/view-toggle.tsx`** — Map/List/Split segmented control. Reads/writes `view` URL param via nuqs. Icon-only on mobile, icon + text label on lg+. `aria-pressed` on active option.
- **`src/components/listings/search-results-header.tsx`** — Headline "{count} homes in {location}" + sort `<select>` (5 options) + embedded ViewToggle.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Adaptation] Used @base-ui/react/slider instead of shadcn Radix slider**
- **Found during:** Task 1 — `npx shadcn@latest add slider` would install Radix `@radix-ui/react-slider`, but no Radix packages are installed in this project
- **Fix:** Created `slider.tsx` as a wrapper over `@base-ui/react/slider` compound components (Root → Control → Track → Indicator + Thumb per value). Same external interface as the plan's specification.
- **Files modified:** `src/components/ui/slider.tsx`
- **Commit:** ec7df30

**2. [Rule 1 - Adaptation] Dialog/Sheet controlled via open state, not Trigger asChild**
- **Found during:** Task 2 — `@base-ui/react/dialog` Trigger renders its own `<button>` and does not support `asChild`. Wrapping a `<Button>` with `<DialogTrigger asChild>` would nest buttons.
- **Fix:** Removed `DialogTrigger`/`SheetTrigger` usage. Controlled open state via `useState` booleans and wired `onClick={() => setOpen(true)}` on the Button. Dialog/Sheet use `open={moreOpen} onOpenChange={(open) => setMoreOpen(open)}`.
- **Files modified:** `src/components/listings/search-filters.tsx`
- **Commit:** 5323809

**3. [Rule 1 - Adaptation] FilterPill uses `selected=` prop not `active=`**
- **Found during:** Task 2 — existing `src/components/ui/filter-pill.tsx` uses `selected?: boolean` interface per D-06
- **Fix:** Used `selected={!!filterActive}` in the top bar pills.
- **Files modified:** `src/components/listings/search-filters.tsx`
- **Commit:** 5323809

## Known Stubs

None. All filter components are fully functional. Actual filter data integration happens in plan 02-06 (search page) which composes these components with real listing data from Supabase.

## Threat Surface

No new network endpoints introduced. All filter values flow through:
1. User input → nuqs URL params (client-side only)
2. URL params → server Zod validation in `parseSearchParams()` (plan 02-03)

T-02-04-01 (URL param tampering): nuqs parsers (`parseAsInteger`, `parseAsBoolean`, `parseAsStringEnum`) reject invalid values by falling back to `null`/default. Zod re-validates on server.

T-02-04-02 (XSS in LocationSearch): React renders city values as text content only — no `dangerouslySetInnerHTML` used.

## Self-Check: PASSED

Files verified:
- src/components/ui/slider.tsx — EXISTS
- src/components/listings/price-range-slider.tsx — EXISTS
- src/components/listings/beds-baths-selector.tsx — EXISTS
- src/components/listings/property-type-chips.tsx — EXISTS
- src/components/listings/location-search.tsx — EXISTS
- src/components/listings/search-filters.tsx — EXISTS
- src/components/listings/active-filter-bar.tsx — EXISTS
- src/components/listings/view-toggle.tsx — EXISTS
- src/components/listings/search-results-header.tsx — EXISTS

Commits verified:
- ec7df30 — Task 1: slider primitive + sub-components
- 5323809 — Task 2: composite filter components

Build: `npm run build` PASSED (no TypeScript errors, 6 routes generated)
