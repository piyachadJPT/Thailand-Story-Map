"use client";

import { useState, type FormEvent } from "react";
import type { StoryMapPoint } from "@/models/types/story";
import type { Point } from "@/components/story/form/types";
import type { CoverImage } from "@/components/story/form/useCoverImage";
import type { ComposerStep } from "./ComposerProgress";
import { buildStoryPayload, createStory } from "./createStory";

type Options = {
  cover: CoverImage;
  point: Point | null;
  provinceId: string;
  categoryId: string;
  isCrime: boolean;
  currentStep: ComposerStep;
  goToStep: (step: ComposerStep) => void;
  /** Province + location checks (shows their own messages). */
  checkPlace: () => boolean;
  setError: (message: string) => void;
  onSaved: (result: { published: boolean; mapPoint?: StoryMapPoint | null; point: Point }) => void;
};

/**
 * Submit flow for the composer. Order matches the old single-page form:
 * browser field validation → province → location → crime source → POST.
 */
export function useStorySubmit(options: Options) {
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const { cover, point, provinceId, categoryId, isCrime, setError } = options;
    const formElement = event.currentTarget;
    // The form is noValidate because fields live in hidden steps: find the
    // first invalid field, open its step, then show the browser's message.
    const invalid = Array.from(formElement.elements).find(
      (element) => "checkValidity" in element && !(element as HTMLInputElement).checkValidity()
    ) as HTMLInputElement | undefined;
    if (invalid) {
      const owner = invalid.closest<HTMLElement>("[data-step]");
      options.goToStep(Number(owner?.dataset.step ?? options.currentStep) as ComposerStep);
      window.setTimeout(() => invalid.reportValidity(), 0);
      return;
    }
    setError("");
    if (!options.checkPlace() || !point) return;
    const form = new FormData(formElement);
    if (isCrime && !String(form.get("sourceUrl") ?? "").trim()) {
      setError("คดีอาชญากรรมต้องมีลิงก์หลักฐานอ้างอิง");
      return;
    }
    const payload = buildStoryPayload(form, { point, provinceId, categoryId, isCrime });

    setSaving(true);
    try {
      const data = await createStory(payload, await cover.upload());
      formElement.reset();
      options.onSaved({
        published: data.status === "APPROVED",
        mapPoint: data.mapPoint,
        point,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "บันทึกเรื่องราวไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return { saving, submit };
}
