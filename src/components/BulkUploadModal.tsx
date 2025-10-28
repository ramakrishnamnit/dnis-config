/**
 * Modal for bulk upload via Excel template
 */

import { useState, useCallback, useRef } from "react";
import { Upload, Download, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EntityMetadata } from "@/types/metadata";
import { generateBulkUploadTemplate, generateSampleTemplate } from "@/utils/excelGenerator";
import { parseExcelFile, validateRows, generateErrorReport, type ValidationResult } from "@/utils/excelParser";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";

interface BulkUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metadata: EntityMetadata | null;
  entityName: string;
  onUpload: (rows: Record<string, any>[], editReason: string) => Promise<{ successCount: number; failureCount: number; results: any[] }>;
}

type UploadStep = "select_file" | "validating" | "review" | "uploading" | "complete";

export const BulkUploadModal = ({
  open,
  onOpenChange,
  metadata,
  entityName,
  onUpload,
}: BulkUploadModalProps) => {
  const [step, setStep] = useState<UploadStep>("select_file");
  const [file, setFile] = useState<File | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{ successCount: number; failureCount: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = useCallback(() => {
    setStep("select_file");
    setFile(null);
    setValidationResults([]);
    setUploadProgress(0);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleDownloadTemplate = useCallback(() => {
    if (metadata) {
      generateBulkUploadTemplate(metadata, entityName);
    }
  }, [metadata, entityName]);

  const handleDownloadSample = useCallback(() => {
    if (metadata) {
      generateSampleTemplate(metadata, entityName);
    }
  }, [metadata, entityName]);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    if (!metadata) return;

    setFile(selectedFile);
    setStep("validating");

    try {
      const parsedRows = await parseExcelFile(selectedFile);
      const results = validateRows(parsedRows, metadata);
      setValidationResults(results);
      setStep("review");
    } catch (error) {
      alert(`Error parsing file: ${error instanceof Error ? error.message : "Unknown error"}`);
      handleReset();
    }
  }, [metadata, handleReset]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".xls") || droppedFile.name.endsWith(".csv"))) {
      handleFileSelect(droppedFile);
    } else {
      alert("Please upload an Excel file (.xlsx, .xls, or .csv)");
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleUpload = useCallback(async (editReason: string) => {
    const validRows = validationResults.filter((r) => r.valid);
    if (validRows.length === 0) return;

    setStep("uploading");
    setUploadProgress(0);

    try {
      const rowsData = validRows.map((r) => r.data);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      const result = await onUpload(rowsData, editReason);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResult(result);
      setStep("complete");
    } catch (error) {
      alert(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      setStep("review");
    }
  }, [validationResults, onUpload]);

  const handleDownloadErrors = useCallback(() => {
    if (!metadata) return;
    const blob = generateErrorReport(validationResults, entityName);
    saveAs(blob, `${entityName}_Upload_Errors_${new Date().toISOString().split("T")[0]}.xlsx`);
  }, [validationResults, entityName, metadata]);

  const validCount = validationResults.filter((r) => r.valid).length;
  const invalidCount = validationResults.filter((r) => !r.valid).length;

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) handleReset();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] border-glow">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Upload className="w-5 h-5 text-primary glow-red" />
            Bulk Upload - {entityName}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Upload multiple records at once using an Excel template
          </DialogDescription>
        </DialogHeader>

        <Tabs value={step === "select_file" ? "upload" : "status"} className="w-full">
          <TabsList className="glass border border-border w-full">
            <TabsTrigger value="upload" className="flex-1">1. Upload File</TabsTrigger>
            <TabsTrigger value="status" disabled={step === "select_file"} className="flex-1">
              2. Review & Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 mt-4">
            {/* Download Template Section */}
            <div className="glass rounded-lg p-4 border border-border space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Download className="w-4 h-4 text-primary" />
                Step 1: Download Template
              </h3>
              <p className="text-xs text-muted-foreground">
                Download the Excel template and fill in your data following the instructions.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleDownloadTemplate}
                  variant="outline"
                  className="glass-hover border-primary/30 hover:text-primary hover:glow-red"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
                <Button
                  onClick={handleDownloadSample}
                  variant="outline"
                  size="sm"
                  className="glass-hover border-border"
                >
                  Download Sample
                </Button>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="glass rounded-lg p-4 border border-border space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                Step 2: Upload Filled Template
              </h3>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-card-hover"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-foreground mb-2">
                  Drag and drop your Excel file here
                </p>
                <p className="text-xs text-muted-foreground mb-4">or</p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="glass-hover border-primary/30"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) handleFileSelect(selectedFile);
                  }}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-4">
                  Supported formats: .xlsx, .xls, .csv
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-4 mt-4">
            {step === "validating" && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-foreground">Validating data...</p>
                <p className="text-xs text-muted-foreground">Please wait while we check your data</p>
              </div>
            )}

            {step === "review" && (
              <div className="space-y-4">
                <Alert className={cn(
                  "glass",
                  invalidCount > 0 ? "border-destructive/50" : "border-status-success/50"
                )}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="outline" className="mr-2 border-status-success/30 text-status-success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {validCount} Valid
                        </Badge>
                        {invalidCount > 0 && (
                          <Badge variant="outline" className="border-destructive/30 text-destructive">
                            <XCircle className="w-3 h-3 mr-1" />
                            {invalidCount} Invalid
                          </Badge>
                        )}
                      </div>
                      {invalidCount > 0 && (
                        <Button
                          onClick={handleDownloadErrors}
                          size="sm"
                          variant="outline"
                          className="glass-hover border-destructive/30 text-destructive"
                        >
                          <Download className="w-3 h-3 mr-2" />
                          Download Errors
                        </Button>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>

                <ScrollArea className="h-[300px] glass rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="w-16">Row</TableHead>
                        <TableHead className="w-20">Status</TableHead>
                        <TableHead>Errors</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResults.map((result) => (
                        <TableRow key={result.rowIndex} className="border-border">
                          <TableCell className="text-foreground font-mono text-sm">
                            {result.rowIndex}
                          </TableCell>
                          <TableCell>
                            {result.valid ? (
                              <CheckCircle2 className="w-4 h-4 text-status-success" />
                            ) : (
                              <XCircle className="w-4 h-4 text-destructive" />
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {result.valid ? (
                              <span className="text-muted-foreground">No errors</span>
                            ) : (
                              <ul className="space-y-1">
                                {result.errors.map((error, idx) => (
                                  <li key={idx} className="text-destructive text-xs">
                                    <strong>{error.field}:</strong> {error.message}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>

                {validCount > 0 && (
                  <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="glass-hover border-border"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        const reason = prompt("Enter reason for bulk upload (min 10 characters):");
                        if (reason && reason.length >= 10) {
                          handleUpload(reason);
                        } else {
                          alert("Edit reason must be at least 10 characters");
                        }
                      }}
                      className="glass-hover bg-primary hover:bg-primary/90 text-white"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload {validCount} Row{validCount !== 1 ? "s" : ""}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {step === "uploading" && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-foreground">Uploading rows...</p>
                <Progress value={uploadProgress} className="w-64" />
                <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
              </div>
            )}

            {step === "complete" && uploadResult && (
              <div className="space-y-4">
                <Alert className="glass border-status-success/50">
                  <CheckCircle2 className="h-4 w-4 text-status-success" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold text-foreground">Upload Complete!</p>
                      <div className="flex gap-4">
                        <Badge variant="outline" className="border-status-success/30 text-status-success">
                          {uploadResult.successCount} Successful
                        </Badge>
                        {uploadResult.failureCount > 0 && (
                          <Badge variant="outline" className="border-destructive/30 text-destructive">
                            {uploadResult.failureCount} Failed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                  <Button
                    onClick={() => {
                      handleReset();
                      onOpenChange(false);
                    }}
                    className="glass-hover bg-primary hover:bg-primary/90 text-white"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

