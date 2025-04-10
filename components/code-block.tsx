"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
  showLineNumbers?: boolean
}

export default function CodeBlock({ code, language = "jsx", className, showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("relative group rounded-md", className)}>
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="secondary" size="icon" className="h-8 w-8" onClick={copyToClipboard}>
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <pre className="code-block overflow-x-auto">
        {showLineNumbers ? (
          <code>
            {code.split("\n").map((line, i) => (
              <div key={i} className="grid" style={{ gridTemplateColumns: "2rem 1fr" }}>
                <span className="text-muted-foreground select-none text-right pr-4">{i + 1}</span>
                <span>{line}</span>
              </div>
            ))}
          </code>
        ) : (
          <code>{code}</code>
        )}
      </pre>
      {language && (
        <div className="absolute right-2 bottom-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          {language}
        </div>
      )}
    </div>
  )
}
