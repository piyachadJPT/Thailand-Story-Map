"use client";

import { BACKOFFICE_PATH } from "@/config/backoffice";
import { rateLimitMessage, retryAfterSeconds } from "@/utils/errorHandler";

export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryAfter: number | null = null
  ) {
    super(message);
  }
}

type Options = { method?: "GET" | "POST" | "PATCH"; body?: unknown; signal?: AbortSignal };

/** Calls /api/admin/*; a 401 sends the browser to the login page. */
export async function adminFetch<T>(path: string, { method = "GET", body, signal }: Options = {}) {
  const response = await fetch(path, {
    method,
    signal,
    cache: "no-store",
    credentials: "same-origin",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await response.json().catch(() => null)) as { data?: T; message?: string } | null;
  if (!response.ok) {
    if (response.status === 401 && !path.endsWith("/login")) {
      window.location.assign(`${BACKOFFICE_PATH}/login`);
    }
    const retryAfter = retryAfterSeconds(response.headers);
    const message =
      response.status === 429
        ? rateLimitMessage(retryAfter)
        : json?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่";
    throw new AdminApiError(message, response.status, retryAfter);
  }
  return json?.data as T;
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่";
}

export function queryString(params: Record<string, string | number | boolean | null | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === false) continue;
    search.set(key, value === true ? "1" : String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

/** React Query keys; invalidate `adminKeys.all` after any moderation action. */
export const adminKeys = {
  all: ["admin"] as const,
  counts: ["admin", "counts"] as const,
  overview: (range: number) => ["admin", "overview", range] as const,
  overviewMap: ["admin", "overview-map"] as const,
  stories: (params: unknown) => ["admin", "stories", params] as const,
  story: (id: string) => ["admin", "story", id] as const,
  reports: (params: unknown) => ["admin", "reports", params] as const,
  users: (params: unknown) => ["admin", "users", params] as const,
  user: (id: string) => ["admin", "user", id] as const,
  userTab: (id: string, tab: string, params: unknown) => ["admin", "user", id, tab, params] as const,
  audit: (params: unknown) => ["admin", "audit", params] as const,
  sessions: ["admin", "sessions"] as const,
  search: (q: string) => ["admin", "search", q] as const,
};
