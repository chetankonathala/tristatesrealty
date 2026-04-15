CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Untitled search',
  criteria JSONB NOT NULL,
  email_alerts BOOLEAN DEFAULT TRUE,
  sms_alerts BOOLEAN DEFAULT FALSE,
  alert_frequency TEXT DEFAULT 'instant',
  phone_number TEXT,
  email_address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_notified_at TIMESTAMPTZ,
  last_seen_mls_ids INTEGER[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_active ON saved_searches(is_active) WHERE is_active = TRUE;

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Auth handled via Clerk → user_id is a TEXT (Clerk userId), not Supabase auth.uid().
-- All API routes use service role key + manual user_id check (no auth.uid()).
-- Block direct anon access entirely.
CREATE POLICY "saved_searches_no_anon" ON saved_searches FOR SELECT USING (false);
