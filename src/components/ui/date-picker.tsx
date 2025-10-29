import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date | string;
  onDateChange: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  date,
  onDateChange,
  disabled = false,
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  // Convert string to Date if needed
  const dateValue = date instanceof Date ? date : date ? new Date(date) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal glass border-border focus:border-primary",
            !dateValue && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? format(dateValue, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 glass border-border">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={onDateChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

