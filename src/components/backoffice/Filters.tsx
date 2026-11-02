"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { adminFetch } from "./api";

const ALL = "__all";

/** Dropdown filter; the empty value means "all". */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  allLabel: string;
  className?: string;
}) {
  const items = [{ value: ALL, label: allLabel }, ...options];
  return (
    <Select
      items={items}
      value={value || ALL}
      onValueChange={(next) => onChange(next === ALL || next === null ? "" : String(next))}
    >
      <SelectTrigger aria-label={label} className={cn("h-10 min-w-36 rounded-full bg-card px-3.5", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-80 rounded-xl">
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value} className="py-1.5">
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function FilterToggle({
  pressed,
  onChange,
  children,
}: {
  pressed: boolean;
  onChange: (pressed: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onChange(!pressed)}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm outline-none transition-colors duration-150 hover:border-gold/60 focus-visible:ring-3 focus-visible:ring-ring/40 aria-pressed:border-gold aria-pressed:bg-gold/12"
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-4 place-items-center rounded border border-input",
          pressed && "border-gold bg-gold text-gold-foreground"
        )}
      >
        {pressed ? <span className="size-1.5 rounded-full bg-current" /> : null}
      </span>
      {children}
    </button>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <div className="relative w-full sm:w-72">
      <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-10 w-full rounded-full border border-input bg-card pr-9 pl-10 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="ล้างคำค้น"
          className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-foreground/6 hover:text-foreground"
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

export function ClearFilters({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <X aria-hidden="true" className="size-4" />
      ล้างตัวกรอง
    </button>
  );
}

type Option = { id: string; name: string; slug: string };

export function useStoryOptions() {
  return useQuery({
    queryKey: ["admin", "story-options"],
    queryFn: ({ signal }) =>
      adminFetch<{ categories: Option[]; provinces: Option[] }>("/api/stories/options", { signal }),
    staleTime: 10 * 60_000,
  });
}

/** Segmented tabs with a count beside each label. */
export function TabLabel({ label, count }: { label: string; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {label}
      {count !== undefined ? (
        <span className="rounded-full bg-current/10 px-1.5 text-[0.7rem] leading-5 tabular-nums">
          {count.toLocaleString("th-TH")}
        </span>
      ) : null}
    </span>
  );
}
