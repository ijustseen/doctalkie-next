"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, CornerDownLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import TextareaAutosize from "react-textarea-autosize";

type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  isLoading?: boolean;
};

export default function ChatWidget({
  showArrow = false,
  className,
}: {
  showArrow?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi there! I'm DocTalkie, your AI assistant. How can I help you today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      const userMessageContent = input;
      setInput("");

      const userMessage: Message = {
        id: crypto.randomUUID(),
        content: userMessageContent,
        sender: "user",
        timestamp: new Date(),
      };
      const assistantPlaceholderId = crypto.randomUUID();
      const assistantPlaceholder: Message = {
        id: assistantPlaceholderId,
        content: "",
        sender: "assistant",
        timestamp: new Date(),
        isLoading: true,
      };
      setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: userMessageContent }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `API request failed: ${response.status} ${response.statusText} - ${
              errorData?.error || "Unknown error"
            }`
          );
        }

        const data = await response.json();
        const assistantResponse =
          data.answer || "Sorry, I couldn't get a response.";

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholderId
              ? { ...msg, content: assistantResponse, isLoading: false }
              : msg
          )
        );
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholderId
              ? {
                  ...msg,
                  content: `Error: ${
                    error instanceof Error ? error.message : "Failed to fetch"
                  }`,
                  isLoading: false,
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {showArrow && !isOpen && (
        <div className="absolute bottom-full right-0 mb-2 flex flex-col items-end pointer-events-none">
          <div className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-md shadow-lg">
            Try me!
          </div>
          <CornerDownLeft
            className="h-6 w-6 text-primary transform -rotate-90 translate-x-2 -translate-y-2"
            strokeWidth={2}
          />
        </div>
      )}

      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 md:w-96 h-[500px] shadow-lg border border-border/50 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between bg-secondary p-3 border-b border-border/50">
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></div>
              <span className="font-medium">DocTalkie Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleChat}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-secondary text-secondary-foreground",
                  "relative"
                )}
              >
                {message.isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  message.content
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-border/50 bg-card">
            <div className="flex items-end gap-2">
              <TextareaAutosize
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 max-h-[120px] bg-secondary/50 border-0 rounded-md resize-none p-2 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                minRows={1}
                maxRows={4}
                disabled={isLoading}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="h-10 w-10 shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Button
        onClick={toggleChat}
        size="icon"
        className={cn(
          "h-12 w-12 rounded-full shadow-lg",
          isOpen
            ? "bg-secondary hover:bg-secondary/80"
            : "bg-primary hover:bg-primary/80",
          !isOpen && "animate-pulse-glow"
        )}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
