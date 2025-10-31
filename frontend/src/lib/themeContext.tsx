"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { flushSync } from "react-dom";

interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const isDark = stored !== "light";
    const initialTheme = isDark ? "dark" : "light";
    setTheme(initialTheme);
    localStorage.setItem("theme", initialTheme);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    const isSmallScreen = window.matchMedia("(max-width: 767px)").matches;

    if (!document.startViewTransition || isSmallScreen) {
      setTheme(newTheme);
      document.body.classList.toggle("dark", newTheme === "dark");
      return;
    }
    document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
      });
    });
  };

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme === "dark" ? "dark" : ""}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
