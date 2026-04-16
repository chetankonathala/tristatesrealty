import type { HeartbeatCommunity, HeartbeatFloorPlan } from "./types";

const SCHELL_BASE = "https://schellbrothers.com";

// Convert s3://heartbeat-page-designer-production/... to public HTTPS URL
function s3ToHttps(s3Path: string): string {
  return s3Path.replace(
    "s3://heartbeat-page-designer-production/",
    "https://heartbeat-page-designer-production.s3.amazonaws.com/"
  );
}

// Deterministic stable integer ID from community_id + listing_id
// Uses community_id * 100_000 + listing_id; safe within PostgreSQL INTEGER range (max ~2.1B)
function toMlsId(communityId: string, listingId: string): number {
  return parseInt(communityId, 10) * 100_000 + parseInt(listingId, 10);
}

// Collect all available photos for a floor plan
function collectPhotos(
  community: HeartbeatCommunity,
  plan: HeartbeatFloorPlan
): string[] {
  const photos: string[] = [];

  // 1. Floor plan card thumbnail (best quality resized image)
  const cardUrl = plan["image-url"];
  if (cardUrl) photos.push(cardUrl);

  // 2. Featured floor plan image
  if (plan.featured_image_url) photos.push(plan.featured_image_url);

  // 3. Elevation images from the elevation array
  if (plan.elevations && plan.elevations.length > 0) {
    for (const elev of plan.elevations) {
      if (elev.image_path && !elev.is_hidden) {
        const url = s3ToHttps(elev.image_path);
        if (!photos.includes(url)) photos.push(url);
      }
    }
  }

  // 4. Community featured image as a fallback final photo
  if (community.featured_image_url && !photos.includes(community.featured_image_url)) {
    photos.push(community.featured_image_url);
  }

  return photos.filter(Boolean);
}

export interface SchellListingRow {
  mls_id: number;
  listing_id: string;
  list_price: number;
  status: string;
  type: string;
  address_full: string;
  address_street: string | null;
  address_city: string;
  address_state: string;
  address_postal_code: string | null;
  address_county: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  lat: number | null;
  lng: number | null;
  geo_market_area: string | null;
  remarks: string | null;
  photos: string[];
  virtual_tour_url: string | null;
  listing_agent_name: string | null;
  listing_agent_phone: string | null;
  listing_agent_email: string | null;
  listing_office_name: string;
  hoa_fee: number | null;
  hoa_frequency: string | null;
  school_district: string | null;
  school_elementary: string | null;
  school_middle: string | null;
  school_high: string | null;
  new_construction: boolean;
  waterfront: boolean;
  features: string[];
  raw_data: Record<string, unknown>;
  synced_at: string;
}

export function transformFloorPlan(
  community: HeartbeatCommunity,
  plan: HeartbeatFloorPlan
): SchellListingRow {
  const agentName = process.env.AGENT_NAME ?? null;
  const agentPhone = process.env.AGENT_PHONE ?? null;
  const agentEmail = process.env.AGENT_EMAIL ?? null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tristatesrealty.vercel.app";

  const mls_id = toMlsId(community.community_id, plan.listing_id);

  // Build address string from community fields
  const city = community.city ?? "";
  const state = community.state ?? "DE";
  const zip = community.zip ?? "";
  const street = community.sales_center_address ?? community.address ?? null;
  const address_full =
    community.sales_center_address_string ??
    (street ? `${street}, ${city}, ${state} ${zip}`.trim() : `${city}, ${state} ${zip}`.trim());

  // Price: use incentive price if available, otherwise base price
  const rawPrice = plan.incentive_price || plan.base_price;
  const list_price = Math.round(parseFloat(rawPrice));

  const bedrooms = plan.min_bedrooms ? parseInt(plan.min_bedrooms, 10) : null;
  const bathrooms = plan.min_bathrooms ? parseFloat(plan.min_bathrooms) : null;
  const area = plan.base_heated_square_feet ? parseInt(plan.base_heated_square_feet, 10) : null;

  const lat = community.lat && community.lat !== "0.00000000" ? parseFloat(community.lat) : null;
  const lng = community.lng && community.lng !== "0.00000000" ? parseFloat(community.lng) : null;

  const photos = collectPhotos(community, plan);

  // HOA
  const hoa_fee = community.hoa_monthly_fee ? parseFloat(community.hoa_monthly_fee) : null;

  // Amenities as features array
  const amenityNames = Array.isArray(community.amenities)
    ? community.amenities.map((a) => a.name).filter(Boolean)
    : [];

  // Remarks: combine floor plan description and community short description
  const remarks = [plan.description, community.short_description]
    .filter(Boolean)
    .join("\n\n")
    .trim() || null;

  return {
    mls_id,
    listing_id: `schell-${community.community_id}-${plan.listing_id}`,
    list_price,
    status: "Active",
    type: "residential",
    address_full,
    address_street: street,
    address_city: city,
    address_state: state,
    address_postal_code: zip || null,
    address_county: null,
    bedrooms,
    bathrooms,
    area,
    lat,
    lng,
    geo_market_area: community.marketing_name,
    remarks,
    photos,
    virtual_tour_url: plan.virtual_tour_url ?? null,
    listing_agent_name: agentName,
    listing_agent_phone: agentPhone,
    listing_agent_email: agentEmail,
    listing_office_name: "Schell Brothers",
    hoa_fee,
    hoa_frequency: hoa_fee ? "Monthly" : null,
    school_district: community.school_district,
    school_elementary: community.school_elementary,
    school_middle: community.school_middle,
    school_high: community.school_high,
    new_construction: true,
    waterfront: false,
    features: amenityNames,
    raw_data: {
      source: "schell",
      communityId: community.community_id,
      communitySlug: community.slug,
      communityName: community.marketing_name,
      communityUrl: `${SCHELL_BASE}${community.page_url}`,
      planId: plan.listing_id,
      planName: plan.name,
      planUrl: `${SCHELL_BASE}${plan.url}`,
      listingUrl: `${siteUrl}/listings/${mls_id}`,
      bedRange: `${plan.min_bedrooms}–${plan.max_bedrooms}`,
      bathRange: `${plan.min_bathrooms}–${plan.max_bathrooms}`,
      sqftRange: `${plan.base_heated_square_feet}–${plan.max_heated_square_feet}`,
      basePrice: parseFloat(plan.base_price),
      incentivePrice: plan.incentive_price ? parseFloat(plan.incentive_price) : null,
      amenities: amenityNames,
      hoaMonthly: hoa_fee,
    },
    synced_at: new Date().toISOString(),
  };
}
