# Centralized Design System - Quick Start Guide

## ✨ What We Built

A **single source of truth** for all gradient colors and page headers in LiteWork. Now you can change colors site-wide by editing ONE file!

## 🎯 Three Components Created

### 1. **PageHeader Component** (`src/components/ui/PageHeader.tsx`)

Reusable header for all pages with:

- Gradient accent bar (thin vertical bar on left side)
- Title + subtitle support
- Optional icon and action buttons
- Mobile-first responsive design
- Three gradient variants

**Usage**:

```tsx
import { PageHeader } from "@/components/ui/PageHeader";
import { LayoutDashboard } from "lucide-react";

<PageHeader
  title="Dashboard"
  subtitle="Your workout overview and statistics"
  icon={<LayoutDashboard className="w-6 h-6" />}
  gradientVariant="primary" // or "secondary", "tertiary"
  actions={<Button>Add Workout</Button>}
/>;
```

### 2. **Gradient Utility Classes** (`src/app/globals.css`)

Centralized gradient definitions:

**For Page Headers** (vertical bars):

- `.bg-gradient-accent-primary` → Orange → Purple → Green
- `.bg-gradient-accent-secondary` → Orange → Purple → Pink
- `.bg-gradient-accent-tertiary` → Blue → Purple → Pink

**For Modal Headers** (horizontal backgrounds):

- `.bg-gradient-header-primary`
- `.bg-gradient-header-secondary` ← Used in all modals
- `.bg-gradient-header-tertiary`

**For Subtle Backgrounds**:

- `.bg-gradient-subtle-primary`
- `.bg-gradient-subtle-secondary`

### 3. **Updated Modal Component** (`src/components/ui/Modal.tsx`)

Changed from hardcoded colors to centralized class:

```tsx
// OLD (hardcoded):
className = "bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500";

// NEW (centralized):
className = "bg-gradient-header-secondary";
```

## 🚀 How to Use

### For New Pages

```tsx
import { PageHeader } from "@/components/ui/PageHeader";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container py-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your preferences"
        icon={<Settings className="w-6 h-6" />}
        gradientVariant="primary"
      />

      {/* Your page content */}
    </div>
  );
}
```

### For Modals

Modals automatically use the centralized gradient - no changes needed!

```tsx
<ModalHeader title="Add Workout" icon={<Dumbbell />} onClose={onClose} />
// ✅ Uses .bg-gradient-header-secondary automatically
```

## 🎨 How to Change Colors Site-Wide

### Option 1: Change Color Values

Edit **`src/styles/tokens.css`** (lines 48-95):

```css
:root {
  /* Change orange to red */
  --accent-orange-500: #ef4444;

  /* Change purple to indigo */
  --accent-purple-500: #6366f1;

  /* Change green to teal */
  --accent-green-500: #14b8a6;
}
```

**Result**: ALL gradients update everywhere! 🎉

### Option 2: Swap Gradient Variants

Change which gradient is used:

```tsx
// Use tertiary gradient (blue-purple-pink) instead of primary
<PageHeader gradientVariant="tertiary" />
```

Or for modals, edit `Modal.tsx` line 204:

```tsx
className = "bg-gradient-header-primary"; // Changed from "secondary"
```

### Option 3: Create New Gradient

Add to `src/app/globals.css`:

```css
.bg-gradient-accent-custom {
  background: linear-gradient(
    to bottom,
    var(--accent-red-500),
    var(--accent-yellow-500),
    var(--accent-orange-500)
  );
}
```

Then use:

```tsx
<PageHeader gradientVariant="custom" />
```

## 📋 Migration Checklist

To update existing pages to use the centralized system:

- [ ] Dashboard page
- [ ] Workouts page
- [ ] Schedule/Calendar page
- [ ] Profile page
- [ ] Progress page
- [ ] Settings page

### Before (Scattered):

```tsx
<div className="relative">
  <div className="absolute -left-4 w-1.5 bg-gradient-to-b from-orange-500 via-purple-500 to-green-500" />
  <h1>Dashboard</h1>
  <p>Description</p>
</div>
```

### After (Centralized):

```tsx
<PageHeader
  title="Dashboard"
  subtitle="Description"
  gradientVariant="primary"
/>
```

## 🔍 Where Everything Lives

| What             | File                               | Purpose                       |
| ---------------- | ---------------------------------- | ----------------------------- |
| Color values     | `src/styles/tokens.css`            | Define actual color hex codes |
| Gradient classes | `src/app/globals.css`              | Create gradient patterns      |
| PageHeader       | `src/components/ui/PageHeader.tsx` | Reusable header component     |
| Modal            | `src/components/ui/Modal.tsx`      | Uses centralized gradients    |

## 💡 Key Benefits

1. **Change Once, Update Everywhere**: Edit colors in ONE file
2. **Consistent Design**: Same patterns across all pages
3. **Type-Safe**: TypeScript ensures correct props
4. **Maintainable**: No scattered hardcoded colors
5. **Flexible**: Multiple variants for different contexts

## 📚 Full Documentation

See **`docs/guides/CENTRALIZED_DESIGN_SYSTEM.md`** (600+ lines) for:

- Complete API reference
- All gradient variants
- Advanced examples
- Migration patterns
- Best practices
- Troubleshooting

## 🎓 Quick Examples

### Basic Page Header

```tsx
<PageHeader title="My Page" />
```

### With Icon and Subtitle

```tsx
<PageHeader
  title="Athletes"
  subtitle="Manage your team"
  icon={<Users className="w-6 h-6" />}
/>
```

### With Actions

```tsx
<PageHeader
  title="Workouts"
  subtitle="Training programs"
  actions={<Button variant="primary">Create Workout</Button>}
/>
```

### Different Gradient

```tsx
<PageHeader
  title="Profile"
  gradientVariant="tertiary" // Blue-purple-pink
/>
```

### Custom Styling

```tsx
<PageHeader
  title="Dashboard"
  className="mb-8" // Add custom margin
  mobileAlign="left" // Left-aligned on mobile too
/>
```

## 🚨 Important Rules

### DO ✅

```tsx
// Use PageHeader component
<PageHeader title="Dashboard" gradientVariant="primary" />

// Use gradient utility classes
<div className="bg-gradient-accent-primary" />

// Reference design tokens
background: linear-gradient(to right, var(--accent-orange-500), ...);
```

### DON'T ❌

```tsx
// Don't hardcode gradients
<div className="bg-gradient-to-r from-orange-500 via-purple-500 to-pink-500" />

// Don't use hex colors directly
<div style={{ background: 'linear-gradient(#ff6b35, #8b5cf6)' }} />

// Don't recreate PageHeader manually
// (Just use the component!)
```

## ✨ Summary

**Before**: 50+ files with hardcoded colors  
**After**: 1 file (`tokens.css`) controls everything

**Change gradients site-wide in 30 seconds:**

1. Open `src/styles/tokens.css`
2. Edit color hex values (lines 48-95)
3. Save
4. Done! ✨

---

**Next Steps**: Update Dashboard, Workouts, Schedule, Profile, Progress, and Settings pages to use `<PageHeader>` component.
