"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { THEMES, DEFAULT_THEME_ID, STORAGE_KEY } from "@/lib/themes";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(DEFAULT_THEME_ID);

  // On mount, read persisted preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && THEMES.find((t) => t.id === saved)) setThemeId(saved);
    } catch {}
  }, []);

  // Apply CSS vars whenever theme changes
  useEffect(() => {
    const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    // body bg + dot color
    document.body.style.backgroundColor = theme.vars["--color-bg"];
    document.body.style.backgroundImage = `radial-gradient(circle, ${theme.vars["--color-dot"]} 1px, transparent 1px)`;
  }, [themeId]);

  function applyTheme(id) {
    setThemeId(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch {}
  }

  return (
    <ThemeContext.Provider value={{ themeId, applyTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}
