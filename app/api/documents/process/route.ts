import { NextRequest, NextResponse } from "next/server";

// Заглушка для API обработки документов

export async function POST(req: NextRequest) {
  console.warn(
    "/api/documents/process endpoint called, but it's not implemented yet."
  );
  // Возвращаем временный ответ или ошибку
  return NextResponse.json(
    {
      success: false,
      message: "Document processing functionality is not yet implemented.",
    },
    { status: 501 } // 501 Not Implemented
  );
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message:
      "Document processing API is ready for implementation. Use POST method.",
  });
}
