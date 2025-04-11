"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
// Remove specific type import if causing issues
// import type { ThemeProviderProps } from "next-themes/dist/types";

// Use React.ComponentProps without explicit ThemeProviderProps or use any
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // Alternatively, use `props: any` if the above causes issues
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
