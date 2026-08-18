import Link from 'next/link';
import {
  ArrowRight,
  BatteryCharging,
  Building2,
  House,
  MapPin,
  PlugZap,
  Wrench,
  Zap,
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';
import { SiteFooter } from '@/components/ui/site-footer';
import { CONTACT } from '@/lib/legal/config';

const DRIVER_FEATURES = [
  {
    icon: MapPin,
    title: 'Every charger, one map',
    description:
      'Public, private and semi-public stations across Oman — including the ones no single operator’s app will ever show you.',
  },
  {
    icon: PlugZap,
    title: 'Live availability',
    description:
      'For connected stations, see whether a plug is actually free before you drive across the city to reach it.',
  },
  {
    icon: BatteryCharging,
    title: 'Know before you go',
    description:
      'Connector type, power rating, price and opening hours on every listing, so you never arrive to a surprise.',
  },
];

const BUSINESS_PATHS = [
  {
    icon: Building2,
    title: 'Put a charger at your location',
    description:
      'Malls, hotels, housing societies and fuel stations. We help you get a terminal installed, listed for every driver in the country, and reporting into a dashboard that shows sessions, revenue and busy hours.',
    cta: 'Talk to us about your site',
    subject: 'Installing a charger at our location',
  },
  {
    icon: Wrench,
    title: 'Become a terminal vendor',
    description:
      'You already sell, install and maintain chargers. An Ampere integration makes yours the only package in Oman that comes with a national driver app attached — on a bill you are already sending.',
    cta: 'Become a partner',
    subject: 'Vendor partnership enquiry',
  },
];

function mailto(subject: string) {
  return `mailto:${CONTACT.partners}?subject=${encodeURIComponent(subject)}`;
}

export default function HomePage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <nav className="border-border border-b px-6 py-4 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <BrandLogo size="md" />
          <Link
            href="/login"
            className="text-text-secondary hover:text-text-primary text-sm font-semibold transition-colors"
          >
            Partner sign in
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* ---- Drivers ------------------------------------------------- */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10 md:py-24">
          <div className="max-w-3xl">
            <span className="rounded-tag bg-primary-light text-primary-800 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wide uppercase">
              <Zap className="size-3.5" />
              Oman EV network
            </span>

            <h1 className="font-heading text-text-primary mt-6 text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Every EV charger in Oman.
              <br />
              One map.
            </h1>

            <p className="text-text-secondary mt-6 max-w-2xl text-lg leading-relaxed">
              Ampere is a free app for drivers. Find chargers near you, check the connector
              and the price before you set off, and see which plugs are free right now.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <span className="rounded-button border-border text-text-secondary flex h-12 items-center border px-5 text-sm font-semibold">
                iOS — coming soon
              </span>
              <span className="rounded-button border-border text-text-secondary flex h-12 items-center border px-5 text-sm font-semibold">
                Android — coming soon
              </span>
            </div>
          </div>

          <div className="mt-16 grid gap-3 md:grid-cols-3">
            {DRIVER_FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-card border-border border p-5">
                <span className="rounded-image bg-surface-muted text-primary-800 flex size-11 items-center justify-center">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-heading text-text-primary mt-4 text-base font-bold">
                  {title}
                </h3>
                <p className="text-text-secondary mt-1.5 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ---- Home charger owners ------------------------------------- */}
        <section className="border-border border-t px-6 py-16 md:px-10 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-card bg-ink text-on-ink grid gap-8 p-8 md:grid-cols-2 md:items-center md:p-10">
              <div>
                <span className="bg-on-ink/10 rounded-image mb-5 flex size-11 items-center justify-center">
                  <House className="size-5" />
                </span>
                <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                  Have a charger at home?
                </h2>
                <p className="text-on-ink/70 mt-4 leading-relaxed">
                  If you own a charger at home or at a small site, connect it to Ampere.
                  You choose whether it appears to drivers, when it is available, and what
                  it costs — and you get live status and fault alerts for your own unit.
                </p>
              </div>

              <div className="md:justify-self-end">
                <a
                  href={mailto('Connecting my home charger')}
                  className="rounded-button bg-primary text-on-primary hover:bg-primary-dark inline-flex h-12 items-center gap-2 px-6 text-sm font-semibold transition-colors"
                >
                  Get your charger connected
                  <ArrowRight className="size-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Businesses ---------------------------------------------- */}
        <section className="border-border border-t px-6 py-16 md:px-10 md:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-heading text-text-primary text-2xl font-bold tracking-tight sm:text-3xl">
              For businesses
            </h2>
            <p className="text-text-secondary mt-3 max-w-2xl leading-relaxed">
              Two ways to work with us, depending on whether you own the location or
              install the hardware.
            </p>

            <div className="mt-8 grid gap-3 md:grid-cols-2">
              {BUSINESS_PATHS.map(({ icon: Icon, title, description, cta, subject }) => (
                <div
                  key={title}
                  className="rounded-card border-border flex flex-col border p-6"
                >
                  <span className="rounded-image bg-surface-muted text-primary-800 flex size-11 items-center justify-center">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="font-heading text-text-primary mt-4 text-lg font-bold">
                    {title}
                  </h3>
                  <p className="text-text-secondary mt-2 flex-1 text-sm leading-relaxed">
                    {description}
                  </p>
                  <a
                    href={mailto(subject)}
                    className="text-primary-800 hover:text-primary-900 mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                  >
                    {cta}
                    <ArrowRight className="size-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
