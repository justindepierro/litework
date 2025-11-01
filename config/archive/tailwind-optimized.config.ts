import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import { coreTokens } from "./src/styles/tokens-optimized";

/**
 * OPTIMIZED Tailwind Configuration
 * Streamlined config using optimized token system
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Override default theme with optimized tokens
    extend: {
      // Custom screen sizes
      screens: {
        xs: "480px",
      },

      // Optimized font families
      fontFamily: {
        sans: coreTokens.typography.family.base.split(", "),
        heading: coreTokens.typography.family.heading.split(", "),
      },

      // Streamlined color palette
      colors: {
        // Navy scale
        navy: coreTokens.colors.navy,

        // Silver scale
        silver: coreTokens.colors.silver,

        // Accent colors
        orange: coreTokens.colors.accent.orange,
        green: coreTokens.colors.accent.green,
        blue: coreTokens.colors.accent.blue,
        red: coreTokens.colors.accent.red,
        yellow: coreTokens.colors.accent.yellow,

        // Semantic aliases for easier use
        primary: coreTokens.colors.navy[700],
        secondary: coreTokens.colors.silver[400],
        accent: coreTokens.colors.accent.orange,
        success: coreTokens.colors.accent.green,
        error: coreTokens.colors.accent.red,
        warning: coreTokens.colors.accent.yellow,
        info: coreTokens.colors.accent.blue,
      },

      // Optimized spacing scale
      spacing: coreTokens.spacing,

      // Typography scale
      fontSize: coreTokens.typography.size,
      fontWeight: coreTokens.typography.weight,

      // Effects
      boxShadow: coreTokens.effects.shadow,
      borderRadius: coreTokens.effects.radius,

      // Layout
      maxWidth: {
        ...coreTokens.layout.container,
      },

      // Optimized background gradients
      backgroundImage: {
        "gradient-primary": `linear-gradient(135deg, ${coreTokens.colors.silver[100]} 0%, ${coreTokens.colors.silver[200]} 30%, ${coreTokens.colors.silver[100]} 100%)`,
        "gradient-secondary": `linear-gradient(135deg, ${coreTokens.colors.silver[200]} 0%, ${coreTokens.colors.silver[100]} 50%, ${coreTokens.colors.silver[300]} 100%)`,
        "gradient-navy": `linear-gradient(135deg, ${coreTokens.colors.navy[800]} 0%, ${coreTokens.colors.navy[700]} 100%)`,
      },

      // Animation and transition
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
      },

      // Z-index scale
      zIndex: {
        dropdown: "1000",
        sticky: "1020",
        fixed: "1030",
        modal: "1040",
        popover: "1050",
        tooltip: "1060",
      },
    },
  },

  plugins: [
    // Custom plugin for optimized utilities
    plugin(function ({ addUtilities, theme }) {
      addUtilities({
        // High-frequency button utilities
        ".btn-primary": {
          backgroundColor: theme("colors.orange"),
          color: theme("colors.silver.100"),
          border: `1px solid ${theme("colors.orange")}`,
          borderRadius: theme("borderRadius.md"),
          padding: `${theme("spacing.3")} ${theme("spacing.6")}`,
          fontWeight: theme("fontWeight.medium"),
          transition: "all 150ms ease-in-out",
          boxShadow: theme("boxShadow.sm"),
          "&:hover": {
            backgroundColor: "#e55a2b",
            boxShadow: theme("boxShadow.md"),
            transform: "translateY(-1px)",
          },
        },

        ".btn-secondary": {
          backgroundColor: "transparent",
          color: theme("colors.navy.700"),
          border: `1px solid ${theme("colors.silver.400")}`,
          borderRadius: theme("borderRadius.md"),
          padding: `${theme("spacing.3")} ${theme("spacing.6")}`,
          fontWeight: theme("fontWeight.medium"),
          transition: "all 150ms ease-in-out",
          "&:hover": {
            backgroundColor: theme("colors.silver.200"),
            borderColor: theme("colors.silver.500"),
          },
        },

        // Card utilities
        ".card": {
          backgroundColor: theme("colors.silver.200"),
          border: `1px solid ${theme("colors.silver.400")}`,
          borderRadius: theme("borderRadius.lg"),
          boxShadow: theme("boxShadow.base"),
          padding: theme("spacing.6"),
          transition: "all 250ms ease-in-out",
          "&:hover": {
            boxShadow: theme("boxShadow.md"),
            transform: "translateY(-2px)",
          },
        },

        // Status utilities
        ".status-success": {
          backgroundColor: "rgb(0 212 170 / 0.1)",
          color: theme("colors.green"),
          border: `1px solid ${theme("colors.green")}`,
          borderRadius: theme("borderRadius.base"),
          padding: `${theme("spacing.2")} ${theme("spacing.3")}`,
        },

        ".status-error": {
          backgroundColor: "rgb(239 68 68 / 0.1)",
          color: theme("colors.red"),
          border: `1px solid ${theme("colors.red")}`,
          borderRadius: theme("borderRadius.base"),
          padding: `${theme("spacing.2")} ${theme("spacing.3")}`,
        },

        ".status-warning": {
          backgroundColor: "rgb(251 191 36 / 0.1)",
          color: theme("colors.yellow"),
          border: `1px solid ${theme("colors.yellow")}`,
          borderRadius: theme("borderRadius.base"),
          padding: `${theme("spacing.2")} ${theme("spacing.3")}`,
        },

        // Container utility
        ".container-responsive": {
          maxWidth: theme("maxWidth.xl"),
          margin: "0 auto",
          padding: `0 ${theme("spacing.4")}`,
        },

        // Workout accent utilities
        ".accent-strength": { color: theme("colors.orange") },
        ".accent-progress": { color: theme("colors.green") },
        ".accent-intensity": { color: theme("colors.red") },
        ".accent-schedule": { color: theme("colors.blue") },
        ".accent-warning": { color: theme("colors.yellow") },
      });

      // Mobile-specific utilities
      addUtilities({
        "@media (max-width: 640px)": {
          ".btn-primary, .btn-secondary": {
            minHeight: "44px",
            padding: `${theme("spacing.3")} ${theme("spacing.4")}`,
            fontSize: "16px", // Prevent zoom on iOS
          },
        },

        // Touch device optimizations
        "@media (hover: none) and (pointer: coarse)": {
          ".btn-primary:hover, .btn-secondary:hover, .card:hover": {
            transform: "none",
          },
          ".btn-primary:active, .btn-secondary:active": {
            transform: "scale(0.98)",
            transition: "transform 0.1s ease",
          },
        },

        // PWA optimizations
        "@media (display-mode: standalone)": {
          body: {
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
          },
        },
      });
    }),
  ],

  // Optimize for production
  future: {
    hoverOnlyWhenSupported: true, // Only apply hover styles when supported
  },
};

export default config;
