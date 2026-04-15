import { createClient } from "@supabase/supabase-js";
import type { SavedSearch, CreateSavedSearchInput } from "@/types/saved-search";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Service role required");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export async function listSavedSearches(userId: string): Promise<SavedSearch[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("saved_searches")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listSavedSearches: ${error.message}`);
  return (data ?? []) as SavedSearch[];
}

export async function createSavedSearch(userId: string, input: CreateSavedSearchInput): Promise<SavedSearch> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("saved_searches")
    .insert({
      user_id: userId,
      name: input.name ?? "Untitled search",
      criteria: input.criteria,
      email_alerts: input.email_alerts ?? true,
      sms_alerts: input.sms_alerts ?? false,
      alert_frequency: input.alert_frequency ?? "instant",
      phone_number: input.phone_number ?? null,
      email_address: input.email_address ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(`createSavedSearch: ${error.message}`);
  return data as SavedSearch;
}

export async function deleteSavedSearch(userId: string, id: string): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("saved_searches")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(`deleteSavedSearch: ${error.message}`);
}

export async function listAllActiveSavedSearches(): Promise<SavedSearch[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("saved_searches")
    .select("*")
    .eq("is_active", true);
  if (error) throw new Error(`listAllActiveSavedSearches: ${error.message}`);
  return (data ?? []) as SavedSearch[];
}
