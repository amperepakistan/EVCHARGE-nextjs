import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'ink' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-dark shadow-sm',
  secondary: 'bg-primary-light text-on-primary hover:bg-primary-200',
  outline: 'border border-border bg-surface text-text-primary hover:bg-surface-muted',
  ghost: 'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
  ink: 'bg-ink text-on-ink hover:bg-ink-soft shadow-sm',
  danger: 'bg-error/10 text-error hover:bg-error/15',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-6 text-sm gap-2',
};

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        // Rounded rectangle, never a pill — see the radius rule in design-system.css.
        'rounded-button inline-flex cursor-pointer items-center justify-center font-semibold',
        'transition-all duration-150 active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        SIZES[size],
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
