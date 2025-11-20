# Design System Guide - Single Source of Truth

**LiteWork Workout Tracker**  
**Version**: 2.0  
**Last Updated**: November 20, 2025

---

## Overview

LiteWork now has a **unified design system** with a single source of truth for all design tokens. This guide explains how to use and maintain the system.

## 🎯 Key Principles

1. **One File to Rule Them All**: `design-tokens-unified.css` contains ALL tokens
2. **Type-Safe JavaScript**: Auto-generated `tokens.ts` for programmatic access
3. **Tailwind Integration**: All tokens available as utility classes
4. **No Duplication**: If you need a new token, add it to the unified file

---

## File Structure

```
src/styles/
├── design-tokens-unified.css ⭐ SINGLE SOURCE OF TRUTH
│   └── All design tokens (colors, typography, spacing, etc.)
│
├── tokens.ts ⭐ AUTO-GENERATED (do not edit manually)
│   └── TypeScript object for runtime access
│
├── utilities.css
│   └── Helper classes and utilities
│
├── celebrations.css
│   └── Confetti and celebration animations
│
└── archive/ 📦
    └── Old token files (deprecated, kept for reference)
```

---

## Token Categories

### 1. Colors (350+ tokens)

#### Primitive Colors

- **Navy** (50-900): Primary neutral color scale
- **Silver** (100-900): Background and border colors
- **Off-white**: Clean white background

#### Accent Colors (50-950 scales with OKLCH)

- **Orange** - Energy/Strength (brand primary)
- **Green** - Success/Progress
- **Purple** - Premium/Achievement
- **Pink** - Fun/Motivation
- **Amber** - Warning (WCAG AA compliant)
- **Red** - Alert/High Intensity
- **Blue** - Info/Cool Down
- **Cyan** - Tech/Modern
- **Lime** - Fresh/Active
- **Indigo** - Focus/Clarity

#### Semantic Colors

```css
/* Success states */
--color-success-lightest
--color-success-lighter
--color-success-light
--color-success
--color-success-dark
--color-success-darker
--color-success-darkest

/* Warning, Error, Info, Neutral (same pattern) */
```

#### Interactive States

```css
/* Primary (Orange) */
--color-interactive-primary-base
--color-interactive-primary-hover
--color-interactive-primary-active
--color-interactive-primary-disabled
--color-interactive-primary-focus

/* Secondary, Success, Danger, Ghost (same pattern) */
```

### 2. Typography (50+ tokens)

#### Font Families

```css
--font-family-primary:
  "Inter", sans-serif --font-family-heading: "Poppins",
  sans-serif --font-family-display: "Poppins", sans-serif;
```

#### Font Sizes (Fixed)

```css
--font-size-xs     /* 12px */
--font-size-sm     /* 14px */
--font-size-base   /* 16px */
--font-size-md     /* 17px */
--font-size-lg     /* 18px */
--font-size-xl     /* 20px */
--font-size-2xl    /* 24px */
--font-size-3xl    /* 30px */
/* ... up to 9xl (128px) */
```

#### Fluid Font Sizes (Viewport-Responsive)

```css
--font-size-fluid-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem)
  --font-size-fluid-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem)
  --font-size-fluid-lg: clamp(1.125rem, 1rem + 0.625vw, 1.5rem)
  /* ... up to fluid-5xl */;
```

#### Font Weights

```css
--font-weight-thin: 100 --font-weight-extralight: 200 /* ... up to black: 900 */;
```

#### Line Heights & Letter Spacing

```css
--line-height-tight: 1.25 --line-height-normal: 1.5 --line-height-loose: 2
  --letter-spacing-tight: -0.025em --letter-spacing-wide: 0.025em;
```

### 3. Spacing (40+ tokens)

#### Fixed Spacing

```css
--spacing-0: 0 --spacing-px: 1px --spacing-1: 0.25rem /* 4px */
  --spacing-2: 0.5rem /* 8px */ --spacing-4: 1rem /* 16px */ --spacing-8: 2rem
  /* 32px */ /* ... up to spacing-32 (8rem) */;
```

#### Fluid Spacing (Viewport-Responsive)

```css
--space-fluid-xs: clamp(0.25rem, 0.2rem + 0.25vw, 0.375rem) /* 4px -> 6px */
  --space-fluid-sm: clamp(0.5rem, 0.42rem + 0.4vw, 0.75rem) /* 8px -> 12px */
  --space-fluid-md: clamp(1rem, 0.8rem + 1vw, 1.5rem) /* 16px -> 24px */
  --space-fluid-lg: clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem) /* 24px -> 36px */
  --space-fluid-xl: clamp(2rem, 1.6rem + 2vw, 3rem) /* 32px -> 48px */
  --space-fluid-2xl: clamp(3rem, 2.4rem + 3vw, 4.5rem) /* 48px -> 72px */
  --space-fluid-3xl: clamp(4rem, 3.2rem + 4vw, 6rem) /* 64px -> 96px */;
```

#### Container Query Spacing

```css
--space-container-xs: 1cqw --space-container-sm: 2cqw --space-container-md: 4cqw
  --space-container-lg: 6cqw --space-container-xl: 8cqw;
```

### 4. Shadows & Elevation

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05) --shadow-base --shadow-md
  --shadow-lg --shadow-xl --shadow-2xl --shadow-inner --elevation-0 through
  --elevation-4;
```

### 5. Border Radius

```css
--radius-none: 0 --radius-sm: 0.125rem --radius-base: 0.25rem
  --radius-md: 0.375rem --radius-lg: 0.5rem --radius-xl: 0.75rem
  --radius-2xl: 1rem --radius-3xl: 1.5rem --radius-full: 9999px;
```

### 6. Animation & Motion (50+ tokens)

#### Duration

```css
--duration-instant: 75ms --duration-fast: 150ms --duration-normal: 200ms
  --duration-moderate: 300ms --duration-slow: 400ms --duration-slower: 600ms
  --duration-slowest: 800ms;
```

#### Delay (for staggered animations)

```css
--delay-none: 0ms --delay-xs: 50ms --delay-sm: 100ms --delay-md: 150ms
  --delay-lg: 200ms --delay-xl: 300ms;
```

#### Easing Curves

```css
/* Material Design */
--easing-standard: cubic-bezier(0.4, 0, 0.2, 1)
  --easing-decelerate: cubic-bezier(0, 0, 0.2, 1)
  --easing-accelerate: cubic-bezier(0.4, 0, 1, 1) /* Expressive */
  --easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1)
  --easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
  --easing-elastic: cubic-bezier(0.68, -0.6, 0.32, 1.6) /* Smooth */
  --easing-smooth: cubic-bezier(0.45, 0.05, 0.55, 0.95)
  --easing-silk: cubic-bezier(0.23, 1, 0.32, 1);
```

#### Transition Presets

```css
--transition-fast:
  all 150ms var(--easing-ease-out) --transition-normal: all 200ms
    var(--easing-ease-out) --transition-slow: all 300ms var(--easing-ease-out)
    --transition-spring: all 300ms var(--easing-spring) --transition-silk: all
    400ms var(--easing-silk) --transition-colors: color 200ms,
  background-color 200ms,
  border-color 200ms --transition-transform: transform 200ms
    var(--easing-ease-out) --transition-opacity: opacity 200ms
    var(--easing-ease-out);
```

#### Physics-Based Motion

```css
--motion-spring-bouncy: cubic-bezier(0.68, -0.6, 0.32, 1.6)
  --motion-spring-tight: cubic-bezier(0.25, 1, 0.5, 1);
```

### 7. Glass Materials

```css
--material-glass-thin: rgba(255, 255, 255, 0.4)
  --material-glass-regular: rgba(255, 255, 255, 0.65)
  --material-glass-thick: rgba(255, 255, 255, 0.85)
  --material-glass-blur-sm: 4px --material-glass-blur-md: 12px
  --material-glass-blur-lg: 20px
  --material-glass-border: rgba(255, 255, 255, 0.5);
```

**Utility Classes:**

```css
.glass-thin
.glass
.glass-thick
```

### 8. Layout Tokens

```css
--container-sm: 640px --container-md: 768px --container-lg: 1024px
  --container-xl: 1280px --container-2xl: 1536px --layout-header-height: 4rem
  --layout-nav-width: 16rem --layout-footer-height: 6rem;
```

### 9. Component Tokens

#### Gradients

```css
--bg-gradient-primary
--bg-gradient-secondary
--bg-gradient-dark
--page-gradient-energetic
```

#### Energy Surfaces (Workout-Specific)

```css
--surface-strength-bg
--surface-strength-foreground
--surface-strength-ring

--surface-recovery-bg
--surface-speed-bg
--surface-mobility-bg
--surface-focus-bg
```

### 10. Z-Index Scale

```css
--z-dropdown: 1000 --z-sticky: 1020 --z-fixed: 1030 --z-modal-backdrop: 1040
  --z-modal: 1050 --z-popover: 1060 --z-tooltip: 1070;
```

---

## Usage Patterns

### 1. Using Tailwind Utility Classes (Preferred)

```tsx
// ✅ RECOMMENDED - Use Tailwind classes
<div className="bg-accent-orange-500 text-white p-4 rounded-lg shadow-md">
  <h2 className="text-2xl font-bold">Hello World</h2>
</div>

// Available patterns:
// - bg-{color}-{shade}
// - text-{color}-{shade}
// - border-{color}-{shade}
// - rounded-{size}
// - shadow-{size}
// - p-{size}, m-{size}, gap-{size}
```

### 2. Using CSS Variables Directly

```tsx
// ✅ For inline styles or complex scenarios
<div
  style={{
    background: "var(--color-accent-orange-500)",
    padding: "var(--spacing-4)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-md)",
  }}
>
  Content
</div>
```

### 3. Using TypeScript Tokens Object

```tsx
import { tokens } from "@/styles/tokens";

// ✅ For programmatic/dynamic access
function ColorSwatch({ colorName }) {
  const shades = tokens.color.accent[colorName];

  return (
    <div>
      {Object.entries(shades).map(([shade, value]) => (
        <div key={shade} style={{ background: value }}>
          {shade}
        </div>
      ))}
    </div>
  );
}
```

### 4. Using in CSS Modules

```css
/* component.module.css */
.myComponent {
  background: var(--color-bg-surface);
  padding: var(--spacing-6);
  border-radius: var(--radius-xl);
  transition: var(--transition-normal);
}

.myComponent:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

---

## Adding New Tokens

### Step 1: Add to design-tokens-unified.css

```css
/* Add to appropriate section */
:root {
  /* Example: New brand color */
  --color-brand-teal: #14b8a6;
  --color-brand-teal-light: #5eead4;
  --color-brand-teal-dark: #0f766e;
}
```

### Step 2: Regenerate TypeScript Tokens

```bash
npm run generate:tokens
```

This auto-updates `src/styles/tokens.ts` with your new tokens.

### Step 3: Add to Tailwind Config (if needed for utilities)

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      brand: {
        teal: 'var(--color-brand-teal)',
        'teal-light': 'var(--color-brand-teal-light)',
        'teal-dark': 'var(--color-brand-teal-dark)',
      }
    }
  }
}
```

### Step 4: Use It!

```tsx
// As Tailwind class
<div className="bg-brand-teal text-white">

// As CSS variable
<div style={{ background: 'var(--color-brand-teal)' }}>

// As TypeScript token
import { tokens } from '@/styles/tokens';
const tealColor = tokens.color.brand.teal;
```

---

## Best Practices

### ✅ DO

- **Use Tailwind utilities** for 90% of cases
- **Use semantic tokens** (`--color-success`, not `--color-green-500`)
- **Use fluid spacing** for responsive layouts
- **Use transition presets** for consistency
- **Add new tokens** to the unified file
- **Regenerate tokens.ts** after adding CSS tokens

### ❌ DON'T

- **Don't hardcode colors** (no `#ff6b35` in components)
- **Don't duplicate tokens** across multiple files
- **Don't edit tokens.ts manually** (it's auto-generated)
- **Don't create new token files** (add to unified file)
- **Don't use raw color names** in component code

---

## Migration from Old System

If you see old imports in code:

```typescript
// ❌ OLD - These files are deprecated
import { tokens } from "@/styles/tokens-optimized";
import "./tokens/primitives/colors.css";

// ✅ NEW - Use these instead
import { tokens } from "@/styles/tokens";
// CSS is automatically imported via globals.css
```

---

## Design System Page

Visit `/design-system` in the app to see:

- All accent colors with 50-950 scales
- Typography scale with fluid sizes
- Glass materials with live examples
- Fluid spacing visualization
- Physics-based motion demos

The page auto-generates swatches from `tokens.ts`, ensuring docs stay in sync with code.

---

## Maintenance

### Adding a New Accent Color

1. Add full 50-950 scale to `design-tokens-unified.css`:

```css
--color-accent-emerald-50: #ecfdf5;
--color-accent-emerald-100: #d1fae5;
/* ... through 950 */
--color-accent-emerald: #10b981; /* DEFAULT */
```

2. Regenerate: `npm run generate:tokens`

3. Add to Tailwind config colors

4. Use: `className="bg-accent-emerald-500"`

### Changing Brand Colors

Edit the CSS variables in `design-tokens-unified.css`:

```css
/* Change from orange to blue as primary */
--color-accent-orange: oklch(68.4% 0.216 36.9); /* OLD */
--color-accent-orange: oklch(62.5% 0.196 240.5); /* NEW - Blue */
```

Regenerate tokens and rebuild. All components update automatically!

### Testing Changes

```bash
# 1. Regenerate tokens
npm run generate:tokens

# 2. Type check
npm run typecheck

# 3. Build
npm run build

# 4. Visual test
npm run dev
# Visit /design-system to verify
```

---

## Troubleshooting

### Tokens not showing up in autocomplete

1. Ensure `tokens.ts` is up to date: `npm run generate:tokens`
2. Restart TypeScript server in VS Code: Cmd+Shift+P → "Restart TS Server"

### Styles not applying

1. Check browser DevTools → Computed styles
2. Verify CSS variable exists: Search in `design-tokens-unified.css`
3. Check Tailwind is generating the class (may need `safelist` in config)

### Build fails with "Cannot find color"

1. Ensure color exists in `design-tokens-unified.css`
2. Run `npm run generate:tokens`
3. Check Tailwind config references correct CSS variables

---

## Resources

- **Main Token File**: `src/styles/design-tokens-unified.css`
- **Generated Types**: `src/styles/tokens.ts`
- **Tailwind Config**: `tailwind.config.ts`
- **Generator Script**: `scripts/dev/generate-tokens.mjs`
- **Design System Page**: `/design-system` route
- **Audit Report**: `docs/reports/DESIGN_SYSTEM_AUDIT_2025.md`

---

## Quick Reference

### Most Used Tokens

```css
/* Colors */
--color-accent-orange (brand primary)
--color-success
--color-error
--color-text-primary
--color-bg-surface

/* Spacing */
--spacing-4 (1rem / 16px)
--spacing-6 (1.5rem / 24px)
--space-fluid-md (responsive 16px->24px)

/* Typography */
--font-size-base (16px)
--font-size-lg (18px)
--font-weight-semibold (600)

/* Effects */
--shadow-md
--radius-lg
--transition-normal
```

### Most Used Tailwind Classes

```
bg-accent-orange-500
text-white
p-4 px-6 py-3
rounded-lg
shadow-md
hover:shadow-lg
transition-all
```

---

**End of Guide**
