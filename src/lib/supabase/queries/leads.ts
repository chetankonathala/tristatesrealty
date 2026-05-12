import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Lead, CreateLeadInput, LeadStatus } from "@/types/lead";

let cachedClient: ReturnType<typeof createClient> | null = null;
function getServiceClient() {
  if (!cachedClient) {
    cachedClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return cachedClient;
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const supabase = getServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      list_price: input.list_price ?? null,
      source: input.source,
    } as never)
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

export async function lookupListingPrice(mlsId: number): Promise<number | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("listings")
    .select("list_price")
    .eq("mls_id", mlsId)
    .maybeSingle();
  if (error || !data) return null;
  const price = (data as { list_price?: number | string | null }).list_price;
  if (price == null) return null;
  const n = typeof price === "string" ? Number(price) : price;
  return Number.isFinite(n) ? n : null;
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("leads")
    .update({ status, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`updateLeadStatus failed: ${error.message}`);
  return data as Lead;
}
