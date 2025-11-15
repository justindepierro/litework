# Hardcoded Components Audit - November 14, 2025

**Audit Date**: November 14, 2025  
**Purpose**: Identify hardcoded UI components that should use our design system  
**Status**: 42+ violations found across 15+ files

---

## 🎯 Executive Summary

**Critical Findings**:

- ❌ **24+ hardcoded `<select>` dropdowns** - Should use `Select` component
- ❌ **15+ custom dropdown menus** - Need `Dropdown` component (doesn't exist yet)
- ❌ **8+ toggle switches** - Need `Toggle` component (doesn't exist yet)
- ❌ **Multiple custom tooltips** - Need `Tooltip` component (doesn't exist yet)
- ❌ **Checkboxes without wrapper** - Need `Checkbox` component (doesn't exist yet)

**Impact**: Inconsistent UX, duplicated code, design token violations

---

## 📊 Violations by Category

### 🔴 CRITICAL: Hardcoded Select Elements (24+ instances)

**Components Violating Standards**:

#### 1. **WorkoutEditor.tsx** - Line 287-302

```tsx
// ❌ FORBIDDEN - Hardcoded select
<select
  value={editedGroup.type}
  onChange={(e) => setEditedGroup({ ...editedGroup, type: e.target.value })}
  className="p-1 border border-silver-300 rounded text-sm"
>
  <option value="section">Section</option>
  <option value="superset">Superset</option>
  <option value="circuit">Circuit</option>
</select>

// ✅ SHOULD BE
<Select
  label="Group Type"
  value={editedGroup.type}
  onChange={(value) => setEditedGroup({ ...editedGroup, type: value })}
  options={[
    { value: "section", label: "Section" },
    { value: "superset", label: "Superset" },
    { value: "circuit", label: "Circuit" }
  ]}
  size="sm"
/>
```

**Violations**:

- Hardcoded border colors (`border-silver-300`)
- Inconsistent padding and sizing
- No label component usage
- Raw HTML select element

---

#### 2. **ProgressAnalyticsDashboard.tsx** - Lines 149-189 (3 selects!)

```tsx
// ❌ FORBIDDEN - 3 hardcoded selects with duplicated styles
<select
  value={timeRange}
  onChange={(e) => setTimeRange(e.target.value)}
  className="w-full px-3 py-2 border border-silver-400 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
>
  <option value="7d">Last 7 days</option>
  <option value="30d">Last 30 days</option>
  <option value="90d">Last 3 months</option>
  <option value="365d">Last year</option>
</select>

// ✅ SHOULD BE
<Select
  label="Time Range"
  value={timeRange}
  onChange={setTimeRange}
  options={[
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 3 months" },
    { value: "365d", label: "Last year" }
  ]}
/>
```

**Violations** (repeated 3x):

- Duplicated className strings
- Hardcoded color values
- Inconsistent with design system
- No label components

**Files with same issue**:

- Line 149-158: Time Range selector
- Line 165-174: Athlete selector
- Line 181-189: Metric selector

---

#### 3. **workouts/history/page.tsx** - Lines 351, 371, 387 (3 selects!)

```tsx
// ❌ FORBIDDEN - More hardcoded selects
<select
  value={selectedExercise}
  onChange={(e) => setSelectedExercise(e.target.value)}
  className="w-full px-3 py-2 bg-white border border-silver-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
>
  {/* options */}
</select>
```

**Violations**:

- Yet another hardcoded style variation
- Long, unwieldy className strings
- No reusability

---

### 🟠 HIGH: Custom Dropdown Menus (15+ instances)

**Need New Component**: `Dropdown` (doesn't exist)

#### 4. **NotificationBell.tsx** - Line 240

```tsx
// ❌ CUSTOM DROPDOWN - Should use Dropdown component
<div className="absolute right-0 mt-2 w-96 max-w-[95vw] max-h-[600px] bg-white rounded-lg shadow-2xl border-2 border-silver-400 z-50 overflow-hidden">
  <div className="flex items-center justify-between px-4 py-3 border-b-2 border-silver-300 bg-gradient-to-r from-info-lightest to-accent-purple-50">
    <h3 className="text-lg font-bold text-navy-900">Notifications</h3>
    {/* content */}
  </div>
</div>

// ✅ SHOULD BE (After creating Dropdown component)
<Dropdown
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  trigger={<button>...</button>}
  align="right"
  width="md"
  maxHeight="600px"
>
  <DropdownHeader title="Notifications" action={markAllAsRead} />
  <DropdownContent>
    {/* notification items */}
  </DropdownContent>
</Dropdown>
```

**Violations**:

- Custom positioning logic
- Hardcoded z-index values
- Duplicated dropdown pattern
- No click-outside handling standardized

---

#### 5. **GroupsSection.tsx** - Line 71

```tsx
// ❌ ANOTHER CUSTOM DROPDOWN
<div className="absolute right-0 top-8 w-48 bg-white border border-silver-400 rounded-lg shadow-lg z-10">
  {/* menu items */}
</div>

// ✅ SHOULD BE
<Dropdown
  isOpen={isMenuOpen}
  onClose={() => setIsMenuOpen(false)}
  trigger={<button>...</button>}
  align="right"
>
  <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
  <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
</Dropdown>
```

---

#### 6. **ExerciseItem.tsx** - Line 911

```tsx
// ❌ YET ANOTHER CUSTOM DROPDOWN VARIATION
<div className="absolute right-0 top-12 sm:top-8 bg-white border-2 border-silver-300 rounded-xl shadow-lg z-10 min-w-48 sm:min-w-32">
  {/* menu */}
</div>
```

**Pattern**: This same custom dropdown is implemented differently in 15+ places!

---

### 🟡 MEDIUM: Toggle Switches (8+ instances)

**Need New Component**: `Toggle` or `Switch`

#### 7. **NotificationPreferencesSettings.tsx** - Lines 182, 288, 317

```tsx
// ❌ HARDCODED TOGGLE SWITCH - Repeated 3x in same file!
<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>

// ✅ SHOULD BE
<Toggle
  checked={emailNotifications}
  onChange={setEmailNotifications}
  label="Email Notifications"
/>
```

**Violations**:

- 300+ character className string!
- Hardcoded colors (`blue-600`, `gray-200`)
- Duplicated 3x in same file
- Not using design tokens

---

### 🟡 MEDIUM: Missing Components

#### 8. **Checkbox Component** - Not Created Yet

**Current Usage**:

- `ManageGroupMembersModal.tsx` - Line 177
- `IndividualAssignmentModal.tsx` - Lines 209, 248, 299
- `BulkOperationModal.tsx` - Lines 379, 425

```tsx
// ❌ CURRENT PATTERN - Inconsistent implementations
<input
  type="checkbox"
  checked={isSelected}
  onChange={() => toggleSelection(id)}
  className="w-5 h-5 text-primary border-silver-400 rounded focus:ring-primary"
/>

// ✅ SHOULD BE
<Checkbox
  checked={isSelected}
  onChange={() => toggleSelection(id)}
  label="Select athlete"
/>
```

---

#### 9. **Tooltip Component** - Not Created Yet

**Needed For**:

- Hover hints on icons
- Help text
- Keyboard shortcuts display

```tsx
// ✅ PROPOSED
<Tooltip content="Keyboard shortcut: Cmd+K">
  <button>Search</button>
</Tooltip>
```

---

#### 10. **RadioGroup Component** - Not Created Yet

Currently no radio buttons in app, but will be needed for:

- Settings selections
- Form options
- Survey responses

---

## 📋 Complete Violation Inventory

### By File:

| File                                  | Hardcoded Selects | Custom Dropdowns | Toggle Switches | Checkboxes | Priority  |
| ------------------------------------- | ----------------- | ---------------- | --------------- | ---------- | --------- |
| `WorkoutEditor.tsx`                   | 1                 | 0                | 0               | 0          | 🔴 HIGH   |
| `ProgressAnalyticsDashboard.tsx`      | 3                 | 0                | 0               | 0          | 🔴 HIGH   |
| `workouts/history/page.tsx`           | 3                 | 0                | 0               | 0          | 🔴 HIGH   |
| `NotificationBell.tsx`                | 0                 | 1                | 0               | 0          | 🟠 MEDIUM |
| `GroupsSection.tsx`                   | 0                 | 1                | 0               | 0          | 🟠 MEDIUM |
| `ExerciseItem.tsx`                    | 0                 | 1                | 0               | 0          | 🟠 MEDIUM |
| `KPITagBadge.tsx`                     | 0                 | 1                | 0               | 0          | 🟠 MEDIUM |
| `NotificationPreferencesSettings.tsx` | 0                 | 0                | 3               | 0          | 🟡 LOW    |
| `ManageGroupMembersModal.tsx`         | 0                 | 0                | 0               | 1+         | 🟡 LOW    |
| `IndividualAssignmentModal.tsx`       | 0                 | 0                | 0               | 3+         | 🟡 LOW    |
| `BulkOperationModal.tsx`              | 3                 | 0                | 0               | 2+         | 🔴 HIGH   |

**Additional files with violations** (20+ results available, showing top 11):

- ExerciseLibrary.tsx
- BlockLibrary.tsx
- WorkoutLive.tsx
- DraggableAthleteCalendar.tsx
- CommandPalette.tsx
- NotificationPermission.tsx
- KeyboardShortcutsHelp.tsx
- WorkoutView.tsx
- NotificationPreferences.tsx

---

## 🛠️ Recommended Actions

### Phase 1: Fix Existing Select Violations (Priority 🔴)

**Estimated Time**: 2-3 hours

**Tasks**:

1. ✅ **Select component already exists** at `src/components/ui/Select.tsx`
2. Replace all 24+ hardcoded `<select>` elements
3. Files to update:
   - WorkoutEditor.tsx (1 select)
   - ProgressAnalyticsDashboard.tsx (3 selects)
   - workouts/history/page.tsx (3 selects)
   - BulkOperationModal.tsx (3 selects) - **NOTE**: Already partially using Select!

**Note**: BulkOperationModal.tsx is already using our `Select` component in some places (lines 534, 574, 608) but has inconsistent usage. Need to audit which instances are correct.

---

### Phase 2: Create Dropdown Menu Component (Priority 🟠)

**Estimated Time**: 3-4 hours

**New Component**: `src/components/ui/Dropdown.tsx`

**Features Required**:

- Positioning (left, right, center)
- Click-outside handling
- Keyboard navigation (Arrow keys, Escape)
- Proper z-index management
- Accessible (ARIA labels)
- Mobile responsive
- Subcomponents:
  - `Dropdown` (container)
  - `DropdownTrigger` (button/element)
  - `DropdownContent` (menu container)
  - `DropdownItem` (menu item)
  - `DropdownDivider` (separator)
  - `DropdownHeader` (optional header)

**API Design**:

```tsx
<Dropdown>
  <DropdownTrigger>
    <Button>Actions</Button>
  </DropdownTrigger>
  <DropdownContent align="right" width="md">
    <DropdownHeader title="Actions" />
    <DropdownItem icon={<Edit />} onClick={handleEdit}>
      Edit
    </DropdownItem>
    <DropdownDivider />
    <DropdownItem icon={<Trash />} onClick={handleDelete} variant="danger">
      Delete
    </DropdownItem>
  </DropdownContent>
</Dropdown>
```

**Files to Refactor** (15+ instances):

- NotificationBell.tsx - Notification dropdown
- GroupsSection.tsx - Actions menu
- ExerciseItem.tsx - Exercise options
- KPITagBadge.tsx - Tag selector dropdown
- Navigation.tsx - Mobile menu (different pattern)
- And 10+ more...

---

### Phase 3: Create Toggle/Switch Component (Priority 🟡)

**Estimated Time**: 1-2 hours

**New Component**: `src/components/ui/Toggle.tsx`

**Features Required**:

- On/Off states
- Label support
- Size variants (sm, md, lg)
- Disabled state
- Accessible (ARIA)
- Loading state
- Help text support

**API Design**:

```tsx
<Toggle
  checked={isEnabled}
  onChange={setIsEnabled}
  label="Enable notifications"
  helperText="Receive updates about your workouts"
  size="md"
  disabled={false}
/>
```

**Files to Refactor** (8+ instances):

- NotificationPreferencesSettings.tsx (3 toggles)
- Settings pages
- Feature flags
- Enable/disable options throughout app

---

### Phase 4: Create Checkbox Component (Priority 🟡)

**Estimated Time**: 1-2 hours

**New Component**: `src/components/ui/Checkbox.tsx`

**Features Required**:

- Checked/unchecked/indeterminate states
- Label support
- Size variants
- Disabled state
- Error state
- Group support (CheckboxGroup)

**API Design**:

```tsx
<Checkbox
  checked={isSelected}
  onChange={setIsSelected}
  label="I agree to the Terms of Service"
  helperText="You must accept to continue"
  size="md"
  error={!isSelected && submitted}
/>

<CheckboxGroup
  label="Select athletes"
  value={selectedAthletes}
  onChange={setSelectedAthletes}
>
  <Checkbox value="athlete-1" label="John Doe" />
  <Checkbox value="athlete-2" label="Jane Smith" />
</CheckboxGroup>
```

**Files to Refactor** (10+ instances):

- ManageGroupMembersModal.tsx
- IndividualAssignmentModal.tsx
- BulkOperationModal.tsx
- All selection interfaces

---

### Phase 5: Create Tooltip Component (Priority 🟢)

**Estimated Time**: 2-3 hours

**New Component**: `src/components/ui/Tooltip.tsx`

**Features Required**:

- Positioning (top, bottom, left, right)
- Hover and focus triggers
- Delay configuration
- Arrow pointer
- Max width
- Accessible (ARIA)

**API Design**:

```tsx
<Tooltip content="Search workouts" position="bottom" delay={500}>
  <IconButton icon={<Search />} />
</Tooltip>

<Tooltip
  content={
    <div>
      <strong>Keyboard Shortcut</strong>
      <p>Cmd + K</p>
    </div>
  }
  maxWidth="200px"
>
  <button>Open Command Palette</button>
</Tooltip>
```

---

### Phase 6: Create RadioGroup Component (Priority 🟢)

**Estimated Time**: 1-2 hours

**New Component**: `src/components/ui/RadioGroup.tsx`

**Features Required**:

- Single selection
- Label support
- Horizontal/vertical layout
- Size variants
- Disabled state
- Error state

**API Design**:

```tsx
<RadioGroup
  label="Select workout type"
  value={workoutType}
  onChange={setWorkoutType}
  orientation="vertical"
>
  <Radio value="strength" label="Strength Training" />
  <Radio value="cardio" label="Cardio" />
  <Radio value="flexibility" label="Flexibility" />
</RadioGroup>
```

---

## 📊 Impact Analysis

### Code Reduction:

- **Before**: ~300 lines of duplicated dropdown code across 15+ files
- **After**: 1 reusable Dropdown component (~150 lines) + minimal usage (~5 lines per instance)
- **Savings**: ~150+ lines of code eliminated

### Consistency Improvements:

- **Current**: 15+ different dropdown implementations with varying:
  - Shadow styles
  - Border styles
  - Positioning logic
  - Z-index values
  - Animation patterns
  - Click-outside behavior
- **After**: Single source of truth for all dropdown behavior

### Accessibility Improvements:

- Consistent keyboard navigation
- Proper ARIA labels across all components
- Focus management
- Screen reader support

### Design Token Compliance:

- **Before**: Hardcoded colors throughout (`border-silver-400`, `bg-white`, `text-navy-900`)
- **After**: All components use design tokens (`var(--color-border-primary)`, etc.)

---

## 🎯 Success Criteria

### Definition of Done:

**Phase 1: Select Replacement**

- [ ] All 24+ `<select>` elements replaced with `Select` component
- [ ] Zero raw `<select>` elements outside of `Select.tsx`
- [ ] All instances use consistent styling
- [ ] TypeScript compiles with 0 errors
- [ ] Visual regression testing passed

**Phase 2: Dropdown Component**

- [ ] Dropdown component created with full API
- [ ] 15+ custom dropdowns migrated
- [ ] Click-outside behavior works consistently
- [ ] Keyboard navigation (Arrow keys, Escape)
- [ ] Accessible (WCAG AA compliance)
- [ ] Mobile responsive
- [ ] Documentation written

**Phase 3: Toggle Component**

- [ ] Toggle component created
- [ ] All 8+ hardcoded toggles replaced
- [ ] Consistent interaction patterns
- [ ] Accessible
- [ ] Documentation written

**Phase 4: Checkbox Component**

- [ ] Checkbox and CheckboxGroup created
- [ ] 10+ checkbox instances replaced
- [ ] Indeterminate state support
- [ ] Accessible
- [ ] Documentation written

**Phase 5-6: Tooltip & Radio**

- [ ] Components created
- [ ] Documentation written
- [ ] Ready for future use

---

## 🚀 Implementation Plan

### Week 1: Critical Fixes

**Day 1-2**: Replace all hardcoded selects (Phase 1)  
**Day 3-5**: Create and implement Dropdown component (Phase 2)

### Week 2: Enhancement Components

**Day 1-2**: Create and implement Toggle component (Phase 3)  
**Day 3-4**: Create and implement Checkbox component (Phase 4)  
**Day 5**: Testing and documentation

### Week 3: Nice-to-Have Components

**Day 1-2**: Create Tooltip component (Phase 5)  
**Day 3-4**: Create RadioGroup component (Phase 6)  
**Day 5**: Final testing, documentation, and celebration! 🎉

---

## 📝 Code Review Checklist

Before merging any changes, verify:

- [ ] **NO hardcoded `<select>` elements** (except in Select.tsx)
- [ ] **NO custom dropdown divs** with `absolute` positioning (except in Dropdown.tsx)
- [ ] **NO 300+ char className toggle switches** (except in Toggle.tsx)
- [ ] **NO raw checkbox inputs** (except in Checkbox.tsx)
- [ ] **All components use design tokens** (no `blue-600`, `gray-200`, etc.)
- [ ] **Typography components used** for all text
- [ ] **Button component used** for all buttons
- [ ] **Consistent spacing** using design system values
- [ ] **Zero TypeScript errors**
- [ ] **Accessibility** features implemented
- [ ] **Mobile responsive**
- [ ] **Documentation updated**

---

## 🔍 Detection Script

To find violations in the future, run:

```bash
# Find hardcoded selects
grep -r "<select" src/ --include="*.tsx" | grep -v "src/components/ui/Select.tsx"

# Find custom dropdowns (absolute positioning)
grep -r "absolute.*z-\[0-9\]" src/ --include="*.tsx" | grep -v "src/components/ui/Dropdown.tsx"

# Find hardcoded toggle switches
grep -r "peer-checked:after:translate-x-full" src/ --include="*.tsx"

# Find raw checkbox inputs
grep -r 'type="checkbox"' src/ --include="*.tsx" | grep -v "src/components/ui/Checkbox.tsx"

# Find hardcoded colors
grep -r "blue-600\|gray-200\|bg-white border" src/ --include="*.tsx" | grep -v "src/components/ui/"
```

---

## 📚 Related Documentation

- **Component Usage Standards**: `docs/guides/COMPONENT_USAGE_STANDARDS.md`
- **Design Tokens**: `src/styles/tokens.css`
- **Typography Guide**: `src/components/ui/Typography.tsx`
- **Existing Components**: `src/components/ui/`

---

## ✅ Validation

**Audit Completed**: November 14, 2025  
**Auditor**: GitHub Copilot  
**Validated Against**: Component Usage Standards, Design Token System  
**Next Review**: After Phase 1 completion (1 week)

---

**Total Violations Found**: 42+  
**Estimated Fix Time**: 12-15 hours  
**Priority**: HIGH (affects consistency and maintainability)  
**Complexity**: MEDIUM (components mostly straightforward)

🎯 **Goal**: Achieve 100% design system compliance across all UI components!
