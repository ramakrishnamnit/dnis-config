# Smart Filter Feature

## Overview

The Smart Filter is an advanced filtering system for configuration tables that allows users to create complex filter conditions using AND/OR logic operations. Unlike simple column filters, the Smart Filter enables sophisticated queries with multiple conditions combined logically.

## Features

### 1. **Multiple Filter Conditions**
- Add unlimited filter conditions
- Each condition targets a specific column
- Remove conditions individually with dedicated delete buttons

### 2. **Logical Operators (AND/OR)**
- **AND**: All conditions must match (intersection)
- **OR**: Any condition can match (union)
- Visual indicator showing which operator is active
- Easy toggle between operators

### 3. **Column-Specific Operators**

The filter intelligently provides appropriate operators based on column data types:

#### String Columns
- Equals
- Not equals
- Contains
- Starts with
- Ends with

#### Number Columns
- Equals
- Not equals
- Greater than
- Less than

#### Date Columns
- Equals
- Greater than (after)
- Less than (before)

#### Boolean Columns
- Equals (Yes/No)

#### Enum Columns
- Equals
- Not equals

### 4. **Smart Value Inputs**
- **Text fields**: For string columns
- **Number inputs**: For numeric columns
- **Date pickers**: For date columns
- **Dropdowns**: For boolean and enum columns
- Auto-populated enum values

### 5. **Filter Management**
- **Active filter badges**: Visual display of active conditions
- **Clear all**: Remove all filters at once
- **Validation**: Empty conditions are automatically filtered out
- **Persistent state**: Filters remain active until explicitly cleared

### 6. **User Interface**
- Clean, modern glass-morphism design
- Responsive layout
- Clear visual hierarchy
- Color-coded badges for logical operators
- Intuitive add/remove condition workflow

## Usage

### Adding a Filter

1. Click the **"Smart Filter"** button in the toolbar
2. Click **"Add Condition"** to create a new filter rule
3. Select a column from the dropdown
4. Choose an operator (e.g., "Contains", "Equals")
5. Enter a value
6. Add more conditions as needed
7. If multiple conditions exist, choose **AND** or **OR** logic
8. Click **"Apply Filters"** to execute the query

### Example Use Cases

#### Example 1: Find Active Users in Specific Regions
```
Condition 1: Status equals "Active"
Condition 2: Region equals "UK"
Operator: AND
```
Result: Only active users in UK

#### Example 2: Find High-Value or Priority Records
```
Condition 1: Amount greater_than "10000"
Condition 2: Priority equals "High"
Operator: OR
```
Result: Records with amount > 10000 OR priority = High

#### Example 3: Complex Search
```
Condition 1: Service_Name contains "Payment"
Condition 2: Environment equals "Production"
Condition 3: Last_Updated greater_than "2025-01-01"
Operator: AND
```
Result: Production payment services updated after Jan 1, 2025

### Clearing Filters

- Click **"Clear All"** inside the filter panel, or
- Click **"Clear All"** next to the active filter badges, or
- Remove individual conditions using the trash icon

## Technical Implementation

### Component Structure

```
SmartFilter (Main Component)
├── Filter Conditions (Array)
│   ├── Column Selector
│   ├── Operator Selector
│   └── Value Input
├── Logical Operator Selection (AND/OR)
└── Action Buttons (Add/Apply/Clear)
```

### Data Flow

1. **User Input** → Internal state with temporary IDs
2. **Apply** → Converts to API format (removes internal IDs)
3. **API Call** → Backend receives SmartFilterGroup
4. **Backend** → Processes conditions with logical operators
5. **Results** → Filtered data returned to table

### Type Definitions

```typescript
export type FilterOperator = 
  | "equals" 
  | "contains" 
  | "starts_with" 
  | "ends_with" 
  | "greater_than" 
  | "less_than" 
  | "not_equals";

export type LogicalOperator = "AND" | "OR";

export interface FilterCondition {
  column: string;
  operator: FilterOperator;
  value: string;
}

export interface SmartFilterGroup {
  conditions: FilterCondition[];
  logicalOperator: LogicalOperator;
}
```

### API Integration

The Smart Filter integrates with the existing data API:

```typescript
export interface DataRequest {
  entityId: string;
  country: string;
  businessUnit: string;
  page: number;
  pageSize: number;
  filters?: Record<string, string>;      // Simple column filters
  smartFilter?: SmartFilterGroup;        // Smart filter (NEW)
  globalSearch?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}
```

## Backend Requirements

The backend should process the `smartFilter` field by:

1. Parsing each condition in the `conditions` array
2. Building SQL WHERE clauses or equivalent for each condition
3. Combining clauses using the specified `logicalOperator`
4. Returning filtered results

### Example Backend Processing

**Request:**
```json
{
  "smartFilter": {
    "logicalOperator": "AND",
    "conditions": [
      { "column": "status", "operator": "equals", "value": "Active" },
      { "column": "amount", "operator": "greater_than", "value": "1000" }
    ]
  }
}
```

**SQL Output:**
```sql
WHERE status = 'Active' AND amount > 1000
```

## Benefits

1. **Power**: Complex queries without writing SQL
2. **Flexibility**: Mix and match any columns and operators
3. **User-Friendly**: Intuitive visual interface
4. **Type-Safe**: Operators matched to column data types
5. **Reusable**: Save and reuse common filter patterns (future enhancement)
6. **Performance**: Server-side filtering for large datasets

## Future Enhancements

- **Saved Filters**: Save frequently used filter combinations
- **Filter Templates**: Pre-configured filters for common scenarios
- **Nested Groups**: Support for complex nested AND/OR logic
- **Filter History**: Recently used filters
- **Export Filters**: Share filter configurations
- **Filter Validation**: Advanced validation rules
- **Natural Language**: Convert natural language to filters

## Comparison with Simple Filters

| Feature | Simple Column Filters | Smart Filter |
|---------|----------------------|--------------|
| Multiple Columns | ✅ Yes | ✅ Yes |
| AND Logic | ✅ Implicit | ✅ Explicit |
| OR Logic | ❌ No | ✅ Yes |
| Multiple Operators | ❌ No | ✅ Yes |
| Complex Conditions | ❌ No | ✅ Yes |
| Visual Builder | ⚠️ Basic | ✅ Advanced |

## Troubleshooting

### Filters Not Working
- Ensure at least one condition has a value
- Check that the column exists in the table
- Verify backend supports smart filter API

### No Results
- Try using OR instead of AND
- Check if values match case-sensitivity requirements
- Verify date formats

### Performance Issues
- Limit the number of conditions
- Use indexed columns when possible
- Consider adding pagination

## Summary

The Smart Filter feature provides a powerful, user-friendly way to create complex queries on configuration tables. With support for AND/OR logic and multiple operators per column, users can perform sophisticated data filtering without technical knowledge of SQL or database queries.

