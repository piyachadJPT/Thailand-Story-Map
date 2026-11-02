"use client";

import { useState } from "react";
import { BarChart3, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel } from "../PageHeader";

/** Card around a chart with a "view as table" toggle for screen readers and keyboard users. */
export default function ChartFrame({
  title,
  description,
  summary,
  table,
  children,
  className,
}: {
  title: string;
  description?: string;
  /** Plain-language summary read by screen readers. */
  summary: string;
  table: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const [asTable, setAsTable] = useState(false);
  return (
    <Panel
      title={title}
      description={description}
      className={cn("flex h-full flex-col", className)}
      bodyClassName="flex flex-1 flex-col"
      action={
        <button
          type="button"
          onClick={() => setAsTable((value) => !value)}
          aria-pressed={asTable}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs text-muted-foreground outline-none transition-colors hover:bg-foreground/6 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          {asTable ? <BarChart3 aria-hidden="true" className="size-3.5" /> : <Table2 aria-hidden="true" className="size-3.5" />}
          {asTable ? "ดูเป็นกราฟ" : "ดูเป็นตาราง"}
        </button>
      }
    >
      {asTable ? (
        <div className="max-h-80 overflow-auto">{table}</div>
      ) : (
        <figure role="img" aria-label={summary} className="flex flex-1 flex-col">
          {children}
        </figure>
      )}
    </Panel>
  );
}

export function MiniTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs text-muted-foreground">
          {head.map((cell, index) => (
            <th key={cell} scope="col" className={index ? "py-2 text-right font-medium" : "py-2 text-left font-medium"}>
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index} className="border-t border-border">
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className={cellIndex ? "py-2 text-right tabular-nums" : "py-2"}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
