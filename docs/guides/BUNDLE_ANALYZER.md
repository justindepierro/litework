# Bundle Analyzer Workflow

**Updated:** November 18, 2025

This guide documents how to generate and review bundle size insights for LiteWork using Next.js' built-in analyzer.

## Prerequisites

- `.env.local` configured (same as any build).
- No dev server running on the same port (the analyzer only needs build output).

## Generate Reports

```bash
cd /Users/justindepierro/Documents/LiteWork
ANALYZE=true npm run build -- --webpack
```

### Why `--webpack`?

The Next Bundle Analyzer does not yet support Turbopack. Passing `--webpack` forces the Webpack pipeline so the analyzer can inspect the bundles. Builds remain optimized and respect our existing config.

## Output Locations

After the command finishes, HTML reports are written to:

- `.next/analyze/client.html`
- `.next/analyze/nodejs.html`
- `.next/analyze/edge.html`

Open the relevant file in a browser to inspect module sizes, dynamic chunks, and duplicate dependencies.

## Usage Tips

- Run the analyzer after large dependency additions or when the dashboard/workouts bundles change.
- Capture screenshots of the tree map in PRs that significantly move bundle sizes.
- Combine with `npm run analyze` (Next.js webpack analyzer) if you also need Webpack stats with image optimization enabled.

## Follow-Up Actions

When a module appears disproportionately large:

1. Check whether it can be lazily loaded (e.g., modals, analytics widgets).
2. Ensure shared libraries live in server components when possible (e.g., Supabase admin helpers).
3. Remove unused exports or switch to more targeted imports (e.g., `lucide-react` icons).
4. Document notable findings in the PR description or `docs/reports/PERFORMANCE_BASELINE_NOV_2025.md`.

Keeping reports in `.next/analyze/` out of git ensures local experimentation without polluting the repo. Re-run the command whenever you need fresh data.
