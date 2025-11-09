/**
 * Inline editable cell component with validation
 */

import { useState, useEffect } from "react";
import { Check, X, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DatePicker } from "@/components/ui/date-picker";
import { ColumnMetadata, MetadataValue } from "@/types/metadata";
import { cn } from "@/lib/utils";

interface InlineEditCellProps {
  value: MetadataValue | undefined;
  column: ColumnMetadata;
  onSave: (newValue: MetadataValue | undefined) => void;
  onCancel: () => void;
}

export const InlineEditCell = ({ value, column, onSave, onCancel }: InlineEditCellProps) => {
  const [editValue, setEditValue] = useState<MetadataValue | undefined>(value);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const validate = (val: MetadataValue | undefined): boolean => {
    setError(null);

    if (column.required && (val === null || val === undefined || val === "")) {
      setError("This field is required");
      return false;
    }

  if (column.dataType === "STRING" && typeof val === "string" && column.maxLength && val.length > column.maxLength) {
      setError(`Maximum length is ${column.maxLength} characters`);
      return false;
    }

  if (column.dataType === "NUMBER" && (typeof val !== "number" && isNaN(Number(val)))) {
      setError("Please enter a valid number");
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (validate(editValue)) {
      onSave(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const renderInput = () => {
    switch (column.dataType) {
      case "BOOLEAN":
        return (
          <div className="flex items-center gap-2 px-3 py-2">
            <Switch
              checked={editValue === true}
              onCheckedChange={(checked) => setEditValue(checked)}
              className="data-[state=checked]:bg-primary"
            />
            <span className="text-sm text-foreground">{editValue === true ? "Yes" : "No"}</span>
          </div>
        );

      case "ENUM":
        return (
          <Select value={typeof editValue === "string" ? editValue : ""} onValueChange={setEditValue}>
            <SelectTrigger className="glass border-primary focus:ring-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass border-border">
              {column.enumValues?.map((option) => (
                <SelectItem key={option} value={option} className="hover:bg-card-hover">
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
            value={editValue ?? ""}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "glass border-primary focus:ring-primary focus:glow-red",
              error && "border-destructive focus:ring-destructive"
            )}
            autoFocus
          />
        );

      case "DATE":
        return (
          <DatePicker
            date={typeof editValue === "string" ? editValue : undefined}
            onDateChange={(date) => setEditValue(date ? date.toISOString() : "")}
            className={cn(
              "border-primary focus:ring-primary focus:glow-red",
              error && "border-destructive focus:ring-destructive"
            )}
          />
        );

      default:
        return (
          <Input
            type="text"
            value={typeof editValue === "string" ? editValue : ""}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={column.maxLength}
            className={cn(
              "glass border-primary focus:ring-primary focus:glow-red",
              error && "border-destructive focus:ring-destructive"
            )}
            autoFocus
          />
        );
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1">
        {renderInput()}
        {error && (
          <TooltipProvider>
            <Tooltip open={true}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  <span>{error}</span>
                </div>
              </TooltipTrigger>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button
          onClick={handleSave}
          size="icon"
          variant="ghost"
          className="h-8 w-8 hover:bg-status-success/20 hover:text-status-success"
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          onClick={onCancel}
          size="icon"
          variant="ghost"
          className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
