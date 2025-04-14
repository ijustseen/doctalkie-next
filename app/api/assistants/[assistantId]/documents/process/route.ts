import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; // Предполагаемый путь к серверному клиенту Supabase
// import pdf from "pdf-parse"; // УДАЛЯЕМ статический импорт
import mammoth from "mammoth";

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

export async function POST(
  req: NextRequest,
  { params }: { params: { assistantId: string } }
) {
  const supabase = createClient();
  const assistantId = params.assistantId;

  // --- Проверка авторизации пользователя ---
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
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
    console.error("Error checking bot ownership:", ownerError);
    return NextResponse.json(
      { error: "Failed to verify bot ownership" },
      { status: 500 }
    );
  }
  if (!botOwner) {
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
    console.error("Error parsing form data:", e);
    return NextResponse.json(
      { error: "Invalid form data or file missing" },
      { status: 400 }
    );
  }

  if (!file) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  console.log(`Processing file: ${fileName} for assistant: ${assistantId}`);

  let extractedText = "";
  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Извлечение текста в зависимости от типа файла
    if (file.type === "application/pdf") {
      try {
        // Динамический импорт pdf-parse только при необходимости
        const pdfParse = (await import("pdf-parse")).default;
        const data = await pdfParse(fileBuffer, {}); // Используем пустые опции
        extractedText = data.text;
      } catch (pdfError) {
        console.error("Error during PDF processing:", pdfError);
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
        console.error("Error during Mammoth processing:", docxError);
        // Устанавливаем текст ошибки, чтобы он мог быть возвращен пользователю
        throw new Error(
          `Failed to extract text from DOCX: ${
            docxError instanceof Error ? docxError.message : String(docxError)
          }`
        );
      }
    } else if (file.type === "text/plain") {
      // TXT
      extractedText = fileBuffer.toString("utf-8");
    } else if (file.type === "text/markdown") {
      // MARKDOWN
      extractedText = fileBuffer.toString("utf-8"); // Обрабатываем как обычный текст
    } else {
      console.warn(`Unsupported file type received: ${file.type}`);
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Supported types: PDF, DOCX, TXT, MD`,
        }, // Обновляем сообщение об ошибке
        { status: 415 } // 415 Unsupported Media Type
      );
    }

    if (!extractedText.trim()) {
      throw new Error(
        "Could not extract text from the document or document is empty."
      );
    }

    // --- Чанкинг текста ---
    const chunks = simpleChunker(extractedText); // Используем простой чанкер

    // --- Сохранение в базу данных ---
    // ВАЖНО: Обязательно используйте транзакцию Supabase (`supabase.rpc(...)`),
    // чтобы гарантировать атомарность записи в documents и document_chunks.
    try {
      // Начало "псевдо-транзакции" (реальную транзакцию лучше через RPC)

      // 1. Запись информации о документе в таблицу 'documents'
      const { data: documentRecord, error: docError } = await supabase
        .from("documents") // <-- Убедитесь, что имя таблицы правильное
        .insert({
          bot_id: assistantId,
          file_name: fileName,
          file_size_bytes: file.size,
          status: "processing", // Начальный статус
          storage_path: "", // ИЗМЕНЕНО: Вставляем пустую строку вместо null
          // uploaded_at: Поле обычно устанавливается БД по умолчанию
        })
        .select("id") // Выбираем только ID созданной записи
        .single();

      if (docError) {
        console.error(
          `Error inserting document record for ${fileName}:`,
          docError
        );
        throw new Error(
          `Database error while saving document metadata: ${docError.message}`
        );
      }

      if (!documentRecord || !documentRecord.id) {
        throw new Error("Failed to retrieve document ID after insert.");
      }
      const documentId = documentRecord.id; // Получаем РЕАЛЬНЫЙ ID

      // 2. Подготовка записей чанков для вставки
      const chunkRecords = chunks.map((chunkText, index) => ({
        document_id: documentId, // Используем реальный ID документа
        bot_id: assistantId,
        content: chunkText,
        chunk_index: index,
      }));

      // 3. Вставка чанков в таблицу 'document_chunks'
      const { error: chunkError } = await supabase
        .from("document_chunks")
        .insert(chunkRecords);

      if (chunkError) {
        console.error(
          `Error inserting document chunks for document ${documentId}:`,
          chunkError
        );
        // В реальной транзакции здесь был бы откат
        throw new Error(
          `Database error while saving document content: ${chunkError.message}`
        );
      }

      // 4. Обновление статуса документа в 'documents' на 'ready' и установка processed_at
      const { error: updateError } = await supabase
        .from("documents")
        .update({
          status: "ready",
          processed_at: new Date().toISOString(), // Устанавливаем время обработки
        })
        .eq("id", documentId);

      if (updateError) {
        console.warn(
          `Failed to update document ${documentId} status to ready:`,
          updateError
        );
        // Не критично, но стоит залогировать
      }
      // Конец "псевдо-транзакции"

      console.log(
        "Successfully processed and saved document and chunks for",
        fileName
      );
      return NextResponse.json({
        success: true,
        message: `Processed ${fileName}`,
        documentId: documentId,
        chunksCount: chunks.length,
      });
    } catch (dbError) {
      // Обработка ошибок базы данных (из шагов 1, 3 или 4)
      console.error(
        `Database operation failed during processing ${fileName}:`,
        dbError
      );
      // В реальной транзакции здесь был бы откат
      // Попытаться обновить статус документа на 'error'?
      // const { error: statusUpdateError } = await supabase.from('documents').update({ status: 'error' }).eq('id', documentId); // Осторожно, documentId может быть не определен
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
    // Обработка ошибок парсинга файла или других ошибок до БД
    console.error(`Error processing file ${fileName}:`, processingError);
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
