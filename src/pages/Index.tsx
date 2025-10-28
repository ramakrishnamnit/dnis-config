import { useState } from "react";
import { Header } from "@/components/Header";
import { RegionSelector } from "@/components/RegionSelector";
import { EntityTableBrowser } from "@/components/EntityTableBrowser";
import { RecordManagement } from "@/components/RecordManagement";
import { AudioAssetManager } from "@/components/AudioAssetManager";
import { AuditTrailViewer } from "@/components/AuditTrailViewer";
import { DownloadConfigModal } from "@/components/DownloadConfigModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const mockRecords = [
  {
    id: "1",
    key: "MAX_QUEUE_TIME",
    value: "300",
    version: "2.1",
    lastUpdated: "2025-01-15 14:30",
    updatedBy: "john.doe@hsbc.com",
  },
  {
    id: "2",
    key: "RETRY_ATTEMPTS",
    value: "3",
    version: "1.5",
    lastUpdated: "2025-01-15 13:15",
    updatedBy: "jane.smith@hsbc.com",
  },
  {
    id: "3",
    key: "CALLBACK_ENABLED",
    value: "true",
    version: "3.0",
    lastUpdated: "2025-01-14 16:45",
    updatedBy: "admin@hsbc.com",
  },
  {
    id: "4",
    key: "OVERFLOW_THRESHOLD",
    value: "50",
    version: "2.3",
    lastUpdated: "2025-01-14 11:20",
    updatedBy: "john.doe@hsbc.com",
  },
];

const Index = () => {
  const [country, setCountry] = useState("UK");
  const [businessUnit, setBusinessUnit] = useState("CC");
  const [selectedTableId, setSelectedTableId] = useState<string>();
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  const selectedTable = mockTables.find((t) => t.id === selectedTableId);
  const filteredTables = country && businessUnit ? mockTables : [];

  return (
    <div className="min-h-screen">
      <Header
        onDownloadClick={() => setDownloadModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="glass border border-border">
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-8">
            {/* Region Selector */}
            <RegionSelector
              country={country}
              businessUnit={businessUnit}
              onCountryChange={setCountry}
              onBusinessUnitChange={setBusinessUnit}
            />

            {/* Entity Table Browser */}
            {country && businessUnit && (
              <EntityTableBrowser
                tables={filteredTables}
                onTableSelect={setSelectedTableId}
                selectedTableId={selectedTableId}
              />
            )}

            {/* Record Management */}
            {selectedTable && (
              <div className="glass rounded-xl p-6 border border-border">
                <RecordManagement
                  tableName={selectedTable.name}
                  records={mockRecords}
                  onAddRecord={() => {}}
                  onBulkUpload={() => {}}
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
