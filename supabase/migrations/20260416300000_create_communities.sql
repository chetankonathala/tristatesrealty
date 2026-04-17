-- Communities table: one row per Schell Brothers community, synced from Heartbeat API
CREATE TABLE IF NOT EXISTS communities (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  community_id  TEXT UNIQUE NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  full_name     TEXT,
  description   TEXT,
  short_description TEXT,
  city          TEXT,
  state         TEXT,
  zip           TEXT,
  address       TEXT,
  lat           NUMERIC,
  lng           NUMERIC,
  price_from    NUMERIC,
  school_district    TEXT,
  school_elementary  TEXT,
  school_middle      TEXT,
  school_high        TEXT,
  hoa_fee            NUMERIC,
  hoa_yearly_fee     NUMERIC,
  hoa_name           TEXT,
  amenities          JSONB DEFAULT '[]',
  division_id        TEXT,
  division_name      TEXT,
  featured_image_url TEXT,
  is_sold_out        BOOLEAN DEFAULT FALSE,
  is_active          BOOLEAN DEFAULT TRUE,
  heartbeat_page_url TEXT,
  youtube_video_ids  TEXT[] DEFAULT '{}',
  custom_video_urls  TEXT[] DEFAULT '{}',
  seo_title          TEXT,
  seo_description    TEXT,
  sales_center_address TEXT,
  synced_at          TIMESTAMPTZ DEFAULT now(),
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_communities_slug ON communities(slug);
CREATE INDEX idx_communities_state ON communities(state);
CREATE INDEX idx_communities_active ON communities(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_communities_division ON communities(division_id);
CREATE INDEX idx_communities_community_id ON communities(community_id);

ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "communities_public_read" ON communities FOR SELECT USING (true);
CREATE POLICY "communities_service_write" ON communities FOR ALL USING (auth.role() = 'service_role');
