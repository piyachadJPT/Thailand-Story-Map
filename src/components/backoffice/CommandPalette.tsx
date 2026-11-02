"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Command } from "cmdk";
import { CornerDownLeft, FileText, Loader2, Search, User } from "lucide-react";
import { StatusBadge, UserStatusBadge } from "@/components/ui/status-badge";
import { backofficeHref } from "@/config/backoffice";
import type { StoryStatus } from "@/models/enums";
import Avatar from "./Avatar";
import { adminFetch, adminKeys } from "./api";
import { navItems } from "./nav";
import { useDebouncedValue } from "./useUrlState";

type SearchResult = {
  stories: { id: string; title: string; status: StoryStatus }[];
  users: { id: string; name: string; email: string; image: string | null; status: string; role: string }[];
};

const itemClass =
  "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm outline-none data-[selected=true]:bg-foreground/6 data-[selected=true]:text-foreground";

/** ⌘K / Ctrl+K: jump to a page, or find a story or user. */
export default function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const q = useDebouncedValue(query.trim(), 250);
  const search = useQuery({
    queryKey: adminKeys.search(q),
    queryFn: ({ signal }) =>
      adminFetch<SearchResult>(`/api/admin/search?q=${encodeURIComponent(q)}`, { signal }),
    enabled: open && q.length > 0,
    staleTime: 30_000,
  });

  function go(href: string) {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  }

  const pages = navItems.filter((item) => !query.trim() || item.label.toLowerCase().includes(query.trim().toLowerCase()));
  const loading = search.isFetching && q.length > 0;
  const results = q.length > 0 ? search.data : undefined;

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setQuery("");
      }}
      label="ค้นหาและไปยังหน้า"
      shouldFilter={false}
      overlayClassName="fixed inset-0 z-50 bg-black/25 backdrop-blur-xs"
      contentClassName="fixed top-[12vh] left-1/2 z-50 w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-lift"
    >
      <div className="flex items-center gap-3 border-b border-border px-4">
        <Search aria-hidden="true" className="size-4 text-muted-foreground" />
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="ค้นหาเรื่อง ผู้ใช้ หรือไปยังหน้า…"
          className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
        />
        {loading ? <Loader2 aria-hidden="true" className="size-4 animate-spin text-muted-foreground" /> : null}
      </div>
      <Command.List className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
        <Command.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">
          {loading ? "กำลังค้นหา…" : q ? `ไม่พบผลลัพธ์สำหรับ “${q}”` : "พิมพ์เพื่อค้นหา"}
        </Command.Empty>
        {pages.length ? (
          <Command.Group heading="ไปยังหน้า" className={groupClass}>
            {pages.map((item) => (
              <Command.Item key={item.href} value={`page-${item.href}`} onSelect={() => go(item.href)} className={itemClass}>
                <item.icon aria-hidden="true" className="size-4 text-muted-foreground" strokeWidth={1.75} />
                <span className="flex-1">{item.label}</span>
                <CornerDownLeft aria-hidden="true" className="size-3.5 text-muted-foreground opacity-0 group-data-[selected=true]:opacity-100" />
              </Command.Item>
            ))}
          </Command.Group>
        ) : null}
        {results?.stories.length ? (
          <Command.Group heading="เรื่อง" className={groupClass}>
            {results.stories.map((story) => (
              <Command.Item
                key={story.id}
                value={`story-${story.id}`}
                onSelect={() => go(backofficeHref(`/stories/${story.id}`))}
                className={itemClass}
              >
                <FileText aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span className="min-w-0 flex-1 truncate">{story.title}</span>
                <StatusBadge status={story.status} className="h-6 px-2" />
              </Command.Item>
            ))}
          </Command.Group>
        ) : null}
        {results?.users.length ? (
          <Command.Group heading="ผู้ใช้" className={groupClass}>
            {results.users.map((user) => (
              <Command.Item
                key={user.id}
                value={`user-${user.id}`}
                onSelect={() => go(backofficeHref(`/users/${user.id}`))}
                className={itemClass}
              >
                {user.image ? (
                  <Avatar id={user.id} name={user.name} image={user.image} size="xs" />
                ) : (
                  <User aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{user.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                </span>
                <UserStatusBadge status={user.status} admin={user.role === "ADMIN"} className="h-6 px-2" />
              </Command.Item>
            ))}
          </Command.Group>
        ) : null}
      </Command.List>
      <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
        <span><Kbd>↑</Kbd> <Kbd>↓</Kbd> เลือก</span>
        <span><Kbd>Enter</Kbd> เปิด</span>
        <span><Kbd>Esc</Kbd> ปิด</span>
      </div>
    </Command.Dialog>
  );
}

const groupClass =
  "mb-1 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground";

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-grid h-5 min-w-5 place-items-center rounded-md border border-border bg-foreground/4 px-1 font-sans text-[0.7rem] font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}
