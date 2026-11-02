"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, FileText } from "lucide-react";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { backofficeHref } from "@/config/backoffice";
import DataTable, { Pagination } from "../DataTable";
import { ClearFilters, FilterSelect, FilterToggle, SearchField, TabLabel, useStoryOptions } from "../Filters";
import PageHeader from "../PageHeader";
import { EmptyBlock, ErrorCard, NoResults } from "../States";
import { adminFetch, adminKeys, queryString } from "../api";
import { useUrlSearch, useUrlState } from "../useUrlState";
import { storyColumns } from "./storyColumns";
import type { StoryList } from "./types";

type Tab = "PENDING" | "APPROVED" | "REJECTED";
const PAGE_SIZE = 20;

export default function StoriesView() {
  const { get, set, page } = useUrlState();
  const [search, setSearch] = useUrlSearch("q");
  const status = (["APPROVED", "REJECTED"].includes(get("status")) ? get("status") : "PENDING") as Tab;
  const filters = {
    status,
    q: get("q"),
    categoryId: get("categoryId"),
    provinceId: get("provinceId"),
    hasReports: get("hasReports") === "1",
    sort: get("sort"),
    page,
    pageSize: PAGE_SIZE,
  };
  const options = useStoryOptions();
  const stories = useQuery({
    queryKey: adminKeys.stories(filters),
    queryFn: ({ signal }) => adminFetch<StoryList>(`/api/admin/stories${queryString(filters)}`, { signal }),
    placeholderData: (previous) => previous,
  });
  const filtered = Boolean(filters.q || filters.categoryId || filters.provinceId || filters.hasReports);
  const counts = stories.data?.counts;

  function clearFilters() {
    setSearch("");
    set({ q: null, categoryId: null, provinceId: null, hasReports: null, sort: null });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="เรื่อง" description="ตรวจเรื่องก่อนเผยแพร่ และดูแลเรื่องที่อยู่บนแผนที่">
        <div className="space-y-3">
          <SegmentedTabs
            aria-label="สถานะเรื่อง"
            size="sm"
            scrollable
            className="max-w-full sm:w-fit"
            value={status}
            onValueChange={(value) => set({ status: value === "PENDING" ? null : value, sort: null })}
            items={[
              { value: "PENDING", label: <TabLabel label="รอตรวจ" count={counts?.PENDING} /> },
              { value: "APPROVED", label: <TabLabel label="เผยแพร่แล้ว" count={counts?.APPROVED} /> },
              { value: "REJECTED", label: <TabLabel label="ปฏิเสธ/ซ่อน" count={counts?.REJECTED} /> },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <SearchField
              value={search}
              onChange={setSearch}
              label="ค้นหาเรื่อง"
              placeholder="ชื่อเรื่อง ชื่อหรืออีเมลผู้เขียน"
            />
            <FilterSelect
              label="หมวด"
              allLabel="ทุกหมวด"
              value={filters.categoryId}
              onChange={(value) => set({ categoryId: value })}
              options={(options.data?.categories ?? []).map((item) => ({ value: item.id, label: item.name }))}
            />
            <FilterSelect
              label="จังหวัด"
              allLabel="ทุกจังหวัด"
              value={filters.provinceId}
              onChange={(value) => set({ provinceId: value })}
              options={(options.data?.provinces ?? []).map((item) => ({ value: item.id, label: item.name }))}
            />
            <FilterToggle pressed={filters.hasReports} onChange={(value) => set({ hasReports: value })}>
              มีรายงาน
            </FilterToggle>
            {filtered ? <ClearFilters onClick={clearFilters} /> : null}
          </div>
        </div>
      </PageHeader>

      {stories.isError && !stories.data ? (
        <ErrorCard error={stories.error} onRetry={() => void stories.refetch()} />
      ) : (
        <div>
          <DataTable
            caption="รายการเรื่อง"
            columns={storyColumns({ pendingTab: status === "PENDING" })}
            rows={stories.data?.data}
            loading={stories.isPending}
            rowKey={(story) => story.id}
            rowLabel={(story) => story.title}
            rowHref={(story) => backofficeHref(`/stories/${story.id}${status === "PENDING" ? "?queue=1" : ""}`)}
            sort={filters.sort || (status === "PENDING" ? "oldest" : "newest")}
            onSortChange={(sort) => set({ sort })}
            empty={
              filtered ? (
                <NoResults query={filters.q} onClear={clearFilters} />
              ) : status === "PENDING" ? (
                <EmptyBlock icon={CheckCircle2} tone="success" title="ไม่มีเรื่องรอตรวจ" text="ทุกเรื่องได้รับการตรวจแล้ว" />
              ) : (
                <EmptyBlock icon={FileText} title="ยังไม่มีเรื่องในสถานะนี้" />
              )
            }
          />
          {stories.data ? (
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={stories.data.meta.total}
              onPageChange={(next) => set({ page: next })}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
