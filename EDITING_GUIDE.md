# Editing Guide - How to Edit Records with 100 Rows & 20 Columns

## Problem Solved

**Challenge:** How do you efficiently edit a table with:
- ✅ 100+ rows (too many to display at once)
- ✅ 20+ columns (too wide to see all at once)
- ✅ Some fields editable, others read-only
- ✅ Need good UX and performance

**Solution:** Pagination + Modal-based editing with dynamic forms

---

## User Workflow

### Step 1: Browse Paginated Data
```
┌─────────────────────────────────────────────────────────────┐
│ UKCC_CONFIG_MAIN                          [+] [↑] [History]  │
├─────────────────────────────────────────────────────────────┤
│ Showing 1-10 of 156 records                                  │
├─────────────────────────────────────────────────────────────┤
│ Filter Records                                               │
│ ┌──────────────┬──────────────┬──────────────┐             │
│ │ Key: [____]  │ Value: [___] │ Updated: [__]│             │
│ └──────────────┴──────────────┴──────────────┘             │
├─────────────────────────────────────────────────────────────┤
│ ID │ Key              │ Value │ Version │ ...  │ Actions    │
├────┼──────────────────┼───────┼─────────┼──────┼────────────┤
│ 1  │ MAX_QUEUE_TIME   │ 300   │ v2.1    │ ...  │ [⋮] Menu   │
│ 2  │ RETRY_ATTEMPTS   │ 3     │ v1.5    │ ...  │ [⋮] Menu   │
│ 3  │ CALLBACK_ENABLED │ true  │ v3.0    │ ...  │ [⋮] Menu   │
└────┴──────────────────┴───────┴─────────┴──────┴────────────┘
│ Rows per page: [10▾]          Page 1 of 16  [⏮][◀][1][▶][⏭] │
└─────────────────────────────────────────────────────────────┘
```

**User can:**
- Filter by any column (debounced 500ms)
- Change page size (10, 25, 50, 100, 200)
- Navigate pages
- Click [⋮] on any row for actions

---

### Step 2: Click Actions Menu (⋮)

```
┌────────────────────────┐
│ [👁] View Details      │  ← See ALL 20 columns
│ [✏] Edit               │  ← Edit form
│ [📜] View History      │
│ [🗑] Delete            │
└────────────────────────┘
```

---

### Step 3A: View Details Modal (All Columns Visible)

```
╔═══════════════════════════════════════════════════════════╗
║ 👁 View Record - UKCC_CONFIG_MAIN                   [X]   ║
╠═══════════════════════════════════════════════════════════╣
║ Complete details of the selected record                   ║
║                                                            ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ ID                        [number] [Read-only]      │  ║
║ │ 1                                           [📋]    │  ║
║ ├─────────────────────────────────────────────────────┤  ║
║ │ Configuration Key         [string] [Read-only]      │  ║
║ │ MAX_QUEUE_TIME                              [📋]    │  ║
║ ├─────────────────────────────────────────────────────┤  ║
║ │ Value                     [string]                  │  ║
║ │ 300                                         [📋]    │  ║
║ ├─────────────────────────────────────────────────────┤  ║
║ │ Version                   [string] [Read-only]      │  ║
║ │ v2.1                                        [📋]    │  ║
║ ├─────────────────────────────────────────────────────┤  ║
║ │ Last Updated              [date] [Read-only]        │  ║
║ │ 2025-01-15 14:30:00                         [📋]    │  ║
║ ├─────────────────────────────────────────────────────┤  ║
║ │ Updated By                [string] [Read-only]      │  ║
║ │ john.doe@hsbc.com                           [📋]    │  ║
║ ├─────────────────────────────────────────────────────┤  ║
║ │ ... (15 more columns scroll here) ...              │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                            ║
║                                    [Close]  [✏ Edit Record] ║
╚═══════════════════════════════════════════════════════════╝
```

**Features:**
- ✅ See ALL 20+ columns at once
- ✅ Scrollable if too many fields
- ✅ Copy any field value (📋 button)
- ✅ Clear indication of read-only vs editable
- ✅ Click "Edit Record" to switch to edit mode

---

### Step 3B: Edit Modal (Only Editable Fields)

```
╔═══════════════════════════════════════════════════════════╗
║ ✏ Edit Record - UKCC_CONFIG_MAIN                    [X]   ║
╠═══════════════════════════════════════════════════════════╣
║ Modify the editable fields below. Fields marked as        ║
║ read-only cannot be changed.                               ║
║                                                            ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ RECORD INFORMATION                                  │  ║
║ │ ┌─────────────────┬─────────────────┐              │  ║
║ │ │ ID [Read-only]  │ Version [RO]    │              │  ║
║ │ │ 1               │ v2.1            │              │  ║
║ │ ├─────────────────┼─────────────────┤              │  ║
║ │ │ Key [Read-only] │ Last Updated    │              │  ║
║ │ │ MAX_QUEUE_TIME  │ 2025-01-15      │              │  ║
║ │ └─────────────────┴─────────────────┘              │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                            ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ EDITABLE FIELDS                                     │  ║
║ │                                                     │  ║
║ │ Value *                                            │  ║
║ │ ┌─────────────────────────────────────────────┐   │  ║
║ │ │ 300                                          │   │  ║
║ │ └─────────────────────────────────────────────┘   │  ║
║ │                                                     │  ║
║ │ Description *                                      │  ║
║ │ ┌─────────────────────────────────────────────┐   │  ║
║ │ │ Maximum time a call can wait in queue       │   │  ║
║ │ │ before being abandoned. Value in seconds.   │   │  ║
║ │ │                                              │   │  ║
║ │ └─────────────────────────────────────────────┘   │  ║
║ │                                                     │  ║
║ │ Is Active                                          │  ║
║ │ [●────] ON                                         │  ║
║ │                                                     │  ║
║ │ Priority (number) *                                │  ║
║ │ ┌─────────────────────────────────────────────┐   │  ║
║ │ │ 1                                            │   │  ║
║ │ └─────────────────────────────────────────────┘   │  ║
║ │                                                     │  ║
║ │ ... (more editable fields) ...                    │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                            ║
║                                      [✕ Cancel] [💾 Save]  ║
╚═══════════════════════════════════════════════════════════╝
```

**Features:**
- ✅ Two sections: Read-only info + Editable fields
- ✅ Different input types:
  - **Text:** Single-line input
  - **Long Text:** Textarea (multi-line)
  - **Number:** Number input with validation
  - **Boolean:** Toggle switch
  - **Date:** Date-time picker
- ✅ Required field indicators (*)
- ✅ Real-time validation
- ✅ Error messages appear below fields
- ✅ Scrollable for 20+ fields
- ✅ Loading state while saving

---

## Field Type Rendering

### String Fields
```typescript
// Short strings (key, name, etc.)
<Input 
  value="MAX_QUEUE_TIME"
  placeholder="Enter configuration key..."
/>

// Long strings (value, description, comment)
<Textarea 
  value="Maximum time a call can wait..."
  placeholder="Enter description..."
  minHeight="100px"
/>
```

### Number Fields
```typescript
<Input 
  type="number"
  value={300}
  min={0}
  max={999999}
/>
// Shows error if non-numeric value entered
```

### Boolean Fields
```typescript
<Switch 
  checked={true}
  label="Is Active"
/>
// Clean toggle UI instead of checkbox
```

### Date Fields
```typescript
<Input 
  type="datetime-local"
  value="2025-01-15T14:30"
/>
```

---

## Validation Example

**User tries to save with invalid data:**

```
╔═══════════════════════════════════════════════════════════╗
║ ⚠ Error saving changes                                    ║
║ Failed to save record. Please check your input.           ║
╠═══════════════════════════════════════════════════════════╣
║ Value *                                                    ║
║ ┌─────────────────────────────────────────────┐          ║
║ │                                              │ ← Empty!  ║
║ └─────────────────────────────────────────────┘          ║
║ ❌ Value is required                                      ║
║                                                            ║
║ Priority (number) *                                        ║
║ ┌─────────────────────────────────────────────┐          ║
║ │ abc                                          │ ← Not #!  ║
║ └─────────────────────────────────────────────┘          ║
║ ❌ Priority must be a number                              ║
╚═══════════════════════════════════════════════════════════╝
```

---

## Backend Integration

### Edit Request
```javascript
// When user clicks "Save Changes"
PUT /api/tables/UKCC_CONFIG_MAIN/records/1

Headers:
  Authorization: Bearer <jwt-token>
  Content-Type: application/json

Body:
{
  "id": 1,
  "configValue": "600",        // Changed from 300
  "description": "Updated...",  // Changed
  "isActive": true,
  "priority": 2
  // Only editable fields are sent
  // Read-only fields (version, lastUpdated) are ignored
}

Response (Success):
{
  "success": true,
  "message": "Record updated successfully",
  "data": {
    // Updated record with new version, timestamp
    "id": 1,
    "configKey": "MAX_QUEUE_TIME",
    "configValue": "600",
    "version": "2.2",  // Auto-incremented
    "lastUpdated": "2025-10-28 16:45:00",
    "updatedBy": "current.user@hsbc.com"
  }
}

Response (Error):
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "configValue": "Value must be between 0 and 3600"
  }
}
```

---

## Performance Characteristics

### For 100 Rows, 20 Columns

| Operation | Time | Notes |
|-----------|------|-------|
| Initial Load | 200ms | Loads page 1 (10 rows) |
| Filter Change | 800ms | 500ms debounce + 300ms API |
| Page Change | 200ms | Fast - only 10 rows |
| Open View Modal | Instant | Already has data |
| Open Edit Modal | Instant | Already has data |
| Save Changes | 1000ms | Backend validation + save |

### Network Requests

```
Initial load:    1 request  (get page 1)
Filter change:   1 request  (get filtered data)
Page change:     1 request  (get new page)
Edit & save:     1 request  (PUT update)
```

**Total for one edit:** 2-3 requests (page load + save)

---

## Advantages of This Approach

### ✅ Performance
- Only loads 10-25 rows at a time (not all 100)
- Filters/sorts on backend (not frontend)
- No lag with large datasets

### ✅ Usability
- View all 20 columns without horizontal scrolling hell
- Edit form shows only what you can actually edit
- Clear visual distinction: editable vs read-only
- Copy functionality for reference values

### ✅ Maintainability
- Backend controls field permissions (isEditable flag)
- Add new columns without frontend changes
- Type-safe with TypeScript
- Reusable modal components

### ✅ Accessibility
- Keyboard navigation works
- Screen readers can navigate form
- Clear labels and error messages
- Focus management in modals

---

## Alternative: Inline Editing (Not Recommended)

**Why NOT inline editing for 20 columns?**

❌ **Too wide:** 20 columns = horizontal scrolling nightmare  
❌ **Context switching:** Can't see related fields  
❌ **Validation:** Hard to show errors inline  
❌ **UX:** Accidental edits, no confirmation  
❌ **Mobile:** Impossible to use on small screens  

**Inline editing works for:** 3-5 columns, simple data

---

## Code Example: Using the Edit Modal

```typescript
// In your component
import { RecordEditModal } from '@/components/RecordEditModal';

const MyTable = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  const handleEdit = (record) => {
    setSelectedRecord(record);
    setEditModalOpen(true);
  };
  
  const handleSave = async (updatedRecord) => {
    // Call your API
    await fetch(`/api/tables/UKCC_CONFIG_MAIN/records/${updatedRecord.id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedRecord),
    });
    
    // Refresh table data
    refetchData();
  };
  
  return (
    <>
      {/* Your table */}
      <RecordEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        record={selectedRecord}
        columns={columns}
        tableName="UKCC_CONFIG_MAIN"
        onSave={handleSave}
      />
    </>
  );
};
```

---

## Summary

**Problem:** Edit tables with 100+ rows and 20+ columns efficiently

**Solution:**
1. **Pagination** - Show 10-25 rows at a time
2. **Modal Editing** - Open full form for selected row
3. **Dynamic Forms** - Backend controls what's editable
4. **Type-safe** - Different inputs for different field types
5. **Validated** - Real-time error checking

**Result:** Fast, user-friendly, maintainable editing system! ✨

