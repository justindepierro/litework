# Quick Reference: Making UI Changes in LiteWork

## TL;DR

Use **standard Tailwind color names** directly in className. No configuration needed.

## Color Changes

### Adding Gradients

```tsx
// Background gradients
<div className="bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">

// Text gradients
<h1 className="bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">

// Button gradients
<button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
```

### Standard Colors

| Use Case     | Color  | Classes                          |
| ------------ | ------ | -------------------------------- |
| Energy/Brand | Orange | `orange-50` through `orange-900` |
| Success      | Green  | `green-50` through `green-900`   |
| Premium      | Purple | `purple-50` through `purple-900` |
| Fun/Accent   | Pink   | `pink-50` through `pink-900`     |
| Info/Trust   | Blue   | `blue-50` through `blue-900`     |

### Common Patterns

```tsx
// Subtle backgrounds
className = "bg-orange-50";

// Bold backgrounds
className = "bg-orange-500";

// Text colors
className = "text-orange-700";

// Borders
className = "border-orange-300";

// Hover states
className = "hover:bg-orange-100 hover:border-orange-400";
```

## Layout Changes

### Spacing

```tsx
// Padding
className = "p-4 sm:p-6 lg:p-8"; // Responsive padding

// Margins
className = "mb-4 sm:mb-6 lg:mb-8"; // Responsive margins

// Gaps (for flex/grid)
className = "gap-3 sm:gap-4 lg:gap-6";
```

### Responsive Design

```tsx
// Mobile-first approach
className="
  w-full           // Mobile: full width
  md:w-1/2         // Tablet: half width
  lg:w-1/3         // Desktop: third width
"

// Grid layouts
className="
  grid
  grid-cols-1      // Mobile: 1 column
  sm:grid-cols-2   // Tablet: 2 columns
  lg:grid-cols-4   // Desktop: 4 columns
  gap-4
"
```

## Typography Changes

```tsx
// Headings
className = "text-2xl sm:text-3xl lg:text-4xl font-bold";

// Body text
className = "text-sm sm:text-base lg:text-lg";

// Font weights
className = "font-normal"; // 400
className = "font-medium"; // 500
className = "font-semibold"; // 600
className = "font-bold"; // 700
```

## Component Styling

### Cards

```tsx
// Basic card
className = "bg-white rounded-lg shadow-sm border border-gray-200 p-4";

// Elevated card
className = "bg-white rounded-xl shadow-md border border-gray-100 p-6";

// Interactive card
className =
  "bg-white rounded-lg shadow-sm hover:shadow-md hover:border-orange-300 transition-all cursor-pointer";

// Gradient card
className =
  "bg-gradient-to-br from-white to-orange-50/30 rounded-lg shadow-sm border border-orange-100";
```

### Buttons

```tsx
// Primary
className =
  "px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-sm";

// Secondary
className =
  "px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50";

// Gradient
className =
  "px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600";

// Large (mobile-friendly)
className = "px-6 py-4 text-lg font-bold";
```

### Badges

```tsx
// Success
className =
  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800";

// Warning
className =
  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800";

// Error
className =
  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800";
```

## Animation & Interactivity

```tsx
// Hover lift
className = "transition-transform hover:-translate-y-0.5 active:translate-y-0";

// Hover scale
className = "transition-transform hover:scale-105 active:scale-95";

// Smooth transitions
className = "transition-all duration-200";

// Fade in
className = "animate-fade-in";
```

## Common Gotchas

### ❌ Don't Do This

```tsx
// Custom colors without configuration
<div className="bg-accent-orange-500">  // Won't work

// Inline styles
<div style={{backgroundColor: '#ff6b35'}}>  // Hard to maintain

// bg-linear-to (non-standard)
<div className="bg-linear-to-r">  // Use bg-gradient-to-r
```

### ✅ Do This

```tsx
// Standard Tailwind colors
<div className="bg-orange-500">  // Works perfectly

// Tailwind utilities
<div className="bg-gradient-to-r from-orange-500 to-pink-500">  // Standard

// Semantic class names
<div className="bg-orange-500">  // Clear and maintainable
```

## Testing Changes

### 1. Make Changes

Edit className in component

### 2. Verify

Dev server hot-reloads automatically

### 3. Hard Refresh (if needed)

- Mac: `Cmd + Shift + R`
- Windows: `Ctrl + Shift + R`

### 4. Clear Cache (if still not working)

```bash
rm -rf .next .turbopack node_modules/.cache
npm run dev
```

## Examples from Athletes Page

### Before (Not Working)

```tsx
<div className="bg-gradient-to-br from-accent-orange-50 via-silver-100 to-accent-purple-50">
  <h1 className="text-heading-primary bg-gradient-to-r from-accent-orange-500 to-accent-purple-500">
```

### After (Working)

```tsx
<div className="bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent">
```

## Need Help?

1. Check `/docs/guides/DESIGN_SYSTEM_PROFESSIONAL.md` for detailed architecture
2. Browse [Tailwind CSS Docs](https://tailwindcss.com/docs) for all utilities
3. Use browser DevTools to inspect actual CSS being applied
4. Search codebase for similar patterns: `grep -r "bg-gradient" src/`

## Pro Tips

1. **Start with standard colors** - They work out of the box
2. **Use gradients liberally** - They're lightweight and performant
3. **Mobile-first** - Design for small screens, then scale up
4. **Test in browser** - Hot reload shows changes instantly
5. **Keep it simple** - Standard Tailwind is powerful enough

---

**Remember**: With Tailwind v4, UI changes are instant. Just update the className and watch it appear!
