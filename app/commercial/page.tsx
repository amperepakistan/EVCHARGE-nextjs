import type { Metadata } from 'next';
import Image from 'next/image';
import { BarChart3, Building2, CheckCircle2, ClipboardCheck, Radio, Sliders } from 'lucide-react';
import { Section } from '@/components/ui/section';
import { SiteFooter } from '@/components/ui/site-footer';
import { SiteHeader } from '@/components/ui/site-header';
import { CONTACT } from '@/lib/legal/config';

export const metadata: Metadata = {
  title: 'Commercial packages — Ampere',
  description:
    'Connect your mall, hotel, fuel station or housing society charger to Ampere — live status, remote control and analytics, with WiFi connectivity included.',
};

function mailto(subject: string) {
  return `mailto:${CONTACT.support}?subject=${encodeURIComponent(subject)}`;
}

const TIERS = [
  {
    icon: Radio,
    name: 'Commercial Lite',
    tagline: 'Get seen, get tracked',
    features: [
      'Live status on the Ampere map and app',
      'Dashboard: online/offline, sessions today, energy delivered',
    ],
  },
  {
    icon: Sliders,
    name: 'Commercial Plus',
    tagline: 'Everything in Lite, plus control',
    features: [
      'Remote start, stop, restart and unlock',
      'Fault alerts the moment something goes wrong',
      'Pricing and tariff controls',
    ],
  },
  {
    icon: BarChart3,
    name: 'Commercial Pro',
    tagline: 'Everything in Plus, plus insight',
    features: [
      'Full analytics and trend reports',
      'Multi-site and team accounts',
      'Priority support',
    ],
  },
];

const STEPS = [
  {
    title: 'We audit your terminal',
    description:
      'A free site visit to check the make, model and condition of your unit, and confirm exactly what it can communicate. Not every terminal can be integrated — we tell you plainly, before anything else happens.',
  },
  {
    title: 'We confirm what it costs',
    description:
      'Once we know your terminal is compatible, we price the connection against your site and connectivity — that conversation happens after the audit, not before.',
  },
  {
    title: 'We install and you go live',
    description:
      'Our team handles the WiFi connectivity and the OCPP pairing. Your terminal appears on the Ampere map and your dashboard starts filling with data from the first session.',
  },
];

export default function CommercialPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <Section id="overview">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <span className="rounded-image bg-surface-muted text-primary-800 mb-5 flex size-11 items-center justify-center">
                <Building2 className="size-5" />
              </span>
              <h1 className="font-heading text-text-primary text-4xl font-bold tracking-tight sm:text-5xl">
                Commercial packages
              </h1>
              <p className="text-text-secondary mt-4 text-lg leading-relaxed">
                For malls, hotels, fuel stations and housing societies. Every package puts your
                terminal live on the Ampere map, backed by our own WiFi connectivity so your
                status stays accurate — even if your site&apos;s own internet isn&apos;t.
              </p>

              <div className="rounded-card border-border bg-surface-muted mt-8 flex items-start gap-4 border p-5">
                <ClipboardCheck className="text-primary-800 mt-0.5 size-5 shrink-0" />
                <p className="text-text-primary text-sm leading-relaxed">
                  <span className="font-semibold">An on-site audit always comes first.</span>{' '}
                  Integration depends on your terminal&apos;s make, model and specs — we confirm
                  compatibility on a free visit before quoting a package or installing anything.
                </p>
              </div>
            </div>

            <div className="rounded-image aspect-[3/2] overflow-hidden">
              <Image
                src="/commercial-charger.jpeg"
                alt="Commercial EV charging bay with multiple terminals under a covered carport"
                width={701}
                height={438}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="size-full object-cover"
                priority
              />
            </div>
          </div>
        </Section>

        <Section id="tiers" tone="canvas">
          <div className="grid gap-3 md:grid-cols-3">
            {TIERS.map(({ icon: Icon, name, tagline, features }) => (
              <div
                key={name}
                className="rounded-card border-border bg-surface flex flex-col border p-6"
              >
                <span className="rounded-image bg-surface-muted text-primary-800 flex size-11 items-center justify-center">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-heading text-text-primary mt-4 text-lg font-bold">{name}</h3>
                <p className="text-text-secondary mt-1 text-sm">{tagline}</p>
                <ul className="mt-4 flex-1 space-y-2.5">
                  {features.map((feature) => (
                    <li
                      key={feature}
                      className="text-text-secondary flex items-start gap-2 text-sm leading-relaxed"
                    >
                      <CheckCircle2 className="text-primary-700 mt-0.5 size-4 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-text-secondary mt-6 text-sm">
            Pricing depends on your terminal and site — we&apos;ll walk you through it once we&apos;ve
            audited your unit.
          </p>
        </Section>

        <Section id="how-it-works">
          <h2 className="font-heading text-text-primary text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="rounded-card border-border border p-5">
                <span className="text-primary-800 font-heading text-sm font-bold">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-heading text-text-primary mt-3 text-base font-bold">
                  {step.title}
                </h3>
                <p className="text-text-secondary mt-1.5 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="contact" tone="canvas">
          <div className="rounded-card bg-ink text-on-ink flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-12">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                Talk to us about your site
              </h2>
              <p className="text-on-ink/70 mt-2 max-w-xl text-sm leading-relaxed">
                Tell us about your terminal and location. We&apos;ll schedule an audit, confirm
                whether it can be integrated, and tell you what it costs.
              </p>
            </div>
            <a
              href={mailto('Commercial terminal enquiry')}
              className="rounded-button bg-primary text-on-primary hover:bg-primary-dark inline-flex h-12 shrink-0 items-center gap-2 px-6 text-sm font-semibold transition-colors"
            >
              {CONTACT.support}
            </a>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
