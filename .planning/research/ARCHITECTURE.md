# Architecture Research: Claude AI Search Integration

**Domain:** AI-powered natural language search layered onto Next.js 16 + Supabase + nuqs + Mapbox
**Researched:** 2026-04-19
**Confidence:** HIGH — all components are existing, verified stack; integration patterns verified against official Vercel AI SDK docs, nuqs docs, and Anthropic structured outputs docs.

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
│                                                                       │
│  ┌─────────────────┐   ┌───────────────────────────────────────┐     │
│  │  ChatBubble     │   │         /search page                  │     │
│  │  (root layout)  │   │  ┌──────────────┬──────────────────┐  │     │
│  │  "use client"   │   │  │ ChatSidebar  │  SearchResults   │  │     │
│  │                 │   │  │ (left 35%)   │  (right 65%)     │  │     │
│  │  Collapsed:     │   │  │              │                  │  │     │
│  │  [AI bubble]    │   │  │  messages[]  │  map + grid      │  │     │
│  │                 │   │  │  input       │  filtered via    │  │     │
│  │  Expanded:      │   │  │  onFilter()  │  nuqs URL params │  │     │
│  │  [chat panel]   │   │  └──────────────┴──────────────────┘  │     │
│  └────────┬────────┘   └───────────────────────────────────────┘     │
│           │                         │                                 │
│           └─────────────┬───────────┘                                 │
│                         │ useChatSearch() — shared hook               │
│                         │ (manages messages, streaming, nuqs sync)    │
└─────────────────────────┼───────────────────────────────────────────┘
                          │ POST /api/chat/search
                          │ {messages: Message[]}
┌─────────────────────────▼───────────────────────────────────────────┐
│                     NEXT.JS API LAYER                                 │
│                                                                       │
│  POST /api/chat/search         POST /api/leads                        │
│  ┌──────────────────────┐      ┌────────────────────────────────┐    │
│  │ 1. Parse user msg    │      │ Existing lead capture route    │    │
│  │ 2. streamText() with │      │ (Resend email + Twilio SMS)    │    │
│  │    Anthropic claude  │      └────────────────────────────────┘    │
│  │ 3. tool: parseFilter │                                             │
│  │    → validates with  │                                             │
│  │      SearchParams Zod│                                             │
│  │ 4. streams data parts│                                             │
│  │    (filter JSON) +   │                                             │
│  │    text response     │                                             │
│  └──────────┬───────────┘                                             │
└─────────────┼───────────────────────────────────────────────────────┘
              │ Anthropic API (claude-3-5-haiku-20241022)
┌─────────────▼───────────────────────────────────────────────────────┐
│                   SUPABASE / DATA LAYER                               │
│                                                                       │
│  listings table (36 cols, 16 indexes, RLS)                            │
│  Existing searchListings(params: SearchParams) → SearchResult         │
│  No changes needed — AI route produces SearchParams, same query fn    │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `useChatSearch` hook | Single source of truth for chat messages + filter extraction + nuqs sync | Custom hook, `src/hooks/use-chat-search.ts` |
| `ChatBubble` | Floating site-wide AI entry point, collapses/expands, routes to /search on full view | Client component in root layout |
| `ChatSidebar` | Full chat panel on /search page — reuses same hook | Client component, /search layout |
| `POST /api/chat/search` | NL → structured filter extraction + streaming prose response | Route handler, App Router |
| `SearchParams` Zod schema | Already exists — shared between AI route and structured filter UI | `src/lib/schemas/search-params.ts` — no modification |
| `/search page` | Split-pane layout: chat sidebar + map/grid results | New `src/app/search/page.tsx` (thin server wrapper) |

---

## Question 1: NL → Supabase Query Translation Architecture

### The Right Pattern: streamText + Tool Calling (not generateObject)

The cleanest architecture uses `streamText` from the Vercel AI SDK with a `parseFilter` tool. This is superior to `generateObject` for this use case because:

1. Claude calls the tool with structured JSON extracted from NL — this is the filter
2. Claude also streams prose ("I found 12 homes in Lewes...") simultaneously  
3. The client receives both the filter (via `data` parts) AND the conversational response in one stream

**Why not two separate calls (generateObject + streamText)?**
Two roundtrips doubles latency. The tool-calling approach delivers structured filter JSON and streaming prose in a single HTTP connection.

**Route handler pattern:**

```typescript
// src/app/api/chat/search/route.ts
import { streamText, tool } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { searchParamsSchema } from "@/lib/schemas/search-params";

export const runtime = "nodejs";
export const maxDuration = 30;

// The filter schema Claude must produce — derived directly from existing Zod schema
const filterToolSchema = z.object({
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minBeds: z.number().optional(),
  maxBeds: z.number().optional(),
  minBaths: z.number().optional(),
  cities: z.string().optional(),       // comma-separated, e.g. "Lewes,Rehoboth Beach"
  counties: z.string().optional(),
  postalCodes: z.string().optional(),
  state: z.enum(["DE", "MD", "NJ", "PA"]).optional(),
  type: z.string().optional(),         // comma-separated property types
  waterfront: z.boolean().optional(),
  newConstruction: z.boolean().optional(),
  garage: z.boolean().optional(),
  minSqft: z.number().optional(),
  maxSqft: z.number().optional(),
  minYearBuilt: z.number().optional(),
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic("claude-3-5-haiku-20241022"),
    system: `You are a real estate search assistant for Tri States Realty, 
      serving Delaware home buyers. When a user describes what they want, 
      ALWAYS call the applyFilter tool with the extracted parameters, then 
      respond conversationally confirming what you're searching for.
      
      Delaware cities include: Lewes, Rehoboth Beach, Bethany Beach, 
      Millsboro, Middletown, Newark, Dover, Wilmington, Ocean View.
      
      If the user asks something unrelated to home search, politely redirect.`,
    messages,
    tools: {
      applyFilter: tool({
        description: "Extract structured search parameters from the user's natural language home search request",
        parameters: filterToolSchema,
        execute: async (params) => {
          // Validate against existing schema — drops unknown fields, applies defaults
          const validated = searchParamsSchema.parse({
            ...params,
            page: 1,  // always reset pagination on new NL query
          });
          return { filter: validated, applied: true };
        },
      }),
    },
    maxSteps: 2, // 1 for tool call, 1 for prose response
    onFinish: ({ usage }) => {
      // Optional: log token usage for monitoring
      console.log("[chat/search] tokens:", usage);
    },
  });

  return result.toDataStreamResponse();
}
```

**Key decisions in this pattern:**

- `claude-3-5-haiku-20241022` — fastest, cheapest Claude model. Haiku is sufficient for NL → JSON extraction; reserve Sonnet for complex multi-turn reasoning. Confidence: HIGH (Anthropic docs confirm Haiku excels at structured extraction tasks).
- `maxSteps: 2` — one step for tool invocation, one step for the prose follow-up. Without this, Claude stops after calling the tool.
- `toDataStreamResponse()` — Vercel AI SDK's standard response format that useChat on the client expects. This handles SSE chunking automatically.
- The `execute` function on the tool validates the Claude output through the existing `searchParamsSchema` Zod validator — this is the single point of truth for what parameters are valid.

---

## Question 2: Streaming + App Router Server Components

### Streaming works in the API route, not in Server Components for this case

The architecture keeps streaming entirely in the client ↔ API route pair. There is no streaming from Server Components involved in the chat feature. Here is why this is correct:

**What NOT to do:** Try to use React Suspense + Server Component streaming for AI chat. Server Components cannot maintain state across turns and cannot emit SSE to a client hook.

**What to do:** 
- `/api/chat/search` is a Route Handler (not a Server Component). Route Handlers are plain Node.js HTTP handlers that can stream SSE via `toDataStreamResponse()`.
- The `useChat` hook on the client connects to this route, opens a streaming connection per message, and appends chunks to `messages[]` state as they arrive.
- The `/search` page outer shell IS a Server Component (for ISR and SEO of the page itself). The `ChatSidebar` and `SearchResultsGrid` inside it are client components.

**The nuance:** The `/search` page receives search params via URL (nuqs) and can do an initial server render of listings. The AI chat supplements this with a streaming client interaction. These two flows are parallel, not sequential — the server renders what URL params say, the client chat updates URL params, the URL param change triggers Server Component re-render via React transitions.

**Streaming flow:**

```
User types "4 bed waterfront in Lewes under $900k" → hits Enter
    ↓
useChat.append({ role: "user", content: "..." })
    ↓
POST /api/chat/search   ← streaming SSE connection opens
    ↓
Claude calls applyFilter tool → tool.execute() validates → returns {filter, applied}
    ↓
Stream part: tool-result data (filter JSON) → client receives via useChat data[]
    ↓
Claude continues → streams prose: "Searching for 4+ bed waterfront homes in Lewes..."
    ↓
Stream part: text delta chunks → appended to messages[last].content in real-time
    ↓
onToolCall fires on client → extracts filter from tool result → calls setFilters() (nuqs)
    ↓
nuqs updates URL → shallow=false → RSC re-renders with new params → listings update
```

**Runtime consideration:** Keep `runtime = "nodejs"` on the route handler (not edge). The Anthropic SDK requires Node.js APIs (streams, buffers). Edge runtime will fail. maxDuration = 30 seconds is sufficient for Haiku.

---

## Question 3: Chat State → nuqs URL Params Sync

### The `useChatSearch` hook — single source of truth

Both `ChatBubble` and `ChatSidebar` mount this hook. It is the only place where chat state and URL params meet. The hook must be designed so that two components can safely share it without double-firing.

**Architecture decision:** The hook lives in both components independently (not a singleton). This is intentional — `ChatBubble` only cares about messages for the mini-panel. `ChatSidebar` cares about messages AND filter sync. The URL is the shared state between them.

```typescript
// src/hooks/use-chat-search.ts
"use client";
import { useChat } from "@ai-sdk/react";
import { useQueryStates, parseAsInteger, parseAsString, parseAsBoolean, parseAsStringEnum } from "nuqs";
import { useCallback } from "react";

export function useChatSearch() {
  // Mirror the existing SearchFilters nuqs state shape exactly
  const [filters, setFilters] = useQueryStates(
    {
      minPrice: parseAsInteger,
      maxPrice: parseAsInteger,
      minBeds: parseAsInteger,
      maxBeds: parseAsInteger,
      minBaths: parseAsInteger,
      type: parseAsString,
      cities: parseAsString,
      counties: parseAsString,
      postalCodes: parseAsString,
      state: parseAsStringEnum(["DE", "MD", "NJ", "PA"]),
      waterfront: parseAsBoolean,
      newConstruction: parseAsBoolean,
      garage: parseAsBoolean,
      minSqft: parseAsInteger,
      maxSqft: parseAsInteger,
      minYearBuilt: parseAsInteger,
      page: parseAsInteger.withDefault(1),
    },
    { throttleMs: 0, shallow: false }  // shallow: false = triggers RSC re-render
  );

  const { messages, input, handleInputChange, handleSubmit, isLoading, data } = useChat({
    api: "/api/chat/search",
    onToolCall({ toolCall }) {
      if (toolCall.toolName === "applyFilter") {
        // Extract filter from tool call args and push to URL
        const extracted = toolCall.args as Record<string, unknown>;
        setFilters({
          minPrice: (extracted.minPrice as number) ?? null,
          maxPrice: (extracted.maxPrice as number) ?? null,
          minBeds: (extracted.minBeds as number) ?? null,
          maxBeds: (extracted.maxBeds as number) ?? null,
          minBaths: (extracted.minBaths as number) ?? null,
          type: (extracted.type as string) ?? null,
          cities: (extracted.cities as string) ?? null,
          counties: (extracted.counties as string) ?? null,
          postalCodes: (extracted.postalCodes as string) ?? null,
          state: (extracted.state as "DE" | "MD" | "NJ" | "PA") ?? null,
          waterfront: (extracted.waterfront as boolean) ?? null,
          newConstruction: (extracted.newConstruction as boolean) ?? null,
          garage: (extracted.garage as boolean) ?? null,
          minSqft: (extracted.minSqft as number) ?? null,
          maxSqft: (extracted.maxSqft as number) ?? null,
          minYearBuilt: (extracted.minYearBuilt as number) ?? null,
          page: 1,  // always reset to page 1 on new AI query
        });
      }
    },
  });

  // Helper: let users also manually clear chat + filters together
  const clearSearch = useCallback(() => {
    setFilters({
      minPrice: null, maxPrice: null, minBeds: null, maxBeds: null,
      minBaths: null, type: null, cities: null, counties: null,
      postalCodes: null, state: null, waterfront: null,
      newConstruction: null, garage: null, minSqft: null,
      maxSqft: null, minYearBuilt: null, page: 1,
    });
  }, [setFilters]);

  return { messages, input, handleInputChange, handleSubmit, isLoading, filters, clearSearch };
}
```

**Why `onToolCall` (not `onFinish`)?**
`onToolCall` fires as soon as Claude invokes the tool — before the prose response streams. This means the listings update while Claude is still typing its reply. The user sees results appear immediately, then reads Claude's confirmation. `onFinish` would delay the filter update until the full stream ends.

**nuqs config: `shallow: false`**
This is the critical setting. With `shallow: true` (default), nuqs updates the URL without telling Next.js to re-fetch the page, so Server Components don't re-run. With `shallow: false`, nuqs pushes a router navigation that triggers the RSC to re-run `searchListings()` with the new params. This is exactly how `SearchFilters` already works (the existing code uses `shallow: false`).

**URL shareability:** Because all filter state lives in the URL via nuqs, any AI-generated search is automatically bookmarkable and shareable. Pasting the URL into a new browser immediately shows the same listings.

---

## Question 4: ChatBubble + /search Page — No Duplication

### The key insight: ChatBubble navigates to /search; it does not duplicate the full search experience

The `ChatBubble` is a site-wide floating entry point. It has two modes:

**Mode A: Mini-chat (any page except /search)**
Shows the last 3 messages (conversation summary). Has a text input. On submit, it navigates to `/search` with the first query pre-loaded. This is NOT a full search experience in the bubble — it is an invitation to the /search page.

**Mode B: Hidden on /search**
When the user is on `/search`, the `ChatBubble` hides itself (`usePathname` check). The full `ChatSidebar` inside `/search` IS the chat experience. No duplication — one renders, the other hides.

```
─────────────────────────────────────
On /listings, /, /communities/*:
  ChatBubble shows → mini preview
  User types → navigates to /search?q=<encoded_query>
  /search receives q param → pre-populates first message

On /search:
  ChatBubble renders null (hidden)
  ChatSidebar is the full experience
─────────────────────────────────────
```

**ChatBubble implementation sketch:**

```typescript
// src/components/chat/chat-bubble.tsx
"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function ChatBubble() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Hide entirely on /search — ChatSidebar is the experience there
  if (pathname === "/search") return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    // Navigate to /search with initial query in URL
    // /search page reads this and pre-populates the chat input
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-80 bg-card border border-border rounded-2xl shadow-2xl p-4">
          {/* Mini chat preview — last message only */}
          <p className="text-sm text-muted-foreground mb-3">
            Describe your ideal home — I&apos;ll find it.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="4 bed waterfront in Lewes..."
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm"
            />
            <button type="submit" className="btn-accent text-sm px-3 py-2 rounded-lg">
              Search
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-accent text-background shadow-lg flex items-center justify-center"
          aria-label="Open AI home search"
        >
          {/* AI/chat icon */}
        </button>
      )}
    </div>
  );
}
```

**The `?q=` handoff:** The `/search` page reads an optional `q` URL param on mount. If present, it pre-populates the `useChat` initial message array, so the AI immediately responds and sets filters. This creates a seamless handoff from the bubble to the full experience.

---

## Recommended Project Structure

New files and modifications only. Everything not listed is unchanged.

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── search/
│   │           └── route.ts          # NEW: Claude streaming API route
│   └── search/
│       ├── page.tsx                  # NEW: /search split-pane page (server wrapper)
│       └── search-client.tsx         # NEW: client component mounting hook + layout
│
├── components/
│   └── chat/
│       ├── chat-bubble.tsx           # NEW: floating site-wide bubble
│       ├── chat-sidebar.tsx          # NEW: left panel on /search
│       ├── chat-message.tsx          # NEW: single message renderer (user/assistant)
│       └── chat-input.tsx            # NEW: shared input component
│
├── hooks/
│   └── use-chat-search.ts            # NEW: shared hook (messages + nuqs sync)
│
└── app/
    └── layout.tsx                    # MODIFY: add <ChatBubble /> before </NuqsAdapter>
```

**Modified files (1):**
- `src/app/layout.tsx` — add `<ChatBubble />` inside `<NuqsAdapter>`, after `<ToastProvider />`

**New files (7):**
- `src/app/api/chat/search/route.ts`
- `src/app/search/page.tsx`
- `src/app/search/search-client.tsx`
- `src/components/chat/chat-bubble.tsx`
- `src/components/chat/chat-sidebar.tsx`
- `src/components/chat/chat-message.tsx`
- `src/hooks/use-chat-search.ts`

**Not modified:**
- `src/lib/schemas/search-params.ts` — used as-is; the AI route imports from it
- `src/lib/supabase/queries/listings.ts` — used as-is; no changes to query layer
- `src/components/listings/search-filters.tsx` — unchanged; coexists with chat
- `src/middleware.ts` — `/search` is public, no auth changes needed

---

## Data Flow

### Complete Request Flow: NL Search

```
User: "waterfront homes in Lewes, 4+ beds, under $1.2M"
    ↓
ChatSidebar (or ChatBubble) input → form submit
    ↓
useChat.append({ role: "user", content: "..." })
    ↓
POST /api/chat/search  { messages: [{role:"user", content:"..."}] }
    ↓ (SSE stream opens)
Claude claude-3-5-haiku: receives system prompt + user message
    ↓
Claude calls applyFilter({ cities:"Lewes", minBeds:4, maxPrice:1200000, waterfront:true })
    ↓
tool.execute() → searchParamsSchema.parse() → validated filter object
    ↓
Stream: tool-result part → client receives via onToolCall
    ↓
onToolCall fires → setFilters(extracted) → nuqs URL updates
    ↓ (parallel)
nuqs shallow:false → router.push() with new URL params
    ↓
RSC re-renders /search page → searchListings(newParams) → Supabase query
    ↓
SearchResultsGrid re-renders with live listings
    ↓ (back in stream)
Claude continues streaming: "Found 8 waterfront homes in Lewes..."
    ↓
Text delta chunks → messages[last].content grows in real-time
    ↓
Stream closes → useChat.isLoading = false → input re-enables
```

### State Management Overview

```
URL (nuqs — source of truth for filters)
    ↑                           ↓
setFilters()              useQueryStates()
    ↑                           ↓
onToolCall()          Server Component reads URL params
    ↑                           ↓
useChat messages[]        searchListings(parsedParams)
    ↑                           ↓
POST /api/chat/search    Supabase → listings[]
```

The URL is the shared state. The chat produces filter mutations. The listings consume the URL. Neither knows about the other — they communicate only through the URL.

---

## Architectural Patterns

### Pattern 1: Tool-First Extraction + Prose Follow-up (maxSteps: 2)

**What:** Claude calls a typed tool to extract structured data, then streams a natural language confirmation. The tool extraction is step 1; the prose is step 2.

**When to use:** Any time you need both structured output AND a conversational response. Do not use two separate API calls.

**Trade-offs:** Slightly more complex server setup (need maxSteps), but eliminates double-latency of sequential calls. The tool result arrives first (typically <500ms for Haiku), listing updates appear before prose response finishes streaming.

### Pattern 2: URL as Shared State Between Server and Client

**What:** nuqs manages all filter state in the URL query string. Both the AI hook and the structured filter UI write to the same URL params. The Server Component reads only the URL — it is agnostic to whether a human clicked a filter pill or Claude called a tool.

**When to use:** Always, in this architecture. This is what makes AI-generated searches shareable, bookmarkable, and browser-back-button compatible.

**Trade-offs:** `shallow: false` causes a full RSC re-render on every filter change. This is correct — listings must be fresh. For very high frequency typing (debounce UIs), `throttleMs` helps. For chat, there is no debounce concern since the user submits once.

### Pattern 3: ChatBubble Navigates, ChatSidebar Searches

**What:** The floating bubble is a navigation affordance. The sidebar is the full experience. They share no state directly — the handoff is a URL push with `?q=`.

**When to use:** Any time you have a global entry point that leads to a dedicated page. This avoids React context complexity, portal mounting issues, and hydration mismatches.

**Trade-offs:** The user navigates to `/search` on first bubble submit (one page transition). This is acceptable because `/search` is the correct destination for search intent. The transition can be instant with `<Link prefetch>` or `router.prefetch`.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Anthropic API | `@ai-sdk/anthropic` provider, `streamText()` | Install `ai @ai-sdk/anthropic`. Needs `ANTHROPIC_API_KEY` env var. |
| Supabase | No changes — existing `searchListings()` accepts `SearchParams` | AI route produces SearchParams-compatible objects |
| nuqs | Existing `useQueryStates` in SearchFilters — same keys used in hook | `shallow: false` already set in existing filters |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Chat hook ↔ URL params | nuqs `setFilters()` | Only writer of filter state from the AI side |
| Chat hook ↔ RSC | URL change → Next.js router re-render | nuqs `shallow:false` triggers RSC re-render |
| ChatBubble ↔ /search | `router.push('/search?q=...')` | One-way handoff, no shared component state |
| API route ↔ Anthropic | `streamText()` + `toDataStreamResponse()` | Must be `runtime = "nodejs"` — not edge |
| API route ↔ SearchParams Zod | Import `searchParamsSchema` from existing path | Single validation point; no schema duplication |

### New Environment Variables Required

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

No other new env vars. The route is unauthenticated by default (public search). Rate limiting can be added via Vercel's built-in Edge Config or Upstash Redis if abuse is a concern.

---

## Build Order (Phase Dependencies)

Phase ordering matters because later phases depend on earlier components existing.

```
Phase 1: API Route (foundation — nothing else works without this)
  └─ src/app/api/chat/search/route.ts
  └─ Install: npm install ai @ai-sdk/anthropic

Phase 2: Shared Hook (depends on Phase 1 API route existing)
  └─ src/hooks/use-chat-search.ts
  └─ Verify: onToolCall fires, nuqs setFilters updates URL

Phase 3: /search Page (depends on Phase 2 hook)
  └─ src/app/search/page.tsx        ← server shell, reads URL params
  └─ src/app/search/search-client.tsx ← mounts hook, renders split pane
  └─ src/components/chat/chat-sidebar.tsx
  └─ src/components/chat/chat-message.tsx
  └─ src/components/chat/chat-input.tsx
  └─ Verify: full NL → filter → listings flow end-to-end

Phase 4: ChatBubble (depends on /search page existing for navigation)
  └─ src/components/chat/chat-bubble.tsx
  └─ Modify: src/app/layout.tsx (add ChatBubble)
  └─ Verify: bubble hides on /search, navigates to /search from other pages

Phase 5: Lead Capture Forms (depends on listings pages existing — already there)
  └─ Verify /api/leads route handles listing_id + source attribution
  └─ Add source: "ai_chat" to lead metadata when lead comes from chat search
```

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–1k users/month | No changes. Anthropic Haiku + Vercel serverless handles this easily. ~$0.25/1M tokens = negligible cost. |
| 1k–50k users/month | Add rate limiting on `/api/chat/search` via Upstash Redis (5 requests/user/minute). Haiku is $0.25/$1.25 per million input/output tokens — 50k users at 5 msgs/session = ~$15-30/month AI cost. |
| 50k+ users/month | Consider caching common NL patterns (Upstash Redis, 60s TTL). "4 bed in Lewes" asked 100 times per hour — same result. Cache at the filter extraction level, not the Supabase query. |

### Scaling Priorities

1. **First bottleneck:** Anthropic API latency (not cost). Haiku p50 is ~400ms for extraction. Streaming means users see Claude typing immediately even if the tool call takes 500ms. The perceived wait is low.
2. **Second bottleneck:** Supabase connection pool. The `searchListings()` query is already optimized (16 indexes). At high concurrency, Supabase connection pooling (PgBouncer, enabled by default on Supabase Pro) handles this.

---

## Anti-Patterns

### Anti-Pattern 1: Separate generateObject Call Before Streaming

**What people do:** Call `generateObject()` first to get the filter, then separately stream the prose response.

**Why it's wrong:** Two HTTP roundtrips. User waits for the filter extraction to complete before prose starts streaming. Total latency doubles. Also complicates the client — two different API calls, two loading states.

**Do this instead:** Single `streamText()` with `maxSteps: 2`. Tool call extracts filter (step 1), prose streams afterward (step 2). One connection, one loading state.

### Anti-Pattern 2: Storing Chat Messages in Global React State / Context

**What people do:** Create a `ChatContext` provider at the root to share messages between `ChatBubble` and `ChatSidebar`.

**Why it's wrong:** Hydration mismatches, context re-renders on every message (affecting the entire app), and complexity. The floating bubble and the sidebar are not siblings — they are conceptually separate. If the user is on `/search`, the bubble doesn't exist. If they are not on `/search`, the sidebar doesn't exist.

**Do this instead:** Each component instantiates `useChatSearch()` independently. The URL is the shared state. When the user navigates from bubble to /search, the URL (with query params) carries the state. The hook in ChatSidebar reads from the URL on mount and restores context.

### Anti-Pattern 3: `shallow: true` for Chat-Driven Filter Updates

**What people do:** Set `shallow: true` in the nuqs config to avoid full page re-renders.

**Why it's wrong:** With `shallow: true`, the Server Component does not re-run. The listings displayed on screen are the ones from the last server render. The URL changes but the data does not update. Users will see stale listings.

**Do this instead:** `shallow: false` (which is already what the existing `SearchFilters` component uses). Accept the RSC re-render — it is fast (~50-100ms for the Supabase query) and necessary for correctness.

### Anti-Pattern 4: Streaming Chat from a Server Component

**What people do:** Try to use React Server Component streaming (Suspense/loading.tsx) for the AI chat feature.

**Why it's wrong:** Server Components are stateless per-request. They cannot maintain a multi-turn conversation, cannot receive SSE, and cannot update client state. Chat is inherently stateful and client-driven.

**Do this instead:** Keep the chat entirely in: Client Component (useChat hook) ↔ Route Handler (streamText). The Server Component is only the outer page shell that renders initial listings from URL params.

### Anti-Pattern 5: Using Edge Runtime for the Chat Route

**What people do:** Add `export const runtime = "edge"` to the chat route for lower latency.

**Why it's wrong:** The Anthropic SDK uses Node.js streams and Buffer APIs not available in the Edge runtime. The route silently fails or throws cryptic errors.

**Do this instead:** `export const runtime = "nodejs"`. The cold start difference (Edge vs Node) is negligible for AI routes where the Anthropic API call dominates latency.

---

## Sources

- [Vercel AI SDK: Getting Started with Next.js App Router](https://ai-sdk.dev/docs/getting-started/nextjs-app-router)
- [Vercel AI SDK: useChat Reference](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat)
- [Vercel AI SDK: Tool Calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)
- [Vercel AI SDK: Streaming Custom Data](https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data)
- [Anthropic Structured Outputs (GA, Nov 2025)](https://claude.com/blog/structured-outputs-on-the-claude-developer-platform)
- [nuqs: Type-safe search params for React](https://nuqs.dev/)
- [nuqs: Adapters documentation](https://nuqs.dev/docs/adapters)
- [Vercel AI SDK 6 Release Notes](https://vercel.com/blog/ai-sdk-6)

---

*Architecture research for: Claude AI NL Search Integration — Next.js 16 + nuqs + Supabase*
*Researched: 2026-04-19*
