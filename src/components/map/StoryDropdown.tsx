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
        className="liquid-field text-foreground focus-visible:ring-primary/50 hover:bg-primary/5 flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-base transition-colors outline-none focus-visible:ring-2 disabled:opacity-50 sm:text-sm"
      >
        <span
          className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          aria-hidden="true"
        >
          {icon}
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            !selected && "text-muted-foreground"
          )}
        >
          <Combobox.Value placeholder={placeholder} />
        </span>
        <ChevronDown
          className={cn(
            "text-muted-foreground h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </Combobox.Trigger>
      <Combobox.Portal>
        <Combobox.Positioner
          sideOffset={8}
          align="start"
          className="z-[80] outline-none"
        >
          <Combobox.Popup
            className="border-border bg-popover text-popover-foreground w-[var(--anchor-width)] max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border p-2 shadow-xl shadow-black/10 outline-none"
            onKeyDown={(event) => {
              if (event.key === "Escape") event.stopPropagation();
            }}
          >
            <div className="border-border relative border-b pb-2">
              <Search
                className="text-muted-foreground pointer-events-none absolute top-3.5 left-3 h-4 w-4"
                aria-hidden="true"
              />
              <Combobox.Input
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                className="bg-primary/5 text-foreground placeholder:text-muted-foreground focus:ring-primary/30 h-11 w-full rounded-xl pr-3 pl-9 text-base outline-none focus:ring-2 sm:text-sm"
              />
            </div>
            <Combobox.Empty className="text-muted-foreground px-3 py-6 text-center text-sm empty:hidden">
              ไม่พบรายการ ลองพิมพ์ชื่อใหม่
            </Combobox.Empty>
            <Combobox.List className="max-h-[min(16rem,calc(var(--available-height)-7rem))] scroll-py-1 space-y-1 overflow-y-auto overscroll-contain py-2">
              {(option: Option) => (
                <Combobox.Item
                  key={option.id}
                  value={option}
                  className="text-foreground data-highlighted:bg-primary/10 data-highlighted:text-primary data-selected:bg-primary/10 flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition-colors outline-none"
                >
                  <span className="min-w-0 flex-1">{option.name}</span>
                  <Combobox.ItemIndicator className="text-primary flex h-5 w-5 shrink-0 items-center justify-center">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
            <p className="border-border text-muted-foreground border-t px-3 pt-2 pb-1 text-xs">
              {options.length} รายการให้เลือก
            </p>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
