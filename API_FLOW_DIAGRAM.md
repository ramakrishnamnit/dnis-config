# User Name Search - API Flow Diagram

## Complete Request/Response Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                           │
└─────────────────────────────────────────────────────────────────────┘

    User types "john.doe" in search box
    │
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Search Input: placeholder="Search by user name..."                │
│  Value: "john.doe"                                                  │
└─────────────────────────────────────────────────────────────────────┘
    │
    │ After 500ms debounce
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  handleGlobalSearch("john.doe")                                     │
│  → setGlobalSearch("john.doe")                                      │
│  → resetToFirstPage()                                               │
└─────────────────────────────────────────────────────────────────────┘
    │
    │ useEffect triggers loadData()
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  API Request Builder (configApiService.getEntityData)               │
│                                                                     │
│  const request: DataRequest = {                                     │
│    entityId: "UKCC_SERVICEPROFILE",                                │
│    country: "UK",                                                   │
│    businessUnit: "CC",                                              │
│    page: 1,                                                         │
│    pageSize: 50,                                                    │
│    globalSearch: "john.doe"  ← KEY PARAMETER                       │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
    │
    │ HTTP GET
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      HTTP REQUEST                                   │
│                                                                     │
│  GET /api/v1/entity/UKCC_SERVICEPROFILE/data?                     │
│      country=UK&                                                    │
│      bu=CC&                                                         │
│      page=1&                                                        │
│      pageSize=50&                                                   │
│      globalSearch=john.doe  ← SENT TO BACKEND                      │
└─────────────────────────────────────────────────────────────────────┘
    │
    │ Network
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND (Spring Boot/Node/Python)               │
└─────────────────────────────────────────────────────────────────────┘

    Request arrives at controller
    │
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Controller: @GetMapping("/entity/{entityId}/data")                │
│                                                                     │
│  Extract parameters:                                                │
│    entityId = "UKCC_SERVICEPROFILE"                                │
│    country = "UK"                                                   │
│    bu = "CC"                                                        │
│    globalSearch = "john.doe"  ← EXTRACT THIS                       │
│    page = 1                                                         │
│    pageSize = 50                                                    │
└─────────────────────────────────────────────────────────────────────┘
    │
    │ Pass to service layer
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Service: getEntityData(request)                                    │
│                                                                     │
│  Build SQL Query:                                                   │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ SELECT * FROM UKCC_SERVICEPROFILE                             │ │
│  │ WHERE country = 'UK'                                          │ │
│  │   AND business_unit = 'CC'                                    │ │
│  │   AND LOWER(last_updated_by) LIKE LOWER('%john.doe%')        │ │
│  │       └─────────────┬─────────────┘                           │ │
│  │                     │                                          │ │
│  │                This is the key filter!                        │ │
│  │                Searches the user name column                  │ │
│  │                                                                │ │
│  │ ORDER BY last_updated_on DESC                                 │ │
│  │ LIMIT 50 OFFSET 0                                             │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
    │
    │ Execute query
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE                                    │
│                                                                     │
│  Table: UKCC_SERVICEPROFILE                                        │
│  ┌────────┬────────┬────────────────────┬─────────────────────┐   │
│  │   id   │version │  last_updated_by   │  DialledService  ...│   │
│  ├────────┼────────┼────────────────────┼─────────────────────┤   │
│  │ sp-1   │   3    │ john.doe@hsbc.com  │      12345          │ ✓ │
│  │ sp-2   │   2    │ jane.smith@hsbc    │      54321          │ ✗ │
│  │ sp-3   │   1    │ admin@hsbc.com     │      99999          │ ✗ │
│  │ sp-4   │   4    │ johnny.west@hsbc   │      11111          │ ✓ │
│  │ sp-5   │   2    │ alice.john@hsbc    │      22222          │ ✓ │
│  └────────┴────────┴────────────────────┴─────────────────────┘   │
│                                                                     │
│  Index used: idx_last_updated_by (for performance)                 │
└─────────────────────────────────────────────────────────────────────┘
    │
    │ Returns matching rows (3 records)
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Service: Build Response                                            │
│                                                                     │
│  1. Count total matching records: 3                                │
│  2. Map database rows to EntityRowResponse objects                 │
│  3. Calculate pagination info                                      │
└─────────────────────────────────────────────────────────────────────┘
    │
    │ Return to controller
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      HTTP RESPONSE                                  │
│                                                                     │
│  Status: 200 OK                                                     │
│  Content-Type: application/json                                    │
│                                                                     │
│  {                                                                  │
│    "page": 1,                                                       │
│    "pageSize": 50,                                                  │
│    "totalCount": 3,  ← Only 3 users match "john.doe"              │
│    "rows": [                                                        │
│      {                                                              │
│        "id": "sp-1",                                                │
│        "version": 3,                                                │
│        "lastUpdatedBy": "john.doe@hsbc.com",  ← Matched!          │
│        "lastUpdatedOn": "2025-01-15T14:30:00Z",                   │
│        "DialledService": "12345",                                  │
│        "BypassAg": true                                            │
│      },                                                             │
│      {                                                              │
│        "id": "sp-4",                                                │
│        "lastUpdatedBy": "johnny.west@hsbc.com",  ← Matched!       │
│        ...                                                          │
│      },                                                             │
│      {                                                              │
│        "id": "sp-5",                                                │
│        "lastUpdatedBy": "alice.john@hsbc.com",  ← Matched!        │
│        ...                                                          │
│      }                                                              │
│    ]                                                                │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
    │
    │ Network
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       FRONTEND (React)                              │
│                                                                     │
│  setRows(dataResponse.rows)                                        │
│  setTotalCount(dataResponse.totalCount)                            │
└─────────────────────────────────────────────────────────────────────┘
    │
    │ Re-render
    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    UI UPDATE                                        │
│                                                                     │
│  Table shows 3 records (filtered by user name)                     │
│  Pagination shows: "3 total records"                               │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │ ID    │ Last Updated By        │ Dialled Service │...   │       │
│  ├───────┼────────────────────────┼─────────────────┼──────┤       │
│  │ sp-1  │ john.doe@hsbc.com      │ 12345           │      │       │
│  │ sp-4  │ johnny.west@hsbc.com   │ 11111           │      │       │
│  │ sp-5  │ alice.john@hsbc.com    │ 22222           │      │       │
│  └───────┴────────────────────────┴─────────────────┴──────┘       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Points Summary

### 1️⃣ Frontend Sends
```javascript
globalSearch: "john.doe"
```

### 2️⃣ Backend Receives
```java
@RequestParam(required = false) String globalSearch
```

### 3️⃣ SQL Filters By
```sql
LOWER(last_updated_by) LIKE LOWER('%john.doe%')
```

### 4️⃣ Database Returns
Only rows where `last_updated_by` contains "john.doe" (case-insensitive)

### 5️⃣ Frontend Displays
Filtered table with matching records only

---

## Error Scenarios

### Scenario 1: No Matches Found
```
User types: "zzz123"
Backend query: WHERE LOWER(last_updated_by) LIKE LOWER('%zzz123%')
Database: Returns 0 rows
Response: { "totalCount": 0, "rows": [] }
Frontend: Shows "No records found"
```

### Scenario 2: Empty Search
```
User clears search box
Frontend: globalSearch = ""
Backend: Skips the user filter (returns all records)
Database: Returns all records for UK/CC
Response: { "totalCount": 245, "rows": [...] }
Frontend: Shows all records
```

### Scenario 3: Special Characters
```
User types: "john.doe+test"
Backend: Sanitizes input (optional but recommended)
SQL: Uses parameterized query (prevents injection)
Database: Returns matches safely
```

---

## Performance Flow

```
Without Index (SLOW):
┌──────────────┐
│ User Search  │ → Full table scan → 5000ms
└──────────────┘

With Index (FAST):
┌──────────────┐
│ User Search  │ → Index lookup → 50ms
└──────────────┘

Add this to your database:
CREATE INDEX idx_last_updated_by ON UKCC_SERVICEPROFILE(last_updated_by);
```

---

## Security Flow

```
❌ VULNERABLE (String Concatenation):
┌──────────────┐
│ User Input:  │ → "john'; DROP TABLE--"
│ "john'; DROP"│
└──────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│ SQL = "WHERE last_updated_by LIKE '%" +     │
│       userInput + "%'"                      │
│                                             │
│ Result: WHERE last_updated_by LIKE         │
│         '%john'; DROP TABLE--%'            │
│         └────────┬────────┘                │
│              SQL INJECTION!                │
└─────────────────────────────────────────────┘

✅ SECURE (Parameterized Query):
┌──────────────┐
│ User Input:  │ → "john'; DROP TABLE--"
│ "john'; DROP"│
└──────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│ SQL = "WHERE last_updated_by LIKE ?"        │
│ Param = "%john'; DROP TABLE--%"            │
│                                             │
│ Result: Treated as literal string          │
│         Searches for user named            │
│         "john'; DROP TABLE--"              │
│         (Safe!)                            │
└─────────────────────────────────────────────┘
```

---

## Database Column Mapping

```
Frontend (TypeScript)    Backend (Java/Node)      Database (SQL)
─────────────────────    ───────────────────      ──────────────
lastUpdatedBy            last_updated_by          last_updated_by
      │                         │                        │
      │                         │                        │
      └─────────────────────────┴────────────────────────┘
                                │
                    This is the column that gets
                    filtered by globalSearch
```

---

## API Contract

### Request
```http
GET /api/v1/entity/UKCC_SERVICEPROFILE/data?globalSearch=john HTTP/1.1
Host: api.hsbc.com
Authorization: Bearer <token>
```

### Response
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "page": 1,
  "pageSize": 50,
  "totalCount": 3,
  "rows": [
    {
      "id": "...",
      "lastUpdatedBy": "john.doe@hsbc.com",  ← Contains "john"
      ...
    }
  ]
}
```

### No Search Term
```http
GET /api/v1/entity/UKCC_SERVICEPROFILE/data HTTP/1.1
↓
Returns ALL records (no globalSearch filtering)
```

---

## Testing Checklist

- [ ] Search for "john" → Returns users with "john" in name
- [ ] Search for "JOHN" → Same results (case-insensitive)
- [ ] Search for "" → Returns all records
- [ ] Search for "xyz123" → Returns empty list
- [ ] Search for "john.doe@hsbc.com" → Returns exact match
- [ ] Search with special chars → Doesn't crash
- [ ] Performance test with 10,000 records → < 500ms
- [ ] SQL injection test → Doesn't execute malicious SQL


