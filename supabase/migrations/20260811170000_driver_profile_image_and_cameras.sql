-- TECH-4+: driver profile picture storage + CCTV foundation.

ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS profile_image_updated_at TIMESTAMPTZ;

-- Storage bucket for driver avatars. Uploads go through the Next.js API
-- with service_role; the bucket is public so the returned URL can be
-- loaded directly by the Flutter client without a signed-URL round trip.
INSERT INTO storage.buckets (id, name, public)
VALUES ('driver-profile-images', 'driver-profile-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read driver profile images" ON storage.objects;
CREATE POLICY "Public read driver profile images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'driver-profile-images');

COMMENT ON POLICY "Public read driver profile images" ON storage.objects IS
  'Avatar images are non-sensitive and served directly to the driver app; writes stay service_role-only.';

-- CCTV foundation: camera metadata + latest snapshot/online state per terminal.
CREATE TABLE IF NOT EXISTS public.terminal_cameras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id UUID NOT NULL REFERENCES public.terminals (id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  stream_type TEXT NOT NULL DEFAULT 'snapshot'
    CHECK (stream_type IN ('snapshot', 'mjpeg', 'rtsp')),
  stream_url TEXT,
  snapshot_url TEXT,
  online BOOLEAN NOT NULL DEFAULT false,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS terminal_cameras_terminal_id_idx
  ON public.terminal_cameras (terminal_id);

CREATE INDEX IF NOT EXISTS terminal_cameras_last_seen_at_idx
  ON public.terminal_cameras (last_seen_at DESC);

CREATE TRIGGER terminal_cameras_set_updated_at
  BEFORE UPDATE ON public.terminal_cameras
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.terminal_cameras ENABLE ROW LEVEL SECURITY;
-- No anon/authenticated policies: driver app reads cameras through the
-- JWT-authenticated Next.js API (service_role), not direct Supabase reads.
