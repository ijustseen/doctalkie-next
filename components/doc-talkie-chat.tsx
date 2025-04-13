"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, CornerDownLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import TextareaAutosize from "react-textarea-autosize";

// Тип для сообщений чата
type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  isLoading?: boolean;
};

// Интерфейс пропсов для компонента
interface DocTalkieChatProps {
  apiURL: string;
  apiKey: string;
  theme?: "dark" | "light" | "doctalkie"; // Theme selection
  accentColor?: string; // Accent color override
  position?: "bottom-right" | "bottom-left";
  welcomeMessage?: string;
  className?: string;
}

export default function DocTalkieChat({
  apiURL,
  apiKey,
  theme = "doctalkie", // Default to doctalkie theme
  accentColor, // Optional accent color
  position = "bottom-right",
  welcomeMessage = "Hi there! How can I help you today?",
  className,
}: DocTalkieChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-welcome",
      content: welcomeMessage,
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
        // Используем targetChatUrl вместо apiURL
        const response = await fetch(apiURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // apiKey передается как и раньше
            Authorization: `Bearer ${apiKey}`,
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

  // --- Стили на основе пропсов ---
  const accentStyle = accentColor ? { backgroundColor: accentColor } : {};
  // --- Конец стилей ---

  return (
    <div
      className={cn(
        "fixed z-50",
        position === "bottom-right" ? "bottom-6 right-6" : "bottom-6 left-6",
        className
      )}
    >
      {/* Окно чата */}
      {isOpen && (
        <Card
          className={cn(
            "absolute bottom-16 w-80 md:w-96 h-[500px] shadow-lg border overflow-hidden flex flex-col",
            // Стили темы для Card
            theme === "light"
              ? "bg-white border-neutral-200 text-black"
              : theme === "dark"
              ? "bg-neutral-950 border-neutral-800 text-white" // Dark theme
              : "bg-card border text-card-foreground", // Doctalkie theme (default)
            position === "bottom-right" ? "right-0" : "left-0"
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between p-3 border-b",
              // Стили темы для Header
              theme === "light"
                ? "bg-neutral-100 border-neutral-200"
                : theme === "dark"
                ? "bg-neutral-900 border-neutral-800"
                : "bg-muted border-b" // Doctalkie theme
            )}
          >
            <div className="flex items-center">
              {/* Индикатор активности - используем accentColor если задан, иначе (белый для dark / primary для light и doctalkie) */}
              <div
                className={cn(
                  "h-2 w-2 rounded-full mr-2 animate-pulse",
                  // Обновленное условие для фона по умолчанию
                  !accentColor && (theme === "dark" ? "bg-white" : "bg-primary") // light & doctalkie use primary
                )}
                // Используем инлайн стиль ТОЛЬКО если accentColor задан
                style={accentColor ? { backgroundColor: accentColor } : {}}
              />
              {/* Цвет текста заголовка */}
              <span
                className={cn(
                  "font-medium",
                  theme === "light"
                    ? "text-black"
                    : theme === "dark"
                    ? "text-white"
                    : "text-foreground" // Doctalkie theme
                )}
              >
                DocTalkie Assistant
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleChat}
              className={cn(
                "h-8 w-8",
                // Цвет иконки крестика в зависимости от темы
                theme === "light"
                  ? "text-neutral-600 hover:text-neutral-900"
                  : theme === "dark"
                  ? "text-neutral-400 hover:text-white"
                  : "text-muted-foreground hover:text-foreground" // Doctalkie theme
              )}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Область сообщений */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[80%] rounded-lg p-3 text-sm relative", // Базовые стили
                  message.sender === "user" ? "ml-auto" : "", // Позиционирование пользователя
                  // Стандартные стили темы, ЕСЛИ accentColor НЕ задан
                  !accentColor &&
                    (theme === "light"
                      ? message.sender === "user"
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-200 text-neutral-900"
                      : theme === "dark"
                      ? message.sender === "user"
                        ? "bg-white text-black"
                        : "bg-secondary text-secondary-foreground"
                      : // Doctalkie theme uses primary/secondary
                      message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"),
                  // Цвет текста, если accentColor ЗАДАН
                  accentColor &&
                    (theme === "light"
                      ? "text-neutral-900" // Предполагаем темный текст на светлом accentColor
                      : "text-white") // Предполагаем белый текст на темном accentColor (для dark и doctalkie)
                )}
                // Применяем акцентный цвет фона ко ВСЕМ сообщениям, если accentColor задан
                style={accentColor ? accentStyle : {}}
              >
                {message.isLoading ? (
                  <div className="flex items-center justify-center h-full min-h-[20px]">
                    <Loader2
                      className={cn(
                        "h-4 w-4 animate-spin",
                        // Цвет лоадера
                        theme === "light"
                          ? "text-neutral-500"
                          : theme === "dark"
                          ? "text-neutral-400"
                          : "text-muted-foreground" // Doctalkie theme
                      )}
                    />
                  </div>
                ) : (
                  message.content
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer с полем ввода */}
          <div
            className={cn(
              "p-3 border-t",
              // Стили темы для Footer
              theme === "light"
                ? "bg-white border-neutral-200"
                : theme === "dark"
                ? "bg-neutral-950 border-neutral-800"
                : "bg-card border-t" // Doctalkie theme
            )}
          >
            <div className="flex items-end gap-2">
              <TextareaAutosize
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className={cn(
                  "flex-1 max-h-[120px] border-0 rounded-md resize-none p-2 text-sm focus-visible:ring-1",
                  // Стили темы для Textarea
                  theme === "light"
                    ? "bg-neutral-100 text-black placeholder:text-neutral-500 focus-visible:ring-black"
                    : theme === "dark"
                    ? "bg-neutral-800 text-white placeholder:text-neutral-400 focus-visible:ring-white"
                    : "bg-muted text-foreground placeholder:text-muted-foreground focus-visible:ring-ring", // Doctalkie theme
                  // Стиль кольца фокуса с accentColor, если задан (перекрывает цвет темы)
                  accentColor &&
                    "focus-visible:ring-offset-0 focus-visible:ring-1"
                )}
                // Применяем стиль кольца фокуса с accentColor (используем 'any' для обхода ошибки типа)
                style={
                  accentColor ? ({ "--tw-ring-color": accentColor } as any) : {}
                }
                minRows={1}
                maxRows={4}
                disabled={isLoading}
              />
              {/* Кнопка Send */}
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "h-10 w-10 shrink-0",
                  // Убираем стандартный фон, если задан accentColor
                  accentColor
                    ? "text-white" // Предполагаем белый текст на accentColor
                    : theme === "light"
                    ? "bg-neutral-900 text-white hover:bg-neutral-700"
                    : theme === "dark"
                    ? "bg-white text-black hover:bg-neutral-200"
                    : "bg-primary text-primary-foreground hover:bg-primary/90" // Doctalkie theme
                )}
                // Применяем accentColor к ФОНУ
                style={accentStyle}
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

      {/* Кнопка открытия/закрытия */}
      <Button
        onClick={toggleChat}
        size="icon"
        className={cn(
          "h-12 w-12 rounded-full shadow-lg",
          // Убираем стандартный фон, если задан accentColor
          accentColor
            ? "text-white" // Предполагаем белый текст/иконку на accentColor
            : theme === "light"
            ? isOpen
              ? "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
              : "bg-neutral-900 text-white hover:bg-neutral-700"
            : theme === "dark"
            ? isOpen // Dark theme
              ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              : "bg-white text-black hover:bg-neutral-200"
            : // Doctalkie theme
            isOpen
            ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            : "bg-primary text-primary-foreground hover:bg-primary/90",
          // Пульсация только в темной теме или doctalkie без accentColor и когда закрыто
          !isOpen &&
            !accentColor &&
            (theme === "dark" || theme === "doctalkie") &&
            "animate-pulse-glow"
        )}
        // Применяем accentColor к ФОНУ
        style={accentStyle}
      >
        {/* Иконки наследуют цвет из className */}
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
