import type { Metadata } from 'next';
import Link from 'next/link';
import { APP_NAME, CONTACT, OPERATOR } from '@/lib/legal/config';

export const metadata: Metadata = {
  title: 'Delete Account & Data — Ampere',
  description:
    'Request account deletion and learn how your data is handled when you delete your Ampere account.',
};

export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <Link
            href="/"
            className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            ← Back to {APP_NAME}
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Account & Data Deletion Request
          </h1>
          <p className="mt-2 text-base text-neutral-400">
            {APP_NAME} ({OPERATOR.name}) respects your privacy and control over your personal data.
          </p>
        </div>

        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">How to Delete Your Account</h2>
          <p className="text-neutral-300 leading-relaxed">
            You can request full deletion of your {APP_NAME} account and all associated personal data using either of the following methods:
          </p>

          <div className="space-y-4 pt-2">
            <div className="bg-neutral-800/60 p-4 rounded-lg border border-neutral-700/50">
              <h3 className="font-semibold text-emerald-400">Method 1: In-App Deletion</h3>
              <ol className="list-decimal list-inside mt-2 text-sm text-neutral-300 space-y-1">
                <li>Open the <strong>{APP_NAME}</strong> mobile application.</li>
                <li>Go to <strong>Profile</strong> from the bottom menu.</li>
                <li>Open <strong>Settings</strong>.</li>
                <li>Tap <strong>Delete account</strong> and confirm your request.</li>
              </ol>
              <p className="mt-2 text-xs text-neutral-400">
                Your request is reviewed by Ampere. You can keep using the app until an admin
                approves the deletion. After approval, your personal data is removed and the
                account can no longer sign in.
              </p>
            </div>

            <div className="bg-neutral-800/60 p-4 rounded-lg border border-neutral-700/50">
              <h3 className="font-semibold text-emerald-400">Method 2: Email Deletion Request</h3>
              <p className="mt-1 text-sm text-neutral-300">
                If you no longer have the app installed or cannot sign in, send an email from your registered email address or phone number to:
              </p>
              <a
                href={`mailto:${CONTACT.privacy}?subject=Account%20Deletion%20Request%20-%20${APP_NAME}`}
                className="inline-block mt-2 font-mono text-sm text-emerald-400 hover:underline"
              >
                {CONTACT.privacy}
              </a>
              <p className="mt-1 text-xs text-neutral-400">
                Please include your registered phone number in the email.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Data That Will Be Deleted</h2>
          <ul className="list-disc list-inside text-neutral-300 space-y-1">
            <li>User profile information (Name, Phone number, Email address)</li>
            <li>Saved vehicles, saved favourite charging stations, and preferences</li>
            <li>Push notification tokens and device links</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Data Retention & Timeline</h2>
          <p className="text-neutral-300 leading-relaxed text-sm">
            Upon submitting a deletion request, Ampere reviews and processes it. Your account and
            associated personal data are permanently deleted within <strong>30 days</strong> of
            approval. Anonymised, aggregated statistics (which cannot identify you) and records
            legally required for tax/compliance may be retained as permitted by law.
          </p>
        </section>

        <div className="pt-6 border-t border-neutral-800 text-xs text-neutral-500 flex justify-between">
          <span>&copy; {new Date().getFullYear()} {OPERATOR.name}</span>
          <Link href="/privacy" className="hover:underline">
            Full Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
