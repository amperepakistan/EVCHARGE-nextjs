import type { ServerContext } from '@/lib/server/context';
import { AppError } from '@/lib/server/errors';
import * as adminRepo from '@/lib/server/modules/admin/admin.repository';

function requirePlatformAdmin(ctx: ServerContext) {
  if (!ctx.user) throw new AppError(401, 'Unauthorized');
  if (ctx.user.role !== 'super_admin' && ctx.user.role !== 'staff') {
    throw new AppError(403, 'Forbidden');
  }
  return ctx.user;
}

export async function getNetworkConsole(ctx: ServerContext) {
  requirePlatformAdmin(ctx);
  try {
    const [vendors, owners, terminalCount, driverCount, terminals, sessions] =
      await Promise.all([
        adminRepo.listVendors(ctx),
        adminRepo.listOwners(ctx),
        adminRepo.countTerminals(ctx),
        adminRepo.countDrivers(ctx),
        adminRepo.listAllTerminals(ctx, 50),
        adminRepo.listRecentSessions(ctx, 20),
      ]);

    const snapshots = await adminRepo.getLatestStatusByTerminalIds(
      ctx,
      terminals.map((t) => t.id),
    );

    const faulted = [...snapshots.values()].filter((s) => s.status === 'fault').length;

    return {
      vendors,
      owners,
      terminalCount,
      driverCount,
      vendorCount: vendors.length,
      ownerCount: owners.length,
      openFaults: faulted,
      recentTerminals: terminals.map((t) => ({
        ...t,
        status: snapshots.get(t.id)?.status ?? ('unknown' as const),
        lastSeen: snapshots.get(t.id)?.recorded_at ?? null,
      })),
      recentSessions: sessions,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    ctx.logger.error('[admin] console failed', {
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to load console');
  }
}

export async function listVendorsWithStats(ctx: ServerContext) {
  requirePlatformAdmin(ctx);
  try {
    const [vendors, counts] = await Promise.all([
      adminRepo.listVendors(ctx),
      adminRepo.countTerminalsByVendor(ctx),
    ]);
    return vendors.map((v) => ({
      ...v,
      terminalCount: counts.get(v.id) ?? 0,
    }));
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to list vendors');
  }
}

export async function listOwnersWithStats(ctx: ServerContext) {
  requirePlatformAdmin(ctx);
  try {
    const [owners, counts] = await Promise.all([
      adminRepo.listOwners(ctx),
      adminRepo.countTerminalsByOwner(ctx),
    ]);
    return owners.map((o) => ({
      ...o,
      terminalCount: counts.get(o.id) ?? 0,
    }));
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to list owners');
  }
}

export async function getVendor(ctx: ServerContext, vendorId: string) {
  requirePlatformAdmin(ctx);
  try {
    return await adminRepo.getVendorById(ctx, vendorId);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to load vendor');
  }
}

export async function getOwner(ctx: ServerContext, ownerId: string) {
  requirePlatformAdmin(ctx);
  try {
    return await adminRepo.getOwnerById(ctx, ownerId);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to load owner');
  }
}

export async function listNetworkChargers(ctx: ServerContext) {
  requirePlatformAdmin(ctx);
  try {
    const terminals = await adminRepo.listAllTerminals(ctx, 500);
    const snapshots = await adminRepo.getLatestStatusByTerminalIds(
      ctx,
      terminals.map((t) => t.id),
    );
    const [vendors, owners] = await Promise.all([
      adminRepo.listVendors(ctx),
      adminRepo.listOwners(ctx),
    ]);
    const vendorName = new Map(vendors.map((v) => [v.id, v.name]));
    const ownerName = new Map(owners.map((o) => [o.id, o.name]));

    return terminals.map((t) => ({
      ...t,
      status: snapshots.get(t.id)?.status ?? ('unknown' as const),
      lastSeen: snapshots.get(t.id)?.recorded_at ?? null,
      vendorName: t.current_vendor_id
        ? (vendorName.get(t.current_vendor_id) ?? null)
        : null,
      ownerName: t.current_owner_id ? (ownerName.get(t.current_owner_id) ?? null) : null,
    }));
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to list chargers');
  }
}

export async function listNetworkSessions(ctx: ServerContext) {
  requirePlatformAdmin(ctx);
  try {
    return await adminRepo.listRecentSessions(ctx, 200);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to list sessions');
  }
}
