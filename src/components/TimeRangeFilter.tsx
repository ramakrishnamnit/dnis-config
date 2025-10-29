import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TimeRangeFilterProps {
  fromDate: string;
  toDate: string;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
  onClear: () => void;
  className?: string;
}

export const TimeRangeFilter = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onClear,
  className,
}: TimeRangeFilterProps) => {
  const hasDateFilter = fromDate || toDate;

  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Quick preset handlers
  const handlePreset = (days: number) => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);
    
    onFromDateChange(formatDate(pastDate));
    onToDateChange(formatDate(today));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "glass-hover border-border relative",
            hasDateFilter && "border-primary text-primary",
            className
          )}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Date Range
          {hasDateFilter && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              Active
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="glass border-border w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-foreground">Filter by Date Range</h4>
            {hasDateFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Quick Presets</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset(7)}
                className="h-8 text-xs glass-hover border-border hover:border-primary hover:text-primary"
              >
                Last 7 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset(30)}
                className="h-8 text-xs glass-hover border-border hover:border-primary hover:text-primary"
              >
                Last 30 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset(60)}
                className="h-8 text-xs glass-hover border-border hover:border-primary hover:text-primary"
              >
                Last 60 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset(365)}
                className="h-8 text-xs glass-hover border-border hover:border-primary hover:text-primary"
              >
                Last Year
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="from-date" className="text-xs font-medium text-muted-foreground">
                From Date
              </Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => onFromDateChange(e.target.value)}
                className="glass border-border focus:border-primary"
                max={toDate || undefined}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="to-date" className="text-xs font-medium text-muted-foreground">
                To Date
              </Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => onToDateChange(e.target.value)}
                className="glass border-border focus:border-primary"
                min={fromDate || undefined}
              />
            </div>
          </div>
          
          {hasDateFilter && (
            <div className="text-xs text-muted-foreground pt-2 border-t border-border">
              {fromDate && toDate ? (
                <>Filtering from <span className="font-medium text-foreground">{new Date(fromDate).toLocaleDateString()}</span> to <span className="font-medium text-foreground">{new Date(toDate).toLocaleDateString()}</span></>
              ) : fromDate ? (
                <>Filtering from <span className="font-medium text-foreground">{new Date(fromDate).toLocaleDateString()}</span> onwards</>
              ) : (
                <>Filtering up to <span className="font-medium text-foreground">{new Date(toDate).toLocaleDateString()}</span></>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

