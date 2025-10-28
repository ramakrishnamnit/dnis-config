import { useState } from "react";
import { Upload, Music, Download, Trash2, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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
  ]);

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

      {/* Audio Files Grid */}
      <div className="grid grid-cols-1 gap-4">
        {audioAssets.map((asset) => (
          <div
            key={asset.id}
            className="glass-hover rounded-xl p-5 border border-border group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Waveform Visual */}
                <div className="w-12 h-12 glass rounded-lg flex items-center justify-center flex-shrink-0">
                  <Music className="w-6 h-6 text-primary" />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{asset.name}</h4>
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

              {/* Actions */}
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
    </div>
  );
};
