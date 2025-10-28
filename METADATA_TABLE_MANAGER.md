# Metadata Table Manager - Implementation Guide

## Overview

The Metadata Table Manager is a dynamic, metadata-driven configuration table interface that allows users to view, edit, add, and manage configuration data with full CRUD operations, inline editing, bulk upload, and audit trail capabilities.

## Features Implemented

### 🎯 Core Features

1. **Dynamic Table Rendering**
   - Tables are dynamically generated based on metadata fetched from backend
   - Columns, data types, validation rules, and editability are all driven by metadata
   - Supports STRING, NUMBER, BOOLEAN, DATE, and ENUM data types

2. **Inline Cell Editing**
   - Double-click or click edit icon to edit cells
   - AG-Grid-like editing experience
   - Real-time validation based on metadata constraints
   - Save/cancel buttons for each edit

3. **Row-Level Updates**
   - Each row has an "Update" button when changes are pending
   - Visual indicators (orange dot) show rows with pending changes
   - Edited cells highlighted with primary color
   - Individual row updates with version control

4. **Batch Update (Save All)**
   - "Save All" button appears when multiple rows have changes
   - Updates all pending changes in a single batch request
   - Shows count of pending changes
   - Progress indicator during batch save

5. **Add New Row**
   - Dynamic form generated from metadata
   - Validates required fields, max length, enum values
   - Edit reason required for audit compliance
   - Success/error handling with toasts

6. **Bulk Upload via Excel**
   - Download Excel template based on table metadata
   - Template includes:
     - Column headers (with * for required fields)
     - Data type hints (row 2)
     - Validation rules (row 3)
     - Instructions sheet
   - Upload filled template
   - Client-side validation before upload
   - Shows validation results with row-by-row errors
   - Download error report for failed rows
   - Progress indicator during upload

7. **Search & Filtering**
   - Global search across all columns
   - Per-column filter inputs in table headers
   - Debounced search (500ms) to reduce API calls
   - Clear search button
   - Auto-reset to page 1 when filters change

8. **Pagination**
   - Configurable page size (25, 50, 100, 200)
   - First/Previous/Next/Last page controls
   - Shows current page and total pages
   - Shows record range (e.g., "Showing 1-50 of 156 records")
   - Sticky pagination controls

9. **Optimistic Concurrency Control (OCC)**
   - Version-based conflict detection
   - Modal shows conflicting fields and version mismatch
   - Options to retry, refresh, or cancel
   - Prevents data loss from concurrent edits

10. **Audit Trail**
    - Edit reason required for all changes
    - Minimum 10 characters validation
    - Stored with each update for compliance
    - View audit history (modal available)

11. **Download Configuration**
    - Export table data in CSV/Excel/JSON formats
    - Filter by current search results, region, or region+BU
    - Downloads with timestamp in filename

## File Structure

```
src/
├── types/
│   ├── api.ts                  # API request/response types
│   ├── editState.ts            # Edit state tracking types
│   ├── metadata.ts             # Metadata types (existing)
│   └── table.ts                # Table types (existing)
│
├── services/
│   ├── apiService.ts           # Real API service
│   ├── apiToggle.ts            # Toggle between mock and real APIs
│   └── mockMetadataApi.ts      # Mock API (existing)
│
├── utils/
│   ├── excelGenerator.ts       # Excel template generation
│   └── excelParser.ts          # Excel parsing and validation
│
├── hooks/
│   ├── useRowUpdates.ts        # Manage pending row edits
│   └── useTablePagination.ts   # Pagination state management
│
├── components/
│   ├── GlobalSearch.tsx        # Global search component
│   ├── EditReasonModal.tsx     # Edit reason prompt
│   ├── AddRowModal.tsx         # Add new row form
│   ├── BulkUploadModal.tsx     # Bulk upload interface
│   ├── DynamicEditableTable.tsx # Main table component
│   ├── OCCConflictModal.tsx    # Conflict resolution (enhanced)
│   └── ... (existing components)
│
└── pages/
    └── MetadataTableManager.tsx # Main page
```

## API Endpoints

### 1. Get Table Metadata
```
GET /api/v1/metadata/entity/{id}?country=<c>&bu=<b>
```

Response:
```json
{
  "entityId": "UKCC_SERVICEPROFILE",
  "entityName": "Service Profile",
  "columns": [
    {
      "name": "DialledService",
      "label": "Dialled Service",
      "dataType": "STRING",
      "editable": false,
      "required": true,
      "maxLength": 50
    }
  ],
  "permissions": {
    "canView": true,
    "canEdit": true,
    "canDownload": true,
    "canAdd": true,
    "canDelete": true
  }
}
```

### 2. Get Table Data (Paginated)
```
GET /api/v1/entity/{id}/data?country=<c>&bu=<b>&page=1&pageSize=50&globalSearch=<query>&filter[column]=<value>
```

Response:
```json
{
  "page": 1,
  "pageSize": 50,
  "totalCount": 245,
  "rows": [
    {
      "id": "1234",
      "DialledService": "12345",
      "BypassAg": true,
      "version": 6,
      "lastUpdatedBy": "john.doe",
      "lastUpdatedOn": "2025-10-28T09:33:21Z"
    }
  ]
}
```

### 3. Update Single Row
```
PATCH /api/v1/entity/{id}/rows/{rowId}
```

Request:
```json
{
  "version": 6,
  "editReason": "Updating configuration per ticket #12345",
  "changes": {
    "BypassAg": false,
    "Priority": 5
  }
}
```

Response:
```json
{
  "success": true,
  "newVersion": 7
}
```

Or if conflict:
```json
{
  "success": false,
  "conflict": {
    "currentVersion": 7,
    "attemptedVersion": 6,
    "conflictingFields": ["BypassAg"],
    "message": "This record has been modified by another user."
  }
}
```

### 4. Batch Update Rows
```
PATCH /api/v1/entity/{id}/rows/batch
```

Request:
```json
{
  "updates": [
    {
      "id": "1234",
      "version": 6,
      "editReason": "Bulk update",
      "changes": { "Priority": 5 }
    }
  ],
  "editReason": "Bulk configuration update"
}
```

Response:
```json
{
  "successCount": 15,
  "failureCount": 2,
  "results": [
    {
      "id": "1234",
      "success": true
    },
    {
      "id": "5678",
      "success": false,
      "error": "Validation failed",
      "conflict": { ... }
    }
  ]
}
```

### 5. Add New Row
```
POST /api/v1/entity/{id}/rows?country=<c>&bu=<b>
```

Request:
```json
{
  "data": {
    "DialledService": "98765",
    "BypassAg": true,
    "InterceptTreatmentType": "BLOCK",
    "MaxQueueTime": 30,
    "Priority": 3,
    "IsActive": true
  },
  "editReason": "Adding new service profile"
}
```

Response:
```json
{
  "success": true,
  "id": "9999",
  "message": "Row added successfully"
}
```

### 6. Bulk Upload Rows
```
POST /api/v1/entity/{id}/rows/bulk?country=<c>&bu=<b>
```

Request:
```json
{
  "rows": [
    { "DialledService": "11111", "BypassAg": true, ... },
    { "DialledService": "22222", "BypassAg": false, ... }
  ],
  "editReason": "Bulk import from Excel"
}
```

Response:
```json
{
  "successCount": 18,
  "failureCount": 2,
  "results": [
    { "rowIndex": 0, "success": true, "id": "1001" },
    { "rowIndex": 1, "success": false, "errors": { "DialledService": "Required" } }
  ]
}
```

### 7. Download Configuration
```
GET /api/v1/export/entity/{id}/rows?country=<c>&bu=<b>&format=excel&scope=current
```

Returns: Binary file (Excel/CSV/JSON)

## Configuration

### Environment Variables (.env.local)

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_USE_MOCK_API=true

# Application Configuration
VITE_APP_NAME=HSBC Configuration Manager
VITE_APP_VERSION=1.0.0
```

### Toggle Between Mock and Real API

In `.env.local`:
- `VITE_USE_MOCK_API=true` - Uses mock API (for development)
- `VITE_USE_MOCK_API=false` - Uses real backend API (for production)

## Usage

### Access the Page

Navigate to: `http://localhost:5173/metadata-table-manager`

Or click "Table Manager" in the header navigation.

### Workflow

1. **Select Region**
   - Choose Country (UK, US, HK, SG, CN)
   - Choose Business Unit (CC, WPB, CMB, GBM)

2. **Select Table**
   - Choose from dropdown of available tables
   - Metadata and data load automatically

3. **View/Edit Data**
   - Double-click cells to edit (for editable columns)
   - Use per-column filters or global search
   - Edit multiple cells across multiple rows
   - Orange dot indicates rows with pending changes

4. **Save Changes**
   - Click "Update" on individual rows, OR
   - Click "Save All" to batch update all pending changes
   - Provide edit reason (required, min 10 chars)

5. **Add New Row**
   - Click "Add Row" button
   - Fill in required fields
   - Provide edit reason
   - Submit

6. **Bulk Upload**
   - Click "Bulk Upload"
   - Download Excel template
   - Fill in data following instructions
   - Upload file
   - Review validation results
   - Upload valid rows
   - Download error report if needed

## Validation

### Client-Side Validation

- **Required Fields**: Cannot be empty
- **Max Length**: STRING fields enforce maxLength
- **Data Types**: 
  - NUMBER: Must be valid number
  - BOOLEAN: true/false, yes/no, 1/0
  - ENUM: Must match one of enumValues
  - DATE: Must be valid date format (YYYY-MM-DD)
- **Edit Reason**: Minimum 10 characters, maximum 500

### Server-Side Validation

Backend should validate:
- Business logic rules
- Foreign key constraints
- Unique constraints
- Additional custom validation

## Visual Indicators

- 🟠 **Orange Dot**: Row has pending changes
- 🟢 **Green Checkmark**: Save successful
- 🔴 **Red Border**: Validation error
- 🟡 **Yellow Banner**: OCC conflict
- ⏳ **Spinner**: Saving in progress
- 🔵 **Blue Text**: Edited cell value

## Keyboard Shortcuts

- `Enter` - Save cell edit
- `Escape` - Cancel cell edit
- `Ctrl + Enter` (in edit reason modal) - Submit
- Double-click cell - Start editing

## Design System

- **Colors**:
  - Primary: HSBC Red (#DB0011)
  - Success: Green
  - Destructive: Red
  - Muted: Gray
  
- **Effects**:
  - Glassmorphism on cards and modals
  - Red glow on focused elements
  - Smooth transitions
  - Skeleton loaders

- **Fonts**:
  - IBM Plex Sans / Open Sans

## Dependencies Added

```json
{
  "dependencies": {
    "xlsx": "^latest",
    "file-saver": "^latest"
  },
  "devDependencies": {
    "@types/file-saver": "^latest"
  }
}
```

## Testing

### With Mock API (Development)

1. Set `VITE_USE_MOCK_API=true` in `.env.local`
2. Mock data available for:
   - `UKCC_SERVICEPROFILE`
   - `UKCC_CONFIG_MAIN`
3. Mock API simulates:
   - 300-500ms delay
   - 20% chance of OCC conflict
   - 90% success rate for bulk uploads

### With Real API (Production)

1. Set `VITE_USE_MOCK_API=false` in `.env.local`
2. Set `VITE_API_BASE_URL` to your backend URL
3. Ensure backend implements all endpoints
4. Ensure CORS is configured properly

## Error Handling

- Network errors: Toast notification
- Validation errors: Inline error messages
- OCC conflicts: Modal with resolution options
- Bulk upload errors: Downloadable error report
- 404/500 errors: Toast with error details

## Performance Optimizations

- Debounced search (500ms)
- Pagination (default 50 rows)
- Lazy loading of data
- Optimistic updates
- Request caching (via React Query)

## Security Considerations

- JWT authentication (to be implemented)
- Role-based access control via permissions
- Edit reasons for audit trail
- Version control prevents lost updates
- HTTPS in production

## Future Enhancements

- [ ] Row deletion with confirmation
- [ ] Advanced filtering (date ranges, multi-select)
- [ ] Column sorting (click header to sort)
- [ ] Column reordering (drag & drop)
- [ ] Export filtered/searched results
- [ ] Undo/redo functionality
- [ ] Real-time collaboration indicators
- [ ] Cell history (view previous values)
- [ ] Keyboard navigation (Tab through cells)
- [ ] Copy/paste support
- [ ] Row selection (checkboxes)
- [ ] Bulk delete

## Troubleshooting

### Changes not saving
- Check network tab for API errors
- Verify edit reason is at least 10 characters
- Check for validation errors (red borders)
- Ensure row has version number

### OCC conflicts
- Click "Refresh Data" to get latest version
- Review conflicting fields
- Apply changes again if needed

### Bulk upload fails
- Check Excel template format
- Ensure column headers match exactly
- Verify data types (STRING, NUMBER, etc.)
- Check validation rules in row 3
- Download error report for details

### Search not working
- Check global search vs column filters
- Wait for debounce (500ms)
- Verify backend supports search parameter

## Support

For issues or questions:
- Check browser console for errors
- Review network tab for API responses
- Check `.env.local` configuration
- Verify backend is running and accessible

---

**Built with React + TypeScript + Tailwind CSS + Shadcn UI**

**HSBC Design System Compliant**

