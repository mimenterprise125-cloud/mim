# ⚡ Quick Fix - Quotation Not Saving

## The Problem
When you click "Create Quotation" in the app, the form appears to work but **nothing gets saved** to the database.

## The Quick Fix (2 minutes)

### 1️⃣ Copy the SQL
Copy everything from `fix-quotations-rls.sql`

### 2️⃣ Run in Supabase
- Go to: https://app.supabase.com
- Select your project
- Click: **SQL Editor**
- Click: **New Query**
- Paste the SQL code
- Click: **Run**

### 3️⃣ Test It
- Go back to your app
- Open **Quotations** page
- Select a lead
- Click **Create Quotation**
- Fill in values (sqft, rate, etc.)
- Click **Create Quotation**
- ✅ You should see: "Quotation created successfully!"
- ✅ Refresh the page - values should still be there

## ✨ Done!
Your quotations should now save properly.

## 🆘 If It Still Doesn't Work

Open your browser console (F12) and run:
```javascript
testSupabaseConnection()
```

If that fails, check:
1. Are you logged in?
2. Is your user role "admin", "sales", or "accounts"?
3. Is the lead assigned to you?

---

**That's it!** The SQL fix enables database permissions that were blocking quotation saves.
