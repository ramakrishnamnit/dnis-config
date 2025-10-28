# Quick Start Guide - Metadata Table Manager

## 🚀 Get Started in 3 Steps

### Step 1: Install & Run
```bash
npm install
npm run dev
```

### Step 2: Navigate
Open browser: `http://localhost:5173/metadata-table-manager`

Or click **"Table Manager"** in the header navigation.

### Step 3: Use It!
1. Select **Country**: UK
2. Select **Business Unit**: CC
3. Select **Table**: UKCC_SERVICEPROFILE
4. Start editing! 🎉

---

## 📖 Feature Overview

### ✏️ Edit Cells
- **Double-click** any editable cell
- Edit the value
- Click **✓** to save or **✗** to cancel

### 💾 Save Changes
- **Single Row**: Click "Update" button on the row
- **Multiple Rows**: Click "Save All" button at top
- Provide edit reason (min 10 characters)

### ➕ Add New Row
1. Click **"Add Row"** button
2. Fill in required fields (marked with *)
3. Provide edit reason
4. Click "Add Record"

### 📤 Bulk Upload
1. Click **"Bulk Upload"**
2. Download Excel template
3. Fill in data (follow instructions sheet)
4. Upload filled file
5. Review validation results
6. Click "Upload Valid Rows"

### 🔍 Search & Filter
- **Global Search**: Use search bar at top
- **Column Filters**: Type in filter inputs under column headers
- Results update automatically

### 📄 Pagination
- Change rows per page (25, 50, 100, 200)
- Navigate with First/Previous/Next/Last buttons
- Current page shown at bottom

### 📥 Download Data
1. Click **"Download"** button
2. Choose format (CSV/Excel/JSON)
3. Choose scope (current results/region/region+BU)
4. File downloads with timestamp

---

## 🎨 Visual Indicators

| Indicator | Meaning |
|-----------|---------|
| 🟠 Orange dot on row | Row has unsaved changes |
| 🔵 Blue text in cell | Cell value has been edited |
| ✓ Green checkmark | Save successful |
| 🔴 Red border | Validation error |
| ⏳ Spinner | Saving in progress |
| * Red asterisk | Required field |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Double-click cell | Start editing |
| `Enter` | Save cell edit |
| `Escape` | Cancel cell edit |
| `Ctrl + Enter` | Submit edit reason |

---

## 🎯 Quick Tips

1. **Changes aren't saved until you click Update or Save All**
   - Look for orange dots to see which rows have changes

2. **Required fields must be filled**
   - Marked with red asterisk (*)
   - Form won't submit without them

3. **Edit reasons are mandatory**
   - Minimum 10 characters
   - Used for audit trail

4. **Validation happens in real-time**
   - Red border = validation error
   - Error message shows below field

5. **Use filters to find specific records**
   - Column filters are AND condition
   - Global search is OR condition

6. **Bulk upload validation is strict**
   - Follow template format exactly
   - Check data types in row 2
   - Review validation rules in row 3
   - Download error report if issues

---

## 🔧 Configuration

### Mock API (Development)
Default setting - uses mock data for testing.

**File**: `.env.local`
```env
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### Real API (Production)
Connect to actual backend.

**File**: `.env.local`
```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://your-backend-url.com/api/v1
```

---

## 🐛 Troubleshooting

### Changes not saving?
- ✅ Check validation errors (red borders)
- ✅ Ensure edit reason is at least 10 characters
- ✅ Look for network errors in browser console

### Can't find a table?
- ✅ Make sure Country and Business Unit are selected
- ✅ Check if table exists for that region

### Upload failed?
- ✅ Verify Excel template format matches
- ✅ Check column headers are exact match
- ✅ Review data types and validation rules
- ✅ Download error report for details

### Version conflict error?
- ✅ Someone else edited the same row
- ✅ Click "Refresh Data" to get latest version
- ✅ Apply your changes again

---

## 📚 More Documentation

- **METADATA_TABLE_MANAGER.md** - Complete feature guide
- **BACKEND_INTEGRATION.md** - API integration guide
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details

---

## 🎉 You're Ready!

Start by selecting a region and table, then explore all the features!

**Need help?** Check the documentation or browser console for errors.

---

**Built with ❤️ using React + TypeScript + Tailwind + Shadcn UI**

