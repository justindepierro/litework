# Border & Shadow Design System - Complete Guide

**Created**: November 15, 2025  
**Updated**: November 15, 2025 (Shadow-Only Standard)  
**Status**: Implemented and Enforced

## 🎯 Design Philosophy

**LiteWork uses modern, clean card design with shadows for depth, NOT borders.**

### Core Principle

> Cards and containers achieve visual hierarchy through shadows. Borders are reserved for functional purposes only (form inputs, dividers, semantic indicators).

This creates a cleaner, more modern interface while maintaining clear visual hierarchy.

---

## 🎨 Shadow-Only Cards (MANDATORY)

### The Standard

```tsx
// ✅ CORRECT - Shadow-only cards
<div className="bg-white rounded-lg shadow-sm p-4">
<div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
<div className="bg-white rounded-xl shadow-md p-6">

// ❌ FORBIDDEN - Cards with borders
<div className="bg-white rounded-lg border border-gray-300 p-4">
<div className="bg-white rounded-lg border border-DEFAULT p-4">
<div className="bg-white rounded-lg border p-4">
```

### Shadow Scale

| Shadow Class | Elevation   | Use Case                     |
| ------------ | ----------- | ---------------------------- |
| `shadow-sm`  | Subtle      | Default cards, panels        |
| `shadow-md`  | Medium      | Elevated sections, dropdowns |
| `shadow-lg`  | Strong      | Popovers, tooltips           |
| `shadow-xl`  | Very Strong | Important modals             |
| `shadow-2xl` | Maximum     | Primary modals, overlays     |

### Interactive Shadows

```tsx
// Standard hover effect
className = "shadow-sm hover:shadow-md transition-shadow duration-200";

// Enhanced hover with scale
className =
  "shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200";

// Active/pressed state
className = "shadow-sm active:shadow-none";
```

---

## 🚫 When Borders ARE Allowed

Borders have specific, functional purposes only:

### 1. Form Inputs (FUNCTIONAL)

```tsx
// Input fields need borders for usability
<Input className="border-2 border-DEFAULT focus:border-focus" />
<Textarea className="border-2 border-DEFAULT focus:border-focus" />
<Select className="border-2 border-DEFAULT focus:border-focus" />
```

### 2. Section Dividers (STRUCTURE)

```tsx
// Dividing sections within a page
<div className="border-t border-subtle my-6" />
<div className="border-b border-subtle pb-4" />
```

### 3. Semantic Indicators (MEANING)

```tsx
// Colored borders that convey meaning
<div className="border-l-4 border-error bg-error-light p-4">
  Error message
</div>

<div className="border border-success bg-success-light p-3">
  Success notification
</div>
```

### 4. Table Cells (STRUCTURE)

```tsx
<td className="border-b border-subtle py-2">Cell content</td>
```

### ❌ NEVER Use Borders For:

- Cards
- Panels
- Containers
- Modals
- Dashboard widgets
- Navigation elements (use dividers instead)

---

## 📏 Border Width Standards (When Used)

| Class      | Width | Use Case                              |
| ---------- | ----- | ------------------------------------- |
| `border`   | 1px   | Dividers, table cells                 |
| `border-2` | 2px   | **DEFAULT** for inputs                |
| `border-3` | 3px   | Heavy emphasis (rare)                 |
| `border-4` | 4px   | Semantic indicators (left/right bars) |

---

## 🎨 Border Color Standards (When Used)

### Design Token Approach

```tsx
// ✅ CORRECT - Using design tokens
className = "border-DEFAULT"; // Default borders
className = "border-subtle"; // Very light dividers
className = "border-strong"; // Emphasized borders
className = "border-focus"; // Focus states (blue)
className = "border-error"; // Error states (red)
className = "border-success"; // Success states (green)
className = "border-warning"; // Warning states (amber)
className = "border-accent"; // Brand accent (orange)
```

### Color Usage Matrix

| Token            | Hex     | Use Case        | Example            |
| ---------------- | ------- | --------------- | ------------------ |
| `border-DEFAULT` | #e5e7eb | Input borders   | Form fields        |
| `border-subtle`  | #f3f4f6 | Light dividers  | Section separators |
| `border-strong`  | #94a3b8 | Emphasized      | Active table rows  |
| `border-accent`  | #ff6b35 | Brand highlight | Selected inputs    |
| `border-focus`   | #3b82f6 | Focus rings     | Input focus states |
| `border-error`   | #ef4444 | Error states    | Validation errors  |
| `border-success` | #00d4aa | Success states  | Completed items    |
| `border-warning` | #f59e0b | Warning states  | Caution indicators |

---

## 📐 Border Radius Standards

| Class          | Size   | Use Case                      |
| -------------- | ------ | ----------------------------- |
| `rounded-sm`   | 6px    | Small buttons, badges         |
| `rounded-md`   | 8px    | **DEFAULT** - Inputs, buttons |
| `rounded-lg`   | 12px   | Cards, panels                 |
| `rounded-xl`   | 16px   | Large cards                   |
| `rounded-2xl`  | 24px   | Modals, overlays              |
| `rounded-full` | 9999px | Circles, pills                |

---

## 🔧 Component Patterns

### Card Component (Shadow-Only)

```tsx
// ✅ CORRECT - Modern shadow-only design
<div className="bg-white rounded-lg shadow-sm p-4">
  <h3>Card Title</h3>
</div>

// ❌ WRONG
<div className="bg-white rounded-xl border-2 border-silver-400 shadow-md p-4">
  <h3>Card Title</h3>
</div>
```

### Input Component

```tsx
// ✅ CORRECT
<input
  className="
    border-2
    border-DEFAULT
    focus:border-focus
    rounded-md
    px-4 py-2
  "
/>

// ❌ WRONG
<input
  className="
    border
    border-silver-400
    focus:border-blue-500
    rounded-lg
    px-4 py-2
  "
/>
```

### Button with Border (Secondary)

```tsx
// ✅ CORRECT
<button className="
  bg-white
  border-2
  border-strong
  hover:border-accent
  rounded-md
  px-4 py-2
">
  Click Me
</button>

// ❌ WRONG
<button className="
  bg-white
  border
  border-silver-500
  hover:border-orange-500
  rounded-lg
  px-4 py-2
">
  Click Me
</button>
```

### Interactive Card

```tsx
// ✅ CORRECT - Hover shadow enhancement
<div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4">
  <h3>Clickable Card</h3>
</div>

// ❌ WRONG - Using borders
<div className="bg-white rounded-lg border border-DEFAULT hover:border-accent shadow-sm p-4">
  <h3>Clickable Card</h3>
</div>
```

### Modal (Shadow-Only)

```tsx
// ✅ CORRECT - Maximum shadow, no border
<div className="bg-white rounded-2xl shadow-2xl max-w-2xl">
  <ModalHeader />
  <ModalContent />
  <ModalFooter />
</div>

// ❌ WRONG - Using borders
<div className="bg-white rounded-xl shadow-xl max-w-2xl border border-silver-300">
  <ModalHeader />
  <ModalContent />
  <ModalFooter />
</div>
```

---

## 🎨 Interactive State Patterns

### Hover States

```tsx
// Cards
className = "border border-DEFAULT hover:border-strong";

// Buttons with borders
className = "border-2 border-strong hover:border-accent";
```

### Focus States

```tsx
// Inputs
className="
  border-2
  border-DEFAULT
  focus:border-focus
  focus:ring-4
  focus:ring-focus/20
"

// Interactive elements
className="
  focus-visible:ring-2
  focus-visible:ring-focus
  focus-visible:ring-offset-2
"
```

### Active/Selected States

```tsx
// List items
className={`
  border-2
  ${isSelected ? 'border-accent' : 'border-DEFAULT'}
`}

// Tabs
className={`
  border-b-3
  ${isActive ? 'border-accent' : 'border-transparent'}
`}
```

### Error States

```tsx
// Form inputs
className={`
  border-2
  ${hasError ? 'border-error' : 'border-DEFAULT'}
  focus:border-${hasError ? 'error' : 'focus'}
`}
```

---

## 🚫 Migration from Old Patterns

### Common Anti-Patterns to Fix

| ❌ OLD (Wrong)                 | ✅ NEW (Correct)                   |
| ------------------------------ | ---------------------------------- |
| `border border-silver-300`     | `border border-DEFAULT`            |
| `border-2 border-silver-400`   | `border-2 border-strong`           |
| `border border-navy-600`       | `border border-strong`             |
| `rounded-xl border` on cards   | `rounded-lg border border-DEFAULT` |
| `border-blue-500` for focus    | `border-focus`                     |
| `border-green-600` for success | `border-success`                   |
| `border-red-500` for errors    | `border-error`                     |
| `border-4` (random usage)      | `border-2` or `border-3`           |

### Search & Replace Patterns

Use these patterns to find and fix inconsistencies:

```bash
# Find incorrect border colors
grep -r "border-silver-[0-9]" src/
grep -r "border-navy-[0-9]" src/
grep -r "border-blue-[0-9]" src/
grep -r "border-green-[0-9]" src/

# Find incorrect border widths
grep -r "border-4" src/
grep -r "border-8" src/
```

---

## 📋 Code Review Checklist

Before merging any component:

- [ ] No hardcoded color borders (`border-gray-300`, `border-blue-500`, etc.)
- [ ] Using design token borders (`border-DEFAULT`, `border-focus`, etc.)
- [ ] Appropriate border width (`border`, `border-2`, `border-3`)
- [ ] Consistent radius for component type
- [ ] Interactive states use proper token transitions
- [ ] Focus states include proper ring with token colors
- [ ] Error states use `border-error`
- [ ] Success states use `border-success`

---

## 🎯 Design Tokens Reference

All borders use CSS custom properties from `/src/styles/tokens.css`:

```css
/* Border Colors */
--border-default: #e5e7eb;
--border-subtle: #f3f4f6;
--border-strong: #94a3b8;
--border-accent: #ff6b35;
--border-focus: #3b82f6;
--border-error: #ef4444;
--border-success: #00d4aa;
--border-warning: #f59e0b;

/* Border Widths */
--border-width-default: 1px;
--border-width-medium: 2px;
--border-width-thick: 3px;

/* Border Radius */
--radius-sm: 0.375rem; /* 6px */
--radius-md: 0.5rem; /* 8px - Default */
--radius-lg: 0.75rem; /* 12px */
--radius-xl: 1rem; /* 16px */
--radius-2xl: 1.5rem; /* 24px */
--radius-full: 9999px;
```

---

## 🔄 Enforcement

This standard is **MANDATORY** for:

- ✅ All new components
- ✅ All component updates
- ✅ All bug fixes touching UI

**No exceptions without documented justification.**

---

## 📚 Related Documentation

- `/docs/guides/COMPONENT_USAGE_STANDARDS.md` - Component patterns
- `/src/styles/tokens.css` - Design token definitions
- `/tailwind.config.ts` - Tailwind configuration
