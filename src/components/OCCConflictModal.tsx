/**
 * Optimistic Concurrency Control (OCC) Conflict Modal
 * Displays when a version conflict is detected during save
 */

import { AlertTriangle, RefreshCw, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OCCConflict } from "@/types/metadata";

interface OCCConflictModalProps {
  open: boolean;
  conflict: OCCConflict | null;
  onRetry: () => void;
  onRefresh: () => void;
  onCancel: () => void;
}

export const OCCConflictModal = ({
  open,
  conflict,
  onRetry,
  onRefresh,
  onCancel,
}: OCCConflictModalProps) => {
  if (!conflict) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="glass border-destructive/30 max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-xl text-foreground">Version Conflict Detected</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                This record has been modified by another user
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="glass border-destructive/30">
            <AlertDescription className="text-sm text-foreground">
              {conflict.message}
            </AlertDescription>
          </Alert>

          <div className="glass rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Your version:</span>
              <span className="font-mono font-semibold text-foreground">v{conflict.attemptedVersion}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Current version:</span>
              <span className="font-mono font-semibold text-primary">v{conflict.currentVersion}</span>
            </div>
            {conflict.conflictingFields.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Conflicting fields:</p>
                <div className="flex flex-wrap gap-2">
                  {conflict.conflictingFields.map((field) => (
                    <span
                      key={field}
                      className="px-2 py-1 rounded-md bg-destructive/10 text-xs font-medium text-destructive"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="glass rounded-lg p-4 border-status-info/30">
            <p className="text-sm text-foreground">
              <strong className="text-status-info">What should you do?</strong>
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>Click <strong>Refresh</strong> to load the latest version and see changes made by others</li>
              <li>Click <strong>Retry</strong> to attempt saving your changes again (may overwrite others)</li>
              <li>Click <strong>Cancel</strong> to discard your changes</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            onClick={onCancel}
            variant="outline"
            className="glass-hover border-border"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={onRetry}
            variant="outline"
            className="glass-hover border-primary/30 text-primary hover:text-primary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Save
          </Button>
          <Button
            onClick={onRefresh}
            className="bg-primary hover:bg-primary/90 text-primary-foreground glow-red"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
