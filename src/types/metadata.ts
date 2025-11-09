/**
 * Type definitions for metadata-driven table configuration
 */

export type DataType = "STRING" | "NUMBER" | "BOOLEAN" | "DATE" | "ENUM";

export type MetadataValue = string | number | boolean | null;
export type MetadataRecord = Record<string, MetadataValue | undefined>;

export interface ColumnMetadata {
  name: string;
  label: string;
  dataType: DataType;
  editable: boolean;
  required?: boolean;
  maxLength?: number;
  enumValues?: string[];
  defaultValue?: MetadataValue;
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

export interface EntityRow extends MetadataRecord {
  id: string;
  version: number;
  lastUpdatedBy: string;
  lastUpdatedOn: string;
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
  changes: MetadataRecord;
}

export interface OCCConflict {
  currentVersion: number;
  attemptedVersion: number;
  conflictingFields: string[];
  message: string;
}
