import Image from 'next/image';

export function BrandLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  // Heights matched precisely to text line box centers
  const iconSizes = {
    sm: 'h-6 w-6 rounded-md',
    md: 'h-8 w-8 rounded-xl',
    lg: 'h-10 w-10 rounded-xl',
  };

  const iconPx = {
    sm: 24,
    md: 32,
    lg: 40,
  };

  const textSizes = {
    sm: 'text-lg leading-6',
    md: 'text-2xl leading-8',
    lg: 'text-3xl leading-10',
  };

  return (
    <div className="flex items-center gap-3">
      {/* Logo mark — always rounded, never sharp corners */}
      <Image
        src="/brand/logo.png"
        alt="Ampere"
        width={iconPx[size]}
        height={iconPx[size]}
        className={`aspect-square ${iconSizes[size]} shadow-sm shrink-0 object-cover`}
      />

      {/* Brand Heading Text in Gotham matching exact line-height box of icon */}
      <span
        className={`font-heading font-bold tracking-tight text-[var(--color-text-primary)] ${textSizes[size]}`}
      >
        Ampere
      </span>
    </div>
  );
}
