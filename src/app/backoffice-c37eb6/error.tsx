"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackofficeError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="grid min-h-[60dvh] place-items-center px-4">
      <div role="alert" className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-destructive/12 text-destructive">
          <AlertTriangle aria-hidden="true" className="size-5" strokeWidth={1.75} />
        </span>
        <h1 className="mt-4 font-heading text-lg font-semibold">เกิดข้อผิดพลาด</h1>
        <p className="mt-1 text-sm text-muted-foreground">หน้านี้โหลดไม่สำเร็จ ลองอีกครั้ง หรือกลับมาภายหลัง</p>
        <Button className="mt-6" onClick={reset}>
          <RotateCcw aria-hidden="true" />
          ลองอีกครั้ง
        </Button>
      </div>
    </div>
  );
}
