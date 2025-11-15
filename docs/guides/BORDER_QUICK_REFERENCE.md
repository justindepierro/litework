# Border & Shadow Design System - Quick Reference

## 🎨 LiteWork Design Philosophy: **Shadow-Only Cards**

**CRITICAL RULE: Cards use shadows for depth, NOT borders.**

### Modern Card Design Pattern

```tsx
// ✅ CORRECT - Shadow-only cards
<div className="bg-white rounded-lg shadow-sm p-4">
<div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
<div className="bg-white rounded-xl shadow-md p-6">

// ❌ FORBIDDEN - Cards with borders
<div className="bg-white rounded-lg border border-gray-300 p-4">
<div className="bg-white rounded-lg border border-DEFAULT p-4">
```

### When to Use Borders

**Borders are ONLY allowed for:**

1. **Form Inputs** - `border-2 border-DEFAULT focus:border-focus`
2. **Section Dividers** - `border-t border-subtle`
3. **Semantic Indicators** - Colored borders for status/meaning
4. **Table Cells** - `border-b border-subtle`

**NEVER use borders for:**

- ❌ Cards
- ❌ Panels
- ❌ Modals
- ❌ Dashboard widgets

---

## Shadow Scale

| Use Case             | Class                       | When to Use                 |
| -------------------- | --------------------------- | --------------------------- |
| Subtle Cards         | `shadow-sm`                 | Default elevation for cards |
| Interactive Elements | `shadow-sm hover:shadow-md` | Clickable cards             |
| Elevated Sections    | `shadow-md`                 | Important content areas     |
| Popovers             | `shadow-lg`                 | Floating elements           |
| Modals               | `shadow-xl` or `shadow-2xl` | Maximum depth and focus     |

---

## Component Patterns

### Cards

```tsx
// Default card
<div className="bg-white rounded-lg shadow-sm p-4">
  {content}
</div>

// Interactive card
<div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4">
  {content}
</div>

// Elevated card
<div className="bg-white rounded-xl shadow-md p-6">
  {content}
</div>
```

### Modals

```tsx
// Modern modal - shadow-only, no border
<div className="bg-white rounded-2xl shadow-2xl max-w-2xl">
  <ModalHeader title="..." onClose={...} />
  <ModalContent>{content}</ModalContent>
  <ModalFooter>{buttons}</ModalFooter>
</div>
```

## 📏 Border Widths

| Class      | Width | Use For                            |
| ---------- | ----- | ---------------------------------- |
| `border`   | 1px   | Default - Cards, containers        |
| `border-2` | 2px   | Emphasis - Inputs, selected states |
| `border-3` | 3px   | Heavy emphasis - Focus indicators  |

## 📐 Border Radius

| Class          | Size   | Use For                       |
| -------------- | ------ | ----------------------------- |
| `rounded-sm`   | 6px    | Small buttons, badges         |
| `rounded-md`   | 8px    | **DEFAULT** - Inputs, buttons |
| `rounded-lg`   | 12px   | Cards, panels                 |
| `rounded-xl`   | 16px   | Large cards                   |
| `rounded-2xl`  | 24px   | Modals                        |
| `rounded-full` | 9999px | Circles, pills                |

## ✅ Common Patterns

```tsx
// Card
<div className="bg-white rounded-lg border border-DEFAULT shadow-sm p-4">

// Interactive Card
<div className="border border-transparent hover:border-accent rounded-lg">

// Input (use component!)
<Input />

// Or manual input
<input className="border-2 border-DEFAULT rounded-md focus:border-focus focus:ring-4 focus:ring-focus/20" />

// Modal
<div className="bg-white rounded-2xl shadow-2xl">

// Divider
<div className="border-t border-subtle" />

// Secondary Button
<button className="border-2 border-strong hover:border-accent rounded-md">
```

## ❌ Don't Use

- `border-silver-300/400/500` → Use `border-DEFAULT` or `border-strong`
- `border-navy-600` → Use `border-strong`
- `border-blue-400/500` → Use `border-focus`
- `border-4`, `border-8` → Only use `border`, `border-2`, `border-3`
- Mixed `rounded-xl` on inputs → Use `rounded-md`

## 🔄 Quick Migrations

| Old                          | New                                    |
| ---------------------------- | -------------------------------------- |
| `border border-silver-300`   | `border border-DEFAULT`                |
| `border-2 border-silver-400` | `border-2 border-strong`               |
| `focus:border-blue-500`      | `focus:border-focus`                   |
| `rounded-lg` (inputs)        | `rounded-md`                           |
| `rounded-xl` (cards)         | `rounded-lg` or `rounded-xl` (depends) |
