# IDX / MLS Data Integration Research

**Project:** Tri States Realty — personal agent website (Schell Brothers brokerage)
**Markets:** Delaware, Maryland, New Jersey, Pennsylvania
**MLS:** Bright MLS (BMLS) — the single regional MLS covering the entire Mid-Atlantic
**Researched:** 2026-04-06
**Overall confidence:** MEDIUM (licensing costs and refresh intervals from 2022-2024 sources; verify current rates with Bright MLS directly)

---

## 1. Bright MLS IDX Feed — Access, Licensing, Format, Frequency

### Who Controls Access

Bright MLS is the authoritative MLS for the DE/MD/NJ/PA market area — a single regional MLS spanning nearly 40,000 square miles of the Mid-Atlantic. There is no need to integrate multiple MLSs for the target markets.

### How to Get Access (Agent Path)

Individual agents do NOT apply directly for a raw data feed. The two paths are:

**Path A — Approved IDX Vendor (recommended for personal agent sites):**
1. Choose an approved Bright MLS IDX vendor from the official list.
2. The vendor handles the data licensing agreement with Bright MLS on your behalf.
3. You file an IDX authorization through the Bright MLS Accounts Policy portal to grant the vendor access to display your IDX data.
4. Process: submit online at `brightmls.com/article/12468` → approval takes 1-5 business days.
5. Bright MLS bills the agent $10/month (single site) or $12.50/month (multiple sites) directly — this is separate from whatever the vendor charges.

**Path B — Direct Brokerage Feed (not suitable for individual agents):**
- $7,500/year per product/feed + $200/brokerage above 20 brokerages.
- Requires direct licensing agreement with Bright MLS.
- Only viable for large brokerages or platform companies building their own infrastructure.
- Schell Brothers corporate may already hold this — worth asking internally before reinventing.

**Practical recommendation:** Use Path A. An approved vendor handles compliance automatically.

### Data Format: RETS is Dead, RESO Web API is Current

Bright MLS has fully adopted the RESO Web API:
- Protocol: REST over HTTP
- Query syntax: OData v4 (filters, ordering, paging)
- Response format: JSON
- Auth: OAuth 2.0 (client ID + client secret)
- Standard: RESO Data Dictionary v1.7, RESO Web API Core 1.0
- RETS (the old XML-based standard) is deprecated across 75%+ of US MLSs and should not be built against for new projects.

Bright MLS developer portal: `developer.brightmls.com`

### Update Frequency

- Industry standard for IDX middleware vendors: **15 minutes** from MLS update to your site.
- Many modern vendors claim near real-time (10-15 min) for status changes (active → pending → sold).
- Raw data via RESO Web API supports polling as frequently as the MLS permits; Bright MLS does not publish a hard floor, but vendors commonly poll every 15 minutes.
- There are no native webhooks in the IDX/RESO Web API model — all sync is polling-based. Some vendors wrap this in a pseudo-event model internally.
- 15-minute staleness is acceptable for consumer display. This is what Zillow operates at for IDX-sourced listings.

### Cost Summary (Bright MLS — Agent)

| Item | Cost | Notes |
|------|------|-------|
| Bright MLS IDX data fee (single site) | ~$10/month | Billed by Bright MLS directly to agent |
| Bright MLS IDX data fee (multi-site) | ~$12.50/month | Same billing path |
| IDX middleware vendor | $50–$120/month | See vendor comparison below |
| **Total estimated** | **$60–$133/month** | Verify current Bright MLS fee; may have changed since 2022 |

---

## 2. IDX Middleware Vendor Comparison

For a personal agent website, you need an approved middleware vendor. Direct RESO Web API access is not feasible without a brokerage-level data agreement.

### Approved Bright MLS Vendors

Confirmed approved as of 2024-2025:
- IDX Broker
- iHomefinder
- Showcase IDX
- Realtyna (WPL Pro)
- UltimateIDX (Buying Buddy)
- Web4Realty
- Diverse Solutions (acquired by Zillow Group years ago — see caveat below)

### Vendor Deep-Dive

#### IDX Broker
- **Pricing:** Lite ~$55/month, Platinum ~$90/month
- **API access:** Yes — free API key with any plan; returns leads, featured listings, MLS metadata, saved search links, widget source URLs
- **Developer integration:** JavaScript widgets embed on any site (WordPress, Squarespace, Webflow, custom). Full widget customization.
- **Customization depth:** HIGH — designed for developers who want full design control
- **Brokerage-specific filtering:** Yes — featured listings widget can be filtered to show only your own listings; Platinum has "Featured Listing Search Filter" and advanced hand-query editing to filter by MLS ID, brokerage, agent, status, property type
- **Map search:** Yes, interactive with polygon/draw tools
- **CRM:** Basic lead capture; integrates with third-party CRMs
- **Best for:** Developers building custom sites who need API access and widget flexibility

#### iHomefinder
- **Pricing:** Standard ~$49.95/month; higher tiers to ~$165/month for teams
- **Bright MLS:** Confirmed licensed IDX vendor
- **CRM:** Built-in; automated lead nurture via MarketBoost (email alerts, market reports, price change notifications)
- **Customization depth:** MEDIUM — turnkey solution, less raw API access than IDX Broker
- **Best for:** Agents who want a self-contained IDX + CRM without custom development
- **Caveat:** Less control if you want a fully custom UI

#### Showcase IDX
- **Pricing:** Essentials ~$84.95/month, Premium ~$119.95/month; annual plan = 10 months for 12
- **MLS data passthrough fee:** $0–$33/month depending on market (Bright MLS may add a fee)
- **CRM:** Built-in
- **Developer access:** JavaScript embed widgets; good documentation; REST-style controls through their control panel
- **Standout:** Strong SEO — generates indexable listing pages (not just client-side JS)
- **Map search:** Yes, polygon draw
- **Best for:** Agents who want good SEO AND a clean search UI without rebuilding everything

#### Realtyna (WPL Pro)
- **Pricing:** Tiered WordPress plugin; one-time license + annual renewal
- **Integration model:** WordPress plugin that pulls live data via RESO Web API
- **Best for:** WordPress-only sites; not suitable for custom non-WP stacks
- **Caveat:** More complex setup; slower support response than SaaS alternatives

#### SimplyRETS (developer-tier alternative)
- **Not an approved end-user IDX vendor** — SimplyRETS is a developer API layer that connects to YOUR MLS data feed (i.e., you still need a brokerage/direct feed agreement, not Path A agent access)
- Updates every hour or as frequently as MLS allows
- Excellent REST API, JSON responses, great developer experience
- **Only viable if Schell Brothers provides a data feed to you** — not a standalone option for an individual agent

### Recommendation for This Project

**Use IDX Broker (Platinum, $90/month)** if building a custom Next.js/React site with your own design:
- Free API key unlocks listing data, agent info, featured listing widgets
- JavaScript widgets can be embedded in any page as fallback while custom pages are built
- Best brokerage filtering controls for featuring Schell Brothers listings

**Use Showcase IDX ($84.95/month)** if you want faster time-to-launch and care about SEO:
- Generates server-side indexable listing pages
- Less custom development required
- Still has embed widgets for homepage integration

**Do NOT use** Diverse Solutions — absorbed by Zillow Group and effectively discontinued as an independent vendor for agent sites.

---

## 3. Featuring Schell Brothers Listings Within the IDX Feed

### The Mechanism

Within any IDX feed, listings are identified by `ListOfficeName`, `ListOfficeKey`, `ListAgentKey`, and `ListAgentMlsId` fields in the RESO data dictionary. You can filter these fields to surface only Schell Brothers listings.

### How to Implement

**With IDX Broker:**
- Featured Listings widget: set `officeName=Schell Brothers` filter
- Platinum plan "Edit by Hand Query" allows filtering by `officeId`, `agentId`, `mlsId` — exact RESO field names
- Create a dedicated "Schell Brothers Listings" search page with the filter pre-applied and saved as a permanent URL
- Homepage showcase widget can point at this filtered set

**With Showcase IDX:**
- Control panel allows saved searches with brokerage filters
- Display on homepage as a widget with "Featured New Homes" framing

**Critical distinction: Listing agent vs. buyer's agent display**
- When the agent is the LISTING agent: their contact info is already prominent (MLS required field)
- When the agent is acting as BUYER's agent: IDX rules require displaying the LISTING broker's info, not the buyer's agent's info — the buyer's agent cannot replace or obscure listing attribution
- This is a common misconception: you cannot make ALL listings look like YOUR listings. You can feature your own listings prominently and add general CTAs ("Contact me about this home") on all other listings.

### Practical Page Structure

```
Homepage:
  → "My Listings" section: filtered IDX widget showing only Schell Brothers / this-agent listings
  → Full MLS search widget (all Bright MLS listings)
  
/listings page:
  → Full IDX search with map, all Bright MLS listings
  → No brokerage filter — shows all available inventory
  
/my-listings page:
  → Filtered to Schell Brothers / agent listings only
  → Rich presentation, floor plans, virtual tours
```

---

## 4. Fair Housing Act Compliance — IDX Display

### Federal Requirements

The Fair Housing Act (42 U.S.C. §§ 3601–3619) prohibits discrimination based on:
- Race, color, national origin
- Religion
- Sex
- Familial status (families with children)
- Disability

For IDX display, this means:
- No discriminatory language in listing descriptions (the agent does not write these for IDX listings, but your own listings must comply)
- Search filters cannot be configured to de-emphasize or hide results based on protected class attributes
- School district filtering is allowed; "neighborhood demographics" filters are not
- Do not build any "filtering by diversity statistics" features

### NAR / Bright MLS Compliance Requirements

- REALTORS must complete Fair Housing/Anti-Bias training every 3 years (started Jan 1, 2025, deadline Dec 31, 2027)
- IDX display itself does not require special fair housing disclosures on each listing, but the agent is responsible for ensuring the site overall does not create a discriminatory user experience
- Approved IDX vendors (IDX Broker, Showcase IDX, etc.) build compliant search UI by default — they do not expose protected-class filters

### Practical Checklist

- [ ] Do not add custom search filters for school demographics, neighborhood ethnicity, or similar
- [ ] Listing descriptions pulled from MLS are the listing broker's responsibility for content compliance; your responsibility is not to add discriminatory editorial content on top
- [ ] Include a general Fair Housing statement in the site footer (standard practice, sometimes MLS-required)
- [ ] Equal Housing Opportunity logo in footer (standard IDX compliance expectation)

---

## 5. MLS Display Rules — Required Fields and Attribution

### Bright MLS IDX Rules (effective August 14, 2024)

The following are mandatory for any listing displayed under IDX authorization:

**On every listing detail page:**
- Listing broker/office name — must be displayed in a "reasonably prominent location" in a "readily visible color and typeface not smaller than the median used in the display of listing data"
- How to contact the listing broker (phone or website from MLS data)
- Identity of the advertising broker (the agent whose IDX authorization is being used — in this case, your name/brokerage)
- The Bright MLS attribution/disclaimer (exact wording supplied by Bright; goes in footer or listing page)

**On search results pages:**
- Listing office name must be visible per listing entry (can be abbreviated in thumbnail view but must be visible)
- 200-character or less displays (thumbnails, SMS-style) are exempt ONLY if they link directly to a full listing page that contains all required disclosures

**General site requirements:**
- Bright MLS must be able to access your site directly to monitor compliance (do not password-protect your IDX pages)
- Display only fields designated by Bright MLS — no prohibited fields in the feed should be shown
- Enable Bright's usage tracking service on any site displaying Bright data (typically a script tag or pixel provided by the vendor or Bright directly)

**What is prohibited:**
- Displaying listings of opted-out brokerages (Bright MLS manages the opt-out list; approved vendors handle filtering automatically)
- Displaying sold/off-market listings as if they are active
- Altering listing data (price, address, status) from what is in the MLS feed

### NAR Policy Statement 7.58 (governs all NAR-member MLSs including Bright)

- All IDX displays must be under the identity of the participant (your brokerage affiliation must be clear)
- You cannot display another participant's listing under your own branding in a way that obscures the listing firm
- Commingling IDX listings with non-MLS listings (FSBO, etc.) is subject to MLS rules — Bright MLS may require visual distinction or separation

---

## 6. Zillow Parity — Table Stakes Features for IDX Display

To keep visitors from clicking away to Zillow, the following features are non-negotiable in 2026:

### Search Interface

| Feature | Required | Notes |
|---------|----------|-------|
| Map-based search with zoom/pan | Yes | Polygon/draw-area search highly expected |
| Price range slider | Yes | Min/max with common preset brackets |
| Beds/baths filter | Yes | Min 1–5+ |
| Property type filter | Yes | Single-family, townhouse, condo, land |
| Square footage filter | Yes | Min/max |
| Status filter | Yes | Active, Pending, Coming Soon |
| Sort options | Yes | Newest, price high/low, beds, sqft |
| "Save search" with email alerts | Yes | Core lead capture mechanism |
| Listing detail page with photos | Yes | Full-screen gallery |
| Virtual tour / 3D walkthrough link | Recommended | Pass-through if in MLS data |
| School information | Recommended | Premium Showcase IDX; or Great Schools API |
| Walk Score / transit score | Optional | Third-party widget; not MLS-sourced |
| Mortgage calculator | Optional | Commonly expected; easy to add |
| Similar listings / recommended | Optional | IDX Broker and iHomefinder have this |

### Lead Capture (Table Stakes)

- Registration wall at N views or when requesting contact info (industry standard: 3–5 listings before soft gate)
- Save favorite listings (requires registration)
- Email alerts for saved searches
- "Contact agent about this listing" form on every listing page
- These are how IDX pays for itself — without lead capture, it is a cost center

### What Zillow Has That You Do Not Need to Match

- Zestimate (automated valuation) — Zillow's proprietary model; not licensable
- Zillow Preview (pre-market listings) — requires Zillow brokerage enrollment
- Rental listings — out of scope
- "Zillow Offer" / iBuyer — out of scope

---

## 7. Real-Time Sync Approaches

### Architecture Reality: No True Real-Time

IDX is not real-time. The MLS data pipeline is:

```
MLS agent enters/updates listing
→ Bright MLS database updated (near-instant)
→ IDX feed made available (near-instant)
→ Your vendor polls the feed (every 15 min typically)
→ Vendor's cache updated
→ Your site displays updated data (total lag: 15–30 min)
```

### Polling vs. Webhooks

**Webhooks:** Not available in standard IDX/RESO Web API for agent-level access. Some enterprise-tier direct feed integrations may support change-notification events, but this requires a brokerage-level direct agreement (Path B). Not available through approved IDX vendors.

**Polling (what actually happens):**
- Approved vendors poll Bright MLS on your behalf at defined intervals
- SimplyRETS: every 1 hour
- Showcase IDX: ~15 minutes (vendor documentation; verify directly)
- IDX Broker: ~15 minutes for status changes; full data sync nightly or near-daily for full listing details
- iHomefinder: ~15 minutes for active listing changes

### RESO Web API Replication Model

If building a custom integration with a direct feed (Path B or through a developer API like SimplyRETS):

```
Approach: Replicate-and-serve
1. Pull delta/change feed from RESO Web API using ModificationTimestamp filter
2. Store in your own database (PostgreSQL with PostGIS for geo queries)
3. Index for search (Elasticsearch or Typesense)
4. Serve listing pages from your own data
5. Schedule: every 15 min for status updates; every 24h for full sync

Approach: Pass-through API (no replication)
1. Each user request proxies to IDX vendor API
2. No local storage
3. Simpler, but slower page loads and vendor rate limits apply
```

For a personal agent site, replicate-and-serve at this scale is overkill. Use a vendor's hosted solution.

### Practical Recommendation: Use Vendor Caching

Let IDX Broker or Showcase IDX handle all sync. Their infrastructure:
- Maintains a replicated copy of the Bright MLS IDX feed
- Serves it from CDN-backed endpoints
- Handles status changes, price updates, new listings, delists
- You do not need to manage data freshness — the vendor does it

Your website calls their API or loads their widgets; the data is already fresh. This is the correct architecture for a personal agent site.

---

## Recommended Approach for Tri States Realty

### Decision: IDX Broker Platinum + Custom Next.js Site

**Rationale:**
1. You are building a custom site (not a template), so you need API access, not a turnkey IDX site
2. IDX Broker's free API + JavaScript widgets gives you maximum design freedom
3. Brokerage filtering (Schell Brothers listings) is best-supported in IDX Broker Platinum
4. Bright MLS coverage confirmed; IDX Broker is on the approved vendor list

**Implementation architecture:**

```
Next.js frontend
  ├── /listings         → IDX Broker iframe/widget (full MLS search)
  ├── /listings/[id]    → IDX Broker hosted detail page OR custom page via API
  ├── /my-listings      → IDX Broker API filtered by ListOfficeName: "Schell Brothers"
  └── /                 → Homepage featured listings widget (filtered to own listings)

IDX Broker (middleware)
  └── Polls Bright MLS IDX feed every ~15 min
  └── Serves REST API + JS widgets to your site
  └── Handles compliance (required fields, attribution, usage tracking)

Bright MLS
  └── Authorizes your IDX vendor subscription (~$10/month billed to you)
```

**Total monthly cost estimate:**
- Bright MLS IDX data fee: $10/month
- IDX Broker Platinum: $90/month
- **Total: ~$100/month**

### Gotchas and Warnings

**Gotcha 1: IDX authorization must come from the broker, not just the agent.**
Bright MLS requires that the participating broker authorize the IDX display. As a Schell Brothers agent, you must either (a) have Schell Brothers as your broker authorize your personal IDX application, or (b) confirm Schell Brothers already has a blanket authorization that covers agents. Do this before signing up for a vendor — the vendor cannot proceed without MLS authorization.

**Gotcha 2: You cannot brand all listings as "your" listings.**
MLS rules require listing broker attribution on every listing. You can display your contact info and a CTA ("Contact me about this home") on all listings, but the listing firm's name must be visible. Any design that visually suggests you listed a property you did not list violates Bright MLS rules.

**Gotcha 3: IDX Broker's API is for display, not data mining.**
The IDX Broker API provides listing data for display purposes only. You cannot extract, store, or redistribute MLS data in bulk. If you want to build market stats, neighborhood reports, or CMA tools, those require a separate data license (not IDX).

**Gotcha 4: Opt-outs exist — not all listings will appear.**
Listing agents or brokers can opt out of IDX display. These listings will simply not appear in your IDX feed. Nothing you build will surface them. This is expected behavior, not a bug.

**Gotcha 5: "Coming Soon" / pre-market listings are separate.**
Bright MLS has a "Coming Soon" status that is subject to specific display rules. Not all IDX configurations surface Coming Soon listings. IDX Broker Platinum supports them; verify the configuration.

**Gotcha 6: Usage tracking script is mandatory.**
Bright MLS requires that all sites displaying Bright IDX data enable Bright's usage tracking service. This is typically a script tag or pixel. Approved vendors usually inject this automatically, but verify it is active before launch or risk compliance violation.

**Gotcha 7: Sold/off-market data is limited under IDX.**
IDX policies generally restrict display of sold listings to a limited historical window (often 90 days or none). If you want a rich sold history for market reports or CMA tools, you need VOW (Virtual Office Website) access or a separate data license — both require additional authorization from Bright MLS.

**Gotcha 8: Schell Brothers builds new construction, not just resales.**
New construction listings in MLS may have different data fields, photo availability, and status progression (Pre-Construction → Active → Under Contract → Sold). IDX vendor widgets handle standard resale data well; new construction details (floor plan options, community maps, lot availability) are typically not in the MLS feed and would need to be manually curated on your site.

---

## Sources

- [Bright MLS IDX Products Page](https://www.brightmls.com/products/idx)
- [Bright MLS Approved IDX Vendors](https://support.brightmls.com/s/article/Bright-MLS-Approved-IDX-Vendors)
- [Bright MLS IDX Submission Instructions](https://www.brightmls.com/article/12468)
- [Bright MLS Rules Effective August 14, 2024 (PDF)](https://assets.ctfassets.net/1g8q1frp41ix/5TcMNhKRv6BE8blp6fKJZE/b06895b485f22ef9c7f2999dc4d4681c/Bright_MLS_Rules__Effective_Aug_14_2024_.pdf)
- [Bright MLS IDX Billing Details (PGCAR PDF)](https://pgcar.com/realtor_resources/docs/Bright-MLS-IDX-Billing-Details.pdf)
- [Bright MLS Developer Portal](https://developer.brightmls.com/)
- [IDX Broker Bright MLS Coverage](https://www.idxbroker.com/mls/bright-mls-bmls)
- [IDX Broker API Documentation](https://developers.idxbroker.com/idx-broker-api/)
- [IDX Broker Featured Listing Search Filter](https://www.idxbroker.com/features/featured-listing-search-filter)
- [iHomefinder Bright MLS Service Details](https://www.ihomefinder.com/resources/idx-coverage/bright-mls-idx-service-details/)
- [iHomefinder Platform Pricing](https://www.ihomefinder.com/platform-pricing/)
- [Showcase IDX Pricing](https://showcaseidx.com/pricing/)
- [Showcase IDX Bright MLS Coverage](https://www.seorealestatewagon.com/showcase-idx-for-your-wordpress-website-to-generate-leads-through-bright-mls/)
- [SimplyRETS Developer API](https://simplyrets.com/idx-developer-api)
- [RESO Web API Standard](https://www.reso.org/reso-web-api/)
- [RESO Web API Replication Guide](https://www.reso.org/moving-replication-reso-web-api/)
- [NAR IDX Policy Statement 7.58](https://www.nar.realtor/handbook-on-multiple-listing-policy/advertising-print-and-electronic-section-1-internet-data-exchange-idx-policy-policy-statement-7-58)
- [NAR Summary of 2025 MLS Changes](https://www.nar.realtor/about-nar/policies/summary-of-2025-mls-changes)
- [iHomefinder vs IDX Broker Comparison (2025)](https://realtycandy.com/ihomefinder-vs-idx-broker-a-comprehensive-2025-comparison/)
- [RETS vs RESO Web API 2026](https://oyelabs.com/rets-vs-reso-web-api-for-real-estate-platforms-in-2026/)
- [Zillow MLS Listing Access Standards](https://www.zillow.com/news/updating-zillows-listing-access-standards-for-todays-market/)
- [IDX Data Freshness — iHomefinder](https://www.ihomefinder.com/blog/agent-and-broker-resources/idx-feed-real-estate/)
