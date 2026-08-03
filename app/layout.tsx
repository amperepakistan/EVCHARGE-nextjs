import type { Metadata } from 'next';
// design-system.css is pulled in by globals.css via a CSS @import so Tailwind
// evaluates its `@theme` block — importing it here instead would drop it.
import './globals.css';

export const metadata: Metadata = {
  title: 'Ampere — EV Charging Platform',
  description: 'EV charging network — vendor, owner, and admin dashboards',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-text-primary font-body min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
