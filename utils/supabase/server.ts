import { createServerClient, type CookieOptions } from "@supabase/ssr";
// Принимаем cookieStore как аргумент
export const createClient = (
  cookieStore: ReturnType<typeof import("next/headers")["cookies"]>
) => {
  // Получаем переменные окружения
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Важно: Используем Service Role Key ТОЛЬКО на сервере!
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Supabase URL or Service Role Key is missing from environment variables."
    );
  }

  // Создаем серверный клиент Supabase.
  return createServerClient(supabaseUrl, supabaseServiceRoleKey, {
    cookies: {
      get(name: string) {
        // Use 'as any' to bypass potential type mismatch
        return (cookieStore as any).get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          (cookieStore as any).set({ name, value, ...options });
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          (cookieStore as any).set({ name, value: "", ...options });
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
    // Важно: Указываем auth.persistSession = false при использовании Service Role Key,
    // так как сессия пользователя не нужна для серверных операций с полным доступом.
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};
