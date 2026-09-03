import type { ServerContext } from '@/lib/server/context';
import { AppError } from '@/lib/server/errors';
import * as repo from '@/lib/server/modules/account-deletion/account-deletion.repository';
import {
  createDeletionRequestSchema,
  rejectDeletionRequestSchema,
} from '@/lib/server/modules/account-deletion/account-deletion.schema';

function requireAuth(ctx: ServerContext) {
  if (!ctx.user) throw new AppError(401, 'Unauthorized');
  return ctx.user;
}

function requireDriver(ctx: ServerContext) {
  const user = requireAuth(ctx);
  if (user.role !== 'driver') {
    throw new AppError(403, 'Only drivers can request account deletion');
  }
  return user;
}

function requirePlatformAdmin(ctx: ServerContext) {
  const user = requireAuth(ctx);
  if (user.role !== 'super_admin' && user.role !== 'staff') {
    throw new AppError(403, 'Forbidden');
  }
  return user;
}

function toPublic(request: repo.DeletionRequestRecord) {
  return {
    id: request.id,
    status: request.status,
    reason: request.reason,
    createdAt: request.createdAt,
    reviewedAt: request.reviewedAt,
    adminNote: request.status === 'rejected' ? request.adminNote : null,
  };
}

export async function createMyRequest(ctx: ServerContext, raw: unknown) {
  const user = requireDriver(ctx);
  const parsed = createDeletionRequestSchema.safeParse(raw ?? {});
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
  }

  try {
    const existing = await repo.findPendingByUserId(ctx, user.userId);
    if (existing) {
      throw new AppError(409, 'You already have a pending deletion request');
    }

    const reason = parsed.data.reason?.trim() ? parsed.data.reason.trim() : null;
    const created = await repo.createRequest(ctx, user.userId, reason);
    return toPublic(created);
  } catch (err) {
    if (err instanceof AppError) throw err;
    ctx.logger.error('[account-deletion] create failed', {
      userId: user.userId,
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(
      500,
      err instanceof Error ? err.message : 'Failed to create deletion request',
    );
  }
}

export async function getMyRequest(ctx: ServerContext) {
  const user = requireDriver(ctx);
  try {
    const latest = await repo.findLatestByUserId(ctx, user.userId);
    return latest ? toPublic(latest) : null;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      500,
      err instanceof Error ? err.message : 'Failed to load deletion request',
    );
  }
}

export async function cancelMyRequest(ctx: ServerContext) {
  const user = requireDriver(ctx);
  try {
    const cancelled = await repo.cancelPendingRequest(ctx, user.userId);
    if (!cancelled) {
      throw new AppError(404, 'No pending deletion request to cancel');
    }
    return toPublic(cancelled);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      500,
      err instanceof Error ? err.message : 'Failed to cancel deletion request',
    );
  }
}

export async function listPendingRequests(ctx: ServerContext) {
  requirePlatformAdmin(ctx);
  try {
    return await repo.listPendingWithUsers(ctx);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      500,
      err instanceof Error ? err.message : 'Failed to list deletion requests',
    );
  }
}

export async function approveRequest(ctx: ServerContext, requestId: string) {
  const admin = requirePlatformAdmin(ctx);
  if (!requestId) throw new AppError(400, 'requestId required');

  try {
    const request = await repo.findRequestById(ctx, requestId);
    if (!request) throw new AppError(404, 'Deletion request not found');
    if (request.status !== 'pending') {
      throw new AppError(409, 'Deletion request is no longer pending');
    }

    await repo.scrubAndDeactivateUser(ctx, request.userId);
    return await repo.markApproved(ctx, requestId, admin.userId);
  } catch (err) {
    if (err instanceof AppError) throw err;
    ctx.logger.error('[account-deletion] approve failed', {
      requestId,
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(
      500,
      err instanceof Error ? err.message : 'Failed to approve deletion request',
    );
  }
}

export async function rejectRequest(
  ctx: ServerContext,
  requestId: string,
  raw: unknown,
) {
  const admin = requirePlatformAdmin(ctx);
  if (!requestId) throw new AppError(400, 'requestId required');

  const parsed = rejectDeletionRequestSchema.safeParse(raw ?? {});
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
  }

  try {
    const request = await repo.findRequestById(ctx, requestId);
    if (!request) throw new AppError(404, 'Deletion request not found');
    if (request.status !== 'pending') {
      throw new AppError(409, 'Deletion request is no longer pending');
    }

    return await repo.markRejected(
      ctx,
      requestId,
      admin.userId,
      parsed.data.adminNote.trim(),
    );
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      500,
      err instanceof Error ? err.message : 'Failed to reject deletion request',
    );
  }
}
