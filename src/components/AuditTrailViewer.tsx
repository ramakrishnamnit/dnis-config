import { History, Edit, Plus, Trash2, Download, User, Clock, ChevronDown, ChevronUp, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="relative space-y-3">
      <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
      {events.map((event, index) => {
        const isExpanded = expandedEvents.has(event.id);
        const hasChanges = event.changes !== undefined;

        return (
          <div key={event.id} className="relative pl-16 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <div className={`absolute left-4 w-5 h-5 rounded-full glass-card border-2 ${getActionColor(event.action)} flex items-center justify-center shadow-glass`}>
              {getActionIcon(event.action)}
            </div>
            <div className="glass-panel rounded-xl p-5 border-glow hover:shadow-glass transition-all duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`${getActionColor(event.action)} font-medium`}>
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
                    className="glass-hover hover:bg-card-hover"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                )}
              </div>
              {hasChanges && isExpanded && (
                <div className="mt-4 space-y-3 pt-4 border-t border-border animate-slide-up">
                  {event.changes?.before && (
                    <div className="glass-card rounded-lg p-3 border border-destructive/30 shadow-glass">
                      <p className="text-xs font-semibold text-destructive mb-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                        Before:
                      </p>
                      <pre className="text-xs text-foreground overflow-x-auto font-mono bg-background/50 p-2 rounded">
                        {JSON.stringify(event.changes.before, null, 2)}
                      </pre>
                    </div>
                  )}
                  {event.changes?.after && (
                    <div className="glass-card rounded-lg p-3 border border-status-success/30 shadow-glass">
                      <p className="text-xs font-semibold text-status-success mb-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>
                        After:
                      </p>
                      <pre className="text-xs text-foreground overflow-x-auto font-mono bg-background/50 p-2 rounded">
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
    <div className="flex flex-col space-y-3 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Audit Trail
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Complete history of all configuration changes and access logs
        </p>
      </div>

      <Tabs 
        value={viewMode} 
        onValueChange={(value) => {
          setViewMode(value as "my" | "all");
          setCurrentPage(1);
        }}
        className="flex-1 overflow-hidden flex flex-col"
      >
        {/* View Mode Tabs */}
        <div className="flex-shrink-0">
          <TabsList className="glass-panel border border-border/50 w-fit h-9 shadow-glass">
            <TabsTrigger value="my" className="text-xs h-7 px-4 data-[state=active]:glow-red">
              My Audit
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs h-7 px-4 data-[state=active]:glow-red">
              All Audit
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Filters */}
        <div className="flex-shrink-0 mt-3">
          <div className="glass-card rounded-xl p-4 border border-border shadow-glass">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Filters</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Action Type</label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="glass-panel border-border focus:border-primary focus:glow-red">
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-border">
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
                  className="glass-panel border-border focus:border-primary focus:glow-red"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">User ID</label>
                <Input
                  placeholder="Filter by user..."
                  value={userIdFilter}
                  onChange={(e) => setUserIdFilter(e.target.value)}
                  className="glass-panel border-border focus:border-primary focus:glow-red"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Reason</label>
                <Input
                  placeholder="Filter by reason..."
                  value={reasonFilter}
                  onChange={(e) => setReasonFilter(e.target.value)}
                  className="glass-panel border-border focus:border-primary focus:glow-red"
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
                className="mt-3 glass-hover border-primary/30 text-primary hover:glow-red"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="my" className="flex-1 overflow-hidden flex flex-col mt-3">
          {/* Audit Trail Content */}
          <div className="flex-1 overflow-auto min-h-0">
            {paginatedEvents.length > 0 ? (
              renderAuditTimeline(paginatedEvents)
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                  <History className="w-12 h-12 text-muted-foreground/50 mx-auto" />
                  <p className="text-muted-foreground">No audit events found</p>
                  <p className="text-xs text-muted-foreground/70">Your changes will appear here</p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {filteredEvents.length > 0 && (
            <div className="flex-shrink-0 flex items-center justify-between gap-4 pt-4 mt-4 border-t border-border">
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
                  <SelectTrigger className="glass-panel border-border w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-border">
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
                  className="glass-hover border-border"
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
                  className="glass-hover border-border"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="flex-1 overflow-hidden flex flex-col mt-3">
          {/* Audit Trail Content */}
          <div className="flex-1 overflow-auto min-h-0">
            {paginatedEvents.length > 0 ? (
              renderAuditTimeline(paginatedEvents)
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center space-y-2">
                  <History className="w-12 h-12 text-muted-foreground/50 mx-auto" />
                  <p className="text-muted-foreground">No audit events found</p>
                  <p className="text-xs text-muted-foreground/70">All configuration changes will appear here</p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {filteredEvents.length > 0 && (
            <div className="flex-shrink-0 flex items-center justify-between gap-4 pt-4 mt-4 border-t border-border">
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
                  <SelectTrigger className="glass-panel border-border w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-border">
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
                  className="glass-hover border-border"
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
                  className="glass-hover border-border"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
