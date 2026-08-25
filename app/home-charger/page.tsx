import type { Metadata } from 'next';
import Image from 'next/image';
import { CalendarClock, CheckCircle2, ClipboardCheck, House, Users, Wifi } from 'lucide-react';
import { Founding50Form } from '@/components/features/marketing/founding-50-form';
import { Section } from '@/components/ui/section';
import { SiteFooter } from '@/components/ui/site-footer';
import { SiteHeader } from '@/components/ui/site-header';
import { CONTACT } from '@/lib/legal/config';

export const metadata: Metadata = {
  title: 'Home charger packages — Ampere',
  description:
    'Connect your home EV charger to Ampere. Live status and remote control from your phone, using your own WiFi. Founding 50 launch offer: 50% off your first 3 months.',
};

const TIERS = [
  {
    name: 'Home Standard',
    founding: 'Rs. 1,000',
    regular: 'Rs. 2,000',
    features: [
      'Live status in the Ampere app',
      'Start and stop charging from your phone',
      'Works with your own home WiFi',
    ],
  },
  {
    name: 'Home Plus',
    founding: 'Rs. 1,500',
    regular: 'Rs. 3,000',
    features: [
      'Everything in Standard',
      'Schedule charging for off-peak hours',
      'Monthly cost reports',
      'Priority support',
    ],
  },
];

export default function HomeChargerPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <Section id="overview">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <span className="rounded-image bg-surface-muted text-primary-800 mb-5 flex size-11 items-center justify-center">
                <House className="size-5" />
              </span>
              <h1 className="font-heading text-text-primary text-4xl font-bold tracking-tight sm:text-5xl">
                Home charger packages
              </h1>
              <p className="text-text-secondary mt-4 text-lg leading-relaxed">
                See your charger&apos;s live status and control it from your phone, using the WiFi
                you already have at home. No extra hardware, no installation hassle.
              </p>

              <div className="rounded-card border-border bg-surface-muted mt-8 flex items-start gap-4 border p-5">
                <ClipboardCheck className="text-primary-800 mt-0.5 size-5 shrink-0" />
                <p className="text-text-primary text-sm leading-relaxed">
                  <span className="font-semibold">Not every charger can be integrated.</span>{' '}
                  Support depends on your specific make and model — send us your details and
                  photos below and we&apos;ll confirm compatibility before scheduling anything.
                </p>
              </div>
            </div>

            <div className="rounded-image aspect-[3/2] overflow-hidden">
              <Image
                src="/home-charger.webp"
                alt="A home EV charger mounted on a garage wall, charging a car at 90%"
                width={2500}
                height={1667}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="size-full object-cover"
                priority
              />
            </div>
          </div>
        </Section>

        <Section id="pricing" tone="canvas">
          <div className="grid gap-3 md:grid-cols-2">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className="rounded-card border-border bg-surface flex flex-col border p-6"
              >
                <h3 className="font-heading text-text-primary text-lg font-bold">{tier.name}</h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-heading text-text-primary text-3xl font-bold tabular-nums">
                    {tier.founding}
                  </span>
                  <span className="text-text-secondary text-sm">/month for 3 months</span>
                </div>
                <p className="text-text-secondary mt-1 text-xs">
                  Then <span className="tabular-nums">{tier.regular}</span>/month — no hidden
                  fees.
                </p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {tier.features.map((feature) => (
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

          <div className="rounded-card bg-ink text-on-ink mt-6 grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
            <div className="flex items-start gap-3">
              <Wifi className="text-primary mt-0.5 size-5 shrink-0" />
              <p className="text-on-ink/85 text-sm leading-relaxed">
                <span className="font-semibold text-white">Only 50 spots</span>, across both
                plans. Once they&apos;re claimed, everyone after pays full price from day one.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Users className="text-primary mt-0.5 size-5 shrink-0" />
              <p className="text-on-ink/85 text-sm leading-relaxed">
                <span className="font-semibold text-white">Bring a friend in.</span> Once
                they&apos;ve been active for 30 days, you both get an extra month at your Founding
                50 rate.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CalendarClock className="text-primary mt-0.5 size-5 shrink-0" />
              <p className="text-on-ink/85 text-sm leading-relaxed">
                <span className="font-semibold text-white">Who this is for:</span> anyone with a
                home EV charger and WiFi that reaches it.
              </p>
            </div>
          </div>

          <p className="text-text-secondary mt-6 text-sm">
            Prefer email? Write to{' '}
            <a
              href={`mailto:${CONTACT.support}`}
              className="text-primary-800 hover:text-primary-900 font-semibold"
            >
              {CONTACT.support}
            </a>
            .
          </p>
        </Section>

        <Section id="apply">
          <div className="max-w-2xl">
            <h2 className="font-heading text-text-primary text-3xl font-bold tracking-tight sm:text-4xl">
              Claim your Founding 50 spot
            </h2>
            <p className="text-text-secondary mt-3 text-lg leading-relaxed">
              Tell us about your charger. We&apos;ll confirm it can be integrated, then reach out
              to schedule your connection.
            </p>
          </div>
          <div className="rounded-card border-border bg-surface mt-8 max-w-2xl border p-6 sm:p-8">
            <Founding50Form />
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
