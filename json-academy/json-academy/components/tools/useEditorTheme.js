"use client";

import { useEffect, useState, useCallback } from "react";
import { EDITOR_THEMES, DEFAULT_EDITOR_THEME_ID, EDITOR_THEME_STORAGE_KEY } from "@/lib/themes";

/**
 * Read the active editor theme from localStorage and keep it in state.
 * All widgets that want to match the formatter's theme palette use this hook.
 */
export default function useEditorTheme() {
  const [theme, setThemeState] = useState(
    () => EDITOR_THEMES.find((t) => t.id === DEFAULT_EDITOR_THEME_ID) ?? EDITOR_THEMES[0]
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(EDITOR_THEME_STORAGE_KEY);
      if (saved) {
        const f = EDITOR_THEMES.find((t) => t.id === saved);
        if (f) setThemeState(f);
      }
    } catch {}
  }, []);

  const setTheme = useCallback((t) => {
    setThemeState(t);
    try {
      localStorage.setItem(EDITOR_THEME_STORAGE_KEY, t.id);
    } catch {}
  }, []);

  return { theme, setTheme, themes: EDITOR_THEMES };
}