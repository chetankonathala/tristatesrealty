---
status: partial
phase: 04-mls-data-pipeline
source: [04-VERIFICATION.md]
started: 2026-04-20T21:00:00Z
updated: 2026-04-20T21:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Compact MLS attribution footer on /listings
expected: Small copyright line "© YYYY Bright MLS. All rights reserved..." appears below the search results grid on the dark background
result: [pending]

### 2. Both SVG logos render on detail page
expected: Both Fair Housing and Bright MLS SVG logos appear side by side in the attribution footer at the bottom of any /listings/[id] page
result: [pending]

### 3. Coming Soon badge on a live ComingSoon listing
expected: A listing with status=ComingSoon shows a blue bg-blue-500 "COMING SOON" badge overlay on the card image and a blue status dot in the top-left
result: [pending]

### 4. Dual-channel lead notification (email + SMS)
expected: After submitting the contact form on any /listings/[id] page, the agent receives both a Resend email AND a Twilio SMS reading "New lead from [name] about [address]. Check your email for details."
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
