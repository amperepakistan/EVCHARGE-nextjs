import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Callout,
  LegalShell,
  List,
  P,
  Section,
  SubHeading,
} from '@/components/features/legal/legal-shell';
import { APP_NAME, CONTACT, OPERATOR } from '@/lib/legal/config';

export const metadata: Metadata = {
  title: 'Terms of Service — Ampere',
  description:
    'The terms and conditions governing use of the Ampere driver app and the vendor and owner dashboards.',
};

const SECTIONS = [
  { id: 'agreement', title: 'Agreement to these terms' },
  { id: 'service', title: 'What Ampere is' },
  { id: 'accuracy', title: 'Station information and its limits' },
  { id: 'third-parties', title: 'Charging stations are operated by others' },
  { id: 'eligibility', title: 'Eligibility' },
  { id: 'accounts', title: 'Your account' },
  { id: 'acceptable-use', title: 'Acceptable use' },
  { id: 'reports', title: 'Content you submit' },
  { id: 'business', title: 'Vendor and site owner terms' },
  { id: 'ip', title: 'Intellectual property' },
  { id: 'availability', title: 'Availability and changes' },
  { id: 'disclaimer', title: 'Disclaimer of warranties' },
  { id: 'liability', title: 'Limitation of liability' },
  { id: 'indemnity', title: 'Indemnity' },
  { id: 'termination', title: 'Suspension and termination' },
  { id: 'law', title: 'Governing law and disputes' },
  { id: 'changes', title: 'Changes to these terms' },
  { id: 'contact', title: 'Contact' },
];

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      summary={`These terms — also referred to as our Terms and Conditions — govern your use of the ${APP_NAME} mobile app, the ${OPERATOR.name} website and the vendor and owner dashboards. Please read section 3 in particular: it explains how far you should rely on the charging station information we show you.`}
      sections={SECTIONS}
    >
      <Section id="agreement" index={1} title="Agreement to these terms">
        <P>
          By downloading, accessing or using {OPERATOR.name} you agree to these terms. If
          you do not agree, do not use the service.
        </P>
        <P>
          These terms form a binding agreement between you and {OPERATOR.legalName}. They
          apply together with our{' '}
          <Link href="/privacy" className="text-primary-800 font-semibold">
            Privacy Policy
          </Link>
          .
        </P>
      </Section>

      <Section id="service" index={2} title="What Ampere is">
        <P>
          {OPERATOR.name} is an information service. We publish a directory of electric
          vehicle charging stations in {OPERATOR.jurisdiction} — where they are, what
          connectors they have, their posted prices and hours, and, for stations connected
          to our platform, their live availability.
        </P>
        <P>
          The driver app is free to use. We do not own, operate, install, maintain or
          supply electricity through any charging station, and we do not sell charging.
        </P>
      </Section>

      <Section id="accuracy" index={3} title="Station information and its limits">
        <Callout title="Please read this section">
          Charging station information is provided on an &ldquo;as is&rdquo; basis and may
          be incomplete, out of date or wrong. Always confirm that a station is working,
          available and priced as expected before you rely on it — particularly before
          driving a distance to reach it, and especially if your remaining charge is low.
        </Callout>
        <P>
          We compile station data from public sources, from operators and site owners, from
          our own physical surveys, and from reports submitted by users. We work hard to
          keep it accurate, and we correct errors when we find them. Even so:
        </P>
        <List
          items={[
            'A station may be closed, removed, under maintenance or out of order without our knowing.',
            'Prices are set by the operator and can change at any time. The price at the plug may differ from the price shown in the app.',
            'Connector types, power ratings and operating hours may be recorded incorrectly or may change.',
            'Live availability is only shown for stations connected to our platform. Where it is shown, it depends on network connectivity and on equipment we do not control, and may be delayed or unavailable.',
            'A station shown as available may be occupied, blocked or otherwise unusable by the time you arrive.',
          ]}
        />
        <P>
          You are responsible for your own journey planning, including keeping enough
          charge to reach an alternative. Do not treat {OPERATOR.name} as a guarantee that
          any particular station will be usable.
        </P>
      </Section>

      <Section id="third-parties" index={4} title="Charging stations are operated by others">
        <P>
          Every charging station listed is owned and operated by a third party. Your use of
          a station is a matter between you and its operator, on that operator&rsquo;s own
          terms and prices.
        </P>
        <P>
          We are not a party to that relationship and we are not responsible for it. In
          particular we are not responsible for the condition, safety or performance of any
          station, for damage to your vehicle, for the amount you are charged, for refunds,
          or for the conduct of any operator or their staff. Disputes about a charging
          session should be taken up with the operator.
        </P>
        <P>
          Listing a station is not an endorsement or a certification that it is safe or
          fit for use.
        </P>
      </Section>

      <Section id="eligibility" index={5} title="Eligibility">
        <P>
          You must be at least 13 years old to use the app, and at least 18 to create a
          vendor or site owner account. If you use the service on behalf of an
          organisation, you confirm you are authorised to bind it to these terms.
        </P>
      </Section>

      <Section id="accounts" index={6} title="Your account">
        <P>
          Most of the app works without an account. If you create one, you agree to give
          accurate information and to keep it current.
        </P>
        <List
          items={[
            'You are responsible for keeping your credentials confidential and for activity under your account.',
            'Tell us promptly at ' + CONTACT.support + ' if you believe your account has been compromised.',
            'Do not share, sell or transfer your account.',
            'You may delete your account at any time, as described in our Privacy Policy.',
          ]}
        />
      </Section>

      <Section id="acceptable-use" index={7} title="Acceptable use">
        <P>You agree not to:</P>
        <List
          items={[
            'Scrape, harvest, copy or systematically extract our station data, or use automated means to access the service, except as we expressly permit in writing.',
            'Resell, republish or redistribute our data or make a competing directory from it.',
            'Submit false, misleading or abusive reports about stations.',
            'Interfere with the service, attempt to gain unauthorised access to it, or probe or test its security without our written permission.',
            'Reverse engineer, decompile or disassemble the app, except where the law expressly permits it.',
            'Use the service unlawfully, or in a way that infringes the rights of others.',
            'Impersonate anyone, or misrepresent your affiliation with any person or organisation.',
          ]}
        />
      </Section>

      <Section id="reports" index={8} title="Content you submit">
        <P>
          When you submit a station report, review, correction or other content, you keep
          ownership of it. You grant us a worldwide, royalty-free, perpetual licence to use,
          store, reproduce, modify and publish that content as part of operating and
          improving the service, including correcting and enriching station listings.
        </P>
        <P>
          You confirm that you have the right to submit it and that it is accurate to the
          best of your knowledge. We may edit or remove submitted content at our
          discretion.
        </P>
      </Section>

      <Section id="business" index={9} title="Vendor and site owner terms">
        <P>
          If you access a vendor or site owner dashboard, the following also applies.
        </P>
        <SubHeading>Your data and your stations</SubHeading>
        <List
          items={[
            'You are responsible for the accuracy of the station information you supply, including pricing, connector specifications and operating hours.',
            'You must hold the permissions, registrations and approvals required to operate your charging stations, including any registration required by the applicable energy regulator. Compliance is yours, not ours.',
            'Access is scoped to your organisation. You may not attempt to access another organisation’s data.',
            'You are responsible for the users you invite and the permissions you grant them.',
          ]}
        />
        <SubHeading>Commercial terms</SubHeading>
        <P>
          Paid integrations, connected-station fees and hardware are governed by the
          separate written agreement between us. Where that agreement conflicts with these
          terms, it prevails for the subject it covers.
        </P>
        <SubHeading>Analytics</SubHeading>
        <P>
          Statistics shown in your dashboard are provided for operational guidance. They
          are derived from telemetry and estimates, are not audited, and must not be relied
          on as a billing record, a financial statement or a basis for a tax filing.
        </P>
      </Section>

      <Section id="ip" index={10} title="Intellectual property">
        <P>
          The {OPERATOR.name} name, logo, app, website, dashboards, design and compiled
          station database are owned by {OPERATOR.legalName} and protected by intellectual
          property law. We grant you a limited, personal, non-exclusive, non-transferable,
          revocable licence to use the service for its intended purpose. No other rights
          are granted.
        </P>
        <P>
          Trade marks, names and logos of charging operators, vehicle manufacturers and
          other third parties belong to their respective owners and are used for
          identification only.
        </P>
      </Section>

      <Section id="availability" index={11} title="Availability and changes">
        <P>
          We aim to keep the service running but do not promise uninterrupted availability.
          We may modify, suspend or discontinue any part of it, including individual
          features, at any time and without liability to you. We may also impose limits on
          use.
        </P>
      </Section>

      <Section id="disclaimer" index={12} title="Disclaimer of warranties">
        <P>
          The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;,
          without warranty of any kind, whether express, implied or statutory. To the
          fullest extent permitted by law we disclaim all warranties, including any implied
          warranty of merchantability, fitness for a particular purpose, non-infringement,
          and any warranty as to the accuracy, completeness, reliability or currency of
          station information.
        </P>
        <P>
          We do not warrant that the service will be uninterrupted, secure or error free,
          or that any defect will be corrected.
        </P>
      </Section>

      <Section id="liability" index={13} title="Limitation of liability">
        <P>To the fullest extent permitted by law:</P>
        <List
          items={[
            'We are not liable for any indirect, incidental, special, consequential, exemplary or punitive damages, or for any loss of profit, revenue, data, goodwill or opportunity, however caused.',
            'We are not liable for any loss arising from your reliance on station information, including wasted journeys, a depleted battery, vehicle recovery costs, delay, missed appointments, or any consequence of a station being unavailable, out of order, differently priced or unsuitable for your vehicle.',
            'We are not liable for damage to your vehicle or property caused by any charging station, nor for any act or omission of a station operator or site owner.',
            'Our total aggregate liability arising out of or in connection with the service is limited to the greater of the amount you paid us in the twelve months before the claim, or PKR 5,000.',
          ]}
        />
        <P>
          Nothing in these terms excludes or limits liability that cannot lawfully be
          excluded or limited, including liability for death or personal injury caused by
          negligence, or for fraud.
        </P>
      </Section>

      <Section id="indemnity" index={14} title="Indemnity">
        <P>
          You agree to indemnify and hold harmless {OPERATOR.legalName} against claims,
          losses, liabilities and reasonable costs arising from your breach of these terms,
          your misuse of the service, or your infringement of the rights of any third
          party.
        </P>
      </Section>

      <Section id="termination" index={15} title="Suspension and termination">
        <P>
          We may suspend or terminate your access, with or without notice, if you breach
          these terms, if we reasonably suspect misuse or unlawful activity, or if we
          discontinue the service. You may stop using the service and delete your account
          at any time.
        </P>
        <P>
          Sections that by their nature should survive termination — including intellectual
          property, disclaimers, limitation of liability, indemnity and governing law —
          continue to apply.
        </P>
      </Section>

      <Section id="law" index={16} title="Governing law and disputes">
        <P>
          These terms are governed by the laws of {OPERATOR.jurisdiction}, without regard
          to conflict of law rules. The courts at {OPERATOR.forum} have exclusive
          jurisdiction over any dispute arising out of or in connection with them.
        </P>
        <P>
          Before starting proceedings, please contact us at{' '}
          <a className="text-primary-800 font-semibold" href={`mailto:${CONTACT.legal}`}>
            {CONTACT.legal}
          </a>
          . Most issues can be resolved quickly and informally.
        </P>
      </Section>

      <Section id="changes" index={17} title="Changes to these terms">
        <P>
          We may update these terms as the service develops. The effective date at the top
          reflects the current version. For material changes we will give notice in the app
          or by email before they take effect. Continuing to use the service afterwards
          means you accept the updated terms.
        </P>
      </Section>

      <Section id="contact" index={18} title="Contact">
        <P>
          Questions about these terms:{' '}
          <a className="text-primary-800 font-semibold" href={`mailto:${CONTACT.legal}`}>
            {CONTACT.legal}
          </a>
        </P>
        <P>
          Support:{' '}
          <a className="text-primary-800 font-semibold" href={`mailto:${CONTACT.support}`}>
            {CONTACT.support}
          </a>
        </P>
        <P>
          Partnerships:{' '}
          <a className="text-primary-800 font-semibold" href={`mailto:${CONTACT.partners}`}>
            {CONTACT.partners}
          </a>
        </P>
        <P>
          {OPERATOR.legalName}, {OPERATOR.registeredAddress}
        </P>
      </Section>
    </LegalShell>
  );
}
