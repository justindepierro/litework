# Production Deployment Checklist

## Current Status: Pre-Deployment Audit (Nov 2, 2025)

### ✅ Completed Items

1. **Email System** 
   - ✅ Resend API configured
   - ✅ Domain `liteworkapp.com` verified with DNS
   - ✅ Email templates created
   - ✅ Invite system working locally

2. **Signup Flow**
   - ✅ `/signup` page created
   - ✅ Invite pre-fill working
   - ✅ API endpoints for invite handling

3. **Local Development**
   - ✅ Dev server scripts (`npm run dev:restart`)
   - ✅ Environment variables in `.env.local`

---

## 🔧 Required: Vercel Environment Variables

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

### Add these variables (Production environment):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://lzsjaqkhdoqsafptqpnt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_81nl9WAiECbQlQ5kPJw9Ww_R0x_vA_x
SUPABASE_SERVICE_ROLE_KEY=sb_secret_y2VQz4wGj7m7ijSLzdQJjw_hV1kJ7nd

# JWT
JWT_SECRET=U2VcJCvOzpwTA1jLoarCXljX3XohXiEMsoi54DArie0

# App URL (CRITICAL - use your production URL)
NEXT_PUBLIC_APP_URL=https://liteworkapp.com

# Resend Email
RESEND_API_KEY=re_ND6yNNQG_PsDzkRA9kQCGvv9hgwp9w7p9
RESEND_FROM_EMAIL=LiteWork <noreply@liteworkapp.com>

# VAPID Keys (Push Notifications)
VAPID_PUBLIC_KEY=BDdFmhhNn3eEw-cpfO4O0SxKLKZo8FC3LVOq3GebT7aKHHm1__zmNh_Ps8TPB-e2Ul6CXAx5ZQeaGMH_TBKijxQ
VAPID_PRIVATE_KEY=iRras99R9Zxz0035FQuOtE_R4YpujcgRfUqmrVS4F-I
VAPID_SUBJECT=mailto:jdepierro@burkecatholic.org
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BDdFmhhNn3eEw-cpfO4O0SxKLKZo8FC3LVOq3GebT7aKHHm1__zmNh_Ps8TPB-e2Ul6CXAx5ZQeaGMH_TBKijxQ

# App Version
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## 📋 Pre-Deployment Steps

### 1. **Test Production Build Locally**
```bash
npm run build
npm run start
```

### 2. **Check for TypeScript Errors**
```bash
npm run typecheck
```

### 3. **Domain Setup**
- [ ] Is `liteworkapp.com` connected to Vercel?
  - Go to Vercel → Domains → Add Domain
  - Point DNS to Vercel

### 4. **Database Check**
- [ ] Verify Supabase RLS policies are active
- [ ] Test auth flows in production mode

### 5. **Security Headers**
- ✅ Configured in `vercel.json`

---

## 🚀 Deployment Process

### Option A: Deploy via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Connect GitHub repo (if not already)
3. Click "Deploy"
4. Add environment variables
5. Deploy

### Option B: Deploy via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Add environment variables
vercel env add NEXT_PUBLIC_APP_URL production
# (repeat for each variable)
```

---

## ✅ Post-Deployment Verification

### Test These Flows:
1. **Authentication**
   - [ ] Sign up new user
   - [ ] Log in existing user
   - [ ] Password reset

2. **Invite System**
   - [ ] Send invite from production
   - [ ] Receive email (check production URL in link)
   - [ ] Click email link
   - [ ] Complete signup from invite
   - [ ] Verify invite marked as "accepted"

3. **Core Features**
   - [ ] Create workout
   - [ ] Assign workout to athlete
   - [ ] View workout as athlete
   - [ ] Complete workout in live mode

4. **Email Notifications**
   - [ ] Invite emails sending
   - [ ] Email links using production URL
   - [ ] Emails from `noreply@liteworkapp.com`

---

## 🔍 Current Questions to Answer

1. **Domain Status**: Is `liteworkapp.com` connected to Vercel?
   - Check: Vercel Dashboard → Domains

2. **Current Production URL**: What's the actual URL?
   - Vercel preview: `https://litework-[hash].vercel.app`
   - Custom domain: `https://liteworkapp.com`

3. **Environment Variables**: Are they set in Vercel?
   - Check: Settings → Environment Variables

---

## 📝 Next Steps

Run these commands to check status:

```bash
# Check if build succeeds
npm run build

# Check for TypeScript errors
npm run typecheck

# Check current git status
git status

# Push latest changes
git add .
git commit -m "Add signup flow and email system"
git push origin main
```

Then Vercel will auto-deploy if connected to GitHub!

---

## 🆘 Troubleshooting

**If emails don't work in production:**
- Check `RESEND_API_KEY` is set in Vercel
- Verify `NEXT_PUBLIC_APP_URL` is production URL
- Check Resend dashboard for send logs

**If auth doesn't work:**
- Verify Supabase keys are correct
- Check Supabase URL in environment variables
- Test with hardcoded credentials first

**If domain doesn't load:**
- Verify DNS points to Vercel
- Check domain is added in Vercel dashboard
- Wait up to 48 hours for DNS propagation
