import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

type Db = SupabaseClient<Database>;
type Platform = 'android' | 'ios' | 'web';

export type PushTokenRow = {
  userId: string;
  fcmToken: string;
  platform: Platform;
};

const TOKENS_BUCKET = 'user-push-tokens';
const PROFILE_BUCKET = 'driver-profile-images';

type StoredToken = {
  fcmToken: string;
  platform: Platform;
  updatedAt: string;
};

function isMissingPushTokensTable(message: string) {
  const msg = message.toLowerCase();
  return (
    msg.includes('user_push_tokens') &&
    (msg.includes('schema cache') ||
      msg.includes('does not exist') ||
      msg.includes('could not find') ||
      msg.includes('pgrst205'))
  );
}

function tokenObjectPath(userId: string) {
  return `push-tokens/${userId}.json`;
}

async function ensureBucket(db: Db, name: string) {
  const { error } = await db.storage.createBucket(name, {
    public: false,
    fileSizeLimit: 64 * 1024,
  });
  if (!error) return true;
  return /already exists|duplicate|exists/i.test(error.message);
}

async function resolveStorageBucket(db: Db) {
  if (await ensureBucket(db, TOKENS_BUCKET)) return TOKENS_BUCKET;
  return PROFILE_BUCKET;
}

function parseStoredTokens(raw: unknown): StoredToken[] {
  if (!Array.isArray(raw)) return [];
  const out: StoredToken[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const fcmToken = typeof rec.fcmToken === 'string' ? rec.fcmToken : null;
    const platform =
      rec.platform === 'ios' || rec.platform === 'web' || rec.platform === 'android'
        ? rec.platform
        : 'android';
    if (!fcmToken) continue;
    out.push({
      fcmToken,
      platform,
      updatedAt: typeof rec.updatedAt === 'string' ? rec.updatedAt : new Date().toISOString(),
    });
  }
  return out;
}

async function readStorageTokens(
  db: Db,
  bucket: string,
  userId: string,
): Promise<StoredToken[] | null> {
  const { data, error } = await db.storage.from(bucket).download(tokenObjectPath(userId));
  if (error || !data) {
    if (error && /not found|404/i.test(error.message)) return [];
    return null;
  }
  try {
    return parseStoredTokens(JSON.parse(await data.text()));
  } catch {
    return [];
  }
}

async function writeStorageTokens(db: Db, bucket: string, userId: string, tokens: StoredToken[]) {
  const { error } = await db.storage.from(bucket).upload(
    tokenObjectPath(userId),
    JSON.stringify(tokens),
    { contentType: 'application/json', upsert: true },
  );
  return !error;
}

async function listFromStorage(db: Db, userId: string) {
  const bucket = await resolveStorageBucket(db);
  const tokens = await readStorageTokens(db, bucket, userId);
  if (tokens) return tokens;
  if (bucket !== PROFILE_BUCKET) {
    const fallback = await readStorageTokens(db, PROFILE_BUCKET, userId);
    if (fallback) return fallback;
  }
  return [];
}

async function saveToStorage(db: Db, userId: string, tokens: StoredToken[]) {
  const bucket = await resolveStorageBucket(db);
  if (await writeStorageTokens(db, bucket, userId, tokens)) return;
  if (bucket !== PROFILE_BUCKET && (await writeStorageTokens(db, PROFILE_BUCKET, userId, tokens))) {
    return;
  }
  throw new Error('Failed to persist push token');
}

export async function upsertPushToken(
  db: Db,
  input: { userId: string; fcmToken: string; platform: Platform },
) {
  const { error } = await db.from('user_push_tokens').upsert(
    {
      user_id: input.userId,
      fcm_token: input.fcmToken,
      platform: input.platform,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,fcm_token' },
  );

  if (!error) return;
  if (!isMissingPushTokensTable(error.message)) throw new Error(error.message);

  const existing = await listFromStorage(db, input.userId);
  const next = existing.filter((t) => t.fcmToken !== input.fcmToken);
  next.unshift({
    fcmToken: input.fcmToken,
    platform: input.platform,
    updatedAt: new Date().toISOString(),
  });
  await saveToStorage(db, input.userId, next);
}

export async function listPushTokenRows(db: Db, userIds: string[]): Promise<PushTokenRow[]> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const { data, error } = await db
    .from('user_push_tokens')
    .select('user_id, fcm_token, platform')
    .in('user_id', uniqueIds);

  if (!error) {
    return (data ?? []).map((row) => ({
      userId: row.user_id,
      fcmToken: row.fcm_token,
      platform: row.platform,
    }));
  }
  if (!isMissingPushTokensTable(error.message)) throw new Error(error.message);

  const perUser = await Promise.all(
    uniqueIds.map(async (userId) => {
      const tokens = await listFromStorage(db, userId);
      return tokens.map((t) => ({
        userId,
        fcmToken: t.fcmToken,
        platform: t.platform,
      }));
    }),
  );
  return perUser.flat();
}

export async function deletePushTokens(db: Db, rows: PushTokenRow[]) {
  const tokens = [...new Set(rows.map((row) => row.fcmToken).filter(Boolean))];
  if (tokens.length === 0) return;

  const { error } = await db.from('user_push_tokens').delete().in('fcm_token', tokens);
  if (error && !isMissingPushTokensTable(error.message)) {
    throw new Error(error.message);
  }

  const byUser = new Map<string, Set<string>>();
  for (const row of rows) {
    const set = byUser.get(row.userId) ?? new Set<string>();
    set.add(row.fcmToken);
    byUser.set(row.userId, set);
  }

  await Promise.all(
    [...byUser.entries()].map(async ([userId, remove]) => {
      const existing = await listFromStorage(db, userId);
      const next = existing.filter((token) => !remove.has(token.fcmToken));
      if (next.length !== existing.length) await saveToStorage(db, userId, next);
    }),
  );
}
