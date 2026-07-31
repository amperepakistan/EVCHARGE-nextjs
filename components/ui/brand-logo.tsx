export function BrandLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  // Heights matched precisely to text line box centers
  const iconSizes = {
    sm: 'h-6 w-6 rounded-md',
    md: 'h-8 w-8 rounded-xl',
    lg: 'h-10 w-10 rounded-xl',
  };

  const textSizes = {
    sm: 'text-lg leading-6',
    md: 'text-2xl leading-8',
    lg: 'text-3xl leading-10',
  };

  return (
    <div className="flex items-center gap-3">
      {/* 1:1 Aspect ratio Icon placeholder */}
      <div
        className={`aspect-square ${iconSizes[size]} bg-[var(--color-primary)] flex items-center justify-center font-heading font-extrabold text-[var(--color-on-primary)] shadow-sm shrink-0`}
      >
        <svg
          className="w-3/5 h-3/5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>

      {/* Brand Heading Text in Gotham matching exact line-height box of icon */}
      <span
        className={`font-heading font-bold tracking-tight text-[var(--color-text-primary)] ${textSizes[size]}`}
      >
        Ampere
      </span>
    </div>
  );
}
