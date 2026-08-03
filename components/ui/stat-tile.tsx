import { cn } from '@/lib/utils/cn';

interface StatTileProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  variant?: 'surface' | 'ink' | 'primary';
  tone?: 'default' | 'warning' | 'danger';
}

export function StatTile({
  label,
  value,
  hint,
  icon,
  variant = 'surface',
  tone = 'default',
}: StatTileProps) {
  const isInk = variant === 'ink';
  const isPrimary = variant === 'primary';

  return (
    <div
      className={cn(
        'rounded-card p-5',
        isInk && 'bg-ink text-on-ink',
        isPrimary && 'bg-primary text-on-primary',
        variant === 'surface' && 'bg-surface border-border border',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'text-xs font-semibold tracking-wide uppercase',
            isInk && 'text-on-ink/60',
            isPrimary && 'text-on-primary/70',
            variant === 'surface' && 'text-text-secondary',
          )}
        >
          {label}
        </span>
        {icon ? (
          <span
            className={cn(
              isInk && 'text-primary',
              isPrimary && 'text-on-primary/70',
              variant === 'surface' && 'text-primary-800',
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>

      <p
        className={cn(
          'font-heading mt-3 text-3xl font-bold tracking-tight tabular-nums',
          tone === 'warning' && !isInk && !isPrimary && 'text-occupied',
          tone === 'danger' && !isInk && !isPrimary && 'text-offline',
        )}
      >
        {value}
      </p>

      {hint ? (
        <p
          className={cn(
            'mt-1 text-xs',
            isInk && 'text-on-ink/55',
            isPrimary && 'text-on-primary/65',
            variant === 'surface' && 'text-text-secondary',
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
