import { Resend } from "resend";
import { ListingAlertEmail } from "@/emails/listing-alert";
import { NewLeadEmail } from "@/emails/new-lead";
import type { ListingSummary } from "@/types/listing";
import type { Lead } from "@/types/lead";
import { env } from "@/lib/env";

let cached: Resend | null = null;
function getClient(): Resend {
  if (!cached) cached = new Resend(env.RESEND_API_KEY);
  return cached;
}

export async function sendListingAlert(opts: {
  to: string;
  searchName: string;
  searchId: string;
  listings: ListingSummary[];
}): Promise<{ id: string | null }> {
  const resend = getClient();
  const baseUrl = env.NEXT_PUBLIC_SITE_URL;
  const subject =
    opts.listings.length === 1
      ? `A new home matches '${opts.searchName}'`
      : `${opts.listings.length} new homes match '${opts.searchName}'`;

  const result = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: opts.to,
    subject,
    react: ListingAlertEmail({
      searchName: opts.searchName,
      listings: opts.listings,
      manageUrl: `${baseUrl}/dashboard/saved-searches/${opts.searchId}`,
      unsubscribeUrl: `${baseUrl}/api/saved-searches/unsubscribe?id=${opts.searchId}`,
      baseUrl,
    }),
  });

  return { id: result.data?.id ?? null };
}

export async function sendNewLeadAlert(
  lead: Pick<
    Lead,
    | "name"
    | "email"
    | "phone"
    | "message"
    | "community_name"
    | "floor_plan_name"
    | "listing_address"
    | "listing_url"
    | "source"
    | "list_price"
  >
): Promise<{ id: string | null }> {
  const resend = getClient();
  const baseUrl = env.NEXT_PUBLIC_SITE_URL;
  const dashboardUrl = `${baseUrl}/agent/dashboard`;

  const result = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: env.AGENT_EMAIL,
    subject: `New buyer inquiry from ${lead.name}${lead.community_name ? ` — ${lead.community_name}` : ""}`,
    react: NewLeadEmail({ lead, dashboardUrl }),
  });

  return { id: result.data?.id ?? null };
}
