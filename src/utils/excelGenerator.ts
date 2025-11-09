/**
 * Excel file generation utilities for bulk upload templates
 */

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { EntityMetadata } from "@/types/metadata";
import type { ColumnMetadataResponse } from "@/types/api";

interface TemplateColumn {
  name: string;
  label: string;
  dataType: string;
  required: boolean;
  maxLength?: number;
  enumValues?: string[];
}

/**
 * Generate Excel template for bulk upload based on metadata
 */
export function generateBulkUploadTemplate(
  metadata: EntityMetadata,
  entityName: string
): void {
  // Filter columns: include required and editable columns
  const templateColumns: TemplateColumn[] = metadata.columns
    .filter((col) => col.editable || col.required)
    .map((col) => ({
      name: col.name,
      label: col.label,
      dataType: col.dataType,
      required: col.required || false,
      maxLength: col.maxLength,
      enumValues: col.enumValues,
    }));

  // Create worksheet data
  const worksheetData: Array<Array<string | number>> = [];

  // Row 1: Column headers (labels)
  const headers = templateColumns.map((col) =>
    col.required ? `${col.label} *` : col.label
  );
  worksheetData.push(headers);

  // Row 2: Data type hints
  const dataTypes = templateColumns.map((col) => `[${col.dataType}]`);
  worksheetData.push(dataTypes);

  // Row 3: Validation rules
  const validationRules = templateColumns.map((col) => {
    const rules: string[] = [];
    if (col.required) rules.push("Required");
    if (col.maxLength) rules.push(`Max ${col.maxLength} chars`);
    if (col.enumValues) rules.push(`Options: ${col.enumValues.join(", ")}`);
    return rules.join(" | ") || "Any value";
  });
  worksheetData.push(validationRules);

  // Row 4-13: Empty data rows (10 example rows)
  for (let i = 0; i < 10; i++) {
    worksheetData.push(new Array(templateColumns.length).fill(""));
  }

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  const columnWidths = templateColumns.map((col) => ({
    wch: Math.max(col.label.length + 5, 15),
  }));
  worksheet["!cols"] = columnWidths;

  // Style header rows (rows 1-3)
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  
  // Apply styling to header rows
  for (let R = 0; R <= 2; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cellAddress]) continue;
      
      // Create cell object if it doesn't exist
      if (typeof worksheet[cellAddress] === "string") {
        worksheet[cellAddress] = { v: worksheet[cellAddress], t: "s" };
      }
      
      // Add styling
      worksheet[cellAddress].s = {
        font: {
          bold: R === 0,
          color: { rgb: R === 0 && templateColumns[C]?.required ? "DB0011" : "000000" },
        },
        fill: {
          fgColor: { rgb: R === 0 ? "F0F0F0" : R === 1 ? "E8F4F8" : "FFF9E6" },
        },
        alignment: {
          horizontal: "left",
          vertical: "center",
        },
      };
    }
  }

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Upload Template");

  // Add instructions sheet
  const instructionsData = [
    ["Bulk Upload Instructions"],
    [""],
    ["1. Fill in the data rows (starting from row 4)"],
    ["2. Required fields are marked with an asterisk (*)"],
    ["3. Follow the data type format shown in row 2"],
    ["4. Respect validation rules shown in row 3"],
    ["5. Do NOT modify the header rows (rows 1-3)"],
    ["6. Do NOT modify column order"],
    ["7. Save the file and upload it back to the system"],
    [""],
    ["Column Details:"],
    [""],
    ...templateColumns.map((col) => [
      col.label,
      col.dataType,
      col.required ? "Required" : "Optional",
      col.maxLength ? `Max ${col.maxLength} chars` : "",
      col.enumValues ? `Valid values: ${col.enumValues.join(", ")}` : "",
    ]),
  ];

  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
  instructionsSheet["!cols"] = [
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `${entityName.replace(/\s+/g, "_")}_BulkUpload_Template_${timestamp}.xlsx`;

  // Write and download the file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, filename);
}

/**
 * Generate a sample filled template for demonstration
 */
export function generateSampleTemplate(
  metadata: EntityMetadata,
  entityName: string
): void {
  const templateColumns: TemplateColumn[] = metadata.columns
    .filter((col) => col.editable || col.required)
    .map((col) => ({
      name: col.name,
      label: col.label,
      dataType: col.dataType,
      required: col.required || false,
      maxLength: col.maxLength,
      enumValues: col.enumValues,
    }));

  const worksheetData: Array<Array<string | number>> = [];

  // Headers
  const headers = templateColumns.map((col) =>
    col.required ? `${col.label} *` : col.label
  );
  worksheetData.push(headers);

  // Data types
  const dataTypes = templateColumns.map((col) => `[${col.dataType}]`);
  worksheetData.push(dataTypes);

  // Validation rules
  const validationRules = templateColumns.map((col) => {
    const rules: string[] = [];
    if (col.required) rules.push("Required");
    if (col.maxLength) rules.push(`Max ${col.maxLength} chars`);
    if (col.enumValues) rules.push(`Options: ${col.enumValues.join(", ")}`);
    return rules.join(" | ") || "Any value";
  });
  worksheetData.push(validationRules);

  // Add sample data rows
  for (let i = 0; i < 5; i++) {
    const row = templateColumns.map((col) => {
      switch (col.dataType) {
        case "STRING":
          return `Sample ${col.label} ${i + 1}`;
        case "NUMBER":
          return (i + 1) * 10;
        case "BOOLEAN":
          return i % 2 === 0 ? "TRUE" : "FALSE";
        case "ENUM":
          return col.enumValues?.[i % col.enumValues.length] || "";
        case "DATE":
          return new Date().toISOString().split("T")[0];
        default:
          return "";
      }
    });
    worksheetData.push(row);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sample Data");

  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `${entityName.replace(/\s+/g, "_")}_Sample_${timestamp}.xlsx`;

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, filename);
}

/**
 * Generate a simple Excel template with just column headers
 * Sheet name will be the table name, and it will contain all table columns
 */
export function generateSimpleTemplate(
  metadata: EntityMetadata,
  tableName: string
): void {
  // Include all columns from metadata
  const allColumns = metadata.columns.map((col) => ({
    name: col.name,
    label: col.label,
    dataType: col.dataType,
    required: col.required || false,
    maxLength: col.maxLength,
    enumValues: col.enumValues,
  }));

  const worksheetData: Array<Array<string | number>> = [];

  // Row 1: Column headers (just the labels, all columns)
  const headers = allColumns.map((col) => col.label);
  worksheetData.push(headers);

  // Add empty rows for users to fill in
  for (let i = 0; i < 50; i++) {
    worksheetData.push(new Array(allColumns.length).fill(""));
  }

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths based on header length
  const columnWidths = allColumns.map((col) => ({
    wch: Math.max(col.label.length + 3, 12),
  }));
  worksheet["!cols"] = columnWidths;

  // Style the header row
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!worksheet[cellAddress]) continue;

    // Create cell object if it doesn't exist
    if (typeof worksheet[cellAddress] === "string") {
      worksheet[cellAddress] = { v: worksheet[cellAddress], t: "s" };
    }

    // Add styling to header
    worksheet[cellAddress].s = {
      font: {
        bold: true,
        color: { rgb: "FFFFFF" },
      },
      fill: {
        fgColor: { rgb: "4472C4" }, // Blue background
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
    };
  }

  // Create workbook with sheet name as table name
  const workbook = XLSX.utils.book_new();
  // Clean the table name to be valid for Excel sheet name
  const invalidSheetChars = [":", "\\", "/", "?", "*", "[", "]"];
  const sheetName = invalidSheetChars.reduce(
    (name, char) => name.split(char).join("_"),
    tableName,
  ).substring(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `${tableName.replace(/\s+/g, "_")}_Template_${timestamp}.xlsx`;

  // Write and download the file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, filename);
}

