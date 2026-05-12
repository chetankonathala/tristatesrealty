import { z } from "zod";

const twilioSchema = z
  .object({
    TWILIO_ACCOUNT_SID: z.string().min(1).optional(),
    TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
    TWILIO_FROM_NUMBER: z.string().min(1).optional(),
  })
  .refine(
    (v) => {
      const set = [v.TWILIO_ACCOUNT_SID, v.TWILIO_AUTH_TOKEN, v.TWILIO_FROM_NUMBER].filter(Boolean).length;
      return set === 0 || set === 3;
    },
    { message: "Twilio vars must be all set or all unset (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER)" }
  );

const baseSchema = z.object({
  // Lead routing — REQUIRED. App must hard-fail without these (Phase 7 success #2).
  AGENT_EMAIL: z.string().email("AGENT_EMAIL must be a valid email"),
  AGENT_NAME: z.string().min(1, "AGENT_NAME is required"),
  AGENT_PHONE: z.string().min(7, "AGENT_PHONE is required"),

  // Resend
  RESEND_API_KEY: z.string().startsWith("re_", "RESEND_API_KEY must start with re_"),
  RESEND_FROM_EMAIL: z.string().email().default("leads@tristatesrealty.com"),

  // Anthropic (chat)
  ANTHROPIC_API_KEY: z.string().min(10, "ANTHROPIC_API_KEY is required"),

  // Cron + site
  CRON_SECRET: z.string().min(16, "CRON_SECRET must be at least 16 chars"),
  NEXT_PUBLIC_SITE_URL: z.string().url("NEXT_PUBLIC_SITE_URL must be a URL"),

  // Supabase (server)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
});

function loadEnv() {
  const trimmed: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(process.env)) {
    trimmed[k] = typeof v === "string" ? v.trim() : v;
  }

  const base = baseSchema.safeParse(trimmed);
  const twilio = twilioSchema.safeParse(trimmed);

  if (!base.success || !twilio.success) {
    const issues: string[] = [];
    if (!base.success) {
      for (const issue of base.error.issues) issues.push(`${issue.path.join(".")}: ${issue.message}`);
    }
    if (!twilio.success) {
      for (const issue of twilio.error.issues) issues.push(`${issue.path.join(".")}: ${issue.message}`);
    }
    throw new Error(`[env] Invalid environment variables:\n  - ${issues.join("\n  - ")}`);
  }

  return { ...base.data, ...twilio.data };
}

export const env = loadEnv();

export function hasTwilio(): boolean {
  return Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM_NUMBER);
}
