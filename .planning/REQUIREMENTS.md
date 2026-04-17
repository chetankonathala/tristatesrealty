# Requirements: Tri States Realty

**Defined:** 2026-04-06
**Core Value:** Buyers complete the entire home-buying journey on one site — discover, tour, qualify, offer, close — while the agent earns commission hands-free.

## v1 Requirements

### Foundation & Infrastructure

- [x] **INFRA-01**: Next.js 15 App Router project initialized with TypeScript, Tailwind CSS, and ESLint
- [x] **INFRA-02**: Supabase project configured (PostgreSQL + pgvector extension enabled)
- [x] **INFRA-03**: Clerk authentication integrated for buyer accounts and agent admin
- [ ] **INFRA-04**: Vercel deployment configured with custom domain (tristatesrealty.com)
- [ ] **INFRA-05**: AWS Lambda configured for background jobs (embedding generation, data polling)
- [x] **INFRA-06**: Environment configuration for all third-party API keys

### Design System

- [ ] **DS-01**: Luxury dark design system — black/charcoal background, white text, gold accent, Playfair Display + Montserrat typography
- [ ] **DS-02**: Fully responsive mobile-first layout (breakpoints: mobile, tablet, desktop)
- [ ] **DS-03**: Core component library: nav, footer, cards, buttons, modals, filters, maps
- [ ] **DS-04**: Animated page transitions and scroll-triggered reveals
- [ ] **DS-05**: Core Web Vitals green across all pages (LCP < 2.5s, CLS < 0.1, INP < 200ms)

### IDX Listings

- [ ] **IDX-01**: Bright MLS IDX feed via SimplyRETS RESO Web API integrated (DE, MD, NJ, PA)
- [ ] **IDX-02**: Listings sync every 15 minutes; new listings trigger ISR revalidation via webhook
- [ ] **IDX-03**: Listing search page with map view (Mapbox GL) + list view toggle
- [ ] **IDX-04**: Advanced filters: price range, beds, baths, property type, sq ft, zip/city, county, school district, new construction vs resale, waterfront, garage, lot size
- [ ] **IDX-05**: Listing detail page: full photo gallery (lightbox), price, address, beds/baths/sqft, description, open house dates, days on market, price history
- [ ] **IDX-06**: Google Street View embed on every listing detail page
- [ ] **IDX-07**: SEO-optimized listing pages with JSON-LD RealEstateListing structured data
- [ ] **IDX-08**: Comparable sales (comps) section on each listing detail page
- [ ] **IDX-09**: MLS attribution and Fair Housing logo displayed per Bright MLS rules
- [ ] **IDX-10**: Saved searches with email + SMS alert notifications when new matches appear

### Schell Brothers Communities

- [x] **SCHELL-01**: Dedicated community showcase section with individual page per Schell Brothers neighborhood
- [ ] **SCHELL-02**: Community pages include: hero video, overview, amenities, schools, HOA info, price range, available floorplans
- [ ] **SCHELL-03**: Video gallery per community: embed Schell Brothers YouTube videos + support custom video uploads (stored in Supabase Storage)
- [x] **SCHELL-04**: Live IDX listings filtered to each Schell community displayed inline on community pages
- [ ] **SCHELL-05**: Interactive community map showing location, nearby schools, restaurants, highways
- [ ] **SCHELL-06**: Community pages SEO-optimized to rank for "[community name] Schell Brothers" and "[city] new construction homes" queries
- [ ] **SCHELL-07**: "Schedule a Tour" CTA on every community page (lead capture form)

### Buyer Accounts & AI Recommendations

- [ ] **BUYER-01**: Buyer account creation and login via Clerk (email + Google OAuth)
- [ ] **BUYER-02**: Saved listings ("favorites") with persistent list across sessions
- [ ] **BUYER-03**: Saved searches that auto-run and notify buyer of new matches
- [ ] **BUYER-04**: Buyer dashboard: favorites, saved searches, offer history, transaction status
- [ ] **BUYER-05**: AI recommendation engine — OpenAI text-embedding-3-small + pgvector cosine similarity on listing attributes
- [ ] **BUYER-06**: Recommendations update based on viewed listings, saves, and search history
- [ ] **BUYER-07**: Natural language / conversational search ("find me a 4-bed home near good schools under $600k in Newark DE")
- [ ] **BUYER-08**: "Homes you may like" section on homepage and buyer dashboard

### Market Analytics

- [ ] **MKT-01**: Attom Data API integrated — polling every 24h into Supabase market_snapshots table
- [ ] **MKT-02**: Neighborhood market dashboard: median sale price trend (12mo), days-on-market trend, price per sq ft, list-to-sale ratio, # of active listings
- [ ] **MKT-03**: Market stats widget on every listing detail page (neighborhood-level data)
- [ ] **MKT-04**: Seller home valuation tool (AVM) on homepage — enter address → instant estimate → email capture → agent follow-up trigger
- [ ] **MKT-05**: Market data updates pushed to dashboard via Supabase Realtime (WebSocket)

### Mortgage Pre-Qualification

- [ ] **MORT-01**: Morty embedded pre-qual widget integrated on site (dark-mode themed)
- [ ] **MORT-02**: Pre-qual CTA surfaced on listing detail pages and at offer initiation
- [ ] **MORT-03**: Pre-qual completion event triggers lead notification to agent

### E-Sign Offer Pipeline

- [ ] **OFFER-01**: Offer intent form on listing detail pages — buyer enters offer price, contingencies, closing timeline, financing type
- [ ] **OFFER-02**: DocuSign embedded signing via createRecipientView — buyer signs without leaving site
- [ ] **OFFER-03**: State-specific offer form logic: DE, MD, PA (standard), NJ (mandatory attorney review disclosure + 3-day window status)
- [ ] **OFFER-04**: NAR 2024 compliance: buyer agent compensation field + Buyer Representation Agreement (BRA) envelope included
- [ ] **OFFER-05**: Agent approval gate: offer terms submitted → agent notified → agent triggers DocuSign template send → buyer signs
- [ ] **OFFER-06**: DocuSign Connect webhook: envelope-completed event → Dotloop loop auto-created with signed PDF attached
- [ ] **OFFER-07**: Offer status tracker visible to buyer: Submitted → Sent for Signature → Signed → Under Review (NJ: Attorney Review) → Accepted / Countered / Declined
- [ ] **OFFER-08**: Automated commission pipeline: deal-close event → broker notification email + CDA generation trigger

### Agent Dashboard

- [ ] **AGENT-01**: Secure agent dashboard (Clerk role-gated) — separate from buyer-facing site
- [ ] **AGENT-02**: Offer management: view all incoming offers, offer details, accept / counter / decline actions
- [ ] **AGENT-03**: Listings management: view own listings (pulled from IDX), manually add/edit Schell community details
- [ ] **AGENT-04**: CRM-lite: contact list with pipeline stage (Lead → Nurturing → Active → Under Contract → Closed), notes, last contact date
- [ ] **AGENT-05**: Lead capture inbox: all contact form submissions, valuation requests, tour bookings, pre-qual completions
- [ ] **AGENT-06**: Notification system: new offers, new leads, status changes via email (Resend) + SMS (Twilio)
- [ ] **AGENT-07**: Site analytics dashboard: listing page views, lead sources, saved search counts, offer conversion rate

### 3D Virtual Tours

- [ ] **TOUR-01**: Matterport embed API integrated — 3D tour embedded on listing detail pages where tour exists
- [ ] **TOUR-02**: Tour scheduling / showing request form on listings without Matterport (books into agent calendar)
- [ ] **TOUR-03**: CloudPano fallback support for non-Matterport virtual tours

### SEO & Performance

- [ ] **SEO-01**: Sitemap auto-generated from all active IDX listing pages + community pages
- [ ] **SEO-02**: Open Graph + Twitter Card meta per listing (photo, price, address)
- [ ] **SEO-03**: robots.txt configured per Bright MLS IDX display rules
- [ ] **SEO-04**: Blog/content section for agent to publish local market updates (SEO long-tail)
- [ ] **SEO-05**: Schema markup for LocalBusiness (agent) + RealEstateListing

---

## v2 Requirements

### Advanced Features (Post-Launch)

- **ADV-01**: Rocket Mortgage Partner API upgrade (deeper pre-approval integration)
- **ADV-02**: iGUIDE integration as Matterport alternative
- **ADV-03**: AI-powered listing description generator for agent's own listings
- **ADV-04**: Multi-agent/team expansion (brokerage site mode)
- **ADV-05**: In-app buyer-agent secure messaging (Compass One-style)
- **ADV-06**: Video walkthrough recording tool for agent (Loom-style)
- **ADV-07**: Automated CMA (Comparative Market Analysis) report generator for sellers

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Rental listings | Sales-only platform; separate IDX license needed |
| In-house title/escrow | Handled by existing broker pipeline |
| Multi-brokerage listings (non-Bright MLS) | Single MLS feed sufficient for DE/MD/NJ/PA |
| Mobile native app (iOS/Android) | Mobile-first PWA sufficient for v1 |
| Property management | Out of agent's service scope |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01–06 | Phase 1 | Pending |
| DS-01–05 | Phase 1 | Pending |
| IDX-01–10 | Phase 2 | Pending |
| SCHELL-01–07 | Phase 3 | Pending |
| BUYER-01–08 | Phase 4 | Pending |
| MKT-01–05 | Phase 5 | Pending |
| MORT-01–03 | Phase 6 | Pending |
| OFFER-01–08 | Phase 7 | Pending |
| AGENT-01–07 | Phase 8 | Pending |
| TOUR-01–03 | Phase 9 | Pending |
| SEO-01–05 | Phase 10 | Pending |

**Coverage:**
- v1 requirements: 66 total
- Mapped to phases: 66
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-06*
*Last updated: 2026-04-06 after initial definition*
