import { cn } from '@/lib/utils/cn';

type CardVariant = 'surface' | 'muted' | 'ink';

const VARIANTS: Record<CardVariant, string> = {
  surface: 'bg-surface border border-border',
  muted: 'bg-surface-muted',
  ink: 'bg-ink text-on-ink',
};

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  padded?: boolean;
}

export function Card({
  children,
  variant = 'surface',
  padded = true,
  className = '',
}: CardProps) {
  return (
    <div className={cn('rounded-card', VARIANTS[variant], padded && 'p-5', className)}>
      {children}
    </div>
  );
}
