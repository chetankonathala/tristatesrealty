import { revalidateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { fetchDelawareCommunities, fetchFloorPlans, fetchAllStateCommunities } from "./client";
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
    revalidateTag("listings", {});
    for (const id of activeMlsIds.slice(0, 100)) {
      revalidateTag(`listing-${id}`, {});
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

export interface CommunitySyncResult {
  upserted: number;
  deactivated: number;
  total_fetched: number;
  durationMs: number;
  errors: string[];
}

export async function syncCommunities(): Promise<CommunitySyncResult> {
  const start = Date.now();
  const supabase = getServiceClient();
  const errors: string[] = [];

  // 1. Fetch all communities from all state divisions
  const allCommunities = await fetchAllStateCommunities();

  // 2. Transform HeartbeatCommunity -> communities table row
  const rows = allCommunities
    .filter((c) => c.city && c.state) // skip incomplete records
    .map((c) => {
      // Prefix slug with lowercase state abbreviation to avoid cross-state collisions
      // e.g., "de-cardinal-grove", "md-amberleigh"
      const statePrefix = (c.state ?? "xx").toLowerCase().trim();
      const baseSlug =
        c.slug ||
        c.marketing_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      const slug = `${statePrefix}-${baseSlug}`;

      return {
        community_id: c.community_id,
        slug,
        name: c.marketing_name,
        full_name: c.community_marketing_name || null,
        description: c.marketing_description || null,
        short_description: c.short_description || null,
        city: c.city,
        state: c.state,
        zip: c.zip || null,
        address: c.address || null,
        lat: c.lat ? parseFloat(c.lat) : null,
        lng: c.lng ? parseFloat(c.lng) : null,
        price_from: c.priced_from
          ? parseFloat(c.priced_from.replace(/[^0-9.]/g, "")) || null
          : null,
        school_district: c.school_district || null,
        school_elementary: c.school_elementary || null,
        school_middle: c.school_middle || null,
        school_high: c.school_high || null,
        hoa_fee: c.hoa_monthly_fee ? parseFloat(c.hoa_monthly_fee) || null : null,
        hoa_yearly_fee: c.hoa_yearly_fee ? parseFloat(c.hoa_yearly_fee) || null : null,
        hoa_name: c.hoa_name || null,
        amenities: c.amenities ?? [],
        division_id: c.division_parent_id,
        division_name: c.division_parent_marketing_name || null,
        featured_image_url: c.featured_image_url || null,
        is_sold_out: c.is_sold_out === "1",
        is_active: true,
        heartbeat_page_url: c.page_url || null,
        sales_center_address: c.sales_center_address_string || c.sales_center_address || null,
        synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

  let upserted = 0;

  // 3. Upsert in batches of 50
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase
      .from("communities")
      .upsert(batch, { onConflict: "community_id" });
    if (error) {
      errors.push(`Batch ${i}: ${error.message}`);
    } else {
      upserted += batch.length;
    }
  }

  // 4. Mark communities NOT in the fetched set as inactive
  let deactivated = 0;
  const activeCommunityIds = rows.map((r) => r.community_id);
  if (activeCommunityIds.length > 0) {
    const { data: stale } = await supabase
      .from("communities")
      .select("id")
      .eq("is_active", true)
      .not("community_id", "in", `(${activeCommunityIds.join(",")})`);
    if (stale && stale.length > 0) {
      const { error } = await supabase
        .from("communities")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .not("community_id", "in", `(${activeCommunityIds.join(",")})`);
      if (!error) deactivated = stale.length;
    }
  }

  // 5. Trigger ISR revalidation for community pages
  try {
    revalidateTag("communities", {});
  } catch (e) {
    // Log ISR failure so it surfaces in Vercel function logs
    console.warn("[syncCommunities] revalidateTag failed:", e);
  }

  return {
    upserted,
    deactivated,
    total_fetched: allCommunities.length,
    durationMs: Date.now() - start,
    errors,
  };
}
