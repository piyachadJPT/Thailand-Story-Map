import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

type Props = { params: Promise<{ province: string; slug: string }> };

export default async function StoryDetailPage({ params }: Props) {
  const { province, slug } = await params;

  return (
    <MainLayout>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          กลับไปที่แผนที่
        </Link>

        <header className="mb-8">
          <p className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold tracking-[0.18em] text-primary uppercase">
            <MapPin className="h-3 w-3" />
            {province}
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {slug}
          </h1>
        </header>

        <div className="glass-card rounded-[1.6rem] p-6 sm:p-8">
          <p className="text-sm leading-relaxed text-muted-foreground">
            หน้าเรื่องนี้จะดึงเนื้อหาจาก{" "}
            <code className="rounded-md bg-foreground/6 px-1.5 py-0.5 font-mono text-xs text-foreground">
              /api/stories/{province}/{slug}
            </code>{" "}
            ใน Phase 3 — พร้อมภาพ สรุป และพิกัดบนแผนที่
          </p>
        </div>
      </article>
    </MainLayout>
  );
}
