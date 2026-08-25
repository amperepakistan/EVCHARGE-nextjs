-- Founding 50 launch offer: home-charger signup submissions.

CREATE TABLE public.founding_50_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  charger_brand TEXT NOT NULL,
  charger_model TEXT NOT NULL,
  connector_power TEXT,
  package_choice TEXT NOT NULL
    CHECK (package_choice IN ('standard', 'plus')),
  wifi_reaches_charger BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  photo_paths TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'scheduled', 'converted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER founding_50_submissions_set_updated_at
  BEFORE UPDATE ON public.founding_50_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX founding_50_submissions_created_at_idx
  ON public.founding_50_submissions (created_at DESC);

CREATE INDEX founding_50_submissions_status_idx
  ON public.founding_50_submissions (status);

-- RLS on, no anon/authenticated policies: this table is written and read
-- only by the Next.js server via the service_role key, same pattern as
-- terminal_cameras (see 20260811170000_driver_profile_image_and_cameras.sql).
ALTER TABLE public.founding_50_submissions ENABLE ROW LEVEL SECURITY;

-- Storage bucket for the charger photos. PRIVATE, unlike driver-profile-
-- images — these photos can show a driveway, house number or other
-- identifying detail of someone's home, so they must not be publicly
-- readable by URL. Access is service_role-only from the admin side; if you
-- ever need to show a photo in an admin UI, generate a short-lived signed
-- URL server-side rather than making the bucket public.
INSERT INTO storage.buckets (id, name, public)
VALUES ('home-charger-photos', 'home-charger-photos', false)
ON CONFLICT (id) DO NOTHING;

-- No storage.objects policies added — service_role bypasses RLS entirely,
-- and nothing else should be able to read or write this bucket.

NOTIFY pgrst, 'reload schema';
