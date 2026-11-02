"use client";

import { useEffect, useState } from "react";
import type { FormOption } from "@/components/story/form/types";

type OptionsResponse = {
  data?: { categories: FormOption[]; provinces: FormOption[] };
  message?: string;
};

/** Loads categories and provinces when the composer opens. */
export function useComposerOptions(open: boolean, onError: (message: string) => void) {
  const [categories, setCategories] = useState<FormOption[]>([]);
  const [provinces, setProvinces] = useState<FormOption[]>([]);
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    if (!open) return;
    let active = true;
    void fetch("/api/stories/options")
      .then(async (response) => {
        const body = (await response.json()) as OptionsResponse;
        if (!response.ok) throw new Error(body.message || "โหลดตัวเลือกไม่สำเร็จ");
        if (!active) return;
        const nextCategories = body.data?.categories ?? [];
        setCategories(nextCategories);
        setProvinces(body.data?.provinces ?? []);
        setCategoryId((current) => current || nextCategories[0]?.id || "");
      })
      .catch((cause: unknown) => {
        if (active) onError(cause instanceof Error ? cause.message : "โหลดตัวเลือกไม่สำเร็จ");
      });
    return () => {
      active = false;
    };
  }, [open, onError]);

  return { categories, provinces, categoryId, setCategoryId };
}
