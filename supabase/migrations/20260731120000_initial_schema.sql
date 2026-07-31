-- =============================================================================
-- EV Charging Network — Initial schema (Supabase Postgres only)
-- Auth is custom JWT in the Next.js app — NOT Supabase Auth.
-- The Next.js server uses the service_role key; RLS locks down anon access.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- Actors (custom auth — password_hash verified in Next.js Route Handlers)
-- =============================================================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL
    CHECK (role IN ('super_admin', 'staff', 'vendor', 'owner', 'driver')),
  full_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  tier TEXT NOT NULL DEFAULT 'standard'
    CHECK (tier IN ('standard', 'partner')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER vendors_set_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.terminal_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_type TEXT NOT NULL
    CHECK (owner_type IN ('individual', 'business')),
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER terminal_owners_set_updated_at
  BEFORE UPDATE ON public.terminal_owners
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.users (id) ON DELETE SET NULL,
  phone_number TEXT UNIQUE,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER drivers_set_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.vendor_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  member_role TEXT NOT NULL DEFAULT 'member'
    CHECK (member_role IN ('admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, user_id)
);

CREATE TABLE public.owner_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.terminal_owners (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  member_role TEXT NOT NULL DEFAULT 'member'
    CHECK (member_role IN ('admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id, user_id)
);

CREATE INDEX vendor_members_user_id_idx ON public.vendor_members (user_id);
CREATE INDEX owner_members_user_id_idx ON public.owner_members (user_id);

-- =============================================================================
-- Terminals
-- =============================================================================

CREATE TABLE public.terminals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  city TEXT,
  address TEXT,
  connector_type TEXT,
  charger_class TEXT
    CHECK (charger_class IS NULL OR charger_class IN ('AC', 'DC')),
  power_kw NUMERIC(6, 2),
  price_per_kwh NUMERIC(8, 2),
  operating_hours TEXT,
  amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
  connectivity_tier TEXT NOT NULL DEFAULT 'listed'
    CHECK (connectivity_tier IN (
      'listed',
      'sensor_augmented',
      'connected_demo',
      'connected_live'
    )),
  current_vendor_id UUID REFERENCES public.vendors (id) ON DELETE SET NULL,
  current_owner_id UUID REFERENCES public.terminal_owners (id) ON DELETE SET NULL,
  source TEXT
    CHECK (source IS NULL OR source IN ('scraped', 'manual', 'vendor_submitted')),
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER terminals_set_updated_at
  BEFORE UPDATE ON public.terminals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX terminals_location_idx ON public.terminals (latitude, longitude);
CREATE INDEX terminals_city_idx ON public.terminals (city);
CREATE INDEX terminals_connectivity_tier_idx ON public.terminals (connectivity_tier);
CREATE INDEX terminals_current_vendor_id_idx ON public.terminals (current_vendor_id);
CREATE INDEX terminals_current_owner_id_idx ON public.terminals (current_owner_id);

CREATE TABLE public.terminal_vendor_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id UUID NOT NULL REFERENCES public.terminals (id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors (id) ON DELETE RESTRICT,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  CHECK (ended_at IS NULL OR ended_at >= installed_at)
);

CREATE INDEX terminal_vendor_history_terminal_id_idx
  ON public.terminal_vendor_history (terminal_id);
CREATE INDEX terminal_vendor_history_vendor_id_idx
  ON public.terminal_vendor_history (vendor_id);

CREATE TABLE public.terminal_ownership_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id UUID NOT NULL REFERENCES public.terminals (id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.terminal_owners (id) ON DELETE RESTRICT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE INDEX terminal_ownership_history_terminal_id_idx
  ON public.terminal_ownership_history (terminal_id);
CREATE INDEX terminal_ownership_history_owner_id_idx
  ON public.terminal_ownership_history (owner_id);

CREATE TABLE public.connectivity_tier_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id UUID NOT NULL REFERENCES public.terminals (id) ON DELETE CASCADE,
  from_tier TEXT
    CHECK (from_tier IS NULL OR from_tier IN (
      'listed', 'sensor_augmented', 'connected_demo', 'connected_live'
    )),
  to_tier TEXT NOT NULL
    CHECK (to_tier IN (
      'listed', 'sensor_augmented', 'connected_demo', 'connected_live'
    )),
  changed_by UUID REFERENCES public.users (id) ON DELETE SET NULL,
  note TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX connectivity_tier_history_terminal_id_idx
  ON public.connectivity_tier_history (terminal_id);

CREATE OR REPLACE FUNCTION public.log_connectivity_tier_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.connectivity_tier_history (terminal_id, from_tier, to_tier)
    VALUES (NEW.id, NULL, NEW.connectivity_tier);
  ELSIF OLD.connectivity_tier IS DISTINCT FROM NEW.connectivity_tier THEN
    INSERT INTO public.connectivity_tier_history (terminal_id, from_tier, to_tier)
    VALUES (NEW.id, OLD.connectivity_tier, NEW.connectivity_tier);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER terminals_log_connectivity_tier
  AFTER INSERT OR UPDATE OF connectivity_tier ON public.terminals
  FOR EACH ROW
  EXECUTE FUNCTION public.log_connectivity_tier_change();

CREATE TABLE public.terminal_status_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id UUID NOT NULL REFERENCES public.terminals (id) ON DELETE CASCADE,
  status TEXT NOT NULL
    CHECK (status IN ('available', 'occupied', 'offline', 'fault')),
  charge_percent NUMERIC(5, 2)
    CHECK (charge_percent IS NULL OR (charge_percent >= 0 AND charge_percent <= 100)),
  kwh_delivered NUMERIC(8, 3),
  source TEXT
    CHECK (source IS NULL OR source IN ('ocpp', 'sensor', 'demo', 'manual')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX terminal_status_snapshots_terminal_recorded_idx
  ON public.terminal_status_snapshots (terminal_id, recorded_at DESC);

CREATE TABLE public.charging_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id UUID NOT NULL REFERENCES public.terminals (id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers (id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  kwh_delivered NUMERIC(8, 3),
  amount_charged NUMERIC(10, 2),
  CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE INDEX charging_sessions_terminal_id_idx ON public.charging_sessions (terminal_id);
CREATE INDEX charging_sessions_driver_id_idx ON public.charging_sessions (driver_id);
CREATE INDEX charging_sessions_started_at_idx ON public.charging_sessions (started_at DESC);

-- =============================================================================
-- Data visibility control
-- =============================================================================

CREATE TABLE public.field_visibility_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('vendor', 'owner')),
  field_key TEXT NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (role, field_key)
);

CREATE TRIGGER field_visibility_rules_set_updated_at
  BEFORE UPDATE ON public.field_visibility_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.field_visibility_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('vendor', 'owner')),
  entity_id UUID NOT NULL,
  field_key TEXT NOT NULL,
  visible BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id, field_key)
);

CREATE TRIGGER field_visibility_overrides_set_updated_at
  BEFORE UPDATE ON public.field_visibility_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX field_visibility_overrides_entity_idx
  ON public.field_visibility_overrides (entity_type, entity_id);

CREATE OR REPLACE FUNCTION public.resolve_field_visibility(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_field_key TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (
      SELECT o.visible
      FROM public.field_visibility_overrides o
      WHERE o.entity_type = p_entity_type
        AND o.entity_id = p_entity_id
        AND o.field_key = p_field_key
    ),
    (
      SELECT r.visible
      FROM public.field_visibility_rules r
      WHERE r.role = p_entity_type
        AND r.field_key = p_field_key
    ),
    false
  );
$$;

INSERT INTO public.field_visibility_rules (role, field_key, visible) VALUES
  ('vendor', 'uptime_pct', true),
  ('vendor', 'sessions_count', true),
  ('vendor', 'leads_count', false),
  ('vendor', 'revenue', false),
  ('vendor', 'fault_history', true),
  ('owner', 'uptime_pct', true),
  ('owner', 'sessions_count', true),
  ('owner', 'leads_count', true),
  ('owner', 'revenue', false),
  ('owner', 'fault_history', true);

-- =============================================================================
-- Hardware / devices
-- =============================================================================

CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id UUID REFERENCES public.terminals (id) ON DELETE SET NULL,
  gateway_device_id UUID REFERENCES public.devices (id) ON DELETE SET NULL,
  device_type TEXT NOT NULL
    CHECK (device_type IN (
      'kiosk_screen', 'anpr_camera', 'occupancy_sensor', 'vacancy_totem',
      'led_beacon', 'ad_screen', 'wifi_portal', 'sos_button',
      'footfall_counter', 'solar_monitor', 'security_camera', 'connectivity_gateway'
    )),
  name TEXT,
  serial_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'offline', 'maintenance')),
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    device_type <> 'connectivity_gateway'
    OR gateway_device_id IS NULL
  )
);

CREATE TRIGGER devices_set_updated_at
  BEFORE UPDATE ON public.devices
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX devices_terminal_id_idx ON public.devices (terminal_id);
CREATE INDEX devices_gateway_device_id_idx ON public.devices (gateway_device_id);
CREATE INDEX devices_device_type_idx ON public.devices (device_type);
CREATE INDEX devices_status_idx ON public.devices (status);

CREATE TABLE public.device_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES public.devices (id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX device_telemetry_device_recorded_idx
  ON public.device_telemetry (device_id, recorded_at DESC);
CREATE INDEX device_telemetry_payload_gin_idx
  ON public.device_telemetry USING GIN (payload);

CREATE TABLE public.gateway_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL UNIQUE REFERENCES public.devices (id) ON DELETE CASCADE,
  local_ssid TEXT NOT NULL,
  local_password_hint TEXT,
  sim_primary_carrier TEXT,
  sim_primary_iccid TEXT,
  sim_secondary_carrier TEXT,
  sim_secondary_iccid TEXT,
  has_battery_backup BOOLEAN NOT NULL DEFAULT false,
  last_heartbeat_at TIMESTAMPTZ,
  connection_status TEXT NOT NULL DEFAULT 'online'
    CHECK (connection_status IN ('online', 'offline', 'degraded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER gateway_configs_set_updated_at
  BEFORE UPDATE ON public.gateway_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX gateway_configs_connection_status_idx
  ON public.gateway_configs (connection_status);
CREATE INDEX gateway_configs_last_heartbeat_at_idx
  ON public.gateway_configs (last_heartbeat_at);

CREATE TABLE public.anpr_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES public.devices (id) ON DELETE CASCADE,
  terminal_id UUID NOT NULL REFERENCES public.terminals (id) ON DELETE CASCADE,
  plate_number TEXT,
  image_url TEXT,
  confidence NUMERIC(5, 2),
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX anpr_captures_terminal_captured_idx
  ON public.anpr_captures (terminal_id, captured_at DESC);
CREATE INDEX anpr_captures_plate_number_idx ON public.anpr_captures (plate_number);
CREATE INDEX anpr_captures_device_id_idx ON public.anpr_captures (device_id);

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id UUID NOT NULL REFERENCES public.terminals (id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.terminal_owners (id) ON DELETE SET NULL,
  source TEXT NOT NULL
    CHECK (source IN ('anpr', 'wifi_portal', 'sos_button', 'manual')),
  contact_info TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX leads_terminal_id_idx ON public.leads (terminal_id);
CREATE INDEX leads_owner_id_idx ON public.leads (owner_id);
CREATE INDEX leads_captured_at_idx ON public.leads (captured_at DESC);

-- =============================================================================
-- Advertising (phase 2)
-- =============================================================================

CREATE TABLE public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_name TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  creative_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at >= starts_at)
);

CREATE TRIGGER ad_campaigns_set_updated_at
  BEFORE UPDATE ON public.ad_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns (id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES public.devices (id) ON DELETE CASCADE,
  shown_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ad_impressions_campaign_id_idx ON public.ad_impressions (campaign_id);
CREATE INDEX ad_impressions_device_id_idx ON public.ad_impressions (device_id);
CREATE INDEX ad_impressions_shown_at_idx ON public.ad_impressions (shown_at DESC);

-- =============================================================================
-- RLS: deny direct anon/authenticated access.
-- Next.js uses service_role (bypasses RLS). Do not expose anon key to clients.
-- =============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terminal_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terminal_vendor_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terminal_ownership_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connectivity_tier_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terminal_status_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charging_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_visibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_visibility_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gateway_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anpr_captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated → all direct PostgREST access denied.
-- service_role bypasses RLS for the Next.js API layer.

COMMENT ON TABLE public.users IS 'App users with bcrypt password_hash; JWT issued by Next.js, not Supabase Auth';
COMMENT ON TABLE public.terminals IS 'EV charging terminals across listed → connected_live tiers';
COMMENT ON FUNCTION public.resolve_field_visibility IS 'Override → role default → false';
