# Emoji Policy & Icon Usage Guidelines

## Overview

This project maintains an **emoji-free codebase** in favor of professional, accessible, and consistent icon usage through Lucide React.

## Why No Emojis?

1. **Accessibility**: Screen readers handle proper semantic icons better than emojis
2. **Consistency**: Unified icon library ensures consistent sizing, styling, and behavior
3. **Professional Appearance**: Icons provide a more polished, professional UI
4. **Scalability**: Vector icons scale perfectly at all sizes
5. **Customization**: Icons can be styled with CSS/Tailwind classes

## Icon Usage

### Preferred Approach

```tsx
import { Dumbbell, BarChart3, Users, Calendar } from 'lucide-react';

// Good: Professional icons with consistent styling
<Dumbbell className="w-5 h-5 text-primary" />
<BarChart3 className="w-6 h-6 text-accent-blue" />
```

### Avoid

```tsx
// Bad: Emojis are inconsistent and less accessible
<span>💪</span>
<div>📊</div>
```

## Common Icon Replacements

| Emoji | Lucide React Icon | Usage                       |
| ----- | ----------------- | --------------------------- |
| 💪    | `<Dumbbell />`    | Strength training, workouts |
| 📊    | `<BarChart3 />`   | Statistics, analytics       |
| 👥    | `<Users />`       | Groups, teams, members      |
| 📅    | `<Calendar />`    | Schedules, dates            |
| 📈    | `<TrendingUp />`  | Progress, improvement       |
| 🏆    | `<Trophy />`      | Achievements, goals         |
| 🔥    | `<Flame />`       | Intensity, streaks          |
| ✓     | `<Check />`       | Completion, success         |
| ➕    | `<Plus />`        | Add, create new             |
| ⚙️    | `<Settings />`    | Configuration, options      |

## Validation Systems

### 1. NPM Script Check

```bash
npm run emoji-check
```

Scans codebase for decorative emojis (excludes mathematical symbols like ×).

### 2. Git Pre-commit Hook

Automatically prevents commits containing emojis in `.js`, `.jsx`, `.ts`, `.tsx` files.

### 3. ESLint Rules

Configured to catch emoji usage during development.

## Mathematical Symbols

Mathematical symbols like × (multiplication) are **allowed** when used in proper context:

- ✅ `3×10 reps`
- ✅ `{sets} × {reps}`
- ❌ `Click × to close` (use `<X />` icon instead)

## Adding New Icons

1. Check [Lucide React documentation](https://lucide.dev/icons/) for available icons
2. Import only the icons you need
3. Apply consistent className patterns using design tokens
4. Test accessibility with screen readers when possible

## Troubleshooting

If the pre-commit hook prevents your commit:

1. Find the emoji in your code
2. Replace with appropriate Lucide React icon
3. Import the icon component
4. Apply consistent styling classes

## Benefits Achieved

- ✅ Improved accessibility
- ✅ Consistent visual design
- ✅ Professional appearance
- ✅ Better maintenance
- ✅ Scalable icon system
- ✅ Automatic validation
