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
const customAppearance = {
  // If you want to base it on ThemeSupa and override, use this:
  // extends: ThemeSupa,
  variables: {
    default: {
      colors: {
        brand: "hsl(var(--primary))", // Primary color for buttons, links
        brandAccent: "hsl(var(--primary) / 0.8)", // Lighter/hover version of primary
        brandButtonText: "hsl(var(--primary-foreground))", // Text on primary buttons
        defaultButtonBackground: "hsl(var(--secondary))",
        defaultButtonBackgroundHover: "hsl(var(--secondary) / 0.8)",
        defaultButtonBorder: "hsl(var(--border))",
        defaultButtonText: "hsl(var(--secondary-foreground))",
        dividerBackground: "hsl(var(--border))",
        inputBackground: "hsl(var(--input))",
        inputBorder: "hsl(var(--border))",
        inputBorderHover: "hsl(var(--ring))", // Use ring color for focus/hover
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
        baseBodySize: "14px", // Match shadcn base font size
        baseInputSize: "14px",
        baseLabelSize: "14px",
        baseButtonSize: "14px",
      },
      fonts: {
        bodyFontFamily: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`, // Match typical Tailwind/shadcn font stack
        buttonFontFamily: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
        inputFontFamily: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
        labelFontFamily: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
      },
      borderWidths: {
        buttonBorderWidth: "1px",
        inputBorderWidth: "1px",
      },
      radii: {
        borderRadiusButton: "var(--radius)", // Use shadcn radius
        buttonBorderRadius: "var(--radius)",
        inputBorderRadius: "var(--radius)",
      },
    },
  },
  // Optionally override specific elements if needed
  // className: {
  //   button: 'custom-button-class',
  //   input: 'custom-input-class',
  // },
};

export default function LoginPage() {
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
            Log in to DocTalkie
          </CardTitle>
          <CardDescription>
            Use your email and password or a provider below
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
            view="sign_in"
            showLinks={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
