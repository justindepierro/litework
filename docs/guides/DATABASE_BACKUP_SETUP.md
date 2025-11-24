# Database Backup & Recovery Setup Guide

Complete guide for setting up automated backups and point-in-time recovery for LiteWork's Supabase database.

> **⚠️ IMPORTANT: Supabase Pro Plan Required for Automated Backups**  
> As of 2025, Supabase automated daily backups and PITR both require the **Pro Plan ($25/month)**.  
> Free tier users must rely on **audit trail + manual exports** (Step 3 & 4 below).

## 🎯 Overview

This guide covers:

1. **Supabase Built-in Backups** - Automatic daily backups **(Pro Plan $25/month)**
2. **Point-in-Time Recovery (PITR)** - Restore to any second in time **(Pro Plan $25/month)**
3. **Manual Export/Import** - On-demand database exports **(FREE - Essential for Free tier)**
4. **Audit Trail** - Track all deletions and changes **(FREE)**

---

## 📊 Current Backup Status

### ✅ What We Have Now (FREE):

- **Audit Trail System** - Tracks all deletions and modifications
- **Soft Delete** - Records marked deleted but kept in database
- **Schema Exports** - Manual schema dumps in `/database-export/`

### 🔄 Optional Upgrades to Consider:

- **Automated Backups** - Supabase daily backups **(Requires Pro Plan - $25/month)**
- **Point-in-Time Recovery** - Restore to specific timestamps **(Requires Pro Plan - $25/month)**
- **Offsite Backup Storage** - AWS S3 storage **(~$0.07/month - Optional)**

---

## 1️⃣ Supabase Built-in Backups (Pro Plan Required)

> **⚠️ Requires: Supabase Pro Plan ($25/month)**  
> Free tier does not include automated backups. See Step 3 for manual backup alternatives.

### Enable Automated Daily Backups

1. **Upgrade to Pro Plan**
   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/billing
   - Select **Pro Plan** ($25/month)

2. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   - Click on **Database** → **Backups**

3. **Enable Daily Backups**

   ```
   Settings → Database → Backups

   ✅ Enable automated daily backups
   ✅ Retention: 7 days (Pro) or 30 days (Team)
   ✅ Backup time: 2:00 AM UTC (avoid peak usage)
   ```

4. **Verify Backup Schedule**
   - Backups are stored in Supabase's infrastructure
   - Available for restore via dashboard or API
   - Includes full database snapshot (schema + data)

### Restore from Automated Backup

**Via Supabase Dashboard:**

```
1. Go to Database → Backups
2. Select backup date
3. Click "Restore" → "Create new project from backup"
4. Confirm restoration
```

**Note:** Restoration creates a **new project**, not in-place restore!

---

## 2️⃣ Point-in-Time Recovery (PITR)

### Enable PITR (Pro Plan Required)

**PITR allows you to restore your database to any specific second within the retention period.**

### Setup Steps:

1. **Upgrade to Pro Plan** (if not already)
   - Required for PITR feature
   - Cost: $25/month + usage
   - Enables 7-day PITR window

2. **Enable PITR in Dashboard**

   ```
   Settings → Database → Point-in-Time Recovery

   ✅ Enable PITR
   ✅ Retention: 7 days (Pro) or 30 days (Team)
   ```

3. **How PITR Works**
   - Continuous archiving of Write-Ahead Log (WAL)
   - Can restore to any timestamp within retention window
   - Example: Restore to exactly 10:35:42 AM yesterday

### Restore Using PITR

**Via Supabase Dashboard:**

```
1. Go to Database → Point-in-Time Recovery
2. Select target timestamp (down to the second)
3. Preview changes before restoration
4. Click "Restore to this point"
```

**Via Supabase CLI:**

```bash
# Restore to specific timestamp
supabase db restore \
  --db-url "$DATABASE_URL" \
  --timestamp "2025-11-23T10:35:42Z"
```

### Use Cases for PITR:

- ✅ Accidental bulk deletion (restore 5 minutes before)
- ✅ Data corruption from bad migration
- ✅ Recover from malicious changes
- ✅ Test data recovery without losing recent changes

---

## 3️⃣ Manual Database Exports (FREE - Essential for Free Tier)

> **✅ FREE:** No Supabase Pro plan required  
> **🎯 Essential:** Primary backup method if staying on free tier

### Automated Export Script

We've already set this up! Located at: `scripts/database/export-schema.sh`

**Run Manual Export:**

```bash
cd /Users/justindepierro/Documents/LiteWork
./scripts/database/export-schema.sh
```

**Output:**

- `database-export/schema-dump.sql` - Full schema with tables, functions, RLS
- `database-export/SUMMARY.txt` - Human-readable summary
- `database-export/TABLES_SUMMARY.txt` - Table structure overview

### Schedule Automated Exports (macOS)

**Create LaunchAgent for weekly exports:**

```bash
# Create plist file
cat > ~/Library/LaunchAgents/com.litework.backup.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.litework.backup</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/justindepierro/Documents/LiteWork/scripts/database/export-schema.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Weekday</key>
        <integer>0</integer>
        <key>Hour</key>
        <integer>3</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/Users/justindepierro/Documents/LiteWork/logs/backup.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/justindepierro/Documents/LiteWork/logs/backup.error.log</string>
</dict>
</plist>
EOF

# Load the agent
launchctl load ~/Library/LaunchAgents/com.litework.backup.plist

# Verify it's loaded
launchctl list | grep litework
```

This runs every Sunday at 3:00 AM.

---

## 4️⃣ Offsite Backup Storage

### Option A: AWS S3 Storage (Recommended)

**Setup S3 Bucket:**

```bash
# Install AWS CLI
brew install awscli

# Configure AWS credentials
aws configure

# Create backup bucket
aws s3 mb s3://litework-database-backups

# Enable versioning (keep multiple versions)
aws s3api put-bucket-versioning \
  --bucket litework-database-backups \
  --versioning-configuration Status=Enabled

# Upload backup
aws s3 cp database-export/schema-dump.sql \
  s3://litework-database-backups/backups/$(date +%Y-%m-%d)-schema.sql
```

**Automated S3 Upload Script:**

Create: `scripts/database/backup-to-s3.sh`

```bash
#!/bin/bash
set -e

BACKUP_DIR="database-export"
S3_BUCKET="s3://litework-database-backups/backups"
DATE=$(date +%Y-%m-%d-%H%M)

echo "🔄 Running database export..."
./scripts/database/export-schema.sh

echo "📦 Uploading to S3..."
aws s3 cp "$BACKUP_DIR/schema-dump.sql" \
  "$S3_BUCKET/$DATE-schema.sql"

aws s3 cp "$BACKUP_DIR/SUMMARY.txt" \
  "$S3_BUCKET/$DATE-summary.txt"

echo "✅ Backup uploaded to S3: $DATE"

# Clean up old backups (keep last 30 days)
aws s3 ls "$S3_BUCKET/" | \
  awk '{print $4}' | \
  head -n -30 | \
  xargs -I {} aws s3 rm "$S3_BUCKET/{}"

echo "✅ Old backups cleaned up"
```

### Option B: GitHub Repository Storage

**Automated Git Backup:**

```bash
# Create backup branch
git checkout -b database-backups

# Add backup files
git add database-export/schema-dump.sql
git commit -m "Backup: $(date +%Y-%m-%d)"

# Push to remote
git push origin database-backups

# Return to main
git checkout main
```

### Option C: Dropbox/Google Drive

**Use rclone for cloud storage:**

```bash
# Install rclone
brew install rclone

# Configure Dropbox
rclone config

# Sync backups to Dropbox
rclone sync database-export/ dropbox:LiteWork/backups/
```

---

## 5️⃣ Audit Trail Usage

### Query Recent Deletions

```sql
-- View all deleted invites
SELECT * FROM public.get_deletion_history('invites');

-- View deleted users (athletes)
SELECT * FROM public.get_deletion_history('users');

-- View recent audit activity
SELECT * FROM public.audit_log_summary LIMIT 50;
```

### Restore Soft-Deleted Records

```sql
-- Restore a deleted invite
SELECT public.restore_deleted_invite('invite-uuid-here');

-- Restore a deleted user
UPDATE public.users
SET deleted_at = NULL
WHERE id = 'user-uuid-here';
```

### Check Who Deleted What

```sql
-- Find who deleted specific invite
SELECT
  performed_by_name,
  performed_by_email,
  deleted_at,
  record_data->>'email' as invite_email,
  record_data->>'first_name' as first_name,
  record_data->>'last_name' as last_name
FROM public.get_deletion_history('invites')
WHERE record_id = 'invite-uuid-here';
```

---

## 6️⃣ Recovery Procedures

### Scenario 1: Deleted Invites (Last 24 Hours)

**Use Audit Trail:**

```sql
-- Find recently deleted invites
SELECT * FROM public.get_deletion_history('invites', NULL, 100)
WHERE deleted_at > NOW() - INTERVAL '24 hours';

-- Restore them
SELECT public.restore_deleted_invite('uuid-1');
SELECT public.restore_deleted_invite('uuid-2');
```

### Scenario 2: Deleted Data (Last 7 Days)

**Use PITR (Pro Plan):**

```bash
# Restore to before deletion
supabase db restore \
  --db-url "$DATABASE_URL" \
  --timestamp "2025-11-22T14:30:00Z"
```

### Scenario 3: Major Data Loss

**Use Daily Backup:**

```
1. Go to Supabase Dashboard
2. Database → Backups
3. Select backup from before incident
4. Restore to new project
5. Export specific tables
6. Import into production
```

---

## 7️⃣ Backup Verification

### Test Restoration (Monthly)

```bash
# 1. Create test project
supabase projects create litework-test

# 2. Restore latest backup
# (via dashboard or API)

# 3. Verify data integrity
psql "$TEST_DATABASE_URL" -c "SELECT COUNT(*) FROM invites;"
psql "$TEST_DATABASE_URL" -c "SELECT COUNT(*) FROM users;"

# 4. Delete test project
supabase projects delete litework-test
```

---

## 8️⃣ Cost Estimates

### Free Tier

- **Cost:** $0/month
- **Includes:**
  - Audit trail (deletion tracking)
  - Manual exports (weekly via LaunchAgent)
  - ⚠️ **NO automated backups**
  - ⚠️ **NO PITR**

### Supabase Pro Plan

- **Cost:** $25/month
- **Includes:**
  - ✅ 7-day PITR (restore to any second)
  - ✅ Daily automated backups (7-day retention)
  - ✅ 8GB database
  - ✅ 100GB bandwidth
  - ✅ Audit trail (included)

### AWS S3 Storage (Optional)

- **Cost:** ~$0.023/GB/month
- **Estimate:** 100MB backups × 30 days = ~$0.07/month
- **Negligible cost**

### Total Monthly Cost Options

- **Free Tier:** $0 (audit trail + manual exports only)
- **Pro Plan:** $25/month (automated backups + PITR)
- **Pro + S3:** $25.07/month (automated backups + PITR + offsite storage)

---

## 9️⃣ Recommended Setup

### For Production (Recommended):

✅ **Enable:**

1. Supabase Pro Plan ($25/month) - **Required for automated backups + PITR**
2. Daily automated backups (included with Pro)
3. Weekly exports to S3 ($0.07/month - optional)
4. Audit trail (already implemented - FREE)

✅ **Benefits:**

- ✅ Restore to any second in last 7 days
- ✅ Multiple backup layers
- ✅ Complete deletion tracking
- ✅ Automated daily backups
- 💰 **Cost:** $25.07/month total

### For Development/Budget (Free Tier):

✅ **Enable:**

1. Supabase Free Plan ($0/month)
2. ⚠️ **NO automated backups** (Pro required)
3. Weekly manual exports (local storage - **ESSENTIAL**)
4. Audit trail (already implemented - FREE)

✅ **Benefits:**

- ✅ Zero cost
- ✅ Deletion tracking via audit trail
- ✅ Manual recovery from exports
- ⚠️ **Limitation:** No automated backups, no PITR
- 💰 **Cost:** $0/month

**Recommendation:** Upgrade to Pro for production environments. Manual exports alone are risky.

---

## 🚀 Implementation Checklist

- [ ] **Run audit trail migration:** `database/add-audit-trail.sql` (via Supabase SQL Editor)
- [ ] **Decide on Supabase plan:**
  - [ ] Option A: Upgrade to Pro ($25/month) for automated backups + PITR
  - [ ] Option B: Stay on Free, rely on manual exports (essential!)
- [ ] **If Pro:** Enable daily backups (Supabase Dashboard → Database → Backups)
- [ ] **If Free:** Set up weekly manual exports (LaunchAgent - see Step 3)
- [ ] **Set up S3 bucket** (optional for offsite storage)
- [ ] **Test restoration** (delete test data, restore it)
- [ ] **Test restoration process** (verify it works!)
- [ ] **Document recovery procedures** (update team wiki)
- [ ] **Set calendar reminder:** Monthly backup verification

---

## 📚 Additional Resources

- [Supabase Backup Docs](https://supabase.com/docs/guides/platform/backups)
- [Supabase PITR Guide](https://supabase.com/docs/guides/platform/backups#point-in-time-recovery)
- [PostgreSQL WAL Archiving](https://www.postgresql.org/docs/current/continuous-archiving.html)
- [AWS S3 Backup Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/backup-best-practices.html)

---

## 🆘 Emergency Contacts

- **Supabase Support:** https://supabase.com/dashboard/support
- **Database Issues:** Check `/docs/guides/TROUBLESHOOTING.md`
- **Backup Questions:** Review this document first

---

**Last Updated:** November 23, 2025  
**Next Review:** December 23, 2025
