import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Callout,
  DataTable,
  LegalShell,
  List,
  P,
  Section,
  SubHeading,
} from '@/components/features/legal/legal-shell';
import { APP_NAME, CONTACT, DOMAIN, OPERATOR } from '@/lib/legal/config';

export const metadata: Metadata = {
  title: 'Privacy Policy — Ampere',
  description:
    'How Ampere collects, uses and protects your data across the driver app and the vendor and owner dashboards.',
};

const SECTIONS = [
  { id: 'who-we-are', title: 'Who we are' },
  { id: 'what-we-collect', title: 'What we collect' },
  { id: 'location', title: 'How we use location' },
  { id: 'why', title: 'Why we use your data' },
  { id: 'sharing', title: 'Who we share it with' },
  { id: 'transfers', title: 'Where your data is stored' },
  { id: 'retention', title: 'How long we keep it' },
  { id: 'rights', title: 'Your choices and rights' },
  { id: 'deletion', title: 'Deleting your account' },
  { id: 'security', title: 'Security' },
  { id: 'children', title: "Children's privacy" },
  { id: 'business', title: 'Vendor and owner accounts' },
  { id: 'changes', title: 'Changes to this policy' },
  { id: 'contact', title: 'Contact us' },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      summary={`This policy explains what ${OPERATOR.name} collects when you use the ${APP_NAME} mobile app or the web dashboards, why we collect it, and what control you have over it.`}
      sections={SECTIONS}
    >
      <Section id="who-we-are" index={1} title="Who we are">
        <P>
          {OPERATOR.name} operates a directory of electric vehicle charging stations in{' '}
          {OPERATOR.jurisdiction}, consisting of a free mobile app for drivers and web
          dashboards for charging vendors and site owners.
        </P>
        <P>
          This service is operated by {OPERATOR.legalName}, based in{' '}
          {OPERATOR.registeredAddress}. For anything in this policy, contact us at{' '}
          <a className="text-primary-800 font-semibold" href={`mailto:${CONTACT.privacy}`}>
            {CONTACT.privacy}
          </a>
          .
        </P>
        <P>
          &ldquo;We&rdquo;, &ldquo;us&rdquo; and &ldquo;our&rdquo; mean {OPERATOR.name}.
          &ldquo;You&rdquo; means anyone using the app or the dashboards.
        </P>
      </Section>

      <Section id="what-we-collect" index={2} title="What we collect">
        <P>
          We collect as little as the product allows. Most of the app works without an
          account at all — you can browse the map, search stations and view details
          without giving us anything.
        </P>

        <SubHeading>Information you give us</SubHeading>
        <DataTable
          rows={[
            {
              label: 'Account details',
              value:
                'Email address, phone number and name, if you choose to create an account. Passwords are stored only as a cryptographic hash and are never readable by us.',
            },
            {
              label: 'Vehicle details',
              value:
                'The make, model and connector type of your vehicle, if you add one, so we can filter stations to those that can actually charge it.',
            },
            {
              label: 'Saved places',
              value: 'Stations you mark as favourites.',
            },
            {
              label: 'Reports you submit',
              value:
                'If you report a station as inaccurate, closed or out of order, we keep your report and link it to your account so we can follow up and correct the listing.',
            },
            {
              label: 'Messages',
              value: 'Anything you send us by email or through a support form.',
            },
          ]}
        />

        <SubHeading>Information collected automatically</SubHeading>
        <DataTable
          rows={[
            {
              label: 'Location',
              value: (
                <>
                  Only while the app is open and only with your permission. See{' '}
                  <a className="text-primary-800 font-semibold" href="#location">
                    section 3
                  </a>
                  .
                </>
              ),
            },
            {
              label: 'Device and app data',
              value:
                'Device model, operating system version, app version, language and a non-permanent app instance identifier.',
            },
            {
              label: 'Usage and analytics',
              value:
                'Which screens are opened and which features are used, in aggregate, so we can see what is worth building. We use Google Firebase Analytics for this.',
            },
            {
              label: 'Crash diagnostics',
              value:
                'If the app crashes, a technical report describing what the app was doing at the time.',
            },
            {
              label: 'Server logs',
              value:
                'When your app or browser talks to our servers we log the request, including IP address and timestamp, to keep the service running and to detect abuse.',
            },
          ]}
        />

        <SubHeading>What we never collect</SubHeading>
        <List
          items={[
            'Payment card details. The driver app is free and we do not process payments.',
            'Contacts, photos, microphone or calendar data.',
            'Your location while the app is closed or in the background.',
          ]}
        />
      </Section>

      <Section id="location" index={3} title="How we use location">
        <P>
          Location is the most sensitive thing the app touches, so we are specific about
          it.
        </P>
        <List
          items={[
            'We request location only when you use a feature that needs it — showing stations near you, sorting by distance, or centring the map.',
            'We ask for foreground location only. The app does not request or receive background location, and cannot see where you are when it is closed.',
            'You can refuse. If you decline the permission the app still works — you search and browse by city or area instead.',
            'We do not use your location to build an advertising profile, and we do not sell it.',
            'You can revoke the permission at any time in your device settings.',
          ]}
        />
        <P>
          Your device sends your coordinates to our servers only to answer the immediate
          question you asked, such as which stations are nearby. We do not keep a
          continuous history of your movements.
        </P>
      </Section>

      <Section id="why" index={4} title="Why we use your data">
        <List
          items={[
            'To show you charging stations, including their location, connector types, pricing and — where a station is connected to our platform — whether it is free right now.',
            'To create and secure your account, and to keep you signed in.',
            'To save your preferences, vehicle and favourites across devices.',
            'To improve the accuracy of our station data, including by acting on reports you submit.',
            'To understand which features are used so we can prioritise development.',
            'To detect, investigate and prevent fraud, abuse and security incidents.',
            'To respond when you contact us.',
            'To meet legal obligations that apply to us.',
          ]}
        />
        <P>
          We do not sell your personal data, and we do not share it with advertisers for
          their own purposes.
        </P>
      </Section>

      <Section id="sharing" index={5} title="Who we share it with">
        <P>
          We share data only with service providers that help us run the product, and only
          to the extent they need it. Each is bound to protect it and may not use it for
          their own purposes.
        </P>
        <DataTable
          rows={[
            {
              label: 'Supabase',
              value: 'Database and file hosting for accounts, stations and session data.',
            },
            {
              label: 'Vercel',
              value: 'Hosting for our web application and API.',
            },
            {
              label: 'Google Firebase',
              value: 'Analytics and crash reporting for the mobile app.',
            },
            {
              label: 'Apple and Google',
              value:
                'App distribution. They provide us with aggregate install and performance statistics; they do not receive your account data from us.',
            },
          ]}
        />
        <SubHeading>Other cases</SubHeading>
        <List
          items={[
            'Charging vendors and site owners receive aggregate, anonymised statistics about their own stations — for example how many sessions occurred in a week. They are not given the identity of individual drivers.',
            'We may disclose data if required by law, court order or a valid request from a competent authority, or where necessary to protect our rights, safety, or the safety of others.',
            'If the business is ever transferred, sold or reorganised, data may transfer with it. You will be told before your data becomes subject to a materially different policy.',
          ]}
        />
      </Section>

      <Section id="transfers" index={6} title="Where your data is stored">
        <P>
          Our infrastructure providers operate data centres outside {OPERATOR.jurisdiction}
          , so your data is stored and processed abroad. By using the service you
          understand that your data will be handled outside {OPERATOR.jurisdiction}, under
          the protections described in this policy and in our providers&rsquo; own security
          commitments.
        </P>
      </Section>

      <Section id="retention" index={7} title="How long we keep it">
        <List
          items={[
            'Account data is kept while your account is open, and deleted within 30 days of you deleting the account.',
            'Analytics and crash data are kept in aggregate for up to 14 months.',
            'Server logs are kept for up to 90 days, except where a longer period is needed to investigate a security incident.',
            'Station reports you submit are kept as part of the station record, disconnected from your identity once acted upon.',
            'We may keep limited records for longer where the law requires it.',
          ]}
        />
      </Section>

      <Section id="rights" index={8} title="Your choices and rights">
        <P>You can, at any time:</P>
        <List
          items={[
            'Access the personal data we hold about you.',
            'Correct anything inaccurate — most of it directly in the app under your profile.',
            'Delete your account and the data attached to it.',
            'Withdraw permissions such as location, in your device settings.',
            'Object to analytics collection by contacting us.',
            'Ask for a copy of your data in a portable format.',
          ]}
        />
        <P>
          To exercise any of these, email{' '}
          <a className="text-primary-800 font-semibold" href={`mailto:${CONTACT.privacy}`}>
            {CONTACT.privacy}
          </a>
          . We respond within 30 days. We may need to verify your identity first, so that
          we are not acting on someone else&rsquo;s request about your data.
        </P>
        <P>
          {OPERATOR.jurisdiction} does not currently have a comprehensive data protection
          statute in force. We have chosen to offer the rights above regardless, and we
          will update this policy if and when such a law commences.
        </P>
      </Section>

      <Section id="deletion" index={9} title="Deleting your account">
        <P>
          You can delete your account from within the app, under Profile, or by emailing{' '}
          <a className="text-primary-800 font-semibold" href={`mailto:${CONTACT.privacy}`}>
            {CONTACT.privacy}
          </a>{' '}
          from your registered address.
        </P>
        <P>
          Deleting your account removes your profile, vehicle, favourites and saved
          preferences within 30 days. Anonymised, aggregated statistics that cannot
          identify you may be retained, as may records we are legally required to keep.
        </P>
      </Section>

      <Section id="security" index={10} title="Security">
        <List
          items={[
            'All traffic between the app, our web application and our servers is encrypted in transit using TLS.',
            'Passwords are stored only as salted cryptographic hashes.',
            'Authentication tokens are held in the secure storage provided by your device operating system.',
            'Access to production data is restricted to those who need it to operate the service.',
          ]}
        />
        <P>
          No system is perfectly secure, and we cannot guarantee absolute security. If we
          become aware of a breach affecting your personal data, we will notify you and any
          relevant authority as required.
        </P>
      </Section>

      <Section id="children" index={11} title="Children's privacy">
        <P>
          The service is not directed at children under 13, and we do not knowingly collect
          their personal data. If you believe a child has given us personal data, contact{' '}
          <a className="text-primary-800 font-semibold" href={`mailto:${CONTACT.privacy}`}>
            {CONTACT.privacy}
          </a>{' '}
          and we will delete it.
        </P>
      </Section>

      <Section id="business" index={12} title="Vendor and owner accounts">
        <P>
          If you use the vendor or site owner dashboards, we also process business contact
          details, the stations assigned to your organisation, and operational data about
          them — status, faults, maintenance history, sessions and revenue.
        </P>
        <P>
          This data is scoped to your organisation. Users belonging to one vendor or owner
          cannot see another&rsquo;s stations or figures. Where a dashboard shows driver
          activity it is aggregated, and does not identify individual drivers.
        </P>
      </Section>

      <Section id="changes" index={13} title="Changes to this policy">
        <P>
          We may update this policy as the product changes. The effective date at the top
          always reflects the current version. For material changes we will give notice in
          the app or by email before they take effect. Continuing to use the service after
          that means you accept the updated policy.
        </P>
      </Section>

      <Section id="contact" index={14} title="Contact us">
        <P>
          Privacy questions and requests:{' '}
          <a className="text-primary-800 font-semibold" href={`mailto:${CONTACT.privacy}`}>
            {CONTACT.privacy}
          </a>
        </P>
        <P>
          General support:{' '}
          <a className="text-primary-800 font-semibold" href={`mailto:${CONTACT.support}`}>
            {CONTACT.support}
          </a>
        </P>
        <P>
          {OPERATOR.legalName}, {OPERATOR.registeredAddress} &middot; {DOMAIN}
        </P>
        <Callout title="Related">
          Our{' '}
          <Link href="/terms" className="underline">
            Terms of Service
          </Link>{' '}
          set out the rules for using Ampere, including important limits on how far you
          should rely on charging station information.
        </Callout>
      </Section>
    </LegalShell>
  );
}
