"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DocTalkieChat } from "doctalkie-react";
import CodeBlock from "@/components/code-block";
import { ArrowRight, CheckCircle2, Code, FileText, Zap } from "lucide-react";

export default function Home() {
  return (
    <>
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                DocTalkie –{" "}
                <span className="gradient-text">Your AI Assistant,</span> <br />{" "}
                Ready to help
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Easily integrate an AI assistant into any React web app with
                just a few lines of code.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link href="/plans">
                <Button size="lg" className="gap-1">
                  Choose a Plan <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button size="lg" variant="outline" className="gap-1">
                  View Docs <FileText className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">
                Simple Integration
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Add DocTalkie to your React app in minutes
              </h2>
              <p className="text-muted-foreground md:text-lg">
                Just install our package and add a single component to your app.
                DocTalkie handles the rest.
              </p>
              <div className="space-y-2">
                <CodeBlock code="npm install doctalkie-react" language="bash" />
                <div className="text-center text-sm text-muted-foreground my-1">
                  or
                </div>
                <CodeBlock code="yarn add doctalkie-react" language="bash" />
              </div>
            </div>
            <div className="relative lg:h-[500px] flex items-center justify-center">
              <div className="relative w-full max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-doctalkie-500/20 to-doctalkie-700/20 rounded-lg transform rotate-2 scale-105 blur-xl"></div>
                <div className="relative bg-card border border-border/50 rounded-lg shadow-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <div className="ml-4 text-sm text-muted-foreground">
                      MyApp.jsx
                    </div>
                  </div>
                  <div className="space-y-2 font-mono text-sm">
                    <div>
                      <span className="text-doctalkie-400">import</span>{" "}
                      <span className="text-foreground">React</span>{" "}
                      <span className="text-doctalkie-400">from</span>{" "}
                      <span className="text-foreground">'react'</span>;
                    </div>
                    <div>
                      <span className="text-doctalkie-400">import</span>{" "}
                      <span className="text-foreground">
                        {"{ DocTalkieChat }"}
                      </span>{" "}
                      <span className="text-doctalkie-400">from</span>{" "}
                      <span className="text-foreground">'doctalkie-react'</span>
                      ;
                    </div>
                    <div></div>
                    <div>
                      <span className="text-doctalkie-400">function</span>{" "}
                      <span className="text-primary">App</span>() {"{"}
                    </div>
                    <div className="pl-4">
                      <span className="text-doctalkie-400">return</span> (
                    </div>
                    <div className="pl-8">{"<div>"}</div>
                    <div className="pl-12">{"<h1>Welcome to My App</h1>"}</div>
                    <div className="pl-12 text-primary">{"<DocTalkieChat"}</div>
                    <div className="pl-16 text-muted-foreground">
                      apiURL="https://api.doctalkie.ai/my-project"
                    </div>
                    <div className="pl-16 text-muted-foreground">
                      apiKey="dt_123456789abcdef"
                    </div>
                    <div className="pl-12 text-primary">{"/>"}</div>
                    <div className="pl-8">{"</div>"}</div>
                    <div className="pl-4">);</div>
                    <div>{"}"}</div>
                    <div></div>
                    <div>
                      <span className="text-doctalkie-400">export</span>{" "}
                      <span className="text-doctalkie-400">default</span>{" "}
                      <span className="text-foreground">App</span>;
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Why choose DocTalkie?
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
              Our AI assistant is designed specifically for documentation and
              knowledge bases.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-card border border-border/50 rounded-lg p-6 shadow-sm">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Document-Trained</h3>
              <p className="text-muted-foreground">
                Upload your documentation files and DocTalkie learns from them
                to provide accurate, contextual answers.
              </p>
            </div>
            <div className="bg-card border border-border/50 rounded-lg p-6 shadow-sm">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Developer-Friendly</h3>
              <p className="text-muted-foreground">
                Simple React component with customizable options. No complex
                setup or configuration required.
              </p>
            </div>
            <div className="bg-card border border-border/50 rounded-lg p-6 shadow-sm">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fast & Responsive</h3>
              <p className="text-muted-foreground">
                Optimized for speed and performance. Get instant answers without
                slowing down your application.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative h-[400px] w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-doctalkie-500/20 to-doctalkie-700/20 rounded-lg transform -rotate-2 scale-105 blur-xl"></div>
                <div className="relative h-full bg-card border border-border/50 rounded-lg shadow-xl p-6 overflow-hidden">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-4">
                      <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <div className="ml-4 text-sm text-muted-foreground">
                        Dashboard
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="h-8 bg-secondary/50 rounded w-1/2"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-secondary/50 rounded"></div>
                        <div className="h-24 bg-secondary/50 rounded"></div>
                      </div>
                      <div className="h-8 bg-secondary/50 rounded w-3/4"></div>
                      <div className="h-32 bg-secondary/50 rounded"></div>
                    </div>
                    {/* Add chat button */}
                    <div className="absolute bottom-4 right-4">
                      <div className="h-10 w-10 rounded-full bg-primary shadow-lg animate-pulse-glow"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4 order-1 lg:order-2">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">
                Full Control
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Customize your assistant to match your brand
              </h2>
              <p className="text-muted-foreground md:text-lg">
                Change the name, appearance, and behavior of your assistant to
                create a seamless experience for your users.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>Customize assistant name</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>Match your brand colors and style</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>Control what questions your assistant can answer</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>Position the chat widget anywhere on your page</span>
                </li>
              </ul>
              <div className="pt-4">
                <Link href="/docs">
                  <Button variant="outline" className="gap-1">
                    Learn More <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to get started?
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Choose a plan that works for you and start integrating DocTalkie
                into your React app today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link href="/plans">
                <Button size="lg" className="gap-1">
                  Choose a Plan <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="gap-1">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <DocTalkieChat
        apiURL="http://localhost:3000/api/chat/a6ef5aab-2722-4736-b699-d68c4e38ae1a"
        apiKey="dt_4a8b0aa6-bbe6-468b-a3eb-fe4f1e46297e"
        theme="doctalkie"
      />
    </>
  );
}
