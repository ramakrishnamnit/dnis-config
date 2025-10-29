/**
 * Dynamic editable table component with AG-Grid-like features
 * Supports inline editing, row updates, batch updates, pagination, and filtering
 */

import { useState, useMemo, useCallback } from "react";
import { Edit2, Save, X, AlertCircle, Loader2, Check, Trash2, MoreVertical, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DatePicker } from "@/components/ui/date-picker";
import type { EntityMetadata } from "@/types/metadata";
import type { EntityRowResponse } from "@/types/api";
import type { ValidationResult } from "@/types/editState";
import { cn } from "@/lib/utils";

interface DynamicEditableTableProps {
  metadata: EntityMetadata;
  rows: EntityRowResponse[];
  isLoading?: boolean;
  pendingEdits: Map<string, { changes: Record<string, any>; status: string }>;
  onCellEdit: (rowId: string, columnName: string, newValue: any, version: number) => void;
  onRowUpdate: (rowId: string) => void;
  hasRowChanges: (rowId: string) => boolean;
  getRowEdits: (rowId: string) => Record<string, any> | null;
  validateRow: (rowId: string, row: EntityRowResponse) => ValidationResult;
  columnFilters?: Record<string, string>;
  onFilterChange?: (columnName: string, value: string) => void;
}

type SortDirection = "asc" | "desc" | null;

export const DynamicEditableTable = ({
  metadata,
  rows,
  isLoading,
  pendingEdits,
  onCellEdit,
  onRowUpdate,
  hasRowChanges,
  getRowEdits,
  validateRow,
  columnFilters,
  onFilterChange,
}: DynamicEditableTableProps) => {
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnName: string } | null>(null);
  const [editValue, setEditValue] = useState<any>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Start editing a cell
  const handleStartEdit = useCallback((rowId: string, columnName: string, currentValue: any) => {
    setEditingCell({ rowId, columnName });
    setEditValue(currentValue);
  }, []);

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue(null);
  }, []);

  // Save cell edit
  const handleSaveEdit = useCallback((rowId: string, columnName: string, version: number) => {
    if (editingCell && editingCell.rowId === rowId && editingCell.columnName === columnName) {
      onCellEdit(rowId, columnName, editValue, version);
      setEditingCell(null);
      setEditValue(null);
    }
  }, [editingCell, editValue, onCellEdit]);

  // Handle key down in edit mode
  const handleKeyDown = useCallback((e: React.KeyboardEvent, rowId: string, columnName: string, version: number) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit(rowId, columnName, version);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);

  // Format cell value for display
  const formatCellValue = useCallback((value: any, dataType: string) => {
    if (value === null || value === undefined) return "-";
    
    switch (dataType) {
      case "BOOLEAN":
        return value ? "Yes" : "No";
      case "DATE":
        return new Date(value).toLocaleDateString();
      case "NUMBER":
        return typeof value === "number" ? value.toLocaleString() : value;
      default:
        return String(value);
    }
  }, []);

  // Render edit input based on data type
  const renderEditInput = useCallback((column: any, value: any, onChange: (val: any) => void, onKeyDown: (e: React.KeyboardEvent) => void) => {
    switch (column.dataType) {
      case "BOOLEAN":
        return (
          <div className="flex items-center gap-2 px-2">
            <Switch
              checked={value}
              onCheckedChange={onChange}
              className="data-[state=checked]:bg-primary"
            />
            <span className="text-xs">{value ? "Yes" : "No"}</span>
          </div>
        );

      case "ENUM":
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-8 glass border-primary focus:ring-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass border-border">
              {column.enumValues?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "NUMBER":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            className="h-8 glass border-primary focus:ring-primary focus:glow-red"
            autoFocus
          />
        );

      case "DATE":
        return (
          <DatePicker
            date={value}
            onDateChange={(date) => onChange(date ? date.toISOString() : "")}
            className="h-8 border-primary focus:ring-primary focus:glow-red"
          />
        );

      default: // STRING
        return (
          <Input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            maxLength={column.maxLength}
            className="h-8 glass border-primary focus:ring-primary focus:glow-red"
            autoFocus
          />
        );
    }
  }, []);

  // Handle column sorting
  const handleSort = useCallback((columnName: string) => {
    if (sortColumn === columnName) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnName);
      setSortDirection("asc");
    }
  }, [sortColumn, sortDirection]);

  // Sort rows based on current sort state
  const sortedRows = useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return rows;
    }

    return [...rows].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === "asc" ? 1 : -1;
      if (bValue == null) return sortDirection === "asc" ? -1 : 1;

      // Compare based on type
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      // String comparison (case-insensitive)
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
      if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortColumn, sortDirection]);

  // Render table cell content
  const renderCellContent = useCallback((row: EntityRowResponse, column: any) => {
    const isEditing = editingCell?.rowId === row.id && editingCell?.columnName === column.name;
    const edits = getRowEdits(row.id);
    const currentValue = edits?.[column.name] !== undefined ? edits[column.name] : row[column.name];
    const isEdited = edits && column.name in edits;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <div className="flex-1">
            {renderEditInput(
              column,
              editValue,
              setEditValue,
              (e) => handleKeyDown(e, row.id, column.name, row.version)
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleSaveEdit(row.id, column.name, row.version)}
            className="h-7 w-7 hover:bg-status-success/20 hover:text-status-success"
          >
            <Check className="w-3 h-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCancelEdit}
            className="h-7 w-7 hover:bg-destructive/20 hover:text-destructive"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between group">
        <span className={cn(
          "truncate",
          !column.editable && "text-muted-foreground",
          isEdited && "text-primary font-medium"
        )}>
          {formatCellValue(currentValue, column.dataType)}
        </span>
        {column.editable && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleStartEdit(row.id, column.name, currentValue)}
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card-hover"
          >
            <Edit2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }, [editingCell, editValue, getRowEdits, formatCellValue, renderEditInput, handleKeyDown, handleSaveEdit, handleCancelEdit, handleStartEdit]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl border border-border overflow-hidden h-full flex flex-col">
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
            <TableRow className="border-border">
              {metadata.columns.map((column) => {
                // Identify primary key: first column that is non-editable and required
                const isPrimaryKey = !column.editable && column.required && 
                  metadata.columns.findIndex(col => !col.editable && col.required) === 
                  metadata.columns.findIndex(col => col.name === column.name);
                
                const isSorted = sortColumn === column.name;
                
                return (
                  <TableHead 
                    key={column.name} 
                    className={cn(
                      "font-bold cursor-pointer hover:bg-primary/20 transition-colors",
                      !isPrimaryKey && "bg-primary/10 border-x border-primary/20"
                    )}
                    onClick={() => handleSort(column.name)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{column.label}</span>
                      {column.required && <span className="text-destructive">*</span>}
                      <div className="ml-auto">
                        {isSorted ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="w-4 h-4 text-primary" />
                          ) : (
                            <ArrowDown className="w-4 h-4 text-primary" />
                          )
                        ) : (
                          <ArrowUpDown className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </div>
                  </TableHead>
                );
              })}
              <TableHead className="font-bold w-32">
                <div className="font-bold text-foreground">Version</div>
              </TableHead>
              <TableHead className="font-bold w-40 text-right">
                <div className="font-bold text-foreground">Actions</div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={metadata.columns.length + 2} className="text-center py-12 text-muted-foreground">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.map((row) => {
                const rowHasChanges = hasRowChanges(row.id);
                const editState = pendingEdits.get(row.id);
                const validation = rowHasChanges ? validateRow(row.id, row) : { valid: true, errors: [] };
                
                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "border-border hover:bg-card-hover transition-colors",
                      rowHasChanges && "bg-primary/5",
                      editState?.status === "saving" && "opacity-50"
                    )}
                  >
                    {metadata.columns.map((column) => (
                      <TableCell
                        key={`${row.id}-${column.name}`}
                        className={cn(
                          "text-foreground",
                          column.editable && "cursor-pointer"
                        )}
                        onDoubleClick={() => {
                          if (column.editable) {
                            const edits = getRowEdits(row.id);
                            const currentValue = edits?.[column.name] !== undefined ? edits[column.name] : row[column.name];
                            handleStartEdit(row.id, column.name, currentValue);
                          }
                        }}
                      >
                        {renderCellContent(row, column)}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        v{row.version}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {rowHasChanges && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="relative">
                                  <Button
                                    size="sm"
                                    onClick={() => onRowUpdate(row.id)}
                                    disabled={!validation.valid || editState?.status === "saving"}
                                    className={cn(
                                      "h-7 px-2 text-xs transition-all duration-300",
                                      validation.valid
                                        ? "shadow-md hover:shadow-lg hover:glow-subtle hover:-translate-y-0.5 bg-primary hover:bg-primary/90 text-primary-foreground"
                                        : "glass-hover border-destructive text-destructive"
                                    )}
                                  >
                                    {editState?.status === "saving" ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <>
                                        <Save className="w-3 h-3 mr-1" />
                                        Save
                                      </>
                                    )}
                                  </Button>
                                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
                                </div>
                              </TooltipTrigger>
                              {!validation.valid && (
                                <TooltipContent className="glass border-destructive/50">
                                  <div className="space-y-1">
                                    <p className="font-semibold text-xs">Validation Errors:</p>
                                    {validation.errors.map((error, idx) => (
                                      <p key={idx} className="text-xs">• {error.message}</p>
                                    ))}
                                  </div>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {metadata.permissions.canDelete && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="glass-hover h-7 w-7 p-0"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass border-border">
                              <DropdownMenuItem className="cursor-pointer hover:bg-destructive/10 text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

