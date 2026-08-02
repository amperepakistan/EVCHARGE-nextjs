-- Retarget app membership FKs from auth.users → public.users.
-- Live DB still had leftover Supabase-Auth FKs while the app uses custom JWT + public.users.

-- vendor_members
ALTER TABLE public.vendor_members
  DROP CONSTRAINT IF EXISTS vendor_members_user_id_fkey;

ALTER TABLE public.vendor_members
  ADD CONSTRAINT vendor_members_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;

-- owner_members
ALTER TABLE public.owner_members
  DROP CONSTRAINT IF EXISTS owner_members_user_id_fkey;

ALTER TABLE public.owner_members
  ADD CONSTRAINT owner_members_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;

-- drivers: custom-auth schema uses user_id; live table still has auth_user_id
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS user_id UUID;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drivers' AND column_name = 'auth_user_id'
  ) THEN
    -- Best-effort copy when both columns exist (auth ids will not match public.users)
    UPDATE public.drivers
    SET user_id = auth_user_id
    WHERE user_id IS NULL AND auth_user_id IS NOT NULL
      AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = drivers.auth_user_id);
  END IF;
END $$;

ALTER TABLE public.drivers
  DROP CONSTRAINT IF EXISTS drivers_auth_user_id_fkey;

ALTER TABLE public.drivers
  DROP CONSTRAINT IF EXISTS drivers_user_id_fkey;

ALTER TABLE public.drivers
  ADD CONSTRAINT drivers_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS drivers_user_id_key ON public.drivers (user_id);

-- connectivity history actor (nullable) — allow public.users ids
ALTER TABLE public.connectivity_tier_history
  DROP CONSTRAINT IF EXISTS connectivity_tier_history_changed_by_fkey;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'connectivity_tier_history'
      AND column_name = 'changed_by'
  ) THEN
    ALTER TABLE public.connectivity_tier_history
      ADD CONSTRAINT connectivity_tier_history_changed_by_fkey
      FOREIGN KEY (changed_by) REFERENCES public.users (id) ON DELETE SET NULL;
  END IF;
END $$;
