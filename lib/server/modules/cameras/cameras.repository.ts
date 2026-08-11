import type { ServerContext } from '@/lib/server/context';

export type TerminalCamera = {
  id: string;
  terminalId: string;
  label: string;
  streamType: string;
  streamUrl: string | null;
  snapshotUrl: string | null;
  online: boolean;
  lastSeenAt: string | null;
};

export async function listCamerasForTerminal(
  ctx: ServerContext,
  terminalId: string,
): Promise<TerminalCamera[]> {
  const { data, error } = await ctx.db
    .from('terminal_cameras')
    .select('id, terminal_id, label, stream_type, stream_url, snapshot_url, online, last_seen_at')
    .eq('terminal_id', terminalId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    terminalId: row.terminal_id,
    label: row.label,
    streamType: row.stream_type,
    streamUrl: row.stream_url,
    snapshotUrl: row.snapshot_url,
    online: row.online,
    lastSeenAt: row.last_seen_at,
  }));
}

export async function getCameraById(
  ctx: ServerContext,
  cameraId: string,
): Promise<TerminalCamera | null> {
  const { data, error } = await ctx.db
    .from('terminal_cameras')
    .select('id, terminal_id, label, stream_type, stream_url, snapshot_url, online, last_seen_at')
    .eq('id', cameraId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    id: data.id,
    terminalId: data.terminal_id,
    label: data.label,
    streamType: data.stream_type,
    streamUrl: data.stream_url,
    snapshotUrl: data.snapshot_url,
    online: data.online,
    lastSeenAt: data.last_seen_at,
  };
}
