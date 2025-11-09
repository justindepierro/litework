import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        heading: ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
      },
      colors: {
        // Navy Scale
        navy: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          DEFAULT: "#334155",
        },
        // Silver Scale
        silver: {
          100: "#ffffff",
          200: "#f9fafb",
          300: "#f3f4f6",
          400: "#e5e7eb",
          500: "#d1d5db",
          600: "#9ca3af",
          700: "#6b7280",
          800: "#4b5563",
          900: "#374151",
          DEFAULT: "#e5e7eb",
        },
        // Off-white
        "off-white": "#fefefe",

        // Vibrant Accent Colors
        accent: {
          orange: "#ff6b35",
          green: "#00d4aa",
          purple: "#8b5cf6",
          pink: "#ec4899",
          yellow: "#fbbf24",
          red: "#ef4444",
          blue: "#3b82f6",
        },
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, #ffffff 0%, #f9fafb 30%, #ffffff 100%)",
        "gradient-secondary":
          "linear-gradient(135deg, #f9fafb 0%, #ffffff 50%, #f3f4f6 100%)",
        "gradient-navy":
          "linear-gradient(135deg, #f1f5f9 0%, #fefefe 50%, #e2e8f0 100%)",
        "gradient-silver":
          "linear-gradient(135deg, #f9fafb 0%, #fefefe 50%, #f1f5f9 100%)",
      },
      zIndex: {
        '60': '60',
      },
    },
  },
  plugins: [],
};

export default config;
