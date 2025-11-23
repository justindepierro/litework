# Free Tier Backup Setup Checklist

**Decision:** Staying on Supabase Free tier ($0/month)  
**Strategy:** Audit trail + weekly manual exports

---

## ✅ Setup Tasks

### Task 1: Deploy Audit Trail (5 minutes)

1. Open Supabase SQL Editor:
   - https://supabase.com/dashboard
   - Select LiteWork project → **SQL Editor**

2. Copy/paste entire contents of `database/add-audit-trail.sql`

3. Click **Run** button

4. Verify success:
   ```sql
   SELECT COUNT(*) FROM audit_trail;
   -- Should return: 0 (empty table, ready to use)
   ```

**What this gives you:**
- ✅ Tracks ALL deletions (invites, users, workouts)
- ✅ Can restore soft-deleted records instantly
- ✅ See who deleted what and when
- ✅ 90-day audit history

---

### Task 2: Set Up Weekly Backups (2 minutes)

Run this command:
```bash
cd /Users/justindepierro/Documents/LiteWork
./scripts/database/setup-weekly-backups.sh
```

**What this does:**
- ✅ Creates LaunchAgent for weekly backups
- ✅ Runs every Sunday at 3:00 AM
- ✅ Saves to `database-export/schema-dump.sql`
- ✅ Tests backup immediately

**What this gives you:**
- ✅ Weekly database snapshots
- ✅ Schema + structure backups
- ✅ Manual recovery option
- ✅ Zero cost

---

## 🛡️ What You're Protected Against

### With Audit Trail:
✅ **Accidental deletions today** → Restore instantly  
✅ **Who deleted what** → Full accountability  
✅ **Soft-deleted records** → One-command restore  

### With Weekly Exports:
✅ **Database corruption** → Restore from last Sunday  
✅ **Schema changes** → Rollback if needed  
✅ **Local backup** → No reliance on Supabase  

### What You're NOT Protected Against:
⚠️ **Data loss between Sunday backups** → Can't restore to Tuesday  
⚠️ **Automated recovery** → Manual restore process required  
⚠️ **Real-time backup** → Weekly schedule only  

**Acceptable risk for now** → Can upgrade to Pro ($25/month) later if needed

---

## 🧪 Testing Your Backup System

### Test 1: Audit Trail (After Deployment)

```sql
-- 1. Create test invite
INSERT INTO invites (email, first_name, last_name, status)
VALUES ('test@example.com', 'Test', 'User', 'draft');

-- 2. Soft delete it
UPDATE invites 
SET deleted_at = NOW() 
WHERE email = 'test@example.com';

-- 3. Check audit trail
SELECT * FROM audit_log_summary 
WHERE record_name LIKE '%Test User%'
ORDER BY performed_at DESC;

-- 4. Restore it
SELECT restore_deleted_invite(
  (SELECT id FROM invites WHERE email = 'test@example.com')
);

-- 5. Verify restoration
SELECT * FROM invites WHERE email = 'test@example.com';
-- Should show deleted_at = NULL

-- 6. Clean up
DELETE FROM invites WHERE email = 'test@example.com';
```

### Test 2: Weekly Export (After Setup)

```bash
# Verify LaunchAgent is loaded
launchctl list | grep litework

# Check backup file exists
ls -lh database-export/schema-dump.sql

# Check backup log
tail -20 logs/backup.log
```

---

## 📅 Maintenance Schedule

### Daily:
- Nothing! Audit trail runs automatically

### Weekly (Sundays):
- Backup runs automatically at 3 AM
- No action needed

### Monthly:
- Check `logs/backup.log` for any errors
- Verify `database-export/schema-dump.sql` is updating

### Quarterly:
- Test restoration process (see Test 1 above)
- Consider upgrading to Pro if business is growing

---

## 🆘 Recovery Procedures

### Scenario 1: Deleted invite TODAY
```sql
-- Find it
SELECT * FROM get_deletion_history('invites')
WHERE deleted_at::date = CURRENT_DATE;

-- Restore it
SELECT restore_deleted_invite('uuid-from-above');
```

### Scenario 2: Deleted invite THIS WEEK
```sql
-- Find it
SELECT * FROM get_deletion_history('invites')
WHERE deleted_at > NOW() - INTERVAL '7 days';

-- Restore it (if soft-deleted)
SELECT restore_deleted_invite('uuid-from-above');
```

### Scenario 3: Need to restore from LAST SUNDAY
1. Open `database-export/schema-dump.sql`
2. Find the deleted record in the schema
3. Extract the SQL INSERT statement
4. Run it in Supabase SQL Editor

### Scenario 4: Major disaster (database corruption)
1. Create new Supabase project
2. Run `database-export/schema-dump.sql` in new project
3. Point app to new project URL
4. Loses data since last Sunday backup

---

## 💰 Cost Comparison

### Your Choice: Free Tier
- **Cost:** $0/month
- **Coverage:** Audit trail + weekly exports
- **Risk:** Can't restore between backups
- **Effort:** Low (automated)

### Alternative: Pro Plan
- **Cost:** $25/month
- **Coverage:** Everything above + daily backups + PITR
- **Risk:** Minimal (restore to any second)
- **Effort:** Zero (fully automated)

**When to upgrade:**
- Multiple coaches using system
- Critical athlete data (competitions, scholarships)
- High volume of daily changes
- Need compliance/audit requirements
- Business revenue justifies cost

---

## ✅ Final Checklist

- [ ] Audit trail SQL deployed in Supabase
- [ ] Verified `SELECT COUNT(*) FROM audit_trail;` works
- [ ] Ran `./scripts/database/setup-weekly-backups.sh`
- [ ] Verified `launchctl list | grep litework` shows agent
- [ ] Checked `database-export/schema-dump.sql` exists
- [ ] Tested audit trail with test invite (see Test 1 above)
- [ ] Bookmarked this checklist for future reference

---

**✅ You're protected! Free tier backup system is now active.**

Questions? See `docs/guides/DATABASE_BACKUP_SETUP.md` for complete guide.
