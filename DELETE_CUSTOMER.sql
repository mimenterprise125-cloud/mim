-- ============================================================================
-- DELETE CUSTOMER DATA - Complete Cleanup Script
-- ============================================================================
-- IMPORTANT: Replace 'CUSTOMER_PHONE_NUMBER' with the actual phone number
-- This will delete ALL associated data for that customer
-- ============================================================================

-- SET THE CUSTOMER PHONE NUMBER HERE
-- Example: '9876543210' or '+91 98765 43210'
-- DO NOT DELETE THIS COMMENT - Update the phone number below

-- Step 1: Find the lead ID (verify before deletion)
SELECT id, name, phone, email FROM leads WHERE phone = 'CUSTOMER_PHONE_NUMBER';

-- ============================================================================
-- DELETION SEQUENCE (Execute only after confirming the lead above)
-- ============================================================================

-- Step 2: Delete payment history for this customer
DELETE FROM payment_history 
WHERE lead_id IN (
  SELECT id FROM leads WHERE phone = 'CUSTOMER_PHONE_NUMBER'
);

-- Step 3: Delete project updates for all projects of this customer
DELETE FROM project_updates 
WHERE project_id IN (
  SELECT id FROM projects WHERE lead_id IN (
    SELECT id FROM leads WHERE phone = 'CUSTOMER_PHONE_NUMBER'
  )
);

-- Step 4: Delete payments for all projects of this customer
DELETE FROM payments 
WHERE project_id IN (
  SELECT id FROM projects WHERE lead_id IN (
    SELECT id FROM leads WHERE phone = 'CUSTOMER_PHONE_NUMBER'
  )
);

-- Step 5: Delete all projects for this customer
DELETE FROM projects 
WHERE lead_id IN (
  SELECT id FROM leads WHERE phone = 'CUSTOMER_PHONE_NUMBER'
);

-- Step 6: Delete the lead (customer record)
DELETE FROM leads 
WHERE phone = 'CUSTOMER_PHONE_NUMBER';

-- ============================================================================
-- Verify deletion (should return no results)
-- ============================================================================
SELECT 'Payment History' as table_name, COUNT(*) as remaining_records FROM payment_history WHERE lead_id IN (SELECT id FROM leads WHERE phone = 'CUSTOMER_PHONE_NUMBER')
UNION ALL
SELECT 'Project Updates', COUNT(*) FROM project_updates WHERE project_id IN (SELECT id FROM projects WHERE lead_id IN (SELECT id FROM leads WHERE phone = 'CUSTOMER_PHONE_NUMBER'))
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments WHERE project_id IN (SELECT id FROM projects WHERE lead_id IN (SELECT id FROM leads WHERE phone = 'CUSTOMER_PHONE_NUMBER'))
UNION ALL
SELECT 'Projects', COUNT(*) FROM projects WHERE lead_id IN (SELECT id FROM leads WHERE phone = 'CUSTOMER_PHONE_NUMBER')
UNION ALL
SELECT 'Leads', COUNT(*) FROM leads WHERE phone = 'CUSTOMER_PHONE_NUMBER';

-- ============================================================================
-- SUCCESS! Customer data has been completely deleted
-- ============================================================================
