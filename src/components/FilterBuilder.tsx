import { useState } from "react";
import { Plus, X, Filter, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface FilterRule {
  id: string;
  field: string;
  operator: string;
  value: string | string[];
}

export interface FilterField {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "multiselect" | "boolean";
  options?: string[];
}

interface FilterBuilderProps {
  fields: FilterField[];
  rules: FilterRule[];
  onRulesChange: (rules: FilterRule[]) => void;
  presets?: { name: string; rules: FilterRule[] }[];
  onSavePreset?: (name: string, rules: FilterRule[]) => void;
  className?: string;
}

const getOperatorsByType = (type: string): { value: string; label: string }[] => {
  switch (type) {
    case "text":
      return [
        { value: "contains", label: "contains" },
        { value: "equals", label: "is equal to" },
        { value: "not_equals", label: "is not equal to" },
        { value: "starts_with", label: "starts with" },
        { value: "ends_with", label: "ends with" },
      ];
    case "number":
      return [
        { value: "equals", label: "=" },
        { value: "not_equals", label: "≠" },
        { value: "greater_than", label: ">" },
        { value: "less_than", label: "<" },
        { value: "greater_equal", label: "≥" },
        { value: "less_equal", label: "≤" },
        { value: "between", label: "is between" },
      ];
    case "date":
      return [
        { value: "equals", label: "is" },
        { value: "before", label: "is before" },
        { value: "after", label: "is after" },
        { value: "between", label: "is between" },
      ];
    case "select":
    case "multiselect":
      return [
        { value: "equals", label: "is" },
        { value: "not_equals", label: "is not" },
        { value: "in", label: "is any of" },
      ];
    case "boolean":
      return [{ value: "equals", label: "is" }];
    default:
      return [{ value: "equals", label: "equals" }];
  }
};

export const FilterBuilder = ({
  fields,
  rules,
  onRulesChange,
  presets = [],
  onSavePreset,
  className,
}: FilterBuilderProps) => {
  const [open, setOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [showPresetInput, setShowPresetInput] = useState(false);

  const addRule = () => {
    const newRule: FilterRule = {
      id: `rule-${Date.now()}`,
      field: fields[0]?.name || "",
      operator: "equals",
      value: "",
    };
    onRulesChange([...rules, newRule]);
  };

  const removeRule = (id: string) => {
    onRulesChange(rules.filter((r) => r.id !== id));
  };

  const updateRule = (id: string, updates: Partial<FilterRule>) => {
    onRulesChange(
      rules.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const clearAll = () => {
    onRulesChange([]);
  };

  const loadPreset = (preset: { name: string; rules: FilterRule[] }) => {
    onRulesChange(preset.rules);
  };

  const saveCurrentPreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), rules);
      setPresetName("");
      setShowPresetInput(false);
    }
  };

  const activeRuleCount = rules.filter((r) => r.value).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "glass-hover border-border relative",
            activeRuleCount > 0 && "border-primary text-primary",
            className
          )}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeRuleCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs bg-primary/20 text-primary border-primary/30">
              {activeRuleCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 glass-strong">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                Filter Builder
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Create advanced filter rules to narrow down your data
                {activeRuleCount > 0 && (
                  <span className="text-primary ml-1">
                    • {activeRuleCount} active rule{activeRuleCount !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {rules.length > 0 && (
                <>
                  {onSavePreset && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPresetInput(!showPresetInput)}
                      className="glass-hover border-border"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Preset
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Preset Save Input */}
          {showPresetInput && (
            <div className="flex items-center gap-2 mt-3 p-3 glass rounded-lg border border-border animate-fade-in">
              <Input
                placeholder="Enter preset name..."
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="flex-1 h-9"
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveCurrentPreset();
                }}
              />
              <Button size="sm" onClick={saveCurrentPreset} disabled={!presetName.trim()}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowPresetInput(false);
                  setPresetName("");
                }}
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Presets */}
          {presets.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Saved Presets:</p>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadPreset(preset)}
                    className="px-3 py-1.5 text-xs glass-hover rounded-lg border border-border hover:border-primary hover:text-primary transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-3">
            {rules.length === 0 ? (
              <div className="text-center py-12">
                <Filter className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No filter rules added yet</p>
                <Button onClick={addRule} variant="outline" className="glass-hover">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Rule
                </Button>
              </div>
            ) : (
              rules.map((rule, index) => {
                const field = fields.find((f) => f.name === rule.field);
                const operators = field ? getOperatorsByType(field.type) : [];

                return (
                  <div
                    key={rule.id}
                    className="glass-hover rounded-xl p-4 border border-border animate-fade-in"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex-shrink-0 mt-1">
                        {index + 1}
                      </div>

                      <div className="flex-1 grid grid-cols-12 gap-3">
                        {/* Field Selector */}
                        <div className="col-span-4">
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                            Field
                          </label>
                          <Select
                            value={rule.field}
                            onValueChange={(value) =>
                              updateRule(rule.id, { field: value, operator: "equals", value: "" })
                            }
                          >
                            <SelectTrigger className="glass border-border h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-strong border-border">
                              {fields.map((field) => (
                                <SelectItem key={field.name} value={field.name}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Operator Selector */}
                        <div className="col-span-3">
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                            Operator
                          </label>
                          <Select
                            value={rule.operator}
                            onValueChange={(value) => updateRule(rule.id, { operator: value })}
                          >
                            <SelectTrigger className="glass border-border h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-strong border-border">
                              {operators.map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Value Input */}
                        <div className="col-span-5">
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                            Value
                          </label>
                          {field?.type === "select" || field?.type === "multiselect" ? (
                            <Select
                              value={rule.value as string}
                              onValueChange={(value) => updateRule(rule.id, { value })}
                            >
                              <SelectTrigger className="glass border-border h-9">
                                <SelectValue placeholder="Select value..." />
                              </SelectTrigger>
                              <SelectContent className="glass-strong border-border">
                                {field.options?.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : field?.type === "boolean" ? (
                            <Select
                              value={rule.value as string}
                              onValueChange={(value) => updateRule(rule.id, { value })}
                            >
                              <SelectTrigger className="glass border-border h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="glass-strong border-border">
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              type={field?.type === "number" ? "number" : field?.type === "date" ? "date" : "text"}
                              placeholder={`Enter ${field?.label.toLowerCase()}...`}
                              value={rule.value as string}
                              onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                              className="glass border-border h-9"
                            />
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRule(rule.id)}
                        className="h-8 w-8 mt-6 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}

            {rules.length > 0 && (
              <Button
                onClick={addRule}
                variant="outline"
                className="w-full glass-hover border-border border-dashed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
            )}
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {activeRuleCount > 0 ? (
                <>
                  {activeRuleCount} active rule{activeRuleCount !== 1 ? "s" : ""} will be applied
                </>
              ) : (
                "No active filters"
              )}
            </p>
            <Button
              onClick={() => setOpen(false)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
