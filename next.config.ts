import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Keep server-only modules out of client bundles
  serverExternalPackages: ['bcryptjs'],
  // The dev-only floating badge sits bottom-left, directly over the footer's
  // copyright line. It never ships to production, but it makes the footer
  // impossible to eyeball locally.
  devIndicators: false,
  images: {
    remotePatterns: [
      // Station photography in the dummy-data build. The real dataset stores
      // Google Places photo URLs, so this list grows when the API is wired up.
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
