import type { Metadata } from 'next';
import Image from 'next/image';
import {
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  House,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Wifi,
  Zap,
} from 'lucide-react';
import { Founding50Form } from '@/components/features/marketing/founding-50-form';
import { FAQAccordion } from '@/components/ui/faq-accordion';
import { Section } from '@/components/ui/section';
import { SiteFooter } from '@/components/ui/site-footer';
import { SiteHeader } from '@/components/ui/site-header';
import { CONTACT } from '@/lib/legal/config';

export const metadata: Metadata = {
  title: 'Home Charger Packages & Smart Controls — Ampere',
  description:
    'Connect your home EV charger to Ampere. Live status, remote start/stop, and off-peak schedule controls from your phone using your home WiFi. Founding 50 launch offer: 50% off first 3 months.',
};

const TIERS = [
  {
    name: 'Home Standard',
    founding: 'Rs. 1,000',
    regular: 'Rs. 2,000',
    popular: false,
    features: [
      'Live charger status in Ampere app',
      'Remote start and stop from your phone',
      'Works with your existing home WiFi',
      'Real-time session alerts',
    ],
  },
  {
    name: 'Home Plus',
    founding: 'Rs. 1,500',
    regular: 'Rs. 3,000',
    popular: true,
    features: [
      'Everything in Home Standard',
      'Schedule off-peak charging (save up to 40%)',
      'Monthly electricity & cost reports in PKR',
      'Multi-driver family access',
      'Priority setup & phone support',
    ],
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Submit Charger Details',
    description:
      'Fill out the form below with your charger brand, model, and photos of the unit.',
    icon: ClipboardCheck,
  },
  {
    number: '02',
    title: 'WiFi & Compatibility Audit',
    description:
      'Our team verifies API/OCPP compatibility and checks your home WiFi reach for smooth remote control.',
    icon: Wifi,
  },
  {
    number: '03',
    title: 'Control & Save from App',
    description:
      'Start or stop charging remotely, set off-peak timers, and monitor monthly charging expenditure.',
    icon: Smartphone,
  },
];

const SUPPORTED_BRANDS = [
  'ABB Terra AC',
  'Wallbox Pulsar',
  'Schneider EVlink',
  'Autel MaxiCharger',
  'Zaptec Go',
  'Delta AC',
  'Enel X JuiceBox',
  'Circontrol eNext',
  'Crown ChargePro',
];

const FAQS = [
  {
    question: 'Do I need to install any new hardware or rewiring at home?',
    answer:
      'No extra hardware or expensive electrical rewiring is required. Ampere connects directly to your existing smart home charger over your home WiFi network.',
  },
  {
    question: 'How does off-peak charging save money on electricity in Pakistan?',
    answer:
      'Electric power distribution companies in Pakistan (like K-Electric, LESCO, IESCO) charge significantly lower tariffs during off-peak hours (typically 11 PM to 7 AM). Ampere lets you schedule your car to charge automatically during off-peak hours, cutting monthly charging costs by up to 35-40%.',
  },
  {
    question: 'What if my home WiFi signal is weak in the garage or driveway?',
    answer:
      'When you submit your charger details, our technical team evaluates signal strength during setup. If needed, we recommend standard range extenders so your connection stays rock solid.',
  },
  {
    question: 'Which home EV chargers can be integrated?',
    answer:
      'We support popular smart chargers including ABB, Wallbox Pulsar, Schneider, Autel, Zaptec, Delta, Enel X, and Crown ChargePro units. Submit photos of your unit in the form below and we will confirm compatibility for free.',
  },
  {
    question: 'Is there a long-term contract or cancellation fee?',
    answer:
      'No long-term contracts. You can pause or cancel your home charger subscription at any time directly in the Ampere app with no penalties.',
  },
];

export default function HomeChargerPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* HERO SECTION */}
        <Section id="overview">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-3.5 py-1.5 text-xs font-bold text-primary-800">
                <Sparkles className="size-3.5 text-primary-700" />
                <span>FOUNDING 50 OFFER — 50% OFF FIRST 3 MONTHS</span>
              </div>

              <h1 className="font-heading text-text-primary mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Make your home EV charger smart.
              </h1>

              <p className="text-text-secondary mt-5 text-lg sm:text-xl leading-relaxed">
                See live status, start or stop charging remotely, and schedule off-peak hours directly
                from your phone using the WiFi you already have at home.
              </p>

              <div className="mt-6 flex flex-wrap gap-y-2 gap-x-6 text-sm font-semibold text-text-primary">
                <span className="flex items-center gap-1.5">
                  <Check className="size-4 text-primary-700 stroke-[3]" />
                  Zero Extra Hardware
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="size-4 text-primary-700 stroke-[3]" />
                  Uses Existing Home WiFi
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="size-4 text-primary-700 stroke-[3]" />
                  Cancel Anytime
                </span>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <a
                  href="#apply"
                  className="rounded-xl bg-ink px-7 py-4 text-center font-heading text-base font-bold text-on-ink shadow-lg hover:bg-ink/90 transition-all"
                >
                  Claim Your 50% Off Spot
                </a>
                <a
                  href="#how-it-works"
                  className="rounded-xl border border-border bg-surface px-6 py-4 text-center font-heading text-base font-semibold text-text-primary hover:bg-surface-muted transition-all inline-flex items-center justify-center gap-1"
                >
                  How it works
                  <ChevronRight className="size-4" />
                </a>
              </div>

              <div className="rounded-2xl border border-border/80 bg-surface-muted mt-8 flex items-start gap-4 p-5">
                <ClipboardCheck className="text-primary-800 mt-0.5 size-5 shrink-0" />
                <p className="text-text-primary text-sm leading-relaxed">
                  <span className="font-bold">Not every charger can be integrated.</span> Support
                  depends on your charger make and model. Submit your details below and we&apos;ll
                  confirm compatibility for free before scheduling setup.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-border/80 bg-surface shadow-2xl overflow-hidden aspect-[4/3] lg:aspect-square">
                <Image
                  src="/home-charger.webp"
                  alt="A home EV charger mounted on a wall charging an electric vehicle"
                  width={2500}
                  height={1667}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="size-full object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/20 bg-black/70 backdrop-blur-md p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-500/20 p-2 rounded-lg text-primary-400">
                        <Zap className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs text-white/70 font-medium">Home Charging Active</p>
                        <p className="text-sm font-bold">7.4 kW · 85% Charged</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-1 text-xs font-bold text-emerald-300">
                      Off-Peak Tariff
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* HOW IT WORKS SECTION */}
        <Section id="how-it-works" tone="canvas">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-text-primary text-3xl font-bold tracking-tight sm:text-4xl">
              How home integration works
            </h2>
            <p className="text-text-secondary mt-3 text-base sm:text-lg">
              Get live app control over your home charger in 3 simple steps.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="rounded-2xl border border-border/80 bg-surface p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-2xl font-black text-primary-700">
                        {step.number}
                      </span>
                      <div className="rounded-xl bg-primary-500/10 p-3 text-primary-800">
                        <Icon className="size-6" />
                      </div>
                    </div>
                    <h3 className="font-heading text-text-primary mt-6 text-xl font-bold">
                      {step.title}
                    </h3>
                    <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SUPPORTED BRANDS LOGO GRID */}
          <div className="mt-14 rounded-2xl border border-border/80 bg-surface p-6 sm:p-8">
            <p className="text-center font-heading text-xs font-bold uppercase tracking-wider text-text-secondary mb-6">
              Compatible with leading smart charger brands in Pakistan
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {SUPPORTED_BRANDS.map((brand) => (
                <span
                  key={brand}
                  className="rounded-xl border border-border/80 bg-surface-muted px-4 py-2 text-xs font-bold text-text-primary shadow-xs"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </Section>

        {/* PRICING TIERS SECTION */}
        <Section id="pricing">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-text-primary text-3xl font-bold tracking-tight sm:text-4xl">
              Founding 50 launch packages
            </h2>
            <p className="text-text-secondary mt-3 text-base sm:text-lg">
              Enjoy 50% off your monthly plan for the first 3 months. No lock-in contracts.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border p-6 sm:p-8 flex flex-col justify-between transition-all ${
                  tier.popular
                    ? 'border-primary-600 bg-surface shadow-xl ring-2 ring-primary-500/30'
                    : 'border-border/80 bg-surface shadow-md'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 right-6 rounded-full bg-primary-600 px-3.5 py-1 text-xs font-bold text-white shadow-sm">
                    MOST POPULAR
                  </div>
                )}
                <div>
                  <h3 className="font-heading text-text-primary text-xl font-bold">{tier.name}</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-heading text-text-primary text-4xl font-extrabold tabular-nums">
                      {tier.founding}
                    </span>
                    <span className="text-text-secondary text-sm font-semibold">/month for 3 months</span>
                  </div>
                  <p className="text-text-secondary mt-1 text-xs">
                    Then <span className="tabular-nums font-semibold">{tier.regular}</span>/month — cancel anytime.
                  </p>

                  <ul className="mt-6 space-y-3 border-t border-border/60 pt-6">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-text-primary">
                        <CheckCircle2 className="size-4 text-primary-700 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <a
                    href="#apply"
                    className={`block w-full rounded-xl py-3.5 text-center font-heading text-sm font-bold transition-all ${
                      tier.popular
                        ? 'bg-ink text-on-ink hover:bg-ink/90 shadow-md'
                        : 'border border-border bg-surface text-text-primary hover:bg-surface-muted'
                    }`}
                  >
                    Select {tier.name}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-ink text-on-ink mt-8 grid gap-6 p-6 sm:grid-cols-3 sm:p-8 max-w-4xl mx-auto shadow-xl">
            <div className="flex items-start gap-3">
              <Wifi className="text-primary-400 mt-0.5 size-5 shrink-0" />
              <p className="text-on-ink/85 text-xs sm:text-sm leading-relaxed">
                <span className="font-bold text-white block mb-0.5">Only 50 Spots Total</span>
                Across both plans. Once claimed, future signups pay full price from day one.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Users className="text-primary-400 mt-0.5 size-5 shrink-0" />
              <p className="text-on-ink/85 text-xs sm:text-sm leading-relaxed">
                <span className="font-bold text-white block mb-0.5">Referral Bonus</span>
                Bring a friend in. Once active for 30 days, you both get an extra month at Founding 50 rate.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="text-primary-400 mt-0.5 size-5 shrink-0" />
              <p className="text-on-ink/85 text-xs sm:text-sm leading-relaxed">
                <span className="font-bold text-white block mb-0.5">Zero Hardware Risk</span>
                Works with your existing charger and WiFi. No new equipment needed.
              </p>
            </div>
          </div>
        </Section>

        {/* FAQ SECTION */}
        <Section id="faq" tone="canvas">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="font-heading text-text-primary text-3xl font-bold tracking-tight sm:text-4xl">
                Frequently asked questions
              </h2>
              <p className="text-text-secondary mt-3 text-base sm:text-lg">
                Everything you need to know about connecting your home charger to Ampere.
              </p>
            </div>

            <FAQAccordion items={FAQS} />
          </div>
        </Section>

        {/* APPLY FORM SECTION */}
        <Section id="apply">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-text-primary text-3xl font-bold tracking-tight sm:text-4xl">
              Claim your Founding 50 spot
            </h2>
            <p className="text-text-secondary mt-3 text-base sm:text-lg leading-relaxed">
              Tell us about your charger. We&apos;ll confirm it can be integrated, then reach out
              to schedule your connection.
            </p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-surface shadow-xl mt-8 mx-auto max-w-3xl p-6 sm:p-10">
            <Founding50Form />
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
