"use client";

import type { FormEvent, Ref } from "react";
import { Search } from "lucide-react";
import type { SearchMode } from "./useStorySearch";

const placeholders: Record<SearchMode, string> = {
  stories: "ชื่อเรื่อง เนื้อหา แท็ก หรือผู้เขียน",
  places: "สถานที่ ถนน ซอย ที่อยู่ หรือพิกัด",
  all: "ค้นหาสถานที่ หรือเรื่องราวที่อยากอ่าน",
};

type SearchInputProps = {
  mode: SearchMode;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  ref?: Ref<HTMLInputElement>;
};

export default function SearchInput({
  mode,
  value,
  onChange,
  onSubmit,
  ref,
}: SearchInputProps) {
  return (
    <form role="search" onSubmit={onSubmit}>
      <label className="relative block">
        <span className="sr-only">ค้นหาสถานที่และเรื่องราว</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-gold-ink"
        />
        <input
          ref={ref}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={100}
          placeholder={placeholders[mode]}
          className="liquid-field h-12 w-full rounded-full pr-4 pl-11 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>
    </form>
  );
}
