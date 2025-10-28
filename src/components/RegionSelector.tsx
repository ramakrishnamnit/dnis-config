import { Globe, Building2, Database } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TableEntity {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  isEditable: boolean;
  recordCount: number;
}

interface RegionSelectorProps {
  country: string;
  businessUnit: string;
  onCountryChange: (value: string) => void;
  onBusinessUnitChange: (value: string) => void;
  tables: TableEntity[];
  selectedTableId?: string;
  onTableSelect: (tableId: string) => void;
}

const countries = [
  { value: "UK", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "HK", label: "Hong Kong" },
  { value: "SG", label: "Singapore" },
  { value: "CN", label: "China" },
];

const businessUnits = [
  { value: "CC", label: "Corporate Center" },
  { value: "WPB", label: "Wealth & Personal Banking" },
  { value: "CMB", label: "Commercial Banking" },
  { value: "GBM", label: "Global Banking & Markets" },
];

export const RegionSelector = ({
  country,
  businessUnit,
  onCountryChange,
  onBusinessUnitChange,
  tables,
  selectedTableId,
  onTableSelect,
}: RegionSelectorProps) => {
  return (
    <div className="glass rounded-xl p-6 border border-border hover-glow-red">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Globe className="w-5 h-5 text-primary" />
        Region & Configuration Selector
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Country Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Country
          </label>
          <Select value={country} onValueChange={onCountryChange}>
            <SelectTrigger className="glass border-border focus:border-primary focus:glow-red transition-all">
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

        {/* Business Unit Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Business Unit
          </label>
          <Select value={businessUnit} onValueChange={onBusinessUnitChange}>
            <SelectTrigger className="glass border-border focus:border-primary focus:glow-red transition-all">
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

        {/* Table Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Database className="w-4 h-4" />
            Configuration Table
          </label>
          <Select 
            value={selectedTableId} 
            onValueChange={onTableSelect}
            disabled={!country || !businessUnit}
          >
            <SelectTrigger className="glass border-border focus:border-primary focus:glow-red transition-all disabled:opacity-50">
              <SelectValue placeholder="Select table" />
            </SelectTrigger>
            <SelectContent className="glass border-border max-h-[300px]">
              {tables?.map((table) => (
                <SelectItem 
                  key={table.id} 
                  value={table.id}
                  className="hover:bg-card-hover"
                >
                  {table.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
