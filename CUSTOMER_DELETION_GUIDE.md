# Complete Customer Data Deletion Guide

## Data Structure (Dependency Chain)

```
leads (Customer)
├── projects (belongs to lead via lead_id)
│   ├── payments (belongs to project via project_id)
│   └── project_updates (belongs to project via project_id)
└── payment_history (belongs to lead via lead_id)
```

## Tables and Their Relationships

### 1. **leads** (Primary Table - Customer Record)
- `id` (UUID) - Primary Key
- `phone` (VARCHAR) - Used to identify customer
- `name` (VARCHAR) - Customer name
- `email` (VARCHAR) - Customer email
- Other fields: status, created_at, etc.

**Contains**: Customer basic information

---

### 2. **projects** (Projects Table)
- `id` (UUID) - Primary Key
- `lead_id` (UUID) - Foreign Key → leads.id
- `name` (VARCHAR) - Project name
- `total_with_gst` (DECIMAL) - Quoted amount
- Other fields: sqft, rate, status, dates, etc.

**Contains**: All projects quoted/created for the customer

---

### 3. **payments** (Quotation Payments Table)
- `id` (UUID) - Primary Key
- `project_id` (UUID) - Foreign Key → projects.id
- `amount` (DECIMAL) - Payment amount
- `status` (VARCHAR) - PENDING, DUE, PAID, OVERDUE
- Other fields: type, payment_date, notes, etc.

**Contains**: Payment records linked to projects
**Note**: These are quotation-based payment tracking

---

### 4. **payment_history** (Actual Payment Transactions)
- `id` (UUID) - Primary Key
- `lead_id` (UUID) - Foreign Key → leads.id
- `amount_paid` (NUMERIC) - Actual amount paid
- `payment_date` (DATE) - When payment was made
- `payment_method` (VARCHAR) - TRANSFER, CASH, etc.
- Other fields: reference_number, notes, created_at

**Contains**: All actual payments received from the customer

---

### 5. **project_updates** (Project Status Updates)
- `id` (UUID) - Primary Key
- `project_id` (UUID) - Foreign Key → projects.id
- `type` (VARCHAR) - PROGRESS, DELAY, COMPLETION
- `description` (TEXT) - Update details
- Other fields: delay_reason, images, created_at

**Contains**: Timeline/history of project updates

---

## Step-by-Step Deletion Process

### Prerequisites
- Have the customer's phone number ready
- Make a backup of the database (recommended)
- Access to Supabase SQL Editor

### Deletion Steps

#### Step 1: Identify the Customer
```sql
SELECT id, name, phone, email FROM leads 
WHERE phone = 'CUSTOMER_PHONE_NUMBER';
```
**Verify**: Confirm this is the correct customer before proceeding

#### Step 2: Delete Payment History
```sql
DELETE FROM payment_history 
WHERE lead_id = 'CUSTOMER_LEAD_ID';
```
**Deletes**: All payment transaction records for the customer

#### Step 3: Delete Project Updates
```sql
DELETE FROM project_updates 
WHERE project_id IN (
  SELECT id FROM projects 
  WHERE lead_id = 'CUSTOMER_LEAD_ID'
);
```
**Deletes**: All project update history records

#### Step 4: Delete Payments (Quotation Payments)
```sql
DELETE FROM payments 
WHERE project_id IN (
  SELECT id FROM projects 
  WHERE lead_id = 'CUSTOMER_LEAD_ID'
);
```
**Deletes**: All quotation payment records

#### Step 5: Delete Projects
```sql
DELETE FROM projects 
WHERE lead_id = 'CUSTOMER_LEAD_ID';
```
**Deletes**: All projects for the customer

#### Step 6: Delete Lead (Customer Record)
```sql
DELETE FROM leads 
WHERE id = 'CUSTOMER_LEAD_ID';
```
**Deletes**: The customer record itself

---

## Quick Reference: What Gets Deleted?

| When You Delete a Customer, You're Deleting: |
|---|
| ✓ Customer name, phone, email, status |
| ✓ All projects quoted for them |
| ✓ All quotation payment records |
| ✓ All actual payment transactions |
| ✓ All project update history |
| ✓ All communication/notes attached |

---

## How to Use the Provided Script

### Method 1: Using the DELETE_CUSTOMER.sql file

1. Open Supabase Dashboard → SQL Editor
2. Open `DELETE_CUSTOMER.sql` file
3. Replace `'CUSTOMER_PHONE_NUMBER'` with actual phone (e.g., `'9876543210'`)
4. Run the SELECT query first to verify the customer
5. Then run each DELETE query in order
6. Run the verification query at the end

### Method 2: Using Supabase UI (Manual)

1. Go to Supabase Dashboard
2. Navigate to each table in order:
   - payment_history
   - project_updates
   - payments
   - projects
   - leads
3. Use the filter to find records by lead_id
4. Delete manually (not recommended for multiple records)

---

## Important Warnings ⚠️

### DO NOT DELETE IN THIS ORDER:
❌ leads → projects → ...
(Foreign key constraint error)

### DO DELETE IN THIS ORDER:
✅ payment_history → project_updates → payments → projects → leads

### Data Will Be PERMANENTLY Deleted
- There's no undo after deletion
- The customer cannot be recovered
- All associated data (projects, payments, history) is gone

### Consider Before Deleting
- Is this a duplicate customer entry?
- Should you mark as 'INACTIVE' instead of deleting?
- Do you need to keep records for accounting/tax purposes?
- Is there a data retention policy you should follow?

---

## Alternative: Soft Delete (Recommended)

Instead of permanently deleting, consider marking as inactive:

```sql
UPDATE leads 
SET status = 'DELETED' 
WHERE phone = 'CUSTOMER_PHONE_NUMBER';

UPDATE projects 
SET status = 'CANCELLED' 
WHERE lead_id IN (SELECT id FROM leads WHERE phone = 'CUSTOMER_PHONE_NUMBER');
```

**Advantages**:
- ✓ Data is preserved
- ✓ Can be restored if needed
- ✓ Maintains audit trail
- ✓ Better for compliance/accounting

---

## Verification After Deletion

Run this query to confirm complete deletion:

```sql
SELECT 
  'Leads' as table_name, 
  COUNT(*) as count 
FROM leads 
WHERE phone = 'CUSTOMER_PHONE_NUMBER'
UNION ALL
SELECT 'Projects', COUNT(*) 
FROM projects 
WHERE lead_id IN (SELECT id FROM leads WHERE phone = 'CUSTOMER_PHONE_NUMBER')
UNION ALL
SELECT 'Payments', COUNT(*) 
FROM payments 
WHERE project_id IN (SELECT id FROM projects WHERE lead_id IN (SELECT id FROM leads WHERE phone = 'CUSTOMER_PHONE_NUMBER'))
UNION ALL
SELECT 'Payment History', COUNT(*) 
FROM payment_history 
WHERE lead_id IN (SELECT id FROM leads WHERE phone = 'CUSTOMER_PHONE_NUMBER')
UNION ALL
SELECT 'Project Updates', COUNT(*) 
FROM project_updates 
WHERE project_id IN (SELECT id FROM projects WHERE lead_id IN (SELECT id FROM leads WHERE phone = 'CUSTOMER_PHONE_NUMBER'));
```

**Expected Result**: All counts should be 0

---

## Support & Questions

For any issues or questions:
1. Check the database backup
2. Contact the database administrator
3. Review the audit logs for the deletion timestamp
