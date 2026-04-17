import type { Listing } from "./listing";

export interface Community {
  id: number;
  community_id: string;
  slug: string;
  name: string;
  full_name: string | null;
  description: string | null;
  short_description: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  price_from: number | null;
  school_district: string | null;
  school_elementary: string | null;
  school_middle: string | null;
  school_high: string | null;
  hoa_fee: number | null;
  hoa_yearly_fee: number | null;
  hoa_name: string | null;
  amenities: { name: string; icon?: string }[];
  division_id: string | null;
  division_name: string | null;
  featured_image_url: string | null;
  is_sold_out: boolean;
  is_active: boolean;
  heartbeat_page_url: string | null;
  youtube_video_ids: string[];
  custom_video_urls: string[];
  seo_title: string | null;
  seo_description: string | null;
  sales_center_address: string | null;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityWithListings extends Community {
  listings: Listing[];
}

export interface CommunityCardData {
  slug: string;
  name: string;
  city: string | null;
  state: string | null;
  price_from: number | null;
  featured_image_url: string | null;
  is_sold_out: boolean;
}
