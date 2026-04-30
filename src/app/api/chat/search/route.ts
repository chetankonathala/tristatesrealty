import { streamText, tool, convertToModelMessages } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Simple in-memory rate limiter (5 req/min per user or IP)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

const searchSchema = z.object({
  minPrice: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe("Minimum list price in dollars"),
  maxPrice: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe("Maximum list price in dollars"),
  minBeds: z
    .number()
    .int()
    .min(0)
    .max(10)
    .optional()
    .describe("Minimum number of bedrooms"),
  minBaths: z
    .number()
    .min(0)
    .max(10)
    .optional()
    .describe("Minimum number of bathrooms"),
  cities: z
    .string()
    .optional()
    .describe(
      "Comma-separated Delaware city names, e.g. 'Lewes,Rehoboth Beach'"
    ),
  postalCodes: z
    .string()
    .optional()
    .describe("Comma-separated ZIP codes, e.g. '19958,19971'"),
  type: z
    .string()
    .optional()
    .describe(
      "Comma-separated property types: residential, condominium, townhouse, land, multifamily"
    ),
  waterfront: z.boolean().optional().describe("Waterfront properties only"),
  newConstruction: z.boolean().optional().describe("New construction only"),
  garage: z.boolean().optional().describe("Must have a garage"),
  minSqft: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe("Minimum square footage"),
  maxSqft: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe("Maximum square footage"),
  sort: z
    .enum([
      "price-asc",
      "price-desc",
      "date-desc",
      "date-asc",
      "beds-desc",
      "sqft-desc",
      "dom-asc",
    ])
    .optional()
    .describe("Sort order for results"),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const rateLimitKey = userId ?? ip;

  if (!checkRateLimit(rateLimitKey)) {
    return NextResponse.json(
      {
        error:
          "Rate limit exceeded — 5 searches per minute. Please wait a moment.",
      },
      { status: 429 }
    );
  }

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const allMessages = Array.isArray(body.messages) ? body.messages : [];
  // Trim to last 6 UI messages (3 turns) to keep context tight, then convert to ModelMessages for streamText
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uiMessages = allMessages.slice(-6) as any[];
  const messages = await convertToModelMessages(uiMessages);

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: `You are a real estate search assistant for Tri States Realty, helping buyers find homes primarily in Delaware (also MD, NJ, PA).

ALWAYS call the searchListings tool when the user describes homes they want. Extract these from natural language:
- Price range ("under $500k" → maxPrice: 500000, "between $300k and $600k" → minPrice: 300000, maxPrice: 600000)
- Bedrooms/bathrooms ("4 bed" → minBeds: 4, "3+ baths" → minBaths: 3)
- Location ("in Lewes" → cities: "Lewes", "19958" → postalCodes: "19958")
- Property type ("condo" → type: "condominium", "house" → type: "residential", "townhome" → type: "townhouse")
- Special features ("waterfront" → waterfront: true, "new construction" → newConstruction: true, "with garage" → garage: true)
- Size ("over 2000 sqft" → minSqft: 2000)

After calling the tool, respond in ONE sentence confirming the search (e.g. "Showing 4-bedroom homes in Lewes under $500k.").
If zero results are likely for very specific criteria, add a one-sentence suggestion to broaden the search.
If the request is ambiguous, call the tool with what you can infer, then ask one clarifying question.
Never make up listings or prices. Never respond without calling the tool when homes are being discussed.`,
    messages,
    maxOutputTokens: 300,
    tools: {
      searchListings: tool({
        description:
          "Apply search filters to show matching Delaware home listings. Always call this when the user wants to find or browse homes.",
        inputSchema: searchSchema,
        execute: async (params) => params,
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
