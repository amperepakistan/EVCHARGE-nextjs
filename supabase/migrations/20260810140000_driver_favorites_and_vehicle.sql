-- TECH-4: driver favorites + preferred vehicle on drivers

ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS preferred_vehicle_key TEXT;

CREATE TABLE IF NOT EXISTS public.driver_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  terminal_id UUID NOT NULL REFERENCES public.terminals (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, terminal_id)
);

CREATE INDEX IF NOT EXISTS driver_favorites_user_id_idx
  ON public.driver_favorites (user_id);

CREATE INDEX IF NOT EXISTS driver_favorites_terminal_id_idx
  ON public.driver_favorites (terminal_id);

ALTER TABLE public.driver_favorites ENABLE ROW LEVEL SECURITY;
