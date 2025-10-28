import { Eye, X, Edit, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import type { ColumnConfig, DynamicRecord } from "@/types/table";

interface RecordViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: DynamicRecord | null;
  columns: ColumnConfig[];
  tableName: string;
  onEditClick?: () => void;
}

export const RecordViewModal = ({
  open,
  onOpenChange,
  record,
  columns,
  tableName,
  onEditClick,
}: RecordViewModalProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!record) return null;

  const copyToClipboard = async (columnKey: string, value: any) => {
    try {
      await navigator.clipboard.writeText(String(value || ""));
      setCopiedField(columnKey);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatValue = (value: any, type: ColumnConfig["type"]) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-muted-foreground italic">Not set</span>;
    }

    switch (type) {
      case "boolean":
        return (
          <Badge variant={value ? "default" : "outline"}>
            {value ? "Yes" : "No"}
          </Badge>
        );
      case "date":
        return new Date(value).toLocaleString();
      default:
        return String(value);
    }
  };

  const hasEditableFields = columns.some(col => col.isEditable);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                View Record - {tableName}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                Complete details of the selected record
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6">
          <div className="space-y-1 py-4">
            {columns.map((column) => {
              const value = record[column.key];
              const isCopied = copiedField === column.key;

              return (
                <div
                  key={column.key}
                  className="group hover:bg-card-hover rounded-lg p-4 transition-colors border border-transparent hover:border-border"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-sm font-medium text-foreground">
                          {column.label}
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {column.type}
                        </Badge>
                        {!column.isEditable && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            Read-only
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-foreground break-words">
                        {formatValue(value, column.type)}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(column.key, value)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy to clipboard"
                    >
                      {isCopied ? (
                        <CheckCircle2 className="w-4 h-4 text-status-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t border-border flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="glass-hover border-border"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          {hasEditableFields && onEditClick && (
            <Button
              onClick={onEditClick}
              className="bg-primary hover:bg-primary/90"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Record
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

