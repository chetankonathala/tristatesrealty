# Requirements: Tri States Realty

**Defined:** 2026-04-06
**Updated:** 2026-04-19 for milestone v1.1
**Core Value:** Any Delaware home buyer can find their perfect home and contact the agent in under 60 seconds — whether they search with filters, a map, or plain English.

## Validated Requirements (Milestone v1.0)

### Foundation & Infrastructure
- ✓ **INFRA-01**: Next.js 16 App Router project initialized with TypeScript, Tailwind v4, ESLint — Phase 1
- ✓ **INFRA-02**: Supabase project configured (PostgreSQL + pgvector extension enabled) — Phase 1
- ✓ **INFRA-03**: Clerk authentication integrated for buyer accounts and agent admin — Phase 1
- ✓ **INFRA-06**: Environment configuration for all third-party API keys — Phase 1

### Design System
- ✓ **DS-01**: Luxury dark design system — black/charcoal background, white text, gold accent, Playfair Display + Montserrat — Phase 1
- ✓ **DS-02**: Fully responsive mobile-first layout — Phase 1
- ✓ **DS-03**: Core component library: nav, footer, cards, buttons, modals, filters, maps — Phase 1

### Schell Brothers Communities
- ✓ **SCHELL-01**: Dedicated community showcase with individual page per Schell Brothers neighborhood — Phase 3
- ✓ **SCHELL-02**: Community pages: hero, overview, amenities, schools, HOA info, price range, floorplans — Phase 3
- ✓ **SCHELL-03**: YouTube video embeds + custom video URL support — Phase 3
- ✓ **SCHELL-04**: Live listings filtered to each community displayed inline — Phase 3
- ✓ **SCHELL-05**: Interactive community map with POI (schools, restaurants, highways) — Phase 3
- ✓ **SCHELL-06**: Community pages SEO-optimized (JSON-LD, OG images, sitemap) — Phase 3
- ✓ **SCHELL-07**: Schedule a Tour CTA on every community page — Phase 3

---

## v1.1 Requirements (Milestone: Delaware Search Platform)

### MLS Data Pipeline

- [x] **MLS-01**: SimplyRETS sync uses offset-loop pagination to retrieve all Delaware listings (4k-8k), not just the first 500 per request
- [x] **MLS-02**: Listing sync runs every 15 minutes using `lastModified` delta for efficiency; full re-sync runs nightly
- [x] **MLS-03**: Listing cards display photo, price, beds/baths/sqft, days on market, address, and Bright MLS attribution on every card
- [ ] **MLS-04**: Individual listing detail pages with full photo gallery, property details, and contact form routing exclusively to dad
- [x] **MLS-05**: MLS compliance on every listing page: Bright MLS copyright line, Fair Housing logo, `providedBy` attribution per `src/lib/constants/mls.ts`
- [x] **MLS-06**: Coming Soon listings displayed with status badge (subject to SimplyRETS live feed confirmation)

### Structured Search

- [ ] **SEARCH-01**: Filter bar with price range, beds, baths, and property type — persistable via nuqs URL params
- [ ] **SEARCH-02**: City and zip/area filter for Delaware locations — maps to SimplyRETS `cities` and `postalCodes` params
- [ ] **SEARCH-03**: Mapbox map view with WebGL-rendered listing pins and supercluster clustering (handles 5k+ pins without degradation)
- [ ] **SEARCH-04**: Sort dropdown: price (low/high), newest listings, days on market

### AI Chat Search

- [ ] **CHAT-01**: POST `/api/chat/search` Route Handler using Vercel AI SDK v4 `streamText` + tool calling — Claude translates NL query to `SearchParams` JSON, never sees or narrates listing data
- [ ] **CHAT-02**: Floating chat bubble on every page (fixed-position) — navigates to `/search` with query pre-filled; auto-hides on `/search` route
- [ ] **CHAT-03**: Dedicated `/search` page with split-pane layout: chat sidebar (left) + map/grid results (right)
- [ ] **CHAT-04**: When search returns zero results, Claude suggests refinements to broaden the query (e.g., expand price range, try adjacent city)
- [ ] **CHAT-05**: Chat session token controls: history trimmed to last 6 messages, `max_tokens: 300` for filter translation, rate limit 5 req/min per user

### Lead Routing & Agent

- [ ] **LEAD-01**: Every listing contact form (MLS listings + Schell communities) routes exclusively to dad via Resend email + Twilio SMS; `AGENT_EMAIL` hard-fails at startup if unset
- [ ] **LEAD-02**: Each lead record tagged with source: `ai_chat`, `map_click`, `filter_search`, `community_page`, or `direct`
- [ ] **LEAD-03**: Agent dashboard displays all inbound leads with listing context (address, price, source tag, timestamp)

---

## Deferred to v1.2+

### Buyer Accounts
- **BUYER-01**: Buyer account creation and login via Clerk (email + Google OAuth)
- **BUYER-02**: Saved listings ("favorites") with persistent list across sessions
- **BUYER-03**: Saved searches with email + SMS alert notifications
- **BUYER-04**: Buyer dashboard: favorites, saved searches, offer history

### Market Analytics
- **MKT-01**: Attom Data API integration — neighborhood market stats
- **MKT-02**: Comparable sales (comps) on listing detail pages
- **MKT-03**: Seller home valuation / AVM tool

### Mortgage & Offers
- **MORT-01**: Morty mortgage pre-qual widget
- **OFFER-01–08**: Full DocuSign e-sign offer pipeline

### Virtual Tours
- **TOUR-01**: Matterport 3D tour embeds
- **TOUR-02**: CloudPano fallback

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Rental listings | Sales-only platform |
| Multi-brokerage listings | Single Bright MLS feed sufficient |
| Mobile native app | Mobile-first PWA sufficient |
| Property management | Out of agent's service scope |
| AI narrating listing details | Hallucination liability — Claude outputs filters only, Supabase fetches listings |
| Infinite scroll | Breaks SEO and bookmarkable URLs — pagination only |
| AI recommendations from behavior | Deferred to v1.2 after buyer accounts exist |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01,02,03,06 | Phase 1 (v1.0) | Complete |
| DS-01,02,03 | Phase 1 (v1.0) | Complete |
| SCHELL-01–07 | Phase 3 (v1.0) | Complete |
| MLS-01,02 | Phase 4 | Pending |
| MLS-03,04,05,06 | Phase 4 | Pending |
| SEARCH-01,02,03,04 | Phase 5 | Pending |
| CHAT-01,02,03,04,05 | Phase 6 | Pending |
| LEAD-01,02,03 | Phase 7 | Pending |

**Coverage:**
- v1.1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-06*
*Last updated: 2026-04-19 after milestone v1.1 definition*
