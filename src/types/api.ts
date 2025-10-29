/**
 * API request/response types matching backend contracts
 */

// Metadata API types
export interface MetadataRequest {
  entityId: string;
  country: string;
  businessUnit: string;
}

export interface ColumnMetadataResponse {
  name: string;
  label: string;
  dataType: "STRING" | "NUMBER" | "BOOLEAN" | "DATE" | "ENUM";
  editable: boolean;
  required?: boolean;
  maxLength?: number;
  enumValues?: string[];
  defaultValue?: any;
  isFilterable?: boolean;
}

export interface EntityPermissionsResponse {
  canView: boolean;
  canEdit: boolean;
  canDownload: boolean;
  canDelete?: boolean;
  canAdd?: boolean;
}

export interface MetadataResponse {
  entityId: string;
  entityName: string;
  columns: ColumnMetadataResponse[];
  permissions: EntityPermissionsResponse;
}

// Data API types
export interface DataRequest {
  entityId: string;
  country: string;
  businessUnit: string;
  page: number;
  pageSize: number;
  filters?: Record<string, string>;
  globalSearch?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface EntityRowResponse {
  id: string;
  version: number;
  lastUpdatedBy: string;
  lastUpdatedOn: string;
  [key: string]: any; // Dynamic fields based on metadata
}

export interface DataResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  rows: EntityRowResponse[];
}

// Update API types
export interface RowUpdateRequest {
  id: string;
  version: number;
  editReason: string;
  changes: Record<string, any>;
}

export interface RowUpdateResponse {
  success: boolean;
  conflict?: {
    currentVersion: number;
    attemptedVersion: number;
    conflictingFields: string[];
    message: string;
  };
  newVersion?: number;
  message?: string;
}

export interface BatchUpdateRequest {
  updates: RowUpdateRequest[];
  editReason: string;
}

export interface BatchUpdateResponse {
  successCount: number;
  failureCount: number;
  results: Array<{
    id: string;
    success: boolean;
    error?: string;
    conflict?: RowUpdateResponse["conflict"];
  }>;
}

// Add Row API types
export interface AddRowRequest {
  entityId: string;
  country: string;
  businessUnit: string;
  data: Record<string, any>;
  editReason: string;
}

export interface AddRowResponse {
  success: boolean;
  id?: string;
  message?: string;
  errors?: Record<string, string>;
}

// Bulk Upload API types
export interface BulkUploadRequest {
  entityId: string;
  country: string;
  businessUnit: string;
  rows: Record<string, any>[];
  editReason: string;
}

export interface BulkUploadResponse {
  successCount: number;
  failureCount: number;
  results: Array<{
    rowIndex: number;
    success: boolean;
    id?: string;
    errors?: Record<string, string>;
  }>;
}

// Download Config API types
export interface DownloadConfigRequest {
  entityId: string;
  country: string;
  businessUnit: string;
  filters?: Record<string, string>;
  format: "csv" | "json" | "excel";
  scope?: "current" | "region" | "regionBu";
}

// API Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

