"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MapPin, Menu, Sparkles, X } from "lucide-react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isHome = pathname === "/";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "pointer-events-none fixed top-4 right-4 left-4 z-50",
        isHome && "lg:left-[24rem]",
      )}
    >
      <div className="pointer-events-auto w-full overflow-hidden rounded-3xl p-1 border border-border bg-card/80 shadow-[0_10px_40px_-16px_rgba(10,15,28,0.16)] backdrop-blur-2xl backdrop-saturate-150 dark:shadow-[0_10px_40px_-16px_rgba(0,0,0,0.55)]">
        <div className="flex h-12 items-center gap-1 px-2">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <MapPin className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="hidden truncate text-sm font-semibold tracking-tight text-foreground sm:block">
              {siteConfig.name}
            </span>
          </Link>

          <nav className="hidden min-w-0 flex-1 justify-center items-center gap-0.5 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground",
                  isActive(link.href) && "bg-primary/10 text-primary",
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <ThemeToggle />

            <button
              type="button"
              className="hidden items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-sm font-semibold text-background transition-transform hover:scale-[1.03] active:scale-[0.98] md:inline-flex"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Sign In
            </button>

            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 md:hidden"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "ปิดเมนู" : "เปิดเมนู"}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200 md:hidden",
            isMenuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <nav className="flex flex-col gap-1 px-2 pt-2 pb-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-foreground/5",
                    isActive(link.href) && "bg-primary/10 text-primary",
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <button
                type="button"
                className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl bg-foreground px-3 py-2.5 text-sm font-semibold text-background"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Sign In
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
