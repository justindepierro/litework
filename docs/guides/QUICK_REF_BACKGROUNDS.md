# PageContainer Background - Quick Reference

## 🚦 Traffic Light System

### ✅ GREEN LIGHT (Use These)

```tsx
<PageContainer background="gradient">  // DEFAULT - Most pages
<PageContainer background="white">     // Clean pages
<PageContainer background="silver">    // Elevated content
```

### ⚠️ YELLOW LIGHT (Use With Caution)

```tsx
<PageContainer background="primary">   // OK for pages, but 'gradient' usually better
```

### 🛑 RED LIGHT (Avoid for Full Pages)

```tsx
<PageContainer background="secondary"> // ONLY for small components, NOT full pages
```

---

## 🎯 Decision Tree

```
Need a page background?
├─ Scrolling content list? → gradient
├─ Clean form page? → white
├─ Notifications/Settings? → silver
├─ Small component/card? → secondary
└─ Not sure? → gradient (safe default)
```

---

## 📝 Code Snippet

```tsx
import { PageContainer } from "@/components/layout/PageContainer";

function MyPage() {
  return (
    <PageContainer maxWidth="7xl" background="gradient">
      {/* Your content */}
    </PageContainer>
  );
}
```

---

## 🔍 Testing Checklist

- [ ] Page scrolls beyond viewport
- [ ] No green tint visible
- [ ] Background looks consistent
- [ ] Text has good contrast

---

See `docs/guides/LAYOUT_BACKGROUND_STANDARDS.md` for full documentation.
