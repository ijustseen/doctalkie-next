"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = () => {
    if (input.trim()) {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: input,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      // Simulate assistant response
      setTimeout(() => {
        let response =
          "I'm sorry, I don't have information about that in my documentation.";

        if (input.toLowerCase().includes("install")) {
          response =
            "You can install DocTalkie with: npm install doctalkie-react";
        } else if (
          input.toLowerCase().includes("pricing") ||
          input.toLowerCase().includes("plan")
        ) {
          response =
            "We offer Free, Pro, and Premium plans. Check our pricing page for details!";
        } else if (
          input.toLowerCase().includes("component") ||
          input.toLowerCase().includes("use")
        ) {
          response =
            "You can use DocTalkie by importing the component: import { DocTalkieChat } from 'doctalkie-react'";
        }

        const assistantMessage: Message = {
          id: Date.now().toString(),
          content: response,
          sender: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }, 1000);
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
        <Card className="absolute bottom-16 right-0 w-80 md:w-96 shadow-lg border border-border/50 overflow-hidden">
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

          <div className="h-80 overflow-y-auto p-3 flex flex-col gap-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                {message.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-border/50 bg-card">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 min-h-[40px] max-h-[120px] bg-secondary/50 border-0 rounded-md resize-none p-2 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                rows={1}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim()}
                className="h-10 w-10 shrink-0"
              >
                <Send className="h-4 w-4" />
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
