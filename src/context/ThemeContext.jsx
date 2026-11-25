import React, { createContext, useContext, useEffect, useMemo } from "react";

export const THEME_STORAGE_KEY = "cargill-theme";
export const THEMES = ["dark"];

const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

function applyDarkTheme() {
  const root = document.documentElement;
  root.dataset.theme = "dark";
  root.style.colorScheme = "dark";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", "#0A0820");
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
  } catch {
    /* ignore */
  }
}

export function ThemeProvider({ children }) {
  useEffect(() => {
    applyDarkTheme();
  }, []);

  const value = useMemo(
    () => ({
      theme: "dark",
      setTheme: () => {},
      toggleTheme: () => {},
    }),
    [],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
