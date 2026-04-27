# Phase 5: Structured Search - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-27
**Phase:** 05-structured-search
**Areas discussed:** ZIP vs City Disambiguation, Sort — Days on Market, Delaware Location Presets, Map Rendering at 5k+ Pins

---

## ZIP vs City Disambiguation

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-detect (regex) | Test `/^\d{5}$/`; route ZIP to `postalCodes`, city to `cities`. One input, zero friction. | ✓ |
| Separate fields | Two distinct inputs for City and ZIP. Cleaner semantics, more UI complexity. | |
| Cities only | Keep everything writing to `cities`. ZIP support deferred. | |

**User's choice:** Auto-detect
**Notes:** Also selected Delaware-scoped validation — show non-blocking warning if ZIP isn't 19xxx or city isn't in DE whitelist.

| Validation Option | Description | Selected |
|-------------------|-------------|----------|
| DE-scoped validation | Warning toast for non-DE ZIPs or unknown city names. Non-blocking. | ✓ |
| Accept any free-text | No validation. Any string passes through. | |

---

## Sort — Days on Market

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, add dom-asc | Add `dom-asc` to sort enum. Sorts by `days_on_market` ASC (freshest). | ✓ |
| date-desc is enough | Keep "Newest" as proxy for fresh listings. No new sort needed. | |

**User's choice:** Add `dom-asc`
**Notes:** Ascending only (fewest days = freshest). No `dom-desc` needed.

| DOM direction | Description | Selected |
|---------------|-------------|----------|
| Ascending only | One new option: freshest listings first. | ✓ |
| Both asc and desc | Two options: New + Longest listed (potential deals). | |

---

## Delaware Location Presets

| Option | Description | Selected |
|--------|-------------|----------|
| Quick-pick chips | 8 preset chips below text input: Lewes, Rehoboth Beach, Wilmington, Dover, Newark, Middletown, Millsboro, Milton. | ✓ |
| Free-text only | No presets. Buyer types city name. Cleaner UI, more friction. | |

**User's choice:** Quick-pick chips

| Placement Option | Description | Selected |
|------------------|-------------|----------|
| Inside More Filters modal | Current location — stays as advanced filter. | ✓ |
| 5th pill on top bar | Location pill alongside Price/Beds/Baths/Type. More visible, Zillow-style. | |

**User's choice:** Inside More Filters modal (current position)

---

## Map Rendering at 5k+ Pins

| Option | Description | Selected |
|--------|-------------|----------|
| Keep supercluster + React markers | Supercluster collapses 5k pins to ~20–50 visible at any zoom. React renders only visible. No architecture change. | ✓ |
| Mapbox GL layer/source API | Full WebGL layer — handles 100k+ points natively. Required for unzoomed raw pins. Complex interaction handling. | |

**User's choice:** Keep supercluster + React markers

| Default viewport | Description | Selected |
|------------------|-------------|----------|
| Statewide default, restore from URL | Zoom ~9 centered on DE. Restore bounds from URL param on mount. | ✓ |
| Attempt geolocation first | navigator.geolocation → center on user. Falls back to statewide. Adds permission prompt. | |

**User's choice:** Statewide default, restore from URL

---

## Claude's Discretion

- Exact DE_CITIES whitelist content beyond the 8 preset chips
- Warning toast styling and copy
- Cluster bubble count display threshold
- `dom-asc` label capitalization and sort position in dropdown

## Deferred Ideas

- Mapbox GL layer/source API for raw 5k pin rendering
- `dom-desc` sort option (longest-listed as deals)
- Location as a 5th top-bar filter pill
- Geolocation-based map default
