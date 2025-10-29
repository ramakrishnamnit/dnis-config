# Filtering Quick Reference Guide

## Overview
The application now uses an integrated **Smart Filters** system with three filtering methods that work together seamlessly.

---

## 🔍 Three Ways to Filter Data

### 1. **Global Search** (Top Bar)
```
Location: Top action bar, left side
Icon: 🔍 Search
Purpose: Search across ALL columns simultaneously
```

**How to Use:**
- Type in the search box
- Searches all columns at once
- Real-time filtering as you type
- Clear by deleting text

**Example:**
```
Search: "john"
Result: Shows all rows where ANY column contains "john"
```

---

### 2. **Date Range Filter** (Top Bar - Part of Smart Filters)
```
Location: Top action bar, next to search
Icon: 📅 Calendar
Purpose: Filter records by date range
```

**How to Use:**
1. Click the **"Date Range"** button
2. Select **"From Date"** (optional)
3. Select **"To Date"** (optional)
4. Filter applies automatically
5. Click **"Clear"** to reset

**Visual Indicator:**
- Shows "Active" badge when dates are set
- Counts toward smart filter total
- Display shows: "Filtering from [date] to [date]"

**Examples:**
```
From: 2024-01-01, To: (empty)     → All records from Jan 1 onwards
From: (empty),     To: 2024-12-31 → All records up to Dec 31
From: 2024-01-01, To: 2024-12-31  → All records in 2024
```

---

### 3. **Column Filters** (Table Headers - Smart Filters)
```
Location: Inside each column header in the table
Icon: ▼ (dropdown icon or filter input)
Purpose: Filter specific columns
```

**How to Use:**
1. Look at any column header
2. Click or type in the filter input
3. Filter applies automatically
4. Clear by removing text or selecting "All"

**Filter Types by Column:**

#### Text Columns
```
┌─────────────────────┐
│ Column Name ▼       │
│ [Type to filter...] │
└─────────────────────┘
```

#### Number Columns
```
┌─────────────────────┐
│ Amount ▼            │
│ [Enter number...]   │
└─────────────────────┘
```

#### Dropdown Columns (Enums)
```
┌─────────────────────┐
│ Status ▼            │
│ ├─ All              │
│ ├─ Active           │
│ ├─ Inactive         │
│ └─ Pending          │
└─────────────────────┘
```

#### Boolean Columns
```
┌─────────────────────┐
│ Enabled ▼           │
│ ├─ All              │
│ ├─ Yes              │
│ └─ No               │
└─────────────────────┘
```

#### Date Columns
```
┌─────────────────────┐
│ Created Date ▼      │
│ [Pick date...]      │
└─────────────────────┘
```

---

## 🎯 Smart Filters Count

The table info displays active smart filters:
```
245 total records • 2 smart filters active • 3 pending changes
                    ↑
                    This counts:
                    - Date Range filter (if set)
                    - All column filters (if set)
```

---

## 💡 Combining Filters

All three filter methods work together:

### Example Scenario
```
Goal: Find all active records for "John" created in January 2024

Steps:
1. Global Search: Type "john"
2. Date Range: Set From: 2024-01-01, To: 2024-01-31
3. Column Filter (Status): Select "Active"

Result: Records matching ALL three criteria
Smart Filters Count: 2 (Date Range + Status filter)
```

---

## 🔄 Filter Behavior

### Auto-Apply
- ✅ Global Search: Applies as you type
- ✅ Date Range: Applies when you select dates
- ✅ Column Filters: Apply instantly when changed

### Reset/Clear
```
Global Search:  Delete text or click X
Date Range:     Click "Clear" button
Column Filter:  Select "All" or clear text
All Filters:    Could add "Clear All" button if needed
```

### Pagination Reset
- When any filter changes, pagination resets to page 1
- Ensures you see filtered results from the beginning

---

## 🎨 Visual Indicators

### Active Filters
1. **Smart Filter Count**: Shows in table info
   ```
   245 total records • 2 smart filters active
   ```

2. **Date Range Badge**: Shows "Active" when dates are set
   ```
   [📅 Date Range | Active]
   ```

3. **Column Filter Indicators**: Filtered columns are highlighted
   ```
   Column Name ▼ [filter text]
   (highlighted border)
   ```

---

## ⌨️ Keyboard Shortcuts

### In Column Filters
- `Enter`: Apply filter (text inputs)
- `Escape`: Close dropdown/cancel
- `Tab`: Move to next filter

### In Date Range
- `Escape`: Close popover
- Use native date picker controls

---

## 📊 Performance Tips

### Best Practices
1. **Start Broad, Then Narrow**
   - Use Global Search first for general queries
   - Add Smart Filters to refine results

2. **Use Appropriate Filters**
   - Date Range for time-based queries
   - Column Filters for specific field values
   - Global Search for multi-column text searches

3. **Clear Unused Filters**
   - Remove filters when done
   - Keeps UI clean and query fast

---

## 🆘 Common Use Cases

### Case 1: Find Recent Records
```
1. Click Date Range
2. Set "From Date" to recent date
3. Leave "To Date" empty
Result: All records from that date forward
```

### Case 2: Find Specific Value in Column
```
1. Find column header
2. Type or select value
3. Results filter instantly
```

### Case 3: Complex Query
```
1. Set Date Range: Last month
2. Global Search: "transaction"
3. Column Filter (Type): "payment"
4. Column Filter (Status): "completed"
Result: All completed payment transactions from last month
```

---

## 📝 Notes

- **Filter Persistence**: Filters remain active until cleared
- **Backend Processing**: All filters are processed server-side for performance
- **Real-time Updates**: Filter counts update as you type/change filters
- **No Overflow Issues**: All filter UIs are properly contained and responsive

---

## 🔄 Compared to Old System

### What Changed
- ❌ **Removed**: Global Filter dropdown (was causing overflow)
- ✅ **Kept**: Date Range filter (now better positioned)
- ✅ **Enhanced**: Column filters (more visible, in table headers)
- ✅ **Added**: Smart filter count indicator

### Why It's Better
- No layout overflow issues
- Cleaner, more intuitive interface
- All filters easily accessible
- Better visual feedback
- Professional appearance

