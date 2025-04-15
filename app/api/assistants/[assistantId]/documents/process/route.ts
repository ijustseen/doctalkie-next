import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
// import pdf from "pdf-parse"; // УДАЛЯЕМ статический импорт
import mammoth from "mammoth";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

// Опционально: Простая функция для чанкинга (можно заменить на более продвинутую)
function simpleChunker(
  text: string,
  chunkSize = 1000,
  overlap = 100
): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    chunks.push(text.slice(i, end));
    if (end === text.length) break;
    i += chunkSize - overlap; // Передвигаем назад для перекрытия
    if (i < 0) i = 0; // Предотвращение зацикливания при большом перекрытии
  }
  return chunks;
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      "[documents/process] Supabase URL or Service Role Key missing."
    );
    return NextResponse.json(
      { error: "Server configuration error (keys missing)." },
      { status: 500 }
    );
  }

  const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          /* Ignored */
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch (error) {
          /* Ignored */
        }
      },
    },
    auth: {
      // Добавляем опции auth для service_role ключа
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  let assistantId: string | undefined;
  try {
    const pathnameParts = req.nextUrl.pathname.split("/");
    // Ожидаемая структура: ['', 'api', 'assistants', assistantId, 'documents', 'process']
    // Элемент с индексом 3 должен быть ID
    if (pathnameParts.length === 6 && pathnameParts[5] === "process") {
      assistantId = pathnameParts[3];
    }
  } catch (e) {
    console.error(
      "[documents/process] Error parsing assistant ID from URL:",
      e
    );
    assistantId = undefined;
  }

  if (!assistantId) {
    console.error(
      "[documents/process] Could not extract Assistant ID from URL path:",
      req.nextUrl.pathname
    );
    return NextResponse.json(
      { error: "Assistant ID is missing or invalid URL" },
      { status: 400 }
    );
  }

  // --- Проверка авторизации пользователя ---
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("Unauthorized: User not found", userError);
    return NextResponse.json(
      { error: "Unauthorized: User not found" },
      { status: 401 }
    );
  }

  // --- Проверка, что ассистент принадлежит пользователю (Критически важно!) ---
  const { data: botOwner, error: ownerError } = await supabase
    .from("bots") // Используем таблицу ботов
    .select("user_id")
    .eq("id", assistantId)
    .eq("user_id", user.id) // Проверяем user_id
    .maybeSingle(); // Используем maybeSingle, чтобы не было ошибки, если не найдено

  if (ownerError) {
    console.error("Error checking bot ownership:", ownerError); // Оставляем ошибку
    return NextResponse.json(
      { error: "Failed to verify bot ownership" },
      { status: 500 }
    );
  }
  if (!botOwner) {
    // console.warn(`Attempt to access bot ${assistantId} by user ${user.id}`); // Можно добавить деталей
    return NextResponse.json(
      { error: "Unauthorized: Assistant not found or does not belong to user" },
      { status: 403 }
    ); // 403 Forbidden
  }
  // --- Конец проверок ---

  let file: File | null = null;
  let fileName = "";
  try {
    const formData = await req.formData();
    const fileData = formData.get("file");
    if (!fileData || typeof fileData === "string") {
      throw new Error("File not found in form data");
    }
    file = fileData as File;
    fileName = file.name;
  } catch (e) {
    console.error("Error parsing form data:", e); // Оставляем ошибку
    return NextResponse.json(
      { error: "Invalid form data or file missing" },
      { status: 400 }
    );
  }

  if (!file) {
    // Эта проверка может быть избыточной из-за try/catch выше, но оставим для ясности
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  console.log(`Processing file: ${fileName} for assistant: ${assistantId}`); // Оставляем основной лог начала

  let extractedText = "";
  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Извлечение текста в зависимости от типа файла
    if (file.type === "application/pdf") {
      try {
        const pdfParse = (await import("pdf-parse")).default;
        const data = await pdfParse(fileBuffer, {});
        extractedText = data.text;
      } catch (pdfError) {
        console.error("Error during PDF processing:", pdfError); // Оставляем ошибку
        throw new Error(
          `Failed to extract text from PDF: ${
            pdfError instanceof Error ? pdfError.message : String(pdfError)
          }`
        );
      }
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // DOCX
      try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedText = result.value;
      } catch (docxError) {
        console.error("Error during Mammoth processing:", docxError); // Оставляем ошибку
        throw new Error(
          `Failed to extract text from DOCX: ${
            docxError instanceof Error ? docxError.message : String(docxError)
          }`
        );
      }
    } else if (file.type === "text/plain" || file.type === "text/markdown") {
      // TXT или MARKDOWN (по MIME типу)
      extractedText = fileBuffer.toString("utf-8");
    } else if (
      file.type === "application/octet-stream" &&
      fileName.toLowerCase().endsWith(".md")
    ) {
      // Обработка .md файла, который пришел с неправильным MIME типом
      extractedText = fileBuffer.toString("utf-8");
    } else {
      console.warn(
        `Unsupported file type received: ${file.type} for file ${fileName}`
      );
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Supported types: PDF, DOCX, TXT, MD`,
        },
        { status: 415 }
      );
    }

    if (!extractedText.trim()) {
      throw new Error(
        "Could not extract text from the document or document is empty."
      );
    }

    // --- Чанкинг текста ---
    const chunks = simpleChunker(extractedText);

    // --- Сохранение в базу данных ---
    try {
      // 1. Запись информации о документе
      const { data: documentRecord, error: docError } = await supabase
        .from("documents")
        .insert({
          bot_id: assistantId,
          file_name: fileName,
          file_size_bytes: file.size,
          status: "processing",
          storage_path: "",
        })
        .select("id")
        .single();
      if (docError) {
        console.error(
          `[documents/process] Error inserting document record for ${fileName}:`,
          docError
        );
        throw new Error(
          `Database error while saving document metadata: ${docError.message}`
        );
      }
      const documentId = documentRecord.id;

      // 2. Подготовка чанков
      const chunkRecords = chunks.map((chunkText, index) => ({
        document_id: documentId,
        bot_id: assistantId,
        content: chunkText,
        chunk_index: index,
      }));

      // 3. Вставка чанков
      const { error: chunkError } = await supabase
        .from("document_chunks")
        .insert(chunkRecords);
      if (chunkError) {
        console.error(
          `[documents/process] Error inserting document chunks for ${fileName}:`,
          chunkError
        );
        try {
          await supabase.from("documents").delete().eq("id", documentId);
        } catch (rollbackError) {
          console.error(
            `[documents/process] Failed to rollback document record for ${fileName}:`,
            rollbackError
          );
        }
        throw new Error(
          `Database error while saving document content: ${chunkError.message}`
        );
      }

      // 4. Обновление статуса документа
      const { error: updateError } = await supabase
        .from("documents")
        .update({
          status: "ready",
          processed_at: new Date().toISOString(),
        })
        .eq("id", documentId);
      if (updateError) {
        console.warn(
          `[documents/process] Failed to update document status to ready for doc ${documentId}:`,
          updateError
        );
      }

      // 5. Обновление статистики хранилища (через supabase-js)
      try {
        const supabaseJsAdmin = createSupabaseJsClient(
          supabaseUrl,
          supabaseServiceKey
        );
        const { data: currentData, error: selectError } = await supabaseJsAdmin
          .from("users")
          .select("total_storage_usage_bytes")
          .eq("id", user.id)
          .single();
        if (selectError) {
          console.error(
            `[documents/process] Error fetching current storage bytes (supabase-js) for ${user.id}:`,
            selectError
          );
          throw new Error(
            "Could not fetch current user storage stats (supabase-js)."
          );
        }
        if (!currentData) {
          console.error(
            `[documents/process] User not found when fetching storage bytes (supabase-js) for ${user.id}`
          );
          throw new Error(
            "User not found for storage stats update (supabase-js)."
          );
        }
        const currentBytes = currentData.total_storage_usage_bytes ?? 0;
        const bytesToAdd = file.size;
        const newTotalBytes = currentBytes + bytesToAdd;
        const { error: updateStatsError } = await supabaseJsAdmin
          .from("users")
          .update({ total_storage_usage_bytes: newTotalBytes })
          .eq("id", user.id);
        if (updateStatsError) {
          console.error(
            `[documents/process] Error updating storage bytes (supabase-js) for ${user.id}:`,
            updateStatsError
          );
          console.warn(
            `[documents/process] Failed to update user storage statistics (supabase-js).`
          );
        }
      } catch (statsUpdateError) {
        console.error(
          `[documents/process] Exception during storage stats update (supabase-js) for ${user.id}:`,
          statsUpdateError
        );
        console.warn(
          `[documents/process] Failed to update user storage statistics due to exception (supabase-js).`
        );
      }

      return NextResponse.json({
        success: true,
        message: `Processed ${fileName}`,
        documentId: documentId,
        chunksCount: chunks.length,
      });
    } catch (dbError) {
      console.error(
        `[documents/process] Database operation failed during processing for ${fileName}:`,
        dbError
      );
      return NextResponse.json(
        {
          error: `Database error during processing: ${
            dbError instanceof Error ? dbError.message : "Unknown DB error"
          }`,
        },
        { status: 500 }
      );
    }
  } catch (processingError) {
    console.error(
      `[documents/process] Error processing file ${fileName}:`,
      processingError
    );
    return NextResponse.json(
      {
        error: `Failed to process file: ${
          processingError instanceof Error
            ? processingError.message
            : "Unknown processing error"
        }`,
      },
      { status: 500 }
    );
  }
}
