import type { Tables } from '@/types/database.types';

type TerminalRow = Pick<
  Tables<'terminals'>,
  'id' | 'name' | 'city' | 'connectivity_tier' | 'charger_class' | 'connector_type'
>;

export function TerminalTable({ terminals }: { terminals: TerminalRow[] }) {
  if (terminals.length === 0) {
    return (
      <p className="rounded-md border border-[var(--border)] bg-white px-4 py-8 text-center text-sm text-black/60">
        No terminals yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-[var(--border)] bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-[var(--border)] bg-[var(--accent-muted)]/40 text-xs tracking-wide uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">City</th>
            <th className="px-4 py-3 font-medium">Class</th>
            <th className="px-4 py-3 font-medium">Connector</th>
            <th className="px-4 py-3 font-medium">Tier</th>
          </tr>
        </thead>
        <tbody>
          {terminals.map((t) => (
            <tr key={t.id} className="border-b border-[var(--border)] last:border-0">
              <td className="px-4 py-3 font-medium">{t.name}</td>
              <td className="px-4 py-3 text-black/70">{t.city ?? '—'}</td>
              <td className="px-4 py-3 text-black/70">{t.charger_class ?? '—'}</td>
              <td className="px-4 py-3 text-black/70">{t.connector_type ?? '—'}</td>
              <td className="px-4 py-3 text-black/70">{t.connectivity_tier}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
