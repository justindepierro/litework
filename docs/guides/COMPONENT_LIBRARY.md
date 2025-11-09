# UX Component Library - Usage Guide

## 🎨 Overview

This is our polished, professional UI component library using **design tokens** for complete consistency. All components are:

- ✅ **Mobile-first** - Touch-friendly, responsive
- ✅ **Accessible** - Keyboard navigation, focus states, ARIA labels
- ✅ **Performant** - 60fps animations, will-change optimization
- ✅ **Consistent** - Design tokens, no hardcoded values
- ✅ **Delightful** - Micro-interactions, smooth transitions

---

## 📦 Components

### Button

**Location**: `src/components/ui/Button.tsx`

**Features**:

- Ripple effect on click
- Hover lift animation
- Loading states with spinner
- Success state with checkmark
- 5 variants: primary, secondary, danger, ghost, success
- 3 sizes: sm, md, lg

**Usage**:

```tsx
import { Button, IconButton, ButtonGroup } from '@/components/ui';
import { Plus, Save } from 'lucide-react';

// Primary button
<Button variant="primary" onClick={handleSave}>
  Save Changes
</Button>

// With loading state
<Button
  variant="primary"
  isLoading={isSaving}
  loadingText="Saving..."
>
  Save Workout
</Button>

// With success state
<Button showSuccessState={true}>
  Saved!
</Button>

// With icons
<Button
  variant="secondary"
  leftIcon={<Plus className="w-4 h-4" />}
  onClick={handleCreate}
>
  Create Workout
</Button>

// Icon button (circular)
<IconButton
  icon={<Save className="w-5 h-5" />}
  variant="ghost"
  aria-label="Save"
  onClick={handleSave}
/>

// Button group
<ButtonGroup>
  <Button variant="secondary">Cancel</Button>
  <Button variant="primary">Confirm</Button>
</ButtonGroup>
```

---

### Card

**Location**: `src/components/ui/Card.tsx`

**Features**:

- 4 variants: default, elevated, flat, bordered
- Hover lift animation
- Interactive mode (cursor pointer)
- Flexible padding
- Header, Footer sub-components

**Usage**:

```tsx
import { Card, CardHeader, CardFooter, StatCard, InteractiveCard } from '@/components/ui';

// Basic card
<Card variant="default" padding="md">
  <h3>Workout Details</h3>
  <p>Content here...</p>
</Card>

// Interactive card with hover
<Card
  variant="default"
  hoverable
  interactive
  onClick={handleClick}
>
  <p>Click me!</p>
</Card>

// Card with header
<Card>
  <CardHeader
    title="Recent Workouts"
    subtitle="Last 7 days"
    icon={<Dumbbell className="w-5 h-5" />}
    action={<Button size="sm">View All</Button>}
  />
  <div>Card content...</div>
  <CardFooter>
    <Button variant="ghost">Dismiss</Button>
  </CardFooter>
</Card>

// Stat card (for dashboard)
<StatCard
  label="Total Workouts"
  value="24"
  change={{ value: "+12%", type: "increase" }}
  icon={<TrendingUp className="w-6 h-6" />}
  onClick={() => navigate('/workouts')}
/>

// Interactive list item card
<InteractiveCard
  showArrow
  badge={<span className="badge-success">New</span>}
  onClick={handleNavigate}
>
  <h4>Workout Title</h4>
  <p className="text-sm">Details here...</p>
</InteractiveCard>
```

---

### Input

**Location**: `src/components/ui/Input.tsx`

**Features**:

- Focus ring with blue glow
- Error states with icon
- Success states with checkmark
- Password visibility toggle
- Helper text
- Left/right icons
- 3 sizes: sm, md, lg

**Usage**:

```tsx
import { Input, Textarea, Select } from '@/components/ui';
import { Search, Mail } from 'lucide-react';

// Basic input
<Input
  label="Workout Name"
  placeholder="Enter workout name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
  fullWidth
/>

// With error
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error="Invalid email address"
  fullWidth
/>

// With success state
<Input
  label="Username"
  value={username}
  onChange={handleChange}
  success={isAvailable}
  helperText="Username is available"
/>

// With icon
<Input
  leftIcon={<Search className="w-5 h-5" />}
  placeholder="Search workouts..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>

// Password input (auto show/hide)
<Input
  label="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  fullWidth
/>

// Textarea
<Textarea
  label="Notes"
  placeholder="Add workout notes..."
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  autoResize
  fullWidth
/>

// Select
<Select
  label="Athlete Group"
  value={groupId}
  onChange={(e) => setGroupId(e.target.value)}
  options={[
    { value: '', label: 'Select a group' },
    { value: '1', label: 'Football Linemen' },
    { value: '2', label: 'Volleyball' }
  ]}
  fullWidth
/>
```

---

### EmptyState

**Location**: `src/components/ui/EmptyState.tsx`

**Features**:

- Icon + illustration support
- Primary & secondary actions
- 3 sizes: sm, md, lg
- Pre-built templates for common scenarios

**Usage**:

```tsx
import {
  EmptyState,
  EmptyWorkouts,
  EmptyAthletes,
  EmptySearch,
  EmptyError
} from '@/components/ui';
import { Dumbbell } from 'lucide-react';

// Custom empty state
<EmptyState
  icon={Dumbbell}
  title="No workouts yet"
  description="Create your first workout to get started"
  action={{
    label: "Create Workout",
    onClick: handleCreate,
    icon: <Plus className="w-4 h-4" />
  }}
  secondaryAction={{
    label: "Import from Template",
    onClick: handleImport
  }}
/>

// Pre-built templates
<EmptyWorkouts onCreateWorkout={handleCreate} />

<EmptyAthletes onInviteAthlete={handleInvite} />

<EmptySearch
  searchTerm={searchQuery}
  onClearSearch={() => setSearchQuery('')}
/>

<EmptyError
  message="Failed to load workouts"
  onRetry={fetchWorkouts}
/>
```

---

### LoadingSpinner

**Location**: `src/components/ui/LoadingSpinner.tsx`

**Usage**:

```tsx
import {
  LoadingSpinner,
  PageLoading,
  SectionLoading,
  ButtonLoading
} from '@/components/ui';

// Inline spinner
<LoadingSpinner size="md" message="Loading workouts..." />

// Full page loading
<PageLoading message="Loading dashboard..." />

// Section loading
<SectionLoading message="Loading..." />

// Button loading (inside button)
<button>
  <ButtonLoading size="sm" />
  <span>Saving...</span>
</button>
```

---

## 🎨 Design Tokens

### Colors

All colors use CSS variables from `src/styles/design-tokens.css`:

```tsx
// Text colors
--color - text - primary; // #334155 (navy-700)
--color - text - secondary; // #475569 (navy-600)
--color - text - tertiary; // #64748b (navy-500)
--color - text - inverse; // #ffffff

// Background colors
--color - bg - primary; // #ffffff
--color - bg - secondary; // #f9fafb
--color - bg - surface; // #f9fafb
--color - bg - overlay; // rgba(15, 23, 42, 0.75)

// Border colors
--color - border - primary; // #e5e7eb
--color - border - secondary; // #d1d5db
--color - border - focus; // #3b82f6

// Semantic colors
--color - success; // #00d4aa
--color - error; // #ef4444
--color - warning; // #fbbf24
--color - info; // #3b82f6

// Accent colors
--color - accent - orange; // #ff6b35
--color - accent - green; // #00d4aa
--color - accent - purple; // #8b5cf6
--color - accent - blue; // #3b82f6
```

### Animation Tokens

```css
/* Durations */
--duration-instant: 100ms --duration-fast: 150ms --duration-normal: 200ms
  --duration-moderate: 300ms --duration-slow: 400ms /* Easing */
  --easing-ease-out: cubic-bezier(0, 0, 0.2, 1)
  --easing-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
  --easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1)
  --easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55) /* Transitions */
  --transition-fast: all 150ms var(--easing-ease-out) --transition-normal: all
  200ms var(--easing-ease-out) --transition-spring: all 300ms
  var(--easing-spring) /* Elevation (shadows) */ --elevation-1: 0 1px 3px
  rgba(0, 0, 0, 0.1) --elevation-2: 0 4px 6px rgba(0, 0, 0, 0.1)
  --elevation-3: 0 10px 15px rgba(0, 0, 0, 0.1) --elevation-4: 0 20px 25px
  rgba(0, 0, 0, 0.1);
```

---

## 🎭 Animation Classes

### Micro-Interactions

```tsx
// Hover lift (for cards, buttons)
<div className="hover-lift">
  Content that lifts on hover
</div>

// Smooth transitions
<div className="smooth-transition">
  Smooth color/transform changes
</div>

// Fast transitions
<div className="smooth-transition-fast">
  Quick animations
</div>

// Focus ring (for inputs, buttons)
<button className="focus-ring">
  Button with custom focus state
</button>

// Animations
<div className="animate-lift">Lifts up</div>
<div className="animate-press">Presses down</div>
<div className="animate-shake">Shakes (for errors)</div>
<div className="animate-success">Success check animation</div>
<div className="animate-scale-in">Scales in</div>
<div className="animate-slide-up">Slides up</div>
```

### Stagger Animations (for lists)

```tsx
<div className="stagger-animation">
  <div>Item 1 (fades in first)</div>
  <div>Item 2 (fades in 50ms later)</div>
  <div>Item 3 (fades in 100ms later)</div>
</div>
```

---

## 🎯 Migration Guide

### Replace Old Patterns

**Old** (hardcoded):

```tsx
<button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
  Save
</button>
```

**New** (design tokens):

```tsx
<Button variant="primary" onClick={handleSave}>
  Save
</Button>
```

---

**Old** (inline styles):

```tsx
<div
  style={{
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  }}
>
  Content
</div>
```

**New** (component):

```tsx
<Card variant="default" padding="md">
  Content
</Card>
```

---

**Old** (custom empty state):

```tsx
{
  workouts.length === 0 && (
    <div className="text-center py-12">
      <p>No workouts found</p>
      <button onClick={handleCreate}>Create One</button>
    </div>
  );
}
```

**New** (component):

```tsx
{
  workouts.length === 0 && <EmptyWorkouts onCreateWorkout={handleCreate} />;
}
```

---

**Old** (basic loading):

```tsx
{
  loading && <div>Loading...</div>;
}
```

**New** (skeleton):

```tsx
{
  loading ? <WorkoutListSkeleton /> : <WorkoutList />;
}
```

---

## ✅ Best Practices

### 1. Always Use Design Tokens

❌ **Don't**:

```tsx
<div className="text-gray-700 bg-white border-gray-300">
```

✅ **Do**:

```tsx
<div className="text-[var(--color-text-primary)] bg-[var(--color-bg-surface)] border-[var(--color-border-primary)]">
```

### 2. Use Semantic Variants

❌ **Don't**:

```tsx
<button className="bg-red-600">Delete</button>
```

✅ **Do**:

```tsx
<Button variant="danger">Delete</Button>
```

### 3. Provide Accessibility

❌ **Don't**:

```tsx
<button onClick={handleDelete}>
  <Trash />
</button>
```

✅ **Do**:

```tsx
<IconButton
  icon={<Trash />}
  variant="danger"
  aria-label="Delete workout"
  onClick={handleDelete}
/>
```

### 4. Use Empty States

❌ **Don't**:

```tsx
{
  items.length === 0 && <p>No items</p>;
}
```

✅ **Do**:

```tsx
{
  items.length === 0 && (
    <EmptyState
      icon={Icon}
      title="No items yet"
      description="Get started by creating one"
      action={{ label: "Create", onClick: handleCreate }}
    />
  );
}
```

### 5. Show Loading States

❌ **Don't**:

```tsx
{
  isLoading && <div>Loading...</div>;
}
{
  !isLoading && <DataList />;
}
```

✅ **Do**:

```tsx
{
  isLoading ? <DataListSkeleton /> : <DataList />;
}
```

---

## 🎨 Component Checklist

When creating/updating a page:

- [ ] Use `<Button>` instead of `<button>` tags
- [ ] Use `<Card>` for containers instead of `<div>` with manual styles
- [ ] Use `<Input>` / `<Textarea>` / `<Select>` for forms
- [ ] Add `<EmptyState>` for empty data
- [ ] Use skeleton screens for loading (not "Loading..." text)
- [ ] Add focus states (`.focus-ring` class)
- [ ] Add smooth transitions (`.smooth-transition` class)
- [ ] Use hover effects on interactive elements
- [ ] Check mobile responsiveness (44px min touch targets)
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Verify color contrast (WCAG AA minimum)
- [ ] Add ARIA labels for icon-only buttons

---

## 📱 Mobile Optimization

All components are mobile-first:

- **Touch targets**: Minimum 44x44px (iOS standard)
- **Font sizes**: Minimum 16px (prevents iOS zoom)
- **Spacing**: Touch-friendly gaps between elements
- **Gestures**: Support for swipe, long-press where appropriate
- **Performance**: 60fps animations with `transform` and `opacity`
- **Safe areas**: Respect notched devices with `env(safe-area-inset-*)`

---

## 🚀 Performance

All components are optimized:

- **60fps animations**: Using `transform` and `opacity` (GPU-accelerated)
- **will-change**: Applied to frequently animated elements
- **Reduced motion**: Respects `prefers-reduced-motion` preference
- **Memoization**: Components are memoized where appropriate
- **Tree-shaking**: Import only what you need

---

## 📚 Examples

See live examples in:

- `/docs/component-examples.tsx` (coming soon)
- Individual component files have usage examples in comments
- Check existing pages for real-world usage

---

## 🔗 Related Docs

- **Design Tokens**: `src/styles/design-tokens.css`
- **Animation Utilities**: `src/app/globals.css`
- **Architecture**: `ARCHITECTURE.md`
- **UX Plan**: `UX_POLISH_PLAN.md`
