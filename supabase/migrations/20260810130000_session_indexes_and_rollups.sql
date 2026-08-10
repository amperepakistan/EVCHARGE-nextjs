-- TECH-3.2 / 3.3: session query indexes, daily rollups, energy_kwh visibility seed

CREATE INDEX IF NOT EXISTS charging_sessions_terminal_started_idx
  ON public.charging_sessions (terminal_id, started_at DESC);

CREATE INDEX IF NOT EXISTS charging_sessions_open_idx
  ON public.charging_sessions (terminal_id)
  WHERE ended_at IS NULL;

CREATE TABLE IF NOT EXISTS public.session_daily_rollups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day DATE NOT NULL,
  terminal_id UUID NOT NULL REFERENCES public.terminals (id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors (id) ON DELETE SET NULL,
  owner_id UUID REFERENCES public.terminal_owners (id) ON DELETE SET NULL,
  session_count INT NOT NULL DEFAULT 0,
  kwh_delivered NUMERIC(12, 3) NOT NULL DEFAULT 0,
  revenue NUMERIC(14, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (day, terminal_id)
);

CREATE INDEX IF NOT EXISTS session_daily_rollups_vendor_day_idx
  ON public.session_daily_rollups (vendor_id, day DESC);

CREATE INDEX IF NOT EXISTS session_daily_rollups_owner_day_idx
  ON public.session_daily_rollups (owner_id, day DESC);

CREATE TRIGGER session_daily_rollups_set_updated_at
  BEFORE UPDATE ON public.session_daily_rollups
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.session_daily_rollups ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.refresh_session_daily_rollups(
  p_from_day DATE DEFAULT (CURRENT_DATE - INTERVAL '90 days')::date,
  p_to_day DATE DEFAULT CURRENT_DATE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.session_daily_rollups AS r (
    day,
    terminal_id,
    vendor_id,
    owner_id,
    session_count,
    kwh_delivered,
    revenue
  )
  SELECT
    (s.started_at AT TIME ZONE 'UTC')::date AS day,
    s.terminal_id,
    t.current_vendor_id,
    t.current_owner_id,
    COUNT(*)::int AS session_count,
    COALESCE(SUM(s.kwh_delivered), 0) AS kwh_delivered,
    COALESCE(SUM(s.amount_charged), 0) AS revenue
  FROM public.charging_sessions s
  INNER JOIN public.terminals t ON t.id = s.terminal_id
  WHERE (s.started_at AT TIME ZONE 'UTC')::date BETWEEN p_from_day AND p_to_day
  GROUP BY 1, 2, 3, 4
  ON CONFLICT (day, terminal_id) DO UPDATE
  SET
    vendor_id = EXCLUDED.vendor_id,
    owner_id = EXCLUDED.owner_id,
    session_count = EXCLUDED.session_count,
    kwh_delivered = EXCLUDED.kwh_delivered,
    revenue = EXCLUDED.revenue,
    updated_at = now();
END;
$$;

COMMENT ON FUNCTION public.refresh_session_daily_rollups IS
  'Upsert daily session/revenue rollups from charging_sessions for dashboards.';

INSERT INTO public.field_visibility_rules (role, field_key, visible)
VALUES
  ('owner', 'energy_kwh', true),
  ('vendor', 'energy_kwh', true)
ON CONFLICT (role, field_key) DO NOTHING;
