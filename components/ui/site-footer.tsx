import Link from 'next/link';
import { BrandLogo } from '@/components/ui/brand-logo';
import { PkFlag } from '@/components/ui/pk-flag';
import { StoreBadges } from '@/components/ui/store-badges';
import { cn } from '@/lib/utils/cn';
import { CONTACT, OPERATOR } from '@/lib/legal/config';

/**
 * The one footer for every public page — landing, login and the legal pages.
 *
 * Legal links live here rather than being repeated per page so that the app
 * stores' requirement (privacy policy reachable from anywhere public) cannot
 * drift out of sync as pages are added.
 *
 * `minimal` exists for chrome-light pages such as login, where a full sitemap
 * under a single sign-in card reads as noise.
 */

interface SiteFooterProps {
  /** Full sitemap, or just the legal line. */
  variant?: 'full' | 'minimal';
  /** Hidden on narrow, chrome-light pages such as login. */
  showLogo?: boolean;
  /** Matches the content width of the page it sits under. */
  maxWidth?: 'max-w-4xl' | 'max-w-7xl';
  className?: string;
}

const FOOTER_GROUPS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'For drivers',
    links: [
      { label: 'Every charger, one map', href: '/#drivers' },
      { label: 'See it in action', href: '/#screenshots' },
      { label: 'Connect a home charger', href: '/#home-charger' },
    ],
  },
  {
    heading: 'For businesses',
    links: [
      { label: 'Host a charger at your site', href: '/#business' },
      { label: 'Become a terminal vendor', href: '/#business' },
      { label: 'Partner sign in', href: '/login' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Contact us', href: `mailto:${CONTACT.support}` },
    ],
  },
];

export function SiteFooter({
  variant = 'full',
  showLogo = true,
  maxWidth = 'max-w-7xl',
  className,
}: SiteFooterProps) {
  const year = new Date().getFullYear();

  if (variant === 'minimal') {
    return (
      <footer className={cn('bg-canvas px-6 py-6 md:px-10', className)}>
        <div
          className={cn(
            'text-text-primary mx-auto flex flex-col items-center gap-3 text-xs md:flex-row md:justify-center md:gap-6',
            maxWidth,
          )}
        >
          <LegalNav />
          <p>
            &copy; {year} {OPERATOR.name}. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className={cn('bg-canvas px-6 pt-14 pb-8 md:px-10', className)}>
      <div className={cn('mx-auto', maxWidth)}>
        <div className="grid gap-10 md:grid-cols-4">
          {showLogo && (
            <div>
              <Link href="/" aria-label={`${OPERATOR.name} home`}>
                <BrandLogo size="md" />
              </Link>
              <p className="text-text-primary mt-4 max-w-xs text-sm leading-relaxed">
                Every EV charger in Pakistan, on one map.
              </p>
            </div>
          )}

          {FOOTER_GROUPS.map(({ heading, links }) => (
            <div key={heading}>
              <h2 className="text-text-primary text-xs font-bold tracking-wider uppercase">
                {heading}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-text-primary hover:text-primary-700 text-sm transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-text-secondary/20 mt-12 grid gap-6 border-t pt-8 md:grid-cols-2 md:items-start">
          {/* The app grades every station by how much live data we actually
              have (Connected / Sensor-assisted / Listed). Saying so here keeps
              the marketing site from over-promising what the map guarantees. */}
          <p className="text-text-primary max-w-md text-xs leading-relaxed">
            Ampere is a directory of EV charging stations. Live availability is only
            guaranteed for stations connected to us — everything else is listed
            information that may be out of date.
          </p>

          <div className="flex flex-wrap items-center gap-4 md:justify-end">
            <div
              className="border-text-secondary/25 text-text-primary rounded-button flex h-11 items-center gap-2 border px-3 text-sm font-bold"
              title="Pakistan — English"
            >
              <PkFlag className="size-5 shrink-0" />
              <span>En</span>
            </div>
            <StoreBadges height="h-11" />
          </div>
        </div>

        <div className="border-text-secondary/20 text-text-primary mt-8 flex flex-col gap-3 border-t pt-6 text-xs md:flex-row md:items-center md:justify-between">
          <div>
            <p>
              &copy; {year} {OPERATOR.name}. All rights reserved.
            </p>
            <p className="text-text-secondary mt-1">
              Ampere is a product of {OPERATOR.legalName}.
            </p>
          </div>
          <LegalNav />
        </div>
      </div>
    </footer>
  );
}

function LegalNav() {
  return (
    <nav aria-label="Legal" className="flex items-center gap-4">
      <Link href="/privacy" className="hover:text-primary-700 transition-colors">
        Privacy Policy
      </Link>
      <Link href="/terms" className="hover:text-primary-700 transition-colors">
        Terms of Service
      </Link>
    </nav>
  );
}
