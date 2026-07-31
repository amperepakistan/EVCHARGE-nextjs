export function Button({
  children,
  type = 'button',
  variant = 'primary',
  disabled,
}: {
  children: React.ReactNode;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}) {
  const styles =
    variant === 'primary'
      ? 'bg-[var(--accent)] text-white'
      : 'border border-[var(--border)] bg-white text-[var(--foreground)]';

  return (
    <button
      type={type}
      disabled={disabled}
      className={`rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 ${styles}`}
    >
      {children}
    </button>
  );
}
