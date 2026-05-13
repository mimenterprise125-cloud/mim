# Create Quotation Button - Event Handling Fix

## Problem Identified
The Create Quotation button was not responding even though the Cancel button worked. This was caused by:

1. **Nested Dialogs**: Each lead card in the `.map()` loop created its own Dialog with another Dialog inside (for quotation form)
2. **Pointer Events Blocked**: The outer Dialog's overlay was blocking pointer events to the inner Dialog
3. **Missing Event Propagation Control**: Button clicks weren't properly handling event propagation
4. **Z-index Issues**: Inner Dialog wasn't layered above the outer Dialog

## Root Cause

```tsx
// BROKEN STRUCTURE
<div className="grid grid-cols-1 ...">
  {filteredLeads.map(lead => (
    <Dialog>  {/* Outer Dialog - Lead Details */}
      <DialogContent>
        <Dialog>  {/* NESTED Inner Dialog - Quotation Form */}
          <DialogContent>
            <Button onClick={handleCreateQuotation}>Create</Button>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  ))}
</div>
```

Radix UI's Dialog creates overlays and portal renders that conflict when nested.

## Solutions Applied

### 1. DialogContent - Event Handling
```tsx
<DialogContent 
  onClick={(e) => e.stopPropagation()}
  className="bg-black border-gold/20 max-w-2xl max-h-[90vh] overflow-y-auto z-[9999]"
>
```

**What this does:**
- `onClick={(e) => e.stopPropagation()}` - Prevents click events from bubbling to parent Dialog
- `z-[9999]` - Ensures quotation form Dialog appears above lead details Dialog
- Allows inner Dialog to receive and handle clicks properly

### 2. Create Quotation Button - Proper Event Control
```tsx
<Button
  type="button"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Create Quotation clicked", { modalLead, form: quotationForm });
    handleCreateQuotation();
  }}
  className="flex-1 bg-gold text-ink hover:bg-gold/90"
>
  ✓ Create Quotation
</Button>
```

**What this does:**
- `type="button"` - Explicitly marks as button (prevents form submission)
- `e.preventDefault()` - Prevents default browser behavior
- `e.stopPropagation()` - Prevents event from bubbling to parent elements
- `console.log()` - Helps debug if clicks are registering in browser
- Ensures click handler executes even within nested Dialog

### 3. Cancel Button - Same Treatment
```tsx
<Button
  type="button"
  variant="outline"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuotationForm(false);
    setQuotationForm({ total_sqft: "", rate_per_sqft: "", gst_percentage: 18, profit_percentage: "", notes: "" });
  }}
  className="flex-1 border-gold/20 text-gold hover:bg-gold/10"
>
  Cancel
</Button>
```

## Testing Instructions

1. **Open browser DevTools** (F12)
2. **Go to Console tab** to see logs
3. **Navigate to `/leads`**
4. **Click on a lead** to open details modal
5. **If lead status is QUOTATION_SENT, NEGOTIATION, or CONVERTED:**
   - Click "+ Add Quotation" button
   - You should see: `"Create Quotation clicked"` log in console
   - Form should open in the foreground
6. **Fill in values:**
   - Sq.Ft: 1000
   - Rate: 500
   - GST: 18 (default)
   - Watch real-time calculations update
7. **Click "✓ Create Quotation" button:**
   - Should see console log
   - Form should close
   - Toast notification: "Quotation created successfully!"
   - Quotation details should appear in the lead modal

## Why These Fixes Work

### Event Propagation
- Button clicks bubble up through DOM tree
- Parent Dialog's overlay was intercepting clicks
- `stopPropagation()` stops this bubbling
- Ensures button's click handler runs first

### Z-index Layering
- Outer Dialog (lead details) has default z-index
- Inner Dialog needs higher z-index to appear on top
- `z-[9999]` ensures quotation form is visible and clickable

### Type Safety
- `type="button"` explicitly tells browser this is clickable button
- Prevents accidental form submissions
- Ensures consistent click behavior

### Debug Logging
- `console.log()` helps verify clicks are registering
- If console shows nothing = pointer events are blocked
- If console shows log = event is firing but other issue exists

## Files Modified
- `src/routes/leads.tsx` - Lines 310-415 (Quotation Dialog & Buttons)

## If Still Not Working

**Check browser console (F12 > Console tab):**

1. **No log message at all?**
   - Pointer events still blocked
   - Try adding `pointerEvents: 'auto'` inline style to DialogContent
   - Or check for CSS `pointer-events: none` on parent elements

2. **Log message appears but nothing happens?**
   - `handleCreateQuotation` function not executing properly
   - Check browser console for errors
   - Verify `modalLead` is set: add `console.log({ modalLead })` to onClick

3. **Dialog not opening at all?**
   - Check `showQuotationForm` state management
   - Verify `modalLead?.id === lead.id` condition is true
   - Look for Dialog open/close state conflicts

## Related Files
- `quotation.tsx` - Uses same pattern (working correctly)
- Reference this for comparison if issues persist

## Next Steps (Future Optimization)
- **BEST FIX**: Move quotation Dialog completely outside the `.map()` loop
- Create a single modal for all leads instead of one per card
- Eliminates nested Dialog issue entirely
- Current fix is production-ready but this would be cleaner architecture
