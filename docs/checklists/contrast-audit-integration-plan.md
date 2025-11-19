# Contrast Audit Integration Plan

**Owner**: Frontend Platform Team  
**Last Updated**: November 19, 2025  
**Status**: ✅ Ready to implement

## Purpose

Ensure every pull request runs the enhanced contrast audit (`scripts/analysis/contrast-audit.mjs`) so low-contrast token combinations are blocked before they land in `main`.

## Tooling Summary

- **Command**: `npm run audit:contrast`
- **Scope**: All `.ts` and `.tsx` files under `src/`
- **Coverage**: Tailwind string heuristics **plus** design-token driven checks (`text-(--token)` + `bg-(--token)`).
- **Failure Mode**: Exits with non-zero status when violations are detected (prints affected files/lines and ratios).

## Local Developer Workflow

1. Run `npm install` to ensure `audit:contrast` script is available.
2. Before opening a PR, execute:

   ```bash
   npm run audit:contrast
   ```

3. Address any reported combinations by
   - Switching to higher-contrast tokens (e.g., `text-(--color-error-darkest)` on `bg-(--status-error-light)`), or
   - Adjusting layout/typography (increase font size ≥18px if large text is acceptable).
4. Re-run the audit until it finishes with zero violations.

## CI Integration Steps

1. **Add step to GitHub Actions** (or Vercel/other CI) immediately after `npm run lint`:

   ```yaml
   - name: Contrast audit
     run: npm run audit:contrast
   ```

2. **Mark the step as required** so any violation fails the workflow and blocks the merge.
3. **Surface logs** by annotating the job summary (copy stdout from the script so designers can see ratios without downloading artifacts).
4. **Optional**: expose `AUDIT_STRICT=true` env for nightly runs to treat medium priority heuristics as failures once we expand coverage beyond tokens.

## Rollout Checklist

- [ ] Update CI workflow (`.github/workflows/ci.yml`) with the step above.
- [ ] Notify engineers via #litework-frontend about the new requirement.
- [ ] Add `npm run audit:contrast` to the pre-commit/pre-push git hook (optional for heavy contributors).
- [ ] Document remediation patterns (e.g., preferred replacements for `text-(--status-success)` combos) in `docs/guides/COMPONENT_USAGE_STANDARDS.md`.

## Open Follow-Ups

1. Extend the audit beyond `src/` once shared packages move into `/packages`.
2. Expand the token parser to read future theme files (dark mode) and evaluate contrast per theme.
3. Experiment with automatically flagging token pairs that fall below 7:1 to improve AAA coverage for critical UI.
