"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronsLeft, ChevronsRight, Menu, Plus, X } from "lucide-react";
import { useSession } from "next-auth/react";
import AuthControls from "@/components/auth/AuthControls";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { name: "หน้าแรก", href: "/" },
  { name: "สำรวจ", href: "/categories" },
  { name: "สถานที่แนะนำ", href: "/admin" },
  { name: "เรื่องราวใหม่", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [hiddenOnPath, setHiddenOnPath] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState(false);
  const { data: session, status } = useSession();
  const isHome = pathname === "/";
  const isStory = pathname === "/story" || pathname.startsWith("/story/");
  const navigationExpanded = desktopExpanded;
  const isHidden = isStory && hiddenOnPath === pathname && !isMenuOpen;

  useEffect(() => {
    if (!isStory) return;
    let previousY = Math.max(0, window.scrollY);
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const currentY = Math.max(0, window.scrollY);
        const delta = currentY - previousY;
        if (currentY <= 80) {
          setHiddenOnPath(null);
          previousY = currentY;
          return;
        }
        // Ignore tiny movements so touch scrolling does not flicker the navbar.
        if (Math.abs(delta) < 6) return;
        const hasFocus = headerRef.current?.contains(document.activeElement);
        setHiddenOnPath(delta > 0 && !hasFocus ? pathname : null);
        previousY = currentY;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [isStory, pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

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
            "liquid-glass min-w-0 overflow-hidden rounded-[1.85rem] p-1 transition-[flex-grow] duration-200 motion-reduce:transition-none",
            navigationExpanded ? "flex-1" : "shrink-0"
          )}
          onKeyDown={(event) => {
            if (event.key === "Escape") setDesktopExpanded(false);
          }}
        >
          <div className="flex h-12 items-center gap-2 px-2">
            <Link
              href="/"
              onClick={() => setDesktopExpanded(false)}
              className="hover:bg-foreground/5 flex shrink-0 items-center gap-2 rounded-full p-1 transition-colors"
              aria-label={siteConfig.name}
            >
              <Image
                src="/logo.png"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span
                className={cn(
                  "text-foreground text-sm font-semibold",
                  navigationExpanded ? "hidden 2xl:block" : "hidden"
                )}
              >
                {siteConfig.name}
              </span>
            </Link>
            <nav
              id="desktop-navigation"
              hidden={!navigationExpanded}
              className={cn(
                "min-w-0 flex-1 items-center justify-start gap-0.5 overflow-x-auto xl:justify-center",
                navigationExpanded ? "flex" : "hidden"
              )}
              aria-label="เมนูหลัก"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setDesktopExpanded(false)}
                  className={cn(
                    "text-muted-foreground hover:bg-foreground/5 hover:text-foreground shrink-0 rounded-full px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                    isActive(link.href) &&
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="ml-auto flex shrink-0 items-center gap-0.5">
              <div
                hidden={!navigationExpanded}
                className={navigationExpanded ? "block" : "hidden"}
              >
                <ThemeToggle />
              </div>
              <AuthControls variant="desktop" />
              <button
                type="button"
                onClick={() => setDesktopExpanded((expanded) => !expanded)}
                aria-expanded={navigationExpanded}
                aria-controls="desktop-navigation"
                aria-label={
                  navigationExpanded ? "ย่อเมนูนำทาง" : "ขยายเมนูนำทาง"
                }
                title={navigationExpanded ? "ย่อเมนู" : "ขยายเมนู"}
                className="bg-primary/10 text-primary hover:bg-primary/20 focus-visible:outline-primary inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2"
              >
                {navigationExpanded ? (
                  <ChevronsRight className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
        {!isStory &&
          pathname !== "/my-stories" &&
          status !== "loading" &&
          (session?.user && isHome ? (
            <button
              type="button"
              onClick={() => {
                setDesktopExpanded(false);
                window.dispatchEvent(new Event("story-composer-open"));
              }}
              className="bg-primary text-primary-foreground shadow-primary/25 focus-visible:outline-primary mt-1 inline-flex h-12 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-semibold shadow-lg transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <Plus className="h-4 w-4" />
              เขียนเรื่องราว
            </button>
          ) : (
            <Link
              href={
                session?.user
                  ? "/?compose=1"
                  : "/login?callbackUrl=%2F%3Fcompose%3D1"
              }
              className="bg-primary text-primary-foreground shadow-primary/25 focus-visible:outline-primary mt-1 inline-flex h-12 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-semibold shadow-lg transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <Plus className="h-4 w-4" />
              เขียนเรื่องราว
            </Link>
          ))}
      </div>
      <div className="liquid-glass pointer-events-auto w-full overflow-hidden rounded-[1.85rem] p-1 lg:hidden">
        <div className="flex h-12 items-center gap-1 px-1.5">
          <Link
            href="/"
            className="hover:bg-foreground/5 flex min-w-0 items-center gap-2 rounded-full py-0.5 pr-2.5 pl-0.5 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="bg-background/70 ring-foreground/8 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1">
              <Image
                src="/logo.png"
                alt=""
                width={36}
                height={36}
                priority
                className="h-8 w-8 object-contain"
              />
            </span>
            <span className="text-foreground hidden truncate text-[0.92rem] font-semibold tracking-tight sm:block">
              {siteConfig.name}
            </span>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-muted-foreground hover:bg-foreground/5 hover:text-foreground rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-all duration-200",
                  isActive(link.href) &&
                    "bg-primary text-primary-foreground shadow-primary/25 hover:bg-primary hover:text-primary-foreground shadow-sm"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            <ThemeToggle />
            <AuthControls variant="desktop" />

            <button
              type="button"
              className="icon-well inline-flex h-8 w-8 md:hidden"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "ปิดเมนู" : "เปิดเมนู"}
            >
              {isMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200 md:hidden",
            isMenuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="overflow-hidden">
            <nav className="flex flex-col gap-1 px-2 pt-1.5 pb-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "text-foreground hover:bg-foreground/5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive(link.href) && "bg-primary/12 text-primary"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <AuthControls
                variant="mobile"
                onNavigate={() => setIsMenuOpen(false)}
              />
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
