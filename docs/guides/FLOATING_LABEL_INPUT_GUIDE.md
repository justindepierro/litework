# FloatingLabelInput Usage Guide

## Overview

Material Design-style floating label inputs with smooth Framer Motion animations. Labels float up and scale down when focused or when the input has a value.

## Components

### FloatingLabelInput

Standard input with floating label.

```tsx
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";

<FloatingLabelInput
  label="Email Address"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>;
```

### FloatingLabelTextarea

Textarea with floating label and optional auto-resize.

```tsx
import { FloatingLabelTextarea } from "@/components/ui/FloatingLabelInput";

<FloatingLabelTextarea
  label="Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  autoResize
  helperText="Describe your workout plan"
/>;
```

## Props

### FloatingLabelInput Props

| Prop         | Type                   | Default      | Description                              |
| ------------ | ---------------------- | ------------ | ---------------------------------------- |
| `label`      | `string`               | **Required** | Label text (floats on focus/value)       |
| `helperText` | `string`               | -            | Helper text below input                  |
| `error`      | `string`               | -            | Error message (red styling)              |
| `success`    | `boolean`              | `false`      | Success state (green check)              |
| `leftIcon`   | `ReactNode`            | -            | Icon on the left side                    |
| `rightIcon`  | `ReactNode`            | -            | Icon on the right side                   |
| `inputSize`  | `'sm' \| 'md' \| 'lg'` | `'md'`       | Size variant                             |
| `fullWidth`  | `boolean`              | `false`      | Stretch to full width                    |
| `type`       | `string`               | `'text'`     | Input type (text, email, password, etc.) |
| `required`   | `boolean`              | `false`      | Show red asterisk                        |

Plus all standard HTML input props (`value`, `onChange`, `placeholder`, `disabled`, etc.)

### FloatingLabelTextarea Props

| Prop         | Type      | Default      | Description                        |
| ------------ | --------- | ------------ | ---------------------------------- |
| `label`      | `string`  | **Required** | Label text (floats on focus/value) |
| `helperText` | `string`  | -            | Helper text below textarea         |
| `error`      | `string`  | -            | Error message (red styling)        |
| `fullWidth`  | `boolean` | `false`      | Stretch to full width              |
| `autoResize` | `boolean` | `false`      | Auto-resize based on content       |
| `required`   | `boolean` | `false`      | Show red asterisk                  |

Plus all standard HTML textarea props.

## Animation Details

**Label Movement**:

- **Default State**: Label centered in input
- **Focused/Has Value**: Label moves up 8px and scales to 85%
- **Transition**: Spring animation (stiffness 300, damping 25)

**Color Transitions**:

- **Default**: Gray (`--color-text-tertiary`)
- **Focused**: Primary blue (`--color-primary`)
- **Error**: Red (`--color-error`)
- **Disabled**: 60% opacity

## Size Variants

### Small (`sm`)

- Height: 48px (12 spacing units)
- Padding: 12px horizontal
- Font: 14px
- Label (floating): 12px

### Medium (`md`) - Default

- Height: 56px (14 spacing units)
- Padding: 16px horizontal
- Font: 16px
- Label (floating): 12px

### Large (`lg`)

- Height: 64px (16 spacing units)
- Padding: 20px horizontal
- Font: 18px
- Label (floating): 14px

## Examples

### Basic Text Input

```tsx
<FloatingLabelInput
  label="Full Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

### Email with Validation

```tsx
<FloatingLabelInput
  label="Email Address"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  success={!errors.email && email.length > 0}
  required
/>
```

### Password with Toggle

```tsx
<FloatingLabelInput
  label="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  helperText="Minimum 8 characters"
  required
/>
```

### With Left Icon

```tsx
import { Mail } from "lucide-react";

<FloatingLabelInput
  label="Email"
  type="email"
  leftIcon={<Mail className="w-5 h-5" />}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>;
```

### With Right Icon

```tsx
import { Search } from "lucide-react";

<FloatingLabelInput
  label="Search Workouts"
  rightIcon={<Search className="w-5 h-5" />}
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>;
```

### Large Size

```tsx
<FloatingLabelInput
  label="Workout Title"
  inputSize="lg"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  fullWidth
/>
```

### Textarea with Auto-Resize

```tsx
<FloatingLabelTextarea
  label="Workout Notes"
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  autoResize
  helperText="Add any special instructions or notes"
/>
```

### Disabled State

```tsx
<FloatingLabelInput
  label="User ID"
  value={userId}
  disabled
  helperText="This field cannot be edited"
/>
```

## Form Example

Complete form using FloatingLabelInput:

```tsx
"use client";

import { useState } from "react";
import {
  FloatingLabelInput,
  FloatingLabelTextarea,
} from "@/components/ui/FloatingLabelInput";
import { Button } from "@/components/ui/Button";

export function WorkoutForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation logic
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FloatingLabelInput
        label="Workout Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        error={errors.title}
        required
        fullWidth
      />

      <FloatingLabelTextarea
        label="Description"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        autoResize
        helperText="Describe the workout and its goals"
        fullWidth
      />

      <FloatingLabelInput
        label="Duration (minutes)"
        type="number"
        value={formData.duration}
        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
        error={errors.duration}
        required
      />

      <Button type="submit" variant="primary" fullWidth>
        Create Workout
      </Button>
    </form>
  );
}
```

## Migration from Standard Input

**Before**:

```tsx
<Input label="Email" value={email} onChange={handleChange} />
```

**After**:

```tsx
<FloatingLabelInput label="Email" value={email} onChange={handleChange} />
```

Key differences:

- Label is now **required** (not optional)
- Label appears **inside** the input (not above)
- No `placeholder` needed (label acts as placeholder)
- Same props and behavior otherwise

## Accessibility

- ✅ Proper `htmlFor` and `id` association
- ✅ Required indicator with asterisk
- ✅ Error states announced
- ✅ Keyboard navigation
- ✅ Screen reader compatible
- ✅ Focus indicators

## Best Practices

1. **Always provide a label** - Material Design pattern requires labels
2. **Use controlled components** - Always pass `value` and `onChange`
3. **Handle validation** - Show errors with `error` prop
4. **Provide helper text** - Guide users with `helperText`
5. **Size appropriately** - Use `lg` for primary actions, `sm` for compact layouts
6. **Full width on mobile** - Set `fullWidth` for responsive forms

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ iOS Safari
- ✅ Chrome Android

Requires Framer Motion support (all modern browsers).

## Performance

- **Optimized animations**: Hardware-accelerated (transform + opacity)
- **No layout thrashing**: Animations don't trigger reflows
- **Lazy labels**: Only animate when necessary
- **Memoized**: Prevents unnecessary re-renders

## TypeScript Support

Full TypeScript support with proper type inference:

```tsx
// Type-safe event handlers
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

// Type-safe refs
const inputRef = useRef<HTMLInputElement>(null);

<FloatingLabelInput ref={inputRef} label="Name" onChange={handleChange} />;
```

## Related Components

- `Input` - Standard input (label above)
- `Textarea` - Standard textarea (label above)
- `Select` - Dropdown select (no floating variant yet)
- `Button` - Form submit buttons

## Questions?

See also:

- `docs/guides/COMPONENT_USAGE_STANDARDS.md` - Component usage guidelines
- `src/components/ui/Input.tsx` - Standard Input component
- `src/lib/animation-variants.ts` - Animation configurations
