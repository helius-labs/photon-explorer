"use client";

import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useThemeWithMounted() {
  const { resolvedTheme, setTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return { theme: resolvedTheme, setTheme, mounted };
}
