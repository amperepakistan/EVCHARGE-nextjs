import Link from 'next/link';
import { BrandLogo } from '@/components/ui/brand-logo';
import { cn } from '@/lib/utils/cn';
import { OPERATOR } from '@/lib/legal/config';

/**
 * The one footer for every public page — landing, login and the legal pages.
 *
 * Legal links live here rather than being repeated per page so that the app
 * stores' requirement (privacy policy reachable from anywhere public) cannot
 * drift out of sync as pages are added.
 */

interface SiteFooterProps {
  /** Hidden on narrow, chrome-light pages such as login. */
  showLogo?: boolean;
  /** Matches the content width of the page it sits under. */
  maxWidth?: 'max-w-4xl' | 'max-w-7xl';
  className?: string;
}

export function SiteFooter({
  showLogo = true,
  maxWidth = 'max-w-7xl',
  className,
}: SiteFooterProps) {
  return (
    <footer className={cn('border-border border-t px-6 py-6 md:px-10', className)}>
      <div
        className={cn(
          'text-text-secondary mx-auto flex flex-col items-center gap-3 text-xs md:flex-row',
          showLogo ? 'justify-between' : 'justify-center md:gap-6',
          maxWidth,
        )}
      >
        {showLogo && (
          <Link href="/" aria-label={`${OPERATOR.name} home`}>
            <BrandLogo size="sm" />
          </Link>
        )}

        <nav aria-label="Legal" className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-text-primary transition-colors">
            Terms of Service
          </Link>
        </nav>

        <p>
          &copy; {new Date().getFullYear()} {OPERATOR.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
