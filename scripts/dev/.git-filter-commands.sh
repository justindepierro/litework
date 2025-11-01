#!/bin/bash
# This will remove VERCEL_ENV_REFERENCE.md from all git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch VERCEL_ENV_REFERENCE.md" \
  --prune-empty --tag-name-filter cat -- --all
