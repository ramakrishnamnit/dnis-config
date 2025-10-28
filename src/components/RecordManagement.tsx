import { Plus, Upload, History, Edit, Eye, Trash2, MoreVertical, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColumnConfig, DynamicRecord, PaginationInfo } from "@/types/table";
import { RecordEditModal } from "./RecordEditModal";
import { RecordViewModal } from "./RecordViewModal";

interface RecordManagementProps {
  tableName: string;
  columns: ColumnConfig[];
  records: DynamicRecord[];
  pagination: PaginationInfo;
  isLoading?: boolean;
  onAddRecord: () => void;
  onBulkUpload: () => void;
  onViewAudit: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onFilterChange: (filters: Record<string, string>) => void;
  onSortChange?: (column: string, direction: "asc" | "desc") => void;
}

export const RecordManagement = ({
  tableName,
  columns,
  records,
  pagination,
  isLoading = false,
  onAddRecord,
  onBulkUpload,
  onViewAudit,
  onPageChange,
  onPageSizeChange,
  onFilterChange,
  onSortChange,
}: RecordManagementProps) => {
  // Local filter states (debounced before sending to backend)
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({});
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DynamicRecord | null>(null);
  
  // Debounce filter changes to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(localFilters);
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
  }, [localFilters, onFilterChange]);
  
  const handleLocalFilterChange = (columnKey: string, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
  };
  
  const clearFilters = () => {
    setLocalFilters({});
  };
  
  const handleSort = (columnKey: string) => {
    if (!onSortChange) return;
    
    let newDirection: "asc" | "desc" = "asc";
    if (sortColumn === columnKey && sortDirection === "asc") {
      newDirection = "desc";
    }
    
    setSortColumn(columnKey);
    setSortDirection(newDirection);
    onSortChange(columnKey, newDirection);
  };
  
  const hasActiveFilters = Object.values(localFilters).some(v => v.length > 0);
  const startIndex = (pagination.currentPage - 1) * pagination.pageSize + 1;
  const endIndex = Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords);
  
  // Handle record actions
  const handleViewRecord = (record: DynamicRecord) => {
    setSelectedRecord(record);
    setViewModalOpen(true);
  };
  
  const handleEditRecord = (record: DynamicRecord) => {
    setSelectedRecord(record);
    setEditModalOpen(true);
  };
  
  const handleEditFromView = () => {
    setViewModalOpen(false);
    setEditModalOpen(true);
  };
  
  const handleSaveRecord = async (updatedRecord: DynamicRecord) => {
    // TODO: Implement API call to save record
    console.log("Saving record:", updatedRecord);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // After successful save, you would typically:
    // 1. Close the modal
    // 2. Refresh the data
    // 3. Show success toast
  };
  
  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{tableName}</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading ? (
              "Loading..."
            ) : pagination.totalRecords === 0 ? (
              "No records found"
            ) : (
              <>
                Showing {startIndex}-{endIndex} of {pagination.totalRecords.toLocaleString()} records
                {hasActiveFilters && " (filtered)"}
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onAddRecord}
            variant="outline"
            className="glass-hover border-primary/30 hover:text-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Record
          </Button>

          <Button
            onClick={onBulkUpload}
            variant="outline"
            className="glass-hover border-border"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>

          <Button
            onClick={onViewAudit}
            variant="outline"
            className="glass-hover border-border"
          >
            <History className="w-4 h-4 mr-2" />
            Audit Trail
          </Button>
        </div>
      </div>

      {/* Dynamic Filters */}
      <div className="glass rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Filter Records</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {columns.filter(col => col.isFilterable).map((column) => (
            <div key={column.key} className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                {column.label}
              </label>
              <Input
                placeholder={`Filter by ${column.label.toLowerCase()}...`}
                value={localFilters[column.key] || ""}
                onChange={(e) => handleLocalFilterChange(column.key, e.target.value)}
                className="glass border-border focus:border-primary"
                disabled={isLoading}
              />
            </div>
          ))}
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            disabled={isLoading}
            className="mt-4 glass-hover border-primary/30 text-foreground hover:text-primary"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Dynamic Data Table */}
      <div className="glass rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-card-hover">
                {columns.map((column) => (
                  <TableHead 
                    key={column.key} 
                    className={`text-muted-foreground font-semibold ${column.isSortable ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                    onClick={() => column.isSortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {column.isSortable && sortColumn === column.key && (
                        <span className="text-xs">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-muted-foreground font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="text-muted-foreground">Loading records...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-12">
                    <p className="text-muted-foreground">
                      {hasActiveFilters ? "No records match the filters" : "No records found"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record, idx) => (
                  <TableRow key={record.id || idx} className="border-border hover:bg-card-hover transition-colors">
                    {columns.map((column) => (
                      <TableCell 
                        key={column.key}
                        className={`${column.key === 'id' || column.key === 'key' ? 'font-medium text-foreground' : 'text-muted-foreground'} ${column.type === 'string' ? 'max-w-xs truncate' : ''}`}
                      >
                        {column.type === "boolean" ? (
                          <Badge variant={record[column.key] ? "default" : "outline"}>
                            {record[column.key] ? "Yes" : "No"}
                          </Badge>
                        ) : column.key === "version" ? (
                          <Badge variant="outline" className="border-primary/30 text-primary">
                            v{record[column.key]}
                          </Badge>
                        ) : (
                          record[column.key] || "-"
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="glass-hover"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass border-border">
                          <DropdownMenuItem 
                            className="hover:bg-card-hover text-foreground cursor-pointer"
                            onClick={() => handleViewRecord(record)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {columns.some(col => col.isEditable) && (
                            <DropdownMenuItem 
                              className="hover:bg-card-hover text-foreground cursor-pointer"
                              onClick={() => handleEditRecord(record)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="hover:bg-card-hover text-foreground cursor-pointer">
                            <History className="w-4 h-4 mr-2" />
                            View History
                          </DropdownMenuItem>
                          {columns.some(col => col.isEditable) && (
                            <DropdownMenuItem className="hover:bg-destructive/10 text-destructive cursor-pointer">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      {!isLoading && pagination.totalRecords > 0 && (
        <div className="glass rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Rows per page:</label>
              <Select 
                value={pagination.pageSize.toString()} 
                onValueChange={(value) => onPageSizeChange(Number(value))}
                disabled={isLoading}
              >
                <SelectTrigger className="glass border-border w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-border">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(1)}
                  disabled={pagination.currentPage === 1 || isLoading}
                  className="glass-hover border-border disabled:opacity-50"
                  title="First page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1 || isLoading}
                  className="glass-hover border-border disabled:opacity-50"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                {/* Page number inputs for quick navigation */}
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={1}
                    max={pagination.totalPages}
                    value={pagination.currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= pagination.totalPages) {
                        onPageChange(page);
                      }
                    }}
                    className="glass border-border w-16 text-center"
                    disabled={isLoading}
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages || isLoading}
                  className="glass-hover border-border disabled:opacity-50"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.totalPages)}
                  disabled={pagination.currentPage === pagination.totalPages || isLoading}
                  className="glass-hover border-border disabled:opacity-50"
                  title="Last page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* View Record Modal */}
      <RecordViewModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        record={selectedRecord}
        columns={columns}
        tableName={tableName}
        onEditClick={columns.some(col => col.isEditable) ? handleEditFromView : undefined}
      />
      
      {/* Edit Record Modal */}
      <RecordEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        record={selectedRecord}
        columns={columns}
        tableName={tableName}
        onSave={handleSaveRecord}
      />
    </div>
  );
};
