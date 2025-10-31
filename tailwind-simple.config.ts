import type { Config } from "tailwindcss";
import { coreTokens } from "./src/styles/tokens-optimized";

/**
 * OPTIMIZED Tailwind Configuration
 * Streamlined config using optimized token system (simplified)
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

  // Optimize for production
  future: {
    hoverOnlyWhenSupported: true, // Only apply hover styles when supported
  },
};

export default config;
