# Design Tokens Documentation

Welcome to the LiteWork Design System! This guide explains how to use our comprehensive design tokens to maintain consistent styling across the application.

## 📁 File Structure

```
src/styles/
├── tokens.ts          # Core design tokens (colors, typography, spacing, etc.)
├── theme.ts           # Semantic theme system built on tokens
└── design-tokens.css  # CSS custom properties and utility classes
```

## 🎨 Using Design Tokens

### 1. CSS Custom Properties (Recommended)

Our design tokens are available as CSS custom properties for maximum flexibility:

```css
/* Colors */
.my-component {
  background-color: var(--color-accent-orange);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}

/* Spacing */
.my-container {
  padding: var(--spacing-4) var(--spacing-6);
  margin: var(--spacing-8) 0;
}

/* Typography */
.my-heading {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}
```

### 2. Utility Classes

Pre-built utility classes for common patterns:

```jsx
// Typography
<h1 className="text-heading-primary">Main Heading</h1>
<p className="text-body-secondary">Secondary text</p>
<small className="text-body-small">Small text</small>

// Buttons
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary Action</button>
<button className="btn-success">Success Action</button>

// Cards
<div className="card-primary">Basic card</div>
<div className="card-elevated">Elevated card</div>
<div className="card-stat">Stat card</div>

// Status Messages
<div className="status-success">Success message</div>
<div className="status-warning">Warning message</div>
<div className="status-error">Error message</div>
<div className="status-info">Info message</div>

// Layout
<div className="container-responsive">Responsive container</div>
<section className="section-spacing">Section with proper spacing</section>

// Backgrounds
<div className="bg-gradient-primary">Primary gradient</div>
<div className="bg-gradient-secondary">Secondary gradient</div>
```

### 3. TypeScript Tokens (For JavaScript/React)

Import tokens directly in your components:

```typescript
import { colors, typography, spacing } from '@/styles/tokens';
import theme from '@/styles/theme';

// Using individual tokens
const MyComponent = () => {
  const buttonStyle = {
    backgroundColor: colors.accent.orange,
    color: colors.text.inverse,
    padding: `${spacing[3]} ${spacing[6]}`,
    fontFamily: typography.fontFamily.primary.join(', '),
  };

  return <button style={buttonStyle}>Custom Button</button>;
};

// Using theme patterns
const MyCard = () => {
  return (
    <div style={theme.cards.primary}>
      Card content
    </div>
  );
};
```

## 🎯 Token Categories

### Colors

#### Primary Colors

- **Navy Scale**: `--color-navy-50` to `--color-navy-900`
- **Silver Scale**: `--color-silver-100` to `--color-silver-900`
- **Off White**: `--color-off-white`

#### Accent Colors (Workout Themed)

- **Orange** (`--color-accent-orange`): Strength/Energy
- **Green** (`--color-accent-green`): Progress/Success
- **Purple** (`--color-accent-purple`): Achievement/Premium
- **Pink** (`--color-accent-pink`): Motivation/Fun
- **Blue** (`--color-accent-blue`): Info/Schedule
- **Yellow** (`--color-accent-yellow`): Warning/Attention
- **Red** (`--color-accent-red`): High Intensity/Error

#### Semantic Colors

- **Text**: `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`
- **Background**: `--color-bg-primary`, `--color-bg-secondary`, `--color-bg-surface`
- **Border**: `--color-border-primary`, `--color-border-focus`, `--color-border-accent`

### Typography

#### Font Families

- **Primary**: `--font-family-primary` (Inter)
- **Heading**: `--font-family-heading` (Poppins)
- **Display**: `--font-family-display` (Poppins)

#### Font Sizes

- **Scale**: `--font-size-xs` (12px) to `--font-size-5xl` (48px)

#### Font Weights

- **Range**: `--font-weight-normal` (400) to `--font-weight-extrabold` (800)

### Spacing

#### Base Scale

- **Micro**: `--spacing-px`, `--spacing-0-5`, `--spacing-1`
- **Small**: `--spacing-2`, `--spacing-3`, `--spacing-4`
- **Medium**: `--spacing-5`, `--spacing-6`, `--spacing-8`
- **Large**: `--spacing-10`, `--spacing-12`, `--spacing-16`
- **Extra Large**: `--spacing-20`, `--spacing-24`, `--spacing-32`

### Shadows

#### Elevation Scale

- **Subtle**: `--shadow-sm`
- **Default**: `--shadow-base`
- **Medium**: `--shadow-md`
- **Large**: `--shadow-lg`
- **Extra Large**: `--shadow-xl`, `--shadow-2xl`

## 🎨 Workout-Specific Utilities

Special utility classes for workout app context:

```jsx
// Workout accent colors for icons/indicators
<span className="workout-accent-strength">💪</span>  {/* Orange */}
<span className="workout-accent-progress">📈</span>  {/* Green */}
<span className="workout-accent-achievement">🏆</span> {/* Purple */}
<span className="workout-accent-motivation">💖</span> {/* Pink */}
<span className="workout-accent-schedule">📅</span>  {/* Blue */}
<span className="workout-accent-warning">⚠️</span>   {/* Yellow */}
<span className="workout-accent-intensity">🔥</span> {/* Red */}
```

## 📱 Responsive Design

Our design tokens include mobile-first responsive utilities:

```css
/* Mobile-first approach */
@media (max-width: 640px) {
  .hide-mobile {
    display: none;
  }
}

@media (min-width: 641px) {
  .show-mobile {
    display: none;
  }
}
```

## ✨ Best Practices

### 1. Always Use Tokens

❌ **Don't**: Hard-code values

```css
.my-element {
  color: #ff6b35;
  padding: 12px 24px;
  font-size: 18px;
}
```

✅ **Do**: Use design tokens

```css
.my-element {
  color: var(--color-accent-orange);
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-lg);
}
```

### 2. Prefer Utility Classes

❌ **Don't**: Create custom CSS for common patterns

```jsx
<div
  style={{
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  }}
>
  Content
</div>
```

✅ **Do**: Use utility classes

```jsx
<div className="card-primary">Content</div>
```

### 3. Use Semantic Classes for Text

❌ **Don't**: Mix typography properties

```jsx
<h1 style={{ color: "#334155", fontFamily: "Poppins", fontWeight: 700 }}>
  Heading
</h1>
```

✅ **Do**: Use semantic text classes

```jsx
<h1 className="text-heading-primary">Heading</h1>
```

### 4. Consistent Button Styling

❌ **Don't**: Create custom button styles

```jsx
<button
  style={{ backgroundColor: "#ff6b35", color: "white", padding: "12px 24px" }}
>
  Click me
</button>
```

✅ **Do**: Use button utilities

```jsx
<button className="btn-primary">Click me</button>
```

## 🔧 Extending the Design System

### Adding New Tokens

1. **Update tokens.ts**: Add new values to the appropriate category
2. **Update design-tokens.css**: Add corresponding CSS custom properties
3. **Update theme.ts**: Create semantic mappings if needed
4. **Document usage**: Update this file with examples

### Creating New Utility Classes

1. **Add to design-tokens.css**: Create the utility class
2. **Use consistent naming**: Follow the established pattern
3. **Test responsive behavior**: Ensure mobile compatibility
4. **Document the class**: Add examples to this guide

## 🎯 Token Reference Quick Guide

### Common Color Tokens

- `--color-accent-orange` - Primary accent (strength/energy)
- `--color-accent-green` - Success/progress
- `--color-text-primary` - Main text color
- `--color-text-secondary` - Secondary text
- `--color-bg-surface` - Card/surface background
- `--color-border-primary` - Default borders

### Common Spacing Tokens

- `--spacing-2` (8px) - Small spacing
- `--spacing-4` (16px) - Medium spacing
- `--spacing-6` (24px) - Large spacing
- `--spacing-8` (32px) - Extra large spacing

### Common Typography Tokens

- `--font-family-primary` - Body text font
- `--font-family-heading` - Heading font
- `--font-size-base` (16px) - Default text size
- `--font-size-lg` (18px) - Large text
- `--font-size-2xl` (24px) - Heading size

## 🚀 Getting Started Checklist

- [ ] Import design tokens CSS in your layout
- [ ] Use utility classes for common patterns
- [ ] Apply semantic text classes to headings and body text
- [ ] Use button utilities instead of custom button styles
- [ ] Implement card utilities for containers
- [ ] Use status utilities for feedback messages
- [ ] Apply workout accent colors to icons and indicators
- [ ] Test responsive behavior on mobile devices

Remember: Consistency is key! Always use design tokens to maintain a cohesive user experience across the entire application.
