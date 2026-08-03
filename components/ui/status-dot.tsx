import { cn } from '@/lib/utils/cn';
import type { TerminalStatus } from '@/lib/mock/types';

const COLORS: Record<TerminalStatus | 'unknown', string> = {
  available: 'bg-available',
  occupied: 'bg-occupied',
  offline: 'bg-offline',
  fault: 'bg-offline',
  unknown: 'bg-text-secondary',
};

export const STATUS_LABELS: Record<TerminalStatus | 'unknown', string> = {
  available: 'Available',
  occupied: 'In use',
  offline: 'Offline',
  fault: 'Fault',
  unknown: 'Status unknown',
};

interface StatusDotProps {
  status: TerminalStatus | 'unknown';
  className?: string;
}

/** One of the few genuinely circular elements the design system permits. */
export function StatusDot({ status, className = '' }: StatusDotProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block size-2 shrink-0 rounded-full',
        COLORS[status],
        status === 'available' && 'ring-available/25 ring-3',
        className,
      )}
    />
  );
}
