import { History, Edit, Plus, Trash2, Download, User, Clock, ChevronDown, ChevronUp, Filter, ChevronLeft, ChevronRight } from "lucide-react";
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

interface AuditEvent {
  id: string;
  action: "UPDATE" | "INSERT" | "DELETE" | "DOWNLOAD";
  tableName: string;
  userId: string;
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
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [tableNameFilter, setTableNameFilter] = useState<string>("");
  const [userIdFilter, setUserIdFilter] = useState<string>("");
  const [reasonFilter, setReasonFilter] = useState<string>("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Apply filters
  const applyFilters = (events: AuditEvent[]) => {
    let filtered = events;
    
    // Apply view mode filter first
    if (viewMode === "my") {
      filtered = filtered.filter(event => event.userId === currentUser);
    }
    
    // Apply other filters
    return filtered.filter(event => {
      if (actionFilter !== "all" && event.action !== actionFilter) return false;
      if (tableNameFilter && !event.tableName.toLowerCase().includes(tableNameFilter.toLowerCase())) return false;
      if (userIdFilter && !event.userId.toLowerCase().includes(userIdFilter.toLowerCase())) return false;
      if (reasonFilter && !event.reason.toLowerCase().includes(reasonFilter.toLowerCase())) return false;
      return true;
    });
  };

  const filteredEvents = applyFilters(mockAuditEvents);
  
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
    <div className="relative space-y-4">
      <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
      {events.map((event, index) => {
        const isExpanded = expandedEvents.has(event.id);
        const hasChanges = event.changes !== undefined;

        return (
          <div key={event.id} className="relative pl-16 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <div className={`absolute left-4 w-5 h-5 rounded-full glass border-2 ${getActionColor(event.action)} flex items-center justify-center`}>
              {getActionIcon(event.action)}
            </div>
            <div className="glass-hover rounded-xl p-5 border border-border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={getActionColor(event.action)}>
                      {event.action}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">{event.tableName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.reason}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {event.userId}
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
                <div className="mt-4 space-y-3 pt-4 border-t border-border animate-slide-up">
                  {event.changes?.before && (
                    <div className="glass rounded-lg p-3 border border-destructive/20">
                      <p className="text-xs font-medium text-destructive mb-2">Before:</p>
                      <pre className="text-xs text-muted-foreground overflow-x-auto">
                        {JSON.stringify(event.changes.before, null, 2)}
                      </pre>
                    </div>
                  )}
                  {event.changes?.after && (
                    <div className="glass rounded-lg p-3 border border-status-success/20">
                      <p className="text-xs font-medium text-status-success mb-2">After:</p>
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

      {/* Filters */}
      <div className="flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Action Type</label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="glass border-border focus:border-primary">
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
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Table Name</label>
            <Input
              placeholder="Filter by table..."
              value={tableNameFilter}
              onChange={(e) => setTableNameFilter(e.target.value)}
              className="glass border-border focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">User ID</label>
            <Input
              placeholder="Filter by user..."
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              className="glass border-border focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Reason</label>
            <Input
              placeholder="Filter by reason..."
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="glass border-border focus:border-primary"
            />
          </div>
        </div>
        {(actionFilter !== "all" || tableNameFilter || userIdFilter || reasonFilter) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActionFilter("all");
              setTableNameFilter("");
              setUserIdFilter("");
              setReasonFilter("");
              setCurrentPage(1);
            }}
            className="mt-4 glass-hover border-primary/30 text-foreground hover:text-primary"
          >
            Clear Filters
          </Button>
        )}
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
