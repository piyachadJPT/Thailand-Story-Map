"use client";

import { Tooltip } from "@base-ui/react/tooltip";

/** Small tooltip that shows on hover and keyboard focus. */
export default function Tip({
  label,
  children,
  side = "top",
  disabled,
}: {
  label: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  disabled?: boolean;
}) {
  if (disabled) return children;
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={children} delay={250} />
      <Tooltip.Portal>
        <Tooltip.Positioner side={side} sideOffset={8} className="z-60">
          <Tooltip.Popup className="rounded-lg bg-primary px-2.5 py-1.5 text-xs leading-snug text-primary-foreground shadow-soft transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0">
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export const TipProvider = Tooltip.Provider;
