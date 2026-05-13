# 🔐 Login Troubleshooting Guide

## Current Issue
Login is timing out during auth initialization. This typically happens when:
- No test users have been created in Supabase
- The users table in the database is not set up correctly
- Network connectivity issues

## Quick Fix: Create a Test User

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com
2. Sign in with your account
3. Select the **mim-crm** project (pbrcqljfqswojlhvpizx)
4. Click **Authentication** in the left sidebar
5. Click **Users**

### Step 2: Create a Test User
1. Click the **Add user** button (top right)
2. Fill in the form:
   - **Email**: `admin@mim.com`
   - **Password**: `password123`
   - **Confirm password**: `password123`
   - ✅ **Confirm email**: CHECKED
   - ✅ **Auto send**: CHECKED
3. Click **Create user**
4. **COPY the UUID** that appears (you'll need this)

### Step 3: Create User Profile in Database
1. Go to **SQL Editor** in Supabase (left sidebar)
2. Click **New query**
3. Run this SQL (replace the UUID with the one you copied):

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
  'PASTE-YOUR-UUID-HERE'::uuid,
  'admin@mim.com',
  'Admin User',
  '+91 9876543210',
  'admin',
  NOW()
) ON CONFLICT (id) DO NOTHING;
```

4. Click **Run**

### Step 4: Test Login
1. Open http://localhost:3001 in your browser
2. Login with:
   - **Email**: `admin@mim.com`
   - **Password**: `password123`
3. Check browser console (F12 > Console) for debug messages
4. You should see:
   - ✅ "Attempting sign in for: admin@mim.com"
   - ✅ "Sign in successful, user ID: ..."
   - ✅ "User profile fetched successfully"
   - ✅ Redirected to dashboard

## Debug Information

### If Still Not Working:

1. **Check Supabase Connection**:
   - Open browser DevTools (F12)
   - Go to Console tab
   - You should see debug logs from auth-context.tsx
   - Look for "Session check completed" or error messages

2. **Common Errors**:
   - ❌ "PGRST116": User doesn't have a profile in the `users` table - create profile using SQL above
   - ❌ "invalid_credentials": Wrong email/password - check spelling and case
   - ❌ "Auth initialization timeout": Supabase is not responding - check network or Supabase status

3. **Check Environment Variables**:
   - Make sure `.env` file has:
     - `VITE_SUPABASE_URL=https://pbrcqljfqswojlhvpizx.supabase.co`
     - `VITE_SUPABASE_ANON_KEY=...` (correct key)

4. **Enable Network Debug**:
   - Open DevTools Network tab
   - Look for requests to `pbrcqljfqswojlhvpizx.supabase.co`
   - Check if they're failing

## Create Multiple Test Users (Optional)

Create these additional users for full testing:

```sql
-- Sales User
INSERT INTO users (id, email, full_name, phone, role, created_at)
VALUES ('SALES-UUID'::uuid, 'sales@mim.com', 'Sales Manager', '+91 9876543211', 'sales', NOW())
ON CONFLICT (id) DO NOTHING;

-- Operations User
INSERT INTO users (id, email, full_name, phone, role, created_at)
VALUES ('OPS-UUID'::uuid, 'operations@mim.com', 'Operations Head', '+91 9876543212', 'operations', NOW())
ON CONFLICT (id) DO NOTHING;

-- Accounts User
INSERT INTO users (id, email, full_name, phone, role, created_at)
VALUES ('ACC-UUID'::uuid, 'accounts@mim.com', 'Accounts Manager', '+91 9876543213', 'accounts', NOW())
ON CONFLICT (id) DO NOTHING;
```

Test credentials (once created):
- admin@mim.com / password123
- sales@mim.com / password123
- operations@mim.com / password123
- accounts@mim.com / password123

---

## Recently Improved Auth Flow

Recent changes to `src/lib/auth-context.tsx`:

✅ Added session timeout handling (5 sec)
✅ Improved profile fetch error handling
✅ Added detailed console logging
✅ Non-blocking profile fetch (doesn't fail entire auth if profile missing)
✅ Better error messages in login form

The app will now:
1. Check for existing session (5 sec timeout)
2. Force completion after 8 seconds (max)
3. Allow login even if profile not found (profile can be created after)
4. Show detailed errors in the UI
