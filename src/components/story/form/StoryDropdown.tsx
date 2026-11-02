"use client";

import { useState, type ReactNode } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string };

type StoryDropdownProps = {
  id: string;
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  icon: ReactNode;
};

/** Searchable single-select (Base UI Combobox) used by category and province. */
export default function StoryDropdown({
  id,
  label,
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  icon,
}: StoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === value) ?? null;

  return (
    <Combobox.Root
      items={options}
      value={selected}
      onValueChange={(option) => onChange(option?.id ?? "")}
      itemToStringLabel={(option) => option.name}
      itemToStringValue={(option) => option.id}
      isItemEqualToValue={(option, current) => option.id === current.id}
      open={open}
      onOpenChange={setOpen}
      autoHighlight
    >
      <Combobox.Trigger
        id={id}
        aria-label={label}
        disabled={options.length === 0}
        className="liquid-field flex min-h-12 w-full items-center gap-3 rounded-2xl px-2 text-left text-base text-foreground transition-colors outline-none hover:border-gold/50 disabled:opacity-50 sm:text-sm"
      >
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold-ink"
        >
          {icon}
        </span>
        <span className={cn("min-w-0 flex-1 truncate", !selected && "text-muted-foreground")}>
          <Combobox.Value placeholder={placeholder} />
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "mr-2 size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
            open && "rotate-180"
          )}
        />
      </Combobox.Trigger>
      <Combobox.Portal>
        <Combobox.Positioner sideOffset={8} align="start" className="z-80 outline-none">
          <Combobox.Popup
            className="w-(--anchor-width) max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-lift outline-none"
            onKeyDown={(event) => {
              if (event.key === "Escape") event.stopPropagation();
            }}
          >
            <div className="relative border-b border-border pb-2">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-gold-ink"
              />
              <Combobox.Input
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                className="liquid-field h-11 w-full rounded-full pr-3 pl-10 text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-sm"
              />
            </div>
            <Combobox.Empty className="px-3 py-6 text-center text-sm text-muted-foreground empty:hidden">
              ไม่พบรายการ ลองพิมพ์ชื่อใหม่
            </Combobox.Empty>
            <Combobox.List className="max-h-[min(16rem,calc(var(--available-height)-7rem))] scroll-py-1 space-y-1 overflow-y-auto overscroll-contain py-2">
              {(option: Option) => (
                <Combobox.Item
                  key={option.id}
                  value={option}
                  className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-foreground transition-colors outline-none data-highlighted:bg-accent data-selected:font-medium"
                >
                  <span className="min-w-0 flex-1">{option.name}</span>
                  <Combobox.ItemIndicator className="grid size-5 shrink-0 place-items-center text-gold-ink">
                    <Check aria-hidden="true" className="size-4" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
            <p className="border-t border-border px-3 pt-2 pb-1 text-xs text-muted-foreground">
              {options.length} รายการให้เลือก
            </p>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
