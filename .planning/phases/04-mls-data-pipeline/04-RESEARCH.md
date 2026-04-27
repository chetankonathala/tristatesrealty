# Phase 4: MLS Data Pipeline - Research

**Researched:** 2026-04-20
**Domain:** SimplyRETS API sync pipeline, Next.js dynamic routes, MLS compliance, lead routing
**Confidence:** HIGH

## Summary

Phase 4 extends the already-substantial Phase 2 codebase. The SimplyRETS client (`src/lib/simplyrets/client.ts`), sync logic (`sync.ts`), transform layer (`transform.ts`), listings table (36 columns, 16 indexes, RLS), listing detail page (`/listings/[mlsId]/page.tsx`), photo gallery, contact modal, MLS attribution component, and lead API route ALL already exist. The current sync route at `/api/listings/sync` erroneously calls `syncSchellListings()` (Schell community sync) instead of the SimplyRETS `syncListings()` function. The `syncListings()` function in `src/lib/simplyrets/sync.ts` already implements `lastId`-based pagination with 500-per-page batches.

This phase is primarily about: (1) wiring the sync route to the correct function and adding 15-minute cron + nightly full re-sync, (2) adding delta sync via `modified` timestamp comparison since SimplyRETS has no `lastModified` query parameter, (3) adding Coming Soon status support to the sync and card UI, (4) ensuring MLS compliance (Bright MLS copyright, Fair Housing, providedBy) on every surface including listing cards (currently missing), and (5) adding Twilio SMS to the existing Resend-only lead notification flow on the detail page contact form.

**Primary recommendation:** This is a wiring/completion phase, not a greenfield build. Audit every existing component for what's missing, then fill gaps surgically. Do not rebuild what Phase 2 already created.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MLS-01 | SimplyRETS sync uses offset-loop pagination to retrieve all Delaware listings (4k-8k) | `syncListings()` already implements lastId pagination with 500/page. Route needs rewiring from `syncSchellListings` to `syncListings`. Existing code is correct but disconnected. |
| MLS-02 | Listing sync runs every 15 minutes using lastModified delta; full re-sync nightly | SimplyRETS API has NO `lastModified` query param. Delta strategy: compare `modified` timestamps from API response against DB `modified` column. Vercel cron currently only runs nightly at 3am. Need 15-min cron added. |
| MLS-03 | Listing cards display photo, price, beds/baths/sqft, DOM, address, Bright MLS attribution on every card | `ListingCard` component exists but is missing: days_on_market display, Bright MLS attribution. `MlsAttribution` component exists but references Schell Brothers, not general MLS. |
| MLS-04 | Individual listing detail pages with full photo gallery, property details, contact form routing to dad | `/listings/[mlsId]/page.tsx` already exists with gallery, specs, description, features, price history, comps, location map, street view, MLS attribution, contact modal. Contact modal posts to `/api/leads`. Resend email sends to `AGENT_EMAIL`. Twilio SMS notification for leads is NOT wired. |
| MLS-05 | MLS compliance: Bright MLS copyright + Fair Housing logo + providedBy attribution on every surface | `MlsAttribution` component exists but is Schell-branded. `mls.ts` constants are correct. Need to generalize the attribution component and add it to listing cards (currently only on detail page). |
| MLS-06 | Coming Soon listings displayed with status badge | `ComingSoon` is already in the status enum (types, search params, transform). Not included in sync `status` filter array. ListingCard has no Coming Soon badge rendering. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Stack:** Next.js 16.2.2 App Router, React 19, TypeScript, Tailwind v4, Supabase, Clerk
- **Dark-only app** -- no light mode
- **Styling:** oklch CSS vars, Playfair Display + Montserrat, shadcn/ui with base-nova, `cn()` utility
- **Data flow:** SimplyRETS -> sync endpoint -> Supabase `listings` table. Server components use `src/lib/supabase/server.ts`. Client components use `src/lib/supabase/client.ts`. Never mix.
- **Search state:** URL-based via nuqs with Zod schema at `src/lib/schemas/search-params.ts`
- **MLS compliance:** Use constants from `src/lib/constants/mls.ts`. Fair Housing logo at `public/images/fair-housing-logo.svg`, Bright MLS logo at `public/images/bright-mls-logo.svg`
- **Migrations:** Always use `supabase migration new`; never edit DB directly
- **No test runner configured yet** -- CLAUDE.md explicitly states this
- **Cron auth:** `CRON_SECRET` validates Vercel cron calls
- **Environment vars:** `SIMPLYRETS_API_KEY`, `SIMPLYRETS_API_SECRET`, `RESEND_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_PHONE`, `AGENT_EMAIL`

## Existing Code Audit

### What Already Exists (DO NOT REBUILD)

| Component | Path | Status | Gaps |
|-----------|------|--------|------|
| SimplyRETS client | `src/lib/simplyrets/client.ts` | Complete | None -- `fetchProperties` and `fetchProperty` work correctly |
| SimplyRETS types | `src/lib/simplyrets/types.ts` | Complete | `ComingSoon` already in status enum |
| Transform layer | `src/lib/simplyrets/transform.ts` | Complete | Handles all 36+ columns including open house dates |
| Sync function | `src/lib/simplyrets/sync.ts` | Functional | Uses `lastId` pagination correctly. Missing: delta sync logic, ComingSoon in status filter, stale listing cleanup |
| Sync route | `src/app/api/listings/sync/route.ts` | BROKEN | Calls `syncSchellListings()` instead of `syncListings()`. Must be rewired. |
| Vercel cron | `vercel.json` | Partial | Only nightly at 3am. Needs 15-min schedule added. |
| Listings table | `supabase/migrations/20260413000001_create_listings.sql` | Complete | 36 columns, 16 indexes, RLS. No schema changes needed. |
| Search params | `src/lib/schemas/search-params.ts` | Complete | `ComingSoon` already in status enum |
| Listing card | `src/components/cards/listing-card.tsx` | Partial | Missing: days_on_market, MLS attribution, Coming Soon badge |
| Listing detail page | `src/app/listings/[mlsId]/page.tsx` | Near-complete | Has gallery, specs, features, comps, map, street view, MLS attribution, mobile sticky bar |
| Photo gallery | `src/components/listings/listing-gallery.tsx` | Complete | Desktop collage + mobile carousel + lightbox |
| Contact modal | `src/components/listings/contact-agent-modal.tsx` | Complete | Posts to `/api/leads`, pre-fills from Clerk user |
| Leads API | `src/app/api/leads/route.ts` | Complete | Zod validation, `createLead()`, fire-and-forget Resend email |
| Resend notifications | `src/lib/notifications/resend.ts` | Complete | `sendNewLeadAlert` sends to `AGENT_EMAIL` |
| Twilio module | `src/lib/notifications/twilio.ts` | Exists but not wired to leads | Only has `sendListingAlertSms` for saved searches, no `sendNewLeadSms` function |
| MLS attribution component | `src/components/listings/mls-attribution.tsx` | Partial | Hardcodes "Schell Brothers Licensed Agent", doesn't use `MLS_ATTRIBUTION.copyright()` or `providedBy()` from constants |
| MLS constants | `src/lib/constants/mls.ts` | Complete | `copyright()`, `providedBy()`, `FAIR_HOUSING_ALT`, `BRIGHT_MLS_LOGO_ALT` |
| Leads table | `supabase/migrations/20260415200000_create_leads.sql` | Partial | Missing `source` column for LEAD-02 (Phase 7 req, but worth adding now) |

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| next | 16.2.2 | App Router, API routes, ISR | Already installed |
| @supabase/supabase-js | ^2.102.1 | DB client | Already installed |
| resend | ^6.11.0 | Email delivery | Already installed |
| zod | ^4.3.6 | Validation | Already installed |
| react-hook-form | ^7.72.1 | Form handling | Already installed |
| nuqs | ^2.8.9 | URL search state | Already installed |

### No New Dependencies Required

This phase requires ZERO new npm packages. All necessary libraries are already installed. Twilio is used via raw REST API calls (no SDK), which is already implemented in `src/lib/notifications/twilio.ts`. [VERIFIED: package.json audit]

## Architecture Patterns

### Sync Pipeline Architecture

```
Vercel Cron (every 15 min)
  -> GET /api/listings/sync?mode=delta
     -> Authorization: Bearer ${CRON_SECRET}
     -> syncListings({ mode: 'delta' })
        -> fetchProperties({ lastId, limit: 500, status: [...] })
        -> Loop until listings.length < 500
        -> For delta: compare modified timestamps, skip unchanged
        -> Upsert changed rows to Supabase
        -> revalidateTag('listings')

Vercel Cron (nightly 3am)
  -> GET /api/listings/sync?mode=full
     -> syncListings({ mode: 'full' })
        -> Same loop but no modified check
        -> Also: mark stale listings (not seen in full sync) as inactive
```

### Delta Sync Strategy (CRITICAL)

SimplyRETS API does NOT have a `lastModified` query parameter. [VERIFIED: OpenAPI spec on GitHub shows no such parameter] The approach must be:

1. **Every 15-min sync:** Fetch ALL listings via lastId pagination (same as full sync in terms of API calls). For each batch, compare `src.modified` timestamp against `listings.modified` in DB. Only upsert rows where the API's `modified` > DB's `modified` (or row doesn't exist).
2. **Nightly full sync (3am):** Same pagination but upserts everything unconditionally. Additionally marks listings NOT returned by the API as stale/inactive (soft-delete via status change, not hard delete).
3. **Optimization:** Use the `X-Total-Count` header from the first request to log expected total. Track `modified` timestamps to skip upserts for unchanged listings (saves Supabase write ops).

**Why not use offset pagination?** The `lastId` approach is already implemented and is SimplyRETS's recommended method. The docs explicitly state: "When using lastId, the sort parameter will not work" -- but we don't need sorting during sync. [CITED: docs.simplyrets.com/topics/pagination-with-lastId]

### Vercel Cron Limits

Vercel Hobby plan: 2 cron jobs max, 1/day minimum frequency. Vercel Pro plan: up to 100 cron jobs, minimum 1-minute frequency. A 15-minute sync requires Pro plan. [ASSUMED -- verify Vercel plan]

The `vercel.json` cron syntax for 15-minute intervals:
```json
{
  "path": "/api/listings/sync?mode=delta",
  "schedule": "*/15 * * * *"
}
```

### Listing Detail Page Architecture

The detail page at `/listings/[mlsId]/page.tsx` is already a server component with ISR (`revalidate = 900`). It already renders:
- Photo gallery (collage desktop, carousel mobile, lightbox)
- Hero strip (price, address, beds/baths/sqft)
- Description, spec grid, features list
- Price history (empty -- no data source yet)
- Comparable sales
- Location map + street view
- MLS attribution
- Mobile sticky bar with contact trigger

**What needs adding/fixing:**
1. Contact form already works via `ContactAgentModal` -> `/api/leads` -> Resend email. Need to add Twilio SMS to the lead notification flow.
2. MLS attribution component needs to use proper `MLS_ATTRIBUTION.copyright()` and `MLS_ATTRIBUTION.providedBy()` from constants instead of hardcoded Schell Brothers text.
3. Bright MLS logo should appear alongside Fair Housing logo in the attribution section.

### Coming Soon Badge Pattern

```typescript
// In ListingCard -- add to the badges section after the existing isNew and Pending badges
{listing.status === "ComingSoon" && (
  <span className="rounded-sm bg-blue-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
    COMING SOON
  </span>
)}
```

The status dot color mapping also needs a ComingSoon entry:
```typescript
const statusColor =
  listing.status === "Active" ? "bg-green-500"
  : listing.status === "Pending" || listing.status === "ActiveUnderContract" ? "bg-[#F59E0B]"
  : listing.status === "ComingSoon" ? "bg-blue-500"
  : "bg-muted-foreground";
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pagination cursor | Custom offset counter | SimplyRETS `lastId` param | Already implemented, handles edge cases with deleted records |
| Email delivery | Raw SMTP | Resend SDK (already installed) | Deliverability, templates, tracking |
| SMS delivery | Twilio SDK | Raw REST calls (already implemented) | Keeps bundle small, already working for saved search alerts |
| Image gallery | Custom carousel from scratch | Existing `ListingGallery` component | Already handles desktop collage, mobile carousel, lightbox |
| Form validation | Manual checks | Zod + react-hook-form (already installed) | Already used in `ContactAgentModal` |

## Common Pitfalls

### Pitfall 1: Sync Route Calling Wrong Function
**What goes wrong:** The current `/api/listings/sync/route.ts` imports and calls `syncSchellListings` from `@/lib/schell/sync` instead of `syncListings` from `@/lib/simplyrets/sync`.
**Why it happens:** Phase 3 (Schell communities) overwrote the sync route to handle community sync.
**How to avoid:** The listings sync route must import from `@/lib/simplyrets/sync`. The communities sync already has its own route at `/api/communities/sync`.
**Warning signs:** If the sync returns community data structure (upserted/deactivated/communities/errors) instead of listings data structure (upserted/pages/changedMlsIds/durationMs), the wrong function is wired.

### Pitfall 2: SimplyRETS lastId Disables Sort
**What goes wrong:** If you try to use `sort` parameter alongside `lastId`, the sort is silently ignored.
**Why it happens:** SimplyRETS docs explicitly state "When using lastId, the sort parameter will not work."
**How to avoid:** Never pass `sort` in sync requests. Sorting happens in Supabase queries, not at the API level.
**Warning signs:** Listings appear in unexpected order despite sort param.

### Pitfall 3: Rate Limiting During Full Sync
**What goes wrong:** 8000 listings / 500 per page = 16 API calls in rapid succession. SimplyRETS allows max 5 concurrent requests per second.
**Why it happens:** The while loop fires requests as fast as possible.
**How to avoid:** Add a small delay (200-300ms) between pagination requests. The existing sync has no delay. With 16 pages and 300ms delay, total overhead is only ~5 seconds.
**Warning signs:** 429 status codes from SimplyRETS.

### Pitfall 4: MLS Attribution on Cards vs Detail Pages
**What goes wrong:** Bright MLS requires attribution on "every listing display." Cards without attribution violate IDX rules.
**Why it happens:** Developers add attribution to detail pages but forget listing cards in grids.
**How to avoid:** Add a compact Bright MLS attribution line below each listing card's content area, or add it as a footer to the search results grid (one attribution block for the entire grid is acceptable per most MLS rules).
**Warning signs:** MLS compliance audit flags.

### Pitfall 5: Stale Listings After Status Change
**What goes wrong:** A listing goes from Active to Closed in MLS but remains Active in Supabase.
**Why it happens:** Delta sync only processes listings returned by the API for Active/Pending/ActiveUnderContract/ComingSoon. Closed listings are no longer returned.
**How to avoid:** Nightly full sync must mark listings NOT present in the API response as stale. Query all mls_ids from DB, compare against all mls_ids returned by API, update missing ones to "Closed" or remove them.
**Warning signs:** Listing counts grow monotonically and never decrease.

### Pitfall 6: Vercel Function Timeout
**What goes wrong:** Full sync of 8k listings times out at 10s (Hobby) or 60s (Pro).
**Why it happens:** 16 API calls + 16 Supabase upserts in series.
**How to avoid:** `maxDuration: 300` is already set on the route (5 minutes). This requires Vercel Pro plan. With 300ms delays between pages: 16 pages * (API call ~1s + upsert ~0.5s + 0.3s delay) = ~29 seconds. Well within 300s.
**Warning signs:** Function invocation timeout errors in Vercel logs.

### Pitfall 7: ComingSoon Availability Varies by MLS
**What goes wrong:** Not all Bright MLS listings have Coming Soon status. The requirement says "subject to SimplyRETS live feed confirmation."
**Why it happens:** Coming Soon is an opt-in MLS feature. Some brokerages don't use it.
**How to avoid:** Include `ComingSoon` in the status filter array. If no Coming Soon listings exist, the feature gracefully shows nothing. Add a conditional badge only when `status === "ComingSoon"`.
**Warning signs:** Zero Coming Soon listings is not a bug -- it may be the reality of the data feed.

## Code Examples

### Rewired Sync Route
```typescript
// src/app/api/listings/sync/route.ts
import { NextResponse } from "next/server";
import { syncListings } from "@/lib/simplyrets/sync";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") ?? "delta";

  try {
    const result = await syncListings({ mode: mode as "delta" | "full" });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    console.error("[listings-sync] failed:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export const GET = POST;
```

### Delta Sync Logic
```typescript
// In syncListings() -- add modified timestamp comparison
// For delta mode: before upserting, check if row needs updating
if (mode === "delta") {
  // Fetch existing modified timestamps for this batch
  const mlsIds = listings.map((l) => Math.round(l.mlsId));
  const { data: existing } = await supabase
    .from("listings")
    .select("mls_id, modified")
    .in("mls_id", mlsIds);

  const existingMap = new Map(
    (existing ?? []).map((r) => [r.mls_id, r.modified])
  );

  // Filter to only changed listings
  const changed = listings.filter((l) => {
    const dbModified = existingMap.get(Math.round(l.mlsId));
    if (!dbModified) return true; // new listing
    if (!l.modified) return true; // no modified date, upsert anyway
    return new Date(l.modified) > new Date(dbModified);
  });

  if (changed.length === 0) continue; // skip this batch
  rows = changed.map(transformSimplyRetsListing);
}
```

### Proper MLS Attribution Component
```typescript
// Source: src/lib/constants/mls.ts patterns
import { MLS_ATTRIBUTION, FAIR_HOUSING_ALT, BRIGHT_MLS_LOGO_ALT } from "@/lib/constants/mls";

// Detail page attribution:
<p>{MLS_ATTRIBUTION.copyright(new Date().getFullYear())}</p>
<p>{MLS_ATTRIBUTION.providedBy(listingOfficeName, listingAgentName, listingAgentPhone)}</p>
<Image src="/images/fair-housing-logo.svg" alt={FAIR_HOUSING_ALT} ... />
<Image src="/images/bright-mls-logo.svg" alt={BRIGHT_MLS_LOGO_ALT} ... />

// Card-level attribution (compact):
<p className="text-[10px] text-muted-foreground mt-1">
  {MLS_ATTRIBUTION.providedBy(listing.listing_office_name ?? "Listing Office")}
</p>
```

### Twilio Lead SMS
```typescript
// New function to add to src/lib/notifications/twilio.ts
export async function sendNewLeadSms(lead: {
  name: string;
  listing_address?: string | null;
  community_name?: string | null;
}): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const agentPhone = process.env.AGENT_PHONE;
  if (!sid || !token || !from || !agentPhone) {
    console.warn("[twilio] credentials not set, skipping lead SMS");
    return;
  }

  const context = lead.listing_address ?? lead.community_name ?? "a listing";
  const body = `New lead from ${lead.name} about ${context}. Check your email for details.`;

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const params = new URLSearchParams({ To: agentPhone, From: from, Body: body });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  );

  if (!res.ok) {
    console.error("[twilio] lead SMS failed:", res.status, await res.text());
  }
}
```

### Vercel Cron Configuration
```json
{
  "crons": [
    {
      "path": "/api/listings/sync?mode=delta",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/listings/sync?mode=full",
      "schedule": "0 3 * * *"
    },
    {
      "path": "/api/communities/sync",
      "schedule": "0 2 * * *"
    }
  ]
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Offset pagination | lastId keyset pagination | SimplyRETS recommendation | More reliable for large datasets, handles deletes between pages |
| Full re-sync every time | Delta sync with modified comparison | Standard practice | Reduces DB writes by 90%+ on 15-min interval |
| SDK-heavy email/SMS | Resend SDK + raw Twilio REST | Already in codebase | Minimal bundle, maximum control |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Vercel Pro plan is active (required for 15-min cron + 300s function timeout) | Architecture Patterns | If Hobby plan: cron limited to daily, function timeout 10s. Sync would fail. |
| A2 | `AGENT_PHONE` env var will be set for Twilio SMS to dad | Code Examples | If not set: SMS notifications silently skip (graceful degradation already coded) |
| A3 | Single Bright MLS attribution line per search results grid (not per card) is sufficient for IDX compliance | Common Pitfalls | If per-card required: need to add attribution to every ListingCard individually. Safer to do per-card. |
| A4 | ComingSoon status may return zero listings from the Bright MLS feed | Common Pitfalls | Not a risk -- feature gracefully handles empty state. Requirement says "subject to live feed confirmation." |

## Open Questions (RESOLVED)

1. **Vercel Plan Tier** — RESOLVED: Proceeding with Pro plan assumption. `maxDuration: 300` and `*/15 * * * *` cron schedule kept. If Hobby tier, fall back to nightly-only sync and reduce maxDuration to 60.

2. **AGENT_PHONE Environment Variable** — RESOLVED: Added to `.env.example`. `sendNewLeadSms` gracefully skips with `console.warn` if `AGENT_PHONE` is unset — consistent with existing `twilio.ts` pattern.

3. **MLS Attribution Per-Card vs Per-Grid** — RESOLVED: Per-card compact `providedBy` attribution on every listing card + full Bright MLS copyright + Fair Housing + Bright MLS logo footer on the search results page. Safest IDX compliance approach.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| SimplyRETS API | MLS-01, MLS-02 | External service | N/A | None -- core dependency |
| Supabase | All | External hosted | N/A | None -- core dependency |
| Vercel Cron | MLS-02 | External service | N/A | Manual trigger via API |
| Resend | MLS-04 | External service | N/A | Console.warn and skip |
| Twilio | MLS-04 | External service | N/A | Console.warn and skip |

**Missing dependencies with no fallback:** None -- all services are external and already configured from Phase 2.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None configured (CLAUDE.md: "No test runner is configured yet") |
| Config file | None |
| Quick run command | `npm run lint` (ESLint only) |
| Full suite command | `npm run build` (type-check + build) |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MLS-01 | Sync retrieves all 4k-8k listings via offset-loop | Integration (requires live API) | Manual: `curl -X POST -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/listings/sync?mode=full` | N/A -- manual |
| MLS-02 | Delta sync runs every 15 min, full sync nightly | Config verification + integration | Verify: `cat vercel.json \| jq '.crons'` + manual sync trigger | N/A -- manual |
| MLS-03 | Listing cards show required fields + MLS attribution | Visual + build check | `npm run build` (type errors if props missing) | N/A -- visual |
| MLS-04 | Detail page renders gallery, fields, contact form -> dad | Visual + integration | Manual: navigate to `/listings/[id]`, submit contact form, verify email + SMS received | N/A -- manual |
| MLS-05 | Every listing surface shows Bright MLS copyright, Fair Housing, providedBy | Visual audit | Manual: check listing card, detail page, search results for attribution | N/A -- visual |
| MLS-06 | Coming Soon badge displays on applicable listings | Visual + type check | `npm run build` + manual: filter by status=ComingSoon | N/A -- visual |

### Acceptance Criteria Per Requirement

**MLS-01: Full Pagination Sync**
- [ ] `/api/listings/sync?mode=full` imports and calls `syncListings` from `@/lib/simplyrets/sync` (NOT `syncSchellListings`)
- [ ] Sync loops via `lastId` pagination with `limit=500` until `listings.length < 500`
- [ ] Status filter includes `["Active", "Pending", "ActiveUnderContract", "ComingSoon"]`
- [ ] Response JSON includes `{ ok: true, upserted: N, pages: N }` where N > 1 for Delaware feed
- [ ] 200-300ms delay between pagination requests to avoid rate limiting
- [ ] `npm run build` passes with zero type errors

**MLS-02: Delta Sync + Cron Schedule**
- [ ] `vercel.json` has cron entry: `*/15 * * * *` for `/api/listings/sync?mode=delta`
- [ ] `vercel.json` has cron entry: `0 3 * * *` for `/api/listings/sync?mode=full`
- [ ] Delta sync compares `modified` timestamps; only upserts rows where API `modified` > DB `modified`
- [ ] Full sync marks listings not returned by API as status "Closed" or removes them
- [ ] Sync function accepts `mode: 'delta' | 'full'` parameter
- [ ] Delta sync logs: `"[sync] delta: X changed out of Y total"`

**MLS-03: Enhanced Listing Card**
- [ ] `ListingCard` displays `days_on_market` (e.g., "12 days" or "New" if <= 7)
- [ ] `ListingCard` displays compact MLS attribution: `providedBy(listing_office_name)`
- [ ] `ListingSummary` type includes `listing_office_name` field (add to SUMMARY_FIELDS query)
- [ ] Search results page has Bright MLS copyright + Fair Housing logo footer
- [ ] `npm run build` passes

**MLS-04: Listing Detail Page + Contact -> Dad**
- [ ] `/listings/[mlsId]/page.tsx` continues to render all existing sections
- [ ] Contact form submission triggers Resend email to `AGENT_EMAIL`
- [ ] Contact form submission ALSO triggers Twilio SMS to `AGENT_PHONE`
- [ ] `sendNewLeadSms` function exists in `src/lib/notifications/twilio.ts`
- [ ] `/api/leads/route.ts` calls both `sendNewLeadAlert` (email) and `sendNewLeadSms` (SMS) fire-and-forget
- [ ] `AGENT_PHONE` added to `.env.example`

**MLS-05: MLS Compliance Everywhere**
- [ ] `MlsAttribution` component uses `MLS_ATTRIBUTION.copyright(year)` from constants (not hardcoded Schell text)
- [ ] `MlsAttribution` component uses `MLS_ATTRIBUTION.providedBy(firm, agent, phone)` from constants
- [ ] `MlsAttribution` displays both Fair Housing logo AND Bright MLS logo
- [ ] Detail page renders `MlsAttribution` with correct listing office/agent data
- [ ] Search results grid has MLS compliance footer
- [ ] Listing cards have compact attribution

**MLS-06: Coming Soon Badge**
- [ ] `syncListings` status filter array includes `"ComingSoon"`
- [ ] `ListingCard` renders blue "COMING SOON" badge when `status === "ComingSoon"`
- [ ] `ListingCard` status dot includes blue color for ComingSoon
- [ ] Search params schema already supports `ComingSoon` status (verified: it does)
- [ ] Search results correctly filter/display ComingSoon listings when selected

### Wave 0 Gaps

No test infrastructure to set up -- CLAUDE.md confirms no test runner. Validation is via:
- `npm run build` (TypeScript type-checking + Next.js build)
- `npm run lint` (ESLint)
- Manual integration testing (sync endpoint, contact form)

## Sources

### Primary (HIGH confidence)
- Codebase audit: `src/lib/simplyrets/` (client.ts, sync.ts, transform.ts, types.ts) -- direct file reads
- Codebase audit: `src/app/api/listings/sync/route.ts` -- confirmed calls syncSchellListings (wrong function)
- Codebase audit: `src/components/listings/mls-attribution.tsx` -- confirmed Schell-branded hardcoded text
- Codebase audit: `supabase/migrations/` -- confirmed schema, leads table missing source column
- SimplyRETS OpenAPI spec: [GitHub APIs-guru/openapi-directory](https://github.com/APIs-guru/openapi-directory/blob/main/APIs/simplyrets.com/1.0.0/swagger.yaml) -- confirmed no lastModified param, confirmed ComingSoon in status enum

### Secondary (MEDIUM confidence)
- [SimplyRETS pagination docs](https://docs.simplyrets.com/topics/pagination-with-lastId) -- lastId approach, 500 max per page
- [SimplyRETS IDX compliance docs](https://docs.simplyrets.com/topics/fields-and-features-for-idx-compliance) -- internetAddressDisplay, X-SimplyRETS-Last-Update header
- [SimplyRETS FAQ](https://simplyrets.com/faq) -- rate limits: 5 concurrent per second, daily maximum per plan
- [Bright MLS rules](https://aacar.com/wp-content/uploads/2025/02/2025-Bright-MLS-Rules-and-Regulations.pdf) -- listing firm attribution required on every display

### Tertiary (LOW confidence)
- Vercel cron limits per plan tier -- based on general knowledge, not verified against current Vercel docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and in use
- Architecture: HIGH -- sync pipeline already 80% built, patterns clear from codebase
- Pitfalls: HIGH -- discovered by direct code audit (wrong sync function import is a verified finding)
- MLS compliance: MEDIUM -- Bright MLS specific rules not fully verified from primary source
- Delta sync: MEDIUM -- SimplyRETS has no built-in delta param, strategy is sound but untested

**Research date:** 2026-04-20
**Valid until:** 2026-05-20 (stable -- SimplyRETS API is versioned, codebase is under our control)
