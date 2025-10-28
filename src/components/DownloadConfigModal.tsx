import { useState } from "react";
import { Download, FileSpreadsheet, FileText, X, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface DownloadConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country: string;
  businessUnit: string;
  hasSearchFilter: boolean;
}

export const DownloadConfigModal = ({
  open,
  onOpenChange,
  country,
  businessUnit,
  hasSearchFilter,
}: DownloadConfigModalProps) => {
  const [downloadScope, setDownloadScope] = useState<"search" | "country" | "full">("search");
  const [format, setFormat] = useState<"excel" | "csv">("excel");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          setIsComplete(true);
          setTimeout(() => {
            setIsComplete(false);
            onOpenChange(false);
            toast.success("Configuration data downloaded successfully", {
              description: `Downloaded as ${format.toUpperCase()} file`,
            });
          }, 1500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getScopeDescription = () => {
    switch (downloadScope) {
      case "search":
        return "Download filtered results based on current search and column filters";
      case "country":
        return `Download all configuration data for ${country} (all business units)`;
      case "full":
        return `Download all data for ${country} - ${businessUnit}`;
      default:
        return "";
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isDownloading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setDownloadProgress(0);
        setIsComplete(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="glass border-border sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Download Configuration Data
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select the scope and format for your configuration download
          </DialogDescription>
        </DialogHeader>

        {!isComplete ? (
          <div className="space-y-6 py-4">
            {/* Download Scope */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Download Scope</Label>
              <RadioGroup value={downloadScope} onValueChange={(value: any) => setDownloadScope(value)}>
                <div className="glass-hover rounded-lg p-4 border border-border">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="search" id="search" disabled={!hasSearchFilter} />
                    <div className="flex-1">
                      <Label
                        htmlFor="search"
                        className={`text-sm font-medium cursor-pointer ${
                          !hasSearchFilter ? "text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        Current Search Results
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {hasSearchFilter
                          ? "Download only the filtered records"
                          : "No active search filters"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-hover rounded-lg p-4 border border-border">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="country" id="country" />
                    <div className="flex-1">
                      <Label htmlFor="country" className="text-sm font-medium text-foreground cursor-pointer">
                        Region-Specific ({country})
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        All business units in selected country
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-hover rounded-lg p-4 border border-border">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="full" id="full" />
                    <div className="flex-1">
                      <Label htmlFor="full" className="text-sm font-medium text-foreground cursor-pointer">
                        Complete Dataset ({country} - {businessUnit})
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        All records for selected region and business unit
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>

              <div className="glass rounded-lg p-3 border border-primary/30">
                <p className="text-xs text-muted-foreground">{getScopeDescription()}</p>
              </div>
            </div>

            {/* File Format */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">File Format</Label>
              <Select value={format} onValueChange={(value: any) => setFormat(value)}>
                <SelectTrigger className="glass border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-border">
                  <SelectItem value="excel" className="hover:bg-card-hover">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-status-success" />
                      Excel (.xlsx)
                    </div>
                  </SelectItem>
                  <SelectItem value="csv" className="hover:bg-card-hover">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-status-info" />
                      CSV (.csv)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Download Progress */}
            {isDownloading && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Downloading...</span>
                  <span className="text-primary font-medium">{downloadProgress}%</span>
                </div>
                <Progress value={downloadProgress} className="h-2" />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isDownloading}
                className="glass-hover border-border"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground glow-red"
              >
                {isDownloading ? (
                  <>
                    <Download className="w-4 h-4 mr-2 animate-pulse" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Start Download
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center animate-fade-in">
            <CheckCircle2 className="w-16 h-16 text-status-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Download Complete!</h3>
            <p className="text-sm text-muted-foreground">
              Your configuration data has been downloaded successfully
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
