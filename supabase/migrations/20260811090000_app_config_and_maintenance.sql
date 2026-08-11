-- Superadmin-controlled app version gating + maintenance mode for the Flutter app.
-- See docs/VERSIONING.md (repo root) for the rules this table enforces.
--
-- iOS gating uses `min_version` (marketing version, what App Review sees).
-- Android gating uses `min_build_number` (Play's versionCode).
-- Both columns exist on both rows for audit/display purposes even though
-- only one is authoritative for gating on a given platform.

CREATE TABLE public.app_config (
  platform TEXT PRIMARY KEY CHECK (platform IN ('ios', 'android')),
  min_version TEXT NOT NULL DEFAULT '1.0.0',
  min_build_number INTEGER NOT NULL DEFAULT 1,
  latest_version TEXT NOT NULL DEFAULT '1.0.0',
  latest_build_number INTEGER NOT NULL DEFAULT 1,
  force_update BOOLEAN NOT NULL DEFAULT false,
  store_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.users (id) ON DELETE SET NULL
);

CREATE TRIGGER app_config_set_updated_at
  BEFORE UPDATE ON public.app_config
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Singleton row (`id` fixed true) — one maintenance-mode switch for the whole app.
CREATE TABLE public.app_maintenance (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  enabled BOOLEAN NOT NULL DEFAULT false,
  message TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.users (id) ON DELETE SET NULL
);

CREATE TRIGGER app_maintenance_set_updated_at
  BEFORE UPDATE ON public.app_maintenance
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.app_config (platform, min_version, min_build_number, latest_version, latest_build_number)
VALUES
  ('ios', '1.0.0', 1, '1.0.0', 1),
  ('android', '1.0.0', 1, '1.0.0', 1);

INSERT INTO public.app_maintenance (id, enabled) VALUES (true, false);

-- Flutter reads these directly with the anon key (same pattern as public
-- terminal reads) so a version/maintenance check works before any auth.
-- Writes only ever happen through the Next.js admin API (service_role).
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_maintenance ENABLE ROW LEVEL SECURITY;

CREATE POLICY app_config_public_read ON public.app_config
  FOR SELECT USING (true);

CREATE POLICY app_maintenance_public_read ON public.app_maintenance
  FOR SELECT USING (true);
