import { NextResponse } from "next/server";
import { syncSchellListings } from "@/lib/schell/sync";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 min — scraping ~20 communities takes ~30s

export async function POST(req: Request) {
  // Auth: Vercel Cron sets `Authorization: Bearer ${CRON_SECRET}`
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncSchellListings();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    console.error("[sync] failed:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

// Allow GET for Vercel Cron compatibility (Cron sends GET by default)
export const GET = POST;
