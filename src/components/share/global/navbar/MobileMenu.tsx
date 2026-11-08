"use client";

import AuthControls from "@/components/auth/AuthControls";
import { cn } from "@/lib/utils";
import NavLinks from "./NavLinks";

type MobileMenuProps = {
  pathname: string;
  open: boolean;
  onClose: () => void;
};

/** Phone menu: a drawer that slides open under the nav bar (hidden from md up). */
export default function MobileMenu({ pathname, open, onClose }: MobileMenuProps) {
  return (
    <>
      {/* Dims the page behind the open drawer; tapping it closes the menu. */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-x-0 top-(--nav-h) bottom-0 -z-10 bg-nav/45 transition-opacity duration-300 md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <div
        id="mobile-navigation"
        inert={!open}
        className={cn(
          "grid border-border bg-card text-card-foreground transition-[grid-template-rows] duration-300 ease-out md:hidden",
          open ? "grid-rows-[1fr] border-b" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <NavLinks
            pathname={pathname}
            layout="stacked"
            onNavigate={onClose}
            className="px-3 pt-3 pb-4"
          >
            <AuthControls variant="mobile" onNavigate={onClose} />
          </NavLinks>
        </div>
      </div>
    </>
  );
}
