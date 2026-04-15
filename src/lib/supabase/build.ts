/**
 * Build-time Supabase client — no cookies, no request context.
 * Use ONLY inside `generateStaticParams` and other build-phase code
 * that runs outside an HTTP request boundary.
 *
 * For server components and route handlers, use `createClient` from
 * `@/lib/supabase/server` instead.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createBuildClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
