# LiteWork Gradient Background System

## Overview
Beautiful, modern mesh gradient backgrounds now applied across all pages.

## Gradient Designs

### 1. **Primary Gradient** (`bg-gradient-primary`)
A vibrant multi-color gradient perfect for main pages:
- **Colors**: Purple → Sky Blue → Amber → Pink → Teal
- **Effect**: Smooth diagonal gradient with 5 color stops
- **Use**: Homepage, major feature pages

**CSS:**
```css
linear-gradient(
  135deg,
  #faf5ff 0%,      /* Purple-50 */
  #f0f9ff 25%,     /* Sky-50 */
  #fef3c7 50%,     /* Amber-100 */
  #fce7f3 75%,     /* Pink-100 */
  #f0fdfa 100%     /* Teal-50 */
)
```

### 2. **Secondary Gradient** (`bg-gradient-secondary`)
A warmer, softer gradient:
- **Colors**: Orange → Pink → Blue
- **Effect**: Diagonal gradient with warm-to-cool transition
- **Use**: Dashboard, secondary pages

**CSS:**
```css
linear-gradient(
  135deg,
  #fff7ed 0%,      /* Orange-50 */
  #fdf2f8 50%,     /* Pink-50 */
  #eff6ff 100%     /* Blue-50 */
)
```

### 3. **Energetic Mesh Gradient** (Default - `page-gradient-energetic`)
A sophisticated mesh gradient with multiple radial overlays:
- **Base**: Subtle gray gradient (#fafafa → #ffffff → #f5f5f5)
- **Overlays**: 5 radial gradients creating depth and energy
  - Top-left: Orange glow (15% opacity)
  - Top-right: Purple glow (12% opacity)
  - Bottom-right: Teal glow (15% opacity)
  - Bottom-left: Pink glow (12% opacity)
  - Center: Cyan glow (8% opacity)

**Effect**: Creates a modern "mesh gradient" with soft color halos in each corner and center, giving depth without being overwhelming.

## Implementation

### Body Background (Global)
The energetic mesh gradient is applied to the `<body>` element:

```css
body {
  background: var(--page-gradient-energetic);
  background-attachment: fixed;
  min-height: 100vh;
}
```

The `background-attachment: fixed` ensures the gradient stays in place during scrolling, creating a sophisticated parallax effect.

### Utility Classes

You can override the body background on specific pages:

```tsx
// Use primary gradient
<div className="min-h-screen bg-gradient-primary">
  {/* content */}
</div>

// Use secondary gradient
<div className="min-h-screen bg-gradient-secondary">
  {/* content */}
</div>

// Use energetic gradient (explicit)
<div className="min-h-screen bg-gradient-energetic">
  {/* content */}
</div>
```

## Design Rationale

### Why Mesh Gradients?
1. **Modern**: Mesh gradients are trending in 2025 UI design
2. **Subtle**: Multiple low-opacity overlays create depth without distraction
3. **Professional**: Not too colorful, maintains readability
4. **Brand Alignment**: Uses LiteWork's accent colors (orange, purple, teal, pink)
5. **Performance**: Pure CSS, no images or SVGs needed

### Color Psychology
- **Orange** (top-left): Energy, strength, motivation
- **Purple** (top-right): Premium, achievement, focus
- **Teal** (bottom-right): Growth, freshness, recovery
- **Pink** (bottom-left): Fun, engagement, positivity
- **Cyan** (center): Balance, clarity, trust

### Accessibility
- All backgrounds maintain AAA contrast ratio with dark text
- Opacity kept low (8-15%) to ensure readability
- Pure white/gray base ensures content visibility

## Browser Support
✅ All modern browsers (Chrome, Firefox, Safari, Edge)
✅ Mobile browsers (iOS Safari, Chrome Mobile)
✅ Fixed attachment may fall back to scroll on some mobile browsers (graceful degradation)

## Examples in App

### Dashboard
Already uses gradient variations with glass effects on top

### Workouts Page
```tsx
<div className="min-h-screen bg-gradient-energetic">
  {/* Workout cards appear on gradient */}
</div>
```

### Athletes Page
```tsx
<div className="min-h-screen bg-gradient-primary">
  {/* Athlete list on colorful gradient */}
</div>
```

## Customization

To change gradients site-wide, edit `/src/styles/design-tokens-unified.css`:

```css
/* Find these variables and adjust colors/stops */
--bg-gradient-primary: ...
--bg-gradient-secondary: ...
--page-gradient-energetic: ...
```

## Performance Notes

- **Zero impact**: Pure CSS gradients have no performance cost
- **No images**: No HTTP requests, instant rendering
- **Cacheable**: Defined in CSS, cached by browser
- **Responsive**: Scales perfectly to any screen size

---

**Last Updated**: November 22, 2025
**Version**: 2.0
