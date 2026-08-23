import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/app-links';

/**
 * Apple's and Google's official download badges, always the same height.
 *
 * Plain <img>, not next/image: the optimizer returns 400 for SVG sources
 * unless `dangerouslyAllowSVG` is set, and these are already tiny hand-tuned
 * vectors that gain nothing from being rasterised.
 *
 * The two source SVGs have different intrinsic aspect ratios, so height is the
 * only dimension pinned — matching widths would distort one of them, and both
 * vendors' brand guidelines forbid that.
 */
export function StoreBadges({
  height = 'h-12',
  className = '',
}: {
  height?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Download Ampere on the App Store"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/app-download-badges/app-store-badge.svg"
          alt="Download on the App Store"
          className={`${height} w-auto`}
        />
      </a>
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Get Ampere on Google Play"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/app-download-badges/google-play-badge.svg"
          alt="Get it on Google Play"
          className={`${height} w-auto`}
        />
      </a>
    </div>
  );
}
