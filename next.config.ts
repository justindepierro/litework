import type { NextConfig } from "next";
import TerserPlugin from "terser-webpack-plugin";

const nextConfig: NextConfig = {
  // Security headers
  poweredByHeader: false,
  compress: true,

  // Production optimizations
  output: "standalone",
  reactStrictMode: true,

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache for production
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Advanced development and production optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      "@heroicons/react",
      "lucide-react",
      "date-fns",
      "react-hook-form",
    ],
  },

  // External packages for server-side optimization
  serverExternalPackages: ["@supabase/supabase-js"],

  // Simplified development configuration
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      // Advanced chunk splitting for production
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          minSize: 20000,
          maxSize: 150000, // Smaller chunks for better caching
          cacheGroups: {
            // Vendor libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              priority: 10,
            },
            // React framework
            framework: {
              chunks: "all",
              name: "framework",
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Supabase and auth
            supabase: {
              test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
              name: "supabase",
              chunks: "all",
              priority: 30,
            },
            // UI components and icons
            ui: {
              test: /[\\/]node_modules[\\/](lucide-react|@heroicons)[\\/]/,
              name: "ui",
              chunks: "all",
              priority: 25,
            },
            // Common chunks
            commons: {
              name: "commons",
              chunks: "all",
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
        // Tree shaking optimizations
        usedExports: true,
        sideEffects: false,
      };

      // Remove console logs in production
      config.optimization.minimizer = config.optimization.minimizer || [];
      config.optimization.minimizer.push(
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
          },
        })
      );
    }

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

  headers: async () => {
    return [
      // Static assets caching
      {
        source: "/icons/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*\\.(svg|png|jpg|jpeg|webp|avif|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Service Worker caching
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      // Manifest caching
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400", // 1 day
          },
        ],
      },
      // General security and performance headers
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
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
