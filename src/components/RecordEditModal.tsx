import { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ColumnConfig, DynamicRecord } from "@/types/table";

interface RecordEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: DynamicRecord | null;
  columns: ColumnConfig[];
  onSave: (updatedRecord: DynamicRecord) => Promise<void>;
  tableName: string;
}

export const RecordEditModal = ({
  open,
  onOpenChange,
  record,
  columns,
  onSave,
  tableName,
}: RecordEditModalProps) => {
  const [editedRecord, setEditedRecord] = useState<DynamicRecord>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Initialize form with record data
  useEffect(() => {
    if (record) {
      setEditedRecord({ ...record });
      setErrors({});
      setSaveError(null);
    }
  }, [record]);

  const handleFieldChange = (columnKey: string, value: any) => {
    setEditedRecord((prev) => ({
      ...prev,
      [columnKey]: value,
    }));
    
    // Clear error for this field
    if (errors[columnKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[columnKey];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    columns.forEach((column) => {
      if (column.isEditable && column.type !== "boolean") {
        const value = editedRecord[column.key];
        
        // Check if required field is empty
        if (!value || String(value).trim() === "") {
          newErrors[column.key] = `${column.label} is required`;
        }
        
        // Type-specific validation
        if (value && column.type === "number" && isNaN(Number(value))) {
          newErrors[column.key] = `${column.label} must be a number`;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await onSave(editedRecord);
      onOpenChange(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedRecord({});
    setErrors({});
    setSaveError(null);
    onOpenChange(false);
  };

  const renderField = (column: ColumnConfig) => {
    const value = editedRecord[column.key];
    const hasError = !!errors[column.key];

    // Non-editable fields - display only
    if (!column.isEditable) {
      return (
        <div key={column.key} className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            {column.label}
            <Badge variant="outline" className="ml-2 text-xs">Read-only</Badge>
          </Label>
          <div className="glass rounded-lg px-3 py-2 border border-border bg-muted/30">
            <span className="text-sm text-foreground">
              {column.type === "boolean" 
                ? (value ? "Yes" : "No")
                : value || "-"}
            </span>
          </div>
        </div>
      );
    }

    // Editable fields
    switch (column.type) {
      case "boolean":
        return (
          <div key={column.key} className="flex items-center justify-between space-x-2 p-4 glass rounded-lg border border-border">
            <Label htmlFor={column.key} className="text-sm font-medium cursor-pointer">
              {column.label}
            </Label>
            <Switch
              id={column.key}
              checked={!!value}
              onCheckedChange={(checked) => handleFieldChange(column.key, checked)}
              disabled={isSaving}
            />
          </div>
        );

      case "string":
        // Use textarea for longer text fields (value, description, etc.)
        if (column.key.toLowerCase().includes("value") || 
            column.key.toLowerCase().includes("description") ||
            column.key.toLowerCase().includes("comment")) {
          return (
            <div key={column.key} className="space-y-2">
              <Label htmlFor={column.key} className="text-sm font-medium">
                {column.label}
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Textarea
                id={column.key}
                value={value || ""}
                onChange={(e) => handleFieldChange(column.key, e.target.value)}
                disabled={isSaving}
                className={`glass border-border focus:border-primary min-h-[100px] ${
                  hasError ? "border-destructive focus:border-destructive" : ""
                }`}
                placeholder={`Enter ${column.label.toLowerCase()}...`}
              />
              {hasError && (
                <p className="text-xs text-destructive">{errors[column.key]}</p>
              )}
            </div>
          );
        }
        
        // Regular input for shorter text
        return (
          <div key={column.key} className="space-y-2">
            <Label htmlFor={column.key} className="text-sm font-medium">
              {column.label}
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id={column.key}
              value={value || ""}
              onChange={(e) => handleFieldChange(column.key, e.target.value)}
              disabled={isSaving}
              className={`glass border-border focus:border-primary ${
                hasError ? "border-destructive focus:border-destructive" : ""
              }`}
              placeholder={`Enter ${column.label.toLowerCase()}...`}
            />
            {hasError && (
              <p className="text-xs text-destructive">{errors[column.key]}</p>
            )}
          </div>
        );

      case "number":
        return (
          <div key={column.key} className="space-y-2">
            <Label htmlFor={column.key} className="text-sm font-medium">
              {column.label}
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id={column.key}
              type="number"
              value={value || ""}
              onChange={(e) => handleFieldChange(column.key, e.target.value)}
              disabled={isSaving}
              className={`glass border-border focus:border-primary ${
                hasError ? "border-destructive focus:border-destructive" : ""
              }`}
              placeholder={`Enter ${column.label.toLowerCase()}...`}
            />
            {hasError && (
              <p className="text-xs text-destructive">{errors[column.key]}</p>
            )}
          </div>
        );

      case "date":
        return (
          <div key={column.key} className="space-y-2">
            <Label htmlFor={column.key} className="text-sm font-medium">
              {column.label}
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id={column.key}
              type="datetime-local"
              value={value || ""}
              onChange={(e) => handleFieldChange(column.key, e.target.value)}
              disabled={isSaving}
              className={`glass border-border focus:border-primary ${
                hasError ? "border-destructive focus:border-destructive" : ""
              }`}
            />
            {hasError && (
              <p className="text-xs text-destructive">{errors[column.key]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const editableColumns = columns.filter(col => col.isEditable);
  const readOnlyColumns = columns.filter(col => !col.isEditable);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl font-semibold text-foreground">
            Edit Record - {tableName}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Modify the editable fields below. Fields marked as read-only cannot be changed.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6">
          <div className="space-y-6 py-4">
            {saveError && (
              <Alert variant="destructive" className="border-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            )}

            {/* Read-only fields section */}
            {readOnlyColumns.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Record Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {readOnlyColumns.map(renderField)}
                </div>
              </div>
            )}

            {/* Editable fields section */}
            {editableColumns.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
                  Editable Fields
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {editableColumns.map(renderField)}
                </div>
              </div>
            )}

            {editableColumns.length === 0 && (
              <Alert className="border-muted">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This record has no editable fields.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t border-border flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="glass-hover border-border"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || editableColumns.length === 0}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

