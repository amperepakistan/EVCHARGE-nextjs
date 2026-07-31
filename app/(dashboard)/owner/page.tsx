import { supabaseServer } from '@/lib/supabase/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { TerminalTable } from '@/components/features/terminals/terminal-table';

export default async function OwnerOverviewPage() {
  const session = await getSessionFromCookies();

  const { data: memberships } = await supabaseServer()
    .from('owner_members')
    .select('owner_id')
    .eq('user_id', session!.userId);

  const ownerIds = (memberships ?? []).map((m) => m.owner_id);

  const { data, error } =
    ownerIds.length === 0
      ? { data: [], error: null }
      : await supabaseServer()
          .from('terminals')
          .select('id, name, city, connectivity_tier, charger_class, connector_type')
          .in('current_owner_id', ownerIds)
          .order('name');

  if (error) throw new Error(error.message);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Owner overview</h1>
        <p className="mt-1 text-sm text-black/60">
          Terminals you own ({data?.length ?? 0}).
        </p>
      </div>
      <TerminalTable terminals={data ?? []} />
    </div>
  );
}
