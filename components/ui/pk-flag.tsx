/**
 * Pakistan's flag, clipped to a circle for the header's region badge.
 *
 * Drawn inline rather than shipped as an asset: at 20px the crescent has to be
 * hinted by hand, and an <img> of the real 3:2 flag squashes to unreadable mush
 * at this size. The crescent is the standard two-circle cut — a white disc with
 * a green disc offset over it.
 */
export function PkFlag({ className = 'size-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="pk-flag-circle">
          <circle cx="12" cy="12" r="12" />
        </clipPath>
      </defs>
      <g clipPath="url(#pk-flag-circle)">
        <rect width="24" height="24" fill="#01411c" />
        <rect width="6" height="24" fill="#ffffff" />
        {/* Crescent: white disc, then a green disc offset up-right to cut it. */}
        <circle cx="15.1" cy="12" r="5.3" fill="#ffffff" />
        <circle cx="16.9" cy="10.5" r="5.3" fill="#01411c" />
        {/* Five-pointed star, tucked into the crescent's opening. */}
        <path
          fill="#ffffff"
          d="M18.4 8.0l.62 1.44 1.56.14-1.18 1.03.35 1.53-1.35-.81-1.35.81.35-1.53-1.18-1.03 1.56-.14z"
        />
      </g>
      {/* Hairline ring, outside the clip. Without it the flag's white hoist
          stripe vanishes into a light badge and the disc reads as a bitten-off
          green blob rather than a circular flag. */}
      <circle
        cx="12"
        cy="12"
        r="11.5"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="1"
      />
    </svg>
  );
}
