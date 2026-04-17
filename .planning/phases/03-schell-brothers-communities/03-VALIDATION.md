---
phase: 3
slug: schell-brothers-communities
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-16
---

# Phase 3 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None -- CLAUDE.md states "No test runner is configured yet" |
| **Config file** | N/A |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx tsc --noEmit && npm run build` |
| **Estimated runtime** | ~45 seconds (tsc ~15s, build ~30s) |

**Note:** No test runner (vitest, jest, etc.) is installed in this project. All automated verification uses TypeScript type checking (`npx tsc --noEmit`) and production build (`npm run build`) as the validation gates. These catch type errors, import resolution failures, and compilation issues. Runtime behavior is verified via the UAT checkpoint in Plan 05 Task 4.

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green (`npx tsc --noEmit && npm run build`)
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|--------|
| 3-01-01 | 01 | 1 | communities table | -- | N/A | file check | `test -f supabase/migrations/20260416300000_create_communities.sql && echo PASS` | pending |
| 3-01-02 | 01 | 1 | Heartbeat multi-state | -- | N/A | type check | `npx tsc --noEmit` | pending |
| 3-02-01 | 02 | 2 | community sync | T-03-04 | CRON_SECRET validation | type check | `npx tsc --noEmit` | pending |
| 3-02-02 | 02 | 2 | cron schedule | -- | N/A | file check | `grep -q "api/communities/sync" vercel.json && echo PASS` | pending |
| 3-03-01 | 03 | 2 | detail components (hero, overview, amenities) | T-03-07 | No dangerouslySetInnerHTML | type check | `npx tsc --noEmit` | pending |
| 3-03-02 | 03 | 2 | detail components (schools, HOA, floor plans) | T-03-08 | External links rel="noopener" | type check | `npx tsc --noEmit` | pending |
| 3-04-01 | 04 | 2 | YouTube facade + listings | T-03-12 | Video ID only (no URL) | type check | `npx tsc --noEmit` | pending |
| 3-04-02 | 04 | 2 | POI + map | T-03-11 | Token is NEXT_PUBLIC (public) | type check | `npx tsc --noEmit` | pending |
| 3-04-03 | 04 | 2 | Schedule a Tour modal | T-03-09, T-03-10 | Honeypot + Zod validation | type check | `npx tsc --noEmit` | pending |
| 3-05-00 | 05 | 3 | DB push | -- | N/A | checkpoint | Human confirms `supabase db push` success | pending |
| 3-05-01 | 05 | 3 | index page + JSON-LD | T-03-13 | XSS escape in JSON-LD | type check | `npx tsc --noEmit` | pending |
| 3-05-02 | 05 | 3 | detail page assembly | T-03-15 | try/catch in generateStaticParams | type check | `npx tsc --noEmit` | pending |
| 3-05-03 | 05 | 3 | OG image + sitemap + build | T-03-16 | Slugs from trusted data | build | `npm run build` | pending |
| 3-05-04 | 05 | 3 | UAT | -- | N/A | manual | Human visual + functional verification | pending |

*Status: pending / green / red / flaky*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| YouTube thumbnail -> iframe on click | SCHELL-03 | DOM interaction, no headless support | Open community page, click video thumbnail, verify YouTube iframe loads |
| Mapbox map renders community pin + POIs | SCHELL-05 | Canvas rendering | Open community page, verify dark map loads with correct community marker and category pins |
| Mobile LCP < 2s | Performance budget | Lighthouse CI not configured | Run Lighthouse mobile audit against community page; confirm LCP <= 2000ms |
| Tour form submission | SCHELL-07 | Requires running server + DB | Click "Schedule a Tour", fill form, submit, verify success state |
| supabase db push | Infrastructure | Requires Supabase credentials | Run `supabase db push`, verify communities table created |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands (using tsc/build, not vitest)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] No watch-mode flags
- [x] Feedback latency < 45s
- [x] `nyquist_compliant: true` set in frontmatter
- [x] Test infrastructure matches CLAUDE.md ("No test runner is configured yet")

**Approval:** ready for execution
