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
  // Allow build pipelines to skip type checking for speed.
  // Set SKIP_TYPECHECK=true in the build environment to enable.
  typescript: {
    ignoreBuildErrors: process.env.SKIP_TYPECHECK === 'true',
  },
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during build to save time
  },
};

export default nextConfig;
