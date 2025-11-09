import { History, Edit, Plus, Trash2, Download, User, Clock, ChevronDown, ChevronUp, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimeRangeFilter } from "./TimeRangeFilter";

interface AuditEvent {
  id: string;
  action: "UPDATE" | "INSERT" | "DELETE" | "DOWNLOAD";
  tableName: string;
  userId: string;
  timestamp: string;
  reason: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
}

const mockAuditEvents: AuditEvent[] = [
  {
    id: "1",
    action: "UPDATE",
    tableName: "UKCC_CONFIG_MAIN",
    userId: "john.doe@hsbc.com",
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
    timestamp: "2025-01-15 11:45:33",
    reason: "Audit compliance check",
  },
  {
    id: "4",
    action: "DELETE",
    tableName: "UKCC_DEPRECATED_CONFIG",
    userId: "john.doe@hsbc.com",
    timestamp: "2025-01-14 16:20:15",
    reason: "Removed obsolete configuration entries",
    changes: {
      before: { config_id: "OLD_001", status: "deprecated" },
    },
  },
];

const getActionIcon = (action: string) => {
  switch (action) {
    case "UPDATE":
      return <Edit className="w-4 h-4" />;
    case "INSERT":
      return <Plus className="w-4 h-4" />;
    case "DELETE":
      return <Trash2 className="w-4 h-4" />;
    case "DOWNLOAD":
      return <Download className="w-4 h-4" />;
    default:
      return <History className="w-4 h-4" />;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case "UPDATE":
      return "border-status-warning/30 text-status-warning";
    case "INSERT":
      return "border-status-success/30 text-status-success";
    case "DELETE":
      return "border-destructive/30 text-destructive";
    case "DOWNLOAD":
      return "border-status-info/30 text-status-info";
    default:
      return "border-muted-foreground/30";
  }
};

export const AuditTrailViewer = () => {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const currentUser = "john.doe@hsbc.com"; // Mock current user
  
  // View mode state
  const [viewMode, setViewMode] = useState<"my" | "all">("all");
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [tableNameFilter, setTableNameFilter] = useState<string>("");
  const [userIdFilter, setUserIdFilter] = useState<string>("");
  const [reasonFilter, setReasonFilter] = useState<string>("");
  
  // Time range filter states
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  
  // Sort states
  const [sortBy, setSortBy] = useState<"timestamp" | "action" | "tableName" | "userId">("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Apply filters and sorting
  const applyFiltersAndSort = (events: AuditEvent[]) => {
    let filtered = events;
    
    // Apply view mode filter first
    if (viewMode === "my") {
      filtered = filtered.filter(event => event.userId === currentUser);
    }
    
    // Apply other filters
    filtered = filtered.filter(event => {
      if (actionFilter !== "all" && event.action !== actionFilter) return false;
      if (tableNameFilter && !event.tableName.toLowerCase().includes(tableNameFilter.toLowerCase())) return false;
      if (userIdFilter && !event.userId.toLowerCase().includes(userIdFilter.toLowerCase())) return false;
      if (reasonFilter && !event.reason.toLowerCase().includes(reasonFilter.toLowerCase())) return false;
      
      // Time range filtering
      if (fromDate || toDate) {
        const eventDate = new Date(event.timestamp);
        if (fromDate && eventDate < new Date(fromDate)) return false;
        if (toDate && eventDate > new Date(toDate)) return false;
      }
      
      return true;
    });

    // Apply sorting
    const sortField = sortBy;
    const parseSortableValue = (event: AuditEvent): string | number => {
      if (sortField === "timestamp") {
        return new Date(event.timestamp).getTime();
      }
      const value = event[sortField];
      return typeof value === "string" ? value.toLowerCase() : String(value);
    };

    const sorted = [...filtered].sort((a, b) => {
      const aValue = parseSortableValue(a);
      const bValue = parseSortableValue(b);

      if (typeof aValue === "number" && typeof bValue === "number") {
        return aValue - bValue;
      }

      return String(aValue).localeCompare(String(bValue));
    });

    return sortDirection === "asc" ? sorted : sorted.reverse();
  };

  const filteredEvents = applyFiltersAndSort(mockAuditEvents);
  
  // Pagination logic
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  const toggleEvent = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const renderAuditTimeline = (events: AuditEvent[]) => (
    <div className="relative space-y-3">
      <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
      {events.map((event, index) => {
        const isExpanded = expandedEvents.has(event.id);
        const hasChanges = event.changes !== undefined;

        return (
          <div key={event.id} className="relative pl-16 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <div className={`absolute left-4 w-5 h-5 rounded-full glass border-2 ${getActionColor(event.action)} flex items-center justify-center`}>
              {getActionIcon(event.action)}
            </div>
            <div className="glass-hover rounded-xl p-3 border border-border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={getActionColor(event.action)}>
                      {event.action}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">{event.tableName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.userId}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {event.reason}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {event.timestamp}
                    </span>
                  </div>
                </div>
                {hasChanges && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleEvent(event.id)}
                    className="glass-hover"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                )}
              </div>
              {hasChanges && isExpanded && (
                <div className="mt-3 space-y-2 pt-3 border-t border-border animate-slide-up">
                  {event.changes?.before && (
                    <div className="glass rounded-lg p-2 border border-destructive/20">
                      <p className="text-xs font-medium text-destructive mb-1">Before:</p>
                      <pre className="text-xs text-muted-foreground overflow-x-auto">
                        {JSON.stringify(event.changes.before, null, 2)}
                      </pre>
                    </div>
                  )}
                  {event.changes?.after && (
                    <div className="glass rounded-lg p-2 border border-status-success/20">
                      <p className="text-xs font-medium text-status-success mb-1">After:</p>
                      <pre className="text-xs text-muted-foreground overflow-x-auto">
                        {JSON.stringify(event.changes.after, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col space-y-4 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Audit Trail
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Complete history of all configuration changes and access logs
        </p>
      </div>

      {/* View Mode Tabs */}
      <div className="flex-shrink-0">
        <div className="inline-flex items-center gap-1 p-1 glass rounded-lg border border-border">
          <button
            onClick={() => {
              setViewMode("all");
              setCurrentPage(1);
            }}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded transition-all",
              viewMode === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All Audit
          </button>
          <button
            onClick={() => {
              setViewMode("my");
              setCurrentPage(1);
            }}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded transition-all",
              viewMode === "my"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            My Audit
          </button>
        </div>
      </div>

      {/* Filters - Compact Collapsible Box */}
      <div className="flex-shrink-0">
        <div className="glass rounded-lg border border-border">
          {/* Filter Header - Always Visible */}
          <div className="flex items-center justify-between p-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Filter className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Filters</span>
              {showFilters ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
              {(actionFilter !== "all" || tableNameFilter || userIdFilter || reasonFilter || fromDate || toDate) && (
                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/30">
                  Active
                </Badge>
              )}
            </button>
            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-8 w-[140px] glass border-border focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass border-border">
                    <SelectItem value="timestamp">Timestamp</SelectItem>
                    <SelectItem value="action">Action</SelectItem>
                    <SelectItem value="tableName">Table Name</SelectItem>
                    <SelectItem value="userId">User ID</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                  className="h-8 w-8 p-0 hover:bg-card-hover"
                  title={sortDirection === "asc" ? "Ascending" : "Descending"}
                >
                  {sortDirection === "asc" ? (
                    <ChevronUp className="w-4 h-4 text-primary" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-primary" />
                  )}
                </Button>
              </div>
              
              <div className="w-px h-6 bg-border" />
              
              <TimeRangeFilter
                fromDate={fromDate}
                toDate={toDate}
                onFromDateChange={setFromDate}
                onToDateChange={setToDate}
                onClear={() => {
                  setFromDate("");
                  setToDate("");
                }}
              />
              {(actionFilter !== "all" || tableNameFilter || userIdFilter || reasonFilter || fromDate || toDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActionFilter("all");
                    setTableNameFilter("");
                    setUserIdFilter("");
                    setReasonFilter("");
                    setFromDate("");
                    setToDate("");
                    setCurrentPage(1);
                  }}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Filter Content - Collapsible */}
          {showFilters && (
            <div className="px-3 pb-3 pt-0 border-t border-border/50 animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Action Type</label>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="h-9 glass border-border focus:border-primary">
                      <SelectValue placeholder="All Actions" />
                    </SelectTrigger>
                    <SelectContent className="glass border-border">
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="UPDATE">Update</SelectItem>
                      <SelectItem value="INSERT">Insert</SelectItem>
                      <SelectItem value="DELETE">Delete</SelectItem>
                      <SelectItem value="DOWNLOAD">Download</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Table Name</label>
                  <Input
                    placeholder="Filter by table..."
                    value={tableNameFilter}
                    onChange={(e) => setTableNameFilter(e.target.value)}
                    className="h-9 glass border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">User ID</label>
                  <Input
                    placeholder="Filter by user..."
                    value={userIdFilter}
                    onChange={(e) => setUserIdFilter(e.target.value)}
                    className="h-9 glass border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">User Name</label>
                  <Input
                    placeholder="Filter by user name..."
                    value={reasonFilter}
                    onChange={(e) => setReasonFilter(e.target.value)}
                    className="h-9 glass border-border focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit Trail Content */}
      <div className="flex-1 overflow-auto min-h-0">
        {paginatedEvents.length > 0 ? (
          renderAuditTimeline(paginatedEvents)
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No audit events found
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredEvents.length > 0 && (
        <div className="flex-shrink-0 flex items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredEvents.length)} of {filteredEvents.length} events
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="glass border-border w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass border-border">
                <SelectItem value="5">5 / page</SelectItem>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="glass-hover"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="glass-hover"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
