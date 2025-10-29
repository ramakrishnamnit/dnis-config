# Smart Filters - User Guide

## 🎯 Quick Start

The **Smart Filters** button gives you access to all filtering options in one convenient location!

### Opening Smart Filters
1. Look for the **"Smart Filters"** button in the top action bar
2. It's located next to the search box
3. Click it to open the filter modal

```
┌────────────────────────────────────────────┐
│  [🔍 Search...]  [🎚️ Smart Filters]       │
│                       ↑ Click here!        │
└────────────────────────────────────────────┘
```

## 📅 Using Date Range Filter

### Setting a Date Range
1. Open Smart Filters
2. Look at the **Date Range Filter** section at the top
3. Choose your dates:

#### Option 1: Filter by Range
- Set **From Date**: `2024-01-01`
- Set **To Date**: `2024-12-31`
- Shows all records within this date range

#### Option 2: Filter from a Starting Date
- Set **From Date**: `2024-06-01`
- Leave **To Date** empty
- Shows all records from June 1st onwards

#### Option 3: Filter up to an Ending Date
- Leave **From Date** empty
- Set **To Date**: `2024-06-30`
- Shows all records up to June 30th

### Date Range Tips
- 💡 The "From Date" cannot be later than "To Date"
- 💡 The "To Date" cannot be earlier than "From Date"
- 💡 You'll see a preview of your selected range
- 💡 Click the "Clear" button to remove the date filter

## 🔍 Using Column Filters

The Smart Filters modal shows all filterable columns in an organized grid.

### Text Columns
**Example**: Name, Email, Description

```
┌─────────────────┐
│ Name            │
│ 🔍 john        │ ← Type search text
└─────────────────┘
```

**How to use:**
1. Click in the text box
2. Type your search term
3. Finds records containing that text

### Number Columns  
**Example**: Amount, Count, ID

```
┌─────────────────┐
│ Amount          │
│    1000        │ ← Type number
└─────────────────┘
```

**How to use:**
1. Click in the number field
2. Type a number
3. Finds exact matches

### Dropdown Columns
**Example**: Status, Priority, Category

```
┌─────────────────┐
│ Status       ▼  │
│  All           │
│  Active        │ ← Select option
│  Inactive      │
└─────────────────┘
```

**How to use:**
1. Click the dropdown
2. Select an option
3. Select "All" to remove filter

### Yes/No Columns
**Example**: Enabled, Active, Published

```
┌─────────────────┐
│ Enabled      ▼  │
│  All           │
│  Yes           │ ← Select option
│  No            │
└─────────────────┘
```

**How to use:**
1. Click the dropdown
2. Choose Yes, No, or All
3. "All" shows both Yes and No records

### Date Columns
**Example**: Created Date, Modified Date

```
┌─────────────────┐
│ Created Date    │
│ 01/15/2024     │ ← Pick date
└─────────────────┘
```

**How to use:**
1. Click the date field
2. Select a date from calendar
3. Finds records with that exact date

## 🎯 Applying Filters

### Method 1: Apply Button
1. Set your desired filters
2. Click the **"Apply Filters"** button at the bottom
3. Modal closes and filters are applied

### Method 2: Click Outside
1. Set your desired filters
2. Click anywhere outside the modal
3. Filters are automatically applied

### Method 3: Press ESC
1. Set your desired filters
2. Press the ESC key
3. Modal closes and filters are applied

## 🧹 Clearing Filters

### Clear Individual Filter
Each filter has its own clear button (X icon):

```
┌─────────────────────┐
│ Name            [X] │ ← Click X to clear this filter
│ 🔍 john            │
└─────────────────────┘
```

**How to use:**
- Click the small **X** button next to any active filter
- Only that specific filter is removed
- Other filters remain active

### Clear Date Range
The date range section has its own clear button:

```
┌─────────────────────────────────────┐
│ Filtering from Jan 1 to Dec 31     │
│                        [Clear]      │ ← Click to clear dates
└─────────────────────────────────────┘
```

**How to use:**
- Click the **"Clear"** button in the date range preview
- Both From and To dates are removed
- Column filters remain active

### Clear All Filters
Remove all filters at once:

```
┌─────────────────────────────────────┐
│ Smart Filters        [Clear All]    │ ← Click here
└─────────────────────────────────────┘
```

**How to use:**
1. Click the **"Clear All"** button in the modal header
2. All date and column filters are removed
3. Table shows all records again

## 📊 Understanding Filter Status

### Active Filter Count
The Smart Filters button shows how many filters are active:

```
No Filters:
[🎚️ Smart Filters]

With Filters:
[🎚️ Smart Filters 5] ← 5 filters active
└─ Button turns blue!
```

### Filter Count Breakdown
The count includes:
- **Date Range**: Counts as 1 if either From or To date is set
- **Column Filters**: Each active column filter counts as 1

**Example:**
- From Date: Set = 1
- Name filter: "john" = 1  
- Status filter: "Active" = 1
- **Total: 3 filters active**

### Modal Header Status
The modal shows your filter status:

```
┌─────────────────────────────────────────┐
│ Smart Filters                           │
│ Apply filters • 3 filters active        │
│                  ↑ Filter count shown   │
└─────────────────────────────────────────┘
```

### Modal Footer Status
The bottom of the modal also shows filter count:

```
┌─────────────────────────────────────────┐
│ 3 filters applied    [Apply Filters]   │
│ ↑ Count shown here                      │
└─────────────────────────────────────────┘
```

## 💡 Pro Tips

### Tip 1: Combine Multiple Filters
You can use multiple filters together for precise results:
- ✅ Date Range: January 2024
- ✅ Status: Active
- ✅ Name: Contains "john"
- **Result**: Active records named john from January 2024

### Tip 2: Use Date Range for Time-Based Analysis
- Last 30 days: From = 30 days ago, To = today
- This quarter: From = quarter start, To = quarter end
- Specific month: From = 1st of month, To = last of month

### Tip 3: Quick Filter Adjustments
- The modal remembers your filters when you reopen it
- Just adjust what you need and apply again
- No need to re-enter everything!

### Tip 4: Check Active Count
- Glance at the button badge to see filter count
- Blue button = filters are active
- Regular button = no filters

### Tip 5: Use Global Search with Filters
Combine Smart Filters with the search box:
1. Set Smart Filters for structured data (dates, status, etc.)
2. Use Search box for text across all columns
3. Both work together for powerful filtering!

## 📱 Mobile Usage

On mobile devices, the modal adapts:
- Full-screen layout for better visibility
- Stacked filter fields (one per row)
- Easy touch targets
- Swipe to scroll through filters

## ⌨️ Keyboard Shortcuts

- **TAB**: Navigate between filter fields
- **ENTER**: Apply filters and close modal
- **ESC**: Close modal (applies filters)
- **SPACE**: Open dropdowns when focused

## 🔍 Common Use Cases

### Use Case 1: Find Recent Records
```
Goal: See all records from the last week

Steps:
1. Open Smart Filters
2. Set From Date: [7 days ago]
3. Leave To Date empty
4. Click Apply
```

### Use Case 2: Filter by Status and Time
```
Goal: Find active records from Q1 2024

Steps:
1. Open Smart Filters
2. Set From Date: 2024-01-01
3. Set To Date: 2024-03-31
4. Set Status: Active
5. Click Apply
```

### Use Case 3: Search Specific Column
```
Goal: Find all records where name contains "smith"

Steps:
1. Open Smart Filters
2. Find the "Name" filter
3. Type: smith
4. Click Apply
```

### Use Case 4: Multiple Column Filters
```
Goal: Active UK records with priority "High"

Steps:
1. Open Smart Filters
2. Set Status: Active
3. Set Country: UK
4. Set Priority: High
5. Click Apply
```

## ❓ Troubleshooting

### "No results found"
- Check if your filters are too restrictive
- Try removing some filters to see more results
- Use "Clear All" to reset and start over

### "I can't see all filters"
- The modal is scrollable - scroll down to see more
- On mobile, swipe up to see additional filters

### "My filter isn't working"
- Make sure you clicked "Apply Filters"
- Check for typos in text filters
- Verify date formats are correct

### "Where did my filters go?"
- Filters are remembered when you reopen the modal
- If you refresh the page, filters are reset
- This is by design for a fresh start

## 🎓 Best Practices

1. **Start Broad, Then Narrow**
   - Begin with fewer filters
   - Add more filters to refine results
   - Easier than starting too specific

2. **Use Date Range First**
   - Time-based filtering is often most useful
   - Set your date range before column filters
   - Reduces dataset size for faster filtering

3. **Check Filter Count**
   - Keep an eye on the active filter count
   - Too many filters = too narrow results
   - Find the right balance

4. **Clear When Done**
   - Clear filters when finished with a task
   - Prevents confusion on next use
   - Fresh start for new analysis

5. **Combine with Search**
   - Use Smart Filters for structured data
   - Use Search for text across all columns
   - Best of both worlds!

## 🎉 Summary

The Smart Filters modal is your one-stop shop for all filtering needs:

- ✅ Date range filtering (with preview)
- ✅ All column filters in one place
- ✅ Active filter count tracking
- ✅ Easy clear options (individual or all)
- ✅ Scrollable for many filters
- ✅ Professional, organized interface

**Happy Filtering!** 🚀

