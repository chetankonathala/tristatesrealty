# Tri States Realty

## What This Is

A world-class personal real estate platform for a licensed agent (Schell Brothers) serving DE, MD, NJ, and PA. The site allows buyers to browse Zillow-mirrored MLS listings, filter homes by preference, explore Schell Brothers communities via video, get mortgage pre-qualified, and submit legally binding e-sign offers — all without the agent needing to be physically present. Commission wires automatically through the broker upon deal close.

## Core Value

Buyers complete the entire home-buying journey — discover, tour, qualify, offer, and close — on one site, while the agent earns commission hands-free.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Listings & Data**
- [ ] Bright MLS IDX feed integration for DE, MD, NJ, PA listings (real-time sync)
- [ ] Dedicated Schell Brothers communities showcase section with all their active listings
- [ ] Zillow-parity listing cards: photos, price, beds/baths, sq ft, days on market, price history
- [ ] Advanced search & filtering: price range, beds, baths, property type, zip/city, school district, lot size, new construction vs resale
- [ ] Individual property detail pages with full photo galleries

**Schell Brothers Communities**
- [ ] Curated community pages for each Schell Brothers neighborhood (DE/MD/NJ/PA)
- [ ] Community video gallery: embed Schell Brothers YouTube videos + support custom video uploads
- [ ] Community amenity highlights, HOA info, floorplan previews, price ranges

**AI & Intelligence**
- [ ] AI home recommendation engine — learns buyer preferences from behavior and saves/views
- [ ] Real-time market analytics dashboard: median price trends, days-on-market, price per sq ft, appreciation rates by neighborhood
- [ ] Comparable sales (comps) on each listing page

**Virtual Tours**
- [ ] 3D virtual tour embedding (Matterport / iGUIDE compatible)
- [ ] Google Street View integration on every listing

**Mortgage Pre-Qualification**
- [ ] On-site instant mortgage pre-qual calculator/form
- [ ] Integration with a lending partner API (e.g. Rocket Mortgage, Morty) for soft pre-approval

**Offer & Transaction Pipeline**
- [ ] Full DocuSign-style e-sign offer submission directly on site (via DocuSign API or HelloSign)
- [ ] Buyer account creation: save searches, favorite listings, track offer status
- [ ] Offer status dashboard for agent: review, counter, accept/decline offers remotely
- [ ] Automated commission pipeline: deal close event triggers notification + broker wire workflow
- [ ] Transaction timeline tracker visible to buyer (under contract → inspection → closing)

**Agent Dashboard**
- [ ] Dual-agent dashboard: manage buyer clients AND own/Schell listings
- [ ] Lead capture and CRM-lite: contact history, notes, pipeline stage per client
- [ ] Notification system: new offers, new leads, status changes (email + SMS)
- [ ] Analytics: traffic, lead sources, listing views, offer conversion rates

**Brand & UX**
- [ ] Luxury dark aesthetic matching existing tristatesrealty.com (Playfair Display / Montserrat, black/white/gold palette)
- [ ] Fully responsive (mobile-first)
- [ ] Fast page loads (Core Web Vitals green)
- [ ] SEO-optimized listing pages for organic search traffic

### Out of Scope

- Multi-agent brokerage management — single agent focus (v1)
- Property management / rental listings — sales only
- In-house title/escrow processing — handled by existing broker pipeline

## Context

- **Existing site**: tristatesrealty.com — luxury dark landing page only (no listings, no functionality)
- **Brokerage**: Schell Brothers — prominent new-construction builder/brokerage in Mid-Atlantic
- **MLS**: Bright MLS covers DE, MD, NJ, PA — IDX license required through broker
- **Competitors' model**: Other agents have personal sites where clients self-serve through the full funnel; agent collects commission without showing up
- **DocuSign**: Industry standard for real estate e-signatures; API integration needed
- **Commission flow**: Closes through Schell Brothers broker — platform triggers notification, wire handled via broker system

## Constraints

- **IDX License**: Must obtain IDX data license through Bright MLS via Schell Brothers broker before MLS data can legally display
- **DocuSign API**: Requires DocuSign developer account + production credentials for live transactions
- **Mortgage API**: Lending partner integration requires business agreement (Rocket Mortgage Partner API, Morty, or similar)
- **Compliance**: Real estate advertising must comply with Fair Housing Act, MLS display rules, and state licensing requirements for DE/MD/NJ/PA
- **Tech Stack**: Next.js (React) frontend, Node.js/PostgreSQL backend, Vercel deployment — optimized for SEO and performance

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js over plain React | SEO-critical for listing pages; ISR for real-time MLS data | — Pending |
| Bright MLS IDX for data | Covers all 4 target states; industry standard | — Pending |
| DocuSign for e-sign | Industry standard in real estate; legally binding | — Pending |
| Single-agent v1 scope | Build for father first; expand to team later | — Pending |

---
*Last updated: 2026-04-06 after initial project definition*
