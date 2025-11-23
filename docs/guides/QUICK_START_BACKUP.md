# Audit Trail & Database Backup Setup - Quick Start

## ✅ What We Just Set Up

### 1. Audit Trail System
**File:** `database/add-audit-trail.sql`

Tracks ALL deletions and modifications to:
- ✅ Invites (create, delete, soft-delete, restore, status changes)
- ✅ Users (athlete deletions and restorations)
- ✅ Workout Plans (deletions)

### 2. Database Backup Guide
**File:** `docs/guides/DATABASE_BACKUP_SETUP.md`

Complete setup instructions for:
- ✅ Supabase automated daily backups (free)
- ✅ Point-in-Time Recovery / PITR ($25/month)
- ✅ Offsite backup to AWS S3
- ✅ Recovery procedures

---

## 🚀 Next Steps (Do These Now!)

### Step 1: Run the Audit Trail Migration

**Option A: Supabase SQL Editor (Recommended)**

1. Go to: https://supabase.com/dashboard
2. Select your LiteWork project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `database/add-audit-trail.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Cmd/Ctrl + Enter)
8. Wait for "Success" message

**Option B: Command Line (if you have psql)**

```bash
# Load .env.local variables
export $(cat .env.local | grep -v '^#' | xargs)

# Run migration
psql "$DATABASE_URL" -f database/add-audit-trail.sql
```

**Verify it worked:**
```sql
-- In Supabase SQL Editor, run:
SELECT COUNT(*) FROM audit_trail;

-- Should show 0 (table exists but empty)
```

---

### Step 2: Enable Supabase Backups

**⚠️ NOTE: Automated backups require Supabase Pro Plan ($25/month)**

**If you have Pro Plan:**

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/database
2. Scroll to **Backup and Recovery**
3. Toggle **Enable automated backups**
4. Set backup time: **2:00 AM UTC** (avoids peak usage)
5. Retention: **7 days** (Pro tier)
6. Click **Save**

**If you're on Free Plan:**
- Automated backups are NOT available
- Use manual exports instead (see Step 4)
- Consider upgrading to Pro for backups + PITR

**Verify (Pro only):**
- You'll see "Next backup: [date]" 
- First backup runs tonight at 2 AM

---

### Step 3: Decide on Supabase Pro Plan

**⚠️ IMPORTANT: Automated backups AND PITR both require Pro Plan ($25/month)**

**Do you need Pro Plan?**

✅ **YES, if:**
- You need automated daily backups (7-day retention)
- You need PITR (restore to any second in last 7 days)
- Budget allows $25/month
- This is production with real athlete data
- Peace of mind is worth $25/month

❌ **NO, if:**
- Manual weekly exports are sufficient
- You're okay with relying on audit trail for recent deletions
- This is still in development/testing
- Budget is tight

**To Enable Pro Plan ($25/month):**
1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/billing
2. Click **Upgrade to Pro**
3. Complete billing setup
4. **After upgrade:**
   - Enable automated backups (Settings → Database)
   - Enable PITR (Settings → Database → Point-in-Time Recovery)
5. Set retention: **7 days** for both

---

### Step 4: Set Up Weekly Schema Exports (ESSENTIAL for Free Plan!)

**Automated Local Backups:**

```bash
# Create logs directory
mkdir -p /Users/justindepierro/Documents/LiteWork/logs

# Create LaunchAgent for weekly exports
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

# Test it works
launchctl start com.litework.backup

# Check the log
cat logs/backup.log
```

This runs every **Sunday at 3 AM**.

---

## 📊 What You Get

### Audit Trail (After Migration):

```sql
-- See all recent deletions
SELECT * FROM audit_log_summary 
WHERE action IN ('delete', 'soft_delete') 
ORDER BY performed_at DESC 
LIMIT 20;

-- See who deleted what
SELECT 
  performed_by_name,
  record_name,
  action,
  performed_at
FROM audit_log_summary
WHERE table_name = 'invites'
ORDER BY performed_at DESC;

-- Restore a deleted invite
SELECT restore_deleted_invite('invite-uuid-here');
```

### Daily Backups (Pro Plan Only):

- **⚠️ Requires:** Supabase Pro Plan ($25/month)
- **Location:** Supabase Dashboard → Database → Backups
- **Frequency:** Every day at 2 AM UTC
- **Retention:** 7 days (Pro) or 30 days (Team)
- **Restore:** Creates new project from backup

**Free Plan Alternative:** Weekly manual exports via LaunchAgent (see Step 4)

### PITR (If Enabled):

- **Restore to:** Any second in the last 7 days
- **Use case:** "Restore to 10:35 AM yesterday"
- **Cost:** $25/month (Supabase Pro)

---

## 🆘 How to Recover Deleted Invites

### Scenario 1: Deleted Today (Audit Trail)

```sql
-- Find deleted invites from today
SELECT * FROM get_deletion_history('invites')
WHERE deleted_at::date = CURRENT_DATE;

-- Restore them (run for each UUID)
SELECT restore_deleted_invite('uuid-here');
```

### Scenario 2: Deleted This Week (PITR - Pro Only)

1. Go to: Supabase Dashboard → Database → Point-in-Time Recovery
2. Select timestamp before deletion (e.g., yesterday 2 PM)
3. Click **Restore to this point**
4. Confirm restoration

### Scenario 3: Deleted >7 Days Ago (Daily Backup)

1. Go to: Supabase Dashboard → Database → Backups
2. Select backup from before deletion
3. Click **Restore** → Creates new project
4. Export the deleted records from new project
5. Import into production

---

## ✅ Success Checklist

- [ ] **Audit trail migration run** (via Supabase SQL Editor)
- [ ] **Verify audit_trail table exists** (`SELECT * FROM audit_trail;`)
- [ ] **Decide on backup plan:**
  - [ ] Option A: Upgrade to Pro ($25/month) → Automated daily backups + PITR
  - [ ] Option B: Stay on Free → Set up weekly manual exports (Step 4)
- [ ] **If Pro:** Verify daily backups enabled (Supabase Dashboard → Database → Backups)
- [ ] **If Free:** Set up LaunchAgent for weekly exports (essential!)
- [ ] **Test restoration** (delete test invite, restore it)
- [ ] **Bookmark backup guide** (`docs/guides/DATABASE_BACKUP_SETUP.md`)

---

## 📞 Need Help?

- **Audit Trail Issues:** Check SQL Editor for error messages
- **Backup Questions:** Read full guide in `docs/guides/DATABASE_BACKUP_SETUP.md`
- **Supabase Support:** https://supabase.com/dashboard/support

---

## 💰 Cost Summary

| Feature | Cost | Included |
|---------|------|----------|
| **Audit Trail** | **FREE** | ✅ Deletion tracking + restore |
| **Weekly Manual Exports** | **FREE** | ✅ Local schema backups |
| **Supabase Pro Plan** | **$25/month** | ✅ Daily backups (7 days) + PITR |
| AWS S3 (Optional) | **~$0.07/month** | ✅ Offsite storage |

**Free Tier:** Audit trail + manual exports only (no automated backups)  
**Pro Tier:** Audit trail + automated daily backups + PITR ($25/month)

**Recommended for Production:** Free backups + PITR = **$25/month**

---

**Last Updated:** November 23, 2025
