'use server';

import { revalidatePath } from 'next/cache';
import { createContextFromCookies } from '@/lib/server/create-context';
import { AppError, isAppError } from '@/lib/server/errors';
import type { AppPlatform } from '@/types/database.types';
import * as appConfigService from '@/lib/server/modules/app-config/app-config.service';

function requirePlatformAdmin() {
  return createContextFromCookies().then((ctx) => {
    if (!ctx.user) throw new AppError(401, 'Unauthorized');
    if (ctx.user.role !== 'super_admin' && ctx.user.role !== 'staff') {
      throw new AppError(403, 'Forbidden');
    }
    return ctx;
  });
}

export type AppConfigActionState = {
  ok: boolean;
  message: string;
};

const initialMessage: AppConfigActionState = { ok: false, message: '' };

function toMessage(err: unknown): AppConfigActionState {
  const message = isAppError(err)
    ? err.message
    : err instanceof Error
      ? err.message
      : 'Something went wrong';
  return { ok: false, message };
}

export async function updatePlatformConfigAction(
  _prev: AppConfigActionState,
  formData: FormData,
): Promise<AppConfigActionState> {
  try {
    const ctx = await requirePlatformAdmin();
    const platform = String(formData.get('platform')) as AppPlatform;
    await appConfigService.updatePlatformConfig(ctx, platform, {
      minVersion: String(formData.get('minVersion') ?? ''),
      minBuildNumber: String(formData.get('minBuildNumber') ?? ''),
      latestVersion: String(formData.get('latestVersion') ?? ''),
      latestBuildNumber: String(formData.get('latestBuildNumber') ?? ''),
      forceUpdate: formData.get('forceUpdate') === 'on',
      storeUrl: String(formData.get('storeUrl') ?? ''),
    });
    revalidatePath('/admin/app-config');
    return { ok: true, message: `${platform === 'ios' ? 'iOS' : 'Android'} config updated.` };
  } catch (err) {
    return toMessage(err);
  }
}

export async function updateMaintenanceAction(
  _prev: AppConfigActionState,
  formData: FormData,
): Promise<AppConfigActionState> {
  try {
    const ctx = await requirePlatformAdmin();
    await appConfigService.updateMaintenance(ctx, {
      enabled: formData.get('enabled') === 'on',
      message: String(formData.get('message') ?? ''),
    });
    revalidatePath('/admin/app-config');
    return { ok: true, message: 'Maintenance mode updated.' };
  } catch (err) {
    return toMessage(err);
  }
}

export { initialMessage as appConfigActionInitialState };
