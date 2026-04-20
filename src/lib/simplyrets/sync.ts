import { revalidateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { fetchProperties } from "./client";
import { transformSimplyRetsListing } from "./transform";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY required for sync");
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export interface SyncResult {
  upserted: number;
  pages: number;
  changedMlsIds: number[];
  durationMs: number;
}

export async function syncListings(
  opts: { mode: "delta" | "full" } = { mode: "full" }
): Promise<SyncResult> {
  const start = Date.now();
  const supabase = getServiceClient();
  let lastId = 0;
  let hasMore = true;
  let pages = 0;
  let upserted = 0;
  let totalFetched = 0;
  const changedMlsIds: number[] = [];

  while (hasMore) {
    pages += 1;
    const { listings } = await fetchProperties({
      status: ["Active", "Pending", "ActiveUnderContract", "ComingSoon"],
      limit: 500,
      lastId: lastId || undefined,
      include: ["openHouses"],
    });

    if (listings.length === 0) {
      hasMore = false;
      break;
    }

    totalFetched += listings.length;

    let rows: Record<string, unknown>[];

    if (opts.mode === "delta") {
      const mlsIds = listings.map((l) => l.mlsId);
      const { data: existing } = await supabase
        .from("listings")
        .select("mls_id, modified")
        .in("mls_id", mlsIds);
      const existingMap = new Map(
        (existing ?? []).map((r: { mls_id: number; modified: string | null }) => [
          r.mls_id,
          r.modified,
        ])
      );
      const changed = listings.filter((l) => {
        const dbModified = existingMap.get(l.mlsId);
        if (!dbModified) return true;
        if (!l.modified) return true;
        return new Date(l.modified) > new Date(dbModified);
      });

      if (changed.length === 0) {
        lastId = listings[listings.length - 1].mlsId;
        if (listings.length < 500) hasMore = false;
        // Add 250ms rate-limit delay between pagination requests
        await new Promise((r) => setTimeout(r, 250));
        continue;
      }

      rows = changed.map(transformSimplyRetsListing);
      changedMlsIds.push(...changed.map((l) => l.mlsId));
    } else {
      rows = listings.map(transformSimplyRetsListing);
      changedMlsIds.push(...listings.map((l) => l.mlsId));
    }

    const { error } = await supabase
      .from("listings")
      .upsert(rows, { onConflict: "mls_id" });

    if (error) throw new Error(`Supabase upsert failed: ${error.message}`);

    upserted += rows.length;
    lastId = listings[listings.length - 1].mlsId;

    if (listings.length < 500) hasMore = false;

    // 250ms rate-limit delay between pagination requests
    if (hasMore) {
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  // Full sync: mark listings absent from API response as Closed (stale cleanup)
  if (opts.mode === "full") {
    const { data: allDbIds } = await supabase
      .from("listings")
      .select("mls_id")
      .neq("status", "Closed");
    const apiIds = new Set(changedMlsIds);
    const staleIds = (allDbIds ?? [])
      .filter((r: { mls_id: number }) => !apiIds.has(r.mls_id))
      .map((r: { mls_id: number }) => r.mls_id);
    if (staleIds.length > 0) {
      await supabase
        .from("listings")
        .update({ status: "Closed" })
        .in("mls_id", staleIds);
    }
    console.log(`[sync] full: marked ${staleIds.length} stale listings as Closed`);
  }

  console.log(
    `[sync] ${opts.mode}: ${upserted} upserted across ${pages} pages (${Date.now() - start}ms)`
  );

  if (opts.mode === "delta") {
    console.log(
      `[sync] delta: ${upserted} changed out of ${totalFetched} total`
    );
  }

  // Trigger ISR revalidation for changed listings
  // Next.js 16: revalidateTag requires a second profile argument (use empty object for default TTL)
  revalidateTag("listings", {});
  for (const id of changedMlsIds.slice(0, 100)) {
    revalidateTag(`listing-${id}`, {});
  }

  return { upserted, pages, changedMlsIds, durationMs: Date.now() - start };
}
