"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CodeBlock from "@/components/code-block";
import {
  ArrowRight,
  BookOpen,
  Code,
  FileText,
  MessageCircle,
  Settings,
  Zap,
} from "lucide-react";
import { DocsSidebarNav } from "@/components/docs-sidebar-nav";
import { DocTalkieChat } from "doctalkie-react";

export default function DocsPage() {
  return (
    <>
      <div className="container py-10">
        {/* Two-column layout */}
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar (Left Column) */}
          <aside className="w-full md:w-1/4 lg:w-1/5 shrink-0 md:block hidden">
            <DocsSidebarNav />
          </aside>

          {/* Main Content (Right Column) */}
          <main className="flex-1 min-w-0">
            {/* Sections */}
            <div className="space-y-10 max-w-3xl">
              <section id="introduction" className="space-y-4 scroll-mt-20">
                <h1 className="text-3xl font-bold tracking-tight">
                  DocTalkie Documentation
                </h1>
                <p className="text-lg text-muted-foreground">
                  Welcome to the official documentation for DocTalkie. Here you
                  will find everything you need to embed the chat widget or
                  build your own chat interface using our tools.
                </p>
                <p className="text-muted-foreground">
                  DocTalkie allows you to create AI assistants based on your
                  documents. This documentation covers how to integrate the chat
                  experience into your application.
                </p>
                <p className="text-muted-foreground">
                  Explore the sections in the sidebar navigation: 'Usage: Chat
                  Widget' for the quickest integration, or 'Usage: Hook' for
                  building a custom interface.
                </p>
              </section>

              {/* --- NEW Installation Section --- */}
              <section id="installation" className="scroll-mt-16 space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Code className="h-6 w-6 text-primary" />
                  Installation
                </h2>
                <p className="text-muted-foreground">
                  To integrate DocTalkie into your React project, install the
                  package using your preferred package manager:
                </p>
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <p className="mb-2 font-medium">Using npm:</p>
                      <CodeBlock
                        code="npm install doctalkie-react"
                        language="bash"
                      />
                    </div>
                    <div>
                      <p className="mb-2 font-medium">Using yarn:</p>
                      <CodeBlock
                        code="yarn add doctalkie-react"
                        language="bash"
                      />
                    </div>
                    <div>
                      <p className="mb-2 font-medium">Using pnpm:</p>
                      <CodeBlock
                        code="pnpm add doctalkie-react"
                        language="bash"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground pt-2">
                      Once installed, you can import the necessary components or
                      hooks into your application as shown in the usage
                      sections.
                    </p>
                  </CardContent>
                </Card>
              </section>
              {/* --- End of Installation Section --- */}

              <section id="usage-widget" className="scroll-mt-16">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <MessageCircle className="h-6 w-6 text-primary" />
                  Usage: Chat Widget (Minimal)
                </h2>
                <p className="text-muted-foreground mb-4">
                  The easiest way to add a DocTalkie chat to your application is
                  by using the built-in{" "}
                  <code className="font-mono text-primary bg-muted px-1 py-0.5 rounded">
                    DocTalkieChat
                  </code>{" "}
                  component. Below is the minimal setup required.
                </p>
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <p className="mb-2 font-medium">Minimal Example:</p>
                    <CodeBlock
                      code={`import DocTalkieChat from \'@/components/doc-talkie-chat/doc-talkie-chat\';

export default function MyApp() {
  const botApiUrl = "YOUR_BOT_API_URL"; // Replace with your Bot's API URL
  const botApiKey = "YOUR_BOT_API_KEY";   // Replace with your Bot's API Key

  return (
    <div>
      <h1>My Application</h1>
      {/* Minimal chat widget setup */}
      <DocTalkieChat 
        apiURL={botApiUrl} 
        apiKey={botApiKey}
      />
    </div>
  );
}`}
                      language="typescript"
                      showLineNumbers
                    />
                    <p className="text-sm text-muted-foreground pt-2">
                      Replace{" "}
                      <code className="font-mono text-primary bg-muted px-1 py-0.5 rounded">
                        YOUR_ASSISTANT_ID
                      </code>{" "}
                      and
                      <code className="font-mono text-primary bg-muted px-1 py-0.5 rounded">
                        YOUR_BOT_API_KEY
                      </code>{" "}
                      with values from your DocTalkie dashboard.
                    </p>
                  </CardContent>
                </Card>
              </section>

              <section id="widget-configuration" className="scroll-mt-16">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Settings className="h-6 w-6 text-primary" />
                  Widget Configuration & Customization
                </h2>
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <p>
                      The{" "}
                      <code className="font-mono text-primary bg-muted px-1 py-0.5 rounded">
                        DocTalkieChat
                      </code>{" "}
                      component accepts required and optional props for
                      customization:
                    </p>
                    {/* Required Props Table */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Required Props
                      </h3>
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-3 font-medium">
                                Prop
                              </th>
                              <th className="text-left p-3 font-medium">
                                Description
                              </th>
                              <th className="text-left p-3 font-medium">
                                Type
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            <tr>
                              <td className="p-3 font-mono text-primary">
                                apiURL
                              </td>
                              <td className="p-3 text-muted-foreground">
                                The endpoint for the chat API, typically{" "}
                                <code className="text-xs">
                                  /api/chat/[assistantId]
                                </code>
                                .
                              </td>
                              <td className="p-3 font-mono">string</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-mono text-primary">
                                apiKey
                              </td>
                              <td className="p-3 text-muted-foreground">
                                The specific API key for your bot, obtained from
                                the dashboard.
                              </td>
                              <td className="p-3 font-mono">string</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Optional Props Table */}
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Optional Props
                      </h3>
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-3 font-medium">
                                Prop
                              </th>
                              <th className="text-left p-3 font-medium">
                                Description
                              </th>
                              <th className="text-left p-3 font-medium">
                                Type
                              </th>
                              <th className="text-left p-3 font-medium">
                                Default
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            <tr>
                              <td className="p-3 font-mono text-primary">
                                theme
                              </td>
                              <td className="p-3 text-muted-foreground">
                                Visual theme ("light", "dark", or "doctalkie").
                              </td>
                              <td className="p-3 font-mono">string</td>
                              <td className="p-3 font-mono">"doctalkie"</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-mono text-primary">
                                accentColor
                              </td>
                              <td className="p-3 text-muted-foreground">
                                Background color for user messages (e.g.,
                                "#FF5733"). Overrides theme color for user
                                messages.
                              </td>
                              <td className="p-3 font-mono">string</td>
                              <td className="p-3 text-muted-foreground">
                                Theme default
                              </td>
                            </tr>
                            <tr>
                              <td className="p-3 font-mono text-primary">
                                position
                              </td>
                              <td className="p-3 text-muted-foreground">
                                Widget position ("bottom-right" or
                                "bottom-left").
                              </td>
                              <td className="p-3 font-mono">string</td>
                              <td className="p-3 font-mono">"bottom-right"</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-mono text-primary">
                                welcomeMessage
                              </td>
                              <td className="p-3 text-muted-foreground">
                                Custom initial message from the assistant.
                              </td>
                              <td className="p-3 font-mono">string</td>
                              <td className="p-3">
                                "Hi there! How can I help you today?"
                              </td>
                            </tr>
                            <tr>
                              <td className="p-3 font-mono text-primary">
                                className
                              </td>
                              <td className="p-3 text-muted-foreground">
                                Additional CSS classes for the root widget
                                container.
                              </td>
                              <td className="p-3 font-mono">string</td>
                              <td className="p-3 text-muted-foreground">
                                None
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* --- NEW: Example with Customizations --- */}
                    <div className="pt-4">
                      {" "}
                      {/* Add some top padding */}
                      <h3 className="text-lg font-medium mb-2">
                        Example with Customizations
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Demonstrating various optional props.
                      </p>
                      <CodeBlock
                        code={`import DocTalkieChat from \'@/components/doc-talkie-chat/doc-talkie-chat\';
// import \'./my-custom-styles.css\'; // If using className

export default function AnotherPage() {
  const botApiUrl = "YOUR_BOT_API_URL";
  const botApiKey = "YOUR_BOT_API_KEY";

  return (
    <div className="app">
       <header><h1>Another Page with Customized Chat</h1></header>
      {/* --- Customized DocTalkie Chat Widget --- */}
      <DocTalkieChat 
        apiURL={botApiUrl} 
        apiKey={botApiKey}
        // Customizations:
        theme="light" 
        position="bottom-left"
        accentColor="#8B5CF6" // Example: Violet color for user messages
        welcomeMessage="Ask me anything about the advanced topics!"
        className="my-custom-widget-styles" // Optional custom class for further styling
      />
       {/* --------------------------------------- */}
    </div>
  )
}`}
                        language="typescript"
                        showLineNumbers
                      />
                    </div>
                    {/* --- End of New Example --- */}
                  </CardContent>
                </Card>
              </section>

              <section id="usage-hook" className="scroll-mt-16">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="h-6 w-6 text-primary" />
                  Usage: Hook (Advanced)
                </h2>
                <p className="text-muted-foreground mb-4">
                  For complete control over the chat UI, you can use the{" "}
                  <code className="font-mono text-primary bg-muted px-1 py-0.5 rounded">
                    useDocTalkie
                  </code>{" "}
                  hook. It handles the API communication and state management,
                  allowing you to build a custom interface.
                </p>
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <p className="mb-2 font-medium">Example:</p>
                    <CodeBlock
                      code={`import { useState, useEffect } from 'react';
import { useDocTalkie, type Message } from '@/components/doc-talkie-chat/use-doc-talkie';

function MyCustomChatInterface() {
  const botApiUrl = "YOUR_BOT_API_URL"; // Replace with your Bot's API URL
  const botApiKey = "YOUR_BOT_API_KEY";   // Replace with your Bot's API Key
  const [input, setInput] = useState('');

  const { messages, isLoading, error, sendMessage } = useDocTalkie({
    apiURL: botApiUrl,
    apiKey: botApiKey,
    // Optional: Provide initial messages if needed
    // initialMessages: [{ id: 'custom-start', content: 'Start here!', sender: 'system' }]
  });

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="my-chat-container">
      <div className="messages-area">
        {error && <div className="error-message">{error}</div>}
        {messages.map((msg: Message) => (
          <div key={msg.id} className={\`message \${msg.sender}\`}>
            {/* Render your message bubble here using msg.content */}
            {/* You might want to use react-markdown here too! */}
            <p>{msg.content}</p>
          </div>
        ))}
        {isLoading && <div className="loading-indicator">Assistant is typing...</div>}
      </div>
      <div className="input-area">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask something..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()}>Send</button>
      </div>
    </div>
  );
}`}
                      language="typescript"
                      showLineNumbers
                    />
                    <p className="text-sm text-muted-foreground pt-2">
                      The hook returns an object containing:
                    </p>
                    <ul className="list-disc list-inside mt-1 pl-2 space-y-1 text-sm text-muted-foreground">
                      <li>
                        <code className="font-mono text-primary text-xs bg-muted px-1 rounded">
                          messages
                        </code>
                        : An array of message objects.
                      </li>
                      <li>
                        <code className="font-mono text-primary text-xs bg-muted px-1 rounded">
                          isLoading
                        </code>
                        : Boolean indicating if a response is pending.
                      </li>
                      <li>
                        <code className="font-mono text-primary text-xs bg-muted px-1 rounded">
                          error
                        </code>
                        : String containing an error message, if any.
                      </li>
                      <li>
                        <code className="font-mono text-primary text-xs bg-muted px-1 rounded">
                          sendMessage
                        </code>
                        : Function to send a new user message (takes the message
                        string as input).
                      </li>
                    </ul>
                    <p className="text-sm text-muted-foreground pt-2">
                      Remember to replace the placeholder IDs and keys, and
                      style the elements (
                      <code className="text-xs">.my-chat-container</code>,{" "}
                      <code className="text-xs">.message</code>, etc.) according
                      to your design.
                    </p>
                  </CardContent>
                </Card>
              </section>

              <section id="examples" className="scroll-mt-16">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Examples
                </h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Basic Widget Example
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Embedding the default chat widget.
                        </p>
                        <CodeBlock
                          code={`import DocTalkieChat from \'@/components/doc-talkie-chat/doc-talkie-chat\';

export default function MyPage() {
  const botApiUrl = "YOUR_BOT_API_URL";
  const botApiKey = "YOUR_BOT_API_KEY";

  return (
    <div className="app">
      <header><h1>My Documentation Site</h1></header>
      <main>
        <h2>Getting Started</h2>
        <p>Welcome to our documentation...</p>
      </main>
      {/* --- DocTalkie Chat Widget --- */}
      <DocTalkieChat 
        apiURL={botApiUrl}
        apiKey={botApiKey}
      />
      {/* ----------------------------- */}
    </div>
  )
}`}
                          language="typescript"
                          showLineNumbers
                        />
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Customized Widget Example
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Customizing appearance and position.
                        </p>
                        <CodeBlock
                          code={`import DocTalkieChat from \'@/components/doc-talkie-chat/doc-talkie-chat\';
// import \'./my-custom-styles.css\'; // If using className

export default function AnotherPage() {
  const botApiUrl = "YOUR_BOT_API_URL";
  const botApiKey = "YOUR_BOT_API_KEY";

  return (
    <div className="app">
       <header><h1>Another Page</h1></header>
      <main>
        <h2>Advanced Topics</h2>
        <p>More details here...</p>
      </main>
      {/* --- Customized DocTalkie Chat Widget --- */}
      <DocTalkieChat 
        apiURL={botApiUrl}
        apiKey={botApiKey}
        theme="light" 
        position="bottom-left"
        accentColor="#8B5CF6" // Example: Violet color for user messages
        welcomeMessage="Ask me anything about the advanced topics!"
        // className="my-custom-widget-styles" // Optional custom class
      />
       {/* --------------------------------------- */}
    </div>
  )
}`}
                          language="typescript"
                          showLineNumbers
                        />
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Basic Hook Example (for custom UI)
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Minimal example using the hook.
                        </p>
                        <CodeBlock
                          code={`import { useDocTalkie } from '@/components/doc-talkie-chat/use-doc-talkie';

function MyChatComponent() {
  const { messages, sendMessage, isLoading } = useDocTalkie({
    apiURL: "YOUR_BOT_API_URL",
    apiKey: "YOUR_BOT_API_KEY",
  });

  // Your UI rendering logic using messages, sendMessage, isLoading...
  return (
    <div>
      {/* Your custom chat rendering */}
    </div>
  );
}`}
                          language="typescript"
                          showLineNumbers
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <div className="flex justify-center pt-6">
                <Link href="/dashboard">
                  <Button className="gap-1">
                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
      <DocTalkieChat
        apiURL="http://localhost:3000/api/chat/a6ef5aab-2722-4736-b699-d68c4e38ae1a"
        apiKey="dt_4a8b0aa6-bbe6-468b-a3eb-fe4f1e46297e"
        theme="doctalkie"
      />
    </>
  );
}
