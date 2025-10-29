import { useState } from "react";
import { SlidersHorizontal, X, Calendar, Search, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EntityMetadata } from "@/types/metadata";
import { cn } from "@/lib/utils";

interface SmartFilterModalProps {
  metadata: EntityMetadata | null;
  columnFilters: Record<string, string>;
  fromDate: string;
  toDate: string;
  onColumnFilterChange: (columnName: string, value: string) => void;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
  onClearAll: () => void;
  className?: string;
}

export const SmartFilterModal = ({
  metadata,
  columnFilters,
  fromDate,
  toDate,
  onColumnFilterChange,
  onFromDateChange,
  onToDateChange,
  onClearAll,
  className,
}: SmartFilterModalProps) => {
  const [open, setOpen] = useState(false);

  if (!metadata) return null;

  // Calculate active filter count
  const activeColumnFilters = Object.keys(columnFilters).filter(
    (key) => columnFilters[key]
  ).length;
  const hasDateFilter = fromDate || toDate;
  const activeFilterCount = activeColumnFilters + (hasDateFilter ? 1 : 0);

  const handleClearAll = () => {
    onClearAll();
  };

  const handleClearColumnFilter = (columnName: string) => {
    onColumnFilterChange(columnName, "");
  };

  const handleClearDateRange = () => {
    onFromDateChange("");
    onToDateChange("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "glass-hover border-border relative",
            activeFilterCount > 0 && "border-primary text-primary",
            className
          )}
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Smart Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">Smart Filters</DialogTitle>
              <DialogDescription className="mt-1">
                Apply filters to narrow down your data
                {activeFilterCount > 0 && (
                  <span className="text-primary ml-1">
                    • {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active
                  </span>
                )}
              </DialogDescription>
            </div>
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">
            {/* Date Range Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Date Range Filter</h3>
                {hasDateFilter && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    Active
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="smart-from-date" className="text-xs font-medium text-muted-foreground">
                    From Date
                  </Label>
                  <Input
                    id="smart-from-date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => onFromDateChange(e.target.value)}
                    className="glass border-border focus:border-primary"
                    max={toDate || undefined}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smart-to-date" className="text-xs font-medium text-muted-foreground">
                    To Date
                  </Label>
                  <Input
                    id="smart-to-date"
                    type="date"
                    value={toDate}
                    onChange={(e) => onToDateChange(e.target.value)}
                    className="glass border-border focus:border-primary"
                    min={fromDate || undefined}
                  />
                </div>
              </div>

              {hasDateFilter && (
                <div className="pl-6">
                  <div className="flex items-center justify-between text-xs glass p-2 rounded-lg border border-border">
                    <span className="text-muted-foreground">
                      {fromDate && toDate ? (
                        <>
                          Filtering from{" "}
                          <span className="font-medium text-foreground">
                            {new Date(fromDate).toLocaleDateString()}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium text-foreground">
                            {new Date(toDate).toLocaleDateString()}
                          </span>
                        </>
                      ) : fromDate ? (
                        <>
                          Filtering from{" "}
                          <span className="font-medium text-foreground">
                            {new Date(fromDate).toLocaleDateString()}
                          </span>{" "}
                          onwards
                        </>
                      ) : (
                        <>
                          Filtering up to{" "}
                          <span className="font-medium text-foreground">
                            {new Date(toDate).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearDateRange}
                      className="h-6 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Column Filters Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Column Filters</h3>
                {activeColumnFilters > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {activeColumnFilters}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                {metadata.columns
                  .filter((col) => col.isFilterable)
                  .map((column) => (
                    <div key={column.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-muted-foreground">
                          {column.label}
                        </Label>
                        {columnFilters[column.name] && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClearColumnFilter(column.name)}
                            className="h-5 px-1.5 text-xs hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>

                      {column.dataType === "BOOLEAN" ? (
                        <Select
                          value={columnFilters[column.name] || "__all__"}
                          onValueChange={(value) =>
                            onColumnFilterChange(
                              column.name,
                              value === "__all__" ? "" : value
                            )
                          }
                        >
                          <SelectTrigger className="glass border-border h-9">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent className="glass border-border">
                            <SelectItem value="__all__">All</SelectItem>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : column.dataType === "ENUM" && column.enumValues ? (
                        <Select
                          value={columnFilters[column.name] || "__all__"}
                          onValueChange={(value) =>
                            onColumnFilterChange(
                              column.name,
                              value === "__all__" ? "" : value
                            )
                          }
                        >
                          <SelectTrigger className="glass border-border h-9">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent className="glass border-border">
                            <SelectItem value="__all__">All</SelectItem>
                            {column.enumValues.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : column.dataType === "DATE" ? (
                        <Input
                          type="date"
                          value={columnFilters[column.name] || ""}
                          onChange={(e) =>
                            onColumnFilterChange(column.name, e.target.value)
                          }
                          className="glass border-border focus:border-primary h-9"
                          placeholder={`Filter by ${column.label.toLowerCase()}...`}
                        />
                      ) : (
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type={column.dataType === "NUMBER" ? "number" : "text"}
                            placeholder={`Filter by ${column.label.toLowerCase()}...`}
                            value={columnFilters[column.name] || ""}
                            onChange={(e) =>
                              onColumnFilterChange(column.name, e.target.value)
                            }
                            className="pl-8 glass border-border h-9 focus:border-primary"
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {activeFilterCount > 0 ? (
                <>
                  {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} applied
                </>
              ) : (
                "No filters applied"
              )}
            </p>
            <Button
              onClick={() => setOpen(false)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

