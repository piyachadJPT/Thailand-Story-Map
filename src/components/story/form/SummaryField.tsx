"use client";

import { useState } from "react";
import { fieldClass } from "./fieldStyles";
import FormField from "./FormField";
import LengthHint from "./LengthHint";

type SummaryFieldProps = {
  defaultValue?: string;
  placeholder?: string;
};

export default function SummaryField({ defaultValue, placeholder }: SummaryFieldProps) {
  const [length, setLength] = useState(defaultValue?.trim().length ?? 0);
  return (
    <FormField
      label="สรุปเรื่อง"
      htmlFor="story-summary"
      hint={
        <LengthHint id="story-summary-hint" length={length} min={70} max={155}>
          แนะนำ 70–155 ตัวอักษร ข้อความนี้จะแสดงในผลค้นหา Google
        </LengthHint>
      }
    >
      <textarea
        id="story-summary"
        name="summary"
        defaultValue={defaultValue}
        placeholder={placeholder}
        required
        minLength={10}
        maxLength={500}
        aria-describedby="story-summary-hint"
        onInput={(event) => setLength(event.currentTarget.value.trim().length)}
        className={`${fieldClass} min-h-28 py-3`}
      />
    </FormField>
  );
}
