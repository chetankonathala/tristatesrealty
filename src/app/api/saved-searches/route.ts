import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { searchParamsSchema } from "@/lib/schemas/search-params";
import { createSavedSearch, listSavedSearches, deleteSavedSearch } from "@/lib/supabase/queries/saved-searches";

export const runtime = "nodejs";

const createBody = z.object({
  name: z.string().max(120).optional(),
  criteria: searchParamsSchema,
  email_alerts: z.boolean().optional(),
  sms_alerts: z.boolean().optional(),
  alert_frequency: z.enum(["instant", "daily", "weekly"]).optional(),
  phone_number: z.string().max(20).nullable().optional(),
  email_address: z.string().email().nullable().optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await listSavedSearches(userId);
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body;
  try {
    body = createBody.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: "Invalid input", details: String(err) }, { status: 400 });
  }
  const created = await createSavedSearch(userId, body);
  return NextResponse.json({ item: created }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await deleteSavedSearch(userId, id);
  return NextResponse.json({ ok: true });
}
