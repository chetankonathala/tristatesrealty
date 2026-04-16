# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Next.js, port 3000)
npm run build     # Production build
npm run lint      # ESLint (eslint.config.mjs, next config)

# Supabase local dev
supabase start    # Start local Supabase stack (port 54321 API, 54322 DB)
supabase stop
supabase db push  # Push migrations to remote
supabase migration new <name>   # Create new migration file
```

No test runner is configured yet.

## Architecture

**Stack:** Next.js 16.2.2 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (PostgreSQL + pgvector) · Clerk auth

### Data flow

1. **Listings source:** SimplyRETS API (Bright MLS IDX feed) → sync endpoint at `src/app/api/listings/sync/route.ts` → Supabase `listings` table. Runs on a 15-minute Vercel cron. On-demand revalidation at `/api/listings/revalidate`.
2. **Server reads:** Server components and Route Handlers use `src/lib/supabase/server.ts` (`createServerClient` with cookie forwarding). Client components use `src/lib/supabase/client.ts` (`createBrowserClient`). Never mix the two.
3. **Search state:** URL-based via `nuqs`. Zod schema at `src/lib/schemas/search-params.ts` validates all filter params. Server components read params directly; client components use nuqs hooks.

### Auth (Clerk)

- Middleware (`src/middleware.ts`) enforces two tiers:
  - `/agent/*` — requires `sessionClaims.metadata.role === "agent"` (stored in Clerk `publicMetadata`, NOT Clerk Organizations — this is a locked architectural decision)
  - `/dashboard/*`, `/favorites/*`, `/offers/*` — any authenticated user
- Auth state in server components via Clerk server helpers; in client components via Clerk hooks.
- Sign-in/sign-up pages live in the `(auth)` route group under `src/app/(auth)/`.

### Styling

- **Dark-only app.** `<html>` always has `class="dark"`. There is no light mode toggle.
- Tailwind CSS v4 with CSS variable tokens in `src/app/globals.css` using oklch color space. All semantic tokens (`--accent`, `--background`, `--card`, etc.) are defined in `:root` and mirrored in `.dark`.
- `--accent` (gold, oklch 0.735 0.115 80) is the brand color throughout.
- Font variables: `--font-playfair-display` (headings), `--font-montserrat` (body), `--font-sans` (Geist fallback). Applied via CSS variable classes in root layout.
- shadcn/ui with `base-nova` style and `cssVariables: true`. Add components via `npx shadcn add <component>`.
- Utility: `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge).

### Component organization

```
src/components/
  ui/          # shadcn primitives + custom UI atoms
  layout/      # Navbar, Footer, MobileMenu, SkipLink
  sections/    # Full-page homepage sections
  cards/       # ListingCard, CommunityCard
  map/         # MapContainer (react-map-gl, Mapbox dark-v11 style)
  motion/      # Framer Motion wrappers (FadeIn, ScrollReveal, etc.)
  listings/    # Search filters, map markers, detail components (Phase 2+)
```

### Mapbox

Uses `react-map-gl/mapbox` (v8). Always import CSS at the top of client map components:

```ts
import "mapbox-gl/dist/mapbox-gl.css"
```

Map token: `process.env.NEXT_PUBLIC_MAPBOX_TOKEN`. Default center `[-75.5, 39.0]` (Mid-Atlantic). Default style: `mapbox://styles/mapbox/dark-v11`. Clustering via `supercluster` + `use-supercluster`.

### Supabase / Database

- Migrations live in `supabase/migrations/`. Always create migrations with `supabase migration new`; never edit the DB directly.
- pgvector is enabled (first migration). The `listings` table (36 columns, 16 indexes, RLS enabled) is the core data store.
- The `open_house_date` column on `listings` is required for saved-search alert triggers — do not remove it.

### MLS compliance

IDX display rules require attribution on every listing. Use constants from `src/lib/constants/mls.ts`:
- `MLS_ATTRIBUTION.copyright(year)` — Bright MLS copyright line
- `MLS_ATTRIBUTION.providedBy(firm, agent?, phone?)` — listing attribution
- `FAIR_HOUSING_ALT` — alt text for the Equal Housing logo
- Fair Housing logo: `public/images/fair-housing-logo.svg`, Bright MLS logo: `public/images/bright-mls-logo.svg`

### Environment variables

Required (see `.env.example` for full list):
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`
- `SIMPLYRETS_API_KEY` / `SIMPLYRETS_API_SECRET`
- `RESEND_API_KEY`
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_PHONE`
- `CRON_SECRET` — validates Vercel cron calls to `/api/listings/sync` and `/api/saved-searches/notify`
