import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * One band of the landing page, held to a 16:9 content box.
 *
 * The ratio is applied to the inner `max-w-7xl` column rather than the
 * full-bleed section, so every band resolves to the same height (1280 / 16 * 9
 * = 720px) on any desktop width — that evenness is the whole point. A
 * full-bleed ratio would instead make bands taller on wider monitors.
 *
 * `aspect-[16/9]` is a floor, not a clamp: if a band's content ever exceeds
 * 720px the box grows rather than clipping. Below `md` the ratio is dropped
 * altogether — 16:9 at phone widths is a ~200px-tall letterbox that no real
 * content fits into — and ordinary vertical padding takes over.
 */
export function Section({
  id,
  tone = 'surface',
  aspect = false,
  className,
  children,
}: {
  id?: string;
  tone?: 'surface' | 'canvas';
  aspect?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        'scroll-mt-24 px-6 md:px-10',
        tone === 'canvas' ? 'bg-canvas' : 'bg-surface',
        className,
      )}
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-7xl flex-col justify-center py-12 md:py-20',
          aspect && 'md:aspect-[16/9]',
        )}
      >
        {children}
      </div>
    </section>
  );
}
