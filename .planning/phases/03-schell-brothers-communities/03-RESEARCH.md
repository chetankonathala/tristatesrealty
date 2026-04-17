# Phase 3: Schell Brothers Communities - Research

**Researched:** 2026-04-16
**Domain:** Schell Brothers community pages — data pipeline, SSG/ISR, video embeds, Mapbox POI, lead capture, SEO
**Confidence:** HIGH

## Summary

Phase 3 builds dedicated showcase pages for every Schell Brothers community. The good news: Phase 2 already built 80% of the infrastructure this phase needs. The `communities` table does NOT exist yet as a standalone entity — community data currently exists only as fields embedded in individual `listings` rows (via `raw_data.communityId`, `raw_data.communityName`, `raw_data.communitySlug`, `geo_market_area`). Phase 3 must introduce a `communities` Supabase table, extend the Heartbeat sync client to scrape multi-state divisions (currently hardcoded to Delaware `DIVISION_PARENT_ID = "1"`), and build dedicated `/communities/[slug]` RSC pages with ISR.

The lead capture pipeline is fully built: `POST /api/leads` → Supabase `leads` table → Resend email to agent. The `ContactAgentModal` component at `src/components/listings/contact-agent-modal.tsx` is the "Schedule a Tour" form — Phase 3 reuses it directly with a `preferred_date` field addition. The Mapbox `LocationMap` pattern for a single-pin map is already proven; nearby POI layer requires Mapbox Search Box API category queries. YouTube embed should use the facade pattern (`react-lite-youtube-embed@3.5.1`) to stay under the 2s mobile target. Sitemap generation extends the existing `sitemap.ts` by adding community URLs alongside listing URLs.

**Primary recommendation:** Extend the Heartbeat client to cover all state divisions → create a `communities` table → build `/communities/[slug]` ISR pages that compose existing components (LocationMap, ContactAgentModal, SearchResultsGrid filtered by `raw_data->>'communityId'`) plus new CommunityHero, AmenitiesGrid, FloorPlansGrid, and CommunityMap-with-POI.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SCHELL-01 | Dedicated community showcase section with individual page per Schell Brothers neighborhood | ISR route at `/communities/[slug]` with `generateStaticParams` from `communities` table; `dynamicParams = true` for new communities between deploys |
| SCHELL-02 | Community pages: hero video, overview, amenities, schools, HOA info, price range, floorplans | All data fields exist in `HeartbeatCommunity` and `HeartbeatFloorPlan` types already defined in `src/lib/schell/types.ts`; need `communities` table to materialize them at page-load speed |
| SCHELL-03 | Video gallery per community: YouTube embed + custom video uploads in Supabase Storage | `react-lite-youtube-embed@3.5.1` for facade-pattern YouTube; Supabase Storage for custom uploads; `community_videos` join table |
| SCHELL-04 | Live IDX listings filtered to each community rendered inline | Query `listings` table with `raw_data->>'communityId' = community_id`; reuse `SearchResultsGrid` component |
| SCHELL-05 | Interactive community map: location, nearby schools, restaurants, highways | Extend `LocationMap` pattern with Mapbox Search Box API category queries for POI layers |
| SCHELL-06 | Community pages SEO-optimized for "[community name] Schell Brothers" and "[city] new construction" | SSG with ISR, `generateMetadata`, JSON-LD `Residence`/`RealEstateAgent` schema, sitemap.ts update |
| SCHELL-07 | "Schedule a Tour" CTA: lead capture form → agent notified | Extend `ContactAgentModal` with `preferred_date` field; POST to existing `/api/leads`; existing Resend notification fires automatically |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

All directives from `CLAUDE.md` apply:

- **Stack:** Next.js 16.2.2, React 19, TypeScript, Tailwind CSS v4, Supabase (PostgreSQL + pgvector), Clerk auth
- **Dark-only app.** `<html class="dark">` always set; no light mode
- **Tailwind v4 CSS-first** — no `tailwind.config.js`; all tokens via `@theme inline` in `globals.css`
- **Mapbox:** Always `import "mapbox-gl/dist/mapbox-gl.css"` at top of client map components; use `react-map-gl/mapbox` (v8); token via `NEXT_PUBLIC_MAPBOX_TOKEN`
- **Supabase split-client pattern:** `server.ts` (async cookies) for RSC/routes; `client.ts` (browser) for client components; service-role client for cron/background jobs
- **Supabase migrations:** Always `supabase migration new`; never edit DB directly
- **shadcn/ui** with base-nova style; `asChild` not supported — use `render` prop for `@base-ui/react/button`
- **cn()** from `src/lib/utils.ts` for conditional classes
- **Clerk auth:** `/agent/*` requires `role === "agent"` via `sessionClaims.metadata.role`; use `@clerk/nextjs/server` in server context
- **Component organization:** Map components in `src/components/map/`; listing components in `src/components/listings/`; new community components in `src/components/communities/`
- **revalidateTag** requires second argument `{}` (Next.js 16 CacheLifeConfig) — already established in Phase 2
- **No test runner configured yet** — CLAUDE.md explicitly states "No test runner is configured yet"

## What Phase 2 Already Built (Reuse Directly)

This is the highest-leverage section for the planner. Phase 3 does NOT rebuild any of these.

| Asset | Location | Phase 3 Use |
|-------|----------|-------------|
| `POST /api/leads` route | `src/app/api/leads/route.ts` | "Schedule a Tour" submission endpoint |
| `ContactAgentModal` | `src/components/listings/contact-agent-modal.tsx` | Tour scheduling form — extend with `preferred_date` field |
| `Lead` types + `createLead` query | `src/types/lead.ts`, `src/lib/supabase/queries/leads.ts` | Store tour requests |
| `sendNewLeadAlert` | `src/lib/notifications/resend.ts` | Agent email notification on tour request |
| `LocationMap` (Mapbox single-pin) | `src/components/listings/location-map.tsx` | Community location map base |
| `SearchMap` + `SearchResultsGrid` | `src/components/listings/` | Live listings filtered to community |
| `ListingCard` / `CommunityCard` | `src/components/cards/` | Display community floor plans as listing cards |
| Heartbeat types | `src/lib/schell/types.ts` | `HeartbeatCommunity`, `HeartbeatFloorPlan` already defined |
| Heartbeat client | `src/lib/schell/client.ts` | `fetchDelawareCommunities`, `fetchFloorPlans` — extend for multi-state |
| Heartbeat transform | `src/lib/schell/transform.ts` | `transformFloorPlan` — reuse for listings sync |
| Schell sync | `src/lib/schell/sync.ts` | `syncSchellListings` — extend with community upsert |
| `FadeIn` / `StaggerChildren` | `src/components/motion/` | Scroll reveals on community page sections |
| `MlsAttribution` | `src/components/listings/mls-attribution.tsx` | Schell listings are new construction — omit IDX attribution; no attribution needed for community pages |
| ISR pattern | `src/app/listings/[mlsId]/page.tsx` | Same `revalidate + generateStaticParams + dynamicParams = true` pattern |
| `MLS_ATTRIBUTION` constants | `src/lib/constants/mls.ts` | NOT needed for community pages (not IDX-regulated content) |

## Schell Brothers Data Model (Verified from Codebase)

### What the Heartbeat API Returns

[VERIFIED: src/lib/schell/types.ts, src/lib/schell/client.ts]

**Community-level fields available from `HeartbeatCommunity`:**
- `community_id` (string integer) — unique ID
- `marketing_name` / `community_marketing_name` — display name
- `slug` — URL-safe identifier (e.g., `cardinal-grove`)
- `marketing_description`, `short_description` — long and short copy
- `address`, `city`, `state`, `zip`, `lat`, `lng` — location
- `page_url` — path on schellbrothers.com
- `priced_from` — base price string
- `school_district`, `school_elementary`, `school_middle`, `school_high` — school data
- `hoa_name`, `hoa_monthly_fee`, `hoa_yearly_fee` — HOA data
- `is_sold_out` — "0" or "1"
- `is_build_on_your_lot` — "0" or "1"
- `division_parent_id` / `division_parent_marketing_name` — state/region grouping
- `featured_image_url`, `featured_image_thumbnail_url`
- `sales_center_address`, `sales_center_address_string`
- `amenities: HeartbeatAmenity[]` — `{name, icon?}` objects
- `spec_homes: HeartbeatSpecHome[]` — quick-delivery homes with URLs

**Floor plan-level fields available from `HeartbeatFloorPlan`:**
- `listing_id`, `community_id`, `community_parent_id`
- `name`, `marketing_name`, `description`
- `min_bedrooms`, `max_bedrooms`, `min_bathrooms`, `max_bathrooms`
- `base_heated_square_feet`, `max_heated_square_feet`, `base_total_square_feet`
- `base_price`, `incentive_price`, `price`
- `url` — path on schellbrothers.com
- `featured_image_url`, `"image-url"`, `elevations: HeartbeatElevation[]`
- `virtual_tour_url`
- `is_marketing_active`
- `filters: string[]` — tags like "First Floor Primary", "Move-In Ready"

**What is NOT in the Heartbeat API:**
- YouTube video URLs — not a Heartbeat field; must be manually added per community
- Custom amenity icons beyond `name` — icon field may be null/empty
- Price range (only `priced_from` string, not a parsed numeric range)

### The Missing Communities Table

[VERIFIED: supabase/migrations/]

Currently, community data lives ONLY as `raw_data` JSONB fields in the `listings` table rows (keys: `communityId`, `communitySlug`, `communityName`, `communityUrl`). There is no `communities` table.

Phase 3 must create a `communities` table to:
1. Store community-level data independent of floor plans
2. Enable community pages to load without querying all listing `raw_data` fields
3. Support video URLs, custom overrides, and SEO fields not in Heartbeat

### Multi-State Division IDs

[ASSUMED: only Delaware (`DIVISION_PARENT_ID = "1"`) is confirmed. MD/NJ/PA IDs must be discovered from Heartbeat API response inspection.]

The current client is hardcoded to Delaware. The `division_parent_marketing_name` field in the community response identifies the division. Multi-state requires iterating known division IDs. The Heartbeat endpoint accepts `source=communities&division_parent_id=X`.

**Known:** Delaware = "1" [VERIFIED: src/lib/schell/client.ts]
**Unknown:** MD, NJ, PA division IDs — must be discovered by calling the Heartbeat API and inspecting responses for `division_parent_id` values.

## Standard Stack

### Core (All Already Installed)

[VERIFIED: package.json via prior phase summaries]

| Library | Version | Purpose | Phase 3 Use |
|---------|---------|---------|-------------|
| next | 16.2.x | Framework | ISR community pages, sitemap.ts, generateMetadata |
| react-map-gl | 8.1.x | Mapbox GL wrapper | Community location map + POI markers |
| mapbox-gl | 3.21.x | Map engine | dark-v11 style, Marker, NavigationControl |
| @supabase/supabase-js | 2.102.x | DB client | communities table queries |
| @supabase/ssr | 0.10.x | SSR client | RSC server reads |
| zod | 4.3.x | Validation | Tour form schema, community slug params |
| react-hook-form | latest | Forms | "Schedule a Tour" form |
| framer-motion | 12.38.x | Animations | Community hero, section reveals |
| resend | 6.11.x | Email | Tour request notifications (already wired) |
| lucide-react | 1.7.x | Icons | Amenity icons, map pins, school badges |
| nuqs | 2.8.9 | URL state | Live listings filter on community page |

### New Dependencies

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-lite-youtube-embed | 3.5.1 | YouTube facade embed | Community video sections — lazy-loads on click, saves ~500KB per video |
| @mapbox/search-js-react | 1.5.1 | Mapbox Search Box API React bindings | Nearby POI category search (schools, restaurants, highways) |

[VERIFIED: npm registry — react-lite-youtube-embed@3.5.1 published 2026-02-24; @mapbox/search-js-react@1.5.1 published 2025-12-09]

**Installation:**
```bash
npm install react-lite-youtube-embed @mapbox/search-js-react
```

**next.config.ts additions needed for image domains:**
```typescript
// Add Schell Brothers image CDN to remotePatterns
{ protocol: "https", hostname: "heartbeat-page-designer-production.s3.amazonaws.com" },
{ protocol: "https", hostname: "www.schellbrothers.com" },
{ protocol: "https", hostname: "schellbrothers.com" },
```

[VERIFIED: src/lib/schell/transform.ts — s3ToHttps() converts `s3://heartbeat-page-designer-production/...` to `https://heartbeat-page-designer-production.s3.amazonaws.com/...`]

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── communities/
│   │   ├── page.tsx                       # Communities index page (RSC, lists all active)
│   │   └── [slug]/
│   │       ├── page.tsx                   # Community detail page (RSC + ISR)
│   │       ├── loading.tsx                # Skeleton matching community page layout
│   │       ├── not-found.tsx              # "Community no longer available" fallback
│   │       └── opengraph-image.tsx        # Dynamic OG image (hero photo + community name)
│   ├── api/
│   │   └── communities/
│   │       └── sync/route.ts              # Cron endpoint: sync communities from Heartbeat
├── components/
│   └── communities/
│       ├── community-hero.tsx             # Hero with video or image, community name, CTA
│       ├── community-overview.tsx         # Description, price range, state/city
│       ├── community-amenities.tsx        # Amenities checklist grid
│       ├── community-schools.tsx          # School district + elementary/middle/high cards
│       ├── community-hoa.tsx              # HOA fee display
│       ├── community-floor-plans.tsx      # Floor plan grid (reuses ListingCard pattern)
│       ├── community-map.tsx              # Mapbox map + POI layer (schools, restaurants, highways)
│       ├── community-videos.tsx           # YouTube facade + custom video grid
│       ├── community-listings.tsx         # Live IDX listings filtered to community (client)
│       └── schedule-tour-modal.tsx        # Extends ContactAgentModal with preferred_date
├── lib/
│   ├── schell/
│   │   ├── client.ts                     # EXTEND: add fetchAllStateCommunities()
│   │   ├── sync.ts                       # EXTEND: add community upsert step
│   │   ├── transform.ts                  # Reuse transformFloorPlan unchanged
│   │   └── types.ts                      # Reuse HeartbeatCommunity/FloorPlan types
│   └── supabase/
│       └── queries/
│           └── communities.ts            # getCommunityBySlug, getAllCommunities, getCommunityListings
└── app/
    └── sitemap.ts                        # EXTEND: add community URLs to existing listing sitemap
```

### Pattern 1: Communities Table Schema

**What:** A normalized `communities` table storing one row per Schell Brothers community, synced nightly from the Heartbeat API.

**When to use:** All community page data reads go through this table — NOT raw Heartbeat API calls at page load.

```sql
-- supabase/migrations/XXXXXXXX_create_communities.sql
CREATE TABLE IF NOT EXISTS communities (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  community_id  TEXT UNIQUE NOT NULL,         -- Heartbeat community_id string
  slug          TEXT UNIQUE NOT NULL,          -- URL slug for /communities/[slug]
  name          TEXT NOT NULL,                 -- marketing_name
  full_name     TEXT,                          -- community_marketing_name
  description   TEXT,                          -- marketing_description
  short_description TEXT,
  city          TEXT,
  state         TEXT,
  zip           TEXT,
  address       TEXT,
  lat           NUMERIC,
  lng           NUMERIC,
  price_from    NUMERIC,                       -- parsed from priced_from string
  school_district    TEXT,
  school_elementary  TEXT,
  school_middle      TEXT,
  school_high        TEXT,
  hoa_fee            NUMERIC,                  -- monthly
  hoa_yearly_fee     NUMERIC,
  hoa_name           TEXT,
  amenities          JSONB DEFAULT '[]',       -- HeartbeatAmenity[] from API
  division_id        TEXT,                     -- division_parent_id
  division_name      TEXT,                     -- division_parent_marketing_name (e.g., "Delaware Beaches")
  featured_image_url TEXT,
  is_sold_out        BOOLEAN DEFAULT FALSE,
  is_active          BOOLEAN DEFAULT TRUE,
  heartbeat_page_url TEXT,                     -- original schellbrothers.com path
  -- Manually-managed fields (not from Heartbeat)
  youtube_video_ids  TEXT[] DEFAULT '{}',      -- YouTube video IDs for embed
  custom_video_urls  TEXT[] DEFAULT '{}',      -- Supabase Storage video URLs
  seo_title          TEXT,
  seo_description    TEXT,
  synced_at          TIMESTAMPTZ DEFAULT now(),
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_communities_slug ON communities(slug);
CREATE INDEX idx_communities_state ON communities(state);
CREATE INDEX idx_communities_active ON communities(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_communities_division ON communities(division_id);

ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "communities_public_read" ON communities FOR SELECT USING (true);
```

### Pattern 2: Community Detail Page — ISR with generateStaticParams

**What:** Pre-build all active community pages at deploy time; ISR revalidates after nightly sync.
**When to use:** `/communities/[slug]/page.tsx`

```typescript
// src/app/communities/[slug]/page.tsx
import { unstable_cache } from "next/cache";

export const revalidate = 86400; // 24hr — communities change less often than listings
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const communities = await getAllCommunities({ activeOnly: true });
    return communities.map((c) => ({ slug: c.slug }));
  } catch {
    return []; // CI/local without DB — ISR handles on first request
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);
  if (!community) return { title: "Community Not Found | Tri States Realty" };

  const title = community.seo_title
    ?? `${community.name} by Schell Brothers in ${community.city}, ${community.state} | Tri States Realty`;
  const description = community.seo_description
    ?? `${community.short_description?.slice(0, 160)}`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: [{ url: `/communities/${slug}/opengraph-image`, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description },
  };
}
```

### Pattern 3: Live Community Listings Filter

**What:** Query the `listings` table filtering by `raw_data->>'communityId'` to show only floor plans for this community.
**When to use:** The "Available Homes" section on every community page.

```typescript
// src/lib/supabase/queries/communities.ts
export async function getCommunityListings(communityId: string): Promise<ListingSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(SUMMARY_FIELDS)
    .eq("status", "Active")
    .filter("raw_data->>communityId", "eq", communityId)
    .order("list_price", { ascending: true });
  return (data ?? []) as ListingSummary[];
}
```

**Why this works:** The Schell transform already writes `communityId` into `raw_data` [VERIFIED: src/lib/schell/transform.ts — `communityId: community.community_id`].

### Pattern 4: YouTube Facade Embed

**What:** `react-lite-youtube-embed` renders a thumbnail image with a play button; loads full YouTube iframe only on user click. Saves ~500KB per video and prevents YouTube tracking scripts from loading at page load.
**When to use:** All community video embeds. Critical for the 2s mobile LCP target.

```tsx
// src/components/communities/community-videos.tsx
"use client";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

interface CommunityVideosProps {
  youtubeVideoIds: string[]; // e.g., ["dQw4w9WgXcQ"]
  communityName: string;
}

export function CommunityVideos({ youtubeVideoIds, communityName }: CommunityVideosProps) {
  if (youtubeVideoIds.length === 0) return null;
  return (
    <section>
      <h2 className="font-display text-[28px] font-bold text-foreground mb-6">
        Community Videos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {youtubeVideoIds.map((videoId) => (
          <div key={videoId} className="rounded-lg overflow-hidden border border-border">
            <LiteYouTubeEmbed
              id={videoId}
              title={`${communityName} — Schell Brothers Community Tour`}
              poster="maxresdefault"
              // thumbnail loads immediately; iframe lazy-loaded on click
            />
          </div>
        ))}
      </div>
    </section>
  );
}
```

[VERIFIED: react-lite-youtube-embed@3.5.1 — published 2026-02-24; requires importing its CSS]

### Pattern 5: Community Map with Nearby POI

**What:** Extend the existing `LocationMap` pattern to add a POI category layer using Mapbox Search Box API category search. Shows schools, restaurants, and highways near the community.
**When to use:** `CommunityMap` component on every community detail page.

```typescript
// POI category search using Mapbox Search Box API
// Source: https://docs.mapbox.com/api/search/search-box/

// Fetch nearby POIs for a given category
async function fetchNearbyPOI(
  lng: number,
  lat: number,
  category: "school" | "restaurant" | "gas_station",
  accessToken: string
): Promise<GeoJSON.Feature[]> {
  const url = new URL("https://api.mapbox.com/search/searchbox/v1/category/" + category);
  url.searchParams.set("proximity", `${lng},${lat}`);
  url.searchParams.set("limit", "5");
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString());
  if (!res.ok) return [];
  const data = await res.json();
  return data.features ?? [];
}
```

**Implementation note:** The POI category query uses the server-side Mapbox Search Box API (not Search JS React). Call it in the RSC page and pass results as props to the client `CommunityMap` component to avoid exposing the token in a client-side fetch. The `NEXT_PUBLIC_MAPBOX_TOKEN` is safe to use in the client for map rendering but POI fetches from the page (RSC) keeps the pattern cleaner.

[VERIFIED: Mapbox Search Box API docs — category search endpoint exists at `/search/searchbox/v1/category/{category_name}`]
[CITED: https://docs.mapbox.com/api/search/search-box/]

### Pattern 6: Extended Heartbeat Sync for Multi-State

**What:** Extend `src/lib/schell/client.ts` to handle multiple division IDs and upsert into the `communities` table.

```typescript
// src/lib/schell/client.ts (extension)

// Division parent IDs for all states
// Delaware = "1" is confirmed. Others must be discovered from API inspection.
export const SCHELL_DIVISIONS: Record<string, string> = {
  "1": "Delaware Beaches",
  // MD, NJ, PA IDs: Wave 0 task — call fetchDivisions() and inspect division_parent_id fields
};

export async function fetchCommunitiesByDivision(
  divisionId: string
): Promise<HeartbeatCommunity[]> {
  return heartbeatGet<HeartbeatCommunity[]>({
    source: "communities",
    division_parent_id: divisionId,
    t: Date.now().toString(),
  });
}
```

**Wave 0 discovery task:** Call `heartbeatGet({ source: "communities", division_parent_id: "2" })`, `"3"`, `"4"`, etc. and observe which IDs return non-empty results with MD/NJ/PA `state` values.

### Pattern 7: Schedule a Tour Form (Lead Capture Extension)

**What:** Extend the existing `ContactAgentModal` with a `preferred_date` field and "Schedule a Tour" messaging. The lead is posted to the existing `POST /api/leads` endpoint — no new route needed.
**When to use:** The tour CTA button on every community page.

```typescript
// Extended schema for tour scheduling
const tourSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  preferred_date: z.string().optional(), // ISO date string or human-readable
  message: z.string().max(2000).optional(),
});

// POST body to /api/leads — community_name maps to community page context
const body = {
  name, email, phone,
  message: preferred_date ? `Preferred tour date: ${preferred_date}. ${message}` : message,
  community_name: communityName,
  listing_url: `${siteUrl}/communities/${communitySlug}`,
  user_id: user?.id,
};
```

**Why:** The `leads` table has no `preferred_date` column — encode it into the `message` field rather than migrating the table. This keeps the lead schema stable for Phase 8 agent dashboard.

### Pattern 8: Sitemap Extension for Community Pages

**What:** Extend the existing `sitemap.ts` to add community page URLs. Next.js App Router supports a single `app/sitemap.ts` returning all URLs.
**When to use:** `src/app/sitemap.ts` (create or extend).

```typescript
// src/app/sitemap.ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [communities, topListings] = await Promise.all([
    getAllCommunities({ activeOnly: true }),
    getTopListingsForStaticParams(500),
  ]);

  const communityUrls = communities.map((c) => ({
    url: `${baseUrl}/communities/${c.slug}`,
    lastModified: c.synced_at,
    changeFrequency: "weekly" as const,
    priority: 0.9, // Higher than listings — this is the SEO differentiator
  }));

  const listingUrls = topListings.map((l) => ({
    url: `${baseUrl}/listings/${l.mlsId}`,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...communityUrls, ...listingUrls];
}
```

[CITED: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap]

### Pattern 9: Nightly Cron for Community Sync

**What:** Add a new cron endpoint `/api/communities/sync` to `vercel.json`, running nightly alongside the existing listings sync.

```json
// vercel.json — add to existing crons array
{ "path": "/api/communities/sync", "schedule": "0 2 * * *" }
```

The sync route calls `syncSchellListings` (extended) which now upserts both `communities` table and individual floor plan `listings` rows.

### Anti-Patterns to Avoid

- **Querying Heartbeat API at page load time:** Rate-limited, adds latency. Always sync to `communities` table first; serve pages from Supabase.
- **Storing YouTube URLs — use video IDs:** Embed libraries and `youtube.com/embed/` expect just the video ID (11 chars), not full URLs. Extract IDs when storing.
- **Loading YouTube iframe directly:** Adds ~500KB of JavaScript at page load. Always use the facade pattern (`react-lite-youtube-embed`) to hit the 2s mobile LCP target.
- **Embedding Mapbox POI queries in a client component:** The Mapbox token is a `NEXT_PUBLIC_` variable, but making category API calls from the client unnecessarily exposes the endpoint. Fetch POIs in the RSC page (server-side) and pass as props.
- **Storing `preferred_date` as a separate column:** The `leads` table is shared infrastructure (Phase 8 reads it). Adding a tour-specific column creates schema drift. Encode in `message` field instead.
- **Building community pages without a `communities` table:** Querying `listings.raw_data` with JSONB filters on every page load is slow and unindexed. The `communities` table enables direct indexed queries.
- **Forgetting `dynamicParams = true`:** New communities added between deploys won't have `generateStaticParams` entries; `dynamicParams = true` allows ISR to handle them on first request.
- **Mixing IDX compliance rules with community pages:** Community pages are NOT IDX-regulated content. The `MlsAttribution` component and Fair Housing logo are NOT required on community pages (Schell is the builder/developer, not an MLS listing). Do not include IDX attribution on `/communities/*` pages.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| YouTube lazy embed | Custom IntersectionObserver + iframe swap | react-lite-youtube-embed@3.5.1 | Facade pattern, thumbnail pre-load, CSS included, 500ms LCP gain |
| Nearby POI search | Fetching from Google Places or building custom geocoding | Mapbox Search Box API category endpoint | Already paid for via Mapbox token; consistent with existing map stack |
| Tour lead capture form | New form + new API route + new email template | Extend `ContactAgentModal` + existing `/api/leads` | Full pipeline already built and tested in Phase 2; `sendNewLeadAlert` fires automatically |
| Community image optimization | Manual S3 URL manipulation | Add S3 domains to `next.config.ts remotePatterns` + `next/image` | Heartbeat images are already on S3; just whitelist the domain |
| Community sitemap | Separate sitemap package | Native Next.js `app/sitemap.ts` | Built-in, no extra dep, supports `generateSitemaps` if needed at scale |
| Community slug routing | Custom middleware slug resolution | Standard Next.js `[slug]` dynamic segment + `generateStaticParams` | Already proven pattern from `/listings/[mlsId]` |

**Key insight:** Phase 2 was designed with Phase 3 in mind. The leads table has `community_name` and `floor_plan_name` columns. The Heartbeat client is already in the codebase. The `raw_data.communityId` field is already populated. Phase 3 is primarily an assembly job — 20% new infrastructure, 80% composition.

## Common Pitfalls

### Pitfall 1: Heartbeat API Returns `false` on Invalid Params
**What goes wrong:** Calling `fetchFloorPlans` with an unknown `division_parent_id` returns `false` (not `[]`), crashing the sync with "Heartbeat API returned false."
**Why it happens:** The Heartbeat API returns the JavaScript boolean `false` when no data matches, not an empty array. The client already handles this for floor plans (`Array.isArray(plans) ? plans : []`) but the community fetcher needs the same guard.
**How to avoid:** Always check `Array.isArray(result) ? result : []` for all Heartbeat responses.
**Warning signs:** `syncSchellListings` throwing "Heartbeat API returned false" for new division IDs.
[VERIFIED: src/lib/schell/client.ts — comment "Returns false if no data"]

### Pitfall 2: Schell Image S3 URLs Not Whitelisted
**What goes wrong:** Community hero images and floor plan thumbnails show broken images in production.
**Why it happens:** `heartbeat-page-designer-production.s3.amazonaws.com` is not in `next.config.ts` `remotePatterns`.
**How to avoid:** Add `heartbeat-page-designer-production.s3.amazonaws.com` and `schellbrothers.com` to `remotePatterns` in Wave 0.
**Warning signs:** `next/image` throwing "Invalid src prop" errors; broken images in `/communities/*` pages.
[VERIFIED: src/lib/schell/transform.ts — s3ToHttps() generates `https://heartbeat-page-designer-production.s3.amazonaws.com/...` URLs]

### Pitfall 3: Community Slug Collisions Across States
**What goes wrong:** Two communities in different states share the same slug (e.g., "The Reserve" in DE and MD both become `the-reserve`).
**Why it happens:** Schell community slugs are scoped to state/division in their Heartbeat API, but not globally unique.
**How to avoid:** Prefix slugs with state abbreviation: `de-cardinal-grove`, `md-amberleigh`. Or use `community_id` as the slug (numeric, always unique). Decision: prefer `{state-lowercase}-{heartbeat-slug}` for human-readable URLs.
**Warning signs:** Supabase unique constraint violation on `communities.slug` during multi-state sync.

### Pitfall 4: YouTube Video IDs Missing from Database
**What goes wrong:** Community pages show no video section even though Schell Brothers has a YouTube channel.
**Why it happens:** YouTube video IDs are not in the Heartbeat API — they must be manually added per community by the agent.
**How to avoid:** Design the system so `youtube_video_ids TEXT[]` defaults to `'{}'` and `CommunityVideos` renders nothing when the array is empty. Add a note in the agent dashboard (Phase 8) for manual entry. For launch, Wave 0 can pre-populate with the 3-5 most important community video IDs.
**Warning signs:** Community pages rendering with blank video sections — this is expected behavior until populated.

### Pitfall 5: POI Category Names Not Matching Mapbox API
**What goes wrong:** `category/school` returns no results; actual Mapbox category key is different.
**Why it happens:** Mapbox Search Box API uses specific canonical category names (e.g., `school`, `elementary_school`, `restaurant`, `highway_ramp`).
**How to avoid:** Test category endpoints directly before hardcoding. Mapbox docs list canonical category names. Gracefully handle empty POI arrays — map renders correctly with just the community pin when POIs are unavailable.
**Warning signs:** Empty POI layers on the community map; 400 errors from the Search Box API.
[CITED: https://docs.mapbox.com/api/search/search-box/]

### Pitfall 6: ISR Stale After Nightly Sync
**What goes wrong:** Community pages show old data (old price, old amenities) hours after the nightly sync runs.
**Why it happens:** `revalidateTag("communities")` must be called from the sync route — identical to the listings pattern.
**How to avoid:** Call `revalidateTag("communities", {})` (with empty second arg per Next.js 16 requirement) at the end of `syncSchellListings`.
[VERIFIED: src/lib/schell/sync.ts already calls `revalidateTag("listings", {})` — same pattern needed for communities]

### Pitfall 7: Video Autoplay Blocking
**What goes wrong:** Mobile browsers block autoplay with audio; community hero video attempts autoplay and gets blocked.
**Why it happens:** Browser autoplay policy blocks video with audio.
**How to avoid:** `react-lite-youtube-embed` is click-to-play by default — no autoplay. For any `<video>` element (custom uploads), set `muted autoplay playsInline` for silent ambient autoplay; include a play/pause toggle.
**Warning signs:** "Autoplay was prevented" console messages; blank video area on hero.

## Code Examples

### Community Page RSC Assembly (Conceptual)

```tsx
// src/app/communities/[slug]/page.tsx
export default async function CommunityPage({ params }: PageProps) {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);
  if (!community) notFound();

  // Fetch live listings and POI in parallel
  const [listings, schools, restaurants] = await Promise.all([
    getCommunityListings(community.community_id),
    fetchNearbyPOI(community.lng!, community.lat!, "school", process.env.NEXT_PUBLIC_MAPBOX_TOKEN!),
    fetchNearbyPOI(community.lng!, community.lat!, "restaurant", process.env.NEXT_PUBLIC_MAPBOX_TOKEN!),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <CommunityHero community={community} />          {/* video or hero image + CTA */}
      <CommunityOverview community={community} />       {/* description, price range */}
      <CommunityAmenities amenities={community.amenities} />
      <CommunityFloorPlans listings={listings} />       {/* reuses ListingCard */}
      <CommunityVideos youtubeVideoIds={community.youtube_video_ids} communityName={community.name} />
      <CommunitySchools community={community} />
      <CommunityHoa community={community} />
      <CommunityMap community={community} schools={schools} restaurants={restaurants} />
      <ScheduleTourCTA community={community} />
    </main>
  );
}
```

### Extending Leads for Tour Context

```typescript
// The existing /api/leads route already accepts community_name and preferred_date
// encodes into message. No route changes needed.

// src/components/communities/schedule-tour-modal.tsx
const body: CreateLeadInput = {
  name, email, phone,
  message: [
    preferredDate ? `Preferred tour date: ${preferredDate}` : null,
    message,
  ].filter(Boolean).join("\n"),
  community_name: community.name,
  listing_url: `${process.env.NEXT_PUBLIC_SITE_URL}/communities/${community.slug}`,
  user_id: user?.id,
};

await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
```

### JSON-LD for Community Pages

```tsx
// Community pages use Residence + RealEstateAgent schema (not RealEstateListing)
// RealEstateListing is for individual IDX listings; communities are builder developments

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Residence",
  name: community.name,
  description: community.short_description,
  address: {
    "@type": "PostalAddress",
    addressLocality: community.city,
    addressRegion: community.state,
    postalCode: community.zip,
    addressCountry: "US",
  },
  geo: community.lat && community.lng ? {
    "@type": "GeoCoordinates",
    latitude: community.lat,
    longitude: community.lng,
  } : undefined,
  url: `https://tristatesrealty.com/communities/${community.slug}`,
  offers: {
    "@type": "Offer",
    price: community.price_from,
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| YouTube iframe direct embed | Facade pattern (react-lite-youtube-embed) | 2022+ standard | ~500ms LCP improvement; eliminates YouTube tracking JS on page load |
| Google Maps for nearby POI | Mapbox Search Box API category search | 2023+ (already using Mapbox) | No additional API key; consistent with existing map stack |
| Static sitemap files | `app/sitemap.ts` dynamic generation | Next.js 13+ App Router | Auto-updates on new communities; no manual maintenance |
| Hardcoded community data | Supabase `communities` table synced from Heartbeat | N/A (Phase 3 builds this) | Enables ISR, search, filtering, agent edits in Phase 8 |
| `pages/` getStaticProps ISR | App Router `generateStaticParams` + `revalidate` | Next.js 13+ App Router | Tag-based revalidation; granular cache invalidation per community |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Schell Brothers MD, NJ, PA division_parent_ids can be discovered by iterating integer IDs on the Heartbeat API | Architecture, Multi-State | MEDIUM — if Heartbeat uses non-sequential IDs or a different `source` param for other states, multi-state discovery requires different approach. Delaware-only launch remains viable. |
| A2 | Mapbox Search Box API category search accepts canonical category names `school`, `restaurant` for POI lookup | Pattern 5, Pitfall 5 | LOW — category names are documented; graceful fallback (empty POI array) means failure is non-blocking |
| A3 | Heartbeat API slug field is URL-safe and suitable for routing | Pattern 3, Architecture | LOW — slugs observed in `HeartbeatFloorPlan.url` look like `/delaware-beaches/cardinal-grove/camden/`; community slug field appears similar. Verify first community fetched. |
| A4 | react-lite-youtube-embed@3.5.1 is compatible with React 19 | Standard Stack | LOW — published 2026-02-24, likely tested against React 18+; verify peer deps on install |
| A5 | `preferred_date` encoded in `message` is sufficient for the agent use case until Phase 8 | Pattern 7, Pitfall 4 | LOW — the agent sees it in the lead email; the Phase 8 dashboard will display `message` field; no parsing required |

## Open Questions (RESOLVED)

1. **Schell Brothers MD/NJ/PA Heartbeat division IDs** — RESOLVED: Plan 03-01 uses assumed IDs 1–4 with explicit discovery logging (`[Heartbeat] division {id}: N communities`) and `Array.isArray(result) ? result : []` guard per division. Delaware-only at launch is the documented fallback if IDs 2–4 return empty. No code blocks on confirmed IDs.

2. **YouTube video ID inventory for communities** — RESOLVED: System handles empty `youtube_video_ids[]` gracefully — `CommunityVideos` returns null when the array is empty, so the video section simply doesn't render. Agent populates IDs pre-launch via the agent dashboard.

3. **Supabase Storage for custom video uploads** — RESOLVED: `custom_video_urls TEXT[]` column is created in the Phase 3 migration. Storage bucket creation and upload UI are deferred to Phase 8 (Agent Dashboard). Community pages display whatever is stored, including graceful empty state.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | YES | (project running) | — |
| Supabase | communities table | YES | Configured | — |
| Mapbox GL | Community map | YES | 3.21.x installed | — |
| Mapbox Search Box API | Nearby POI | YES (same token) | `@mapbox/search-js-react@1.5.1` to install | Omit POI layer — map still works with community pin only |
| Resend | Tour lead email | YES | 6.11.x installed | — |
| Heartbeat API | Community data | YES (no auth required) | Public API | — |
| react-lite-youtube-embed | YouTube embed | NOT INSTALLED | 3.5.1 available | Plain iframe with `loading="lazy"` (worse LCP but functional) |
| Supabase Storage | Custom video uploads | YES (built into Supabase) | — | Agent skips custom upload; YouTube only for launch |

**Missing dependencies with no fallback:**
- None — all critical dependencies are available or have viable fallbacks.

**Missing dependencies requiring install before Wave 1:**
- `react-lite-youtube-embed@3.5.1`
- `@mapbox/search-js-react@1.5.1`
- `heartbeat-page-designer-production.s3.amazonaws.com` added to `next.config.ts remotePatterns`

## Validation Architecture

**Note:** `CLAUDE.md` explicitly states "No test runner is configured yet." The `workflow.nyquist_validation` key is absent from `.planning/config.json`, which means the validation section is included per protocol, but Wave 0 must install a test framework before any tests can run.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None configured — see Wave 0 |
| Config file | none — must be created |
| Quick run command | `npm run build` (type check + build verification, no test runner yet) |
| Full suite command | `npm run build && npx tsc --noEmit` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCHELL-01 | Community pages build without error | smoke | `npm run build` | N/A — build check |
| SCHELL-02 | Community data renders (name, price, amenities, schools) | smoke | `npm run build` | N/A — manual review |
| SCHELL-03 | YouTube facade renders thumbnail; custom video URL displayed | manual | Visual inspection in browser | manual-only |
| SCHELL-04 | Live listings filtered to communityId render | smoke | `npm run build` | N/A — runtime DB |
| SCHELL-05 | Community map renders with Mapbox dark-v11 + pin | smoke | `npm run build` | N/A — manual review |
| SCHELL-06 | generateMetadata returns title/description/OG | smoke | `npm run build` (verifies metadata export) | N/A |
| SCHELL-07 | Tour form submits → 201 from /api/leads | integration | Manual: POST /api/leads with community fields | manual-only |

### Sampling Rate
- **Per task commit:** `npm run build` — TypeScript 0 errors, all routes compile
- **Per wave merge:** `npm run build && npx tsc --noEmit`
- **Phase gate:** Manual UAT of community page on localhost before marking phase complete

### Wave 0 Gaps
- [ ] `supabase/migrations/XXXXXXXX_create_communities.sql` — communities table schema
- [ ] Heartbeat division ID discovery script (one-off, not committed as test)
- [ ] `next.config.ts remotePatterns` — add S3 image domain for Schell photos
- [ ] `npm install react-lite-youtube-embed @mapbox/search-js-react`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Community pages are public; no auth required |
| V3 Session Management | No | No session state on community pages |
| V4 Access Control | Partial | Tour form uses Clerk `useUser()` to pre-fill; optional auth |
| V5 Input Validation | Yes | Tour form validated via Zod before POST to `/api/leads` |
| V6 Cryptography | No | No custom crypto needed |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via community description/amenity names | Tampering | React JSX renders as text by default; never use `dangerouslySetInnerHTML` with Heartbeat data. Exception: JSON-LD script — apply same `\u003c` escape pattern from `ListingJsonLd` |
| SSRF via custom video upload URL injection | Tampering | Custom video URLs stored by agent (trusted); validate against `NEXT_PUBLIC_SUPABASE_URL` storage pattern on upload |
| Lead form spam (bot submissions) | Denial of Service | Rate limiting via Vercel edge (already configured in vercel.json headers); add `honeypot` hidden field to tour form |
| Mapbox token exposure in POI fetch | Information Disclosure | `NEXT_PUBLIC_MAPBOX_TOKEN` is intended to be public (Mapbox design); token is scoped/restricted by URL in Mapbox dashboard |
| Heartbeat API scraping — ToS violation | Legal | Scraping is polite (300ms delay, proper User-Agent, Referer); for production, confirm Schell Brothers consent or use their official data partnership program if available |

## Sources

### Primary (HIGH confidence)
- Codebase — `src/lib/schell/` (client.ts, sync.ts, transform.ts, types.ts) [VERIFIED: direct file read]
- Codebase — `src/app/api/leads/route.ts`, `src/lib/supabase/queries/leads.ts` [VERIFIED: direct file read]
- Codebase — `src/components/listings/contact-agent-modal.tsx`, `location-map.tsx` [VERIFIED: direct file read]
- Codebase — `src/types/listing.ts`, `src/lib/constants/mls.ts` [VERIFIED: direct file read]
- npm registry — react-lite-youtube-embed@3.5.1 (published 2026-02-24) [VERIFIED: npm view]
- npm registry — @mapbox/search-js-react@1.5.1 (published 2025-12-09) [VERIFIED: npm view]
- Phase 2 SUMMARY files — 02-01 through 02-11 [VERIFIED: direct file read]

### Secondary (MEDIUM confidence)
- Mapbox Search Box API docs [CITED: https://docs.mapbox.com/api/search/search-box/]
- Next.js sitemap.ts docs [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap]
- react-lite-youtube-embed usage guide [CITED: https://www.franciscomoretti.com/blog/use-a-lite-youtube-embedded-player-in-nextjs]

### Tertiary (LOW confidence)
- Heartbeat API division IDs for MD/NJ/PA — assumed sequential integers; unverified

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — all core deps already installed and used in Phase 2; two new deps verified from npm registry
- Data Model: HIGH — Heartbeat types fully defined in codebase; communities table gap confirmed by migration inspection
- Architecture: HIGH — all patterns derived from Phase 2 codebase (ISR, leads, Mapbox, sync)
- Multi-state support: MEDIUM — Delaware confirmed; other state division IDs assumed sequential, not verified
- Pitfalls: HIGH — most derived from Phase 2 code and known Heartbeat API behavior (false return value)

**Research date:** 2026-04-16
**Valid until:** 2026-05-16 (30 days — stable ecosystem; Heartbeat API is unofficial but has been stable)
