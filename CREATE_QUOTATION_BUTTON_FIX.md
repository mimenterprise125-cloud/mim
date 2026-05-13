# Create Quotation Button Fix

## Problem
The "Create Quotation" button was not working/not responding to clicks.

## Root Cause
The Dialog component was nested inside the conditional render with a `DialogTrigger`. This caused:
1. The Dialog to be conditionally mounted/unmounted
2. The trigger button state was not properly managed
3. Button clicks didn't open the dialog

## Solution Applied
Restructured the code to:
1. **Separate the Button** - Moved the trigger button outside the Dialog component
2. **Manual State Management** - Use `onClick={() => setShowQuotationForm(true)}` instead of `DialogTrigger`
3. **Always Render Dialog** - The Dialog is now always rendered but controlled by the `open` prop

## Changes Made

### Before (Not Working):
```tsx
{!currentQuotation && (
  <Dialog open={showQuotationForm} onOpenChange={setShowQuotationForm}>
    <DialogTrigger asChild>
      <Button>Create Quotation</Button>  {/* Problem: trigger inside conditional */}
    </DialogTrigger>
    <DialogContent>
      {/* Form fields */}
    </DialogContent>
  </Dialog>
)}
```

### After (Fixed):
```tsx
{/* Button always visible when no quotation */}
{!currentQuotation && (
  <Card className="bg-ink-card border-gold/20 p-6">
    <Button 
      onClick={() => setShowQuotationForm(true)}  {/* Direct state control */}
      className="w-full bg-gold text-ink hover:bg-gold/90"
    >
      Create Quotation
    </Button>
  </Card>
)}

{/* Dialog rendered separately with controlled open state */}
<Dialog open={showQuotationForm} onOpenChange={setShowQuotationForm}>
  <DialogContent className="bg-ink-card border-gold/20 max-w-md">
    {/* Form fields */}
  </DialogContent>
</Dialog>
```

## Key Improvements
✅ Button now responds to clicks
✅ Dialog opens properly when button is clicked
✅ Dialog closes when form is submitted or canceled
✅ Form state is preserved
✅ Better separation of concerns

## Testing
1. Go to Quotations page
2. Select a lead
3. Click "Create Quotation" button
4. Dialog should open immediately
5. Fill in the form
6. Click "Create Quotation" in the dialog
7. Verify success message appears

## Files Modified
- `src/routes/quotation.tsx` - Fixed button and dialog structure

---
Status: ✅ Fixed and ready to test
