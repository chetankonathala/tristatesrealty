-- Lead capture table: stores buyer inquiries submitted via listing contact forms.
-- Populated by POST /api/leads; read by the agent dashboard (/agent/dashboard).
-- All access via service role key in API routes; no client access.

CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,                          -- Clerk userId if signed in, null for anonymous
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  listing_mls_id INTEGER,               -- references listings.mls_id (not FK to avoid CASCADE issues)
  community_name TEXT,
  floor_plan_name TEXT,
  listing_address TEXT,
  listing_url TEXT,
  status TEXT NOT NULL DEFAULT 'New',   -- New | Contacted | Closed
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_listing ON leads(listing_mls_id);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- All access via service role key in API routes; block anon reads/writes.
CREATE POLICY "leads_no_anon" ON leads FOR ALL USING (false);
