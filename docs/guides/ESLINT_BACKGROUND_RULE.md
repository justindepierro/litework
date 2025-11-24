# ESLint Rule Integration - Background Standards

## Custom Rule: no-secondary-background-in-page-container

**Purpose**: Automatically catch and prevent `background="secondary"` usage in PageContainer components at the page level.

**File**: `.eslint/rules/no-secondary-background-in-page-container.js`

---

## Installation Steps

### 1. Install ESLint Plugin for Custom Rules (if not already installed)

```bash
npm install eslint-plugin-local --save-dev
```

### 2. Update ESLint Configuration

**File**: `eslint.config.mjs`

Add the custom rule to your ESLint config:

```javascript
import localRules from "eslint-plugin-local";

export default [
  {
    plugins: {
      local: localRules,
    },
    rules: {
      // Background standards enforcement
      "local/no-secondary-background-in-page-container": "warn",
    },
  },
  // ... your other config
];
```

### 3. Create Plugin Loader (if needed)

**File**: `eslint-plugin-local/index.js`

```javascript
module.exports = {
  rules: {
    "no-secondary-background-in-page-container": require("../.eslint/rules/no-secondary-background-in-page-container"),
  },
};
```

### 4. Test the Rule

```bash
npm run lint
```

---

## What It Does

✅ **Allows**:

```tsx
// ✅ Good - in any file
<PageContainer background="gradient">
<PageContainer background="white">
<PageContainer background="silver">

// ✅ Good - in component files (not pages)
// src/components/MyComponent.tsx
<PageContainer background="secondary">
```

⚠️ **Warns**:

```tsx
// ⚠️ Warning - in page files
// src/app/workouts/page.tsx
<PageContainer background="secondary">
```

---

## Rule Logic

1. **Detects** `<PageContainer>` JSX elements
2. **Checks** for `background="secondary"` prop
3. **Verifies** file is a page (`/app/**/page.tsx` pattern)
4. **Reports** warning if all conditions match

---

## Error Message

```
Avoid background="secondary" in PageContainer for full pages.
Use background="gradient" (default) or "white" instead.
Secondary backgrounds allow body gradient to show through on scrolling pages.
```

---

## Why This Helps

- ✅ **Automatic**: Catches issues during development
- ✅ **Educational**: Error message explains the problem
- ✅ **CI/CD**: Can block PRs with violations
- ✅ **Scalable**: Works as team grows
- ✅ **Preventive**: Stops issues before they reach production

---

## Alternative: Manual Enforcement

If you prefer not to set up the ESLint rule, use this code review checklist:

### Pre-Commit Checklist

```bash
# Search for problematic patterns
grep -r 'PageContainer.*background="secondary"' src/app/

# If any results, fix them to use 'gradient' or 'white'
```

---

## Testing the Rule

### Test File: `src/app/test/page.tsx`

```tsx
import { PageContainer } from "@/components/layout/PageContainer";

// This SHOULD trigger warning
export default function TestPage() {
  return (
    <PageContainer background="secondary">
      <div>Test</div>
    </PageContainer>
  );
}
```

Run: `npm run lint src/app/test/page.tsx`

Expected output:

```
warning  Avoid background="secondary" in PageContainer for full pages...
```

---

## Future Enhancements

### Additional Rules to Consider

1. **Enforce opaque backgrounds on min-h-screen elements**
2. **Warn about hardcoded background colors**
3. **Suggest design token usage**
4. **Check for missing background prop**

---

## Related Documentation

- `docs/guides/LAYOUT_BACKGROUND_STANDARDS.md` - Full standards
- `docs/guides/QUICK_REF_BACKGROUNDS.md` - Quick reference
- `src/components/layout/PageContainer.tsx` - Component JSDoc

---

## Maintenance

**Review Period**: Every 6 months or when design system changes  
**Owner**: Design System Team  
**Status**: Active as of November 23, 2025
