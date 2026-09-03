-- Driver account deletion requests: app submits, admin approves/rejects.

CREATE TABLE public.account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  admin_note TEXT,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One open request per user
CREATE UNIQUE INDEX account_deletion_requests_one_pending
  ON public.account_deletion_requests (user_id)
  WHERE status = 'pending';

CREATE INDEX account_deletion_requests_status_idx
  ON public.account_deletion_requests (status, created_at DESC);

CREATE TRIGGER account_deletion_requests_set_updated_at
  BEFORE UPDATE ON public.account_deletion_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- RLS on, no anon/authenticated policies: written and read only by the
-- Next.js server via the service_role key.
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';
