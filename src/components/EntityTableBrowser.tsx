import { Database, Lock, Unlock, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TableEntity {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  isEditable: boolean;
  recordCount: number;
}

interface EntityTableBrowserProps {
  tables: TableEntity[];
  onTableSelect: (tableId: string) => void;
  selectedTableId?: string;
}

export const EntityTableBrowser = ({
  tables,
  onTableSelect,
  selectedTableId,
}: EntityTableBrowserProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Configuration Tables
        </h2>
        <Badge variant="outline" className="border-primary/30">
          {tables.length} Tables
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => onTableSelect(table.id)}
            className={`
              glass-hover rounded-xl p-5 text-left group relative overflow-hidden
              transition-all duration-300 border
              ${
                selectedTableId === table.id
                  ? "border-primary glow-red"
                  : "border-border hover:border-primary/50"
              }
            `}
          >
            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <Database className="w-5 h-5 text-primary flex-shrink-0" />
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {table.name}
                  </h3>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {table.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  {table.isEditable ? (
                    <Badge variant="outline" className="text-xs border-status-success/30 text-status-success">
                      <Unlock className="w-3 h-3 mr-1" />
                      Editable
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs border-muted-foreground/30">
                      <Lock className="w-3 h-3 mr-1" />
                      Read-only
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {table.recordCount} records
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {table.lastModified}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="glass rounded-xl p-12 text-center border border-border">
          <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Tables Found</h3>
          <p className="text-sm text-muted-foreground">
            Select a Country and Business Unit to view configuration tables
          </p>
        </div>
      )}
    </div>
  );
};
