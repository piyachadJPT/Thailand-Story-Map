"use client";

import { Menu, X } from "lucide-react";
import AuthControls from "@/components/auth/AuthControls";
import { GoldDivider } from "@/components/ui/gold-divider";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import ThemeToggle from "../ThemeToggle";
import BrandMark from "./BrandMark";
import NavLinks from "./NavLinks";

type MobileMenuProps = {
  pathname: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Glass bar below lg: inline links on md, an expanding drawer on phones. */
export default function MobileMenu({
  pathname,
  open,
  onOpenChange,
}: MobileMenuProps) {
  const close = () => onOpenChange(false);

  return (
    <div
      className="liquid-glass pointer-events-auto w-full overflow-hidden rounded-panel p-1.5 lg:hidden"
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
    >
      <div className="flex h-12 items-center gap-1">
        <BrandMark
          onNavigate={close}
          priority
          nameClassName="hidden sm:block"
        />

        <NavLinks
          pathname={pathname}
          className="hidden flex-1 justify-center md:flex"
        />

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <ThemeToggle />
          <AuthControls variant="desktop" />
          <IconButton
            size="sm"
            className="md:hidden"
            onClick={() => onOpenChange(!open)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
          >
            {open ? <X /> : <Menu />}
          </IconButton>
        </div>
      </div>

      <div
        id="mobile-navigation"
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out md:hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <GoldDivider strength="subtle" className="mx-3 mt-1.5 w-auto" />
          <NavLinks
            pathname={pathname}
            layout="stacked"
            onNavigate={close}
            className="px-1 pt-2 pb-1"
          >
            <AuthControls variant="mobile" onNavigate={close} />
          </NavLinks>
        </div>
      </div>
    </div>
  );
}
