interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function TextField({
  label,
  name,
  type = 'text',
  required,
  autoComplete,
  className = '',
  ...props
}: TextFieldProps) {
  return (
    <label className="block text-sm">
      <span className="mb-2 block font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className={`input-rounded w-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-150 focus:border-[var(--color-primary-dark)] focus:ring-2 focus:ring-[var(--color-primary-light)] ${className}`}
        {...props}
      />
    </label>
  );
}
