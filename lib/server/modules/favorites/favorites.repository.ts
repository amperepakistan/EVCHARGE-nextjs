import type { ServerContext } from '@/lib/server/context';

const FAVORITES_BUCKET = 'driver-favorites';
const PROFILE_BUCKET = 'driver-profile-images';

function isMissingFavoritesTable(message: string) {
  const msg = message.toLowerCase();
  return (
    msg.includes('driver_favorites') &&
    (msg.includes('schema cache') ||
      msg.includes('does not exist') ||
      msg.includes('could not find') ||
      msg.includes('pgrst205'))
  );
}

function favoritesObjectPath(userId: string) {
  return `${userId}.json`;
}

async function ensureBucket(ctx: ServerContext, name: string) {
  const { error } = await ctx.db.storage.createBucket(name, {
    public: false,
    fileSizeLimit: 64 * 1024,
  });
  if (!error) return true;
  return /already exists|duplicate|exists/i.test(error.message);
}

async function resolveStorageBucket(ctx: ServerContext) {
  if (await ensureBucket(ctx, FAVORITES_BUCKET)) return FAVORITES_BUCKET;
  return PROFILE_BUCKET;
}

async function readStorageIds(
  ctx: ServerContext,
  bucket: string,
  userId: string,
): Promise<string[] | null> {
  const { data, error } = await ctx.db.storage
    .from(bucket)
    .download(favoritesObjectPath(userId));
  if (error || !data) {
    if (error && /not found|404/i.test(error.message)) return [];
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(await data.text());
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string' && id.length > 0);
  } catch {
    return [];
  }
}

async function writeStorageIds(
  ctx: ServerContext,
  bucket: string,
  userId: string,
  ids: string[],
) {
  const { error } = await ctx.db.storage.from(bucket).upload(
    favoritesObjectPath(userId),
    JSON.stringify([...new Set(ids)]),
    { contentType: 'application/json', upsert: true },
  );
  return !error;
}

async function listFromStorage(ctx: ServerContext, userId: string) {
  const bucket = await resolveStorageBucket(ctx);
  const ids = await readStorageIds(ctx, bucket, userId);
  if (ids) return ids;
  if (bucket !== PROFILE_BUCKET) {
    const fallback = await readStorageIds(ctx, PROFILE_BUCKET, userId);
    if (fallback) return fallback;
  }
  return [];
}

async function saveToStorage(ctx: ServerContext, userId: string, ids: string[]) {
  const unique = [...new Set(ids)];
  const bucket = await resolveStorageBucket(ctx);
  if (await writeStorageIds(ctx, bucket, userId, unique)) return;
  if (bucket !== PROFILE_BUCKET && (await writeStorageIds(ctx, PROFILE_BUCKET, userId, unique))) {
    return;
  }
  throw new Error('Failed to persist favorites');
}

export async function listFavoriteTerminalIds(ctx: ServerContext, userId: string) {
  const { data, error } = await ctx.db
    .from('driver_favorites')
    .select('terminal_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!error) {
    return (data ?? []).map((r) => r.terminal_id);
  }
  if (!isMissingFavoritesTable(error.message)) throw new Error(error.message);

  ctx.logger.info('[favorites] driver_favorites missing, using per-user storage', { userId });
  return listFromStorage(ctx, userId);
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

  if (!error) return data?.terminal_id ?? terminalId;
  if (!isMissingFavoritesTable(error.message)) throw new Error(error.message);

  const ids = await listFromStorage(ctx, userId);
  if (!ids.includes(terminalId)) ids.unshift(terminalId);
  await saveToStorage(ctx, userId, ids);
  return terminalId;
}

export async function removeFavorite(ctx: ServerContext, userId: string, terminalId: string) {
  const { error } = await ctx.db
    .from('driver_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('terminal_id', terminalId);

  if (!error) return;
  if (!isMissingFavoritesTable(error.message)) throw new Error(error.message);

  const ids = (await listFromStorage(ctx, userId)).filter((id) => id !== terminalId);
  await saveToStorage(ctx, userId, ids);
}
