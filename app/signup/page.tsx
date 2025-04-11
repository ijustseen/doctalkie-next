"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Github } from "lucide-react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Define custom appearance based on shadcn/ui theme variables
// (Same object as in login page)
const customAppearance = {
  variables: {
    default: {
      colors: {
        brand: "hsl(var(--primary))",
        brandAccent: "hsl(var(--primary) / 0.8)",
        brandButtonText: "hsl(var(--primary-foreground))",
        defaultButtonBackground: "hsl(var(--secondary))",
        defaultButtonBackgroundHover: "hsl(var(--secondary) / 0.8)",
        defaultButtonBorder: "hsl(var(--border))",
        defaultButtonText: "hsl(var(--secondary-foreground))",
        dividerBackground: "hsl(var(--border))",
        inputBackground: "hsl(var(--input))",
        inputBorder: "hsl(var(--border))",
        inputBorderHover: "hsl(var(--ring))",
        inputBorderFocus: "hsl(var(--ring))",
        inputText: "hsl(var(--foreground))",
        inputLabelText: "hsl(var(--muted-foreground))",
        inputPlaceholder: "hsl(var(--muted-foreground) / 0.6)",
        messageText: "hsl(var(--foreground))",
        messageTextDanger: "hsl(var(--destructive))",
        anchorTextColor: "hsl(var(--primary))",
        anchorTextHoverColor: "hsl(var(--primary) / 0.8)",
      },
      space: {
        spaceSmall: "4px",
        spaceMedium: "8px",
        spaceLarge: "16px",
        labelBottomMargin: "8px",
        anchorBottomMargin: "4px",
        emailInputSpacing: "8px",
        socialAuthSpacing: "8px",
        buttonPadding: "10px 15px",
        inputPadding: "10px 12px",
      },
      fontSizes: {
        baseBodySize: "14px",
        baseInputSize: "14px",
        baseLabelSize: "14px",
        baseButtonSize: "14px",
      },
      fonts: {
        bodyFontFamily: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
        buttonFontFamily: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
        inputFontFamily: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
        labelFontFamily: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
      },
      borderWidths: {
        buttonBorderWidth: "1px",
        inputBorderWidth: "1px",
      },
      radii: {
        borderRadiusButton: "var(--radius)",
        buttonBorderRadius: "var(--radius)",
        inputBorderRadius: "var(--radius)",
      },
    },
  },
};

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push("/dashboard");
      }
    });

    return () => subscription?.unsubscribe();
  }, [supabase, router]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Create an account
          </CardTitle>
          <CardDescription>
            Enter your details below or use a provider
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Auth
            supabaseClient={supabase}
            appearance={customAppearance}
            providers={["github", "google"]}
            redirectTo={
              process.env.NEXT_PUBLIC_BASE_URL
                ? `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
                : undefined
            }
            view="sign_up"
            showLinks={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
