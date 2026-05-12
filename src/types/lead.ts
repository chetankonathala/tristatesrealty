export type LeadStatus = "New" | "Contacted" | "Closed";

export type LeadSource =
  | "ai_chat"
  | "map_click"
  | "filter_search"
  | "community_page"
  | "direct";

export const LEAD_SOURCES: readonly LeadSource[] = [
  "ai_chat",
  "map_click",
  "filter_search",
  "community_page",
  "direct",
] as const;

export interface Lead {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  listing_mls_id: number | null;
  community_name: string | null;
  floor_plan_name: string | null;
  listing_address: string | null;
  listing_url: string | null;
  list_price: number | null;
  source: LeadSource;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadInput {
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  listing_mls_id?: number;
  community_name?: string;
  floor_plan_name?: string;
  listing_address?: string;
  listing_url?: string;
  list_price?: number;
  source: LeadSource;
}
