/**
 * Hook to manage pending row edits and validation
 */

import { useState, useCallback } from "react";
import type { RowEditState, ValidationError, ValidationResult } from "@/types/editState";
import type { EntityMetadata, MetadataRecord, MetadataValue } from "@/types/metadata";
import type { EntityRowResponse } from "@/types/api";

export function useRowUpdates(metadata: EntityMetadata | null) {
  const [pendingEdits, setPendingEdits] = useState<Map<string, RowEditState>>(new Map());

  /**
   * Set a pending edit for a specific cell
   */
  const setPendingEdit = useCallback(
    (rowId: string, columnName: string, newValue: MetadataValue | undefined, version: number) => {
      setPendingEdits((prev) => {
        const newMap = new Map(prev);
        const existingEdit = newMap.get(rowId);

        if (existingEdit) {
          // Update existing row edit
          newMap.set(rowId, {
            ...existingEdit,
            changes: {
              ...existingEdit.changes,
              [columnName]: newValue,
            },
          });
        } else {
          // Create new row edit
          newMap.set(rowId, {
            rowId,
            changes: { [columnName]: newValue },
            status: "pending",
            version,
          });
        }

        return newMap;
      });
    },
    []
  );

  /**
   * Clear edits for a specific row
   */
  const clearRowEdits = useCallback((rowId: string) => {
    setPendingEdits((prev) => {
      const newMap = new Map(prev);
      newMap.delete(rowId);
      return newMap;
    });
  }, []);

  /**
   * Clear all pending edits
   */
  const clearAllEdits = useCallback(() => {
    setPendingEdits(new Map());
  }, []);

  /**
   * Get edits for a specific row
   */
  const getRowEdits = useCallback(
    (rowId: string): MetadataRecord | null => {
      const edit = pendingEdits.get(rowId);
      return edit?.changes || null;
    },
    [pendingEdits]
  );

  /**
   * Get all row IDs with pending changes
   */
  const getAllPendingRows = useCallback((): string[] => {
    return Array.from(pendingEdits.keys());
  }, [pendingEdits]);

  /**
   * Check if a specific row has changes
   */
  const hasRowChanges = useCallback(
    (rowId: string): boolean => {
      return pendingEdits.has(rowId);
    },
    [pendingEdits]
  );

  /**
   * Check if there are any pending changes
   */
  const hasPendingChanges = useCallback((): boolean => {
    return pendingEdits.size > 0;
  }, [pendingEdits]);

  /**
   * Update row status (pending, saving, saved, error)
   */
  const updateRowStatus = useCallback(
    (rowId: string, status: RowEditState["status"], error?: string) => {
      setPendingEdits((prev) => {
        const newMap = new Map(prev);
        const existingEdit = newMap.get(rowId);
        if (existingEdit) {
          newMap.set(rowId, {
            ...existingEdit,
            status,
            error,
          });
        }
        return newMap;
      });
    },
    []
  );

  /**
   * Validate a specific row's pending changes
   */
  const validateRow = useCallback(
    (rowId: string, currentData: EntityRowResponse): ValidationResult => {
      const errors: ValidationError[] = [];
      const edit = pendingEdits.get(rowId);

      if (!edit || !metadata) {
        return { valid: true, errors: [] };
      }

      // Merge current data with pending changes
      const mergedData: MetadataRecord = { ...currentData, ...edit.changes };

      // Validate each changed field
      Object.entries(edit.changes).forEach(([columnName, newValue]) => {
        const column = metadata.columns.find((col) => col.name === columnName);
        if (!column) return;

        // Required field validation
        if (column.required && (newValue === null || newValue === undefined || newValue === "")) {
          errors.push({
            field: columnName,
            message: `${column.label} is required`,
          });
          return;
        }

        // Skip further validation if empty and not required
        if (newValue === null || newValue === undefined || newValue === "") {
          return;
        }

        // Data type specific validation
        switch (column.dataType) {
          case "STRING": {
            const valueLength = String(newValue).length;
            if (column.maxLength && valueLength > column.maxLength) {
              errors.push({
                field: columnName,
                message: `${column.label} must be at most ${column.maxLength} characters`,
              });
            }
            break;
          }

          case "NUMBER": {
            const numericValue = typeof newValue === "number" ? newValue : Number(newValue);
            if (Number.isNaN(numericValue)) {
              errors.push({
                field: columnName,
                message: `${column.label} must be a valid number`,
              });
            }
            break;
          }

          case "ENUM": {
            if (column.enumValues && !column.enumValues.includes(String(newValue))) {
              errors.push({
                field: columnName,
                message: `${column.label} must be one of: ${column.enumValues.join(", ")}`,
              });
            }
            break;
          }

          default:
            break;
        }
      });

      // Check all required fields in merged data
      metadata.columns
        .filter((col) => col.required)
        .forEach((col) => {
          if (
            mergedData[col.name] === null ||
            mergedData[col.name] === undefined ||
            mergedData[col.name] === ""
          ) {
            if (!errors.some((e) => e.field === col.name)) {
              errors.push({
                field: col.name,
                message: `${col.label} is required`,
              });
            }
          }
        });

      return {
        valid: errors.length === 0,
        errors,
      };
    },
    [pendingEdits, metadata]
  );

  /**
   * Validate all pending changes
   */
  const validateAllRows = useCallback(
    (rows: EntityRowResponse[]): Map<string, ValidationResult> => {
      const results = new Map<string, ValidationResult>();
      
      rows.forEach((row) => {
        if (hasRowChanges(row.id)) {
          const validation = validateRow(row.id, row);
          if (!validation.valid) {
            results.set(row.id, validation);
          }
        }
      });

      return results;
    },
    [hasRowChanges, validateRow]
  );

  /**
   * Get edit state for a specific row
   */
  const getRowEditState = useCallback(
    (rowId: string): RowEditState | null => {
      return pendingEdits.get(rowId) || null;
    },
    [pendingEdits]
  );

  return {
    pendingEdits,
    setPendingEdit,
    clearRowEdits,
    clearAllEdits,
    getRowEdits,
    getAllPendingRows,
    hasRowChanges,
    hasPendingChanges,
    updateRowStatus,
    validateRow,
    validateAllRows,
    getRowEditState,
  };
}

