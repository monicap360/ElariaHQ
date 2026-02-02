import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'cruisesfromgalveston.net',
          },
        ],
        destination: 'https://www.cruisesfromgalveston.net/:path*',
        permanent: true,
      },
    ];
  },
  // Render compatibility settings
  outputFileTracingRoot: process.cwd(),
  // Disable Turbopack for production builds (Render compatibility)
  experimental: {
    turbo: undefined,
  },
  // Optimize build performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Skip type checking during build (faster, but less safe)
  typescript: {
    ignoreBuildErrors: false, // Keep false for safety, but can set to true to speed up
  },
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during build to save time
  },
};

export default nextConfig;
