import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import PageHero from "@/components/layout/PageHero";
import { categoryIcon, storyCategories } from "@/config/categories";

export default function CategoriesPage() {
  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <PageHero
          eyebrow="หมวดเรื่องเล่า"
          title="สำรวจ"
          description="เลือกหมวดแล้วเดินทางผ่านเรื่องลี้ลับ ประวัติศาสตร์ ตำนาน และเรื่องท้องถิ่นบนแผนที่ประเทศไทย"
        />

        <ul className="space-y-3">
          {storyCategories.map((category) => {
            const Icon = categoryIcon(category.slug);
            return (
              <li key={category.slug}>
                <Link
                  href="/"
                  className="glass-card hover-glow group flex items-center gap-4 rounded-[1.4rem] p-4 sm:p-5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-lg font-semibold text-foreground">
                      {category.name}
                    </span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                      {category.hint}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </MainLayout>
  );
}
