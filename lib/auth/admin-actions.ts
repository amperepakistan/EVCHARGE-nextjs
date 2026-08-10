'use server';

import { redirect } from 'next/navigation';
import {
  clearAdminTenantScope,
  setAdminOwnerScope,
  setAdminVendorScope,
} from '@/lib/auth/admin-scope';
import { createContextFromCookies } from '@/lib/server/create-context';
import { AppError, isAppError } from '@/lib/server/errors';
import * as adminService from '@/lib/server/modules/admin/admin.service';
import * as driversAdmin from '@/lib/server/modules/admin/drivers-admin.service';

function requirePlatformAdmin() {
  return createContextFromCookies().then((ctx) => {
    if (!ctx.user) throw new AppError(401, 'Unauthorized');
    if (ctx.user.role !== 'super_admin' && ctx.user.role !== 'staff') {
      throw new AppError(403, 'Forbidden');
    }
    return ctx;
  });
}

export async function enterVendorDashboardAction(vendorId: string) {
  const ctx = await requirePlatformAdmin();
  const vendor = await adminService.getVendor(ctx, vendorId);
  if (!vendor) throw new AppError(404, 'Vendor not found');
  await setAdminVendorScope(vendorId);
  redirect('/vendor');
}

export async function enterOwnerDashboardAction(ownerId: string) {
  const ctx = await requirePlatformAdmin();
  const owner = await adminService.getOwner(ctx, ownerId);
  if (!owner) throw new AppError(404, 'Owner not found');
  await setAdminOwnerScope(ownerId);
  redirect('/owner');
}

export async function exitTenantDashboardAction() {
  await requirePlatformAdmin();
  await clearAdminTenantScope();
  redirect('/admin');
}

export type DriverActionState = {
  ok: boolean;
  message: string;
};

export async function resetDriverPasswordAction(
  _prev: DriverActionState,
  formData: FormData,
): Promise<DriverActionState> {
  try {
    const ctx = await requirePlatformAdmin();
    const driverId = String(formData.get('driverId') ?? '');
    const password = String(formData.get('password') ?? '');
    await driversAdmin.resetDriverPassword(ctx, driverId, password);
    return { ok: true, message: 'Password updated.' };
  } catch (err) {
    const message = isAppError(err)
      ? err.message
      : err instanceof Error
        ? err.message
        : 'Failed to reset password';
    return { ok: false, message };
  }
}

export async function updateDriverEmailAction(
  _prev: DriverActionState,
  formData: FormData,
): Promise<DriverActionState> {
  try {
    const ctx = await requirePlatformAdmin();
    const driverId = String(formData.get('driverId') ?? '');
    const email = String(formData.get('email') ?? '');
    await driversAdmin.updateDriverEmail(ctx, driverId, email);
    return { ok: true, message: 'Email updated.' };
  } catch (err) {
    const message = isAppError(err)
      ? err.message
      : err instanceof Error
        ? err.message
        : 'Failed to update email';
    return { ok: false, message };
  }
}
