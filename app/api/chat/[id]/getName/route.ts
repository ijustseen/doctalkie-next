import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// --- Конфигурация (Копируем из основного API чата) ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// --- Конец Конфигурации ---

// --- Инициализация Клиента Supabase (только Admin, т.к. это серверный роут) ---
let supabaseAdmin: SupabaseClient | null = null;
if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.error("[getName Route] Supabase URL or Service Role Key is missing.");
}
// --- Конец Инициализации ---

export async function GET(req: NextRequest) {
  // 1. Проверка инициализации Supabase
  if (!supabaseAdmin) {
    console.error("[getName Route] Supabase client not initialized.");
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  // 2. Получение ID бота из URL (НОВЫЙ СПОСОБ)
  let assistantId: string | undefined;
  try {
    const pathnameParts = req.nextUrl.pathname.split("/");
    // Ожидаемая структура: ['', 'api', 'chat', assistantId, 'getName']
    // Элемент с индексом 3 должен быть ID
    if (pathnameParts.length === 5 && pathnameParts[4] === "getName") {
      assistantId = pathnameParts[3];
    }
  } catch (e) {
    console.error("[getName Route] Error parsing assistant ID from URL:", e);
    assistantId = undefined;
  }

  if (!assistantId) {
    console.error(
      "[getName Route] Could not extract Assistant ID from URL path:",
      req.nextUrl.pathname
    );
    return NextResponse.json(
      { error: "Assistant ID is missing or invalid URL" },
      { status: 400 }
    );
  }

  // 3. Запрос имени бота из БД (используем извлеченный assistantId)
  try {
    const { data: bot, error: dbError } = await supabaseAdmin
      .from("bots")
      .select("name") // Выбираем только имя
      .eq("id", assistantId)
      .single(); // Ожидаем один результат

    if (dbError) {
      console.error(
        `[getName Route] Supabase error fetching bot ${assistantId}:`,
        dbError
      );
      // Не раскрываем детали БД, возвращаем 404, если не найдено, или 500 при других ошибках
      const status = dbError.code === "PGRST116" ? 404 : 500;
      return NextResponse.json(
        { error: status === 404 ? "Assistant not found" : "Database error" },
        { status }
      );
    }

    if (!bot || !bot.name) {
      // Дополнительная проверка на случай, если .single() вернул null или имя пустое
      console.warn(
        `[getName Route] Bot ${assistantId} found but name is missing.`
      );
      return NextResponse.json(
        { error: "Assistant name not found" },
        { status: 404 }
      );
    }

    // 4. Успешный ответ
    return NextResponse.json({ name: bot.name });
  } catch (error) {
    console.error(
      `[getName Route] Unexpected error processing request for bot ${assistantId}:`,
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
