-- FCM device tokens linked to app user accounts (not topics).
CREATE TABLE IF NOT EXISTS public.user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'android'
    CHECK (platform IN ('android', 'ios', 'web')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, fcm_token)
);

CREATE INDEX IF NOT EXISTS user_push_tokens_user_id_idx
  ON public.user_push_tokens (user_id);

CREATE INDEX IF NOT EXISTS user_push_tokens_fcm_token_idx
  ON public.user_push_tokens (fcm_token);

CREATE TRIGGER user_push_tokens_set_updated_at
  BEFORE UPDATE ON public.user_push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;
-- No anon policies: only service_role (Next.js) reads/writes this table.
