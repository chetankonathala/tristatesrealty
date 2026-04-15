-- Add last_seen_prices column for price-drop trigger detection in the saved-search notify cron.
-- last_seen_mls_ids and last_notified_at already exist from 02-09 migration; add if not present to be safe.
ALTER TABLE saved_searches ADD COLUMN IF NOT EXISTS last_seen_prices JSONB DEFAULT '{}'::jsonb;
ALTER TABLE saved_searches ADD COLUMN IF NOT EXISTS last_seen_mls_ids INTEGER[] DEFAULT '{}';
ALTER TABLE saved_searches ADD COLUMN IF NOT EXISTS last_notified_at TIMESTAMPTZ;
