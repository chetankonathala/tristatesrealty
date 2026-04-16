export type LeadStatus = "New" | "Contacted" | "Closed";

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
}
