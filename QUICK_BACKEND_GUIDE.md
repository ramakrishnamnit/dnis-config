# Quick Backend Implementation Guide - User Name Search

## TL;DR - What You Need to Do

The frontend now searches by **user name** instead of searching all columns. Here's what the backend needs to do:

### 1. Accept the `globalSearch` Parameter

Your API endpoint receives this parameter:
```
GET /api/v1/entity/UKCC_SERVICEPROFILE/data?globalSearch=john.doe
```

### 2. Filter by `lastUpdatedBy` Column

When `globalSearch` is provided, filter results by the user name column:

```sql
SELECT * FROM your_table
WHERE LOWER(last_updated_by) LIKE LOWER('%john.doe%')
```

---

## Key Implementation Points

### ✅ SQL Query Pattern

```sql
SELECT * FROM {entity_table}
WHERE country = ?
  AND business_unit = ?
  AND LOWER(last_updated_by) LIKE LOWER(?)  -- ← User search here
ORDER BY last_updated_on DESC
LIMIT ? OFFSET ?
```

### ✅ Security: Use Parameterized Queries

**GOOD** ✅
```java
String sql = "WHERE last_updated_by LIKE ?";
jdbcTemplate.query(sql, "%" + search + "%");
```

**BAD** ❌
```java
String sql = "WHERE last_updated_by LIKE '%" + search + "%'";
```

### ✅ Database Index Required

```sql
CREATE INDEX idx_last_updated_by ON your_table (last_updated_by);
-- OR for case-insensitive search
CREATE INDEX idx_last_updated_by_lower ON your_table (LOWER(last_updated_by));
```

---

## Quick Code Examples

### Java Spring Boot (30 seconds)

```java
@GetMapping("/entity/{entityId}/data")
public ResponseEntity<DataResponse> getData(
        @PathVariable String entityId,
        @RequestParam String country,
        @RequestParam String bu,
        @RequestParam(required = false) String globalSearch) {
    
    String sql = "SELECT * FROM " + entityId + 
                 " WHERE country = ? AND business_unit = ?";
    
    List<Object> params = List.of(country, bu);
    
    // *** Add user search if provided ***
    if (globalSearch != null && !globalSearch.isEmpty()) {
        sql += " AND LOWER(last_updated_by) LIKE LOWER(?)";
        params.add("%" + globalSearch + "%");
    }
    
    sql += " ORDER BY last_updated_on DESC LIMIT ? OFFSET ?";
    
    // Execute query and return results
}
```

### Node.js/Express (30 seconds)

```javascript
app.get('/entity/:entityId/data', async (req, res) => {
    const { country, bu, globalSearch } = req.query;
    
    let query = `SELECT * FROM ${req.params.entityId} 
                 WHERE country = $1 AND business_unit = $2`;
    const params = [country, bu];
    
    // *** Add user search if provided ***
    if (globalSearch) {
        query += ` AND LOWER(last_updated_by) LIKE LOWER($3)`;
        params.push(`%${globalSearch}%`);
    }
    
    query += ` ORDER BY last_updated_on DESC`;
    
    const result = await db.query(query, params);
    res.json(result.rows);
});
```

### Python/Flask (30 seconds)

```python
@app.route('/entity/<entity_id>/data')
def get_data(entity_id):
    country = request.args.get('country')
    bu = request.args.get('bu')
    global_search = request.args.get('globalSearch')
    
    query = f"SELECT * FROM {entity_id} WHERE country = %s AND business_unit = %s"
    params = [country, bu]
    
    # *** Add user search if provided ***
    if global_search:
        query += " AND LOWER(last_updated_by) LIKE LOWER(%s)"
        params.append(f"%{global_search}%")
    
    query += " ORDER BY last_updated_on DESC"
    
    results = db.execute(query, params)
    return jsonify(results)
```

---

## Testing Your Implementation

### Test Case 1: Search for User "john"
```bash
curl "http://localhost:8080/api/v1/entity/UKCC_SERVICEPROFILE/data?country=UK&bu=CC&page=1&pageSize=50&globalSearch=john"
```

**Expected:** Returns only records where `lastUpdatedBy` contains "john"

### Test Case 2: No Search Term
```bash
curl "http://localhost:8080/api/v1/entity/UKCC_SERVICEPROFILE/data?country=UK&bu=CC&page=1&pageSize=50"
```

**Expected:** Returns all records (no filtering by user)

### Test Case 3: Case Insensitive
```bash
curl "http://localhost:8080/api/v1/entity/UKCC_SERVICEPROFILE/data?country=UK&bu=CC&globalSearch=JOHN"
```

**Expected:** Returns records with "john", "John", "JOHN", etc.

---

## Troubleshooting

### Problem: Search returns no results
**Solution:** Check if your database column is named `last_updated_by` (with underscores)

### Problem: Search is slow
**Solution:** Add database index:
```sql
CREATE INDEX idx_last_updated_by ON your_table (last_updated_by);
```

### Problem: Case-sensitive search
**Solution:** Use `LOWER()` function in SQL:
```sql
LOWER(last_updated_by) LIKE LOWER(?)
```

### Problem: SQL Injection vulnerability
**Solution:** Always use parameterized queries, never string concatenation

---

## Complete Example Response

```json
{
  "page": 1,
  "pageSize": 50,
  "totalCount": 5,
  "rows": [
    {
      "id": "sp-1",
      "version": 3,
      "lastUpdatedBy": "john.doe@hsbc.com",  ← Matches search "john"
      "lastUpdatedOn": "2025-01-15T14:30:00Z",
      "DialledService": "12345",
      "BypassAg": true,
      "MaxQueueTime": 30
    },
    {
      "id": "sp-5",
      "version": 2,
      "lastUpdatedBy": "johnny.smith@hsbc.com",  ← Matches search "john"
      "lastUpdatedOn": "2025-01-14T10:20:00Z",
      "DialledService": "54321",
      "BypassAg": false,
      "MaxQueueTime": 60
    }
  ]
}
```

---

## Database Schema Requirement

Make sure your tables have this column:

```sql
last_updated_by VARCHAR(255) NOT NULL  -- Stores user email/username
```

Example full table:
```sql
CREATE TABLE UKCC_SERVICEPROFILE (
    id VARCHAR(50) PRIMARY KEY,
    version INT NOT NULL,
    last_updated_by VARCHAR(255) NOT NULL,  -- ← Required
    last_updated_on TIMESTAMP NOT NULL,
    country VARCHAR(10) NOT NULL,
    business_unit VARCHAR(10) NOT NULL,
    -- ... other columns
    
    INDEX idx_last_updated_by (last_updated_by)  -- ← Performance
);
```

---

## What Changed in Frontend

**Before:** Search box said "Search all columns..."  
**After:** Search box says "Search by user name..."

**Frontend Code:**
```typescript
// Sends this to backend
const request: DataRequest = {
  entityId: "UKCC_SERVICEPROFILE",
  country: "UK",
  businessUnit: "CC",
  globalSearch: "john.doe",  // ← User types this
  page: 1,
  pageSize: 50
};
```

**Backend Must:** Filter by `last_updated_by` when `globalSearch` is provided

---

## Next Steps

1. ✅ Update your SQL query to filter by `last_updated_by`
2. ✅ Test with sample user names
3. ✅ Add database index for performance
4. ✅ Verify parameterized queries (security)
5. ✅ Test case-insensitive search

For detailed implementation with full error handling, security, and optimization, see [BACKEND_API_USER_SEARCH.md](./BACKEND_API_USER_SEARCH.md)


