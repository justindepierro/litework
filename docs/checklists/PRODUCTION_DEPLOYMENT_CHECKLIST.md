# LiteWork - Production Deployment Checklist

**Date**: October 31, 2025  
**Status**: Ready for Production Rollout

---

## ✅ Pre-Deployment Testing (Do This First!)

### 1. Test Authentication Flow

**Test Login/Signup:**

```
1. Go to http://localhost:3000/login
2. Test Supabase authentication:
   - Sign up with a coach account
   - Verify email confirmation works
   - Test login with credentials
   - Test password reset flow
```

**Expected Results:**

- ✅ Authentication redirects to dashboard
- ✅ User profile created in database
- ✅ Session persists across page refreshes

### 2. Test Athlete Management

**Test Athlete Invitations:**

```
1. Navigate to /athletes
2. Click "Invite Athlete"
3. Fill in name and email
4. Verify invitation created
```

**Expected Results:**

- ✅ Empty state shows: "No athletes yet"
- ✅ Invitation form works
- ✅ Athletes list updates after invitation

### 3. Test Group Management

**Test Group Creation:**

```
1. Navigate to /dashboard (CalendarView section)
2. Click "Create Group"
3. Enter group details:
   - Name: "Test Group"
   - Sport: "Football"
   - Category: "Varsity"
   - Pick a color
4. Save group
```

**Expected Results:**

- ✅ Group appears in dropdown
- ✅ Empty groups show proper message
- ✅ Can edit/delete test group

### 4. Test Workout Creation

**Test WorkoutEditor:**

```
1. Navigate to /workouts
2. Click "Create Workout"
3. Add workout details:
   - Name: "Test Upper Body"
   - Add exercises from library
   - Set sets, reps, weights
   - Save workout
```

**Expected Results:**

- ✅ Workout editor opens
- ✅ Exercise library loads
- ✅ Can add multiple exercises
- ✅ Workout saves successfully

### 5. Test Workout Assignment

**Test Group Assignment:**

```
1. With a workout and group created
2. Click "Assign to Group"
3. Select group, date, time
4. Assign workout
```

**Expected Results:**

- ✅ Assignment appears in calendar
- ✅ Athletes see assigned workout
- ✅ Can view workout details

### 6. Test Mobile Responsiveness

**Test on Different Devices:**

```
1. Chrome DevTools → Toggle device toolbar
2. Test on:
   - iPhone 14 Pro (390 x 844)
   - iPad Air (820 x 1180)
   - Desktop (1920 x 1080)
3. Check touch interactions
4. Test PWA install prompt
```

**Expected Results:**

- ✅ All pages responsive
- ✅ Touch targets large enough
- ✅ Navigation works on mobile
- ✅ No horizontal scrolling

---

## 🌐 Domain Setup (Step-by-Step)

### Option A: Use Existing Vercel Domain

**Current Deployment:**

- URL: `https://litework-p6uw3kn0c-justin-depierros-projects.vercel.app`
- Status: Active
- Environment: Production

**Quick Deploy:**

```bash
git push origin main
# Vercel will auto-deploy
```

### Option B: Configure Custom Domain (Recommended)

**Step 1: Purchase Domain**

Recommended registrars:

- Namecheap (namecheap.com)
- Google Domains (domains.google)
- Cloudflare (cloudflare.com)

**Suggested domains:**

- litework.app
- litework.fit
- [yourschool]-weights.com

**Step 2: Add Domain to Vercel**

1. Go to Vercel Dashboard
2. Select LiteWork project
3. Go to Settings → Domains
4. Click "Add Domain"
5. Enter your domain (e.g., litework.app)
6. Vercel will provide DNS records

**Step 3: Configure DNS**

Add these records at your registrar:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Step 4: Verify Domain**

- Wait 5-60 minutes for DNS propagation
- Vercel will auto-provision SSL certificate
- HTTPS will be enabled automatically

**Step 5: Update Environment Variables**

In Vercel Dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 🔐 Environment Configuration

### Required Environment Variables in Vercel

```env
# Supabase (from your Supabase project settings)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### How to Set Variables in Vercel:

1. Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add each variable:
   - Key: Variable name
   - Value: Variable value
   - Environment: Production (check all if needed)
4. Click "Save"
5. Redeploy to apply changes

---

## 🚀 Deployment Process

### Method 1: Automatic Deployment (Recommended)

```bash
# Commit your changes
git add .
git commit -m "feat: ready for production rollout"

# Push to main branch
git push origin main

# Vercel auto-deploys from main branch
# Watch deployment at vercel.com/dashboard
```

### Method 2: Manual Deployment

```bash
# Install Vercel CLI if not already
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Deployment Checklist:

- [ ] All environment variables set in Vercel
- [ ] Supabase production database ready
- [ ] Custom domain configured (if using)
- [ ] SSL certificate active
- [ ] All tests passed locally
- [ ] No TypeScript/build errors
- [ ] Service worker updated

---

## 👥 Athlete Onboarding Plan

### Phase 1: Coach Setup (You - Day 1)

**Initial Setup:**

1. Create your coach account
2. Set up athlete groups:
   - By sport (Football, Volleyball, etc.)
   - By position (Linemen, Receivers, etc.)
   - By skill level (Varsity, JV, etc.)
3. Create 2-3 initial workouts
4. Test full workflow end-to-end

### Phase 2: Pilot Group (Days 2-3)

**Select 3-5 Athletes:**

- Choose tech-savvy athletes
- Mix of sports/groups
- Good communicators

**Invitation Process:**

1. Navigate to /athletes
2. Click "Invite Athlete"
3. Enter athlete details:
   - Full name
   - Email address
   - Select group (optional)
4. Athlete receives invite email
5. They sign up and accept

**Pilot Workout:**

- Assign simple workout
- Monitor completion
- Gather feedback

### Phase 3: Full Rollout (Week 1)

**Batch Invitations:**

1. Prepare athlete roster:
   - Names
   - Email addresses
   - Group assignments
2. Send invitations in batches (10-15 at a time)
3. Monitor signup completion
4. Follow up with non-responders

**Communication Template:**

```
Subject: Join [Your Team] Weight Room Tracker

Hi [Athlete Name],

You've been invited to our new workout tracking system - LiteWork!

What is it?
- Track your workouts digitally
- See your assigned exercises and weights
- Monitor your progress and PRs
- Available on phone, tablet, or computer

How to get started:
1. Click the invitation link in your email
2. Create your account (use your school email)
3. Install the app on your phone (optional but recommended)
4. Complete your first assigned workout!

Questions? Reply to this email or ask Coach [Your Name].

Let's get stronger together!

Coach [Your Name]
```

### Phase 4: Training & Support

**In-Person Training Session:**

- Schedule 15-minute demo
- Show key features:
  - Viewing assigned workouts
  - Recording sets and reps
  - Tracking progress
  - Installing PWA on phone

**Support Resources:**

- Create simple video tutorial (Loom or phone recording)
- Post QR code in weight room
- Designate 1-2 "tech helper" athletes

---

## 📱 PWA Installation for Athletes

### iOS Installation:

1. Open Safari browser (must use Safari)
2. Go to your app URL
3. Tap share button (square with arrow)
4. Scroll down, tap "Add to Home Screen"
5. Tap "Add"
6. App icon appears on home screen

### Android Installation:

1. Open Chrome browser
2. Go to your app URL
3. Tap menu (three dots)
4. Tap "Install app" or "Add to Home Screen"
5. Tap "Install"
6. App icon appears on home screen

---

## 🔧 Troubleshooting

### Common Issues:

**"Can't log in"**

- Verify Supabase URL/keys in Vercel env vars
- Check Supabase authentication settings
- Confirm email confirmation is working

**"Domain not loading"**

- Wait for DNS propagation (up to 48 hours)
- Verify DNS records match Vercel instructions
- Clear browser cache

**"Changes not appearing"**

- Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
- Check Vercel deployment succeeded
- Verify correct branch deployed

**"Athletes can't see workouts"**

- Verify workout assignment saved
- Check athlete is in correct group
- Confirm scheduled date is correct

---

## 📊 Post-Launch Monitoring

### Week 1 Metrics to Track:

- [ ] Number of athletes signed up
- [ ] Number of workouts completed
- [ ] Login success rate
- [ ] Mobile vs desktop usage
- [ ] Common support questions

### Feedback Collection:

**Quick Survey After First Week:**

1. Was sign-up easy? (Yes/No/Issues)
2. Was the app easy to use? (1-5 scale)
3. What feature did you like most?
4. What needs improvement?
5. Would you recommend? (Yes/No)

---

## 🎉 Success Criteria

**Week 1 Goals:**

- [ ] 80%+ of invited athletes signed up
- [ ] 10+ workouts assigned
- [ ] 5+ workouts completed by athletes
- [ ] Zero critical bugs reported
- [ ] Positive athlete feedback

**Month 1 Goals:**

- [ ] 100% athlete adoption
- [ ] Daily active usage during training times
- [ ] Athletes tracking progress independently
- [ ] Reduced paper workout cards
- [ ] Athletes excited about PRs and progress

---

## 🆘 Support Contacts

**Technical Issues:**

- GitHub: [your-github]
- Email: [your-email]

**Supabase Dashboard:**

- https://app.supabase.com

**Vercel Dashboard:**

- https://vercel.com/dashboard

---

## Next Steps

1. ✅ Complete pre-deployment testing
2. ⏳ Set up custom domain (optional)
3. ⏳ Deploy to production
4. ⏳ Create your coach account
5. ⏳ Invite pilot group (3-5 athletes)
6. ⏳ Assign test workout
7. ⏳ Gather feedback
8. ⏳ Roll out to full team

**You're ready to launch! 🚀**
