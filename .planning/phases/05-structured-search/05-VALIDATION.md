---
phase: 5
slug: structured-search
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-27
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + Playwright (existing) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm run test` |
| **Full suite command** | `npm run test && npm run build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test`
- **After every plan wave:** Run `npm run test && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | SEARCH-01 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |
| 05-01-02 | 01 | 1 | SEARCH-04 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |
| 05-02-01 | 02 | 1 | SEARCH-02 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |
| 05-02-02 | 02 | 1 | SEARCH-02 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |
| 05-03-01 | 03 | 2 | SEARCH-03 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |
| 05-04-01 | 04 | 2 | SEARCH-04 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |
| 05-04-02 | 04 | 2 | SEARCH-04 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test framework installation needed — vitest and build pipeline are already configured.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| ZIP auto-routes to postalCodes vs cities param | SEARCH-02 | URL param inspection in browser | Type a 5-digit ZIP (e.g. 19958) → URL must show `postalCodes=19958`; type "Lewes" → URL must show `cities=Lewes` |
| Delaware city preset chips appear and toggle | SEARCH-02 | Visual + interaction | Open LocationSearch → verify 8 chips appear; click "Lewes" → chip disappears and `cities=Lewes` in URL |
| Filter pill popovers open per-pill | SEARCH-01 | Visual + interaction | Click "Price" pill → PriceRangeSlider popover opens; click "Beds" → BedsBathsSelector opens; click outside → closes |
| Supercluster map renders 5k+ pins without degradation | SEARCH-03 | Performance + visual | Load full listing set → zoom out to Delaware state view → clusters should appear; zoom in → expand to individual pins; no browser jank |
| Page resets to 1 when filters change | SEARCH-04 | URL inspection | Navigate to page 3 → change any filter → URL `page` param resets to null/1 |
| Map bounds restore from URL on mount | SEARCH-03 | URL inspection | Set map viewport → copy URL → reload → map should restore to same bounds |
| Sort "Days on Market" works end-to-end | SEARCH-04 | Visual + data | Select "Days on Market" from sort dropdown → listings reorder by days_on_market ASC |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
