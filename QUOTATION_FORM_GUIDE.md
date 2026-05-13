# Quotation Form - Visual Guide

## 📱 New Form Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Create Quotation                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────┐  ┌─────────────────────────┐    │
│  │ INPUT FIELDS          │  │ 📊 AMOUNT BREAKDOWN    │    │
│  │                       │  │                         │    │
│  │ Total Sq.Ft. *        │  │ Sq.Ft.: 500            │    │
│  │ [Enter sq.ft.]        │  │ Rate/Sq.Ft.: ₹1000     │    │
│  │                       │  │ ─────────────────────  │    │
│  │ Rate Per Sq.Ft. *     │  │ Subtotal: ₹5,00,000    │    │
│  │ [Enter rate]          │  │ GST (18%): ₹90,000     │    │
│  │                       │  │ ─────────────────────  │    │
│  │ GST % *               │  │ Total with GST:        │    │
│  │ [18]                  │  │ ₹5,90,000              │    │
│  │                       │  │                         │    │
│  │ Profit % (Optional)   │  │ Profit: 10%            │    │
│  │ [0]                   │  │                         │    │
│  │                       │  └─────────────────────────┘    │
│  │ Notes (Optional)      │                                 │
│  │ [Add notes...]        │                                 │
│  │                       │                                 │
│  └───────────────────────┘                                 │
│                                                             │
│ [Cancel]  [✓ Create Quotation]                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Form Features

### Left Column - Inputs
```
Total Sq.Ft. *
↓ (required)
[500        ]  ← User enters area

Rate Per Sq.Ft. (₹) *
↓ (required)
[1000       ]  ← User enters rate

GST % *
↓ (default 18%)
[18         ]  ← Can be adjusted

Profit % (Optional)
↓ (optional)
[10         ]  ← Optional field

Notes (Optional)
↓ (optional)
[Long text...]  ← Multi-line notes
```

### Right Column - Auto-Calculated
```
📊 Amount Breakdown
─────────────────
Sq.Ft.: 500
Rate/Sq.Ft.: ₹1,000
─────────────────
Subtotal: ₹5,00,000 ← Sq.Ft × Rate
GST (18%): ₹90,000  ← Subtotal × (18/100)
─────────────────
Total with GST:
₹5,90,000           ← Subtotal + GST
```

## ⚡ Real-Time Updates

### As User Types:
```
1. User enters: 500 sq.ft.
   → Nothing calculated yet (waiting for rate)

2. User enters: 1000 rate
   → Subtotal: ₹5,00,000 ✅
   → GST: ₹90,000 ✅
   → Total: ₹5,90,000 ✅

3. User changes GST to 5%
   → Subtotal: ₹5,00,000 (unchanged)
   → GST: ₹25,000 (updated!)
   → Total: ₹5,25,000 (updated!)

4. User enters Profit: 20%
   → Display shows: "Profit: 20%"
   → (Calculations unchanged, saved on submit)
```

## 📊 Calculation Examples

### Example 1: Standard Project
```
Input:
  Sq.Ft.: 1000
  Rate: ₹500
  GST: 18%

Result:
  Subtotal = 1000 × 500 = ₹5,00,000
  GST = 500,000 × 18% = ₹90,000
  Total = ₹5,90,000
```

### Example 2: Premium Project
```
Input:
  Sq.Ft.: 2500
  Rate: ₹2000
  GST: 18%
  Profit: 15%

Result:
  Subtotal = 2500 × 2000 = ₹50,00,000
  GST = 50,00,000 × 18% = ₹9,00,000
  Total = ₹59,00,000
  Profit: 15% (tracked in database)
```

### Example 3: Budget Project
```
Input:
  Sq.Ft.: 500
  Rate: ₹300
  GST: 5%

Result:
  Subtotal = 500 × 300 = ₹1,50,000
  GST = 150,000 × 5% = ₹7,500
  Total = ₹1,57,500
```

## 🎨 Color Coding

```
🟡 Gold     → Primary action, titles, amounts
⬛ Ink      → Background, neutral areas
⚪ White    → Text, primary content
🔴 Muted    → Secondary labels, helpers
```

## 📱 Mobile View

On smaller screens, the layout stacks:
```
┌──────────────┐
│  Create      │
│  Quotation   │
├──────────────┤
│ INPUT        │
│ FIELDS       │
│              │
│ [Sq.Ft.]    │
│ [Rate]      │
│ [GST]       │
│ [Profit]    │
│ [Notes]     │
│              │
├──────────────┤
│ 📊 AMOUNT    │
│ BREAKDOWN    │
│              │
│ Sq.Ft: 500   │
│ Rate: ₹1000  │
│ Subtotal:    │
│ ₹5,00,000    │
│ GST: ₹90,000 │
│ Total:       │
│ ₹5,90,000    │
│              │
├──────────────┤
│ [Cancel]     │
│ [Create]     │
└──────────────┘
```

## ✅ User Flow

```
1. Click "➕ Create Quotation"
   ↓
2. Dialog opens with form
   ↓
3. Enter Sq.Ft.
   ↓
4. Enter Rate/Sq.Ft.
   ↓
5. Watch calculations appear
   ↓
6. (Optional) Adjust GST or Profit
   ↓
7. (Optional) Add notes
   ↓
8. Review total amount
   ↓
9. Click "✓ Create Quotation"
   ↓
10. ✅ Success! Quotation saved
```

## 🔢 Format Examples

All amounts are displayed with Indian number formatting:

```
Number   → Display
1000     → ₹1,000
10000    → ₹10,000
100000   → ₹1,00,000
1000000  → ₹10,00,000
```

## 💡 Pro Tips

1. **Use Default GST**: Keep GST at 18% unless customer requires different rate
2. **Profit %**: Optional field for internal tracking, doesn't affect calculation
3. **Mobile**: Scroll down to see all fields and calculations
4. **Edit**: Use "Edit Quotation" button to modify existing quotation
5. **Check Calculations**: Always verify total before saving

---

**Form Status**: ✅ Ready to Use
**Last Updated**: May 2026
