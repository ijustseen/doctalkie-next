import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// --- Конфигурация Groq ---
const GROQ_LLM_MODEL_NAME = "llama3-8b-8192"; // Пример (Llama 3 8B)
const groqApiKey = process.env.GROQ_API_KEY;

let groq: Groq | null = null;
if (groqApiKey) {
  groq = new Groq({ apiKey: groqApiKey });
} else {
  console.error("GROQ_API_KEY is not set in environment variables.");
}
// --- Конец Конфигурации Groq ---

export async function POST(req: NextRequest) {
  if (!groq) {
    return NextResponse.json(
      { error: "Groq API key not configured correctly on the server." },
      { status: 500 }
    );
  }

  try {
    // Получаем вопрос пользователя и КОНТЕКСТ (который был найден ранее)
    // Важно: Этот эндпоинт ПРЕДПОЛАГАЕТ, что поиск по эмбеддингам УЖЕ ПРОИЗОШЕЛ,
    // и релевантный контекст передается в теле запроса.
    const { query, context } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Используем переданный контекст или заглушку, если он не пришел
    const contextForLlm = context || "No context provided."; // В идеале, здесь всегда должен быть контекст

    // Формируем промпт для LLM
    // const prompt = `
    //   Answer the user's question based **only** on the provided context below.
    //   Do not use your general knowledge. If the answer is not found in the context, say "I cannot find the answer in the provided documentation."

    //   Context:
    //   ---
    //   ${contextForLlm}
    //   ---

    //   User Question: ${query}

    //   Answer:
    // `;

    const prompt = `
      Answer the user's question below. Use the language of the question.

      User Question: ${query}

      Answer:
    `;

    // Отправляем запрос в Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_LLM_MODEL_NAME,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    // Извлекаем ответ
    const answer =
      chatCompletion.choices[0]?.message?.content ||
      "Sorry, I could not generate a response.";

    return NextResponse.json({ answer: answer });
  } catch (error) {
    console.error("Error in /api/chat POST handler (Groq):", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: `Failed to process chat request: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "Chat API (using Groq LLM) is running. Use POST method.",
  });
}
