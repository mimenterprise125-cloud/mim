# 🔐 Login Debugging Guide - Step by Step

## ⚠️ CRITICAL: Must Complete These Steps FIRST

### Step 1: Create a Test User in Supabase (REQUIRED)

**Without this, login will NOT work. You must do this.**

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **Authentication** (left menu)
4. Click **Users**
5. Click **Add user** button
6. Fill in:
   - **Email**: `admin@mim.com`
   - **Password**: `password123`
   - **Confirm password**: `password123`
   - ✅ **Confirm email**: CHECKED
   - ✅ **Auto send invitation**: CHECKED
7. Click **Create user**
8. **IMPORTANT: Copy the UUID** (the ID column)

---

### Step 2: Create User Profile in Database (REQUIRED)

1. In Supabase, click **SQL Editor** (left menu)
2. Click **New query**
3. Paste this SQL (replace UUID with the one you copied):

```sql
INSERT INTO users (
  id, 
  email, 
  full_name, 
  phone, 
  role, 
  created_at
)
VALUES (
  'REPLACE-WITH-YOUR-UUID-HERE'::uuid,
  'admin@mim.com',
  'Admin User',
  '+91 9876543210',
  'admin',
  NOW()
) ON CONFLICT (id) DO NOTHING;
```

4. Click **Run**
5. Should see: `1 rows affected`

---

## ✅ Testing Login

### Step 1: Open the App
- Go to: http://localhost:3001
- Wait for page to load (should see login form)

### Step 2: Check Browser Console
1. Press **F12** (or Ctrl+Shift+I)
2. Go to **Console** tab
3. Look for these messages:
   ```
   ✅ Auth: Starting session check...
   ✅ Auth: Session check completed, session exists: false
   ✅ Auth: No existing session found
   ```

### Step 3: Enter Credentials
- **Email**: `admin@mim.com`
- **Password**: `password123`
- Click **Sign In**

### Step 4: Check Console Again
- Should see:
  ```
  ✅ Attempting sign in for: admin@mim.com
  ✅ Sign in successful, user ID: [uuid]
  ✅ Fetching user profile in background...
  ```

### Step 5: Should Redirect
- Page should redirect to dashboard in 1-2 seconds
- You should see the CRM dashboard

---

## ❌ If It's Still Not Working

### Check 1: Network Connection
```
1. Open F12 → Network tab
2. Click Sign In
3. Look for requests to `pbrcqljfqswojlhvpizx.supabase.co`
4. Check if they're failing (red X) or slow (> 5 seconds)
```

### Check 2: Error Messages
```
1. Open F12 → Console tab
2. Look for red error messages
3. Common errors:
   - "invalid_credentials" = Wrong email/password
   - "User not found" = Email doesn't exist in Supabase Auth
   - "PGRST116" = Profile not in database (but auth worked)
```

### Check 3: Supabase Status
```
1. Go to: https://status.supabase.com
2. Check if service is up
3. If down, wait for it to come back online
```

### Check 4: Environment Variables
```
1. Stop dev server (Ctrl+C)
2. Verify .env file has:
   - VITE_SUPABASE_URL=https://pbrcqljfqswojlhvpizx.supabase.co
   - VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
3. Save file
4. Restart dev server: npm run dev
```

---

## 🔍 Advanced: Run Diagnostic

1. Open browser console (F12 → Console)
2. Paste this code:

```javascript
// Test connection to Supabase
async function testAuth() {
  console.log("Testing auth...");
  
  try {
    const { supabase } = await import("/src/lib/supabase.ts");
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error:", error.message);
    } else {
      console.log("Session:", data.session ? "Active" : "None");
    }
  } catch (e) {
    console.error("Failed:", e.message);
  }
}

testAuth();
```

3. Look for the result in console

---

## 📋 Checklist Before Trying to Login

- [ ] User created in Supabase Authentication
- [ ] User UUID copied from Supabase
- [ ] User profile created in database with SQL
- [ ] App is running (`npm run dev`)
- [ ] Browser is at http://localhost:3001
- [ ] Internet connection is working
- [ ] .env file has correct values
- [ ] Dev server restarted after .env changes

---

## 🚀 If All Tests Pass

Once you successfully login:

1. You should see the **Dashboard** page
2. Navigate using the **Sidebar** menu
3. Try these pages:
   - **Leads** - Manage leads
   - **Projects** - View projects
   - **Payments** - Track payments
   - **Employees** - Manage team

---

## 📞 Debug Info to Share If Problems Persist

When reporting issues, include:

1. **Error message** from console (F12)
2. **Network request status** from Network tab
3. **Email and password** used (sanitized)
4. **Supabase project URL** (the one in .env)
5. **Whether auth user was created** in Supabase

---

## Quick Reference: Files Modified

Recent changes to improve login reliability:

1. `src/lib/auth-context.tsx`
   - Removed profile fetch from initial session check
   - Profile now loads in background
   - Increased timeout to 10 seconds

2. `src/routes/login.tsx`
   - Fixed navigate() warning (moved to useEffect)
   - Better error handling

3. `src/routes/payments.tsx`
   - Added fetch timeout
   - Better loading states

---

## 🎯 Most Common Solution

**99% of login failures are because:**

You forgot to create a test user in Supabase!

👉 **Go to https://supabase.com → Your Project → Authentication → Add User**

Then come back and try again.
