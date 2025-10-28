import { useState, useRef } from "react";
import { Upload, Music, Download, Trash2, User, Calendar, Filter, Hash, Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    {
      id: "4",
      name: "goodbye_message_us.mp3",
      type: "audio/mpeg",
      uploader: "Jane Smith",
      uploadDate: "2025-01-12",
      size: "1.9 MB",
    },
    {
      id: "5",
      name: "ivr_menu_main.wav",
      type: "audio/wav",
      uploader: "John Doe",
      uploadDate: "2025-01-11",
      size: "4.2 MB",
    },
    {
      id: "6",
      name: "transfer_tone.mp3",
      type: "audio/mpeg",
      uploader: "Jane Smith",
      uploadDate: "2025-01-10",
      size: "0.8 MB",
    },
    {
      id: "7",
      name: "voicemail_greeting.wav",
      type: "audio/wav",
      uploader: "John Doe",
      uploadDate: "2025-01-09",
      size: "3.1 MB",
    },
    {
      id: "8",
      name: "busy_signal.mp3",
      type: "audio/mpeg",
      uploader: "Jane Smith",
      uploadDate: "2025-01-08",
      size: "1.2 MB",
    },
    {
      id: "9",
      name: "callback_prompt.wav",
      type: "audio/wav",
      uploader: "John Doe",
      uploadDate: "2025-01-07",
      size: "2.7 MB",
    },
    {
      id: "10",
      name: "emergency_alert.mp3",
      type: "audio/mpeg",
      uploader: "Jane Smith",
      uploadDate: "2025-01-06",
      size: "2.1 MB",
    },
    {
      id: "11",
      name: "customer_survey.wav",
      type: "audio/wav",
      uploader: "John Doe",
      uploadDate: "2025-01-05",
      size: "5.5 MB",
    },
    {
      id: "12",
      name: "promotional_message.mp3",
      type: "audio/mpeg",
      uploader: "Jane Smith",
      uploadDate: "2025-01-04",
      size: "3.3 MB",
    },
  ]);

  // Filter states
  const [nameFilter, setNameFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [uploaderFilter, setUploaderFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Pagination states
  const [myUploadsPage, setMyUploadsPage] = useState(1);
  const [allUploadsPage, setAllUploadsPage] = useState(1);
  const itemsPerPage = 5;

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

  // Pagination logic
  const paginateAssets = (assets: AudioAsset[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return assets.slice(startIndex, endIndex);
  };

  const myUploadsPaginated = paginateAssets(myUploads, myUploadsPage);
  const allUploadsPaginated = paginateAssets(allUploads, allUploadsPage);

  const myUploadsTotalPages = Math.ceil(myUploads.length / itemsPerPage);
  const allUploadsTotalPages = Math.ceil(allUploads.length / itemsPerPage);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      toast.success(`Uploading ${files.length} file(s)...`);
      // Handle file upload logic here
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handlePlayPause = (audioId: string, audioName: string) => {
    if (playingAudioId === audioId) {
      // Pause current audio
      audioRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      // Play new audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      // In a real app, you would load the actual audio file here
      // For now, we'll just show a toast
      toast.info(`Playing: ${audioName}`);
      setPlayingAudioId(audioId);
      
      // Simulate audio playback (in real app, this would be handled by audio element)
      setTimeout(() => {
        setPlayingAudioId(null);
      }, 3000);
    }
  };

  const renderAudioList = (assets: AudioAsset[], currentPage: number, totalPages: number, setPage: (page: number) => void) => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className={`glass-hover rounded-xl p-5 border transition-all duration-300 ${
                playingAudioId === asset.id 
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/20 animate-pulse" 
                  : "border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-12 h-12 glass rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                    playingAudioId === asset.id ? "scale-110 bg-primary/20" : ""
                  }`}>
                    <Music className={`w-6 h-6 transition-colors ${
                      playingAudioId === asset.id ? "text-primary animate-bounce" : "text-primary"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium truncate transition-colors ${
                        playingAudioId === asset.id ? "text-primary" : "text-foreground"
                      }`}>{asset.name}</h4>
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
                    variant={playingAudioId === asset.id ? "default" : "outline"}
                    className={`glass-hover border-border ${
                      playingAudioId === asset.id 
                        ? "bg-primary text-primary-foreground" 
                        : ""
                    }`}
                    onClick={() => handlePlayPause(asset.id, asset.name)}
                  >
                    {playingAudioId === asset.id ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="glass-hover border-border"
                    onClick={() => toast.success("Audio downloaded")}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="glass-hover border-destructive/30 text-destructive hover:bg-destructive/10"
                    onClick={() => toast.success("Audio deleted")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4 border-t border-border mt-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="glass-hover border-border disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="glass-hover border-border disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col space-y-4 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              Audio Asset Management
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Upload and manage audio files for IVR and voice prompts
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mp3,audio/wav,audio/m4a,audio/mpeg,audio/x-m4a"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
            <Button 
              variant="outline" 
              size="default"
              className="glass-hover border-primary/30 hover:text-primary"
              onClick={handleBrowseClick}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Audio
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 border border-border flex-shrink-0">
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

      {/* Audio Files */}
      <div className="flex-1 overflow-hidden min-h-0 glass rounded-xl border border-border">
        <Tabs defaultValue="all" className="h-full flex flex-col">
          {/* Small Tabs on Top Left */}
          <div className="p-4 pb-0">
            <TabsList className="glass border border-border/50 w-fit h-8">
              <TabsTrigger value="my" className="text-xs h-7 px-3">
                My Uploads ({myUploads.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs h-7 px-3">
                All Uploads ({allUploads.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="my" className="flex-1 overflow-hidden mt-0 p-4 pt-2">
            {renderAudioList(myUploadsPaginated, myUploadsPage, myUploadsTotalPages, setMyUploadsPage)}
          </TabsContent>

          <TabsContent value="all" className="flex-1 overflow-hidden mt-0 p-4 pt-2">
            {renderAudioList(allUploadsPaginated, allUploadsPage, allUploadsTotalPages, setAllUploadsPage)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
