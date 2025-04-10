"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Eye, EyeOff, Upload } from "lucide-react"
import CodeBlock from "@/components/code-block"

export default function DashboardPage() {
  const [assistantName, setAssistantName] = useState("DocTalkie")
  const [projectOnly, setProjectOnly] = useState(true)
  const [showApiKey, setShowApiKey] = useState(false)

  const apiKey = "dt_1234567890abcdefghijklmn"
  const apiUrl = "https://api.doctalkie.ai/projects/demo-project"

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assistant Settings</CardTitle>
              <CardDescription>Customize how your AI assistant behaves and appears to users</CardDescription>
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
                  This name will be displayed to users in the chat interface
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="project-only">Answer only project-related questions</Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, the assistant will only answer questions related to your documentation
                  </p>
                </div>
                <Switch id="project-only" checked={projectOnly} onCheckedChange={setProjectOnly} />
              </div>

              <div className="pt-4">
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Credentials</CardTitle>
              <CardDescription>Use these credentials to integrate DocTalkie into your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-url">API URL</Label>
                <div className="flex">
                  <Input id="api-url" value={apiUrl} readOnly className="rounded-r-none" />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-l-none"
                    onClick={() => copyToClipboard(apiUrl)}
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
                    value={showApiKey ? apiKey : "•".repeat(apiKey.length)}
                    readOnly
                    className="rounded-r-none font-mono"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-none border-x-0"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-l-none"
                    onClick={() => copyToClipboard(apiKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Keep this key secret. Do not share it in client-side code.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentation Files</CardTitle>
              <CardDescription>Upload documentation files to train your AI assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-10 text-center">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Documentation</h3>
                <p className="text-sm text-muted-foreground mb-4">Drag and drop files here or click to browse</p>
                <p className="text-xs text-muted-foreground mb-6">Supports PDF, Markdown, HTML, and plain text files</p>
                <Button>Upload Files</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
              <CardDescription>Follow these steps to integrate DocTalkie into your React application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">1. Install the package</h3>
                <CodeBlock code="npm install doctalkie-react" language="bash" />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">2. Import the component</h3>
                <CodeBlock code="import { DocTalkieChat } from 'doctalkie-react'" language="jsx" />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">3. Add the component to your app</h3>
                <CodeBlock
                  code={`import { DocTalkieChat } from 'doctalkie-react'

export default function App() {
  return (
    <div>
      <h1>My Awesome App</h1>
      {/* Add DocTalkie Chat Widget */}
      <DocTalkieChat 
        apiURL="${apiUrl}"
        apiKey="${apiKey}"
        // Optional props
        color="#00e6e6"
        position="bottom-right"
      />
    </div>
  )
}`}
                  language="jsx"
                  showLineNumbers
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Available Props</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="text-left p-2 font-medium">Prop</th>
                        <th className="text-left p-2 font-medium">Description</th>
                        <th className="text-left p-2 font-medium">Required</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="p-2 font-mono text-primary">apiURL</td>
                        <td className="p-2 text-muted-foreground">Your DocTalkie API URL</td>
                        <td className="p-2">Yes</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono text-primary">apiKey</td>
                        <td className="p-2 text-muted-foreground">Your DocTalkie API key</td>
                        <td className="p-2">Yes</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono text-primary">color</td>
                        <td className="p-2 text-muted-foreground">Custom accent color (hex or RGB)</td>
                        <td className="p-2">No</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono text-primary">position</td>
                        <td className="p-2 text-muted-foreground">Widget position (bottom-right, bottom-left, etc.)</td>
                        <td className="p-2">No</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>View statistics about your DocTalkie assistant usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Analytics will be available after your assistant receives its first interactions
                </p>
                <Button variant="outline">Refresh Data</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
