"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatNumber } from "./format";

export type SortOption = { value: string; direction: "asc" | "desc" };

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  align?: "left" | "right";
  className?: string;
  /** Clicking the header cycles through these sort values. */
  sort?: SortOption[];
  /** Label shown beside the value in the phone card layout; omit to hide there. */
  cardLabel?: string;
};

const interactive = "a,button,input,select,textarea,label,[role=menuitem],[role=checkbox],[data-row-ignore]";

/**
 * Real <table> with a sticky header; a whole row opens `rowHref`, while
 * controls inside the row keep their own behavior. Rows become cards below md.
 */
export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  rowHref,
  rowLabel,
  sort,
  onSortChange,
  loading,
  empty,
  caption,
  card,
}: {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string;
  rowHref?: (row: T) => string;
  /** Accessible name for the row link, e.g. the story title. */
  rowLabel?: (row: T) => string;
  sort?: string;
  onSortChange?: (value: string) => void;
  loading?: boolean;
  empty?: React.ReactNode;
  caption: string;
  /** Custom phone card; defaults to the first column plus labelled columns. */
  card?: (row: T) => React.ReactNode;
}) {
  const router = useRouter();

  function onRowClick(event: React.MouseEvent<HTMLElement>, href?: string) {
    if (!href) return;
    const target = event.target as HTMLElement;
    // Ignore clicks inside portals (menus, dialogs) and on the row's own controls.
    if (!event.currentTarget.contains(target) || target.closest(interactive)) return;
    if (window.getSelection()?.toString()) return;
    if (event.metaKey || event.ctrlKey) window.open(href, "_blank", "noopener,noreferrer");
    else router.push(href);
  }

  if (loading) return <TableSkeleton columns={columns.length} />;
  if (!rows?.length) return <>{empty}</>;

  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card shadow-soft md:block">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => {
                const active = column.sort?.find((option) => option.value === sort);
                const next = column.sort
                  ? column.sort[(column.sort.findIndex((option) => option.value === sort) + 1) % column.sort.length]
                  : null;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={active ? (active.direction === "asc" ? "ascending" : "descending") : undefined}
                    className={cn(
                      "sticky top-0 z-10 border-b border-border bg-card px-4 py-3 text-xs font-medium whitespace-nowrap text-muted-foreground first:rounded-tl-2xl last:rounded-tr-2xl",
                      column.align === "right" ? "text-right" : "text-left",
                      column.className
                    )}
                  >
                    {column.sort && onSortChange && next ? (
                      <button
                        type="button"
                        onClick={() => onSortChange(next.value)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40",
                          active && "text-foreground"
                        )}
                      >
                        {column.header}
                        {active ? (
                          active.direction === "asc" ? (
                            <ArrowUp aria-hidden="true" className="size-3.5" />
                          ) : (
                            <ArrowDown aria-hidden="true" className="size-3.5" />
                          )
                        ) : (
                          <ArrowUpDown aria-hidden="true" className="size-3.5 opacity-50" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const href = rowHref?.(row);
              return (
                <tr
                  key={rowKey(row)}
                  onClick={(event) => onRowClick(event, href)}
                  className={cn(
                    "group transition-colors duration-150 [&>td]:border-b [&>td]:border-border last:[&>td]:border-b-0",
                    href && "cursor-pointer hover:bg-foreground/3"
                  )}
                >
                  {columns.map((column, index) => (
                    <td
                      key={column.key}
                      className={cn(
                        "h-14 px-4 py-2.5 align-middle",
                        column.align === "right" && "text-right tabular-nums",
                        column.className
                      )}
                    >
                      {index === 0 && href ? (
                        <RowLink href={href} label={rowLabel?.(row)}>
                          {column.cell(row)}
                        </RowLink>
                      ) : (
                        column.cell(row)
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 md:hidden" aria-label={caption}>
        {rows.map((row) => {
          const href = rowHref?.(row);
          return (
            <li
              key={rowKey(row)}
              onClick={(event) => onRowClick(event, href)}
              className={cn(
                "rounded-2xl border border-border bg-card p-4 shadow-soft",
                href && "cursor-pointer active:bg-foreground/3"
              )}
            >
              {card ? (
                card(row)
              ) : (
                <div className="space-y-3">
                  {href ? (
                    <RowLink href={href} label={rowLabel?.(row)}>
                      {columns[0].cell(row)}
                    </RowLink>
                  ) : (
                    columns[0].cell(row)
                  )}
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {columns.slice(1).map((column) =>
                      column.cardLabel ? (
                        <div key={column.key} className="min-w-0">
                          <dt className="text-xs text-muted-foreground">{column.cardLabel}</dt>
                          <dd className="min-w-0 tabular-nums">{column.cell(row)}</dd>
                        </div>
                      ) : null
                    )}
                  </dl>
                  {columns
                    .filter((column) => column.key === "actions")
                    .map((column) => (
                      <div key={column.key} className="flex justify-end">
                        {column.cell(row)}
                      </div>
                    ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** Keyboard path into the row: the first cell is a real link. */
function RowLink({ href, label, children }: { href: string; label?: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="-m-1 block rounded-lg p-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      {children}
    </Link>
  );
}

export function TableSkeleton({ columns = 5, rows = 6 }: { columns?: number; rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft" aria-busy="true">
      <span className="sr-only">กำลังโหลด…</span>
      <div className="flex gap-6 border-b border-border px-4 py-3.5">
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton key={index} className={cn("h-3", index === 0 ? "w-40" : "w-16")} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-b-0">
          <Skeleton className="size-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/5 max-w-72" />
            <Skeleton className="h-3 w-2/5 max-w-48" />
          </div>
          {Array.from({ length: Math.max(0, columns - 2) }, (_, index) => (
            <Skeleton key={index} className="hidden h-3 w-14 md:block" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const numbers = pageNumbers(page, pages);
  return (
    <nav aria-label="เลขหน้า" className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm">
      <p className="text-muted-foreground tabular-nums">
        แสดง {formatNumber(from)}–{formatNumber(to)} จาก {formatNumber(total)}
      </p>
      {pages > 1 ? (
        <div className="flex items-center gap-1">
          <PageButton label="หน้าก่อนหน้า" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft aria-hidden="true" className="size-4" />
          </PageButton>
          {numbers.map((number, index) =>
            number === null ? (
              <span key={`gap-${index}`} aria-hidden="true" className="px-1 text-muted-foreground">
                …
              </span>
            ) : (
              <PageButton
                key={number}
                label={`หน้า ${number}`}
                current={number === page}
                onClick={() => onPageChange(number)}
                className="max-sm:hidden"
              >
                {formatNumber(number)}
              </PageButton>
            )
          )}
          <span className="px-2 text-muted-foreground tabular-nums sm:hidden">
            {page} / {pages}
          </span>
          <PageButton label="หน้าถัดไป" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
            <ChevronRight aria-hidden="true" className="size-4" />
          </PageButton>
        </div>
      ) : null}
    </nav>
  );
}

function PageButton({
  label,
  current,
  disabled,
  onClick,
  children,
  className,
}: {
  label: string;
  current?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={current ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-grid h-9 min-w-9 place-items-center rounded-full px-2 text-sm tabular-nums outline-none transition-colors duration-150",
        "hover:bg-foreground/6 focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-40",
        current && "bg-primary text-primary-foreground hover:bg-primary/90",
        className
      )}
    >
      {children}
    </button>
  );
}

function pageNumbers(page: number, pages: number): (number | null)[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1);
  const set = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const result: (number | null)[] = [];
  sorted.forEach((number, index) => {
    if (index > 0 && number - sorted[index - 1] > 1) result.push(null);
    result.push(number);
  });
  return result;
}
