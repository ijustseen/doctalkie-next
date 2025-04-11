"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Eye,
  EyeOff,
  Upload,
  PlusCircle,
  Loader2,
  Trash2,
  FileText,
  X as IconX,
  Database,
  Activity,
} from "lucide-react"; // Added Database and Activity icons
import CodeBlock from "@/components/code-block";
import { createClient } from "@/utils/supabase/client"; // Use client-side client for mutations
import type { User } from "@supabase/supabase-js";
import { Progress } from "@/components/ui/progress"; // Import Progress component
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea
import { cn } from "@/lib/utils"; // Import cn for conditional classes

// Define prop types (basic structure, enhance with full types if available)
type Subscription = {
  id: string;
  name: string;
  max_bots: number;
  max_total_doc_size_mb: number;
} | null;

type Profile = {
  id: string;
  subscription_id: string;
  subscriptions: Subscription;
} | null;

type Bot = {
  id: string;
  user_id: string;
  name: string;
  strict_context: boolean;
  api_key: string;
  api_url: string;
  allowed_origins: string[] | null; // Added allowed_origins
} | null;

// Add Document type
type Document = {
  id: string;
  bot_id: string;
  file_name: string;
  storage_path: string;
  file_size_bytes: number;
  status: string; // 'uploaded', 'processing', 'ready', 'error'
  uploaded_at: string;
};

interface DashboardClientProps {
  user: User;
  profile: Profile;
  initialBot: Bot;
}

export default function DashboardClient({
  user,
  profile,
  initialBot,
}: DashboardClientProps) {
  const supabase = createClient(); // Client for updates/creations
  const [bot, setBot] = useState<Bot>(initialBot); // Manage bot state locally
  const [assistantName, setAssistantName] = useState(
    initialBot?.name ?? "My First Bot"
  );
  const [projectOnly, setProjectOnly] = useState(
    initialBot?.strict_context ?? true
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // State for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for documents list
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isDeletingDoc, setIsDeletingDoc] = useState<string | null>(null); // Store ID of doc being deleted
  const [dragActive, setDragActive] = useState(false); // State for drag-n-drop visuals

  // State for Allowed Origins UI
  const [currentOrigins, setCurrentOrigins] = useState<string[]>(
    initialBot?.allowed_origins ?? []
  );
  const [newOriginInput, setNewOriginInput] = useState("");

  // Demo data (replace with actual data later)
  const currentStorageUsedMB = 2; // Example usage
  const maxStorageMB = profile?.subscriptions?.max_total_doc_size_mb ?? 5; // From profile or default
  const storagePercentage = (currentStorageUsedMB / maxStorageMB) * 100;

  const currentRequestsUsed = 120; // Example usage
  // Assuming a new field `max_requests_month` exists in subscriptions type
  // Add a type assertion or check if the field exists if necessary
  const maxRequestsMonth =
    (profile?.subscriptions as any)?.max_requests_month ?? 500;
  const requestsPercentage = (currentRequestsUsed / maxRequestsMonth) * 100;

  useEffect(() => {
    // Update local state if initialBot changes (e.g., after creation)
    setBot(initialBot);
    setAssistantName(initialBot?.name ?? "My First Bot");
    setProjectOnly(initialBot?.strict_context ?? true);
    // Update current origins when initialBot changes
    setCurrentOrigins(initialBot?.allowed_origins ?? []);
    setNewOriginInput(""); // Clear input on bot change
    // Reset file selection when bot changes
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [initialBot]);

  // Fetch documents when bot ID changes
  const fetchDocuments = useCallback(async () => {
    if (!bot) {
      setDocuments([]);
      return;
    }
    setIsLoadingDocs(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("bot_id", bot.id)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
      // Add error toast
    } else {
      setDocuments(data as Document[]);
    }
    setIsLoadingDocs(false);
  }, [bot, supabase]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const copyToClipboard = async (text: string | undefined) => {
    if (text) {
      await navigator.clipboard.writeText(text);
      console.log("Copied to clipboard!");
      // Add toast notification
    }
  };

  const handleSaveSettings = async () => {
    if (!bot) return;
    setIsSaving(true);

    // Use the currentOrigins state array
    const originsToSave = currentOrigins.length > 0 ? currentOrigins : null;

    const { data, error } = await supabase
      .from("bots")
      .update({
        name: assistantName,
        strict_context: projectOnly,
        allowed_origins: originsToSave, // Save the array from state
      })
      .eq("id", bot.id)
      .select()
      .single();

    if (error) {
      console.error("Error saving bot settings:", error);
      // Add error toast notification
    } else {
      const updatedBot = data as Exclude<Bot, null>;
      setBot(updatedBot);
      // Ensure UI state matches saved state (handles case where null was saved)
      setCurrentOrigins(updatedBot.allowed_origins ?? []);
      console.log("Settings saved!");
      // Add success toast notification
    }
    setIsSaving(false);
  };

  // Handler to add a new origin
  const handleAddOrigin = () => {
    const newOrigin = newOriginInput.trim();
    if (newOrigin && !currentOrigins.includes(newOrigin)) {
      // Basic validation: Check if it looks somewhat like a URL/origin
      // This is not exhaustive!
      if (
        newOrigin.startsWith("http://") ||
        newOrigin.startsWith("https://") ||
        newOrigin === "*" ||
        newOrigin.includes("*.")
      ) {
        setCurrentOrigins([...currentOrigins, newOrigin]);
        setNewOriginInput(""); // Clear input after adding
      } else {
        // Add user feedback (e.g., toast) about invalid format
        console.warn(
          "Invalid origin format. Must start with http:// or https://, or use wildcards."
        );
      }
    } else if (currentOrigins.includes(newOrigin)) {
      console.warn("Origin already added.");
      setNewOriginInput(""); // Clear input even if duplicate
    }
  };

  // Handler to remove an origin
  const handleRemoveOrigin = (originToRemove: string) => {
    setCurrentOrigins(
      currentOrigins.filter((origin) => origin !== originToRemove)
    );
  };

  const handleCreateBot = async () => {
    if (bot) return; // Already has a bot
    setIsCreating(true);

    // Placeholder for actual API key/URL generation
    // In a real app, this should likely happen in a Supabase Function
    // to keep generation logic secure and consistent.
    const newApiKey = `dt_${crypto.randomUUID()}`;
    const newApiUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || ""
    }/api/chat/${crypto.randomUUID()}`;

    const { data, error } = await supabase
      .from("bots")
      .insert({
        user_id: user.id,
        name: assistantName, // Use the current name from state
        strict_context: projectOnly, // Use current switch state
        api_key: newApiKey,
        api_url: newApiUrl,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating bot:", error);
      // Add error toast notification
    } else {
      setBot(data as Bot); // Update local state with the new bot
      console.log("Bot created!");
      // Add success toast notification
    }
    setIsCreating(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // TODO: Add validation (size, type) based on subscription
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !bot || !user) return;

    setIsUploading(true);
    setUploadProgress(0);
    setDragActive(false); // Reset drag state on upload start

    const storagePath = `${user.id}/${bot.id}/${Date.now()}_${
      selectedFile.name
    }`; // Unique path

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, selectedFile, {
        cacheControl: "3600",
        upsert: false, // Don't overwrite existing files with the same name (use unique path instead)
        contentType: selectedFile.type,
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      setIsUploading(false);
      // Add error toast
      return;
    }

    console.log("File uploaded successfully, path:", storagePath);
    setUploadProgress(100); // Mark as complete

    // Insert record into public.documents table
    const { error: dbError } = await supabase.from("documents").insert({
      bot_id: bot.id,
      file_name: selectedFile.name,
      storage_path: storagePath,
      file_size_bytes: selectedFile.size,
      status: "uploaded", // Initial status
    });

    if (dbError) {
      console.error("Error creating document record:", dbError);
      // Add error toast
      // Potentially try to delete the uploaded file from storage if DB insert fails
      await supabase.storage.from("documents").remove([storagePath]);
      console.warn("Uploaded file removed due to DB error", storagePath);
    } else {
      console.log("Document record created");
      // Refresh the document list
      await fetchDocuments();
      setSelectedFile(null); // Clear selection
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Add success toast
    }

    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleDeleteDocument = async (doc: Document) => {
    if (!bot || isDeletingDoc) return;
    setIsDeletingDoc(doc.id);

    // 1. Delete from storage
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([doc.storage_path]);

    if (storageError) {
      console.error("Error deleting file from storage:", storageError);
      // Don't proceed if storage deletion fails?
      // Add error toast
      setIsDeletingDoc(null);
      return;
    }

    // 2. Delete from database table
    const { error: dbError } = await supabase
      .from("documents")
      .delete()
      .eq("id", doc.id);

    if (dbError) {
      console.error("Error deleting document record:", dbError);
      // What to do if DB delete fails but storage succeeded? Might need manual cleanup.
      // Add error toast
    } else {
      console.log("Document deleted successfully");
      // Refresh list optimistically or after success
      setDocuments(documents.filter((d) => d.id !== doc.id));
      // Add success toast
    }
    setIsDeletingDoc(null);
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Display subscription name, fallback to ID if name is missing
  const subscriptionName =
    profile?.subscriptions?.name ?? profile?.subscription_id ?? "Loading...";

  // Drag-n-drop handlers for visual feedback (actual drop logic not implemented here)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      // TODO: Add validation (size, type) based on subscription
    }
    // Note: Actual upload should be triggered by button click or further logic
  };

  return (
    <div className="container py-10">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Plan:{" "}
          <span className="font-semibold text-primary">{subscriptionName}</span>
        </div>
      </div>
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="docs" disabled={!bot}>
            Documentation
          </TabsTrigger>
          <TabsTrigger value="analytics" disabled={!bot}>
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings">
          {!bot ? (
            // Show Create Bot Card if no bot exists (full width)
            <Card>
              <CardHeader>
                <CardTitle>Create Your First Bot</CardTitle>
                <CardDescription>
                  Let's get your AI assistant set up.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-assistant-name">Assistant Name</Label>
                  <Input
                    id="new-assistant-name"
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                    placeholder="My Awesome Bot"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="new-project-only">
                      Answer only project-related questions
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Restrict answers to your documentation context.
                    </p>
                  </div>
                  <Switch
                    id="new-project-only"
                    checked={projectOnly}
                    onCheckedChange={setProjectOnly}
                  />
                </div>
                <Button
                  onClick={handleCreateBot}
                  disabled={isCreating}
                  className="w-full mt-4"
                >
                  {isCreating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlusCircle className="mr-2 h-4 w-4" />
                  )}
                  Create Bot
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] lg:items-start gap-6">
              {/* Column 1 (2fr): Assistant Settings & API Credentials */}
              <div className="space-y-6">
                {/* Assistant Settings Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Assistant Settings</CardTitle>
                    <CardDescription>
                      Customize how your AI assistant behaves ({bot.id})
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Assistant Name Input */}
                    <div className="space-y-2">
                      <Label htmlFor="assistant-name">Assistant Name</Label>
                      <Input
                        id="assistant-name"
                        value={assistantName}
                        onChange={(e) => setAssistantName(e.target.value)}
                        placeholder="DocTalkie"
                      />
                      <p className="text-sm text-muted-foreground">
                        This name is for your reference and can be displayed in
                        the chat.
                      </p>
                    </div>

                    {/* Allowed Origins Management */}
                    <div className="space-y-4">
                      <Label>Allowed Origins</Label>
                      {/* List of current origins */}
                      <div className="space-y-2 rounded-md border p-3 min-h-[60px]">
                        {currentOrigins.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-2">
                            No origins added. API requests will be allowed from
                            anywhere.
                          </p>
                        ) : (
                          <ul className="space-y-1">
                            {currentOrigins.map((origin, index) => (
                              <li
                                key={index}
                                className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded"
                              >
                                <span className="font-mono break-all">
                                  {origin}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 flex-shrink-0"
                                  onClick={() => handleRemoveOrigin(origin)}
                                  aria-label={`Remove ${origin}`}
                                >
                                  <IconX className="h-4 w-4" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {/* Input to add new origin */}
                      <div className="flex gap-2">
                        <Input
                          id="new-origin"
                          placeholder="https://your-website.com or https://*.domain.com"
                          value={newOriginInput}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setNewOriginInput(e.target.value)
                          }
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLInputElement>
                          ) => {
                            if (e.key === "Enter") handleAddOrigin();
                          }}
                        />
                        <Button onClick={handleAddOrigin} variant="secondary">
                          Add
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enter domains allowed to use this bot's API key. Use `*`
                        as a wildcard (e.g., `https://*.example.com`). Leave
                        empty to allow any origin (less secure).
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="project-only">
                          Answer only project-related questions
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          When enabled, the assistant will only use your
                          documentation context.
                        </p>
                      </div>
                      <Switch
                        id="project-only"
                        checked={projectOnly}
                        onCheckedChange={setProjectOnly}
                      />
                    </div>

                    {/* Save Button */}
                    <div className="pt-4">
                      <Button onClick={handleSaveSettings} disabled={isSaving}>
                        {isSaving && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* API Credentials Card (Moved to Column 1) */}
                <Card>
                  <CardHeader>
                    <CardTitle>API Credentials</CardTitle>
                    <CardDescription>
                      Use these to integrate your bot.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="api-url">API URL</Label>
                      <div className="flex">
                        <Input
                          id="api-url"
                          value={bot.api_url ?? "N/A"}
                          readOnly
                          className="rounded-r-none"
                        />
                        <Button
                          variant="secondary"
                          size="icon"
                          className="rounded-l-none"
                          onClick={() => copyToClipboard(bot.api_url)}
                          disabled={!bot.api_url}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="api-key">API Key</Label>
                      <div className="flex">
                        <Input
                          id="api-key"
                          value={
                            showApiKey
                              ? bot.api_key ?? "N/A"
                              : "•".repeat(bot.api_key?.length ?? 3)
                          }
                          readOnly
                          className="rounded-r-none font-mono"
                          disabled={!bot.api_key}
                        />
                        <Button
                          variant="secondary"
                          size="icon"
                          className="rounded-none border-x-0"
                          onClick={() => setShowApiKey(!showApiKey)}
                          disabled={!bot.api_key}
                        >
                          {showApiKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="rounded-l-none"
                          onClick={() => copyToClipboard(bot.api_key)}
                          disabled={!bot.api_key}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Keep this key secret. Use it server-side or in secure
                        environments.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Column 2 (1fr): Documentation Files */}
              <div className="lg:col-span-1 space-y-6">
                {/* Usage Statistics Card (Should be here) */}
                <Card>
                  <CardHeader>
                    <CardTitle>Usage Statistics</CardTitle>
                    <CardDescription>
                      Your current usage based on the '
                      {profile?.subscriptions?.name ?? "Free"}' plan.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Storage Usage */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="storage-progress"
                          className="flex items-center gap-2"
                        >
                          <Database className="h-4 w-4 text-muted-foreground" />
                          Document Storage
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {currentStorageUsedMB} MB / {maxStorageMB} MB
                        </span>
                      </div>
                      <Progress
                        id="storage-progress"
                        value={storagePercentage}
                        className="h-2"
                      />
                    </div>
                    {/* Requests Usage */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="requests-progress"
                          className="flex items-center gap-2"
                        >
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          Monthly Requests
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {currentRequestsUsed} / {maxRequestsMonth}
                        </span>
                      </div>
                      <Progress
                        id="requests-progress"
                        value={requestsPercentage}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Documentation Files Card (Should be here, after stats) */}
                <Card>
                  <CardHeader>
                    <CardTitle>Documentation Files</CardTitle>
                    <CardDescription>
                      Manage documents for bot: {bot.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Document List with ScrollArea */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">
                        Uploaded Documents
                      </h4>
                      <ScrollArea className="max-h-60 w-full rounded-md border">
                        <div className="p-1">
                          {isLoadingDocs ? (
                            <div className="flex items-center justify-center text-muted-foreground py-4">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                              Loading documents...
                            </div>
                          ) : documents.length === 0 ? (
                            <div className="flex items-center justify-center text-muted-foreground py-4">
                              <p className="text-sm">
                                No documents uploaded yet.
                              </p>
                            </div>
                          ) : (
                            <ul className="divide-y divide-border">
                              {documents.map((doc) => (
                                <li
                                  key={doc.id}
                                  className="p-3 flex items-center justify-between gap-4 hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                                    <FileText className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                                    <div className="flex-grow overflow-hidden">
                                      <p
                                        className="text-sm font-medium truncate"
                                        title={doc.file_name}
                                      >
                                        {doc.file_name}
                                      </p>
                                      <p className="text-xs text-muted-foreground space-x-2">
                                        <span>
                                          {formatBytes(doc.file_size_bytes)}
                                        </span>
                                        <span>•</span>
                                        <span>Status: {doc.status}</span>
                                        <span>•</span>
                                        <span>
                                          Uploaded:{" "}
                                          {new Date(
                                            doc.uploaded_at
                                          ).toLocaleDateString()}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteDocument(doc)}
                                    disabled={isDeletingDoc === doc.id}
                                    aria-label="Delete document"
                                    className="flex-shrink-0"
                                  >
                                    {isDeletingDoc === doc.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                                    )}
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Upload Area with Drag-n-Drop styling */}
                    <div
                      className={cn(
                        "relative border-2 border-dashed border-border rounded-lg p-8 text-center transition-colors duration-200 ease-in-out",
                        dragActive
                          ? "border-primary bg-primary/10"
                          : "bg-transparent"
                      )}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Upload className="h-9 w-9 text-primary mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Upload New Document
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag & drop files here or click below
                      </p>
                      <p className="text-xs text-muted-foreground mb-5">
                        Max Size:{" "}
                        {profile?.subscriptions?.max_total_doc_size_mb ?? 0}MB (
                        {subscriptionName} plan)
                      </p>

                      {/* Button to trigger file input */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="mb-4"
                        disabled={isUploading}
                      >
                        Choose File
                      </Button>
                      {/* Hidden file input */}
                      <Input
                        id="file-upload-input"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        // accept=".pdf,.md,.txt,.html"
                      />

                      {selectedFile && (
                        <div className="mt-4 text-sm">
                          <p className="text-muted-foreground mb-2">
                            Selected:{" "}
                            <span className="font-medium text-foreground">
                              {selectedFile.name}
                            </span>{" "}
                            ({formatBytes(selectedFile.size)})
                          </p>
                          {isUploading && (
                            <Progress
                              value={uploadProgress}
                              className="w-full h-2 mb-3 max-w-sm mx-auto"
                            />
                          )}
                          <Button
                            onClick={handleFileUpload}
                            disabled={!selectedFile || isUploading}
                            size="sm"
                          >
                            {isUploading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="mr-2 h-4 w-4" />
                            )}
                            {isUploading ? "Uploading... 0%" : "Upload File"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs">
          {/* Content moved from original page, uses bot data if available */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
              <CardDescription>
                Integrate your bot ({bot?.name ?? "Your Bot"}) into a React app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  1. Install the package
                </h3>
                <CodeBlock code="npm install doctalkie-react" language="bash" />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">
                  2. Import the component
                </h3>
                <CodeBlock
                  code="import { DocTalkieChat } from 'doctalkie-react'"
                  language="jsx"
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">
                  3. Add the component to your app
                </h3>
                <CodeBlock
                  code={`import { DocTalkieChat } from 'doctalkie-react'

export default function App() {
  return (
    <div>
      <h1>My Awesome App</h1>
      <DocTalkieChat 
        apiURL="${bot?.api_url ?? "YOUR_API_URL"}" // Use actual API URL
        apiKey="${bot?.api_key ?? "YOUR_API_KEY"}" // Use actual API Key
        // Optional props...
      />
    </div>
  )
}`}
                  language="jsx"
                  showLineNumbers
                />
              </div>
              {/* ... rest of Quick Start ... */}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>
                View statistics for: {bot?.name ?? "Your Bot"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Analytics are coming soon.
                </p>
                <Button variant="outline" disabled>
                  Refresh Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
