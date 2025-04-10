"use client";

import { useState, useEffect } from "react";
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
import { Copy, Eye, EyeOff, Upload, PlusCircle, Loader2 } from "lucide-react"; // Added icons
import CodeBlock from "@/components/code-block";
import { createClient } from "@/utils/supabase/client"; // Use client-side client for mutations
import type { User } from "@supabase/supabase-js";

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
} | null;

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

  useEffect(() => {
    // Update local state if initialBot changes (e.g., after creation)
    setBot(initialBot);
    setAssistantName(initialBot?.name ?? "My First Bot");
    setProjectOnly(initialBot?.strict_context ?? true);
  }, [initialBot]);

  const copyToClipboard = async (text: string | undefined) => {
    if (text) {
      await navigator.clipboard.writeText(text);
      // Add toast notification here if desired
      console.log("Copied to clipboard!");
    }
  };

  const handleSaveSettings = async () => {
    if (!bot) return;
    setIsSaving(true);
    const { data, error } = await supabase
      .from("bots")
      .update({ name: assistantName, strict_context: projectOnly })
      .eq("id", bot.id)
      .select()
      .single();

    if (error) {
      console.error("Error saving bot settings:", error);
      // Add error toast notification
    } else {
      setBot(data as Bot); // Update local state with saved data
      console.log("Settings saved!");
      // Add success toast notification
    }
    setIsSaving(false);
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

  // Display subscription name, fallback to ID if name is missing
  const subscriptionName =
    profile?.subscriptions?.name ?? profile?.subscription_id ?? "Loading...";

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
        <TabsContent value="settings" className="space-y-6">
          {!bot ? (
            // Show Create Bot Card if no bot exists
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
            // Show Bot Settings if bot exists
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Assistant Settings</CardTitle>
                  <CardDescription>
                    Customize how your AI assistant behaves ({bot.id})
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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

              {/* Placeholder for Documentation Upload Area - shown only if bot exists */}
              <Card>
                <CardHeader>
                  <CardTitle>Documentation Files</CardTitle>
                  <CardDescription>
                    Upload documents to train bot: {bot.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* TODO: Implement File Upload and List */}
                  <div className="border-2 border-dashed border-border rounded-lg p-10 text-center">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Upload Documentation
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag and drop files here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mb-6">
                      Max Size:{" "}
                      {profile?.subscriptions?.max_total_doc_size_mb ?? 0}MB (
                      {subscriptionName} plan)
                    </p>
                    <Button disabled>Upload Files (Coming Soon)</Button>
                  </div>
                  {/* TODO: List existing documents */}
                </CardContent>
              </Card>
            </>
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
