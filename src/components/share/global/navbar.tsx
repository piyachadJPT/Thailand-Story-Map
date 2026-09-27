"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MapPin, Menu, Sparkles, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "แผนที่", href: "/", icon: "🗺️" },
  { name: "สร้างเรื่อง", href: "/create", icon: "✍️" },
  { name: "แอดมิน", href: "/admin", icon: "⚙️" },
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
        "pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center px-3 sm:top-4",
        isHome && "lg:pl-[24.5rem]",
      )}
    >
      <div className="pointer-events-auto flex h-12 max-w-[calc(100vw-1.5rem)] items-center gap-1 rounded-full border border-white/70 bg-white/72 px-2 shadow-[0_10px_40px_-16px_rgba(49,24,90,0.45)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-zinc-900/70 dark:shadow-[0_10px_40px_-16px_rgba(0,0,0,0.7)]">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          onClick={() => setIsMenuOpen(false)}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-teal-500 text-white shadow-sm">
            <MapPin className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="hidden max-w-[10rem] truncate text-sm font-semibold tracking-tight text-zinc-900 sm:block dark:text-zinc-50">
            {siteConfig.name}
          </span>
        </Link>

        <span className="mx-1 hidden h-5 w-px bg-zinc-200 md:block dark:bg-white/10" />

        <nav className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white",
                isActive(link.href) &&
                  "bg-violet-500/10 text-violet-800 dark:bg-white/10 dark:text-white",
              )}
            >
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true">{link.icon}</span>
                {link.name}
              </span>
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="ml-1 hidden items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-1.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.98] md:inline-flex dark:bg-white dark:text-zinc-900"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Sign In
        </button>

        <button
          type="button"
          className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 hover:bg-black/5 md:hidden dark:text-zinc-300 dark:hover:bg-white/10"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "ปิดเมนู" : "เปิดเมนู"}
        >
          {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="pointer-events-auto mt-2 w-[min(100%,18rem)] rounded-2xl border border-white/70 bg-white/80 p-2 shadow-[0_16px_40px_-20px_rgba(49,24,90,0.5)] backdrop-blur-2xl md:hidden dark:border-white/10 dark:bg-zinc-900/85">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:text-zinc-200 dark:hover:bg-white/10",
                  isActive(link.href) && "bg-violet-500/10 text-violet-800 dark:text-white",
                )}
              >
                <span aria-hidden="true">{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Sign In
          </button>
        </div>
      )}
    </header>
  );
}
