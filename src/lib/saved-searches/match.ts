import { createClient } from "@supabase/supabase-js";
import { listAllActiveSavedSearches } from "@/lib/supabase/queries/saved-searches";
import { sendListingAlert } from "@/lib/notifications/resend";
import { sendListingAlertSms } from "@/lib/notifications/twilio";
import { searchParamsSchema, type SearchParams, parseBounds, parseMultiValue } from "@/lib/schemas/search-params";
import type { SavedSearch } from "@/types/saved-search";
import type { ListingSummary } from "@/types/listing";

// Service-role Supabase client for use in cron context (no Next.js cookies required)
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Service role required");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

const SUMMARY_FIELDS =
  "mls_id,list_price,status,address_full,address_city,address_state,bedrooms,bathrooms,area,photos,lat,lng,list_date,days_on_market,open_house_date";

// Service-role version of searchListings — works without Next.js request context
async function searchListingsService(params: SearchParams): Promise<ListingSummary[]> {
  const supabase = getServiceClient();
  let query = supabase.from("listings").select(SUMMARY_FIELDS);

  // Include Active AND Pending/ActiveUnderContract so status-change trigger can fire
  const status = params.status;
  if (!status) {
    query = query.in("status", ["Active", "Pending", "ActiveUnderContract"]);
  } else {
    query = query.eq("status", status);
  }

  if (params.minPrice !== undefined) query = query.gte("list_price", params.minPrice);
  if (params.maxPrice !== undefined) query = query.lte("list_price", params.maxPrice);
  if (params.minBeds !== undefined) query = query.gte("bedrooms", params.minBeds);
  if (params.maxBeds !== undefined) query = query.lte("bedrooms", params.maxBeds);
  if (params.minBaths !== undefined) query = query.gte("bathrooms", params.minBaths);
  if (params.maxBaths !== undefined) query = query.lte("bathrooms", params.maxBaths);
  if (params.minSqft !== undefined) query = query.gte("area", params.minSqft);
  if (params.maxSqft !== undefined) query = query.lte("area", params.maxSqft);
  if (params.minLotSize !== undefined) query = query.gte("lot_size", params.minLotSize);
  if (params.maxLotSize !== undefined) query = query.lte("lot_size", params.maxLotSize);
  if (params.minYearBuilt !== undefined) query = query.gte("year_built", params.minYearBuilt);

  const types = parseMultiValue(params.type);
  if (types.length > 0) query = query.in("type", types);

  const cities = parseMultiValue(params.cities);
  if (cities.length > 0) query = query.in("address_city", cities);
  const counties = parseMultiValue(params.counties);
  if (counties.length > 0) query = query.in("address_county", counties);
  const postalCodes = parseMultiValue(params.postalCodes);
  if (postalCodes.length > 0) query = query.in("address_postal_code", postalCodes);
  if (params.state) query = query.eq("address_state", params.state);
  if (params.schoolDistrict) query = query.eq("school_district", params.schoolDistrict);

  if (params.waterfront) query = query.eq("waterfront", true);
  if (params.newConstruction) query = query.eq("new_construction", true);
  if (params.garage) query = query.gt("garage_spaces", 0);

  const bounds = parseBounds(params.bounds);
  if (bounds) {
    const [swLng, swLat, neLng, neLat] = bounds;
    query = query.gte("lng", swLng).lte("lng", neLng).gte("lat", swLat).lte("lat", neLat);
  }

  // Limit to 100 for notification batch
  query = query.limit(100);

  const { data, error } = await query;
  if (error) throw new Error(`searchListingsService failed: ${error.message}`);
  return (data ?? []) as unknown as ListingSummary[];
}

export interface NotifyResult {
  searchId: string;
  matchCount: number;
  triggers: string[]; // "new_listing" | "price_drop" | "status_pending" | "open_house"
  emailSent: boolean;
  smsSent: boolean;
}

export async function runSavedSearchNotifications(): Promise<NotifyResult[]> {
  const searches = await listAllActiveSavedSearches();
  const results: NotifyResult[] = [];

  for (const search of searches) {
    try {
      const r = await processSavedSearch(search);
      if (r) results.push(r);
    } catch (err) {
      // Log search ID only — no PII (T-02-10-02)
      console.error(`[notify] saved_search ${search.id} failed:`, err);
    }
  }

  return results;
}

async function processSavedSearch(search: SavedSearch): Promise<NotifyResult | null> {
  // Re-validate stored criteria so a schema change doesn't crash the cron
  let criteria: SearchParams;
  try {
    criteria = searchParamsSchema.parse(search.criteria);
  } catch {
    return null;
  }

  // Query for current matches (includes Active + Pending so we can detect status changes)
  const listings = await searchListingsService(criteria);
  const currentMlsIds = new Set(listings.map((l) => l.mls_id));
  const seenMlsIds = new Set(search.last_seen_mls_ids ?? []);
  const seenPrices = (search.last_seen_prices ?? {}) as Record<string, number>;

  // ---- TRIGGER 1: NEW listings ----
  // Listings in current results that were NOT seen last cycle, with Active status
  const newMatches = listings.filter(
    (l) => !seenMlsIds.has(l.mls_id) && l.status === "Active"
  );

  // ---- TRIGGER 2: PRICE DROP ----
  // A listing already in seen set whose CURRENT list_price is LESS than the snapshot
  // recorded last cycle in last_seen_prices.
  const priceDropMatches = listings.filter((l) => {
    if (!seenMlsIds.has(l.mls_id)) return false;
    const prevPrice = seenPrices[String(l.mls_id)];
    return typeof prevPrice === "number" && l.list_price < prevPrice;
  });

  // ---- TRIGGER 3: STATUS Active → Pending ----
  const statusChangeMatches = listings.filter(
    (l) =>
      seenMlsIds.has(l.mls_id) &&
      (l.status === "Pending" || l.status === "ActiveUnderContract")
  );

  // ---- TRIGGER 4: OPEN HOUSE within next 7 days ----
  // Match listings whose open_house_date is:
  //   (a) within the next 7 days, AND
  //   (b) either newly populated since last_notified_at OR the listing wasn't seen before
  // This catches both "new listing with open house scheduled" and "existing listing
  // just added/rescheduled an open house".
  const now = Date.now();
  const sevenDays = now + 7 * 24 * 60 * 60 * 1000;
  const lastNotified = search.last_notified_at ? Date.parse(search.last_notified_at) : 0;

  const openHouseMatches = listings.filter((l) => {
    if (!l.open_house_date) return false;
    const oh = Date.parse(l.open_house_date);
    if (Number.isNaN(oh)) return false;
    if (oh < now || oh > sevenDays) return false;
    // Either we've never seen this listing OR the open_house_date was set/changed since last notify
    return !seenMlsIds.has(l.mls_id) || oh > lastNotified;
  });

  // De-dupe across triggers (a single listing may fire multiple triggers — only include once)
  const allMatchesMap = new Map<number, ListingSummary>();
  const triggers: string[] = [];

  if (newMatches.length > 0) {
    triggers.push("new_listing");
    newMatches.forEach((l) => allMatchesMap.set(l.mls_id, l));
  }
  if (priceDropMatches.length > 0) {
    triggers.push("price_drop");
    priceDropMatches.forEach((l) => allMatchesMap.set(l.mls_id, l));
  }
  if (statusChangeMatches.length > 0) {
    triggers.push("status_pending");
    statusChangeMatches.forEach((l) => allMatchesMap.set(l.mls_id, l));
  }
  if (openHouseMatches.length > 0) {
    triggers.push("open_house");
    openHouseMatches.forEach((l) => allMatchesMap.set(l.mls_id, l));
  }

  const allMatches = Array.from(allMatchesMap.values());

  // Snapshot current prices for next cycle's price_drop detection
  const newSeenPrices: Record<string, number> = {};
  listings.forEach((l) => {
    newSeenPrices[String(l.mls_id)] = l.list_price;
  });

  if (allMatches.length === 0) {
    await updateSavedSearchSnapshot(search.id, Array.from(currentMlsIds), newSeenPrices);
    return null;
  }

  let emailSent = false;
  let smsSent = false;

  if (search.email_alerts && search.email_address) {
    try {
      await sendListingAlert({
        to: search.email_address,
        searchName: search.name,
        searchId: search.id,
        listings: allMatches.slice(0, 6),
      });
      emailSent = true;
    } catch (err) {
      // Log search ID only — no PII (T-02-10-02)
      console.error(`[notify] email send failed for ${search.id}:`, err);
    }
  }

  if (search.sms_alerts && search.phone_number) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tristatesrealty.com";
      await sendListingAlertSms({
        to: search.phone_number,
        searchName: search.name,
        matchCount: allMatches.length,
        firstListingUrl: `${baseUrl}/listings/${allMatches[0].mls_id}`,
      });
      smsSent = true;
    } catch (err) {
      // Log search ID only — no PII (T-02-10-02)
      console.error(`[notify] SMS send failed for ${search.id}:`, err);
    }
  }

  await updateSavedSearchSnapshot(search.id, Array.from(currentMlsIds), newSeenPrices);

  return {
    searchId: search.id,
    matchCount: allMatches.length,
    triggers,
    emailSent,
    smsSent,
  };
}

async function updateSavedSearchSnapshot(
  id: string,
  mlsIds: number[],
  prices: Record<string, number>
): Promise<void> {
  const supabase = getServiceClient();
  await supabase
    .from("saved_searches")
    .update({
      last_seen_mls_ids: mlsIds,
      last_seen_prices: prices,
      last_notified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}
