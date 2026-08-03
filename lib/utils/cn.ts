type ClassValue = string | number | null | undefined | false;

/**
 * Joins class names, dropping falsy values.
 *
 * Deliberately dependency-free — the repo has no `clsx`/`tailwind-merge`, and
 * this covers the conditional-class case that was previously done with manual
 * template concatenation in every component. It does NOT de-duplicate
 * conflicting Tailwind utilities, so pass the caller's `className` last and
 * let source order win.
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
