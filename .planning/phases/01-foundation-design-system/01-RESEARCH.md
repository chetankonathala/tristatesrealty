# Phase 1: Foundation & Design System - Research

**Researched:** 2026-04-06
**Domain:** Next.js project setup, Tailwind CSS v4 design tokens, shadcn/ui theming, Clerk auth, Supabase, Vercel deployment
**Confidence:** HIGH

## Summary

Phase 1 sets up a greenfield Next.js project with a luxury dark design system deployed to Vercel. The most critical finding is that **Next.js is now at version 16.2.2** (not 15 as stated in STACK.md). Running `npx create-next-app@latest` will install Next.js 16. Key differences: `middleware.ts` is deprecated in favor of `proxy.ts`, Turbopack is the default bundler, and all dynamic APIs (`params`, `searchParams`, `cookies()`, `headers()`) are async. The App Router, ISR, RSC, and Metadata API all work the same way -- this is safe to adopt.

Tailwind CSS v4 uses a CSS-first configuration model with `@theme` directive instead of `tailwind.config.js`. shadcn/ui fully supports Tailwind v4 with `@theme inline` for mapping CSS variables to utility classes. The luxury dark palette (#0A0A0A / #141414 / #C9A84C) maps cleanly to shadcn's semantic token system. Framer Motion is now at v12.38 (the `motion` package) and works with Next.js via `"use client"` wrapper components.

**Primary recommendation:** Use Next.js 16 (current stable), Tailwind v4 CSS-first config, shadcn/ui with OKLCH color tokens, and structure the project with `src/` directory from the start.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | Next.js 15 App Router + TypeScript + Tailwind + ESLint | Use Next.js 16.2.2 (current stable). `create-next-app@latest` sets up App Router + TS + Tailwind v4 + ESLint automatically. |
| INFRA-02 | Supabase configured (PostgreSQL + pgvector) | Supabase CLI for local dev + migrations. Enable pgvector via `create extension if not exists vector with schema public;` |
| INFRA-03 | Clerk authentication (buyer + agent) | `@clerk/nextjs` v7.0.11. Use `proxy.ts` (Next.js 16) with `createRouteMatcher` for role-based route protection. |
| INFRA-04 | Vercel deployment + custom domain | Connect GitHub repo, add env vars per environment, configure DNS A/CNAME records for tristatesrealty.com |
| INFRA-05 | AWS Lambda for background jobs | Phase 1 scope: environment setup only (IAM role, Lambda function shell, env vars). No actual jobs yet. |
| INFRA-06 | Environment configuration for all API keys | `.env.local` for dev, Vercel environment variables for production. Documented env var inventory below. |
| DS-01 | Luxury dark design system | Tailwind v4 `@theme inline` with CSS custom properties. shadcn/ui dark-first with custom OKLCH tokens. |
| DS-02 | Mobile-first responsive layout | Tailwind v4 default breakpoints (sm/md/lg/xl/2xl). No customization needed. |
| DS-03 | Core component library | 15 components from UI-SPEC built on shadcn/ui primitives (button, input, select, dialog, sheet, badge, skeleton, toast, separator). |
| DS-04 | Animated page transitions + scroll reveals | Framer Motion v12 via `"use client"` wrapper components. AnimatePresence for route transitions, useInView for scroll reveals. |
| DS-05 | Core Web Vitals green | next/font for font loading, next/image for hero, RSC for zero-JS sections, code-split modals/sheets. Target: Lighthouse > 90. |
</phase_requirements>

## Standard Stack

### CRITICAL: Version Correction

STACK.md recommends "Next.js 15" but **Next.js 16.2.2 is the current stable release** (as of April 2026). `npx create-next-app@latest` installs Next.js 16. Key migration notes:
- `middleware.ts` deprecated, renamed to `proxy.ts` (middleware.ts still works but will be removed in future)
- Turbopack is the default bundler (no config needed)
- All `params`, `searchParams`, `cookies()`, `headers()` must be `await`ed (async)
- `tailwindcss-animate` deprecated in favor of `tw-animate-css`
- React Compiler support built-in (optional, not enabled by default)
- Node.js 20.9+ required

Similarly, STACK.md says "Framer Motion v11" but **Framer Motion is now v12.38.0** (published as both `framer-motion` and `motion` packages, same version).

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.2 | Framework | Current stable. App Router, RSC, ISR, Turbopack default. |
| react / react-dom | 19.2.x | UI library | Bundled with Next.js 16. View Transitions, Activity, useEffectEvent. |
| typescript | 5.x | Type safety | Required by Next.js 16 (minimum 5.1.0) |
| tailwindcss | 4.2.2 | Utility CSS | CSS-first config via @theme, automatic content detection, 6-12KB gzipped output |
| @clerk/nextjs | 7.0.11 | Authentication | Buyer + agent roles. Native Next.js 16 App Router support. |
| @supabase/supabase-js | 2.102.1 | Database client | PostgreSQL + pgvector + Realtime + Storage |
| @supabase/ssr | 0.10.0 | SSR helpers | Cookie-based auth for Next.js server components |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| framer-motion | 12.38.0 | Animations | Page transitions, scroll reveals, card hovers, modal enter/exit |
| lucide-react | 1.7.0 | Icons | All UI icons. Tree-shakeable. |
| tw-animate-css | 1.4.0 | CSS animations | Replaces tailwindcss-animate for shadcn/ui components in Tailwind v4 |
| mapbox-gl | 3.21.0 | Maps | Dark map style, custom markers. Client-only (SSR: false). |
| react-map-gl | 8.1.0 | React wrapper for Mapbox | Controlled map component with hooks. |
| zod | latest | Schema validation | Form validation, API input validation |
| react-hook-form | latest | Form management | Contact forms, search filters |
| @hookform/resolvers | latest | RHF + Zod bridge | Connect Zod schemas to react-hook-form |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Next.js 16 | Next.js 15 (pinned) | Would miss Turbopack perf, Cache Components. No reason to pin old version for greenfield. |
| framer-motion | motion (same package) | Both names resolve to same code. Use `framer-motion` for broader ecosystem compatibility. |
| react-map-gl | Raw mapbox-gl | react-map-gl adds controlled component pattern + hooks. Worth the 15KB for DX. |
| tw-animate-css | tailwindcss-animate | tailwindcss-animate is deprecated with Tailwind v4. Must use tw-animate-css. |

**Installation:**
```bash
# Create project
npx create-next-app@latest tristatesrealty --typescript --tailwind --eslint --app --src-dir

# UI + Animation
npm install framer-motion lucide-react
npx shadcn@latest init

# Database + Auth
npm install @supabase/supabase-js @supabase/ssr
npm install @clerk/nextjs

# Maps
npm install mapbox-gl react-map-gl
npm install -D @types/mapbox-gl

# Forms + Validation
npm install zod react-hook-form @hookform/resolvers

# Supabase CLI (for local dev + migrations)
npm install -D supabase
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout: ClerkProvider, fonts, dark class
│   ├── page.tsx             # Homepage shell
│   ├── globals.css          # Tailwind @theme, CSS variables, shadcn tokens
│   ├── (marketing)/         # Public pages group
│   │   └── page.tsx         # Homepage
│   ├── (auth)/              # Auth pages group
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   └── agent/               # Agent-only routes (protected by proxy.ts)
│       └── layout.tsx
├── components/
│   ├── ui/                  # shadcn/ui primitives (button, input, dialog, etc.)
│   ├── layout/              # Navbar, Footer, MobileMenu
│   ├── cards/               # ListingCard, CommunityCard
│   ├── map/                 # MapContainer (client component)
│   └── motion/              # Framer Motion wrappers (FadeIn, ScrollReveal, PageTransition)
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser client
│   │   ├── server.ts        # Server client (uses @supabase/ssr)
│   │   └── middleware.ts    # Supabase auth refresh helper
│   ├── utils.ts             # cn() helper, shared utilities
│   └── fonts.ts             # next/font/google declarations
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript type definitions
└── proxy.ts                 # Clerk middleware (Next.js 16 naming)
supabase/
├── config.toml              # Supabase local config
├── migrations/
│   └── 00001_enable_pgvector.sql
└── seed.sql                 # Optional seed data
```

### Pattern 1: Tailwind v4 CSS-First Design Tokens

**What:** Define all design tokens as CSS custom properties in `globals.css`, then map them to Tailwind utilities via `@theme inline`.

**When to use:** Always. This is the Tailwind v4 + shadcn/ui standard approach.

**Example:**
```css
/* src/app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

/* Custom variant for manual dark mode control */
@custom-variant dark (&:is(.dark *));

/* --- Design Tokens (from UI-SPEC) --- */
:root {
  /* Since this is dark-first (no light mode), define tokens directly */
  --background: oklch(0.145 0 0);          /* #0A0A0A */
  --foreground: oklch(0.965 0.005 85);     /* #F5F5F0 */
  --card: oklch(0.205 0 0);               /* #141414 */
  --card-foreground: oklch(0.965 0.005 85);
  --muted: oklch(0.245 0 0);              /* #1A1A1A */
  --muted-foreground: oklch(0.665 0 0);   /* #A3A3A3 */
  --accent: oklch(0.735 0.115 80);        /* #C9A84C */
  --accent-foreground: oklch(0.145 0 0);  /* Dark text on gold */
  --accent-hover: oklch(0.775 0.115 80);  /* #D4B85E */
  --accent-muted: oklch(0.735 0.115 80 / 0.1); /* 10% gold */
  --border: oklch(0.305 0 0);             /* #262626 */
  --border-hover: oklch(0.365 0 0);       /* #333333 */
  --destructive: oklch(0.535 0.22 25);    /* #DC2626 */
  --destructive-foreground: oklch(0.965 0.005 85);
  --success: oklch(0.545 0.165 150);      /* #16A34A */
  --ring: oklch(0.735 0.115 80 / 0.5);   /* Gold at 50% for focus */
  --input: oklch(0.305 0 0);
  --primary: oklch(0.735 0.115 80);       /* Gold = primary */
  --primary-foreground: oklch(0.145 0 0);
  --secondary: oklch(0.205 0 0);          /* Card color */
  --secondary-foreground: oklch(0.965 0.005 85);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.965 0.005 85);
  --radius: 0.25rem;                      /* 4px - sharp luxury feel */
}

/* Map CSS vars to Tailwind utilities */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent-hover: var(--accent-hover);
  --color-accent-muted: var(--accent-muted);
  --color-border: var(--border);
  --color-border-hover: var(--border-hover);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --radius: var(--radius);
  /* Fonts */
  --font-display: var(--font-playfair-display);
  --font-body: var(--font-montserrat);
}
```

**Source:** [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4), [shadcn/ui Theming docs](https://ui.shadcn.com/docs/theming)

### Pattern 2: Dark-First (No Toggle)

**What:** Set `<html class="dark">` permanently. No theme provider or toggle needed.

**When to use:** This project. The luxury dark aesthetic is the brand identity, not a preference.

**Example:**
```tsx
// src/app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import { playfairDisplay, montserrat } from "@/lib/fonts";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${playfairDisplay.variable} ${montserrat.variable}`}>
      <body className="bg-background text-foreground font-body antialiased">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
```

### Pattern 3: Framer Motion Client Wrappers

**What:** Create reusable `"use client"` wrapper components for Framer Motion animations that can be composed into Server Components.

**When to use:** Every animation. Framer Motion requires DOM access and cannot run in Server Components.

**Example:**
```tsx
// src/components/motion/fade-in.tsx
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

```tsx
// src/components/motion/page-transition.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### Pattern 4: Mapbox GL SSR-Safe Container

**What:** Dynamic import with `ssr: false` for Mapbox GL, which requires the `window` object.

**When to use:** Every map instance.

**Example:**
```tsx
// src/components/map/map-container.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  variant?: "full-page" | "embedded" | "mini";
}

export function MapContainer({
  center = [-75.5, 39.0],
  zoom = 8,
  className,
  variant = "embedded",
}: MapContainerProps) {
  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{ longitude: center[0], latitude: center[1], zoom }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      className={className}
      style={{
        height: variant === "full-page" ? "calc(100vh - 72px)"
             : variant === "embedded" ? "400px"
             : "200px",
      }}
    >
      <NavigationControl position="top-right" />
    </Map>
  );
}
```

Then in a page (which can be a Server Component):
```tsx
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("@/components/map/map-container").then(mod => mod.MapContainer),
  { ssr: false, loading: () => <div className="bg-muted animate-pulse" style={{ height: 400 }} /> }
);
```

### Pattern 5: Next.js 16 Font Optimization

**What:** Use `next/font/google` with variable fonts, subset to Latin, and expose as CSS variables for Tailwind.

**Example:**
```tsx
// src/lib/fonts.ts
import { Playfair_Display, Montserrat } from "next/font/google";

export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-playfair-display",
  display: "swap",
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-montserrat",
  display: "swap",
});
```

**Source:** [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts)

### Pattern 6: Clerk + Next.js 16 Proxy (Middleware)

**What:** Use `proxy.ts` (Next.js 16 naming) with Clerk's `createRouteMatcher` for role-based access.

**Example:**
```tsx
// src/proxy.ts (Next.js 16) OR src/middleware.ts (Next.js <=15)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAgentRoute = createRouteMatcher(["/agent(.*)"]);
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/favorites(.*)", "/offers(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isAgentRoute(req)) {
    await auth.protect({ role: "org:agent" });
  } else if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

**Note:** For Next.js 16, the file is `proxy.ts`. If using `middleware.ts`, it still works but is deprecated. The function export name is `default` (unchanged).

### Anti-Patterns to Avoid

- **Importing Framer Motion in Server Components:** Always use `"use client"` boundary. Create wrapper components, don't scatter `"use client"` across page files.
- **Using `tailwind.config.js` with Tailwind v4:** Tailwind v4 uses CSS-first configuration. The JS config file is a v3 pattern. Use `@theme` in `globals.css`.
- **Using `tailwindcss-animate` with Tailwind v4:** Deprecated. Use `tw-animate-css` instead.
- **Rendering Mapbox GL server-side:** Will crash. Always use `dynamic(() => import(...), { ssr: false })`.
- **Hardcoding hex colors instead of design tokens:** Use `bg-background`, `text-accent`, etc. Never `bg-[#0A0A0A]`.
- **Using `.dark` selector for overrides when dark-first:** Since this site is always dark, define tokens once in `:root`. No `.dark` selector needed unless you plan to add a light mode later.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| UI primitives (button, dialog, sheet) | Custom button/modal/dropdown | shadcn/ui components | Accessibility, keyboard nav, focus management built-in |
| Font loading | Manual `@font-face` + preload tags | `next/font/google` | Auto-subsetting, self-hosting, font-display, CLS prevention |
| Image optimization | Custom responsive image component | `next/image` | WebP/AVIF conversion, lazy loading, blur placeholders, srcset |
| CSS animation utilities | Custom keyframes | tw-animate-css | shadcn/ui components depend on these animation classes |
| Map component | Raw `mapbox-gl` DOM manipulation | `react-map-gl` | Controlled component pattern, React lifecycle integration |
| Auth middleware | Custom JWT parsing | `@clerk/nextjs` clerkMiddleware | Session management, token refresh, CSRF, role checking |
| Form validation | Manual state + regex | zod + react-hook-form | Type inference, error messages, async validation |
| Toast notifications | Custom notification system | shadcn/ui toast (Sonner) | Queue management, auto-dismiss, stacking, accessibility |

**Key insight:** Phase 1 is infrastructure. Every minute spent building custom solutions for solved problems is a minute not spent on the 15 components and design system that actually need custom attention.

## Common Pitfalls

### Pitfall 1: Tailwind v4 Config Confusion
**What goes wrong:** Developer creates `tailwind.config.ts` (v3 pattern) and wonders why custom colors don't work.
**Why it happens:** Most tutorials and AI training data reference Tailwind v3 patterns.
**How to avoid:** All customization goes in `globals.css` via `@theme inline` and `:root` CSS variables. No `tailwind.config.ts` file needed for a new project.
**Warning signs:** File named `tailwind.config.ts` in the project root.

### Pitfall 2: shadcn/ui OKLCH Color Format
**What goes wrong:** Colors defined as hex or HSL in CSS variables don't work with shadcn opacity modifiers.
**Why it happens:** shadcn/ui with Tailwind v4 expects OKLCH format for color tokens.
**How to avoid:** Convert all hex colors to OKLCH values. Use the OKLCH color picker or CSS `oklch()` function. The `@theme inline` mapping handles the rest.
**Warning signs:** `bg-accent/50` opacity modifier not working.

### Pitfall 3: Next.js 16 Async APIs
**What goes wrong:** Build fails with "params is not iterable" or "cannot read property of Promise".
**Why it happens:** Next.js 16 made `params`, `searchParams`, `cookies()`, `headers()` all async.
**How to avoid:** Always `await` these: `const { slug } = await params;`, `const query = await searchParams;`
**Warning signs:** TypeScript errors about Promise types on page props.

### Pitfall 4: Framer Motion Layout Shift
**What goes wrong:** Scroll-triggered animations cause CLS > 0.1, failing DS-05.
**Why it happens:** Animating `height`, `width`, `top`, or `left` triggers layout recalculation.
**How to avoid:** Only animate `opacity` and `transform` (translate, scale). Use `will-change: transform, opacity`. Set `viewport.once: true` so elements don't re-animate.
**Warning signs:** CLS spikes when scrolling on Lighthouse mobile audit.

### Pitfall 5: Mapbox GL CSS Not Loaded
**What goes wrong:** Map renders but controls are unstyled, markers misplaced.
**Why it happens:** Forgot to import `mapbox-gl/dist/mapbox-gl.css`.
**How to avoid:** Import the CSS in the map client component file.
**Warning signs:** Map container renders but UI elements overlap incorrectly.

### Pitfall 6: Clerk Keyless Mode in Production
**What goes wrong:** Auth works in dev but fails in production.
**Why it happens:** Clerk's keyless mode auto-generates temporary keys for development. Production requires real API keys.
**How to avoid:** Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in Vercel environment variables before first production deploy.
**Warning signs:** Auth redirects to an unexpected Clerk URL.

### Pitfall 7: Font Loading CLS
**What goes wrong:** Text flashes with system font then shifts when custom font loads.
**Why it happens:** Font files too large or not preloaded.
**How to avoid:** Use `next/font/google` with `display: "swap"` and `subsets: ["latin"]`. Both Playfair Display and Montserrat support variable fonts. Subsetting to Latin + specific weights keeps total font payload under 100KB.
**Warning signs:** Visible font swap on page load, CLS > 0.1 on Lighthouse.

## Code Examples

### shadcn/ui Init Configuration

```bash
npx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Neutral** (will be overridden by custom tokens)
- CSS variables: **Yes**
- Tailwind CSS v4: **Yes** (auto-detected from project)

Then add components:
```bash
npx shadcn@latest add button input select dialog sheet badge skeleton toast dropdown-menu separator tooltip
```

### Environment Variable Inventory

```bash
# .env.local (development)

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...

# Vercel (auto-set on Vercel, manual for local)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# AWS Lambda (Phase 1: config only, no actual jobs)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_LAMBDA_FUNCTION_NAME=tristates-background-jobs
```

### Supabase Local Development Setup

```bash
# Initialize Supabase in the project
npx supabase init

# Start local Supabase (Docker required)
npx supabase start

# Create initial migration
npx supabase migration new enable_pgvector
```

```sql
-- supabase/migrations/00001_enable_pgvector.sql
create extension if not exists vector with schema public;

-- Placeholder listings table (will be expanded in Phase 2)
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  mls_id text unique,
  address text,
  price numeric,
  status text default 'active',
  embedding vector(1536),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for vector similarity search
create index on listings using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
```

### Supabase Client Setup

```tsx
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```tsx
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    }
  );
}
```

### Homepage Shell Structure

```tsx
// src/app/page.tsx (Server Component)
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerChildren } from "@/components/motion/stagger-children";
import { HeroSection } from "@/components/sections/hero";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <section className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-8 pt-16">
          <FadeIn>
            <h2 className="font-display text-[28px] font-bold leading-[1.2]">
              Featured Properties
            </h2>
          </FadeIn>
          {/* Placeholder listing cards grid */}
          <StaggerChildren className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ListingCard placeholders */}
          </StaggerChildren>
        </section>
        {/* Additional sections per UI-SPEC homepage shell layout */}
      </main>
      <Footer />
    </>
  );
}
```

## State of the Art

| Old Approach (STACK.md) | Current Approach (April 2026) | When Changed | Impact |
|-------------------------|-------------------------------|--------------|--------|
| Next.js 15 | Next.js 16.2.2 | Oct 2025 (v16), Mar 2026 (v16.2) | proxy.ts replaces middleware.ts, Turbopack default, async APIs |
| Framer Motion v11 | Framer Motion v12.38 | 2025-2026 | Same API, improved perf, tested with Next.js 16 |
| tailwindcss-animate | tw-animate-css v1.4.0 | 2025 (Tailwind v4 migration) | Required for shadcn/ui + Tailwind v4 |
| tailwind.config.js | @theme in globals.css | Tailwind v4 (2025) | CSS-first, no JS config file |
| HSL color tokens | OKLCH color tokens | shadcn/ui + Tailwind v4 update | Better perceptual uniformity, better opacity modifiers |
| middleware.ts | proxy.ts | Next.js 16 (Oct 2025) | Node.js runtime, deprecates Edge middleware file |

**Deprecated/outdated:**
- `tailwind.config.js` / `tailwind.config.ts`: Replaced by CSS-first `@theme` directive in Tailwind v4
- `tailwindcss-animate`: Replaced by `tw-animate-css` for Tailwind v4
- `@tailwind base; @tailwind components; @tailwind utilities;`: Replaced by `@import "tailwindcss";`
- `middleware.ts` filename: Deprecated in Next.js 16 in favor of `proxy.ts`
- Sync `params` / `searchParams` / `cookies()` / `headers()`: Must be awaited in Next.js 16

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (recommended for Next.js 16 + Turbopack) or Jest |
| Config file | none -- see Wave 0 |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | Next.js project builds without errors | smoke | `npm run build` | Wave 0 |
| INFRA-02 | Supabase migrations apply + pgvector enabled | integration | `npx supabase db reset && npx supabase migration list` | Wave 0 |
| INFRA-03 | Clerk middleware protects agent routes | integration | Manual -- requires Clerk test keys | Wave 0 |
| INFRA-04 | Vercel deployment succeeds | smoke | `vercel --prod` (manual) | manual-only |
| INFRA-05 | AWS Lambda function exists | smoke | `aws lambda get-function --function-name tristates-background-jobs` | manual-only |
| INFRA-06 | All env vars present | unit | `npx vitest run tests/env-check.test.ts` | Wave 0 |
| DS-01 | Design tokens render correct colors | unit | `npx vitest run tests/design-tokens.test.ts` | Wave 0 |
| DS-02 | Responsive breakpoints apply | e2e | Manual -- visual regression | manual-only |
| DS-03 | All 15 components render without error | unit | `npx vitest run tests/components/` | Wave 0 |
| DS-04 | Animations respect prefers-reduced-motion | unit | `npx vitest run tests/motion.test.ts` | Wave 0 |
| DS-05 | Lighthouse score > 90 | e2e | `npx lhci autorun` (Lighthouse CI) | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run build` (ensures no TypeScript or build errors)
- **Per wave merge:** `npx vitest run && npm run build`
- **Phase gate:** Full suite green + Lighthouse > 90 on deployed URL before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- test framework configuration
- [ ] `tests/components/` -- component render tests for all 15 UI-SPEC components
- [ ] `tests/env-check.test.ts` -- validates all required env vars are set
- [ ] `tests/design-tokens.test.ts` -- validates CSS custom properties exist and have correct values
- [ ] Install: `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom`

## Open Questions

1. **OKLCH exact values for the luxury palette**
   - What we know: Hex values are locked (#0A0A0A, #141414, #C9A84C). OKLCH is the recommended format for Tailwind v4 + shadcn/ui.
   - What's unclear: The exact OKLCH conversions should be verified with a color tool to ensure visual accuracy.
   - Recommendation: Use a hex-to-OKLCH converter during implementation. The values in this research are approximate. Verify visually.

2. **Clerk role setup for buyer vs. agent**
   - What we know: Clerk supports Organizations + Roles. `createRouteMatcher` works for route-level protection.
   - What's unclear: Whether to use Clerk Organizations (org:agent role) or Clerk Metadata (user.publicMetadata.role) for the buyer/agent distinction on a single-agent platform.
   - Recommendation: Use Clerk Metadata (`publicMetadata.role = "agent"`) since there's only one agent. Organizations add complexity suited for multi-team setups.

3. **AWS Lambda setup scope for Phase 1**
   - What we know: Lambda is needed for background jobs (embedding generation, data polling) in later phases.
   - What's unclear: How much Lambda infrastructure to set up in Phase 1 vs. deferring entirely.
   - Recommendation: Phase 1 should only create the Lambda function skeleton + IAM role + env var configuration. No actual job logic. This confirms the infrastructure works without overbuilding.

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16) -- Breaking changes, new features, migration notes
- [Next.js Installation Docs](https://nextjs.org/docs/app/getting-started/installation) -- create-next-app setup
- [shadcn/ui Tailwind v4 Docs](https://ui.shadcn.com/docs/tailwind-v4) -- @theme inline, tw-animate-css migration
- [shadcn/ui Theming Docs](https://ui.shadcn.com/docs/theming) -- CSS variable convention, background/foreground pairs
- [Clerk Next.js Quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart) -- Installation, ClerkProvider, proxy.ts
- [Clerk Middleware Reference](https://clerk.com/docs/reference/nextjs/clerk-middleware) -- createRouteMatcher, role protection
- [Supabase pgvector Docs](https://supabase.com/docs/guides/database/extensions/pgvector) -- Extension setup, vector columns
- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme) -- @theme directive, CSS-first configuration
- [Tailwind CSS v4 Dark Mode](https://tailwindcss.com/docs/dark-mode) -- @custom-variant, class-based dark mode
- npm registry -- Verified all package versions via `npm view [package] version` on 2026-04-06

### Secondary (MEDIUM confidence)
- [Framer Motion + Next.js Server Components Guide](https://www.hemantasundaray.com/blog/use-framer-motion-with-nextjs-server-components) -- Client wrapper pattern
- [Mapbox GL + React Tutorial](https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/) -- Integration approach
- [react-map-gl Documentation](https://visgl.github.io/react-map-gl/) -- Controlled component API
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables/managing-environment-variables) -- Per-environment config
- [Vercel Custom Domains](https://vercel.com/docs/domains/working-with-domains/add-a-domain-to-environment) -- DNS setup

### Tertiary (LOW confidence)
- OKLCH color values are approximate conversions from hex. Should be verified with a color conversion tool during implementation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified via npm registry, official docs consulted
- Architecture: HIGH -- patterns sourced from official docs (shadcn, Clerk, Next.js, Supabase)
- Pitfalls: HIGH -- based on known breaking changes in Next.js 16 and Tailwind v4
- Design tokens: MEDIUM -- OKLCH conversions are approximate, need visual verification

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (stable ecosystem, no major releases expected)
