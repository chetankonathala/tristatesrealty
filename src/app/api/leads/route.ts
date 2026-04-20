import { NextResponse } from "next/server";
import { z } from "zod";
import { createLead } from "@/lib/supabase/queries/leads";
import { sendNewLeadAlert } from "@/lib/notifications/resend";
import { sendNewLeadSms } from "@/lib/notifications/twilio";

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
    const lead = await createLead(parsed.data);

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
    }).catch((err) => {
      console.error("[leads] email notification failed:", err);
    });

    // Fire-and-forget SMS — don't let SMS failure block the response
    sendNewLeadSms({
      name: lead.name,
      listing_address: lead.listing_address,
      community_name: lead.community_name,
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
