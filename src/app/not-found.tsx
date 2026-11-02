import Link from "next/link";
import { Compass, Map } from "lucide-react";
import LostPinIllustration from "@/components/layout/LostPinIllustration";
import PageContainer from "@/components/layout/PageContainer";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <PageContainer className="grid flex-1 place-items-center">
      <EmptyState
        layout="page"
        headingLevel="h1"
        illustration={<LostPinIllustration label="404" />}
        title="หลงทางบนแผนที่"
        text="ไม่พบหน้านี้ — หน้าที่ต้องการไม่มีอยู่ หรือถูกย้ายไปแล้ว กลับไปสำรวจเรื่องบนแผนที่ได้"
        action={
          <>
            <Link href="/" className={buttonVariants()}>
              <Map aria-hidden="true" />
              กลับหน้าแรก
            </Link>
            <Link href="/categories" className={buttonVariants({ variant: "outline" })}>
              <Compass aria-hidden="true" />
              สำรวจ
            </Link>
          </>
        }
      />
    </PageContainer>
  );
}
