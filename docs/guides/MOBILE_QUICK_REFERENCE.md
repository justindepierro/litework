# Mobile Responsiveness - Quick Reference Guide

## 🎯 Core Principles

### 1. Mobile-First Always

- Design for mobile screens first (320px+)
- Progressive enhancement for larger screens
- Never assume hover capability exists

### 2. Touch Targets - WCAG 2.1

- **Minimum**: 44x44px (Level AAA)
- **Standard**: 48x48px (recommended)
- **Workout mode**: 56-64px (optimal)
- **Spacing**: 8px minimum between targets

### 3. Typography

- **Minimum**: 15px for body text (mobile)
- **Standard**: 16px for desktop
- **Workout**: 18px+ for gym readability
- Use `clamp()` for fluid scaling

---

## 🚀 Quick Implementation

### Typography

```tsx
// ✅ Always use Typography components
<Display size="lg">Hero Title</Display>
<Heading level="h2">Section Title</Heading>
<Body size="base">Paragraph text</Body>
<Label>Form label</Label>
<Caption>Helper text</Caption>

// ❌ Never hardcode
<h1 className="text-3xl font-bold">Title</h1>
```

### Buttons

```tsx
// ✅ WCAG compliant touch targets
<Button size="md">Standard</Button>     // 48px
<Button size="lg">Workout</Button>      // 56px
<Button className="touch-target">...</Button>

// ❌ Too small for mobile
<button className="px-2 py-1">Tiny</button>
```

### Layouts

```tsx
// ✅ Mobile-first responsive
<div className="flex flex-col gap-4 md:flex-row md:gap-6">

// ✅ Mobile stack, desktop grid
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

// ❌ Desktop-first
<div className="flex gap-2">
```

### Forms

```tsx
// ✅ Mobile-optimized inputs
<Input
  label="Email"
  type="email"
  inputSize="md"          // 44px height
  fullWidth               // Takes full width on mobile
  autoComplete="email"
/>

// ✅ Mobile keyboard types
<Input
  type="tel"              // Number pad
  inputMode="decimal"     // Decimal keyboard
/>
```

### Modals

```tsx
// ✅ Mobile-first modal
<ModalBackdrop isOpen={open} onClose={close}>
  <div className="bg-white rounded-lg w-full max-w-2xl sm:w-auto">
    <ModalHeader title="Edit" onClose={close} />
    <ModalContent>{/* content */}</ModalContent>
    <ModalFooter>{/* actions */}</ModalFooter>
  </div>
</ModalBackdrop>
```

---

## 📱 iOS Safe Area

```tsx
// ✅ Add safe area support
<nav
  className="fixed top-0"
  style={{
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'env(safe-area-inset-bottom)',
  }}
>
```

```css
/* ✅ Utility classes available */
.safe-area-inset        /* All sides */
.safe-area-inset-top    /* Top only */
.safe-area-inset-bottom /* Bottom only */
.h-screen-safe          /* Height minus insets */
```

---

## 🎨 Spacing

```tsx
// ✅ Touch-friendly gaps
className = "gap-2"; // 8px - minimum between touch targets
className = "gap-3"; // 12px - comfortable
className = "gap-4"; // 16px - workout mode

// ✅ Responsive padding
className = "p-4 md:p-6 lg:p-8";

// ✅ Touch spacing utilities
className = "touch-gap"; // 8px
className = "touch-gap-md"; // 12px
className = "touch-gap-lg"; // 16px
```

---

## 📊 Responsive Breakpoints

```typescript
// Tailwind breakpoints (mobile-first)
xs: 480px   // Small phones
sm: 640px   // Large phones
md: 768px   // Tablets
lg: 1024px  // Laptops
xl: 1280px  // Desktops
2xl: 1536px // Large displays
```

---

## ✅ Mobile Testing Checklist

### Every Component

- [ ] Typography uses semantic components
- [ ] Touch targets >= 44x44px
- [ ] Spacing between elements >= 8px
- [ ] Responsive breakpoints applied
- [ ] Works without hover
- [ ] Safe area insets (if fixed)
- [ ] Loading states visible
- [ ] Error states handled

### Every Page

- [ ] PageContainer with proper background
- [ ] Mobile navigation works
- [ ] Forms are touch-friendly
- [ ] Tables have mobile layout
- [ ] Modals full-screen on mobile
- [ ] Landscape mode tested
- [ ] iOS devices tested
- [ ] Android devices tested

---

## 🚫 Common Mistakes

### ❌ DON'T

```tsx
// Hardcoded colors
<div className="text-blue-500">

// Hardcoded fonts
<h1 className="text-2xl font-bold">

// Too small buttons
<button className="px-2 py-1">

// Missing mobile breakpoints
<div className="grid grid-cols-3">

// Desktop-first padding
<div className="p-8">

// Hover-dependent features
<button className="hover:opacity-50">
  Only hover
</button>
```

### ✅ DO

```tsx
// Design tokens
<Body variant="primary">

// Typography components
<Heading level="h1">

// WCAG compliant
<Button size="md">

// Mobile-first responsive
<div className="grid grid-cols-1 md:grid-cols-3">

// Responsive padding
<div className="p-4 md:p-8">

// Touch-friendly
<Button
  size="lg"
  className="touch-target"
  onClick={handleAction}
>
  Tap here
</Button>
```

---

## 🛠️ Utility Classes Reference

### Touch Targets

```css
.touch-target     /* 44x44px - WCAG AAA */
.touch-target-md  /* 48x48px - recommended */
.touch-target-lg  /* 56x56px - workout */
.touch-target-xl  /* 64x64px - primary */
```

### Touch Spacing

```css
.touch-gap        /* 8px gap */
.touch-gap-md     /* 12px gap */
.touch-gap-lg     /* 16px gap */
```

### Mobile Layouts

```css
.mobile-stack           /* Stacks on mobile, grid on desktop */
.scroll-container-mobile /* Horizontal scroll with snap */
.momentum-scroll        /* iOS smooth scrolling */
.hide-scrollbar         /* Clean UI without scrollbars */
```

### Safe Areas

```css
.safe-area-inset        /* All insets */
.safe-area-inset-top    /* Top only */
.safe-area-inset-bottom /* Bottom only */
.h-screen-safe          /* Full height minus insets */
```

---

## 📖 Documentation

**Full Details**: `docs/MOBILE_RESPONSIVENESS_AUDIT.md`  
**Background Standards**: `docs/guides/LAYOUT_BACKGROUND_STANDARDS.md`  
**Component Standards**: `docs/guides/COMPONENT_USAGE_STANDARDS.md`

---

## 🎯 Performance Tips

1. **Lazy load images**: Use Next.js Image component
2. **Code split**: Dynamic imports for large components
3. **Optimize fonts**: Subset fonts, preload critical
4. **Cache strategically**: Service worker caching
5. **Minimize bundle**: Tree shaking, dead code elimination

---

## 📞 Need Help?

Check existing components for examples:

- `Button.tsx` - Touch target compliance
- `Input.tsx` - Mobile-friendly forms
- `Modal.tsx` - Full-screen mobile modals
- `Navigation.tsx` - Responsive navigation
- `BottomNav.tsx` - Mobile-only navigation
- `WorkoutLive.tsx` - Optimal workout UX

---

**Version**: 1.0  
**Last Updated**: November 26, 2025
