# 🎨 LiteWork Design System Roadmap: "Bulletproof & Beautiful"

**Goal:** Transform our current design token system into an industry-leading, type-safe, and visually stunning architecture that scales effortlessly.

---

## 🏗 Phase 1: Architecture & "Bulletproofing" (Foundation)

_Focus: Organization, Type Safety, and Semantic Integrity_

### 1.1 Token Stratification (The "Three-Layer" Standard)

Currently, we mix primitives and semantics. We will strictly separate them:

- **Primitive Tokens:** Raw values (e.g., `blue-500`, `spacing-4`). _Context-agnostic._
- **Semantic Tokens:** Design intent (e.g., `bg-action-primary`, `text-critical`). _Context-aware._
- **Component Tokens:** Specific to UI elements (e.g., `btn-height-lg`). _Scoped._

### 1.2 File Modularization

Split the monolithic `design-tokens.css` into manageable modules:

- `tokens/primitives/colors.css`
- `tokens/primitives/typography.css`
- `tokens/semantics/theme.css` (Light/Dark mode definitions)
- `tokens/motion.css`

### 1.3 Strict Dark Mode Architecture

Instead of scattered media queries, we will use a **Data Attribute Strategy** (`[data-theme="dark"]`).

- **Action:** Define every semantic token with a light AND dark value in CSS.
- **Status:** ✅ Complete (Tailwind configured with `['selector', '[data-theme="dark"]']`)
- **Benefit:** Instant, flicker-free theme switching and easier testing.

### 1.4 Type-Safe Token Generation

- **Action:** Create a script to parse CSS variables and generate a TypeScript `tokens.ts` file.
- **Status:** ✅ Complete (`scripts/dev/generate-tokens.mjs`)
- **Benefit:** `style={{ color: tokens.semantic.text.primary }}` with full autocomplete.

---

## ✨ Phase 2: Visual Fidelity & "Beauty" (Aesthetics)

_Focus: Modern Color Spaces, Materials, and Motion_

### 2.1 Wide Gamut Colors (P3 / OKLCH)

Move beyond sRGB. Modern devices support wider color ranges.

- **Action:** Define colors using `oklch()` for perceptually uniform gradients and vibrant hues that don't look "muddy" in the middle.
- **Fallback:** Automatic sRGB fallbacks for older browsers.

### 2.2 "Glass" & Material System

Since we adopted the gradient background, we need a robust "Material" system.

- **Tokens:**
  - `--material-glass-thin`: Low blur, high transparency.
  - `--material-glass-thick`: High blur, more opacity (for modals).
  - `--material-surface-raised`: Subtle shadows + slight lightness boost.

### 2.3 Physics-Based Motion

Stop using "ease-in-out". Use spring physics for natural feel.

- **Tokens:**
  - `--motion-spring-bouncy`: For notifications/success states.
  - `--motion-spring-tight`: For UI interactions (checkboxes, buttons).

---

## 🚀 Phase 3: Optimization & "Modernity" (Performance)

_Focus: Fluidity and Loading_

### 3.1 Fluid Spacing System

We implemented fluid typography. Now we need fluid **spacing**.

- **Concept:** `--space-fluid-md` is `1rem` on mobile but `1.5rem` on desktop.
- **Benefit:** No more manual `p-4 md:p-6 lg:p-8` utility chains.

### 3.2 CSS Container Queries

Move component responsiveness away from viewport media queries.

- **Action:** Define tokens relative to _container_ width (`cqw`).
- **Benefit:** A "Card" component looks perfect whether it's in a sidebar or main content area.

### 3.3 Critical CSS Extraction

Ensure only the tokens used on the initial render are loaded in the critical path.

---

## 🛠 Phase 4: Developer Experience (DX)

_Focus: Tooling and Documentation_

### 4.1 VS Code Integration

- **Action:** Configure Tailwind IntelliSense to show the actual color swatch next to the semantic token name (e.g., show the Navy color next to `text-primary`).

### 4.2 Automated "Kitchen Sink"

- **Action:** A route (`/design-system`) that auto-generates a visual reference of all current tokens, pulled directly from the CSS source.
- **Status:** ✅ Complete (Uses `tokens.ts` to render palettes dynamically)

---

## ✅ Completed Milestones

- **Phase 1 (Architecture):** Modularized tokens, strict separation of primitives/semantics.
- **Phase 2 (Visuals):** OKLCH colors, glass materials, physics motion.
- **Phase 3 (Optimization):** Fluid spacing, container queries.
- **Phase 4 (DX):** Kitchen Sink page created at `/design-system`.

## 📋 Immediate Next Steps (Action Plan)

1.  [x] **Audit:** Identify all "hardcoded" hex values remaining in the codebase.
2.  [x] **Split:** Refactor `design-tokens.css` into `primitives` and `semantics`.
3.  [x] **Dark Mode:** Define the dark mode counterparts for our new `brand` and `text-primary` tokens.
4.  [x] **Glass:** Create the `glass` utility class in Tailwind using our new tokens.
