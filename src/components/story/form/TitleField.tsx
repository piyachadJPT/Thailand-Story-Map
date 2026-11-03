"use client";

import { useState } from "react";
import { inputClass } from "./fieldStyles";
import FormField from "./FormField";
import LengthHint from "./LengthHint";

type TitleFieldProps = {
  defaultValue?: string;
  placeholder?: string;
};

export default function TitleField({ defaultValue, placeholder }: TitleFieldProps) {
  const [length, setLength] = useState(defaultValue?.trim().length ?? 0);
  return (
    <FormField
      label="ชื่อเรื่อง"
      htmlFor="story-title"
      hint={
        <LengthHint id="story-title-hint" length={length} min={20} max={60}>
          แนะนำ 20–60 ตัวอักษร ใส่ชื่อสถานที่ช่วยให้คนค้นเจอ
        </LengthHint>
      }
    >
      <input
        id="story-title"
        name="title"
        defaultValue={defaultValue}
        placeholder={placeholder}
        required
        minLength={3}
        maxLength={200}
        aria-describedby="story-title-hint"
        onInput={(event) => setLength(event.currentTarget.value.trim().length)}
        className={`${inputClass} font-heading`}
      />
    </FormField>
  );
}
