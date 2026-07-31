import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EVCharge',
  description: 'EV charging network — vendor, owner, and admin dashboards',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
