import { History, Edit, Plus, Trash2, Download, User, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  const toggleEvent = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Audit Trail
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Complete history of all configuration changes and access logs
        </p>
      </div>

      {/* Timeline */}
      <div className="relative space-y-4">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

        {mockAuditEvents.map((event, index) => {
          const isExpanded = expandedEvents.has(event.id);
          const hasChanges = event.changes !== undefined;

          return (
            <div key={event.id} className="relative pl-16 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              {/* Timeline Dot */}
              <div className={`absolute left-4 w-5 h-5 rounded-full glass border-2 ${getActionColor(event.action)} flex items-center justify-center`}>
                {getActionIcon(event.action)}
              </div>

              {/* Event Card */}
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
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>

                {/* JSON Diff Panel */}
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
    </div>
  );
};
