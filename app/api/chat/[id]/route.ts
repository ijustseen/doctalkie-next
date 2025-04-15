import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// --- Конфигурация ---
const groqApiKey = process.env.GROQ_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const groqModelName = process.env.GROQ_LLM_MODEL_NAME || "llama3-8b-8192"; // Используем переменную окружения

// Примерный лимит символов (лучше настроить точнее или обрабатывать ошибку токенов от LLM)
const MAX_CONTEXT_LENGTH = 25000;
// --- Конец Конфигурации ---

// --- Инициализация Клиентов ---
let groq: Groq | null = null;
if (groqApiKey) {
  groq = new Groq({ apiKey: groqApiKey });
} else {
  console.error("GROQ_API_KEY is not set.");
}

let supabaseAdmin: SupabaseClient | null = null;
if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.error("Supabase URL or Service Role Key is missing.");
}
// --- Конец Инициализации Клиентов ---

// --- Вспомогательные Функции ---

// Аутентификация и получение данных ассистента
async function authenticateAndGetAssistant(
  id: string,
  apiKey: string
): Promise<{
  id: string;
  api_key: string;
  strict_context: boolean;
  user_id: string;
}> {
  if (!supabaseAdmin) throw new Error("Supabase client not initialized");

  const { data: assistant, error } = await supabaseAdmin
    .from("bots")
    .select("id, api_key, strict_context, user_id")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Supabase error fetching assistant ${id}:`, error);
    throw new NextResponse(
      JSON.stringify({ error: "Assistant not found or database error" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!assistant) {
    // Эта ветка почти невозможна с .single(), но оставляем для полноты
    console.warn(`Assistant not found for ID: ${id}`);
    throw new NextResponse(JSON.stringify({ error: "Assistant not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ВАЖНО: Простое сравнение ключей. Рассмотрите хеширование.
  if (assistant.api_key !== apiKey) {
    console.warn(`Invalid API Key attempt for assistant: ${id}`);
    throw new NextResponse(JSON.stringify({ error: "Invalid API Key" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return assistant;
}

// Получение полного текстового контекста
async function fetchFullDocumentContext(assistantId: string): Promise<string> {
  if (!supabaseAdmin) throw new Error("Supabase client not initialized");

  const { data: chunks, error } = await supabaseAdmin
    .from("document_chunks")
    .select("content")
    .eq("bot_id", assistantId);

  if (error) {
    console.error(
      `Supabase error fetching chunks for assistant ${assistantId}:`,
      error
    );
    throw new Error("Failed to retrieve knowledge base from database.");
  }

  if (!chunks) {
    console.warn(`No document chunks found for assistant ${assistantId}`);
    return ""; // Возвращаем пустую строку, если чанков нет
  }

  const fullContext = chunks.map((chunk) => chunk.content).join("\n\n");
  return fullContext;
}

// Генерация промпта для LLM
function generateLlmPrompt(
  query: string,
  context: string,
  isStrict: boolean
): string {
  const contextForLlm =
    context.length > 0 ? context : "No specific context provided.";
  let prompt = "";

  if (isStrict) {
    prompt = `
        Based **only** on the context provided below, answer the user's question.
        Do not use any external knowledge or assumptions.
        If the provided context does not contain the information needed to answer the question, state clearly that the answer cannot be found in the provided documentation.
        
        Context:
        ---
        ${contextForLlm}
        ---

        User Question: ${query}

        --- 
        Answer:
      `;
  } else {
    prompt = `
        Answer the user's question. Use the provided context below to help answer the question if it's relevant. If the context is not helpful or doesn't contain the answer, use your general knowledge but indicate if you are doing so.

        Context:
        ---
        ${contextForLlm}
        ---

      User Question: ${query}

        --- 
      Answer:
    `;
  }
  return prompt;
}

// Вызов Groq API
async function callGroqApi(prompt: string): Promise<string> {
  if (!groq) throw new Error("Groq client not initialized");

  // Обновленный системный промпт: строго требуем отвечать на языке пользователя
  const systemMessageContent = `You are a helpful assistant. Your response MUST be strictly in the same language as the user\'s original question/query. When providing code snippets, always enclose them in triple backticks, specifying the language after the opening backticks (e.g., \\\`\\\`\\\`javascript).`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemMessageContent,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: groqModelName,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const answer =
      chatCompletion.choices[0]?.message?.content ||
      "Sorry, I could not generate a response.";
    return answer;
  } catch (groqError) {
    console.error("Error calling Groq API:", groqError);
    const message =
      groqError instanceof Error ? groqError.message : "Unknown Groq API error";
    throw new Error(`LLM processing failed: ${message}`);
  }
}

// --- Основной Обработчик POST ---
export async function POST(req: NextRequest) {
  // 1. Проверка инициализации клиентов
  if (!groq || !supabaseAdmin) {
    console.error(
      "Server configuration error: Groq or Supabase client not initialized."
    );
    return NextResponse.json(
      {
        error:
          "Server configuration error. Please check API keys or DB connection.",
      },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. Извлечение и валидация данных запроса
  // ПОЛУЧАЕМ ID ИЗ URL (НОВЫЙ СПОСОБ)
  let assistantId: string | undefined;
  try {
    const pathnameParts = req.nextUrl.pathname.split("/");
    // Ожидаемая структура: ['', 'api', 'chat', assistantId]
    // Элемент с индексом 3 должен быть ID
    if (
      pathnameParts.length === 4 &&
      pathnameParts[1] === "api" &&
      pathnameParts[2] === "chat"
    ) {
      assistantId = pathnameParts[3];
    }
  } catch (e) {
    console.error("[POST /api/chat] Error parsing assistant ID from URL:", e);
    assistantId = undefined;
  }

  const authHeader = req.headers.get("Authorization");
  let query: string | undefined;

  // Проверка assistantId
  if (!assistantId) {
    console.error(
      "[POST /api/chat] Could not extract Assistant ID from URL path:",
      req.nextUrl.pathname
    );
    return NextResponse.json(
      { error: "Assistant ID is missing or invalid URL" },
      { status: 400 }
    );
  }

  // Проверка Authorization Header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Authorization header is missing or invalid" },
      { status: 401 }
    );
  }
  const apiKey = authHeader.split(" ")[1];

  // Парсинг и проверка query
  try {
    const body = await req.json();
    query = body.query;
    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 3. Основная логика обработки
  try {
    // Шаг 3.1: Аутентификация
    const assistant = await authenticateAndGetAssistant(assistantId, apiKey);

    // Шаг 3.2: Получение контекста (ВНИМАНИЕ: неэффективно!)
    const fullContext = await fetchFullDocumentContext(assistantId);

    // Шаг 3.3: Проверка длины контекста
    if (fullContext.length > MAX_CONTEXT_LENGTH) {
      console.warn(
        `Context length (${fullContext.length}) exceeds limit (${MAX_CONTEXT_LENGTH}) for assistant ${assistantId}`
      );
      return NextResponse.json(
        {
          error: `Knowledge base is too large (${fullContext.length} chars). Limit is ${MAX_CONTEXT_LENGTH}. Consider using embeddings.`,
        },
        { status: 413 }
      );
    }

    // Шаг 3.4: Генерация промпта
    const prompt = generateLlmPrompt(
      query,
      fullContext,
      assistant.strict_context ?? false
    );

    // Шаг 3.5: Вызов LLM
    const answer = await callGroqApi(prompt);

    // Шаг 3.7: Обновление статистики запросов пользователя
    const { error: userQueryStatError } = await supabaseAdmin.rpc(
      "increment_user_queries",
      { user_id_param: assistant.user_id }
    );
    if (userQueryStatError) {
      console.warn(
        `[POST /api/chat] Failed to update query count statistics for user ${assistant.user_id}:`,
        userQueryStatError
      );
    }

    // Шаг 3.8: Отправка ответа
    return NextResponse.json({ answer });
  } catch (error) {
    // Обработка ошибок
    if (error instanceof NextResponse) {
      // Перехватываем ошибки 401, 404, 413, отправленные из вспомогательных функций
      return error;
    } else {
      // Обработка внутренних ошибок 500 (ошибки БД при чтении чанков, ошибки Groq и т.д.)
      console.error(
        `Internal Server Error processing request for assistant ${assistantId}:`,
        error instanceof Error ? error.message : error
      );
      return NextResponse.json(
        {
          error:
            "Failed to process chat request due to an internal server error.",
        },
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
}

// --- GET Handler ---
export async function GET(req: NextRequest) {
  return NextResponse.json({
    message:
      "Chat API (Groq + Supabase Auth, Full Context) is running. Use POST method.",
  });
}
