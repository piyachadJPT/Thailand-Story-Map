"use client";

import { useState, type RefObject } from "react";
import type { ComposerStep } from "./ComposerProgress";
import type { ReviewSnapshot } from "./StepReview";

const emptySnapshot: ReviewSnapshot = { title: "", summary: "", sourceUrl: "" };

export const focusLater = (id: string) =>
  window.setTimeout(() => document.getElementById(id)?.focus(), 0);

/**
 * Current step, the review snapshot (read from the form when entering
 * ตรวจทาน), and the step-1 checks with the original messages.
 */
export function useComposerSteps({
  formRef,
  provinceId,
  hasPoint,
  setError,
}: {
  formRef: RefObject<HTMLFormElement | null>;
  provinceId: string;
  hasPoint: boolean;
  setError: (message: string) => void;
}) {
  const [step, setStep] = useState<ComposerStep>(0);
  const [snapshot, setSnapshot] = useState(emptySnapshot);

  function goToStep(next: ComposerStep) {
    if (next === 2 && formRef.current) {
      const form = new FormData(formRef.current);
      setSnapshot({
        title: String(form.get("title") ?? "").trim(),
        summary: String(form.get("summary") ?? "").trim(),
        sourceUrl: String(form.get("sourceUrl") ?? "").trim(),
      });
    }
    setStep(next);
  }

  function checkPlace() {
    if (!provinceId) {
      goToStep(0);
      setError("กรุณาเลือกจังหวัดจากรายการที่แนะนำ");
      focusLater("story-province");
      return false;
    }
    if (!hasPoint) {
      goToStep(0);
      focusLater("story-location-button");
      setError("กรุณาค้นหาสถานที่ ใช้ตำแหน่งปัจจุบัน หรือเลือกหมุดบนแผนที่ก่อนบันทึก");
      return false;
    }
    return true;
  }

  return { step, snapshot, goToStep, checkPlace };
}
