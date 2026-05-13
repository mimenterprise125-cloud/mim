# Quotation Saving Issue - Complete Solution

## 🔴 Problem Identified
The "Add Quotation" form is not saving values to the database. Form submissions fail silently or show generic errors.

## 🔍 Root Cause
The `quotations` table in Supabase is missing:
1. **Row Level Security (RLS) enabled** - The table was not protected with RLS
2. **INSERT policy** - No policy allows users to insert quotations
3. **SELECT policy** - No policy allows users to read quotations
4. **UPDATE policy** - No policy allows users to edit quotations

Without these RLS policies, Supabase denies all database operations on the quotations table.

## ✅ Solution Applied

### File: `fix-quotations-rls.sql`
This SQL file enables RLS and adds policies for:
- ✅ Viewing quotations (SELECT)
- ✅ Creating quotations (INSERT)
- ✅ Editing quotations (UPDATE)
- ✅ Deleting quotations (DELETE - admin only)
- ✅ All quotation history operations

### File: `QUOTATION_SAVING_FIX.md`
Complete documentation including:
- Problem explanation
- Solution steps
- Testing checklist
- Troubleshooting guide

### File: `quotation-debug-helper.js`
Console debugging utilities to test:
- Supabase connection
- User permissions
- Direct database insert
- RLS policy verification

## 🚀 How to Fix

### Step 1: Run the SQL Fix
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Create new query
4. Copy all content from `fix-quotations-rls.sql`
5. Execute the query

### Step 2: Test the Fix
1. Go to the Quotations page
2. Select a lead
3. Click "Create Quotation"
4. Fill in the form with test values
5. Click "Create Quotation"
6. Verify success message appears
7. Refresh page to confirm values persist

### Step 3: Verify Success
- ✅ New quotations appear in the list
- ✅ Values are saved to database
- ✅ Page refresh shows saved quotations
- ✅ Edit and history features work

## 📋 RLS Policy Details

### INSERT Policy
**Who can create quotations:**
- Users with role: `admin`, `sales`, or `accounts`
- User must be assigned to the lead OR have created the lead

### SELECT Policy
**Who can view quotations:**
- User assigned to the lead
- User who created the lead
- Admin users

### UPDATE Policy
**Who can edit quotations:**
- Same rules as SELECT

### DELETE Policy
**Who can delete quotations:**
- Admin users only
- User who created the quotation

## 🐛 If Problems Persist

### Check 1: Verify RLS is Enabled
```sql
-- In Supabase SQL Editor:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'quotations';
-- Should return: rowsecurity = true
```

### Check 2: Verify Policies Exist
```sql
-- In Supabase SQL Editor:
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'quotations';
-- Should show multiple policies
```

### Check 3: User Authentication
1. Ensure user is logged in
2. Check user role in `users` table
3. Verify lead is assigned to user

### Check 4: Browser Console Errors
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Try creating quotation
4. Look for red error messages
5. Share error details for debugging

### Check 5: Use Debug Helper
Open browser console and run:
```javascript
testSupabaseConnection()  // Test connection
checkUserPermissions()    // Check user role
testInsertQuotation()     // Test direct insert
```

## 📊 Database Schema
```
quotations table:
- id (UUID primary key)
- lead_id (UUID, foreign key to leads)
- total_sqft (decimal)
- rate_per_sqft (decimal)
- subtotal (decimal)
- gst_percentage (decimal)
- gst_amount (decimal)
- total_with_gst (decimal)
- profit_percentage (decimal)
- notes (text)
- created_by (UUID)
- created_at (timestamp)
- updated_at (timestamp)
```

## 🔧 Files Modified
| File | Purpose |
|------|---------|
| `fix-quotations-rls.sql` | SQL fix to enable RLS and add policies |
| `QUOTATION_SAVING_FIX.md` | Detailed documentation |
| `quotation-debug-helper.js` | Console debugging utilities |
| `QUOTATION_SAVING_ISSUE_SOLUTION.md` | This file |

## ✨ Expected Behavior After Fix
1. Users can create new quotations
2. Form values are saved to Supabase
3. Quotations persist after page refresh
4. Multiple quotations can be created per lead
5. Quotation history tracks all changes
6. Edit functionality works properly
7. Only authorized users see quotations

## 📞 Support Steps
1. ✅ Run `fix-quotations-rls.sql` 
2. ✅ Test creating a quotation
3. ✅ Check browser console for errors
4. ✅ Verify user is logged in with correct role
5. ✅ Use debug helper to troubleshoot
6. ✅ Check Supabase SQL Editor for policy verification

---

**Version:** 1.0
**Date:** May 2026
**Status:** Ready to Deploy
