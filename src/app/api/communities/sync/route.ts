import { NextResponse } from "next/server";
import { syncCommunities } from "@/lib/schell/sync";

export const runtime = "nodejs";
export const maxDuration = 120; // Communities sync may be slower due to multi-state

export async function GET(req: Request) {
  // Verify cron secret — same pattern as /api/listings/sync
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncCommunities();
    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    console.error("[communities/sync] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
