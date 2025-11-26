# Mobile QA Checklist - Ongoing Quality Assurance

**Purpose**: Ensure all new features maintain mobile responsiveness standards  
**Frequency**: Check before every PR merge  
**Last Updated**: November 26, 2025

---

## 🎯 Quick Check (5 minutes)

Before committing any UI changes:

- [ ] All text uses Typography components (no hardcoded sizes)
- [ ] All buttons >= 44x44px (use `.touch-target` or `size="md"`)
- [ ] Spacing between interactive elements >= 8px
- [ ] Tested on mobile viewport (DevTools or real device)
- [ ] No TypeScript errors (`npm run typecheck`)

---

## 📱 New Component Checklist

When creating a new component:

### Typography ✅

- [ ] Uses `Display`, `Heading`, `Body`, `Label`, or `Caption` components
- [ ] No hardcoded font sizes (`text-2xl`, `text-lg`, etc.)
- [ ] Fluid scaling with responsive breakpoints
- [ ] Readable on mobile (15px+ base text)

### Touch Targets ✅

- [ ] All buttons minimum 44x44px (WCAG Level AAA)
- [ ] Standard buttons use 48x48px (`.touch-target-md`)
- [ ] Workout buttons use 56-64px (`.touch-target-lg/xl`)
- [ ] Icon-only buttons have `aria-label`

### Spacing ✅

- [ ] Minimum 8px between interactive elements
- [ ] Uses `gap-2` (8px), `gap-3` (12px), or `gap-4` (16px)
- [ ] Touch-friendly padding (`p-3`, `p-4`, not `p-1`)
- [ ] Responsive padding (`p-4 md:p-6 lg:p-8`)

### Responsive Design ✅

- [ ] Mobile-first breakpoints (`flex-col md:flex-row`)
- [ ] Works at 320px width (smallest mobile)
- [ ] Tested in portrait and landscape
- [ ] No horizontal overflow

### iOS Support ✅

- [ ] Fixed elements have safe area insets
- [ ] Navigation uses `env(safe-area-inset-*)`
- [ ] Full-screen modes account for notch/Dynamic Island
- [ ] Tested on iPhone simulator or real device

### Accessibility ✅

- [ ] All interactive elements keyboard accessible
- [ ] Proper ARIA labels for icons
- [ ] Focus visible on all focusable elements
- [ ] Screen reader tested (basic check)

---

## 📄 New Page Checklist

When creating a new page:

### Layout ✅

- [ ] Uses `PageContainer` with proper `background` prop
- [ ] Background is opaque (`gradient`, `white`, `silver`)
- [ ] Mobile navigation accessible
- [ ] Bottom padding for mobile nav (if athlete page)

### Content ✅

- [ ] All forms are touch-friendly (Input components)
- [ ] Tables have mobile card layout or horizontal scroll
- [ ] Images are lazy loaded
- [ ] Loading states visible
- [ ] Error states handled gracefully

### Performance ✅

- [ ] Large components lazy loaded
- [ ] Images optimized (Next.js Image component)
- [ ] No unnecessary re-renders
- [ ] Fast on 3G network (test in DevTools)

### Testing ✅

- [ ] Tested at 320px width (iPhone SE)
- [ ] Tested at 768px width (iPad)
- [ ] Tested at 1024px+ width (desktop)
- [ ] Landscape mode works
- [ ] Touch interactions smooth

---

## 🔧 Form Component Checklist

When adding form inputs:

### Input Components ✅

- [ ] Uses `Input`, `Textarea`, or `Select` components
- [ ] Size prop set (`sm`, `md`, `lg`)
- [ ] `fullWidth` prop on mobile
- [ ] Proper `type` (email, tel, number, etc.)
- [ ] Correct `inputMode` for mobile keyboards

### Validation ✅

- [ ] Error messages visible
- [ ] Error states styled correctly
- [ ] Helper text provided
- [ ] Required fields indicated
- [ ] Touch-friendly error recovery

### Accessibility ✅

- [ ] All inputs have labels
- [ ] Proper `autocomplete` attributes
- [ ] ARIA descriptions for complex inputs
- [ ] Keyboard navigation works
- [ ] Focus order is logical

---

## 🎨 Modal Component Checklist

When creating modals:

### Modal Structure ✅

- [ ] Uses `ModalBackdrop`, `ModalHeader`, `ModalContent`, `ModalFooter`
- [ ] Responsive size prop (`sm`, `md`, `lg`, `xl`, `full`)
- [ ] Full-screen on mobile (`w-full h-full sm:w-auto`)
- [ ] Proper scroll behavior (`overflow-y-auto`)

### Interactions ✅

- [ ] Escape key closes modal
- [ ] Backdrop click closes (unless disabled)
- [ ] Close button >= 44x44px
- [ ] Focus trapped inside modal
- [ ] Returns focus on close

### Content ✅

- [ ] All actions are touch-friendly
- [ ] Forms work on mobile
- [ ] Scrollable on small screens
- [ ] Loading states visible
- [ ] Mobile-friendly button layout

---

## 📊 Data Display Checklist

When displaying data tables/lists:

### Tables ✅

- [ ] Horizontal scroll with `.scroll-container-mobile`
- [ ] OR mobile card layout (`.mobile-stack`)
- [ ] Sticky headers (if scrollable)
- [ ] Touch-friendly sort controls
- [ ] Adequate padding in cells

### Lists ✅

- [ ] Card-based layout on mobile
- [ ] Touch-friendly list items (48px height)
- [ ] Swipe actions (if applicable)
- [ ] Loading skeletons
- [ ] Empty states

### Charts ✅

- [ ] Responsive sizing
- [ ] Touch interactions (if interactive)
- [ ] Readable labels on mobile
- [ ] Legend positioning
- [ ] Mobile-friendly tooltips

---

## 🎮 Interactive Elements Checklist

When adding interactive features:

### Buttons ✅

- [ ] Size `md` (48px) or larger
- [ ] Loading states visible
- [ ] Disabled states clear
- [ ] Icon + text (not icon-only without aria-label)
- [ ] Touch feedback (active state)

### Links ✅

- [ ] Minimum 44x44px touch area
- [ ] Clear focus state
- [ ] Underline or distinct styling
- [ ] External links have icon

### Toggles/Switches ✅

- [ ] Large enough to tap (32px+)
- [ ] Clear on/off states
- [ ] Touch-friendly
- [ ] Proper ARIA roles

---

## 🚀 Pre-Deployment Checklist

Before deploying to production:

### Critical Tests ✅

- [ ] `npm run typecheck` passes (0 errors)
- [ ] `npm run build` succeeds
- [ ] All pages tested on real mobile device
- [ ] iOS safe areas work (if fixed elements added)
- [ ] PWA still installable

### Device Testing ✅

- [ ] iPhone (any model)
- [ ] Android phone
- [ ] iPad or tablet
- [ ] Desktop browser

### Network Testing ✅

- [ ] Works on 4G
- [ ] Usable on 3G
- [ ] Offline fallback works (PWA)

### Accessibility ✅

- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Color contrast sufficient
- [ ] Touch targets compliant

---

## 🔍 Code Review Checklist

When reviewing PRs with UI changes:

### Mobile Responsiveness ✅

- [ ] Mobile-first breakpoints used
- [ ] Touch targets >= 44px
- [ ] Spacing adequate (8px+)
- [ ] Safe area support (if needed)

### Component Usage ✅

- [ ] Typography components used (not hardcoded)
- [ ] Form components used (not raw HTML)
- [ ] Button component used (not custom buttons)
- [ ] Modal components used (if applicable)

### Documentation ✅

- [ ] Complex components have JSDoc comments
- [ ] New patterns documented
- [ ] Breaking changes noted
- [ ] Migration guide provided (if needed)

---

## 📱 Device Matrix

Minimum test coverage for each release:

| Device Category | Example Device    | Viewport | Priority |
| --------------- | ----------------- | -------- | -------- |
| Small Phone     | iPhone SE         | 320px    | HIGH     |
| Standard Phone  | iPhone 14         | 390px    | HIGH     |
| Large Phone     | iPhone 14 Pro Max | 430px    | MEDIUM   |
| Small Tablet    | iPad Mini         | 744px    | MEDIUM   |
| Tablet          | iPad Air          | 820px    | LOW      |
| Desktop         | MacBook           | 1440px   | LOW      |

---

## 🎯 Performance Benchmarks

Target metrics for mobile:

| Metric                   | Target  | Acceptable | Critical |
| ------------------------ | ------- | ---------- | -------- |
| First Contentful Paint   | < 1s    | < 2s       | < 3s     |
| Largest Contentful Paint | < 2s    | < 3s       | < 4s     |
| Time to Interactive      | < 3s    | < 5s       | < 7s     |
| Total Blocking Time      | < 200ms | < 400ms    | < 600ms  |
| Cumulative Layout Shift  | < 0.1   | < 0.25     | < 0.4    |

---

## 📊 Ongoing Monitoring

After deployment:

### Analytics to Track ✅

- [ ] Mobile install rate (PWA)
- [ ] Mobile bounce rate
- [ ] Mobile session duration
- [ ] Touch target interaction rate
- [ ] Form completion rate (mobile)
- [ ] Error rate by device type

### User Feedback ✅

- [ ] Mobile-specific bug reports
- [ ] Touch interaction issues
- [ ] Layout problems on specific devices
- [ ] Performance complaints
- [ ] Accessibility issues

---

## 🛠️ Tools & Resources

### Testing Tools

- **Chrome DevTools**: Device simulation, network throttling
- **Safari Responsive Mode**: iOS simulation
- **BrowserStack**: Real device testing
- **Lighthouse**: Performance and accessibility audits
- **axe DevTools**: Accessibility testing

### Documentation

- `docs/MOBILE_RESPONSIVENESS_AUDIT.md` - Complete audit
- `docs/guides/MOBILE_QUICK_REFERENCE.md` - Quick guide
- `docs/guides/COMPONENT_USAGE_STANDARDS.md` - Component standards
- `docs/guides/LAYOUT_BACKGROUND_STANDARDS.md` - Layout standards

### Example Components

- `Button.tsx` - Touch target compliance
- `Input.tsx` - Mobile-friendly forms
- `Modal.tsx` - Full-screen mobile modals
- `Navigation.tsx` - Responsive navigation
- `BottomNav.tsx` - Mobile-only navigation
- `WorkoutLive.tsx` - Gym-optimized UX

---

## ✅ Sign-Off

Before merging any PR with UI changes:

**Developer**:

- [ ] All items in relevant checklists completed
- [ ] Tested on at least 2 device sizes
- [ ] No TypeScript errors
- [ ] Code follows mobile standards

**Reviewer**:

- [ ] Mobile responsiveness verified
- [ ] Touch targets checked
- [ ] Component usage standards met
- [ ] Documentation updated (if needed)

**QA** (before production):

- [ ] Tested on real mobile devices
- [ ] iOS safe areas verified
- [ ] Performance benchmarks met
- [ ] Accessibility validated

---

## 📞 Support

Questions or issues?

1. Check documentation in `docs/guides/`
2. Review example components
3. Consult MOBILE_RESPONSIVENESS_AUDIT.md
4. Ask in team chat with screenshots

---

**Version**: 1.0  
**Last Updated**: November 26, 2025  
**Maintained By**: LiteWork Development Team
