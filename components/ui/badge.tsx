import { cn } from '@/lib/utils/cn';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-text-secondary',
  success: 'bg-available/12 text-available',
  warning: 'bg-occupied/14 text-occupied',
  danger: 'bg-offline/12 text-offline',
  info: 'bg-info/12 text-info',
  primary: 'bg-primary-light text-primary-800',
};

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  icon?: React.ReactNode;
  className?: string;
}

/** Square-cornered status chip. Never a pill — see design-system.css. */
export function Badge({ children, tone = 'neutral', icon, className = '' }: BadgeProps) {
  return (
    <span
      className={cn(
        'rounded-tag inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
