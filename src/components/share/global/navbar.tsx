"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
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
      <div className="liquid-glass pointer-events-auto w-full overflow-hidden rounded-[1.85rem] p-1">
        <div className="flex h-12 items-center gap-1 px-1.5">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 rounded-full py-0.5 pr-2.5 pl-0.5 transition-colors hover:bg-foreground/5"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background/70 ring-1 ring-foreground/8">
              <Image
                src="/logo.png"
                alt=""
                width={36}
                height={36}
                priority
                className="h-8 w-8 object-contain"
              />
            </span>
            <span className="hidden truncate text-[0.92rem] font-semibold tracking-tight text-foreground sm:block">
              {siteConfig.name}
            </span>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-all duration-200 hover:bg-foreground/5 hover:text-foreground",
                  isActive(link.href) &&
                    "bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary hover:text-primary-foreground",
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
            <nav className="flex flex-col gap-1 px-2 pt-1.5 pb-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5",
                    isActive(link.href) && "bg-primary/12 text-primary",
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <AuthControls variant="mobile" />
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
