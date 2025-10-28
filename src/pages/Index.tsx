import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { RegionSelector } from "@/components/RegionSelector";
import { MetadataDrivenTable } from "@/components/MetadataDrivenTable";
import { AudioAssetManager } from "@/components/AudioAssetManager";
import { AuditTrailViewer } from "@/components/AuditTrailViewer";
import { DownloadConfigModal } from "@/components/DownloadConfigModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock data
const mockTables = [
  {
    id: "1",
    name: "UKCC_CONFIG_MAIN",
    description: "Main configuration table for UK Corporate Center operations",
    lastModified: "2h ago",
    isEditable: true,
    recordCount: 156,
  },
  {
    id: "2",
    name: "UKCC_ROUTING_RULES",
    description: "Call routing rules and priority configurations",
    lastModified: "5h ago",
    isEditable: true,
    recordCount: 89,
  },
  {
    id: "3",
    name: "UKCC_AUDIO_ASSETS",
    description: "Audio file references for IVR and voice prompts",
    lastModified: "1d ago",
    isEditable: false,
    recordCount: 234,
  },
  {
    id: "4",
    name: "UKCC_BUSINESS_HOURS",
    description: "Operating hours and holiday schedules",
    lastModified: "3d ago",
    isEditable: true,
    recordCount: 42,
  },
  {
    id: "5",
    name: "UKCC_QUEUE_CONFIG",
    description: "Queue management and overflow settings",
    lastModified: "6h ago",
    isEditable: true,
    recordCount: 67,
  },
  {
    id: "6",
    name: "UKCC_AGENT_SKILLS",
    description: "Agent skill mappings and proficiency levels",
    lastModified: "4h ago",
    isEditable: true,
    recordCount: 198,
  },
];

// Mock column configuration (would come from backend)
const mockColumns = [
  {
    key: "id",
    label: "ID",
    type: "number" as const,
    isEditable: false,
    isSortable: true,
    isFilterable: true,
  },
  {
    key: "key",
    label: "Configuration Key",
    type: "string" as const,
    isEditable: false,
    isSortable: true,
    isFilterable: true,
  },
  {
    key: "value",
    label: "Value",
    type: "string" as const,
    isEditable: true,
    isSortable: false,
    isFilterable: true,
  },
  {
    key: "version",
    label: "Version",
    type: "string" as const,
    isEditable: false,
    isSortable: true,
    isFilterable: false,
  },
  {
    key: "lastUpdated",
    label: "Last Updated",
    type: "date" as const,
    isEditable: false,
    isSortable: true,
    isFilterable: false,
  },
  {
    key: "updatedBy",
    label: "Updated By",
    type: "string" as const,
    isEditable: false,
    isSortable: true,
    isFilterable: true,
  },
];

// Generate more mock records to simulate large dataset
const generateMockRecords = (count: number) => {
  const keys = [
    "MAX_QUEUE_TIME", "RETRY_ATTEMPTS", "CALLBACK_ENABLED", "OVERFLOW_THRESHOLD",
    "DEFAULT_TIMEOUT", "MAX_CONCURRENT_CALLS", "ENABLE_RECORDING", "QUEUE_PRIORITY",
    "AGENT_TIMEOUT", "CALL_TRANSFER_ENABLED", "IVR_TIMEOUT", "MAX_HOLD_TIME",
    "SKILL_BASED_ROUTING", "AFTER_CALL_WORK_TIME", "SLA_THRESHOLD", "ABANDON_RATE_LIMIT"
  ];
  
  const users = ["john.doe@hsbc.com", "jane.smith@hsbc.com", "admin@hsbc.com", "ops.team@hsbc.com"];
  
  return Array.from({ length: count }, (_, i) => ({
    id: (i + 1).toString(),
    key: `${keys[i % keys.length]}_${Math.floor(i / keys.length) + 1}`,
    value: i % 3 === 0 ? "true" : i % 5 === 0 ? "false" : (Math.floor(Math.random() * 1000)).toString(),
    version: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}`,
    lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ` ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    updatedBy: users[Math.floor(Math.random() * users.length)],
  }));
};

const allMockRecords = generateMockRecords(156); // Total records matching UKCC_CONFIG_MAIN count

const Index = () => {
  const [country, setCountry] = useState("UK");
  const [businessUnit, setBusinessUnit] = useState("CC");
  const [selectedTableId, setSelectedTableId] = useState<string>();
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const selectedTable = mockTables.find((t) => t.id === selectedTableId);
  const filteredTables = country && businessUnit ? mockTables : [];

  // Simulate backend filtering and pagination
  const getFilteredRecords = () => {
    let filtered = [...allMockRecords];
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(record => 
          String(record[key]).toLowerCase().includes(value.toLowerCase())
        );
      }
    });
    
    return filtered;
  };
  
  const filteredRecords = getFilteredRecords();
  const totalRecords = filteredRecords.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  
  // Get paginated records
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + pageSize);
  
  // Simulate API delay for filtering
  const handleFilterChange = (newFilters: Record<string, string>) => {
    setIsLoading(true);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };
  
  const handlePageChange = (page: number) => {
    setIsLoading(true);
    setCurrentPage(page);
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };
  
  const handlePageSizeChange = (newPageSize: number) => {
    setIsLoading(true);
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen">
      <Header theme={theme} onThemeChange={setTheme} />

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="glass border border-border">
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-8">
            {/* Config-specific Search and Download */}
            <div className="glass rounded-xl p-6 border border-border">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search configuration tables..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 glass border-border focus:border-primary focus:glow-red transition-all"
                  />
                </div>
                <Button
                  onClick={() => setDownloadModalOpen(true)}
                  variant="outline"
                  className="glass-hover border-primary/30 text-foreground hover:text-primary hover:glow-red"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Config
                </Button>
              </div>
            </div>

            {/* Region & Table Selector */}
            <RegionSelector
              country={country}
              businessUnit={businessUnit}
              onCountryChange={setCountry}
              onBusinessUnitChange={setBusinessUnit}
              tables={filteredTables}
              selectedTableId={selectedTableId}
              onTableSelect={setSelectedTableId}
            />

            {/* Metadata-Driven Dynamic Table */}
            {selectedTable && (
              <div className="glass rounded-xl p-6 border border-border">
                <MetadataDrivenTable
                  entityId={selectedTable.name}
                  country={country}
                  businessUnit={businessUnit}
                  onViewAudit={() => {}}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="audio">
            <div className="glass rounded-xl p-6 border border-border">
              <AudioAssetManager />
            </div>
          </TabsContent>

          <TabsContent value="audit">
            <div className="glass rounded-xl p-6 border border-border">
              <AuditTrailViewer />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Download Config Modal */}
      <DownloadConfigModal
        open={downloadModalOpen}
        onOpenChange={setDownloadModalOpen}
        country={country}
        businessUnit={businessUnit}
        hasSearchFilter={searchQuery.length > 0}
      />
    </div>
  );
};

export default Index;
