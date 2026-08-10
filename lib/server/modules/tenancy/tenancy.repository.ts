import type { ServerContext } from '@/lib/server/context';
import type { UserRole } from '@/types/database.types';

export async function findVendorIdForUser(
  ctx: ServerContext,
  userId: string,
): Promise<string | null> {
  const { data, error } = await ctx.db
    .from('vendor_members')
    .select('vendor_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  return data?.vendor_id ?? null;
}

export async function findOwnerIdForUser(
  ctx: ServerContext,
  userId: string,
): Promise<string | null> {
  const { data, error } = await ctx.db
    .from('owner_members')
    .select('owner_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  return data?.owner_id ?? null;
}

export type VendorScope = {
  userId: string;
  role: UserRole;
  vendorId: string;
};

export type OwnerScope = {
  userId: string;
  role: UserRole;
  ownerId: string;
};

export async function vendorExists(ctx: ServerContext, vendorId: string): Promise<boolean> {
  const { data, error } = await ctx.db
    .from('vendors')
    .select('id')
    .eq('id', vendorId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function ownerExists(ctx: ServerContext, ownerId: string): Promise<boolean> {
  const { data, error } = await ctx.db
    .from('terminal_owners')
    .select('id')
    .eq('id', ownerId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}
