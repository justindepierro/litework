# Centralized Design System - Single Source of Truth

## Overview

This document explains how LiteWork's gradient design system works with **centralized color management**. All gradient colors are defined in ONE place, making it easy to update the entire application's color scheme.

## 🎯 Key Benefits

1. **Change Colors Once**: Update all gradients site-wide by editing CSS custom properties
2. **Consistent Design**: Same gradient patterns across modals, pages, and components
3. **Type-Safe**: TypeScript interfaces ensure correct usage
4. **Maintainable**: No hardcoded colors scattered throughout the codebase
5. **Flexible**: Multiple gradient variants for different contexts

## 🏗️ Architecture

### 1. Design Tokens (Source of Truth)

**File**: `src/styles/tokens.css`

All color values are defined as CSS custom properties:

```css
:root {
  /* Accent Colors */
  --accent-orange-500: #ff6b35;
  --accent-purple-500: #8b5cf6;
  --accent-green-500: #00d4aa;
  --accent-pink-500: #ec4899;
  --accent-blue-500: #3b82f6;

  /* Plus 50, 100, 200, 300, 400, 600, 700, 800, 900 shades for each */
}
```

**To change colors site-wide**: Edit these values in `tokens.css`

### 2. Gradient Utilities (Implementation Layer)

**File**: `src/app/globals.css`

Gradient classes that reference the design tokens:

```css
/* Vertical gradient bars (page accents) */
.bg-gradient-accent-primary {
  background: linear-gradient(
    to bottom,
    var(--accent-orange-500),
    var(--accent-purple-500),
    var(--accent-green-500)
  );
}

/* Horizontal gradient headers (modal/card headers) */
.bg-gradient-header-secondary {
  background: linear-gradient(
    to right,
    var(--accent-orange-500),
    var(--accent-purple-500),
    var(--accent-pink-500)
  );
}

/* Subtle backgrounds (cards/sections) */
.bg-gradient-subtle-primary {
  background: linear-gradient(
    135deg,
    var(--accent-orange-50),
    var(--accent-purple-50),
    var(--accent-green-50)
  );
}
```

### 3. Reusable Components (Application Layer)

**File**: `src/components/ui/PageHeader.tsx`

React component that uses the gradient utilities:

```tsx
<PageHeader
  title="Dashboard"
  subtitle="Your workout overview"
  icon={<LayoutDashboard />}
  gradientVariant="primary" // Uses .bg-gradient-accent-primary
  actions={<Button>Add Workout</Button>}
/>
```

## 📚 Available Gradient Variants

### Primary Gradient (Default)

**Colors**: Orange → Purple → Green  
**Best For**: Main pages, primary actions  
**Classes**:

- `.bg-gradient-accent-primary` (vertical bar)
- `.bg-gradient-header-primary` (horizontal header)
- `.bg-gradient-subtle-primary` (subtle background)

### Secondary Gradient

**Colors**: Orange → Purple → Pink  
**Best For**: Modals, special features  
**Classes**:

- `.bg-gradient-accent-secondary`
- `.bg-gradient-header-secondary` (currently used in all modals)
- `.bg-gradient-subtle-secondary`

### Tertiary Gradient

**Colors**: Blue → Purple → Pink  
**Best For**: Alternative sections, variations  
**Classes**:

- `.bg-gradient-accent-tertiary`
- `.bg-gradient-header-tertiary`

## 🚀 Usage Examples

### 1. Page Headers (Recommended Pattern)

```tsx
import { PageHeader } from "@/components/ui/PageHeader";
import { LayoutDashboard } from "lucide-react";

function DashboardPage() {
  return (
    <div className="container">
      <PageHeader
        title="Dashboard"
        subtitle="Your workout overview and statistics"
        icon={<LayoutDashboard className="w-6 h-6" />}
        gradientVariant="primary"
        actions={<Button variant="primary">Add Workout</Button>}
      />

      {/* Page content */}
    </div>
  );
}
```

**Result**:

- Thin vertical gradient bar on left (desktop only)
- Clean typography with icon
- Optional action buttons on right
- Fully responsive (centered on mobile, left-aligned on desktop)

### 2. Modal Headers (Automatic)

```tsx
import { ModalBackdrop, ModalHeader } from "@/components/ui/Modal";
import { Send } from "lucide-react";

function MyModal({ isOpen, onClose }) {
  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white sm:rounded-xl sm:max-w-2xl">
        <ModalHeader title="Send Message" icon={<Send />} onClose={onClose} />
        {/* Modal content */}
      </div>
    </ModalBackdrop>
  );
}
```

**Result**:

- Full gradient header background (uses `.bg-gradient-header-secondary`)
- White text and icons
- Consistent with all other modals

### 3. Custom Gradient Usage

If you need a gradient outside of PageHeader/Modal:

```tsx
// Vertical accent bar
<div className="relative">
  <div className="absolute -left-4 top-0 bottom-0 w-1.5 rounded-full bg-gradient-accent-primary" />
  <h1>Section Title</h1>
</div>

// Horizontal header
<div className="bg-gradient-header-primary p-6 rounded-t-xl">
  <h2 className="!text-white">Card Header</h2>
</div>

// Subtle background
<div className="bg-gradient-subtle-secondary p-4 rounded-lg">
  <p>Info message with subtle gradient background</p>
</div>
```

## 🎨 Changing Colors Site-Wide

### Option 1: Change Existing Colors

Edit `src/styles/tokens.css`:

```css
:root {
  /* Change orange to red */
  --accent-orange-500: #ef4444; /* was #ff6b35 */

  /* Change purple to indigo */
  --accent-purple-500: #6366f1; /* was #8b5cf6 */

  /* Change green to teal */
  --accent-green-500: #14b8a6; /* was #00d4aa */
}
```

**Result**: All gradients across the entire app update automatically! ✨

### Option 2: Swap Gradient Variants

Change which gradient is used where by editing components:

```tsx
// Change page headers from primary to tertiary
<PageHeader gradientVariant="tertiary" />; // Was "primary"

// Change modals from secondary to primary
// Edit Modal.tsx line 204:
className = "bg-gradient-header-primary"; // Was "bg-gradient-header-secondary"
```

### Option 3: Create New Gradient Variant

Add to `src/app/globals.css`:

```css
/* New quaternary gradient: Red → Yellow → Orange */
.bg-gradient-accent-quaternary {
  background: linear-gradient(
    to bottom,
    #ef4444,
    /* red-500 */ #eab308,
    /* yellow-500 */ #f97316 /* orange-500 */
  );
}

.bg-gradient-header-quaternary {
  background: linear-gradient(to right, #ef4444, #eab308, #f97316);
}
```

Use it:

```tsx
<PageHeader gradientVariant="quaternary" />
```

## 📏 Design Token Reference

### Color Token Structure

```
--accent-{color}-{shade}
```

**Colors**: `orange`, `purple`, `green`, `pink`, `blue`  
**Shades**: `50`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`

**Examples**:

- `--accent-orange-500`: Primary orange
- `--accent-purple-50`: Very light purple (for subtle backgrounds)
- `--accent-green-900`: Very dark green

### Gradient Class Structure

```
.bg-gradient-{type}-{variant}
```

**Types**:

- `accent`: Thin vertical bars (1-2px wide)
- `header`: Full horizontal backgrounds
- `subtle`: Light diagonal backgrounds

**Variants**:

- `primary`: Orange → Purple → Green
- `secondary`: Orange → Purple → Pink
- `tertiary`: Blue → Purple → Pink

## 🔧 Maintenance

### Adding a New Page

1. Import PageHeader component
2. Add to your page
3. Choose gradient variant
4. Done! Colors are centralized.

```tsx
import { PageHeader } from "@/components/ui/PageHeader";

export default function NewPage() {
  return (
    <div className="container py-6">
      <PageHeader
        title="New Feature"
        subtitle="Description"
        gradientVariant="primary"
      />
      {/* content */}
    </div>
  );
}
```

### Updating All Gradients

1. Open `src/styles/tokens.css`
2. Find the accent colors (lines ~48-95)
3. Update the `--accent-{color}-500` values
4. Save file
5. All gradients update automatically! 🎉

### Consistency Checklist

✅ All page headers use `<PageHeader>` component  
✅ All modals use `<ModalHeader>` component  
✅ No hardcoded `from-orange-500 via-purple-500` classes  
✅ All gradients reference design tokens  
✅ Custom gradients use utility classes from globals.css

## 🎯 Best Practices

### DO ✅

```tsx
// Use PageHeader component
<PageHeader title="Dashboard" gradientVariant="primary" />

// Use gradient utility classes
<div className="bg-gradient-accent-primary" />

// Reference design tokens in custom CSS
background: linear-gradient(to right, var(--accent-orange-500), var(--accent-purple-500));
```

### DON'T ❌

```tsx
// Don't hardcode gradient colors
<div className="bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500" />

// Don't use hex colors directly
<div style={{ background: 'linear-gradient(to right, #ff6b35, #8b5cf6)' }} />

// Don't duplicate gradient logic
// (Use PageHeader instead of recreating the pattern)
```

## 🔍 Real-World Example

### Before (Hardcoded, Scattered)

```tsx
// Page 1
<div className="bg-gradient-to-b from-orange-500 via-purple-500 to-green-500" />

// Page 2
<div className="bg-gradient-to-r from-orange-500 to-purple-500" />

// Page 3
<div style={{ background: 'linear-gradient(#ff6b35, #8b5cf6, #00d4aa)' }} />
```

**Problem**: To change colors, you must edit 50+ files! 😱

### After (Centralized)

```tsx
// Page 1
<PageHeader gradientVariant="primary" />

// Page 2
<div className="bg-gradient-header-primary" />

// Page 3
<div className="bg-gradient-accent-primary" />
```

**Solution**: To change colors, edit ONE file (`tokens.css`)! 🎉

## 📊 Migration Guide

### Converting Existing Components

**Old Pattern**:

```tsx
<div className="relative">
  <div className="absolute -left-4 top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-500 via-purple-500 to-green-500 rounded-full" />
  <h1 className="text-3xl font-bold">Dashboard</h1>
  <p className="text-gray-600">Welcome back</p>
</div>
```

**New Pattern**:

```tsx
<PageHeader
  title="Dashboard"
  subtitle="Welcome back"
  gradientVariant="primary"
/>
```

**Benefits**:

- ✅ 8 lines → 4 lines (50% reduction)
- ✅ Centralized colors
- ✅ Responsive built-in
- ✅ Consistent spacing
- ✅ Type-safe props

## 🚨 Common Pitfalls

### Pitfall 1: Using Tailwind Gradient Classes

```tsx
❌ <div className="bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500" />
✅ <div className="bg-gradient-header-secondary" />
```

**Why**: Tailwind classes can't reference CSS custom properties dynamically.

### Pitfall 2: Inline Styles with Hex Codes

```tsx
❌ <div style={{ background: 'linear-gradient(#ff6b35, #8b5cf6)' }} />
✅ <div className="bg-gradient-accent-primary" />
```

**Why**: Inline styles bypass the design token system.

### Pitfall 3: Duplicating PageHeader Logic

```tsx
❌ // Recreating PageHeader structure manually in every page
✅ <PageHeader title="..." subtitle="..." />
```

**Why**: Defeats the purpose of having a centralized component.

## 📈 Future Enhancements

### Dark Mode Support

```css
/* tokens.css */
:root {
  --accent-orange-500: #ff6b35;
}

@media (prefers-color-scheme: dark) {
  :root {
    --accent-orange-500: #ff8c5a; /* Lighter for dark backgrounds */
  }
}
```

### Theme Switching

```tsx
// Add data-theme attribute support
<html data-theme="sport-red">

/* tokens.css */
[data-theme="sport-red"] {
  --accent-orange-500: #ef4444;
  --accent-purple-500: #dc2626;
  --accent-green-500: #f59e0b;
}
```

### Animation Support

```css
.bg-gradient-accent-primary {
  background: linear-gradient(
    to bottom,
    var(--accent-orange-500),
    var(--accent-purple-500),
    var(--accent-green-500)
  );
  background-size: 100% 200%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%,
  100% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 0% 100%;
  }
}
```

## 🎓 Summary

### The Three-Layer System

1. **Design Tokens** (`tokens.css`) → Define color values
2. **Gradient Utilities** (`globals.css`) → Create gradient patterns
3. **Components** (`PageHeader.tsx`, `Modal.tsx`) → Apply gradients

### Single Source of Truth

```
tokens.css (ONE FILE)
    ↓
globals.css (gradient classes)
    ↓
Components (PageHeader, Modal, etc.)
    ↓
ALL PAGES & FEATURES
```

**Change colors ONCE in `tokens.css` → Updates propagate everywhere! ✨**

## 📞 Quick Reference

| Need                      | Use                                        |
| ------------------------- | ------------------------------------------ |
| Page header with gradient | `<PageHeader gradientVariant="primary" />` |
| Modal header (automatic)  | `<ModalHeader title="..." />`              |
| Custom vertical bar       | `className="bg-gradient-accent-primary"`   |
| Custom horizontal header  | `className="bg-gradient-header-secondary"` |
| Subtle card background    | `className="bg-gradient-subtle-primary"`   |
| Change colors site-wide   | Edit `src/styles/tokens.css`               |
| Add new gradient variant  | Add to `src/app/globals.css`               |

---

**Last Updated**: November 14, 2025  
**Version**: 1.0.0  
**Maintained By**: LiteWork Development Team
