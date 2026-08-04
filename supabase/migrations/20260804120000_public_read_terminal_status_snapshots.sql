-- Allow Flutter anon key to read status for public terminals (showcase / listed UI).
DROP POLICY IF EXISTS "Public can read status of public terminals"
  ON public.terminal_status_snapshots;

CREATE POLICY "Public can read status of public terminals"
  ON public.terminal_status_snapshots
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.terminals t
      WHERE t.id = terminal_status_snapshots.terminal_id
        AND t.is_public = true
    )
  );

COMMENT ON POLICY "Public can read status of public terminals"
  ON public.terminal_status_snapshots IS
  'Driver app reads latest occupancy demos for public stations via anon key.';
