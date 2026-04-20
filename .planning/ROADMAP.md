# Roadmap: Tri States Realty

## Milestones

- ✅ **v1.0 Foundation** — Phases 1-3 (shipped 2026-04-18)
- 🚧 **v1.1 Delaware Search Platform** — Phases 4-7 (in progress)
- 📋 **v1.2 Buyer Accounts & Alerts** — Phases 8+ (planned)

## Phases

<details>
<summary>✅ v1.0 Foundation (Phases 1-3) - SHIPPED 2026-04-18</summary>

### Phase 1: Foundation & Design System
**Goal**: Initialize Next.js 16 project with full design system, Clerk auth, Supabase, and all third-party integrations wired up
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-06, DS-01, DS-02, DS-03
**Success Criteria** (what must be TRUE):
  1. Next.js 16 + Tailwind v4 + TypeScript project builds with zero errors
  2. Clerk auth enforces /agent/* (agent role) and /dashboard/* (any user) routes
  3. Supabase client (browser + server) and pgvector extension initialized
  4. Dark design system (black/gold/Playfair+Montserrat) renders on all pages
  5. Core components (nav, footer, cards, buttons, modals, map) exist
**Plans**: 8 plans

Plans:
- [x] 01-01: Project initialization (Next.js 16, Tailwind v4, TS, ESLint)
- [x] 01-02: Clerk auth integration + middleware route protection
- [x] 01-03: Supabase setup (browser + server clients, pgvector)
- [x] 01-04: Tailwind dark design system tokens + globals.css
- [x] 01-05: Navbar + Footer + MobileMenu components
- [x] 01-06: Core UI atoms (buttons, cards, modals, inputs)
- [x] 01-07: Mapbox integration (react-map-gl, dark-v11 style)
- [x] 01-08: Framer Motion wrappers (FadeIn, ScrollReveal)

### Phase 2: IDX Listings Engine
**Goal**: SimplyRETS sync pipeline, listings table, search UI with filters + map, MLS compliance
**Depends on**: Phase 1
**Requirements**: MLS-01, MLS-02, MLS-03, SEARCH-01, SEARCH-02, SEARCH-03, SEARCH-04
**Success Criteria** (what must be TRUE):
  1. /api/listings/sync fetches all Delaware listings via offset-loop pagination
  2. Listings table stores 36+ columns with full-text search and RLS
  3. Search page renders listing cards with photo, price, beds/baths/sqft, DOM, address
  4. Filter bar (price, beds, baths, type) + sort dropdown functional with nuqs URL state
  5. Mapbox map displays clustered listing pins (supercluster)
  6. MLS attribution (Bright MLS copyright, Fair Housing logo) on every listing card
**Plans**: 11 plans

Plans:
- [x] 02-01: Supabase migrations (listings table + indexes + RLS)
- [x] 02-02: SimplyRETS API client + pagination helper
- [x] 02-03: /api/listings/sync route (offset-loop, delta sync)
- [x] 02-04: Vercel cron config (15-min sync + nightly full)
- [x] 02-05: nuqs search params schema + Zod validation
- [x] 02-06: Filter bar component (price, beds, baths, type, city/zip)
- [x] 02-07: Sort dropdown + pagination controls
- [x] 02-08: ListingCard component with MLS attribution
- [x] 02-09: Mapbox map view with supercluster clustering
- [x] 02-10: MLS compliance constants + Fair Housing + Bright MLS logos
- [x] 02-11: /api/listings/revalidate on-demand revalidation endpoint

### Phase 3: Schell Brothers Communities
**Goal**: 40 Schell Brothers community pages with hero, amenities, schools, floorplans, tour modal, POI map, SEO
**Depends on**: Phase 2
**Requirements**: SCHELL-01, SCHELL-02, SCHELL-03, SCHELL-04, SCHELL-05, SCHELL-06, SCHELL-07
**Success Criteria** (what must be TRUE):
  1. /communities lists all 40 communities with cards and hero images
  2. /communities/[slug] renders full community page (hero, overview, amenities, schools, HOA, price range, floorplans)
  3. YouTube video embeds and custom video URLs work on community pages
  4. Live MLS listings filtered to each community display inline
  5. Interactive map shows community POI (schools, restaurants, highways)
  6. Schedule a Tour CTA opens modal with date/time form routing to dad
  7. JSON-LD structured data + OG images + sitemap entries for every community
**Plans**: 5 plans

Plans:
- [x] 03-01: Heartbeat CMS sync + communities table + nightly cron
- [x] 03-02: /communities listing page + CommunityCard component
- [x] 03-03: /communities/[slug] detail page (hero, overview, amenities, schools, HOA, price range)
- [x] 03-04: Floorplans section + YouTube embed + Schedule a Tour modal
- [x] 03-05: Community map POI + SEO (JSON-LD, OG, sitemap)

</details>

### 🚧 v1.1 Delaware Search Platform (In Progress)

**Milestone Goal:** Any Delaware home buyer finds their perfect home and contacts the agent in under 60 seconds — filter search, map search, or plain-English AI chat — all leads route exclusively to dad.

#### Phase 4: MLS Data Pipeline
**Goal**: Full Delaware MLS listing sync with paginated pipeline, listing detail pages, Coming Soon badges, and MLS compliance on every surface
**Depends on**: Phase 3
**Requirements**: MLS-01, MLS-02, MLS-03, MLS-04, MLS-05, MLS-06
**Success Criteria** (what must be TRUE):
  1. /api/listings/sync retrieves all 4k-8k Delaware listings via offset-loop (not just first 500)
  2. Delta sync runs every 15 minutes; full re-sync runs nightly at 3am UTC
  3. Listing cards show photo, price, beds/baths/sqft, days on market, address, Bright MLS attribution
  4. /listings/[id] detail page renders full photo gallery, all property fields, contact form → dad
  5. Every listing surface shows Bright MLS copyright + Fair Housing logo + providedBy attribution
  6. Coming Soon listings display with status badge
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md — Fix sync route + delta/full mode + ComingSoon status + cron config
- [x] 04-02-PLAN.md — ListingCard enhancements (DOM, attribution, Coming Soon badge) + MlsAttribution refactor
- [ ] 04-03-PLAN.md — Add Twilio SMS to lead notification flow + AGENT_PHONE env var

#### Phase 5: Structured Search
**Goal**: Filter bar, city/zip/area search, Mapbox clustering map, and sort controls — all URL-persistent via nuqs
**Depends on**: Phase 4
**Requirements**: SEARCH-01, SEARCH-02, SEARCH-03, SEARCH-04
**Success Criteria** (what must be TRUE):
  1. Price/beds/baths/property-type filter bar persists state in URL via nuqs
  2. City and zip/area Delaware filter maps to SimplyRETS cities + postalCodes params
  3. Mapbox map renders 5k+ listing pins with supercluster clustering without degradation
  4. Sort dropdown (price low/high, newest, days on market) updates results in real time
**Plans**: TBD

Plans:
- [ ] 05-01: nuqs URL schema expansion for all filter + sort params
- [ ] 05-02: City/zip/area filter component + SimplyRETS param mapping
- [ ] 05-03: Mapbox WebGL pin layer + supercluster at 5k+ listing scale
- [ ] 05-04: Sort dropdown + results count + pagination controls

#### Phase 6: AI Chat Search
**Goal**: Claude-powered NL-to-filters chat with floating bubble site-wide + /search split-pane layout
**Depends on**: Phase 5
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05
**Success Criteria** (what must be TRUE):
  1. POST /api/chat/search uses Vercel AI SDK streamText + tool calling — Claude outputs SearchParams JSON only
  2. Floating chat bubble appears on every page, auto-hides on /search route
  3. /search page has split-pane: chat sidebar (left) + map/grid results (right)
  4. Zero-result responses include Claude refinement suggestions
  5. Rate limit 5 req/min per user; history trimmed to last 6 messages; max_tokens: 300
**Plans**: TBD

Plans:
- [ ] 06-01: /api/chat/search route — Vercel AI SDK streamText + SearchParams tool
- [ ] 06-02: Chat UI component (message list, input, streaming response)
- [ ] 06-03: Floating chat bubble (site-wide, auto-hide on /search)
- [ ] 06-04: /search split-pane page layout (chat sidebar + map/grid)
- [ ] 06-05: Zero-result refinement suggestions + rate limiting + token controls

#### Phase 7: Lead Routing & Agent Dashboard
**Goal**: All listing contact forms route to dad via Resend + Twilio with source tagging; agent dashboard shows all inbound leads
**Depends on**: Phase 6
**Requirements**: LEAD-01, LEAD-02, LEAD-03
**Success Criteria** (what must be TRUE):
  1. Every contact form (MLS listings + Schell communities) sends Resend email + Twilio SMS to dad
  2. AGENT_EMAIL missing at startup hard-fails the app (not a runtime error)
  3. Each lead record tagged with source: ai_chat | map_click | filter_search | community_page | direct
  4. /agent/dashboard lists all leads with address, price, source tag, and timestamp
**Plans**: TBD

Plans:
- [ ] 07-01: Lead submission API + Resend email + Twilio SMS routing
- [ ] 07-02: Lead source tagging system + Supabase leads table
- [ ] 07-03: /agent/dashboard page — lead list with listing context

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Design System | v1.0 | 8/8 | Complete | 2026-04-18 |
| 2. IDX Listings Engine | v1.0 | 11/11 | Complete | 2026-04-18 |
| 3. Schell Brothers Communities | v1.0 | 5/5 | Complete | 2026-04-18 |
| 4. MLS Data Pipeline | v1.1 | 2/3 | In Progress|  |
| 5. Structured Search | v1.1 | 0/4 | Not started | - |
| 6. AI Chat Search | v1.1 | 0/5 | Not started | - |
| 7. Lead Routing & Agent Dashboard | v1.1 | 0/3 | Not started | - |
