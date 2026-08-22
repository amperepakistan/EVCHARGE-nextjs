-- Phone + OTP auth for the driver app.
--
-- Drivers now sign in with a Pakistani mobile number (+92) and a one-time code;
-- they never set an email or a password. Vendor/owner/admin dashboard accounts
-- keep using email + password, so `email` / `password_hash` stay on `users` and
-- only become optional.

ALTER TABLE public.users
  ALTER COLUMN email DROP NOT NULL,
  ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Postgres treats NULLs as distinct, so both unique indexes tolerate accounts
-- that only have one of the two identifiers.
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_number_key
  ON public.users (phone_number)
  WHERE phone_number IS NOT NULL;

-- Every account must be reachable by at least one identifier.
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_identifier_present;
ALTER TABLE public.users
  ADD CONSTRAINT users_identifier_present
  CHECK (email IS NOT NULL OR phone_number IS NOT NULL);

-- Password accounts must actually carry a hash; phone-only accounts must not
-- be able to fall back to an empty password.
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_password_requires_email;
ALTER TABLE public.users
  ADD CONSTRAINT users_password_requires_email
  CHECK (password_hash IS NULL OR email IS NOT NULL);

-- One live OTP challenge per phone number. Rows are upserted on resend and
-- deleted once consumed; `expires_at` and `attempts` bound how long a code
-- stays usable and how often it can be guessed.
CREATE TABLE IF NOT EXISTS public.phone_otp_challenges (
  phone_number TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER phone_otp_challenges_set_updated_at
  BEFORE UPDATE ON public.phone_otp_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS phone_otp_challenges_expires_at_idx
  ON public.phone_otp_challenges (expires_at);

-- Service-role only: the anon key must never read or write OTP codes.
ALTER TABLE public.phone_otp_challenges ENABLE ROW LEVEL SECURITY;
