"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const listVariants = cva(
  "relative inline-flex w-full items-center gap-1 rounded-full border border-border bg-foreground/4 p-1",
  {
    variants: {
      size: {
        sm: "h-10 text-xs",
        md: "h-12 text-sm",
      },
      /** Tabs keep their natural width and the row scrolls sideways. */
      scrollable: {
        true: "overflow-x-auto [scrollbar-width:none] [&>[role=tab]]:flex-none [&>[role=tab]]:px-4",
        false: "",
      },
    },
    defaultVariants: { size: "md", scrollable: false },
  }
);

const tabClasses = cn(
  "relative z-10 inline-flex h-full min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-3 font-medium whitespace-nowrap text-muted-foreground",
  "transition-colors duration-200 hover:text-foreground data-active:text-primary-foreground",
  "outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
  "disabled:pointer-events-none disabled:opacity-50",
  "[&_svg]:size-4 [&_svg]:shrink-0"
);

type SegmentedTabItem<T extends string> = {
  value: T;
  label: React.ReactNode;
  icon?: LucideIcon;
  disabled?: boolean;
};

type SegmentedTabsProps<T extends string> = VariantProps<typeof listVariants> & {
  items: readonly SegmentedTabItem<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  /** Names the tab list for screen readers. */
  "aria-label": string;
  className?: string;
  listClassName?: string;
  /** Optional panels, e.g. <TabsContent value="…"> from ui/tabs. */
  children?: React.ReactNode;
};

/**
 * Pill-shaped tab switcher with a sliding ink indicator.
 * Arrow keys move between tabs (Base UI Tabs).
 */
function SegmentedTabs<T extends string>({
  items,
  value,
  defaultValue,
  onValueChange,
  size,
  scrollable,
  className,
  listClassName,
  children,
  "aria-label": ariaLabel,
}: SegmentedTabsProps<T>) {
  return (
    <TabsPrimitive.Root
      data-slot="segmented-tabs"
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onValueChange?.(next as T)}
      className={cn("flex flex-col gap-3", className)}
    >
      <TabsPrimitive.List
        aria-label={ariaLabel}
        className={cn(listVariants({ size, scrollable }), listClassName)}
      >
        {items.map(({ value: itemValue, label, icon: Icon, disabled }) => (
          <TabsPrimitive.Tab
            key={itemValue}
            value={itemValue}
            disabled={disabled}
            className={tabClasses}
          >
            {Icon ? <Icon aria-hidden="true" /> : null}
            <span className="truncate">{label}</span>
          </TabsPrimitive.Tab>
        ))}
        <TabsPrimitive.Indicator
          renderBeforeHydration
          className={cn(
            "absolute top-1/2 left-0 z-0 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-1/2 rounded-full bg-primary",
            "transition-[translate,width] duration-300 ease-out"
          )}
        />
      </TabsPrimitive.List>
      {children}
    </TabsPrimitive.Root>
  );
}

export { SegmentedTabs, type SegmentedTabItem, type SegmentedTabsProps };
