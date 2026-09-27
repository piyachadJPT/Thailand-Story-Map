"use client";

import { createBrowserClient } from "@supabase/ssr";
import { assertSupabaseConfigured } from "@/config/supabase-env";

export function createSupabaseBrowserClient() {
  const { url, publishableKey } = assertSupabaseConfigured();
  return createBrowserClient(url, publishableKey);
}
