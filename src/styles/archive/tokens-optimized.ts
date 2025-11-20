/**
 * OPTIMIZED Design Tokens System
 * Performance-focused token architecture with automatic CSS variable generation
 */

// ===================
// CORE TOKEN SYSTEM
// ===================

export const coreTokens = {
  // Optimized color palette
  colors: {
    // Navy scale (reduced to essentials)
    navy: {
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      500: "#64748b",
      600: "#475569",
      700: "#334155", // Primary navy
      800: "#1e293b",
    },
    // Silver scale
    silver: {
      100: "#ffffff",
      200: "#f9fafb",
      300: "#f3f4f6",
      400: "#e5e7eb", // Primary silver
      500: "#d1d5db",
    },
    // Accent colors (core only)
    accent: {
      orange: "#ff6b35", // Primary accent
      green: "#00d4aa",
      blue: "#3b82f6",
      red: "#ef4444",
      yellow: "#fbbf24",
    },
  },

  // Optimized spacing scale
  spacing: {
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    5: "1.25rem", // 20px
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    10: "2.5rem", // 40px
    12: "3rem", // 48px
    16: "4rem", // 64px
  },

  // Typography
  typography: {
    family: {
      base: '"Inter", system-ui, sans-serif',
      heading: '"Poppins", system-ui, sans-serif',
    },
    size: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
    },
    weight: {
      normal: "400",
      medium: "600",
      bold: "700",
    },
  },

  // Effects
  effects: {
    shadow: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)",
    },
    radius: {
      sm: "0.125rem",
      base: "0.25rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
      full: "9999px",
    },
    transition: {
      fast: "all 150ms ease-in-out",
      base: "all 250ms ease-in-out",
    },
  },

  // Layout
  layout: {
    header: "4rem",
    nav: "16rem",
    container: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
  },
} as const;

// ===================
// SEMANTIC TOKEN SYSTEM
// ===================

export const semanticTokens = {
  // Text semantics
  text: {
    primary: coreTokens.colors.navy[700],
    secondary: coreTokens.colors.navy[600],
    tertiary: coreTokens.colors.navy[500],
    inverse: coreTokens.colors.silver[100],
    accent: coreTokens.colors.accent.orange,
  },

  // Background semantics
  background: {
    primary: coreTokens.colors.silver[100],
    secondary: coreTokens.colors.silver[200],
    tertiary: coreTokens.colors.silver[300],
    surface: coreTokens.colors.silver[200],
  },

  // Border semantics
  border: {
    primary: coreTokens.colors.silver[400],
    secondary: coreTokens.colors.silver[500],
    focus: coreTokens.colors.accent.blue,
  },

  // State semantics
  state: {
    success: coreTokens.colors.accent.green,
    error: coreTokens.colors.accent.red,
    warning: coreTokens.colors.accent.yellow,
    info: coreTokens.colors.accent.blue,
  },

  // Workout-specific semantics
  workout: {
    strength: coreTokens.colors.accent.orange,
    progress: coreTokens.colors.accent.green,
    intensity: coreTokens.colors.accent.red,
    schedule: coreTokens.colors.accent.blue,
    warning: coreTokens.colors.accent.yellow,
  },
} as const;

// ===================
// CSS VARIABLE GENERATOR
// ===================

/**
 * Generates CSS custom properties from tokens
 * Optimized for performance and minimal output
 */
export function generateCSSVariables(): string {
  const cssVars: string[] = [":root {"];

  // Core colors with short names
  Object.entries(coreTokens.colors.navy).forEach(([key, value]) => {
    cssVars.push(`  --navy-${key}: ${value};`);
  });

  Object.entries(coreTokens.colors.silver).forEach(([key, value]) => {
    cssVars.push(`  --silver-${key}: ${value};`);
  });

  Object.entries(coreTokens.colors.accent).forEach(([key, value]) => {
    cssVars.push(`  --${key}: ${value};`);
  });

  // Semantic tokens
  Object.entries(semanticTokens.text).forEach(([key, value]) => {
    cssVars.push(`  --text-${key}: ${value};`);
  });

  Object.entries(semanticTokens.background).forEach(([key, value]) => {
    cssVars.push(`  --bg-${key}: ${value};`);
  });

  Object.entries(semanticTokens.border).forEach(([key, value]) => {
    cssVars.push(`  --border-${key}: ${value};`);
  });

  Object.entries(semanticTokens.state).forEach(([key, value]) => {
    cssVars.push(`  --${key}: ${value};`);
  });

  // Spacing with short names
  Object.entries(coreTokens.spacing).forEach(([key, value]) => {
    cssVars.push(`  --s-${key}: ${value};`);
  });

  // Typography
  Object.entries(coreTokens.typography.family).forEach(([key, value]) => {
    cssVars.push(`  --font-${key}: ${value};`);
  });

  Object.entries(coreTokens.typography.size).forEach(([key, value]) => {
    cssVars.push(`  --text-${key}: ${value};`);
  });

  Object.entries(coreTokens.typography.weight).forEach(([key, value]) => {
    cssVars.push(`  --weight-${key}: ${value};`);
  });

  // Effects
  Object.entries(coreTokens.effects.shadow).forEach(([key, value]) => {
    cssVars.push(`  --shadow-${key}: ${value};`);
  });

  Object.entries(coreTokens.effects.radius).forEach(([key, value]) => {
    cssVars.push(`  --radius-${key}: ${value};`);
  });

  Object.entries(coreTokens.effects.transition).forEach(([key, value]) => {
    cssVars.push(`  --transition-${key}: ${value};`);
  });

  // Layout
  cssVars.push(`  --header-h: ${coreTokens.layout.header};`);
  cssVars.push(`  --nav-w: ${coreTokens.layout.nav};`);

  Object.entries(coreTokens.layout.container).forEach(([key, value]) => {
    cssVars.push(`  --container-${key}: ${value};`);
  });

  cssVars.push("}");
  return cssVars.join("\n");
}

// ===================
// COMPONENT RECIPES
// ===================

/**
 * Pre-built component styles using tokens
 * High-performance alternatives to utility classes
 */
export const componentStyles = {
  button: {
    primary: {
      background: "var(--orange)",
      color: "var(--text-inverse)",
      border: "1px solid var(--orange)",
      borderRadius: "var(--radius-md)",
      padding: "var(--s-3) var(--s-6)",
      fontWeight: "var(--weight-medium)",
      transition: "var(--transition-fast)",
      boxShadow: "var(--shadow-sm)",
      "&:hover": {
        background: "#e55a2b",
        boxShadow: "var(--shadow-md)",
        transform: "translateY(-1px)",
      },
    },
    secondary: {
      background: "transparent",
      color: "var(--text-primary)",
      border: "1px solid var(--border-primary)",
      borderRadius: "var(--radius-md)",
      padding: "var(--s-3) var(--s-6)",
      fontWeight: "var(--weight-medium)",
      transition: "var(--transition-fast)",
      "&:hover": {
        background: "var(--bg-secondary)",
        borderColor: "var(--border-secondary)",
      },
    },
  },

  card: {
    base: {
      background: "var(--bg-surface)",
      border: "1px solid var(--border-primary)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-base)",
      padding: "var(--s-6)",
      transition: "var(--transition-base)",
      "&:hover": {
        boxShadow: "var(--shadow-md)",
        transform: "translateY(-2px)",
      },
    },
  },

  input: {
    base: {
      border: "1px solid var(--border-primary)",
      borderRadius: "var(--radius-md)",
      padding: "var(--s-3) var(--s-4)",
      fontSize: "var(--text-base)",
      transition: "var(--transition-fast)",
      "&:focus": {
        outline: "none",
        borderColor: "var(--border-focus)",
        boxShadow: "0 0 0 3px rgb(59 130 246 / 0.1)",
      },
    },
  },

  status: {
    success: {
      background: "rgb(0 212 170 / 0.1)",
      color: "var(--success)",
      border: "1px solid var(--success)",
      borderRadius: "var(--radius-base)",
      padding: "var(--s-2) var(--s-3)",
    },
    error: {
      background: "rgb(239 68 68 / 0.1)",
      color: "var(--error)",
      border: "1px solid var(--error)",
      borderRadius: "var(--radius-base)",
      padding: "var(--s-2) var(--s-3)",
    },
    warning: {
      background: "rgb(251 191 36 / 0.1)",
      color: "var(--warning)",
      border: "1px solid var(--warning)",
      borderRadius: "var(--radius-base)",
      padding: "var(--s-2) var(--s-3)",
    },
  },
} as const;

// ===================
// UTILITIES
// ===================

/**
 * Utility functions for working with tokens
 */
export const tokenUtils = {
  // Get CSS variable reference
  cssVar: (path: string) => `var(--${path})`,

  // Get token value by path
  getToken: (path: string) => {
    const keys = path.split(".");
    let value: unknown = { core: coreTokens, semantic: semanticTokens };

    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }

    return value;
  },

  // Generate responsive breakpoint
  breakpoint: (size: keyof typeof coreTokens.layout.container) =>
    `@media (min-width: ${coreTokens.layout.container[size]})`,

  // Generate mobile-first media query
  mobile: (maxWidth = "640px") => `@media (max-width: ${maxWidth})`,

  // Generate touch device query
  touch: () => "@media (hover: none) and (pointer: coarse)",

  // Generate PWA standalone query
  pwa: () => "@media (display-mode: standalone)",
};

// ===================
// TYPE EXPORTS
// ===================

export type CoreTokens = typeof coreTokens;
export type SemanticTokens = typeof semanticTokens;
export type ComponentStyles = typeof componentStyles;

// Default export for convenience
const optimizedTokens = {
  core: coreTokens,
  semantic: semanticTokens,
  components: componentStyles,
  utils: tokenUtils,
  generateCSS: generateCSSVariables,
};

export default optimizedTokens;
