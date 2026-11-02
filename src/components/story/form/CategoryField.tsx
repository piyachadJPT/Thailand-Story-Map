"use client";

import { ListFilter } from "lucide-react";
import FormField from "./FormField";
import StoryDropdown from "./StoryDropdown";
import type { FormOption } from "./types";

type CategoryFieldProps = {
  options: FormOption[];
  value: string;
  onChange: (id: string) => void;
};

export default function CategoryField({ options, value, onChange }: CategoryFieldProps) {
  return (
    <FormField label="ประเภทเรื่องราว" htmlFor="story-category">
      <StoryDropdown
        id="story-category"
        label="ประเภทเรื่องราว"
        options={options}
        value={value}
        onChange={onChange}
        placeholder="เลือกประเภทเรื่องราว"
        searchPlaceholder="ค้นหาประเภทเรื่องราว"
        icon={<ListFilter className="size-4" />}
      />
      <input type="hidden" name="categoryId" value={value} />
    </FormField>
  );
}
