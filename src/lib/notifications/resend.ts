import { Resend } from "resend";
import { ListingAlertEmail } from "@/emails/listing-alert";
import { NewLeadEmail } from "@/emails/new-lead";
import type { ListingSummary } from "@/types/listing";
import type { Lead } from "@/types/lead";

function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY missing");
  return new Resend(key);
}

export async function sendListingAlert(opts: {
  to: string;
  searchName: string;
  searchId: string;
  listings: ListingSummary[];
}): Promise<{ id: string | null }> {
  const resend = getClient();
  const from = process.env.RESEND_FROM_EMAIL ?? "alerts@tristatesrealty.com";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tristatesrealty.com";
  const subject =
    opts.listings.length === 1
      ? `A new home matches '${opts.searchName}'`
      : `${opts.listings.length} new homes match '${opts.searchName}'`;

  const result = await resend.emails.send({
    from,
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

export async function sendNewLeadAlert(lead: Pick<Lead, "name" | "email" | "phone" | "message" | "community_name" | "floor_plan_name" | "listing_address" | "listing_url">): Promise<{ id: string | null }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[resend] RESEND_API_KEY not set — skipping lead notification email");
    return { id: null };
  }

  const resend = getClient();
  const agentEmail = process.env.AGENT_EMAIL;
  if (!agentEmail) {
    console.warn("[resend] AGENT_EMAIL not set — skipping lead notification email");
    return { id: null };
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "leads@tristatesrealty.com";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tristatesrealty.vercel.app";
  const dashboardUrl = `${baseUrl}/agent/dashboard`;

  const result = await resend.emails.send({
    from,
    to: agentEmail,
    subject: `New buyer inquiry from ${lead.name}${lead.community_name ? ` — ${lead.community_name}` : ""}`,
    react: NewLeadEmail({ lead, dashboardUrl }),
  });

  return { id: result.data?.id ?? null };
}
