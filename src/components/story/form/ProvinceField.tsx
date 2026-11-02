"use client";

import { MapPin } from "lucide-react";
import FormField from "./FormField";
import StoryDropdown from "./StoryDropdown";
import type { FormOption } from "./types";

type ProvinceFieldProps = {
  options: FormOption[];
  value: string;
  onChange: (id: string) => void;
  /** Visible label; the two forms word it differently. */
  label?: string;
};

export default function ProvinceField({
  options,
  value,
  onChange,
  label = "จังหวัด",
}: ProvinceFieldProps) {
  return (
    <FormField label={label} htmlFor="story-province">
      <StoryDropdown
        id="story-province"
        label="จังหวัด"
        options={options}
        value={value}
        onChange={onChange}
        placeholder="เลือกจังหวัดที่เกิดเรื่องราว"
        searchPlaceholder="ค้นหาจังหวัด เช่น เชียงใหม่"
        icon={<MapPin className="size-4" />}
      />
      <input type="hidden" name="provinceId" value={value} />
      {options.length === 0 ? (
        <p className="mt-1.5 text-xs text-destructive">
          ยังไม่มีข้อมูลจังหวัด กรุณาติดต่อผู้ดูแลระบบ
        </p>
      ) : null}
    </FormField>
  );
}
