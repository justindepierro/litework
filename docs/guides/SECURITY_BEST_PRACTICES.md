# Security Best Practices - LiteWork

## 🔒 NEVER Commit These to Git:

### API Keys & Secrets

- ❌ Supabase Service Role Key (`sb_secret_*`)
- ❌ Resend API Key (`re_*`)
- ❌ JWT Secrets
- ❌ VAPID Private Keys
- ❌ CRON Secrets
- ❌ Any password or authentication token
- ❌ Database connection strings with passwords

### Where Secrets SHOULD Be:

- ✅ `.env.local` (gitignored, local development only)
- ✅ Vercel Environment Variables (production)
- ✅ Supabase Dashboard (database keys)
- ✅ Password managers (for team sharing)

## 🛡️ Protection Mechanisms in Place:

### 1. Git Pre-Commit Hook

Located: `.git/hooks/pre-commit`

Automatically scans staged files for:

- Supabase keys (`sb_secret_*`)
- Resend keys (`re_*`)
- JWT secrets
- VAPID keys
- CRON secrets
- Other API key patterns

**BLOCKS commits** if secrets detected!

### 2. .gitignore Protection

Ignores:

- All `.env*` files (except `.env.example`)
- Any file with `secret` in the name
- Key files (`.pem`, `.key`, `.cert`)

### 3. Documentation Guidelines

- All docs use `<placeholder>` format
- Example: `RESEND_API_KEY=<your-resend-api-key>`
- Never hardcode actual values

## 🚨 If You Accidentally Commit Secrets:

### Immediate Actions (DO NOT SKIP):

1. **Rotate ALL exposed keys immediately**
   - Supabase: https://supabase.com/dashboard → API Settings
   - Resend: https://resend.com/api-keys
   - Generate new keys and replace everywhere

2. **Update environment variables**
   - Local: `.env.local`
   - Production: Vercel Environment Variables
   - Redeploy after updating

3. **Remove from Git history** (if needed):

   ```bash
   # Use git-filter-repo or BFG Repo Cleaner
   # WARNING: This rewrites history
   brew install git-filter-repo
   git filter-repo --invert-paths --path FILENAME
   ```

4. **Force push** (coordinate with team):
   ```bash
   git push --force-with-lease origin main
   ```

## ✅ Pre-Commit Checklist:

Before every commit, verify:

- [ ] No API keys in code
- [ ] No secrets in documentation
- [ ] Using placeholders in example files
- [ ] Pre-commit hook is active
- [ ] All secrets in `.env.local` only

## 🔍 Manual Secret Scan:

Run this command to check for secrets:

```bash
# Search for common secret patterns
grep -r "sb_secret_" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.log" .
grep -r "re_[A-Za-z0-9]{20,}" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.log" .
```

## 📋 Rotating Keys Schedule:

**Regular Rotation** (good practice):

- [ ] Every 90 days: Rotate service role keys
- [ ] Every 90 days: Rotate API keys
- [ ] Every 180 days: Rotate JWT secrets
- [ ] After team member leaves: Rotate ALL keys

**Immediate Rotation** (security incident):

- [ ] Key exposed in git commit
- [ ] Key exposed in logs
- [ ] Suspicious activity detected
- [ ] Team member device compromised

## 🎯 Key Management Best Practices:

1. **Use Separate Keys for Environments**
   - Development: Different keys
   - Staging: Different keys
   - Production: Different keys

2. **Principle of Least Privilege**
   - Use anon keys for client-side
   - Use service role only server-side
   - Never expose service role to frontend

3. **Audit Trail**
   - Track when keys were created
   - Track when keys were rotated
   - Monitor key usage in dashboards

4. **Team Access**
   - Use password managers for sharing
   - Don't share via email/Slack
   - Revoke access when not needed

## 🔗 Quick Links:

- Supabase API Keys: https://supabase.com/dashboard/project/lzsjaqkhdoqsafptqpnt/settings/api
- Resend API Keys: https://resend.com/api-keys
- Vercel Env Vars: https://vercel.com/justin-depierros-projects/litework/settings/environment-variables

## 📝 Documentation Standards:

When writing documentation:

✅ **Good:**

```bash
RESEND_API_KEY=<your-resend-api-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

❌ **Bad:**

```bash
RESEND_API_KEY=re_AbCdEfGh1234567890XyZ
SUPABASE_SERVICE_ROLE_KEY=sb_secret_ExAmPlEkEy123456789
```

---

**Last Updated:** November 3, 2025
**Reviewed By:** Security Audit
**Next Review:** February 3, 2026
