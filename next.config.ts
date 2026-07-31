import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Keep server-only modules out of client bundles
  serverExternalPackages: ['bcryptjs'],
};

export default nextConfig;
