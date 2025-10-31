# Quick Deployment Guide

## 🚀 Fastest Path to Production

### 1. Test Locally (10 minutes)
```bash
# Server should already be running
# Visit: http://localhost:3000

# Test these key features:
- Login/Signup works
- Create a group
- Create a workout  
- Assign workout to group
```

### 2. Push to Production (2 minutes)
```bash
git add .
git commit -m "chore: clear mock data for production"
git push origin main

# Vercel auto-deploys in ~2 minutes
# Check: https://vercel.com/dashboard
```

### 3. Set Environment Variables in Vercel (5 minutes)

Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

Add these:
```
NEXT_PUBLIC_SUPABASE_URL = (from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_ANON_KEY = (from Supabase dashboard)  
SUPABASE_SERVICE_ROLE_KEY = (from Supabase dashboard)
NEXT_PUBLIC_APP_URL = https://your-vercel-url.vercel.app
```

Redeploy after adding variables.

### 4. Custom Domain Setup (Optional - 30 minutes)

**Option A: Use Vercel domain**
- Already deployed at: `litework-p6uw3kn0c-justin-depierros-projects.vercel.app`
- Works immediately, no setup needed

**Option B: Custom domain (e.g., litework.app)**

1. Buy domain at Namecheap/Google Domains
2. In Vercel: Settings → Domains → Add Domain
3. Add DNS records at registrar:
   ```
   A Record: @ → 76.76.21.21
   CNAME: www → cname.vercel-dns.com
   ```
4. Wait 5-60 minutes for DNS propagation
5. SSL auto-configured by Vercel

### 5. Create Your Coach Account (2 minutes)

1. Go to your deployed URL
2. Click "Login"  
3. Sign up with your email
4. Confirm email
5. You're in!

### 6. Invite First Athletes (5 minutes)

1. Go to /athletes
2. Click "Invite Athlete"
3. Enter name and email
4. They receive invitation email
5. They sign up and you're connected!

---

## 📋 Environment Variables Quick Reference

**Where to find Supabase credentials:**
1. Go to https://app.supabase.com
2. Select your project
3. Settings → API
4. Copy the values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Project API keys (anon public) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Project API keys (service_role) → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## 🎯 First Day Checklist

- [ ] Deploy to Vercel (auto-deploys from git push)
- [ ] Set environment variables in Vercel
- [ ] Create your coach account
- [ ] Create 2-3 athlete groups
- [ ] Create 1-2 test workouts
- [ ] Invite 3-5 pilot athletes
- [ ] Assign a workout to test

---

## 💡 Pro Tips

**Testing:**
- Test on your phone (most athletes will use mobile)
- Install as PWA on home screen
- Try the "Live Workout" mode

**Athlete Onboarding:**
- Start with a small pilot group (3-5 athletes)
- Choose tech-savvy athletes first
- Get feedback before full rollout

**Domain:**
- Custom domain is optional but looks more professional
- Vercel domain works perfectly fine
- You can add custom domain later

**Support:**
- Most questions will be "How do I install the app?"
- Create a quick video showing PWA installation
- Post QR code in weight room for easy access

---

## 🆘 If Something Breaks

**Can't log in:**
- Check Supabase environment variables in Vercel
- Verify Supabase project is active
- Check browser console for errors

**Athletes can't see workouts:**
- Verify workout was assigned to correct group
- Check athlete is in that group
- Confirm scheduled date is today or future

**Need help:**
- Check the full PRODUCTION_DEPLOYMENT_CHECKLIST.md
- Review DEPLOYMENT_GUIDE.md
- Supabase docs: https://supabase.com/docs

---

**Ready? Let's go! 🚀**

Current deployment URL: https://litework-p6uw3kn0c-justin-depierros-projects.vercel.app
