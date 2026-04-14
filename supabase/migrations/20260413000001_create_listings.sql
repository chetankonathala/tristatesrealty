-- Drop placeholder listings table created in Phase 1 pgvector migration.
-- The Phase 1 table used uuid PK and text mls_id; Phase 2 requires INTEGER mls_id and BIGINT identity PK.
DROP TABLE IF EXISTS listings CASCADE;

CREATE TABLE IF NOT EXISTS listings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  mls_id INTEGER UNIQUE NOT NULL,
  listing_id TEXT,
  list_price NUMERIC NOT NULL,
  list_date TIMESTAMPTZ,
  modified TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Active',
  type TEXT,
  subtype TEXT,
  address_full TEXT NOT NULL,
  address_street TEXT,
  address_city TEXT NOT NULL,
  address_state TEXT NOT NULL,
  address_postal_code TEXT,
  address_county TEXT,
  bedrooms INTEGER,
  bathrooms NUMERIC,
  area NUMERIC,
  lot_size NUMERIC,
  year_built INTEGER,
  stories INTEGER,
  garage_spaces INTEGER,
  pool TEXT,
  lat NUMERIC,
  lng NUMERIC,
  geo_market_area TEXT,
  remarks TEXT,
  photos TEXT[] NOT NULL DEFAULT '{}',
  virtual_tour_url TEXT,
  listing_agent_name TEXT,
  listing_agent_phone TEXT,
  listing_agent_email TEXT,
  listing_office_name TEXT,
  listing_office_phone TEXT,
  co_agent_name TEXT,
  days_on_market INTEGER,
  school_district TEXT,
  school_elementary TEXT,
  school_middle TEXT,
  school_high TEXT,
  tax_annual_amount NUMERIC,
  hoa_fee NUMERIC,
  hoa_frequency TEXT,
  features TEXT[] DEFAULT '{}',
  waterfront BOOLEAN DEFAULT FALSE,
  new_construction BOOLEAN DEFAULT FALSE,
  open_house_date TIMESTAMPTZ,
  raw_data JSONB,
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(list_price);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(address_city);
CREATE INDEX IF NOT EXISTS idx_listings_state ON listings(address_state);
CREATE INDEX IF NOT EXISTS idx_listings_county ON listings(address_county);
CREATE INDEX IF NOT EXISTS idx_listings_postal ON listings(address_postal_code);
CREATE INDEX IF NOT EXISTS idx_listings_beds ON listings(bedrooms);
CREATE INDEX IF NOT EXISTS idx_listings_baths ON listings(bathrooms);
CREATE INDEX IF NOT EXISTS idx_listings_area ON listings(area);
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(type);
CREATE INDEX IF NOT EXISTS idx_listings_modified ON listings(modified);
CREATE INDEX IF NOT EXISTS idx_listings_geo ON listings(lat, lng);
CREATE INDEX IF NOT EXISTS idx_listings_waterfront ON listings(waterfront) WHERE waterfront = TRUE;
CREATE INDEX IF NOT EXISTS idx_listings_open_house ON listings(open_house_date) WHERE open_house_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_features ON listings USING GIN(features);
CREATE INDEX IF NOT EXISTS idx_listings_search ON listings(status, address_state, list_price, bedrooms);

-- Row-level security: listings are publicly readable (IDX requirement), no insert/update from client.
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listings_public_read" ON listings FOR SELECT USING (true);
