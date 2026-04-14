---
phase: 2
slug: idx-listings-engine
status: draft
shadcn_initialized: true
preset: inherited-from-phase-01
created: 2026-04-13
revised: 2026-04-13
inherits: 01-UI-SPEC.md
---

# Phase 2 — UI Design Contract: IDX Listings Engine

> Visual and interaction contract for the IDX Listings Engine phase. This phase inherits the complete design system from Phase 1 (`01-UI-SPEC.md`) and extends it with listing-search, listing-detail, map, filters, gallery, and saved-search contracts. Any token not explicitly overridden here defaults to the Phase 1 contract.

**Source artifacts consulted:**
- CONTEXT.md: not present (no `/gsd-discuss-phase` output)
- REQUIREMENTS.md: IDX-01 through IDX-10
- 02-RESEARCH.md: SimplyRETS + Supabase cache, react-map-gl + supercluster, nuqs URL state, Resend alerts
- 01-UI-SPEC.md: luxury dark system, OKLCH palette, Playfair + Montserrat, shadcn

**Revision 2 notes (2026-04-13):**
- Added social-sharing contract: dynamic OG image component and meta-tag contract for listing detail pages (closes IDX-07 + SEO-02 partial coverage from Phase 2 side).
- Added `SignInRequiredModal` component — previously referenced only in copywriting for the Save button.
- Added `MobileDetailStickyBar` as a named component (previously mentioned only in layout notes).
- Clarified `ListingGallery` "View all photos" CTA is a button not a link.
- Added a Requirements Traceability table at the end of the component inventory so the checker can confirm every IDX-xx requirement has at least one component contract.

**Revision 3 notes (2026-04-13):**
- Typography fix: `MobileDetailStickyBar` price changed from Heading 20px gold to Body 16px weight 700 gold tabular-nums. Removes the accidental 5th font size (20px) and restores the 4-size scale (12 / 16 / 28 / 48) inherited from Phase 1. No new sizes introduced in Phase 2.
- Added explicit primary visual anchor sentence for the search page (Layout section).

---

## Design System

Inherited from Phase 1. No changes.

| Property | Value | Change From Phase 1 |
|----------|-------|---------------------|
| Tool | shadcn (initialized in Phase 1) | unchanged |
| Preset | custom dark luxury (OKLCH tokens in `globals.css`) | unchanged |
| Component library | Radix UI (via shadcn) | unchanged |
| Icon library | Lucide React | unchanged |
| Font (headings) | Playfair Display (700) | unchanged |
| Font (body) | Montserrat (400, 700) | unchanged |
| Animation library | Framer Motion v12 | unchanged |
| CSS framework | Tailwind CSS v4 (dark-first) | unchanged |
| Map library | react-map-gl 8.x + mapbox-gl 3.21 | unchanged (style: `mapbox://styles/mapbox/dark-v11`) |

**New libraries introduced this phase (visual-surface only):**
- `supercluster` + `use-supercluster` — geospatial marker clustering
- `nuqs` — type-safe URL search-param state for filters
- `@react-email/components` + `resend` — saved-search email templates
- `@vercel/og` — dynamic Open Graph image generation for listing detail pages (bundled with Next.js 16 App Router, no new install)

---

## Spacing Scale

Inherited from Phase 1 (4/8/16/24/32/48/64/96/128). No new tokens.

**Phase 2 specific usage rules:**

| Context | Spacing | Source Token |
|---------|---------|--------------|
| Filter panel internal gap (desktop sidebar) | 16px | md |
| Filter pill row gap | 8px | sm |
| Listing card grid gap (search results) | 24px | lg |
| Listing detail section gap (between hero, specs, desc, comps, map) | 48px | 2xl |
| Photo gallery thumbnail gap | 4px | xs |
| Photo gallery grid gap (desktop 5-photo collage) | 8px | sm |
| Map marker cluster min touch target | 44px diameter | exception |
| Filter sheet (mobile) top/bottom padding | 24px | lg |
| Detail page max content width | 1280px | inherited |
| Split layout (map + list) min list column | 480px | exception |
| Mobile sticky contact bar height | 72px | exception (matches nav) |

Exceptions: map marker touch targets enforce 44px even though content circle may render at 32px (invisible hit area extends to 44px). Mobile sticky contact bar is 72px to mirror the desktop nav height and stay above the home indicator on iOS.

---

## Typography

Inherited from Phase 1. **No new sizes or weights are introduced in Phase 2.** Every Phase 2 element resolves to one of the 4 sizes (12 / 16 / 28 / 48) and 2 weights (400 / 700) defined in the Phase 1 contract.

**Phase 2 specific role assignments (all resolve to existing tokens):**

| Element | Role | Size | Weight | Notes |
|---------|------|------|--------|-------|
| Listing card price | Tertiary heading | 16px | 700 | Montserrat, gold accent color, tabular-nums |
| Listing card address | Body | 16px | 400 | `--foreground` |
| Listing card meta (beds/baths/sqft) | Label | 12px | 400 | `--muted-foreground`, uppercase, letter-spacing 0.05em |
| Listing card badge ("New", "Price Reduced") | Label | 12px | 700 | uppercase, 0.05em |
| Search page result count ("1,248 homes") | Body | 16px | 700 | `--foreground` |
| Filter section label | Label | 12px | 700 | uppercase, 0.05em, `--muted-foreground` |
| Filter chip text | Body | 16px | 400 | `--foreground` (becomes 700 when selected) |
| Detail page price (hero line) | Display | 48px / 32px mobile | 700 | Playfair, tabular-nums, `--foreground` (NOT gold — detail price is informational hero, not CTA). Mobile 32px resolves to the Phase 1 Display-mobile token — no new size. |
| Detail page address (below price) | Heading | 28px / 24px mobile | 700 | Playfair (mobile 24px resolves to Phase 1 Heading-mobile token) |
| Detail page beds/baths/sqft strip | Body | 16px | 700 | `--foreground` with icon prefix |
| Detail page section headings ("Description", "Features", "Location") | Heading | 28px / 24px mobile | 700 | Playfair |
| Detail page description body | Body | 16px | 400 | line-height 1.6 |
| Mobile sticky bar price | Body | 16px | 700 | Montserrat, gold accent, tabular-nums — same token as listing card price |
| Price history row | Body | 16px | 400 | date in `--muted-foreground`, price in `--foreground` tabular-nums |
| MLS attribution footer on detail | Label | 12px | 400 | `--muted-foreground`, NOT uppercase (legal text must be readable) |
| OG image price | Display | 96px (render time) | 700 | Playfair, tabular-nums, gold on near-black, rendered via @vercel/og. Render-time only — NOT a live web-surface token, does not count toward the on-page type scale. |
| OG image address | Heading | 40px (render time) | 700 | Playfair white. Render-time only — NOT a live web-surface token. |
| Saved-search email subject | n/a | n/a | n/a | "{count} new homes match '{search-name}'" |

Tabular-nums (`font-variant-numeric: tabular-nums`) is required for all prices, square footage, and statistics to prevent column jitter across listings.

**Type-scale audit (Phase 2 live web surfaces only):** 12, 16, 28, 48. Count = 4. Matches Phase 1 exactly. OG image render-time sizes (96, 40, 28, 24) are generated inside a server-rendered image via `@vercel/og` and never shipped as CSS — they are excluded from the live type scale by design.

---

## Color

Inherited from Phase 1. No new palette tokens except `--warning` (see note below).

**60 / 30 / 10 split — re-confirmed for Phase 2 (unchanged from Phase 1):**

| Ratio | Role | Token | Phase 2 Surfaces |
|-------|------|-------|------------------|
| 60% | Dominant surface | `--background` (near-black `#0A0A0A`) | Search page body, listing detail page body, map container background, filter sheet background on mobile |
| 30% | Secondary surface | `--card` / `--muted` (`#141414` / `#1C1C1C`) | Filter sidebar, listing cards, detail spec grid cells, comparable sales cards, MLS attribution strip, modals, popovers, lightbox chrome |
| 10% | Accent | `--accent` (gold `#C9A84C`) | Reserved-for list below — price, selected filter, map pin, saved heart, etc. |

The Phase 2 ratio is identical to Phase 1. No surface in Phase 2 changes the dominant/secondary balance.

**Phase 2 specific accent usage (extends the Phase 1 reserved list):**

Gold accent (`--accent` #C9A84C) is used in Phase 2 ONLY for:

1. Listing card price (already in Phase 1 reserved list, confirmed)
2. Selected filter pill background (already reserved)
3. Map marker pin fill (already reserved via MapContainer contract)
4. "Save to Favorites" heart icon — filled state only (empty heart uses `--muted-foreground`)
5. "New" and "Featured" badges on listing cards
6. Active view-toggle indicator ("Map" vs "List" — active tab underline)
7. Primary CTA on saved-search alert email ("View New Homes")
8. Focus ring on interactive filter controls (at 50% opacity)
9. OG image wordmark + price (social sharing surface — not a live web surface, does not count toward on-page 10% budget)

Gold accent must NOT be used in Phase 2 for:
- Listing detail page hero price (uses `--foreground` — the price is a headline, not an action)
- Listing detail hero background overlays
- Map polygon fills (use `--accent` at 15% opacity only for the "search area" rectangle)
- Comparable sales table rows (no row-level accent highlighting)

**New state color assignments (all resolve to existing palette):**

| State | Token | Usage in Phase 2 |
|-------|-------|------------------|
| Listing status: Active | `--success` #16A34A | small dot indicator on card corner |
| Listing status: Pending | `--warning` #F59E0B (new token — see note below) | badge background with dark text |
| Listing status: Sold / Closed | `--muted-foreground` | desaturated badge |
| Price reduced indicator | `--destructive` #DC2626 | down-arrow icon + "Price reduced" label |
| Saved (favorited) | `--accent` #C9A84C | filled heart |
| Unsaved | `--muted-foreground` | outlined heart |
| Search area on map | `--accent` at 15% opacity | polygon fill, 2px `--accent` stroke |

**Pending status warning color exception:** The Phase 1 palette has no "warning" token. Adding `--warning: #F59E0B` is the ONLY new CSS variable this phase introduces. Rationale: "Pending" is a legally-distinct MLS status that must be visually differentiated from Active (green) and Closed (gray), and reusing gold would conflict with the reserved-for list. `--warning` is NOT counted toward the 10% accent budget — it is a status-only token used on compact badges (under ~2% of pixel area).

---

## Component Inventory (Phase 2 Deliverables)

### Search Page Components

| Component | Variants | Contract |
|-----------|----------|----------|
| `SearchFilters` (desktop sidebar) | expanded, collapsed | 320px fixed width, `--card` background, 1px `--border` right edge, sticky below nav. Sections collapsible with chevron. Section gap 24px, internal gap 16px. |
| `SearchFilters` (mobile sheet) | closed, open | Bottom sheet via shadcn `Sheet`. Full-width. Drag handle top center. "Apply Filters (N)" primary CTA fixed bottom. Close on outside tap or swipe down. |
| `FilterPill` | default, selected, range (dual-value) | Inherits Phase 1 `FilterPill`. Range variant shows "Min – Max" text. Selected has gold background `--accent-muted`, 1px `--accent` border, `--accent` text. |
| `PriceRangeSlider` | default | shadcn `Slider` dual-handle. Track: `--muted`. Active range: `--accent`. Handles: `--accent` circles 20px diameter with white 2px inner ring. Value labels below in tabular-nums. |
| `BedsBathsSelector` | default | Segmented control. "Any / 1+ / 2+ / 3+ / 4+ / 5+". Selected segment: `--accent-muted` background, `--accent` text. |
| `PropertyTypeChips` | multi-select | Chip row (wraps). "House / Condo / Townhouse / Multi-Family / Land / New Construction". Multi-select with checkmark icon when selected. |
| `LocationSearch` | default, with-suggestions | Autocomplete input. Mapbox Geocoding API for city/zip/county suggestions. Dropdown: `--card` with 1px `--border`, 8px radius, shadow. Hover row: `--muted`. Selected: `--accent-muted`. |
| `SearchResultsHeader` | default | "1,248 homes in Delaware" (Body 16px weight 700) + sort dropdown right-aligned. Sort options: Newest, Price ↓, Price ↑, Beds, Sqft. |
| `ViewToggle` | map-active, list-active, split-active | Segmented control top-right of results. Icons + text labels pairing: Lucide `Map` + "Map", Lucide `List` + "List", Lucide `Columns` + "Split". Text labels ALWAYS accompany icons on desktop (lg+); on mobile (<lg) the control collapses to icon-only with `aria-label="Map view"`, `aria-label="List view"`, `aria-label="Split view"` fallbacks. Active indicator: gold underline 2px. Desktop defaults to split. Mobile defaults to list (with "Map" toggle button). |
| `ListingCard` (compact) | default, saved, featured, price-reduced | Extends Phase 1 `ListingCard`. 4:3 image with photo counter pill bottom-left ("1 / 24"). Status dot top-right. Heart button top-right (overlays image). Price, address, meta row. Max 2-line address with ellipsis. |
| `ListingCardSkeleton` | default | Same dimensions as card. Shimmer image block + 3 text bars. |
| `SearchMap` | full, split, hidden | react-map-gl container. Dark-v11 style. Clustered markers via supercluster (render cluster circles with count). Single markers: gold pin. Selected: accent-hover + pulse. Popup on click: ListingCard compact variant inside Mapbox popup. |
| `MapCluster` | small (1–10), medium (10–100), large (100+) | Circle with count. Diameter: 32 / 40 / 52px. Background: `--accent` at 60% / 75% / 90% opacity. White text, tabular-nums, 14px bold. 44px invisible hit target. |
| `MapMarker` | default, hover, selected, viewed | Gold pin (Lucide `MapPin` filled 32px). Selected: accent-hover with pulse ring (200ms). Viewed (buyer has opened detail): desaturated to 60% opacity. |
| `SavedSearchButton` | default, saved | Top of filter panel. "Save This Search" ghost button with bookmark icon. When saved: becomes "Saved" with filled bookmark in gold. Click opens modal to name it. |
| `SavedSearchModal` | create, edit | shadcn `Dialog`. Inputs: name, alert frequency (instant / daily / weekly), channels (email, SMS). Primary CTA "Save Search". |
| `ActiveFilterBar` | empty, has-filters | Row above results. Chips showing active filters with X to remove. "Clear all" ghost button right-aligned. Hidden when empty. |
| `PaginationControl` | default | Infinite scroll on mobile (intersection observer + skeleton loader). "Load More" button on desktop (secondary variant). Shows "Showing 1–24 of 1,248". |
| `EmptyState` | no-results, error | Centered. Icon 48px in `--muted-foreground`. Heading + body + CTA. Copy from Copywriting Contract below. |
| `SignInRequiredModal` | default | shadcn `Dialog`. Triggered when signed-out user clicks Save on a listing or saves a search. Heading: "Sign in to save homes". Body: "Create a free account to save listings, get alerts on new matches, and pick up where you left off." Primary CTA: "Sign In" (routes to Clerk sign-in with return URL). Secondary ghost CTA: "Create Account". Close X top-right. |

### Listing Detail Page Components

| Component | Variants | Contract |
|-----------|----------|----------|
| `ListingGallery` | desktop (5-photo collage), mobile (carousel), lightbox | Desktop: 1 large (60%) + 4 small grid. "View all {N} photos" button (outline variant, 36px height, absolute bottom-right over last thumbnail with 16px inset). Mobile: horizontal swipeable carousel with photo counter pill. Lightbox: full-screen shadcn `Dialog`, dark overlay, photo + prev/next arrows + counter + close X. |
| `ListingHero` | default | Below gallery. Left: price (Display 48px), address (Heading 28px), beds/baths/sqft strip. Right: action buttons (Save, Share, Contact Agent, Schedule Tour). On mobile stacks vertically. Sticky contact button bar at bottom on mobile (see `MobileDetailStickyBar`). |
| `ListingActionRow` | default | Horizontal button group: Save Home (outline + heart), Share Listing (ghost + share icon), Print (ghost + printer icon), Contact Agent (primary). 44px height. |
| `MobileDetailStickyBar` | default | Mobile-only (<lg). Fixed bottom, 72px tall, `--card` background with 1px `--border` top and backdrop-blur. Left: price (Body 16px weight 700 gold, tabular-nums) + "DOM {n}" label (Label 12px, `--muted-foreground`). Right: "Contact Agent" primary button (36px height). Hidden when keyboard open. Slides up 200ms ease-out on first scroll past hero. |
| `ListingSpecGrid` | default | 2-column grid on mobile, 4-column on desktop. Each cell: label (12px uppercase muted) above value (16px weight 700). Fields: MLS #, Lot Size, Year Built, Property Type, Days on Market, HOA, Garage, Heating. |
| `ListingDescription` | default, expanded | Body 16px line-height 1.6. Truncated at 8 lines with fade-to-background gradient. "Read more" text link below expands. |
| `ListingFeaturesList` | default | Two-column bullet grid on desktop (single column mobile). Check icon (Lucide `Check` 16px in accent) before each feature. Grouped by category: Interior, Exterior, Community. |
| `PriceHistoryTable` | default, empty | Table: Date | Event | Price | % Change. Muted borders between rows. Tabular-nums for prices. Down-arrow `--destructive` for decreases, up-arrow `--success` for increases. Empty: "No price history available." |
| `OpenHouseCard` | default, empty | Gold-accented card (`--accent-muted` left border 3px). Date, time range, "Add to calendar" ghost button. Empty variant hidden. |
| `StreetViewEmbed` | default | Google Maps Embed API iframe. 16:9 aspect, 8px border radius, 1px `--border`. Loading skeleton before load. Label above: "Street View" (Heading). |
| `LocationMap` | default | react-map-gl embedded mini-map (400px height). Single gold marker at listing coordinates. Dark-v11 style. Zoom controls bottom-right only (no geocoder). "View on map" link opens map search filtered to nearby. |
| `ComparableSalesGrid` | default, empty | 3-column card grid (1-col mobile). Uses `ListingCard` (compact). Heading: "Comparable Recent Sales". Subtitle: "Homes sold within 1 mile in the last 6 months." Empty: "No comparable sales found in this area." |
| `MLSAttribution` | default | Full-width strip at page bottom above footer. `--card` background, 1px `--border` top. Contains: Fair Housing logo (left), "Listing provided by {firm name}" (center), Bright MLS copyright + last updated timestamp (right). Label size 12px, NOT uppercase. |
| `JsonLdScript` | `application/ld+json` | RealEstateListing schema injected via `<Script>`. Invisible — contract only ensures it exists and contains price, address, photos, beds, baths, sqft, description. |
| `ListingOpenGraphImage` | default, price-reduced, pending | Route handler at `app/listings/[mlsId]/opengraph-image.tsx` using `@vercel/og`. 1200×630. Composition: full-bleed hero photo (primary listing photo) with 60% dark gradient overlay from bottom. Bottom-left stack: "TRI STATES REALTY" wordmark 24px gold letter-spacing 0.1em, address 40px Playfair white, price 96px Playfair gold tabular-nums, beds/baths/sqft strip 28px white 400. Variant badges top-right: "PRICE REDUCED" destructive, "PENDING" warning. Edge insets 64px. Cached per mls_id; regenerated on price change. |
| `ListingMeta` | default | Not a rendered component — a `generateMetadata` function contract. Must emit: `title` ("{beds} bed {baths} bath home at {address} — ${price} — Tri States Realty"), `description` (first 160 chars of remarks), `openGraph.images` pointing to `ListingOpenGraphImage`, `twitter.card: "summary_large_image"`. |
| `ContactAgentForm` | default, submitted, error | Slide-over `Sheet` from right on desktop, bottom sheet on mobile. Fields: name, email, phone, message (pre-filled "I'm interested in {address}"). Primary CTA "Send Message". Success state: checkmark icon + "Message sent. {Agent} will reach out within 2 hours." |
| `ScheduleTourForm` | default, submitted | Similar to ContactAgentForm but with date picker (shadcn `Calendar`) and time-slot selector. |

### Saved-Search Alert Email (React Email template)

| Component | Contract |
|-----------|----------|
| `SavedSearchAlertEmail` | React Email. Subject: "{count} new homes match '{search name}'". Dark theme: `#0A0A0A` body, `#141414` card, `#F5F5F0` text, `#C9A84C` accent. Header: Tri States Realty wordmark (gold). Body: "{count} homes just came on the market matching your search." Grid of up to 6 listing cards (image, price, address, beds/baths/sqft). Each card links to listing detail. Footer: "Manage this alert" ghost link + unsubscribe link + Fair Housing attribution. Mobile-responsive (single column under 600px). Fonts: system fallback stack (email clients rarely support custom fonts — use `Georgia, serif` for headings, `Helvetica, Arial, sans-serif` for body). |

### Requirements Traceability

| Requirement | Components Satisfying It |
|-------------|--------------------------|
| IDX-01 (Bright MLS feed) | Backend — no UI contract required |
| IDX-02 (15-min sync + ISR) | Backend — no UI contract required |
| IDX-03 (search + map/list toggle) | `SearchMap`, `ListingCard`, `ViewToggle`, `SearchResultsHeader` |
| IDX-04 (advanced filters) | `SearchFilters`, `PriceRangeSlider`, `BedsBathsSelector`, `PropertyTypeChips`, `LocationSearch`, `ActiveFilterBar`, `FilterPill` |
| IDX-05 (detail, gallery, DOM, price history, open houses) | `ListingGallery`, `ListingHero`, `ListingSpecGrid`, `ListingDescription`, `ListingFeaturesList`, `PriceHistoryTable`, `OpenHouseCard`, `MobileDetailStickyBar` |
| IDX-06 (Street View) | `StreetViewEmbed` |
| IDX-07 (JSON-LD + SEO) | `JsonLdScript`, `ListingMeta`, `ListingOpenGraphImage` |
| IDX-08 (comps) | `ComparableSalesGrid` |
| IDX-09 (MLS attribution + Fair Housing) | `MLSAttribution` (plus `--warning` token for Pending status) |
| IDX-10 (saved searches + alerts) | `SavedSearchButton`, `SavedSearchModal`, `SavedSearchAlertEmail`, `SignInRequiredModal` |

---

## Layout & Responsive Framework

Inherited from Phase 1 breakpoints (sm 640, md 768, lg 1024, xl 1280, 2xl 1536).

**Primary visual anchor (search page):** the map panel, which occupies the dominant viewport area on desktop. The filters sidebar (320px fixed) and the results column sit to the left of the map; the map fills all remaining horizontal space (minimum 480px, typically ~55–60% of viewport at xl). On mobile, the map is a toggle-away view — the listing list is the default anchor and the "Map" button promotes the map to full-viewport when tapped.

**Primary visual anchor (listing detail page):** the hero gallery collage, which spans the full content width (1280px) immediately below the nav and is the first element the buyer sees.

### Search Page Layout

```
[Navbar — sticky, solid on scroll after 80px]
[ActiveFilterBar — sticky below nav when filters applied]
[Split layout: SearchFilters (320px) | Results column | SearchMap (40% min 480px, primary visual anchor on desktop)]
  - Results column: SearchResultsHeader + ViewToggle, then ListingCard grid (2-col) or list
  - Min viewport for split: lg (1024px+)
[Mobile (<lg): Stacked]
  - Top: SearchResultsHeader + "Filters (N)" button + ViewToggle
  - Toggle between SearchMap (full viewport - nav) and ListingCard list (1-col)
  - Filters open as bottom Sheet
```

### Listing Detail Page Layout

```
[Navbar]
[ListingGallery — full bleed on mobile, 1280px centered on desktop]
[ListingHero — 1280px max-width, 2xl (48px) padding-top]
  - Left column (60%): price, address, specs strip, description
  - Right column (40%, sticky): action buttons, agent card, contact button
  - Mobile: stacks, MobileDetailStickyBar fixed at bottom
[2xl gap]
[ListingFeaturesList — 1280px, 2-col desktop, 1-col mobile]
[2xl gap]
[PriceHistoryTable + OpenHouseCard row]
[2xl gap]
[LocationMap + StreetViewEmbed row (50/50 desktop, stacked mobile)]
[2xl gap]
[ComparableSalesGrid]
[2xl gap]
[MLSAttribution — full bleed]
[Footer]
```

### Content Widths

| Context | Max Width | Padding |
|---------|-----------|---------|
| Search split layout | Full viewport (no max) | 0 (edge-to-edge) |
| Listing detail content | 1280px | 16 / 24 / 32px |
| Gallery (desktop) | 1280px | 0 |
| Gallery (mobile) | 100vw | 0 |
| Lightbox | 100vw × 100vh | 48px edge gutters for controls |
| MLS attribution strip | 100vw, content 1280px centered | 16 / 24 / 32px |
| OG image | 1200 × 630 (fixed) | 64px inset |

---

## Animation & Transitions

All animations use Framer Motion v12. `prefers-reduced-motion` disables all.

| Animation | Trigger | Duration | Easing | Details |
|-----------|---------|----------|--------|---------|
| Card hover lift | mouse enter | 200ms | ease-out | translate-y -2px, border-color to `--border-hover` (Phase 1 contract) |
| Card reveal (grid) | viewport entry | 400ms | ease-out | Fade + translate-y 16→0. Stagger 60ms per card. `once: true`. |
| Map marker drop-in (initial load) | viewport ready | 300ms | ease-out | Scale 0.5→1 + opacity 0→1. Stagger 20ms. |
| Marker selected pulse | click | 1200ms | ease-in-out | Ring expands from 0 to 32px then fades. Infinite loop until deselected. |
| Cluster zoom-in | cluster click | 400ms | ease-in-out | Mapbox `flyTo` with zoom change. Supercluster expansion. |
| Gallery lightbox open | click photo | 250ms | ease-out | Overlay fade 0→1, image scale 0.95→1 + fade. |
| Lightbox prev/next | arrow click | 200ms | ease-out | Current image slide-out opposite direction while new slides in. |
| Filter sheet (mobile) | toggle | 300ms | ease-out | Slide up from bottom (translate-y 100%→0) + overlay fade. |
| Filter pill toggle | click | 150ms | ease-out | Background color transition. Scale 1→0.97→1 tap feedback. |
| View toggle switch | click | 200ms | ease-in-out | Crossfade between map/list panels. |
| Save button heart fill | click | 250ms | ease-out | Scale 1→1.25→1 with color transition muted→gold. Brief particle sparkle (4 gold dots). |
| Price history row reveal | first paint | 300ms | ease-out | Stagger fade-in, 50ms per row. |
| Detail page section reveal | scroll | 500ms | ease-out | Fade + translate-y 24→0 at 20% intersection, `once: true`. |
| Mobile sticky bar slide-in | scroll past hero | 200ms | ease-out | translate-y 100%→0 once buyer scrolls past ListingHero bottom. |

**Performance constraint:** Map marker animations must be GPU-composited. Marker renders use `react-map-gl` symbol layer (WebGL) — NOT DOM marker elements — once count exceeds 100. Below 100, DOM markers with Framer Motion are acceptable.

---

## Copywriting Contract

### Search Page

| Element | Copy |
|---------|------|
| Page title | "Homes for Sale in DE, MD, NJ, PA" |
| Meta description | "Search every active home for sale in Delaware, Maryland, New Jersey, and Pennsylvania. Live MLS data updated every 15 minutes." |
| Results header (with count) | "{count} homes in {location}" |
| Results header (no location filter) | "{count} homes across the Tri States" |
| Sort label | "Sort by" |
| Sort options | "Newest", "Price: High to Low", "Price: Low to High", "Most Bedrooms", "Largest Sqft" |
| Filter section labels | "Price", "Beds & Baths", "Property Type", "Square Footage", "Lot Size", "More Filters" |
| "More Filters" contents | "Garage", "Waterfront", "New Construction", "School District", "Year Built" |
| Apply filters button | "Show {count} Homes" |
| Clear filters button | "Clear All" |
| Save search button (unsaved) | "Save This Search" |
| Save search button (saved) | "Search Saved" |
| Save search modal heading | "Get Alerted When New Homes Match" |
| Save search modal body | "We'll notify you the moment a new listing matches these filters." |
| Alert frequency label | "Alert me" |
| Alert frequency options | "Instantly", "Once a day", "Once a week" |
| Alert channel label | "Send alerts via" |
| Alert channel options | "Email", "Text message" |
| Save search primary CTA | "Save Search" |
| Empty state heading (no results) | "No Homes Match Your Search" |
| Empty state body (no results) | "Try widening your price range or removing a filter to see more listings." |
| Empty state CTA (no results) | "Clear Filters" |
| Error state heading | "We Couldn't Load Listings" |
| Error state body | "Our MLS feed is catching up. Refresh the page or try again in a moment." |
| Error state CTA | "Try Again" |
| Loading state | "Searching the Tri States..." |
| Map attribution | "Map data (C) Mapbox (C) OpenStreetMap" (Mapbox default — do not remove) |
| ViewToggle labels (desktop) | "Map", "List", "Split" |
| ViewToggle aria-labels (mobile icon-only) | "Map view", "List view", "Split view" |

### Listing Card

| Element | Copy |
|---------|------|
| New listing badge | "NEW" |
| Price reduced badge | "PRICE REDUCED" |
| Open house badge | "OPEN {day}" (e.g., "OPEN SAT") |
| Pending badge | "PENDING" |
| Sold badge | "SOLD" |
| Photo count pill | "{n} photos" |
| Save button tooltip (unsaved) | "Save this home" |
| Save button tooltip (saved) | "Saved" |
| Save button (signed out) | triggers `SignInRequiredModal` |

### Sign-In Required Modal

| Element | Copy |
|---------|------|
| Heading | "Sign in to save homes" |
| Body | "Create a free account to save listings, get alerts on new matches, and pick up where you left off." |
| Primary CTA | "Sign In" |
| Secondary CTA | "Create Account" |
| Dismiss affordance | Close X top-right (aria-label "Close dialog") |

### Listing Detail Page

| Element | Copy |
|---------|------|
| Page title (meta) | "{beds} bed {baths} bath home at {address} — ${price} — Tri States Realty" |
| Price label (a11y only) | "Listed price" |
| Save button | "Save Home" / "Home Saved" |
| Share button | "Share Listing" |
| Contact agent button (primary) | "Contact Agent" |
| Schedule tour button | "Schedule a Tour" |
| Description heading | "About This Home" |
| Description expand link | "Read more" / "Show less" |
| Features heading | "Features & Amenities" |
| Spec grid heading | "Property Details" |
| Price history heading | "Price History" |
| Price history empty | "No price history available for this listing." |
| Open house heading | "Upcoming Open House" |
| Open house CTA | "Add to Calendar" |
| Street view heading | "Street View" |
| Location map heading | "Location" |
| View on map link | "View on search map" |
| Comps heading | "Comparable Recent Sales" |
| Comps subheading | "Homes sold within 1 mile in the last 6 months" |
| Comps empty | "No comparable sales found in this area." |
| Gallery "view all" button | "View all {N} photos" |
| MLS attribution line 1 | "Listing provided by {firm name}" |
| MLS attribution line 2 | "(C) {year} Bright MLS. Information deemed reliable but not guaranteed." |
| MLS attribution last updated | "Last updated {relative time}" |
| Fair Housing alt text | "Equal Housing Opportunity" |

### Contact & Tour Forms

| Element | Copy |
|---------|------|
| Contact form heading | "Ask About This Home" |
| Contact form message placeholder | "I'm interested in {address}. Can we schedule a time to talk?" |
| Contact form primary CTA | "Send Message" |
| Contact form success | "Message sent. Your agent will reach out within 2 hours." |
| Contact form error | "We couldn't send your message. Please try again or call us directly." |
| Tour form heading | "Schedule a Tour" |
| Tour form date label | "Preferred date" |
| Tour form time label | "Preferred time" |
| Tour form primary CTA | "Request Tour" |
| Tour form success | "Tour requested. Your agent will confirm within 2 hours." |

### Saved-Search Alert Email

| Element | Copy |
|---------|------|
| Subject (1 match) | "A new home matches '{search name}'" |
| Subject (multiple) | "{count} new homes match '{search name}'" |
| Header wordmark | "TRI STATES REALTY" |
| Intro | "These just came on the market matching your search." |
| Primary CTA | "View New Homes" |
| Footer manage link | "Manage this alert" |
| Footer unsubscribe link | "Unsubscribe from this search" |
| Footer legal | "(C) {year} Tri States Realty. Listings from Bright MLS. Equal Housing Opportunity." |

### Destructive Actions (Phase 2)

| Action | Pattern |
|--------|---------|
| Delete saved search | Confirmation dialog. Heading: "Delete saved search?" Body: "You'll stop receiving alerts for '{name}'. This cannot be undone." "Keep Search" (ghost) + "Delete Search" (destructive variant). |
| Unsave a home | No confirmation (one-tap undo). Heart toggles to unfilled immediately. Toast: "Removed from saved homes · Undo" (undo ghost link, toast auto-dismiss 5s per Phase 1 contract). |
| Clear all filters | No confirmation. Filters clear immediately. Toast: "Filters cleared". |

---

## Accessibility Contract

Inherits Phase 1 base contract. Phase 2 additions:

| Requirement | Implementation |
|-------------|----------------|
| Map keyboard navigation | Tab focuses map container, arrow keys pan, +/- zoom, Enter selects focused marker. Announce marker details via aria-live when selected. |
| Marker accessibility | Each marker has `aria-label="{price} home at {address}, {beds} bed {baths} bath {sqft} sqft"`. Cluster: `aria-label="Cluster of {count} homes, press Enter to zoom in"`. |
| Lightbox | Focus trap when open. Escape closes. Left/Right arrows navigate. Close button has `aria-label="Close photo viewer"`. Image `alt` = "{address} photo {n} of {total}". |
| Filter controls | All sliders, selects, and chips are keyboard operable. Range slider announces value on change via `aria-valuetext`. |
| ViewToggle | Desktop (lg+) renders icon + visible text label pair. Mobile (<lg) collapses to icon-only buttons, each with `aria-label` matching the desktop text ("Map view", "List view", "Split view"). Active state announced via `aria-pressed="true"`. |
| Saved-search alerts | Email must pass WebAIM contrast checks on dark background. Plain-text alternative required (Resend multipart). |
| Street View iframe | `<iframe title="Google Street View of {address}">`. Loading skeleton has `aria-busy="true"`. |
| JSON-LD | Must NOT duplicate visible content in an accessible way that creates screen-reader noise. Use `<Script type="application/ld+json">` (Next.js `<Script>` strategy="afterInteractive"). |
| Price contrast | Gold price on `--card` background: 6.8:1 (passes AA). Detail page white price on dark: 18:1 (passes AAA). |
| Sign-in modal | Focus trap. Escape dismisses. Returns focus to triggering Save button on close. |
| Mobile sticky bar | Does NOT trap focus. Reachable via normal tab order after gallery. Does not overlap interactive elements in the hero. |

---

## Performance Budget

Inherits Phase 1 targets (LCP < 2.5s, CLS < 0.1, INP < 200ms). Phase 2 additions:

| Metric | Target | Strategy |
|--------|--------|----------|
| Search page TTI | < 3s on 4G mobile | RSC shell + client-hydrate filters + lazy-load map below-fold |
| Map first paint | < 1.5s after TTI | Dynamic import `react-map-gl`. Defer marker rendering until map loaded. |
| Marker rendering | 60fps pan/zoom with 1000+ pins | Supercluster clustering + WebGL symbol layer above 100 markers |
| Listing detail LCP | < 2s | ISR pre-built top 500. Hero image `next/image` priority + AVIF. |
| Gallery image lazy-load | below-fold only | First 5 photos eager, rest lazy with blur placeholder |
| Filter change debounce | 300ms | nuqs `throttleMs: 300` to prevent URL thrash on slider drag |
| Listing JSON payload | < 40KB gzipped per page | Strip unused SimplyRETS fields server-side before rendering |
| Saved-search cron latency | < 60s | Cron runs every 15 min after sync; notification fan-out in parallel via Resend batch |
| OG image generation | < 800ms cold, cached 24h | `@vercel/og` edge runtime + `Cache-Control: public, max-age=86400, s-maxage=86400` |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | slider, sheet, dialog, calendar, popover, command, tooltip, toast, separator, scroll-area, tabs | not required |
| No third-party registries | — | not applicable |

**Third-party visual libraries deliberately declined:**
- Aceternity UI map / gallery blocks — declined to keep registry risk at zero. Gallery and marker effects implemented via Framer Motion + custom Tailwind.
- react-photo-album — considered for gallery collage but shadcn `Dialog` + native CSS grid is sufficient.

---

## Inherited Contracts (Phase 1 — unchanged)

The following Phase 1 contracts apply unchanged to Phase 2 and are NOT re-specified here:

- Spacing scale (xs–5xl)
- Typography (4 sizes, 2 weights, Playfair + Montserrat)
- Core palette (dominant / secondary / muted / border / foreground / muted-foreground / accent / destructive / success) — plus `--warning` added this phase for pending status
- Button variants (primary, secondary, ghost, outline, destructive, icon-only)
- Form element base styles (Input, Select, FilterPill)
- Modal / Sheet base styles
- Skeleton shimmer animation
- Toast pattern
- Mapbox dark theme contract
- Breakpoint system
- Nav and Footer components

Any conflict between Phase 2 and Phase 1 must resolve to Phase 1 unless the Phase 2 contract explicitly states "override".

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending (revision 3 — awaiting re-verification by gsd-ui-checker)
