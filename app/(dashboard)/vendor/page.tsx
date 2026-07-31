import { supabaseServer } from '@/lib/supabase/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { TerminalTable } from '@/components/features/terminals/terminal-table';

export default async function VendorOverviewPage() {
  const session = await getSessionFromCookies();

  const { data: memberships } = await supabaseServer()
    .from('vendor_members')
    .select('vendor_id')
    .eq('user_id', session!.userId);

  const vendorIds = (memberships ?? []).map((m) => m.vendor_id);

  let terminals: Awaited<ReturnType<typeof fetchVendorTerminals>> = [];
  if (vendorIds.length > 0) {
    terminals = await fetchVendorTerminals(vendorIds);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vendor overview</h1>
        <p className="mt-1 text-sm text-black/60">
          Terminals installed across your install base ({terminals.length}).
        </p>
      </div>
      <TerminalTable terminals={terminals} />
    </div>
  );
}

async function fetchVendorTerminals(vendorIds: string[]) {
  const { data, error } = await supabaseServer()
    .from('terminals')
    .select('id, name, city, connectivity_tier, charger_class, connector_type')
    .in('current_vendor_id', vendorIds)
    .order('name');

  if (error) throw new Error(error.message);
  return data ?? [];
}
