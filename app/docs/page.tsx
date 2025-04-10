"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import CodeBlock from "@/components/code-block"
import { ArrowRight, BookOpen, Code, FileText, MessageCircle, Settings } from "lucide-react"

export default function DocsPage() {
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">DocTalkie Documentation</h1>
        <p className="text-muted-foreground mb-8">
          Learn how to integrate and customize DocTalkie in your React application
        </p>

        <div className="space-y-10">
          <section id="installation" className="scroll-mt-16">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Code className="h-6 w-6 text-primary" />
              Installation
            </h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">Install DocTalkie using npm, yarn, or pnpm:</p>
                <CodeBlock code="npm install doctalkie-react" language="bash" />
                <p className="mt-4">Or with yarn:</p>
                <CodeBlock code="yarn add doctalkie-react" language="bash" />

              </CardContent>
            </Card>
          </section>

          <section id="usage" className="scroll-mt-16">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              Basic Usage
            </h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">
                  Import the <code className="text-primary">DocTalkieChat</code> component and add it to your React
                  application:
                </p>
                <CodeBlock
                  code={`import { DocTalkieChat } from 'doctalkie-react'

export default function App() {
  return (
    <div>
      <h1>My Awesome App</h1>
      <DocTalkieChat 
        apiURL="https://api.doctalkie.ai/projects/your-project" 
        apiKey="your-api-key"
      />
    </div>
  )
}`}
                  language="jsx"
                  showLineNumbers
                />
                <p className="mt-4">
                  The chat widget will appear as a floating button in the bottom corner of your application. Users can
                  click it to open the chat interface.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="configuration" className="scroll-mt-16">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              Configuration
            </h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">
                  The <code className="text-primary">DocTalkieChat</code> component accepts the following props:
                </p>
                <div>
                  <h3 className="text-lg font-medium mb-2">Required Props</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-secondary/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Prop</th>
                          <th className="text-left p-3 font-medium">Description</th>
                          <th className="text-left p-3 font-medium">Type</th>
                          <th className="text-left p-3 font-medium">Required</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="p-3 font-mono text-primary">apiURL</td>
                          <td className="p-3 text-muted-foreground">Your DocTalkie API URL from the dashboard</td>
                          <td className="p-3 font-mono text-sm">string</td>
                          <td className="p-3">Yes</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono text-primary">apiKey</td>
                          <td className="p-3 text-muted-foreground">Your DocTalkie API key from the dashboard</td>
                          <td className="p-3 font-mono text-sm">string</td>
                          <td className="p-3">Yes</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Optional Props</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-secondary/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Prop</th>
                          <th className="text-left p-3 font-medium">Description</th>
                          <th className="text-left p-3 font-medium">Type</th>
                          <th className="text-left p-3 font-medium">Default</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="p-3 font-mono text-primary">color</td>
                          <td className="p-3 text-muted-foreground">Custom accent color</td>
                          <td className="p-3 font-mono text-sm">string</td>
                          <td className="p-3 font-mono text-sm">"#00e6e6"</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono text-primary">position</td>
                          <td className="p-3 text-muted-foreground">
                            Widget position (bottom-right, bottom-left, etc.)
                          </td>
                          <td className="p-3 font-mono text-sm">string</td>
                          <td className="p-3 font-mono text-sm">"bottom-right"</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono text-primary">assistantName</td>
                          <td className="p-3 text-muted-foreground">Custom name for the assistant</td>
                          <td className="p-3 font-mono text-sm">string</td>
                          <td className="p-3 font-mono text-sm">"DocTalkie"</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono text-primary">welcomeMessage</td>
                          <td className="p-3 text-muted-foreground">Custom welcome message</td>
                          <td className="p-3 font-mono text-sm">string</td>
                          <td className="p-3 font-mono text-sm">"Hi there! How can I help?"</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono text-primary">placeholder</td>
                          <td className="p-3 text-muted-foreground">Custom placeholder text for the input field</td>
                          <td className="p-3 font-mono text-sm">string</td>
                          <td className="p-3 font-mono text-sm">"Type your message..."</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Example with all props</h3>
                  <CodeBlock
                    code={`<DocTalkieChat 
  apiURL="https://api.doctalkie.ai/projects/your-project" 
  apiKey="your-api-key"
  color="#00e6e6"
  position="bottom-right"
  assistantName="Support Bot"
  welcomeMessage="Hello! How can I help you today?"
  placeholder="Ask me anything about our docs..."
/>`}
                    language="jsx"
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="advanced" className="scroll-mt-16">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Advanced Usage
            </h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">DocTalkie provides additional features for advanced use cases:</p>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Custom Styling</h3>
                    <p className="mb-2">
                      You can customize the appearance of the chat widget by passing a custom CSS class:
                    </p>
                    <CodeBlock
                      code={`<DocTalkieChat 
  apiURL="https://api.doctalkie.ai/projects/your-project" 
  apiKey="your-api-key"
  className="my-custom-chat"
/>`}
                      language="jsx"
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Then define your custom styles in your CSS file.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Event Handlers</h3>
                    <p className="mb-2">You can listen to various events from the chat widget:</p>
                    <CodeBlock
                      code={`<DocTalkieChat 
  apiURL="https://api.doctalkie.ai/projects/your-project" 
  apiKey="your-api-key"
  onOpen={() => console.log('Chat opened')}
  onClose={() => console.log('Chat closed')}
  onMessage={(message) => console.log('New message:', message)}
/>`}
                      language="jsx"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Programmatic Control</h3>
                    <p className="mb-2">You can control the chat widget programmatically using a ref:</p>
                    <CodeBlock
                      code={`import { useRef } from 'react'
import { DocTalkieChat } from 'doctalkie-react'

export default function App() {
  const chatRef = useRef()
  
  const openChat = () => {
    chatRef.current.open()
  }
  
  return (
    <div>
      <button onClick={openChat}>Open Chat</button>
      <DocTalkieChat 
        ref={chatRef}
        apiURL="https://api.doctalkie.ai/projects/your-project" 
        apiKey="your-api-key"
      />
    </div>
  )
}`}
                      language="jsx"
                      showLineNumbers
                    />
                  </div>
                </div>
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
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Basic Example</h3>
                    <CodeBlock
                      code={`import { DocTalkieChat } from 'doctalkie-react'

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>My Documentation Site</h1>
      </header>
      <main>
        <h2>Getting Started</h2>
        <p>Welcome to our documentation...</p>
      </main>
      <DocTalkieChat 
        apiURL="https://api.doctalkie.ai/projects/your-project" 
        apiKey="your-api-key"
      />
    </div>
  )
}`}
                      language="jsx"
                      showLineNumbers
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Custom Styling Example</h3>
                    <CodeBlock
                      code={`import { DocTalkieChat } from 'doctalkie-react'
import './custom-chat.css'

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>My Documentation Site</h1>
      </header>
      <main>
        <h2>Getting Started</h2>
        <p>Welcome to our documentation...</p>
      </main>
      <DocTalkieChat 
        apiURL="https://api.doctalkie.ai/projects/your-project" 
        apiKey="your-api-key"
        color="#6366f1"
        position="bottom-left"
        className="custom-chat-widget"
      />
    </div>
  )
}`}
                      language="jsx"
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
      </div>
    </div>
  )
}
