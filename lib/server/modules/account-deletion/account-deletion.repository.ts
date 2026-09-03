import type { ServerContext } from '@/lib/server/context';
import type { AccountDeletionStatus } from '@/types/database.types';

export type DeletionRequestRecord = {
  id: string;
  userId: string;
  reason: string | null;
  status: AccountDeletionStatus;
  adminNote: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DeletionRequestAdminRow = DeletionRequestRecord & {
  fullName: string | null;
  phoneNumber: string | null;
  email: string | null;
  isActive: boolean | null;
};

function mapRow(row: {
  id: string;
  user_id: string;
  reason: string | null;
  status: AccountDeletionStatus;
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}): DeletionRequestRecord {
  return {
    id: row.id,
    userId: row.user_id,
    reason: row.reason,
    status: row.status,
    adminNote: row.admin_note,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findPendingByUserId(
  ctx: ServerContext,
  userId: string,
): Promise<DeletionRequestRecord | null> {
  const { data, error } = await ctx.db
    .from('account_deletion_requests')
    .select(
      'id, user_id, reason, status, admin_note, reviewed_by, reviewed_at, created_at, updated_at',
    )
    .eq('user_id', userId)
    .eq('status', 'pending')
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data) : null;
}

export async function findLatestByUserId(
  ctx: ServerContext,
  userId: string,
): Promise<DeletionRequestRecord | null> {
  const { data, error } = await ctx.db
    .from('account_deletion_requests')
    .select(
      'id, user_id, reason, status, admin_note, reviewed_by, reviewed_at, created_at, updated_at',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data) : null;
}

export async function createRequest(
  ctx: ServerContext,
  userId: string,
  reason: string | null,
): Promise<DeletionRequestRecord> {
  const { data, error } = await ctx.db
    .from('account_deletion_requests')
    .insert({
      user_id: userId,
      reason,
      status: 'pending',
    })
    .select(
      'id, user_id, reason, status, admin_note, reviewed_by, reviewed_at, created_at, updated_at',
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create deletion request');
  }
  return mapRow(data);
}

export async function cancelPendingRequest(
  ctx: ServerContext,
  userId: string,
): Promise<DeletionRequestRecord | null> {
  const pending = await findPendingByUserId(ctx, userId);
  if (!pending) return null;

  const { data, error } = await ctx.db
    .from('account_deletion_requests')
    .update({ status: 'cancelled' })
    .eq('id', pending.id)
    .eq('status', 'pending')
    .select(
      'id, user_id, reason, status, admin_note, reviewed_by, reviewed_at, created_at, updated_at',
    )
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data) : null;
}

export async function findRequestById(
  ctx: ServerContext,
  requestId: string,
): Promise<DeletionRequestRecord | null> {
  const { data, error } = await ctx.db
    .from('account_deletion_requests')
    .select(
      'id, user_id, reason, status, admin_note, reviewed_by, reviewed_at, created_at, updated_at',
    )
    .eq('id', requestId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data) : null;
}

export async function listPendingWithUsers(
  ctx: ServerContext,
): Promise<DeletionRequestAdminRow[]> {
  const { data, error } = await ctx.db
    .from('account_deletion_requests')
    .select(
      'id, user_id, reason, status, admin_note, reviewed_by, reviewed_at, created_at, updated_at',
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  const rows = data ?? [];
  if (rows.length === 0) return [];

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: users, error: usersError } = await ctx.db
    .from('users')
    .select('id, full_name, email, phone_number, is_active')
    .in('id', userIds);

  if (usersError) throw new Error(usersError.message);

  const byId = new Map((users ?? []).map((u) => [u.id, u]));

  return rows.map((row) => {
    const user = byId.get(row.user_id);
    return {
      ...mapRow(row),
      fullName: user?.full_name ?? null,
      phoneNumber: user?.phone_number ?? null,
      email: user?.email ?? null,
      isActive: user?.is_active ?? null,
    };
  });
}

/**
 * Soft-delete + scrub PII. Keeps the users row for audit / FK history.
 * Sets a placeholder email so users_identifier_present still holds after
 * phone_number is cleared (frees the number for a new signup).
 */
export async function scrubAndDeactivateUser(
  ctx: ServerContext,
  userId: string,
): Promise<void> {
  const placeholderEmail = `deleted-${userId}@deleted.local`;

  const { error: userError } = await ctx.db
    .from('users')
    .update({
      phone_number: null,
      email: placeholderEmail,
      password_hash: null,
      full_name: null,
      is_active: false,
    })
    .eq('id', userId);

  if (userError) throw new Error(userError.message);

  const { error: driverError } = await ctx.db
    .from('drivers')
    .update({
      phone_number: null,
      email: null,
      preferred_vehicle_key: null,
      profile_image_url: null,
      profile_image_updated_at: null,
    })
    .eq('user_id', userId);

  if (driverError) throw new Error(driverError.message);

  const { error: tokensError } = await ctx.db
    .from('user_push_tokens')
    .delete()
    .eq('user_id', userId);

  if (tokensError && !/does not exist|schema cache|could not find|pgrst205/i.test(tokensError.message)) {
    throw new Error(tokensError.message);
  }

  const { error: favoritesError } = await ctx.db
    .from('driver_favorites')
    .delete()
    .eq('user_id', userId);

  if (
    favoritesError &&
    !/does not exist|schema cache|could not find|pgrst205/i.test(favoritesError.message)
  ) {
    throw new Error(favoritesError.message);
  }
}

export async function markApproved(
  ctx: ServerContext,
  requestId: string,
  reviewedBy: string,
): Promise<DeletionRequestRecord> {
  const { data, error } = await ctx.db
    .from('account_deletion_requests')
    .update({
      status: 'approved',
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .eq('status', 'pending')
    .select(
      'id, user_id, reason, status, admin_note, reviewed_by, reviewed_at, created_at, updated_at',
    )
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Deletion request is no longer pending');
  return mapRow(data);
}

export async function markRejected(
  ctx: ServerContext,
  requestId: string,
  reviewedBy: string,
  adminNote: string,
): Promise<DeletionRequestRecord> {
  const { data, error } = await ctx.db
    .from('account_deletion_requests')
    .update({
      status: 'rejected',
      admin_note: adminNote,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .eq('status', 'pending')
    .select(
      'id, user_id, reason, status, admin_note, reviewed_by, reviewed_at, created_at, updated_at',
    )
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Deletion request is no longer pending');
  return mapRow(data);
}
