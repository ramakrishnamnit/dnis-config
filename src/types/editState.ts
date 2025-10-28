/**
 * Type definitions for tracking pending edits state
 */

export type EditStatus = "pending" | "saving" | "saved" | "error";

export interface PendingEdit {
  rowId: string;
  columnName: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
}

export interface RowEditState {
  rowId: string;
  changes: Record<string, any>; // columnName -> newValue
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

