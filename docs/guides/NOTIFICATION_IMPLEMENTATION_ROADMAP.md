# 🚀 Notification System Implementation Roadmap

**Project:** LiteWork Notification System (Push + Email)  
**Duration:** 14-20 hours (~2-3 days)  
**Status:** Ready to implement  
**Priority:** High (Phase 3 feature)

---

## 📋 Implementation Phases

### Phase 1: Database Foundation (1-2 hours)

**Goal:** Set up database tables for notification system

#### Tasks

- [ ] Create `push_subscriptions` table
- [ ] Create `notification_preferences` table
- [ ] Create `notification_log` table
- [ ] Add RLS policies
- [ ] Create indexes
- [ ] Test with sample data

#### Script

```bash
# Create migration file
touch scripts/database/create-notification-tables.sql

# Apply migration
psql $DATABASE_URL < scripts/database/create-notification-tables.sql
```

#### Validation

```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%notification%';
```

---

### Phase 2: Push Notifications (4-5 hours)

**Goal:** Implement browser push notifications to athlete phones

#### 2.1 Setup (30 min)

- [ ] Install packages: `npm install web-push`
- [ ] Generate VAPID keys
- [ ] Add to `.env.local`
- [ ] Expose public key to client

```bash
npx web-push generate-vapid-keys

# Add to .env.local:
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:jdepierro@burkecatholic.org"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..." # Same as public key
```

#### 2.2 Server Implementation (2 hours)

- [ ] Create `src/lib/notification-service.ts`
  - `sendPushNotification(userId, payload)`
  - `logNotification()`
  - Error handling for expired subscriptions
- [ ] Create API route: `src/app/api/notifications/subscribe/route.ts`
  - POST: Subscribe device
  - DELETE: Unsubscribe device
- [ ] Create API route: `src/app/api/notifications/send/route.ts`
  - POST: Send notification (admin/testing)

#### 2.3 Client Implementation (1.5 hours)

- [ ] Create `src/components/NotificationPermission.tsx`
  - Permission request UI
  - Subscribe/unsubscribe logic
  - VAPID key conversion helper
  - Device name detection
- [ ] Update service worker (`public/sw.js`)
  - Already has push handlers! ✅
  - Test notification display
- [ ] Add to dashboard or onboarding flow

#### 2.4 Testing (1 hour)

- [ ] Test on localhost with ngrok (HTTPS required)
- [ ] Test on iOS Safari (PWA only)
- [ ] Test on Android Chrome
- [ ] Test notification actions (View/Dismiss)
- [ ] Test expired subscription handling

**Deliverable:** Working push notifications to phones

---

### Phase 3: Email Service (3-4 hours)

**Goal:** Send transactional emails via Resend

#### 3.1 Setup (30 min)

- [ ] Create Resend account (free)
- [ ] Get API key
- [ ] Add to `.env.local`
- [ ] Install package: `npm install resend`

```bash
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="LiteWork <noreply@litework.app>"
```

#### 3.2 Email Service (2 hours)

- [ ] Create `src/lib/email-service.ts`
  - `sendEmail(params)`
  - `sendEmailToUser(userId, params)`
  - `logEmail()`
- [ ] Create email templates:
  - `workoutAssignmentEmail()`
  - `coachMessageEmail()`
  - `workoutReminderEmail()`
  - `weeklyProgressEmail()`
  - `athleteInviteEmail()`
- [ ] Design responsive HTML layout
  - Base layout with header/footer
  - Button styles
  - Mobile-friendly

#### 3.3 API Routes (30 min)

- [ ] Create `src/app/api/emails/send/route.ts`
  - Template-based sending
  - Permission check

#### 3.4 Testing (1 hour)

- [ ] Send test emails
- [ ] Verify delivery in Resend dashboard
- [ ] Test on mobile email clients
- [ ] Check spam folder placement
- [ ] Test all templates

**Deliverable:** Working email system with templates

---

### Phase 4: Integration (2-3 hours)

**Goal:** Connect notifications to existing features

#### 4.1 Notification Dispatcher (1.5 hours)

- [ ] Create `src/lib/notification-dispatcher.ts`
  - `notifyUser()` - sends to both channels
  - Check user preferences
  - Handle failures gracefully
- [ ] Helper functions:
  - `shouldSendPush(prefs, category)`
  - `shouldSendEmail(prefs, category)`
  - `getUserById()`
  - `getNotificationPreferences()`

#### 4.2 Feature Integration (1.5 hours)

- [ ] **Workout Assignments** (`src/app/api/assignments/route.ts`)
  - Send notification after assignment
  - Include workout details
  - Link to workout view
- [ ] **Coach Messages** (`src/app/api/messages/route.ts`)
  - Send notification on new message
  - Include message preview
  - Link to messages page

- [ ] **Bulk Operations** (`src/app/api/bulk-operations/route.ts`)
  - Batch notifications for group assignments
  - Progress tracking for large sends

**Deliverable:** Notifications working for core features

---

### Phase 5: User Interface (2-3 hours)

**Goal:** Let users manage notification preferences

#### 5.1 Notification Settings Page (2 hours)

- [ ] Create `src/app/settings/notifications/page.tsx`
  - Channel toggles (Push/Email)
  - Category preferences:
    - Workout reminders
    - Assignment notifications
    - Message notifications
    - Progress updates
    - Achievements
  - Device management (list subscribed devices)
  - Quiet hours (optional)
  - Test notification button

#### 5.2 Navigation & UX (1 hour)

- [ ] Add to navigation menu
- [ ] Add notification bell icon to header
- [ ] Onboarding prompt for permissions
- [ ] Dashboard widget for notification status

**Deliverable:** Complete notification settings UI

---

## 🎯 Success Criteria

### Must Have (MVP)

- ✅ Push notifications reach athlete phones
- ✅ Emails deliver to inbox (not spam)
- ✅ Notifications sent on workout assignment
- ✅ Notifications sent on coach messages
- ✅ User can enable/disable each channel
- ✅ Expired subscriptions auto-removed
- ✅ All notifications logged

### Nice to Have (Phase 3+)

- ⬜ Notification center (in-app list)
- ⬜ Quiet hours (don't send at night)
- ⬜ Workout reminders (30 min before)
- ⬜ Weekly progress emails
- ⬜ Achievement notifications (PRs)
- ⬜ Rich notifications (images, progress bars)

---

## 🧪 Testing Checklist

### Push Notifications

- [ ] Permission request works
- [ ] Subscription saves to database
- [ ] Notification appears on phone
- [ ] Click opens correct page
- [ ] Actions (View/Dismiss) work
- [ ] Multiple devices per user work
- [ ] Expired subscriptions handled
- [ ] Works offline (queued)

### Email Notifications

- [ ] Emails deliver successfully
- [ ] Links work correctly
- [ ] Unsubscribe link present
- [ ] Mobile rendering good
- [ ] Desktop rendering good
- [ ] Plain text fallback works
- [ ] Not marked as spam

### Integration

- [ ] Workout assignment → notification sent
- [ ] Coach message → notification sent
- [ ] Preferences respected
- [ ] Both channels work simultaneously
- [ ] Failures logged properly
- [ ] No duplicate notifications

---

## 📊 Monitoring & Metrics

### Key Metrics to Track

```sql
-- Daily notification stats
SELECT
  DATE(sent_at) as date,
  type,
  category,
  COUNT(*) as total,
  SUM(CASE WHEN delivered THEN 1 ELSE 0 END) as delivered,
  SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as clicked
FROM notification_log
WHERE sent_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(sent_at), type, category
ORDER BY date DESC;
```

### Success Indicators

- **Delivery Rate:** >95%
- **Click-Through Rate:** >20%
- **Opt-out Rate:** <5%
- **Subscription Growth:** Steady increase

---

## 🚨 Rollout Plan

### Week 1: Internal Testing

- Implement Phase 1-3
- Test with coach accounts
- Fix critical bugs
- Refine templates

### Week 2: Beta Testing

- Implement Phase 4-5
- Invite 10-20 athletes
- Gather feedback
- Monitor metrics

### Week 3: Full Launch

- Enable for all users
- Announce new feature
- Create help docs
- Monitor support tickets

---

## 📚 Documentation Delivered

1. ✅ **NOTIFICATION_SYSTEM_GUIDE.md** - Complete technical guide
2. ✅ **EMAIL_NOTIFICATION_GUIDE.md** - Email-specific documentation
3. ✅ **IMPLEMENTATION_ROADMAP.md** - This file

---

## 💡 Quick Start Commands

```bash
# 1. Install dependencies
npm install web-push resend

# 2. Generate VAPID keys
npx web-push generate-vapid-keys

# 3. Create database tables
psql $DATABASE_URL < scripts/database/create-notification-tables.sql

# 4. Add to .env.local
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:your-email"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
RESEND_API_KEY="re_..."

# 5. Start implementing Phase 2!
```

---

## 🎓 Learning Resources

- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [Service Worker Cookbook](https://serviceworke.rs/)
- [Resend Documentation](https://resend.com/docs)
- [Email Design Guide](https://www.campaignmonitor.com/dev-resources/guides/email-design/)

---

## ❓ FAQ

**Q: Will push notifications work on iPhone?**  
A: Yes! But only when LiteWork is installed as a PWA (Add to Home Screen). iOS 16.4+ required.

**Q: How much will this cost?**  
A: Free for <100 athletes! Resend gives 3,000 emails/month free. Push is always free.

**Q: What if a user's email bounces?**  
A: Resend tracks bounces automatically. We log it and can disable email for that user.

**Q: Can users opt out?**  
A: Yes! Full preference controls in settings. Unsubscribe link in every email.

**Q: What about GDPR/privacy?**  
A: We only send transactional emails (no marketing). Push subscriptions are opt-in. All compliant.

---

**Ready to implement?** Start with Phase 1! 🚀

**Questions?** Check the detailed guides:

- Technical details → `NOTIFICATION_SYSTEM_GUIDE.md`
- Email specifics → `EMAIL_NOTIFICATION_GUIDE.md`

---

**Last Updated:** November 2, 2025  
**Version:** 1.0.0  
**Status:** ✅ Ready for Implementation
