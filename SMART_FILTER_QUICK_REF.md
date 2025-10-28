# Smart Filter - Quick Reference Card

## 🚀 Quick Start (30 seconds)

1. **Open**: Click `Smart Filter` button (toolbar)
2. **Add**: Click `Add Condition`
3. **Select**: Column → Operator → Value
4. **Logic**: Choose AND (all) or OR (any)
5. **Apply**: Click `Apply Filters`

---

## 🎯 Operators Cheat Sheet

### Text (String)
- `Equals` - Exact match
- `Not equals` - Exclude exact
- `Contains` - Anywhere in text
- `Starts with` - Beginning only
- `Ends with` - Ending only

### Numbers
- `Equals` - Exact number
- `Not equals` - Exclude number
- `Greater than` - Larger than
- `Less than` - Smaller than

### Dates
- `Equals` - Exact date
- `Greater than` - After date
- `Less than` - Before date

### Yes/No
- `Equals` - Select Yes or No

### Dropdowns
- `Equals` - Select from list
- `Not equals` - Exclude option

---

## 🔄 AND vs OR

| Logic | Meaning | Example | Result |
|-------|---------|---------|--------|
| **AND** | All must match | Status=Active **AND** Region=UK | Only active UK records |
| **OR** | Any can match | Priority=High **OR** Priority=Critical | High or critical records |

**Rule of Thumb:**
- Want **fewer** results? → Use **AND**
- Want **more** results? → Use **OR**

---

## 💡 Common Patterns

### Pattern 1: Exact Match Multiple Values
```
Column: Business_Unit
Condition 1: Equals "CC"
Condition 2: Equals "GB"
Logic: OR
```

### Pattern 2: Date Range
```
Column: Created_Date
Condition 1: Greater than "2025-01-01"
Condition 2: Less than "2025-12-31"
Logic: AND
```

### Pattern 3: Search Across Columns
```
Condition 1: Service_Name Contains "payment"
Condition 2: Description Contains "payment"
Logic: OR
```

### Pattern 4: Exclude Values
```
Column: Status
Condition 1: Not equals "Deleted"
Condition 2: Not equals "Archived"
Logic: AND
```

---

## ⚡ Keyboard Shortcuts

- `Tab` - Next field
- `Shift+Tab` - Previous field
- `Enter` - Apply filters (from value field)
- `Escape` - Close panel

---

## 🎨 Visual Guide

### Button States
- No badge = No active filters
- `[2]` badge = 2 active filters
- Red dot = Filters pending application

### Active Display
```
[AND] [Status Equals Active] [Region Equals UK] [Clear All]
  ↑           ↑                      ↑              ↑
Logic    Condition 1            Condition 2     Remove all
```

---

## ⚠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| No results | Try OR instead of AND |
| Filter not working | Check all conditions have values |
| Wrong operator | Change column first, then operator |
| Can't find column | Scroll in dropdown or type to search |

---

## 📊 Use Cases

### Admin
Find services needing attention:
```
Status Equals "Error" OR Status Equals "Warning"
```

### Analyst
High-value transactions:
```
Amount Greater than 10000 AND Region Equals "UK"
```

### Support
Recent changes by specific user:
```
Last_Modified_By Contains "john" AND 
Last_Modified_Date Greater than "2025-01-01"
```

---

## 🔐 Best Practices

✅ **DO:**
- Start simple, add conditions gradually
- Use Contains for flexible text search
- Test filters before complex queries
- Clear filters when done

❌ **DON'T:**
- Add conditions without values
- Use AND when you mean OR (and vice versa)
- Forget to Apply after changes
- Stack too many conditions (performance)

---

## 📚 Full Documentation

- 📖 [Feature Documentation](./SMART_FILTER_FEATURE.md)
- 📚 [User Guide](./SMART_FILTER_GUIDE.md)
- 🎨 [Visual Guide](./SMART_FILTER_VISUAL.md)
- 🔧 [Implementation](./SMART_FILTER_IMPLEMENTATION.md)

---

## 🆘 Quick Help

**Filter not applying?**
→ Check values are entered

**Too many/few results?**
→ Switch between AND/OR

**Need to start over?**
→ Click "Clear All"

**Want to save time?**
→ Use Global Search for simple queries

---

**Remember**: Smart Filter = SQL power + Visual UI 🎉

