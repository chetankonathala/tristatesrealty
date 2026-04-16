import { createClient } from "@supabase/supabase-js";
import type { Lead, CreateLeadInput, LeadStatus } from "@/types/lead";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY required");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      user_id: input.user_id ?? null,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      message: input.message ?? null,
      listing_mls_id: input.listing_mls_id ?? null,
      community_name: input.community_name ?? null,
      floor_plan_name: input.floor_plan_name ?? null,
      listing_address: input.listing_address ?? null,
      listing_url: input.listing_url ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`createLead failed: ${error.message}`);
  return data as Lead;
}

export async function getAllLeads(): Promise<Lead[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getAllLeads failed: ${error.message}`);
  return (data ?? []) as Lead[];
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`updateLeadStatus failed: ${error.message}`);
  return data as Lead;
}
