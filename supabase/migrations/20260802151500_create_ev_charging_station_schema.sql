-- Migration: 20260802151500_create_ev_charging_station_schema.sql
-- Description: Detailed schema for EV Charging Stations, Connectors, Pricing, Access, Status History, and Amenities

-- Create custom enum types
DO $$ BEGIN
  CREATE TYPE plug_type_enum AS ENUM ('CCS1', 'CCS2', 'NACS', 'CHAdeMO', 'J1772', 'Type2', 'GBT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE charging_level_enum AS ENUM ('L1', 'L2', 'DCFC');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE site_type_enum AS ENUM ('public', 'workplace', 'fleet', 'residential', 'retail', 'highway_corridor');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE access_type_enum AS ENUM ('public', 'restricted', 'private');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE operational_status_enum AS ENUM ('active', 'down', 'under_maintenance', 'planned', 'decommissioned');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE data_source_enum AS ENUM ('field_visit', 'operator_api', 'crowdsourced', 'scraped');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE location_accuracy_enum AS ENUM ('gps_onsite', 'geocoded_address', 'manual_pin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. Main Stations Table
CREATE TABLE IF NOT EXISTS ev_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_station_id VARCHAR(100) UNIQUE NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  network_operator VARCHAR(100) NOT NULL,
  address_street VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  zip VARCHAR(20),
  country VARCHAR(100) DEFAULT 'USA',
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  location_accuracy location_accuracy_enum DEFAULT 'geocoded_address',
  site_type site_type_enum DEFAULT 'public',
  num_stalls_total INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for geospatial and filtering queries
CREATE INDEX IF NOT EXISTS idx_ev_stations_lat_lng ON ev_stations (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_ev_stations_operator ON ev_stations (network_operator);
CREATE INDEX IF NOT EXISTS idx_ev_stations_site_type ON ev_stations (site_type);

-- 2. Station Connectors Table
CREATE TABLE IF NOT EXISTS ev_station_connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES ev_stations(id) ON DELETE CASCADE,
  plug_type plug_type_enum NOT NULL,
  charging_level charging_level_enum NOT NULL,
  power_output_kw NUMERIC(6, 2) NOT NULL,
  num_connectors INT NOT NULL DEFAULT 1,
  ocpp_version VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ev_connectors_station_id ON ev_station_connectors (station_id);
CREATE INDEX IF NOT EXISTS idx_ev_connectors_plug_type ON ev_station_connectors (plug_type);

-- 3. Pricing Table
CREATE TABLE IF NOT EXISTS ev_station_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES ev_stations(id) ON DELETE CASCADE,
  connector_id UUID REFERENCES ev_station_connectors(id) ON DELETE CASCADE,
  rate_per_kwh NUMERIC(8, 4),
  rate_per_minute NUMERIC(8, 4),
  rate_per_minute_tiered JSONB, -- For power-level tiered pricing
  session_fee NUMERIC(8, 2) DEFAULT 0.00,
  idle_fee NUMERIC(8, 2) DEFAULT 0.00,
  parking_fee NUMERIC(8, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'USD',
  membership_required BOOLEAN DEFAULT FALSE,
  membership_network_name VARCHAR(100), -- Specific network/app name required
  payment_methods TEXT[] DEFAULT ARRAY['app', 'credit_card_tap'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ev_pricing_station_id ON ev_station_pricing (station_id);

-- 4. Access & Hours Table
CREATE TABLE IF NOT EXISTS ev_station_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES ev_stations(id) ON DELETE CASCADE UNIQUE,
  access_type access_type_enum DEFAULT 'public',
  hours_of_operation VARCHAR(255) DEFAULT '24/7',
  reservation_available BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Time-Series Status & Verification History Table
CREATE TABLE IF NOT EXISTS ev_station_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES ev_stations(id) ON DELETE CASCADE,
  operational_status operational_status_enum NOT NULL DEFAULT 'active',
  install_date DATE,
  last_verified_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_source data_source_enum NOT NULL DEFAULT 'operator_api',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ev_status_station_id ON ev_station_status_history (station_id);
CREATE INDEX IF NOT EXISTS idx_ev_status_last_verified ON ev_station_status_history (last_verified_date DESC);

-- 6. Amenities Table
CREATE TABLE IF NOT EXISTS ev_station_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID NOT NULL REFERENCES ev_stations(id) ON DELETE CASCADE UNIQUE,
  amenities_nearby TEXT[] DEFAULT ARRAY[]::TEXT[],
  lighting BOOLEAN DEFAULT FALSE,
  security_cameras BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Public Read, Authenticated Write)
ALTER TABLE ev_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ev_station_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ev_station_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE ev_station_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE ev_station_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ev_station_amenities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Stations" ON ev_stations FOR SELECT USING (true);
CREATE POLICY "Public Read Connectors" ON ev_station_connectors FOR SELECT USING (true);
CREATE POLICY "Public Read Pricing" ON ev_station_pricing FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON ev_station_access FOR SELECT USING (true);
CREATE POLICY "Public Read Status History" ON ev_station_status_history FOR SELECT USING (true);
CREATE POLICY "Public Read Amenities" ON ev_station_amenities FOR SELECT USING (true);

-- Flattened View for Easy Querying & Exports
CREATE OR REPLACE VIEW view_ev_charging_stations_full AS
SELECT 
  s.id AS internal_station_id,
  s.custom_station_id AS station_id,
  s.location_name,
  s.network_operator,
  s.address_street,
  s.city,
  s.state,
  s.zip,
  s.country,
  s.latitude,
  s.longitude,
  s.location_accuracy,
  s.site_type,
  s.num_stalls_total,
  c.id AS connector_id,
  c.plug_type,
  c.charging_level,
  c.power_output_kw,
  c.num_connectors,
  c.ocpp_version,
  p.rate_per_kwh,
  p.rate_per_minute,
  p.rate_per_minute_tiered,
  p.session_fee,
  p.idle_fee,
  p.parking_fee,
  p.currency,
  p.membership_required,
  p.membership_network_name,
  p.payment_methods,
  a.access_type,
  a.hours_of_operation,
  a.reservation_available,
  sh.operational_status,
  sh.install_date,
  sh.last_verified_date,
  sh.data_source,
  am.amenities_nearby,
  am.lighting,
  am.security_cameras,
  am.photo_url
FROM ev_stations s
LEFT JOIN ev_station_connectors c ON c.station_id = s.id
LEFT JOIN ev_station_pricing p ON p.station_id = s.id AND (p.connector_id IS NULL OR p.connector_id = c.id)
LEFT JOIN ev_station_access a ON a.station_id = s.id
LEFT JOIN LATERAL (
  SELECT * FROM ev_station_status_history 
  WHERE station_id = s.id 
  ORDER BY last_verified_date DESC 
  LIMIT 1
) sh ON TRUE
LEFT JOIN ev_station_amenities am ON am.station_id = s.id;

