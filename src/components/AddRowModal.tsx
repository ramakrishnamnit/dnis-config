/**
 * Modal for adding a new row with dynamic form based on metadata
 */

import { useState, useEffect } from "react";
import { Plus, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import type { ColumnMetadata, EntityMetadata, MetadataRecord, MetadataValue } from "@/types/metadata";
import { cn } from "@/lib/utils";

interface AddRowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metadata: EntityMetadata | null;
  onSubmit: (data: MetadataRecord, editReason: string) => Promise<void>;
  isLoading?: boolean;
}

interface FieldError {
  field: string;
  message: string;
}

export const AddRowModal = ({
  open,
  onOpenChange,
  metadata,
  onSubmit,
  isLoading = false,
}: AddRowModalProps) => {
  const [formData, setFormData] = useState<MetadataRecord>({});
  const [editReason, setEditReason] = useState("");
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open && metadata) {
      const initialData: MetadataRecord = {};
      metadata.columns.forEach((col) => {
        if (col.defaultValue !== undefined) {
          initialData[col.name] = col.defaultValue;
        } else if (col.dataType === "BOOLEAN") {
          initialData[col.name] = false;
        } else if (col.dataType === "NUMBER") {
          initialData[col.name] = "";
        } else {
          initialData[col.name] = "";
        }
      });
      setFormData(initialData);
      setEditReason("");
      setErrors([]);
      setTouched(new Set());
    }
  }, [open, metadata]);

  const validateField = (fieldName: string, value: MetadataValue | undefined): string | null => {
    if (!metadata) return null;
    
    const column = metadata.columns.find((col) => col.name === fieldName);
    if (!column) return null;

    // Required field validation
    if (column.required && (value === null || value === undefined || value === "")) {
      return `${column.label} is required`;
    }

    // Skip further validation if empty and not required
    if (value === null || value === undefined || value === "") {
      return null;
    }

    // Data type specific validation
    switch (column.dataType) {
      case "STRING":
        if (column.maxLength && String(value).length > column.maxLength) {
          return `Maximum length is ${column.maxLength} characters`;
        }
        break;

      case "NUMBER":
        if (isNaN(Number(value))) {
          return "Must be a valid number";
        }
        break;

      case "ENUM":
        if (column.enumValues && !column.enumValues.includes(String(value))) {
          return `Must be one of: ${column.enumValues.join(", ")}`;
        }
        break;
    }

    return null;
  };

  const validateForm = (): boolean => {
    if (!metadata) return false;

    const newErrors: FieldError[] = [];

    // Validate all editable or required fields
    metadata.columns
      .filter((col) => col.editable || col.required)
      .forEach((col) => {
        const error = validateField(col.name, formData[col.name]);
        if (error) {
          newErrors.push({ field: col.name, message: error });
        }
      });

    // Validate edit reason
    if (editReason.trim().length < 10) {
      newErrors.push({ field: "editReason", message: "Edit reason must be at least 10 characters" });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleFieldChange = (fieldName: string, value: MetadataValue | undefined) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setTouched((prev) => new Set(prev).add(fieldName));
    
    // Clear error for this field if it exists
    if (touched.has(fieldName)) {
      setErrors((prev) => prev.filter((e) => e.field !== fieldName));
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched((prev) => new Set(prev).add(fieldName));
    const error = validateField(fieldName, formData[fieldName]);
    if (error) {
      setErrors((prev) => [...prev.filter((e) => e.field !== fieldName), { field: fieldName, message: error }]);
    } else {
      setErrors((prev) => prev.filter((e) => e.field !== fieldName));
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        await onSubmit(formData, editReason.trim());
        onOpenChange(false);
      } catch (error) {
        // Error handling done by parent component
      }
    }
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return errors.find((e) => e.field === fieldName)?.message;
  };

  const renderField = (column: ColumnMetadata) => {
    const fieldValue = formData[column.name];
    const fieldError = getFieldError(column.name);
    const showError = touched.has(column.name) && fieldError;

    switch (column.dataType) {
      case "BOOLEAN":
        return (
          <div className="flex items-center justify-between space-x-2 p-3 glass rounded-lg border border-border">
            <div className="flex-1">
              <Label htmlFor={column.name} className="text-foreground">
                {column.label}
                {column.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              <p className="text-xs text-muted-foreground mt-1">Boolean value</p>
            </div>
            <Switch
              id={column.name}
              checked={Boolean(fieldValue)}
              onCheckedChange={(checked) => handleFieldChange(column.name, checked)}
              disabled={isLoading}
            />
          </div>
        );

      case "ENUM":
        return (
          <div className="space-y-2">
            <Label htmlFor={column.name} className="text-foreground">
              {column.label}
              {column.required && <span className="text-destructive ml-1">*</span>}
              <Badge variant="outline" className="ml-2 text-xs">ENUM</Badge>
            </Label>
            <Select
              value={typeof fieldValue === "string" ? fieldValue : ""}
              onValueChange={(value) => handleFieldChange(column.name, value)}
              disabled={isLoading}
            >
              <SelectTrigger
                id={column.name}
                className={cn(
                  "glass border-border focus:border-primary",
                  showError && "border-destructive"
                )}
              >
                <SelectValue placeholder={`Select ${column.label}`} />
              </SelectTrigger>
              <SelectContent className="glass border-border">
                {column.enumValues?.map((option: string) => (
                  <SelectItem key={option} value={option} className="hover:bg-card-hover">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showError && <p className="text-xs text-destructive">{fieldError}</p>}
          </div>
        );

      case "NUMBER":
        return (
          <div className="space-y-2">
            <Label htmlFor={column.name} className="text-foreground">
              {column.label}
              {column.required && <span className="text-destructive ml-1">*</span>}
              <Badge variant="outline" className="ml-2 text-xs">NUMBER</Badge>
            </Label>
            <Input
              id={column.name}
              type="number"
              value={
                typeof fieldValue === "number" || typeof fieldValue === "string"
                  ? fieldValue
                  : ""
              }
              onChange={(e) => handleFieldChange(column.name, e.target.value)}
              onBlur={() => handleBlur(column.name)}
              placeholder={`Enter ${column.label}`}
              className={cn(
                "glass border-border focus:border-primary focus:glow-red",
                showError && "border-destructive"
              )}
              disabled={isLoading}
            />
            {showError && <p className="text-xs text-destructive">{fieldError}</p>}
          </div>
        );

      case "DATE":
        return (
          <div className="space-y-2">
            <Label htmlFor={column.name} className="text-foreground">
              {column.label}
              {column.required && <span className="text-destructive ml-1">*</span>}
              <Badge variant="outline" className="ml-2 text-xs">DATE</Badge>
            </Label>
            <DatePicker
              date={typeof fieldValue === "string" ? fieldValue : undefined}
              onDateChange={(date) => {
                handleFieldChange(column.name, date ? date.toISOString() : "");
                handleBlur(column.name);
              }}
              disabled={isLoading}
              className={cn(showError && "border-destructive")}
              placeholder={`Select ${column.label}`}
            />
            {showError && <p className="text-xs text-destructive">{fieldError}</p>}
          </div>
        );

      default: // STRING
        return (
          <div className="space-y-2">
            <Label htmlFor={column.name} className="text-foreground">
              {column.label}
              {column.required && <span className="text-destructive ml-1">*</span>}
              {column.maxLength && (
                <span className="text-xs text-muted-foreground ml-2">
                  (max {column.maxLength} chars)
                </span>
              )}
            </Label>
            <Input
              id={column.name}
              type="text"
              value={typeof fieldValue === "string" ? fieldValue : ""}
              onChange={(e) => handleFieldChange(column.name, e.target.value)}
              onBlur={() => handleBlur(column.name)}
              placeholder={`Enter ${column.label}`}
              maxLength={column.maxLength}
              className={cn(
                "glass border-border focus:border-primary focus:glow-red",
                showError && "border-destructive"
              )}
              disabled={isLoading}
            />
            {showError && <p className="text-xs text-destructive">{fieldError}</p>}
          </div>
        );
    }
  };

  if (!metadata) return null;

  const editableColumns = metadata.columns.filter((col) => col.editable || col.required);
  const editReasonError = getFieldError("editReason");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Plus className="w-5 h-5 text-primary" />
            Add New {metadata.entityName} Record
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the required fields to add a new record. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4 py-4">
            {editableColumns.map((column) => (
              <div key={column.name}>{renderField(column)}</div>
            ))}

            <div className="space-y-2 pt-4 border-t border-border">
              <Label htmlFor="editReason" className="text-foreground">
                Edit Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="editReason"
                value={editReason}
                onChange={(e) => {
                  setEditReason(e.target.value);
                  setTouched((prev) => new Set(prev).add("editReason"));
                }}
                placeholder="Provide a reason for adding this record (minimum 10 characters)..."
                className={cn(
                  "glass border-border focus:border-primary focus:glow-red min-h-[80px] resize-none",
                  touched.has("editReason") && editReasonError && "border-destructive"
                )}
                maxLength={500}
                disabled={isLoading}
              />
              {touched.has("editReason") && editReasonError && (
                <p className="text-xs text-destructive">{editReasonError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {editReason.length} / 500 characters
              </p>
            </div>

            {errors.length > 0 && (
              <Alert variant="destructive" className="glass border-destructive/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please fix the following errors before submitting:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {errors.map((error, idx) => (
                      <li key={idx} className="text-xs">
                        {error.message}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="glass-hover border-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

