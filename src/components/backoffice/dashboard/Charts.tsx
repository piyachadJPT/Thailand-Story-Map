"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { categoryColor } from "@/config/categories";
import { formatDayKey, formatNumber } from "../format";
import ChartFrame, { MiniTable } from "./ChartFrame";
import type { Overview } from "./types";

const axis = { fill: "var(--muted-foreground)", fontSize: 12, fontFamily: "var(--font-kanit)" };

function TooltipBox({
  label,
  rows,
}: {
  label: string;
  rows: { name: string; value: number; color: string }[];
}) {
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-soft">
      <p className="mb-1 font-medium">{label}</p>
      {rows.map((row) => (
        <p key={row.name} className="flex items-center gap-2">
          <span aria-hidden="true" className="size-2 rounded-full" style={{ background: row.color }} />
          <span className="text-muted-foreground">{row.name}</span>
          <span className="ml-auto pl-3 font-medium tabular-nums">{formatNumber(row.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function DailyStoriesChart({ series, range }: { series: Overview["series"]; range: number }) {
  const published = series.reduce((sum, point) => sum + point.published, 0);
  const other = series.reduce((sum, point) => sum + point.other, 0);
  return (
    <ChartFrame
      title="เรื่องใหม่รายวัน"
      description={`ตามวันที่สร้าง · ${range} วันล่าสุด`}
      summary={`ใน ${range} วันล่าสุด มีเรื่องใหม่ที่เผยแพร่ ${published} เรื่อง และรอตรวจหรือถูกปฏิเสธ ${other} เรื่อง`}
      table={
        <MiniTable
          head={["วันที่", "เผยแพร่", "รอตรวจ/ปฏิเสธ"]}
          rows={series.map((point) => [formatDayKey(point.day), point.published, point.other])}
        />
      }
    >
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <Legend color="var(--success)" label="เผยแพร่" value={published} />
        <Legend color="var(--warning)" label="รอตรวจ/ถูกปฏิเสธ" value={other} />
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <defs>
              <linearGradient id="fill-published" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--success)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fill-other" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--warning)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--warning)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="day"
              tickFormatter={formatDayKey}
              tick={axis}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} width={48} />
            <Tooltip
              cursor={{ stroke: "var(--border)" }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <TooltipBox
                    label={formatDayKey(String(label))}
                    rows={[
                      { name: "เผยแพร่", value: Number(payload[0]?.payload.published ?? 0), color: "var(--success)" },
                      { name: "รอตรวจ/ถูกปฏิเสธ", value: Number(payload[0]?.payload.other ?? 0), color: "var(--warning)" },
                    ]}
                  />
                ) : null
              }
            />
            <Area type="monotone" dataKey="published" stroke="var(--success)" strokeWidth={2} fill="url(#fill-published)" isAnimationActive={false} />
            <Area type="monotone" dataKey="other" stroke="var(--warning)" strokeWidth={2} fill="url(#fill-other)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: color }} />
      {label}
      {value !== undefined ? <span className="font-medium text-foreground tabular-nums">{formatNumber(value)}</span> : null}
    </span>
  );
}

export function CategoryDonut({ categories }: { categories: Overview["categories"] }) {
  const total = categories.reduce((sum, item) => sum + item.count, 0);
  const data = categories.filter((item) => item.count > 0);
  const percent = (count: number) => (total ? Math.round((count / total) * 1000) / 10 : 0);
  return (
    <ChartFrame
      title="สัดส่วนตามหมวด"
      description="เรื่องที่เผยแพร่อยู่ทั้งหมด"
      summary={`เรื่องที่เผยแพร่ ${total} เรื่อง: ${categories.map((item) => `${item.name} ${item.count}`).join(", ")}`}
      table={
        <MiniTable
          head={["หมวด", "จำนวน", "%"]}
          rows={categories.map((item) => [item.name, item.count, `${percent(item.count)}%`])}
        />
      }
    >
      <div className="relative mx-auto h-52 max-w-60">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.length ? data : [{ slug: "none", name: "ยังไม่มี", count: 1 }]}
              dataKey="count"
              nameKey="name"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="var(--card)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {(data.length ? data : [{ slug: "none" }]).map((item) => (
                <Cell key={item.slug} fill={item.slug === "none" ? "var(--muted)" : categoryColor(item.slug)} />
              ))}
            </Pie>
            {data.length ? (
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <TooltipBox
                      label={String(payload[0].name)}
                      rows={[{ name: "เรื่อง", value: Number(payload[0].value), color: categoryColor(String(payload[0].payload.slug)) }]}
                    />
                  ) : null
                }
              />
            ) : null}
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-heading text-2xl font-semibold tabular-nums">{formatNumber(total)}</p>
            <p className="text-xs text-muted-foreground">เรื่อง</p>
          </div>
        </div>
      </div>
      <ul className="mt-5 grid gap-2 text-sm">
        {categories.map((item) => (
          <li key={item.slug} className="flex items-center gap-2">
            <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: categoryColor(item.slug) }} />
            <span className="min-w-0 flex-1 truncate">{item.name}</span>
            <span className="tabular-nums">{formatNumber(item.count)}</span>
            <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">{percent(item.count)}%</span>
          </li>
        ))}
      </ul>
    </ChartFrame>
  );
}

export function ProvinceBars({ provinces }: { provinces: Overview["provinces"] }) {
  const top = provinces.top;
  return (
    <ChartFrame
      title="10 จังหวัดที่มีเรื่องมากที่สุด"
      description={`ยังไม่มีเรื่องเลย ${provinces.withoutStories} จาก ${provinces.total} จังหวัด`}
      summary={`จังหวัดที่มีเรื่องมากที่สุด: ${top.map((item) => `${item.name} ${item.count}`).join(", ") || "ยังไม่มีข้อมูล"}`}
      table={<MiniTable head={["จังหวัด", "เรื่อง"]} rows={top.map((item) => [item.name, item.count])} />}
    >
      {top.length ? (
        <div style={{ height: Math.max(160, top.length * 32) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }}>
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={110} tick={axis} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "var(--foreground)", fillOpacity: 0.04 }}
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <TooltipBox label={String(payload[0].payload.name)} rows={[{ name: "เรื่อง", value: Number(payload[0].value), color: "var(--gold)" }]} />
                  ) : null
                }
              />
              <Bar
                dataKey="count"
                fill="var(--gold)"
                radius={[0, 6, 6, 0]}
                barSize={16}
                isAnimationActive={false}
                label={{ position: "right", fill: "var(--foreground)", fontSize: 12 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-muted-foreground">ยังไม่มีเรื่องที่เผยแพร่</p>
      )}
    </ChartFrame>
  );
}
