import Image from 'next/image';

/**
 * Icon + wordmark lockup.
 *
 * Alignment note: the old lockup gave the wordmark a line-height equal to the
 * icon's height (`leading-8` against a 32px icon), which centres the *line box*
 * — a box whose descender space "Ampere" barely uses. Setting `leading-none`
 * instead makes the box the font's own ascent+descent, so flex centring lands
 * the glyphs' ink box on the icon's centre. Measured at 24px: the ink centre
 * ends up within half a pixel of the icon centre, so no magic offset is needed.
 * Don't reintroduce one without re-measuring — a hand-picked nudge was 1.6px
 * out.
 */

export function BrandLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const iconClass = {
    sm: 'size-6 rounded-md',
    md: 'size-8 rounded-xl',
    lg: 'size-10 rounded-xl',
  }[size];

  const iconPx = { sm: 24, md: 32, lg: 40 }[size];

  const textClass = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }[size];

  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/brand/logo.png"
        alt=""
        width={iconPx}
        height={iconPx}
        className={`${iconClass} shrink-0 object-cover shadow-sm`}
      />

      <span
        className={`font-heading text-text-primary font-bold tracking-tight ${textClass}`}
        style={{ lineHeight: 1 }}
      >
        Ampere
      </span>
    </div>
  );
}
