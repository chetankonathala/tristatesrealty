# Phase 2: IDX Listings Engine - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Full Bright MLS IDX feed live — buyers can search, filter, and view every active listing in DE, MD, NJ, PA exactly like Zillow. Listings are the core product; search, map, and detail pages are all in scope. Buyer account features (saved listings, saved searches) are in scope. AI recommendations, market analytics, and offer pipeline are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Search Page Layout
- **D-01:** Map right (40%), list left (60%) on desktop — Zillow split ratio
- **D-02:** Search-as-you-move (Zillow-style) — panning/zooming the map updates the list in real time; "Search this area" button appears when user moves map
- **D-03:** Mobile default: list-first. Sticky "Show Map" button at the bottom toggles to full-screen map with bottom drawer for cards
- **D-04:** Clicking a map pin highlights the corresponding listing card in the list (and scrolls to it)

### Filter Panel UX
- **D-05:** Desktop: sticky top bar with 4 key filter pills — Price · Beds · Baths · Home Type — plus a "More filters" button that opens a modal for all advanced filters (sqft, waterfront, school district, lot size, garage, new construction, county/city/zip)
- **D-06:** Uses existing `filter-pill.tsx` component for the top bar pills
- **D-07:** Mobile: "Filters" button triggers a bottom Sheet drawer (shadcn Sheet component, already installed)
- **D-08:** All filter state stored in URL search params (nuqs) so searches are shareable/bookmarkable

### Listing Detail Page Structure
- **D-09:** Full-width photo gallery hero at the top — photos take the full width; lightbox opens on click (using existing Dialog/framer-motion)
- **D-10:** Key stats (price, address, beds/baths/sqft) appear directly below the hero gallery
- **D-11:** Sticky right sidebar with price + CTA buttons (Schedule Tour, Make Offer) that stays visible as user scrolls — standard Redfin/Compass conversion pattern
- **D-12:** Content section order below the hero: Description → Property details → Price history → Comparable sales → Google Street View → MLS attribution + Fair Housing

### Saved Search Alerts
- **D-13:** Four trigger events: (1) new listing matches saved search criteria, (2) price drop on a matching listing, (3) status change Active → Pending on a match, (4) new open house scheduled on a matching listing
- **D-14:** Save-search UX: heart/bell icon in the search page top bar saves the current filter state in one click — no naming required, no modal. Saved searches are listed in the buyer dashboard
- **D-15:** Notification channels: email (Resend) + SMS (Twilio) — buyer can configure preference in dashboard

### Claude's Discretion
- Exact photo gallery thumbnail layout and count (grid vs. strip vs. main+grid)
- Loading skeleton design for listing cards and detail page
- Map marker/pin visual design and hover states
- Cluster bubble styling (count badges on map)
- Price range slider UI implementation details
- Exact email template design for saved search alerts
- Error state designs (no results, API timeout, etc.)
- Animation timings for map transitions and card reveals

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### IDX Requirements
- `.planning/REQUIREMENTS.md` §IDX Listings — IDX-01 through IDX-10, full acceptance criteria
- `.planning/phases/02-idx-listings-engine/02-RESEARCH.md` — Technical research: SimplyRETS API, stack decisions, architecture patterns, Supabase sync strategy

### Project Foundation
- `.planning/PROJECT.md` — Design system: luxury dark palette, Playfair Display + Montserrat, mobile-first, Core Web Vitals green
- `.planning/ROADMAP.md` §Phase 2 — Phase prerequisites (broker IDX auth, Bright MLS license), success criteria

### No external ADRs yet — requirements fully captured above

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/cards/listing-card.tsx` — Listing card component exists; extend with save/favorite button for D-14
- `src/components/map/map-container.tsx` — Map container exists with react-map-gl; extend with supercluster markers for D-01/D-02
- `src/components/map/index.tsx` — Dynamic import wrapper (preserves SSR compatibility)
- `src/components/ui/filter-pill.tsx` — Filter pill component ready for D-05/D-06
- `src/components/ui/sheet.tsx` — Sheet component for mobile filter drawer (D-07)
- `src/components/ui/dialog.tsx` — Dialog component for photo lightbox and "More filters" modal
- `src/components/ui/skeleton.tsx` — Skeleton loader for listing cards
- `src/components/ui/select.tsx` — Select for filter dropdowns
- `src/lib/supabase/` — Client and server Supabase instances (client.ts + server.ts split pattern)
- `src/lib/fonts.ts` — Font definitions (Playfair Display + Montserrat)
- Framer Motion, Lucide React, react-hook-form, zod — all installed from Phase 1

### Established Patterns
- Split Supabase client pattern: `src/lib/supabase/client.ts` (browser) + `src/lib/supabase/server.ts` (server with async cookies)
- Dark-first design: `app/globals.css` defines root dark palette; all new components follow this
- Clerk auth: role-gated pages use `(auth)/` route group pattern
- Type assertion for Clerk `sessionClaims.metadata.role` (publicMetadata requires cast)
- Tailwind v4 CSS-first config (no `tailwind.config.ts` — use CSS variables and `@theme` in globals.css)

### Integration Points
- New `app/listings/page.tsx` (search page) + `app/listings/[mlsId]/page.tsx` (detail, ISR)
- New `app/api/listings/sync/route.ts` (Vercel Cron, polls SimplyRETS every 15 min → Supabase)
- New `app/api/listings/revalidate/route.ts` (on-demand ISR revalidation trigger)
- New `app/api/saved-searches/notify/route.ts` (Vercel Cron, checks new listings against saved searches)
- Extends `src/components/cards/listing-card.tsx` (add save button for Clerk-authenticated users)
- Extends `src/components/map/map-container.tsx` (add supercluster + marker click handlers)

</code_context>

<specifics>
## Specific Ideas

- "Exactly like Zillow" — search-as-you-move map is the defining feature, not a nice-to-have
- Sticky CTA sidebar on detail page (Schedule Tour, Make Offer) — critical for conversion, Redfin/Compass pattern
- Bell/heart icon for saving searches should be one click from the search page top bar — zero friction
- All 4 saved search alert triggers (new listing, price drop, pending status, new open house) are wanted — not just new listings

</specifics>

<deferred>
## Deferred Ideas

- Buyer dashboard for managing saved searches — Phase 4 (Buyer Accounts)
- AI-powered "homes you may like" recommendations — Phase 4
- Natural language search ("find 4-bed near good schools under $600k") — Phase 4
- 3D Matterport virtual tour embeds on detail pages — Phase 9
- Open house scheduling/booking flow — Phase 9
- Mortgage pre-qual widget on detail page — Phase 6

</deferred>

---

*Phase: 02-idx-listings-engine*
*Context gathered: 2026-04-13*
