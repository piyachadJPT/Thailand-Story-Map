"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
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
    <IconButton
      size="sm"
      className="text-muted-foreground hover:text-gold-ink"
      aria-label={next === "dark" ? "เปลี่ยนเป็นโหมดมืด" : "เปลี่ยนเป็นโหมดสว่าง"}
      onClick={() => applyTheme(next)}
    >
      {mode === "dark" ? <Sun /> : <Moon />}
    </IconButton>
  );
}
