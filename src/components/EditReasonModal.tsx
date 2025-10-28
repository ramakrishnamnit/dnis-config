/**
 * Modal to capture edit reason for audit compliance
 */

import { useState, useEffect } from "react";
import { AlertCircle, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 500;

export const EditReasonModal = ({
  open,
  onOpenChange,
  onSubmit,
  title = "Provide Edit Reason",
  description = "Please provide a reason for this change. This is required for audit compliance.",
  isLoading = false,
}: EditReasonModalProps) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setReason("");
      setError(null);
    }
  }, [open]);

  const validateReason = (): boolean => {
    if (reason.trim().length < MIN_REASON_LENGTH) {
      setError(`Reason must be at least ${MIN_REASON_LENGTH} characters`);
      return false;
    }
    if (reason.length > MAX_REASON_LENGTH) {
      setError(`Reason must not exceed ${MAX_REASON_LENGTH} characters`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = () => {
    if (validateReason()) {
      onSubmit(reason.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const remainingChars = MAX_REASON_LENGTH - reason.length;
  const isValidLength = reason.trim().length >= MIN_REASON_LENGTH;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <FileText className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-foreground">
              Edit Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter the reason for this change (minimum 10 characters)..."
              className="glass border-border focus:border-primary focus:glow-red min-h-[120px] resize-none"
              maxLength={MAX_REASON_LENGTH}
              disabled={isLoading}
              autoFocus
            />
            <div className="flex items-center justify-between text-xs">
              <span
                className={`${
                  isValidLength ? "text-status-success" : "text-muted-foreground"
                }`}
              >
                {reason.trim().length} / {MIN_REASON_LENGTH} characters (minimum)
              </span>
              <span
                className={`${
                  remainingChars < 50 ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {remainingChars} remaining
              </span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="glass border-destructive/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert className="glass border-primary/30">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-xs text-muted-foreground">
              This information will be recorded in the audit trail for compliance purposes.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="glass-hover border-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValidLength || isLoading}
            className="glass-hover bg-primary hover:bg-primary/90 text-white"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>

        {!isLoading && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            Press <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl</kbd> +{" "}
            <kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> to submit
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

