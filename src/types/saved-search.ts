import type { SearchParams } from "@/lib/schemas/search-params";

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  criteria: SearchParams;
  email_alerts: boolean;
  sms_alerts: boolean;
  alert_frequency: "instant" | "daily" | "weekly";
  phone_number: string | null;
  email_address: string | null;
  is_active: boolean;
  last_notified_at: string | null;
  last_seen_mls_ids: number[];
  last_seen_prices: Record<string, number> | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSavedSearchInput {
  name?: string;
  criteria: SearchParams;
  email_alerts?: boolean;
  sms_alerts?: boolean;
  alert_frequency?: "instant" | "daily" | "weekly";
  phone_number?: string | null;
  email_address?: string | null;
}
