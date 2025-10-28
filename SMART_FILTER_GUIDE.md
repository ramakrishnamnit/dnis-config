# Smart Filter - Quick Start Guide

## 🎯 What is Smart Filter?

Smart Filter is a powerful filtering tool that lets you create complex queries on your configuration tables using AND/OR logic. Think of it as a visual query builder that doesn't require SQL knowledge.

## 🚀 Getting Started

### Step 1: Open Smart Filter
1. Select a config table (e.g., `UKCC_SERVICEPROFILE`)
2. Look for the **"Smart Filter"** button in the toolbar (next to the search box)
3. Click it to open the filter builder

### Step 2: Add Your First Condition
1. Click **"Add Condition"**
2. You'll see three dropdowns/inputs:
   - **Column**: Which field to filter on
   - **Operator**: How to compare (equals, contains, etc.)
   - **Value**: What to search for

### Step 3: Build Your Query
- Add more conditions by clicking **"Add Condition"** again
- Choose **AND** or **OR** to combine conditions:
  - **AND** = All conditions must match
  - **OR** = Any condition can match

### Step 4: Apply
Click **"Apply Filters"** to see your results!

## 📋 Real-World Examples

### Example 1: Find All Active Services in UK Region
```
✓ Status equals "Active"
✓ Region equals "UK"
🔗 AND
```
**Result**: Shows only services that are both active AND in UK

---

### Example 2: Find Critical or High Priority Items
```
✓ Priority equals "Critical"
✓ Priority equals "High"
🔗 OR
```
**Result**: Shows items with either priority

---

### Example 3: Recent Payment Services in Production
```
✓ Service_Name contains "Payment"
✓ Environment equals "Production"
✓ Last_Updated greater_than "2025-01-01"
🔗 AND
```
**Result**: Payment services in production updated after Jan 1, 2025

---

### Example 4: Search Multiple Values
```
✓ Business_Unit equals "CC"
✓ Business_Unit equals "GB"
✓ Business_Unit equals "RB"
🔗 OR
```
**Result**: Records from CC, GB, or RB business units

---

## 🎨 Understanding Operators

### For Text Fields
| Operator | Example | Matches |
|----------|---------|---------|
| **Equals** | "Payment" | Exactly "Payment" |
| **Not equals** | "Payment" | Anything except "Payment" |
| **Contains** | "Pay" | "Payment", "Prepay", "PayPal" |
| **Starts with** | "Pay" | "Payment", "PayPal" (not "Prepay") |
| **Ends with** | "ment" | "Payment", "Settlement" |

### For Numbers
| Operator | Example | Matches |
|----------|---------|---------|
| **Equals** | 100 | Exactly 100 |
| **Not equals** | 100 | Any number except 100 |
| **Greater than** | 100 | 101, 200, 1000, etc. |
| **Less than** | 100 | 99, 50, 0, etc. |

### For Dates
| Operator | Example | Matches |
|----------|---------|---------|
| **Equals** | 2025-01-15 | Exactly Jan 15, 2025 |
| **Greater than** | 2025-01-15 | After Jan 15, 2025 |
| **Less than** | 2025-01-15 | Before Jan 15, 2025 |

### For Yes/No (Boolean)
| Operator | Options |
|----------|---------|
| **Equals** | Yes or No |

### For Dropdown Lists (Enum)
| Operator | Example |
|----------|---------|
| **Equals** | Select from available options |
| **Not equals** | Exclude specific option |

---

## 🔄 AND vs OR - When to Use?

### Use AND When:
- You want to **narrow down** results
- All criteria must be true
- Example: "Show me active UK services"

### Use OR When:
- You want to **expand** results
- Any criteria can be true
- Example: "Show me high or critical priority items"

### Visual Comparison:

**AND Logic** (Restrictive)
```
[Active] ─┐
          ├─> Only records matching BOTH
[UK]   ───┘
```

**OR Logic** (Inclusive)
```
[Critical] ─┐
            ├─> Records matching EITHER
[High]   ───┘
```

---

## 💡 Pro Tips

### 1. Start Simple
- Begin with one or two conditions
- Test to see if you get expected results
- Add more conditions as needed

### 2. Use Contains for Flexible Search
- Instead of exact match: `Service_Name equals "Payment_Gateway"`
- Use contains: `Service_Name contains "Payment"`
- This catches "Payment_Gateway", "Payment_API", etc.

### 3. Combine Search Methods
- Use **Global Search** for quick text search across all columns
- Use **Smart Filter** for precise, multi-column queries
- They work together!

### 4. Clear When Needed
- Click "Clear All" to remove all filters
- Or remove individual conditions with the trash icon
- Filters persist until cleared

### 5. Check Active Filters
- Active conditions shown as badges above the table
- Logical operator (AND/OR) displayed clearly
- Easy to see what's currently filtered

---

## 🐛 Common Issues & Solutions

### "No results found"
**Problem**: Filter too restrictive
**Solution**: 
- Try changing AND to OR
- Remove some conditions
- Check for typos in values

### "Filter not applying"
**Problem**: Empty values
**Solution**: 
- Make sure all conditions have values entered
- Empty conditions are ignored

### "Wrong data showing"
**Problem**: Wrong logical operator
**Solution**: 
- Check if you need AND or OR
- AND = stricter, OR = more inclusive

---

## 📊 Use Cases by Role

### System Administrator
```
✓ Environment equals "Production"
✓ Status equals "Active"
✓ Last_Health_Check less_than "2025-01-28"
🔗 AND
```
Find production services that haven't been checked recently

### Business Analyst
```
✓ Business_Unit equals "CC"
✓ Region equals "UK"
✓ Revenue greater_than "100000"
🔗 AND
```
Analyze high-revenue UK CC business

### Support Engineer
```
✓ Status equals "Error"
✓ Status equals "Warning"
🔗 OR
```
Find all services needing attention

### Auditor
```
✓ Last_Modified_By contains "admin"
✓ Last_Modified_Date greater_than "2025-01-01"
🔗 AND
```
Track admin changes this year

---

## 🎓 Advanced Patterns

### Pattern 1: Date Range
```
✓ Created_Date greater_than "2025-01-01"
✓ Created_Date less_than "2025-01-31"
🔗 AND
```
Records created in January 2025

### Pattern 2: Exclude Multiple Values
```
✓ Status not_equals "Deleted"
✓ Status not_equals "Archived"
🔗 AND
```
Everything except deleted or archived

### Pattern 3: Text Search Variations
```
✓ Description contains "payment"
✓ Service_Name contains "payment"
✓ Notes contains "payment"
🔗 OR
```
Find "payment" anywhere in multiple fields

---

## 🔐 Best Practices

1. **Name Your Intent**: Think about what you're looking for before building
2. **Test Incrementally**: Add one condition at a time
3. **Document Complex Filters**: Save common patterns for reuse
4. **Use Appropriate Operators**: Match operator to data type
5. **Consider Performance**: Fewer conditions = faster queries
6. **Combine with Sort**: Filter first, then sort results
7. **Export Results**: Use Download Config after filtering

---

## 🆚 Smart Filter vs Simple Search

| Feature | Global Search | Column Filter | Smart Filter |
|---------|--------------|---------------|--------------|
| Speed | ⚡⚡⚡ Fast | ⚡⚡ Medium | ⚡ Thorough |
| Columns | All | One | Multiple |
| Logic | Simple | Simple | AND/OR |
| Operators | Contains | Equals | Many |
| Precision | Low | Medium | High |
| Use Case | Quick look | Single field | Complex query |

**Recommendation**: 
- Quick search → Global Search
- Single column → Column Filter
- Complex criteria → **Smart Filter** ⭐

---

## 📱 Keyboard Shortcuts

- **Enter**: Apply filters (when in value field)
- **Escape**: Close filter panel
- **Tab**: Navigate between fields

---

## 🔮 Coming Soon

- 💾 Save favorite filters
- 📋 Filter templates
- 🔄 Filter history
- 🌳 Nested group logic
- 🗣️ Natural language queries

---

## ❓ Quick Reference

### Opening Smart Filter
`Toolbar → Smart Filter button → Opens panel`

### Adding Conditions
`Add Condition → Select Column → Choose Operator → Enter Value`

### Changing Logic
`Select AND (all match) or OR (any match)`

### Applying
`Apply Filters button → Table updates`

### Clearing
`Clear All button or individual trash icons`

---

## 📞 Need Help?

The Smart Filter is designed to be intuitive, but if you're stuck:

1. Start with a simple one-condition filter
2. Check the operator matches your data type
3. Verify values are correct (case-sensitive)
4. Try OR instead of AND if no results
5. Clear all and start fresh if confused

**Remember**: You can always use the simple Global Search or Column Filters if Smart Filter feels too complex for your current need!

---

## ✨ Summary

Smart Filter gives you **SQL-like power** with a **visual interface**:
- ✅ Multiple conditions
- ✅ AND/OR logic
- ✅ Various operators
- ✅ Type-aware inputs
- ✅ Clear visual feedback
- ✅ Works with existing features

Happy Filtering! 🎉

