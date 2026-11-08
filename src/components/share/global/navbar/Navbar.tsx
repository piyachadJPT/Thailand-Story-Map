"use client";

import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import AuthControls from "@/components/auth/AuthControls";
import { GoldDivider } from "@/components/ui/gold-divider";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import ThemeToggle from "../ThemeToggle";
import BrandMark from "./BrandMark";
import MobileMenu from "./MobileMenu";
import NavLinks from "./NavLinks";
import WriteStoryButton from "./WriteStoryButton";
import { useHideOnScroll } from "./useHideOnScroll";

export default function Navbar() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isHome = pathname === "/";
  const isStory = pathname === "/story" || pathname.startsWith("/story/");
  const scrolledAway = useHideOnScroll(isStory, pathname, headerRef);
  const isHidden = scrolledAway && !isMenuOpen;
  const showWriteButton = !isStory && pathname !== "/my-stories";
  const collapse = () => setExpanded(false);

  return (
    <header
      ref={headerRef}
      inert={isHidden}
      className={cn(
        "pointer-events-none fixed top-4 right-4 left-4 z-50",
        isHome && "lg:left-[24rem]",
        isStory &&
          "transition-transform duration-300 ease-out motion-reduce:transition-none",
        isHidden && "-translate-y-[calc(100%+2rem)]"
      )}
    >
      <div className="pointer-events-auto hidden items-start justify-end gap-3 lg:flex">
        <div
          className={cn(
            "liquid-glass min-w-0 flex-1 overflow-hidden rounded-full p-1.5",
            // Over the map, the bar starts compact below xl so the map stays visible.
            isHome && !expanded && "max-xl:flex-none max-xl:shrink-0"
          )}
          onKeyDown={(event) => {
            if (event.key === "Escape") collapse();
          }}
        >
          <div className="flex h-11 items-center gap-2">
            <BrandMark
              onNavigate={collapse}
              nameClassName={cn("hidden", (!isHome || expanded) && "xl:block")}
            />

            <GoldDivider
              orientation="vertical"
              className={cn(isHome && !expanded && "max-xl:hidden")}
            />

            <NavLinks
              id="desktop-navigation"
              pathname={pathname}
              onNavigate={collapse}
              className={cn(
                "flex-1 justify-start overflow-x-auto",
                isHome && !expanded && "max-xl:hidden"
              )}
            />

            <div className="ml-auto flex shrink-0 items-center gap-1">
              <div className={cn(isHome && !expanded && "max-xl:hidden")}>
                <ThemeToggle />
              </div>
              <AuthControls variant="desktop" />
              {isHome ? (
                <IconButton
                  size="sm"
                  variant="secondary"
                  className="xl:hidden"
                  onClick={() => setExpanded((value) => !value)}
                  aria-expanded={expanded}
                  aria-controls="desktop-navigation"
                  aria-label={expanded ? "ย่อเมนูนำทาง" : "ขยายเมนูนำทาง"}
                  title={expanded ? "ย่อเมนู" : "ขยายเมนู"}
                >
                  {expanded ? <ChevronsRight /> : <ChevronsLeft />}
                </IconButton>
              ) : null}
            </div>
          </div>
        </div>

        {showWriteButton ? (
          <WriteStoryButton isHome={isHome} onOpen={collapse} />
        ) : null}
      </div>

      <MobileMenu
        pathname={pathname}
        open={isMenuOpen}
        onOpenChange={setIsMenuOpen}
      />
    </header>
  );
}
