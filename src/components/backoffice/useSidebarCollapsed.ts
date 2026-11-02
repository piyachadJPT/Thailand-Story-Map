"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "backoffice:sidebar-collapsed";
const EVENT = "backoffice-sidebar";

function read() {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

/** Sidebar rail preference, remembered per browser. */
export function useSidebarCollapsed() {
  const collapsed = useSyncExternalStore(subscribe, read, () => false);
  const setCollapsed = useCallback((value: boolean) => {
    try {
      window.localStorage.setItem(KEY, value ? "1" : "0");
    } catch {
      // storage unavailable: the preference just won't persist
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [collapsed, setCollapsed] as const;
}
