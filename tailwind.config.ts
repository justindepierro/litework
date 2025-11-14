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
        primary: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      fontWeight: {
        thin: "100",
        extralight: "200",
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },
      fontSize: {
        xs: "0.75rem", // 12px
        sm: "0.875rem", // 14px
        base: "1rem", // 16px
        md: "1.0625rem", // 17px
        lg: "1.125rem", // 18px
        xl: "1.25rem", // 20px
        "2xl": "1.5rem", // 24px
        "3xl": "1.875rem", // 30px
        "4xl": "2.25rem", // 36px
        "5xl": "3rem", // 48px
        "6xl": "3.75rem", // 60px
        "7xl": "4.5rem", // 72px
        "8xl": "6rem", // 96px
        "9xl": "8rem", // 128px
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

        // Enhanced Accent Colors with Full Scales
        accent: {
          // Orange - Energy/Strength (brand primary)
          orange: {
            50: "#fff7ed",
            100: "#ffedd5",
            200: "#fed7aa",
            300: "#fdba74",
            400: "#fb923c",
            500: "#ff6b35",
            600: "#ea5a28",
            700: "#c2410c",
            800: "#9a3412",
            900: "#7c2d12",
            950: "#431407",
            DEFAULT: "#ff6b35",
          },
          // Green - Success/Progress
          green: {
            50: "#ecfdf5",
            100: "#d1fae5",
            200: "#a7f3d0",
            300: "#6ee7b7",
            400: "#34d399",
            500: "#00d4aa",
            600: "#00b894",
            700: "#059669",
            800: "#047857",
            900: "#065f46",
            950: "#064e3b",
            DEFAULT: "#00d4aa",
          },
          // Purple - Premium/Achievement
          purple: {
            50: "#faf5ff",
            100: "#f3e8ff",
            200: "#e9d5ff",
            300: "#d8b4fe",
            400: "#c084fc",
            500: "#8b5cf6",
            600: "#7c3aed",
            700: "#6d28d9",
            800: "#5b21b6",
            900: "#4c1d95",
            950: "#2e1065",
            DEFAULT: "#8b5cf6",
          },
          // Pink - Fun/Motivation
          pink: {
            50: "#fdf2f8",
            100: "#fce7f3",
            200: "#fbcfe8",
            300: "#f9a8d4",
            400: "#f472b6",
            500: "#ec4899",
            600: "#db2777",
            700: "#be185d",
            800: "#9d174d",
            900: "#831843",
            950: "#500724",
            DEFAULT: "#ec4899",
          },
          // Amber - Warning (replaces yellow for WCAG AA)
          amber: {
            50: "#fffbeb",
            100: "#fef3c7",
            200: "#fde68a",
            300: "#fcd34d",
            400: "#fbbf24",
            500: "#f59e0b",
            600: "#d97706",
            700: "#b45309",
            800: "#92400e",
            900: "#78350f",
            950: "#451a03",
            DEFAULT: "#f59e0b",
          },
          // Yellow alias for amber (backwards compatibility)
          yellow: "#f59e0b",
          // Red - Alert/High Intensity
          red: {
            50: "#fef2f2",
            100: "#fee2e2",
            200: "#fecaca",
            300: "#fca5a5",
            400: "#f87171",
            500: "#ef4444",
            600: "#dc2626",
            700: "#b91c1c",
            800: "#991b1b",
            900: "#7f1d1d",
            950: "#450a0a",
            DEFAULT: "#ef4444",
          },
          // Blue - Info/Cool Down
          blue: {
            50: "#eff6ff",
            100: "#dbeafe",
            200: "#bfdbfe",
            300: "#93c5fd",
            400: "#60a5fa",
            500: "#3b82f6",
            600: "#2563eb",
            700: "#1d4ed8",
            800: "#1e40af",
            900: "#1e3a8a",
            950: "#172554",
            DEFAULT: "#3b82f6",
          },
          // NEW: Cyan - Tech/Modern
          cyan: {
            50: "#ecfeff",
            100: "#cffafe",
            200: "#a5f3fc",
            300: "#67e8f9",
            400: "#22d3ee",
            500: "#06b6d4",
            600: "#0891b2",
            700: "#0e7490",
            800: "#155e75",
            900: "#164e63",
            950: "#083344",
            DEFAULT: "#06b6d4",
          },
          // NEW: Lime - Fresh/Active
          lime: {
            50: "#f7fee7",
            100: "#ecfccb",
            200: "#d9f99d",
            300: "#bef264",
            400: "#a3e635",
            500: "#84cc16",
            600: "#65a30d",
            700: "#4d7c0f",
            800: "#3f6212",
            900: "#365314",
            950: "#1a2e05",
            DEFAULT: "#84cc16",
          },
          // NEW: Indigo - Focus/Clarity
          indigo: {
            50: "#eef2ff",
            100: "#e0e7ff",
            200: "#c7d2fe",
            300: "#a5b4fc",
            400: "#818cf8",
            500: "#6366f1",
            600: "#4f46e5",
            700: "#4338ca",
            800: "#3730a6",
            900: "#312e81",
            950: "#1e1b4b",
            DEFAULT: "#6366f1",
          },
        },

        // Semantic Color Mappings for Consistent UI
        primary: {
          light: "#dbeafe", // blue-100
          lighter: "#eff6ff", // blue-50
          DEFAULT: "#3b82f6", // blue-500
          dark: "#1d4ed8", // blue-700
        },
        success: {
          light: "#d1fae5", // green-100
          lighter: "#ecfdf5", // green-50
          DEFAULT: "#00d4aa", // accent-green
          dark: "#047857", // green-800
        },
        error: {
          light: "#fee2e2", // red-100
          lighter: "#fef2f2", // red-50
          DEFAULT: "#ef4444", // red-500
          dark: "#b91c1c", // red-700
        },
        warning: {
          light: "#fef3c7", // amber-100
          lighter: "#fffbeb", // amber-50
          DEFAULT: "#f59e0b", // amber-500
          dark: "#b45309", // amber-700
        },
        info: {
          light: "#cffafe", // cyan-100
          lighter: "#ecfeff", // cyan-50
          DEFAULT: "#06b6d4", // cyan-500
          dark: "#0e7490", // cyan-700
        },
        brand: {
          light: "#fed7aa", // orange-200
          lighter: "#ffedd5", // orange-100
          DEFAULT: "#ff6b35", // brand orange
          dark: "#c2410c", // orange-700
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
        "60": "60",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "zoom-in": {
          "0%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        in: "fade-in 150ms ease-out",
        "fade-in-0": "fade-in 150ms ease-out",
        "zoom-in-95": "zoom-in 150ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
