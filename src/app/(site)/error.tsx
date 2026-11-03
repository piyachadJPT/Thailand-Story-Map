"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import LostPinIllustration from "@/components/layout/LostPinIllustration";
import PageContainer from "@/components/layout/PageContainer";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

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
    <PageContainer className="grid flex-1 place-items-center">
      <EmptyState
        layout="page"
        headingLevel="h1"
        illustration={<LostPinIllustration tone="error" />}
        title="เกิดข้อผิดพลาด"
        text="มีบางอย่างไม่เป็นไปตามคาด ลองใหม่อีกครั้ง หรือกลับไปที่แผนที่"
        action={
          <>
            <Button onClick={() => reset()}>
              <RotateCcw aria-hidden="true" />
              ลองอีกครั้ง
            </Button>
            <Link href="/" prefetch={false} className={buttonVariants({ variant: "outline" })}>
              กลับหน้าแรก
            </Link>
          </>
        }
      />
    </PageContainer>
  );
}
