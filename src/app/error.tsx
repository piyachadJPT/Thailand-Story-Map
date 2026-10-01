"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page-canvas relative flex h-screen w-full flex-col items-center justify-center px-6 text-center">
      <div className="liquid-glass max-w-md rounded-[1.85rem] p-8">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">เกิดข้อผิดพลาด</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          มีบางอย่างไม่เป็นไปตามคาด ลองใหม่อีกครั้ง หรือกลับไปที่แผนที่
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex h-10 items-center rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
          >
            ลองอีกครั้ง
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}
