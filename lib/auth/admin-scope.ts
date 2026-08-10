import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

/** Cookie set when a platform admin drills into a vendor dashboard. */
export const ADMIN_VENDOR_COOKIE = 'evcharge_admin_vendor';
/** Cookie set when a platform admin drills into an owner dashboard. */
export const ADMIN_OWNER_COOKIE = 'evcharge_admin_owner';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 8, // 8 hours
};

export async function getAdminVendorIdFromCookies(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ADMIN_VENDOR_COOKIE)?.value ?? null;
}

export async function getAdminOwnerIdFromCookies(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ADMIN_OWNER_COOKIE)?.value ?? null;
}

export function getAdminVendorIdFromRequest(req: NextRequest): string | null {
  return req.cookies.get(ADMIN_VENDOR_COOKIE)?.value ?? null;
}

export function getAdminOwnerIdFromRequest(req: NextRequest): string | null {
  return req.cookies.get(ADMIN_OWNER_COOKIE)?.value ?? null;
}

export async function setAdminVendorScope(vendorId: string) {
  const jar = await cookies();
  jar.set(ADMIN_VENDOR_COOKIE, vendorId, COOKIE_OPTIONS);
  jar.set(ADMIN_OWNER_COOKIE, '', { ...COOKIE_OPTIONS, maxAge: 0 });
}

export async function setAdminOwnerScope(ownerId: string) {
  const jar = await cookies();
  jar.set(ADMIN_OWNER_COOKIE, ownerId, COOKIE_OPTIONS);
  jar.set(ADMIN_VENDOR_COOKIE, '', { ...COOKIE_OPTIONS, maxAge: 0 });
}

export async function clearAdminTenantScope() {
  const jar = await cookies();
  jar.set(ADMIN_VENDOR_COOKIE, '', { ...COOKIE_OPTIONS, maxAge: 0 });
  jar.set(ADMIN_OWNER_COOKIE, '', { ...COOKIE_OPTIONS, maxAge: 0 });
}
