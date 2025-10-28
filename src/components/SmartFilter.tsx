import { useState } from "react";
import { Filter, Plus, Trash2, Save } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { EntityMetadata } from "@/types/metadata";
import type { FilterOperator, LogicalOperator, SmartFilterGroup } from "@/types/api";

interface FilterConditionInternal {
  id: string;
  column: string;
  operator: FilterOperator;
  value: string;
}

interface FilterGroupInternal {
  conditions: FilterConditionInternal[];
  logicalOperator: LogicalOperator;
}

interface SmartFilterProps {
  metadata: EntityMetadata;
  onFilterApply: (filterGroup: SmartFilterGroup | null) => void;
  isLoading?: boolean;
}

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: "Equals",
  contains: "Contains",
  starts_with: "Starts with",
  ends_with: "Ends with",
  greater_than: "Greater than",
  less_than: "Less than",
  not_equals: "Not equals",
};

const getOperatorsForType = (dataType: string): FilterOperator[] => {
  switch (dataType) {
    case "NUMBER":
      return ["equals", "not_equals", "greater_than", "less_than"];
    case "STRING":
      return ["equals", "not_equals", "contains", "starts_with", "ends_with"];
    case "DATE":
      return ["equals", "greater_than", "less_than"];
    case "BOOLEAN":
      return ["equals"];
    case "ENUM":
      return ["equals", "not_equals"];
    default:
      return ["equals", "contains"];
  }
};

export const SmartFilter = ({
  metadata,
  onFilterApply,
  isLoading = false,
}: SmartFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterGroup, setFilterGroup] = useState<FilterGroupInternal>({
    conditions: [],
    logicalOperator: "AND",
  });

  const addCondition = () => {
    const firstColumn = metadata.columns[0];
    const newCondition: FilterConditionInternal = {
      id: `condition-${Date.now()}`,
      column: firstColumn.name,
      operator: getOperatorsForType(firstColumn.dataType)[0],
      value: "",
    };
    
    setFilterGroup({
      ...filterGroup,
      conditions: [...filterGroup.conditions, newCondition],
    });
  };

  const removeCondition = (conditionId: string) => {
    setFilterGroup({
      ...filterGroup,
      conditions: filterGroup.conditions.filter(c => c.id !== conditionId),
    });
  };

  const updateCondition = (
    conditionId: string,
    updates: Partial<FilterConditionInternal>
  ) => {
    setFilterGroup({
      ...filterGroup,
      conditions: filterGroup.conditions.map(c =>
        c.id === conditionId ? { ...c, ...updates } : c
      ),
    });
  };

  const handleColumnChange = (conditionId: string, columnName: string) => {
    const column = metadata.columns.find(col => col.name === columnName);
    if (!column) return;

    const operators = getOperatorsForType(column.dataType);
    updateCondition(conditionId, {
      column: columnName,
      operator: operators[0],
      value: "",
    });
  };

  const applyFilters = () => {
    if (filterGroup.conditions.length === 0) {
      onFilterApply(null);
    } else {
      // Filter out conditions with empty values and remove internal IDs
      const validConditions = filterGroup.conditions
        .filter(c => c.value.trim() !== "")
        .map(({ id, ...rest }) => rest);
      
      if (validConditions.length === 0) {
        onFilterApply(null);
      } else {
        onFilterApply({
          conditions: validConditions,
          logicalOperator: filterGroup.logicalOperator,
        });
      }
    }
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilterGroup({
      conditions: [],
      logicalOperator: "AND",
    });
    onFilterApply(null);
  };

  const hasActiveFilters = filterGroup.conditions.some(c => c.value.trim() !== "");
  const activeFilterCount = filterGroup.conditions.filter(c => c.value.trim() !== "").length;

  const getFilterSummary = () => {
    const validConditions = filterGroup.conditions.filter(c => c.value.trim() !== "");
    if (validConditions.length === 0) return null;

    return validConditions.map(condition => {
      const column = metadata.columns.find(col => col.name === condition.column);
      return {
        label: column?.label || condition.column,
        operator: OPERATOR_LABELS[condition.operator],
        value: condition.value,
      };
    });
  };

  const filterSummary = getFilterSummary();

  return (
    <div className="flex items-center gap-3">
      {/* Active Filters Display */}
      {hasActiveFilters && filterSummary && (
        <div className="flex items-center gap-2 flex-wrap max-w-2xl">
          <Badge variant="outline" className="text-xs font-semibold bg-primary/10 text-primary border-primary/30">
            {filterGroup.logicalOperator}
          </Badge>
          {filterSummary.map((filter, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs gap-1.5">
              <span className="font-medium">{filter.label}</span>
              <span className="text-muted-foreground text-[10px]">{filter.operator}</span>
              <span className="text-foreground">{filter.value}</span>
            </Badge>
          ))}
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
      
      {/* Smart Filter Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="glass-hover border-border relative"
            disabled={isLoading}
          >
            <Filter className="w-4 h-4 mr-2" />
            Smart Filter
            {activeFilterCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 min-w-5 flex items-center justify-center p-0">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="glass border-border w-[650px] p-6" align="end">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Smart Filter Builder</h3>
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
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
            </div>

            {/* Logical Operator Selection */}
            {filterGroup.conditions.length > 1 && (
              <div className="p-3 bg-muted/50 rounded-lg border border-border">
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Combine conditions with:
                </Label>
                <RadioGroup
                  value={filterGroup.logicalOperator}
                  onValueChange={(value) =>
                    setFilterGroup({ ...filterGroup, logicalOperator: value as LogicalOperator })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="AND" id="and" />
                    <Label htmlFor="and" className="text-sm font-medium cursor-pointer">
                      AND (all conditions must match)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="OR" id="or" />
                    <Label htmlFor="or" className="text-sm font-medium cursor-pointer">
                      OR (any condition can match)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Filter Conditions */}
            <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
              {filterGroup.conditions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No filter conditions added yet.</p>
                  <p className="text-xs mt-1">Click "Add Condition" to start filtering.</p>
                </div>
              ) : (
                filterGroup.conditions.map((condition, index) => {
                  const column = metadata.columns.find(col => col.name === condition.column);
                  const availableOperators = column ? getOperatorsForType(column.dataType) : ["equals"];

                  return (
                    <div
                      key={condition.id}
                      className="p-3 bg-muted/30 rounded-lg border border-border space-y-2"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Condition {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCondition(condition.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-[2fr,1.5fr,2fr] gap-2">
                        {/* Column Selection */}
                        <Select
                          value={condition.column}
                          onValueChange={(value) => handleColumnChange(condition.id, value)}
                        >
                          <SelectTrigger className="glass border-border h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass border-border max-h-[200px]">
                            {metadata.columns.map((col) => (
                              <SelectItem key={col.name} value={col.name}>
                                {col.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Operator Selection */}
                        <Select
                          value={condition.operator}
                          onValueChange={(value) =>
                            updateCondition(condition.id, { operator: value as FilterOperator })
                          }
                        >
                          <SelectTrigger className="glass border-border h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass border-border">
                            {availableOperators.map((op) => (
                              <SelectItem key={op} value={op}>
                                {OPERATOR_LABELS[op]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Value Input */}
                        {column?.dataType === "BOOLEAN" ? (
                          <Select
                            value={condition.value}
                            onValueChange={(value) =>
                              updateCondition(condition.id, { value })
                            }
                          >
                            <SelectTrigger className="glass border-border h-9">
                              <SelectValue placeholder="Select value" />
                            </SelectTrigger>
                            <SelectContent className="glass border-border">
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : column?.dataType === "ENUM" && column.enumValues ? (
                          <Select
                            value={condition.value}
                            onValueChange={(value) =>
                              updateCondition(condition.id, { value })
                            }
                          >
                            <SelectTrigger className="glass border-border h-9">
                              <SelectValue placeholder="Select value" />
                            </SelectTrigger>
                            <SelectContent className="glass border-border">
                              {column.enumValues.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={column?.dataType === "NUMBER" ? "number" : column?.dataType === "DATE" ? "date" : "text"}
                            placeholder="Enter value..."
                            value={condition.value}
                            onChange={(e) =>
                              updateCondition(condition.id, { value: e.target.value })
                            }
                            className="glass border-border h-9"
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Condition Button */}
            <Button
              onClick={addCondition}
              variant="outline"
              size="sm"
              className="w-full glass-hover border-dashed border-primary/50 text-primary hover:bg-primary/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Condition
            </Button>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {activeFilterCount} condition{activeFilterCount !== 1 ? "s" : ""} active
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  size="sm"
                  className="glass-hover"
                >
                  Cancel
                </Button>
                <Button
                  onClick={applyFilters}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Save className="w-3 h-3 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

