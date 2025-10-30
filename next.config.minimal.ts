import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal configuration for stability testing
  poweredByHeader: false,
  
  // Basic development settings
  experimental: {
    optimizeCss: false, // Disable this temporarily
  },
};

export default nextConfig;