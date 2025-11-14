# ✅ Onboarding Workflow - Quick Validation Checklist

**Run through this checklist to validate the complete athlete onboarding flow**

---

## 🎯 STEP 1: Coach Creates Invite

- [ ] Login as coach at `https://liteworkapp.com/login`
- [ ] Navigate to Athletes page
- [ ] Click "Invite Athlete" button
- [ ] Fill out form:
  - [ ] First Name: "Test"
  - [ ] Last Name: "Athlete"  
  - [ ] Email: your-test-email@example.com
  - [ ] Select a group (optional)
- [ ] Click "Send Invitation"
- [ ] Verify success message appears
- [ ] Verify athlete appears in list with "Invited" status

**Expected Time**: ~5 seconds  
**Status**: ✅ PASS / ❌ FAIL

---

## 📧 STEP 2: Email Received

- [ ] Check email inbox for invite
- [ ] Verify email from "LiteWork <noreply@liteworkapp.com>"
- [ ] Verify subject: "You're invited to join LiteWork!"
- [ ] Verify email contains:
  - [ ] Athlete name ("Test Athlete")
  - [ ] Coach name/email
  - [ ] Expiration date (7 days from now)
  - [ ] Blue "Accept Invitation" button
- [ ] Verify link format: `https://liteworkapp.com/signup?invite=uuid`

**Expected Time**: 2-5 seconds  
**Status**: ✅ PASS / ❌ FAIL

---

## 🔗 STEP 3: Click Invite Link

- [ ] Click "Accept Invitation" button in email
- [ ] Verify redirects to `https://liteworkapp.com/signup?invite=uuid`
- [ ] Verify page loads without errors
- [ ] Verify no 404 or 500 errors

**Expected Time**: Instant  
**Status**: ✅ PASS / ❌ FAIL

---

## 📝 STEP 4: Signup Form Pre-filled

- [ ] Verify form fields pre-filled:
  - [ ] First Name: "Test" (read-only)
  - [ ] Last Name: "Athlete" (read-only)
  - [ ] Email: your-test-email@example.com (read-only)
- [ ] Verify welcome message: "Welcome to LiteWork! Your coach has invited you to join."
- [ ] Verify password fields are empty and editable

**Expected Time**: Instant  
**Status**: ✅ PASS / ❌ FAIL

---

## 🔐 STEP 5: Password Entry & Validation

- [ ] Enter password: "Test123!@#"
- [ ] Verify password strength indicator appears
- [ ] Verify strength shows "Strong" (green)
- [ ] Enter confirm password: "Test123!@#"
- [ ] Verify no error messages
- [ ] Verify "Create Account" button is enabled

**Test Weak Password**:
- [ ] Change password to "test123"
- [ ] Verify error: "Password must contain uppercase, lowercase, number, and special character"
- [ ] Verify button disabled

**Test Mismatch**:
- [ ] Password: "Test123!@#"
- [ ] Confirm: "Test123!@"
- [ ] Verify error: "Passwords do not match"

**Expected Time**: User action  
**Status**: ✅ PASS / ❌ FAIL

---

## 🚀 STEP 6: Account Creation

- [ ] Click "Create Account" button
- [ ] Verify loading spinner appears
- [ ] Verify button text changes to "Creating Account..."
- [ ] Wait for completion (~600ms)
- [ ] Verify no error messages

**Expected Time**: ~600ms  
**Status**: ✅ PASS / ❌ FAIL

---

## 🎉 STEP 7: Auto-Login & Redirect

- [ ] Verify automatic redirect to `/dashboard`
- [ ] Verify no login screen appears
- [ ] Verify dashboard loads successfully
- [ ] Verify user name appears in header
- [ ] Verify "Athlete" role visible

**Expected Time**: Instant  
**Status**: ✅ PASS / ❌ FAIL

---

## 📊 STEP 8: Dashboard Content

- [ ] Verify sections load:
  - [ ] "Welcome back, Test Athlete!" message
  - [ ] Assigned workouts section
  - [ ] Recent activity section
  - [ ] Personal records section
- [ ] Verify navigation menu works
- [ ] Click "Athletes" - should redirect (coach only)
- [ ] Click "Workouts" - should load workout list
- [ ] Click "Progress" - should load progress page

**Expected Time**: ~500ms  
**Status**: ✅ PASS / ❌ FAIL

---

## 👥 STEP 9: Coach View (Verify Athlete)

- [ ] Login as coach (different browser/incognito)
- [ ] Navigate to Athletes page
- [ ] Find "Test Athlete" in list
- [ ] Verify status changed from "Invited" to "Active"
- [ ] Verify group assignment (if assigned)
- [ ] Click on athlete to view details

**Expected Time**: Instant  
**Status**: ✅ PASS / ❌ FAIL

---

## 🔒 STEP 10: Security Validations

**Test Expired Invite**:
- [ ] Manually change invite `expires_at` in database to past date
- [ ] Try to use invite link
- [ ] Verify error: "This invitation has expired"

**Test Used Invite**:
- [ ] Try to use same invite link again
- [ ] Verify error: "This invitation has already been used"

**Test Duplicate Email**:
- [ ] Create new invite with same email
- [ ] Try to sign up
- [ ] Verify error: "User with this email already exists"

**Test Rate Limiting**:
- [ ] Try to create accounts 4 times in a row (same IP)
- [ ] Verify 4th attempt blocked
- [ ] Verify error: "Too many signup attempts"

**Expected Time**: Varies  
**Status**: ✅ PASS / ❌ FAIL

---

## 📈 Performance Benchmarks

Record actual times:

| Step | Target | Actual | Pass? |
|------|--------|--------|-------|
| Invite Creation | < 500ms | ___ms | ☐ |
| Email Delivery | < 10 sec | ___sec | ☐ |
| Signup Page Load | < 500ms | ___ms | ☐ |
| Account Creation | < 1 sec | ___ms | ☐ |
| Dashboard Load | < 2 sec | ___ms | ☐ |

---

## ✅ Final Validation

**All Steps Pass?**
- [ ] ✅ All 10 steps completed successfully
- [ ] ✅ No errors encountered
- [ ] ✅ Performance within targets
- [ ] ✅ Security validations pass

**Overall Status**: ✅ ROCK SOLID / ⚠️ ISSUES FOUND / ❌ CRITICAL FAILURE

---

## 🐛 Issues Found

*Document any issues discovered during testing:*

1. Issue: _______________
   - Severity: Critical / High / Medium / Low
   - Steps to Reproduce: _______________
   - Expected: _______________
   - Actual: _______________

---

## 📝 Notes

*Add any additional observations:*

---

**Tester**: _______________  
**Date**: _______________  
**Environment**: Production / Staging / Local  
**Browser**: Chrome / Safari / Firefox  
**Device**: Desktop / Mobile / Tablet
