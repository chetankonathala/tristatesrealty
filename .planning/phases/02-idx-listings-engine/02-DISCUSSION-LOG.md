# Phase 2: IDX Listings Engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the discussion.

**Date:** 2026-04-13
**Phase:** 02-idx-listings-engine
**Mode:** discuss
**Areas covered:** Search page layout, Filter panel UX, Listing detail page structure, Saved search alerts

---

## Gray Areas Presented

| Area | Selected |
|------|----------|
| Search page layout | ✓ |
| Filter panel UX | ✓ |
| Listing detail page structure | ✓ |
| Saved search alerts | ✓ |

---

## Decisions Made

### Search Page Layout

| Question | User Choice |
|----------|-------------|
| Map/list interaction | Search-as-you-move (Zillow-style) — map pan/zoom updates list in real time |
| Desktop split | Map right, list left (60/40) |
| Mobile default | List-first with sticky "Show Map" toggle button |

### Filter Panel UX

| Question | User Choice |
|----------|-------------|
| Desktop filter layout | Top bar with 4 key pills + "More filters" modal |
| Visible top bar filters | Price · Beds · Baths · Home Type (standard Zillow set) |
| Mobile filter UX | Bottom Sheet drawer (shadcn Sheet) |

### Listing Detail Page

| Question | User Choice |
|----------|-------------|
| Hero layout | Full-width photo gallery hero (Zillow-style) |
| Sticky panel | Yes — sticky sidebar with price + CTA (Schedule Tour, Make Offer) |
| Section order | Description → Property details → Price history → Comps → Street View → MLS info |

### Saved Search Alerts

| Question | User Choice |
|----------|-------------|
| Trigger events | All 4: new listing, price drop, status change (Active→Pending), new open house |
| Save-search UX | One-click bell/heart icon in top bar — no naming modal required |

---

## Corrections

No corrections — all options were selected from presented choices.

---

## Prior Decisions Applied

- Luxury dark aesthetic (black/charcoal/gold) from PROJECT.md — applied to filter bar, detail page, map markers
- Mobile-first layout from PROJECT.md — drives mobile list-first default and Sheet drawer pattern
- Playfair Display + Montserrat typography from PROJECT.md — applies to listing titles and price display
