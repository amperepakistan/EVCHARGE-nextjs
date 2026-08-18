import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Keep server-only modules out of client bundles
  serverExternalPackages: ['bcryptjs'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'maps.googleapis.com', pathname: '/**' },
      { protocol: 'https', hostname: 'streetviewpixels-pa.googleapis.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;
