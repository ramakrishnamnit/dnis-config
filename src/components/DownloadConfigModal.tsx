import { useState, useEffect } from "react";
import { Download, CheckCircle2, Globe, Building2, Table } from "lucide-react";
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

const countries = [
  { value: "ALL", label: "All Countries" },
  { value: "UK", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "HK", label: "Hong Kong" },
  { value: "SG", label: "Singapore" },
  { value: "CN", label: "China" },
];

const businessUnits = [
  { value: "ALL", label: "All Business Units" },
  { value: "CC", label: "Corporate Center" },
  { value: "WPB", label: "Wealth & Personal Banking" },
  { value: "CMB", label: "Commercial Banking" },
  { value: "GBM", label: "Global Banking & Markets" },
];

const tables = [
  { value: "ALL", label: "All Tables" },
  { value: "UKCC_SERVICEPROFILE", label: "Service Profile" },
  { value: "UKCC_CONFIG_MAIN", label: "Main Configuration" },
  { value: "UKCC_ROUTING", label: "Routing Configuration" },
  { value: "UKCC_USERS", label: "User Management" },
];

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
  const [downloadScope, setDownloadScope] = useState<"search" | "selected" | "all">("selected");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("ALL");
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<string>("ALL");
  const [selectedTable, setSelectedTable] = useState<string>("ALL");

  // Reset selections when modal opens
  useEffect(() => {
    if (open) {
      setSelectedCountry("ALL");
      setSelectedBusinessUnit("ALL");
      setSelectedTable("ALL");
      setDownloadScope("selected");
      setIsComplete(false);
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  }, [open]);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    // Determine what to download
    let downloadMessage = "";
    if (downloadScope === "search") {
      downloadMessage = "Filtered search results";
    } else if (downloadScope === "all") {
      downloadMessage = "All countries, business units, and tables";
    } else if (downloadScope === "selected") {
      const countryText = selectedCountry === "ALL" ? "All countries" : countries.find(c => c.value === selectedCountry)?.label;
      const buText = selectedBusinessUnit === "ALL" ? "All business units" : businessUnits.find(bu => bu.value === selectedBusinessUnit)?.label;
      const tableText = selectedTable === "ALL" ? "All tables" : tables.find(t => t.value === selectedTable)?.label;
      
      downloadMessage = `${countryText}, ${buText}, ${tableText}`;
    }
    
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
              description: `${downloadMessage} - EXCEL file`,
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
      case "selected":
        const countryText = selectedCountry === "ALL" ? "All countries" : countries.find(c => c.value === selectedCountry)?.label;
        const buText = selectedBusinessUnit === "ALL" ? "All business units" : businessUnits.find(bu => bu.value === selectedBusinessUnit)?.label;
        const tableText = selectedTable === "ALL" ? "All tables" : tables.find(t => t.value === selectedTable)?.label;
        return `Download configuration data for ${countryText}, ${buText}, and ${tableText}`;
      case "all":
        return "Download all configuration data for all countries, business units, and tables";
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
      <DialogContent className="glass border-border sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Download Configuration Data
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select the scope for your configuration download (Excel format)
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
                    <RadioGroupItem value="selected" id="selected" />
                    <div className="flex-1">
                      <Label htmlFor="selected" className="text-sm font-medium text-foreground cursor-pointer">
                        Custom Selection
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Select specific countries and business units
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-hover rounded-lg p-4 border border-border">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="all" id="all" />
                    <div className="flex-1">
                      <Label htmlFor="all" className="text-sm font-medium text-foreground cursor-pointer">
                        All Data
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        All countries and business units
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>

              <div className="glass rounded-lg p-3 border border-primary/30">
                <p className="text-xs text-muted-foreground">{getScopeDescription()}</p>
              </div>
            </div>

            {/* Country, Business Unit, and Table Selection */}
            {downloadScope === "selected" && (
              <div className="space-y-4 animate-fade-in">
                {/* Country Dropdown */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    Country
                  </Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="glass border-border">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="glass border-border">
                      {countries.map((c) => (
                        <SelectItem key={c.value} value={c.value} className="hover:bg-card-hover">
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Business Unit Dropdown */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    Business Unit
                  </Label>
                  <Select value={selectedBusinessUnit} onValueChange={setSelectedBusinessUnit}>
                    <SelectTrigger className="glass border-border">
                      <SelectValue placeholder="Select business unit" />
                    </SelectTrigger>
                    <SelectContent className="glass border-border">
                      {businessUnits.map((bu) => (
                        <SelectItem key={bu.value} value={bu.value} className="hover:bg-card-hover">
                          {bu.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Table Dropdown */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Table className="w-4 h-4 text-primary" />
                    Table
                  </Label>
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger className="glass border-border">
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent className="glass border-border">
                      {tables.map((t) => (
                        <SelectItem key={t.value} value={t.value} className="hover:bg-card-hover">
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

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
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
