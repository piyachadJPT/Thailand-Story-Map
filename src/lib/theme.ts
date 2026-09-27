export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export function readTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(mode);
  root.dataset.theme = mode;
  root.style.colorScheme = mode;
  localStorage.setItem(THEME_STORAGE_KEY, mode);
  window.dispatchEvent(new Event("themechange"));
}

/** Runs before paint so the first frame matches the saved mode. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark")return;var r=document.documentElement;r.classList.remove("light","dark");r.classList.add(t);r.setAttribute("data-theme",t);r.style.colorScheme=t;}catch(e){}})();`;
