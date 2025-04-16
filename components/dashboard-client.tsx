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
  Globe,
} from "lucide-react";
import CodeBlock from "@/components/code-block";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { DocTalkieChat } from "doctalkie-react";

// Define prop types (basic structure, enhance with full types if available)
type Subscription = {
  id: string;
  name: string;
  max_bots: number;
  max_total_doc_size_mb: number;
} | null;

type Profile = {
  id: string;
  subscription_id: string | null;
  subscriptions: Subscription;
  total_queries?: number;
  total_storage_usage_bytes?: number;
} | null;

type Bot = {
  id: string;
  user_id: string;
  name: string;
  strict_context: boolean;
  api_key: string;
  allowed_origins: string[] | null;
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
  const [uploadError, setUploadError] = useState<string | null>(null);
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
  const [isDomainRestrictionEnabled, setIsDomainRestrictionEnabled] = useState(
    !!initialBot?.allowed_origins && initialBot.allowed_origins.length > 0
  );

  // New states for statistics
  const [userStats, setUserStats] = useState<{
    queries: number;
    storageBytes: number;
  }>({ queries: 0, storageBytes: 0 });
  const [limits, setLimits] = useState<{
    maxQueries: number;
    maxStorageBytes: number;
  }>({ maxQueries: 0, maxStorageBytes: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    // Update local state if initialBot changes
    setBot(initialBot);
    setAssistantName(initialBot?.name ?? "My First Bot");
    setProjectOnly(initialBot?.strict_context ?? true);
    const initialOrigins = initialBot?.allowed_origins ?? [];
    setCurrentOrigins(initialOrigins);
    // Set switch state based on initial origins
    setIsDomainRestrictionEnabled(initialOrigins.length > 0);
    setNewOriginInput("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [initialBot]);

  // ВЫНОСИМ ЛОГИКУ ЗАГРУЗКИ СТАТИСТИКИ В ОТДЕЛЬНУЮ ФУНКЦИЮ
  const fetchUserStatsAndLimits = useCallback(async () => {
    if (!user) {
      setStatsError("User not available.");
      setIsLoadingStats(false);
      return;
    }
    setIsLoadingStats(true);
    setStatsError(null);
    try {
      // 1. Получаем статистику и ID подписки пользователя
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("total_queries, total_storage_usage_bytes, subscription_id")
        .eq("id", user.id)
        .single();

      if (userError)
        throw new Error(
          `Failed to fetch user statistics: ${userError.message}`
        );
      if (!userData) throw new Error("User data not found.");

      // Обновляем текущее использование
      const currentQueries = userData.total_queries ?? 0;
      const currentStorageBytes = userData.total_storage_usage_bytes ?? 0;
      setUserStats({
        queries: currentQueries,
        storageBytes: currentStorageBytes,
      });

      // 2. Получаем лимиты подписки (если она есть)
      let currentLimits = { maxQueries: 500, maxStorageBytes: 5 * 1024 * 1024 };
      if (userData.subscription_id) {
        const { data: subData, error: subError } = await supabase
          .from("subscriptions")
          .select("max_requests_month, max_total_doc_size_mb")
          .eq("id", userData.subscription_id)
          .single();
        if (subError) {
          console.warn(
            `[DashboardClient] Failed to fetch subscription details for ${userData.subscription_id}: ${subError.message}. Using default limits.`
          );
        } else if (subData) {
          currentLimits = {
            maxQueries: subData.max_requests_month ?? 500,
            maxStorageBytes: (subData.max_total_doc_size_mb ?? 5) * 1024 * 1024,
          };
        }
      }
      setLimits(currentLimits);
    } catch (error) {
      console.error("[DashboardClient] Error loading usage statistics:", error);
      setStatsError(
        error instanceof Error ? error.message : "Failed to load statistics."
      );
      setUserStats({ queries: 0, storageBytes: 0 });
      setLimits({ maxQueries: 0, maxStorageBytes: 0 });
    } finally {
      setIsLoadingStats(false);
    }
  }, [user, supabase]);

  // useEffect для загрузки статистики при монтировании
  useEffect(() => {
    fetchUserStatsAndLimits();
  }, [fetchUserStatsAndLimits]); // Зависимость от useCallback-функции

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

  // useEffect для загрузки документов при монтировании/смене бота
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const copyToClipboard = async (text: string | undefined) => {
    if (text) {
      await navigator.clipboard.writeText(text);
    }
  };

  const handleSaveSettings = async () => {
    if (!bot) return;
    setIsSaving(true);

    // Determine origins to save based on the switch state
    const originsToSave = isDomainRestrictionEnabled ? currentOrigins : null;

    const { data, error } = await supabase
      .from("bots")
      .update({
        name: assistantName,
        strict_context: projectOnly,
        allowed_origins: originsToSave, // Save null if switch is off, array if on
      })
      .eq("id", bot.id)
      .select()
      .single();

    if (error) {
      console.error("Error saving bot settings:", error);
    } else {
      const updatedBot = data as Exclude<Bot, null>;
      setBot(updatedBot);
      // Update local state to match saved state
      const savedOrigins = updatedBot.allowed_origins ?? [];
      setCurrentOrigins(savedOrigins);
      setIsDomainRestrictionEnabled(savedOrigins.length > 0);
      console.log("Settings saved!");
    }
    setIsSaving(false);
  };

  // Handler for toggling the domain restriction switch
  const handleDomainRestrictionToggle = (checked: boolean) => {
    setIsDomainRestrictionEnabled(checked);
    // If turning restriction OFF, clear the current origins list
    if (!checked) {
      setCurrentOrigins([]);
    }
    // If turning ON, the user will add origins via the UI
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
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setUploadError(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !bot) {
      setUploadError("Please select a file and ensure a bot is active.");
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const response = await fetch(
        `/api/assistants/${bot.id}/documents/process`,
        { method: "POST", body: formData }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.error || `Upload failed with status: ${response.status}`
        );
      }
      console.log("File processed successfully:", result);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchDocuments(); // Обновляем список документов
      fetchUserStatsAndLimits(); // <<<--- ВЫЗЫВАЕМ ОБНОВЛЕНИЕ СТАТИСТИКИ
    } catch (error) {
      console.error("Error uploading file:", error);
      const message =
        error instanceof Error
          ? error.message
          : "An unknown error occurred during upload.";
      setUploadError(`Upload failed: ${message}`);
    } finally {
      setIsUploading(false);
    }
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

  // Calculate percentages based on new states
  const storagePercentage =
    limits.maxStorageBytes > 0
      ? (userStats.storageBytes / limits.maxStorageBytes) * 100
      : 0;
  const requestsPercentage =
    limits.maxQueries > 0 ? (userStats.queries / limits.maxQueries) * 100 : 0;

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

  // ВОЗВРАЩАЕМ ОПРЕДЕЛЕНИЕ formatBytes СЮДА
  const formatBytes = (bytes: number, decimals = 2): string => {
    if (!+bytes) return "0 Bytes"; // Исправлена проверка на 0 и добавлено '+' для преобразования

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <>
      <div className="container py-10">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="text-sm text-muted-foreground">
            Plan:{" "}
            <span className="font-semibold text-primary">
              {subscriptionName}
            </span>
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
                        Configure the behavior of your assistant.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Assistant Name */}
                      <div className="space-y-2">
                        <Label htmlFor="assistant-name">Assistant Name</Label>
                        <Input
                          id="assistant-name"
                          value={assistantName}
                          onChange={(e) => setAssistantName(e.target.value)}
                          placeholder="My Documentation Bot"
                        />
                      </div>

                      {/* Project Only Switch */}
                      <div className="flex items-center justify-between space-x-2 border p-4 rounded-md">
                        <Label
                          htmlFor="project-only-switch"
                          className="flex flex-col space-y-1"
                        >
                          <span>Answer only project-related questions</span>
                          <span className="font-normal leading-snug text-muted-foreground">
                            Limit responses to the content of your uploaded
                            documents.
                          </span>
                        </Label>
                        <Switch
                          id="project-only-switch"
                          checked={projectOnly}
                          onCheckedChange={setProjectOnly}
                        />
                      </div>

                      {/* Domain Restriction Switch */}
                      <div className="flex items-center justify-between space-x-2 border p-4 rounded-md">
                        <Label
                          htmlFor="domain-restriction-switch"
                          className="flex flex-col space-y-1"
                        >
                          <span>Restrict access by domain</span>
                          <span className="font-normal leading-snug text-muted-foreground">
                            Allow chat widget integration only from specified
                            domains.
                          </span>
                        </Label>
                        <Switch
                          id="domain-restriction-switch"
                          checked={isDomainRestrictionEnabled}
                          onCheckedChange={handleDomainRestrictionToggle}
                        />
                      </div>

                      {/* Allowed Domains Input/List (conditionally rendered) MOVED HERE */}
                      {isDomainRestrictionEnabled && (
                        <div className="space-y-4 pt-4 border-t border-border/40 mt-4">
                          <Label className="flex items-center gap-2 text-sm font-medium">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            Allowed Domains
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Specify the domains where your chat widget can be
                            embedded. Use * for wildcard subdomains (e.g.,
                            *.example.com).
                          </p>
                          <div className="flex space-x-2">
                            <Input
                              value={newOriginInput}
                              onChange={(e) =>
                                setNewOriginInput(e.target.value)
                              }
                              placeholder="e.g., https://example.com or *.myapp.com"
                              className="h-9" // Adjusted height
                            />
                            <Button onClick={handleAddOrigin} size="sm">
                              Add
                            </Button>
                          </div>
                          {currentOrigins.length > 0 && (
                            <ScrollArea className="max-h-32 w-full rounded-md border">
                              <div className="p-4">
                                <ul className="space-y-2">
                                  {currentOrigins.map((origin) => (
                                    <li
                                      key={origin}
                                      className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded-md"
                                    >
                                      <span className="break-all font-mono">
                                        {origin}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 shrink-0"
                                        onClick={() =>
                                          handleRemoveOrigin(origin)
                                        }
                                      >
                                        <IconX className="h-4 w-4" />
                                      </Button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </ScrollArea>
                          )}
                        </div>
                      )}

                      {/* Save Button */}
                      <div className="pt-4">
                        <Button
                          onClick={handleSaveSettings}
                          disabled={isSaving}
                        >
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
                            value={`${
                              process.env.NEXT_PUBLIC_BASE_URL || ""
                            }/api/chat/${bot?.id ?? ""}`}
                            readOnly
                            className="rounded-r-none"
                          />
                          <Button
                            variant="secondary"
                            size="icon"
                            className="rounded-l-none"
                            onClick={() =>
                              copyToClipboard(
                                `${
                                  process.env.NEXT_PUBLIC_BASE_URL || ""
                                }/api/chat/${bot?.id}`
                              )
                            }
                            disabled={!bot?.id}
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

                {/* Column 2 (1fr): Statistics and Documents */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Usage Statistics Card (UPDATED) */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Usage Statistics</CardTitle>
                      <CardDescription>
                        Your current usage based on the '
                        {profile?.subscriptions?.name ?? "Free"}' plan.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {isLoadingStats ? (
                        <div className="flex items-center justify-center text-muted-foreground py-4">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Loading statistics...
                        </div>
                      ) : statsError ? (
                        <p className="text-sm text-red-600 text-center">
                          {statsError}
                        </p>
                      ) : (
                        <>
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
                                {formatBytes(userStats.storageBytes)} /{" "}
                                {formatBytes(limits.maxStorageBytes)}
                              </span>
                            </div>
                            <Progress
                              id="storage-progress"
                              value={storagePercentage}
                              className="h-2"
                              aria-label={`Storage used ${storagePercentage.toFixed(
                                0
                              )}%`}
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
                                {userStats.queries} / {limits.maxQueries}
                              </span>
                            </div>
                            <Progress
                              id="requests-progress"
                              value={requestsPercentage}
                              className="h-2"
                              aria-label={`Requests used ${requestsPercentage.toFixed(
                                0
                              )}%`}
                            />
                          </div>
                        </>
                      )}
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

                      {/* Upload Area */}
                      <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,text/plain,.md,text/markdown"
                          className="hidden" // Скрываем стандартный инпут
                          id="file-upload"
                        />
                        {/* Показываем кнопку выбора, если файл не выбран */}
                        {!selectedFile && (
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="mr-2 h-4 w-4" /> Select File
                          </Button>
                        )}
                        {/* Показываем информацию о файле и кнопки управления, если файл выбран */}
                        {selectedFile && (
                          <div className="mt-4 text-sm text-muted-foreground flex flex-col items-center gap-2">
                            <p>
                              {selectedFile.name} (
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Button
                                onClick={handleFileUpload}
                                disabled={isUploading}
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                    Uploading...
                                  </>
                                ) : (
                                  <Upload className="mr-2 h-4 w-4" /> +
                                  "Confirm Upload"
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedFile(null);
                                  if (fileInputRef.current)
                                    fileInputRef.current.value = "";
                                }}
                                disabled={isUploading}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                        {/* Показываем ошибку загрузки, если она есть */}
                        {uploadError && (
                          <p className="mt-4 text-sm text-red-600">
                            {uploadError}
                          </p>
                        )}
                        {/* Информация о поддерживаемых форматах */}
                        <p className="mt-4 text-xs text-muted-foreground">
                          Supported formats: PDF, DOCX, TXT. Max size: 10MB
                          (example).
                        </p>
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
                  Integrate your bot ({bot?.name ?? "Your Bot"}) into a React
                  app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    1. Install the package
                  </h3>
                  <CodeBlock
                    code="npm install doctalkie-react"
                    language="bash"
                  />
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
        apiURL="${process.env.NEXT_PUBLIC_BASE_URL}/api/chat/${
                      bot?.id ?? "{YOUR_BOT_ID}"
                    }"
        apiKey="${bot?.api_key ?? "{YOUR_API_KEY}"}"
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

            {/* Integration Examples Card */}
            <Card>
              <CardHeader>
                <CardTitle>Integrate Your Bot</CardTitle>
                <CardDescription>
                  Use these snippets to integrate the chat widget.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="javascript">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="react">React</TabsTrigger>
                  </TabsList>
                  <TabsContent value="javascript">
                    <CodeBlock
                      language="html"
                      code={`<!-- Include this script tag in your HTML -->
<script 
  src="${process.env.NEXT_PUBLIC_BASE_URL || ""}/widget.js" 
  data-api-url="${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/chat/${
                        bot?.id ?? "{YOUR_BOT_ID}"
                      }" 
  data-api-key="${bot?.api_key ?? "{YOUR_API_KEY}"}" 
  defer
></script>`}
                    />
                  </TabsContent>
                  <TabsContent value="react">
                    <CodeBlock
                      language="jsx"
                      code={`import DocTalkieChat from '@/components/doc-talkie-chat'; // Adjust import path

function MyComponent() {
  return (
    <DocTalkieChat 
      apiURL="${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/chat/${
                        bot?.id ?? "{YOUR_BOT_ID}"
                      }"
      apiKey="${bot?.api_key ?? "{YOUR_API_KEY}"}"
      // Optional props
      // theme="light" 
      // accentColor="#007bff"
    />
  );
}`}
                    />
                  </TabsContent>
                </Tabs>
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
      {/* ДОБАВЛЯЕМ ЧАТ-ВИДЖЕТ ЗДЕСЬ */}
      <DocTalkieChat
        apiURL={`${process.env.NEXT_PUBLIC_BASE_URL}/api/chat/a6ef5aab-2722-4736-b699-d68c4e38ae1a`}
        apiKey="dt_4a8b0aa6-bbe6-468b-a3eb-fe4f1e46297e"
        theme="doctalkie"
      />
    </>
  );
}
