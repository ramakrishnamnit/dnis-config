import { Fragment, useEffect, useMemo, useState } from "react";
import {
  History,
  Edit,
  Plus,
  Trash2,
  Download,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterBuilder, FilterRule, FilterField } from "./FilterBuilder";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTablePagination } from "@/hooks/useTablePagination";

interface AuditEvent {
  id: string;
  action: "UPDATE" | "INSERT" | "DELETE" | "DOWNLOAD";
  tableName: string;
  userId: string;
  userName: string;
  timestamp: string;
  reason: string;
  changes?: {
    before?: any;
    after?: any;
  };
}

const mockAuditEvents: AuditEvent[] = [
  {
    id: "1",
    action: "UPDATE",
    tableName: "UKCC_CONFIG_MAIN",
    userId: "john.doe@hsbc.com",
    userName: "John Doe",
    timestamp: "2025-01-15 14:30:22",
    reason: "Updated timeout configuration",
    changes: {
      before: { timeout: 30, retries: 3 },
      after: { timeout: 60, retries: 5 },
    },
  },
  {
    id: "2",
    action: "INSERT",
    tableName: "UKCC_ROUTING_RULES",
    userId: "jane.smith@hsbc.com",
    userName: "Jane Smith",
    timestamp: "2025-01-15 13:15:10",
    reason: "Added new routing rule for premium customers",
    changes: {
      after: { rule_id: "PREM_001", priority: 1, destination: "VIP_QUEUE" },
    },
  },
  {
    id: "3",
    action: "DOWNLOAD",
    tableName: "UKCC_AUDIO_ASSETS",
    userId: "admin@hsbc.com",
    userName: "Admin User",
    timestamp: "2025-01-15 11:45:33",
    reason: "Audit compliance check",
  },
  {
    id: "4",
    action: "DELETE",
    tableName: "UKCC_DEPRECATED_CONFIG",
    userId: "john.doe@hsbc.com",
    userName: "John Doe",
    timestamp: "2025-01-14 16:20:15",
    reason: "Removed obsolete configuration entries",
    changes: {
      before: { config_id: "OLD_001", status: "deprecated" },
    },
  },
  {
    id: "5",
    action: "UPDATE",
    tableName: "UKCC_CONFIG_MAIN",
    userId: "jane.smith@hsbc.com",
    userName: "Jane Smith",
    timestamp: "2025-01-14 10:22:45",
    reason: "Updated retry policy",
    changes: {
      before: { retries: 3 },
      after: { retries: 5 },
    },
  },
];

const getActionIcon = (action: string) => {
  switch (action) {
    case "UPDATE":
      return <Edit className="w-3 h-3" />;
    case "INSERT":
      return <Plus className="w-3 h-3" />;
    case "DELETE":
      return <Trash2 className="w-3 h-3" />;
    case "DOWNLOAD":
      return <Download className="w-3 h-3" />;
    default:
      return <History className="w-3 h-3" />;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case "UPDATE":
      return "border-status-warning/30 text-status-warning bg-status-warning/5";
    case "INSERT":
      return "border-status-success/30 text-status-success bg-status-success/5";
    case "DELETE":
      return "border-destructive/30 text-destructive bg-destructive/5";
    case "DOWNLOAD":
      return "border-status-info/30 text-status-info bg-status-info/5";
    default:
      return "border-muted-foreground/30";
  }
};

const filterFields: FilterField[] = [
  { name: "action", label: "Action", type: "select", options: ["UPDATE", "INSERT", "DELETE", "DOWNLOAD"] },
  { name: "tableName", label: "Table Name", type: "text" },
  { name: "userId", label: "User ID", type: "text" },
  { name: "userName", label: "User Name", type: "text" },
  { name: "reason", label: "Reason", type: "text" },
  { name: "timestamp", label: "Timestamp", type: "date" },
];

export const AuditGrid = () => {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"my" | "all">("all");
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const {
    pagination,
    setTotalCount,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPageSize,
    goToPage,
    resetToFirstPage,
  } = useTablePagination(10);

  const currentUser = "john.doe@hsbc.com";

  const toggleEvent = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const filteredEvents = useMemo(() => {
    const filteredByView = mockAuditEvents.filter((event) => {
      if (viewMode === "my" && event.userId !== currentUser) return false;
      return true;
    });

    if (filterRules.length === 0) {
      return filteredByView;
    }

    return filteredByView.filter((event) => {
      return filterRules.every((rule) => {
        if (!rule.value || (Array.isArray(rule.value) && rule.value.length === 0)) {
          return true;
        }

        const eventValue = (event as unknown as Record<string, unknown>)[rule.field];
        if (eventValue === undefined || eventValue === null) {
          return false;
        }

        const stringValue = String(eventValue).toLowerCase();
        const ruleValue = Array.isArray(rule.value)
          ? rule.value.map((val) => val.toLowerCase())
          : String(rule.value).toLowerCase();

        switch (rule.operator) {
          case "equals":
            return Array.isArray(ruleValue) ? ruleValue.includes(stringValue) : stringValue === ruleValue;
          case "not_equals":
            return Array.isArray(ruleValue) ? !ruleValue.includes(stringValue) : stringValue !== ruleValue;
          case "contains":
            return Array.isArray(ruleValue)
              ? ruleValue.some((val) => stringValue.includes(val))
              : stringValue.includes(ruleValue);
          case "starts_with":
            return Array.isArray(ruleValue)
              ? ruleValue.some((val) => stringValue.startsWith(val))
              : stringValue.startsWith(ruleValue);
          case "ends_with":
            return Array.isArray(ruleValue)
              ? ruleValue.some((val) => stringValue.endsWith(val))
              : stringValue.endsWith(ruleValue);
          case "in":
            return Array.isArray(ruleValue) ? ruleValue.includes(stringValue) : stringValue === ruleValue;
          case "before": {
            const eventDate = new Date(eventValue as string);
            const compareDate = new Date(Array.isArray(ruleValue) ? ruleValue[0] : ruleValue);
            return eventDate < compareDate;
          }
          case "after": {
            const eventDate = new Date(eventValue as string);
            const compareDate = new Date(Array.isArray(ruleValue) ? ruleValue[0] : ruleValue);
            return eventDate > compareDate;
          }
          case "between": {
            const [start, end] = Array.isArray(ruleValue)
              ? ruleValue
              : (ruleValue as string).split(",").map((val) => val.trim());
            if (!start || !end) return true;
            const eventDate = new Date(eventValue as string);
            const startDate = new Date(start);
            const endDate = new Date(end);
            return eventDate >= startDate && eventDate <= endDate;
          }
          default:
            return true;
        }
      });
    });
  }, [currentUser, filterRules, viewMode]);

  useEffect(() => {
    resetToFirstPage();
  }, [viewMode, filterRules, resetToFirstPage]);

  useEffect(() => {
    setTotalCount(filteredEvents.length);
  }, [filteredEvents.length, setTotalCount]);

  useEffect(() => {
    if (filteredEvents.length === 0 && pagination.page !== 1) {
      firstPage();
      return;
    }

    if (pagination.totalPages > 0 && pagination.page > pagination.totalPages) {
      goToPage(pagination.totalPages);
    }
  }, [filteredEvents.length, firstPage, goToPage, pagination.page, pagination.totalPages]);

  const paginatedEvents = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    return filteredEvents.slice(startIndex, startIndex + pagination.pageSize);
  }, [filteredEvents, pagination.page, pagination.pageSize]);

  const pageStart = filteredEvents.length === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const pageEnd = Math.min(pagination.page * pagination.pageSize, filteredEvents.length);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Compact Header */}
      <div className="flex-shrink-0 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Audit Trail
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Complete history of all configuration changes and access logs
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* My/All Toggle */}
            <div className="inline-flex items-center gap-1 p-1 glass rounded-lg border border-border">
              <button
                onClick={() => setViewMode("my")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded transition-all",
                  viewMode === "my"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                My Audit
              </button>
              <button
                onClick={() => setViewMode("all")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded transition-all",
                  viewMode === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All Audit
              </button>
            </div>
            <FilterBuilder
              fields={filterFields}
              rules={filterRules}
              onRulesChange={setFilterRules}
            />
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="flex-1 overflow-hidden glass-strong rounded-xl border border-border">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader className="sticky top-0 glass-strong z-10">
              <TableRow>
                <TableHead className="h-9 text-xs w-12"></TableHead>
                <TableHead className="h-9 text-xs">Action</TableHead>
                <TableHead className="h-9 text-xs">Table</TableHead>
                <TableHead className="h-9 text-xs">User</TableHead>
                <TableHead className="h-9 text-xs">Timestamp</TableHead>
                <TableHead className="h-9 text-xs">Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <History className="w-10 h-10 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">No audit events found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEvents.map((event) => {
                  const isExpanded = expandedEvents.has(event.id);
                  const hasChanges = event.changes !== undefined;

                  return (
                    <Fragment key={event.id}>
                      <TableRow className="group">
                        <TableCell className="py-2">
                          {hasChanges && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => toggleEvent(event.id)}
                              className="h-7 w-7 hover:bg-card-hover"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge variant="outline" className={cn("text-[10px] h-5 flex items-center gap-1 w-fit", getActionColor(event.action))}>
                            {getActionIcon(event.action)}
                            {event.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 text-xs font-medium">{event.tableName}</TableCell>
                        <TableCell className="py-2">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-foreground">{event.userName}</span>
                            <span className="text-[10px] text-muted-foreground">{event.userId}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.timestamp}
                          </span>
                        </TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground max-w-md truncate">
                          {event.reason}
                        </TableCell>
                      </TableRow>
                      {hasChanges && isExpanded && (
                        <TableRow className="bg-card/50">
                          <TableCell colSpan={6} className="py-3">
                            <div className="grid grid-cols-2 gap-3 pl-8">
                              {event.changes?.before && (
                                <div className="glass rounded-lg p-2.5 border border-destructive/20">
                                  <p className="text-xs font-medium text-destructive mb-1.5 flex items-center gap-1">
                                    <Trash2 className="w-3 h-3" />
                                    Before
                                  </p>
                                  <pre className="text-[10px] text-muted-foreground overflow-x-auto font-mono">
                                    {JSON.stringify(event.changes.before, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {event.changes?.after && (
                                <div className="glass rounded-lg p-2.5 border border-status-success/20">
                                  <p className="text-xs font-medium text-status-success mb-1.5 flex items-center gap-1">
                                    <Plus className="w-3 h-3" />
                                    After
                                  </p>
                                  <pre className="text-[10px] text-muted-foreground overflow-x-auto font-mono">
                                    {JSON.stringify(event.changes.after, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Compact Footer */}
      <div className="flex-shrink-0 mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {pageStart}-{pageEnd} of {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
        </span>
        {filteredEvents.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger className="glass border-border h-8 w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-border">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={firstPage}
                disabled={pagination.page === 1}
                className="glass-hover border-border h-7 w-7"
              >
                <ChevronsLeft className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={prevPage}
                disabled={pagination.page === 1}
                className="glass-hover border-border h-7 w-7"
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>
              <span className="min-w-[80px] text-center">
                Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={nextPage}
                disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
                className="glass-hover border-border h-7 w-7"
              >
                <ChevronRight className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={lastPage}
                disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
                className="glass-hover border-border h-7 w-7"
              >
                <ChevronsRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
