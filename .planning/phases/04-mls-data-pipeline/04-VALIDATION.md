---
phase: 4
slug: mls-data-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-20
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None configured (CLAUDE.md: "No test runner is configured yet") |
| **Config file** | None |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run build` (type-check + build) |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd-verify-work`:** Full build must be green with zero type errors
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------------|-----------|-------------------|--------|
| 04-01-01 | 01 | 1 | MLS-01 | Sync calls syncListings not syncSchellListings | build | `npm run build` | ⬜ pending |
| 04-01-02 | 01 | 1 | MLS-01 | Offset-loop pagination with lastId | build | `npm run build` | ⬜ pending |
| 04-02-01 | 02 | 1 | MLS-02 | Vercel crons configured correctly | config | `cat vercel.json \| grep cron` | ⬜ pending |
| 04-02-02 | 02 | 1 | MLS-02 | Delta sync compares modified timestamps | build | `npm run build` | ⬜ pending |
| 04-03-01 | 03 | 2 | MLS-03 | ListingCard shows days_on_market + attribution | build | `npm run build` | ⬜ pending |
| 04-04-01 | 04 | 2 | MLS-04 | Detail page photo gallery renders | build | `npm run build` | ⬜ pending |
| 04-05-01 | 05 | 2 | MLS-04 | Contact form sends Resend + Twilio | build | `npm run build` | ⬜ pending |
| 04-06-01 | 06 | 3 | MLS-05 | MlsAttribution uses constants not hardcoded | build | `npm run build` | ⬜ pending |
| 04-06-02 | 06 | 3 | MLS-06 | Coming Soon badge on applicable listings | build | `npm run build` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No test runner is configured. All verification relies on `npm run build` (TypeScript type checking) and manual QA.

*Existing infrastructure covers type-safety verification; manual QA required for visual/integration behaviors.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Full sync retrieves 4k-8k Delaware listings | MLS-01 | Requires live SimplyRETS API + BrightMLS IDX activation | `curl -X POST -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/listings/sync?mode=full` — verify response `pages > 1` and `upserted > 500` |
| Delta sync skips unchanged listings | MLS-02 | Requires DB comparison logic | Trigger delta sync twice; second run should log `0 changed out of N total` |
| Listing cards show all required fields | MLS-03 | Visual verification | Navigate to /search; verify each card shows photo, price, beds/baths/sqft, days on market, address, office attribution |
| Contact form emails + SMS reach dad | MLS-04 | Requires live Resend + Twilio | Submit contact form on /listings/[id]; verify email arrives at AGENT_EMAIL and SMS at AGENT_PHONE |
| MLS attribution correct on all surfaces | MLS-05 | Visual audit | Check listing card, detail page, search results footer — all must show Bright MLS copyright + Fair Housing logo |
| Coming Soon badge displays | MLS-06 | Requires live feed with ComingSoon listings | Filter listings by status=ComingSoon; verify badge renders |

---

## Acceptance Criteria Per Requirement

**MLS-01: Full Pagination Sync**
- [ ] `/api/listings/sync/route.ts` imports and calls `syncListings` from `@/lib/simplyrets/sync` (NOT `syncSchellListings`)
- [ ] Sync loops via `lastId` pagination with `limit=500` until `listings.length < 500`
- [ ] Status filter includes `["Active", "Pending", "ActiveUnderContract", "ComingSoon"]`
- [ ] Response JSON includes `{ ok: true, upserted: N, pages: N }`
- [ ] 200-300ms delay between pagination requests (rate limiting)
- [ ] `npm run build` passes with zero type errors

**MLS-02: Delta Sync + Cron Schedule**
- [ ] `vercel.json` has cron: `*/15 * * * *` → `/api/listings/sync?mode=delta`
- [ ] `vercel.json` has cron: `0 3 * * *` → `/api/listings/sync?mode=full`
- [ ] Delta sync compares `modified` timestamps; only upserts where API `modified` > DB `modified`
- [ ] Full sync marks listings not in API response as status "Closed"
- [ ] Sync function accepts `mode: 'delta' | 'full'` parameter
- [ ] Delta sync logs: `"[sync] delta: X changed out of Y total"`

**MLS-03: Enhanced Listing Card**
- [ ] `ListingCard` displays `days_on_market` ("New" if ≤7, else "X days")
- [ ] `ListingCard` displays compact providedBy attribution from listing office name
- [ ] Search results page has Bright MLS copyright + Fair Housing logo in footer
- [ ] `npm run build` passes

**MLS-04: Listing Detail Page + Contact → Dad**
- [ ] `/listings/[mlsId]/page.tsx` renders full photo gallery + property fields + contact form
- [ ] Contact form submission triggers Resend email to `AGENT_EMAIL`
- [ ] Contact form submission triggers Twilio SMS to `AGENT_PHONE`
- [ ] `sendNewLeadSms` function exists in `src/lib/notifications/twilio.ts`
- [ ] `/api/leads/route.ts` calls both email and SMS (fire-and-forget)
- [ ] `AGENT_PHONE` added to `.env.example`

**MLS-05: MLS Compliance Everywhere**
- [ ] `MlsAttribution` component uses `MLS_ATTRIBUTION.copyright(year)` from `src/lib/constants/mls.ts`
- [ ] `MlsAttribution` uses `MLS_ATTRIBUTION.providedBy(firm, agent?, phone?)` from constants
- [ ] `MlsAttribution` displays both Fair Housing logo AND Bright MLS logo
- [ ] Detail page renders `MlsAttribution` with correct listing office/agent data
- [ ] Listing card shows inline attribution
- [ ] Search results grid has MLS compliance footer

**MLS-06: Coming Soon Badge**
- [ ] `ListingCard` renders a "Coming Soon" badge when `status === "ComingSoon"`
- [ ] Badge uses gold accent color consistent with design system
- [ ] Detail page also shows Coming Soon badge prominently
- [ ] `npm run build` passes

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or manual instructions documented
- [ ] Sampling continuity: build check after every plan wave
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
