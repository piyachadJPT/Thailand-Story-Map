"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, readTheme, type ThemeMode } from "@/lib/theme";

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const sync = () => setMode(readTheme());
    sync();
    window.addEventListener("themechange", sync);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", sync);
    return () => {
      window.removeEventListener("themechange", sync);
      media.removeEventListener("change", sync);
    };
  }, []);

  const next = mode === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5"
      aria-label={next === "dark" ? "เปลี่ยนเป็นโหมดมืด" : "เปลี่ยนเป็นโหมดสว่าง"}
      onClick={() => applyTheme(next)}
    >
      {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
