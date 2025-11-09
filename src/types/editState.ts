/**
 * Type definitions for tracking pending edits state
 */

import type { MetadataRecord, MetadataValue } from "./metadata";

export type EditStatus = "pending" | "saving" | "saved" | "error";

export interface PendingEdit {
  rowId: string;
  columnName: string;
  oldValue: MetadataValue | undefined;
  newValue: MetadataValue | undefined;
  timestamp: number;
}

export interface RowEditState {
  rowId: string;
  changes: MetadataRecord; // columnName -> newValue
  status: EditStatus;
  error?: string;
  version: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

