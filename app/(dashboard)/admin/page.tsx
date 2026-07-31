import { supabaseServer } from '@/lib/supabase/server';
import { TerminalTable } from '@/components/features/terminals/terminal-table';

export default async function AdminConsolePage() {
  const [{ count: terminalCount }, { count: vendorCount }, { count: ownerCount }, terminals] =
    await Promise.all([
      supabaseServer().from('terminals').select('*', { count: 'exact', head: true }),
      supabaseServer().from('vendors').select('*', { count: 'exact', head: true }),
      supabaseServer().from('terminal_owners').select('*', { count: 'exact', head: true }),
      supabaseServer()
        .from('terminals')
        .select('id, name, city, connectivity_tier, charger_class, connector_type')
        .order('updated_at', { ascending: false })
        .limit(25),
    ]);

  if (terminals.error) throw new Error(terminals.error.message);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin console</h1>
        <p className="mt-1 text-sm text-black/60">Full network control plane.</p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-3">
        <Stat label="Terminals" value={terminalCount ?? 0} />
        <Stat label="Vendors" value={vendorCount ?? 0} />
        <Stat label="Owners" value={ownerCount ?? 0} />
      </dl>

      <div className="space-y-3">
        <h2 className="text-sm font-medium tracking-wide text-black/60 uppercase">
          Recent terminals
        </h2>
        <TerminalTable terminals={terminals.data ?? []} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-white px-4 py-5">
      <dt className="text-xs tracking-wide text-black/50 uppercase">{label}</dt>
      <dd className="mt-2 text-3xl font-semibold">{value}</dd>
    </div>
  );
}
