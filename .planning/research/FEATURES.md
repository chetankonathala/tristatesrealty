# Feature Landscape: Tri States Realty — v1.1 Delaware Search Platform

**Domain:** AI-powered MLS listing search + natural language chat for a single-agent real estate site
**Milestone:** v1.1 — Delaware Search Platform (structured filter search + Mapbox map + AI chat)
**Researched:** 2026-04-19
**Confidence:** HIGH for structured search and map (existing codebase audited + industry patterns verified); MEDIUM for AI chat patterns (WebSearch verified against Claude API docs)

---

## Research Scope

This document focuses exclusively on v1.1 milestone features:
1. Full Delaware MLS search via BrightMLS/SimplyRETS
2. Structured filter search with Mapbox map view
3. AI chatbot: natural language → live MLS queries
4. Chat UI patterns (floating bubble + /search sidebar)
5. Lead routing to agent exclusively

**Prior research note:** `.planning/research/FEATURES.md` from 2026-04-06 covers the full product roadmap (community pages, transaction pipeline, client portal, DocuSign). That scope is NOT re-researched here. This file covers v1.1 search + AI chat only.

**Codebase audit findings:** Significant infrastructure is already built and partially functional. What exists vs. what needs to be built is noted per feature.

---

## Codebase Audit: What Already Exists

The following are BUILT — do not re-plan, only integrate or surface in the UI:

| Component | Status | Location |
|-----------|--------|----------|
| `searchParamsSchema` (Zod) | BUILT — minPrice, maxPrice, minBeds, minBaths, type, cities, counties, postalCodes, waterfront, newConstruction, garage, status, sort, page, view, bounds | `src/lib/schemas/search-params.ts` |
| `SearchFilters` — filter bar (pills + More Filters modal + mobile sheet) | BUILT | `src/components/listings/search-filters.tsx` |
| `ActiveFilterBar` — active filter chips | BUILT | `src/components/listings/active-filter-bar.tsx` |
| `SearchMap` — Mapbox dark-v11, supercluster, search-as-you-move bounds → URL | BUILT | `src/components/listings/search-map.tsx` |
| `MapMarker` + `MapCluster` | BUILT | `src/components/listings/` |
| `SearchResultsGrid` + `ListingCardSkeleton` | BUILT | `src/components/listings/` |
| `ViewToggle` (map / list / split) | BUILT | `src/components/listings/view-toggle.tsx` |
| `ListingHero` + `ListingGallery` + `ListingSpecGrid` + full detail components | BUILT | `src/components/listings/` |
| `ContactAgentModal` — lead form → `/api/leads` → Resend + Twilio | BUILT | `src/components/listings/contact-agent-modal.tsx` |
| `/api/leads` and `/api/leads/[id]` — lead routing to agent | BUILT | `src/app/api/leads/` |
| `/api/saved-searches` + `/api/saved-searches/notify` | BUILT | `src/app/api/saved-searches/` |
| `SavedSearchButton` | BUILT | `src/components/listings/saved-search-button.tsx` |
| `MLSAttribution` | BUILT | `src/components/listings/mls-attribution.tsx` |
| `listings` Supabase table — 36 columns, 16 indexes, RLS, pgvector | BUILT | `supabase/migrations/` |
| SimplyRETS sync cron (15-min) | BUILT | `src/app/api/listings/sync/route.ts` |
| nuqs URL state throughout search | BUILT | integrated in SearchFilters + SearchMap |

**What does NOT exist (needs to be built for v1.1):**
- `/search` page (only `/listings` page exists)
- AI chat API route (`/api/chat`)
- Floating chat bubble component (site-wide)
- Chat sidebar layout for `/search`
- NL → filter translation (Claude API structured output)
- Split view layout wiring (map + results + chat sidebar together on one page)

---

## Table Stakes

Features buyers expect from any serious listing site in 2026. Missing = product feels incomplete or untrustworthy. These are the floor, not the ceiling.

| Feature | Why Expected | Complexity | Existing | Notes |
|---------|--------------|------------|----------|-------|
| All Delaware MLS listings (IDX feed) | Zillow/Redfin baseline — partial inventory kills trust immediately | MED | Sync built, IDX activation pending | SimplyRETS/BrightMLS; all statuses (Active, Pending, Coming Soon) |
| Listing cards: photo, price, beds/baths, sqft, DOM, address | Buyers scan these 6 fields in 2 seconds; any missing = amateur signal | LOW | Grid built | MLS attribution required on every card per BrightMLS IDX rules |
| Structured filter bar: price, beds, baths, type | Buyers cannot evaluate inventory without these 4 minimum filters | LOW | BUILT | Already exists; pills on desktop, sheet on mobile |
| Location filter: city/zip/area search | Delaware buyers search by town (Lewes, Rehoboth, Newark, Wilmington) | LOW | BUILT (cities param) | LocationSearch component exists; verify city autocomplete works against BrightMLS city values |
| Mapbox map with listing pins + clustering | Spatial search is how buyers think; 60%+ of Zillow sessions involve the map | MED | BUILT | SearchMap with supercluster — needs to be surfaced in /search split view |
| Search-as-you-move (map pans → results update) | Redfin popularized this; buyers now expect map movement = list update | MED | BUILT | Bounds written to URL on move-end; server reads bounds param |
| Click pin → listing card highlight | Spatial ↔ list sync — buyers need to connect pin to card | LOW | BUILT (selectedMlsId flow) | Verify onSelect wiring in split view |
| Individual listing detail pages | Buyers need full photos, specs, description before contacting | LOW | BUILT | /listings/[mlsId]/page.tsx exists |
| URL-based search state (shareable/bookmarkable) | Buyers share searches with partners; must survive refresh | LOW | BUILT | nuqs throughout — fully URL-driven |
| Contact agent form on every listing | Every listing must funnel to the agent; this is the revenue mechanism | LOW | BUILT | ContactAgentModal with /api/leads routing |
| MLS attribution on every listing card + detail | BrightMLS IDX compliance requirement — legal requirement, not optional | LOW | BUILT | MLSAttribution component exists |
| Mobile-responsive search | 70%+ of property searches are on mobile | MED | BUILT (filter sheet) | Verify split view degrades gracefully on mobile to list-only or map-only with toggle |
| Sort options: price, date, beds | Buyers want to sort by price high/low, newest first | LOW | BUILT (sort param in schema) | Verify sort is wired to UI dropdown in SearchResultsHeader |
| Clear all filters / reset | Standard expectation; frustration if missing | LOW | BUILT | clearAll in SearchFilters |
| Pagination or load-more | Without this, search caps at N results invisibly | LOW | BUILT (page param) | Verify page controls are rendered in SearchResultsGrid |

---

## Differentiators

Features that distinguish this site from generic IDX sites and from Zillow for this specific market. These are where the product competes.

### AI Natural Language Search

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| NL → structured filter translation (Claude) | Redfin's Nov 2025 launch: conversational search users viewed 2x more homes than filter-only users; Zillow, Homes.com, Realtor.com all launched in 2025 — now becoming expected | HIGH | Claude tool use / structured outputs: parse "4bed 5bath $800k Lewes" → `{minBeds: 4, minBaths: 5, maxPrice: 800000, cities: "Lewes"}` → SimplyRETS query |
| Live results in same session (chat → results update without page reload) | Users hate switching contexts; search result must update in real-time as chat refines | HIGH | Chat sidebar sends parsed params → nuqs → server re-fetches; requires client-side state bridge |
| Refinement suggestions when 0 results | "No homes found for 5 bed $600k in Lewes — try 4 beds, or expand to $700k" — Redfin does this; prevents dead ends | MED | Claude generates suggestion text based on applied filters + empty result set |
| Multi-turn conversation (context retention) | "Now show me with a pool" after "4bed in Lewes" — merges new intent with prior filters | MED | Maintain conversation history in chat state; Claude merges delta intent with existing filter object |
| Delaware city/neighborhood disambiguation | "Near Rehoboth" = Rehoboth Beach + Dewey Beach + Lewes; agent knowledge embedded in system prompt | MED | System prompt includes DE geography: Wilmington, Newark, Dover, Lewes, Rehoboth, Bethany, Millsboro, Georgetown, Milford, Middletown, Smyrna |

### Chat UI Placements

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Floating chat bubble (site-wide) | Captures buyers who are on community pages / home page / listing pages — not just /search; 24/7 presence equivalent | MED | Fixed bottom-right bubble; opens modal or slide-over; available on every layout |
| /search page chat sidebar (left panel) | Power user mode — dedicated search session with full map + results + chat in one view; Redfin's conversational search launched as dedicated page | HIGH | 3-panel layout: chat left (300px) + map right (fills remaining) + results grid below map or in overlay |
| Chat → filter bar sync (bidirectional) | If user changes a filter pill manually, chat should acknowledge the change; if chat changes filters, pills update | HIGH | Single source of truth: nuqs URL params. Both chat and filter bar read/write the same params |
| Persistent chat context within session | Buyer should not have to repeat "I'm looking in Lewes" every message | LOW | Store conversation array in component state; pass full history to Claude on each turn |

### Lead Intelligence

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Chat session lead capture | When buyer asks "can I schedule a tour?" or "how do I make an offer?" — surface contact form inline in chat | MED | Claude detects intent keywords → inserts ContactAgentModal trigger inline in response |
| Chat-sourced lead context in dashboard | Agent sees "lead from AI chat: searched 4bed $800k Lewes, asked about touring 123 Main St" — more useful than a generic form submission | MED | Log chat summary to leads table alongside standard lead fields |

### Search UX Refinements (Beyond Table Stakes)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Price pins on map (show price on each marker, not just a dot) | Zillow popularized this — buyers scan price geography before clicking individual listings | MED | MapMarker currently shows dot; add price badge; at cluster scale show count not price |
| "Draw your own search" area | Zillow + Redfin both offer this; buyers near specific school catchments or commute corridors use it | HIGH | mapbox-gl-draw library; draw polygon → derive bounds → filter by lat/lng in Supabase query; defer to v1.x |
| Save this search (persistent, email alerts) | Core retention driver — buyer leaves, gets notified when new matching listing hits | MED | BUILT (/api/saved-searches + notify cron) — wire SavedSearchButton into search UI |
| Recent searches (session memory) | Reduces friction for repeat visitors | LOW | localStorage; last 3 searches shown below search bar |
| Instant count update as filters change | Zillow shows "X homes" updates before user hits Apply; reduces guesswork | LOW | Debounced count query via nuqs throttleMs=300 — already in place in SearchFilters |

---

## Anti-Features

Features that seem valuable but should be explicitly avoided.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| AI chatbot that fabricates listing details | Sounds conversational, feels smart | Claude hallucinating square footage, price, or availability on a specific listing destroys trust catastrophically and creates legal liability | ONLY let Claude produce filter params and informational text. NEVER let Claude describe specific listings from memory. Always pull listing data from Supabase, not from Claude's context window |
| Listing data in Claude's context window | Appears to make chat smarter | Claude's knowledge is stale; actual listings change every 15 min. Sending all Delaware listings in a prompt is token-prohibitive and will produce outdated answers | NL → params → Supabase query → return real data to client. Claude only translates intent, never retrieves listings |
| Infinite scroll on listing grid | Feels modern; common on mobile apps | SEO catastrophic — each URL must have a stable, crawlable listing set. Search engines cannot index infinite scroll results. Bookmark/share breaks on scroll position | Paginated grid with URL-based page param (already in schema). Load-more button acceptable as enhancement on mobile — but back-navigation must restore position |
| Streaming listings in chat (chat IS the results) | Conversational feel | Chat UI is not a good grid; buyers need to see photos side by side, sort, compare — chat format is terrible for 50 results | Chat sets filters → results render in map/grid panel. Chat is the input mechanism, not the results display |
| Omni-channel chatbot (schedules tours, calls MLS, checks mortgage rates) | Ambitious; press-release worthy | Each additional "action" Claude can take is a hallucination vector and a support/debugging surface. Build small, verify, expand | Phase 1: NL → filters only. Phase 2: add tour scheduling intent detection. Phase 3: mortgage affordability context |
| Real-time price change notifications (WebSocket) | Sophisticated; enterprise feel | MLS data updates every 15 min via cron; sub-minute updates are illusory and waste infrastructure. Real buyers care about new listings, not 5-min price micro-updates | Email alerts on saved searches (already built) + nightly digest is sufficient for v1.1 |
| Mortgage payment calculator in chat | Feels helpful | Chat + math is error-prone; Claude does arithmetic badly for edge cases | Static affordability calculator widget on listing detail page (separate component, not AI) |
| Voice search | Futuristic, accessible | Browser Web Speech API is unreliable; requires heavy UX work for error states; mobile keyboard is more reliable for real estate queries | Text input is sufficient; mobile keyboard optimized with `inputmode="search"` |
| Zillow-style neighborhood "GreatSchools" ratings | Adds data richness | Requires GreatSchools API agreement + Fair Housing compliance review. Schools data can imply discriminatory steering if presented incorrectly | Defer to v2; link out to GreatSchools.org for now |
| Infinite filter options (lot size, HOA fees, basement, pool, etc.) | Power users want granular control | Analysis paralysis — Zillow's "More Filters" modal has 40+ options and most buyers never use 80% of them. Discovery suffers | Core 4 pills (price, beds, baths, type) + "More Filters" for sqft, waterfront, new construction, garage — already implemented and correctly scoped |
| Third-party chat widget (Intercom, Drift, Crisp) | Quick to install | Sends buyer data to a third-party; creates Clerk auth mismatch; styling conflicts with dark-only design; cannot integrate with SimplyRETS query pipeline | Custom Claude-powered chat — already the plan |

---

## Feature Dependencies

```
SimplyRETS IDX activation (external blocker)
    └──unlocks──> All listing data features

BrightMLS IDX feed → Supabase listings table (cron sync, BUILT)
    └──powers──> /listings page (BUILT)
    └──powers──> /search page (TO BUILD)
    └──powers──> Saved search email alerts (BUILT — needs UI wire)
    └──powers──> Chat AI results (TO BUILD — query after NL translation)

searchParamsSchema (BUILT)
    └──consumed by──> SearchFilters (BUILT)
    └──consumed by──> SearchMap bounds (BUILT)
    └──consumed by──> Supabase searchListings query (BUILT)
    └──consumed by──> /api/chat NL translation output (TO BUILD — same schema)

Claude API (structured output / tool use)
    └──requires──> /api/chat route (TO BUILD)
    └──produces──> Partial<SearchParams> object
    └──written to──> nuqs URL state (same mechanism as filter pills)
    └──triggers──> Supabase re-query → results update

Floating Chat Bubble (TO BUILD)
    └──opens──> Chat modal (TO BUILD)
    └──OR routes to──> /search?chat=open (if user is not on /search)

/search page (TO BUILD)
    └──requires──> SearchFilters (BUILT — reuse)
    └──requires──> SearchMap (BUILT — reuse)
    └──requires──> SearchResultsGrid (BUILT — reuse)
    └──requires──> Chat sidebar layout (TO BUILD)
    └──requires──> /api/chat (TO BUILD)

ContactAgentModal (BUILT)
    └──wired to──> /api/leads (BUILT)
    └──must appear──> on listing detail pages (BUILT)
    └──must appear──> inline in chat when tour intent detected (TO BUILD)

SavedSearchButton (BUILT)
    └──wired to──> /api/saved-searches (BUILT)
    └──must be surfaced──> in /search filter bar / header (TO BUILD — just needs placement)
```

### Dependency Notes

- **Claude API requires no existing listings in context:** Claude only receives the raw NL query and a JSON schema. It returns filter params. Supabase fetches actual listings. This is the correct architecture — never send listing data to Claude.
- **/api/chat shares `searchParamsSchema` with filters:** The NL translation must produce a `Partial<SearchParams>` that matches the existing Zod schema exactly. This means the chat API can write directly to the same nuqs URL state that filter pills write to — zero duplication.
- **Floating bubble conflicts with nothing existing:** Current site has no global chat component. Adding a `fixed bottom-right` bubble to the root layout is non-destructive.
- **`/search` page is net-new, `/listings` page stays:** Do not merge or replace `/listings`. The `/listings` page is the SEO-indexed MLS search entry point. `/search` is the AI chat-first experience. They can coexist and share the same underlying components.

---

## SimplyRETS API Filter Parameters (verified)

These are the actual parameters available for MLS queries — directly maps to the existing `searchParamsSchema`:

| SimplyRETS Param | Schema Param | Type | Notes |
|------------------|--------------|------|-------|
| `minprice` | `minPrice` | integer | List price floor |
| `maxprice` | `maxPrice` | integer | List price ceiling |
| `minbeds` | `minBeds` | integer | Min bedrooms |
| `maxbeds` | `maxBeds` | integer | Max bedrooms |
| `minbaths` | `minBaths` | float | Min bathrooms |
| `maxbaths` | `maxBaths` | float | Max bathrooms |
| `minarea` | `minSqft` | integer | Min square footage |
| `maxarea` | `maxSqft` | integer | Max square footage |
| `cities` | `cities` | array | Comma-separated city names |
| `postalCodes` | `postalCodes` | array | Zip codes |
| `counties` | `counties` | array | County names |
| `type` | `type` | string | "Residential", "Condo", "Townhouse", "Land", etc. |
| `status` | `status` | string | "Active", "Pending", "ActiveUnderContract", "ComingSoon" |
| `minyear` | `minYearBuilt` | integer | Year built floor |
| `maxdom` | — | integer | Days on market ceiling (not in schema yet) |
| `sort` | `sort` | string | listprice, -listprice, listdate, -listdate, baths, beds |
| `limit` | `perPage` | integer | Results per page |
| `offset` | derived from `page` | integer | (page-1) * perPage |

**Delaware cities to include in system prompt for NL disambiguation:**
Wilmington, Newark, Dover, Lewes, Rehoboth Beach, Dewey Beach, Bethany Beach, Fenwick Island, Millsboro, Georgetown, Milford, Middletown, Smyrna, Seaford, Laurel, Bridgeville, Harrington, Camden, Elsmere, New Castle, Bear, Glasgow, Pike Creek, Hockessin, Claymont

---

## MVP Definition

### Launch With (v1.1)

This is the minimum to ship the Delaware Search Platform milestone.

- [ ] `/search` page — 3-column layout: chat sidebar (left, 320px) + map (top-right) + results grid (bottom-right); collapses to list-only on mobile
- [ ] Floating chat bubble — fixed `bottom-right` in root layout; opens chat modal; routes to `/search` on non-search pages
- [ ] `/api/chat` route — receives NL query + conversation history → Claude structured output → returns `Partial<SearchParams>` + human-readable response text
- [ ] Claude NL → filter translation — system prompt with Delaware geography, SimplyRETS param mapping, fallback text for ambiguous queries
- [ ] Chat → nuqs URL sync — parsed params from Claude written to URL → triggers Supabase re-query → results update without page reload
- [ ] Chat refinement suggestions — when result count = 0, Claude receives filter summary and generates 2-3 specific suggestions
- [ ] Price pins on map — show formatted price on each individual marker (not cluster); clusters show count only
- [ ] SavedSearchButton surfaced in /search UI — wire existing component to search header
- [ ] Sort dropdown wired in SearchResultsHeader — verify sort param drives the query (likely already does, just needs UI exposure on /search)
- [ ] Chat lead capture — detect tour-intent keywords → surface ContactAgentModal CTA inline in chat response

### Add After Validation (v1.x)

- [ ] Multi-turn conversation with full context retention (merge intent with prior filters across turns) — trigger: user confusion when chat doesn't remember prior messages
- [ ] Recent searches (localStorage) — trigger: user feedback about re-entering searches
- [ ] Chat-sourced lead context logged to dashboard — trigger: agent asks "where did this lead come from?"
- [ ] Mobile chat experience tuning — trigger: mobile traffic > 50% of chat sessions

### Future Consideration (v2+)

- [ ] Draw your own search area (mapbox-gl-draw) — complex; defer until buyers ask for it
- [ ] Voice input for chat — low priority; text input is sufficient
- [ ] Chat → tour scheduling (calendar integration) — requires DocuSign / scheduling integration first
- [ ] Neighborhood intelligence in chat ("what's the school situation in Lewes?") — requires GreatSchools API + Fair Housing compliance review

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| /search page layout (3-panel) | HIGH | MED (reuses existing components) | P1 |
| /api/chat + Claude NL translation | HIGH | MED (Claude structured output is well-documented) | P1 |
| Chat → nuqs URL param sync | HIGH | MED (nuqs already in place; bridge needed) | P1 |
| Floating chat bubble | HIGH | LOW (fixed-position React component) | P1 |
| Price pins on map markers | MED | LOW (MapMarker already exists) | P1 |
| SavedSearchButton in /search UI | MED | LOW (component exists, just needs placement) | P1 |
| Chat refinement suggestions (0 results) | MED | LOW (Claude handles with system prompt) | P1 |
| Chat lead capture (tour intent detection) | HIGH | LOW (keyword detection + modal trigger) | P1 |
| Multi-turn context retention | MED | LOW (conversation array in state) | P2 |
| Recent searches (localStorage) | LOW | LOW | P2 |
| Sort dropdown in /search UI | LOW | LOW (schema/query already wired) | P2 |
| Draw your own search area | LOW | HIGH | P3 |
| Voice input | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for v1.1 launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Zillow | Redfin | Homes.com | Our Approach |
|---------|--------|--------|-----------|--------------|
| NL search | ChatGPT app (Oct 2025) + on-site AI mode | Conversational search launched Nov 2025 (dedicated page) | Smart Search (NL filters) | Claude → structured params → live Supabase query; no separate app needed |
| Chat placement | Separate ChatGPT integration | Dedicated /conversational-search page | Inline search bar | Both: floating bubble (any page) + /search sidebar |
| Map | Split view default; price pins; draw area | Split view default; price pins; draw area | Map with pins | Split view + price pins for v1.1; draw area in v2 |
| Filter pills | 4 pills + More Filters (40+ options) | 5 pills + All Filters | Similar | 4 pills + More Filters — already built and correctly scoped |
| Search-as-you-move | Yes (auto by default) | Yes (toggle: "search as I move map") | Yes | Yes — already built; bounds → URL → re-query |
| AI result context | "We found 47 homes" | "Based on your search…" refinements | Basic | Claude writes human response + count; refinements when 0 results |
| Lead routing | Sold to highest bidder among agents | Agent referral fee to Redfin | Sold to agents | All exclusive to dad — core differentiator |
| Delaware MLS coverage | Full national | Full national | Full national | Full Delaware via BrightMLS IDX — parity for local market |

---

## Claude API Architecture for NL Search (verified, HIGH confidence)

Claude structured outputs (released Nov 2025, beta header `anthropic-beta: structured-outputs-2025-11-13`) are the correct mechanism for NL → filter translation.

**Pattern:**
```
POST /api/chat
Body: { messages: ConversationTurn[], currentFilters: Partial<SearchParams> }

Claude receives:
  - System prompt: Delaware geography, SimplyRETS param mapping, instructions to return JSON
  - User message: raw natural language query
  - Current filter state: what filters are already applied

Claude returns (structured output):
  {
    filters: Partial<SearchParams>,   // merge into current URL state via nuqs
    responseText: string,             // human-readable confirmation + result preview
    suggestions: string[] | null      // only populated when result count = 0
  }

Client:
  - Writes filters to nuqs (triggers re-render + server fetch)
  - Renders responseText in chat bubble
  - Renders suggestions as clickable chips if present
```

**Critical constraint:** Claude must NEVER receive listing data from Supabase. Claude translates intent → params only. The actual listings come from Supabase after params are applied. This prevents hallucination of listing details and keeps Claude's role narrow and correct.

---

## Sources

- [Zillow AI Natural Language Search announcement](https://investors.zillowgroup.com/investors/news-and-events/news/news-details/2023/Zillows-new-AI-powered-natural-language-search-is-a-first-in-real-estate/default.aspx) — Zillow official (HIGH confidence)
- [Redfin Conversational Search launch, Nov 2025](https://www.redfin.com/news/wp-content/uploads/2025/11/Redfin-Conversational-Search-Press-Release_final.pdf) — Redfin official (HIGH confidence)
- [Realtor.com Natural Language Search launch, Nov 2025](https://www.wavgroup.com/2025/11/25/realtor-com-unveils-two-game-changing-features-fly-around-360-and-natural-language-search/) — WAV Group (MEDIUM confidence)
- [Repliers AI NLP for Real Estate Listings](https://repliers.com/introducing-ai-powered-nlp-for-real-estate-listing-searches/) — Repliers official (HIGH confidence — MLS API vendor)
- [Claude Structured Outputs docs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) — Anthropic official (HIGH confidence)
- [SimplyRETS API Documentation](https://docs.simplyrets.com/api/index.html) — SimplyRETS official (HIGH confidence)
- [SimplyRETS API Tips and Tricks](https://simplyrets.com/blog/api-tips-and-tricks) — SimplyRETS official (HIGH confidence)
- [Map pin clustering — IDX Broker](https://support.idxbroker.com/hc/en-us/articles/34489822018331-Map-Pin-Clustering) — IDX Broker official (HIGH confidence)
- [Pins vs Clusters — product analysis](https://medium.com/@letstalkproduct/the-map-search-experience-pins-vs-clusters-b3d18d8159c5) — Let's Talk Product (MEDIUM confidence)
- [Using Maps as Core UX in Real Estate Platforms](https://raw.studio/blog/using-maps-as-the-core-ux-in-real-estate-platforms/) — Raw Studio (MEDIUM confidence)
- [nuqs — Type-safe search params for Next.js](https://nuqs.dev/) — nuqs official (HIGH confidence — already in codebase)
- [Real estate chatbot anti-patterns — BetterWho](https://betterwho.com/blog/ai-hallucinations-are-getting-worse-what-property-managers-need-to-know/) — BetterWho (MEDIUM confidence)
- [AI chatbot UX patterns for real estate](https://www.oscarchat.ai/blog/ai-chatbot-real-estate-websites-2026/) — Oscar Chat (MEDIUM confidence)
- [Pagination vs infinite scroll for SEO](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading) — Google Search Central (HIGH confidence)

---

*Feature research for: v1.1 Delaware Search Platform — structured filter search + AI chat*
*Researched: 2026-04-19*
*Supersedes: FEATURES.md dated 2026-04-06 for this specific milestone scope only. Prior file remains valid for full product roadmap planning.*
