import { createClient } from "@/lib/supabase/server";
import type { Listing, ListingSummary } from "@/types/listing";
import type { SearchParams } from "@/lib/schemas/search-params";
import { parseBounds, parseMultiValue } from "@/lib/schemas/search-params";

const SUMMARY_FIELDS =
  "mls_id,list_price,status,address_full,address_city,address_state,bedrooms,bathrooms,area,photos,lat,lng,list_date,days_on_market,open_house_date";

export interface SearchResult {
  listings: ListingSummary[];
  totalCount: number;
  page: number;
  perPage: number;
}

export async function searchListings(params: SearchParams): Promise<SearchResult> {
  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select(SUMMARY_FIELDS, { count: "exact" });

  // Status filter (default Active)
  query = query.eq("status", params.status ?? "Active");

  // Price
  if (params.minPrice !== undefined) query = query.gte("list_price", params.minPrice);
  if (params.maxPrice !== undefined) query = query.lte("list_price", params.maxPrice);

  // Beds
  if (params.minBeds !== undefined) query = query.gte("bedrooms", params.minBeds);
  if (params.maxBeds !== undefined) query = query.lte("bedrooms", params.maxBeds);

  // Baths
  if (params.minBaths !== undefined) query = query.gte("bathrooms", params.minBaths);
  if (params.maxBaths !== undefined) query = query.lte("bathrooms", params.maxBaths);

  // Square footage
  if (params.minSqft !== undefined) query = query.gte("area", params.minSqft);
  if (params.maxSqft !== undefined) query = query.lte("area", params.maxSqft);

  // Lot size
  if (params.minLotSize !== undefined) query = query.gte("lot_size", params.minLotSize);
  if (params.maxLotSize !== undefined) query = query.lte("lot_size", params.maxLotSize);

  // Year built
  if (params.minYearBuilt !== undefined) query = query.gte("year_built", params.minYearBuilt);

  // Property type (multi)
  const types = parseMultiValue(params.type);
  if (types.length > 0) query = query.in("type", types);

  // Location
  const cities = parseMultiValue(params.cities);
  if (cities.length > 0) query = query.in("address_city", cities);
  const counties = parseMultiValue(params.counties);
  if (counties.length > 0) query = query.in("address_county", counties);
  const postalCodes = parseMultiValue(params.postalCodes);
  if (postalCodes.length > 0) query = query.in("address_postal_code", postalCodes);
  if (params.state) query = query.eq("address_state", params.state);

  // School district
  if (params.schoolDistrict) query = query.eq("school_district", params.schoolDistrict);

  // Boolean features
  if (params.waterfront) query = query.eq("waterfront", true);
  if (params.newConstruction) query = query.eq("new_construction", true);
  if (params.garage) query = query.gt("garage_spaces", 0);

  // Map viewport bounds (D-02 search-as-you-move)
  const bounds = parseBounds(params.bounds);
  if (bounds) {
    const [swLng, swLat, neLng, neLat] = bounds;
    query = query
      .gte("lng", swLng)
      .lte("lng", neLng)
      .gte("lat", swLat)
      .lte("lat", neLat);
  }

  // Sort
  switch (params.sort) {
    case "price-asc":
      query = query.order("list_price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("list_price", { ascending: false });
      break;
    case "date-asc":
      query = query.order("list_date", { ascending: true });
      break;
    case "beds-desc":
      query = query.order("bedrooms", { ascending: false });
      break;
    case "sqft-desc":
      query = query.order("area", { ascending: false });
      break;
    case "date-desc":
    default:
      query = query.order("list_date", { ascending: false });
      break;
  }

  // Pagination
  const from = (params.page - 1) * params.perPage;
  const to = from + params.perPage - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) throw new Error(`searchListings failed: ${error.message}`);

  return {
    listings: (data ?? []) as unknown as ListingSummary[],
    totalCount: count ?? 0,
    page: params.page,
    perPage: params.perPage,
  };
}

export async function getListingByMlsId(mlsId: string | number): Promise<Listing | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("mls_id", typeof mlsId === "string" ? parseInt(mlsId, 10) : mlsId)
    .maybeSingle();
  if (error) throw new Error(`getListingByMlsId failed: ${error.message}`);
  return data as Listing | null;
}

export async function getTopListingsForStaticParams(limit = 500): Promise<{ mlsId: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("mls_id")
    .eq("status", "Active")
    .order("list_price", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`getTopListingsForStaticParams failed: ${error.message}`);
  return (data ?? []).map((row) => ({ mlsId: String(row.mls_id) }));
}

export async function getComparableSales(
  listing: Pick<Listing, "lat" | "lng" | "bedrooms" | "bathrooms" | "area" | "list_price" | "mls_id">,
  options: { radiusMiles?: number; monthsBack?: number; limit?: number } = {}
): Promise<ListingSummary[]> {
  const supabase = await createClient();
  const radius = options.radiusMiles ?? 1;
  const monthsBack = options.monthsBack ?? 6;
  const limit = options.limit ?? 6;

  if (listing.lat == null || listing.lng == null) return [];

  // 1 degree latitude ~= 69 miles. Approximate bounding box.
  const latDelta = radius / 69;
  const lngDelta = radius / (69 * Math.cos((listing.lat * Math.PI) / 180));
  const since = new Date();
  since.setMonth(since.getMonth() - monthsBack);

  const { data, error } = await supabase
    .from("listings")
    .select(SUMMARY_FIELDS)
    .eq("status", "Closed")
    .gte("lat", listing.lat - latDelta)
    .lte("lat", listing.lat + latDelta)
    .gte("lng", listing.lng - lngDelta)
    .lte("lng", listing.lng + lngDelta)
    .gte("modified", since.toISOString())
    .neq("mls_id", listing.mls_id)
    .limit(limit);

  if (error) throw new Error(`getComparableSales failed: ${error.message}`);
  return (data ?? []) as unknown as ListingSummary[];
}
