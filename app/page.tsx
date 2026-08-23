import Image from 'next/image';
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
import { Section } from '@/components/ui/section';
import { SiteFooter } from '@/components/ui/site-footer';
import { SiteHeader } from '@/components/ui/site-header';
import { StoreBadges } from '@/components/ui/store-badges';
import { CONTACT } from '@/lib/legal/config';

const SCREENSHOTS = [
  '01-find-chargers.png',
  '02-live-charging.png',
  '03-map-directions.png',
  '04-charger-details.png',
  '05-smart-filters.png',
  '06-report-a-charger.png',
];

const DRIVER_FEATURES = [
  {
    icon: MapPin,
    title: 'Every charger, one map',
    description:
      'Public, private and semi-public stations across Pakistan — including the ones no single operator’s app will ever show you.',
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
      'You already sell, install and maintain chargers. An Ampere integration makes yours the only package in Pakistan that comes with a national driver app attached — on a bill you are already sending.',
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
      <SiteHeader overlay />

      <main className="flex-1">
        {/* ---- Hero ---------------------------------------------------- */}
        <section className="relative flex min-h-[600px] w-full items-center overflow-hidden md:aspect-[16/9] md:min-h-0">
          <Image
            src="/hero-image.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

          {/* Two scrims, not one. The horizontal pass buys contrast for the
              copy column against a bright daylight photo; the vertical pass
              darkens the top strip so the transparent header's white logo and
              menu stay legible before any scroll happens. */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/30" />

          <div className="relative mx-auto w-full max-w-7xl px-6 pt-28 pb-16 md:px-10 md:pt-24 md:pb-0">
            <div className="max-w-3xl">
              <span className="rounded-tag inline-flex items-center gap-1.5 border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide text-white uppercase backdrop-blur-sm">
                <Zap className="size-3.5" />
                Pakistan EV network
              </span>

              <h1 className="font-heading mt-6 text-4xl leading-[1.08] font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Every EV charger in Pakistan.
                <br />
                One map.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
                Ampere is a free app for drivers. Find chargers near you, check the
                connector and the price before you set off, and see which plugs are free
                right now.
              </p>

              <StoreBadges className="mt-9" />
            </div>
          </div>
        </section>

        {/* ---- Drivers ------------------------------------------------- */}
        <Section id="drivers">
          <div className="max-w-3xl">
            <h2 className="font-heading text-text-primary text-3xl font-bold tracking-tight sm:text-4xl">
              Built for the drive, not the paperwork
            </h2>
            <p className="text-text-secondary mt-4 max-w-2xl text-lg leading-relaxed">
              Three things every EV driver in Pakistan needs, in one free app.
            </p>
          </div>

          <div className="mt-12 grid gap-3 md:grid-cols-3">
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
        </Section>

        {/* ---- Screenshots ----------------------------------------------- */}
        <Section id="screenshots" tone="canvas">
          <h2 className="font-heading text-text-primary text-3xl font-bold tracking-tight sm:text-4xl">
            See it in action
          </h2>
          <p className="text-text-secondary mt-4 max-w-2xl text-lg leading-relaxed">
            From finding a station to watching your charge finish — a look at Ampere on
            your phone.
          </p>

          <div className="-mx-6 mt-10 flex gap-4 overflow-x-auto px-6 md:-mx-10 md:px-10">
            {SCREENSHOTS.map((file) => (
              <Image
                key={file}
                src={`/screenshots/${file}`}
                alt=""
                width={1080}
                height={1920}
                sizes="(min-width: 640px) 270px, 236px"
                className="h-[420px] w-auto shrink-0 rounded-2xl sm:h-[440px]"
              />
            ))}
          </div>
        </Section>

        {/* ---- Home charger owners ------------------------------------- */}
        <Section id="home-charger">
          <div className="rounded-card border-border grid gap-8 border p-8 md:grid-cols-2 md:items-center md:p-12">
            <div>
              <span className="rounded-image bg-surface-muted text-primary-800 mb-5 flex size-11 items-center justify-center">
                <House className="size-5" />
              </span>
              <h2 className="font-heading text-text-primary text-3xl font-bold tracking-tight sm:text-4xl">
                Have a charger at home?
              </h2>
              <p className="text-text-secondary mt-4 text-lg leading-relaxed">
                If you own a charger at home or at a small site, connect it to Ampere. You
                choose whether it appears to drivers, when it is available, and what it
                costs — and you get live status and fault alerts for your own unit.
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
        </Section>

        {/* ---- Businesses ---------------------------------------------- */}
        <Section id="business" tone="canvas">
          <h2 className="font-heading text-text-primary text-3xl font-bold tracking-tight sm:text-4xl">
            For businesses
          </h2>
          <p className="text-text-secondary mt-4 max-w-2xl text-lg leading-relaxed">
            Two ways to work with us, depending on whether you own the location or install
            the hardware.
          </p>

          <div className="mt-10 grid gap-3 md:grid-cols-2">
            {BUSINESS_PATHS.map(({ icon: Icon, title, description, cta, subject }) => (
              <div
                key={title}
                className="rounded-card border-border bg-surface flex flex-col border p-6"
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
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
