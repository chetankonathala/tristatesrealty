-- Phase 7: lead source tagging (LEAD-02) + denormalized list price for dashboard.
-- One enum-like CHECK avoids needing a separate Postgres ENUM type.

ALTER TABLE leads
  ADD COLUMN source TEXT NOT NULL DEFAULT 'direct'
    CHECK (source IN ('ai_chat', 'map_click', 'filter_search', 'community_page', 'direct')),
  ADD COLUMN list_price NUMERIC(12, 2);

CREATE INDEX idx_leads_source ON leads(source);
