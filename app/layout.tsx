import type { Metadata } from 'next';
import './globals.css';
import './design-system.css';

export const metadata: Metadata = {
  title: 'EV Charging Platform',
  description: 'EV charging network — vendor, owner, and admin dashboards',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] font-body antialiased">
        {children}
      </body>
    </html>
  );
}
