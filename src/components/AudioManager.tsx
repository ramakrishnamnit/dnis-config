import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Music, Play, Pause, Download, Upload, Trash2, Plus, Search } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  file?: File;
  url?: string;
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

const PAGE_SIZE = 10;

const formatBytes = (bytes: number) => {
  if (!bytes) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB"];
  const e = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, e)).toFixed(1)} ${units[e]}`;
};

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

export const AudioManager = () => {
  const buildInitialMessages = () =>
    mockMessages.map((message) => ({
      ...message,
      languages: message.languages.map((lang) => ({
        ...lang,
        audio: lang.audio ? { ...lang.audio } : undefined,
      })),
    }));

  const [viewMode, setViewMode] = useState<"my" | "all">("all");
  const [messages, setMessages] = useState<Message[]>(() => buildInitialMessages());
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(() => {
    const initial = buildInitialMessages();
    return initial[0]?.id ?? null;
  });
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<{ messageId: string; languageId: string } | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newMessageName, setNewMessageName] = useState("");
  const [newMessageDescription, setNewMessageDescription] = useState("");
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [selectedLanguageOption, setSelectedLanguageOption] = useState("");

  const currentUser = "John Doe";

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const uploadedBlobUrls = useRef<Set<string>>(new Set());

  const selectedMessage = useMemo(
    () => (selectedMessageId ? messages.find((msg) => msg.id === selectedMessageId) ?? null : null),
    [messages, selectedMessageId]
  );

  const availableLanguages = useMemo(() => {
    if (!selectedMessage) {
      return [];
    }
    const existing = new Set(
      selectedMessage.languages.map((lang) => lang.name.toLowerCase())
    );
    return mockLanguages.filter((lang) => !existing.has(lang.name.toLowerCase()));
  }, [selectedMessage]);

  const filteredMessages = useMemo(() => {
    const bySearch = messages.filter((msg) => {
    if (searchQuery && !msg.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

    if (viewMode === "my") {
      return bySearch.filter((msg) =>
        msg.languages.some((lang) => lang.audio?.uploadedBy === currentUser)
      );
    }

    return bySearch;
  }, [messages, searchQuery, viewMode, currentUser]);

  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / PAGE_SIZE));
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!filteredMessages.length) {
      setSelectedMessageId(null);
      return;
    }

    if (!selectedMessageId || !filteredMessages.some((msg) => msg.id === selectedMessageId)) {
      const newSelection = filteredMessages[(currentPage - 1) * PAGE_SIZE] ?? filteredMessages[0];
      setSelectedMessageId(newSelection?.id ?? null);
    }
  }, [filteredMessages, selectedMessageId, currentPage]);

  useEffect(
    () => () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      uploadedBlobUrls.current.forEach((url) => URL.revokeObjectURL(url));
      uploadedBlobUrls.current.clear();
    },
    []
  );

  const { toast } = useToast();

  const triggerFileInput = (messageId: string, languageId: string) => {
    const key = `${messageId}-${languageId}`;
    const input = fileInputRefs.current[key];
    if (input) {
      input.value = "";
      input.click();
    }
  };

  const handleStartCreateMessage = () => {
    setNewMessageName("");
    setNewMessageDescription("");
    setCreateDialogOpen(true);
  };

  const handleConfirmCreateMessage = () => {
    const trimmedName = newMessageName.trim();
    const trimmedDescription = newMessageDescription.trim();

    if (!trimmedName) {
      toast({
        title: "Name required",
        description: "Please provide a name for the new message.",
        variant: "destructive",
      });
      return;
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      name: trimmedName,
      description: trimmedDescription || undefined,
      languages: [],
    };
    setMessages((prev) => [newMessage, ...prev]);
    setSelectedMessageId(newMessage.id);
    setCurrentPage(1);
    setCreateDialogOpen(false);
    setNewMessageName("");
    setNewMessageDescription("");
    toast({
      title: "Message created",
      description: `${newMessage.name} is ready to configure.`,
    });
  };

  const handleStartAddLanguage = () => {
    if (!selectedMessage) {
      toast({
        title: "No message selected",
        description: "Pick a message before adding languages.",
      });
      return;
    }

    if (!availableLanguages.length) {
      toast({
        title: "All languages added",
        description: "No more languages are available to add to this message.",
        variant: "destructive",
      });
      return;
    }

    setSelectedLanguageOption(availableLanguages[0]?.id ?? "");
    setLanguageDialogOpen(true);
  };

  const handleConfirmAddLanguage = () => {
    if (!selectedMessage) {
      toast({
        title: "No message selected",
        description: "Pick a message before adding languages.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedLanguageOption) {
      toast({
        title: "Select a language",
        description: "Choose which language you want to add.",
        variant: "destructive",
      });
      return;
    }

    const languageDefinition = availableLanguages.find((lang) => lang.id === selectedLanguageOption);

    if (!languageDefinition) {
      toast({
        title: "Language unavailable",
        description: "That language cannot be added right now.",
        variant: "destructive",
      });
      return;
    }

    const languageToAdd: Language = {
      id: `${languageDefinition.id}-${Date.now()}`,
      name: languageDefinition.name,
    };

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === selectedMessage.id
          ? {
              ...msg,
              languages: [...msg.languages, languageToAdd],
            }
          : msg
      )
    );

    setLanguageDialogOpen(false);
    setSelectedLanguageOption("");

    toast({
      title: "Language added",
      description: `${languageDefinition.name} has been added to ${selectedMessage.name}.`,
    });
  };

  const handleStopPlayback = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      audioElementRef.current = null;
      setCurrentlyPlaying(null);
    }
  }, []);

  const handlePlayAudio = (messageId: string, lang: Language) => {
    if (!lang.audio?.url) {
      toast({
        title: "No audio file",
        description: `Upload audio for ${lang.name} before playing.`,
        variant: "destructive",
      });
      return;
    }

    if (currentlyPlaying?.languageId === lang.id && currentlyPlaying?.messageId === messageId) {
      handleStopPlayback();
      toast({
        title: "Playback stopped",
        description: lang.audio.fileName,
      });
      return;
    }

    handleStopPlayback();

    const audio = new Audio(lang.audio.url);
    audioElementRef.current = audio;
    audio.onended = () => {
      setCurrentlyPlaying(null);
      audioElementRef.current = null;
    };

    audio
      .play()
      .then(() => {
        setCurrentlyPlaying({ messageId, languageId: lang.id });
        toast({
          title: "Playing audio",
          description: lang.audio?.fileName,
        });
      })
      .catch(() => {
        setCurrentlyPlaying(null);
        audioElementRef.current = null;
        toast({
          title: "Playback failed",
          description: "Unable to play this audio file.",
          variant: "destructive",
        });
      });
  };

  const handleDownloadAudio = (lang: Language) => {
    if (!lang.audio?.url) {
      toast({
        title: "Download unavailable",
        description: `No audio file found for ${lang.name}.`,
        variant: "destructive",
      });
      return;
    }

    const link = document.createElement("a");
    link.href = lang.audio.url;
    link.download = lang.audio.fileName || "audio-file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: lang.audio.fileName,
    });
  };

  const handleRemoveAudio = (messageId: string, lang: Language) => {
    if (!lang.audio) {
      return;
    }

    const confirmed = window.confirm(`Remove audio for ${lang.name}?`);
    if (!confirmed) {
      return;
    }

    if (currentlyPlaying?.languageId === lang.id && currentlyPlaying.messageId === messageId) {
      handleStopPlayback();
    }

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              languages: msg.languages.map((language) =>
                language.id === lang.id
                  ? {
                      ...language,
                      audio: undefined,
                    }
                  : language
              ),
            }
          : msg
      )
    );

    if (lang.audio.url && lang.audio.url.startsWith("blob:")) {
      URL.revokeObjectURL(lang.audio.url);
      uploadedBlobUrls.current.delete(lang.audio.url);
    }

    toast({
      title: "Audio removed",
      description: `${lang.name} no longer has an audio file.`,
    });
  };

  const handleFileSelection = (
    messageId: string,
    languageId: string,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const fileUrl = URL.createObjectURL(file);
    uploadedBlobUrls.current.add(fileUrl);
    const newAudioId = `audio-${Date.now()}`;

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) {
          return msg;
        }

        return {
          ...msg,
          languages: msg.languages.map((lang) => {
            if (lang.id !== languageId) {
              return lang;
            }

            if (lang.audio?.url && lang.audio.url.startsWith("blob:")) {
              URL.revokeObjectURL(lang.audio.url);
              uploadedBlobUrls.current.delete(lang.audio.url);
            }

            return {
              ...lang,
              audio: {
                id: lang.audio?.id ?? newAudioId,
                fileName: file.name,
                fileSize: formatBytes(file.size),
                duration: lang.audio?.duration ?? "--:--",
                uploadedBy: currentUser,
                uploadedAt: formatDate(new Date()),
                file,
                url: fileUrl,
              },
            };
          }),
        };
      })
    );

    if (currentlyPlaying?.languageId === languageId && currentlyPlaying.messageId === messageId) {
      handleStopPlayback();
    }

    const messageName = selectedMessage?.name ?? "Message";
    const languageName =
      selectedMessage?.languages.find((lang) => lang.id === languageId)?.name ?? "Language";

    toast({
      title: "Audio uploaded",
      description: `${file.name} uploaded for ${languageName} in ${messageName}.`,
    });

    event.target.value = "";
  };

  useEffect(() => {
    if (
      currentlyPlaying &&
      selectedMessageId &&
      currentlyPlaying.messageId !== selectedMessageId
    ) {
      handleStopPlayback();
    }
  }, [selectedMessageId, currentlyPlaying, handleStopPlayback]);

  return (
    <>
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
                  onClick={() => {
                    setViewMode("my");
                    setCurrentPage(1);
                  }}
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
                  onClick={() => {
                    setViewMode("all");
                    setCurrentPage(1);
                  }}
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
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleStartCreateMessage}>
                <Plus className="w-3 h-3 mr-1" />
                New
              </Button>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-7 h-8 text-xs"
              />
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-1.5">
                {paginatedMessages.map((msg) => {
                  const uploadedCount = msg.languages.filter(l => l.audio).length;
                  const totalCount = msg.languages.length;
                  return (
                    <button
                      key={msg.id}
                        onClick={() => setSelectedMessageId(msg.id)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-lg border transition-all",
                          selectedMessageId === msg.id
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
            <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs px-2"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-[10px] text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs px-2"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
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
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleStartAddLanguage}>
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
                            <input
                              type="file"
                              accept="audio/*"
                              className="hidden"
                              ref={(element) => {
                                const key = `${selectedMessage.id}-${lang.id}`;
                                if (element) {
                                  fileInputRefs.current[key] = element;
                                } else {
                                  delete fileInputRefs.current[key];
                                }
                              }}
                              onChange={(event) => handleFileSelection(selectedMessage.id, lang.id, event)}
                            />
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
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                                      onClick={() => handlePlayAudio(selectedMessage.id, lang)}
                                    >
                                      {currentlyPlaying?.languageId === lang.id && currentlyPlaying?.messageId === selectedMessage.id ? (
                                        <Pause className="w-3 h-3" />
                                      ) : (
                                    <Play className="w-3 h-3" />
                                      )}
                                  </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 hover:bg-card-hover"
                                      onClick={() => handleDownloadAudio(lang)}
                                    >
                                    <Download className="w-3 h-3" />
                                  </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 hover:bg-card-hover"
                                      onClick={() => triggerFileInput(selectedMessage.id, lang.id)}
                                    >
                                    <Upload className="w-3 h-3" />
                                  </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                                      onClick={() => handleRemoveAudio(selectedMessage.id, lang)}
                                    >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </>
                              ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() => triggerFileInput(selectedMessage.id, lang.id)}
                                  >
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

      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) {
            setNewMessageName("");
            setNewMessageDescription("");
          }
        }}
      >
        <DialogContent className="glass border-border sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create Message</DialogTitle>
            <DialogDescription>
              Provide a name and description for the new audio message.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="audio-message-name">Message name</Label>
              <Input
                id="audio-message-name"
                value={newMessageName}
                onChange={(event) => setNewMessageName(event.target.value)}
                placeholder="e.g. Queue Music"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="audio-message-description">Description</Label>
              <Textarea
                id="audio-message-description"
                value={newMessageDescription}
                onChange={(event) => setNewMessageDescription(event.target.value)}
                placeholder="Optional description for context"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                setNewMessageName("");
                setNewMessageDescription("");
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirmCreateMessage}>
              Create message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={languageDialogOpen}
        onOpenChange={(open) => {
          setLanguageDialogOpen(open);
          if (!open) {
            setSelectedLanguageOption("");
          }
        }}
      >
        <DialogContent className="glass border-border sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Add Language</DialogTitle>
            <DialogDescription>
              Choose which language you would like to configure for this message.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="audio-language-select">Language</Label>
              <Select
                value={selectedLanguageOption}
                onValueChange={setSelectedLanguageOption}
                disabled={!availableLanguages.length}
              >
                <SelectTrigger id="audio-language-select">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!availableLanguages.length ? (
              <p className="text-xs text-muted-foreground">
                All available languages have already been added to this message.
              </p>
            ) : null}
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setLanguageDialogOpen(false);
                setSelectedLanguageOption("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmAddLanguage}
              disabled={!availableLanguages.length}
            >
              Add language
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
