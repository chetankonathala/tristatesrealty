# Technology Stack: Tri States Realty

**Project:** Tri States Realty — Single-Agent Real Estate Platform
**Researched:** 2026-04-06
**Confidence:** MEDIUM-HIGH (core stack HIGH, third-party integrations MEDIUM)

---

## 1. Core Framework: Next.js 15 (App Router)

**Recommendation:** Next.js 15 with App Router. Non-negotiable for this project.

**Why:** Real estate listing pages are the textbook ISR use case. Thousands of IDX listing pages need to be pre-rendered for SEO while staying fresh as prices/status change. Next.js 15's App Router gives you:

- `generateStaticParams` to pre-build the top ~500 high-traffic listing pages at build time
- `dynamicParams = true` so every other listing is generated on first request and then cached
- `revalidate` set per route type (listings: 3600s, market data: 300s, static content: `false`)
- Metadata API in `layout.tsx` / `page.tsx` for per-listing OG tags, canonical URLs, structured data (RealEstateListing schema)
- React Server Components for zero-JS listing cards — critical for LCP scores
- Streaming for dashboard and AI panels that can load progressively

**ISR Strategy for IDX Listings:**

```typescript
// app/listings/[mlsId]/page.tsx
export const revalidate = 3600; // revalidate listing every 1 hour

export async function generateStaticParams() {
  // Only pre-build top 500 most-viewed listings at build time
  const featured = await getTopListings(500);
  return featured.map((l) => ({ mlsId: l.id }));
}

export const dynamicParams = true; // generate rest on-demand
```

**Structured Data for SEO (HIGH value for real estate):**

```typescript
// Emit JSON-LD RealEstateListing schema per page
const structuredData = {
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  name: listing.address,
  price: listing.listPrice,
  numberOfRooms: listing.bedrooms,
  // ...
};
```

**Confidence:** HIGH — verified via Next.js official docs and community patterns.

---

## 2. UI Layer

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | v4 | Utility styling | Dark mode via `dark:` variants, v4 is faster, no purge config needed |
| Framer Motion | v11 | Animations | Luxury feel — smooth property card reveals, modal transitions, map pan. No layout shift side effects |
| shadcn/ui | latest | Headless component system | Unstyled base, fully customizable for luxury dark theme, Next.js App Router compatible |
| Lucide React | latest | Icons | Consistent icon library, tree-shakeable |

**Luxury Dark Design Notes:**
- Use Tailwind CSS `dark:` as the default (dark-first, not dark-mode toggle)
- Aceternity UI has spotlight/gradient components designed specifically for dark luxury aesthetics
- Framer Motion `layoutId` for shared element transitions between listing cards and detail views

---

## 3. Database

**Recommendation: Supabase (PostgreSQL + pgvector)**

Supabase is both the database AND the AI vector store — eliminating a separate Pinecone bill.

| Concern | Why Supabase Wins |
|---------|-------------------|
| Real-time | Native WebSocket subscriptions via PostgreSQL replication — market analytics dashboard updates without polling |
| Auth | Built-in auth (but we use Clerk — Supabase auth is a fallback) |
| Vector search | pgvector extension: 4x higher QPS than Pinecone at lower cost, hybrid SQL+vector queries in one statement |
| Storage | Built-in S3-compatible storage for listing photos, tour previews |
| Row-level security | RLS policies for multi-tenant data (buyer accounts, agent dashboard isolation) |
| Cost | $25/month Pro tier with $10 compute credits; Pinecone would add ~$25+/month separately |

**Schema overview:**

```sql
-- Core tables
listings         -- MLS/IDX data (mlsId, address, price, status, geom, embedding vector(1536))
users            -- Buyer accounts (FK to Clerk user ID)
saved_searches   -- Buyer saved filters
favorites        -- Buyer favorited listings
offers           -- Offer submissions (DocuSign envelope ID, status)
agent_contacts   -- CRM-lite leads
market_snapshots -- Time-series market data from Attom

-- Vector column for AI recommendations
ALTER TABLE listings ADD COLUMN embedding vector(1536);
CREATE INDEX ON listings USING ivfflat (embedding vector_cosine_ops);
```

**pgvector hybrid search example (Supabase + SQL):**

```sql
SELECT id, address, price,
  1 - (embedding <=> $1) AS similarity
FROM listings
WHERE status = 'active'
  AND price BETWEEN $2 AND $3
  AND bedrooms >= $4
ORDER BY similarity DESC
LIMIT 20;
```

**Alternatives Considered:**

| Option | Verdict |
|--------|---------|
| Plain PostgreSQL (self-hosted) | More ops overhead, no built-in realtime, skip unless Supabase pricing becomes a blocker |
| PlanetScale | MySQL-based, no native realtime, no pgvector, no clear advantage for this stack |
| Neon | Postgres + serverless branching, solid alternative to Supabase if you want more raw Postgres control |
| Pinecone (standalone) | Only justified if embeddings scale past 10M vectors; use pgvector until then |

**Confidence:** HIGH — multiple sources confirm pgvector outperforms Pinecone at this scale, Supabase is the dominant choice for Next.js + real-time + vectors.

---

## 4. Authentication

**Recommendation: Clerk**

| Criterion | Clerk | NextAuth | Auth0 |
|-----------|-------|----------|-------|
| Next.js 15 App Router support | Native, first-class | Good (Auth.js v5) | Good |
| Time to production | Hours | Days (needs DB adapter) | Days (complex config) |
| Buyer account features | Pre-built UI: sign in, profile, MFA | DIY | Pre-built |
| Agent dashboard (separate role) | Organizations + Roles built in | Custom code | Roles/permissions |
| Pricing at scale | $25/month Pro, 50K MAU free | Free (self-hosted) | Expensive at scale |
| Data ownership | Managed (user data on Clerk) | Self-hosted | Managed |

**Use Clerk because:** Single-agent platform with two user types (buyer, agent) maps perfectly to Clerk's Organizations + Roles. Pre-built components ship buyer account UI in hours. Webhook syncs Clerk user events to Supabase for relational queries.

```typescript
// Protect agent routes in middleware
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAgentRoute = createRouteMatcher(["/agent/(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isAgentRoute(req)) auth().protect({ role: "agent" });
});
```

**Confidence:** HIGH — Clerk is the dominant choice in Next.js 15 ecosystem per multiple 2025 sources.

---

## 5. IDX / MLS Data Integration

**Recommendation: SimplyRETS + RESO Web API (not RETS)**

RETS is deprecated. The industry standard is now RESO Web API (REST-based).

| Option | Verdict |
|--------|---------|
| SimplyRETS | Developer-friendly wrapper around RESO Web API. REST API, JSON responses, handles MLS auth. Best for getting IDX running quickly. ~$99/month |
| Spark API | Direct RESO Web API access, human-readable field names, live queries. Best if your MLS offers it directly |
| IDX Broker | Managed solution with less developer flexibility — avoid for custom Next.js builds |
| Direct RESO API | Maximum control, maximum complexity. Only if SimplyRETS doesn't cover your target MLS |

**Data Sync Strategy:**

```
MLS (RESO API)
  → Webhook / polling via SimplyRETS
    → Supabase listings table (upsert on mlsId)
      → Trigger: re-compute embeddings for updated listings
        → Invalidate ISR cache via Next.js revalidateTag()
```

On-demand ISR revalidation via `revalidateTag('listing-{mlsId}')` means new listings appear on the site within seconds of MLS update, without a full rebuild.

**Confidence:** MEDIUM — SimplyRETS is well-established; verify MLS compatibility for your specific market before committing.

---

## 6. AI Recommendation Engine

**Recommendation: OpenAI text-embedding-3-small + Supabase pgvector**

Do NOT use Pinecone as a separate service. pgvector running in Supabase handles this at the scale of a single-agent real estate platform.

**Embedding Strategy:**

```typescript
// Generate embedding for each listing (run on ingest/update)
const embeddingText = `
  ${listing.bedrooms} bed ${listing.bathrooms} bath
  ${listing.propertyType} in ${listing.city}, ${listing.state}
  Price: $${listing.listPrice}
  ${listing.description}
`;

const { data } = await openai.embeddings.create({
  model: "text-embedding-3-small", // cheaper, still excellent
  input: embeddingText,
});

await supabase
  .from("listings")
  .update({ embedding: data[0].embedding })
  .eq("id", listing.id);
```

**User Preference Embeddings:**
Build a preference vector from: saved searches + favorited listings + time-on-page signals. Avg the embeddings of favorited listings → user preference vector → cosine similarity query.

**Model Choice:**

| Model | Dimensions | Cost | Use Case |
|-------|------------|------|---------|
| text-embedding-3-small | 1536 | $0.02/1M tokens | Listings + user prefs (recommended) |
| text-embedding-3-large | 3072 | $0.13/1M tokens | Only if small model quality is insufficient |
| text-embedding-ada-002 | 1536 | $0.10/1M tokens | Older, skip in favor of 3-small |

**Confidence:** MEDIUM-HIGH — pgvector vs Pinecone benchmarks verified via Supabase official blog and multiple independent migration reports.

---

## 7. Real-Time Market Analytics

**Recommendation: Attom Data API (primary) + Supabase for caching**

| Data Provider | Strength | Limitation |
|--------------|---------|-----------|
| Attom Data | 158M US properties, AVM, foreclosure, deed data, REST JSON API | Not free, pricing on request |
| CoreLogic | Enterprise-grade, mortgage/financial depth | Enterprise pricing, harder to access for indie developers |
| RentRange (now part of CoreLogic) | Rental comps | Same CoreLogic access limitations |
| BatchData | Good alternative to Attom, competitive pricing | Smaller dataset than Attom |

**Architecture:**

```
Attom API (polling every 24h or on-demand)
  → Supabase market_snapshots table
    → Supabase Realtime → WebSocket → Dashboard client

// Client-side dashboard subscribes to Supabase channel
const channel = supabase
  .channel('market-data')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'market_snapshots' }, 
    (payload) => setMarketData(payload.new))
  .subscribe();
```

Do NOT call Attom API directly from the client. Cache all market data in Supabase. This keeps your Attom API key server-side and controls costs (Attom charges per API call).

**Confidence:** MEDIUM — Attom is well-documented; RentRange/CoreLogic access complexity is a known industry issue. Verify Attom pricing for your use case.

---

## 8. Mortgage Pre-Qualification

**Recommendation: Morty embedded widget (fastest path to market)**

| Option | Integration Type | Complexity | Notes |
|--------|----------------|-----------|-------|
| Morty | Embeddable widget + API | Low — 2 lines of code | Rate table + pre-qual form. Good for startup velocity |
| Rocket Mortgage Partner API | Deep API integration via Rocket Pro / ARIVE | High | Better for high-volume or exclusive partnership. Note: Rocket acquired Redfin in 2025, may affect terms |
| Lendio | Broker marketplace, not pure API | Medium | More small business focused, less ideal for residential real estate |
| Custom (Blend, Finicity) | Build your own form, verify income via API | Very High | Only if pre-qual is a core differentiator |

**Recommended Phase 1 approach:**

```html
<!-- Morty embeddable — 2 lines, hosted widget -->
<script src="https://embed.morty.com/morty-widget.js"></script>
<morty-widget partner-id="YOUR_ID" theme="dark" />
```

Upgrade to Rocket Mortgage Partner API in a later phase if volume warrants it.

**Confidence:** MEDIUM — Morty's developer-friendly approach verified. Rocket Mortgage API terms post-Redfin acquisition are unclear; validate before committing.

---

## 9. 3D Virtual Tours

**Recommendation: Matterport (luxury listing standard) with CloudPano as fallback**

**Important 2025 development:** Zillow removed Matterport from its listings in October 2025 after CoStar (Matterport's owner) declined to renew the API agreement. This is actually a positive for independent real estate websites — agents need to host tours on their own sites now.

| Platform | Strength | Weakness |
|----------|---------|---------|
| Matterport | Industry standard, "dollhouse" 3D, luxury brand recognition | CoStar-owned (may have platform risk), Zillow removed it |
| iGUIDE | ANSI Z765-compliant floor plans + tour, faster scanning, accurate measurements | Less "luxury" visual feel than Matterport |
| CloudPano | Cheap ($19-49/month), full brand control, any 360 camera | Less prestigious, no dollhouse view |

**Integration (Matterport embed):**

```tsx
// Simple iframe embed — no SDK needed for basic embedding
<iframe
  src={`https://my.matterport.com/show/?m=${tour.matterportId}&brand=0&play=1`}
  width="100%"
  height="600"
  frameBorder="0"
  allowFullScreen
/>
```

For advanced control (highlight reel, custom annotations), use the Matterport SDK bundle.

**Street View Integration (Google Maps JavaScript API):**

```typescript
// Embed Google Street View panorama
const panorama = new google.maps.StreetViewPanorama(domElement, {
  position: { lat: listing.lat, lng: listing.lng },
  pov: { heading: 34, pitch: 10 },
  zoom: 1,
});
```

Google Maps JavaScript API is the only viable path for Street View. Billed per load; use lazy initialization (only load when user clicks "Street View" tab).

**Confidence:** MEDIUM — Matterport embed is stable; CoStar ownership introduces long-term platform risk worth monitoring.

---

## 10. E-Sign / Offer Submission

**Recommendation: DocuSign eSign API (node SDK)**

```bash
npm install docusign-esign
```

**Integration pattern:**

```typescript
// Server Action: create and send offer envelope
async function sendOfferForSignature(offerData: OfferData) {
  const client = new docusign.ApiClient();
  client.setBasePath(process.env.DOCUSIGN_BASE_URL);
  client.addDefaultHeader("Authorization", `Bearer ${await getAccessToken()}`);

  const envelopesApi = new docusign.EnvelopesApi(client);
  const envelope = makeEnvelope(offerData); // document + tabs + signers

  const result = await envelopesApi.createEnvelope(
    process.env.DOCUSIGN_ACCOUNT_ID,
    { envelopeDefinition: envelope }
  );

  // Store envelopeId in Supabase offers table
  await supabase.from("offers").insert({
    listing_id: offerData.listingId,
    buyer_id: offerData.buyerId,
    docusign_envelope_id: result.envelopeId,
    status: "sent",
  });
}
```

Use **JWT Grant** OAuth (not OAuth Code Flow) for server-side signing workflows — the agent impersonates signers without requiring them to be present in the OAuth flow.

**Confidence:** HIGH — DocuSign Node SDK is well-documented, official community examples for Next.js App Router exist (February 2025).

---

## 11. Deployment

**Recommendation: Vercel (primary) with a migration plan to AWS if needed**

| Concern | Vercel | AWS (ECS / App Runner) |
|---------|--------|----------------------|
| Next.js ISR support | Native, zero config | Requires OpenNext adapter |
| Time to production | <5 minutes | Hours |
| Edge middleware (Clerk auth) | Native | Complex setup |
| Cost at scale | Can be expensive ($20-400+/month Pro) | 25-75% cheaper at high volume |
| Long-running jobs (embedding pipeline) | Not supported in serverless | Use Lambda or ECS tasks |

**Recommended architecture:**

```
Vercel (Next.js app, edge middleware, ISR)
  + Supabase (database, realtime, storage)
  + Upstash Redis (rate limiting, session cache, ISR tag cache)
  + AWS Lambda (background jobs: embedding generation, Attom data sync)
```

Start on Vercel Pro (~$20/month). The ISR cache for listing pages is mostly CDN-served (free). Migrate compute-heavy background jobs (embedding pipeline, Attom sync) to AWS Lambda from day one — these are NOT suited for Vercel's serverless function limits.

**ISR cache invalidation at scale:**

```typescript
// Called from MLS webhook when listing updates
await fetch("/api/revalidate", {
  method: "POST",
  headers: { Authorization: `Bearer ${process.env.REVALIDATION_SECRET}` },
  body: JSON.stringify({ tag: `listing-${mlsId}` }),
});

// Route handler
export async function POST(req: Request) {
  const { tag } = await req.json();
  revalidateTag(tag);
  return Response.json({ revalidated: true });
}
```

**Confidence:** MEDIUM-HIGH — Vercel ISR pricing documented, AWS migration path well-established. Watch Vercel ISR durable storage costs at scale (10K+ listings with frequent updates).

---

## 12. CRM-Lite (Agent Dashboard)

**Recommendation: Build custom using Supabase + existing data model**

This is a single-agent platform. A full HubSpot or Salesforce embed is massive overkill and creates a dependency that fights your custom UI.

| Approach | Verdict |
|----------|---------|
| Custom (Supabase + Next.js) | RECOMMENDED — agent contacts, offer pipeline, lead notes are all simple CRUD on tables you already have |
| HubSpot (API integration) | Use only if agent already uses HubSpot and needs 2-way sync. Add as a later integration, not Phase 1 |
| Salesforce | No. Enterprise complexity, wrong scale |
| Follow Up Boss | Real estate-specific CRM, REST API. Consider if agent needs mobile app CRM before your dashboard is built |

**Minimal CRM data model (already in Supabase):**

```sql
agent_contacts (
  id, name, email, phone,
  source,           -- how they found the agent
  status,           -- lead / active / under_contract / closed
  listing_id,       -- associated property
  notes text,
  created_at, updated_at
)

offers (
  id, listing_id, buyer_id,
  offer_price, status,
  docusign_envelope_id,
  created_at, updated_at
)
```

Build simple pipeline view (Kanban or table) in Phase 2 of the agent dashboard. This is 2-3 days of work, not 10 weeks.

**Confidence:** HIGH — straightforward decision given single-agent scope.

---

## Full Recommended Stack Summary

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Next.js | 15 | App Router, RSC, ISR |
| UI | Tailwind CSS | v4 | Dark-first design |
| Animation | Framer Motion | v11 | Luxury transitions |
| Components | shadcn/ui | latest | Headless, customizable |
| Database | Supabase (PostgreSQL) | latest | + pgvector for AI |
| Auth | Clerk | latest | Buyer + agent roles |
| IDX/MLS | SimplyRETS | latest | RESO Web API wrapper |
| AI Embeddings | OpenAI text-embedding-3-small | latest | Via Supabase pgvector |
| Market Data | Attom Data API | v4 | Cached in Supabase |
| Mortgage | Morty embedded widget | latest | Upgrade to Rocket later |
| 3D Tours | Matterport SDK | latest | + CloudPano fallback |
| Street View | Google Maps JavaScript API | weekly | Lazy-loaded |
| E-Sign | DocuSign eSign API | v2.1 | JWT Grant OAuth |
| Deployment | Vercel Pro | - | + AWS Lambda for jobs |
| Cache/Rate limit | Upstash Redis | latest | ISR tag cache, rate limits |
| Background Jobs | AWS Lambda | - | Embeddings, data sync |

---

## Installation

```bash
# Core framework
npx create-next-app@latest tristatesrealty --typescript --tailwind --app

# UI
npm install framer-motion lucide-react
npx shadcn@latest init

# Database & Auth
npm install @supabase/supabase-js @supabase/ssr
npm install @clerk/nextjs

# AI
npm install openai

# E-Sign
npm install docusign-esign

# Maps
# Google Maps JS API loaded via next/script (no npm package needed)

# Utilities
npm install @upstash/redis @upstash/ratelimit
npm install zod react-hook-form @hookform/resolvers

# Dev
npm install -D @types/node typescript
```

---

## Sources

- [Next.js ISR Official Docs](https://nextjs.org/docs/app/guides/incremental-static-regeneration)
- [Next.js generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Next.js 15 App Router Complete Guide — Medium](https://medium.com/@livenapps/next-js-15-app-router-a-complete-senior-level-guide-0554a2b820f7)
- [Serverless PostgreSQL 2025: Supabase vs Neon vs PlanetScale — DEV Community](https://dev.to/dataformathub/serverless-postgresql-2025-the-truth-about-supabase-neon-and-planetscale-7lf)
- [pgvector vs Pinecone: cost and performance — Supabase Official](https://supabase.com/blog/pgvector-vs-pinecone)
- [Supabase vs Pinecone migration report — Medium](https://deeflect.medium.com/supabase-vs-pinecone-i-migrated-my-production-ai-system-and-heres-what-actually-matters-7b2f2ebd59ee)
- [Clerk vs NextAuth vs Auth0 2025 — Medium](https://medium.com/@sagarsangwan/next-js-authentication-showdown-nextauth-free-databases-vs-clerk-vs-auth0-in-2025-e40b3e8b0c45)
- [SimplyRETS RESO Web API](https://simplyrets.com/idx-developer-api)
- [Spark API vs RETS Overview](https://sparkplatform.com/docs/overview/api_vs_rets)
- [Attom Data Property API](https://api.developer.attomdata.com/home)
- [Top Real Estate Data APIs 2025 — BatchData](https://batchdata.io/blog/top-real-estate-apis-in-2025)
- [Morty Embeddable Rate Table](https://www.morty.com/resources/morty-plus-embeddable-rate-table)
- [Morty — Add Mortgage to Your Product](https://www.morty.com/solutions/adding-mortgage-to-startup)
- [Matterport Real Estate](https://matterport.com/industries/real-estate)
- [iGUIDE vs Matterport comparison — HDRsoft](https://hdrsoft.com/learn/matterport-vs-iguide-for-3d-virtual-tours.html)
- [Matterport Zillow removal 2025 — CloudPano](https://www.cloudpano.com/blog/how-to-embed-virtual-tours-on-any-website-cloudpano-vs-matterport)
- [DocuSign Node.js SDK — GitHub](https://github.com/docusign/docusign-esign-node-client)
- [DocuSign Next.js App Router integration — Community](https://community.docusign.com/esignature-api-63/next-js-app-router-typescript-building-docusign-api-4507)
- [DocuSign Real Estate Solutions](https://www.docusign.com/solutions/industries/real-estate)
- [Vercel ISR Pricing and Limits](https://vercel.com/docs/incremental-static-regeneration/limits-and-pricing)
- [Why we use AWS instead of Vercel — Graphite](https://graphite.com/blog/why-we-use-aws-instead-of-vercel)
- [HubSpot vs Salesforce vs Custom CRM for Real Estate](https://noseberry.com/blogs/real-estate/hubspot-vs-salesforce-vs-custom-crm-for-real-estate-which-one-actually-wins)
- [Framer Motion + Tailwind 2025 stack — DEV Community](https://dev.to/manukumar07/framer-motion-tailwind-the-2025-animation-stack-1801)
- [Core Web Vitals Next.js optimization 2025 — Makers Den](https://makersden.io/blog/optimize-web-vitals-in-nextjs-2025)
