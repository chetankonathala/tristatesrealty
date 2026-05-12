// Next.js 16 instrumentation hook — runs once at server boot.
// Importing the env module here causes the zod schema to validate at startup,
// hard-failing the app if any required environment variable is missing
// (Phase 7 success criterion #2).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("@/lib/env");
  }
}
