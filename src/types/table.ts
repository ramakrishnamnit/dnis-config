/**
 * Type definitions for dynamic table configuration and data
 */

// Column configuration received from backend
export interface ColumnConfig {
  key: string;
  label: string;
  type: "string" | "number" | "date" | "boolean";
  isEditable: boolean;
  isSortable: boolean;
  isFilterable: boolean;
}

// Generic record that can have any fields
export type DynamicRecord = Record<string, any>;

// Pagination information
export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

// API response for table schema
export interface TableSchemaResponse {
  tableName: string;
  columns: ColumnConfig[];
}

// API response for table data
export interface TableDataResponse {
  data: DynamicRecord[];
  pagination: PaginationInfo;
}

// Sort configuration
export interface SortConfig {
  column: string;
  direction: "asc" | "desc";
}

// Filter configuration
export type FilterConfig = Record<string, string>;

