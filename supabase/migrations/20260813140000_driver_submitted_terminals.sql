-- Driver scout submissions live on terminals as non-public, unverified rows.

ALTER TABLE public.terminals DROP CONSTRAINT IF EXISTS terminals_source_check;
ALTER TABLE public.terminals
  ADD CONSTRAINT terminals_source_check
  CHECK (
    source IS NULL OR source IN (
      'scraped',
      'manual',
      'vendor_submitted',
      'google_places',
      'open_charge_map',
      'driver_submitted'
    )
  );

ALTER TABLE public.terminals
  ADD COLUMN IF NOT EXISTS submitted_by_user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS submission_notes TEXT;

CREATE INDEX IF NOT EXISTS terminals_submitted_by_user_id_idx
  ON public.terminals (submitted_by_user_id);

CREATE INDEX IF NOT EXISTS terminals_pending_review_idx
  ON public.terminals (is_public, source)
  WHERE is_public = false;

NOTIFY pgrst, 'reload schema';
