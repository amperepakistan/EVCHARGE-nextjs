import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Keep server-only modules out of client bundles
  serverExternalPackages: ['bcryptjs'],
  images: {
    remotePatterns: [
      // Station photography in the dummy-data build. The real dataset stores
      // Google Places photo URLs, so this list grows when the API is wired up.
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
