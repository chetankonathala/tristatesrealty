# Tri States Realty

## What This Is

A Zillow-level Delaware home search platform for a licensed Schell Brothers agent. Buyers browse all Delaware MLS listings with structured filters and an AI chatbot that understands natural language ("4 bed, 5 bath, $800k in Lewes") — all contact and leads route exclusively to the agent. Schell Brothers communities are featured alongside all resale inventory.

## Core Value

Any Delaware home buyer can find their perfect home and contact the agent in under 60 seconds — whether they search with filters, a map, or just describe what they want in plain English.

## Current Milestone: v1.1 Delaware Search Platform

**Goal:** Turn tristatesrealty.com into a Zillow-level Delaware home search platform with AI-powered natural language search, routing all buyer leads exclusively to dad.

**Target features:**
- All Delaware MLS listings via BrightMLS/SimplyRETS (every town, all price ranges)
- Structured search: price, beds, baths, property type, city/zip/area + Mapbox map with listing pins
- AI chatbot (Claude): natural language → live matching listings
- Both chat placements: floating bubble (site-wide) + /search page with chat sidebar
- All leads route exclusively to dad regardless of which listing a buyer views

## Requirements

### Validated

**MLS Data** *(Validated in Phase 04: MLS Data Pipeline)*
- [x] Listing cards: photo, price, beds/baths/sqft, days on market, address, MLS attribution
- [x] Individual listing detail pages with full photo gallery and contact form routing to dad
- [x] Every listing contact form routes exclusively to dad (email + SMS via Resend + Twilio)
- [x] Bright MLS compliance on every listing surface (copyright, Fair Housing logo, providedBy attribution)

### Active (v1.1 — Delaware Search Platform)

**MLS Data**
- [ ] BrightMLS IDX feed live via SimplyRETS — all Delaware listings syncing (blocked on broker IDX activation)
- [ ] Listing cards: photo, price, beds/baths/sqft, days on market, address, MLS attribution
- [ ] Individual listing detail pages with full photo gallery and contact form routing to dad

**Structured Search**
- [ ] Filter bar: price range, beds, baths, property type, city/zip/area
- [ ] Mapbox map view with listing pins, clustering, click-to-detail
- [ ] URL-based search state (shareable/bookmarkable searches)

**AI Chat Search**
- [ ] Floating chat bubble on every page — opens AI chat
- [ ] Dedicated /search page: chat sidebar (left) + results map/grid (right)
- [ ] Claude-powered NL → filter translation: "4bed 5bath $800k Lewes" → structured query → live listings
- [ ] Chat suggests refinements when no results found

**Lead Routing**
- [ ] Every listing contact form routes exclusively to dad (email + SMS via Resend + Twilio)
- [ ] Agent dashboard shows all inbound leads with listing context

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

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-25 after Phase 04 (MLS Data Pipeline) complete*
