'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';
import { GetAppModal } from '@/components/ui/get-app-modal';
import { PkFlag } from '@/components/ui/pk-flag';
import { CONTACT } from '@/lib/legal/config';
import { cn } from '@/lib/utils/cn';

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

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Which category's links the panel is showing. Reset on close so the menu
  // always reopens on "For drivers" rather than wherever it was left.
  const [activeGroup, setActiveGroup] = useState(0);

  const closeModal = useCallback(() => setAppModalOpen(false), []);

  // Overlay mode only: the header floats transparently over the hero photo and
  // takes on its solid surface once the page moves. An open menu forces the
  // solid treatment too — the panel's links are unreadable over a photo.
  useEffect(() => {
    if (!overlay) return;
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll(); // A reload can restore a mid-page scroll position.
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [overlay]);

  const transparent = overlay && !scrolled && !menuOpen;

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

  // Handled here rather than in the toggle so every close path — Esc, a link,
  // the app modal — lands back on the first category.
  useEffect(() => {
    if (!menuOpen) setActiveGroup(0);
  }, [menuOpen]);

  function openAppModal() {
    setMenuOpen(false);
    setAppModalOpen(true);
  }

  return (
    <>
      <header
        className={cn(
          'z-50',
          // Overlay mode leaves the flow entirely so the hero photo starts at
          // y=0 and the header floats on top of it; `fixed` reads identically
          // to `sticky` once scrolling, without reserving a band above the hero.
          overlay ? 'fixed inset-x-0 top-0' : 'sticky top-0',
        )}
      >
        {/* The solid bar is its own layer so it can drop in from above while the
            logo and controls stay put — sliding the <header> itself would throw
            the whole lockup off-screen and back. Sized to the bar row rather
            than `inset-0` so an open menu (which makes the header much taller)
            doesn't turn the slide into a long sweep; the panel below paints its
            own surface. */}
        <div
          aria-hidden
          className={cn(
            'border-border bg-surface absolute inset-x-0 top-0 h-20 border-b',
            'transition-transform duration-300 ease-out will-change-transform',
            'motion-reduce:transition-none md:h-24',
            // Shadow only once seated — parked above the viewport it would
            // still cast a faint line across the top of the hero.
            transparent ? '-translate-y-full' : 'translate-y-0 shadow-sm',
          )}
        />

        <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:h-24 md:px-10">
          <Link href="/" aria-label="Ampere home">
            <BrandLogo size="md" tone={transparent ? 'inverse' : 'default'} />
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
              className={cn(
                'rounded-button flex h-12 items-center gap-2 border px-3 text-sm font-bold transition-colors',
                transparent
                  ? 'border-white/40 bg-white/10 text-white backdrop-blur-sm'
                  : 'border-border text-text-primary',
              )}
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
              className={cn(
                'rounded-button flex h-12 items-center gap-2 px-3 text-sm font-bold transition-colors',
                transparent
                  ? 'text-white hover:bg-white/15'
                  : 'text-text-primary hover:bg-surface-muted',
              )}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              <span>{menuOpen ? 'Close' : 'Menu'}</span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            id="site-menu"
            /* border-b, not border-t: the bar's own backdrop already draws the
               line between bar and panel, so a top border here would double it. */
            className="border-border bg-surface relative border-b px-6 py-8 md:px-10 md:py-10"
          >
            <div className="mx-auto max-w-7xl">
              {/* Categories read as one row of chips, links as large headings
                  below a rule — two clearly different jobs, rather than three
                  columns where a faint uppercase label was the only thing
                  distinguishing a section from the links under it. */}
              <div className="-mx-6 flex gap-1 overflow-x-auto px-6 md:mx-0 md:gap-2 md:px-0">
                {MENU_GROUPS.map(({ heading }, index) => (
                  <button
                    key={heading}
                    type="button"
                    // A toggle-button group, not APG tabs: one is always on, and
                    // plain buttons keep normal Tab order without the roving
                    // tabindex a real tablist would owe the user.
                    aria-pressed={index === activeGroup}
                    onClick={() => setActiveGroup(index)}
                    className={cn(
                      'rounded-tag font-heading shrink-0 px-3 py-2 text-base font-bold tracking-tight transition-colors md:text-lg',
                      index === activeGroup
                        ? 'bg-primary text-on-primary'
                        : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
                    )}
                  >
                    {heading}
                  </button>
                ))}
              </div>

              <hr className="border-border my-6 md:my-8" />

              <ul className="space-y-4 md:space-y-5">
                {MENU_GROUPS[activeGroup].links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className="font-heading text-text-primary hover:text-primary-700 inline-block text-2xl font-bold tracking-tight transition-colors sm:text-3xl md:text-4xl"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
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
