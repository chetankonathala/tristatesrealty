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

export async function syncListings(): Promise<SyncResult> {
  const start = Date.now();
  const supabase = getServiceClient();
  let lastId = 0;
  let hasMore = true;
  let pages = 0;
  let upserted = 0;
  const changedMlsIds: number[] = [];

  while (hasMore) {
    pages += 1;
    const { listings } = await fetchProperties({
      status: ["Active", "Pending", "ActiveUnderContract"],
      limit: 500,
      lastId: lastId || undefined,
      include: ["openHouses"],
    });

    if (listings.length === 0) {
      hasMore = false;
      break;
    }

    const rows = listings.map(transformSimplyRetsListing);
    const { error } = await supabase
      .from("listings")
      .upsert(rows, { onConflict: "mls_id" });

    if (error) throw new Error(`Supabase upsert failed: ${error.message}`);

    upserted += rows.length;
    changedMlsIds.push(...listings.map((l) => l.mlsId));
    lastId = listings[listings.length - 1].mlsId;

    if (listings.length < 500) hasMore = false;
  }

  // Trigger ISR revalidation for changed listings
  // Next.js 16: revalidateTag requires a second profile argument (use empty object for default TTL)
  revalidateTag("listings", {});
  for (const id of changedMlsIds.slice(0, 100)) {
    revalidateTag(`listing-${id}`, {});
  }

  return { upserted, pages, changedMlsIds, durationMs: Date.now() - start };
}
