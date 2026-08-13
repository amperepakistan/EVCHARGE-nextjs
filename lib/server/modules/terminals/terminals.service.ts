import type { UserRole } from '@/types/database.types';
import type { ServerContext } from '@/lib/server/context';
import { AppError } from '@/lib/server/errors';
import {
  createTerminalSchema,
  suggestTerminalSchema,
  updateTerminalSchema,
  type CreateTerminalInput,
  type UpdateTerminalInput,
} from '@/lib/server/modules/terminals/terminals.schema';
import * as terminalsRepo from '@/lib/server/modules/terminals/terminals.repository';

const WRITE_ROLES: UserRole[] = ['super_admin', 'staff', 'vendor'];
const DELETE_ROLES: UserRole[] = ['super_admin', 'staff'];

function requireRoles(ctx: ServerContext, allowed: UserRole[]): void {
  if (!ctx.user) {
    throw new AppError(401, 'Unauthorized');
  }
  if (!allowed.includes(ctx.user.role)) {
    throw new AppError(403, 'Forbidden');
  }
}

export async function listTerminalsForOwner(ctx: ServerContext, ownerId: string) {
  try {
    return await terminalsRepo.listTerminalsForOwner(ctx, ownerId);
  } catch (err) {
    ctx.logger.error('[terminals] list for owner failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to list terminals');
  }
}

export async function listTerminalsForVendor(ctx: ServerContext, vendorId: string) {
  try {
    return await terminalsRepo.listTerminalsForVendor(ctx, vendorId);
  } catch (err) {
    ctx.logger.error('[terminals] list for vendor failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to list terminals');
  }
}

export async function getTerminalForVendor(
  ctx: ServerContext,
  vendorId: string,
  terminalId: string,
) {
  try {
    const data = await terminalsRepo.getTerminalForVendor(ctx, vendorId, terminalId);
    if (!data) {
      throw new AppError(404, 'Terminal not found');
    }
    return data;
  } catch (err) {
    if (err instanceof AppError) throw err;
    ctx.logger.error('[terminals] get for vendor failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to fetch terminal');
  }
}

export async function getLatestStatusByTerminalIds(
  ctx: ServerContext,
  terminalIds: string[],
) {
  try {
    return await terminalsRepo.getLatestStatusSnapshots(ctx, terminalIds);
  } catch (err) {
    ctx.logger.error('[terminals] status snapshots failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to load status');
  }
}

export function isConnectedTier(
  tier: string | null | undefined,
): boolean {
  return tier === 'connected_demo' || tier === 'connected_live';
}

export async function listTerminals(ctx: ServerContext, city?: string | null) {
  try {
    return await terminalsRepo.listPublicTerminals(ctx, city);
  } catch (err) {
    ctx.logger.error('[terminals] list failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to list terminals');
  }
}

export async function getTerminal(ctx: ServerContext, id: string) {
  try {
    const data = await terminalsRepo.getTerminalById(ctx, id);
    if (!data) {
      throw new AppError(404, 'Terminal not found');
    }
    return data;
  } catch (err) {
    if (err instanceof AppError) throw err;
    ctx.logger.error('[terminals] get failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to fetch terminal');
  }
}

export async function suggestTerminal(ctx: ServerContext, raw: unknown) {
  if (!ctx.user) {
    throw new AppError(401, 'Unauthorized');
  }
  if (ctx.user.role !== 'driver') {
    throw new AppError(403, 'Forbidden');
  }

  const parsed = suggestTerminalSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
  }

  try {
    return await terminalsRepo.insertTerminal(ctx, {
      name: parsed.data.name,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      city: parsed.data.city,
      address: parsed.data.address,
      connectorType: parsed.data.connectorType,
      chargerClass: parsed.data.chargerClass,
      source: 'driver_submitted',
      isPublic: false,
      verificationStatus: 'unverified',
      submittedByUserId: ctx.user.userId,
      submissionNotes: parsed.data.notes,
    });
  } catch (err) {
    ctx.logger.error('[terminals] suggest failed', {
      userId: ctx.user.userId,
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to submit station');
  }
}

export async function createTerminal(ctx: ServerContext, raw: unknown) {
  requireRoles(ctx, WRITE_ROLES);

  const parsed = createTerminalSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
  }

  return createTerminalWithInput(ctx, parsed.data);
}

export async function createTerminalWithInput(ctx: ServerContext, input: CreateTerminalInput) {
  requireRoles(ctx, WRITE_ROLES);

  try {
    return await terminalsRepo.insertTerminal(ctx, input);
  } catch (err) {
    ctx.logger.error('[terminals] create failed', {
      role: ctx.user?.role,
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to create terminal');
  }
}

export async function updateTerminal(ctx: ServerContext, id: string, raw: unknown) {
  requireRoles(ctx, WRITE_ROLES);

  const parsed = updateTerminalSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
  }

  return updateTerminalWithInput(ctx, id, parsed.data);
}

export async function updateTerminalWithInput(
  ctx: ServerContext,
  id: string,
  input: UpdateTerminalInput,
) {
  requireRoles(ctx, WRITE_ROLES);

  try {
    const data = await terminalsRepo.updateTerminalById(ctx, id, input);
    if (!data) {
      throw new AppError(404, 'Terminal not found');
    }
    return data;
  } catch (err) {
    if (err instanceof AppError) throw err;
    ctx.logger.error('[terminals] update failed', {
      role: ctx.user?.role,
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to update terminal');
  }
}

export async function deleteTerminal(ctx: ServerContext, id: string) {
  requireRoles(ctx, DELETE_ROLES);

  try {
    await terminalsRepo.deleteTerminalById(ctx, id);
    return { id };
  } catch (err) {
    ctx.logger.error('[terminals] delete failed', {
      role: ctx.user?.role,
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to delete terminal');
  }
}
