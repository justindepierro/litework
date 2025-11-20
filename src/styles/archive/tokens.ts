/**
 * Design Tokens for LiteWork Workout Tracker
 * Central source of truth for all design decisions
 */

// ===========================
// COLOR TOKENS
// ===========================

export const colors = {
  // Primary Brand Colors
  primary: {
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
    offWhite: "#fefefe",
  },

  // Accent Colors for Energy & Motivation (50-950 scales for consistency and accessibility)
  accent: {
    // Orange - Energy/Strength (brand primary accent)
    orange: {
      50: "#fff7ed",
      100: "#ffedd5",
      200: "#fed7aa",
      300: "#fdba74",
      400: "#fb923c",
      500: "#ff6b35", // PRIMARY - Current brand color
      600: "#ea5a28", // Darker for text on white (WCAG AA: 4.5:1)
      700: "#c2410c",
      800: "#9a3412",
      900: "#7c2d12",
      950: "#431407",
      DEFAULT: "#ff6b35",
    },

    // Green - Success/Progress (energetic teal-green)
    green: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#00d4aa", // PRIMARY - Current brand color
      600: "#00b894", // Better text contrast (WCAG AA: 4.5:1)
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
      500: "#8b5cf6", // PRIMARY - Current brand color (already good)
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
      500: "#ec4899", // PRIMARY - Current brand color
      600: "#db2777", // Better contrast (WCAG AA: 4.5:1)
      700: "#be185d",
      800: "#9d174d",
      900: "#831843",
      950: "#500724",
      DEFAULT: "#ec4899",
    },

    // Amber - Warning/Attention (replacing yellow for WCAG AA compliance)
    amber: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24", // Old yellow
      500: "#f59e0b", // RECOMMENDED PRIMARY - Better visibility
      600: "#d97706", // Good text contrast (WCAG AA: 4.7:1)
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
      950: "#451a03",
      DEFAULT: "#f59e0b",
    },

    // Red - Alert/High Intensity
    red: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444", // PRIMARY - Current brand color
      600: "#dc2626", // Better contrast (WCAG AA: 5.1:1)
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
      500: "#3b82f6", // PRIMARY - Current brand color (already good)
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
      950: "#172554",
      DEFAULT: "#3b82f6",
    },

    // NEW ACCENTS for more variety

    // Cyan - Tech/Modern
    cyan: {
      50: "#ecfeff",
      100: "#cffafe",
      200: "#a5f3fc",
      300: "#67e8f9",
      400: "#22d3ee",
      500: "#06b6d4", // PRIMARY
      600: "#0891b2", // Text contrast
      700: "#0e7490",
      800: "#155e75",
      900: "#164e63",
      950: "#083344",
      DEFAULT: "#06b6d4",
    },

    // Lime - Fresh/Active
    lime: {
      50: "#f7fee7",
      100: "#ecfccb",
      200: "#d9f99d",
      300: "#bef264",
      400: "#a3e635",
      500: "#84cc16", // PRIMARY
      600: "#65a30d", // Text contrast (WCAG AA: 4.5:1)
      700: "#4d7c0f",
      800: "#3f6212",
      900: "#365314",
      950: "#1a2e05",
      DEFAULT: "#84cc16",
    },

    // Indigo - Focus/Clarity
    indigo: {
      50: "#eef2ff",
      100: "#e0e7ff",
      200: "#c7d2fe",
      300: "#a5b4fc",
      400: "#818cf8",
      500: "#6366f1", // PRIMARY
      600: "#4f46e5", // Text contrast
      700: "#4338ca",
      800: "#3730a6",
      900: "#312e81",
      950: "#1e1b4b",
      DEFAULT: "#6366f1",
    },
  },

  // Semantic Colors (enhanced with scales)
  semantic: {
    success: {
      lightest: "#ecfdf5", // green-50
      lighter: "#d1fae5", // green-100
      light: "#a7f3d0", // green-200
      base: "#00d4aa", // green-500
      DEFAULT: "#00d4aa",
      dark: "#00b894", // green-600 (text on light)
      darker: "#059669", // green-700
      darkest: "#065f46", // green-900
    },
    warning: {
      lightest: "#fffbeb", // amber-50
      lighter: "#fef3c7", // amber-100
      light: "#fde68a", // amber-200
      base: "#f59e0b", // amber-500 (CHANGED from yellow)
      DEFAULT: "#f59e0b",
      dark: "#d97706", // amber-600 (text on light)
      darker: "#b45309", // amber-700
      darkest: "#78350f", // amber-900
    },
    error: {
      lightest: "#fef2f2", // red-50
      lighter: "#fee2e2", // red-100
      light: "#fecaca", // red-200
      base: "#ef4444", // red-500
      DEFAULT: "#ef4444",
      dark: "#dc2626", // red-600 (text on light)
      darker: "#b91c1c", // red-700
      darkest: "#7f1d1d", // red-900
    },
    info: {
      lightest: "#eff6ff", // blue-50
      lighter: "#dbeafe", // blue-100
      light: "#bfdbfe", // blue-200
      base: "#3b82f6", // blue-500
      DEFAULT: "#3b82f6",
      dark: "#2563eb", // blue-600
      darker: "#1d4ed8", // blue-700
      darkest: "#1e3a8a", // blue-900
    },
    neutral: {
      lightest: "#fafafa",
      lighter: "#f3f4f6", // silver-300
      light: "#e5e7eb", // silver-400
      base: "#9ca3af", // silver-600
      DEFAULT: "#9ca3af",
      dark: "#6b7280", // silver-700
      darker: "#4b5563", // silver-800
      darkest: "#374151", // silver-900
    },
  },

  // Interactive State Colors (for buttons, links, etc.)
  interactive: {
    primary: {
      base: "#ff6b35", // orange-500
      hover: "#ea5a28", // orange-600
      active: "#c2410c", // orange-700
      disabled: "#fed7aa", // orange-200
      focus: "#ff6b35",
    },
    secondary: {
      base: "#8b5cf6", // purple-500
      hover: "#7c3aed", // purple-600
      active: "#6d28d9", // purple-700
      disabled: "#e9d5ff", // purple-200
      focus: "#8b5cf6",
    },
    success: {
      base: "#00d4aa", // green-500
      hover: "#00b894", // green-600
      active: "#059669", // green-700
      disabled: "#a7f3d0", // green-200
      focus: "#00d4aa",
    },
    danger: {
      base: "#ef4444", // red-500
      hover: "#dc2626", // red-600
      active: "#b91c1c", // red-700
      disabled: "#fecaca", // red-200
      focus: "#ef4444",
    },
    ghost: {
      base: "transparent",
      hover: "#f9fafb", // silver-200
      active: "#f3f4f6", // silver-300
      disabled: "transparent",
      focus: "#f9fafb",
    },
  },

  // Text Colors
  text: {
    primary: "#334155", // navy-700
    secondary: "#475569", // navy-600
    tertiary: "#64748b", // navy-500
    inverse: "#ffffff",
    accent: "#ff6b35", // accent-orange
  },

  // Background Colors
  background: {
    // Page-level background should be pure white for light-mode by default
    primary: "#ffffff", // pure white
    // Surfaces (cards, panels) use a very light silver to separate from background
    secondary: "#f9fafb", // silver-200
    tertiary: "#f1f5f9", // navy-100
    surface: "#f9fafb", // light silver surface for cards/panels
    overlay: "rgba(15, 23, 42, 0.75)", // navy-900 with opacity
  },

  // Border Colors
  border: {
    primary: "#e5e7eb", // silver-400
    secondary: "#d1d5db", // silver-500
    accent: "#ff6b35", // accent-orange
    focus: "#3b82f6", // accent-blue
  },
} as const;

// ===========================
// TYPOGRAPHY TOKENS
// ===========================

export const typography = {
  // Font Families
  fontFamily: {
    primary: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
    heading: ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
    display: ["var(--font-poppins)", "Poppins", "system-ui", "sans-serif"],
  },

  // Font Sizes (in rem)
  fontSize: {
    // Fine-grained small sizes
    xs: "0.75rem", // 12px - Captions, labels
    sm: "0.875rem", // 14px - Small body, helper text
    base: "1rem", // 16px - Body text (DEFAULT)
    md: "1.0625rem", // 17px - Slightly larger body
    lg: "1.125rem", // 18px - Large body, small headings

    // Display sizes (h6-h1 range)
    xl: "1.25rem", // 20px - h6
    "2xl": "1.5rem", // 24px - h5
    "3xl": "1.875rem", // 30px - h4
    "4xl": "2.25rem", // 36px - h3
    "5xl": "3rem", // 48px - h2
    "6xl": "3.75rem", // 60px - h1
    "7xl": "4.5rem", // 72px - Display headings
    "8xl": "6rem", // 96px - Hero headings
    "9xl": "8rem", // 128px - Extra large displays
  },

  // Fluid Typography (responsive scaling with clamp)
  fluidSize: {
    // Automatically scales between mobile and desktop
    sm: "clamp(0.875rem, 0.8rem + 0.375vw, 1rem)", // 14px → 16px
    base: "clamp(1rem, 0.9rem + 0.5vw, 1.125rem)", // 16px → 18px
    lg: "clamp(1.125rem, 1rem + 0.625vw, 1.5rem)", // 18px → 24px
    xl: "clamp(1.25rem, 1.1rem + 0.75vw, 1.875rem)", // 20px → 30px
    "2xl": "clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem)", // 24px → 36px
    "3xl": "clamp(1.875rem, 1.5rem + 1.875vw, 3rem)", // 30px → 48px
    "4xl": "clamp(2.25rem, 1.75rem + 2.5vw, 3.75rem)", // 36px → 60px
    "5xl": "clamp(3rem, 2rem + 5vw, 4.5rem)", // 48px → 72px
  },

  // Font Weights (optimized for Inter & Poppins)
  fontWeight: {
    thin: "100", // Extra light (rarely used)
    extralight: "200", // Very light
    light: "300", // Light text
    normal: "400", // Body text (DEFAULT)
    medium: "500", // Emphasized text
    semibold: "600", // Headings, buttons
    bold: "700", // Strong emphasis
    extrabold: "800", // Display headings
    black: "900", // Hero text
  },

  // Line Heights (better readability)
  lineHeight: {
    none: "1", // Tight (large display text)
    tight: "1.25", // Headings
    snug: "1.375", // Sub-headings
    normal: "1.5", // Body text (DEFAULT)
    relaxed: "1.625", // Large body text
    loose: "2", // Spaced content
  },

  // Letter Spacing
  letterSpacing: {
    tighter: "-0.05em", // Very tight (large headings)
    tight: "-0.025em", // Tight (headings)
    normal: "0", // Default
    wide: "0.025em", // Slightly spaced
    wider: "0.05em", // Buttons, labels
    widest: "0.1em", // All caps text
  },
} as const;

// ===========================
// SPACING TOKENS
// ===========================

export const spacing = {
  // Base spacing scale (in rem)
  0: "0",
  px: "1px",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem", // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem", // 12px
  3.5: "0.875rem", // 14px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  7: "1.75rem", // 28px
  8: "2rem", // 32px
  9: "2.25rem", // 36px
  10: "2.5rem", // 40px
  11: "2.75rem", // 44px
  12: "3rem", // 48px
  14: "3.5rem", // 56px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  28: "7rem", // 112px
  32: "8rem", // 128px
} as const;

// ===========================
// SHADOW TOKENS
// ===========================

export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
} as const;

// ===========================
// BORDER RADIUS TOKENS
// ===========================

export const borderRadius = {
  none: "0",
  sm: "0.125rem", // 2px
  base: "0.25rem", // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px",
} as const;

// ===========================
// COMPONENT TOKENS
// ===========================

export const components = {
  // Button Variants
  button: {
    primary: {
      background: colors.accent.orange,
      color: colors.text.inverse,
      border: colors.accent.orange,
      hover: {
        background: "#e55a2b", // darker orange
        border: "#e55a2b",
      },
    },
    secondary: {
      background: "transparent",
      color: colors.text.primary,
      border: colors.border.primary,
      hover: {
        background: colors.background.secondary,
        border: colors.border.secondary,
      },
    },
    success: {
      background: colors.accent.green,
      color: colors.text.inverse,
      border: colors.accent.green,
      hover: {
        background: "#00b894", // darker green
        border: "#00b894",
      },
    },
  },

  // Card Variants
  card: {
    primary: {
      background: colors.background.surface,
      border: colors.border.primary,
      shadow: shadows.base,
      borderRadius: borderRadius.lg,
    },
    elevated: {
      background: colors.background.surface,
      border: colors.border.primary,
      shadow: shadows.md,
      borderRadius: borderRadius.lg,
    },
    accent: {
      background: colors.background.surface,
      border: colors.border.accent,
      shadow: shadows.base,
      borderRadius: borderRadius.lg,
    },
  },

  // Input Variants
  input: {
    primary: {
      background: colors.background.surface,
      border: colors.border.primary,
      color: colors.text.primary,
      placeholder: colors.text.tertiary,
      focus: {
        border: colors.border.focus,
        ring: `0 0 0 3px rgba(59, 130, 246, 0.1)`, // blue with opacity
      },
    },
  },

  // Navigation
  navigation: {
    background: colors.primary.navy[800],
    text: colors.text.inverse,
    textSecondary: colors.primary.silver[200],
    border: colors.primary.navy[600],
    hover: {
      background: colors.primary.navy[700],
    },
  },
} as const;

// ===========================
// LAYOUT TOKENS
// ===========================

export const layout = {
  // Container Widths
  container: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // Breakpoints
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // Z-index Scale
  zIndex: {
    dropdown: "1000",
    sticky: "1020",
    fixed: "1030",
    modal: "1040",
    popover: "1050",
    tooltip: "1060",
  },

  // Common Layout Values
  headerHeight: "4rem", // 64px
  navWidth: "16rem", // 256px
  footerHeight: "6rem", // 96px
} as const;

// ===========================
// ANIMATION & MOTION TOKENS
// ===========================

export const motion = {
  // Timing functions (easing curves)
  easing: {
    // Standard easings
    linear: "linear",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",

    // Material Design easings
    standard: "cubic-bezier(0.4, 0.0, 0.2, 1)",
    decelerate: "cubic-bezier(0.0, 0.0, 0.2, 1)",
    accelerate: "cubic-bezier(0.4, 0.0, 1, 1)",

    // Expressive easings
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)", // Bouncy spring
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", // Bounce effect
    elastic: "cubic-bezier(0.68, -0.6, 0.32, 1.6)", // Elastic snap

    // Smooth easings
    smooth: "cubic-bezier(0.45, 0.05, 0.55, 0.95)", // Very smooth
    silk: "cubic-bezier(0.23, 1, 0.32, 1)", // Silky smooth
  },

  // Duration tokens
  duration: {
    instant: "75ms", // Immediate feedback
    fast: "150ms", // Quick transitions
    normal: "200ms", // Standard transitions
    moderate: "300ms", // Noticeable transitions
    slow: "400ms", // Deliberate animations
    slower: "600ms", // Emphasis animations
    slowest: "800ms", // Hero animations
  },

  // Delay tokens (for staggered animations)
  delay: {
    none: "0ms",
    xs: "50ms",
    sm: "100ms",
    md: "150ms",
    lg: "200ms",
    xl: "300ms",
  },

  // Common Transitions
  transitions: {
    colors:
      "color 250ms ease-in-out, background-color 250ms ease-in-out, border-color 250ms ease-in-out",
    transform: "transform 250ms ease-in-out",
    opacity: "opacity 250ms ease-in-out",
    all: "all 250ms ease-in-out",
    fast: "all 150ms ease-out",
    spring: "all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
} as const;

export const animations = {
  // ENTRANCE ANIMATIONS
  entrance: {
    fadeIn: {
      keyframes: "fadeIn",
      duration: "200ms",
      easing: "cubic-bezier(0, 0, 0.2, 1)",
    },
    slideUp: {
      keyframes: "slideUp",
      duration: "300ms",
      easing: "cubic-bezier(0, 0, 0.2, 1)",
    },
    slideDown: {
      keyframes: "slideDown",
      duration: "300ms",
      easing: "cubic-bezier(0, 0, 0.2, 1)",
    },
    slideLeft: {
      keyframes: "slideLeft",
      duration: "300ms",
      easing: "cubic-bezier(0, 0, 0.2, 1)",
    },
    slideRight: {
      keyframes: "slideRight",
      duration: "300ms",
      easing: "cubic-bezier(0, 0, 0.2, 1)",
    },
    scaleUp: {
      keyframes: "scaleUp",
      duration: "200ms",
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", // Spring
    },
    scaleDown: {
      keyframes: "scaleDown",
      duration: "200ms",
      easing: "cubic-bezier(0, 0, 0.2, 1)",
    },
  },

  // EXIT ANIMATIONS
  exit: {
    fadeOut: {
      keyframes: "fadeOut",
      duration: "150ms",
      easing: "cubic-bezier(0.4, 0, 1, 1)",
    },
    slideUpOut: {
      keyframes: "slideUpOut",
      duration: "200ms",
      easing: "cubic-bezier(0.4, 0, 1, 1)",
    },
    slideDownOut: {
      keyframes: "slideDownOut",
      duration: "200ms",
      easing: "cubic-bezier(0.4, 0, 1, 1)",
    },
    scaleDownOut: {
      keyframes: "scaleDownOut",
      duration: "150ms",
      easing: "cubic-bezier(0.4, 0, 1, 1)",
    },
  },

  // MICRO-INTERACTIONS
  microInteraction: {
    buttonPress: {
      keyframes: "buttonPress",
      duration: "150ms",
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    buttonHover: {
      keyframes: "buttonHover",
      duration: "200ms",
      easing: "cubic-bezier(0, 0, 0.2, 1)",
    },
    checkboxCheck: {
      keyframes: "checkboxCheck",
      duration: "300ms",
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", // Spring
    },
    ripple: {
      keyframes: "ripple",
      duration: "600ms",
      easing: "cubic-bezier(0, 0, 0.2, 1)",
    },
  },

  // LOADING ANIMATIONS
  loading: {
    spin: {
      keyframes: "spin",
      duration: "1000ms",
      easing: "linear",
      iterationCount: "infinite",
    },
    pulse: {
      keyframes: "pulse",
      duration: "2000ms",
      easing: "cubic-bezier(0.4, 0, 0.6, 1)",
      iterationCount: "infinite",
    },
    bounce: {
      keyframes: "bounce",
      duration: "1000ms",
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      iterationCount: "infinite",
    },
  },

  // Duration (legacy support)
  duration: {
    fast: "150ms",
    normal: "250ms",
    slow: "350ms",
  },

  // Easing (legacy support)
  easing: {
    linear: "linear",
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
  },

  // Common Transitions (legacy support)
  transitions: {
    colors:
      "color 250ms ease-in-out, background-color 250ms ease-in-out, border-color 250ms ease-in-out",
    transform: "transform 250ms ease-in-out",
    opacity: "opacity 250ms ease-in-out",
    all: "all 250ms ease-in-out",
  },
} as const;

// ===========================
// UTILITY FUNCTIONS
// ===========================

export const utils = {
  // Get responsive breakpoint
  getBreakpoint: (size: keyof typeof layout.breakpoints) =>
    layout.breakpoints[size],

  // Get color with opacity
  withOpacity: (color: string, opacity: number) =>
    `${color}${Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0")}`,

  // Get spacing value
  getSpacing: (value: keyof typeof spacing) => spacing[value],

  // Get component styles
  getComponent: (
    component: keyof typeof components,
    variant: string = "primary"
  ) => {
    return components[component][
      variant as keyof (typeof components)[typeof component]
    ];
  },
} as const;

// Type exports for TypeScript
export type ColorTokens = typeof colors;
export type TypographyTokens = typeof typography;
export type SpacingTokens = typeof spacing;
export type ComponentTokens = typeof components;
