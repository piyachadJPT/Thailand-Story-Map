import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="page-canvas relative flex h-screen w-full flex-col items-center justify-center px-6 text-center">
      <div className="liquid-glass max-w-md rounded-[1.85rem] p-8">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="h-6 w-6" />
        </div>
        <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-primary uppercase">
          404
        </p>
        <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
          ไม่พบหน้านี้
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          หน้าที่ต้องการไม่มีอยู่ หรือถูกย้ายไปแล้ว — กลับไปสำรวจเรื่องบนแผนที่ได้
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}
