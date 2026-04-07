-- Enable pgvector extension
create extension if not exists vector with schema public;

-- Placeholder listings table (expanded in Phase 2)
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  mls_id text unique,
  address text,
  city text,
  state text,
  zip text,
  price numeric,
  bedrooms integer,
  bathrooms numeric,
  sqft integer,
  property_type text,
  status text default 'active',
  description text,
  photos text[] default '{}',
  latitude numeric,
  longitude numeric,
  embedding vector(1536),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for vector similarity search
create index on listings using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Index for common queries
create index on listings (status, price);
create index on listings (city, state);
