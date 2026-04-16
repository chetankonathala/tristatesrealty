# Phase 2: IDX Listings Engine - Research

**Researched:** 2026-04-13
**Domain:** Real Estate IDX Integration (SimplyRETS + Bright MLS), Next.js ISR, Mapbox Search UI, Supabase Caching
**Confidence:** HIGH

## Summary

Phase 2 builds the core product: a searchable, map-enabled listing experience powered by SimplyRETS (Bright MLS IDX feed) with ISR-generated detail pages. The SimplyRETS REST API provides comprehensive query parameters for filtering (price, beds, baths, sqft, type, status, geo polygon, cities, counties) and returns rich listing objects including photos, address, property details, geo coordinates, school data, tax info, and agent/office attribution. The API uses Basic Auth, supports cursor-based pagination (lastId + limit up to 500), and has no webhook support -- meaning a polling-based sync strategy is required.

The architecture should sync listings into Supabase every 15 minutes via a cron job (Vercel Cron or AWS Lambda), enabling fast filtered queries without hitting SimplyRETS rate limits on every user search. This also prepares the data layer for Phase 4's AI embeddings (pgvector). Next.js ISR with `revalidateTag` provides on-demand cache invalidation when the sync job detects changes. The search page uses a split layout (Mapbox map + list view) with `supercluster` for clustering thousands of markers performantly.

**Primary recommendation:** Sync SimplyRETS data into Supabase as the source of truth for search queries; use ISR with tag-based revalidation for listing detail pages; build search filters as URL search params for shareability.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| IDX-01 | Bright MLS IDX feed via SimplyRETS RESO Web API integrated (DE, MD, NJ, PA) | SimplyRETS API fully documented: Basic Auth, /properties endpoint with comprehensive filters, cursor pagination, multi-vendor support |
| IDX-02 | Listings sync every 15 min; new listings trigger ISR revalidation via webhook | No webhook from SimplyRETS -- use polling cron job + revalidateTag for on-demand ISR invalidation |
| IDX-03 | Listing search page with map view (Mapbox GL) + list view toggle | react-map-gl 8.x + supercluster for clustering; existing MapContainer component as foundation |
| IDX-04 | Advanced filters: price, beds, baths, type, sqft, zip, city, county, school, new construction, waterfront, garage, lot size | SimplyRETS supports: minprice/maxprice, minbeds/maxbeds, minbaths/maxbaths, minarea/maxarea, type, cities, counties, postalCodes, water, features, neighborhoods. School district/garage/lot size via Supabase queries on synced data |
| IDX-05 | Listing detail page: photo gallery, price, address, beds/baths/sqft, description, open houses, DOM, price history | SimplyRETS returns all fields: photos array, address object, property object, mls.daysOnMarket, remarks, listDate. Price history from sales object (Closed status queries) |
| IDX-06 | Google Street View embed on every listing detail page | Google Maps Embed API streetview mode -- free, requires API key, iframe with address parameter |
| IDX-07 | SEO-optimized listing pages with JSON-LD RealEstateListing structured data | Schema.org RealEstateListing + Offer + Place; limited native properties -- use offers for price, address for location |
| IDX-08 | Comparable sales (comps) section on listing detail page | Query SimplyRETS with status=Closed + geographic proximity + similar beds/baths/sqft; cache in Supabase |
| IDX-09 | MLS attribution and Fair Housing logo per Bright MLS rules | Listing firm name + contact required on every detail page; copyright notice; Fair Housing Equal Opportunity logo |
| IDX-10 | Saved searches with email + SMS alerts on new matches | Supabase table for search criteria; cron job compares new listings against saved searches; Resend for email, Twilio for SMS |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.x | Framework (ISR, App Router, RSC) | Already installed; ISR + generateStaticParams for listing pages [VERIFIED: npm registry] |
| react-map-gl | 8.1.x | Mapbox GL wrapper for React | Already installed; official Mapbox-maintained React binding [VERIFIED: package.json] |
| mapbox-gl | 3.21.x | Map rendering engine | Already installed; dark-v11 style matches design system [VERIFIED: package.json] |
| @supabase/supabase-js | 2.102.x | Database client | Already installed; handles all DB operations [VERIFIED: package.json] |
| @supabase/ssr | 0.10.x | Server-side Supabase client | Already installed; cookie-based auth for RSC [VERIFIED: package.json] |
| zod | 4.3.x | Schema validation | Already installed; validate API responses and search params [VERIFIED: package.json] |

### New Dependencies

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| supercluster | 8.0.1 | Fast geospatial clustering for map markers | Cluster thousands of listing pins on the map [VERIFIED: npm registry] |
| use-supercluster | 1.2.0 | React hook for supercluster | Integrate clustering with react-map-gl viewport changes [VERIFIED: npm registry] |
| resend | 6.11.0 | Transactional email API | Saved search alert emails [VERIFIED: npm registry] |
| @react-email/components | 1.0.12 | React email templates | Build listing alert email templates [VERIFIED: npm registry] |
| nuqs | latest | URL search params state management | Type-safe URL state for search filters (shareable URLs) [ASSUMED] |

### Already Installed (Phase 1)

| Library | Purpose in Phase 2 |
|---------|---------------------|
| framer-motion | Photo gallery transitions, list animations |
| lucide-react | Filter icons, listing detail icons |
| shadcn/ui | Slider (price), Select (filters), Sheet (mobile filters), Dialog (gallery lightbox) |
| react-hook-form + zod | Saved search form, contact forms |
| clsx + tailwind-merge | Conditional styling throughout |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase cache | Direct SimplyRETS queries | Simpler but hits rate limits; no fast full-text search; blocks Phase 4 AI embeddings |
| supercluster | Mapbox built-in clustering (Source + Layer) | Mapbox native clustering is simpler but less customizable for React marker rendering |
| nuqs | Manual useSearchParams | nuqs handles serialization/parsing/shallow routing automatically; manual is more code |
| Resend | SendGrid | Resend has better DX, React email templates, simpler API; SendGrid more mature but heavier |

**Installation:**
```bash
npm install supercluster use-supercluster resend @react-email/components nuqs
npm install -D @types/supercluster
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── listings/
│   │   ├── page.tsx                    # Search page (RSC shell + client search UI)
│   │   └── [mlsId]/
│   │       ├── page.tsx                # Listing detail (ISR, generateStaticParams)
│   │       └── opengraph-image.tsx     # Dynamic OG image
│   ├── api/
│   │   ├── listings/
│   │   │   ├── sync/route.ts           # Cron endpoint: poll SimplyRETS, sync to Supabase
│   │   │   └── revalidate/route.ts     # On-demand ISR revalidation trigger
│   │   └── saved-searches/
│   │       ├── route.ts                # CRUD for saved searches
│   │       └── notify/route.ts         # Cron endpoint: check matches, send alerts
│   └── (auth)/
│       └── ...                         # Existing Clerk auth pages
├── components/
│   ├── listings/
│   │   ├── search-map.tsx              # Map with clustered markers (client)
│   │   ├── search-list.tsx             # List view with pagination (client)
│   │   ├── search-filters.tsx          # Filter panel (client)
│   │   ├── listing-gallery.tsx         # Photo gallery with lightbox (client)
│   │   ├── listing-detail.tsx          # Detail page content (server)
│   │   ├── comparable-sales.tsx        # Comps section (server)
│   │   ├── street-view.tsx             # Google Street View embed
│   │   ├── price-history.tsx           # Price change timeline
│   │   └── mls-attribution.tsx         # Required MLS disclaimer + Fair Housing
│   ├── cards/
│   │   └── listing-card.tsx            # Already exists -- extend with save button
│   └── map/
│       ├── index.tsx                   # Already exists -- dynamic import
│       └── map-container.tsx           # Already exists -- extend with markers/clusters
├── lib/
│   ├── simplyrets/
│   │   ├── client.ts                   # SimplyRETS API client (Basic Auth, fetch wrapper)
│   │   ├── types.ts                    # TypeScript types for API responses
│   │   └── sync.ts                     # Sync logic: fetch delta, upsert to Supabase
│   ├── supabase/
│   │   ├── client.ts                   # Already exists
│   │   ├── server.ts                   # Already exists
│   │   └── queries/
│   │       ├── listings.ts             # Listing query functions (search, detail, comps)
│   │       └── saved-searches.ts       # Saved search CRUD + match detection
│   └── schemas/
│       ├── listing.ts                  # Zod schema for listing data
│       └── search-params.ts            # Zod schema for URL search params
├── emails/
│   └── listing-alert.tsx               # React Email template for saved search alerts
└── types/
    └── listing.ts                      # Shared listing types
```

### Pattern 1: SimplyRETS Polling Sync to Supabase

**What:** Cron job polls SimplyRETS every 15 minutes, upserts listings into Supabase, then triggers ISR revalidation for changed listings.
**When to use:** Every sync cycle -- this is the core data pipeline.

```typescript
// Source: SimplyRETS API docs + Next.js ISR docs
// src/lib/simplyrets/sync.ts

import { revalidateTag } from "next/cache";

const SIMPLYRETS_BASE = "https://api.simplyrets.com";
const AUTH = Buffer.from(`${process.env.SIMPLYRETS_KEY}:${process.env.SIMPLYRETS_SECRET}`).toString("base64");

export async function syncListings() {
  let lastId = 0;
  let hasMore = true;
  const changedMlsIds: number[] = [];

  while (hasMore) {
    const url = `${SIMPLYRETS_BASE}/properties?limit=500&lastId=${lastId}&status=Active&vendor=${process.env.SIMPLYRETS_VENDOR}`;
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${AUTH}` },
    });
    const listings = await res.json();

    if (listings.length === 0) {
      hasMore = false;
      break;
    }

    // Upsert to Supabase
    const { data } = await supabase
      .from("listings")
      .upsert(
        listings.map(transformListing),
        { onConflict: "mls_id" }
      );

    changedMlsIds.push(...listings.map((l: any) => l.mlsId));
    lastId = listings[listings.length - 1].mlsId;

    if (listings.length < 500) hasMore = false;
  }

  // Trigger ISR revalidation
  revalidateTag("listings");
  for (const id of changedMlsIds.slice(0, 50)) {
    revalidateTag(`listing-${id}`);
  }
}
```

### Pattern 2: ISR with generateStaticParams + dynamicParams

**What:** Pre-build 500 top listings at deploy time; serve all others on-demand with ISR caching.
**When to use:** Listing detail pages.

```typescript
// src/app/listings/[mlsId]/page.tsx
import { unstable_cache } from "next/cache";

export const dynamicParams = true; // Allow on-demand generation

export async function generateStaticParams() {
  // Pre-build top 500 listings (by price or featured status)
  const { data } = await supabase
    .from("listings")
    .select("mls_id")
    .order("list_price", { ascending: false })
    .limit(500);

  return (data ?? []).map((l) => ({ mlsId: String(l.mls_id) }));
}

export async function generateMetadata({ params }: Props) {
  const listing = await getListing(params.mlsId);
  return {
    title: `${listing.address.full} | Tri States Realty`,
    description: `${listing.property.bedrooms} bed, ${listing.property.bathrooms} bath home in ${listing.address.city}, ${listing.address.state}`,
  };
}

// Tag-based caching for on-demand revalidation
const getListing = unstable_cache(
  async (mlsId: string) => {
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("mls_id", mlsId)
      .single();
    return data;
  },
  ["listing"],
  { tags: ["listings"], revalidate: 900 } // 15 min fallback
);
```

### Pattern 3: URL-Based Search State

**What:** All search filters stored in URL search params for shareability and bookmarking.
**When to use:** Search page filters.

```typescript
// src/lib/schemas/search-params.ts
import { z } from "zod";

export const searchParamsSchema = z.object({
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minBeds: z.coerce.number().optional(),
  maxBeds: z.coerce.number().optional(),
  minBaths: z.coerce.number().optional(),
  maxBaths: z.coerce.number().optional(),
  minSqft: z.coerce.number().optional(),
  maxSqft: z.coerce.number().optional(),
  type: z.enum(["residential", "condominium", "townhouse", "land", "multifamily"]).optional(),
  cities: z.string().optional(), // comma-separated
  counties: z.string().optional(),
  postalCodes: z.string().optional(),
  waterfront: z.coerce.boolean().optional(),
  sort: z.enum(["price-asc", "price-desc", "date-desc", "date-asc"]).optional(),
  page: z.coerce.number().default(1),
  view: z.enum(["map", "list", "split"]).default("split"),
  bounds: z.string().optional(), // "sw_lng,sw_lat,ne_lng,ne_lat" for map viewport
});
```

### Pattern 4: Map + List Sync with Supercluster

**What:** Map viewport changes filter the list; list selection highlights on map. Markers cluster at zoom levels.
**When to use:** Search page split view.

```typescript
// Conceptual pattern for search-map.tsx
import { useMap } from "react-map-gl/mapbox";
import useSupercluster from "use-supercluster";

// Convert listings to GeoJSON points
const points = listings.map((listing) => ({
  type: "Feature" as const,
  properties: { cluster: false, listingId: listing.mls_id, price: listing.list_price },
  geometry: { type: "Point" as const, coordinates: [listing.lng, listing.lat] },
}));

// Cluster with supercluster hook
const { clusters, supercluster } = useSupercluster({
  points,
  bounds: mapBounds, // [westLng, southLat, eastLng, northLat]
  zoom: mapZoom,
  options: { radius: 75, maxZoom: 16 },
});
```

### Anti-Patterns to Avoid

- **Querying SimplyRETS on every user search:** Rate limits (5 concurrent, daily cap) will throttle real users. Sync to Supabase instead.
- **Storing listing photos in Supabase Storage:** SimplyRETS serves photos via CDN already. Store URLs only, use Next.js Image with remotePatterns for optimization.
- **Client-side filtering of all listings:** With thousands of listings, this kills performance. Server-side SQL queries with proper indexes.
- **Single monolithic search API route:** Split into map-viewport queries and filtered-list queries for independent caching.
- **Hardcoding Bright MLS disclaimer text:** Store in a config/constant file so it can be updated without code changes when MLS rules change.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Map marker clustering | Custom quadtree/grid clustering | supercluster + use-supercluster | Handles 100K+ points, zoom transitions, cluster expansion |
| URL search param sync | Manual URLSearchParams parsing | nuqs (or equivalent) | Type-safe, handles serialization, shallow routing, SSR-safe |
| Email templates | Raw HTML email strings | @react-email/components | React components render to email-safe HTML; previewing works |
| Photo gallery lightbox | Custom modal + image carousel | Existing shadcn Dialog + embla-carousel or similar | Keyboard nav, touch gestures, zoom, preloading |
| Geospatial queries | Raw SQL distance calculations | Supabase PostGIS (ST_DWithin, ST_MakeEnvelope) | Index-backed spatial queries; handles earth curvature |
| Rate limiting for API routes | Custom token bucket | Vercel built-in rate limiting or upstash/ratelimit | Edge-optimized, Redis-backed |

## Common Pitfalls

### Pitfall 1: SimplyRETS Rate Limit Exhaustion
**What goes wrong:** Hitting the 5-concurrent-request limit or daily cap causes 429 errors and broken search.
**Why it happens:** Querying SimplyRETS directly on each user search request.
**How to avoid:** Sync all listings to Supabase; only hit SimplyRETS from the cron job. Add retry logic with exponential backoff in the sync job.
**Warning signs:** 429 response codes in logs; search results intermittently empty.

### Pitfall 2: ISR Stale Content After Sync
**What goes wrong:** Listing detail pages show stale data even after sync completes.
**Why it happens:** `revalidateTag` marks content as stale but doesn't regenerate until next visit (stale-while-revalidate). If nobody visits, old data persists.
**How to avoid:** Combine tag-based revalidation with a 15-minute time-based `revalidate` as fallback. Accept that the first visitor after sync sees stale content briefly.
**Warning signs:** Price or status discrepancies between search results (Supabase) and detail pages (ISR cache).

### Pitfall 3: Bright MLS Compliance Violations
**What goes wrong:** MLS sends cease-and-desist or revokes IDX access.
**Why it happens:** Missing listing firm attribution, missing Fair Housing logo, wrong copyright notice, or displaying non-IDX-authorized fields.
**How to avoid:** Create a dedicated `<MlsAttribution />` component used on every page displaying listing data. Include: listing firm name + contact, Bright MLS copyright, Fair Housing logo, data disclaimer, last-updated timestamp.
**Warning signs:** Compliance audit email from Bright MLS; missing attribution visible on any listing page.

### Pitfall 4: Map Performance with Thousands of Markers
**What goes wrong:** Map becomes sluggish with 10K+ individual markers rendering as DOM elements.
**Why it happens:** Rendering individual React marker components for each listing.
**How to avoid:** Use supercluster for clustering. At low zoom levels, show cluster circles with count. Only render individual markers when zoomed in enough that cluster count < ~100.
**Warning signs:** Map framerate drops below 30fps; scroll/pan feels laggy.

### Pitfall 5: SimplyRETS Pagination Gotcha
**What goes wrong:** Missing listings during sync; duplicate processing.
**Why it happens:** Using offset-based pagination which can skip/duplicate when data changes during pagination. SimplyRETS docs recommend `lastId` cursor pagination instead.
**How to avoid:** Always use `lastId` parameter, not `offset`. Track the last mlsId returned and pass as `lastId` for next page.
**Warning signs:** Listing count in Supabase doesn't match X-Total-Count header from SimplyRETS.

### Pitfall 6: Next.js Image Domain Configuration
**What goes wrong:** Listing photos fail to load with "Invalid src" errors.
**Why it happens:** SimplyRETS photo URLs come from various MLS CDN domains not configured in next.config.
**How to avoid:** Add SimplyRETS photo domains to `images.remotePatterns` in next.config. Use a broad pattern like `{ protocol: "https", hostname: "**.simplyrets.com" }` plus the actual MLS photo CDN hostname (varies by MLS, check actual photo URLs from test data).
**Warning signs:** Broken image icons on listing cards; console errors about invalid image src.

## Code Examples

### SimplyRETS API Client

```typescript
// src/lib/simplyrets/client.ts
// Source: SimplyRETS OpenAPI spec [VERIFIED: apis.guru/simplyrets]

const BASE_URL = "https://api.simplyrets.com";

function getAuthHeader() {
  const credentials = Buffer.from(
    `${process.env.SIMPLYRETS_API_KEY}:${process.env.SIMPLYRETS_API_SECRET}`
  ).toString("base64");
  return `Basic ${credentials}`;
}

export interface SimplyRetsSearchParams {
  status?: ("Active" | "Pending" | "ActiveUnderContract" | "ComingSoon")[];
  type?: ("residential" | "condominium" | "land" | "multifamily" | "commercial")[];
  minprice?: number;
  maxprice?: number;
  minbeds?: number;
  maxbeds?: number;
  minbaths?: number;
  maxbaths?: number;
  minarea?: number;
  maxarea?: number;
  cities?: string[];
  counties?: string[];
  postalCodes?: string[];
  water?: string;
  features?: string[];
  neighborhoods?: string[];
  points?: string[]; // Geographic polygon vertices
  sort?: string;
  limit?: number;
  lastId?: number;
  q?: string; // Keyword search
  include?: ("association" | "rooms" | "pool" | "parking")[];
}

export async function fetchProperties(params: SimplyRetsSearchParams) {
  const searchParams = new URLSearchParams();

  // Handle array params (SimplyRETS expects repeated keys)
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else {
      searchParams.set(key, String(value));
    }
  }

  const res = await fetch(`${BASE_URL}/properties?${searchParams}`, {
    headers: { Authorization: getAuthHeader() },
  });

  if (!res.ok) throw new Error(`SimplyRETS error: ${res.status}`);

  const totalCount = res.headers.get("X-Total-Count");
  const listings = await res.json();

  return { listings, totalCount: totalCount ? parseInt(totalCount) : null };
}

export async function fetchProperty(mlsId: string) {
  const res = await fetch(`${BASE_URL}/properties/${mlsId}`, {
    headers: { Authorization: getAuthHeader() },
  });
  if (!res.ok) throw new Error(`SimplyRETS error: ${res.status}`);
  return res.json();
}
```

### Supabase Listings Table Schema

```sql
-- supabase/migrations/XXXXXXXX_create_listings.sql

CREATE TABLE listings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  mls_id INTEGER UNIQUE NOT NULL,
  listing_id TEXT,
  list_price NUMERIC NOT NULL,
  list_date TIMESTAMPTZ,
  modified TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Active',
  type TEXT,
  subtype TEXT,

  -- Address (denormalized for fast queries)
  address_full TEXT NOT NULL,
  address_street TEXT,
  address_city TEXT NOT NULL,
  address_state TEXT NOT NULL,
  address_postal_code TEXT,
  address_county TEXT,

  -- Property details
  bedrooms INTEGER,
  bathrooms NUMERIC,
  area NUMERIC, -- sqft
  lot_size NUMERIC,
  year_built INTEGER,
  stories INTEGER,
  garage_spaces INTEGER,
  pool TEXT,

  -- Geo
  lat NUMERIC,
  lng NUMERIC,
  geo_market_area TEXT,

  -- Content
  remarks TEXT,
  photos TEXT[] NOT NULL DEFAULT '{}',
  virtual_tour_url TEXT,

  -- MLS metadata
  listing_agent_name TEXT,
  listing_agent_phone TEXT,
  listing_agent_email TEXT,
  listing_office_name TEXT,
  listing_office_phone TEXT,
  co_agent_name TEXT,
  days_on_market INTEGER,

  -- School
  school_district TEXT,
  school_elementary TEXT,
  school_middle TEXT,
  school_high TEXT,

  -- Tax
  tax_annual_amount NUMERIC,

  -- Association/HOA
  hoa_fee NUMERIC,
  hoa_frequency TEXT,

  -- Features (for filtering)
  features TEXT[] DEFAULT '{}',
  waterfront BOOLEAN DEFAULT FALSE,
  new_construction BOOLEAN DEFAULT FALSE,

  -- Metadata
  raw_data JSONB, -- Full SimplyRETS response for completeness
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for search queries
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_price ON listings(list_price);
CREATE INDEX idx_listings_city ON listings(address_city);
CREATE INDEX idx_listings_state ON listings(address_state);
CREATE INDEX idx_listings_county ON listings(address_county);
CREATE INDEX idx_listings_postal ON listings(address_postal_code);
CREATE INDEX idx_listings_beds ON listings(bedrooms);
CREATE INDEX idx_listings_baths ON listings(bathrooms);
CREATE INDEX idx_listings_area ON listings(area);
CREATE INDEX idx_listings_type ON listings(type);
CREATE INDEX idx_listings_modified ON listings(modified);
CREATE INDEX idx_listings_geo ON listings(lat, lng);
CREATE INDEX idx_listings_waterfront ON listings(waterfront) WHERE waterfront = TRUE;

-- GIN index for features array search
CREATE INDEX idx_listings_features ON listings USING GIN(features);

-- Composite indexes for common filter combos
CREATE INDEX idx_listings_search ON listings(status, address_state, list_price, bedrooms);
```

### Saved Searches Table

```sql
CREATE TABLE saved_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Clerk user ID
  name TEXT NOT NULL,
  criteria JSONB NOT NULL, -- Serialized search params
  email_alerts BOOLEAN DEFAULT TRUE,
  sms_alerts BOOLEAN DEFAULT FALSE,
  phone_number TEXT, -- For SMS alerts
  is_active BOOLEAN DEFAULT TRUE,
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_active ON saved_searches(is_active) WHERE is_active = TRUE;
```

### MLS Attribution Component

```tsx
// src/components/listings/mls-attribution.tsx
// Source: Bright MLS Rules [CITED: brightmls.com/rules-and-regulations]

export function MlsAttribution({
  listingOfficeName,
  listingAgentName,
  listingAgentPhone,
}: {
  listingOfficeName: string;
  listingAgentName?: string;
  listingAgentPhone?: string;
}) {
  return (
    <div className="border-t border-border pt-4 mt-6 text-xs text-muted-foreground space-y-2">
      <p>
        Listing provided by: <strong className="text-foreground">{listingOfficeName}</strong>
        {listingAgentName && ` - ${listingAgentName}`}
        {listingAgentPhone && ` | ${listingAgentPhone}`}
      </p>
      <p>
        Copyright {new Date().getFullYear()} Bright MLS. All rights reserved.
        Information deemed reliable but not guaranteed.
        Data last updated: {new Date().toLocaleDateString()}.
      </p>
      <div className="flex items-center gap-4 mt-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/fair-housing-logo.svg"
          alt="Equal Housing Opportunity"
          width={40}
          height={40}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/bright-mls-logo.svg"
          alt="Bright MLS"
          width={80}
          height={30}
        />
      </div>
    </div>
  );
}
```

### JSON-LD Structured Data

```typescript
// src/components/listings/listing-jsonld.tsx
// Source: schema.org/RealEstateListing [CITED: schema.org]

interface ListingJsonLdProps {
  listing: {
    address_full: string;
    address_city: string;
    address_state: string;
    address_postal_code: string;
    list_price: number;
    bedrooms: number;
    bathrooms: number;
    area: number;
    remarks: string;
    photos: string[];
    list_date: string;
    lat: number;
    lng: number;
  };
}

export function ListingJsonLd({ listing }: ListingJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.address_full,
    datePosted: listing.list_date,
    description: listing.remarks,
    image: listing.photos.slice(0, 6),
    url: `https://tristatesrealty.com/listings/${listing.mls_id}`,
    offers: {
      "@type": "Offer",
      price: listing.list_price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.address_full,
      addressLocality: listing.address_city,
      addressRegion: listing.address_state,
      postalCode: listing.address_postal_code,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: listing.lat,
      longitude: listing.lng,
    },
    numberOfRooms: listing.bedrooms,
    floorSize: {
      "@type": "QuantitativeValue",
      value: listing.area,
      unitCode: "FTK", // square feet
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### Google Street View Embed

```tsx
// src/components/listings/street-view.tsx
// Source: Google Maps Embed API docs [CITED: developers.google.com/maps/documentation/embed]

export function StreetView({ address, className }: { address: string; className?: string }) {
  const encodedAddress = encodeURIComponent(address);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className={cn("rounded-lg overflow-hidden", className)}>
      <iframe
        width="100%"
        height="300"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${encodedAddress}`}
      />
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| RETS/RETS-XML feed parsing | SimplyRETS REST API (wraps RESO Web API) | 2020+ | No XML parsing; clean JSON responses |
| getStaticProps ISR | App Router generateStaticParams + revalidateTag | Next.js 13+ (stable 14+) | Tag-based granular revalidation; no full rebuild |
| Client-side map filtering | Server-side Supabase queries + map viewport sync | Current best practice | Better performance; data stays server-side |
| SendGrid/Mailgun for email | Resend + React Email | 2023+ | React component email templates; better DX |
| Google Maps for IDX sites | Mapbox GL JS | Trend | Better dark theme support; more customizable; tile-based rendering |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | nuqs is the best URL search params library for Next.js 16 App Router | Standard Stack | LOW -- could use manual useSearchParams; nuqs is convenience |
| A2 | SimplyRETS photo URLs can be served through Next.js Image optimization | Pitfall 6 | MEDIUM -- need to verify actual CDN domains from test data |
| A3 | Bright MLS requires Fair Housing Equal Opportunity logo on IDX displays | Common Pitfalls | LOW -- standard NAR requirement; specific Bright MLS format TBD |
| A4 | SimplyRETS vendor parameter corresponds to Bright MLS feed | Architecture | LOW -- standard multi-MLS config; vendor ID confirmed during account setup |
| A5 | Supabase PostGIS extensions are available on the current plan | Don't Hand-Roll | MEDIUM -- pgvector is enabled; PostGIS may need separate extension enablement |
| A6 | Google Maps Embed API Street View mode is free with no usage limits | Code Examples | MEDIUM -- was free as of 2024; Google pricing changes possible |
| A7 | Twilio is the SMS provider for saved search alerts | Phase Requirements | MEDIUM -- not explicitly confirmed; could use alternative SMS provider |

## Open Questions

1. **SimplyRETS Vendor ID for Bright MLS**
   - What we know: SimplyRETS uses a `vendor` parameter to identify which MLS feed to query when account has multiple feeds.
   - What's unclear: The specific vendor string for Bright MLS; this is provided during SimplyRETS account setup.
   - Recommendation: Use an environment variable `SIMPLYRETS_VENDOR` and document it in .env.example.

2. **Photo CDN Domains**
   - What we know: SimplyRETS serves photos via HTTPS URLs.
   - What's unclear: The exact hostname(s) used for Bright MLS photo CDN (needed for next.config `remotePatterns`).
   - Recommendation: Start with SimplyRETS test data to identify domains; add to next.config as discovered.

3. **Bright MLS Specific Disclaimer Text**
   - What we know: General IDX rules require listing firm attribution, copyright, Fair Housing logo.
   - What's unclear: Exact required disclaimer verbiage from Bright MLS (may differ from generic NAR template).
   - Recommendation: Store disclaimer text in a constants file; update after receiving Bright MLS IDX agreement.

4. **PostGIS Extension Availability**
   - What we know: pgvector is enabled. Comparable sales queries need geo proximity.
   - What's unclear: Whether PostGIS (earth_distance or postgis) is enabled on current Supabase plan.
   - Recommendation: Check Supabase dashboard; if not available, use Haversine formula in SQL or lat/lng bounding box approximation.

5. **Saved Search SMS Provider**
   - What we know: Requirements mention email + SMS alerts.
   - What's unclear: Whether Twilio is the confirmed SMS provider or if another option is preferred.
   - Recommendation: Build email alerts first (Resend); add SMS as separate task. Twilio is default assumption.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | YES | (project runs) | -- |
| Supabase | Database + caching | YES | Configured | -- |
| Clerk | Auth for saved searches | YES | Configured | -- |
| Mapbox GL | Map rendering | YES | 3.21.x installed | -- |
| SimplyRETS API | MLS data | UNKNOWN | -- | Cannot proceed without credentials |
| Google Maps API | Street View embed | UNKNOWN | -- | Skip Street View initially |
| Resend | Email alerts | NOT INSTALLED | 6.11.0 available | -- (install needed) |
| Twilio | SMS alerts | NOT INSTALLED | -- | Defer SMS to later; email-only first |

**Missing dependencies with no fallback:**
- SimplyRETS API credentials (required before any real data can flow; test credentials available for development)

**Missing dependencies with fallback:**
- Google Maps API key (Street View can be deferred; still useful without it)
- Twilio (SMS alerts are nice-to-have; email alerts via Resend cover the core requirement)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes (saved searches) | Clerk handles auth; middleware already protects /dashboard, /favorites |
| V3 Session Management | Yes | Clerk manages sessions; no custom session logic needed |
| V4 Access Control | Yes | Saved searches scoped to Clerk user_id; agent routes role-gated |
| V5 Input Validation | Yes | Zod validation on all search params, saved search criteria, API route inputs |
| V6 Cryptography | No | No custom crypto; SimplyRETS credentials in env vars |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| SimplyRETS credential exposure | Information Disclosure | Store in env vars only; never expose to client; server-side API calls only |
| IDOR on saved searches | Tampering | Always filter by authenticated user_id from Clerk session |
| Search param injection | Tampering | Zod validation on all URL params; sanitize before Supabase queries |
| Rate limit bypass on sync endpoint | Denial of Service | Protect /api/listings/sync with secret header or Vercel Cron secret |
| XSS in listing remarks | Tampering | Sanitize MLS remarks text before rendering; avoid dangerouslySetInnerHTML |

## Sources

### Primary (HIGH confidence)
- SimplyRETS OpenAPI Spec via apis.guru -- full endpoint parameters, response schema [VERIFIED: https://api.apis.guru/v2/specs/simplyrets.com/1.0.0/swagger.json]
- SimplyRETS documentation -- authentication, pagination, rate limits [VERIFIED: https://docs.simplyrets.com/]
- Next.js official docs -- ISR, generateStaticParams, revalidateTag [VERIFIED: https://nextjs.org/docs/app/guides/incremental-static-regeneration]
- Schema.org RealEstateListing -- structured data properties [VERIFIED: https://schema.org/RealEstateListing]
- Google Maps Embed API -- Street View embed [VERIFIED: https://developers.google.com/maps/documentation/embed/get-started]

### Secondary (MEDIUM confidence)
- Bright MLS Rules and Regulations -- IDX compliance, attribution requirements [CITED: https://www.brightmls.com/rules-and-regulations]
- Mapbox clustering example -- GeoJSON source + cluster layers [CITED: https://docs.mapbox.com/mapbox-gl-js/example/cluster/]
- Resend Next.js integration -- email sending patterns [CITED: https://resend.com/docs/send-with-nextjs]

### Tertiary (LOW confidence)
- Bright MLS specific disclaimer text -- exact verbiage not obtained; generic NAR IDX rules documented
- SimplyRETS webhook support -- confirmed NOT available via OpenAPI spec (no webhook endpoints defined)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all core libraries already installed; new deps verified against npm registry
- Architecture: HIGH -- patterns based on verified SimplyRETS API spec + Next.js official docs
- SimplyRETS API: HIGH -- full OpenAPI spec extracted and verified
- Bright MLS compliance: MEDIUM -- general rules documented; exact Bright-specific disclaimer text not obtained
- Pitfalls: HIGH -- based on verified API constraints (rate limits, no webhooks, pagination)
- Saved search alerts: MEDIUM -- Resend verified; Twilio assumed

**Research date:** 2026-04-13
**Valid until:** 2026-05-13 (30 days -- stable domain; SimplyRETS API rarely changes)
