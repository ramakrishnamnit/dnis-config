import { useState } from "react";
import { Upload, Music, Download, Trash2, User, Calendar, Filter, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AudioAsset {
  id: string;
  name: string;
  type: string;
  uploader: string;
  uploadDate: string;
  size: string;
}

export const AudioAssetManager = () => {
  const [isDragging, setIsDragging] = useState(false);
  const currentUser = "John Doe"; // Mock current user
  
  const [audioAssets] = useState<AudioAsset[]>([
    {
      id: "1",
      name: "welcome_message_uk.mp3",
      type: "audio/mpeg",
      uploader: "John Doe",
      uploadDate: "2025-01-15",
      size: "2.3 MB",
    },
    {
      id: "2",
      name: "hold_music_corporate.wav",
      type: "audio/wav",
      uploader: "Jane Smith",
      uploadDate: "2025-01-14",
      size: "5.1 MB",
    },
    {
      id: "3",
      name: "queue_music_jazz.mp3",
      type: "audio/mpeg",
      uploader: "John Doe",
      uploadDate: "2025-01-13",
      size: "3.8 MB",
    },
  ]);

  // Filter states
  const [nameFilter, setNameFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [uploaderFilter, setUploaderFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Apply filters
  const applyFilters = (assets: AudioAsset[]) => {
    return assets.filter(asset => {
      if (nameFilter && !asset.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
      if (typeFilter !== "all" && asset.type !== typeFilter) return false;
      if (uploaderFilter && !asset.uploader.toLowerCase().includes(uploaderFilter.toLowerCase())) return false;
      if (dateFilter && !asset.uploadDate.includes(dateFilter)) return false;
      return true;
    });
  };

  const myUploads = applyFilters(audioAssets.filter(asset => asset.uploader === currentUser));
  const allUploads = applyFilters(audioAssets);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    toast.success("Audio file uploaded successfully");
  };

  const renderAudioList = (assets: AudioAsset[]) => (
    <div className="grid grid-cols-1 gap-4">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="glass-hover rounded-xl p-5 border border-border group"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 glass rounded-lg flex items-center justify-center flex-shrink-0">
                <Music className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-foreground truncate">{asset.name}</h4>
                  <Badge variant="secondary" className="text-xs font-mono">
                    <Hash className="w-3 h-3 mr-0.5" />
                    {asset.id}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {asset.uploader}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {asset.uploadDate}
                  </span>
                  <Badge variant="outline" className="border-muted-foreground/30">
                    {asset.size}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="glass-hover border-border opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => toast.success("Audio downloaded")}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="glass-hover border-destructive/30 text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => toast.success("Audio deleted")}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          Audio Asset Management
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload and manage audio files for IVR and voice prompts
        </p>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">File Name</label>
            <Input
              placeholder="Filter by name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="glass border-border focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">File Type</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="glass border-border focus:border-primary">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="glass border-border">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="audio/mpeg">MP3</SelectItem>
                <SelectItem value="audio/wav">WAV</SelectItem>
                <SelectItem value="audio/m4a">M4A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Uploader</label>
            <Input
              placeholder="Filter by uploader..."
              value={uploaderFilter}
              onChange={(e) => setUploaderFilter(e.target.value)}
              className="glass border-border focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Upload Date</label>
            <Input
              placeholder="Filter by date..."
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="glass border-border focus:border-primary"
            />
          </div>
        </div>
        {(nameFilter || typeFilter !== "all" || uploaderFilter || dateFilter) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNameFilter("");
              setTypeFilter("all");
              setUploaderFilter("");
              setDateFilter("");
            }}
            className="mt-4 glass-hover border-primary/30 text-foreground hover:text-primary"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          glass-hover rounded-xl p-8 border-2 border-dashed transition-all
          ${isDragging ? "border-primary glow-red bg-primary/5" : "border-border"}
        `}
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 glass rounded-full flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-foreground font-medium mb-1">
              Drop audio files here or click to upload
            </h3>
            <p className="text-sm text-muted-foreground">
              Supports MP3, WAV, M4A (Max 10MB)
            </p>
          </div>
          <Button variant="outline" className="glass-hover border-primary/30 hover:text-primary">
            <Upload className="w-4 h-4 mr-2" />
            Browse Files
          </Button>
        </div>
      </div>

      {/* Audio Files Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="glass border border-border/50">
          <TabsTrigger value="my">My Uploads ({myUploads.length})</TabsTrigger>
          <TabsTrigger value="all">All Uploads ({allUploads.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="my">
          {renderAudioList(myUploads)}
        </TabsContent>

        <TabsContent value="all">
          {renderAudioList(allUploads)}
        </TabsContent>
      </Tabs>
    </div>
  );
};
