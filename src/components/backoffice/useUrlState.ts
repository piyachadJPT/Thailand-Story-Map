"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Filters, tabs, sort and page live in the URL so a refresh or a shared link
 * shows the same view. Changing anything but `page` resets to page 1.
 */
export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const get = useCallback((key: string) => params.get(key) ?? "", [params]);
  const set = useCallback(
    (patch: Record<string, string | number | boolean | null | undefined>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === null || value === "" || value === false) next.delete(key);
        else next.set(key, value === true ? "1" : String(value));
      }
      if (!("page" in patch)) next.delete("page");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router]
  );
  const page = Math.max(1, Number(params.get("page")) || 1);
  return { params, get, set, page };
}

export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/** Text input bound to a URL param, written back after a 300ms pause. */
export function useUrlSearch(key = "q") {
  const { get, set } = useUrlState();
  const urlValue = get(key);
  const [value, setValue] = useState(urlValue);
  const debounced = useDebouncedValue(value, 300);
  useEffect(() => {
    if (debounced.trim() !== urlValue) set({ [key]: debounced.trim() });
    // urlValue/set are read at the moment the debounced value settles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);
  return [value, setValue] as const;
}
