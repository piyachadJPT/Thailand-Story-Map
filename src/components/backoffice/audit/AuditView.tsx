"use client";

import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import type { listAuditLogs } from "@/api/admin/audit";
import { Skeleton } from "@/components/ui/skeleton";
import { AUDIT_ACTION, auditActionMeta } from "@/config/auditActions";
import type { Jsonify } from "@/models/types/admin";
import { GroupedAuditTimeline } from "../AuditTimeline";
import { Pagination } from "../DataTable";
import { ClearFilters, FilterSelect } from "../Filters";
import PageHeader from "../PageHeader";
import { EmptyBlock, ErrorCard, NoResults } from "../States";
import { adminFetch, adminKeys, queryString } from "../api";
import { useUrlState } from "../useUrlState";

type AuditList = Jsonify<Awaited<ReturnType<typeof listAuditLogs>>>;
const PAGE_SIZE = 30;

const actionOptions = [
  ...Object.values(AUDIT_ACTION).map((value) => ({ value, label: auditActionMeta[value].label })),
  { value: "APPROVE", label: auditActionMeta.APPROVE.label },
  { value: "REJECT", label: auditActionMeta.REJECT.label },
];

export default function AuditView() {
  const { get, set, page } = useUrlState();
  const filters = {
    action: get("action"),
    adminId: get("adminId"),
    from: get("from"),
    to: get("to"),
    page,
    pageSize: PAGE_SIZE,
  };
  const logs = useQuery({
    queryKey: adminKeys.audit(filters),
    queryFn: ({ signal }) => adminFetch<AuditList>(`/api/admin/audit${queryString(filters)}`, { signal }),
    placeholderData: (previous) => previous,
  });
  const filtered = Boolean(filters.action || filters.adminId || filters.from || filters.to);
  const clear = () => set({ action: null, adminId: null, from: null, to: null });

  return (
    <div className="space-y-6">
      <PageHeader title="บันทึกการทำงาน" description="ทุกการกระทำของผู้ดูแล ตั้งแต่ล่าสุด">
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="การกระทำ"
            allLabel="ทุกการกระทำ"
            value={filters.action}
            onChange={(value) => set({ action: value })}
            options={actionOptions}
          />
          <FilterSelect
            label="ผู้ดูแล"
            allLabel="ผู้ดูแลทุกคน"
            value={filters.adminId}
            onChange={(value) => set({ adminId: value })}
            options={(logs.data?.admins ?? []).map((admin) => ({ value: admin.id, label: admin.username ?? admin.name }))}
          />
          <DateField label="ตั้งแต่วันที่" value={filters.from} max={filters.to || undefined} onChange={(from) => set({ from })} />
          <DateField label="ถึงวันที่" value={filters.to} min={filters.from || undefined} onChange={(to) => set({ to })} />
          {filtered ? <ClearFilters onClick={clear} /> : null}
        </div>
      </PageHeader>

      {logs.isError && !logs.data ? (
        <ErrorCard error={logs.error} onRetry={() => void logs.refetch()} />
      ) : logs.isPending ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : !logs.data?.data.length ? (
        filtered ? (
          <NoResults onClear={clear} />
        ) : (
          <EmptyBlock icon={History} title="ยังไม่มีบันทึกการทำงาน" />
        )
      ) : (
        <div>
          <GroupedAuditTimeline items={logs.data.data} />
          <Pagination page={page} pageSize={PAGE_SIZE} total={logs.data.meta.total} onPageChange={(next) => set({ page: next })} />
        </div>
      )}
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}) {
  return (
    <label className="flex h-10 items-center gap-2 rounded-full border border-input bg-card px-3.5 text-sm text-muted-foreground focus-within:ring-3 focus-within:ring-ring/30">
      {label}
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent text-foreground tabular-nums outline-none"
      />
    </label>
  );
}
