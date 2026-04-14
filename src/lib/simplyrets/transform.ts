import type { SimplyRetsListing, SimplyRetsOpenHouse } from "./types";
import type { Listing, ListingStatus, PropertyType } from "@/types/listing";

const VALID_STATUSES: ListingStatus[] = ["Active", "Pending", "ActiveUnderContract", "ComingSoon", "Closed"];
const VALID_TYPES: PropertyType[] = ["residential", "condominium", "townhouse", "land", "multifamily", "commercial"];

function normalizeStatus(s?: string): ListingStatus {
  if (s && VALID_STATUSES.includes(s as ListingStatus)) return s as ListingStatus;
  return "Active";
}

function normalizeType(t?: string): PropertyType | null {
  if (!t) return null;
  const lower = t.toLowerCase() as PropertyType;
  return VALID_TYPES.includes(lower) ? lower : null;
}

/**
 * Pick the earliest upcoming open-house start time. Returns null if no open houses
 * are scheduled or all are in the past. Used to populate `open_house_date` so the
 * D-13 open-house alert trigger in plan 02-10 can detect new open houses.
 */
function pickEarliestUpcomingOpenHouse(houses?: SimplyRetsOpenHouse[]): string | null {
  if (!houses || houses.length === 0) return null;
  const now = Date.now();
  const upcoming = houses
    .map((h) => h.openHouseStartTime)
    .filter((t): t is string => typeof t === "string" && Date.parse(t) >= now)
    .sort();
  return upcoming[0] ?? null;
}

export function transformSimplyRetsListing(
  src: SimplyRetsListing
): Omit<Listing, "id" | "created_at" | "updated_at" | "synced_at"> & { synced_at?: string } {
  const agentFirst = src.listingAgent?.firstName ?? "";
  const agentLast = src.listingAgent?.lastName ?? "";
  const agentName = `${agentFirst} ${agentLast}`.trim() || null;

  return {
    mls_id: src.mlsId,
    listing_id: src.listingId ?? null,
    list_price: src.listPrice,
    list_date: src.listDate ?? null,
    modified: src.modified ?? null,
    status: normalizeStatus(src.mls?.status),
    type: normalizeType(src.property?.type),
    subtype: src.property?.subtype ?? null,
    address_full: src.address.full,
    address_street: src.address.street ?? null,
    address_city: src.address.city,
    address_state: src.address.state,
    address_postal_code: src.address.postalCode ?? null,
    address_county: src.address.county ?? null,
    bedrooms: src.property?.bedrooms ?? null,
    bathrooms: src.property?.bathrooms ?? null,
    area: src.property?.area ?? null,
    lot_size: src.property?.lotSize ?? null,
    year_built: src.property?.yearBuilt ?? null,
    stories: src.property?.stories ?? null,
    garage_spaces: src.property?.garageSpaces ?? null,
    pool: src.property?.pool ?? null,
    lat: src.geo?.lat ?? null,
    lng: src.geo?.lng ?? null,
    geo_market_area: src.geo?.marketArea ?? null,
    remarks: src.remarks ?? null,
    photos: src.photos ?? [],
    virtual_tour_url: src.virtualTourUrl ?? null,
    listing_agent_name: agentName,
    listing_agent_phone: src.listingAgent?.contact?.office ?? null,
    listing_agent_email: src.listingAgent?.contact?.email ?? null,
    listing_office_name: src.office?.name ?? null,
    listing_office_phone: src.office?.contact?.office ?? null,
    co_agent_name: null,
    days_on_market: src.mls?.daysOnMarket ?? null,
    school_district: src.school?.district ?? null,
    school_elementary: src.school?.elementarySchool ?? null,
    school_middle: src.school?.middleSchool ?? null,
    school_high: src.school?.highSchool ?? null,
    tax_annual_amount: src.tax?.taxAnnualAmount ?? null,
    hoa_fee: src.association?.fee ?? null,
    hoa_frequency: src.association?.frequency ?? null,
    features: src.features ?? [],
    waterfront: src.waterfront ?? false,
    new_construction: src.newConstruction ?? false,
    open_house_date: pickEarliestUpcomingOpenHouse(src.openHouses),
    raw_data: src,
    synced_at: new Date().toISOString(),
  };
}
