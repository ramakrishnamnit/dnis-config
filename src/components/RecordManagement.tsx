import { Plus, Upload, History, Edit, Eye, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Record {
  id: string;
  key: string;
  value: string;
  version: string;
  lastUpdated: string;
  updatedBy: string;
}

interface RecordManagementProps {
  tableName: string;
  records: Record[];
  onAddRecord: () => void;
  onBulkUpload: () => void;
  onViewAudit: () => void;
}

export const RecordManagement = ({
  tableName,
  records,
  onAddRecord,
  onBulkUpload,
  onViewAudit,
}: RecordManagementProps) => {
  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{tableName}</h2>
          <p className="text-sm text-muted-foreground">{records.length} records</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onAddRecord}
            variant="outline"
            className="glass-hover border-primary/30 hover:text-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Record
          </Button>

          <Button
            onClick={onBulkUpload}
            variant="outline"
            className="glass-hover border-border"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>

          <Button
            onClick={onViewAudit}
            variant="outline"
            className="glass-hover border-border"
          >
            <History className="w-4 h-4 mr-2" />
            Audit Trail
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-card-hover">
                <TableHead className="text-muted-foreground font-semibold">Key</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Value</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Version</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Last Updated</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Updated By</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id} className="border-border hover:bg-card-hover transition-colors">
                  <TableCell className="font-medium text-foreground">{record.key}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {record.value}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      v{record.version}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{record.lastUpdated}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{record.updatedBy}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="glass-hover"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass border-border">
                        <DropdownMenuItem className="hover:bg-card-hover text-foreground">
                          <Eye className="w-4 h-4 mr-2" />
                          View JSON
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-card-hover text-foreground">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-card-hover text-foreground">
                          <History className="w-4 h-4 mr-2" />
                          View History
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-destructive/10 text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {records.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No records found</p>
          </div>
        )}
      </div>
    </div>
  );
};
