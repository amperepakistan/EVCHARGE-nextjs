export function TextField({
  label,
  name,
  type = 'text',
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-black/80">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 outline-none focus:border-[var(--accent)]"
      />
    </label>
  );
}
