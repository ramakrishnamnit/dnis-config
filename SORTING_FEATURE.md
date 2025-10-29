# Sorting Feature Documentation

## Overview
Sorting functionality has been added to all three main pages of the application, allowing users to sort data by various columns/fields.

---

## 1. Config Page (Main Table View)

### How to Sort:
- **Click on any column header** to sort by that column
- Click once for **ascending** order (↑)
- Click again for **descending** order (↓)
- Click a third time to **remove sorting** and return to default order

### Visual Indicators:
- **Arrow Up (↑)**: Column is sorted in ascending order (A-Z, 0-9, oldest-newest)
- **Arrow Down (↓)**: Column is sorted in descending order (Z-A, 9-0, newest-oldest)
- **Hover effect**: Column headers show a hover effect to indicate they are clickable
- **Active column**: The sorted column displays a colored arrow icon

### Sorting Behavior:
- Works with all data types: strings, numbers, dates, booleans
- Null/undefined values are always placed at the end
- String sorting is case-insensitive
- Number sorting handles numeric values correctly
- Date sorting uses actual date values (not string comparison)

### Location:
- Integrated directly into the table column headers
- Available on the main Config page at `/`

---

## 2. Audio Asset Manager (Audio Page)

### How to Sort:
1. Look for the **sort dropdown** in the filter bar (top right area)
2. Select a field to sort by:
   - **Name**: Sort by audio file name
   - **Upload Date**: Sort by when the file was uploaded (default)
   - **Uploader**: Sort by who uploaded the file
   - **File Size**: Sort by file size (KB/MB/GB)
3. Click the **up/down arrow button** next to the dropdown to toggle between:
   - **Ascending** (↑): A-Z, oldest-newest, smallest-largest
   - **Descending** (↓): Z-A, newest-oldest, largest-smallest

### Default Sorting:
- By default, audio files are sorted by **Upload Date** in **descending** order (newest first)

### Sorting Behavior:
- Sorting applies to **both tabs**: "My Uploads" and "All Uploads"
- File size sorting correctly handles KB, MB, and GB units
- Date sorting uses actual timestamps
- Sorting works in combination with filters

### Location:
- Audio page at `/audio`
- Sort controls are in the filter bar, next to the time range filter
- Visual indicator: ArrowUpDown icon (⇅) with dropdown and direction toggle button

---

## 3. Audit Trail Viewer (Audit Page)

### How to Sort:
1. Look for the **sort dropdown** in the filter bar (top right area)
2. Select a field to sort by:
   - **Timestamp**: Sort by when the event occurred (default)
   - **Action**: Sort by action type (UPDATE, INSERT, DELETE, DOWNLOAD)
   - **Table Name**: Sort by the affected table
   - **User ID**: Sort by who performed the action
3. Click the **up/down arrow button** next to the dropdown to toggle between:
   - **Ascending** (↑): Oldest-newest, A-Z
   - **Descending** (↓): Newest-oldest, Z-A

### Default Sorting:
- By default, audit events are sorted by **Timestamp** in **descending** order (newest first)

### Sorting Behavior:
- Sorting applies to **both views**: "All Audit" and "My Audit"
- Timestamp sorting uses actual date/time values
- Action sorting groups similar actions together
- Sorting works in combination with all filters

### Location:
- Audit page at `/audit`
- Sort controls are in the filter bar, next to the time range filter
- Visual indicator: ArrowUpDown icon (⇅) with dropdown and direction toggle button

---

## Common Features Across All Pages

### Persistence:
- Sort settings are maintained while:
  - Applying filters
  - Navigating between tabs (Audio and Audit pages)
  - Paginating through results
- Sort settings reset when:
  - Refreshing the page
  - Navigating to a different page

### Performance:
- Sorting is performed client-side for fast response
- Works efficiently with filtered data
- No additional API calls required

### Accessibility:
- All sort controls are keyboard accessible
- Visual indicators clearly show current sort state
- Hover tooltips provide additional context

---

## Tips for Users

1. **Config Page**: Simply click column headers to sort - it's the fastest way!

2. **Audio & Audit Pages**: Use the sort dropdown for more control over what field to sort by

3. **Combine with Filters**: Sorting works seamlessly with all filtering options

4. **Multi-level Sorting**: Currently, only single-column sorting is supported. For complex sorting needs, apply filters first to narrow down results.

5. **Default Behavior**: If you don't select any sorting, data will display in its default order (usually by ID or timestamp)

---

## Visual Guide

### Config Page - Column Header Sorting
```
┌─────────────────────────────────────┐
│ Column Name ↑  │ Another Column  │  │  ← Click header to sort
└─────────────────────────────────────┘
```

### Audio & Audit Pages - Dropdown Sorting
```
┌──────────────────────────────────────────┐
│ Filters                    ⇅ [Dropdown] ↓ │  ← Sort controls
└──────────────────────────────────────────┘
```

---

## Future Enhancements (Potential)

- Multi-column sorting (sort by primary column, then secondary)
- Save sort preferences per user
- Server-side sorting for very large datasets
- Custom sort orders for specific fields

---

## Questions or Issues?

If you encounter any issues with sorting or have suggestions for improvements, please contact the development team.

