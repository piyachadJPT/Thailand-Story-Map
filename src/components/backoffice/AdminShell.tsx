"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ChevronRight, ExternalLink, Menu, Search, X } from "lucide-react";
import ThemeToggle from "@/components/share/global/ThemeToggle";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import CommandPalette, { Kbd } from "./CommandPalette";
import Sidebar, { type ShellAdmin } from "./Sidebar";
import { TipProvider } from "./Tip";
import { breadcrumbFor } from "./nav";
import { useSidebarCollapsed } from "./useSidebarCollapsed";

const AdminContext = createContext<ShellAdmin | null>(null);

/** The signed-in admin (available anywhere inside the shell). */
export function useAdmin() {
  const admin = useContext(AdminContext);
  if (!admin) throw new Error("useAdmin must be used inside AdminShell");
  return admin;
}

/** Backoffice frame: sidebar (rail or drawer), sticky top bar, ⌘K palette. */
export default function AdminShell({
  admin,
  children,
}: {
  admin: ShellAdmin;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useSidebarCollapsed();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const crumbs = breadcrumbFor(pathname);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <AdminContext.Provider value={admin}>
      <TipProvider>
        <div className="bg-background min-h-dvh">
          <a
            href="#backoffice-main"
            className="bg-primary text-primary-foreground sr-only z-50 rounded-full px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            ข้ามไปยังเนื้อหา
          </a>

          <aside
            className={cn(
              "border-border bg-card fixed inset-y-0 left-0 z-30 hidden border-r transition-[width] duration-200 ease-out lg:block",
              collapsed ? "w-[72px]" : "w-64"
            )}
          >
            <Sidebar
              admin={admin}
              collapsed={collapsed}
              onToggle={() => setCollapsed(!collapsed)}
            />
          </aside>

          <DialogPrimitive.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DialogPrimitive.Portal>
              <DialogPrimitive.Backdrop className="fixed inset-0 z-40 bg-black/30 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 lg:hidden" />
              <DialogPrimitive.Popup
                aria-label="เมนู"
                className="border-border bg-card shadow-lift fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r transition-transform duration-200 ease-out outline-none data-ending-style:-translate-x-full data-starting-style:-translate-x-full lg:hidden"
              >
                <DialogPrimitive.Close
                  render={
                    <IconButton
                      aria-label="ปิดเมนู"
                      size="sm"
                      className="absolute top-3.5 right-3 z-10"
                    />
                  }
                >
                  <X />
                </DialogPrimitive.Close>
                <Sidebar
                  admin={admin}
                  onNavigate={() => setDrawerOpen(false)}
                />
              </DialogPrimitive.Popup>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>

          <div
            className={cn(
              "transition-[padding] duration-200 ease-out",
              collapsed ? "lg:pl-[72px]" : "lg:pl-64"
            )}
          >
            <header className="border-border bg-background/80 sticky top-0 z-20 flex h-16 items-center gap-2 border-b px-4 backdrop-blur-md sm:px-6">
              <IconButton
                aria-label="เปิดเมนู"
                size="sm"
                className="-ml-1 lg:hidden"
                onClick={() => setDrawerOpen(true)}
              >
                <Menu />
              </IconButton>

              <nav aria-label="breadcrumb" className="min-w-0 flex-1">
                <ol className="hidden items-center gap-1.5 text-sm md:flex">
                  {crumbs.map((crumb, index) => (
                    <li
                      key={index}
                      className="flex min-w-0 items-center gap-1.5"
                    >
                      {index > 0 ? (
                        <ChevronRight
                          aria-hidden="true"
                          className="text-muted-foreground size-3.5"
                        />
                      ) : null}
                      {crumb.href ? (
                        <Link
                          href={crumb.href}
                          className="text-muted-foreground hover:text-foreground truncate"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span
                          aria-current="page"
                          className="text-foreground truncate font-medium"
                        >
                          {crumb.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
                <p className="truncate text-sm font-medium md:hidden">
                  {crumbs.at(-1)?.label}
                </p>
              </nav>

              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="border-border bg-card text-muted-foreground hover:border-gold/60 hover:text-foreground focus-visible:ring-ring/40 flex h-9 items-center gap-2 rounded-full border px-3 text-sm transition-colors outline-none focus-visible:ring-3 sm:w-60"
                aria-label="ค้นหา (Ctrl+K)"
              >
                <Search aria-hidden="true" className="size-4" />
                <span className="hidden flex-1 text-left sm:inline">
                  ค้นหา…
                </span>
                <span className="hidden sm:inline">
                  <Kbd>⌘K</Kbd>
                </span>
              </button>
              <ThemeToggle />
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:bg-foreground/6 hover:text-foreground focus-visible:ring-ring/40 hidden h-9 items-center gap-1.5 rounded-full px-3 text-sm transition-colors outline-none focus-visible:ring-3 sm:inline-flex"
              >
                <ExternalLink aria-hidden="true" className="size-4" />
                เปิดเว็บไซต์
              </a>
            </header>

            <main
              id="backoffice-main"
              className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
            >
              {children}
            </main>
          </div>

          <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        </div>
      </TipProvider>
    </AdminContext.Provider>
  );
}
