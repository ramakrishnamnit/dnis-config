import { useState } from "react";
import { Filter, X, Search, Calendar, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EntityMetadata } from "@/types/metadata";

interface GlobalFilterProps {
  metadata: EntityMetadata;
  filters: Record<string, string>;
  onFiltersChange: (filters: Record<string, string>) => void;
  isLoading?: boolean;
}

export const GlobalFilter = ({
  metadata,
  filters,
  onFiltersChange,
  isLoading = false,
}: GlobalFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const activeFilterCount = Object.values(filters).filter(v => v.length > 0).length;
  
  const handleFilterChange = (columnName: string, value: string) => {
    // If "__all__" is selected, remove the filter (treat as empty)
    if (value === "__all__") {
      const newFilters = { ...filters };
      delete newFilters[columnName];
      onFiltersChange(newFilters);
    } else {
      onFiltersChange({
        ...filters,
        [columnName]: value,
      });
    }
  };
  
  const clearFilters = () => {
    onFiltersChange({});
  };
  
  const clearSingleFilter = (columnName: string) => {
    const newFilters = { ...filters };
    delete newFilters[columnName];
    onFiltersChange(newFilters);
  };
  
  return (
    <div className="flex items-center gap-3">
      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(filters).filter(([_, value]) => value).map(([columnName, value]) => {
            const column = metadata.columns.find(col => col.name === columnName);
            return (
              <Badge key={columnName} variant="secondary" className="text-xs gap-1.5">
                <span className="font-medium">{column?.label || columnName}:</span>
                <span className="text-muted-foreground">{value}</span>
                <button
                  onClick={() => clearSingleFilter(columnName)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Clear All
          </Button>
        </div>
      )}
      
      {/* Global Filter Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="glass-hover border-border relative"
            disabled={isLoading}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Global Filter
            {activeFilterCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 flex items-center justify-center p-0">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="glass border-border w-[500px] p-6" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Advanced Filters</h3>
              </div>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
              {metadata.columns.map((column) => (
                <div key={column.name} className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    {column.label}
                    {column.required && <span className="text-destructive">*</span>}
                  </label>
                  
                  {column.dataType === "BOOLEAN" ? (
                    <Select
                      value={filters[column.name] || "__all__"}
                      onValueChange={(value) => handleFilterChange(column.name, value)}
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
                      value={filters[column.name] || "__all__"}
                      onValueChange={(value) => handleFilterChange(column.name, value)}
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
                    <div className="relative">
                      <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={filters[column.name] || ""}
                        onChange={(e) => handleFilterChange(column.name, e.target.value)}
                        className="pl-8 glass border-border h-9"
                        disabled={isLoading}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={column.dataType === "NUMBER" ? "number" : "text"}
                        placeholder={`Filter by ${column.label.toLowerCase()}...`}
                        value={filters[column.name] || ""}
                        onChange={(e) => handleFilterChange(column.name, e.target.value)}
                        className="pl-8 glass border-border h-9"
                        disabled={isLoading}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active
              </p>
              <Button
                onClick={() => setIsOpen(false)}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

