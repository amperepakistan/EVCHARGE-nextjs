'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
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
  // Which category's links the panel is showing, from md up.
  const [activeGroup, setActiveGroup] = useState(0);
  // Phone drill-down: null is the category list, a number is that category's
  // links. Separate from activeGroup because the two levels are only a
  // drill-down on phones — above md both are on screen at once.
  const [mobileGroup, setMobileGroup] = useState<number | null>(null);

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
      if (event.key !== 'Escape') return;
      // Drilled into a category, Esc backs out a level before it closes —
      // otherwise it discards two steps of navigation in one press.
      if (mobileGroup !== null) setMobileGroup(null);
      else setMenuOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, mobileGroup]);

  // Handled here rather than in the toggle so every close path — Esc, a link,
  // the app modal — reopens at the top of the menu rather than mid-drill-down.
  useEffect(() => {
    if (!menuOpen) {
      setActiveGroup(0);
      setMobileGroup(null);
    }
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
              className="rounded-button bg-primary text-on-primary hover:bg-primary-dark inline-flex h-12 shrink-0 items-center px-4 text-sm font-bold transition-colors sm:px-6"
            >
              Get the app
            </button>

            {/* Region indicator, not a control — Ampere ships one locale, so a
                language switcher here would be a button that does nothing.
                Dropped on phones: a decorative indicator is not worth the width
                when the app CTA has to fit alongside it. */}
            <div
              className={cn(
                'rounded-button hidden h-12 items-center gap-2 border px-3 text-sm font-bold transition-colors sm:flex',
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
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className={cn(
                'rounded-button flex h-12 shrink-0 items-center gap-2 px-3 text-sm font-bold transition-colors',
                transparent
                  ? 'text-white hover:bg-white/15'
                  : 'text-text-primary hover:bg-surface-muted',
              )}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              {/* Icon alone on phones — the label is what the app CTA needs the
                  room for. aria-label on the button keeps it announced. */}
              <span className="hidden sm:inline">{menuOpen ? 'Close' : 'Menu'}</span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            id="site-menu"
            /* border-b, not border-t: the bar's own backdrop already draws the
               line between bar and panel, so a top border here would double it. */
            className={cn(
              'border-border bg-surface relative border-b px-6 py-8 md:px-10 md:py-10',
              // Phones get the full screen below the bar, so the menu reads as
              // a place you navigate rather than a dropdown over the page.
              'max-md:h-[calc(100dvh-5rem)] max-md:overflow-y-auto',
            )}
          >
            {/* Two genuinely different patterns, not one restyled. A phone has
                no room for categories and links at once, so it drills down:
                category list first, then that category's links. From md up
                both levels fit at once — chips on top, links below a rule. */}

            {/* ---- Phone: level 1, the categories --------------------- */}
            {mobileGroup === null && (
              <ul className="md:hidden">
                {MENU_GROUPS.map(({ heading }, index) => (
                  <li key={heading}>
                    <button
                      type="button"
                      onClick={() => setMobileGroup(index)}
                      className="text-text-primary active:text-primary-700 flex w-full items-center justify-between gap-4 py-3 text-left transition-colors"
                    >
                      <span className="font-heading text-3xl font-bold tracking-tight">
                        {heading}
                      </span>
                      <ChevronRight className="size-6 shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* ---- Phone: level 2, one category's links --------------- */}
            {mobileGroup !== null && (
              <div className="md:hidden">
                <button
                  type="button"
                  onClick={() => setMobileGroup(null)}
                  className="text-text-secondary hover:text-text-primary -ml-1 flex items-center gap-1.5 text-sm font-bold tracking-wide uppercase transition-colors"
                >
                  <ChevronLeft className="size-4" />
                  {MENU_GROUPS[mobileGroup].heading}
                </button>

                <ul className="mt-6 space-y-4">
                  {MENU_GROUPS[mobileGroup].links.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        onClick={() => setMenuOpen(false)}
                        className="font-heading text-text-primary active:text-primary-700 inline-block text-2xl font-bold tracking-tight transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ---- md and up: chips + links, both visible ------------- */}
            <div className="mx-auto hidden max-w-7xl md:block">
              <div className="flex gap-2">
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
                      'rounded-tag font-heading shrink-0 px-3 py-2 text-lg font-bold tracking-tight transition-colors',
                      index === activeGroup
                        ? 'bg-primary text-on-primary'
                        : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
                    )}
                  >
                    {heading}
                  </button>
                ))}
              </div>

              <hr className="border-border my-8" />

              <ul className="space-y-5">
                {MENU_GROUPS[activeGroup].links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className="font-heading text-text-primary hover:text-primary-700 inline-block text-4xl font-bold tracking-tight transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </header>

      <GetAppModal open={appModalOpen} onClose={closeModal} />
    </>
  );
}
