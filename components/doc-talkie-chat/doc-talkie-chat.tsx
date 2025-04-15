"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, CornerDownLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import TextareaAutosize from "react-textarea-autosize";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useDocTalkie, type Message } from "./use-doc-talkie";

// Тип для сообщений чата
// type Message = { ... };

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
  theme = "dark", // Default to doctalkie theme
  accentColor, // Optional accent color
  position = "bottom-right",
  welcomeMessage = "Hi there! How can I help you today?",
  className,
}: DocTalkieChatProps) {
  // --- Состояния Компонента (UI) ---
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false); // Новое состояние для управления рендерингом/анимацией
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // --- Конец Состояний Компонента ---

  // --- Используем Хук для API и Сообщений ---
  const { messages, isLoading, error, sendMessage } = useDocTalkie({
    apiURL,
    apiKey,
    initialMessages: [
      {
        id: "initial-welcome",
        content: welcomeMessage,
        sender: "assistant",
        timestamp: new Date(),
      },
    ],
  });
  // --- Конец Вызова Хука ---

  // --- Обработчики UI Событий ---
  const toggleChat = () => {
    if (isOpen) {
      // Начинаем закрытие: сначала запускаем анимацию (меняем стили через isOpen)
      setIsOpen(false);
      // Затем, после завершения анимации, убираем элемент из DOM
      setTimeout(() => setIsRendered(false), 300); // Длительность анимации
    } else {
      // Начинаем открытие: сначала добавляем элемент в DOM
      setIsRendered(true);
      // Затем, на следующем кадре/тике, запускаем анимацию (меняем стили через isOpen)
      // requestAnimationFrame(() => setIsOpen(true)); // Можно использовать requestAnimationFrame
      setTimeout(() => setIsOpen(true), 10); // Или небольшой таймаут
    }
  };

  const handleTriggerSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTriggerSend();
    }
  };
  // --- Конец Обработчиков UI Событий ---

  // --- Эффекты ---
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);
  // --- Конец Эффектов ---

  // --- Стили на основе пропсов ---
  const accentStyle = accentColor ? { backgroundColor: accentColor } : {};
  // --- Конец стилей ---

  // --- JSX ---
  return (
    <div
      className={cn(
        "fixed z-50",
        position === "bottom-right" ? "bottom-6 right-6" : "bottom-6 left-6",
        className
      )}
    >
      {/* Окно чата: рендерится по isRendered, анимируется по isOpen */}
      {isRendered && (
        <Card
          className={cn(
            "absolute bottom-16 w-80 md:w-96 h-[600px] shadow-lg border overflow-hidden flex flex-col",
            // Базовые стили темы
            theme === "light"
              ? "bg-white border-neutral-200 text-black"
              : theme === "dark"
              ? "bg-neutral-950 border-neutral-800 text-white"
              : "bg-card border text-card-foreground",
            position === "bottom-right" ? "right-0" : "left-0",
            // Классы для анимации
            "transition-all duration-300 ease-out", // Базовый переход
            isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4" // Состояния Открыто/Закрыто
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
            {error && (
              <div className="p-2 mb-2 text-xs text-center text-red-700 bg-red-100 rounded-md border border-red-300">
                {error}
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[80%] rounded-lg p-3 text-sm relative", // Базовые стили
                  "break-words prose prose-sm dark:prose-invert",
                  "prose-p:m-0 prose-ul:m-0 prose-ol:m-0 prose-li:m-0",
                  message.sender === "user" ? "ml-auto" : "", // Позиционирование пользователя

                  // Стандартные стили темы (Применяются если accentColor не задан ИЛИ если это сообщение ассистента)
                  (!accentColor || message.sender === "assistant") &&
                    (theme === "light"
                      ? message.sender === "user"
                        ? "bg-neutral-900 text-white" // Пользователь (светлая тема, без accentColor)
                        : "bg-neutral-200 text-neutral-900" // Ассистент (светлая тема)
                      : theme === "dark"
                      ? message.sender === "user"
                        ? "bg-white text-black" // Пользователь (темная тема, без accentColor)
                        : "bg-secondary text-secondary-foreground" // Ассистент (темная тема)
                      : // Doctalkie theme
                      message.sender === "user"
                      ? "bg-primary text-primary-foreground" // Пользователь (doctalkie, без accentColor)
                      : "bg-secondary text-secondary-foreground"), // Ассистент (doctalkie)

                  // Добавляем белый текст для сообщений пользователя, если задан accentColor
                  accentColor && message.sender === "user" && "text-white"
                )}
                style={
                  accentColor && message.sender === "user" ? accentStyle : {}
                }
              >
                {message.isLoading ? (
                  <div className="flex items-center justify-center h-full min-h-[20px]">
                    <Loader2
                      className={cn(
                        "h-4 w-4 animate-spin",
                        theme === "light"
                          ? "text-neutral-500"
                          : theme === "dark"
                          ? "text-neutral-400"
                          : "text-muted-foreground"
                      )}
                    />
                  </div>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      pre: ({ node, ...props }) => (
                        <pre
                          {...props}
                          // Применяем стили непосредственно к pre
                          className={cn(
                            "bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md overflow-x-auto my-2", // Добавляем небольшой вертикальный отступ my-2
                            props.className // Сохраняем возможные другие классы
                          )}
                        />
                      ),
                      // Можно добавить стили и для code (инлайн-код)
                      // code: ({ node, inline, className, children, ...props }) => {
                      //   const match = /language-(\w+)/.exec(className || '');
                      //   return !inline && match ? (
                      //     <code {...props} className={cn("your-code-styles", className)}>{children}</code>
                      //   ) : (
                      //     <code {...props} className={cn("bg-muted px-1 py-0.5 rounded", className)}>{children}</code>
                      //   );
                      // }
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
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
                onClick={handleTriggerSend}
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
