'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';
import { GetAppModal } from '@/components/ui/get-app-modal';
import { PkFlag } from '@/components/ui/pk-flag';
import { CONTACT } from '@/lib/legal/config';

/**
 * The one header for every public page.
 *
 * Sticky, so the Get the app CTA stays reachable down a long landing page.
 * Every link is absolute-from-root (`/#section`) rather than a bare hash, so
 * the same menu works from /privacy and /terms, not just the homepage.
 */

type MenuLink = { label: string; href: string };

const MENU_GROUPS: { heading: string; links: MenuLink[] }[] = [
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

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [appModalOpen, setAppModalOpen] = useState(false);

  const closeModal = useCallback(() => setAppModalOpen(false), []);

  // Esc closes the menu. The modal handles its own Esc, and because it renders
  // above the header the two never both react to one keypress.
  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  function openAppModal() {
    setMenuOpen(false);
    setAppModalOpen(true);
  }

  return (
    <>
      <header className="border-border bg-surface sticky top-0 z-50 border-b">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:h-24 md:px-10">
          <Link href="/" aria-label="Ampere home">
            <BrandLogo size="md" />
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              type="button"
              onClick={openAppModal}
              className="rounded-button bg-primary text-on-primary hover:bg-primary-dark hidden h-12 items-center px-6 text-sm font-bold transition-colors sm:inline-flex"
            >
              Get the app
            </button>

            {/* Region indicator, not a control — Ampere ships one locale, so a
                language switcher here would be a button that does nothing. */}
            <div
              className="rounded-button border-border text-text-primary flex h-12 items-center gap-2 border px-3 text-sm font-bold"
              title="Pakistan — English"
            >
              <PkFlag className="size-5 shrink-0" />
              <span>En</span>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              className="rounded-button text-text-primary hover:bg-surface-muted flex h-12 items-center gap-2 px-3 text-sm font-bold transition-colors"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              <span>{menuOpen ? 'Close' : 'Menu'}</span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            id="site-menu"
            className="border-border bg-surface border-t px-6 py-8 md:px-10 md:py-10"
          >
            <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
              {MENU_GROUPS.map(({ heading, links }) => (
                <div key={heading}>
                  <h2 className="text-text-secondary text-xs font-bold tracking-wider uppercase">
                    {heading}
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {links.map(({ label, href }) => (
                      <li key={label}>
                        <Link
                          href={href}
                          onClick={() => setMenuOpen(false)}
                          className="font-heading text-text-primary hover:text-primary-700 text-lg font-bold tracking-tight transition-colors"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* On phones the header CTA is hidden for space, so the menu is the
                only place Get the app exists. */}
            <div className="mx-auto mt-8 max-w-7xl sm:hidden">
              <button
                type="button"
                onClick={openAppModal}
                className="rounded-button bg-primary text-on-primary hover:bg-primary-dark flex h-12 w-full items-center justify-center px-6 text-sm font-bold transition-colors"
              >
                Get the app
              </button>
            </div>
          </div>
        )}
      </header>

      <GetAppModal open={appModalOpen} onClose={closeModal} />
    </>
  );
}
