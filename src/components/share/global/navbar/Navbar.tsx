"use client";

import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import AuthControls from "@/components/auth/AuthControls";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import ThemeToggle from "../ThemeToggle";
import BrandMark from "./BrandMark";
import MobileMenu from "./MobileMenu";
import NavLinks from "./NavLinks";
import WriteStoryButton from "./WriteStoryButton";
import { useHideOnScroll } from "./useHideOnScroll";

/**
 * Full-width top bar (indigo in light, lacquer in dark) with a gold rule.
 * Height is --nav-h; pages and map panels offset themselves by it.
 */
export default function Navbar() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isHome = pathname === "/";
  const isStory = pathname === "/story" || pathname.startsWith("/story/");
  const scrolledAway = useHideOnScroll(isStory, pathname, headerRef);
  const isHidden = scrolledAway && !isMenuOpen;
  const showWriteButton = !isStory && pathname !== "/my-stories";
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      ref={headerRef}
      inert={isHidden}
      onKeyDown={(event) => {
        if (event.key === "Escape") closeMenu();
      }}
      className={cn(
        "fixed inset-x-0 top-0 z-50",
        isStory && "transition-transform duration-300 ease-out motion-reduce:transition-none",
        isHidden && "-translate-y-full"
      )}
    >
      <div className="border-b-[3px] border-nav-rule bg-nav text-nav-foreground">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-2 px-4 lg:gap-4 lg:px-6">
          <BrandMark onNavigate={closeMenu} priority />

          <NavLinks
            pathname={pathname}
            className="hidden min-w-0 flex-1 justify-center overflow-x-auto md:flex lg:justify-start"
          />

          <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0">
            <ThemeToggle />
            <AuthControls variant="desktop" />
            {showWriteButton ? (
              <WriteStoryButton isHome={isHome} className="ml-2 hidden lg:inline-flex" />
            ) : null}
            <IconButton
              size="sm"
              className="text-nav-foreground hover:bg-nav-foreground/10 hover:text-nav-foreground aria-expanded:bg-nav-foreground/10 focus-visible:ring-nav-rule md:hidden"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMenuOpen ? "ปิดเมนู" : "เปิดเมนู"}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </IconButton>
          </div>
        </div>
      </div>

      <MobileMenu pathname={pathname} open={isMenuOpen} onClose={closeMenu} />
    </header>
  );
}
