import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mobile-first optimizations
  poweredByHeader: false,
  compress: true,

  // Development server stability improvements
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["@heroicons/react"],
  },

  // Production optimizations
  output: "standalone",

  // Simplified development configuration
  webpack: (config, { dev, isServer }) => {
    // Only add polling in development to prevent file watching issues
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ["**/node_modules/**", "**/.git/**", "**/.next/**"],
      };

      // Reduce memory usage in development
      config.optimization = {
        ...config.optimization,
        splitChunks: isServer
          ? false
          : {
              chunks: "all",
              cacheGroups: {
                default: false,
                vendors: false,
                framework: {
                  chunks: "all",
                  name: "framework",
                  test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
                  priority: 40,
                  enforce: true,
                },
              },
            },
      };
    }
    return config;
  },

  // Turbopack configuration for better performance
  turbopack: {
    // Set correct root directory to avoid lockfile warning
    root: __dirname,
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
