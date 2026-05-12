// Minimal Twilio REST client (no SDK to keep deps small)
import { env, hasTwilio } from "@/lib/env";

async function postSms(to: string, body: string, label: string): Promise<{ sid: string | null }> {
  if (!hasTwilio()) {
    console.warn(`[twilio] ${label}: Twilio not configured, skipping SMS`);
    return { sid: null };
  }
  const sid = env.TWILIO_ACCOUNT_SID!;
  const token = env.TWILIO_AUTH_TOKEN!;
  const from = env.TWILIO_FROM_NUMBER!;

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const params = new URLSearchParams({ To: to, From: from, Body: body });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  );

  if (!res.ok) {
    console.error(`[twilio] ${label} failed:`, res.status, await res.text());
    return { sid: null };
  }

  const data = (await res.json().catch(() => ({}))) as { sid?: string };
  return { sid: data.sid ?? null };
}

export async function sendListingAlertSms(opts: {
  to: string;
  searchName: string;
  matchCount: number;
  firstListingUrl: string;
}): Promise<void> {
  const body =
    opts.matchCount === 1
      ? `Tri States Realty: 1 new home matches '${opts.searchName}'. ${opts.firstListingUrl}`
      : `Tri States Realty: ${opts.matchCount} new homes match '${opts.searchName}'. ${opts.firstListingUrl}`;
  await postSms(opts.to, body, "alert SMS");
}

export async function sendNewLeadSms(lead: {
  name: string;
  listing_address?: string | null;
  community_name?: string | null;
  source?: string | null;
}): Promise<{ sid: string | null }> {
  const context = lead.listing_address ?? lead.community_name ?? "a listing";
  const sourceTag = lead.source && lead.source !== "direct" ? ` [${lead.source}]` : "";
  const body = `New lead from ${lead.name}${sourceTag} about ${context}. Check your email for details.`;
  return postSms(env.AGENT_PHONE, body, "lead SMS");
}
