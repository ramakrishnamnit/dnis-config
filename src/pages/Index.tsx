import { useState, useEffect, useCallback, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { RegionSelector } from "@/components/RegionSelector";
import { DownloadConfigModal } from "@/components/DownloadConfigModal";
import { Plus, Upload, History, Save, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicEditableTable } from "@/components/DynamicEditableTable";
import { AddRowModal } from "@/components/AddRowModal";
import { BulkUploadModal } from "@/components/BulkUploadModal";
import { EditReasonModal } from "@/components/EditReasonModal";
import { FilterBuilder, FilterRule, FilterField } from "@/components/FilterBuilder";
import { useRowUpdates } from "@/hooks/useRowUpdates";
import { useTablePagination } from "@/hooks/useTablePagination";
import { configApiService } from "@/services/apiToggle";
import { useToast } from "@/hooks/use-toast";
import type { EntityMetadata, MetadataRecord } from "@/types/metadata";
import type { EntityRowResponse, DataRequest } from "@/types/api";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock tables list
const mockTables = [
  {
    id: "UKCC_SERVICEPROFILE",
    name: "UKCC_SERVICEPROFILE",
    description: "Service Profile Configuration",
    lastModified: "2h ago",
    isEditable: true,
    recordCount: 245,
  },
  {
    id: "UKCC_CONFIG_MAIN",
    name: "UKCC_CONFIG_MAIN",
    description: "Main Configuration Table",
    lastModified: "5h ago",
    isEditable: true,
    recordCount: 156,
  },
];

const Index = () => {
  // Region state
  const [country, setCountry] = useState("UK");
  const [businessUnit, setBusinessUnit] = useState("CC");
  const [selectedTableId, setSelectedTableId] = useState<string>();

  // Data state
  const [metadata, setMetadata] = useState<EntityMetadata | null>(null);
  const [rows, setRows] = useState<EntityRowResponse[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Search and filter state
  const [globalSearch, setGlobalSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);

  // Pagination
  const {
    pagination,
    setTotalCount,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    goToPage,
    setPageSize,
    resetToFirstPage,
  } = useTablePagination(50);

  // Row updates management
  const rowUpdates = useRowUpdates(metadata);
  const { clearAllEdits } = rowUpdates;

  const filterFields = useMemo<FilterField[]>(() => {
    if (!metadata) return [];

    const mapDataTypeToFilterType = (dataType: string): FilterField["type"] => {
      switch (dataType) {
        case "STRING":
          return "text";
        case "NUMBER":
          return "number";
        case "BOOLEAN":
          return "boolean";
        case "DATE":
          return "date";
        case "ENUM":
          return "select";
        default:
          return "text";
      }
    };

    return metadata.columns
      .filter((column) => column.isFilterable)
      .map((column) => ({
        name: column.name,
        label: column.label,
        type: mapDataTypeToFilterType(column.dataType),
        options: column.dataType === "ENUM" ? column.enumValues : undefined,
      }));
  }, [metadata]);

  const advancedFilters = useMemo<Record<string, string>>(() => {
    const filters: Record<string, string> = {};

    filterRules.forEach((rule) => {
      if (!rule.field) return;
      if (Array.isArray(rule.value) && rule.value.length === 0) return;
      if (!Array.isArray(rule.value) && String(rule.value ?? "").trim() === "") return;

      const key = `${rule.field}__${rule.operator}`;
      const value = Array.isArray(rule.value) ? rule.value.join(",") : String(rule.value);

      filters[key] = value;
    });

    return filters;
  }, [filterRules]);

  // Modal states
  const [addRowModalOpen, setAddRowModalOpen] = useState(false);
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [editReasonModalOpen, setEditReasonModalOpen] = useState(false);
  const [pendingSaveAction, setPendingSaveAction] = useState<{ type: "single" | "batch"; rowId?: string } | null>(null);

  const { toast } = useToast();
  const selectedTable = mockTables.find((t) => t.id === selectedTableId);

  const loadMetadata = useCallback(async () => {
    if (!selectedTableId) return;

    setIsLoadingMetadata(true);
    try {
      const metadataResponse = await configApiService.getEntityMetadata(
        selectedTableId,
        country,
        businessUnit
      );
      setMetadata(metadataResponse);
      clearAllEdits();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load table metadata",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMetadata(false);
    }
  }, [businessUnit, clearAllEdits, country, selectedTableId, toast]);

  // Fetch metadata when table is selected
  useEffect(() => {
    if (selectedTableId && country && businessUnit) {
      loadMetadata();
    }
  }, [businessUnit, country, loadMetadata, selectedTableId]);

  const loadData = useCallback(async () => {
    if (!selectedTableId || !metadata) return;

    setIsLoadingData(true);
    try {
      const request: DataRequest = {
        entityId: selectedTableId,
        country,
        businessUnit,
        page: pagination.page,
        pageSize: pagination.pageSize,
        globalSearch: globalSearch || undefined,
        filters: {
          ...columnFilters,
          ...advancedFilters,
        },
      };

      const dataResponse = await configApiService.getEntityData(request);
      setRows(dataResponse.rows);
      setTotalCount(dataResponse.totalCount);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load table data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  }, [advancedFilters, businessUnit, columnFilters, country, globalSearch, metadata, pagination.page, pagination.pageSize, selectedTableId, setTotalCount, toast]);

  // Fetch data when metadata loads or filters/pagination change
  useEffect(() => {
    if (metadata && country && businessUnit) {
      loadData();
    }
  }, [businessUnit, country, loadData, metadata]);

  const handleGlobalSearch = useCallback((query: string) => {
    setGlobalSearch(query);
    resetToFirstPage();
  }, [resetToFirstPage]);

  const handleColumnFilter = useCallback((columnName: string, value: string) => {
    setColumnFilters((prev) => {
      const newFilters = { ...prev };
      if (value) {
        newFilters[columnName] = value;
      } else {
        delete newFilters[columnName];
      }
      return newFilters;
    });
    resetToFirstPage();
  }, [resetToFirstPage]);
  
  const handleClearAllFilters = useCallback(() => {
    setColumnFilters({});
    setFilterRules([]);
    resetToFirstPage();
  }, [resetToFirstPage]);

  const handleRowUpdate = useCallback((rowId: string) => {
    setPendingSaveAction({ type: "single", rowId });
    setEditReasonModalOpen(true);
  }, []);

  const handleBatchUpdate = useCallback(() => {
    setPendingSaveAction({ type: "batch" });
    setEditReasonModalOpen(true);
  }, []);

  const handleEditReasonSubmit = async (editReason: string) => {
    if (!pendingSaveAction || !selectedTableId) return;

    try {
      if (pendingSaveAction.type === "single" && pendingSaveAction.rowId) {
        // Update single row
        const rowId = pendingSaveAction.rowId;
        const row = rows.find((r) => r.id === rowId);
        if (!row) return;

        const changes = rowUpdates.getRowEdits(rowId);
        if (!changes) return;

        rowUpdates.updateRowStatus(rowId, "saving");

        const result = await configApiService.updateRow(selectedTableId, {
          id: rowId,
          version: row.version,
          editReason,
          changes,
        });

        if (result.success) {
          rowUpdates.clearRowEdits(rowId);
          toast({
            title: "Success",
            description: "Row updated successfully",
          });
          await loadData();
        } else if (result.conflict) {
          toast({
            title: "Conflict Detected",
            description: "This row has been modified by another user. Please refresh.",
            variant: "destructive",
          });
        }
      } else if (pendingSaveAction.type === "batch") {
        // Batch update all pending rows
        const pendingRowIds = rowUpdates.getAllPendingRows();
        const updates = pendingRowIds.map((rowId) => {
          const row = rows.find((r) => r.id === rowId);
          const changes = rowUpdates.getRowEdits(rowId);
          return {
            id: rowId,
            version: row?.version || 1,
            editReason,
            changes: changes || {},
          };
        });

        const result = await configApiService.batchUpdateRows(selectedTableId, {
          updates,
          editReason,
        });

        if (result.successCount > 0) {
          toast({
            title: "Batch Update Complete",
            description: `${result.successCount} row(s) updated, ${result.failureCount} failed`,
          });
          rowUpdates.clearAllEdits();
          await loadData();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setEditReasonModalOpen(false);
      setPendingSaveAction(null);
    }
  };

  const handleAddRow = async (data: MetadataRecord, editReason: string) => {
    if (!selectedTableId) return;

    try {
      const result = await configApiService.addRow({
        entityId: selectedTableId,
        country,
        businessUnit,
        data,
        editReason,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Row added successfully",
        });
        await loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add row",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleBulkUpload = async (uploadRows: MetadataRecord[], editReason: string) => {
    if (!selectedTableId) return { successCount: 0, failureCount: 0, results: [] };

    try {
      const result = await configApiService.bulkUploadRows({
        entityId: selectedTableId,
        country,
        businessUnit,
        rows: uploadRows,
        editReason,
      });

      if (result.successCount > 0) {
        await loadData();
      }

      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: "Bulk upload failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const pendingRowCount = rowUpdates.getAllPendingRows().length;
  
  useEffect(() => {
    resetToFirstPage();
  }, [advancedFilters, resetToFirstPage]);
  
  const activeColumnFilterCount = Object.keys(columnFilters).filter((key) => columnFilters[key]).length;
  const activeAdvancedFilterCount = Object.keys(advancedFilters).length;
  const activeFilterTotal = activeColumnFilterCount + activeAdvancedFilterCount;

  return (
    <Layout fullWidth contentClassName="gap-3">
        <div className="flex flex-col gap-3 h-full overflow-hidden">
            {/* Region & Table Selector */}
            <div className="flex-shrink-0">
              <RegionSelector
                country={country}
                businessUnit={businessUnit}
                onCountryChange={setCountry}
                onBusinessUnitChange={setBusinessUnit}
                tables={mockTables}
                selectedTableId={selectedTableId}
                onTableSelect={setSelectedTableId}
                onDownloadConfig={() => setDownloadModalOpen(true)}
              />
            </div>

            {/* Main Content */}
            {selectedTableId && (
              <div className="flex-1 flex flex-col space-y-4 overflow-hidden min-h-0">
                {isLoadingMetadata ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : metadata ? (
                  <>
                    {/* Compact Table Info & Actions Bar */}
                    <div className="glass rounded-xl p-3 border border-border shadow-lg flex-shrink-0">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                          <div>
                            <h2 className="text-xl font-semibold text-foreground">{metadata.entityName}</h2>
                            <p className="text-sm text-muted-foreground">
                              {pagination.totalCount} total records
                              {activeFilterTotal > 0 && (
                                <span className="text-blue-500 ml-2">• {activeFilterTotal} filter{activeFilterTotal !== 1 ? "s" : ""} active</span>
                              )}
                              {pendingRowCount > 0 && (
                                <span className="text-primary ml-2">• {pendingRowCount} pending change{pendingRowCount !== 1 ? "s" : ""}</span>
                              )}
                            </p>
                          </div>
                          
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Global Search */}
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="Search all columns..."
                              value={globalSearch}
                              onChange={(e) => handleGlobalSearch(e.target.value)}
                              className="pl-8 pr-3 py-1.5 text-sm glass border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary w-64"
                            />
                          </div>
                          
                          <FilterBuilder
                            fields={filterFields}
                            rules={filterRules}
                            onRulesChange={setFilterRules}
                            className="border-border"
                          />
                          {activeFilterTotal > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleClearAllFilters}
                              className="text-xs text-destructive hover:bg-destructive/10"
                            >
                              Clear Filters
                            </Button>
                          )}
                          
                          {pendingRowCount > 0 && (
                            <Button
                              onClick={handleBatchUpdate}
                              size="sm"
                              className="shadow-md hover:shadow-lg hover:glow-subtle hover:-translate-y-0.5 transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground relative"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save All ({pendingRowCount})
                              <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-pulse" />
                            </Button>
                          )}
                          {metadata.permissions.canAdd && (
                            <Button
                              onClick={() => setAddRowModalOpen(true)}
                              variant="outline"
                              size="sm"
                              className="glass-hover border-primary/30 hover:text-primary"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Row
                            </Button>
                          )}
                          <Button
                            onClick={() => setBulkUploadModalOpen(true)}
                            variant="outline"
                            size="sm"
                            className="glass-hover border-border"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Bulk Upload
                          </Button>
                          <Button
                            onClick={loadData}
                            variant="outline"
                            size="icon"
                            className="glass-hover border-border h-8 w-8"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>


                    {/* Dynamic Table - with flex-1 to take remaining space */}
                    <div className="flex-1 overflow-hidden min-h-0">
                      <DynamicEditableTable
                        metadata={metadata}
                        rows={rows}
                        isLoading={isLoadingData}
                        pendingEdits={rowUpdates.pendingEdits}
                        onCellEdit={rowUpdates.setPendingEdit}
                        onRowUpdate={handleRowUpdate}
                        hasRowChanges={rowUpdates.hasRowChanges}
                        getRowEdits={rowUpdates.getRowEdits}
                        validateRow={rowUpdates.validateRow}
                        columnFilters={columnFilters}
                        onFilterChange={handleColumnFilter}
                      />
                    </div>

                    {/* Pagination */}
                    {pagination.totalCount > 0 && (
                      <div className="glass rounded-xl p-2 border border-border flex-shrink-0">
                        <div className="flex items-center justify-between gap-3 flex-wrap text-xs">
                          <div className="flex items-center gap-1.5">
                            <label className="text-xs text-muted-foreground">Rows per page:</label>
                            <Select
                              value={pagination.pageSize.toString()}
                              onValueChange={(value) => setPageSize(Number(value))}
                            >
                              <SelectTrigger className="glass border-border w-[80px] h-8 px-2 py-1 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="glass border-border">
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                                <SelectItem value="200">200</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                              Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={firstPage}
                                disabled={pagination.page === 1}
                                className="glass-hover border-border h-8 px-2"
                              >
                                <ChevronsLeft className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={prevPage}
                                disabled={pagination.page === 1}
                                className="glass-hover border-border h-8 px-2"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={nextPage}
                                disabled={pagination.page === pagination.totalPages}
                                className="glass-hover border-border h-8 px-2"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={lastPage}
                                disabled={pagination.page === pagination.totalPages}
                                className="glass-hover border-border h-8 px-2"
                              >
                                <ChevronsRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )}
        </div>

      {/* Modals */}
      <AddRowModal
        open={addRowModalOpen}
        onOpenChange={setAddRowModalOpen}
        metadata={metadata}
        onSubmit={handleAddRow}
      />

      <BulkUploadModal
        open={bulkUploadModalOpen}
        onOpenChange={setBulkUploadModalOpen}
        metadata={metadata}
        entityName={metadata?.entityName || ""}
        onUpload={handleBulkUpload}
      />

      <EditReasonModal
        open={editReasonModalOpen}
        onOpenChange={setEditReasonModalOpen}
        onSubmit={handleEditReasonSubmit}
      />

      <DownloadConfigModal
        open={downloadModalOpen}
        onOpenChange={setDownloadModalOpen}
        country={country}
        businessUnit={businessUnit}
        hasSearchFilter={globalSearch.length > 0}
      />
    </Layout>
  );
};

export default Index;
