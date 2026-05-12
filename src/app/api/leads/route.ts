import { NextResponse } from "next/server";
import { z } from "zod";
import { createLead, lookupListingPrice } from "@/lib/supabase/queries/leads";
import { sendNewLeadAlert } from "@/lib/notifications/resend";
import { sendNewLeadSms } from "@/lib/notifications/twilio";
import { LEAD_SOURCES } from "@/types/lead";

const createLeadSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  message: z.string().max(2000).optional(),
  listing_mls_id: z.number().int().positive().optional(),
  community_name: z.string().max(200).optional(),
  floor_plan_name: z.string().max(200).optional(),
  listing_address: z.string().max(300).optional(),
  listing_url: z.string().url().optional(),
  list_price: z.number().positive().optional(),
  source: z.enum(LEAD_SOURCES as unknown as [string, ...string[]]).default("direct"),
  user_id: z.string().optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  try {
    // Denormalize price onto lead for dashboard rendering without join
    let list_price = parsed.data.list_price;
    if (list_price == null && parsed.data.listing_mls_id != null) {
      list_price = (await lookupListingPrice(parsed.data.listing_mls_id)) ?? undefined;
    }

    const lead = await createLead({
      ...parsed.data,
      source: parsed.data.source as (typeof LEAD_SOURCES)[number],
      list_price,
    });

    // Fire-and-forget — don't let email failure block the response
    sendNewLeadAlert({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      message: lead.message,
      community_name: lead.community_name,
      floor_plan_name: lead.floor_plan_name,
      listing_address: lead.listing_address,
      listing_url: lead.listing_url,
      list_price: lead.list_price,
      source: lead.source,
    }).catch((err) => {
      console.error("[leads] email notification failed:", err);
    });

    sendNewLeadSms({
      name: lead.name,
      listing_address: lead.listing_address,
      community_name: lead.community_name,
      source: lead.source,
    }).catch((err) => {
      console.error("[leads] SMS notification failed:", err);
    });

    return NextResponse.json({ id: lead.id }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create lead";
    console.error("[leads] createLead error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
