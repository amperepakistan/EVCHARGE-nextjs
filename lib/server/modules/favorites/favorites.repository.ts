import type { ServerContext } from '@/lib/server/context';

export async function listFavoriteTerminalIds(ctx: ServerContext, userId: string) {
  const { data, error } = await ctx.db
    .from('driver_favorites')
    .select('terminal_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.terminal_id);
}

export async function addFavorite(ctx: ServerContext, userId: string, terminalId: string) {
  const { data, error } = await ctx.db
    .from('driver_favorites')
    .upsert(
      { user_id: userId, terminal_id: terminalId },
      { onConflict: 'user_id,terminal_id', ignoreDuplicates: true },
    )
    .select('terminal_id')
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.terminal_id ?? terminalId;
}

export async function removeFavorite(ctx: ServerContext, userId: string, terminalId: string) {
  const { error } = await ctx.db
    .from('driver_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('terminal_id', terminalId);

  if (error) throw new Error(error.message);
}
