import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mobile-first optimizations
  poweredByHeader: false,
  compress: true,

  // Optimize for mobile performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["@heroicons/react"],
  },

  // PWA-ready configuration
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Mobile viewport optimization
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
