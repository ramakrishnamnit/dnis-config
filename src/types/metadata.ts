/**
 * Type definitions for metadata-driven table configuration
 */

export type DataType = "STRING" | "NUMBER" | "BOOLEAN" | "DATE" | "ENUM";

export interface ColumnMetadata {
  name: string;
  label: string;
  dataType: DataType;
  editable: boolean;
  required?: boolean;
  maxLength?: number;
  enumValues?: string[];
  defaultValue?: any;
  isFilterable?: boolean;
}

export interface EntityPermissions {
  canView: boolean;
  canEdit: boolean;
  canDownload: boolean;
  canDelete?: boolean;
  canAdd?: boolean;
}

export interface EntityMetadata {
  entityId: string;
  entityName: string;
  columns: ColumnMetadata[];
  permissions: EntityPermissions;
}

export interface EntityRow {
  id: string;
  version: number;
  lastUpdatedBy: string;
  lastUpdatedOn: string;
  [key: string]: any; // Dynamic fields based on metadata
}

export interface EntityDataResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  rows: EntityRow[];
}

export interface UpdateRowRequest {
  id: string;
  version: number;
  editReason: string;
  changes: Record<string, any>;
}

export interface OCCConflict {
  currentVersion: number;
  attemptedVersion: number;
  conflictingFields: string[];
  message: string;
}
