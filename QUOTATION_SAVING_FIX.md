# Quotation Not Saving - RLS Policy Fix

## Problem
The quotation form was not saving values to the database because the `quotations` table did not have Row Level Security (RLS) enabled or proper policies configured.

## Root Cause
1. **RLS Not Enabled**: The `quotations` table did not have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` executed
2. **No Insert Policy**: Without proper RLS policies, Supabase was denying INSERT operations on the table
3. **No Select Policy**: Users couldn't read quotations even if they could create them

## Solution
Applied RLS policies to the `quotations` and `quotation_history` tables to:
- Allow sales/accounts team to view quotations for leads they manage
- Allow authorized users to create quotations
- Allow updates to existing quotations
- Allow admin users to delete quotations
- Maintain proper access control for quotation history

## Implementation Steps

### 1. Execute the RLS Fix SQL
Run the SQL commands in `fix-quotations-rls.sql` in your Supabase dashboard:

**Steps:**
1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Copy all content from `fix-quotations-rls.sql`
4. Paste it into the SQL Editor
5. Click "Run"

### 2. Verify the Fix
After running the SQL, test the quotation creation:

1. Go to the Quotations page
2. Select a lead
3. Click "Create Quotation"
4. Fill in the form:
   - Total Sq.Ft.: `500`
   - Rate Per Sq.Ft.: `1000`
   - GST %: `18`
   - Profit %: `10`
   - Notes: `Test quotation`
5. Click "Create Quotation"
6. You should see: "Quotation created successfully!"

### 3. Check Browser Console
If you still have issues, check the browser console for error messages:
1. Press `F12` to open Developer Tools
2. Go to Console tab
3. Try creating a quotation again
4. Look for error messages in red

## Expected Behavior After Fix
✅ Quotations can be created and saved to database
✅ Values are persisted and visible when page refreshes
✅ Edit quotation dialog shows current values
✅ Change history is recorded
✅ Only authorized users can access quotations

## RLS Policy Details

### For INSERT (Creating new quotations):
- User must have role: `admin`, `sales`, or `accounts`
- User must be assigned to the lead OR have created the lead OR be an admin

### For SELECT (Viewing quotations):
- User must be assigned to the lead OR have created the lead OR be an admin

### For UPDATE (Editing quotations):
- Same access rules as SELECT

### For DELETE (Deleting quotations):
- Only admin users or the person who created the quotation can delete

## Database Changes Made
```sql
-- Enable RLS
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_history ENABLE ROW LEVEL SECURITY;

-- Added 5 policies for quotations table
-- Added 2 policies for quotation_history table
```

## Files Modified
- `fix-quotations-rls.sql` - New SQL fix file

## Testing Checklist
- [ ] Run the SQL fix
- [ ] Try creating a new quotation
- [ ] Verify values are saved
- [ ] Refresh page and check if values persist
- [ ] Try editing a quotation
- [ ] Check change history is recorded
- [ ] Verify only authorized users can see quotations

## If Still Not Working
1. Check Supabase Real-time database for entries
2. Verify user authentication is working (check `/login` page)
3. Check user role in `users` table
4. Check lead assignment (verify `assigned_to` or `created_by` matches user ID)
5. Check browser console for specific error messages

## Support
If quotations still aren't saving after applying the RLS fix, check:
1. User is logged in properly
2. User has correct role (`sales`, `accounts`, or `admin`)
3. Lead is properly assigned to the user
4. Check Supabase logs for policy violations
