import { useState } from "react";
import { Music, Play, Download, Upload, Trash2, Plus, Filter, Search, User, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FilterBuilder, FilterRule, FilterField } from "./FilterBuilder";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  name: string;
  description?: string;
  languages: Language[];
}

interface Language {
  id: string;
  name: string;
  audio?: AudioFile;
}

interface AudioFile {
  id: string;
  fileName: string;
  fileSize: string;
  duration: string;
  uploadedBy: string;
  uploadedAt: string;
}

// Mock data
const mockMessages: Message[] = [
  {
    id: "msg1",
    name: "Welcome Message",
    description: "Initial greeting for callers",
    languages: [
      { id: "lang1", name: "English (UK)", audio: { id: "aud1", fileName: "welcome_uk.mp3", fileSize: "2.3 MB", duration: "0:45", uploadedBy: "John Doe", uploadedAt: "2025-01-15" } },
      { id: "lang2", name: "Spanish", audio: { id: "aud2", fileName: "welcome_es.mp3", fileSize: "2.1 MB", duration: "0:43", uploadedBy: "Jane Smith", uploadedAt: "2025-01-14" } },
      { id: "lang3", name: "French" },
      { id: "lang4", name: "German" },
    ],
  },
  {
    id: "msg2",
    name: "Queue Music",
    description: "Hold music for waiting customers",
    languages: [
      { id: "lang5", name: "English (UK)", audio: { id: "aud3", fileName: "queue_uk.mp3", fileSize: "5.2 MB", duration: "2:30", uploadedBy: "John Doe", uploadedAt: "2025-01-13" } },
      { id: "lang6", name: "Spanish" },
      { id: "lang7", name: "French", audio: { id: "aud4", fileName: "queue_fr.mp3", fileSize: "5.0 MB", duration: "2:28", uploadedBy: "Jane Smith", uploadedAt: "2025-01-12" } },
    ],
  },
  {
    id: "msg3",
    name: "Goodbye Message",
    languages: [
      { id: "lang8", name: "English (UK)" },
      { id: "lang9", name: "Spanish", audio: { id: "aud5", fileName: "goodbye_es.mp3", fileSize: "1.5 MB", duration: "0:30", uploadedBy: "John Doe", uploadedAt: "2025-01-11" } },
    ],
  },
];

const mockLanguages: Language[] = [
  { id: "lang1", name: "English (UK)" },
  { id: "lang2", name: "Spanish" },
  { id: "lang3", name: "French" },
  { id: "lang4", name: "German" },
  { id: "lang5", name: "Chinese" },
  { id: "lang6", name: "Arabic" },
];

const filterFields: FilterField[] = [
  { name: "messageName", label: "Message Name", type: "text" },
  { name: "language", label: "Language", type: "select", options: mockLanguages.map(l => l.name) },
  { name: "status", label: "Status", type: "select", options: ["Uploaded", "Not Uploaded"] },
  { name: "uploader", label: "Uploader", type: "text" },
  { name: "uploadDate", label: "Upload Date", type: "date" },
  { name: "fileName", label: "File Name", type: "text" },
];

export const AudioManager = () => {
  const [viewMode, setViewMode] = useState<"my" | "all">("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(mockMessages[0]);
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const currentUser = "John Doe";

  const filteredMessages = mockMessages.filter((msg) => {
    if (searchQuery && !msg.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Compact Header */}
      <div className="flex-shrink-0 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              Audio Management
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage call-center audio across messages and languages
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* My/All Toggle */}
            <div className="inline-flex items-center gap-1 p-1 glass rounded-lg border border-border">
              <button
                onClick={() => setViewMode("my")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded transition-all",
                  viewMode === "my"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                My Audios
              </button>
              <button
                onClick={() => setViewMode("all")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded transition-all",
                  viewMode === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All Audios
              </button>
            </div>
            <FilterBuilder
              fields={filterFields}
              rules={filterRules}
              onRulesChange={setFilterRules}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden m-0 flex gap-3">
          {/* Left Panel: Messages List */}
          <div className="w-72 glass-strong rounded-xl border border-border p-3 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Messages</h3>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                <Plus className="w-3 h-3 mr-1" />
                New
              </Button>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 h-8 text-xs"
              />
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-1.5">
                {filteredMessages.map((msg) => {
                  const uploadedCount = msg.languages.filter(l => l.audio).length;
                  const totalCount = msg.languages.length;
                  return (
                    <button
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-lg border transition-all",
                        selectedMessage?.id === msg.id
                          ? "bg-primary/10 border-primary"
                          : "border-border hover:bg-card-hover"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-medium text-foreground truncate">{msg.name}</p>
                        <Badge variant="secondary" className="text-[10px] h-4">
                          {uploadedCount}/{totalCount}
                        </Badge>
                      </div>
                      {msg.description && (
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{msg.description}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Center Panel: Language Grid */}
          <div className="flex-1 glass-strong rounded-xl border border-border p-3 flex flex-col overflow-hidden">
            {selectedMessage ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{selectedMessage.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedMessage.languages.filter(l => l.audio).length} of {selectedMessage.languages.length} languages uploaded
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Language
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-8 text-xs">Language</TableHead>
                        <TableHead className="h-8 text-xs">Status</TableHead>
                        <TableHead className="h-8 text-xs">File Name</TableHead>
                        <TableHead className="h-8 text-xs">Uploader</TableHead>
                        <TableHead className="h-8 text-xs">Uploaded</TableHead>
                        <TableHead className="h-8 text-xs text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedMessage.languages.map((lang) => (
                        <TableRow key={lang.id} className="group">
                          <TableCell className="py-2 text-xs font-medium">{lang.name}</TableCell>
                          <TableCell className="py-2">
                            {lang.audio ? (
                              <Badge variant="outline" className="text-[10px] h-5 border-status-success/30 text-status-success">
                                Uploaded
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] h-5 border-muted-foreground/30 text-muted-foreground">
                                Not Uploaded
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-2 text-xs text-muted-foreground">
                            {lang.audio?.fileName || "-"}
                          </TableCell>
                          <TableCell className="py-2 text-xs text-muted-foreground">
                            {lang.audio?.uploadedBy || "-"}
                          </TableCell>
                          <TableCell className="py-2 text-xs text-muted-foreground">
                            {lang.audio?.uploadedAt || "-"}
                          </TableCell>
                          <TableCell className="py-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {lang.audio ? (
                                <>
                                  <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-primary/10 hover:text-primary">
                                    <Play className="w-3 h-3" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-card-hover">
                                    <Download className="w-3 h-3" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-card-hover">
                                    <Upload className="w-3 h-3" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </>
                              ) : (
                                <Button size="sm" variant="outline" className="h-7 text-xs">
                                  <Upload className="w-3 h-3 mr-1" />
                                  Upload
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <Music className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Select a message to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
