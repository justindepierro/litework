# Style System Guidelines - LiteWork

**Last Updated**: November 22, 2025  
**Version**: 2.0

## 🎯 Purpose

This document establishes **strict rules** for using the design system to prevent style inconsistencies, hardcoded colors, and maintenance nightmares like the "yellow background incident" of November 2025.

---

## ⚠️ **GOLDEN RULES - NEVER VIOLATE**

### Rule #1: NO HARDCODED COLORS

**❌ NEVER DO THIS:**
```tsx
// WRONG - Hardcoded hex colors
<div style={{ color: "#ffffff" }}>Text</div>
<div className="bg-[#3b82f6]">Box</div>

// WRONG - Hardcoded CSS
.my-class {
  background-color: #fef3c7;
  color: #1e293b;
}
```

**✅ ALWAYS DO THIS:**
```tsx
// CORRECT - Use Tailwind classes
<div className="text-white">Text</div>
<div className="bg-accent-blue-500">Box</div>

// CORRECT - Use CSS variables
.my-class {
  background-color: var(--color-accent-amber-100);
  color: var(--color-text-primary);
}
```

### Rule #2: SINGLE SOURCE OF TRUTH

**All design tokens live in ONE place:**
- `/src/styles/design-tokens-unified.css` - CSS variables
- `/src/styles/tokens.ts` - TypeScript exports (auto-generated)

**Never create duplicate token definitions elsewhere.**

### Rule #3: USE TAILWIND FIRST, CSS VARIABLES SECOND

**Priority Order:**
1. **Tailwind utility classes** (preferred for 90% of cases)
2. **CSS variables** (for complex or dynamic values)
3. **Component-specific CSS** (only if above don't work)

**❌ NEVER create inline styles with hardcoded values**

---

## 📁 **Style File Structure**

```
src/styles/
├── design-tokens-unified.css   ← SINGLE SOURCE OF TRUTH (all variables)
├── utilities.css               ← Utility classes (references variables)
├── celebrations.css            ← Animation classes (references variables)
└── tokens.ts                   ← TypeScript exports (auto-generated)

src/app/globals.css             ← Main entry (imports above files)
src/components/CriticalCSS.tsx  ← Inline critical CSS (minimal, references variables)
```

**Files DELETED (Legacy):**
- ❌ `critical.css` - Replaced by CriticalCSS component
- ❌ `base.css` - Not needed (Tailwind handles base styles)
- ❌ `components.css` - Not imported (use component-level styles)
- ❌ `archive/` - Old token files (deleted)

---

## 🎨 **How to Use Colors**

### Available Color Systems

#### 1. **Accent Colors** (Brand Colors)
Use for UI elements, highlights, and semantic states:

```css
/* Orange - Energy/Strength */
--color-accent-orange-50 to --color-accent-orange-950

/* Green - Success/Progress */
--color-accent-green-50 to --color-accent-green-950

/* Purple - Premium/Achievement */
--color-accent-purple-50 to --color-accent-purple-950

/* Pink - Motivation */
--color-accent-pink-50 to --color-accent-pink-950

/* Blue - Information/Schedule */
--color-accent-blue-50 to --color-accent-blue-950

/* Amber - Warning */
--color-accent-amber-50 to --color-accent-amber-950

/* Red - Error/Intensity */
--color-accent-red-50 to --color-accent-red-950

/* Teal - Recovery */
--color-accent-teal-50 to --color-accent-teal-950
```

#### 2. **Neutral Colors** (Text & Backgrounds)
```css
/* Navy - Primary text and UI */
--color-navy-50 to --color-navy-900

/* Silver - Borders and secondary text */
--color-silver-100 to --color-silver-900
```

#### 3. **Semantic Colors** (Shorthand)
```css
--color-primary        /* Blue (#3b82f6) */
--color-success        /* Green (#00d4aa) */
--color-warning        /* Amber (#fbbf24) */
--color-error          /* Red (#ef4444) */
--color-info           /* Cyan (#06b6d4) */
```

### Tailwind Class Examples

```tsx
// Background colors
<div className="bg-accent-orange-500">Orange</div>
<div className="bg-accent-green-100">Light green</div>
<div className="bg-silver-200">Light gray</div>

// Text colors
<span className="text-accent-blue-600">Blue text</span>
<span className="text-neutral-700">Gray text</span>
<span className="text-white">White text</span>

// Border colors
<div className="border border-accent-purple-300">Purple border</div>
<div className="border-l-4 border-success">Success left border</div>

// Gradients
<div className="bg-gradient-button-orange">Orange gradient button</div>
<div className="bg-gradient-to-r from-accent-blue-500 to-accent-purple-500">Custom gradient</div>
```

---

## 🚨 **Preventing the "Yellow Background" Problem**

### What Went Wrong (November 2025)

**Problem**: Yellow/amber background appeared on all pages despite multiple fixes.

**Root Cause**: Hardcoded hex colors in multiple places:
1. `CriticalCSS.tsx` - Inline styles with `#fef3c7` and `#fde68a`
2. `utilities.css` - 20+ hardcoded hex colors
3. `celebrations.css` - Hardcoded amber/yellow confetti
4. `Navigation.tsx` - 8 instances of hardcoded `#ffffff`
5. Multiple conflicting CSS files overriding each other

**Why It Happened**:
- Critical CSS loads FIRST (in `<head>`) and overrides everything
- Multiple developers adding inline styles without checking design system
- No documentation on color usage rules

### Prevention Checklist

**Before committing ANY style changes:**

- [ ] ✅ NO hardcoded hex colors (`#ffffff`, `#3b82f6`, etc.)
- [ ] ✅ NO inline `style={{ color: "..." }}` with hardcoded values
- [ ] ✅ Colors use Tailwind classes OR CSS variables
- [ ] ✅ Check `CriticalCSS.tsx` if changing critical styles
- [ ] ✅ Verify changes in browser (hard refresh: Cmd+Shift+R)
- [ ] ✅ Test in incognito mode to rule out caching

---

## 🔍 **Code Review Commands**

Use these to catch violations before merge:

```bash
# Find all hardcoded hex colors in CSS
grep -r "#[0-9a-fA-F]\{3,6\}" src/styles/

# Find all hardcoded hex colors in components
grep -r "color.*#[0-9a-fA-F]\{3,6\}" src/components/

# Find all inline styles with color
grep -r "style.*color:" src/

# Find all rgba() colors (should use CSS variables)
grep -r "rgba(" src/styles/
```

**Expected Result**: ZERO matches (except in `design-tokens-unified.css` and shadows)

---

## 📚 **Common Patterns**

### Pattern 1: Button Colors

```tsx
// ❌ WRONG
<button style={{ backgroundColor: "#ff6b35", color: "#ffffff" }}>
  Click Me
</button>

// ✅ CORRECT
<button className="bg-accent-orange-500 text-white hover:bg-accent-orange-600">
  Click Me
</button>

// ✅ EVEN BETTER - Use Button component
<Button variant="primary">Click Me</Button>
```

### Pattern 2: Status Badges

```tsx
// ❌ WRONG
<span style={{ 
  backgroundColor: "#d1fae5", 
  color: "#059669",
  padding: "4px 8px",
  borderRadius: "4px"
}}>
  Active
</span>

// ✅ CORRECT
<span className="bg-success-light text-success-dark px-2 py-1 rounded">
  Active
</span>

// ✅ EVEN BETTER - Use Badge component
<Badge variant="success">Active</Badge>
```

### Pattern 3: Dynamic Colors

```tsx
// ❌ WRONG
<div style={{ backgroundColor: isActive ? "#00d4aa" : "#ef4444" }}>
  Status
</div>

// ✅ CORRECT
<div className={isActive ? "bg-success" : "bg-error"}>
  Status
</div>

// ✅ EVEN BETTER - Use CSS variable
<div 
  className="p-4 rounded-lg"
  style={{ backgroundColor: `var(--color-${isActive ? "success" : "error"})` }}
>
  Status
</div>
```

### Pattern 4: Gradients

```tsx
// ❌ WRONG
<div style={{ 
  background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)" 
}}>
  Gradient
</div>

// ✅ CORRECT - Use predefined gradient
<div className="bg-gradient-primary">
  Gradient
</div>

// ✅ CORRECT - Use Tailwind gradient utilities
<div className="bg-gradient-to-r from-accent-orange-500 to-accent-pink-500">
  Custom Gradient
</div>

// ✅ CORRECT - Use CSS variable
<div style={{ background: "var(--bg-gradient-primary)" }}>
  Gradient
</div>
```

---

## 🛠️ **Migration Guide**

### Converting Hardcoded Colors to Design System

**Step 1**: Identify the hardcoded color
```tsx
// Found: style={{ color: "#ffffff" }}
```

**Step 2**: Find equivalent in design system
```bash
# Search design tokens file
grep -i "ffffff" src/styles/design-tokens-unified.css
```

**Step 3**: Replace with Tailwind class
```tsx
// Before
<span style={{ color: "#ffffff" }}>Text</span>

// After
<span className="text-white">Text</span>
```

### Common Color Mappings

| Hardcoded Hex | Design System                        | Tailwind Class              |
| ------------- | ------------------------------------ | --------------------------- |
| `#ffffff`     | `var(--color-silver-100)` / white    | `text-white` / `bg-white`   |
| `#3b82f6`     | `var(--color-primary)`               | `text-primary` / `bg-primary` |
| `#ff6b35`     | `var(--color-accent-orange-500)`     | `text-accent-orange-500`    |
| `#00d4aa`     | `var(--color-accent-green-500)`      | `text-accent-green-500`     |
| `#ef4444`     | `var(--color-error)`                 | `text-error` / `bg-error`   |
| `#fbbf24`     | `var(--color-warning)`               | `text-warning`              |
| `#e5e7eb`     | `var(--color-silver-400)`            | `text-silver-400`           |
| `#1e293b`     | `var(--color-navy-800)`              | `text-navy-800`             |

---

## 🎓 **Learning Resources**

### Internal Documentation
- `/design-system` - Live design system page (visual reference)
- `/src/styles/design-tokens-unified.css` - All available tokens (715 lines)
- `COMPONENT_USAGE_STANDARDS.md` - Component best practices

### External Resources
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [CSS Variables (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [OKLCH Color Space](https://oklch.com/) - Used for our accent colors

---

## ✅ **Pre-Commit Checklist**

Copy this checklist for every PR that touches styles:

```markdown
## Style System Compliance

- [ ] NO hardcoded hex colors in CSS files
- [ ] NO hardcoded hex colors in component files
- [ ] NO inline styles with hardcoded colors
- [ ] All colors use Tailwind classes OR CSS variables
- [ ] Tested in browser (hard refresh)
- [ ] Tested in incognito mode
- [ ] Ran grep searches (see "Code Review Commands")
- [ ] Updated design tokens if adding new colors
- [ ] Documented new patterns if introducing custom styles
```

---

## 🚀 **Quick Reference**

### When to Use Each Approach

| Scenario                        | Approach                          | Example                             |
| ------------------------------- | --------------------------------- | ----------------------------------- |
| Static color on standard element | Tailwind class                    | `className="text-accent-orange-500"` |
| Dynamic color based on state    | Conditional Tailwind              | `className={isActive ? "bg-success" : "bg-error"}` |
| Complex gradient                | CSS variable                      | `style={{ background: "var(--bg-gradient-primary)" }}` |
| Programmatic color calculation  | CSS variable with JS              | `style={{ backgroundColor: `var(--color-accent-${color}-500)` }}` |
| Animation color changes         | CSS variable + CSS transition     | See `celebrations.css` patterns     |

### Emergency Debugging

**If colors look wrong:**

1. **Hard refresh**: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
2. **Incognito mode**: Test in new incognito window
3. **Check CriticalCSS**: Look at `/src/components/CriticalCSS.tsx` inline styles
4. **Inspect element**: Check computed styles in DevTools
5. **Search for hardcoded**: Use grep commands above
6. **Clear service worker**: Visit `/clear-sw.html`

---

## 📞 **Questions?**

If you're unsure about color usage:

1. Check `/design-system` page first
2. Look for similar patterns in existing components
3. Search `design-tokens-unified.css` for available tokens
4. Ask in team chat before adding hardcoded colors
5. **When in doubt, use Tailwind classes**

---

**Remember**: Every hardcoded color is a future maintenance problem. Use the design system! 🎨✨
