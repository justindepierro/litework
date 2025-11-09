# Component Usage Standards - MANDATORY

## 🚨 CRITICAL RULES - MUST FOLLOW

### 1. **NEVER Hardcode Design Values**

**❌ FORBIDDEN**:
```tsx
// NEVER do this
<div className="text-blue-500 bg-gray-100 p-4 rounded-lg">
  <h1 className="text-2xl font-bold">Title</h1>
  <p className="text-gray-600">Description</p>
</div>
```

**✅ REQUIRED**:
```tsx
// ALWAYS use our Typography components
import { Display, Body } from "@/components/ui/Typography";

<div className="bg-silver-200 p-4 rounded-lg">
  <Display size="lg">Title</Display>
  <Body variant="secondary">Description</Body>
</div>
```

---

## 📦 Required Component Library

### Typography Components (`src/components/ui/Typography.tsx`)

**ALL text must use Typography components. NO exceptions.**

#### Display - Large Headlines
```tsx
import { Display } from "@/components/ui/Typography";

// Page titles, hero text
<Display size="xl">Welcome to LiteWork</Display>
<Display size="lg">Dashboard</Display>
<Display size="md" className="mb-4">Section Title</Display>
```

**Sizes**: `xs | sm | md | lg | xl`

---

#### Heading - Section Headers
```tsx
import { Heading } from "@/components/ui/Typography";

// Section headers, card titles
<Heading level={1}>Athletes Overview</Heading>
<Heading level={2}>Recent Workouts</Heading>
<Heading level={3} className="mb-2">Statistics</Heading>
```

**Levels**: `1 | 2 | 3 | 4 | 5 | 6`  
**Default**: `level={2}`

---

#### Body - Primary Text Content
```tsx
import { Body } from "@/components/ui/Typography";

// Main content, descriptions, paragraphs
<Body size="lg">Important information here.</Body>
<Body>Standard body text.</Body>
<Body variant="secondary">Less emphasized text.</Body>
<Body variant="muted">De-emphasized text.</Body>
```

**Sizes**: `sm | md | lg`  
**Variants**: `primary | secondary | muted`  
**Default**: `size="md"`, `variant="primary"`

---

#### Label - Form Labels & UI Labels
```tsx
import { Label } from "@/components/ui/Typography";

// Form labels, input labels, small headings
<Label htmlFor="email" required>Email Address</Label>
<Label size="lg">Filter Options</Label>
<Label variant="muted">Optional field</Label>
```

**Sizes**: `sm | md | lg`  
**Variants**: `primary | secondary | muted`  
**Props**: `htmlFor`, `required` (adds asterisk)

---

#### Caption - Small Supporting Text
```tsx
import { Caption } from "@/components/ui/Typography";

// Helper text, timestamps, metadata
<Caption>Last updated 5 minutes ago</Caption>
<Caption variant="muted">Optional</Caption>
<Caption className="mt-1">Character limit: 500</Caption>
```

**Variants**: `primary | secondary | muted`

---

#### Link - Clickable Text Links
```tsx
import { Link } from "@/components/ui/Typography";

// Text links (with href) or button links (without href)
<Link href="/profile">View Profile</Link>
<Link onClick={handleAction}>Perform Action</Link>
<Link variant="muted" href="/terms">Terms of Service</Link>
```

**Variants**: `primary | secondary | muted`  
**Behavior**: Renders as `<a>` with href, `<button>` without

---

### Form Components

#### Input (`src/components/ui/Input.tsx`)
```tsx
import { Input } from "@/components/ui/Input";

<Input
  label="Email Address"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="you@example.com"
  error={errors.email}
  required
/>
```

**NEVER use raw `<input>` tags. ALWAYS use our Input component.**

---

#### Textarea (`src/components/ui/Textarea.tsx`)
```tsx
import { Textarea } from "@/components/ui/Textarea";

<Textarea
  label="Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Enter description..."
  rows={4}
  error={errors.description}
/>
```

**NEVER use raw `<textarea>` tags. ALWAYS use our Textarea component.**

---

#### Select (`src/components/ui/Select.tsx`)
```tsx
import { Select } from "@/components/ui/Select";

<Select
  label="Difficulty Level"
  value={difficulty}
  onChange={(e) => setDifficulty(e.target.value)}
  options={[
    { value: "1", label: "Beginner" },
    { value: "2", label: "Intermediate" },
    { value: "3", label: "Advanced" }
  ]}
  error={errors.difficulty}
  required
/>
```

**NEVER use raw `<select>` tags. ALWAYS use our Select component.**

---

### Button Component (`src/components/ui/Button.tsx`)

```tsx
import { Button } from "@/components/ui/Button";

// Primary action
<Button variant="primary" onClick={handleSave}>
  Save Changes
</Button>

// Secondary action
<Button variant="secondary" onClick={handleCancel}>
  Cancel
</Button>

// Destructive action
<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>

// With icon
<Button 
  variant="primary" 
  leftIcon={<Plus className="w-4 h-4" />}
  onClick={handleCreate}
>
  Create Workout
</Button>

// Loading state
<Button variant="primary" loading disabled>
  Saving...
</Button>
```

**Variants**: `primary | secondary | success | danger | ghost`  
**Sizes**: `sm | md | lg`  
**Props**: `loading`, `disabled`, `fullWidth`, `leftIcon`, `rightIcon`

**NEVER create custom styled buttons. ALWAYS use Button component.**

---

### Badge Component (`src/components/ui/Badge.tsx`)

```tsx
import { Badge } from "@/components/ui/Badge";

// Status indicators
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Injured</Badge>
<Badge variant="info">In Progress</Badge>

// With icon
<Badge variant="success" size="sm">
  <CheckCircle className="w-3 h-3" />
  Completed
</Badge>
```

**Variants**: `default | primary | secondary | success | warning | error | info | neutral`  
**Sizes**: `sm | md | lg`

**NEVER create custom badge styles. ALWAYS use Badge component.**

---

### Modal Components (`src/components/ui/Modal.tsx`)

```tsx
import { ModalBackdrop, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/Modal";

<ModalBackdrop isOpen={isOpen} onClose={onClose}>
  <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
    <ModalHeader
      title="Edit Workout"
      icon={<Edit className="w-6 h-6" />}
      onClose={onClose}
    />
    
    <ModalContent>
      {/* Your content here */}
    </ModalContent>
    
    <ModalFooter>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button variant="primary" onClick={handleSave}>Save</Button>
    </ModalFooter>
  </div>
</ModalBackdrop>
```

**NEVER create custom modals. ALWAYS use Modal component structure.**

---

## 🎨 Design Token Usage

### Color System

**NEVER hardcode colors. ALWAYS use design tokens.**

#### Background Colors
```tsx
// ❌ WRONG
<div className="bg-gray-100">

// ✅ CORRECT
<div className="bg-silver-200">
<div className="bg-navy-900">
<div className="bg-primary">
```

#### Text Colors
```tsx
// ❌ WRONG
<span className="text-gray-600">

// ✅ CORRECT - Use Typography components
<Body variant="secondary">
<Caption variant="muted">
```

#### Border Colors
```tsx
// ❌ WRONG
<div className="border border-gray-300">

// ✅ CORRECT
<div className="border border-silver-300">
<div className="border border-navy-700">
```

---

### Spacing System

**Use consistent spacing scale:**

```tsx
// Padding
p-2    // 0.5rem (8px)
p-4    // 1rem (16px)
p-6    // 1.5rem (24px)
p-8    // 2rem (32px)

// Margin
m-2, m-4, m-6, m-8
mb-4, mt-6, etc.

// Gap
gap-2, gap-4, gap-6
```

**NEVER use arbitrary values like `p-[13px]` unless absolutely necessary.**

---

### Typography Scale

**ALWAYS use Typography components. NEVER hardcode font sizes.**

```tsx
// ❌ WRONG
<h1 className="text-3xl font-bold">

// ✅ CORRECT
<Display size="lg">
<Heading level={1}>
```

---

## 🔒 Enforcement Rules

### Code Review Checklist

Before any PR is merged, verify:

- [ ] **NO hardcoded colors** (no `text-blue-500`, `bg-gray-100`, etc.)
- [ ] **NO raw HTML text elements** (no `<h1>`, `<p>`, `<span>` with text)
- [ ] **ALL text uses Typography components** (Display, Heading, Body, Label, Caption, Link)
- [ ] **NO raw form inputs** (no `<input>`, `<textarea>`, `<select>`)
- [ ] **ALL forms use Input/Textarea/Select components**
- [ ] **NO custom buttons** (must use Button component)
- [ ] **NO custom modals** (must use Modal components)
- [ ] **NO custom badges** (must use Badge component)

---

### Automated Checks

**Forbidden patterns** that should fail linting:

```tsx
// ❌ These should trigger warnings/errors
<h1 className="text-2xl font-bold">
<p className="text-gray-600">
<input type="text" className="..." />
<button className="bg-blue-500 text-white px-4 py-2 rounded">
<div className="text-blue-500">
<span className="text-red-600">
```

**Required patterns**:

```tsx
// ✅ These should pass
import { Display, Heading, Body } from "@/components/ui/Typography";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
```

---

## 📚 Migration Guide

### Converting Existing Code

#### Example 1: Text Content
**Before**:
```tsx
<div>
  <h1 className="text-3xl font-bold text-gray-900 mb-4">
    Athletes Dashboard
  </h1>
  <p className="text-gray-600">
    Manage your team and track progress.
  </p>
</div>
```

**After**:
```tsx
import { Display, Body } from "@/components/ui/Typography";

<div>
  <Display size="lg" className="mb-4">
    Athletes Dashboard
  </Display>
  <Body variant="secondary">
    Manage your team and track progress.
  </Body>
</div>
```

---

#### Example 2: Form Fields
**Before**:
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Email Address *
  </label>
  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
  />
  {error && <span className="text-red-600 text-sm">{error}</span>}
</div>
```

**After**:
```tsx
import { Input } from "@/components/ui/Input";

<Input
  label="Email Address"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={error}
  required
/>
```

---

#### Example 3: Buttons
**Before**:
```tsx
<button
  onClick={handleSave}
  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
>
  Save Changes
</button>
```

**After**:
```tsx
import { Button } from "@/components/ui/Button";

<Button variant="primary" onClick={handleSave}>
  Save Changes
</Button>
```

---

## 🎯 Why These Rules?

### 1. **Consistency**
- All text looks the same across the app
- All buttons behave identically
- Predictable user experience

### 2. **Maintainability**
- Change design in one place (component)
- Affects entire application instantly
- No hunting for hardcoded values

### 3. **Accessibility**
- Components built with a11y in mind
- Semantic HTML automatically
- Keyboard navigation built-in

### 4. **Performance**
- Components optimized for performance
- Proper React patterns (memo, hooks)
- Consistent bundle size

### 5. **Type Safety**
- Full TypeScript support
- Catch errors at compile time
- Better IDE autocomplete

---

## 🚀 Quick Reference

### Import Cheatsheet
```tsx
// Typography - ALWAYS use for text
import { 
  Display,    // Hero text, page titles
  Heading,    // Section headers
  Body,       // Main content
  Label,      // Form labels, UI labels
  Caption,    // Helper text, metadata
  Link        // Clickable links
} from "@/components/ui/Typography";

// Forms - ALWAYS use for inputs
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";

// UI Components
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  ModalBackdrop, 
  ModalHeader, 
  ModalContent, 
  ModalFooter 
} from "@/components/ui/Modal";
```

---

## 📞 Questions?

If you're unsure which component to use:

1. **Check existing components** - Look at similar features
2. **Check component documentation** - Read component file comments
3. **Ask in PR review** - Team will guide you
4. **Default to Typography** - When in doubt, use Body or Label

---

## ✅ Examples of Correct Usage

### Dashboard Card
```tsx
import { Heading, Body, Caption } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";

<div className="bg-white rounded-lg p-6 border border-silver-300">
  <Heading level={3} className="mb-2">
    Today's Workouts
  </Heading>
  <Body variant="secondary" className="mb-4">
    You have 3 workouts scheduled for today.
  </Body>
  <div className="flex items-center gap-2">
    <Badge variant="success">2 Completed</Badge>
    <Badge variant="warning">1 Pending</Badge>
  </div>
  <Caption variant="muted" className="mt-4">
    Last updated 5 minutes ago
  </Caption>
</div>
```

### Form Example
```tsx
import { Heading, Body } from "@/components/ui/Typography";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

<form onSubmit={handleSubmit}>
  <Heading level={2} className="mb-4">
    Create Workout
  </Heading>
  
  <Input
    label="Workout Name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="e.g., Upper Body Strength"
    required
  />
  
  <Textarea
    label="Description"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Workout description..."
    rows={4}
  />
  
  <Select
    label="Difficulty"
    value={difficulty}
    onChange={(e) => setDifficulty(e.target.value)}
    options={difficultyOptions}
    required
  />
  
  <div className="flex gap-3 mt-6">
    <Button type="submit" variant="primary">
      Create Workout
    </Button>
    <Button type="button" variant="secondary" onClick={onCancel}>
      Cancel
    </Button>
  </div>
</form>
```

---

## 🎓 Training Resources

- **Component Files**: Study `src/components/ui/` for all available components
- **Design Tokens**: Review `src/styles/tokens.css` for color/spacing values
- **Architecture Guide**: Read `ARCHITECTURE.md` for overall patterns
- **Existing Code**: Look at `src/app/athletes/page.tsx` for real examples

---

## 🔄 Updates to This Guide

This is a living document. When new components are added:

1. Update this guide with usage examples
2. Add to Quick Reference imports
3. Update code review checklist
4. Notify team of new component availability

Last Updated: November 9, 2025
