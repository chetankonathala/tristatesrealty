import { createClient } from "@/lib/supabase/server";
import type { Community, CommunityCardData } from "@/types/community";
import type { Listing } from "@/types/listing";

const COMMUNITY_FIELDS = `
  id, community_id, slug, name, full_name, description, short_description,
  city, state, zip, address, lat, lng, price_from,
  school_district, school_elementary, school_middle, school_high,
  hoa_fee, hoa_yearly_fee, hoa_name, amenities,
  division_id, division_name, featured_image_url,
  is_sold_out, is_active, heartbeat_page_url,
  youtube_video_ids, custom_video_urls,
  seo_title, seo_description, sales_center_address,
  synced_at, created_at, updated_at
`;

const CARD_FIELDS = `slug, name, city, state, price_from, featured_image_url, is_sold_out`;

export async function getCommunityBySlug(slug: string): Promise<Community | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("communities")
    .select(COMMUNITY_FIELDS)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (error || !data) return null;
  return data as Community;
}

export async function getAllCommunities(opts?: { activeOnly?: boolean }): Promise<CommunityCardData[]> {
  const supabase = await createClient();
  let query = supabase.from("communities").select(CARD_FIELDS);
  if (opts?.activeOnly !== false) {
    query = query.eq("is_active", true);
  }
  const { data } = await query.order("is_sold_out", { ascending: true }).order("name");
  return (data ?? []) as CommunityCardData[];
}

export async function getCommunityListings(communityId: string): Promise<Listing[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "Active")
    .filter("raw_data->>communityId", "eq", communityId)
    .order("list_price", { ascending: true });
  return (data ?? []) as Listing[];
}

export async function getCommunityFloorPlanCount(communityId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "Active")
    .filter("raw_data->>communityId", "eq", communityId);
  return count ?? 0;
}
