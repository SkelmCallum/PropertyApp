-- Properties table for scraped listings
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('private_property', 'property24', 'facebook', 'country', 'gantri')),
  source_url TEXT NOT NULL,
  
  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'house', 'townhouse', 'studio', 'room', 'other')),
  
  -- Location
  address TEXT,
  suburb TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL DEFAULT 'Western Cape',
  postal_code TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  
  -- Pricing
  price DECIMAL(12, 2) NOT NULL,
  price_frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (price_frequency IN ('monthly', 'weekly', 'daily')),
  deposit DECIMAL(12, 2),
  
  -- Features
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 0,
  parking INTEGER NOT NULL DEFAULT 0,
  size_sqm DECIMAL(10, 2),
  furnished BOOLEAN NOT NULL DEFAULT FALSE,
  pet_friendly BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Media
  images TEXT[] DEFAULT '{}',
  
  -- Contact
  agent_name TEXT,
  agent_phone TEXT,
  agent_email TEXT,
  agency_name TEXT,
  
  -- Scam detection
  scam_score DECIMAL(3, 2) NOT NULL DEFAULT 0 CHECK (scam_score >= 0 AND scam_score <= 1),
  scam_flags TEXT[] DEFAULT '{}',
  
  -- Metadata
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rented', 'expired')),
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint on source + external_id to prevent duplicates
  UNIQUE(source, external_id)
);

-- Indexes for common queries
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_suburb ON public.properties(suburb);
CREATE INDEX idx_properties_price ON public.properties(price);
CREATE INDEX idx_properties_bedrooms ON public.properties(bedrooms);
CREATE INDEX idx_properties_source ON public.properties(source);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_scam_score ON public.properties(scam_score);
CREATE INDEX idx_properties_created_at ON public.properties(created_at DESC);
CREATE INDEX idx_properties_location ON public.properties(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Full text search index
CREATE INDEX idx_properties_search ON public.properties USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || suburb || ' ' || city));

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Properties are publicly readable
CREATE POLICY "Properties are viewable by everyone"
  ON public.properties FOR SELECT
  USING (true);

-- Only service role can insert/update/delete
CREATE POLICY "Service role can manage properties"
  ON public.properties FOR ALL
  USING (auth.role() = 'service_role');

-- Apply updated_at trigger
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

