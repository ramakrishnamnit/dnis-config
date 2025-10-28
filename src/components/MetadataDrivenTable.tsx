/**
 * Metadata-driven dynamic table component with inline editing
 */

import { useState, useEffect } from "react";
import { Edit2, Trash2, MoreHorizontal, Upload, Plus, History, Loader2, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InlineEditCell } from "./InlineEditCell";
import { OCCConflictModal } from "./OCCConflictModal";
import { EntityMetadata, EntityRow, OCCConflict } from "@/types/metadata";
import { MetadataApiService } from "@/services/mockMetadataApi";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { generateSimpleTemplate } from "@/utils/excelGenerator";

interface MetadataDrivenTableProps {
  entityId: string;
  country: string;
  businessUnit: string;
  onViewAudit?: () => void;
}

export const MetadataDrivenTable = ({
  entityId,
  country,
  businessUnit,
  onViewAudit,
}: MetadataDrivenTableProps) => {
  const [metadata, setMetadata] = useState<EntityMetadata | null>(null);
  const [rows, setRows] = useState<EntityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnName: string } | null>(null);
  const [occConflict, setOccConflict] = useState<OCCConflict | null>(null);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [entityId, country, businessUnit]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [metadataRes, dataRes] = await Promise.all([
        MetadataApiService.getEntityMetadata(entityId, country, businessUnit),
        MetadataApiService.getEntityData(entityId, country, businessUnit, 1, 50),
      ]);
      
      setMetadata(metadataRes);
      setRows(dataRes.rows);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to fetch table metadata or data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCellEdit = (rowId: string, columnName: string) => {
    if (metadata?.permissions.canEdit) {
      setEditingCell({ rowId, columnName });
    }
  };

  const handleCellSave = async (rowId: string, columnName: string, newValue: any) => {
    const row = rows.find((r) => r.id === rowId);
    if (!row) return;

    try {
      const result = await MetadataApiService.updateRow(entityId, {
        id: rowId,
        version: row.version,
        editReason: "Inline edit",
        changes: { [columnName]: newValue },
      });

      if (result.success) {
        // Update local state
        setRows(rows.map((r) =>
          r.id === rowId
            ? { ...r, [columnName]: newValue, version: r.version + 1 }
            : r
        ));
        setEditingCell(null);
        toast({
          title: "Success",
          description: "Record updated successfully",
        });
      } else if (result.conflict) {
        setOccConflict(result.conflict);
        setConflictModalOpen(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update record",
        variant: "destructive",
      });
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
  };

  const handleOCCRetry = () => {
    setConflictModalOpen(false);
    // Retry logic would go here
  };

  const handleOCCRefresh = () => {
    setConflictModalOpen(false);
    loadData();
  };

  const handleOCCCancel = () => {
    setConflictModalOpen(false);
    setEditingCell(null);
  };

  const handleDownloadTemplate = () => {
    if (metadata) {
      generateSimpleTemplate(metadata, metadata.entityName);
    }
  };

  const formatCellValue = (value: any, dataType: string) => {
    if (value === null || value === undefined) return "-";
    
    switch (dataType) {
      case "BOOLEAN":
        return value ? "Yes" : "No";
      case "DATE":
        return new Date(value).toLocaleDateString();
      default:
        return String(value);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="glass rounded-xl border border-border p-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="glass rounded-xl p-8 text-center border border-border">
        <p className="text-muted-foreground">No metadata available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{metadata.entityName}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {rows.length} records • {metadata.permissions.canEdit ? "Editable" : "Read-only"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {metadata.permissions.canAdd && (
            <Button variant="outline" className="glass-hover border-primary/30 hover:glow-red">
              <Plus className="w-4 h-4 mr-2" />
              Add Row
            </Button>
          )}
          <Button variant="outline" className="glass-hover border-border">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
          <Button 
            variant="outline" 
            className="glass-hover border-border"
            onClick={handleDownloadTemplate}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Download Template
          </Button>
          {onViewAudit && (
            <Button
              onClick={onViewAudit}
              variant="outline"
              className="glass-hover border-border"
            >
              <History className="w-4 h-4 mr-2" />
              Audit Trail
            </Button>
          )}
        </div>
      </div>

      {/* Dynamic Table */}
      <div className="glass rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/80">
              <TableRow className="border-border hover:bg-transparent">
                {metadata.columns.map((column) => {
                  // Identify primary key: first column that is non-editable and required
                  const isPrimaryKey = !column.editable && column.required && 
                    metadata.columns.findIndex(col => !col.editable && col.required) === 
                    metadata.columns.findIndex(col => col.name === column.name);
                  
                  return (
                    <TableHead 
                      key={column.name} 
                      className="font-bold"
                    >
                      <div className="flex items-center gap-2">
                        <span>{column.label}</span>
                        {column.required && <span className="text-destructive">*</span>}
                        {column.editable && (
                          <Badge variant="outline" className="text-xs border-primary/30">
                            Edit
                          </Badge>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
                <TableHead className="font-bold">
                  <span>Version</span>
                </TableHead>
                <TableHead className="font-bold">
                  <span>Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-border hover:bg-card-hover transition-colors"
                >
                  {metadata.columns.map((column) => {
                    const isEditing =
                      editingCell?.rowId === row.id &&
                      editingCell?.columnName === column.name;

                    return (
                      <TableCell
                        key={`${row.id}-${column.name}`}
                        className={cn(
                          "text-foreground",
                          column.editable && !isEditing && "cursor-pointer hover:bg-primary/5"
                        )}
                        onDoubleClick={() =>
                          column.editable && handleCellEdit(row.id, column.name)
                        }
                      >
                        {isEditing ? (
                          <InlineEditCell
                            value={row[column.name]}
                            column={column}
                            onSave={(newValue) =>
                              handleCellSave(row.id, column.name, newValue)
                            }
                            onCancel={handleCellCancel}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={cn(!column.editable && "text-muted-foreground")}>
                              {formatCellValue(row[column.name], column.dataType)}
                            </span>
                            {column.editable && (
                              <Edit2
                                className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleCellEdit(row.id, column.name)}
                              />
                            )}
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-foreground">
                    <Badge variant="outline" className="font-mono text-xs">
                      v{row.version}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-card-hover">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass border-border">
                        <DropdownMenuItem className="hover:bg-card-hover">
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Row
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-card-hover">
                          <History className="w-4 h-4 mr-2" />
                          View History
                        </DropdownMenuItem>
                        {metadata.permissions.canDelete && (
                          <DropdownMenuItem className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* OCC Conflict Modal */}
      <OCCConflictModal
        open={conflictModalOpen}
        conflict={occConflict}
        onRetry={handleOCCRetry}
        onRefresh={handleOCCRefresh}
        onCancel={handleOCCCancel}
      />
    </div>
  );
};
