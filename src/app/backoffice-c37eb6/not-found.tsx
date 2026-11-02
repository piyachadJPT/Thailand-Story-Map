import Link from "next/link";
import LostPinIllustration from "@/components/layout/LostPinIllustration";
import { buttonVariants } from "@/components/ui/button";
import { backofficeHref } from "@/config/backoffice";

export default function BackofficeNotFound() {
  return (
    <div className="grid min-h-[70dvh] place-items-center px-4 text-center">
      <div className="flex flex-col items-center gap-4">
        <LostPinIllustration label="404" className="size-44" />
        <h1 className="font-heading text-2xl font-semibold">ไม่พบข้อมูลนี้</h1>
        <p className="max-w-sm text-sm text-muted-foreground">รายการที่ต้องการอาจถูกลบหรือไม่มีอยู่</p>
        <Link href={backofficeHref()} className={buttonVariants()}>
          กลับไป Dashboard
        </Link>
      </div>
    </div>
  );
}
