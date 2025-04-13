import { useState, useCallback } from "react";

// Тип для сообщений чата (экспортируем для использования в компоненте)
export type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  isLoading?: boolean;
};

// Интерфейс для пропсов хука
interface UseDocTalkieProps {
  apiURL: string;
  apiKey: string;
  initialMessages: Message[];
}

// Определяем и экспортируем кастомный хук
export function useDocTalkie({
  apiURL,
  apiKey,
  initialMessages,
}: UseDocTalkieProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Переименованная и адаптированная функция отправки сообщения
  const sendMessage = useCallback(
    async (userMessageContent: string) => {
      if (!userMessageContent.trim() || isLoading) return;

      setError(null); // Сбрасываем ошибку при новой отправке

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

      // Оптимистичное обновление UI
      setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
      setIsLoading(true);

      // --- Извлечение ID и формирование URL для чата ---
      let targetChatUrl = "";
      try {
        // Убираем возможный слеш в конце и разделяем по /
        const urlParts = apiURL.replace(/\/?$/, "").split("/");
        const id = urlParts[urlParts.length - 1];
        if (!id) {
          throw new Error("Could not extract ID from apiURL");
        }
        targetChatUrl = `/api/chat/${id}`; // Используем относительный путь для API роута
      } catch (urlError) {
        console.error("Error constructing chat URL:", urlError);
        const errorMessage = `Error: Invalid API URL configuration. ${
          urlError instanceof Error ? urlError.message : ""
        }`.trim();
        setError(errorMessage);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholderId
              ? { ...msg, content: errorMessage, isLoading: false }
              : msg
          )
        );
        setIsLoading(false);
        return; // Прерываем выполнение
      }
      // --- Конец формирования URL ---

      try {
        // Используем targetChatUrl
        const response = await fetch(targetChatUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
      } catch (fetchError) {
        console.error("Error sending message:", fetchError);
        const errorMessage = `Error: ${
          fetchError instanceof Error ? fetchError.message : "Failed to fetch"
        }`;
        setError(errorMessage);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholderId
              ? { ...msg, content: errorMessage, isLoading: false }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [apiURL, apiKey, isLoading]
  ); // Зависимости useCallback

  return { messages, isLoading, error, sendMessage };
}
