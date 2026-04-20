import { NextResponse } from "next/server";
import { syncListings } from "@/lib/simplyrets/sync";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 min — full paginated sync across all DE listings

export async function POST(req: Request) {
  // Auth: Vercel Cron sets `Authorization: Bearer ${CRON_SECRET}`
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") ?? "delta") as "delta" | "full";

  try {
    const result = await syncListings({ mode });
    return NextResponse.json({ ok: true, mode, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    console.error("[sync] failed:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

// Allow GET for Vercel Cron compatibility (Cron sends GET by default)
export const GET = POST;
