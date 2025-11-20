import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "!./docs/**/*", // Exclude documentation files
    "!./scripts/**/*", // Exclude scripts
    "!./database/**/*", // Exclude database files
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      fontFamily: {
        sans: [
          "var(--font-family-primary)",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        heading: [
          "var(--font-family-heading)",
          "Poppins",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "var(--font-family-display)",
          "Poppins",
          "system-ui",
          "sans-serif",
        ],
        primary: [
          "var(--font-family-primary)",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
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
          50: "var(--color-navy-50)",
          100: "var(--color-navy-100)",
          200: "var(--color-navy-200)",
          300: "var(--color-navy-300)",
          400: "var(--color-navy-400)",
          500: "var(--color-navy-500)",
          600: "var(--color-navy-600)",
          700: "var(--color-navy-700)",
          800: "var(--color-navy-800)",
          900: "var(--color-navy-900)",
          DEFAULT: "var(--color-navy)",
        },
        // Silver Scale
        silver: {
          100: "var(--color-silver-100)",
          200: "var(--color-silver-200)",
          300: "var(--color-silver-300)",
          400: "var(--color-silver-400)",
          500: "var(--color-silver-500)",
          600: "var(--color-silver-600)",
          700: "var(--color-silver-700)",
          800: "var(--color-silver-800)",
          900: "var(--color-silver-900)",
          DEFAULT: "var(--color-silver)",
        },
        // Off-white
        "off-white": "var(--color-off-white)",

        // Enhanced Accent Colors with Full Scales
        accent: {
          // Orange - Energy/Strength (brand primary)
          orange: {
            50: "var(--color-accent-orange-50)",
            100: "var(--color-accent-orange-100)",
            200: "var(--color-accent-orange-200)",
            300: "var(--color-accent-orange-300)",
            400: "var(--color-accent-orange-400)",
            500: "var(--color-accent-orange-500)",
            600: "var(--color-accent-orange-600)",
            700: "var(--color-accent-orange-700)",
            800: "var(--color-accent-orange-800)",
            900: "var(--color-accent-orange-900)",
            950: "var(--color-accent-orange-950)",
            DEFAULT: "var(--color-accent-orange)",
          },
          // Green - Success/Progress
          green: {
            50: "var(--color-accent-green-50)",
            100: "var(--color-accent-green-100)",
            200: "var(--color-accent-green-200)",
            300: "var(--color-accent-green-300)",
            400: "var(--color-accent-green-400)",
            500: "var(--color-accent-green-500)",
            600: "var(--color-accent-green-600)",
            700: "var(--color-accent-green-700)",
            800: "var(--color-accent-green-800)",
            900: "var(--color-accent-green-900)",
            950: "var(--color-accent-green-950)",
            DEFAULT: "var(--color-accent-green)",
          },
          // Purple - Premium/Achievement
          purple: {
            50: "var(--color-accent-purple-50)",
            100: "var(--color-accent-purple-100)",
            200: "var(--color-accent-purple-200)",
            300: "var(--color-accent-purple-300)",
            400: "var(--color-accent-purple-400)",
            500: "var(--color-accent-purple-500)",
            600: "var(--color-accent-purple-600)",
            700: "var(--color-accent-purple-700)",
            800: "var(--color-accent-purple-800)",
            900: "var(--color-accent-purple-900)",
            950: "var(--color-accent-purple-950)",
            DEFAULT: "var(--color-accent-purple)",
          },
          // Pink - Fun/Motivation
          pink: {
            50: "var(--color-accent-pink-50)",
            100: "var(--color-accent-pink-100)",
            200: "var(--color-accent-pink-200)",
            300: "var(--color-accent-pink-300)",
            400: "var(--color-accent-pink-400)",
            500: "var(--color-accent-pink-500)",
            600: "var(--color-accent-pink-600)",
            700: "var(--color-accent-pink-700)",
            800: "var(--color-accent-pink-800)",
            900: "var(--color-accent-pink-900)",
            950: "var(--color-accent-pink-950)",
            DEFAULT: "var(--color-accent-pink)",
          },
          // Amber - Warning (replaces yellow for WCAG AA)
          amber: {
            50: "var(--color-accent-amber-50)",
            100: "var(--color-accent-amber-100)",
            200: "var(--color-accent-amber-200)",
            300: "var(--color-accent-amber-300)",
            400: "var(--color-accent-amber-400)",
            500: "var(--color-accent-amber-500)",
            600: "var(--color-accent-amber-600)",
            700: "var(--color-accent-amber-700)",
            800: "var(--color-accent-amber-800)",
            900: "var(--color-accent-amber-900)",
            950: "var(--color-accent-amber-950)",
            DEFAULT: "var(--color-accent-amber)",
          },
          // Yellow alias for amber (backwards compatibility)
          yellow: "var(--color-accent-yellow)",
          // Red - Alert/High Intensity
          red: {
            50: "var(--color-accent-red-50)",
            100: "var(--color-accent-red-100)",
            200: "var(--color-accent-red-200)",
            300: "var(--color-accent-red-300)",
            400: "var(--color-accent-red-400)",
            500: "var(--color-accent-red-500)",
            600: "var(--color-accent-red-600)",
            700: "var(--color-accent-red-700)",
            800: "var(--color-accent-red-800)",
            900: "var(--color-accent-red-900)",
            950: "var(--color-accent-red-950)",
            DEFAULT: "var(--color-accent-red)",
          },
          // Blue - Info/Cool Down
          blue: {
            50: "var(--color-accent-blue-50)",
            100: "var(--color-accent-blue-100)",
            200: "var(--color-accent-blue-200)",
            300: "var(--color-accent-blue-300)",
            400: "var(--color-accent-blue-400)",
            500: "var(--color-accent-blue-500)",
            600: "var(--color-accent-blue-600)",
            700: "var(--color-accent-blue-700)",
            800: "var(--color-accent-blue-800)",
            900: "var(--color-accent-blue-900)",
            950: "var(--color-accent-blue-950)",
            DEFAULT: "var(--color-accent-blue)",
          },
          // NEW: Cyan - Tech/Modern
          cyan: {
            50: "var(--color-accent-cyan-50)",
            100: "var(--color-accent-cyan-100)",
            200: "var(--color-accent-cyan-200)",
            300: "var(--color-accent-cyan-300)",
            400: "var(--color-accent-cyan-400)",
            500: "var(--color-accent-cyan-500)",
            600: "var(--color-accent-cyan-600)",
            700: "var(--color-accent-cyan-700)",
            800: "var(--color-accent-cyan-800)",
            900: "var(--color-accent-cyan-900)",
            950: "var(--color-accent-cyan-950)",
            DEFAULT: "var(--color-accent-cyan)",
          },
          // NEW: Lime - Fresh/Active
          lime: {
            50: "var(--color-accent-lime-50)",
            100: "var(--color-accent-lime-100)",
            200: "var(--color-accent-lime-200)",
            300: "var(--color-accent-lime-300)",
            400: "var(--color-accent-lime-400)",
            500: "var(--color-accent-lime-500)",
            600: "var(--color-accent-lime-600)",
            700: "var(--color-accent-lime-700)",
            800: "var(--color-accent-lime-800)",
            900: "var(--color-accent-lime-900)",
            950: "var(--color-accent-lime-950)",
            DEFAULT: "var(--color-accent-lime)",
          },
          // NEW: Indigo - Focus/Clarity
          indigo: {
            50: "var(--color-accent-indigo-50)",
            100: "var(--color-accent-indigo-100)",
            200: "var(--color-accent-indigo-200)",
            300: "var(--color-accent-indigo-300)",
            400: "var(--color-accent-indigo-400)",
            500: "var(--color-accent-indigo-500)",
            600: "var(--color-accent-indigo-600)",
            700: "var(--color-accent-indigo-700)",
            800: "var(--color-accent-indigo-800)",
            900: "var(--color-accent-indigo-900)",
            950: "var(--color-accent-indigo-950)",
            DEFAULT: "var(--color-accent-indigo)",
          },
        },

        // Semantic Color Mappings for Consistent UI
        brand: {
          light: "var(--color-accent-orange-100)",
          lighter: "var(--color-accent-orange-50)",
          DEFAULT: "var(--color-accent-orange)",
          dark: "var(--color-accent-orange-700)",
        },
        success: {
          light: "var(--color-success-lighter)",
          lighter: "var(--color-success-lightest)",
          DEFAULT: "var(--color-success)",
          dark: "var(--color-success-dark)",
          darkest: "var(--color-success-darkest)",
        },
        error: {
          light: "var(--color-error-lighter)",
          lighter: "var(--color-error-lightest)",
          DEFAULT: "var(--color-error)",
          dark: "var(--color-error-dark)",
          darkest: "var(--color-error-darkest)",
        },
        warning: {
          light: "var(--color-warning-lighter)",
          lighter: "var(--color-warning-lightest)",
          DEFAULT: "var(--color-warning)",
          dark: "var(--color-warning-dark)",
          darkest: "var(--color-warning-darkest)",
        },
        info: {
          light: "var(--color-info-lighter)",
          lighter: "var(--color-info-lightest)",
          DEFAULT: "var(--color-info)",
          dark: "var(--color-info-dark)",
          darkest: "var(--color-info-darkest)",
        },
      },
      // Standardized Text Colors
      textColor: {
        primary: "var(--color-text-primary)", // navy-900
        secondary: "var(--color-text-secondary)", // navy-600
        tertiary: "var(--color-text-tertiary)", // navy-500
        inverse: "var(--color-text-inverse)", // white
        accent: "var(--color-text-accent)", // orange
      },
      // Standardized Background Colors
      backgroundColor: {
        primary: "var(--color-bg-primary)", // white
        secondary: "var(--color-bg-secondary)", // silver-50
        tertiary: "var(--color-bg-tertiary)", // silver-100
        surface: "var(--color-bg-surface)", // silver-50
        // Glass Materials
        "glass-thin": "var(--material-glass-thin)",
        "glass-regular": "var(--material-glass-regular)",
        "glass-thick": "var(--material-glass-thick)",
      },
      backdropBlur: {
        sm: "var(--material-glass-blur-sm)",
        md: "var(--material-glass-blur-md)",
        lg: "var(--material-glass-blur-lg)",
      },
      // Standardized Border System
      borderColor: {
        primary: "var(--color-border-primary)", // silver-200
        secondary: "var(--color-border-secondary)", // silver-300
        DEFAULT: "var(--color-border-primary)", // e5e7eb
        subtle: "var(--color-border-secondary)", // f3f4f6
        strong: "var(--color-border-secondary)", // 94a3b8
        accent: "var(--color-border-accent)", // ff6b35
        focus: "var(--color-border-focus)", // 3b82f6
        error: "var(--color-error)", // ef4444
        success: "var(--color-success)", // 00d4aa
        warning: "var(--color-warning)", // f59e0b
      },
      borderWidth: {
        DEFAULT: "var(--border-width-default)", // 1px
        0: "0",
        2: "var(--border-width-medium)", // 2px
        3: "var(--border-width-thick)", // 3px
        4: "4px",
        8: "8px",
      },
      borderRadius: {
        none: "0",
        sm: "var(--radius-sm)", // 0.375rem / 6px
        DEFAULT: "var(--radius-md)", // 0.5rem / 8px
        md: "var(--radius-md)", // 0.5rem / 8px
        lg: "var(--radius-lg)", // 0.75rem / 12px
        xl: "var(--radius-xl)", // 1rem / 16px
        "2xl": "var(--radius-2xl)", // 1.5rem / 24px
        "3xl": "1.875rem", // 30px
        full: "var(--radius-full)", // 9999px
      },
      backgroundImage: {
        "gradient-primary": "var(--bg-gradient-primary)",
        "gradient-secondary": "var(--bg-gradient-secondary)",
        "gradient-navy": "var(--bg-gradient-dark)",
        "gradient-silver": "var(--bg-gradient-primary)",
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
      spacing: {
        "fluid-xs": "var(--space-fluid-xs)",
        "fluid-sm": "var(--space-fluid-sm)",
        "fluid-md": "var(--space-fluid-md)",
        "fluid-lg": "var(--space-fluid-lg)",
        "fluid-xl": "var(--space-fluid-xl)",
        "fluid-2xl": "var(--space-fluid-2xl)",
        "fluid-3xl": "var(--space-fluid-3xl)",
        "container-xs": "var(--space-container-xs)",
        "container-sm": "var(--space-container-sm)",
        "container-md": "var(--space-container-md)",
        "container-lg": "var(--space-container-lg)",
        "container-xl": "var(--space-container-xl)",
      },
    },
  },
  plugins: [],
};

export default config;
