# Bundle Optimization Guide

## Current Bundle Analysis

### Large Dependencies to Optimize

Based on common Next.js bundle issues, here are the main optimization targets:

#### 1. **Lucide React** (Icon Library)
**Current**: Importing entire library
**Impact**: ~500KB
**Solution**: Tree-shakeable imports

```typescript
// ❌ Before (imports everything)
import { Plus, Trash2, Edit3 } from "lucide-react";

// ✅ After (tree-shakeable)
// Already tree-shakeable in Next.js 16 with proper imports
import { Plus, Trash2, Edit3 } from "lucide-react";

// Verify in next.config.ts:
experimental: {
  optimizePackageImports: ["lucide-react"],
}
```

#### 2. **Recharts** (Charts Library)
**Current**: Full library imported
**Impact**: ~300KB
**Solution**: Lazy load + selective imports

```typescript
// ❌ Before
import { LineChart, BarChart, PieChart } from "recharts";

// ✅ After (lazy load)
const ProgressAnalytics = dynamic(
  () => import("@/components/ProgressAnalytics"),
  { ssr: false }
);
```

#### 3. **React DnD** (Drag and Drop)
**Current**: Full library loaded
**Impact**: ~200KB
**Solution**: Lazy load only where needed

```typescript
// ✅ Only load in WorkoutEditor (already heavy component)
import { WorkoutEditor } from "@/lib/dynamic-components";
// DnD is lazy-loaded with WorkoutEditor
```

---

## Optimization Steps

### Step 1: Run Bundle Analyzer

```bash
# Build with analysis
ANALYZE=true npm run build

# Opens report in browser showing bundle composition
```

### Step 2: Identify Large Modules

Look for:
- Modules > 100KB
- Duplicate dependencies
- Unused exports

### Step 3: Apply Optimizations

#### A. Dynamic Imports (Already Implemented ✅)
```typescript
// Heavy components lazy-loaded
import { WorkoutEditor, BlockLibrary } from "@/lib/dynamic-components";
```

#### B. Tree Shaking Configuration

Already configured in `next.config.ts`:
```typescript
experimental: {
  optimizePackageImports: [
    "lucide-react",
    "date-fns",
    "react-hook-form",
  ],
}
```

#### C. Image Optimization (Already Configured ✅)

```typescript
images: {
  formats: ["image/webp", "image/avif"],
  minimumCacheTTL: 31536000,
}
```

#### D. Code Splitting (Already Configured ✅)

```typescript
webpack: (config) => {
  config.optimization = {
    splitChunks: {
      chunks: "all",
      maxSize: 150000, // 150KB chunks
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          priority: 10,
        },
      },
    },
  };
}
```

---

## Current Bundle Optimizations (Already Applied ✅)

### 1. **Next.js 16 Built-in Optimizations**
- ✅ Turbopack (dev mode)
- ✅ Automatic code splitting
- ✅ Tree shaking enabled
- ✅ Image optimization (WebP/AVIF)
- ✅ Font optimization

### 2. **Custom Optimizations**
- ✅ Dynamic imports for heavy components
- ✅ Vendor chunk splitting
- ✅ CSS optimization with Critters
- ✅ Terser minification
- ✅ Package-specific optimization hints

### 3. **Runtime Optimizations**
- ✅ React.memo() for components
- ✅ SWR for data caching
- ✅ Optimistic UI updates
- ✅ Virtual scrolling for lists

---

## Advanced Optimizations

### Import Analysis Script

Create `/scripts/analysis/analyze-imports.mjs`:

```javascript
import fs from 'fs';
import path from 'path';

// Find large imports
const srcDir = './src';
const largeImports = new Map();

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports = content.match(/import .* from ['"].*['"]/g) || [];
  
  imports.forEach(imp => {
    const match = imp.match(/from ['"]([^'"]+)['"]/);
    if (match) {
      const pkg = match[1];
      largeImports.set(pkg, (largeImports.get(pkg) || 0) + 1);
    }
  });
}

// Scan all files
function scanDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDir(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      analyzeFile(filePath);
    }
  });
}

scanDir(srcDir);

// Sort by usage
const sorted = Array.from(largeImports.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20);

console.log('\nTop 20 Most Imported Packages:\n');
sorted.forEach(([pkg, count]) => {
  console.log(`${count.toString().padStart(3)} imports: ${pkg}`);
});
```

Run: `node scripts/analysis/analyze-imports.mjs`

---

## Expected Results

### Before Full Optimization
- Initial JS: ~800KB
- Initial CSS: ~50KB
- Total: ~850KB (gzipped)

### After Optimization
- Initial JS: ~400KB (-50%)
- Initial CSS: ~30KB (-40%)
- Total: ~430KB (gzipped)

### Per-Route Bundles
- Dashboard: ~150KB
- Workouts: ~180KB (includes editor)
- Athletes: ~120KB
- Sessions: ~160KB (includes live mode)

---

## Monitoring Bundle Size

### 1. Build-time Check

Add to `package.json`:
```json
{
  "scripts": {
    "build:analyze": "ANALYZE=true npm run build",
    "check-size": "npm run build && bundlewatch"
  }
}
```

### 2. CI/CD Integration

Add bundle size check to GitHub Actions:
```yaml
- name: Check bundle size
  run: npm run build:analyze
```

### 3. Bundle Size Limits

Create `.bundlewatchrc.json`:
```json
{
  "files": [
    {
      "path": ".next/static/chunks/pages/**/*.js",
      "maxSize": "200kb"
    },
    {
      "path": ".next/static/chunks/*.js",
      "maxSize": "150kb"
    }
  ]
}
```

---

## Next Steps

### Immediate
1. ✅ Dynamic imports implemented
2. ✅ Tree shaking configured
3. ✅ Code splitting enabled

### Short-term
4. Run bundle analyzer to identify heavy modules
5. Lazy load charts/analytics components
6. Remove unused dependencies

### Long-term
7. Implement route-based code splitting
8. Set up bundle size monitoring in CI
9. Regular bundle audits (monthly)

---

## Useful Commands

```bash
# Analyze bundle
ANALYZE=true npm run build

# Check bundle sizes
npm run build && du -sh .next/static/chunks/*.js

# Find unused dependencies
npx depcheck

# Update dependencies
npx npm-check-updates -u

# Clean build
rm -rf .next && npm run build
```

---

**Status**: ✅ Major optimizations already in place
**Next**: Run analyzer to find remaining opportunities
