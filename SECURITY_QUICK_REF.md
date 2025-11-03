## 🔒 Quick Security Reference

### ✅ Safe to Commit:
- Code files (`.ts`, `.tsx`, `.js`)
- Documentation (`.md`)
- Configuration files **without secrets** (`tsconfig.json`, `next.config.ts`)
- Example files with placeholders (`.env.example`)

### ❌ NEVER Commit:
- `.env.local` (already gitignored)
- Any file with actual API keys
- Documentation with real secrets

### 🛡️ Protections Active:
1. **.gitignore** - Blocks `.env*` and files with `secret` in name
2. **Pre-commit Hook** - Scans for API key patterns
3. **Manual Check** - Run before committing sensitive docs:
   ```bash
   grep -r "sb_secret_\|re_[A-Za-z0-9]{20,}" docs/
   ```

### 🚨 If Secrets Exposed:
1. **Immediately** rotate keys in Supabase & Resend
2. Update Vercel environment variables
3. Update local `.env.local`
4. Redeploy production

### 📋 Where Secrets Live:
- **Local Dev**: `.env.local` (gitignored)
- **Production**: Vercel Environment Variables
- **Never**: Git repository!

---
See `docs/SECURITY_BEST_PRACTICES.md` for complete guide
