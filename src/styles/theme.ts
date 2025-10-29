/**
 * Theme System for LiteWork Workout Tracker
 * Provides semantic design system built on design tokens
 */

import {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  layout,
  animations,
} from "./tokens";

// ===========================
// SEMANTIC COLOR SYSTEM
// ===========================

export const theme = {
  // Page Backgrounds
  backgrounds: {
    page: {
      primary: `linear-gradient(135deg, ${colors.primary.silver[200]} 0%, ${colors.primary.silver[100]} 50%, ${colors.primary.navy[100]} 100%)`,
      secondary: `linear-gradient(135deg, ${colors.primary.navy[100]} 0%, ${colors.primary.offWhite} 50%, ${colors.primary.silver[200]} 100%)`,
      dark: `linear-gradient(135deg, ${colors.primary.navy[800]} 0%, ${colors.primary.navy[700]} 100%)`,
    },
    surface: colors.background.surface,
    overlay: colors.background.overlay,
  },

  // Text Hierarchy
  text: {
    // Headings
    heading: {
      primary: {
        color: colors.text.primary,
        fontFamily: typography.fontFamily.heading.join(", "),
        fontWeight: typography.fontWeight.bold,
        lineHeight: typography.lineHeight.tight,
      },
      secondary: {
        color: colors.text.secondary,
        fontFamily: typography.fontFamily.heading.join(", "),
        fontWeight: typography.fontWeight.semibold,
        lineHeight: typography.lineHeight.tight,
      },
      accent: {
        color: colors.text.accent,
        fontFamily: typography.fontFamily.heading.join(", "),
        fontWeight: typography.fontWeight.bold,
        lineHeight: typography.lineHeight.tight,
      },
    },

    // Body Text
    body: {
      primary: {
        color: colors.text.primary,
        fontFamily: typography.fontFamily.primary.join(", "),
        fontWeight: typography.fontWeight.normal,
        lineHeight: typography.lineHeight.normal,
      },
      secondary: {
        color: colors.text.secondary,
        fontFamily: typography.fontFamily.primary.join(", "),
        fontWeight: typography.fontWeight.normal,
        lineHeight: typography.lineHeight.normal,
      },
      small: {
        color: colors.text.tertiary,
        fontFamily: typography.fontFamily.primary.join(", "),
        fontWeight: typography.fontWeight.normal,
        lineHeight: typography.lineHeight.normal,
        fontSize: typography.fontSize.sm,
      },
    },

    // Navigation Text
    navigation: {
      primary: {
        color: colors.text.inverse,
        fontFamily: typography.fontFamily.primary.join(", "),
        fontWeight: typography.fontWeight.medium,
      },
      secondary: {
        color: colors.primary.silver[200],
        fontFamily: typography.fontFamily.primary.join(", "),
        fontWeight: typography.fontWeight.normal,
      },
    },
  },

  // Interactive Elements
  interactive: {
    // Buttons
    buttons: {
      primary: {
        background: colors.accent.orange,
        color: colors.text.inverse,
        border: `1px solid ${colors.accent.orange}`,
        borderRadius: borderRadius.md,
        padding: `${spacing[3]} ${spacing[6]}`,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        transition: animations.transitions.all,
        shadow: shadows.sm,
        hover: {
          background: "#e55a2b",
          transform: "translateY(-1px)",
          shadow: shadows.md,
        },
        active: {
          transform: "translateY(0)",
        },
        disabled: {
          background: colors.primary.silver[400],
          color: colors.text.tertiary,
          cursor: "not-allowed",
        },
      },

      secondary: {
        background: "transparent",
        color: colors.text.primary,
        border: `1px solid ${colors.border.primary}`,
        borderRadius: borderRadius.md,
        padding: `${spacing[3]} ${spacing[6]}`,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        transition: animations.transitions.all,
        hover: {
          background: colors.background.secondary,
          borderColor: colors.border.secondary,
        },
      },

      success: {
        background: colors.accent.green,
        color: colors.text.inverse,
        border: `1px solid ${colors.accent.green}`,
        borderRadius: borderRadius.md,
        padding: `${spacing[3]} ${spacing[6]}`,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        transition: animations.transitions.all,
        shadow: shadows.sm,
        hover: {
          background: "#00b894",
          transform: "translateY(-1px)",
          shadow: shadows.md,
        },
      },

      accent: {
        background: colors.accent.purple,
        color: colors.text.inverse,
        border: `1px solid ${colors.accent.purple}`,
        borderRadius: borderRadius.md,
        padding: `${spacing[3]} ${spacing[6]}`,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        transition: animations.transitions.all,
        shadow: shadows.sm,
        hover: {
          background: "#7c3aed",
          transform: "translateY(-1px)",
          shadow: shadows.md,
        },
      },
    },

    // Form Inputs
    inputs: {
      primary: {
        background: colors.background.surface,
        color: colors.text.primary,
        border: `1px solid ${colors.border.primary}`,
        borderRadius: borderRadius.md,
        padding: `${spacing[3]} ${spacing[4]}`,
        fontSize: typography.fontSize.base,
        transition: animations.transitions.colors,
        placeholder: colors.text.tertiary,
        focus: {
          borderColor: colors.border.focus,
          outline: "none",
          ring: `0 0 0 3px rgba(59, 130, 246, 0.1)`,
        },
      },
    },

    // Links
    links: {
      primary: {
        color: colors.accent.blue,
        textDecoration: "none",
        fontWeight: typography.fontWeight.medium,
        transition: animations.transitions.colors,
        hover: {
          color: "#2563eb",
          textDecoration: "underline",
        },
      },

      navigation: {
        color: colors.text.inverse,
        textDecoration: "none",
        fontWeight: typography.fontWeight.medium,
        transition: animations.transitions.all,
        hover: {
          color: colors.accent.orange,
        },
      },
    },
  },

  // Card Components
  cards: {
    primary: {
      background: colors.background.surface,
      border: `1px solid ${colors.border.primary}`,
      borderRadius: borderRadius.lg,
      shadow: shadows.base,
      padding: spacing[6],
      transition: animations.transitions.all,
      hover: {
        shadow: shadows.md,
        transform: "translateY(-2px)",
      },
    },

    elevated: {
      background: colors.background.surface,
      border: `1px solid ${colors.border.primary}`,
      borderRadius: borderRadius.lg,
      shadow: shadows.lg,
      padding: spacing[6],
      transition: animations.transitions.all,
    },

    accent: {
      background: colors.background.surface,
      border: `2px solid ${colors.border.accent}`,
      borderRadius: borderRadius.lg,
      shadow: shadows.base,
      padding: spacing[6],
      transition: animations.transitions.all,
      hover: {
        shadow: shadows.md,
        transform: "translateY(-2px)",
      },
    },

    stat: {
      background: colors.background.surface,
      border: `1px solid ${colors.border.primary}`,
      borderRadius: borderRadius.lg,
      shadow: shadows.sm,
      padding: spacing[5],
      transition: animations.transitions.all,
      hover: {
        shadow: shadows.md,
      },
    },
  },

  // Navigation Components
  navigation: {
    header: {
      background: colors.primary.navy[800],
      borderBottom: `1px solid ${colors.primary.navy[600]}`,
      height: layout.headerHeight,
      padding: `0 ${spacing[6]}`,
      shadow: shadows.sm,
    },

    mobile: {
      background: colors.primary.navy[800],
      border: `1px solid ${colors.primary.navy[600]}`,
      borderRadius: borderRadius.lg,
    },

    item: {
      padding: `${spacing[2]} ${spacing[4]}`,
      borderRadius: borderRadius.md,
      transition: animations.transitions.all,
      hover: {
        background: colors.primary.navy[700],
      },
      active: {
        background: colors.primary.navy[600],
        color: colors.accent.orange,
      },
    },
  },

  // Layout
  layout: {
    container: {
      maxWidth: layout.container.xl,
      margin: "0 auto",
      padding: `0 ${spacing[4]}`,
    },

    section: {
      padding: `${spacing[12]} 0`,
    },

    grid: {
      gap: spacing[6],
    },
  },

  // Status & Feedback
  status: {
    success: {
      background: `rgba(0, 212, 170, 0.1)`,
      color: colors.semantic.success,
      border: `1px solid ${colors.semantic.success}`,
      borderRadius: borderRadius.md,
      padding: `${spacing[3]} ${spacing[4]}`,
    },

    warning: {
      background: `rgba(251, 191, 36, 0.1)`,
      color: colors.semantic.warning,
      border: `1px solid ${colors.semantic.warning}`,
      borderRadius: borderRadius.md,
      padding: `${spacing[3]} ${spacing[4]}`,
    },

    error: {
      background: `rgba(239, 68, 68, 0.1)`,
      color: colors.semantic.error,
      border: `1px solid ${colors.semantic.error}`,
      borderRadius: borderRadius.md,
      padding: `${spacing[3]} ${spacing[4]}`,
    },

    info: {
      background: `rgba(59, 130, 246, 0.1)`,
      color: colors.semantic.info,
      border: `1px solid ${colors.semantic.info}`,
      borderRadius: borderRadius.md,
      padding: `${spacing[3]} ${spacing[4]}`,
    },
  },

  // Workout Specific
  workout: {
    accent: {
      strength: colors.accent.orange,
      progress: colors.accent.green,
      achievement: colors.accent.purple,
      motivation: colors.accent.pink,
      schedule: colors.accent.blue,
      warning: colors.accent.yellow,
      intensity: colors.accent.red,
    },

    progressBar: {
      background: colors.primary.silver[300],
      fill: colors.accent.green,
      height: spacing[2],
      borderRadius: borderRadius.full,
    },

    statCard: {
      background: colors.background.surface,
      border: `1px solid ${colors.border.primary}`,
      borderRadius: borderRadius.lg,
      shadow: shadows.sm,
      padding: spacing[5],
      transition: animations.transitions.all,
      hover: {
        shadow: shadows.md,
      },
    },
  },
} as const;

// ===========================
// UTILITY CLASSES GENERATOR
// ===========================

export const generateUtilityClasses = () => {
  return {
    // Text utilities
    ".text-heading-primary": theme.text.heading.primary,
    ".text-heading-secondary": theme.text.heading.secondary,
    ".text-heading-accent": theme.text.heading.accent,
    ".text-body-primary": theme.text.body.primary,
    ".text-body-secondary": theme.text.body.secondary,
    ".text-body-small": theme.text.body.small,

    // Button utilities
    ".btn-primary": theme.interactive.buttons.primary,
    ".btn-secondary": theme.interactive.buttons.secondary,
    ".btn-success": theme.interactive.buttons.success,
    ".btn-accent": theme.interactive.buttons.accent,

    // Card utilities
    ".card-primary": theme.cards.primary,
    ".card-elevated": theme.cards.elevated,
    ".card-accent": theme.cards.accent,
    ".card-stat": theme.cards.stat,

    // Status utilities
    ".status-success": theme.status.success,
    ".status-warning": theme.status.warning,
    ".status-error": theme.status.error,
    ".status-info": theme.status.info,
  };
};

// ===========================
// RESPONSIVE UTILITIES
// ===========================

const breakpoints = {
  mobile: `@media (max-width: ${layout.breakpoints.sm})`,
  tablet: `@media (min-width: ${layout.breakpoints.sm}) and (max-width: ${layout.breakpoints.lg})`,
  desktop: `@media (min-width: ${layout.breakpoints.lg})`,
};

export const responsive = {
  // Breakpoint utilities
  ...breakpoints,

  // Common responsive patterns
  hideOnMobile: {
    [breakpoints.mobile]: {
      display: "none",
    },
  },

  showOnMobile: {
    display: "none",
    [breakpoints.mobile]: {
      display: "block",
    },
  },
};

// Type exports
export type Theme = typeof theme;
export type ThemeColors = typeof theme;

export default theme;
