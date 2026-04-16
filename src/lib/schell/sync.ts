// eslint-disable-next-line @typescript-eslint/no-explicit-any
const revalidateTag: (...args: any[]) => void = require("next/cache").revalidateTag;
import { createClient } from "@supabase/supabase-js";
import { fetchDelawareCommunities, fetchFloorPlans } from "./client";
import { transformFloorPlan } from "./transform";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY required for sync");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

// Small delay between community fetches to be polite to Schell's server
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface SchellSyncResult {
  upserted: number;
  deactivated: number;
  communities: number;
  durationMs: number;
  errors: string[];
}

export async function syncSchellListings(): Promise<SchellSyncResult> {
  const start = Date.now();
  const supabase = getServiceClient();
  const errors: string[] = [];

  // 1. Fetch all Delaware communities from Heartbeat API
  const communities = await fetchDelawareCommunities();

  // Filter to active, non-sold-out, non-build-on-lot communities with real data
  const activeCommunities = communities.filter(
    (c) =>
      c.is_sold_out !== "1" &&
      c.is_build_on_your_lot !== "1" &&
      c.city &&
      c.state
  );

  let upserted = 0;
  let deactivated = 0;
  const activeMlsIds: number[] = [];

  // 2. For each active community, fetch floor plans and upsert
  for (const community of activeCommunities) {
    try {
      await delay(300); // Be polite: 300ms between requests
      const plans = await fetchFloorPlans(community.community_id);

      if (plans.length === 0) continue;

      const rows = plans
        .filter((p) => p.is_marketing_active !== "0")
        .map((plan) => transformFloorPlan(community, plan));

      if (rows.length === 0) continue;

      const { error } = await supabase
        .from("listings")
        .upsert(rows, { onConflict: "mls_id" });

      if (error) {
        errors.push(`${community.marketing_name}: ${error.message}`);
      } else {
        upserted += rows.length;
        activeMlsIds.push(...rows.map((r) => r.mls_id));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${community.marketing_name}: ${msg}`);
    }
  }

  // 3. Mark old Schell listings no longer in active communities as Closed
  // (listings where raw_data->>'source' = 'schell' AND mls_id not in activeMlsIds)
  if (activeMlsIds.length > 0) {
    const { data: staleRows } = await supabase
      .from("listings")
      .select("mls_id")
      .eq("status", "Active")
      .filter("raw_data->>source", "eq", "schell")
      .not("mls_id", "in", `(${activeMlsIds.join(",")})`);

    if (staleRows && staleRows.length > 0) {
      const staleMlsIds = staleRows.map((r) => r.mls_id);
      const { error } = await supabase
        .from("listings")
        .update({ status: "Closed", synced_at: new Date().toISOString() })
        .in("mls_id", staleMlsIds);
      if (!error) deactivated = staleMlsIds.length;
    }
  }

  // 4. Trigger ISR revalidation
  try {
    revalidateTag("listings");
    for (const id of activeMlsIds.slice(0, 100)) {
      revalidateTag(`listing-${id}`);
    }
  } catch {
    // Not critical if revalidation fails mid-sync
  }

  return {
    upserted,
    deactivated,
    communities: activeCommunities.length,
    durationMs: Date.now() - start,
    errors,
  };
}
