# Comprehensive Testing & Debugging Guide

## Issues Fixed

### 1. Enhanced Login Error Logging
- ✅ Added detailed console logs at each step
- ✅ Better error message extraction
- ✅ Validation of email/password before submission

### 2. Improved Auth Context
- ✅ Added logging to session checks
- ✅ Better profile fetch error handling
- ✅ Session state changes logged

### 3. Enhanced My Works Feature
- ✅ Parallel database queries for better performance
- ✅ Better error handling for each query
- ✅ Type-safe amount calculations
- ✅ Detailed console logging for debugging

## Step-by-Step Testing

### Test 1: Login Flow

**Prerequisites:**
- User email and password must exist in Supabase auth
- User profile must exist in `users` table with matching ID

**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to `/login`
4. Look for log messages starting with `[AUTH]`
5. Enter email and password
6. Click "Sign In"
7. Watch for these logs in order:
   ```
   [LOGIN] Attempting to sign in with email: user@example.com
   [AUTH] Starting sign in for: user@example.com
   [AUTH] Sign in successful, user: UUID_HERE
   [AUTH] Setting user state
   [AUTH] Fetching user profile
   [AUTH] Profile fetched successfully: {...}
   [LOGIN] Sign in successful, waiting for auth state update
   ```

**Expected Result:**
- User should see "Login Successful!" message
- Redirect to `/dashboard` should happen

**Troubleshooting:**
- If no `[AUTH]` logs appear: Supabase connection issue
- If "Sign in error" appears: Check credentials
- If profile not fetched: Check if user exists in `users` table
- If stuck on loading: Check browser network tab for failed requests

### Test 2: My Works Feature

**Prerequisites:**
- At least one lead must exist in `leads` table with:
  - Valid `id`
  - Phone number (must match what you'll search)
  - `name`, `email`, `status`, `created_at`

**Steps:**
1. Open DevTools Console
2. On homepage, click "My Works" button
3. Enter phone number (e.g., "9957640581")
4. Click "Search"
5. Watch for these logs:
   ```
   [MY_WORKS] Searching for phone: 9957640581
   [MY_WORKS] Leads response: { leads: [...], leadsError: null }
   [MY_WORKS] Found lead: {...}
   [MY_WORKS] Quotations: [...]
   [MY_WORKS] Projects: [...]
   [MY_WORKS] Payments: [...]
   [MY_WORKS] Data aggregated: { totalQuoted: X, totalPaid: Y, balance: Z }
   ```

**Expected Result:**
- Dialog shows project status
- Payment summary with correct totals
- List of quotations (if any)
- List of projects (if any)

**Troubleshooting:**
- If "No records found": Check phone number format in database
- If data shows 0/undefined: Check field names in tables:
  - quotations: `total_amount`, `rate_per_sqft`, `total_sqft`
  - projects: `name`, `status`
  - payments: `amount`
  - leads: `status`, `created_at`

### Test 3: Database Schema Verification

**Run in Supabase SQL Editor:**

```sql
-- Check leads table
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'leads' ORDER BY ordinal_position;

-- Check if test lead exists
SELECT * FROM leads LIMIT 5;

-- Check quotations table
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'quotations' ORDER BY ordinal_position;

-- Check projects table  
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'projects' ORDER BY ordinal_position;

-- Check payments table
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'payments' ORDER BY ordinal_position;

-- Test lead-quotation relationship
SELECT l.id, l.name, l.phone, 
       COUNT(q.id) as quotation_count,
       SUM(q.total_amount) as total_quoted
FROM leads l
LEFT JOIN quotations q ON q.lead_id = l.id
GROUP BY l.id, l.name, l.phone;

-- Test lead-payment relationship
SELECT l.id, l.name, l.phone,
       COUNT(p.id) as payment_count,
       SUM(p.amount) as total_paid
FROM leads l
LEFT JOIN payments p ON p.lead_id = l.id
GROUP BY l.id, l.name, l.phone;
```

## Browser Console Commands

Copy and paste these directly in browser console:

```javascript
// 1. Test Supabase connection
console.log('Testing Supabase connection...');
await supabase.from('leads').select('count', { count: 'exact', head: true });

// 2. Check current session
const { data: { session } } = await supabase.auth.getSession();
console.log('Current session:', session);

// 3. Search for a specific phone number
const { data, error } = await supabase
  .from('leads')
  .select('*')
  .eq('phone', '9957640581');
console.log('Leads found:', data, 'Error:', error);

// 4. If lead found, search for its quotations
if (data?.[0]) {
  const leadId = data[0].id;
  const { data: quotations } = await supabase
    .from('quotations')
    .select('*')
    .eq('lead_id', leadId);
  console.log('Quotations:', quotations);
}

// 5. Check user profile
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  console.log('User profile:', profile);
}
```

## Common Issues & Solutions

### Issue: "Failed to sign in"
- **Cause:** Wrong credentials or user doesn't exist
- **Solution:** 
  1. Check credentials in Supabase Auth users
  2. Verify user profile exists in `users` table

### Issue: "No records found"
- **Cause:** Phone number not in database
- **Solution:**
  1. Check actual phone format in database
  2. Try with different phone number
  3. Ensure lead has correct phone field

### Issue: "Balance showing 0 or undefined"
- **Cause:** Missing fields in database tables
- **Solution:**
  1. Check if `quotations.total_amount` exists
  2. Check if `payments.amount` exists
  3. Run schema verification queries above

### Issue: Profile not loading after login
- **Cause:** User doesn't have profile in `users` table
- **Solution:**
  1. Insert user profile manually
  2. Ensure `users.id` matches auth user ID

## Next Steps

1. **Run all tests above in order**
2. **Check browser console for all [AUTH], [LOGIN], [MY_WORKS] logs**
3. **Share console output if issues persist**
4. **Verify database schema matches expectations**

## Files Modified

- ✅ `src/routes/login.tsx` - Enhanced error handling
- ✅ `src/lib/auth-context.tsx` - Added logging & better error handling
- ✅ `src/routes/index.tsx` - Improved My Works function with parallel queries

## Performance Improvements

- Parallel queries for quotations, projects, payments
- Better error handling prevents silent failures
- Type-safe calculations
- Comprehensive logging for debugging
