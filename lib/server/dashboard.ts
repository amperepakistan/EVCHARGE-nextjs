import { redirect } from 'next/navigation';
import { createContextFromCookies } from '@/lib/server/create-context';
import { isAppError } from '@/lib/server/errors';
import type { ServerContext } from '@/lib/server/context';
import {
  resolveOwnerScope,
  resolveVendorScope,
} from '@/lib/server/modules/tenancy/tenancy.service';
import type { OwnerScope, VendorScope } from '@/lib/server/modules/tenancy/tenancy.repository';

export class TenantAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantAccessError';
  }
}

export async function requireVendorDashboard(): Promise<{
  ctx: ServerContext;
  scope: VendorScope;
}> {
  const ctx = await createContextFromCookies();
  if (!ctx.user) {
    redirect('/login');
  }
  try {
    const scope = await resolveVendorScope(ctx);
    return { ctx, scope };
  } catch (err) {
    if (isAppError(err) && (err.status === 401 || err.status === 403)) {
      throw new TenantAccessError(err.message);
    }
    throw err;
  }
}

export async function requireOwnerDashboard(): Promise<{
  ctx: ServerContext;
  scope: OwnerScope;
}> {
  const ctx = await createContextFromCookies();
  if (!ctx.user) {
    redirect('/login');
  }
  try {
    const scope = await resolveOwnerScope(ctx);
    return { ctx, scope };
  } catch (err) {
    if (isAppError(err) && (err.status === 401 || err.status === 403)) {
      throw new TenantAccessError(err.message);
    }
    throw err;
  }
}
