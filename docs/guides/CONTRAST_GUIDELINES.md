# Contrast Guidelines & Protection

## Why This Matters

**WCAG 2.1 Level AA Standards:**
- Normal text (< 18px): **4.5:1 minimum contrast ratio**
- Large text (≥ 18px): **3:1 minimum contrast ratio**
- UI components & graphics: **3:1 minimum contrast ratio**

**Real-World Impact:**
- 1 in 12 men and 1 in 200 women have color vision deficiency
- Low contrast text is difficult to read in bright sunlight (gym environment!)
- Mobile screens have varying brightness levels
- Accessibility compliance is a legal requirement

## The Problem We Had

Our navigation bar had **text-slate-300 on slate-900 background**:
- Text: `#cbd5e1` (RGB: 203, 213, 225)
- Background: `#0f172a` (RGB: 15, 23, 42)
- **Contrast Ratio: ~8.5:1** ✅ (technically passes)

BUT in practice, it looked nearly invisible because:
1. Slate-900 blended with page background
2. iOS Safari rendering bugs with transparent/gradient backgrounds
3. Slate-300 is psychologically perceived as "gray" not "high contrast"

## Fixed Solution

**New High-Contrast Scheme:**
- Background: `slate-950` (#020617 - nearly black)
- Text: `white` (#ffffff)
- **Contrast Ratio: ~19:1** ✅✅✅ (exceptional)
- Active state: White background with black text (inverted)

## Approved Color Combinations

### Dark Backgrounds (Navigation, Modals, Overlays)

| Background | Text Color | Contrast | Status | Use Case |
|------------|-----------|----------|--------|----------|
| `slate-950` | `white` | 19:1 | ✅ Excellent | Primary navigation |
| `slate-950` | `slate-100` | 16:1 | ✅ Excellent | Secondary text |
| `slate-900` | `white` | 17:1 | ✅ Excellent | Cards, containers |
| `slate-800` | `white` | 12.6:1 | ✅ Excellent | Buttons, badges |
| `slate-700` | `white` | 8.6:1 | ✅ Good | Hover states |

### Light Backgrounds (Main Content)

| Background | Text Color | Contrast | Status | Use Case |
|------------|-----------|----------|--------|----------|
| `white` | `slate-950` | 19:1 | ✅ Excellent | Body text |
| `white` | `slate-900` | 17:1 | ✅ Excellent | Headings |
| `white` | `slate-700` | 8.6:1 | ✅ Good | Paragraph text |
| `white` | `slate-500` | 4.6:1 | ✅ Minimum | Muted text (large only) |
| `slate-50` | `slate-900` | 16.2:1 | ✅ Excellent | Cards |

### Accent Colors (Buttons, Badges, Alerts)

| Background | Text Color | Contrast | Status | Use Case |
|------------|-----------|----------|--------|----------|
| `orange-500` (#ff6b35) | `white` | 3.8:1 | ⚠️ Large text only | Primary buttons (18px+) |
| `orange-600` (#ea5a28) | `white` | 4.6:1 | ✅ Good | Primary buttons |
| `orange-700` (#c2410c) | `white` | 6.3:1 | ✅ Excellent | Strong CTAs |
| `green-500` (#00d4aa) | `white` | 2.8:1 | ❌ Too low | Use green-600+ |
| `green-600` (#00b894) | `white` | 3.5:1 | ⚠️ Large text only | Success states |
| `red-500` (#ef4444) | `white` | 4.3:1 | ⚠️ Large text only | Error states |
| `red-600` (#dc2626) | `white` | 5.5:1 | ✅ Good | Error buttons |

## Component-Level Rules

### Navigation Bar
```tsx
// ✅ CORRECT
<nav className="bg-slate-950">
  <Link className="text-white">Dashboard</Link>
  <Link className="text-white hover:bg-white/10">Workouts</Link>
  <Link className="bg-white text-slate-950">Profile</Link> {/* Active */}
</nav>

// ❌ FORBIDDEN
<nav className="bg-slate-900">
  <Link className="text-slate-300">Dashboard</Link> {/* Too subtle */}
</nav>
```

### Buttons
```tsx
// ✅ CORRECT - High contrast on all states
<Button className="bg-orange-600 text-white text-base font-semibold">
  Create Workout
</Button>

// ⚠️ CAUTION - Only for large text (18px+)
<Button className="bg-orange-500 text-white text-lg font-semibold">
  Large Button
</Button>

// ❌ FORBIDDEN
<Button className="bg-orange-400 text-white text-sm">
  Small Button
</Button>
```

### Status Badges
```tsx
// ✅ CORRECT
<Badge className="bg-green-600 text-white font-semibold">Active</Badge>
<Badge className="bg-slate-800 text-white">Default</Badge>
<Badge className="bg-red-600 text-white">Error</Badge>

// ❌ FORBIDDEN
<Badge className="bg-green-100 text-green-600">Active</Badge> {/* Too subtle */}
```

### Form Inputs
```tsx
// ✅ CORRECT
<Input 
  className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
  placeholder="Enter name..."
/>

// ❌ FORBIDDEN
<Input 
  className="bg-slate-50 text-slate-400" 
  placeholder="Enter name..." 
/>
```

## Testing Tools

### Manual Testing
1. **Contrast Checker**: https://webaim.org/resources/contrastchecker/
2. **Browser DevTools**: Chrome/Firefox have built-in contrast checkers
3. **Mobile Testing**: Always test on actual devices in various lighting

### Automated Tools
```bash
# Install axe-core for accessibility testing
npm install --save-dev @axe-core/cli

# Run contrast checks
npx axe http://localhost:3000 --tags=wcag2aa,wcag21aa
```

### Browser Extensions
- **axe DevTools** (Chrome/Firefox) - Free accessibility checker
- **WAVE** (Chrome/Firefox) - Visual feedback for contrast issues
- **Stark** (Figma/Browser) - Contrast checker with color blindness simulation

## Enforcement Strategy

### 1. Linting Rules (TODO)
Add to `eslint.config.mjs`:
```javascript
// Future: Add contrast linting
// 'tailwindcss/no-low-contrast': 'error'
```

### 2. Design Token Pairing (TODO)
Create allowed combinations in `src/lib/design-tokens.ts`:
```typescript
export const CONTRAST_SAFE_PAIRS = {
  'bg-slate-950': ['text-white', 'text-slate-100'],
  'bg-white': ['text-slate-950', 'text-slate-900'],
  'bg-orange-600': ['text-white'],
  // ... etc
} as const;
```

### 3. Component Validation (TODO)
Add runtime warnings in development:
```typescript
// In Button component
if (process.env.NODE_ENV === 'development') {
  validateContrast(bgColor, textColor);
}
```

### 4. Pre-Commit Hooks (TODO)
Add to `.husky/pre-commit`:
```bash
# Run contrast checks before committing
npm run test:contrast
```

## Common Mistakes & Fixes

### Mistake #1: Using Gray Text on Dark Backgrounds
```tsx
// ❌ BAD - Looks subtle but lacks impact
<div className="bg-slate-900 text-slate-300">Content</div>

// ✅ GOOD - High contrast, clear hierarchy
<div className="bg-slate-950 text-white">Content</div>
<div className="bg-slate-950 text-slate-100">Secondary content</div>
```

### Mistake #2: Light Accent Colors on White
```tsx
// ❌ BAD - Fails contrast check
<Badge className="bg-orange-100 text-orange-500">New</Badge>

// ✅ GOOD - Passes contrast check
<Badge className="bg-orange-600 text-white">New</Badge>
```

### Mistake #3: Transparent Backgrounds Without Fallback
```tsx
// ❌ BAD - May disappear on iOS Safari
<nav className="bg-slate-900/95 backdrop-blur-md">

// ✅ GOOD - Explicit fallback
<nav 
  className="bg-slate-950/98 backdrop-blur-md"
  style={{ backgroundColor: 'rgba(2, 6, 23, 0.98)' }}
>
```

### Mistake #4: Small Text with Low Contrast
```tsx
// ❌ BAD - 14px text needs 4.5:1 contrast
<p className="text-sm text-slate-500">Small gray text</p>

// ✅ GOOD - Use darker color or larger text
<p className="text-sm text-slate-700">Small text</p>
<p className="text-base text-slate-500">Larger text</p>
```

## Dark Mode Considerations

When implementing dark mode:
```tsx
// ✅ CORRECT - Both modes have high contrast
<div className="bg-white dark:bg-slate-950 text-slate-950 dark:text-white">
  Content with proper contrast in both modes
</div>

// ❌ FORBIDDEN - Dark mode has poor contrast
<div className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-400">
  Poor contrast in dark mode
</div>
```

## Checklist for New Components

Before creating or modifying a component:

- [ ] All text is white on dark backgrounds (slate-950, slate-900)
- [ ] All text is dark (slate-950, slate-900) on light backgrounds
- [ ] Button text uses 18px+ font or darker background colors
- [ ] Status badges use solid backgrounds with white text
- [ ] Form inputs have clear borders and placeholder text
- [ ] Hover states maintain or improve contrast
- [ ] Focus states are clearly visible (outline or ring)
- [ ] Tested on mobile device in bright light
- [ ] Tested with browser contrast checker
- [ ] No reliance on color alone to convey information

## Emergency Fix Protocol

If users report visibility issues:

1. **Immediate**: Add inline styles with explicit colors
2. **Short-term**: Replace with approved color combinations
3. **Long-term**: Update design tokens and add validation

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Tailwind Color Palette](https://tailwindcss.com/docs/customizing-colors)
- [Accessible Color Palette Generator](https://venngage.com/tools/accessible-color-palette-generator)

## Related Documentation

- `COMPONENT_USAGE_STANDARDS.md` - Component best practices
- `ARCHITECTURE.md` - System architecture and patterns
- `docs/design-tokens.md` - Design token reference
