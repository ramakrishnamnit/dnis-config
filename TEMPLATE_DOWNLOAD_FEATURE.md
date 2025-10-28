# Template Download Feature

## Overview
Added a "Download Template" button beside the Bulk Upload functionality that allows users to download an Excel template with all table columns.

## Implementation Details

### 1. New Function: `generateSimpleTemplate()`
**Location:** `src/utils/excelGenerator.ts`

This function generates a simple Excel template with:
- **Sheet Name:** The table name (sanitized to be Excel-compatible)
- **Column Headers:** All columns from the table metadata as the first row
- **Styling:** Blue header row with white bold text, centered alignment
- **Empty Rows:** 50 empty rows for users to fill in data
- **Auto-sized Columns:** Column widths based on header length

**Key Features:**
- Includes ALL columns (not just editable ones like bulk upload template)
- Clean, simple layout - just headers and empty rows
- Professional blue header styling
- Downloads with timestamp in filename: `{TableName}_Template_{Date}.xlsx`

### 2. Updated Components

#### `RecordManagement.tsx`
- Added new optional prop: `onDownloadTemplate?: () => void`
- Added "Download Template" button with download icon
- Positioned between "Bulk Upload" and "Audit Trail" buttons
- Button only appears when `onDownloadTemplate` handler is provided

#### `MetadataDrivenTable.tsx`
- Added import for `generateSimpleTemplate`
- Created `handleDownloadTemplate()` function
- Added "Download Template" button with FileSpreadsheet icon
- Positioned between "Bulk Upload" and "Download" buttons

#### `Index.tsx` (Main Page)
- Added import for `generateSimpleTemplate` and `EntityMetadata` type
- Created `handleDownloadTemplate()` callback that:
  - Converts `mockColumns` to `EntityMetadata` format
  - Calls `generateSimpleTemplate()` with table metadata
- Passed `handleDownloadTemplate` to `RecordManagement` component

### 3. Template vs Bulk Upload Template

**Simple Template (New Feature):**
- Just column headers + empty rows
- All columns included
- Simple blue header styling
- For general data entry

**Bulk Upload Template (Existing):**
- Headers + data type hints + validation rules
- Only editable/required columns
- Multiple styled rows with instructions
- Includes separate instructions sheet
- For bulk upload operations

## Usage

1. Select a table from the region selector
2. Click "Download Template" button (beside Bulk Upload)
3. Excel file downloads with format: `{TableName}_Template_{Date}.xlsx`
4. Open the file to see all column headers with empty rows ready to fill

## Benefits

- Quick way to see all table columns
- Easy data preparation for imports
- Consistent with table structure
- Professional appearance
- Works with any table that has metadata

## Files Modified

1. `src/utils/excelGenerator.ts` - Added `generateSimpleTemplate()` function
2. `src/components/RecordManagement.tsx` - Added Download Template button
3. `src/components/MetadataDrivenTable.tsx` - Added Download Template button
4. `src/pages/Index.tsx` - Wired up the download handler

## Testing

Build successful with no linter errors. All functionality integrated seamlessly with existing code structure.

