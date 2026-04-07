# Roadmap: Tri States Realty

**Milestone:** 1.0 — Full Platform Launch
**Goal:** Ship a world-class personal real estate platform that lets buyers discover, tour, qualify, offer, and close entirely online — with commission wiring automatically to the agent through their broker.

---

## Milestone 1.0 — Full Platform Launch

| Phase | Name | Status | Plans | Requirements |
|-------|------|--------|-------|--------------|
| 1 | Foundation & Design System | 2/8 | In Progress|  |
| 2 | IDX Listings Engine | Pending | 0/0 | IDX-01–10 |
| 3 | Schell Brothers Communities | Pending | 0/0 | SCHELL-01–07 |
| 4 | Buyer Accounts & AI Recommendations | Pending | 0/0 | BUYER-01–08 |
| 5 | Market Analytics & Valuation Tool | Pending | 0/0 | MKT-01–05 |
| 6 | Mortgage Pre-Qualification | Pending | 0/0 | MORT-01–03 |
| 7 | E-Sign Offer Pipeline | Pending | 0/0 | OFFER-01–08 |
| 8 | Agent Dashboard & Commission Pipeline | Pending | 0/0 | AGENT-01–07 |
| 9 | 3D Virtual Tours & Showings | Pending | 0/0 | TOUR-01–03 |
| 10 | SEO, Performance & Launch | Pending | 0/0 | SEO-01–05 |

---

## Phase Details

### Phase 1: Foundation & Design System

**Goal:** Fully configured Next.js 16 project with luxury dark design system, deployed to Vercel on tristatesrealty.com, with all infrastructure wired up.

**Why first:** Everything else builds on top of this. Getting the design system right here means every subsequent phase inherits pixel-perfect components automatically.

**Plans:** 2/8 plans executed

Plans:
- [ ] 01-PLAN-01.md — Project initialization (Next.js 16, TypeScript, Tailwind v4, fonts, env setup)
- [ ] 01-PLAN-02.md — Supabase + Clerk integration (pgvector, auth middleware, sign-in/up pages)
- [ ] 01-PLAN-03.md — Design tokens + shadcn/ui (OKLCH palette, @theme inline, 11 base primitives)
- [ ] 01-PLAN-04.md — Layout components (Navbar with scroll transition, Footer, MobileMenu)
- [ ] 01-PLAN-05.md — UI primitives (Button 5 variants, Badge, Input, Select, FilterPill, Skeleton, Toast)
- [ ] 01-PLAN-06.md — Cards + Map + Modal + Framer Motion wrappers (ListingCard, CommunityCard, MapContainer, animations)
- [ ] 01-PLAN-07.md — Homepage shell (Hero, Featured Listings, Communities, CTA Banner, full assembly)
- [ ] 01-PLAN-08.md — Vercel deployment + domain + AWS Lambda skeleton

**Success Criteria:**
- [ ] Next.js 16 App Router + TypeScript + Tailwind v4 + Supabase + Clerk running locally and on Vercel
- [ ] tristatesrealty.com resolves to the deployed app
- [ ] Design system: black/gold/white OKLCH palette, Playfair Display + Montserrat, shadcn/ui components
- [ ] Homepage shell renders with hero, nav, footer — matches luxury aesthetic from UI-SPEC
- [ ] Lighthouse score > 90 on homepage
- [ ] AWS Lambda background job environment configured (skeleton)

**Key Decisions:**
- Next.js 16 App Router (ISR for listing pages, RSC for performance) — updated from v15 per research
- Tailwind v4 CSS-first configuration (no tailwind.config.js)
- Supabase (PostgreSQL + pgvector — single DB for listings, users, vectors, market data)
- Clerk (buyer + agent auth with role separation via publicMetadata.role)
- Mapbox GL for maps (better customization than Google Maps for dark theme)
- Framer Motion v12 for animations
- shadcn/ui with OKLCH tokens for component primitives

---

### Phase 2: IDX Listings Engine

**Goal:** Full Bright MLS IDX feed live — buyers can search, filter, and view every active listing in DE, MD, NJ, PA exactly like Zillow.

**Why second:** Listings are the core product. Everything else (AI, offers, analytics) depends on listings existing and being searchable.

**Prerequisites:** Schell Brothers broker IDX authorization from Bright MLS. IDX Broker Platinum account.

**Success Criteria:**
- [ ] SimplyRETS API pulling live Bright MLS data, syncing every 15 minutes
- [ ] Search page with Mapbox map view + list view, all advanced filters working
- [ ] Listing detail pages rendering with full photo gallery, Street View, price history, comps
- [ ] JSON-LD structured data on every listing page (passes Google Rich Results test)
- [ ] ISR revalidation triggered on MLS updates (listings go live within 15 min)
- [ ] Saved searches created by buyers trigger email + SMS alerts on new matches
- [ ] Fair Housing logo + MLS attribution displayed per Bright MLS rules
- [ ] 500 top listings pre-built at deploy; all others on-demand via dynamicParams

---

### Phase 3: Schell Brothers Communities

**Goal:** Dedicated showcase for every Schell Brothers community — the #1 SEO differentiator no portal can replicate, with video, amenities, floorplans, and live listings.

**Why third:** Schell Brothers communities are the agent's primary inventory. These pages are the highest-leverage SEO asset — they can rank above Zillow for hyperlocal queries because no one else will build this depth of content.

**Success Criteria:**
- [ ] Individual page per Schell Brothers community (DE/MD/NJ/PA)
- [ ] Each community page: hero video, overview, amenities checklist, school info, HOA details, price range, available floorplans with images
- [ ] YouTube embed + custom video upload working on all community pages
- [ ] Live IDX listings filtered to each community rendered inline
- [ ] Interactive Mapbox map showing community location + nearby POIs (schools, restaurants, highways)
- [ ] "Schedule a Tour" CTA captures lead (name, email, phone, preferred date) → agent notified
- [ ] Community pages indexed by Google (sitemap updated, no IDX noindex restriction applies)
- [ ] Page loads under 2s on mobile (video lazy-loads)

---

### Phase 4: Buyer Accounts & AI Recommendations

**Goal:** Buyers create accounts, save listings, and receive AI-powered home recommendations that get smarter the more they use the site — creating the re-engagement loop that makes Zillow sticky.

**Why fourth:** Once listings exist (Phase 2) and communities exist (Phase 3), we add personalization. The AI engine needs real listing data to embed, so it must come after Phase 2.

**Success Criteria:**
- [ ] Buyer signup/login via Clerk (email + Google OAuth)
- [ ] Favorites list (save/unsave listings, persists across sessions)
- [ ] Saved searches dashboard (create, edit, delete, pause alerts)
- [ ] Buyer dashboard: favorites, saved searches, offer status, transaction timeline
- [ ] OpenAI text-embedding-3-small generates 1536-dim vectors for all listings (AWS Lambda batch job)
- [ ] Hybrid recommendation query: pgvector cosine similarity + price/location SQL filter
- [ ] "Homes you may like" section on homepage (logged-in buyers) + buyer dashboard
- [ ] Natural language search bar: parses intent → generates filter params → returns results
- [ ] Recommendation vectors update when buyer views, saves, or searches

---

### Phase 5: Market Analytics & Valuation Tool

**Goal:** Real-time neighborhood market data dashboard + a home valuation tool that captures seller leads automatically.

**Why fifth:** Market data requires a backend polling infrastructure (Attom Data → Supabase). The valuation tool is the #1 seller lead magnet — ships in this phase to start capturing seller pipeline.

**Success Criteria:**
- [ ] Attom Data API polled every 24h, results cached in market_snapshots table
- [ ] Neighborhood dashboard: 12-month median price chart, days-on-market trend, price/sqft, list-to-sale ratio, active listing count
- [ ] Market stats widget on every listing detail page (neighborhood-level)
- [ ] Data pushed to dashboard via Supabase Realtime (no page refresh needed)
- [ ] Home valuation AVM tool on homepage: enter address → instant estimate displayed → email capture gate → agent notified with lead details
- [ ] Valuation leads stored in agent CRM-lite (Phase 8) with source tag

---

### Phase 6: Mortgage Pre-Qualification

**Goal:** Buyers get instant mortgage pre-qualification on-site, surfaced at the exact moment they're ready to make an offer.

**Why sixth:** Pre-qual must exist before the offer pipeline (Phase 7) — a pre-qual completion is a buying signal that primes buyers for offer submission.

**Success Criteria:**
- [ ] Morty embedded pre-qual widget on site, dark-mode themed to match design system
- [ ] Pre-qual CTA shown on listing detail pages and offer initiation flow
- [ ] Pre-qual widget placement A/B tested (inline vs. modal) — winner deployed
- [ ] Pre-qual completion event fires webhook → agent notified with lead details
- [ ] Pre-qual result (pre-approved amount) optionally auto-fills offer form in Phase 7

---

### Phase 7: E-Sign Offer Pipeline

**Goal:** Buyers submit full legally-binding purchase offers with DocuSign e-signatures directly on the site — agent manages everything remotely, never needs to show up.

**Why seventh:** This is the core "hands-free commission" promise. Built after buyer accounts (Phase 4) so we know who's submitting, and after pre-qual (Phase 6) so buyers are financing-ready.

**Key Legal Notes:**
- State forms (DE/MD/NJ/PA) are REALTOR member-gated — agent stores templates in their DocuSign account, invoked by templateId only
- NJ: mandatory 3-business-day attorney review window — surfaced in UI and tracked in status machine
- NAR 2024 settlement compliance: buyer agent compensation field + BRA envelope required

**Success Criteria:**
- [ ] Offer intent form on listing detail pages (price, contingencies, closing date, financing)
- [ ] DocuSign embedded signing via createRecipientView — buyer signs without leaving site
- [ ] State-specific form logic: correct template selected per listing state
- [ ] NJ attorney review disclosure surfaced; status reflects 3-day window
- [ ] BRA envelope sent as first step in offer flow (NAR 2024 compliance)
- [ ] Agent approval gate: offer terms → agent notified → agent triggers DocuSign send
- [ ] DocuSign Connect webhook: envelope-completed → Dotloop loop auto-created with PDF
- [ ] Offer status tracker (buyer-visible): Submitted → Sent for Signature → Signed → Under Review → Accepted / Countered / Declined
- [ ] Deal-close event triggers broker commission notification email + CDA generation

---

### Phase 8: Agent Dashboard & Commission Pipeline

**Goal:** A complete behind-the-scenes command center — offer management, CRM, leads, analytics, and commission tracking — so the agent runs their entire business from one screen.

**Why eighth:** The dashboard ties together all data generated in previous phases. CRM-lite built custom (not HubSpot) — 3 Supabase tables + kanban UI = 2-3 days of work, no $800/mo subscription.

**Success Criteria:**
- [ ] Secure agent dashboard (Clerk role-gated, separate from buyer site)
- [ ] Offer queue: all incoming offers, offer details, accept/counter/decline actions with DocuSign trigger
- [ ] Listings manager: own IDX listings view + manual edit for Schell community details
- [ ] CRM-lite: contact cards with pipeline stage (Lead → Nurturing → Active → Under Contract → Closed), notes, last contact, source tag
- [ ] Lead inbox: all contact forms, valuation requests, tour bookings, pre-qual completions in one feed
- [ ] Email (Resend) + SMS (Twilio) notifications: new offer, new lead, status change
- [ ] Analytics panel: listing page views, lead sources breakdown, saved search counts, offer conversion rate
- [ ] Commission tracker: active deals, expected commission, closed-this-month total

---

### Phase 9: 3D Virtual Tours & Showings

**Goal:** Buyers tour homes immersively from their phone — Matterport 3D walkthroughs embedded on listings, plus a tour scheduling flow for listings without virtual tours.

**Why ninth:** Tours are additive premium content. The core platform (listings, offers, agent dashboard) must be solid before adding media integrations.

**Success Criteria:**
- [ ] Matterport embed API integrated — 3D tour rendered on listing pages where tour exists
- [ ] CloudPano fallback for non-Matterport virtual tours
- [ ] "Request a Showing" form on all listings without virtual tours (name, email, phone, preferred times)
- [ ] Showing requests feed into agent dashboard lead inbox
- [ ] Tour presence badge on listing cards in search results ("3D Tour Available")

---

### Phase 10: SEO, Performance & Launch

**Goal:** Every page is fast, indexed, and ranking. Site goes live on tristatesrealty.com as the definitive real estate platform for DE, MD, NJ, PA.

**Why last:** SEO and performance polish requires all content to exist first. This phase locks in long-term organic traffic growth.

**Success Criteria:**
- [ ] Auto-generated sitemap covers all active listings + community pages + static pages
- [ ] Open Graph + Twitter Card meta on every listing (photo, price, address previews correctly)
- [ ] robots.txt compliant with Bright MLS IDX display rules
- [ ] Blog/market updates section live with first 3 posts (agent-authored or AI-assisted draft)
- [ ] LocalBusiness + RealEstateListing schema markup validated
- [ ] All pages pass Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms on mobile
- [ ] 0 console errors in production build
- [ ] GitHub repo connected, auto-deploy on main branch merge
- [ ] tristatesrealty.com fully live with SSL, redirects, and custom error pages
- [ ] Google Search Console verified and sitemap submitted

---

## External Dependencies (Must Resolve Before Relevant Phase)

| Dependency | Needed For | Action Required |
|------------|-----------|-----------------|
| Schell Brothers IDX broker authorization | Phase 2 | Confirm with broker if blanket auth exists; if not, broker files with Bright MLS (1-2 weeks) |
| Bright MLS IDX license | Phase 2 | Sign up at brightmls.com after broker auth confirmed (~$10/mo) |
| IDX Broker Platinum account | Phase 2 | Sign up at idxbroker.com after Bright MLS auth (~$55-120/mo) |
| DocuSign developer account | Phase 7 | Create at developers.docusign.com (free dev, $600/yr Starter for production) |
| State purchase agreement templates | Phase 7 | Agent uploads authorized DE/MD/NJ/PA forms to DocuSign account as templates |
| Dotloop account | Phase 7 | Sign up at dotloop.com for transaction management backend |
| Attom Data API key | Phase 5 | Request quote at attomdata.com (pricing varies, get early) |
| Morty partner account | Phase 6 | Sign up at morty.com for embedded widget access |
| Matterport account | Phase 9 | Sign up at matterport.com (Pro plan for API access) |

---
*Roadmap created: 2026-04-06*
*Last updated: 2026-04-06 — Phase 1 planned (8 plans in 5 waves)*
