// Types matching the Heartbeat CMS API responses from schellbrothers.com
// API base: https://heartbeat.schellbrothers.com/?engine=data-warehouse&widget=admin/page-designer&opt=data

export interface HeartbeatCommunity {
  community_id: string;
  marketing_name: string;
  community_marketing_name: string;
  marketing_description: string;
  slug: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  lat: string;
  lng: string;
  page_url: string;
  priced_from: string;
  short_description: string;
  school_district: string | null;
  school_elementary: string | null;
  school_middle: string | null;
  school_high: string | null;
  hoa_name: string | null;
  hoa_monthly_fee: string | null;
  hoa_yearly_fee: string | null;
  is_sold_out: "0" | "1" | null;
  is_build_on_your_lot: "0" | "1";
  is_marketing_active: string | null;
  division_parent_id: string;
  division_parent_marketing_name: string;
  featured_image_url: string | null;
  featured_image_thumbnail_url: string | null;
  sales_center_address: string | null;
  sales_center_address_string: string | null;
  amenities: HeartbeatAmenity[] | null;
  spec_homes: HeartbeatSpecHome[] | null;
  model_homes: string | null;
}

export interface HeartbeatAmenity {
  name: string;
  icon?: string;
}

export interface HeartbeatSpecHome {
  name: string;
  home_id: string;
  lot_block_number: string;
  url: string;
}

export interface HeartbeatElevation {
  kova_name: string;
  is_included: number;
  is_thumbnail: number;
  is_hidden: string | null;
  image_path: string; // s3://heartbeat-page-designer-production/...
  index: number;
}

export interface HeartbeatFloorPlan {
  listing_id: string;
  community_listing_id: string;
  community_id: string;
  community_parent_id: string;
  division_parent_id: string;
  name: string;
  marketing_name: string;
  description: string;
  min_bedrooms: string;
  max_bedrooms: string;
  min_bathrooms: string;
  max_bathrooms: string;
  base_heated_square_feet: string;
  max_heated_square_feet: string;
  heated_sqft: string;
  base_total_square_feet: string;
  base_price: string;
  incentive_price: string | null;
  price: string;
  url: string; // e.g. /delaware-beaches/cardinal-grove/camden/
  featured_image_url: string | null;
  "image-url": string | null;
  elevations: HeartbeatElevation[];
  virtual_tour_url: string | null;
  community_name: string;
  community_marketing_name: string;
  is_marketing_active: string;
  model_type: string | null;
  filters: string[] | null;
}
