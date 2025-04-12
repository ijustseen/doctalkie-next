import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard-client";
import ChatWidget from "@/components/doc-talkie-chat";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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
            console.error(
              "Error setting cookie in server component:",
              name,
              error
            );
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies();
            cookieStore.delete({ name, ...options });
          } catch (error) {
            console.error(
              "Error removing cookie in server component:",
              name,
              error
            );
          }
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error(
      "Error fetching authenticated user or user not found:",
      userError
    );
    redirect("/login?error=Could not authenticate user");
  }

  const userId = user.id;

  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select(
      `
      id,
      created_at,
      updated_at,
      subscription_id,
      subscriptions ( id, name, max_bots, max_total_doc_size_mb )
    `
    )
    .eq("id", userId)
    .single();

  const { data: bot, error: botError } = await supabase
    .from("bots")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching user profile:", profileError);
    redirect("/login?error=Failed to load dashboard data");
  }

  if (botError) {
    console.error("Error fetching bot data:", botError);
    redirect("/login?error=Failed to load bot data");
  }

  if (!userProfile) {
    console.error("User profile not found for logged-in user:", userId);
    redirect("/login?error=User profile not found");
  }

  const profileWithSubscription = userProfile as typeof userProfile & {
    subscriptions: {
      id: string;
      name: string;
      max_bots: number;
      max_total_doc_size_mb: number;
    } | null;
  };

  return (
    <>
      <DashboardClient
        user={user}
        profile={profileWithSubscription}
        initialBot={bot ?? null}
      />
      <ChatWidget
        apiURL="http://localhost:3000/api/chat"
        apiKey="your_api_key_here"
        accentColor="hsl(var(--primary))"
        theme="dark"
        position="bottom-right"
      />
    </>
  );
}
