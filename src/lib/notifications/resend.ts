import { Resend } from "resend";
import { ListingAlertEmail } from "@/emails/listing-alert";
import type { ListingSummary } from "@/types/listing";

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
