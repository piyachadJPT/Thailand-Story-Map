import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BookOpen, Feather } from "lucide-react";
import { getSessionUser } from "@/api/auth/session";
import { prisma } from "@/api/db/prisma";
import PageContainer from "@/components/layout/PageContainer";
import PageHero from "@/components/layout/PageHero";
import MyStoriesList from "@/components/story/MyStoriesList";
import type { MyStory } from "@/components/story/myStory";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { privatePageRobots } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";
export const metadata = { title: "เรื่องราวของฉัน", robots: privatePageRobots };

export default async function MyStoriesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=%2Fmy-stories");
  if (user.status === "BANNED") notFound();
  const rows = await prisma.story.findMany({
    where: { authorId: user.id },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      status: true,
      rejectReason: true,
      updatedAt: true,
      viewCount: true,
      images: {
        take: 1,
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: { url: true, altText: true },
      },
      category: { select: { name: true, slug: true } },
      province: { select: { name: true, slug: true } },
    },
    orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
  });
  const stories: MyStory[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    status: row.status,
    rejectReason: row.rejectReason,
    updatedAt: row.updatedAt.toISOString(),
    viewCount: row.viewCount,
    cover: row.images[0] ?? null,
    categoryName: row.category.name,
    categorySlug: row.category.slug,
    provinceName: row.province.name,
    provinceSlug: row.province.slug,
  }));
  const writeLink = (
    <Link href="/?compose=1" className={buttonVariants({ size: "lg" })}>
      <Feather aria-hidden="true" />
      เขียนเรื่องราว
    </Link>
  );

  return (
    <PageContainer>
      <PageHero
        title="เรื่องราวของฉัน"
        description={`เรื่องที่คุณเขียนทั้งหมด ${stories.length.toLocaleString("th-TH")} เรื่อง · จัดการและแก้ไขได้ที่นี่`}
        actions={writeLink}
      />
      {stories.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          headingLevel="h2"
          title="ยังไม่มีเรื่องราวที่คุณเขียน"
          text="เริ่มแบ่งปันเรื่องเล่า แล้วกลับมาจัดการเรื่องของคุณได้ที่นี่"
          action={writeLink}
        />
      ) : (
        <MyStoriesList stories={stories} />
      )}
    </PageContainer>
  );
}
