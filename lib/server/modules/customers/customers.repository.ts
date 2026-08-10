import type { ServerContext } from '@/lib/server/context';

export type DerivedCustomer = {
  id: string;
  businessName: string;
  contactName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  terminalCount: number;
  installFee: number;
  monthlyFee: number;
  contractStatus: 'none';
};

/** Site owners that have at least one terminal under this vendor. Fees are zero until CRM exists. */
export async function listCustomersForVendor(
  ctx: ServerContext,
  vendorId: string,
): Promise<DerivedCustomer[]> {
  const { data: terminals, error } = await ctx.db
    .from('terminals')
    .select('current_owner_id')
    .eq('current_vendor_id', vendorId)
    .not('current_owner_id', 'is', null);

  if (error) throw new Error(error.message);

  const countByOwner = new Map<string, number>();
  for (const row of terminals ?? []) {
    if (!row.current_owner_id) continue;
    countByOwner.set(
      row.current_owner_id,
      (countByOwner.get(row.current_owner_id) ?? 0) + 1,
    );
  }

  const ownerIds = [...countByOwner.keys()];
  if (ownerIds.length === 0) return [];

  const { data: owners, error: ownersError } = await ctx.db
    .from('terminal_owners')
    .select('id, name, contact_email, contact_phone')
    .in('id', ownerIds)
    .order('name');

  if (ownersError) throw new Error(ownersError.message);

  return (owners ?? []).map((o) => ({
    id: o.id,
    businessName: o.name,
    contactName: o.name,
    contactEmail: o.contact_email,
    contactPhone: o.contact_phone,
    terminalCount: countByOwner.get(o.id) ?? 0,
    installFee: 0,
    monthlyFee: 0,
    contractStatus: 'none' as const,
  }));
}

export async function getCustomerForVendor(
  ctx: ServerContext,
  vendorId: string,
  ownerId: string,
): Promise<DerivedCustomer | null> {
  const { count, error } = await ctx.db
    .from('terminals')
    .select('id', { count: 'exact', head: true })
    .eq('current_vendor_id', vendorId)
    .eq('current_owner_id', ownerId);

  if (error) throw new Error(error.message);
  if (!count) return null;

  const { data: owner, error: ownerError } = await ctx.db
    .from('terminal_owners')
    .select('id, name, contact_email, contact_phone')
    .eq('id', ownerId)
    .maybeSingle();

  if (ownerError) throw new Error(ownerError.message);
  if (!owner) return null;

  return {
    id: owner.id,
    businessName: owner.name,
    contactName: owner.name,
    contactEmail: owner.contact_email,
    contactPhone: owner.contact_phone,
    terminalCount: count,
    installFee: 0,
    monthlyFee: 0,
    contractStatus: 'none',
  };
}

export async function listVendorTerminalsForOwner(
  ctx: ServerContext,
  vendorId: string,
  ownerId: string,
) {
  const { data, error } = await ctx.db
    .from('terminals')
    .select(
      'id, name, city, charger_class, connector_type, connectivity_tier, current_vendor_id, current_owner_id',
    )
    .eq('current_vendor_id', vendorId)
    .eq('current_owner_id', ownerId)
    .order('name');

  if (error) throw new Error(error.message);
  return data ?? [];
}
