import { supabaseServer } from '@/lib/supabase/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { TerminalTable } from '@/components/features/terminals/terminal-table';

export default async function VendorTerminalsPage() {
  const session = await getSessionFromCookies();

  const { data: memberships } = await supabaseServer()
    .from('vendor_members')
    .select('vendor_id')
    .eq('user_id', session!.userId);

  const vendorIds = (memberships ?? []).map((m) => m.vendor_id);

  const { data, error } =
    vendorIds.length === 0
      ? { data: [], error: null }
      : await supabaseServer()
          .from('terminals')
          .select('id, name, city, connectivity_tier, charger_class, connector_type')
          .in('current_vendor_id', vendorIds)
          .order('name');

  if (error) throw new Error(error.message);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Installed terminals</h1>
        <p className="mt-1 text-sm text-black/60">All terminals linked to your vendor account.</p>
      </div>
      <TerminalTable terminals={data ?? []} />
    </div>
  );
}
