---
phase: 3
slug: schell-brothers-communities
status: draft
shadcn_initialized: true
preset: inherited-from-phase-01
created: 2026-04-16
inherits: 01-UI-SPEC.md
---

# Phase 3 — UI Design Contract: Schell Brothers Communities

> Visual and interaction contract for the Schell Brothers Communities phase. This phase inherits the complete design system from Phase 1 (`01-UI-SPEC.md`) and the patterns from Phase 2 (`02-UI-SPEC.md`). It introduces dedicated community showcase pages with video, amenities, floorplans, maps with POI, and tour lead capture. Any token not explicitly overridden here defaults to the Phase 1 contract.

**Source artifacts consulted:**
- CONTEXT.md: not present (no `/gsd-discuss-phase` output)
- REQUIREMENTS.md: SCHELL-01 through SCHELL-07
- 03-RESEARCH.md: Heartbeat API, communities table, ISR, YouTube facade, Mapbox POI, lead capture extension
- 01-UI-SPEC.md: luxury dark system, OKLCH palette, Playfair + Montserrat, shadcn, spacing scale
- 02-UI-SPEC.md: listing detail layout patterns, map contracts, copywriting standards, ContactAgentModal, LocationMap
- Codebase: `globals.css` (OKLCH tokens live), `components.json` (base-nova style), existing `CommunityCard`, `ContactAgentModal`, `LocationMap`

---

## Design System

Inherited from Phase 1. No changes.

| Property | Value | Change From Phase 1 |
|----------|-------|---------------------|
| Tool | shadcn (initialized, base-nova style) | unchanged |
| Preset | custom dark luxury (OKLCH tokens in `globals.css`) | unchanged |
| Component library | Base UI (via shadcn base-nova) | unchanged |
| Icon library | Lucide React | unchanged |
| Font (headings) | Playfair Display (700) via `--font-display` | unchanged |
| Font (body) | Montserrat (400, 700) via `--font-body` | unchanged |
| Animation library | Framer Motion v12 | unchanged |
| CSS framework | Tailwind CSS v4 (dark-first, `@theme inline`) | unchanged |
| Map library | react-map-gl 8.x + mapbox-gl 3.21 (dark-v11) | unchanged |

**New libraries introduced this phase (visual-surface only):**
- `react-lite-youtube-embed@3.5.1` -- YouTube facade pattern (click-to-load iframe, saves ~500KB per video)
- `@mapbox/search-js-react@1.5.1` -- Mapbox Search Box API for nearby POI category queries (schools, restaurants)

---

## Spacing Scale

Inherited from Phase 1 (4/8/16/24/32/48/64/96/128). No new tokens.

**Phase 3 specific usage rules:**

| Context | Spacing | Source Token |
|---------|---------|--------------|
| Community hero content padding (bottom) | 48px | 2xl |
| Community hero content padding (sides, desktop) | 32px | xl |
| Community hero content padding (sides, mobile) | 16px | md |
| Community page section gap (between hero, overview, amenities, etc.) | 64px desktop / 48px mobile | 3xl / 2xl |
| Amenities grid gap | 16px | md |
| Amenity chip internal padding | 8px 16px | sm / md |
| Floor plan card grid gap | 24px | lg |
| School info card gap | 16px | md |
| Video grid gap | 24px | lg |
| HOA info row internal gap | 8px | sm |
| Map container height (community detail) | 480px desktop / 320px mobile | exception |
| Tour form field gap | 16px | md |
| Tour CTA section padding | 48px vertical | 2xl |
| POI marker touch target | 44px | exception (WCAG 2.5.8) |
| Section heading to content gap | 24px | lg |
| Community index card grid gap | 24px | lg |
| Page max content width | 1280px | inherited |

Exceptions: Map container heights are content-specific, not on the 8-point grid. POI markers maintain 44px invisible hit targets per Phase 1 accessibility contract.

---

## Typography

Inherited from Phase 1. **No new sizes or weights are introduced in Phase 3.** Every Phase 3 element resolves to one of the 4 sizes (12 / 16 / 28 / 48) and 2 weights (400 / 700) defined in the Phase 1 contract.

**Phase 3 specific role assignments (all resolve to existing tokens):**

| Element | Role | Size | Weight | Notes |
|---------|------|------|--------|-------|
| Community name (hero overlay) | Display | 48px desktop / 32px mobile | 700 | Playfair Display, `--foreground`, text-shadow for readability over video/image |
| Community tagline (hero subheading) | Body | 16px | 400 | Montserrat, `--foreground` at 90% opacity, max-width 640px |
| Community location line (hero) | Label | 12px | 700 | Montserrat, uppercase, `--muted-foreground`, letter-spacing 0.05em |
| "From $XXX,XXX" price (hero) | Heading | 28px desktop / 24px mobile | 700 | Playfair, `--accent` (gold), tabular-nums |
| Section headings ("Amenities", "Floor Plans", etc.) | Heading | 28px desktop / 24px mobile | 700 | Playfair Display |
| Overview body text | Body | 16px | 400 | Montserrat, line-height 1.6 |
| Amenity item label | Body | 16px | 400 | Montserrat, `--foreground` |
| Floor plan card name | Body | 16px | 700 | Montserrat, `--foreground` |
| Floor plan card price | Body | 16px | 700 | Montserrat, `--accent`, tabular-nums |
| Floor plan card specs (beds/baths/sqft) | Label | 12px | 400 | Montserrat, `--muted-foreground`, uppercase, 0.05em |
| School name | Body | 16px | 700 | Montserrat, `--foreground` |
| School district label | Label | 12px | 400 | Montserrat, `--muted-foreground`, uppercase, 0.05em |
| HOA fee value | Body | 16px | 700 | Montserrat, `--foreground`, tabular-nums |
| HOA label | Label | 12px | 400 | Montserrat, `--muted-foreground`, uppercase |
| Video section heading | Heading | 28px / 24px mobile | 700 | Playfair Display |
| POI marker label (map popup) | Label | 12px | 400 | Montserrat, `--foreground` |
| POI category label (map legend) | Label | 12px | 700 | Montserrat, uppercase, `--muted-foreground`, 0.05em |
| Tour form field labels | Label | 12px | 700 | Montserrat, uppercase, `--muted-foreground`, 0.05em |
| Tour CTA heading | Heading | 28px / 24px mobile | 700 | Playfair Display |
| Tour CTA body | Body | 16px | 400 | Montserrat, `--muted-foreground` |
| Community index page title | Display | 48px / 32px mobile | 700 | Playfair Display |
| Community index subtitle | Body | 16px | 400 | Montserrat, `--muted-foreground` |
| "Sold Out" badge | Label | 12px | 700 | uppercase, 0.05em |
| "Available Homes" inline count | Body | 16px | 700 | Montserrat, `--foreground`, tabular-nums |
| OG image community name | Display | 72px (render time) | 700 | Playfair, white. Render-time only -- NOT a live web-surface token. |
| OG image location | Heading | 32px (render time) | 700 | Playfair, `--muted-foreground`. Render-time only. |

**Type-scale audit (Phase 3 live web surfaces only):** 12, 16, 28, 48. Count = 4. Matches Phase 1 exactly. OG image render-time sizes are excluded from the live type scale.

---

## Color

Inherited from Phase 1 + Phase 2 `--warning` token. No new palette tokens.

**60 / 30 / 10 split -- re-confirmed for Phase 3 (unchanged):**

| Ratio | Role | Token | Phase 3 Surfaces |
|-------|------|-------|------------------|
| 60% | Dominant surface | `--background` (near-black `oklch(0.145 0 0)`) | Community page body, community index page body, map container background |
| 30% | Secondary surface | `--card` / `--muted` (`oklch(0.205 0 0)` / `oklch(0.245 0 0)`) | Floor plan cards, amenity chips, school cards, HOA info card, video embed borders, tour form card, map popups, community index cards |
| 10% | Accent | `--accent` (gold `oklch(0.735 0.115 80)`) | Reserved-for list below |

**Phase 3 specific accent usage (extends the Phase 1 + Phase 2 reserved list):**

Gold accent (`--accent`) is used in Phase 3 ONLY for:

1. Community hero "From $XXX,XXX" price display (gold, Heading size)
2. "Schedule a Tour" primary CTA button (gold background, dark text)
3. Community map center pin (gold marker, consistent with Phase 2 map contract)
4. Floor plan card price (gold, Body 16px weight 700)
5. "Explore Community" CTA on community index cards (gold background)
6. Active POI category filter (gold underline indicator)
7. Amenity checkmark icons (gold, Lucide `Check` 16px)
8. Tour form "Request Tour" submit button (gold background)
9. "Available" badge on floor plans with move-in-ready homes (gold-muted background)
10. OG image community name underline accent (render-time only)

Gold accent must NOT be used in Phase 3 for:
- Community page section headings (use `--foreground`)
- School names or district text (informational, not actionable)
- HOA fee values (informational, not actionable)
- Video play button overlays (use white with dark scrim -- `react-lite-youtube-embed` default)
- POI marker pins for schools/restaurants (use distinct semantic colors below)
- Map background or polygon fills (use Mapbox dark-v11 native styling)
- Community overview body text

**POI marker colors (new Phase 3 usage of existing tokens):**

| POI Category | Marker Color | Token | Rationale |
|-------------|-------------|-------|-----------|
| Community location (center) | Gold | `--accent` | Primary subject, consistent with Phase 2 map marker |
| Schools | Green | `--success` | Positive association, universally understood |
| Restaurants | Amber | `--warning` (Phase 2 token) | Warm, food-associated, distinct from gold accent |
| Other POI | Gray | `--muted-foreground` | De-emphasized, secondary information |

These POI colors are 16px Lucide icons inside 32px circle markers with 44px invisible hit targets. They do NOT compete with the 10% accent budget -- schools and restaurants are informational overlays.

---

## Component Inventory (Phase 3 Deliverables)

### Community Detail Page Components

| Component | Variants | Contract |
|-----------|----------|----------|
| `CommunityHero` | video-hero, image-hero, sold-out | Full-bleed hero section. **Video variant:** Background `<video>` element with `muted autoPlay playsInline loop` for custom uploads OR `react-lite-youtube-embed` facade for YouTube (click-to-play, no autoplay). Gradient overlay: `linear-gradient(transparent 30%, rgba(10,10,10,0.85) 100%)`. Content overlaid at bottom-left: location label (12px uppercase muted), community name (Display 48px), price "From $XXX,XXX" (Heading 28px gold), "Schedule a Tour" primary CTA (44px height). **Image variant:** Same layout using `next/image` with `priority` and blur placeholder. **Sold-out variant:** Desaturated image (CSS `filter: grayscale(0.6) brightness(0.8)`), "SOLD OUT" badge top-right (destructive variant badge), CTA changes to "Join Waitlist" (outline variant). Min-height: 70vh desktop, 50vh mobile. |
| `CommunityOverview` | default, with-sales-center | `--background` surface. Max-width 800px for readability. Description text in Body 16px, line-height 1.6. If description exceeds 6 lines, truncate with fade-to-background gradient + "Read more" expand link. **With-sales-center variant:** Adds a small card below description: sales center address, map pin icon, "Get Directions" ghost button linking to Google Maps. |
| `CommunityAmenities` | default, empty | Heading: "Community Amenities" (Heading 28px). Grid layout: 2 columns mobile, 3 columns tablet, 4 columns desktop. Each amenity: `--card` background chip, 8px 16px padding, border-radius 8px, Lucide icon (16px, `--accent`) + amenity name (Body 16px). Icons map: "Pool" -> `Waves`, "Fitness" -> `Dumbbell`, "Playground" -> `Baby`, "Clubhouse" -> `Building`, "Trail" -> `TreePine`, "Tennis" -> `CircleDot`, "Dog Park" -> `Dog`, default -> `Check`. Empty variant: hidden entirely (do not render section if amenities array is empty). |
| `CommunitySchools` | default, empty | Heading: "Schools" (Heading 28px). Subheading: school district name (Body 16px, `--muted-foreground`). Three cards in a row (stacked mobile): Elementary, Middle, High. Each card: `--card` background, 1px `--border`, border-radius 8px, padding 24px. School level label (Label 12px uppercase muted), school name (Body 16px weight 700). Left border accent: 3px `--success` (green, educational association). Empty: section hidden if all three school fields are null. |
| `CommunityHoa` | default, no-hoa | Heading: "HOA Information" (Heading 28px). Info card: `--card` background, 1px `--border`, border-radius 8px, padding 24px. Three-column layout (stacked mobile): HOA name, monthly fee, yearly fee. Fee values in Body 16px weight 700 tabular-nums. Labels in Label 12px uppercase muted. **No-hoa variant:** "No HOA" displayed as single text line in `--muted-foreground`. Hidden entirely if all HOA fields are null. |
| `CommunityFloorPlans` | default, empty | Heading: "Available Floor Plans" (Heading 28px) + count badge (Label 12px, `--accent-muted` background). Grid: 1 column mobile, 2 columns tablet, 3 columns desktop. Gap 24px. Each floor plan card: `--card` background, 1px `--border`, border-radius 8px, overflow hidden. Top: `next/image` (4:3 aspect ratio) with elevation photo. Bottom padding 16px: floor plan name (Body 16px weight 700), price (Body 16px weight 700 gold tabular-nums), specs strip "3-4 Beds | 2-3 Baths | 1,800-2,400 Sqft" (Label 12px muted), filter tags as small badges (Label 12px, `--muted` background). Hover: border `--border-hover`, translate-y -2px, 200ms ease-out. Click navigates to floor plan detail on schellbrothers.com (external link, `target="_blank"`, `rel="noopener"`). Empty: "No floor plans currently available. Check back soon or schedule a tour for the latest options." (Body 16px, `--muted-foreground`). |
| `CommunityVideos` | default, empty | Heading: "Community Videos" (Heading 28px). Grid: 1 column mobile, 2 columns desktop. Gap 24px. Each video: `react-lite-youtube-embed` facade inside a container with border-radius 8px, overflow hidden, 1px `--border`. Aspect ratio 16:9. Facade renders high-res thumbnail with centered play button; full YouTube iframe loads only on click. Custom video uploads: native `<video>` element with `controls`, `preload="metadata"`, poster frame from first frame. Empty: section hidden entirely (no "no videos" message -- absence is expected until agent populates). |
| `CommunityMap` | default | Heading: "Location & Nearby" (Heading 28px). react-map-gl container: 480px height desktop, 320px mobile, border-radius 8px, 1px `--border`, overflow hidden. Mapbox dark-v11 style. Center: community lat/lng at zoom 13. Community marker: gold pin (Lucide `MapPin` filled, `--accent`). POI markers: colored by category (see POI marker colors table above), 32px circles with category icon. Popup on marker click: `--card` background, 1px `--border`, POI name (Body 16px weight 700), category (Label 12px muted), distance (Label 12px muted). Category filter row above map: toggleable chips for "Schools", "Restaurants", "Nearby" -- uses FilterPill pattern from Phase 2. Default: all categories visible. NavigationControl bottom-right. No geocoder search. |
| `CommunityListings` | default, empty | Heading: "Available Homes in {community name}" (Heading 28px) + count (Body 16px weight 700 tabular-nums). Reuses `SearchResultsGrid` component from Phase 2 with listings filtered to `communityId`. Card grid: 1 column mobile, 2 columns tablet, 3 columns desktop. Gap 24px. Each card is the existing `ListingCard` from Phase 2. If more than 6 listings, show first 6 + "View all {N} homes" secondary CTA button linking to `/listings?communityId={id}`. Empty: "No active listings right now. Schedule a tour to learn about upcoming availability." (Body 16px, `--muted-foreground`) + "Schedule a Tour" outline CTA button. |
| `ScheduleTourModal` | default, submitted, error | Extends `ContactAgentModal` pattern. Triggered by "Schedule a Tour" primary CTA. shadcn `Dialog` (max-width 480px, `--card` background, 1px `--border`, border-radius 12px on desktop). Heading: "Schedule a Tour" (Heading 28px). Subheading: "Visit {community name} in person" (Body 16px, `--muted-foreground`). Fields: Name (required), Email (required), Phone (optional), Preferred Date (shadcn `Calendar` date picker), Message (textarea, placeholder "Any questions or special requests?"). All validated via Zod. Honeypot hidden field for spam prevention. Primary CTA: "Request Tour" (primary button, 44px height). **Submitted state:** Checkmark animation (Framer Motion scale 0->1, 300ms) + "Tour requested. We'll confirm your visit within 2 hours." (Body 16px, `--success`). **Error state:** "We couldn't submit your request. Please try again or call us directly." (Body 16px, `--destructive`). Close X top-right. Focus trap when open. Escape dismisses. |
| `CommunityJsonLd` | default | Not a rendered component. Outputs `<script type="application/ld+json">` with `@type: "Residence"` schema. Fields: name, description, address (PostalAddress), geo (GeoCoordinates), url, offers (price_from). Escapes `<` as `\u003c` to prevent XSS (same pattern as `ListingJsonLd`). |

### Community Index Page Components

| Component | Variants | Contract |
|-----------|----------|----------|
| `CommunityIndexHero` | default | Compact hero section. `--background` surface. Padding: 96px top, 48px bottom (desktop); 64px top, 32px bottom (mobile). Centered text: "Schell Brothers Communities" (Display 48px/32px mobile), "Discover new construction homes across Delaware and the Mid-Atlantic" (Body 16px, `--muted-foreground`, max-width 640px). No image background -- clean typographic hero. |
| `CommunityIndexGrid` | default, filtered | Grid: 1 column mobile, 2 columns tablet, 3 columns desktop. Gap 24px. Reuses existing `CommunityCard` component from `src/components/cards/community-card.tsx` with `href` linking to `/communities/{slug}`. **Filtered variant:** State filter row above grid using FilterPill chips: "All", "Delaware", "Maryland", "New Jersey", "Pennsylvania". Default: "All" selected. Sold-out communities sorted to bottom with visual desaturation (CSS `filter: grayscale(0.4) brightness(0.9)`, "SOLD OUT" overlay badge). |
| `CommunityStateFilter` | default | Horizontal row of FilterPill components. Options: "All" + one per state with active communities. Selected: `--accent-muted` background, `--accent` text, 1px `--accent` border (inherits Phase 1 FilterPill selected style). Gap 8px. Scrollable on mobile (horizontal overflow with hidden scrollbar). |

### SEO Components

| Component | Contract |
|-----------|----------|
| `CommunityOpenGraphImage` | Route handler at `app/communities/[slug]/opengraph-image.tsx` using `@vercel/og`. 1200x630. Composition: full-bleed community hero image with 50% dark gradient overlay from bottom. Bottom-left stack: "TRI STATES REALTY" wordmark 24px gold letter-spacing 0.1em, community name 72px Playfair white, location "{city}, {state}" 32px Playfair `--muted-foreground`. Top-right: "From ${price}" 40px Playfair gold. Edge insets 64px. Cached per slug; regenerated on community sync. |
| `CommunityMeta` | `generateMetadata` function. Title: "{community name} by Schell Brothers in {city}, {state} -- New Homes -- Tri States Realty". Description: first 155 characters of `short_description`. OG image pointing to `CommunityOpenGraphImage`. Twitter card: `summary_large_image`. |

### Requirements Traceability

| Requirement | Components Satisfying It |
|-------------|--------------------------|
| SCHELL-01 (individual page per community) | `/communities/[slug]/page.tsx` (ISR), `CommunityIndexGrid`, `CommunityStateFilter` |
| SCHELL-02 (hero video, overview, amenities, schools, HOA, price, floorplans) | `CommunityHero`, `CommunityOverview`, `CommunityAmenities`, `CommunitySchools`, `CommunityHoa`, `CommunityFloorPlans` |
| SCHELL-03 (YouTube embed + custom video) | `CommunityVideos` (react-lite-youtube-embed facade + native `<video>`) |
| SCHELL-04 (live listings filtered to community) | `CommunityListings` (reuses `SearchResultsGrid` + `ListingCard`) |
| SCHELL-05 (interactive map + nearby POI) | `CommunityMap` (Mapbox dark-v11, POI category markers, FilterPill toggles) |
| SCHELL-06 (SEO optimized) | `CommunityJsonLd`, `CommunityMeta`, `CommunityOpenGraphImage`, sitemap.ts extension |
| SCHELL-07 (Schedule a Tour CTA) | `ScheduleTourModal` (extends ContactAgentModal pattern, Zod validation, POST to existing `/api/leads`) |

---

## Layout & Responsive Framework

Inherited from Phase 1 breakpoints (sm 640, md 768, lg 1024, xl 1280, 2xl 1536).

**Primary visual anchor (community detail page):** the hero section, which spans full viewport width with a video or hero image and gradient overlay. The community name and "Schedule a Tour" CTA are the first elements the visitor sees. Below the hero, content constrains to 1280px max-width.

**Primary visual anchor (community index page):** the community card grid, with large 4:3 aspect ratio cards showcasing each community's hero image.

### Community Detail Page Layout

```
[Navbar -- sticky, solid on scroll]
[CommunityHero -- full bleed, min-height 70vh desktop / 50vh mobile]
  - Video/image background + gradient overlay
  - Location label (12px uppercase) + community name (Display) + price (Heading gold) + CTA
[3xl (64px) gap desktop / 2xl (48px) mobile]
[CommunityOverview -- 1280px, max-width 800px for body text]
[3xl gap]
[CommunityAmenities -- 1280px, 4-col grid desktop]
[3xl gap]
[CommunityFloorPlans -- 1280px, 3-col grid desktop]
[3xl gap]
[CommunityVideos -- 1280px, 2-col grid desktop]
[3xl gap]
[CommunitySchools -- 1280px, 3-col row desktop]
[3xl gap]
[CommunityHoa -- 1280px, single card]
[3xl gap]
[CommunityListings -- 1280px, 3-col grid desktop]
[3xl gap]
[CommunityMap -- 1280px, 480px height desktop / 320px mobile]
[3xl gap]
[Tour CTA Banner -- full bleed, --card background, 1px --border top and bottom]
  - "Ready to Visit {community}?" (Heading 28px) + body + "Schedule a Tour" primary CTA
[3xl gap]
[CommunityJsonLd -- invisible]
[Footer]
```

### Community Index Page Layout

```
[Navbar]
[CommunityIndexHero -- 1280px, typographic hero, centered]
[2xl gap]
[CommunityStateFilter -- 1280px, horizontal pill row]
[lg gap]
[CommunityIndexGrid -- 1280px, 3-col desktop / 2-col tablet / 1-col mobile]
[3xl gap]
[Footer]
```

### Content Widths

| Context | Max Width | Padding |
|---------|-----------|---------|
| Community detail content | 1280px | 16 / 24 / 32px |
| Community hero | 100vw (full bleed) | Content overlaid with 32px inset desktop, 16px mobile |
| Community overview body text | 800px | 0 (within 1280px container) |
| Community map | 1280px | 0 (within container) |
| Tour CTA banner | 100vw, content 1280px centered | 48px vertical, 16 / 24 / 32px horizontal |
| Community index grid | 1280px | 16 / 24 / 32px |
| OG image | 1200x630 (fixed) | 64px inset |

---

## Animation & Transitions

All animations use Framer Motion v12. `prefers-reduced-motion` disables all.

| Animation | Trigger | Duration | Easing | Details |
|-----------|---------|----------|--------|---------|
| Hero content reveal | Page load | 600ms | ease-out | Staggered: location label (0ms), community name (100ms), price (200ms), CTA button (300ms). Fade + translate-y 16px -> 0. |
| Section reveal (all community sections) | Viewport entry | 500ms | ease-out | Fade + translate-y 24px -> 0 at 20% intersection. `once: true`. Consistent with Phase 1 + Phase 2 scroll reveal. |
| Floor plan card hover | Mouse enter | 200ms | ease-out | translate-y -2px, border-color `--border-hover`. Consistent with Phase 1 card hover. |
| Floor plan card grid stagger | Viewport entry | 400ms | ease-out | Stagger 60ms per card. `once: true`. |
| Amenity chip entrance | Viewport entry | 300ms | ease-out | Scale 0.95 -> 1 + opacity 0 -> 1. Stagger 30ms per chip. `once: true`. |
| Community card hover (index) | Mouse enter | 200ms | ease-out | translate-y -2px, border-color `--border-hover`. Inherited from `CommunityCard`. |
| Map marker drop-in | Map loaded | 300ms | ease-out | Community center pin: scale 0 -> 1 + opacity. POI markers: stagger 20ms each. |
| YouTube facade click | Click play button | 200ms | ease-out | Thumbnail fades out while iframe fades in. Handled by `react-lite-youtube-embed` natively. |
| Tour modal open | CTA click | 200ms | ease-out | Overlay fade 0 -> 1. Dialog: opacity 0 scale 0.95 -> opacity 1 scale 1. Inherited from Phase 1 modal contract. |
| Tour modal close | Close/escape | 150ms | ease-in | Reverse of open. |
| Tour submit success | Form submit | 300ms | ease-out | Checkmark icon: scale 0 -> 1.1 -> 1 with `--success` color. Form fields fade out 150ms, success message fades in 300ms. |
| State filter pill toggle | Click | 150ms | ease-out | Background color transition. Scale 1 -> 0.97 -> 1 tap feedback. Inherited from Phase 2 filter pill. |
| POI category toggle | Click | 200ms | ease-in-out | Markers for toggled category fade in/out (opacity 0 <-> 1). Map does NOT re-center. |

**Performance constraint:** Community hero video must NOT autoplay YouTube embeds. YouTube facade renders a static thumbnail; iframe loads ONLY on user click. Custom `<video>` uploads may autoplay silently (`muted autoPlay playsInline loop`) with a play/pause toggle button (44px, top-right corner of hero, ghost variant with white icon).

---

## Copywriting Contract

### Community Detail Page

| Element | Copy |
|---------|------|
| Page title (meta) | "{name} by Schell Brothers in {city}, {state} -- New Homes -- Tri States Realty" |
| Meta description | First 155 characters of `short_description` |
| Location label (hero) | "{city}, {state}" |
| Price display (hero) | "From ${price_from}" |
| Hero CTA | "Schedule a Tour" |
| Overview heading | "About {community name}" |
| Overview read more | "Read more" / "Show less" |
| Overview sales center label | "Sales Center" |
| Overview get directions CTA | "Get Directions" |
| Amenities heading | "Community Amenities" |
| Floor plans heading | "Available Floor Plans" |
| Floor plan count badge | "{N} plans" |
| Floor plan card specs | "{beds} Beds | {baths} Baths | {sqft} Sqft" |
| Floor plan card range specs | "{min_beds}-{max_beds} Beds | {min_baths}-{max_baths} Baths | {min_sqft}-{max_sqft} Sqft" |
| Floor plan external link tooltip | "View on Schell Brothers" |
| Floor plan empty | "No floor plans currently available. Check back soon or schedule a tour for the latest options." |
| Videos heading | "Community Videos" |
| YouTube embed title (a11y) | "{community name} -- Schell Brothers Community Tour" |
| Schools heading | "Schools" |
| Schools district subheading | "{district name} School District" |
| School level labels | "Elementary School", "Middle School", "High School" |
| HOA heading | "HOA Information" |
| HOA labels | "HOA Name", "Monthly Fee", "Annual Fee" |
| HOA no-hoa text | "No HOA fees for this community" |
| Listings heading | "Available Homes in {community name}" |
| Listings count | "{N} homes available" |
| Listings view-all CTA | "View All {N} Homes" |
| Listings empty heading | "No Active Listings Right Now" |
| Listings empty body | "Schedule a tour to learn about upcoming availability." |
| Listings empty CTA | "Schedule a Tour" |
| Map heading | "Location & Nearby" |
| Map POI category labels | "Schools", "Restaurants", "Nearby" |
| Map POI popup distance | "{distance} mi away" |
| Tour CTA banner heading | "Ready to Visit {community name}?" |
| Tour CTA banner body | "See the community, tour model homes, and find the perfect floor plan for your family." |
| Tour CTA banner CTA | "Schedule a Tour" |
| Sold-out badge | "SOLD OUT" |
| Sold-out CTA | "Join Waitlist" |

### Schedule a Tour Modal

| Element | Copy |
|---------|------|
| Heading | "Schedule a Tour" |
| Subheading | "Visit {community name} in person" |
| Name field label | "Full Name" |
| Name field placeholder | "Your name" |
| Email field label | "Email Address" |
| Email field placeholder | "you@example.com" |
| Phone field label | "Phone (optional)" |
| Phone field placeholder | "(302) 555-0100" |
| Date field label | "Preferred Date" |
| Message field label | "Message (optional)" |
| Message field placeholder | "Any questions or special requests?" |
| Primary CTA | "Request Tour" |
| Success heading | "Tour Requested" |
| Success body | "We'll confirm your visit to {community name} within 2 hours." |
| Error body | "We couldn't submit your request. Please try again or call us directly." |
| Dismiss affordance | Close X top-right (aria-label "Close dialog") |

### Community Index Page

| Element | Copy |
|---------|------|
| Page title (meta) | "Schell Brothers Communities -- New Construction Homes -- Tri States Realty" |
| Meta description | "Explore new construction communities by Schell Brothers across Delaware, Maryland, New Jersey, and Pennsylvania. Video tours, amenities, floor plans, and live listings." |
| Hero heading | "Schell Brothers Communities" |
| Hero subheading | "Discover new construction homes across Delaware and the Mid-Atlantic" |
| State filter default | "All Communities" |
| State filter options | "All Communities", "Delaware", "Maryland", "New Jersey", "Pennsylvania" |
| Sold-out card overlay badge | "SOLD OUT" |
| No communities in state | "No active communities in {state} right now. Explore other states or check back soon." |

### Destructive Actions (Phase 3)

No destructive actions exist in Phase 3. Community pages are read-only for buyers. Tour requests cannot be cancelled from the buyer side (agent manages in Phase 8 dashboard). No delete, no account modification, no data removal flows.

---

## Accessibility Contract

Inherits Phase 1 + Phase 2 base contracts. Phase 3 additions:

| Requirement | Implementation |
|-------------|----------------|
| Video accessibility | YouTube facade: `title` attribute on embed matches community name. Custom video: `<video>` element has `aria-label="{community name} community tour video"`. Play/pause toggle: `aria-label="Play video"` / `aria-label="Pause video"`. |
| Map keyboard navigation | Inherits Phase 2 map contract: Tab focuses map, arrow keys pan, +/- zoom, Enter selects focused marker. POI markers: `aria-label="{POI name}, {category}, {distance} miles away"`. Community center pin: `aria-label="{community name} location"`. |
| Hero text contrast | Community name white text over dark gradient: minimum 7:1 contrast ratio ensured by gradient overlay `rgba(10,10,10,0.85)` at text position. Gold price on dark gradient: 6.8:1 (passes AA for large text at 28px). |
| Tour form | All inputs have associated `<label>` elements. Required fields marked with `aria-required="true"`. Validation errors linked via `aria-describedby`. Calendar date picker keyboard operable (arrow keys navigate days, Enter selects). Focus trap on modal open. |
| Floor plan cards | Each card: `aria-label="{plan name}, {beds} bedrooms, {baths} bathrooms, from ${price}"`. External link icon has `aria-label="Opens on Schell Brothers website"`. |
| Amenity items | Each amenity renders as a `<li>` inside `<ul aria-label="Community amenities">`. Icon is decorative (`aria-hidden="true"`), name is the accessible label. |
| School cards | Rendered as `<article>` elements with `aria-label="{school level}: {school name}"`. |
| State filter (index page) | `role="radiogroup"` with `aria-label="Filter by state"`. Each pill: `role="radio"`, `aria-checked`. |
| Sold-out communities | Visual desaturation does NOT affect screen reader content. "Sold Out" text is available to assistive technology via the badge. |
| Reduced motion | All Framer Motion animations disabled. YouTube facade loads iframe immediately (no thumbnail-to-iframe transition). Hero video set to `poster` only, no autoplay. |

---

## Performance Budget

Inherits Phase 1 targets (LCP < 2.5s, CLS < 0.1, INP < 200ms). Phase 3 additions:

| Metric | Target | Strategy |
|--------|--------|----------|
| Community page LCP | < 2s on mobile | Hero image via `next/image` with `priority` + AVIF. YouTube facade renders static thumbnail (~20KB) instead of full iframe (~500KB). Custom video: `preload="metadata"` + poster frame. |
| Community page total JS | < 180KB gzipped initial | Dynamic import for `CommunityMap` (below fold). Dynamic import for `CommunityVideos` (below fold). `react-lite-youtube-embed` CSS/JS is ~8KB total. |
| Map first paint | < 1s after viewport entry | Dynamic import `react-map-gl`. POI markers render after map `onLoad` event. |
| YouTube iframe load | On click only | Facade pattern ensures zero YouTube JS loaded at page load. Full iframe (~500KB JS + ~200KB CSS) loads only when user clicks play. |
| Community hero video | < 3MB file size | Custom uploads: enforce max 3MB in Supabase Storage bucket policy. Serve as MP4 H.264. Poster frame loads immediately via `poster` attribute. |
| ISR revalidation | 24 hours | Communities change infrequently. `revalidate = 86400`. On-demand revalidation via `revalidateTag("communities", {})` after nightly sync. |
| OG image generation | < 800ms cold, cached 24h | Same `@vercel/og` edge runtime pattern as Phase 2 listing OG images. |
| Floor plan images | Lazy-load below fold | All floor plan card images use `next/image` with `loading="lazy"`. First 3 cards may use `loading="eager"` if above fold on desktop. |
| Community index page | < 1.5s LCP | All community cards use `next/image` with `sizes` attribute. First 6 images eager, rest lazy. Static generation via `generateStaticParams`. |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | dialog, calendar, sheet, tooltip, separator, badge, skeleton, button, input | not required |
| No third-party registries | -- | not applicable |

**Third-party visual libraries deliberately declined:**
- No new shadcn registry blocks needed beyond those already installed in Phase 1 + Phase 2.
- `react-lite-youtube-embed` is a standalone npm package (not a shadcn registry block) -- 8KB total, MIT license, no network access beyond YouTube embed at click time.
- `@mapbox/search-js-react` is a Mapbox official package (not a shadcn registry block) -- used only for POI category queries, server-side in RSC.

**Note on `calendar`:** The shadcn `Calendar` component (date picker) may need to be added via `npx shadcn add calendar` if not already installed. It is required for the tour scheduling form's preferred date field.

---

## Inherited Contracts (Phase 1 + Phase 2 -- unchanged)

The following contracts apply unchanged to Phase 3 and are NOT re-specified here:

- Spacing scale (xs-5xl)
- Typography (4 sizes, 2 weights, Playfair + Montserrat)
- Core palette (dominant / secondary / muted / border / foreground / muted-foreground / accent / destructive / success / warning)
- Button variants (primary, secondary, ghost, outline, destructive, icon-only)
- Form element base styles (Input, Select, FilterPill)
- Modal / Sheet base styles
- Skeleton shimmer animation
- Toast pattern (5s auto-dismiss, bottom-right)
- Mapbox dark theme contract (dark-v11, gold markers, card popups)
- Breakpoint system (sm/md/lg/xl/2xl)
- Nav and Footer components
- `CommunityCard` component (already exists at `src/components/cards/community-card.tsx`)
- `ContactAgentModal` pattern (extended into `ScheduleTourModal`)
- `LocationMap` pattern (extended into `CommunityMap` with POI layer)
- `ListingCard` component (reused in `CommunityListings` section)
- `SearchResultsGrid` pattern (reused for community listings)
- `FadeIn` / `StaggerChildren` motion wrappers

Any conflict between Phase 3 and Phase 1/Phase 2 must resolve to the earlier phase unless this contract explicitly states "override".

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
