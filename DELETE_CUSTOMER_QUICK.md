# Quick Delete Guide - TL;DR

## To Delete a Customer, Delete From These Tables (IN THIS ORDER):

```
1. payment_history (by lead_id)
2. project_updates (by project_id from lead's projects)
3. payments (by project_id from lead's projects)
4. projects (by lead_id)
5. leads (by id or phone)
```

## Quick SQL Template

Replace `PHONE_NUMBER` with customer's phone:

```sql
-- 1. Delete payments history
DELETE FROM payment_history WHERE lead_id IN (
  SELECT id FROM leads WHERE phone = 'PHONE_NUMBER'
);

-- 2. Delete project updates
DELETE FROM project_updates WHERE project_id IN (
  SELECT id FROM projects WHERE lead_id IN (
    SELECT id FROM leads WHERE phone = 'PHONE_NUMBER'
  )
);

-- 3. Delete payments
DELETE FROM payments WHERE project_id IN (
  SELECT id FROM projects WHERE lead_id IN (
    SELECT id FROM leads WHERE phone = 'PHONE_NUMBER'
  )
);

-- 4. Delete projects
DELETE FROM projects WHERE lead_id IN (
  SELECT id FROM leads WHERE phone = 'PHONE_NUMBER'
);

-- 5. Delete customer
DELETE FROM leads WHERE phone = 'PHONE_NUMBER';
```

## What Gets Deleted:
- ✓ Customer record
- ✓ All projects
- ✓ All payments received
- ✓ All payment transactions
- ✓ All project updates/history

## Better Alternative:
Instead of deleting, mark as inactive:
```sql
UPDATE leads SET status = 'DELETED' WHERE phone = 'PHONE_NUMBER';
UPDATE projects SET status = 'CANCELLED' WHERE lead_id IN (SELECT id FROM leads WHERE phone = 'PHONE_NUMBER');
```

**Benefits**: Data preserved, can be restored, keeps audit trail

## Files Provided:
1. **DELETE_CUSTOMER.sql** - Complete script ready to use
2. **CUSTOMER_DELETION_GUIDE.md** - Detailed explanation of all tables and relationships
