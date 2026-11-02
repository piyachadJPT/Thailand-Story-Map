"use client";

import type { FormEvent, RefObject } from "react";
import { ArrowRight, Send } from "lucide-react";
import type { PlaceHit } from "@/components/map/geocode";
import { Button } from "@/components/ui/button";
import FormActions from "@/components/story/form/FormActions";
import type { FormOption, Point } from "@/components/story/form/types";
import type { CoverImage } from "@/components/story/form/useCoverImage";
import type { ComposerStep } from "./ComposerProgress";
import StepContent from "./StepContent";
import StepPlace from "./StepPlace";
import StepReview, { type ReviewSnapshot } from "./StepReview";

type ComposerFormProps = {
  formRef: RefObject<HTMLFormElement | null>;
  step: ComposerStep;
  onStepChange: (step: ComposerStep) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  checkPlace: () => boolean;
  error: string;
  onError: (message: string) => void;
  saving: boolean;
  canSubmit: boolean;
  isCrime: boolean;
  cover: CoverImage;
  snapshot: ReviewSnapshot;
  categories: FormOption[];
  categoryId: string;
  onCategoryChange: (id: string) => void;
  provinces: FormOption[];
  provinceId: string;
  onProvinceChange: (id: string) => void;
  point: Point | null;
  pinMode: boolean;
  onPlace: (place: PlaceHit) => void;
  onLocate: (point: Point) => void;
  onStartPick: () => void;
};

/** The three steps plus the sticky footer (ปิด / ถัดไป / submit). */
export default function ComposerForm({ formRef, ...props }: ComposerFormProps) {
  const { step } = props;

  function next() {
    props.onError("");
    if (step === 0) {
      if (props.checkPlace()) props.onStepChange(1);
      return;
    }
    const fields = formRef.current?.querySelectorAll<HTMLInputElement>(
      '[data-step="1"] input, [data-step="1"] textarea'
    );
    const invalid = Array.from(fields ?? []).find((field) => !field.checkValidity());
    if (invalid) invalid.reportValidity();
    else props.onStepChange(2);
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={props.onSubmit}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6">
        <StepPlace
          hidden={step !== 0}
          categories={props.categories}
          categoryId={props.categoryId}
          onCategoryChange={props.onCategoryChange}
          provinces={props.provinces}
          provinceId={props.provinceId}
          onProvinceChange={props.onProvinceChange}
          hasPoint={Boolean(props.point)}
          pinMode={props.pinMode}
          onPlace={props.onPlace}
          onLocate={props.onLocate}
          onStartPick={props.onStartPick}
          onError={props.onError}
        />
        <StepContent hidden={step !== 1} cover={props.cover} saving={props.saving} isCrime={props.isCrime} />
        <StepReview
          hidden={step !== 2}
          snapshot={props.snapshot}
          categoryName={props.categories.find((item) => item.id === props.categoryId)?.name}
          provinceName={props.provinces.find((item) => item.id === props.provinceId)?.name}
          hasPoint={Boolean(props.point)}
          coverUrl={props.cover.url}
          isCrime={props.isCrime}
        />
      </div>

      <FormActions sticky error={props.error}>
        <Button type="button" variant="ghost" disabled={props.saving} onClick={props.onClose}>
          ปิด
        </Button>
        {step < 2 ? (
          <Button type="button" className="min-w-32" onClick={next}>
            ถัดไป
            <ArrowRight aria-hidden="true" />
          </Button>
        ) : (
          <Button
            type="submit"
            className="min-w-32"
            disabled={props.saving || !props.canSubmit}
          >
            <Send aria-hidden="true" />
            {props.saving ? "กำลังบันทึก…" : props.isCrime ? "ส่งตรวจสอบ" : "เผยแพร่เรื่องราว"}
          </Button>
        )}
      </FormActions>
    </form>
  );
}
