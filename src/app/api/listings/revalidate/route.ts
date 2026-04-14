import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag");
  if (!tag) {
    return NextResponse.json({ error: "Missing 'tag' query param" }, { status: 400 });
  }

  // Next.js 16: revalidateTag requires a second profile argument (use empty object for default TTL)
  revalidateTag(tag, {});
  return NextResponse.json({ ok: true, revalidated: tag });
}
