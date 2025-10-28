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
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      DEFAULT: '#334155',
    },
    silver: {
      100: '#ffffff',
      200: '#f9fafb',
      300: '#f3f4f6',
      400: '#e5e7eb',
      500: '#d1d5db',
      600: '#9ca3af',
      700: '#6b7280',
      800: '#4b5563',
      900: '#374151',
      DEFAULT: '#e5e7eb',
    },
    offWhite: '#fefefe',
  },

  // Accent Colors for Energy & Motivation
  accent: {
    orange: '#ff6b35',   // Energy/Strength
    green: '#00d4aa',    // Success/Progress
    purple: '#8b5cf6',   // Premium/Achievement
    pink: '#ec4899',     // Fun/Motivation
    yellow: '#fbbf24',   // Warning/Attention
    red: '#ef4444',      // Alert/High Intensity
    blue: '#3b82f6',     // Info/Cool Down
  },

  // Semantic Colors
  semantic: {
    success: '#00d4aa',
    warning: '#fbbf24',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Text Colors
  text: {
    primary: '#334155',      // navy-700
    secondary: '#475569',    // navy-600
    tertiary: '#64748b',     // navy-500
    inverse: '#ffffff',
    accent: '#ff6b35',       // accent-orange
  },

  // Background Colors
  background: {
    primary: '#fefefe',      // off-white
    secondary: '#f9fafb',    // silver-200
    tertiary: '#f1f5f9',     // navy-100
    surface: '#ffffff',      // pure white
    overlay: 'rgba(15, 23, 42, 0.75)', // navy-900 with opacity
  },

  // Border Colors
  border: {
    primary: '#e5e7eb',      // silver-400
    secondary: '#d1d5db',    // silver-500
    accent: '#ff6b35',       // accent-orange
    focus: '#3b82f6',        // accent-blue
  },
} as const;

// ===========================
// TYPOGRAPHY TOKENS
// ===========================

export const typography = {
  // Font Families
  fontFamily: {
    primary: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
    heading: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
    display: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
  },

  // Font Sizes (in rem)
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },

  // Font Weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Line Heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },

  // Letter Spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
} as const;

// ===========================
// SPACING TOKENS
// ===========================

export const spacing = {
  // Base spacing scale (in rem)
  0: '0',
  px: '1px',
  0.5: '0.125rem',    // 2px
  1: '0.25rem',       // 4px
  1.5: '0.375rem',    // 6px
  2: '0.5rem',        // 8px
  2.5: '0.625rem',    // 10px
  3: '0.75rem',       // 12px
  3.5: '0.875rem',    // 14px
  4: '1rem',          // 16px
  5: '1.25rem',       // 20px
  6: '1.5rem',        // 24px
  7: '1.75rem',       // 28px
  8: '2rem',          // 32px
  9: '2.25rem',       // 36px
  10: '2.5rem',       // 40px
  11: '2.75rem',      // 44px
  12: '3rem',         // 48px
  14: '3.5rem',       // 56px
  16: '4rem',         // 64px
  20: '5rem',         // 80px
  24: '6rem',         // 96px
  28: '7rem',         // 112px
  32: '8rem',         // 128px
} as const;

// ===========================
// SHADOW TOKENS
// ===========================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

// ===========================
// BORDER RADIUS TOKENS
// ===========================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',     // 2px
  base: '0.25rem',    // 4px
  md: '0.375rem',     // 6px
  lg: '0.5rem',       // 8px
  xl: '0.75rem',      // 12px
  '2xl': '1rem',      // 16px
  '3xl': '1.5rem',    // 24px
  full: '9999px',
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
        background: '#e55a2b', // darker orange
        border: '#e55a2b',
      },
    },
    secondary: {
      background: 'transparent',
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
        background: '#00b894', // darker green
        border: '#00b894',
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
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-index Scale
  zIndex: {
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modal: '1040',
    popover: '1050',
    tooltip: '1060',
  },

  // Common Layout Values
  headerHeight: '4rem',       // 64px
  navWidth: '16rem',          // 256px
  footerHeight: '6rem',       // 96px
} as const;

// ===========================
// ANIMATION TOKENS
// ===========================

export const animations = {
  // Duration
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },

  // Easing
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },

  // Common Transitions
  transitions: {
    colors: 'color 250ms ease-in-out, background-color 250ms ease-in-out, border-color 250ms ease-in-out',
    transform: 'transform 250ms ease-in-out',
    opacity: 'opacity 250ms ease-in-out',
    all: 'all 250ms ease-in-out',
  },
} as const;

// ===========================
// UTILITY FUNCTIONS
// ===========================

export const utils = {
  // Get responsive breakpoint
  getBreakpoint: (size: keyof typeof layout.breakpoints) => layout.breakpoints[size],
  
  // Get color with opacity
  withOpacity: (color: string, opacity: number) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
  
  // Get spacing value
  getSpacing: (value: keyof typeof spacing) => spacing[value],
  
  // Get component styles
  getComponent: (component: keyof typeof components, variant: string = 'primary') => {
    return components[component][variant as keyof typeof components[typeof component]];
  },
} as const;

// Type exports for TypeScript
export type ColorTokens = typeof colors;
export type TypographyTokens = typeof typography;
export type SpacingTokens = typeof spacing;
export type ComponentTokens = typeof components;