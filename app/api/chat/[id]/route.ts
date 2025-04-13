import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

// --- Конфигурация Groq ---
const GROQ_LLM_MODEL_NAME = "llama3-8b-8192"; // Пример (Llama 3 8B)
const groqApiKey = process.env.GROQ_API_KEY;

// --- Конфигурация Supabase ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // ВАЖНО: Используйте Service Key для бэкенда
// --- Конец Конфигурации Supabase ---

let groq: Groq | null = null;
if (groqApiKey) {
  groq = new Groq({ apiKey: groqApiKey });
} else {
  console.error("GROQ_API_KEY is not set in environment variables.");
}

// --- Инициализация Supabase Admin Client ---
let supabaseAdmin: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.error(
    "Supabase URL or Service Key is missing in environment variables."
  );
}
// --- Конец Инициализации Supabase ---

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Проверка инициализации клиентов
  if (!groq) {
    return NextResponse.json(
      { error: "Groq API key not configured correctly on the server." },
      { status: 500 }
    );
  }
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase client not configured correctly on the server." },
      { status: 500 }
    );
  }

  // Извлечение данных из запроса
  const authHeader = req.headers.get("Authorization");
  let query: string | undefined;

  try {
    const body = await req.json();
    query = body.query;
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 1. Валидация входных данных (ID, API Key, Query)
  if (!params || !params.id) {
    console.error("Assistant ID not found in route parameters.");
    return NextResponse.json(
      { error: "Assistant ID is missing" },
      { status: 400 }
    );
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Authorization header is missing or invalid" },
      { status: 401 }
    );
  }
  const apiKey = authHeader.split(" ")[1];

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    // 2. Проверка Assistant ID и API Key в базе данных Supabase
    const { data: assistant, error: assistantError } = await supabaseAdmin
      .from("assistants")
      .select("id, api_key")
      .eq("id", params.id)
      .single();

    if (assistantError || !assistant) {
      console.error(
        `Error fetching assistant or assistant not found for ID: ${params.id}:`,
        assistantError?.message || "Not Found"
      );
      return NextResponse.json(
        { error: "Assistant not found or invalid ID" },
        { status: 404 }
      );
    }

    // Сравнение API ключей
    if (assistant.api_key !== apiKey) {
      console.warn(`Invalid API Key attempt for assistant: ${params.id}`);
      return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
    }

    // --- Проверка ассистента и ключа пройдена ---

    // 3. Формируем промпт для LLM (без контекста)
    const prompt = `
      Answer the user's question below. Use the language of the question.

      User Question: ${query}

      Answer:
    `;

    // 4. Отправляем запрос в Groq
    console.log(`Calling Groq LLM for assistant ${params.id}...`);
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_LLM_MODEL_NAME,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    // 5. Извлекаем ответ
    const answer =
      chatCompletion.choices[0]?.message?.content ||
      "Sorry, I could not generate a response.";

    // 6. Возвращаем ответ клиенту
    return NextResponse.json({ answer: answer });
  } catch (error) {
    // Обработка ошибок Supabase или Groq
    console.error(
      `Error processing request for assistant ${params.id}:`,
      error
    );
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    // Не возвращаем детали внутренней ошибки клиенту в продакшене
    return NextResponse.json(
      { error: `Failed to process chat request` },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "Chat API (Groq + Supabase Auth) is running. Use POST method.",
  });
}
