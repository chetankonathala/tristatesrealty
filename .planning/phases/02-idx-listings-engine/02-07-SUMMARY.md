---
phase: 02-idx-listings-engine
plan: "07"
subsystem: listing-detail-components
tags: [listings, detail-page, gallery, hero, actions, sticky-bar, client-components]
dependency_graph:
  requires: ["02-03", "02-05"]
  provides: [ListingGallery, ListingHero, ListingActionRow, ListingSpecGrid, ListingDescription, ListingFeaturesList, MobileDetailStickyBar]
  affects: ["02-11"]
tech_stack:
  added: []
  patterns:
    - "Self-contained client component (ListingActionRow owns auth + API fetch + save state)"
    - "require-sign-in CustomEvent pattern for unauthenticated action gating"
    - "base-ui Dialog lightbox with onOpenChange wrapper to avoid extra eventDetails parameter"
    - "Desktop 5-photo collage (col-span-2 row-span-2 main + 4 small) + mobile carousel"
    - "lg:sticky lg:top-24 right sidebar (D-11 pattern)"
key_files:
  created:
    - src/components/listings/listing-gallery.tsx
    - src/components/listings/listing-hero.tsx
    - src/components/listings/listing-action-row.tsx
    - src/components/listings/listing-spec-grid.tsx
    - src/components/listings/listing-description.tsx
    - src/components/listings/listing-features-list.tsx
    - src/components/listings/mobile-detail-sticky-bar.tsx
  modified: []
decisions:
  - "ListingActionRow is self-contained — accepts only mlsId; no isSaved/isAuthenticated/onSave props threaded from parent"
  - "Dialog lightbox uses showCloseButton={false} to suppress default close button since gallery renders its own X button"
  - "DELETE /api/saved-listings uses query param (mlsId=N) not body — body-less DELETE is more conventional and avoids fetch body issues"
  - "onOpenChange wrapped as (open) => setLightboxOpen(open) to avoid base-ui's second eventDetails parameter causing type errors"
metrics:
  duration: "~12min"
  completed_date: "2026-04-15"
  tasks_completed: 2
  tasks_total: 2
  files_created: 7
  files_modified: 0
---

# Phase 02 Plan 07: Listing Detail Page Hero Components Summary

**One-liner:** Full-width 5-photo gallery with lightbox, price/address hero with sticky CTA sidebar, self-contained save-home action row, spec grid, description with Read More, features list, and mobile sticky bottom bar.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | ListingGallery + ListingHero + self-contained ListingActionRow | c64c937 | listing-gallery.tsx, listing-hero.tsx, listing-action-row.tsx |
| 2 | ListingSpecGrid + ListingDescription + ListingFeaturesList + MobileDetailStickyBar | 0ab1ff0 | listing-spec-grid.tsx, listing-description.tsx, listing-features-list.tsx, mobile-detail-sticky-bar.tsx |

## Decisions Made

1. **Self-contained ListingActionRow** — The component owns auth state (Clerk `useUser`), initial saved-state fetch (`GET /api/saved-listings?mlsId=N` on mount), and all API writes. The parent (`ListingHero`) only passes `mlsId`. This eliminates the prop-threading problem where isSaved/isAuthenticated/onSave would be `undefined` at the page level.

2. **Dialog lightbox with custom close** — Used `showCloseButton={false}` on `DialogContent` to suppress the default shadcn close button. The gallery renders its own absolutely-positioned X button with correct placement for full-screen mode.

3. **DELETE with query param** — The unsave action calls `DELETE /api/saved-listings?mlsId=N` (query param) rather than passing body, which is more REST-conventional for DELETE operations.

4. **base-ui `onOpenChange` wrapper** — base-ui's `onOpenChange` signature is `(open, eventDetails)`. Used `(open) => setLightboxOpen(open)` wrapper to avoid the second parameter causing TypeScript issues.

## Deviations from Plan

None — plan executed exactly as written. The only implementation difference from the plan code was the `onOpenChange` wrapper pattern (using `(open) => setLightboxOpen(open)` instead of directly passing `setLightboxOpen`) which was required by base-ui's two-parameter signature discovered from existing `search-filters.tsx` usage.

## Verification

- `npx tsc --noEmit` passes (exit 0)
- `npm run build` passes cleanly (7 static/dynamic routes, no errors)
- All 7 files created and exported
- ListingActionRow: `"use client"`, imports `useUser`, dispatches `require-sign-in`, calls `/api/saved-listings`, accepts only `{ mlsId: number }`
- ListingHero: calls `<ListingActionRow mlsId={listing.mls_id} />` with no other props
- ListingGallery: desktop `hidden lg:grid grid-cols-4`, mobile `lg:hidden`, Dialog lightbox
- MobileDetailStickyBar: `lg:hidden fixed bottom-0`, 72px height, DOM label, Contact Agent

## Known Stubs

- `handleScheduleTour` in `listing-action-row.tsx` and `handleContactAgent` — show `toast.info` placeholder. These are explicitly deferred to Phase 9 per plan context. No data flows to UI from these stubs.
- `onContactAgent` prop in `mobile-detail-sticky-bar.tsx` — caller (plan 02-11 detail page) will wire this to a toast or modal. The component interface is complete; the behavior is a Phase 9 concern.

## Threat Flags

None. All listing data (remarks, address) is rendered via React JSX text nodes — no `dangerouslySetInnerHTML` used. The `/api/saved-listings` route enforces Clerk `auth()` server-side; `useUser` in `ListingActionRow` is UX-only gating.

## Self-Check: PASSED

- src/components/listings/listing-gallery.tsx — FOUND
- src/components/listings/listing-hero.tsx — FOUND
- src/components/listings/listing-action-row.tsx — FOUND
- src/components/listings/listing-spec-grid.tsx — FOUND
- src/components/listings/listing-description.tsx — FOUND
- src/components/listings/listing-features-list.tsx — FOUND
- src/components/listings/mobile-detail-sticky-bar.tsx — FOUND
- Commit c64c937 — FOUND
- Commit 0ab1ff0 — FOUND
