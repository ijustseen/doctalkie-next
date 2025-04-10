import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookieStore = await cookies();
            return cookieStore.get(name)?.value;
          },
          async set(name: string, value: string, options: CookieOptions) {
            try {
              const cookieStore = await cookies();
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Handle or log error if needed
              console.error("Error setting cookie:", name, error);
            }
          },
          async remove(name: string, options: CookieOptions) {
            try {
              const cookieStore = await cookies();
              cookieStore.delete({ name, ...options });
            } catch (error) {
              // Handle or log error if needed
              console.error("Error removing cookie:", name, error);
            }
          },
        },
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Supabase auth error exchanging code:", error.message);
      return NextResponse.redirect(
        `${
          requestUrl.origin
        }/login?error=Could not authenticate user&error_description=${encodeURIComponent(
          error.message
        )}`
      );
    }
  }

  // Redirect to dashboard on successful code exchange or if no code was present (should not happen in normal flow)
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
