# Technology Stack: Tri States Realty
# Addendum — v1.1 AI Chat Search Milestone

**Project:** Tri States Realty — v1.1 Delaware Search Platform
**Researched:** 2026-04-19
**Confidence:** HIGH (core AI libraries), MEDIUM (streaming architecture tradeoffs)

> This file supersedes and extends the original STACK.md. Sections 1–12 from the April 2026 research are preserved intact below. This addendum covers ONLY the net-new additions required for the AI chat search milestone. Do not re-install or re-configure anything in the existing stack.

---

## v1.1 Net-New Additions: AI Chat Search

### What Already Exists (DO NOT re-research or re-add)

- Next.js 16.2.2 + TypeScript + Tailwind v4 + shadcn/ui — installed
- Supabase + pgvector — configured
- Clerk auth — configured
- Mapbox + react-map-gl v8 + supercluster — installed
- Framer Motion v12 — installed
- SimplyRETS sync route — built
- nuqs v2 — installed
- Resend + Twilio — configured
- Zod v4 + react-hook-form — installed
- Anthropic SDK — NOT YET installed (this milestone adds it)

---

### New Core Libraries

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `ai` (Vercel AI SDK) | ^4.3.x (NOT v5 or v6) | `useChat` hook, streaming transport, SSE handling, `streamText` on the server | v5 dropped internal input management and requires a migration. v6 shifts to React Server Actions and has breaking changes. v4.3.x is stable, well-documented, compatible with React 19 + Next.js App Router, and the last version before the architectural breaks. useChat + Route Handler pattern matches this codebase's existing API route conventions. |
| `@ai-sdk/anthropic` | ^1.2.x | Vercel AI SDK Anthropic provider — bridges `ai` SDK to Claude API | The `@ai-sdk/anthropic` provider wires Claude into AI SDK's `streamText` / `generateObject` with one import change vs. direct SDK. No manual SSE piping. Structured output via `generateObject` with Zod schema is the clean path for NL → filter translation. |
| `@anthropic-ai/sdk` | ^0.90.x | Raw Anthropic SDK (install alongside AI SDK for type safety + fallback) | The AI SDK provider calls this internally. Installing it directly gives TypeScript types, access to newer Claude model strings, and the ability to call structured outputs natively if needed outside the AI SDK abstraction. Pin minor version to match `@ai-sdk/anthropic` peer dep. |

**Version lock rationale:** The `ai` package is on a rapid release cadence (v6.0.162 as of research date). v4.3.x locks the `useChat` API surface, which is stable and React 19 compatible. v5 introduced transport-based architecture that requires refactoring; v6 further breaks by eliminating `/api/chat` Route Handler patterns in favor of Server Actions. Neither breaking change is worth the cost for this milestone. Lock to `^4.3.x` until a planned migration sprint.

---

### Chat UI Components

| Technology | Source | Purpose | Why |
|------------|--------|---------|-----|
| shadcn `ai-chat-floating-widget` block | `shadcn.io/blocks/ai-chat-floating-widget` | Floating chat bubble — collapsible sparkle button → 400px chat panel | Copy-paste block from official shadcn. Zero new npm deps. Uses shadcn primitives + Tailwind already in the project. Matches dark theme. Replaces need for any external chat UI library. |
| shadcn `Sheet` component | `npx shadcn add sheet` | /search page chat sidebar (slide-in panel on mobile, fixed column on desktop) | Already available in shadcn. Side panel for /search page chat sidebar. No new dependency. |
| shadcn `ScrollArea` component | `npx shadcn add scroll-area` | Scrollable message list in chat panel | Already available in shadcn. No new dependency. |

**What you do NOT need for chat UI:**
- `react-chat-elements` — brings its own CSS, fights Tailwind v4
- `stream-chat` or `stream-chat-react` — full messaging platform, massive overkill
- `@chatscope/chat-ui-kit-react` — opinionated styling, dark theme fights needed
- `jakobhoeg/shadcn-chat` — external package; the official `shadcn.io/blocks` deliver the same components as primitives you own

---

### Streaming Architecture Decision: Vercel AI SDK Route Handler (NOT raw SSE)

**Use `ai` SDK's `streamText` + `useChat` pattern. Not raw SSE. Not Anthropic SDK's `.stream()` directly.**

**Why this over raw SSE:**

Raw SSE with `anthropic.messages.stream()` requires manually writing the SSE chunking logic, reconnect handling, and client-side parsing. The Vercel AI SDK Route Handler pattern handles all of this with `toDataStreamResponse()` and `useChat` reads it with zero custom parsing. The result is identical wire format (Server-Sent Events) with 80% less code.

**Why this over Server Actions (AI SDK v6 pattern):**

Server Actions are stateless per call. Chat needs a Route Handler that can be `POST`ed repeatedly. The existing codebase uses Route Handlers for all API work (`/api/listings/sync`, `/api/listings/revalidate`). A Route Handler at `/api/chat/route.ts` is consistent. Server Actions for streaming are also a newer pattern with less production validation.

**Server-side pattern (Route Handler):**

```typescript
// src/app/api/chat/route.ts
import { streamText, generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

// Step 1: Parse NL query into structured search params
const SearchFiltersSchema = z.object({
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minBeds: z.number().optional(),
  minBaths: z.number().optional(),
  propertyType: z.enum(["residential", "condo", "land", "multi-family"]).optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  keywords: z.string().optional(),
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-5-20250929"), // pinned version string
    system: `You are a Delaware real estate search assistant for Tri States Realty.
      When the user describes what they're looking for, extract structured search filters.
      Always call the search_listings tool with the extracted parameters.
      If the user is vague, ask ONE clarifying question. Keep responses concise and conversational.`,
    messages,
    tools: {
      search_listings: {
        description: "Search Delaware MLS listings based on extracted user criteria",
        parameters: SearchFiltersSchema,
        execute: async (filters) => {
          // Query Supabase listings table with extracted filters
          // Returns matching listing summaries to show in chat
          return await queryListings(filters);
        },
      },
    },
  });

  return result.toDataStreamResponse();
}
```

**Client-side pattern (useChat hook):**

```typescript
// src/components/chat/ChatPanel.tsx
"use client";
import { useChat } from "ai/react";

export function ChatPanel() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    onToolCall: ({ toolCall }) => {
      // toolCall.args contains the extracted SearchFilters
      // Push these into nuqs URL params to update the /search results
    },
  });
  // render messages, input, send button
}
```

**nuqs integration for filter sync:**

The `onToolCall` callback in `useChat` fires when Claude calls `search_listings` with extracted filters. At that point, call nuqs's `setParams` to update the URL query string (e.g., `?minBeds=4&maxPrice=800000&city=Lewes`). The `/search` page's Server Component reads those nuqs params and re-renders the listing grid. This keeps AI-extracted filters and the existing structured filter bar in sync without any additional state layer.

---

### Model Selection

| Model | API String | Use Case | Cost |
|-------|-----------|---------|------|
| Claude Sonnet 4.5 | `claude-sonnet-4-5-20250929` | **RECOMMENDED for NL search** — fast, cheap, excellent at structured extraction | $3 / $15 per MTok |
| Claude Haiku 4.5 | `claude-haiku-4-5-20250929` | Alternative if cost is a concern at high volume. Slightly lower quality for complex NL parsing | $0.80 / $4 per MTok |
| Claude Sonnet 4.6 | `claude-sonnet-4-6` | Overkill for search filter extraction. Use only if extended thinking or 1M context is needed | Higher |

**Why Sonnet 4.5 and not Haiku:** Real estate search queries can be ambiguous ("something nice in the beach area under $800k with enough room for the kids"). Sonnet 4.5 handles multi-intent, ambiguous queries significantly better. The cost difference on a single-agent site with low volume is negligible.

**IMPORTANT:** Always use the fully-versioned model string (e.g., `claude-sonnet-4-5-20250929`) in production, not the alias. Aliases silently change when Anthropic releases new versions. Pin the model string and update deliberately.

---

### Structured Output Strategy

Use `generateObject` (not `streamText` + tool use) for the pure NL → structured filter translation step:

```typescript
// Non-streaming parse endpoint — called before opening the streaming chat
// src/app/api/chat/parse/route.ts
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export async function POST(req: Request) {
  const { query } = await req.json();
  
  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-5-20250929"),
    schema: SearchFiltersSchema,
    prompt: `Extract Delaware real estate search filters from this query: "${query}"`,
  });
  
  return Response.json(object);
}
```

This gives guaranteed JSON matching the Zod schema. Use `generateObject` when you just need the filters (fast, non-streaming). Use `streamText` + tool calls when you want Claude to show conversational responses alongside the search results.

---

### Environment Variables to Add

```bash
# .env.local additions
ANTHROPIC_API_KEY=sk-ant-...  # Required — never prefix with NEXT_PUBLIC_
```

The Anthropic key MUST remain server-side only. It is used exclusively in Route Handlers (`/api/chat`) and Server Actions. The `@ai-sdk/anthropic` provider reads `ANTHROPIC_API_KEY` automatically from the environment — no explicit config needed.

---

### Installation

```bash
# New packages for v1.1 — all other deps already installed
npm install ai@^4.3 @ai-sdk/anthropic @anthropic-ai/sdk

# shadcn UI additions (no new npm deps — copies source into your components)
npx shadcn add sheet
npx shadcn add scroll-area
```

Then copy the `ai-chat-floating-widget` block from `shadcn.io/blocks/ai-chat-floating-widget` into `src/components/chat/`.

---

### What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `ai` v5 or v6 | v5 drops input state management from `useChat`; v6 eliminates Route Handler pattern. Both require migration work that is not scoped to this milestone. | `ai@^4.3.x` |
| `langchain` or `llamaindex` | 15+ transitive deps, 10x complexity for what is a single-model, single-tool workflow. Over-engineering for NL → structured search. | Direct AI SDK tool calling |
| `openai` npm package for embeddings | Already researched in original STACK.md as a separate decision. Do NOT mix OpenAI calls into the chat Route Handler. Keep Claude chat isolated. | `@ai-sdk/anthropic` only in chat routes |
| `react-query` or `SWR` for chat state | `useChat` from AI SDK manages all chat state (messages, loading, streaming). Adding a second cache layer conflicts. | `useChat` hook |
| `socket.io` or WebSockets | SSE (Server-Sent Events) via Route Handler is sufficient and simpler for one-directional streaming. WebSockets add bi-directional complexity with no benefit for chat. | Route Handler + `toDataStreamResponse()` |
| `assistant-ui` or `shadcn-chat` (external) | Both pull in external packages and opinionated styling that fights the existing dark theme. Official shadcn blocks are copy-paste source you own. | `shadcn.io/blocks/ai-chat-floating-widget` |
| `NEXT_PUBLIC_ANTHROPIC_API_KEY` | Leaks API key to the browser bundle. Never expose the Anthropic key client-side. | Server-only env var in Route Handlers |
| Raw `anthropic.messages.stream()` directly in Route Handler | Works, but requires manually writing SSE chunking, reconnect logic, and client-side stream parsing. The AI SDK does this for free. | `streamText().toDataStreamResponse()` |

---

### Version Compatibility Matrix

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| `ai` | ^4.3.x | React 19, Next.js 16, nuqs v2 | React 19 `useEffect` + `messages` dependency bug exists in some v4 versions — avoid using `messages` as a `useEffect` dep; derive values in render instead |
| `@ai-sdk/anthropic` | ^1.2.x | `ai` ^4.3.x | Peer dep on `ai` — must match major. Do not install v3.x |
| `@anthropic-ai/sdk` | ^0.90.x | Node.js 18+ | Used internally by `@ai-sdk/anthropic`. Installing directly only needed for TypeScript types or direct API calls |
| Zod | ^4.3.6 (already installed) | `ai` generateObject | AI SDK v4 uses Zod for schema validation in `generateObject` — already at correct version |

---

### Architecture Integration Points

```
User types NL query in ChatPanel
  → useChat POST to /api/chat (Route Handler)
    → streamText with claude-sonnet-4-5
      → Claude calls search_listings tool with extracted filters
        → execute() queries Supabase listings table
          → results stream back via SSE to useChat
            → onToolCall fires with filters
              → setParams() (nuqs) updates URL
                → /search Server Component re-renders with new filter params
                  → Listing grid + Mapbox map update to matched listings
```

Both the floating bubble (site-wide) and the /search sidebar use the same `useChat` hook pointed at `/api/chat`. The difference is presentation only — the bubble is a shadcn floating block; the sidebar is a `Sheet` component in the /search layout. No separate API routes.

---

## Original Stack Research (April 2026)

The original full-stack research document sections 1–12 are below for reference. They document the existing installed stack and should not be treated as new additions.

---

## 1. Core Framework: Next.js 15 (App Router)

**Recommendation:** Next.js 15 with App Router. Non-negotiable for this project.

**Why:** Real estate listing pages are the textbook ISR use case. Thousands of IDX listing pages need to be pre-rendered for SEO while staying fresh as prices/status change. Next.js 15's App Router gives you:

- `generateStaticParams` to pre-build the top ~500 high-traffic listing pages at build time
- `dynamicParams = true` so every other listing is generated on first request and then cached
- `revalidate` set per route type (listings: 3600s, market data: 300s, static content: `false`)
- Metadata API in `layout.tsx` / `page.tsx` for per-listing OG tags, canonical URLs, structured data (RealEstateListing schema)
- React Server Components for zero-JS listing cards — critical for LCP scores
- Streaming for dashboard and AI panels that can load progressively

**ISR Strategy for IDX Listings:**

```typescript
// app/listings/[mlsId]/page.tsx
export const revalidate = 3600; // revalidate listing every 1 hour

export async function generateStaticParams() {
  // Only pre-build top 500 most-viewed listings at build time
  const featured = await getTopListings(500);
  return featured.map((l) => ({ mlsId: l.id }));
}

export const dynamicParams = true; // generate rest on-demand
```

**Structured Data for SEO (HIGH value for real estate):**

```typescript
// Emit JSON-LD RealEstateListing schema per page
const structuredData = {
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  name: listing.address,
  price: listing.listPrice,
  numberOfRooms: listing.bedrooms,
  // ...
};
```

**Confidence:** HIGH — verified via Next.js official docs and community patterns.

---

## 2. UI Layer

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | v4 | Utility styling | Dark mode via `dark:` variants, v4 is faster, no purge config needed |
| Framer Motion | v11 | Animations | Luxury feel — smooth property card reveals, modal transitions, map pan. No layout shift side effects |
| shadcn/ui | latest | Headless component system | Unstyled base, fully customizable for luxury dark theme, Next.js App Router compatible |
| Lucide React | latest | Icons | Consistent icon library, tree-shakeable |

**Luxury Dark Design Notes:**
- Use Tailwind CSS `dark:` as the default (dark-first, not dark-mode toggle)
- Aceternity UI has spotlight/gradient components designed specifically for dark luxury aesthetics
- Framer Motion `layoutId` for shared element transitions between listing cards and detail views

---

## 3. Database

**Recommendation: Supabase (PostgreSQL + pgvector)**

Supabase is both the database AND the AI vector store — eliminating a separate Pinecone bill.

| Concern | Why Supabase Wins |
|---------|-------------------|
| Real-time | Native WebSocket subscriptions via PostgreSQL replication — market analytics dashboard updates without polling |
| Auth | Built-in auth (but we use Clerk — Supabase auth is a fallback) |
| Vector search | pgvector extension: 4x higher QPS than Pinecone at lower cost, hybrid SQL+vector queries in one statement |
| Storage | Built-in S3-compatible storage for listing photos, tour previews |
| Row-level security | RLS policies for multi-tenant data (buyer accounts, agent dashboard isolation) |
| Cost | $25/month Pro tier with $10 compute credits; Pinecone would add ~$25+/month separately |

**Confidence:** HIGH

---

## 4. Authentication

**Recommendation: Clerk** — already installed and configured. See CLAUDE.md for implementation details.

---

## 5. IDX / MLS Data Integration

**Recommendation: SimplyRETS + RESO Web API** — sync route already built at `src/app/api/listings/sync/route.ts`.

---

## 6. AI Recommendation Engine

**Recommendation: OpenAI text-embedding-3-small + Supabase pgvector** — for semantic search on listings. This is SEPARATE from the Claude chat feature. Use OpenAI for generating listing embeddings. Use Claude (via AI SDK) for the chat/NL search interface.

---

## 7–12. (Market Data, Mortgage, 3D Tours, E-Sign, Deployment, CRM)

Unchanged from original April 2026 research. See Git history for full text.

---

## Sources (v1.1 Addendum)

- [Anthropic Models Overview](https://platform.claude.com/docs/en/about-claude/models/overview) — current model API strings, confirmed `claude-sonnet-4-5-20250929` (HIGH confidence)
- [AI SDK docs — Getting Started Next.js App Router](https://ai-sdk.dev/docs/getting-started/nextjs-app-router) — confirmed Route Handler + useChat pattern (HIGH confidence)
- [AI SDK Reference — useChat](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) — confirmed hook API surface for v4 (HIGH confidence)
- [AI SDK 6 Blog Post](https://vercel.com/blog/ai-sdk-6) — confirmed v6 breaking changes (Server Actions, no Route Handler pattern) — rationale to pin v4 (HIGH confidence)
- [AI SDK Migration Guide 6.0](https://ai-sdk.dev/docs/migration-guides/migration-guide-6-0) — confirmed scope of breaking changes (HIGH confidence)
- [npm @ai-sdk/anthropic versions](https://www.npmjs.com/package/@ai-sdk/anthropic?activeTab=versions) — confirmed latest is 3.0.71 (MEDIUM — version cadence is high)
- [npm @anthropic-ai/sdk](https://www.npmjs.com/package/@anthropic-ai/sdk) — confirmed latest is ^0.90.x (HIGH confidence)
- [shadcn AI Chat Floating Widget Block](https://www.shadcn.io/blocks/ai-chat-floating-widget) — confirmed official block exists, uses no external deps (HIGH confidence)
- [Claude Structured Outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) — confirmed `generateObject` + Zod schema approach (HIGH confidence)
- [Strapi: OpenAI SDK vs Vercel AI SDK 2026](https://strapi.io/blog/openai-sdk-vs-vercel-ai-sdk-comparison) — informed streaming approach decision (MEDIUM confidence)
- [nuqs documentation](https://nuqs.dev/) — confirmed compatibility with Next.js App Router for URL state sync (HIGH confidence)

---

*Stack research addendum for: Tri States Realty v1.1 AI Chat Search milestone*
*Researched: 2026-04-19*
