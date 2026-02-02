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
};

export default nextConfig;
