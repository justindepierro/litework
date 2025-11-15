# Component Refactoring Quick Start Guide

**Goal**: Replace all hardcoded UI components with our design system components

---

## 🚀 Start Here: 3-Week Plan

### Week 1: Critical Fixes (8-10 hours)

**Priority 🔴 HIGH**: Replace hardcoded selects

#### Day 1: ProgressAnalyticsDashboard.tsx (1 hour)

- **File**: `src/components/ProgressAnalyticsDashboard.tsx`
- **Lines**: 149-189 (3 selects)
- **Impact**: HIGH - Used in analytics

#### Day 2: WorkoutEditor.tsx (30 min)

- **File**: `src/components/WorkoutEditor.tsx`
- **Lines**: 287-302 (1 select)
- **Impact**: HIGH - Core feature

#### Day 3: workouts/history/page.tsx (1 hour)

- **File**: `src/app/workouts/history/page.tsx`
- **Lines**: 351, 371, 387 (3 selects)
- **Impact**: MEDIUM - History viewing

#### Day 4: BulkOperationModal.tsx (1 hour)

- **File**: `src/components/BulkOperationModal.tsx`
- **Already partially uses Select!** - Need to audit and ensure consistency
- **Impact**: HIGH - Bulk operations

#### Day 5: Find and fix remaining selects (2 hours)

```bash
grep -r "<select" src/ --include="*.tsx" | grep -v "src/components/ui/Select.tsx"
```

---

### Week 2: Create Dropdown Component (6-8 hours)

**Priority 🟠 MEDIUM**: Standardize dropdown menus

#### Days 1-2: Build Dropdown Component (4 hours)

**Create**: `src/components/ui/Dropdown.tsx`

**Minimum Viable Product**:

```tsx
// src/components/ui/Dropdown.tsx
import { ReactNode, useState, useRef, useEffect } from "react";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right" | "center";
  width?: "sm" | "md" | "lg" | "auto";
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dropdown({
  trigger,
  children,
  align = "left",
  width = "auto",
  isOpen: controlledOpen,
  onOpenChange,
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen]);

  // Keyboard handler
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, setIsOpen]);

  const widthClasses = {
    sm: "w-48",
    md: "w-64",
    lg: "w-96",
    auto: "w-auto min-w-48",
  };

  const alignClasses = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  };

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={`
          absolute mt-2 ${alignClasses[align]} ${widthClasses[width]}
          bg-white border-2 border-silver-300 rounded-xl shadow-lg
          z-50 overflow-hidden
        `}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// Subcomponents
export function DropdownHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b-2 border-silver-300 bg-silver-100">
      <Heading size="sm">{title}</Heading>
      {action}
    </div>
  );
}

export function DropdownContent({ children }: { children: ReactNode }) {
  return <div className="py-2">{children}</div>;
}

export function DropdownItem({
  children,
  onClick,
  icon,
  variant = "default",
}: {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: "default" | "danger";
}) {
  const variantClasses = {
    default: "hover:bg-silver-100 text-body",
    danger: "hover:bg-error-lightest text-error",
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-2 text-left
        transition-colors duration-150
        ${variantClasses[variant]}
      `}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      <Body>{children}</Body>
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 border-t border-silver-300" />;
}
```

#### Days 3-4: Refactor Top 5 Files (4 hours)

1. NotificationBell.tsx (1 hour)
2. GroupsSection.tsx (30 min)
3. ExerciseItem.tsx (1 hour)
4. KPITagBadge.tsx (1 hour)
5. One more file (30 min)

#### Day 5: Testing & Documentation (1 hour)

- Test click-outside
- Test keyboard (Escape)
- Test positioning
- Write usage docs

---

### Week 3: Toggle & Checkbox (4-6 hours)

**Priority 🟡 LOW-MEDIUM**: Nice-to-have improvements

#### Days 1-2: Toggle Component (2-3 hours)

**Create**: `src/components/ui/Toggle.tsx`

```tsx
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Toggle({
  checked,
  onChange,
  label,
  helperText,
  disabled = false,
  size = "md",
}: ToggleProps) {
  const sizes = {
    sm: "w-9 h-5",
    md: "w-11 h-6",
    lg: "w-14 h-7",
  };

  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative inline-block">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={`
          ${sizes[size]}
          bg-silver-300 rounded-full peer
          peer-checked:bg-primary
          peer-focus:ring-4 peer-focus:ring-primary-lighter
          peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
          transition-colors duration-200
          after:content-[''] after:absolute after:top-0.5 after:left-0.5
          after:bg-white after:rounded-full after:transition-transform
          after:w-4 after:h-4 peer-checked:after:translate-x-5
        `}
        />
      </div>
      {label && (
        <div>
          <Body>{label}</Body>
          {helperText && <Caption variant="muted">{helperText}</Caption>}
        </div>
      )}
    </label>
  );
}
```

**Refactor**: NotificationPreferencesSettings.tsx (3 toggles)

#### Days 3-4: Checkbox Component (2-3 hours)

**Create**: `src/components/ui/Checkbox.tsx`

```tsx
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  error?: boolean;
  indeterminate?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Checkbox({
  checked,
  onChange,
  label,
  helperText,
  disabled = false,
  error = false,
  indeterminate = false,
  size = "md",
}: CheckboxProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={`
          ${sizes[size]}
          rounded border-2
          ${error ? "border-error" : "border-silver-400"}
          text-primary focus:ring-2 focus:ring-primary
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        `}
      />
      {label && (
        <div className="flex-1 -mt-0.5">
          <Body>{label}</Body>
          {helperText && (
            <Caption variant={error ? "error" : "muted"}>{helperText}</Caption>
          )}
        </div>
      )}
    </label>
  );
}
```

**Refactor**:

- ManageGroupMembersModal.tsx
- IndividualAssignmentModal.tsx
- BulkOperationModal.tsx

#### Day 5: Testing & Polish (1 hour)

---

## 📋 Quick Reference: Before & After

### Select Example

```tsx
// ❌ BEFORE
<select
  value={value}
  onChange={(e) => setValue(e.target.value)}
  className="w-full px-3 py-2 border border-silver-400 rounded-lg"
>
  <option value="a">Option A</option>
  <option value="b">Option B</option>
</select>

// ✅ AFTER
<Select
  label="Choose option"
  value={value}
  onChange={setValue}
  options={[
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" }
  ]}
/>
```

### Dropdown Example

```tsx
// ❌ BEFORE
<div className="relative">
  <button onClick={() => setOpen(!open)}>Menu</button>
  {open && (
    <div className="absolute right-0 mt-2 w-48 bg-white border border-silver-400 rounded-lg shadow-lg z-10">
      <button onClick={handleEdit}>Edit</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  )}
</div>

// ✅ AFTER
<Dropdown trigger={<Button>Menu</Button>} align="right">
  <DropdownContent>
    <DropdownItem icon={<Edit />} onClick={handleEdit}>
      Edit
    </DropdownItem>
    <DropdownItem icon={<Trash />} onClick={handleDelete} variant="danger">
      Delete
    </DropdownItem>
  </DropdownContent>
</Dropdown>
```

### Toggle Example

```tsx
// ❌ BEFORE
<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>

// ✅ AFTER
<Toggle
  checked={enabled}
  onChange={setEnabled}
  label="Enable feature"
/>
```

---

## 🔍 Finding Violations

```bash
# Find hardcoded selects
grep -r "<select" src/ --include="*.tsx" | grep -v "src/components/ui/"

# Find custom dropdowns
grep -r "absolute.*right-0.*bg-white.*border.*rounded" src/ --include="*.tsx"

# Find toggle switches
grep -r "peer-checked:after:translate" src/ --include="*.tsx"

# Find raw checkboxes
grep -r 'type="checkbox"' src/ --include="*.tsx" | grep -v "src/components/ui/"
```

---

## ✅ Testing Checklist

After each refactoring:

- [ ] Component renders correctly
- [ ] Styling matches original
- [ ] Interactions work (click, keyboard)
- [ ] Mobile responsive
- [ ] Accessible (tab navigation, screen readers)
- [ ] TypeScript compiles with 0 errors
- [ ] No console errors
- [ ] Visual regression test passed

---

## 📊 Progress Tracking

### Phase 1: Selects (24+ instances)

- [ ] ProgressAnalyticsDashboard.tsx (3)
- [ ] WorkoutEditor.tsx (1)
- [ ] workouts/history/page.tsx (3)
- [ ] BulkOperationModal.tsx (audit needed)
- [ ] Find and fix remaining (15+)

### Phase 2: Dropdowns (15+ instances)

- [ ] Create Dropdown component
- [ ] NotificationBell.tsx (1)
- [ ] GroupsSection.tsx (1)
- [ ] ExerciseItem.tsx (1)
- [ ] KPITagBadge.tsx (1)
- [ ] Find and fix remaining (11+)

### Phase 3: Toggles (8+ instances)

- [ ] Create Toggle component
- [ ] NotificationPreferencesSettings.tsx (3)
- [ ] Find and fix remaining (5+)

### Phase 4: Checkboxes (10+ instances)

- [ ] Create Checkbox component
- [ ] ManageGroupMembersModal.tsx
- [ ] IndividualAssignmentModal.tsx
- [ ] BulkOperationModal.tsx
- [ ] Find and fix remaining (7+)

---

## 🎯 Success Metrics

**Goal**: 100% design system compliance

**Current**: ~20% compliance (Button, Input, Typography only)  
**Target**: 95%+ compliance (all common components)

**Tracking**:

```bash
# Count violations
./scripts/analysis/count-component-violations.sh

# Expected results:
# Week 1 end: 0 hardcoded selects
# Week 2 end: <5 custom dropdowns remaining
# Week 3 end: <3 total violations
```

---

## 📚 Resources

- **Full Audit**: `docs/reports/HARDCODED_COMPONENTS_AUDIT_NOV_14_2025.md`
- **Component Standards**: `docs/guides/COMPONENT_USAGE_STANDARDS.md`
- **Existing Components**: `src/components/ui/`
- **Design Tokens**: `src/styles/tokens.css`

---

**Ready to start?** Pick Week 1, Day 1 and let's go! 🚀
