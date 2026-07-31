interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  let variantStyles = '';

  if (variant === 'primary') {
    variantStyles =
      'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-dark)] active:scale-[0.98] shadow-sm';
  } else if (variant === 'secondary') {
    variantStyles =
      'bg-[var(--color-primary-light)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-200)] active:scale-[0.98]';
  } else {
    variantStyles =
      'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-black/5 active:scale-[0.98]';
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={`btn-pill h-12 px-6 text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
