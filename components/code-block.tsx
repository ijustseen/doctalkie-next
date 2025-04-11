"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import SyntaxHighlighter from "react-syntax-highlighter";
// Base theme to customize
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import type React from "react";

// Create custom theme by overriding atomOneDark
const myCustomTheme = {
  ...atomOneDark,
  // Override general background and text color
  hljs: {
    ...atomOneDark["hljs"],
    background: "hsl(var(--background))", // Use card background
    color: "hsl(var(--card-foreground))", // Use card foreground
  },
  // Override specific token colors
  "hljs-keyword": {
    // Keywords like import, export, const, function, return
    ...atomOneDark["hljs-keyword"],
    color: "hsl(var(--primary))",
  },
  "hljs-tag .hljs-name": {
    // HTML/JSX tag names like div, Button
    ...atomOneDark["hljs-tag .hljs-name"],
    color: "hsl(var(--primary))",
  },
  "hljs-attr": {
    // HTML/JSX attributes like className, onClick
    ...atomOneDark["hljs-attr"],
    color: "#d19a66", // Keep orange/yellow
  },
  "hljs-string": {
    // String literals
    ...atomOneDark["hljs-string"],
    color: "#98c379", // Keep green
  },
  "hljs-comment": {
    // Comments
    ...atomOneDark["hljs-comment"],
    color: "hsl(var(--muted-foreground))",
    fontStyle: "italic",
  },
  "hljs-number": {
    // Numbers
    ...atomOneDark["hljs-number"],
    color: "#d19a66", // Keep orange/yellow
  },
  "hljs-function .hljs-title": {
    // Function names
    ...atomOneDark["hljs-function .hljs-title"],
    color: "#61afef", // Keep blue
  },
  // Add more overrides here if needed
};

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
}

export default function CodeBlock({
  code,
  language = "text", // Default to plain text if language is not specified
  className,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // customStyle now only handles layout/non-theme specific styles
  const customStyle: React.CSSProperties = {
    padding: "1rem",
    margin: "0",
    overflow: "auto",
    // background is now handled by the theme (myCustomTheme.hljs.background)
    borderRadius: "inherit",
    fontSize: "0.875rem",
  };

  const lineNumberStyle: React.CSSProperties = {
    minWidth: "2.25em",
    paddingRight: "1em",
    textAlign: "right",
    color: "hsl(var(--muted-foreground))",
    userSelect: "none",
  };

  return (
    <div className={cn("relative group rounded-md overflow-hidden", className)}>
      {" "}
      {/* Added overflow-hidden */}
      <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8"
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={myCustomTheme} // Use the customized theme
        showLineNumbers={showLineNumbers}
        wrapLines={false}
        lineNumberStyle={lineNumberStyle}
        customStyle={customStyle}
      >
        {code.trim()}
      </SyntaxHighlighter>
      {language && (
        <div className="absolute right-2 bottom-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded z-10">
          {language}
        </div>
      )}
    </div>
  );
}
