# Backend Integration Guide for UKCC_CONFIG_MAIN Table

This guide explains how to integrate the paginated and filterable table implementation with your backend API.

## Overview

The `RecordManagement` component has been refactored to support **server-side pagination and filtering**. This is essential for tables like `UKCC_CONFIG_MAIN` that contain large amounts of data.

## API Requirements

### 1. Get Table Schema Endpoint

**Endpoint:** `GET /api/tables/{tableName}/schema`

**Purpose:** Retrieve column configuration including which columns are editable, sortable, and filterable.

**Response Example:**
```json
{
  "tableName": "UKCC_CONFIG_MAIN",
  "columns": [
    {
      "key": "id",
      "label": "ID",
      "type": "number",
      "isEditable": false,
      "isSortable": true,
      "isFilterable": true
    },
    {
      "key": "configKey",
      "label": "Configuration Key",
      "type": "string",
      "isEditable": false,
      "isSortable": true,
      "isFilterable": true
    },
    {
      "key": "configValue",
      "label": "Value",
      "type": "string",
      "isEditable": true,
      "isSortable": false,
      "isFilterable": true
    }
  ]
}
```

### 2. Get Table Data Endpoint

**Endpoint:** `GET /api/tables/{tableName}/records`

**Purpose:** Retrieve paginated and filtered table data.

**Query Parameters:**
- `page` (number): Current page number (1-indexed)
- `pageSize` (number): Number of records per page
- `sortBy` (string, optional): Column key to sort by
- `sortDirection` (string, optional): "asc" or "desc"
- `filters` (object, optional): Key-value pairs for filtering

**Example Request:**
```
GET /api/tables/UKCC_CONFIG_MAIN/records?page=1&pageSize=25&filters[configKey]=TIMEOUT&filters[updatedBy]=john
```

**Response Example:**
```json
{
  "data": [
    {
      "id": 1,
      "configKey": "MAX_QUEUE_TIME",
      "configValue": "300",
      "version": "2.1",
      "lastUpdated": "2025-01-15 14:30:00",
      "updatedBy": "john.doe@hsbc.com"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 25,
    "totalRecords": 156,
    "totalPages": 7
  }
}
```

## Frontend Implementation

### Step 1: Create API Service

Create a new file `src/services/tableApi.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface ColumnConfig {
  key: string;
  label: string;
  type: "string" | "number" | "date" | "boolean";
  isEditable: boolean;
  isSortable: boolean;
  isFilterable: boolean;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface TableDataResponse {
  data: Record<string, any>[];
  pagination: PaginationInfo;
}

export interface TableSchemaResponse {
  tableName: string;
  columns: ColumnConfig[];
}

export const tableApi = {
  // Get table schema/column configuration
  getTableSchema: async (tableName: string): Promise<TableSchemaResponse> => {
    const response = await axios.get(`${API_BASE_URL}/tables/${tableName}/schema`);
    return response.data;
  },

  // Get paginated and filtered table data
  getTableData: async (
    tableName: string,
    page: number,
    pageSize: number,
    filters: Record<string, string> = {},
    sortBy?: string,
    sortDirection?: 'asc' | 'desc'
  ): Promise<TableDataResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    
    if (sortBy) {
      params.append('sortBy', sortBy);
      params.append('sortDirection', sortDirection || 'asc');
    }
    
    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(`filters[${key}]`, value);
      }
    });
    
    const response = await axios.get(
      `${API_BASE_URL}/tables/${tableName}/records?${params.toString()}`
    );
    return response.data;
  },
};
```

### Step 2: Create Custom Hook

Create `src/hooks/useTableData.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { tableApi, ColumnConfig, PaginationInfo } from '@/services/tableApi';

export const useTableData = (tableName: string | undefined) => {
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [records, setRecords] = useState<Record<string, any>[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch table schema
  useEffect(() => {
    if (!tableName) return;

    const fetchSchema = async () => {
      try {
        const schema = await tableApi.getTableSchema(tableName);
        setColumns(schema.columns);
      } catch (err) {
        console.error('Error fetching table schema:', err);
        setError('Failed to load table schema');
      }
    };

    fetchSchema();
  }, [tableName]);

  // Fetch table data
  const fetchData = useCallback(async () => {
    if (!tableName) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await tableApi.getTableData(
        tableName,
        pagination.currentPage,
        pagination.pageSize,
        filters,
        sortBy,
        sortDirection
      );

      setRecords(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching table data:', err);
      setError('Failed to load table data');
    } finally {
      setIsLoading(false);
    }
  }, [tableName, pagination.currentPage, pagination.pageSize, filters, sortBy, sortDirection]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, currentPage: 1 }));
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSortChange = (column: string, direction: 'asc' | 'desc') => {
    setSortBy(column);
    setSortDirection(direction);
  };

  return {
    columns,
    records,
    pagination,
    isLoading,
    error,
    handlePageChange,
    handlePageSizeChange,
    handleFilterChange,
    handleSortChange,
    refetch: fetchData,
  };
};
```

### Step 3: Update Index.tsx

Replace the mock data implementation in `src/pages/Index.tsx`:

```typescript
import { useTableData } from '@/hooks/useTableData';

const Index = () => {
  // ... other state ...
  const [selectedTableId, setSelectedTableId] = useState<string>();
  
  const selectedTable = mockTables.find((t) => t.id === selectedTableId);
  
  // Use the custom hook for real API data
  const {
    columns,
    records,
    pagination,
    isLoading,
    error,
    handlePageChange,
    handlePageSizeChange,
    handleFilterChange,
    handleSortChange,
  } = useTableData(selectedTable?.name);

  return (
    // ... JSX ...
    {selectedTable && (
      <div className="glass rounded-xl p-6 border border-border">
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-destructive">{error}</p>
          </div>
        )}
        <RecordManagement
          tableName={selectedTable.name}
          columns={columns}
          records={records}
          pagination={pagination}
          isLoading={isLoading}
          onAddRecord={() => {}}
          onBulkUpload={() => {}}
          onViewAudit={() => {}}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
        />
      </div>
    )}
  );
};
```

## Backend Implementation Example (Java/Spring Boot)

### Controller

```java
@RestController
@RequestMapping("/api/tables")
public class TableController {

    @Autowired
    private TableService tableService;

    @GetMapping("/{tableName}/schema")
    public ResponseEntity<TableSchemaResponse> getTableSchema(
            @PathVariable String tableName) {
        return ResponseEntity.ok(tableService.getTableSchema(tableName));
    }

    @GetMapping("/{tableName}/records")
    public ResponseEntity<TableDataResponse> getTableData(
            @PathVariable String tableName,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection,
            @RequestParam Map<String, String> filters) {
        
        // Extract filter parameters
        Map<String, String> tableFilters = filters.entrySet().stream()
            .filter(e -> e.getKey().startsWith("filters["))
            .collect(Collectors.toMap(
                e -> e.getKey().replaceAll("filters\\[(.+)\\]", "$1"),
                Map.Entry::getValue
            ));

        return ResponseEntity.ok(
            tableService.getTableData(
                tableName, 
                page, 
                pageSize, 
                tableFilters, 
                sortBy, 
                sortDirection
            )
        );
    }
}
```

### Service

```java
@Service
public class TableService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public TableSchemaResponse getTableSchema(String tableName) {
        // This could be stored in a configuration table or metadata store
        // For UKCC_CONFIG_MAIN example:
        List<ColumnConfig> columns = new ArrayList<>();
        columns.add(new ColumnConfig("id", "ID", "number", false, true, true));
        columns.add(new ColumnConfig("configKey", "Configuration Key", "string", false, true, true));
        columns.add(new ColumnConfig("configValue", "Value", "string", true, false, true));
        // ... add more columns
        
        return new TableSchemaResponse(tableName, columns);
    }

    public TableDataResponse getTableData(
            String tableName,
            int page,
            int pageSize,
            Map<String, String> filters,
            String sortBy,
            String sortDirection) {

        // Build SQL query with pagination and filtering
        StringBuilder sql = new StringBuilder("SELECT * FROM " + tableName + " WHERE 1=1");
        List<Object> params = new ArrayList<>();

        // Add filter conditions
        filters.forEach((column, value) -> {
            sql.append(" AND LOWER(").append(column).append(") LIKE LOWER(?)");
            params.add("%" + value + "%");
        });

        // Add sorting
        if (sortBy != null) {
            sql.append(" ORDER BY ").append(sortBy)
               .append(" ").append(sortDirection != null ? sortDirection : "ASC");
        }

        // Count total records
        String countSql = "SELECT COUNT(*) FROM (" + sql.toString() + ") as filtered";
        int totalRecords = jdbcTemplate.queryForObject(countSql, Integer.class, params.toArray());

        // Add pagination
        sql.append(" LIMIT ? OFFSET ?");
        params.add(pageSize);
        params.add((page - 1) * pageSize);

        // Execute query
        List<Map<String, Object>> records = jdbcTemplate.queryForList(sql.toString(), params.toArray());

        // Build response
        PaginationInfo pagination = new PaginationInfo(
            page,
            pageSize,
            totalRecords,
            (int) Math.ceil((double) totalRecords / pageSize)
        );

        return new TableDataResponse(records, pagination);
    }
}
```

## Environment Variables

Add to `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Security Considerations

1. **SQL Injection Prevention**: Always use parameterized queries
2. **Column Validation**: Validate that sortBy column exists before using it
3. **Table Name Validation**: Whitelist allowed table names
4. **Authentication**: Require JWT/session authentication
5. **Authorization**: Check user permissions for table access
6. **Rate Limiting**: Implement API rate limiting
7. **Input Sanitization**: Sanitize all user inputs

## Performance Optimization

1. **Database Indexes**: Ensure indexed columns for filtering and sorting
2. **Connection Pooling**: Use connection pools for database access
3. **Caching**: Cache table schemas (they rarely change)
4. **Query Optimization**: Use EXPLAIN to optimize queries
5. **Debouncing**: Frontend already implements 500ms debounce for filters

## Testing

```typescript
// Test the API service
describe('tableApi', () => {
  it('should fetch table data with pagination', async () => {
    const response = await tableApi.getTableData('UKCC_CONFIG_MAIN', 1, 10);
    expect(response.data).toBeDefined();
    expect(response.pagination.currentPage).toBe(1);
  });

  it('should apply filters correctly', async () => {
    const filters = { configKey: 'TIMEOUT' };
    const response = await tableApi.getTableData('UKCC_CONFIG_MAIN', 1, 10, filters);
    expect(response.data.every(r => r.configKey.includes('TIMEOUT'))).toBe(true);
  });
});
```

## Migration Checklist

- [ ] Install axios: `npm install axios`
- [ ] Create API service file
- [ ] Create custom hook
- [ ] Set up environment variables
- [ ] Update Index.tsx to use the hook
- [ ] Implement backend endpoints
- [ ] Add authentication/authorization
- [ ] Test with real data
- [ ] Add error handling
- [ ] Monitor performance

