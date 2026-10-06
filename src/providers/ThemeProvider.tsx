"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Suppress the React warning caused by next-themes injecting a script tag.
// This is a known false positive in Next.js development mode; next-themes relies on this
// inline script to set the class/attributes early enough to prevent a Flash of Unstyled Content (FOUC).
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

const ThemeProvider = ({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) => {
  return <NextThemesProvider {...props} forcedTheme="light">{children}</NextThemesProvider>;
};

export default ThemeProvider;
