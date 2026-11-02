"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronsLeft, ChevronsRight, ChevronsUpDown, LogOut, UserCog } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { backofficeHref } from "@/config/backoffice";
import { cn } from "@/lib/utils";
import Avatar from "./Avatar";
import Tip from "./Tip";
import { adminFetch, adminKeys } from "./api";
import { formatCompact } from "./format";
import { isActive, navGroups } from "./nav";

export type ShellAdmin = { id: string; name: string; username: string | null; image: string | null };

export function useSidebarCounts() {
  return useQuery({
    queryKey: adminKeys.counts,
    queryFn: ({ signal }) => adminFetch<{ pending: number; openReports: number }>("/api/admin/counts", { signal }),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export async function logout() {
  try {
    await adminFetch("/api/admin/logout", { method: "POST", body: {} });
  } finally {
    window.location.assign(backofficeHref("/login"));
  }
}

export default function Sidebar({
  admin,
  collapsed = false,
  onToggle,
  onNavigate,
}: {
  admin: ShellAdmin;
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { data: counts } = useSidebarCounts();

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 shrink-0 items-center gap-3 px-4", collapsed && "justify-center px-0")}>
        <Link
          href={backofficeHref()}
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-2.5 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          aria-label="Backoffice — หน้าแรก"
        >
          <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-background ring-1 ring-gold/50">
            <Image src="/logo.png" alt="" width={32} height={32} className="size-7 object-contain" />
          </span>
          {collapsed ? null : (
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-heading text-sm font-semibold">Thailand Story Map</span>
              <span className="block text-xs text-gold-ink">Backoffice</span>
            </span>
          )}
        </Link>
      </div>

      <nav aria-label="เมนูหลัก" className="flex-1 overflow-y-auto px-3 py-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {collapsed ? (
              <div aria-hidden="true" className="mx-auto mb-2 h-px w-8 bg-border first:hidden" />
            ) : (
              <p className="px-3 pb-1.5 text-[0.7rem] font-medium tracking-wide text-muted-foreground">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const count = item.badge ? counts?.[item.badge] : undefined;
                const urgent = item.badge === "openReports" && (count ?? 0) > 0;
                const Icon = item.icon;
                const link = (
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    aria-label={collapsed ? `${item.label}${count ? ` (${count})` : ""}` : undefined}
                    className={cn(
                      "relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm outline-none transition-colors duration-150",
                      "text-muted-foreground hover:bg-foreground/5 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40",
                      active && "bg-foreground/6 font-medium text-foreground",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    {active ? (
                      <span aria-hidden="true" className="absolute top-2 bottom-2 left-0 w-0.5 rounded-full bg-gold" />
                    ) : null}
                    <Icon aria-hidden="true" className="size-[18px] shrink-0" strokeWidth={1.75} />
                    {collapsed ? null : <span className="min-w-0 flex-1 truncate">{item.label}</span>}
                    {count ? (
                      <span
                        className={cn(
                          "inline-grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[0.7rem] font-semibold tabular-nums",
                          urgent ? "bg-destructive text-destructive-foreground" : "bg-warning/15 text-warning",
                          collapsed && "absolute -top-0.5 right-1.5 h-4 min-w-4 px-1 text-[0.6rem]"
                        )}
                      >
                        {formatCompact(count)}
                      </span>
                    ) : null}
                  </Link>
                );
                return (
                  <li key={item.href}>
                    <Tip label={item.label} side="right" disabled={!collapsed}>
                      {link}
                    </Tip>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="เมนูบัญชีผู้ดูแล"
            className={cn(
              "flex w-full items-center gap-3 rounded-xl p-2 text-left outline-none transition-colors hover:bg-foreground/5 focus-visible:ring-3 focus-visible:ring-ring/40 data-popup-open:bg-foreground/5",
              collapsed && "justify-center"
            )}
          >
            <Avatar id={admin.id} name={admin.username ?? admin.name} image={admin.image} />
            {collapsed ? null : (
              <>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-sm font-medium">{admin.username ?? admin.name}</span>
                  <span className="block text-xs text-muted-foreground">ผู้ดูแลระบบ</span>
                </span>
                <ChevronsUpDown aria-hidden="true" className="size-4 text-muted-foreground" />
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56 rounded-xl p-1.5">
            <DropdownMenuLabel>{admin.username ?? admin.name}</DropdownMenuLabel>
            <DropdownMenuItem render={<Link href={backofficeHref("/account")} onClick={onNavigate} />}>
              <UserCog aria-hidden="true" />
              บัญชีของฉัน
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => void logout()}>
              <LogOut aria-hidden="true" />
              ออกจากระบบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "ขยายแถบเมนู" : "ย่อแถบเมนู"}
            aria-expanded={!collapsed}
            className={cn(
              "flex h-9 w-full items-center gap-2 rounded-xl px-3 text-xs text-muted-foreground outline-none transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40",
              collapsed && "justify-center px-0"
            )}
          >
            {collapsed ? (
              <ChevronsRight aria-hidden="true" className="size-4" />
            ) : (
              <>
                <ChevronsLeft aria-hidden="true" className="size-4" />
                ย่อเมนู
              </>
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
