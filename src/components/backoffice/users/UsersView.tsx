"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, ShieldBan, ShieldCheck, UserRound, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { UserStatusBadge } from "@/components/ui/status-badge";
import { backofficeHref } from "@/config/backoffice";
import Link from "next/link";
import Avatar from "../Avatar";
import DataTable, { Pagination, type Column } from "../DataTable";
import { ClearFilters, FilterSelect, FilterToggle, SearchField, TabLabel } from "../Filters";
import PageHeader from "../PageHeader";
import RelativeTime from "../RelativeTime";
import { EmptyBlock, ErrorCard, NoResults } from "../States";
import { adminFetch, adminKeys, queryString } from "../api";
import { formatCompact, formatNumber } from "../format";
import { useUrlSearch, useUrlState } from "../useUrlState";
import { BanDialog, UnbanDialog } from "./BanDialogs";
import LoginMethod from "./LoginMethod";
import type { UserList, UserRow } from "./types";

const PAGE_SIZE = 20;
const tabs = ["all", "active", "banned", "admin"] as const;
type Tab = (typeof tabs)[number];
const sorts = [
  { value: "recent", label: "สมัครล่าสุด" },
  { value: "stories", label: "เขียนเรื่องมากสุด" },
  { value: "reports", label: "ถูกรายงานมากสุด" },
  { value: "name", label: "ชื่อ ก–ฮ" },
];

export default function UsersView() {
  const { get, set, page } = useUrlState();
  const [search, setSearch] = useUrlSearch("q");
  const tab = (tabs.includes(get("tab") as Tab) ? get("tab") : "all") as Tab;
  const filters = {
    tab,
    q: get("q"),
    hasReports: get("hasReports") === "1",
    noStories: get("noStories") === "1",
    sort: sorts.some((sort) => sort.value === get("sort")) ? get("sort") : "recent",
    page,
    pageSize: PAGE_SIZE,
  };
  const users = useQuery({
    queryKey: adminKeys.users(filters),
    queryFn: ({ signal }) => adminFetch<UserList>(`/api/admin/users${queryString(filters)}`, { signal }),
    placeholderData: (previous) => previous,
  });
  const filtered = Boolean(filters.q || filters.hasReports || filters.noStories);
  const summary = users.data?.summary;
  const counts = users.data?.counts;

  function clearFilters() {
    setSearch("");
    set({ q: null, hasReports: null, noStories: null });
  }

  const columns: Column<UserRow>[] = [
    {
      key: "user",
      header: "ผู้ใช้",
      cell: (user) => (
        <span className="flex min-w-0 items-center gap-3">
          <Avatar id={user.id} name={user.name} image={user.image} size="md" />
          <span className="min-w-0">
            <span className="block max-w-60 truncate font-medium">{user.name}</span>
            <span className="block max-w-60 truncate text-xs text-muted-foreground">{user.email}</span>
          </span>
        </span>
      ),
    },
    { key: "method", header: "ช่องทางล็อกอิน", cardLabel: "ล็อกอิน", cell: (user) => <LoginMethod adminAccount={user.isAdminAccount} /> },
    {
      key: "status",
      header: "สถานะ",
      cardLabel: "สถานะ",
      cell: (user) => <UserStatusBadge status={user.status} admin={user.role === "ADMIN"} />,
    },
    {
      key: "stories",
      header: "เรื่อง",
      align: "right",
      cardLabel: "เรื่อง (เผยแพร่/ทั้งหมด)",
      sort: [{ value: "stories", direction: "desc" }],
      cell: (user) => (
        <span className="whitespace-nowrap">
          {formatNumber(user.publishedStories)}
          <span className="text-muted-foreground"> / {formatNumber(user.totalStories)}</span>
        </span>
      ),
    },
    {
      key: "reports",
      header: "ถูกรายงาน",
      align: "right",
      cardLabel: "ถูกรายงาน",
      sort: [{ value: "reports", direction: "desc" }],
      cell: (user) => (
        <span className={user.openReports > 0 ? "font-medium text-destructive" : "text-muted-foreground"}>
          {formatNumber(user.openReports)}
        </span>
      ),
    },
    {
      key: "views",
      header: "ยอดอ่านรวม",
      align: "right",
      cardLabel: "ยอดอ่านรวม",
      cell: (user) => formatCompact(user.totalViews),
    },
    {
      key: "joined",
      header: "สมัครเมื่อ",
      cardLabel: "สมัครเมื่อ",
      sort: [{ value: "recent", direction: "desc" }],
      cell: (user) => <RelativeTime value={user.createdAt} className="text-sm whitespace-nowrap text-muted-foreground" />,
    },
    {
      key: "actions",
      header: <span className="sr-only">การจัดการ</span>,
      className: "w-12",
      cell: (user) => <UserActionsMenu user={user} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="ผู้ใช้" description="ผู้เขียนและผู้อ่านที่สมัครด้วย Google รวมถึงบัญชีแอดมิน">
        <div className="space-y-4">
          <dl className="grid grid-cols-3 gap-3 sm:max-w-xl">
            <Stat label="ทั้งหมด" value={summary?.all} />
            <Stat label="ใหม่ใน 30 วัน" value={summary?.newUsers} />
            <Stat label="ถูกระงับ" value={summary?.banned} danger />
          </dl>
          <SegmentedTabs
            aria-label="กลุ่มผู้ใช้"
            size="sm"
            scrollable
            className="max-w-full sm:w-fit"
            value={tab}
            onValueChange={(value) => set({ tab: value === "all" ? null : value })}
            items={[
              { value: "all", label: <TabLabel label="ทั้งหมด" count={counts?.all} /> },
              { value: "active", label: <TabLabel label="ใช้งานปกติ" count={counts?.active} /> },
              { value: "banned", label: <TabLabel label="ถูกระงับ" count={counts?.banned} /> },
              { value: "admin", label: <TabLabel label="แอดมิน" count={counts?.admin} /> },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <SearchField value={search} onChange={setSearch} label="ค้นหาผู้ใช้" placeholder="ชื่อหรืออีเมล" />
            <FilterToggle pressed={filters.hasReports} onChange={(value) => set({ hasReports: value })}>
              มีเรื่องที่ถูกรายงาน
            </FilterToggle>
            <FilterToggle pressed={filters.noStories} onChange={(value) => set({ noStories: value })}>
              ยังไม่เคยเขียนเรื่อง
            </FilterToggle>
            <FilterSelect
              label="เรียงตาม"
              allLabel="สมัครล่าสุด"
              value={filters.sort === "recent" ? "" : filters.sort}
              onChange={(value) => set({ sort: value })}
              options={sorts.slice(1)}
            />
            {filtered ? <ClearFilters onClick={clearFilters} /> : null}
          </div>
        </div>
      </PageHeader>

      {users.isError && !users.data ? (
        <ErrorCard error={users.error} onRetry={() => void users.refetch()} />
      ) : (
        <div>
          <DataTable
            caption="รายชื่อผู้ใช้"
            columns={columns}
            rows={users.data?.data}
            loading={users.isPending}
            rowKey={(user) => user.id}
            rowLabel={(user) => user.name}
            rowHref={(user) => backofficeHref(`/users/${user.id}`)}
            sort={filters.sort}
            onSortChange={(sort) => set({ sort: sort === "recent" ? null : sort })}
            empty={
              filtered ? (
                <NoResults query={filters.q} onClear={clearFilters} />
              ) : (
                <EmptyBlock icon={Users} title="ยังไม่มีผู้ใช้ในกลุ่มนี้" />
              )
            }
          />
          {users.data ? (
            <Pagination page={page} pageSize={PAGE_SIZE} total={users.data.meta.total} onPageChange={(next) => set({ page: next })} />
          ) : null}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, danger }: { label: string; value?: number; danger?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`font-heading text-xl font-semibold tabular-nums ${danger && value ? "text-destructive" : ""}`}>
        {value === undefined ? "—" : formatNumber(value)}
      </dd>
    </div>
  );
}

function UserActionsMenu({ user }: { user: UserRow }) {
  const [dialog, setDialog] = useState<"BAN" | "UNBAN" | null>(null);
  const isAdmin = user.role === "ADMIN";
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`การจัดการผู้ใช้ ${user.name}`}
          className="grid size-9 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground/6 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 data-popup-open:bg-foreground/6"
        >
          <MoreHorizontal aria-hidden="true" className="size-[18px]" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5">
          <DropdownMenuItem render={<Link href={backofficeHref(`/users/${user.id}`)} />}>
            <UserRound aria-hidden="true" />
            ดูรายละเอียด
          </DropdownMenuItem>
          {!isAdmin ? (
            <>
              <DropdownMenuSeparator />
              {user.status === "BANNED" ? (
                <DropdownMenuItem onClick={() => setDialog("UNBAN")}>
                  <ShieldCheck aria-hidden="true" />
                  ยกเลิกการระงับ…
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem variant="destructive" onClick={() => setDialog("BAN")}>
                  <ShieldBan aria-hidden="true" />
                  ระงับผู้ใช้…
                </DropdownMenuItem>
              )}
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      {!isAdmin ? (
        <>
          <BanDialog open={dialog === "BAN"} onOpenChange={(open) => setDialog(open ? "BAN" : null)} user={user} />
          <UnbanDialog open={dialog === "UNBAN"} onOpenChange={(open) => setDialog(open ? "UNBAN" : null)} user={user} />
        </>
      ) : null}
    </>
  );
}
