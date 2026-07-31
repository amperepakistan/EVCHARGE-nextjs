-- Phase 1 driver app: Google Places fields + public SELECT on terminals.
-- Aligns existing schema with Flutter anon-key reads (RLS-gated).

ALTER TABLE public.terminals
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS google_place_id TEXT,
  ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
  ADD COLUMN IF NOT EXISTS google_rating NUMERIC(2, 1),
  ADD COLUMN IF NOT EXISTS google_rating_count INTEGER,
  ADD COLUMN IF NOT EXISTS google_photo_urls TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS google_raw JSONB,
  ADD COLUMN IF NOT EXISTS scraped_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'terminals_verification_status_check'
  ) THEN
    ALTER TABLE public.terminals
      ADD CONSTRAINT terminals_verification_status_check
      CHECK (verification_status IN ('unverified', 'verified', 'flagged'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'terminals_google_place_id_key'
  ) THEN
    ALTER TABLE public.terminals
      ADD CONSTRAINT terminals_google_place_id_key UNIQUE (google_place_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS terminals_charger_class_idx
  ON public.terminals (charger_class);

-- Broaden source values used by scrapers (keep existing scraped/manual/vendor_submitted).
ALTER TABLE public.terminals DROP CONSTRAINT IF EXISTS terminals_source_check;
ALTER TABLE public.terminals
  ADD CONSTRAINT terminals_source_check
  CHECK (
    source IS NULL OR source IN (
      'scraped',
      'manual',
      'vendor_submitted',
      'google_places',
      'open_charge_map'
    )
  );

-- Public read for the free driver app (anon key). Writes still go through Next.js service_role.
DROP POLICY IF EXISTS "Public can read public terminals" ON public.terminals;
CREATE POLICY "Public can read public terminals"
  ON public.terminals
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

COMMENT ON POLICY "Public can read public terminals" ON public.terminals IS
  'Flutter driver app reads Listed terminals with the anon key; no auth required.';
