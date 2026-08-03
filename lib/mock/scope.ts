import { getSessionFromCookies } from '@/lib/auth/session';
import { mockUserById } from '@/lib/mock/users';
import { OWNER_ID_MALL, VENDOR_ID } from '@/lib/mock/terminals';

/**
 * Resolves which tenant the signed-in user is looking at.
 *
 * `middleware.ts` lets a super_admin into both trees, so admins fall back to
 * the primary demo tenant rather than rendering an empty dashboard.
 */
export async function getVendorScope() {
  const session = await getSessionFromCookies();
  const user = session ? mockUserById(session.userId) : undefined;
  return {
    user,
    vendorId: user?.vendorId ?? VENDOR_ID,
  };
}

export async function getOwnerScope() {
  const session = await getSessionFromCookies();
  const user = session ? mockUserById(session.userId) : undefined;
  return {
    user,
    ownerId: user?.ownerId ?? OWNER_ID_MALL,
  };
}
