/**
 * Excel file parsing and validation utilities
 */

import * as XLSX from "xlsx";
import type { EntityMetadata, MetadataRecord, MetadataValue } from "@/types/metadata";
import type { ColumnMetadataResponse } from "@/types/api";

export interface ParsedRow {
  rowIndex: number;
  data: MetadataRecord;
  raw: unknown[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  rowIndex: number;
  valid: boolean;
  errors: ValidationError[];
  data: MetadataRecord;
}

/**
 * Parse Excel file and extract data rows
 */
export async function parseExcelFile(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON (array of arrays)
        const jsonData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });
        
        if (jsonData.length < 4) {
          reject(new Error("Invalid template format. Expected at least 4 rows (headers + data types + validation + data)."));
          return;
        }

        // Extract headers (row 0), removing asterisks for required fields
        const headers = (jsonData[0] ?? []).map((h) =>
          String(h ?? "").replace(/\s*\*\s*$/, "").trim()
        );
        
        // Parse data rows (starting from row 3, after headers, types, and validation)
        const parsedRows: ParsedRow[] = [];
        
        for (let i = 3; i < jsonData.length; i++) {
          const row = jsonData[i];
          
          // Skip empty rows
          if (!row || row.every((cell) => cell === undefined || cell === null || cell === "")) {
            continue;
          }
          
          // Create data object
          const rowData: MetadataRecord = {};
          headers.forEach((header, index) => {
            if (header) {
              rowData[header] = row[index] as MetadataValue | undefined;
            }
          });
          
          parsedRows.push({
            rowIndex: i + 1, // 1-indexed for user display
            data: rowData,
            raw: row,
          });
        }
        
        resolve(parsedRows);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : "Unknown error"}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Validate parsed rows against metadata
 */
export function validateRows(
  rows: ParsedRow[],
  metadata: EntityMetadata
): ValidationResult[] {
  // Create lookup map for columns by label
  const columnsByLabel = new Map<string, ColumnMetadataResponse>();
  metadata.columns.forEach((col) => {
    columnsByLabel.set(col.label, col);
  });

  return rows.map((row) => {
    const errors: ValidationError[] = [];
    const validatedData: MetadataRecord = {};

    // Validate each field
    Object.entries(row.data).forEach(([label, value]) => {
      const column = columnsByLabel.get(label);
      
      if (!column) {
        errors.push({
          field: label,
          message: `Unknown column: ${label}`,
        });
        return;
      }

      // Store by column name (not label)
      const fieldName = column.name;
      
      // Check required fields
      if (column.required && (value === undefined || value === null || value === "")) {
        errors.push({
          field: label,
          message: "This field is required",
        });
        validatedData[fieldName] = value as MetadataValue | undefined;
        return;
      }

      // Skip validation if empty and not required
      if (value === undefined || value === null || value === "") {
        validatedData[fieldName] = column.dataType === "NUMBER" ? null : "";
        return;
      }

      // Validate data types
      switch (column.dataType) {
        case "STRING": {
          const strValue = String(value);
          if (column.maxLength && strValue.length > column.maxLength) {
            errors.push({
              field: label,
              message: `Maximum length is ${column.maxLength} characters`,
            });
          }
          validatedData[fieldName] = strValue;
          break;
        }

        case "NUMBER": {
          const numValue = Number(value);
          if (Number.isNaN(numValue)) {
            errors.push({
              field: label,
              message: "Must be a valid number",
            });
          } else {
            validatedData[fieldName] = numValue;
          }
          break;
        }

        case "BOOLEAN": {
          const boolValue = String(value).toUpperCase();
          if (!["TRUE", "FALSE", "YES", "NO", "1", "0"].includes(boolValue)) {
            errors.push({
              field: label,
              message: "Must be TRUE/FALSE, YES/NO, or 1/0",
            });
          } else {
            validatedData[fieldName] = ["TRUE", "YES", "1"].includes(boolValue);
          }
          break;
        }

        case "ENUM": {
          const enumValue = String(value);
          if (column.enumValues && !column.enumValues.includes(enumValue)) {
            errors.push({
              field: label,
              message: `Must be one of: ${column.enumValues.join(", ")}`,
            });
          } else {
            validatedData[fieldName] = enumValue;
          }
          break;
        }

        case "DATE": {
          // Try to parse date
          const dateValue = new Date(value as string);
          if (Number.isNaN(dateValue.getTime())) {
            errors.push({
              field: label,
              message: "Must be a valid date (YYYY-MM-DD)",
            });
          } else {
            validatedData[fieldName] = dateValue.toISOString().split("T")[0];
          }
          break;
        }

        default:
          validatedData[fieldName] = value as MetadataValue;
      }
    });

    // Check for missing required fields
    metadata.columns
      .filter((col) => col.required)
      .forEach((col) => {
        if (!(col.label in row.data)) {
          errors.push({
            field: col.label,
            message: "Required field is missing",
          });
        }
      });

    return {
      rowIndex: row.rowIndex,
      valid: errors.length === 0,
      errors,
      data: validatedData,
    };
  });
}

/**
 * Generate error report as Excel file
 */
export function generateErrorReport(
  results: ValidationResult[],
  entityName: string
): Blob {
  const failedRows = results.filter((r) => !r.valid);
  
  const worksheetData: Array<Array<string | number>> = [];
  
  // Headers
  worksheetData.push(["Row Number", "Field", "Error Message", "Data"]);
  
  // Add error rows
  failedRows.forEach((result) => {
    result.errors.forEach((error) => {
      worksheetData.push([
        result.rowIndex,
        error.field,
        error.message,
        JSON.stringify(result.data),
      ]);
    });
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Errors");
  
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

