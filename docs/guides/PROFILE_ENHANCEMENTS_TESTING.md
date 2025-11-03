# Profile Enhancement Testing Guide

**Date**: November 2, 2025  
**Status**: ✅ DEPLOYED

---

## 🎯 What's New

### Database

- ✅ New profile columns added (avatar_url, DOB, height, weight, gender, bio, emergency contacts)
- ✅ Helper functions for age and BMI calculations
- ✅ Avatars storage bucket created in Supabase

### API Endpoints

- ✅ `/api/profile` - GET/PATCH profile with metrics
- ✅ `/api/profile/avatar` - POST/DELETE profile pictures

---

## 🧪 Testing Checklist

### Test 1: View Your Profile with Metrics

1. Navigate to `/profile`
2. Current page should load (old version)
3. Try the new API directly:

```javascript
// In browser console
fetch("/api/profile")
  .then((r) => r.json())
  .then(console.log);

// Should return your profile with new fields
```

### Test 2: Upload Profile Picture

```javascript
// In browser console - select a file first
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "image/*";
fileInput.onchange = async (e) => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch("/api/profile/avatar", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  console.log(data);
};
fileInput.click();
```

**Expected**:

- Success message with `avatarUrl`
- Image stored in Supabase Storage

### Test 3: Update Physical Metrics

```javascript
// In browser console
fetch("/api/profile", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    height_inches: 72, // 6 feet
    weight_lbs: 185,
    date_of_birth: "2000-01-15",
    gender: "male",
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

**Expected**:

- Success response with updated profile
- `age` calculated automatically
- `bmi` calculated automatically
- `bmi_category` determined (underweight/normal/overweight/obese)

### Test 4: Verify BMI Calculation

```javascript
// In browser console - after updating metrics
fetch("/api/profile")
  .then((r) => r.json())
  .then((data) => {
    console.log("Height:", data.profile.height_inches, "inches");
    console.log("Weight:", data.profile.weight_lbs, "lbs");
    console.log("BMI:", data.profile.bmi);
    console.log("Category:", data.profile.bmi_category);
    console.log("Age:", data.profile.age, "years");
  });
```

**Expected BMI Calculation**:

- Height: 72" (6 feet), Weight: 185 lbs
- BMI ≈ 25.1
- Category: "overweight" (25-30 range)

### Test 5: Delete Profile Picture

```javascript
// In browser console
fetch("/api/profile/avatar", {
  method: "DELETE",
})
  .then((r) => r.json())
  .then(console.log);
```

**Expected**:

- Success message
- `avatar_url` set to null in database
- Old image deleted from storage

---

## 📊 Database Verification

### Check New Columns

```sql
-- In Supabase SQL Editor
SELECT
  id,
  first_name,
  last_name,
  avatar_url,
  date_of_birth,
  height_inches,
  weight_lbs,
  gender,
  bio
FROM users
WHERE email = 'your-email@example.com';
```

### Check Calculated Metrics

```sql
-- In Supabase SQL Editor
SELECT
  first_name,
  last_name,
  height_inches,
  weight_lbs,
  date_of_birth,
  age,
  bmi,
  bmi_category
FROM users_with_metrics
WHERE email = 'your-email@example.com';
```

### Test Helper Functions

```sql
-- Test age calculation
SELECT calculate_age('2000-01-15'::DATE);
-- Should return: 24 (as of Nov 2025)

-- Test BMI calculation
SELECT calculate_bmi(72, 185);
-- Should return: 25.1
```

---

## 🎨 Frontend Integration (Next Steps)

The `/profile` page currently uses the old design. To integrate the new features, you need to:

### Option 1: Use API Directly in Current Page

Add to existing profile page:

```typescript
// Load profile with metrics
const { data } = await fetch('/api/profile').then(r => r.json());

// Display avatar
{data.profile.avatar_url && (
  <img src={data.profile.avatar_url} alt="Profile" />
)}

// Display metrics
<div>
  <p>Age: {data.profile.age} years</p>
  <p>Height: {Math.floor(data.profile.height_inches / 12)}'
     {data.profile.height_inches % 12}"</p>
  <p>Weight: {data.profile.weight_lbs} lbs</p>
  <p>BMI: {data.profile.bmi} ({data.profile.bmi_category})</p>
</div>
```

### Option 2: Full Enhanced Profile Page

I can create a complete enhanced profile page with:

- Avatar upload section with preview
- Personal info tab (name, bio, emergency contact)
- Physical metrics tab (DOB, height, weight, gender, BMI display)
- Account security tab (password change)

Would you like me to create this?

---

## 🐛 Troubleshooting

### Avatar Upload Fails

**Check Supabase Storage**:

1. Go to Supabase Dashboard → Storage
2. Verify "avatars" bucket exists
3. Check bucket is public
4. Verify RLS policies allow uploads

**Common Issues**:

- Bucket not created
- Bucket not public
- File too large (>2MB)
- Invalid file type

### Metrics Not Calculating

**Check View**:

```sql
-- Verify view exists
SELECT * FROM users_with_metrics LIMIT 1;
```

**Check Functions**:

```sql
-- Test functions directly
SELECT calculate_age('2000-01-15'::DATE);
SELECT calculate_bmi(72, 185);
```

### Profile API Returns Error

**Check Auth**:

- User must be logged in
- Valid session token required
- Check browser console for errors

---

## ✅ Success Criteria

- [ ] Can fetch profile with `/api/profile`
- [ ] Can upload profile picture
- [ ] Avatar appears in storage bucket
- [ ] Can update height and weight
- [ ] BMI calculates correctly
- [ ] Age calculates correctly
- [ ] Can delete profile picture
- [ ] Emergency contact fields save properly

---

## 🚀 Next Enhancements

Once frontend is integrated:

1. **Navigation Avatar**: Show user's profile picture in nav bar
2. **Athlete Cards**: Display avatars in athlete lists
3. **Workout Assignments**: Show athlete photos when assigning
4. **Progress Dashboard**: Include profile metrics in analytics
5. **Profile Completeness**: Show progress bar for profile completion

---

**Status**: Backend complete and deployed ✅  
**Next**: Integrate into frontend UI
