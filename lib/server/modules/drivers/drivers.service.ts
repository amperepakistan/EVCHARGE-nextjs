import type { ServerContext } from '@/lib/server/context';
import { AppError } from '@/lib/server/errors';
import * as driversRepo from '@/lib/server/modules/drivers/drivers.repository';
import {
  patchDriverSchema,
} from '@/lib/server/modules/drivers/drivers.schema';

function requireAuth(ctx: ServerContext) {
  if (!ctx.user) throw new AppError(401, 'Unauthorized');
  return ctx.user;
}

export async function getMyDriverProfile(ctx: ServerContext) {
  const user = requireAuth(ctx);
  try {
    const profile = await driversRepo.findDriverByUserId(ctx, user.userId);
    // Vendor/owner logins may have no drivers row — return null
    return profile;
  } catch (err) {
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to load driver');
  }
}

export async function patchMyDriverProfile(ctx: ServerContext, raw: unknown) {
  const user = requireAuth(ctx);
  const parsed = patchDriverSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
  }

  try {
    const existing = await driversRepo.findDriverByUserId(ctx, user.userId);
    if (!existing) {
      throw new AppError(404, 'Driver profile not found');
    }
    return await driversRepo.updateDriverForUser(ctx, user.userId, parsed.data);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to update driver');
  }
}

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const AVATAR_EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const AVATAR_BUCKET = 'driver-profile-images';

export async function uploadMyProfileImage(ctx: ServerContext, file: File) {
  const user = requireAuth(ctx);

  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    throw new AppError(400, 'Image must be JPEG, PNG, or WebP');
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new AppError(400, 'Image must be 5MB or smaller');
  }

  const existing = await driversRepo.findDriverByUserId(ctx, user.userId);
  if (!existing) {
    throw new AppError(404, 'Driver profile not found');
  }

  const ext = AVATAR_EXT_BY_TYPE[file.type];
  const path = `${user.userId}/${Date.now()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await ctx.db.storage
    .from(AVATAR_BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: true });
  if (uploadError) {
    throw new AppError(500, `Failed to upload image: ${uploadError.message}`);
  }

  const { data: publicUrl } = ctx.db.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  try {
    return await driversRepo.setDriverProfileImage(ctx, user.userId, publicUrl.publicUrl);
  } catch (err) {
    throw new AppError(500, err instanceof Error ? err.message : 'Failed to save profile image');
  }
}
