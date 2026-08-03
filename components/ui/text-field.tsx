import { cn } from '@/lib/utils/cn';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function TextField({
  label,
  hint,
  name,
  type = 'text',
  required,
  autoComplete,
  className = '',
  ...props
}: TextFieldProps) {
  return (
    <label className="block text-sm">
      <span className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className={cn(
          'rounded-button border-border bg-surface text-text-primary w-full border px-4 py-3.5 text-sm',
          'placeholder:text-text-secondary/70 outline-none transition-colors duration-150',
          'focus:border-primary-dark focus:ring-primary-light focus:ring-2',
          className,
        )}
        {...props}
      />
      {hint ? <span className="text-text-secondary mt-1.5 block text-xs">{hint}</span> : null}
    </label>
  );
}
