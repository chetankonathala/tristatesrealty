import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { sendNewLeadAlert } from "@/lib/notifications/resend";
import { sendNewLeadSms } from "@/lib/notifications/twilio";

// CRON_SECRET-gated synthetic-lead test. Used after deploy to verify that
// Resend + Twilio are correctly configured. Does NOT insert into the leads
// table — it only exercises the notification path.
export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${env.CRON_SECRET}`;
  if (auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const lead = {
    name: "Smoke Test Buyer",
    email: env.AGENT_EMAIL,
    phone: env.AGENT_PHONE,
    message: "This is a Phase 7 lead-routing smoke test. Ignore.",
    community_name: null,
    floor_plan_name: null,
    listing_address: "Synthetic Address, Lewes, DE 19958",
    listing_url: `${env.NEXT_PUBLIC_SITE_URL}/listings/0`,
    source: "direct" as const,
    list_price: 750000,
  };

  const [emailRes, smsRes] = await Promise.allSettled([
    sendNewLeadAlert(lead),
    sendNewLeadSms({
      name: lead.name,
      listing_address: lead.listing_address,
      community_name: lead.community_name,
      source: lead.source,
    }),
  ]);

  return NextResponse.json({
    email: emailRes.status === "fulfilled" ? emailRes.value : { error: String(emailRes.reason) },
    sms: smsRes.status === "fulfilled" ? smsRes.value : { error: String(smsRes.reason) },
    note: "Synthetic lead. Not persisted to DB.",
  });
}
