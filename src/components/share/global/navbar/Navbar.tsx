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
            "liquid-glass min-w-0 overflow-hidden rounded-full p-1.5 transition-[flex-grow] duration-300 ease-out motion-reduce:transition-none",
            expanded ? "flex-1" : "shrink-0"
          )}
          onKeyDown={(event) => {
            if (event.key === "Escape") collapse();
          }}
        >
          <div className="flex h-11 items-center gap-2">
            <BrandMark
              onNavigate={collapse}
              nameClassName={expanded ? "hidden 2xl:block" : "hidden"}
            />

            {expanded ? <GoldDivider orientation="vertical" /> : null}

            <NavLinks
              id="desktop-navigation"
              pathname={pathname}
              hidden={!expanded}
              onNavigate={collapse}
              className={cn(
                "flex-1 justify-start overflow-x-auto xl:justify-center",
                !expanded && "hidden"
              )}
            />

            <div className="ml-auto flex shrink-0 items-center gap-1">
              <div hidden={!expanded} className={expanded ? "block" : "hidden"}>
                <ThemeToggle />
              </div>
              <AuthControls variant="desktop" />
              <IconButton
                size="sm"
                variant="secondary"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
                aria-controls="desktop-navigation"
                aria-label={expanded ? "ย่อเมนูนำทาง" : "ขยายเมนูนำทาง"}
                title={expanded ? "ย่อเมนู" : "ขยายเมนู"}
              >
                {expanded ? <ChevronsRight /> : <ChevronsLeft />}
              </IconButton>
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
