# Backend API Guide: User Name Search Implementation

This guide explains how to implement the backend API to support the user name search functionality in the configuration management UI.

## Overview

The frontend now sends a `globalSearch` parameter that should search specifically by the `lastUpdatedBy` (user name) field. The backend needs to handle this parameter and filter results accordingly.

---

## API Endpoint

### Get Entity Data with User Search

**Endpoint:** `GET /api/v1/entity/{entityId}/data`

**Query Parameters:**
- `country` (string, required): Country code (e.g., "UK")
- `bu` (string, required): Business unit code (e.g., "CC")
- `page` (number, required): Current page number (1-indexed)
- `pageSize` (number, required): Number of records per page
- `globalSearch` (string, optional): **User name search query**
- `filter[columnName]` (string, optional): Column-specific filters
- `sortBy` (string, optional): Column to sort by
- `sortDirection` (string, optional): "asc" or "desc"

**Example Request:**
```
GET /api/v1/entity/UKCC_SERVICEPROFILE/data?country=UK&bu=CC&page=1&pageSize=50&globalSearch=john.doe
```

**Response Structure:**
```json
{
  "page": 1,
  "pageSize": 50,
  "totalCount": 245,
  "rows": [
    {
      "id": "sp-1",
      "version": 3,
      "lastUpdatedBy": "john.doe@hsbc.com",
      "lastUpdatedOn": "2025-01-15T14:30:00Z",
      "DialledService": "12345",
      "BypassAg": true,
      "InterceptTreatmentType": "BLOCK",
      "MaxQueueTime": 30,
      "Priority": 1,
      "IsActive": true
    }
  ]
}
```

---

## Implementation Examples

### Java Spring Boot Implementation

#### 1. Controller

```java
package com.hsbc.config.controller;

import com.hsbc.config.dto.DataRequest;
import com.hsbc.config.dto.DataResponse;
import com.hsbc.config.service.EntityDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/entity")
public class EntityDataController {

    @Autowired
    private EntityDataService entityDataService;

    @GetMapping("/{entityId}/data")
    public ResponseEntity<DataResponse> getEntityData(
            @PathVariable String entityId,
            @RequestParam String country,
            @RequestParam String bu,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int pageSize,
            @RequestParam(required = false) String globalSearch,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection,
            @RequestParam Map<String, String> allParams) {

        // Extract column filters (parameters starting with "filter[")
        Map<String, String> columnFilters = extractColumnFilters(allParams);

        DataRequest request = DataRequest.builder()
                .entityId(entityId)
                .country(country)
                .businessUnit(bu)
                .page(page)
                .pageSize(pageSize)
                .globalSearch(globalSearch)
                .filters(columnFilters)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();

        DataResponse response = entityDataService.getEntityData(request);
        return ResponseEntity.ok(response);
    }

    private Map<String, String> extractColumnFilters(Map<String, String> params) {
        return params.entrySet().stream()
                .filter(e -> e.getKey().startsWith("filter[") && e.getKey().endsWith("]"))
                .collect(Collectors.toMap(
                        e -> e.getKey().substring(7, e.getKey().length() - 1), // Extract column name
                        Map.Entry::getValue
                ));
    }
}
```

#### 2. Service Layer

```java
package com.hsbc.config.service;

import com.hsbc.config.dto.DataRequest;
import com.hsbc.config.dto.DataResponse;
import com.hsbc.config.dto.EntityRowResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class EntityDataService {

    @Autowired
    private NamedParameterJdbcTemplate jdbcTemplate;

    public DataResponse getEntityData(DataRequest request) {
        // Build SQL query
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT * FROM ").append(request.getEntityId());
        sql.append(" WHERE country = :country AND business_unit = :bu");

        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("country", request.getCountry());
        params.addValue("bu", request.getBusinessUnit());

        // *** USER NAME SEARCH - Key Implementation ***
        if (request.getGlobalSearch() != null && !request.getGlobalSearch().isEmpty()) {
            sql.append(" AND LOWER(last_updated_by) LIKE LOWER(:globalSearch)");
            params.addValue("globalSearch", "%" + request.getGlobalSearch() + "%");
        }

        // Apply column-specific filters
        if (request.getFilters() != null && !request.getFilters().isEmpty()) {
            request.getFilters().forEach((column, value) -> {
                if (value != null && !value.isEmpty()) {
                    String paramName = "filter_" + column;
                    sql.append(" AND LOWER(").append(sanitizeColumnName(column))
                       .append(") LIKE LOWER(:").append(paramName).append(")");
                    params.addValue(paramName, "%" + value + "%");
                }
            });
        }

        // Count total records (before pagination)
        String countSql = "SELECT COUNT(*) FROM (" + sql.toString() + ") AS filtered_data";
        Integer totalCount = jdbcTemplate.queryForObject(countSql, params, Integer.class);

        // Apply sorting
        if (request.getSortBy() != null && !request.getSortBy().isEmpty()) {
            sql.append(" ORDER BY ").append(sanitizeColumnName(request.getSortBy()));
            sql.append(" ").append("desc".equalsIgnoreCase(request.getSortDirection()) ? "DESC" : "ASC");
        } else {
            sql.append(" ORDER BY last_updated_on DESC"); // Default sort
        }

        // Apply pagination
        sql.append(" LIMIT :pageSize OFFSET :offset");
        params.addValue("pageSize", request.getPageSize());
        params.addValue("offset", (request.getPage() - 1) * request.getPageSize());

        // Execute query
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql.toString(), params);

        // Map to EntityRowResponse
        List<EntityRowResponse> entityRows = rows.stream()
                .map(this::mapToEntityRow)
                .collect(Collectors.toList());

        return DataResponse.builder()
                .page(request.getPage())
                .pageSize(request.getPageSize())
                .totalCount(totalCount != null ? totalCount : 0)
                .rows(entityRows)
                .build();
    }

    private EntityRowResponse mapToEntityRow(Map<String, Object> row) {
        EntityRowResponse response = new EntityRowResponse();
        response.setId((String) row.get("id"));
        response.setVersion((Integer) row.get("version"));
        response.setLastUpdatedBy((String) row.get("last_updated_by"));
        response.setLastUpdatedOn((String) row.get("last_updated_on"));
        
        // Add all dynamic columns
        row.forEach((key, value) -> {
            if (!key.equals("id") && !key.equals("version") && 
                !key.equals("last_updated_by") && !key.equals("last_updated_on")) {
                response.addDynamicField(key, value);
            }
        });
        
        return response;
    }

    private String sanitizeColumnName(String columnName) {
        // Validate column name to prevent SQL injection
        if (!columnName.matches("^[a-zA-Z_][a-zA-Z0-9_]*$")) {
            throw new IllegalArgumentException("Invalid column name: " + columnName);
        }
        return columnName;
    }
}
```

#### 3. DTOs (Data Transfer Objects)

```java
package com.hsbc.config.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class DataRequest {
    private String entityId;
    private String country;
    private String businessUnit;
    private int page;
    private int pageSize;
    private String globalSearch;  // User name search
    private Map<String, String> filters;
    private String sortBy;
    private String sortDirection;
}

@Data
@Builder
public class DataResponse {
    private int page;
    private int pageSize;
    private int totalCount;
    private List<EntityRowResponse> rows;
}

@Data
public class EntityRowResponse {
    private String id;
    private int version;
    private String lastUpdatedBy;
    private String lastUpdatedOn;
    private Map<String, Object> dynamicFields = new HashMap<>();

    public void addDynamicField(String key, Object value) {
        dynamicFields.put(key, value);
    }
}
```

---

### Node.js/Express Implementation

#### 1. Route Handler

```javascript
const express = require('express');
const router = express.Router();
const entityDataService = require('../services/entityDataService');

router.get('/entity/:entityId/data', async (req, res) => {
    try {
        const {
            country,
            bu,
            page = 1,
            pageSize = 50,
            globalSearch,
            sortBy,
            sortDirection
        } = req.query;

        // Extract column filters
        const columnFilters = {};
        Object.keys(req.query).forEach(key => {
            const match = key.match(/^filter\[(.+)\]$/);
            if (match) {
                columnFilters[match[1]] = req.query[key];
            }
        });

        const request = {
            entityId: req.params.entityId,
            country,
            businessUnit: bu,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            globalSearch,
            filters: columnFilters,
            sortBy,
            sortDirection
        };

        const response = await entityDataService.getEntityData(request);
        res.json(response);
    } catch (error) {
        console.error('Error fetching entity data:', error);
        res.status(500).json({
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch entity data',
            details: error.message
        });
    }
});

module.exports = router;
```

#### 2. Service Layer

```javascript
const db = require('../db/connection');

class EntityDataService {
    async getEntityData(request) {
        let query = `SELECT * FROM ${request.entityId} WHERE country = $1 AND business_unit = $2`;
        const params = [request.country, request.businessUnit];
        let paramIndex = 3;

        // *** USER NAME SEARCH - Key Implementation ***
        if (request.globalSearch) {
            query += ` AND LOWER(last_updated_by) LIKE LOWER($${paramIndex})`;
            params.push(`%${request.globalSearch}%`);
            paramIndex++;
        }

        // Apply column filters
        if (request.filters && Object.keys(request.filters).length > 0) {
            Object.entries(request.filters).forEach(([column, value]) => {
                if (value) {
                    const sanitizedColumn = this.sanitizeColumnName(column);
                    query += ` AND LOWER(${sanitizedColumn}) LIKE LOWER($${paramIndex})`;
                    params.push(`%${value}%`);
                    paramIndex++;
                }
            });
        }

        // Count total records
        const countQuery = `SELECT COUNT(*) FROM (${query}) AS filtered_data`;
        const countResult = await db.query(countQuery, params);
        const totalCount = parseInt(countResult.rows[0].count);

        // Apply sorting
        if (request.sortBy) {
            const sanitizedSort = this.sanitizeColumnName(request.sortBy);
            const direction = request.sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            query += ` ORDER BY ${sanitizedSort} ${direction}`;
        } else {
            query += ` ORDER BY last_updated_on DESC`;
        }

        // Apply pagination
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(request.pageSize);
        params.push((request.page - 1) * request.pageSize);

        // Execute query
        const result = await db.query(query, params);

        return {
            page: request.page,
            pageSize: request.pageSize,
            totalCount,
            rows: result.rows.map(row => ({
                id: row.id,
                version: row.version,
                lastUpdatedBy: row.last_updated_by,
                lastUpdatedOn: row.last_updated_on,
                ...this.extractDynamicFields(row)
            }))
        };
    }

    sanitizeColumnName(columnName) {
        // Validate column name to prevent SQL injection
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columnName)) {
            throw new Error(`Invalid column name: ${columnName}`);
        }
        return columnName;
    }

    extractDynamicFields(row) {
        const { id, version, last_updated_by, last_updated_on, ...dynamicFields } = row;
        return dynamicFields;
    }
}

module.exports = new EntityDataService();
```

---

### Python/Flask Implementation

```python
from flask import Blueprint, request, jsonify
from services.entity_data_service import EntityDataService

entity_bp = Blueprint('entity', __name__)
entity_service = EntityDataService()

@entity_bp.route('/entity/<entity_id>/data', methods=['GET'])
def get_entity_data(entity_id):
    try:
        # Extract query parameters
        country = request.args.get('country')
        bu = request.args.get('bu')
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('pageSize', 50))
        global_search = request.args.get('globalSearch')
        sort_by = request.args.get('sortBy')
        sort_direction = request.args.get('sortDirection')

        # Extract column filters
        column_filters = {}
        for key, value in request.args.items():
            if key.startswith('filter[') and key.endswith(']'):
                column_name = key[7:-1]
                column_filters[column_name] = value

        data_request = {
            'entityId': entity_id,
            'country': country,
            'businessUnit': bu,
            'page': page,
            'pageSize': page_size,
            'globalSearch': global_search,
            'filters': column_filters,
            'sortBy': sort_by,
            'sortDirection': sort_direction
        }

        response = entity_service.get_entity_data(data_request)
        return jsonify(response), 200

    except Exception as e:
        return jsonify({
            'code': 'INTERNAL_ERROR',
            'message': 'Failed to fetch entity data',
            'details': str(e)
        }), 500
```

---

## Database Schema Requirements

### Required Columns

Every configuration table should have these audit columns:

```sql
CREATE TABLE UKCC_SERVICEPROFILE (
    id VARCHAR(50) PRIMARY KEY,
    version INT NOT NULL DEFAULT 1,
    last_updated_by VARCHAR(255) NOT NULL,  -- *** User name column ***
    last_updated_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    country VARCHAR(10) NOT NULL,
    business_unit VARCHAR(10) NOT NULL,
    
    -- Entity-specific columns
    dialled_service VARCHAR(50),
    bypass_ag BOOLEAN,
    intercept_treatment_type VARCHAR(20),
    max_queue_time INT,
    priority INT,
    is_active BOOLEAN,
    
    -- Indexes for performance
    INDEX idx_country_bu (country, business_unit),
    INDEX idx_last_updated_by (last_updated_by),  -- *** Critical for user search ***
    INDEX idx_last_updated_on (last_updated_on)
);
```

### Recommended Indexes

```sql
-- User name search index (most important)
CREATE INDEX idx_last_updated_by_lower ON UKCC_SERVICEPROFILE (LOWER(last_updated_by));

-- Composite index for common queries
CREATE INDEX idx_country_bu_updated ON UKCC_SERVICEPROFILE (country, business_unit, last_updated_on DESC);

-- Full-text search index (optional, for advanced search)
CREATE FULLTEXT INDEX idx_last_updated_by_ft ON UKCC_SERVICEPROFILE (last_updated_by);
```

---

## Security Considerations

### 1. SQL Injection Prevention
```java
// ✅ GOOD - Use parameterized queries
String sql = "SELECT * FROM " + tableName + " WHERE last_updated_by LIKE ?";
jdbcTemplate.query(sql, new Object[]{"%" + search + "%"}, rowMapper);

// ❌ BAD - String concatenation
String sql = "SELECT * FROM " + tableName + " WHERE last_updated_by LIKE '%" + search + "%'";
```

### 2. Column Name Validation
```java
private static final Set<String> ALLOWED_COLUMNS = Set.of(
    "id", "version", "last_updated_by", "last_updated_on",
    "DialledService", "BypassAg", "InterceptTreatmentType"
);

private String validateColumnName(String column) {
    if (!ALLOWED_COLUMNS.contains(column)) {
        throw new IllegalArgumentException("Invalid column name");
    }
    return column;
}
```

### 3. Input Sanitization
```java
private String sanitizeSearchInput(String input) {
    if (input == null) return null;
    
    // Remove potentially dangerous characters
    return input.replaceAll("[^a-zA-Z0-9@._-]", "")
                .trim()
                .substring(0, Math.min(input.length(), 100)); // Max length
}
```

### 4. Rate Limiting
```java
@RateLimiter(name = "entityData", fallbackMethod = "rateLimitFallback")
public DataResponse getEntityData(DataRequest request) {
    // Implementation
}
```

---

## Performance Optimization

### 1. Query Optimization
```sql
-- Use EXPLAIN to analyze query performance
EXPLAIN ANALYZE
SELECT * FROM UKCC_SERVICEPROFILE
WHERE country = 'UK' 
  AND business_unit = 'CC'
  AND LOWER(last_updated_by) LIKE LOWER('%john%')
ORDER BY last_updated_on DESC
LIMIT 50 OFFSET 0;
```

### 2. Connection Pooling
```java
@Bean
public DataSource dataSource() {
    HikariConfig config = new HikariConfig();
    config.setMaximumPoolSize(20);
    config.setMinimumIdle(5);
    config.setConnectionTimeout(30000);
    config.setIdleTimeout(600000);
    config.setMaxLifetime(1800000);
    return new HikariDataSource(config);
}
```

### 3. Caching Strategy
```java
@Cacheable(value = "entityData", key = "#request.hashCode()")
public DataResponse getEntityData(DataRequest request) {
    // Implementation
}
```

---

## Testing

### Unit Test Example (Java)
```java
@Test
public void testUserNameSearch() {
    DataRequest request = DataRequest.builder()
            .entityId("UKCC_SERVICEPROFILE")
            .country("UK")
            .businessUnit("CC")
            .page(1)
            .pageSize(50)
            .globalSearch("john.doe")
            .build();

    DataResponse response = entityDataService.getEntityData(request);

    assertNotNull(response);
    assertTrue(response.getRows().stream()
            .allMatch(row -> row.getLastUpdatedBy().contains("john.doe")));
}
```

### Integration Test Example
```java
@Test
public void testApiEndpoint() throws Exception {
    mockMvc.perform(get("/api/v1/entity/UKCC_SERVICEPROFILE/data")
            .param("country", "UK")
            .param("bu", "CC")
            .param("page", "1")
            .param("pageSize", "50")
            .param("globalSearch", "john.doe"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalCount").isNumber())
            .andExpect(jsonPath("$.rows[0].lastUpdatedBy").value(containsString("john.doe")));
}
```

---

## Error Handling

```java
@ExceptionHandler(Exception.class)
public ResponseEntity<ApiError> handleException(Exception e) {
    log.error("Error processing request", e);
    
    ApiError error = ApiError.builder()
            .code("INTERNAL_ERROR")
            .message("An error occurred while processing your request")
            .details(e.getMessage())
            .build();
    
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
}
```

---

## API Documentation (OpenAPI/Swagger)

```yaml
paths:
  /api/v1/entity/{entityId}/data:
    get:
      summary: Get entity data with user name search
      parameters:
        - name: entityId
          in: path
          required: true
          schema:
            type: string
        - name: country
          in: query
          required: true
          schema:
            type: string
        - name: bu
          in: query
          required: true
          schema:
            type: string
        - name: globalSearch
          in: query
          description: Search by user name (lastUpdatedBy field)
          schema:
            type: string
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: pageSize
          in: query
          schema:
            type: integer
            default: 50
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DataResponse'
```

---

## Monitoring & Logging

```java
@Slf4j
@Service
public class EntityDataService {
    
    public DataResponse getEntityData(DataRequest request) {
        long startTime = System.currentTimeMillis();
        
        log.info("Fetching entity data - Entity: {}, Country: {}, BU: {}, Search: '{}'",
                request.getEntityId(), request.getCountry(), 
                request.getBusinessUnit(), request.getGlobalSearch());
        
        try {
            DataResponse response = executeQuery(request);
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("Query completed in {}ms - Returned {} rows out of {} total",
                    duration, response.getRows().size(), response.getTotalCount());
            
            return response;
        } catch (Exception e) {
            log.error("Error fetching entity data", e);
            throw e;
        }
    }
}
```

---

## Checklist for Backend Implementation

- [ ] Create API endpoint `/api/v1/entity/{entityId}/data`
- [ ] Extract `globalSearch` query parameter
- [ ] Implement SQL query with `LOWER(last_updated_by) LIKE LOWER(:search)`
- [ ] Create database index on `last_updated_by` column
- [ ] Validate and sanitize all inputs
- [ ] Use parameterized queries (prevent SQL injection)
- [ ] Implement pagination correctly
- [ ] Add error handling and logging
- [ ] Write unit tests for service layer
- [ ] Write integration tests for API endpoint
- [ ] Configure connection pooling
- [ ] Add rate limiting
- [ ] Document API with Swagger/OpenAPI
- [ ] Test with real data
- [ ] Monitor query performance
- [ ] Set up alerts for slow queries

---

## Additional Resources

- [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [Database Indexing Best Practices](https://use-the-index-luke.com/)
- [API Security Best Practices](https://owasp.org/www-project-api-security/)


